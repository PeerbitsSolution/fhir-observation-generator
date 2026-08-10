/**
 * Single source of truth mapping each deviceType to its official LOINC code,
 * display text, FHIR Observation category, and standard UCUM target unit.
 *
 * Grounded in the official LOINC database (loinc.org) and US Core Vital Signs Profile.
 */

import { DeviceType, FhirCodeableConcept } from "./types.js";

export interface LoincMapping {
  deviceType: DeviceType;
  loincCode: string;
  display: string;
  category: {
    system: string;
    code: string;
    display: string;
  };
  defaultUcumUnit: string;
  defaultUnitDisplay: string;
}

export interface ComponentLoincMapping {
  loincCode: string;
  display: string;
  ucumUnit: string;
  unitDisplay: string;
}

export const VITAL_SIGNS_CATEGORY = {
  system: "http://terminology.hl7.org/CodeSystem/observation-category",
  code: "vital-signs",
  display: "Vital Signs",
};

export const LOINC_SYSTEM = "http://loinc.org";
export const UCUM_SYSTEM = "http://unitsofmeasure.org";

export const LOINC_MAP: Record<DeviceType, LoincMapping> = {
  "blood-pressure": {
    deviceType: "blood-pressure",
    loincCode: "85354-9",
    display: "Blood pressure panel with all children optional",
    category: VITAL_SIGNS_CATEGORY,
    defaultUcumUnit: "mm[Hg]",
    defaultUnitDisplay: "mmHg",
  },
  "heart-rate": {
    deviceType: "heart-rate",
    loincCode: "8867-4",
    display: "Heart rate",
    category: VITAL_SIGNS_CATEGORY,
    defaultUcumUnit: "/min",
    defaultUnitDisplay: "beats/min",
  },
  weight: {
    deviceType: "weight",
    loincCode: "29463-7",
    display: "Body weight",
    category: VITAL_SIGNS_CATEGORY,
    defaultUcumUnit: "kg",
    defaultUnitDisplay: "kg",
  },
  spo2: {
    deviceType: "spo2",
    loincCode: "59408-5",
    display: "Oxygen saturation in Arterial blood by Pulse oximetry",
    category: VITAL_SIGNS_CATEGORY,
    defaultUcumUnit: "%",
    defaultUnitDisplay: "%",
  },
  temperature: {
    deviceType: "temperature",
    loincCode: "8310-5",
    display: "Body temperature",
    category: VITAL_SIGNS_CATEGORY,
    defaultUcumUnit: "Cel",
    defaultUnitDisplay: "°C",
  },
  glucose: {
    deviceType: "glucose",
    loincCode: "2339-0",
    display: "Glucose [Mass/volume] in Blood",
    category: VITAL_SIGNS_CATEGORY,
    defaultUcumUnit: "mg/dL",
    defaultUnitDisplay: "mg/dL",
  },
  "respiratory-rate": {
    deviceType: "respiratory-rate",
    loincCode: "9279-1",
    display: "Respiratory rate",
    category: VITAL_SIGNS_CATEGORY,
    defaultUcumUnit: "/min",
    defaultUnitDisplay: "breaths/min",
  },
};

/**
 * Component LOINC mappings for blood pressure components.
 */
export const LOINC_BP_SYSTOLIC: ComponentLoincMapping = {
  loincCode: "8480-6",
  display: "Systolic blood pressure",
  ucumUnit: "mm[Hg]",
  unitDisplay: "mmHg",
};

export const LOINC_BP_DIASTOLIC: ComponentLoincMapping = {
  loincCode: "8462-4",
  display: "Diastolic blood pressure",
  ucumUnit: "mm[Hg]",
  unitDisplay: "mmHg",
};

/**
 * Helper function to retrieve LOINC mapping for a deviceType.
 */
export function getLoincMapping(deviceType: DeviceType): LoincMapping {
  const mapping = LOINC_MAP[deviceType];
  if (!mapping) {
    throw new Error(`No LOINC mapping found for deviceType: ${deviceType}`);
  }
  return mapping;
}

/**
 * Formats a Category object into a FHIR CodeableConcept array.
 */
export function formatCategory(category: { system: string; code: string; display: string }): FhirCodeableConcept[] {
  return [
    {
      coding: [
        {
          system: category.system,
          code: category.code,
          display: category.display,
        },
      ],
    },
  ];
}
