# Architecture

## Design goals

SQL Visual Optimizer is intentionally browser-first. The public demonstration must remain usable without a project-owned server, paid database, or embedded API credential.

```text
SQL text + schema statistics
            │
            ▼
    TypeScript analysis core
      ├─ SQL parser / AST
      ├─ table and alias discovery
      ├─ transparent rule checks
      ├─ estimated logical-plan builder
      ├─ educational cost model
      └─ exploratory index hypotheses
            │
            ▼
      React visualization layer
      ├─ plan tree and cost heat
      ├─ findings and rewrites
      ├─ AST inspection
      └─ local explanation
```

A separate evidence path imports PostgreSQL-compatible EXPLAIN JSON:

```text
EXPLAIN JSON → plan normalizer → observed plan visualization
```

The optional Gemini path is deliberately downstream of the deterministic analysis:

```text
User-owned API key + SQL + summarized findings → Gemini API → explanatory text
```

The model does not determine the browser estimator's findings and cannot convert an estimate into engine evidence.

## Modules

- `src/lib/analyzer.ts`: deterministic parser orchestration, plan model, findings, indexes, and metrics.
- `src/lib/explain.ts`: normalizes PostgreSQL-compatible JSON into the shared plan-tree type.
- `src/lib/gemini.ts`: optional BYOK explanation adapter.
- `src/components/`: visual and interaction layers.
- `crates/query-math/`: experimental Rust/WASM numerical primitives for future migration.

## Privacy boundary

The static analyzer and EXPLAIN importer operate locally. A network request occurs only when the visitor explicitly clicks the Gemini action. The key belongs to the visitor and is stored in `sessionStorage` rather than the repository.

## Deployment

The build produces static assets under `dist/`. GitHub Actions publishes those assets to GitHub Pages. No server process is required.
