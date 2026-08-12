/**
 * Structural self-check for generated FHIR Observation resources.
 *
 * Verifies generated vital-sign fields shared by the FHIR R4 and R5 Observation
 * specifications and US Core Vital Signs Profile requirements:
 * - resourceType: "Observation"
 * - status
 * - category (containing vital-signs coding)
 * - code (containing LOINC coding)
 * - subject.reference
 * - effectiveDateTime
 * - valueQuantity OR component array (with valid values)
 */

import { FhirObservation, FhirR5Observation, ValidationResult } from "./types.js";
import { LOINC_SYSTEM } from "./loinc-map.js";

export function validateObservation(observation: FhirObservation): ValidationResult {
  const errors: string[] = [];

  if (!observation) {
    return { valid: false, errors: ["Observation is null or undefined"] };
  }

  if (observation.resourceType !== "Observation") {
    errors.push(`Invalid resourceType: expected 'Observation', got '${observation.resourceType}'`);
  }

  if (!observation.status) {
    errors.push("Missing required field: status");
  }

  if (!Array.isArray(observation.category) || observation.category.length === 0) {
    errors.push("Missing required field: category (must be non-empty array)");
  } else {
    const hasVitalSignsCategory = observation.category.some((cat) =>
      cat.coding?.some((c) => c.code === "vital-signs")
    );
    if (!hasVitalSignsCategory) {
      errors.push("Missing required category coding with code 'vital-signs'");
    }
  }

  if (!observation.code || !Array.isArray(observation.code.coding) || observation.code.coding.length === 0) {
    errors.push("Missing required field: code (must contain coding array)");
  } else {
    const hasLoincCoding = observation.code.coding.some(
      (c) => c.system === LOINC_SYSTEM && c.code && c.code.length > 0
    );
    if (!hasLoincCoding) {
      errors.push(`Missing valid LOINC coding under system '${LOINC_SYSTEM}' in code field`);
    }
  }

  if (!observation.subject || typeof observation.subject.reference !== "string" || !observation.subject.reference.trim()) {
    errors.push("Missing required field: subject.reference");
  }

  if (!observation.effectiveDateTime || isNaN(Date.parse(observation.effectiveDateTime))) {
    errors.push("Missing or invalid required field: effectiveDateTime (must be valid ISO date string)");
  }

  // Value check: Must have valueQuantity OR component array
  const hasValueQuantity =
    observation.valueQuantity &&
    typeof observation.valueQuantity.value === "number" &&
    Number.isFinite(observation.valueQuantity.value) &&
    typeof observation.valueQuantity.unit === "string";

  const hasComponents =
    Array.isArray(observation.component) &&
    observation.component.length >= 2 &&
    observation.component.every(
      (comp) =>
        comp.code &&
        Array.isArray(comp.code.coding) &&
        comp.valueQuantity &&
        typeof comp.valueQuantity.value === "number" &&
        Number.isFinite(comp.valueQuantity.value)
    );

  if (!hasValueQuantity && !hasComponents) {
    errors.push(
      "Observation must contain either a valid valueQuantity or a valid component array with at least 2 components"
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates the vital-sign subset emitted by this package for FHIR R5.
 *
 * The generated fields have the same shape in R4 and R5. This explicit entry
 * point lets consumers validate R5 output without relying on the legacy R4 API.
 */
export function validateR5Observation(observation: FhirR5Observation): ValidationResult {
  return validateObservation(observation);
}
