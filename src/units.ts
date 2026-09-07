/**
 * Standard UCUM unit conversions for @peerbits/fhir-observation-generator.
 *
 * All formulas use exact standard UCUM conversion factors.
 * Reference unit conversions are verified against clinical standards.
 */

export interface UnitConversionResult {
  value: number;
  unit: string;
  ucumCode: string;
}


const SUPPORTED_UCUM_UNITS = new Set([
  "[degF]",
  "Cel",
  "[lb_av]",
  "kg",
  "g",
  "[oz_av]",
  "mg/dL",
  "mmol/L",
  "/min",
  "%",
  "mm[Hg]",
  "ms",
  "s",
  "min",
  "h",
  "L",
  "mL",
  "L/min",
  "kg/m2",
  "1",
]);

/**
 * Normalizes input unit strings into standard UCUM unit codes.
 */
export function normalizeUcumUnit(unit: string): string {
  const clean = unit.trim().toLowerCase();
  switch (clean) {
    // Temperature
    case "degf":
    case "°f":
    case "f":
    case "[degf]":
    case "fahrenheit":
      return "[degF]";
    case "degc":
    case "°c":
    case "c":
    case "cel":
    case "[degc]":
    case "celsius":
      return "Cel";

    // Weight
    case "lb":
    case "lbs":
    case "[lb_av]":
    case "pound":
    case "pounds":
      return "[lb_av]";
    case "kg":
    case "kilogram":
    case "kilograms":
      return "kg";
    case "g":
    case "gram":
    case "grams":
      return "g";
    case "oz":
    case "ounce":
    case "ounces":
    case "[oz_av]":
      return "[oz_av]";

    // Glucose
    case "mg/dl":
    case "mg/dL":
      return "mg/dL";
    case "mmol/l":
    case "mmol/L":
      return "mmol/L";

    // Rate / frequency
    case "bpm":
    case "beats/min":
    case "breaths/min":
    case "count/min":
    case "/min":
    case "1/min":
      return "/min";

    // Percentage / SpO2
    case "%":
    case "percent":
      return "%";

    // Pressure
    case "mmhg":
    case "mm[hg]":
    case "mm hg":
      return "mm[Hg]";

    case "ms": return "ms";
    case "s": case "sec": case "second": case "seconds": return "s";
    case "min": case "minute": case "minutes": return "min";
    case "h": case "hr": case "hour": case "hours": return "h";
    case "l": case "liter": case "liters": case "litre": case "litres": return "L";
    case "ml": case "milliliter": case "milliliters": case "millilitre": case "millilitres": return "mL";
    case "l/min": return "L/min";
    case "kg/m2": case "kg/m^2": return "kg/m2";
    case "1": case "ratio": return "1";

    default:
      return unit;
  }
}

/**
 * Gets human-readable display string for a UCUM unit code.
 */
export function getUnitDisplay(ucumCode: string): string {
  switch (ucumCode) {
    case "[degF]":
      return "°F";
    case "Cel":
      return "°C";
    case "[lb_av]":
      return "lbs";
    case "kg":
      return "kg";
    case "g":
      return "g";
    case "[oz_av]":
      return "oz";
    case "mg/dL":
      return "mg/dL";
    case "mmol/L":
      return "mmol/L";
    case "/min":
      return "beats/min";
    case "%":
      return "%";
    case "mm[Hg]":
      return "mmHg";
    default:
      return ucumCode;
  }
}

/**
 * Converts a numeric value from source unit to target unit.
 * If units are identical, returns value unchanged.
 * If targetUnit is not provided, defaults to standard UCUM unit or source unit.
 */
