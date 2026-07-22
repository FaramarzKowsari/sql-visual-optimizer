# Contributing

Thank you for improving SQL Visual Optimizer.

## Development

```bash
npm install
npm run dev
```

Before submitting a pull request:

```bash
npm run test
npm run build
```

## Good contributions

- additional SQL anti-pattern detectors with test fixtures;
- parsers for real execution-plan formats;
- clearer cost-model explanations;
- accessibility and mobile improvements;
- new query clinics with reproducible schemas;
- research comparisons between estimates and real engine plans.

## Scientific integrity

Never label an estimated browser plan as a real PostgreSQL, MySQL, SQLite, or SQL Server plan. New estimates must expose assumptions and limitations. Recommendations should be hypotheses that users validate with representative data and engine evidence.
