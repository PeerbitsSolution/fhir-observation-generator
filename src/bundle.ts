/**
 * Batch / Bundle Generator for @peerbits/fhir-observation-generator.
 *
 * Converts an array of DeviceReading objects into a FHIR R4 transaction Bundle.
 * Formatted for direct execution with @peerbits/fhir-client's batch/transaction builder.
 */

import { DeviceReading, FhirBundle, GeneratorConfig } from "./types.js";
import { toObservation } from "./generators/index.js";

export function readingsToBundle(
  readings: DeviceReading[],
  config?: GeneratorConfig
): FhirBundle {
  if (!Array.isArray(readings)) {
    throw new Error("Invalid input to readingsToBundle: expected array of DeviceReading objects");
  }

  const entries = readings.map((reading) => {
    const observation = toObservation(reading, config);
    return {
      resource: observation,
      request: {
        method: "POST" as const,
        url: "Observation",
      },
    };
  });

  return {
    resourceType: "Bundle",
    type: "transaction",
    entry: entries,
  };
}
