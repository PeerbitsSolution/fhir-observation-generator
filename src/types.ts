/**
 * Device reading and FHIR Observation types for fhir-observation-generator.
 * Grounded in US Core Vital Signs Profile and FHIR R4 Observation resource specification.
 */

export type DeviceType =
  | "blood-pressure"
  | "heart-rate"
  | "weight"
  | "spo2"
  | "temperature"
  | "glucose"
  | "respiratory-rate";

export const SUPPORTED_DEVICE_TYPES: DeviceType[] = [
  "blood-pressure",
  "heart-rate",
  "weight",
  "spo2",
  "temperature",
  "glucose",
  "respiratory-rate",
];

export interface BloodPressureValue {
  systolic: number;
  diastolic: number;
}

export type DeviceReadingValue = number | BloodPressureValue;

export interface DeviceReading {
  /**
   * The vital type of the device reading.
   */
  deviceType: DeviceType;
  /**
   * Numeric reading value, or { systolic, diastolic } object for blood pressure.
   */
  value: DeviceReadingValue;
  /**
   * Unit of measurement as reported by the device (e.g. "degF", "lbs", "mmHg", "bpm", "%", "mg/dL").
   */
  unit: string;
  /**
   * Timestamp in ISO 8601 format (e.g. "2026-08-06T10:00:00Z").
   */
  timestamp: string;
  /**
   * Opaque reference to patient (e.g. "Patient/p-12345"). Never include real identifiers/PHI.
   */
  patientRef: string;
  /**
   * Optional opaque device identifier (e.g. "Device/d-98765").
   */
  deviceId?: string;
}

export interface GeneratorConfig {
  /**
   * Optional target unit to convert value into. If omitted, standard UCUM target unit is used.
   */
  targetUnit?: string;
  /**
   * Observation status. Defaults to "final".
   */
  status?: "registered" | "preliminary" | "final" | "amended" | "corrected" | "cancelled" | "entered-in-error" | "unknown";
  /**
   * If true, performs structural validation on the generated Observation before returning.
   * Throws Error if validation fails.
   */
  validate?: boolean;
}

// FHIR R4 Observation Resource Type Definitions

export interface FhirCoding {
  system: string;
  code: string;
  display?: string;
}

export interface FhirCodeableConcept {
  coding: FhirCoding[];
  text?: string;
}

export interface FhirQuantity {
  value: number;
  unit: string;
  system: string;
  code: string;
}

export interface FhirObservationComponent {
  code: FhirCodeableConcept;
  valueQuantity?: FhirQuantity;
}

export interface FhirObservation {
  resourceType: "Observation";
  id?: string;
  status: string;
  category: FhirCodeableConcept[];
  code: FhirCodeableConcept;
  subject: {
    reference: string;
  };
  effectiveDateTime: string;
  valueQuantity?: FhirQuantity;
  component?: FhirObservationComponent[];
  device?: {
    reference: string;
  };
}

export interface FhirBundleEntry {
  resource: FhirObservation;
  request: {
    method: "POST";
    url: string;
  };
}

export interface FhirBundle {
  resourceType: "Bundle";
  type: "transaction";
  entry: FhirBundleEntry[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}
