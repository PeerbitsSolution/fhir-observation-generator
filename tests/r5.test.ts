import { describe, expect, it } from "vitest";
import {
  DeviceReading,
  FhirR5Observation,
  readingsToR5Bundle,
  toR5Observation,
  validateR5Observation,
} from "../src/index.js";

import bpFixture from "../fixtures/valid/blood-pressure.json";
import hrFixture from "../fixtures/valid/heart-rate.json";

describe("fhir-observation-generator: FHIR R5 APIs", () => {
  it("generates an R5-typed vital-sign Observation using R5-compatible fields", () => {
    const observation: FhirR5Observation = toR5Observation(hrFixture as DeviceReading, { validate: true });

    expect(observation.resourceType).toBe("Observation");
    expect(observation.status).toBe("final");
    expect(observation.subject.reference).toBe("Patient/pat-rpm-101");
    expect(observation.effectiveDateTime).toBe("2026-08-06T08:31:00Z");
    expect(observation.code.coding[0]).toMatchObject({
      system: "http://loinc.org",
      code: "8867-4",
    });
    expect(observation.valueQuantity).toMatchObject({
      value: 72,
      system: "http://unitsofmeasure.org",
      code: "/min",
    });
    expect(validateR5Observation(observation)).toEqual({ valid: true, errors: [] });
  });

  it("creates an R5 transaction Bundle with R5 Observations", () => {
    const bundle = readingsToR5Bundle([bpFixture, hrFixture] as DeviceReading[], { validate: true });

    expect(bundle).toMatchObject({
      resourceType: "Bundle",
      type: "transaction",
    });
    expect(bundle.entry).toHaveLength(2);
    expect(bundle.entry[0].resource.component).toHaveLength(2);
    expect(bundle.entry.every((entry) => entry.request.url === "Observation")).toBe(true);
  });

  it("rejects non-array input to the R5 Bundle generator", () => {
    expect(() => readingsToR5Bundle("not an array" as unknown as DeviceReading[])).toThrow("expected array");
  });
});
