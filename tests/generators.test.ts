import { describe, it, expect } from "vitest";
import {
  bloodPressureToObservation,
  heartRateToObservation,
  weightToObservation,
  spo2ToObservation,
  temperatureToObservation,
  glucoseToObservation,
  respiratoryRateToObservation,
  toObservation,
  DeviceReading,
} from "../src/index.js";

// Load synthetic test fixtures
import bpFixture from "../fixtures/valid/blood-pressure.json";
import hrFixture from "../fixtures/valid/heart-rate.json";
import weightFixture from "../fixtures/valid/weight.json";
import spo2Fixture from "../fixtures/valid/spo2.json";
import tempFixture from "../fixtures/valid/temperature.json";
import glucoseFixture from "../fixtures/valid/glucose.json";
import respFixture from "../fixtures/valid/respiratory-rate.json";

describe("fhir-observation-generator: per-vital generators", () => {
  it("blood pressure produces ONE Observation with two components (systolic and diastolic)", () => {
    const reading: DeviceReading = bpFixture as DeviceReading;
    const observation = bloodPressureToObservation(reading, { validate: true });

    // Assert top-level Observation structure
    expect(observation.resourceType).toBe("Observation");
    expect(observation.status).toBe("final");
    expect(observation.subject.reference).toBe("Patient/pat-rpm-101");
    expect(observation.effectiveDateTime).toBe("2026-08-06T08:30:00Z");

    // Top-level code must be BP panel LOINC 85354-9
    expect(observation.code.coding[0].system).toBe("http://loinc.org");
    expect(observation.code.coding[0].code).toBe("85354-9");

    // Must NOT have top-level valueQuantity
    expect(observation.valueQuantity).toBeUndefined();

    // MUST have component array with exactly 2 entries
    expect(observation.component).toBeDefined();
    expect(observation.component).toHaveLength(2);

    // Component 0: Systolic (LOINC 8480-6)
    const systolicComp = observation.component![0];
    expect(systolicComp.code.coding[0].code).toBe("8480-6");
    expect(systolicComp.valueQuantity?.value).toBe(120);
    expect(systolicComp.valueQuantity?.code).toBe("mm[Hg]");

    // Component 1: Diastolic (LOINC 8462-4)
    const diastolicComp = observation.component![1];
    expect(diastolicComp.code.coding[0].code).toBe("8462-4");
    expect(diastolicComp.valueQuantity?.value).toBe(80);
    expect(diastolicComp.valueQuantity?.code).toBe("mm[Hg]");
  });

  it("heart rate produces correctly-coded Observation with LOINC 8867-4", () => {
    const reading: DeviceReading = hrFixture as DeviceReading;
    const observation = heartRateToObservation(reading, { validate: true });

    expect(observation.resourceType).toBe("Observation");
    expect(observation.code.coding[0].code).toBe("8867-4");
    expect(observation.valueQuantity?.value).toBe(72);
    expect(observation.valueQuantity?.code).toBe("/min");
  });

  it("weight produces correctly-coded Observation with LOINC 29463-7 and converts lbs to kg", () => {
    const reading: DeviceReading = weightFixture as DeviceReading;
    const observation = weightToObservation(reading, { validate: true });

    expect(observation.resourceType).toBe("Observation");
    expect(observation.code.coding[0].code).toBe("29463-7");
    // 150 lbs -> 68.0389 kg
    expect(observation.valueQuantity?.value).toBe(68.0389);
    expect(observation.valueQuantity?.code).toBe("kg");
  });

  it("SpO2 produces correctly-coded Observation with LOINC 59408-5", () => {
    const reading: DeviceReading = spo2Fixture as DeviceReading;
    const observation = spo2ToObservation(reading, { validate: true });

    expect(observation.resourceType).toBe("Observation");
    expect(observation.code.coding[0].code).toBe("59408-5");
    expect(observation.valueQuantity?.value).toBe(98);
    expect(observation.valueQuantity?.code).toBe("%");
  });

  it("temperature produces correctly-coded Observation with LOINC 8310-5 and converts 98.6°F to 37°C", () => {
    const reading: DeviceReading = tempFixture as DeviceReading;
    const observation = temperatureToObservation(reading, { validate: true });

    expect(observation.resourceType).toBe("Observation");
    expect(observation.code.coding[0].code).toBe("8310-5");
    expect(observation.valueQuantity?.value).toBe(37);
    expect(observation.valueQuantity?.code).toBe("Cel");
  });

  it("glucose produces correctly-coded Observation with LOINC 2339-0", () => {
    const reading: DeviceReading = glucoseFixture as DeviceReading;
    const observation = glucoseToObservation(reading, { validate: true });

    expect(observation.resourceType).toBe("Observation");
    expect(observation.code.coding[0].code).toBe("2339-0");
    expect(observation.valueQuantity?.value).toBe(110);
    expect(observation.valueQuantity?.code).toBe("mg/dL");
  });

  it("respiratory rate produces correctly-coded Observation with LOINC 9279-1", () => {
    const reading: DeviceReading = respFixture as DeviceReading;
    const observation = respiratoryRateToObservation(reading, { validate: true });

    expect(observation.resourceType).toBe("Observation");
    expect(observation.code.coding[0].code).toBe("9279-1");
    expect(observation.valueQuantity?.value).toBe(16);
    expect(observation.valueQuantity?.code).toBe("/min");
  });

  it("toObservation generic dispatcher handles all 7 vital types", () => {
    const fixtures: DeviceReading[] = [
      bpFixture as DeviceReading,
      hrFixture as DeviceReading,
      weightFixture as DeviceReading,
      spo2Fixture as DeviceReading,
      tempFixture as DeviceReading,
      glucoseFixture as DeviceReading,
      respFixture as DeviceReading,
    ];

    for (const reading of fixtures) {
      const obs = toObservation(reading, { validate: true });
      expect(obs.resourceType).toBe("Observation");
      expect(obs.category[0].coding[0].code).toBe("vital-signs");
    }
  });

  it("throws error for unsupported deviceType in toObservation", () => {
    const invalidReading = {
      deviceType: "unknown-vital" as DeviceType,
      value: 100,
      unit: "unit",
      timestamp: "2026-08-06T10:00:00Z",
      patientRef: "Patient/p-1",
    };
    expect(() => toObservation(invalidReading)).toThrow("Unsupported deviceType");
  });

  it("rejects unsupported units instead of producing incorrectly labeled observations", () => {
    expect(() =>
      toObservation({
        deviceType: "blood-pressure",
        value: { systolic: 16, diastolic: 10 },
        unit: "kPa",
        timestamp: "2026-08-06T10:00:00Z",
        patientRef: "Patient/p-1",
      })
    ).toThrow("Unsupported source unit");
  });

  it("rejects non-finite measurement values", () => {
    expect(() =>
      toObservation({
        deviceType: "heart-rate",
        value: Number.NaN,
        unit: "bpm",
        timestamp: "2026-08-06T10:00:00Z",
        patientRef: "Patient/p-1",
      })
    ).toThrow("finite number");
  });
});
