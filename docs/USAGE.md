# unitworth usage guide

## Opening the app

Double-click `index.html`, or serve the folder if your browser blocks ES
modules on `file://`:

```shell
cd unitworth
python -m http.server 8080     # or: npx serve
# open http://localhost:8080
```

## Reading the table

| Column | Meaning | Example |
|---|---|---|
| Label | free text, only for your reference | "Cola 6-pack" |
| Packs | how many physical packs the price covers | 6 |
| Size | amount per pack | 330 |
| Unit | ml, L, g, or kg | ml |
| Price | total price for all packs | 7.50 |

**Per unit** is computed for you: `price / (packs × size × unit factor)`,
displayed per L (volume) or per kg (weight). The cheapest row per family is
highlighted green and bold.

## Worked examples

### Which milk?

| Label | Packs | Size | Unit | Price | Per unit |
|---|---|---|---|---|---|
| Milk 1 L | 1 | 1 | L | 1.49 | $1.49 / L |
| Milk 500 ml | 1 | 500 | ml | 0.85 | $1.70 / L |
| Milk 2×1.5 L | 2 | 1.5 | L | 4.10 | $1.37 / L |

→ The bundle wins despite the higher sticker price.

### Which rice?

| Label | Packs | Size | Unit | Price | Per unit |
|---|---|---|---|---|---|
| Rice 1 kg | 1 | 1 | kg | 2.99 | $2.99 / kg |
| Rice 4×250 g | 4 | 250 | g | 3.49 | $3.49 / kg |

→ The single big bag wins; the "value" 4-pack costs 16.7% more per kg
(unitworth says this in the insight line).

## Error states

- Unknown unit (e.g. `floz`) → "unknown unit: floz" in the Per unit cell.
- Zero/blank size or packs → error naming the offending field.
- Invalid rows never block valid rows from ranking.

## Keyboard flow

Tab moves label → packs → size → unit → price → ×; pressing Enter inside any
field appends a new row. Deleting the focused row's `×` keeps focus sensible.

## Copying results

**Copy as TSV** puts the whole table on the clipboard, ready for spreadsheets.
If the clipboard API is unavailable, a fallback prompt shows the TSV text.
