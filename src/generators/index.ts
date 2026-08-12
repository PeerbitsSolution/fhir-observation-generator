/**
 * Per-vital FHIR Observation generators index and generic dispatcher.
 */

import { DeviceReading, FhirObservation, FhirR5Observation, GeneratorConfig } from "../types.js";
import { bloodPressureToObservation } from "./blood-pressure.js";
import { heartRateToObservation } from "./heart-rate.js";
import { weightToObservation } from "./weight.js";
import { spo2ToObservation } from "./spo2.js";
import { temperatureToObservation } from "./temperature.js";
import { glucoseToObservation } from "./glucose.js";
import { respiratoryRateToObservation } from "./respiratory-rate.js";

export {
  bloodPressureToObservation,
  heartRateToObservation,
  weightToObservation,
  spo2ToObservation,
  temperatureToObservation,
  glucoseToObservation,
  respiratoryRateToObservation,
};

/**
 * Generic dispatcher that maps any supported DeviceReading to a FHIR Observation
 * based on reading.deviceType.
 */
export function toObservation(
  reading: DeviceReading,
  config?: GeneratorConfig
): FhirObservation {
  if (!reading || !reading.deviceType) {
    throw new Error("Invalid reading: deviceType property is required");
  }

  switch (reading.deviceType) {
    case "blood-pressure":
      return bloodPressureToObservation(reading, config);
    case "heart-rate":
      return heartRateToObservation(reading, config);
    case "weight":
      return weightToObservation(reading, config);
    case "spo2":
      return spo2ToObservation(reading, config);
    case "temperature":
      return temperatureToObservation(reading, config);
    case "glucose":
      return glucoseToObservation(reading, config);
    case "respiratory-rate":
      return respiratoryRateToObservation(reading, config);
    default:
      throw new Error(`Unsupported deviceType: '${(reading as DeviceReading).deviceType}'`);
  }
}

/**
 * Generates a FHIR R5 Observation for a device reading.
 *
 * The supported vital-sign elements are common to FHIR R4 and R5. This
 * explicit R5 entry point preserves the existing R4 API while providing an
 * R5-specific return type for R5 clients.
 */
export function toR5Observation(
  reading: DeviceReading,
  config?: GeneratorConfig
): FhirR5Observation {
  return toObservation(reading, config);
}
