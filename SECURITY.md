# Security Policy

## Reporting a vulnerability

Please do not open a public issue. Instead:
- Email: `security@peerbits.com`
- Or GitHub's private vulnerability reporting on this repo.

Expect acknowledgment within 3 business days.

## What this repo does and does not contain

- No PHI anywhere, including tests/examples — synthetic data only.
- No production credentials in any example configuration.

## Automated scanning

- Dependabot opens weekly dependency update pull requests.
- GitHub Actions runs linting, type checks, tests, runtime dependency audit, and package-content checks on pull requests and changes to `main`.
- CodeQL scans the TypeScript source in the same workflow.
