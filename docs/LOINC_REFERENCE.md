# LOINC Reference & Coding Decisions

This document serves as the audit trail for all LOINC coding and unit mapping decisions implemented in `src/loinc-map.ts`.
All codes are grounded in the official [LOINC Database](https://loinc.org) and aligned with the HL7 FHIR [US Core Vital Signs Profile](https://hl7.org/fhir/us/core/StructureDefinition-us-core-vital-signs.html).

---

## 1. Supported Vital Types Mapping Summary

| Vital Type | LOINC Code | LOINC Display Name | FHIR Category | Standard UCUM Unit | Unit Display | Observation Structure |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Blood Pressure** | `85354-9` | Blood pressure panel with all children optional | `vital-signs` | `mm[Hg]` | mmHg | Component-based (Systolic + Diastolic) |
| **Heart Rate** | `8867-4` | Heart rate | `vital-signs` | `/min` | beats/min | `valueQuantity` |
| **Body Weight** | `29463-7` | Body weight | `vital-signs` | `kg` | kg | `valueQuantity` |
| **SpO2 (Pulse Ox)** | `59408-5` | Oxygen saturation in Arterial blood by Pulse oximetry | `vital-signs` | `%` | % | `valueQuantity` |
| **Body Temperature** | `8310-5` | Body temperature | `vital-signs` | `Cel` | °C | `valueQuantity` |
| **Blood Glucose** | `2339-0` | Glucose [Mass/volume] in Blood | `vital-signs` | `mg/dL` | mg/dL | `valueQuantity` |
| **Respiratory Rate** | `9279-1` | Respiratory rate | `vital-signs` | `/min` | breaths/min | `valueQuantity` |

---

## 2. Blood Pressure Component Specification

Per FHIR R4 and US Core Vital Signs requirements, Blood Pressure observations **MUST NOT** be split into two separate Observations. Instead, a single Observation resource with LOINC `85354-9` is produced, containing two `component` entries:

| Component | LOINC Code | LOINC Display Name | System | UCUM Code |
| :--- | :--- | :--- | :--- | :--- |
| **Systolic** | `8480-6` | Systolic blood pressure | `http://loinc.org` | `mm[Hg]` |
| **Diastolic** | `8462-4` | Diastolic blood pressure | `http://loinc.org` | `mm[Hg]` |

---

## 3. Standard UCUM Unit Conversions

The library performs verified reference-based conversions to standard UCUM units:

- **Temperature**: Fahrenheit (`[degF]`) is converted to Celsius (`Cel`) using `(F - 32) * 5/9`.
  - *Reference test:* `98.6 °F` -> `37.0 °C`.
- **Weight**: Pounds (`[lb_av]`) is converted to Kilograms (`kg`) using exact UCUM factor `0.45359237`.
  - *Reference test:* `150 lbs` -> `68.0389 kg`.
- **Blood Glucose**: `mg/dL` is converted to `mmol/L` using factor `18.0182`.
  - *Reference test:* `180 mg/dL` -> `9.9899 mmol/L`.
- **Rates**: `bpm`, `beats/min`, `breaths/min` normalize to UCUM `/min`.

---

## 4. References & Standards Compliance

- **LOINC Standard**: [https://loinc.org](https://loinc.org)
- **UCUM Standard**: [https://unitsofmeasure.org](https://unitsofmeasure.org)
- **HL7 FHIR Observation Resource**: [http://hl7.org/fhir/observation.html](http://hl7.org/fhir/observation.html)
- **US Core Vital Signs Profile**: [http://hl7.org/fhir/us/core/StructureDefinition-us-core-vital-signs.html](http://hl7.org/fhir/us/core/StructureDefinition-us-core-vital-signs.html)
