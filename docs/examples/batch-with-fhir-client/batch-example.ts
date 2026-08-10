import { readingsToBundle, DeviceReading } from "../../../src/index.js";

// Batch array of RPM device readings collected from various home monitoring devices
const rpmReadingsBatch: DeviceReading[] = [
  {
    deviceType: "blood-pressure",
    value: { systolic: 124, diastolic: 82 },
    unit: "mmHg",
    timestamp: "2026-08-06T08:00:00Z",
    patientRef: "Patient/pat-rpm-200",
    deviceId: "Device/bp-cuff-11",
  },
  {
    deviceType: "heart-rate",
    value: 78,
    unit: "bpm",
    timestamp: "2026-08-06T08:01:00Z",
    patientRef: "Patient/pat-rpm-200",
  },
  {
    deviceType: "weight",
    value: 165.5,
    unit: "lbs",
    timestamp: "2026-08-06T08:02:00Z",
    patientRef: "Patient/pat-rpm-200",
  },
  {
    deviceType: "glucose",
    value: 105,
    unit: "mg/dL",
    timestamp: "2026-08-06T08:15:00Z",
    patientRef: "Patient/pat-rpm-200",
  },
];

// Generate FHIR R4 transaction Bundle
const fhirTransactionBundle = readingsToBundle(rpmReadingsBatch, { validate: true });

console.log("Generated Transaction Bundle for fhir-client:");
console.log(JSON.stringify(fhirTransactionBundle, null, 2));

// How to submit using fhir-client (Repo 2):
// import { FhirClient } from "fhir-client";
// const client = new FhirClient({ baseUrl: "https://fhir.example.com/r4" });
// const response = await client.transaction(fhirTransactionBundle);
// console.log("Transaction bundle submitted successfully:", response);
