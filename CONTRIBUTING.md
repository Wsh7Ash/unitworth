# Contributing to unitworth

## Setup

```shell
git clone https://github.com/Wsh7Ash/unitworth.git
cd unitworth
npm test
```

No dependencies, no build step. Serve the folder to try the UI:

```shell
python -m http.server 8080
```

## Ground rules

- **Keep the app zero-install and offline**: no dependencies, no CDN links,
  no network requests, no storage. PRs adding any of these will be declined.
- All pricing/normalization logic goes in `units.js` as pure functions with
  tests; `app.js` stays DOM-only.
- Keep browser support at "evergreen" (ES modules, `aria-live`) — no polyfills.
- CSS stays plain; no preprocessors.

## Pull requests

1. Branch from `main`.
2. Add tests for any new pure function behavior.
3. `npm test` green.
4. Manually verify the UI still works (load example, edit rows, copy TSV).
5. Update `docs/` and `CHANGELOG.md` under "Unreleased".

## Reporting issues

Include the exact row values (packs/size/unit/price) that produced a wrong
ranking, plus what you expected versus what was shown.
