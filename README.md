# fhir-observation-generator

> Generate FHIR R4-shaped Observation resources from Remote Patient Monitoring (RPM) device readings, with LOINC coding and UCUM unit conversion.

**Category:** RPM — Device & Observation Utilities · **License:** Apache-2.0 · **Status:** Release candidate (v1.0.0)

---

## 1. What problem does this solve?
Every Remote Patient Monitoring (RPM) program must transform raw device data into FHIR Observation resources before it enters an EHR or clinical data repository.
This library provides a focused, auditable conversion layer for the supported vital types, units, and Observation structures.

## 2. Features

- **7 Core RPM Vital Types Supported:** Blood pressure, heart rate, body weight, SpO2, body temperature, blood glucose, and respiratory rate.
- **Component-Based Blood Pressure:** Generates exactly one Observation with systolic (`8480-6`) and diastolic (`8462-4`) components under panel LOINC `85354-9`.
- **Verified UCUM Unit Conversion:** Converts raw units (e.g. °F to °C, lbs to kg, mg/dL to mmol/L) using standard reference formulas.
- **Single Source LOINC Mapping:** Fully auditable table of codes (`http://loinc.org`) and FHIR categories (`vital-signs`).
- **Structural Self-Check:** Built-in validation for essential Observation fields (`status`, `category`, `code`, `subject`, `effectiveDateTime`, `valueQuantity`/`component`).
- **Zero Runtime Dependencies:** Lightweight, pure TypeScript transformation engine suitable for browser, Node.js, and edge environments.

## 3. Installation

```bash
npm install fhir-observation-generator
```

## 4. Quick Start

### Before (Raw RPM Device Reading JSON)

```json
{
  "deviceType": "blood-pressure",
  "value": {
    "systolic": 120,
    "diastolic": 80
  },
  "unit": "mmHg",
  "timestamp": "2026-08-06T08:30:00Z",
  "patientRef": "Patient/pat-rpm-101",
  "deviceId": "Device/bp-cuff-9021"
}
```

### Conversion Code

```typescript
import { toObservation, DeviceReading } from "fhir-observation-generator";

const reading: DeviceReading = {
  deviceType: "blood-pressure",
  value: { systolic: 120, diastolic: 80 },
  unit: "mmHg",
  timestamp: "2026-08-06T08:30:00Z",
  patientRef: "Patient/pat-rpm-101",
  deviceId: "Device/bp-cuff-9021",
};

const observation = toObservation(reading, { validate: true });
```

### After (Generated FHIR R4 Observation Resource)

```json
{
  "resourceType": "Observation",
  "status": "final",
  "category": [
    {
      "coding": [
        {
          "system": "http://terminology.hl7.org/CodeSystem/observation-category",
          "code": "vital-signs",
          "display": "Vital Signs"
        }
      ]
    }
  ],
  "code": {
    "coding": [
      {
        "system": "http://loinc.org",
        "code": "85354-9",
        "display": "Blood pressure panel with all children optional"
      }
    ],
    "text": "Blood pressure panel with all children optional"
  },
  "subject": {
    "reference": "Patient/pat-rpm-101"
  },
  "effectiveDateTime": "2026-08-06T08:30:00Z",
  "device": {
    "reference": "Device/bp-cuff-9021"
  },
  "component": [
    {
      "code": {
        "coding": [
          {
            "system": "http://loinc.org",
            "code": "8480-6",
            "display": "Systolic blood pressure"
          }
        ],
        "text": "Systolic blood pressure"
      },
      "valueQuantity": {
        "value": 120,
        "unit": "mmHg",
        "system": "http://unitsofmeasure.org",
        "code": "mm[Hg]"
      }
    },
    {
      "code": {
        "coding": [
          {
            "system": "http://loinc.org",
            "code": "8462-4",
            "display": "Diastolic blood pressure"
          }
        ],
        "text": "Diastolic blood pressure"
      },
      "valueQuantity": {
        "value": 80,
        "unit": "mmHg",
        "system": "http://unitsofmeasure.org",
        "code": "mm[Hg]"
      }
    }
  ]
}
```

## 5. Architecture

The library is organized into decoupled, single-responsibility modules:

- `src/types.ts`: `DeviceReading`, `GeneratorConfig`, and FHIR Observation / Bundle interfaces.
- `src/loinc-map.ts`: Centralized LOINC coding catalog (`LOINC_MAP`) mapping each vital type to LOINC codes, display labels, and categories. See [docs/LOINC_REFERENCE.md](./docs/LOINC_REFERENCE.md).
- `src/units.ts`: Exact UCUM conversion functions (`convertUnit`, `normalizeUcumUnit`).
- `src/generators/`: Individual per-vital generators (`blood-pressure.ts`, `heart-rate.ts`, `weight.ts`, `spo2.ts`, `temperature.ts`, `glucose.ts`, `respiratory-rate.ts`) and main `toObservation` dispatcher.
- `src/validate.ts`: Lightweight structural validation (`validateObservation`).
- `src/bundle.ts`: Transaction bundle compiler (`readingsToBundle`).

## 6. Example Usage

Full runnable code examples are available under `docs/examples/`:

- [Basic Conversion Example](./docs/examples/basic-conversion): Single reading conversion and temperature unit handling.
- [Batch with fhir-client](./docs/examples/batch-with-fhir-client): Transaction bundle generation and composition with `fhir-client`.

## 7. Safety and validation

- The library accepts only its documented source units and supported conversions. Unsupported or incompatible units, `NaN`, and infinite measurements throw an error rather than being relabeled.
- `validateObservation` is a lightweight structural check; validate generated resources against the FHIR profile required by your receiving system before production submission.
- This package is a data-transformation utility, not medical advice, a diagnostic tool, or a clinical decision-support system. Integrators remain responsible for device-data quality, clinical review, and regulatory obligations.

## 8. Roadmap

- [ ] Additional vital types (e.g. Body Mass Index / BMI, Body Height, Heart Rate Variability / HRV).
- [ ] Official HL7 FHIR / US Core Validator integration support.
- [ ] Support for continuous streaming device reading series.

## 9. Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines and setup instructions.

## 10. License

Apache License 2.0 — see [LICENSE](./LICENSE).

## 11. About Peerbits

`fhir-observation-generator` is part of the [Peerbits HealthTech Open Source](https://github.com/peerbits) initiative—reusable engineering components extracted from our healthcare technology work. This repository contains generalized, reusable logic only; it is not tied to any specific client engagement or commercial product.
