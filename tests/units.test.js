import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  bestValue,
  formatPerUnit,
  isKnownUnit,
  normalizeRow,
  parseUnit,
  rankRows,
} from "../units.js";

describe("parseUnit", () => {
  it("accepts canonical and casual spellings", () => {
    assert.equal(parseUnit("ML"), "ml");
    assert.equal(parseUnit("ltr"), "l");
    assert.equal(parseUnit("Liter"), "l");
    assert.equal(parseUnit("kg."), "kg");
    assert.equal(parseUnit("kilo"), "kg");
    assert.equal(parseUnit(" gr "), "g");
  });
  it("returns null for junk", () => {
    assert.equal(parseUnit("bananas"), null);
    assert.equal(parseUnit(""), null);
    assert.equal(parseUnit(null), null);
  });
});

describe("isKnownUnit", () => {
  it("knows the four units only", () => {
    assert.ok(isKnownUnit("ml"));
    assert.ok(isKnownUnit("kg"));
    assert.equal(isKnownUnit("floz"), false);
  });
});

describe("normalizeRow", () => {
  it("computes per-base-unit price", () => {
    // 1 L for 1.49 -> 0.00149 per ml
    const r = normalizeRow({ packs: 1, size: 1, unit: "L", price: 1.49 });
    assert.equal(r.family, "volume");
    assert.equal(r.baseAmount, 1000);
    assert.ok(Math.abs(r.perUnitPrice - 0.00149) < 1e-9);
  });
  it("normalizes ml to base", () => {
    // 500 ml for 0.85 -> 0.0017 per ml
    const r = normalizeRow({ packs: 1, size: 500, unit: "ml", price: 0.85 });
    assert.ok(Math.abs(r.perUnitPrice - 0.0017) < 1e-9);
  });
  it("handles packs", () => {
    // 4 packs x 250 g at 6.00 -> 1000 g total -> 0.006 per g
    const r = normalizeRow({ packs: 4, size: 250, unit: "g", price: 6 });
    assert.equal(r.baseAmount, 1000);
    assert.ok(Math.abs(r.perUnitPrice - 0.006) < 1e-12);
  });
  it("kg converts x1000", () => {
    const r = normalizeRow({ packs: 1, size: 2, unit: "kg", price: 8 });
    assert.equal(r.baseAmount, 2000);
    assert.ok(Math.abs(r.perUnitPrice - 0.004) < 1e-9);
  });
  it("rejects zero/negative size and packs", () => {
    assert.match(normalizeRow({ packs: 0, size: 1, unit: "l", price: 1 }).error, /packs/);
    assert.match(normalizeRow({ packs: 1, size: -2, unit: "l", price: 1 }).error, /size/);
    assert.match(normalizeRow({ packs: 1, size: 1, unit: "l", price: -1 }).error, /price/);
  });
  it("rejects unknown unit", () => {
    assert.match(normalizeRow({ packs: 1, size: 1, unit: "floz", price: 1 }).error, /unknown unit/);
  });
});

describe("rankRows", () => {
  const rows = [
    { packs: 1, size: 1, unit: "L", price: 1.49 },     // 1.49 / L
    { packs: 1, size: 500, unit: "ml", price: 0.85 },  // 1.70 / L
    { packs: 2, size: 1.5, unit: "L", price: 4.10 },   // 1.3667 / L
  ];
  it("orders cheapest per-unit first within a family", () => {
    const { valid } = rankRows(rows);
    assert.deepEqual(
      valid.map((v) => v.index),
      [2, 0, 1],
    );
  });
  it("keeps invalid rows out of the ranking but visible as errors", () => {
    const withBad = [...rows, { packs: 1, size: 0, unit: "L", price: 3 }];
    const { enriched, valid } = rankRows(withBad);
    assert.equal(enriched.length, 4);
    assert.equal(valid.length, 3);
    assert.ok(enriched[3].error);
  });
  it("separates families (volume before weight alphabetically)", () => {
    const mixed = [
      { packs: 1, size: 1, unit: "kg", price: 5 },
      { packs: 1, size: 1, unit: "L", price: 5 },
    ];
    const { valid } = rankRows(mixed);
    assert.equal(valid[0].family, "volume");
    assert.equal(valid[1].family, "weight");
  });
});

describe("bestValue", () => {
  it("quantifies the spread within a family", () => {
    const rows = [
      { packs: 1, size: 1, unit: "L", price: 1.49 },
      { packs: 1, size: 500, unit: "ml", price: 0.85 },
    ];
    const bv = bestValue(rows, "volume");
    assert.equal(bv.bestIndex, 0);
    assert.equal(bv.worstIndex, 1);
    // 1.70 vs 1.49 -> ~14.09% extra
    assert.ok(Math.abs(bv.worstExtraPct - 14.093959731543625) < 1e-9);
  });
  it("returns null for fewer than 2 valid rows in family", () => {
    assert.equal(bestValue([{ packs: 1, size: 1, unit: "L", price: 1 }], "volume"), null);
  });
});

describe("formatPerUnit", () => {
  it("scales to currency per L/kg", () => {
    assert.equal(formatPerUnit(0.00149, "volume"), "$1.49 / L");
    assert.equal(formatPerUnit(0.004, "weight"), "$4.00 / kg");
  });
  it("handles non-finite", () => {
    assert.equal(formatPerUnit(Infinity, "volume"), "—");
  });
});
