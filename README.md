# unitworth

**unitworth** is a zero-install web app for comparing true unit prices — paste a
shopping list, and it tells you which package size actually costs least per unit,
handling pack counts, mixed units (ml/L, g/kg), and multi-pack bundles.

## The problem

Shelf prices are engineered to confuse: 750 ml for $2.79 or 1.25 L for $4.35?
A 4-pack of 200 g bars or a single 900 g box? Supermarkets print unit prices in
inconsistent formats (or not at all), and "bigger is cheaper" is often false.
unitworth does the arithmetic for every option at once and ranks them.

## Key features

- **Everything is local** — one HTML file, no build step, no server, no
  analytics. Open it and use it; works offline.
- **Mixed units normalized** — ml↔L and g↔kg handled automatically; cross-domain
  rows (volume vs weight) are ranked within their own family.
- **Pack-aware math** — `packs × size × unit` with explicit price; e.g.
  "4-pack of 250 g" and "2 × 1 kg" both work.
- **Live ranking table** — cheapest per-unit option highlighted; ties broken by
  total price.
- **Best-value insight panel** — shows how much the worst option costs
  *extra per unit* versus the best, in percent.
- **Example loader + demo dataset** — one click to see it working.
- **Keyboard-friendly** — Tab through rows, Enter adds a row.

## Architecture summary

```text
unitworth/
├─ index.html      # markup + layout
├─ styles.css      # styling (dark/light via prefers-color-scheme)
├─ app.js          # UI: table editing, rendering
├─ units.js        # unit parsing/normalization (pure functions)
└─ tests/          # browser-free unit tests (node:test) for units.js + math
```

The pricing engine (`units.js`) is a pure ES module with no DOM access, so the
exact code that powers the page is also what the tests exercise.

## Requirements

- Any modern browser (ES2020+)
- Node 20+ only if you want to run the test suite

## Installation

None. Open `index.html` in a browser. That is the whole install.

## Quick start

1. Open `index.html`.
2. Click **Load example**.
3. Edit rows: `quantity per pack` (number), `unit` (ml/L/g/kg), `packs`,
   `price`.
4. The ranking table updates as you type — cheapest per-unit row on top,
   highlighted green.
5. Click **Add row** (or press Enter in the last field) to compare more
   options.

Example — which milk is cheapest per liter?

| packs | size | unit | price |
|---|---|---|---|
| 1 | 1 | L | 1.49 |
| 1 | 500 | ml | 0.85 |
| 2 | 1.5 | L | 4.10 |

unitworth answers: `1 L @ $1.49/L` wins; the 2×1.5 L bundle costs $1.37/L
(cheapest per unit) — wait, no: it re-ranks live, so you never have to trust
the shelf label again. That's the point.

## Configuration

No configuration. Data never leaves the page; nothing is persisted unless you
export the table (copy-paste friendly TSV via the **Copy as TSV** button).

## Testing

```shell
npm test
```

Runs `node --test tests/` against the pure pricing engine: unit parsing,
normalization, per-unit math, edge cases (zero size, mixed families, pack
counts), and the ranking comparator.

## Project structure

See "Architecture summary"; details in `docs/ARCHITECTURE.md` and
`docs/USAGE.md`.

## Limitations

- Volume and weight only — no per-piece or area pricing yet.
- No currency conversion; enter all prices in one currency.
- No persistence between page reloads (by design; nothing leaves the device).

## Roadmap

- Per-piece pricing ("3 for $5" offers)
- Export/import comparison sets as JSON
- Printable comparison card

## Security notes

The app performs no network requests of any kind, stores nothing, and includes
no third-party scripts. Review `app.js` and `units.js` — there is nothing else.

## License

MIT
