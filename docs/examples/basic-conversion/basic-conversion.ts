import { toObservation, DeviceReading } from "../../../src/index.js";

// Example 1: Blood Pressure device reading (component-based Observation)
const bpReading: DeviceReading = {
  deviceType: "blood-pressure",
  value: {
    systolic: 120,
    diastolic: 80,
  },
  unit: "mmHg",
  timestamp: "2026-08-06T09:00:00Z",
  patientRef: "Patient/pat-1001",
  deviceId: "Device/bp-mon-500",
};

const bpObservation = toObservation(bpReading, { validate: true });
console.log("Generated Blood Pressure FHIR Observation:");
console.log(JSON.stringify(bpObservation, null, 2));

// Example 2: Temperature device reading (converted from Fahrenheit to Celsius)
const tempReading: DeviceReading = {
  deviceType: "temperature",
  value: 98.6,
  unit: "degF",
  timestamp: "2026-08-06T09:05:00Z",
  patientRef: "Patient/pat-1001",
};

const tempObservation = toObservation(tempReading, { validate: true });
console.log("\nGenerated Temperature FHIR Observation (UCUM Cel converted):");
console.log(JSON.stringify(tempObservation, null, 2));
