# Security Policy

## Supported version

Security fixes are applied to the latest release on the `main` branch.

## API-key handling

SQL Visual Optimizer ships with no API key. The optional Gemini integration uses a key supplied by the visitor. The key:

- is stored only in browser `sessionStorage`;
- is removed when the tab session ends or when **Forget key** is clicked;
- is never sent to a project-owned server;
- must never be committed to the repository, screenshots, issues, logs, or examples.

The application calls Google's API directly from the user's browser. Users remain responsible for their own account, quota, billing, model access, and provider terms.

## Query privacy

Rule-based query analysis and imported EXPLAIN JSON run in the browser. When the optional Gemini explanation is invoked, the current SQL and summarized findings are sent to the Gemini API under the visitor's key. Do not submit confidential schemas or production queries unless permitted by your organization.

## Reporting a vulnerability

Please report security concerns privately through the maintainer's GitHub profile rather than opening a public issue containing exploitable details.
