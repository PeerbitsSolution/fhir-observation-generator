import { describe, it, expect } from "vitest";
import { convertUnit, normalizeUcumUnit } from "../src/index.js";

describe("fhir-observation-generator: unit conversion", () => {
  describe("Temperature reference conversions", () => {
    it("converts 98.6°F to exactly 37°C", () => {
      const res = convertUnit(98.6, "degF", "Cel");
      expect(res.value).toBe(37);
      expect(res.ucumCode).toBe("Cel");
      expect(res.unit).toBe("°C");
    });

    it("converts 37°C to 98.6°F", () => {
      const res = convertUnit(37, "Cel", "degF");
      expect(res.value).toBe(98.6);
      expect(res.ucumCode).toBe("[degF]");
      expect(res.unit).toBe("°F");
    });
  });

  describe("Weight reference conversions", () => {
    it("converts 150 lbs to exactly 68.0389 kg", () => {
      const res = convertUnit(150, "lbs", "kg");
      expect(res.value).toBe(68.0389);
      expect(res.ucumCode).toBe("kg");
      expect(res.unit).toBe("kg");
    });

    it("converts 68.0388555 kg to 150 lbs", () => {
      const res = convertUnit(68.0388555, "kg", "[lb_av]");
      expect(res.value).toBe(150);
      expect(res.ucumCode).toBe("[lb_av]");
      expect(res.unit).toBe("lbs");
    });

    it("converts 1000 g to 1 kg", () => {
      const res = convertUnit(1000, "g", "kg");
      expect(res.value).toBe(1);
      expect(res.ucumCode).toBe("kg");
    });
  });

  describe("Glucose reference conversions", () => {
    it("converts 180 mg/dL to 9.9899 mmol/L", () => {
      const res = convertUnit(180, "mg/dL", "mmol/L");
      expect(res.value).toBe(9.9899);
      expect(res.ucumCode).toBe("mmol/L");
      expect(res.unit).toBe("mmol/L");
    });

    it("converts 10 mmol/L to 180.182 mg/dL", () => {
      const res = convertUnit(10, "mmol/L", "mg/dL");
      expect(res.value).toBe(180.182);
      expect(res.ucumCode).toBe("mg/dL");
      expect(res.unit).toBe("mg/dL");
    });
  });

  describe("Unit normalization", () => {
    it("normalizes common unit variations into standard UCUM codes", () => {
      expect(normalizeUcumUnit("bpm")).toBe("/min");
      expect(normalizeUcumUnit("beats/min")).toBe("/min");
      expect(normalizeUcumUnit("breaths/min")).toBe("/min");
      expect(normalizeUcumUnit("mmHg")).toBe("mm[Hg]");
      expect(normalizeUcumUnit("fahrenheit")).toBe("[degF]");
      expect(normalizeUcumUnit("percent")).toBe("%");
    });
  });

  describe("Invalid conversions", () => {
    it("rejects unsupported source units instead of relabeling the value", () => {
      expect(() => convertUnit(16, "kPa", "mmHg")).toThrow("Unsupported source unit");
      expect(() => convertUnit(1000, "stone", "kg")).toThrow("Unsupported source unit");
    });

    it("rejects unsupported conversions between different measurement types", () => {
      expect(() => convertUnit(70, "kg", "Cel")).toThrow("Unsupported unit conversion");
    });

    it("rejects non-finite values", () => {
      expect(() => convertUnit(Number.NaN, "kg", "kg")).toThrow("finite number");
      expect(() => convertUnit(Number.POSITIVE_INFINITY, "kg", "kg")).toThrow("finite number");
    });
  });
});
