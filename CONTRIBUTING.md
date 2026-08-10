# Contributing to fhir-observation-generator

Thanks for considering a contribution. This repo is part of the Peerbits HealthTech Open Source initiative: small, focused, spec-grounded tools.

## Prerequisites

- Node.js 20 or later
- npm (included with Node.js)
- Git

Check your versions:

```bash
node --version
npm --version
```

## First-time local setup

```bash
git clone https://github.com/PeerbitsSolution/fhir-observation-generator.git
cd fhir-observation-generator
npm ci
```

Use `npm ci` for a clean, repeatable installation from `package-lock.json`. Use `npm install` only when intentionally changing dependencies.

## Development commands

| Command | Purpose |
| --- | --- |
| `npm run lint` | Check TypeScript style and common mistakes. |
| `npm run typecheck` | Type-check the library source. |
| `npm test` | Run all unit and regression tests. |
| `npm run build` | Create the publishable `dist/` files. |
| `npm pack --dry-run` | Verify the exact npm package contents without publishing. |

## Run an example locally

```bash
npm run build
npx tsx docs/examples/basic-conversion/basic-conversion.ts
```

## Making a change

1. Branch off `main`.
2. Write code and tests together.
3. Run `npm run lint`, `npm run typecheck`, and `npm test` before opening a PR.
4. Run `npm pack --dry-run` for changes that affect the public API or package metadata.
5. Open a PR using the PR template.

## Clinical-data safety

- Keep fixtures and examples synthetic. Do not add real patient data, credentials, or device serial numbers.
- Unsupported or incompatible units must fail with an error; never silently relabel a value.
- `validateObservation` is a structural check only. Production integrations should validate against the FHIR profile required by their receiving system.

## What we will not merge

- Real patient data, real credentials, or client-identifying content.
- Scope creep from a focused component into a full product.
