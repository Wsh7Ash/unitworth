# Results

## Environment
- OS: Windows 11 (bash / msys2), x86-64
- Runtime/compiler: Node.js v24.13.0 (tests); Google Chrome headless (UI smoke test)
- Dependency manager: npm (no dependencies — dev or runtime)
- Test framework: node:test

## Validation performed
- install: PASS (nothing to install)
- build: N/A (no build step by design)
- unit tests: PASS (16/16)
- integration tests: N/A
- lint: N/A
- type check: N/A (plain JavaScript)
- demo run: PASS (headless Chrome loaded the page; computed ranking verified)

## Commands executed
```shell
npm test
# ℹ tests 16
# ℹ pass 16
# ℹ fail 0

python -m http.server 8123
chrome --headless=new --disable-gpu --virtual-time-budget=5000 \
  --dump-dom http://localhost:8123/index.html > results/headless-dom.html
```

## Observed result
The example dataset (3 milk options, 2 rice options) rendered in headless
Chrome with these computed per-unit verdicts:

```text
— volume —
$1.37 / L  Milk 2 x 1.5 L      <- cheapest volume
$1.49 / L  Milk 1 L
$1.70 / L  Milk 500 ml
— weight —
$2.99 / kg  Rice 1 kg          <- cheapest weight
$3.49 / kg  Rice 4 x 250 g
```

Insight panel:

```text
volume: "Milk 500 ml" costs 24.4% more per unit than "Milk 2 x 1.5 L".
weight: "Rice 4 x 250 g" costs 16.7% more per unit than "Rice 1 kg".
```

Manual spot-check of the math: 2×1.5 L at 4.10 → 4.10/3000 L = 1.3667/L ✓;
500 ml at 0.85 → 1.70/L ✓; 4×250 g at 3.49 → 3.49/1000 g = 3.49/kg ✓.

## Generated artifacts
- `results/headless-dom.html` — full DOM dump from the headless Chrome run
  (shows rendered verdicts, ranking, and insight text)

## Known limitations
- Volume and weight families only; no per-piece pricing yet.
- No persistence between reloads (deliberate privacy choice).
- ES modules require http:// serving in some browsers on file:// —
  documented in docs/USAGE.md.
