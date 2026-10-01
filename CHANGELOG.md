# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-10-01

### Added
- Pure pricing engine (`units.js`): tolerant unit parsing, pack-aware
  normalization to base units, per-family ranking, best-value spread insight.
- Zero-install single-page UI: live re-ranking, cheapest-row highlight,
  inline validation, TSV export, example dataset.
- node:test suite covering parser, normalizer, ranking, insights, formatting.
- Dark/light theme via `prefers-color-scheme`.
