# Changelog

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.0.0] - 2026-08-06

### Added
- Pure TypeScript implementation of FHIR R4 Observation resource generator from RPM device readings.
- Support for 7 core RPM vital types: Blood Pressure, Heart Rate, Body Weight, SpO2, Body Temperature, Blood Glucose, Respiratory Rate.
- Component-based Blood Pressure Observation generator with systolic (`8480-6`) and diastolic (`8462-4`) components under panel LOINC `85354-9`.
- Standard UCUM unit converter supporting Temperature, Weight, Glucose, and Rate conversions.
- Central LOINC mapping dictionary (`src/loinc-map.ts`) and detailed reference guide (`docs/LOINC_REFERENCE.md`).
- `readingsToBundle` transaction Bundle compiler composable with `fhir-client`.
- Structural self-check validation helper (`validateObservation`).
- Complete test suite with reference-value unit conversion and LOINC mapping completeness assertions.
- Code examples for basic conversion and batch transaction bundle execution with `fhir-client`.
