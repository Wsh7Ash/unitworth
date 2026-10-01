/**
 * app.js — unitworth UI layer. All pricing math lives in units.js
 * (pure, tested); this file only reads/writes the DOM.
 */
import { bestValue, formatPerUnit, normalizeRow, parseUnit, rankRows } from "./units.js";

const tbody = document.querySelector("#rows");
const addBtn = document.querySelector("#add-row");
const exampleBtn = document.querySelector("#load-example");
const clearBtn = document.querySelector("#clear");
const copyBtn = document.querySelector("#copy-tsv");
const outRank = document.querySelector("#ranking");
const outInsight = document.querySelector("#insight");

const EXAMPLE = [
  { label: "Milk 1 L", packs: 1, size: 1, unit: "L", price: 1.49 },
  { label: "Milk 500 ml", packs: 1, size: 500, unit: "ml", price: 0.85 },
  { label: "Milk 2 x 1.5 L", packs: 2, size: 1.5, unit: "L", price: 4.10 },
  { label: "Rice 1 kg", packs: 1, size: 1, unit: "kg", price: 2.99 },
  { label: "Rice 4 x 250 g", packs: 4, size: 250, unit: "g", price: 3.49 },
];

function rowHtml(row = {}) {
  const tr = document.createElement("tr");
  for (const key of ["label", "packs", "size", "unit", "price"]) {
    const td = document.createElement("td");
    const input = document.createElement("input");
    input.dataset.field = key;
    input.value = row[key] ?? "";
    if (key !== "label") input.setAttribute("inputmode", "decimal");
    if (key === "unit") input.placeholder = "ml/L/g/kg";
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") addRow();
    });
    td.appendChild(input);
    tr.appendChild(td);
  }
  const td = document.createElement("td");
  td.className = "verdict";
  tr.appendChild(td);
  const tdDel = document.createElement("td");
  const del = document.createElement("button");
  del.textContent = "×";
  del.className = "delete";
  del.setAttribute("aria-label", "delete row");
  del.addEventListener("click", () => {
    tr.remove();
    render();
  });
  tdDel.appendChild(del);
  tr.appendChild(tdDel);
  return tr;
}

function addRow(row) {
  tbody.appendChild(rowHtml(row));
  render();
}

function readRows() {
  return [...tbody.querySelectorAll("tr")].map((tr) => ({
    label: tr.querySelector('[data-field="label"]').value,
    packs: tr.querySelector('[data-field="packs"]').value,
    size: tr.querySelector('[data-field="size"]').value,
    unit: tr.querySelector('[data-field="unit"]').value,
    price: tr.querySelector('[data-field="price"]').value,
    tr,
  }));
}

function render() {
  const rows = readRows();
  const { enriched, valid } = rankRows(rows);
  const bestPerFamily = new Map();
  for (const v of valid) {
    const cur = bestPerFamily.get(v.family);
    if (!cur || v.perUnitPrice < cur.perUnitPrice) {
      bestPerFamily.set(v.family, v);
    }
  }

  rows.forEach((r, i) => {
    const cell = r.tr.querySelector(".verdict");
    const info = enriched[i];
    r.tr.classList.remove("best", "invalid");
    if (!info || info.error) {
      cell.textContent = info?.error ?? "";
      r.tr.classList.add("invalid");
      return;
    }
    const isBest = bestPerFamily.get(info.family)?.index === i;
    cell.textContent = formatPerUnit(info.perUnitPrice, info.family);
    r.tr.classList.toggle("best", isBest);
  });

  // Ranking list
  const lines = [];
  let currentFamily = "";
  for (const v of valid) {
    if (v.family !== currentFamily) {
      currentFamily = v.family;
      lines.push(`— ${currentFamily} —`);
    }
    const name = rows[v.index].label || `row ${v.index + 1}`;
    lines.push(
      `${formatPerUnit(v.perUnitPrice, v.family).padStart(14)}  ${name}`,
    );
  }
  outRank.textContent = lines.length ? lines.join("\n") : "Add at least two comparable rows.";

  // Insight
  const insights = [];
  for (const family of ["volume", "weight"]) {
    const bv = bestValue(rows, family);
    if (bv) {
      const bestName = rows[bv.bestIndex].label || `row ${bv.bestIndex + 1}`;
      const worstName = rows[bv.worstIndex].label || `row ${bv.worstIndex + 1}`;
      insights.push(
        `${family}: "${worstName}" costs ${bv.worstExtraPct.toFixed(1)}% more per unit than "${bestName}".`,
      );
    }
  }
  outInsight.textContent = insights.join(" ");
}

addBtn.addEventListener("click", () => addRow());
exampleBtn.addEventListener("click", () => {
  tbody.innerHTML = "";
  EXAMPLE.forEach((r) => addRow(r));
});
clearBtn.addEventListener("click", () => {
  tbody.innerHTML = "";
  addRow();
});
copyBtn.addEventListener("click", async () => {
  const rows = readRows();
  const tsv = ["label\tpacks\tsize\tunit\tprice"]
    .concat(rows.map((r) => [r.label, r.packs, r.size, r.unit, r.price].join("\t")))
    .join("\n");
  try {
    await navigator.clipboard.writeText(tsv);
    copyBtn.textContent = "Copied!";
    setTimeout(() => (copyBtn.textContent = "Copy as TSV"), 1200);
  } catch {
    // Clipboard API unavailable (file:// in some browsers): select fallback.
    window.prompt("Copy your table:", tsv);
  }
});

tbody.addEventListener("input", render);

// Boot with example so the first view is never empty.
EXAMPLE.forEach((r) => addRow(r));
render();

// Keep parseUnit referenced for direct console debugging.
window.unitworth = { parseUnit, normalizeRow };
