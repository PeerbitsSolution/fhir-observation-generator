# Batch Generation with @peerbits/fhir-client

This example shows how to convert a batch of RPM device readings into a FHIR transaction Bundle and submit it using [`@peerbits/fhir-client`](https://www.npmjs.com/package/@peerbits/fhir-client).

## How to run

```bash
npx tsx batch-example.ts
```

## Composition Workflow

1. Collect array of `DeviceReading` objects (BP, Heart Rate, Weight, Glucose, etc.).
2. Call `readingsToBundle(readings)` to produce a FHIR R4 transaction Bundle.
3. Pass the transaction bundle directly to [`@peerbits/fhir-client`](https://www.npmjs.com/package/@peerbits/fhir-client)'s batch/transaction method:

```ts
const bundle = readingsToBundle(readings);
await fhirClient.transaction(bundle);
```
