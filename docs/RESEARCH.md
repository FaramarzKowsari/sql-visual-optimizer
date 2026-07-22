# Research direction

## Central question

How accurately can a transparent, browser-side optimizer approximate the pedagogically important decisions of real database engines when only limited schema statistics are available?

## Candidate studies

1. **Cardinality estimation under sparse statistics**  
   Compare simple selectivity heuristics, histograms, sketches, and learned estimators.

2. **Join-order visualization**  
   Evaluate whether interactive join-order alternatives improve student understanding of dynamic programming and cost-based optimization.

3. **Explainability of execution plans**  
   Measure whether visual plans reduce diagnosis time compared with raw text or JSON.

4. **LLM explanations versus deterministic rules**  
   Compare correctness, calibration, and pedagogical usefulness while keeping engine evidence separate from generated interpretation.

5. **Cross-dialect plan normalization**  
   Develop a common intermediate representation for PostgreSQL, MySQL, SQLite, SQL Server, and DuckDB plans.

## Reproducibility requirements

All published benchmark results should include datasets or deterministic generators, exact engine versions, DDL, indexes, queries, configuration, environment metadata, raw plans, and analysis scripts.
