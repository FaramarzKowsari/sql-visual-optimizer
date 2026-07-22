# Project Manifest

## Application

- Browser-based SQL parser and plan estimator
- Query health score and complexity metrics
- Schema statistics editor
- SQL anti-pattern findings
- Exploratory index candidates
- AST JSON viewer
- PostgreSQL-compatible EXPLAIN JSON importer
- Optional Gemini BYOK explanation
- Responsive About/Author section

## Engineering

- React + TypeScript + Vite
- Unit tests with Vitest
- CI workflow
- GitHub Pages workflow
- MIT license
- CITATION.cff
- Security and contribution policies
- Architecture, methodology, research, and roadmap documents
- Experimental Rust/WASM cost primitives

## Verification performed in the build environment

- TypeScript source syntax and internal project types checked with TypeScript 5.8.3 and temporary ambient dependency declarations.
- Full dependency installation was attempted twice but the environment's internal npm gateway returned HTTP 503/timeouts.
- No claim is made that the production dependency build ran in this environment.
- The repository's CI workflow installs public dependencies, runs tests, and builds the application after publication.