export function convertUnit(
  value: number,
  fromUnit: string,
  targetUnit?: string
): UnitConversionResult {
  if (!Number.isFinite(value)) {
    throw new Error("Invalid measurement value: expected a finite number");
  }
  if (typeof fromUnit !== "string" || !fromUnit.trim()) {
    throw new Error("Invalid source unit: expected a non-empty string");
  }
  if (targetUnit !== undefined && (typeof targetUnit !== "string" || !targetUnit.trim())) {
    throw new Error("Invalid target unit: expected a non-empty string");
  }

  const sourceUcum = normalizeUcumUnit(fromUnit);
  const targetUcum = targetUnit ? normalizeUcumUnit(targetUnit) : sourceUcum;

  if (!SUPPORTED_UCUM_UNITS.has(sourceUcum)) {
    throw new Error(`Unsupported source unit: '${fromUnit}'`);
  }
  if (!SUPPORTED_UCUM_UNITS.has(targetUcum)) {
    throw new Error(`Unsupported target unit: '${targetUnit}'`);
  }

  if (sourceUcum === targetUcum) {
    return {
      value: roundToFourDecimals(value),
      unit: getUnitDisplay(targetUcum),
      ucumCode: targetUcum,
    };
  }

  const durationInSeconds: Readonly<Record<string, number>> = { ms: 0.001, s: 1, min: 60, h: 3600 };
  if (sourceUcum in durationInSeconds && targetUcum in durationInSeconds) {
    const converted = value * durationInSeconds[sourceUcum] / durationInSeconds[targetUcum];
    return { value: roundToFourDecimals(converted), unit: getUnitDisplay(targetUcum), ucumCode: targetUcum };
  }
  if (sourceUcum === "mL" && targetUcum === "L") {
    return { value: roundToFourDecimals(value / 1000), unit: "L", ucumCode: "L" };
  }
  if (sourceUcum === "L" && targetUcum === "mL") {
    return { value: roundToFourDecimals(value * 1000), unit: "mL", ucumCode: "mL" };
  }

  // Temperature Conversions
  if (sourceUcum === "[degF]" && targetUcum === "Cel") {
    const converted = ((value - 32) * 5) / 9;
    return {
      value: roundToFourDecimals(converted),
      unit: "°C",
      ucumCode: "Cel",
    };
  }
  if (sourceUcum === "Cel" && targetUcum === "[degF]") {
    const converted = (value * 9) / 5 + 32;
    return {
      value: roundToFourDecimals(converted),
      unit: "°F",
      ucumCode: "[degF]",
    };
  }

  // Weight Conversions (1 lb = 0.45359237 kg exact UCUM definition)
  if (sourceUcum === "[lb_av]" && targetUcum === "kg") {
    const converted = value * 0.45359237;
    return {
      value: roundToFourDecimals(converted),
      unit: "kg",
      ucumCode: "kg",
    };
  }
  if (sourceUcum === "kg" && targetUcum === "[lb_av]") {
    const converted = value / 0.45359237;
    return {
      value: roundToFourDecimals(converted),
      unit: "lbs",
      ucumCode: "[lb_av]",
    };
  }
  if (sourceUcum === "g" && targetUcum === "kg") {
    const converted = value / 1000;
    return {
      value: roundToFourDecimals(converted),
      unit: "kg",
      ucumCode: "kg",
    };
  }
  if (sourceUcum === "[oz_av]" && targetUcum === "kg") {
    const converted = value * 0.028349523125;
    return {
      value: roundToFourDecimals(converted),
      unit: "kg",
      ucumCode: "kg",
    };
  }

  // Glucose Conversions (18.0182 mg/dL per mmol/L based on glucose molar mass 180.156 g/mol)
  if (sourceUcum === "mg/dL" && targetUcum === "mmol/L") {
    const converted = value / 18.0182;
    return {
      value: roundToFourDecimals(converted),
      unit: "mmol/L",
      ucumCode: "mmol/L",
    };
  }
  if (sourceUcum === "mmol/L" && targetUcum === "mg/dL") {
    const converted = value * 18.0182;
    return {
      value: roundToFourDecimals(converted),
      unit: "mg/dL",
      ucumCode: "mg/dL",
    };
  }

  throw new Error(`Unsupported unit conversion: '${fromUnit}' to '${targetUnit}'`);
}

/**
 * Rounds numbers to 4 decimal places to prevent floating point noise (e.g. 37.00000000000001).
 */
function roundToFourDecimals(num: number): number {
  return Math.round(num * 10000) / 10000;
}
