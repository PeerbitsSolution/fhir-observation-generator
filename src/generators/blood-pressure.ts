/**
 * Blood Pressure Observation Generator.
 *
 * Grounded in FHIR R4 and US Core Blood Pressure Profile:
 * Produces EXACTLY ONE Observation resource with systolic and diastolic
 * represented as component elements within the same Observation, NEVER as two separate Observations.
 */

import {
  DeviceReading,
  BloodPressureValue,
  FhirObservation,
  GeneratorConfig,
} from "../types.js";
import {
  LOINC_MAP,
  LOINC_BP_SYSTOLIC,
  LOINC_BP_DIASTOLIC,
  LOINC_SYSTEM,
  UCUM_SYSTEM,
  formatCategory,
} from "../loinc-map.js";
import { convertUnit } from "../units.js";
import { validateObservation } from "../validate.js";

export function bloodPressureToObservation(
  reading: DeviceReading,
  config?: GeneratorConfig
): FhirObservation {
  if (reading.deviceType !== "blood-pressure") {
    throw new Error(
      `Invalid deviceType for blood pressure generator: expected 'blood-pressure', got '${reading.deviceType}'`
    );
  }

  let systolic: number;
  let diastolic: number;

  if (
    typeof reading.value === "object" &&
    reading.value !== null &&
    "systolic" in reading.value &&
    "diastolic" in reading.value
  ) {
    const bpVal = reading.value as BloodPressureValue;
    systolic = bpVal.systolic;
    diastolic = bpVal.diastolic;
  } else if (typeof reading.value === "string") {
    const parts = (reading.value as string).split("/");
    if (parts.length === 2 && !isNaN(Number(parts[0])) && !isNaN(Number(parts[1]))) {
      systolic = Number(parts[0]);
      diastolic = Number(parts[1]);
    } else {
      throw new Error(`Invalid blood pressure reading string format: '${reading.value}'. Expected '120/80'.`);
    }
  } else {
    throw new Error(
      `Invalid blood pressure value structure. Expected { systolic: number, diastolic: number }, got ${JSON.stringify(
        reading.value
      )}`
    );
  }

  const mapping = LOINC_MAP["blood-pressure"];
  const targetUnit = config?.targetUnit || mapping.defaultUcumUnit;

  const systolicConv = convertUnit(systolic, reading.unit, targetUnit);
  const diastolicConv = convertUnit(diastolic, reading.unit, targetUnit);

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
    component: [
      {
        code: {
          coding: [
            {
              system: LOINC_SYSTEM,
              code: LOINC_BP_SYSTOLIC.loincCode,
              display: LOINC_BP_SYSTOLIC.display,
            },
          ],
          text: LOINC_BP_SYSTOLIC.display,
        },
        valueQuantity: {
          value: systolicConv.value,
          unit: systolicConv.unit,
          system: UCUM_SYSTEM,
          code: systolicConv.ucumCode,
        },
      },
      {
        code: {
          coding: [
            {
              system: LOINC_SYSTEM,
              code: LOINC_BP_DIASTOLIC.loincCode,
              display: LOINC_BP_DIASTOLIC.display,
            },
          ],
          text: LOINC_BP_DIASTOLIC.display,
        },
        valueQuantity: {
          value: diastolicConv.value,
          unit: diastolicConv.unit,
          system: UCUM_SYSTEM,
          code: diastolicConv.ucumCode,
        },
      },
    ],
  };

  if (config?.validate) {
    const result = validateObservation(observation);
    if (!result.valid) {
      throw new Error(`Structural validation failed for blood pressure observation: ${result.errors.join(", ")}`);
    }
  }

  return observation;
}
