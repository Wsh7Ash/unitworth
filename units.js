/**
 * units.js — pure pricing/normalization engine for unitworth.
 * No DOM access; consumed by app.js and by the node:test suite.
 */

export const FAMILIES = {
  ml: "volume",
  l: "volume",
  g: "weight",
  kg: "weight",
};

const TO_BASE = { ml: 1, l: 1000, g: 1, kg: 1000 };
const BASE_NAME = { volume: "ml", weight: "g" };

/**
 * Parse free-form unit text ("ML", "ltr", "kg.", ...) to a canonical unit.
 * Returns null when unrecognized.
 */
export function parseUnit(text) {
  const t = String(text ?? "").trim().toLowerCase().replace(/\.$/, "");
  if (t === "ml" || t === "milliliter" || t === "millilitre") return "ml";
  if (t === "l" || t === "liter" || t === "litre" || t === "ltr") return "l";
  if (t === "g" || t === "gram" || t === "gramme" || t === "gr") return "g";
  if (t === "kg" || t === "kilogram" || t === "kilo" || t === "kilos") return "kg";
  return null;
}

/** True when a row's unit belongs to a known family. */
export function isKnownUnit(unit) {
  return unit in FAMILIES;
}

/**
 * Normalize one row to { baseAmount, family, perUnitPrice } or { error }.
 * Row: { packs, size, unit, price } (all numbers except unit string).
 */
export function normalizeRow(row) {
  const unit = parseUnit(row.unit);
  if (!unit) {
    return { error: `unknown unit: ${String(row.unit)}` };
  }
  const packs = Number(row.packs);
  const size = Number(row.size);
  const price = Number(row.price);
  if (!Number.isFinite(packs) || packs <= 0) {
    return { error: "packs must be a positive number" };
  }
  if (!Number.isFinite(size) || size <= 0) {
    return { error: "size must be a positive number" };
  }
  if (!Number.isFinite(price) || price < 0) {
    return { error: "price must be zero or positive" };
  }
  const family = FAMILIES[unit];
  const baseAmount = packs * size * TO_BASE[unit];
  const perUnitPrice = baseAmount > 0 ? price / baseAmount : Infinity;
  return {
    family,
    baseAmount,
    baseName: BASE_NAME[family],
    perUnitPrice,
  };
}

/**
 * Rank rows within their family by per-unit price ascending.
 * Returns array of { index, ok, ... } preserving input order metadata.
 */
export function rankRows(rows) {
  const enriched = rows.map((row, index) => {
    const norm = normalizeRow(row);
    return { index, ok: !norm.error, ...norm, input: row };
  });
  const valid = enriched
    .filter((r) => r.ok)
    .sort((a, b) =>
      a.family === b.family
        ? a.perUnitPrice - b.perUnitPrice || a.input.price - b.input.price
        : a.family.localeCompare(b.family),
    );
  return { enriched, valid };
}

/**
 * Best-value insight within one family:
 * { bestIndex, worstIndex, worstExtraPct, unitName } or null.
 */
export function bestValue(rows, family) {
  const inFamily = rows
    .map((row, index) => ({ row, index, norm: normalizeRow(row) }))
    .filter((r) => r.norm && !r.norm.error && r.norm.family === family);
  if (inFamily.length < 2) return null;
  const sorted = [...inFamily].sort(
    (a, b) => a.norm.perUnitPrice - b.norm.perUnitPrice,
  );
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];
  const worstExtraPct =
    best.norm.perUnitPrice > 0
      ? ((worst.norm.perUnitPrice - best.norm.perUnitPrice) /
          best.norm.perUnitPrice) * 100
      : 0;
  return {
    bestIndex: best.index,
    worstIndex: worst.index,
    worstExtraPct,
    unitName: `currency per 100 ${BASE_NAME[family]}`,
  };
}

/** Format a per-unit price for display, e.g. 0.00149 -> "$1.49 / L". */
export function formatPerUnit(perUnitPrice, family, currency = "$") {
  if (!Number.isFinite(perUnitPrice)) return "—";
  // price per base unit (ml or g); scale to L or kg for readability
  const scale = family === "volume" ? 1000 : 1000;
  const name = family === "volume" ? "L" : "kg";
  const value = perUnitPrice * scale;
  return `${currency}${value.toFixed(2)} / ${name}`;
}
