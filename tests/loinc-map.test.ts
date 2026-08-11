import { describe, it, expect } from "vitest";
import {
  LOINC_MAP,
  SUPPORTED_DEVICE_TYPES,
  getLoincMapping,
  DeviceType,
} from "../src/index.js";

describe("@peerbits/fhir-observation-generator: LOINC mapping completeness", () => {
  it("every supported deviceType in SUPPORTED_DEVICE_TYPES has a LOINC mapping entry", () => {
    for (const deviceType of SUPPORTED_DEVICE_TYPES) {
      const mapping = LOINC_MAP[deviceType];
      expect(mapping).toBeDefined();
      expect(mapping.deviceType).toBe(deviceType);
      expect(mapping.loincCode).toBeTruthy();
      expect(mapping.display).toBeTruthy();
      expect(mapping.category).toBeDefined();
      expect(mapping.category.code).toBe("vital-signs");
    }
  });

  it("getLoincMapping returns correct mapping for each deviceType", () => {
    for (const deviceType of SUPPORTED_DEVICE_TYPES) {
      const mapping = getLoincMapping(deviceType);
      expect(mapping).toBeDefined();
      expect(mapping.deviceType).toBe(deviceType);
    }
  });

  it("throws error when getting mapping for unknown deviceType", () => {
    expect(() => getLoincMapping("invalid-type" as DeviceType)).toThrow("No LOINC mapping found");
  });
});
