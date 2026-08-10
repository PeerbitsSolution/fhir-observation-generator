# Basic Conversion Example

This example demonstrates converting single device readings into FHIR Observation resources using `fhir-observation-generator`.

## How to run

```bash
npx tsx basic-conversion.ts
```

## Features shown

1. Blood pressure conversion into a single FHIR Observation with systolic and diastolic components (`LOINC 85354-9`, `8480-6`, `8462-4`).
2. Automatic temperature unit conversion from `98.6°F` to `37°C` standard UCUM.
3. Structural self-check validation (`validate: true`).
