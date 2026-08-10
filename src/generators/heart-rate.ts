/**
 * Heart Rate Observation Generator.
 */

import { DeviceReading, FhirObservation, GeneratorConfig } from "../types.js";
import { LOINC_MAP, LOINC_SYSTEM, UCUM_SYSTEM, formatCategory } from "../loinc-map.js";
import { convertUnit } from "../units.js";
import { validateObservation } from "../validate.js";

export function heartRateToObservation(
  reading: DeviceReading,
  config?: GeneratorConfig
): FhirObservation {
  if (reading.deviceType !== "heart-rate") {
    throw new Error(`Invalid deviceType for heart rate generator: expected 'heart-rate', got '${reading.deviceType}'`);
  }

  if (typeof reading.value !== "number") {
    throw new Error(`Invalid heart rate value: expected number, got ${typeof reading.value}`);
  }

  const mapping = LOINC_MAP["heart-rate"];
  const targetUnit = config?.targetUnit || mapping.defaultUcumUnit;
  const conv = convertUnit(reading.value, reading.unit, targetUnit);

  const observation: FhirObservation = {
    resourceType: "Observation",
    status: config?.status || "final",
    category: formatCategory(mapping.category),
    code: {
      coding: [
        {
          system: LOINC_SYSTEM,
          code: mapping.loincCode,
          display: mapping.display,
        },
      ],
      text: mapping.display,
    },
    subject: {
      reference: reading.patientRef,
    },
    effectiveDateTime: reading.timestamp,
    ...(reading.deviceId ? { device: { reference: reading.deviceId } } : {}),
    valueQuantity: {
      value: conv.value,
      unit: conv.unit,
      system: UCUM_SYSTEM,
      code: conv.ucumCode,
    },
  };

  if (config?.validate) {
    const result = validateObservation(observation);
    if (!result.valid) {
      throw new Error(`Structural validation failed for heart rate observation: ${result.errors.join(", ")}`);
    }
  }

  return observation;
}
