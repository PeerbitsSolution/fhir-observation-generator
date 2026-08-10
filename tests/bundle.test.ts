import { describe, it, expect } from "vitest";
import { readingsToBundle, DeviceReading } from "../src/index.js";

import bpFixture from "../fixtures/valid/blood-pressure.json";
import hrFixture from "../fixtures/valid/heart-rate.json";
import weightFixture from "../fixtures/valid/weight.json";
import tempFixture from "../fixtures/valid/temperature.json";

describe("fhir-observation-generator: bundle generation", () => {
  it("readingsToBundle produces a valid transaction Bundle from mixed readings", () => {
    const readings: DeviceReading[] = [
      bpFixture as DeviceReading,
      hrFixture as DeviceReading,
      weightFixture as DeviceReading,
      tempFixture as DeviceReading,
    ];

    const bundle = readingsToBundle(readings, { validate: true });

    expect(bundle.resourceType).toBe("Bundle");
    expect(bundle.type).toBe("transaction");
    expect(bundle.entry).toHaveLength(4);

    // Verify each entry shape
    for (let i = 0; i < readings.length; i++) {
      const entry = bundle.entry[i];
      expect(entry.resource).toBeDefined();
      expect(entry.resource.resourceType).toBe("Observation");
      expect(entry.request.method).toBe("POST");
      expect(entry.request.url).toBe("Observation");
    }

    // Verify BP entry specifically
    const bpEntry = bundle.entry[0].resource;
    expect(bpEntry.code.coding[0].code).toBe("85354-9");
    expect(bpEntry.component).toHaveLength(2);

    // Verify Temp entry conversion
    const tempEntry = bundle.entry[3].resource;
    expect(tempEntry.valueQuantity?.value).toBe(37);
    expect(tempEntry.valueQuantity?.code).toBe("Cel");
  });

  it("throws error for non-array input", () => {
    expect(() => readingsToBundle("not an array" as unknown as DeviceReading[])).toThrow("expected array");
  });
});
