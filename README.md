<div align="center">
  <img src="https://avatars.githubusercontent.com/u/105053743?v=4" alt="Faramarz Kowsari" width="116" style="border-radius: 50%" />

# SQL Visual Optimizer

### An Interactive Query Planning, Cost Analysis, and SQL Performance Laboratory

[![CI](https://github.com/FaramarzKowsari/sql-visual-optimizer/actions/workflows/ci.yml/badge.svg)](https://github.com/FaramarzKowsari/sql-visual-optimizer/actions/workflows/ci.yml)
[![Deploy](https://github.com/FaramarzKowsari/sql-visual-optimizer/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/FaramarzKowsari/sql-visual-optimizer/actions/workflows/deploy-pages.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-45d9e8.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-browser--first-3178c6)](https://www.typescriptlang.org/)
[![Rust/WASM](https://img.shields.io/badge/Rust%2FWASM-experimental-b7410e)](crates/query-math)

**Live application:** `https://FaramarzKowsari.github.io/sql-visual-optimizer/`

</div>

<p align="center">
  <a href="https://FaramarzKowsari.github.io/sql-visual-optimizer/" title="Open the live SQL Visual Optimizer laboratory">
    <img src="public/images/sql-visual-optimizer-hero.png" alt="SQL Visual Optimizer — interactive query planning, cost analysis, AST, EXPLAIN JSON, cost heatmap, and index candidates" width="100%" />
  </a>
</p>

<p align="center"><sub>Professional interface showcase · Click the image to open the live application</sub></p>

---

SQL Visual Optimizer turns SQL performance analysis into an inspectable visual workflow. It parses queries, builds a transparent educational plan, highlights likely cost centers, detects common anti-patterns, proposes index experiments, and visualizes real PostgreSQL-compatible `EXPLAIN (FORMAT JSON)` output.

The public application runs as static files on GitHub Pages. It requires **no project-owned server, database, paid API, or embedded credential**.

## What it can do

- parse PostgreSQL, MySQL, SQLite, and T-SQL syntax;
- display the parser's abstract syntax tree;
- identify tables, aliases, joins, filters, aggregates, sorts, offsets, and limits;
- build a transparent browser-side logical-plan estimate;
- visualize modeled row flow and relative cost heat;
- detect SQL anti-patterns and explain why they matter;
- generate exploratory index candidates from predicates and join keys;
- let users edit table sizes and declared indexes;
- import PostgreSQL-compatible EXPLAIN JSON;
- display actual rows and timing when present in imported plans;
- provide a local rule-based explanation without AI;
- optionally request a Gemini explanation using the visitor's own API key.

## Evidence labels

The application intentionally separates three different things:

| Label | Meaning |
|---|---|
| **Estimated Plan** | A transparent teaching model created in the browser. It is not PostgreSQL's or MySQL's chosen physical plan. |
| **Imported Real Plan** | JSON produced by a database engine and visualized by the application. |
| **AI Explanation** | Optional interpretation produced with the visitor's own Gemini key. It is not execution evidence. |

This distinction is central to the project's scientific integrity.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

Production verification:

```bash
npm run test
npm run build
npm run preview
```

## Publish with GitHub Desktop

1. Create a new public repository named `sql-visual-optimizer` under `FaramarzKowsari`.
2. Extract or copy this project into the repository's local folder.
3. In GitHub Desktop, review the file list.
4. Commit with: `Initial release: browser-based SQL optimization laboratory`
5. Click **Publish repository** or **Push origin**.
6. Open the repository on GitHub.
7. Go to **Settings → Pages**.
8. Under **Build and deployment**, choose **GitHub Actions**.
9. The included deployment workflow will publish the static application.

Expected URL:

```text
https://FaramarzKowsari.github.io/sql-visual-optimizer/
```

## Optional Gemini BYOK mode

The deterministic analyzer works without Gemini. Visitors may paste their own Gemini API key to request a natural-language performance explanation.

Security properties:

- no key is included in the repository;
- the key is stored only in browser `sessionStorage`;
- the key can be erased with **Forget key**;
- requests go directly from the visitor's browser to the provider;
- quotas, billing, and provider terms belong to the key owner.

Do not submit confidential schemas or production queries to an external model without authorization.

## Project structure

```text
sql-visual-optimizer/
├── src/
│   ├── components/          # visual interface
│   ├── data/                # query clinics
│   ├── lib/
│   │   ├── analyzer.ts      # deterministic analysis and plan model
│   │   ├── explain.ts       # imported plan normalization
│   │   └── gemini.ts        # optional BYOK adapter
│   └── types.ts
├── crates/query-math/       # experimental Rust/WASM cost primitives
├── examples/                # SQL and EXPLAIN fixtures
├── benchmarks/              # reproducibility requirements
├── docs/                    # architecture, methodology, research, roadmap
└── .github/workflows/       # CI and Pages deployment
```

## Current methodology

The browser estimator is deliberately lightweight. It models scans, joins, filters, aggregation, deduplication, sorting, offset, and limit using explicit heuristics and user-provided schema statistics. Relative cost units make structural changes visible; they do not predict production latency.

Read:

- [Architecture](docs/ARCHITECTURE.md)
- [Methodology and limitations](docs/METHODOLOGY.md)
- [Research direction](docs/RESEARCH.md)
- [Roadmap](docs/ROADMAP.md)

## Archival release and DOI

The repository is prepared for archival through the Zenodo–GitHub integration. Release metadata is defined in [`.zenodo.json`](.zenodo.json), while human- and machine-readable citation guidance is maintained in [`CITATION.cff`](CITATION.cff).

The first archival software release uses the tag `v1.0.0`. After Zenodo processes the GitHub release, the concept DOI and version-specific DOI will be added to this README, the live application, structured metadata, and citation files.

## Author

**Faramarz Kowsari** is an author, Software Engineer and AI researcher based in Istanbul. Focusing on the intersection of technology, education, and personal growth, he has published over 80 digital titles on international platforms. His areas of expertise span Artificial Intelligence, prompt engineering, modern trading strategies (Smart Money Concepts & algorithmic trading), as well as classical literature and mindfulness. In addition to writing, he develops web-based educational tools and creates specialized instructional video content.

### Official Profiles & Repositories

- ORCID: https://orcid.org/0000-0003-1692-0453
- Google Scholar: https://scholar.google.com/citations?user=G7tP5WMAAAAJ&hl=en
- GitHub: https://github.com/FaramarzKowsari
- LinkedIn: https://www.linkedin.com/in/faramarzkowsari
- Google Books: https://play.google.com/store/search?q=Faramarz_Kowsari&c=books
- Official Website: https://FaramarzKowsari.github.io
- Zenodo Records: https://zenodo.org/search?q=creators.orcid%3A%220000-0003-1692-0453%22&l=list&p=1&s=10&sort=bestmatch

## Citation

Citation metadata is available in [`CITATION.cff`](CITATION.cff). Zenodo archival metadata is available in [`.zenodo.json`](.zenodo.json). Once the first release is archived, cite the version-specific Zenodo DOI shown on the release record; use the concept DOI when linking to the evolving software project as a whole.

## License

MIT © 2026 Faramarz Kowsari.
