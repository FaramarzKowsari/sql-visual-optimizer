# Benchmark workspace

This directory is reserved for reproducible comparisons between the browser estimator and real database engines.

A benchmark record should contain:

- database engine and exact version;
- schema DDL and indexes;
- data-generation procedure or dataset checksum;
- engine configuration and hardware context;
- SQL query;
- `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)` output where supported;
- browser estimator output;
- cardinality and cost error measurements;
- interpretation and limitations.

Do not publish proprietary queries, credentials, or sensitive production plans.
