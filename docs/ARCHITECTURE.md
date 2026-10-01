# unitworth architecture

## Layering

```text
┌────────────────────────────┐
│ index.html                 │  markup, semantic table, aria-live regions
└──────────┬─────────────────┘
           │ module script
┌──────────▼─────────────────┐
│ app.js                     │  DOM reads/writes, row lifecycle, rendering
└──────────┬─────────────────┘
           │ imports pure functions
┌──────────▼─────────────────┐
│ units.js                   │  parse/normalize/rank/insight — NO DOM
└──────────┬─────────────────┘
           │ imported directly by
┌──────────▼─────────────────┐
│ tests/units.test.js        │  node:test — same code paths as the page
└────────────────────────────┘
```

The single most important structural decision: **all pricing math is in a pure
ES module with zero DOM references**. The browser page and the test suite call
the same functions, so `npm test` exercises exactly the code users run.

## units.js

- `parseUnit(text)` — tolerant unit parsing (`"ML"`, `"ltr"`, `"kg."`, `"kilo"`
  all normalize); unknown units return `null` so callers can surface an error
  instead of silently mispricing.
- `normalizeRow(row)` — validates packs/size/price, computes
  `baseAmount = packs × size × unitFactor` in ml or g, and
  `perUnitPrice = price / baseAmount`. Every failure mode returns
  `{ error }` with a human-readable message, never a thrown exception —
  invalid rows are a normal state of a half-filled table.
- `rankRows(rows)` — enriches every row, keeps invalid ones visible with their
  error, and sorts valid ones per family ascending by per-unit price (ties by
  total price).
- `bestValue(rows, family)` — spread insight: percent premium of the worst
  option over the best within one family.
- `formatPerUnit(price, family)` — display scaling (per-ml → per-L,
  per-g → per-kg) with a non-finite guard.

## app.js

Reads the table into plain row objects, delegates to `units.js`, then:
- marks the cheapest row per family (`tr.best`),
- shows validation errors inline (`tr.invalid`),
- renders the ranking `<pre>` and insight line into `aria-live` regions so
  screen readers announce updates.

Re-render is triggered by `input` events (delegated on `<tbody>`), row add,
row delete, and example/clear actions. No framework, no virtual DOM — the
table is at most a few dozen rows.

## index.html

One page, no routing. Results live in `<pre aria-live="polite">` so assistive
tech announces ranking changes. No external requests: fonts are system fonts,
all assets are the four repo files.

## Styling

Plain CSS with `prefers-color-scheme` for dark mode. `color-scheme` is declared
so form controls follow the theme.
