import type { DeviceReading, EcgValue, FhirCodeableConcept, FhirObservation, FhirObservationComponent, GeneratorConfig, MetricValue, SleepValue } from '../types.js';
import { formatCategory, getLoincMapping, LOINC_SYSTEM, UCUM_SYSTEM } from '../loinc-map.js';
import { convertUnit } from '../units.js';
import { validateObservation } from '../validate.js';

interface ComponentDefinition { code: string; display: string; unit: string; }

const COMPONENTS: Record<string, ComponentDefinition> = {
  weight: { code: '29463-7', display: 'Body weight', unit: 'kg' },
  bmi: { code: '39156-5', display: 'Body mass index', unit: 'kg/m2' },
  bodyFat: { code: '41982-0', display: 'Percentage of body fat measured', unit: '%' },
  fatMass: { code: '73708-0', display: 'Body fat mass calculated', unit: 'kg' },
  muscleMass: { code: '73964-9', display: 'Body muscle mass calculated', unit: 'kg' },
  boneMass: { code: '101685-6', display: 'Body bone mass', unit: 'kg' },
  fev1: { code: '20150-9', display: 'FEV1', unit: 'L' },
  fvc: { code: '19868-9', display: 'Forced vital capacity by spirometry', unit: 'L' },
  pef: { code: '33452-4', display: 'Peak expiratory flow', unit: 'L/min' },
  fev1FvcRatio: { code: '19926-5', display: 'FEV1/FVC', unit: '%' },
  deepSleep: { code: '93831-6', display: 'Deep sleep duration', unit: 'min' },
  lightSleep: { code: '93830-8', display: 'Light sleep duration', unit: 'min' },
  remSleep: { code: '93829-0', display: 'REM sleep duration', unit: 'min' },
  awakeTime: { code: '93828-2', display: 'Nighttime awakening duration', unit: 'min' },
};

function concept(code: string, display: string): FhirCodeableConcept {
  return { coding: [{ system: LOINC_SYSTEM, code, display }], text: display };
}

function base(reading: DeviceReading, config?: GeneratorConfig): FhirObservation {
  if (!reading.patientRef?.trim()) throw new Error('FHIR Observation generation requires patientRef.');
  if (!reading.timestamp || Number.isNaN(Date.parse(reading.timestamp))) throw new Error('FHIR Observation generation requires a valid timestamp.');
  const mapping = getLoincMapping(reading.deviceType);
  return {
    resourceType: 'Observation', status: config?.status ?? 'final', category: formatCategory(mapping.category),
    code: concept(mapping.loincCode, mapping.display), subject: { reference: reading.patientRef }, effectiveDateTime: reading.timestamp,
    ...(reading.deviceId ? { device: { reference: reading.deviceId } } : {}),
    ...(reading.waveformRef ? { derivedFrom: [{ reference: reading.waveformRef.reference }] } : {}),
  };
}

function checked(observation: FhirObservation, config?: GeneratorConfig): FhirObservation {
  if (config?.validate) {
    const result = validateObservation(observation);
    if (!result.valid) throw new Error(`Structural validation failed: ${result.errors.join(', ')}`);
  }
  return observation;
}

function metric(reading: DeviceReading, key: string, fallback?: number, fallbackUnit?: string): MetricValue | undefined {
  return reading.metrics?.[key] ?? (fallback === undefined || !fallbackUnit ? undefined : { value: fallback, unit: fallbackUnit });
}

function component(key: string, input: MetricValue): FhirObservationComponent {
  const definition = COMPONENTS[key];
  if (!definition) throw new Error(`No standard LOINC mapping for component '${key}'.`);
  const converted = convertUnit(input.value, input.unit, definition.unit);
  return { code: concept(definition.code, definition.display), valueQuantity: { value: converted.value, unit: converted.unit, system: UCUM_SYSTEM, code: converted.ucumCode } };
}

export function extendedScalarToObservation(reading: DeviceReading, config?: GeneratorConfig): FhirObservation {
  if (!['heart-rate-variability', 'perfusion-index'].includes(reading.deviceType) || typeof reading.value !== 'number') throw new Error(`Invalid scalar reading for '${reading.deviceType}'.`);
  if (reading.deviceType === 'heart-rate-variability' && reading.metadata?.hrvMethod !== 'sdnn') {
    throw new Error(`HRV generation requires metadata.hrvMethod='sdnn'; no safe default can be inferred.`);
  }
  if (reading.deviceType === 'perfusion-index' && reading.metadata?.measurementSite !== 'postductal') {
    throw new Error(`Perfusion-index generation requires metadata.measurementSite='postductal' for the default LOINC mapping.`);
  }
  const mapping = getLoincMapping(reading.deviceType);
  const converted = convertUnit(reading.value, reading.unit, config?.targetUnit ?? mapping.defaultUcumUnit);
  return checked({ ...base(reading, config), valueQuantity: { value: converted.value, unit: converted.unit, system: UCUM_SYSTEM, code: converted.ucumCode } }, config);
}

export function continuousGlucoseToObservation(reading: DeviceReading, config?: GeneratorConfig): FhirObservation {
  if (reading.deviceType !== 'continuous-glucose' || typeof reading.value !== 'object' || reading.value === null || !('glucose' in reading.value)) throw new Error('Invalid continuous-glucose reading.');
  const value = reading.value.glucose;
  if (typeof value !== 'number') throw new Error('Continuous glucose value must be numeric.');
  const converted = convertUnit(value, reading.unit, config?.targetUnit ?? 'mg/dL');
  return checked({ ...base(reading, config), valueQuantity: { value: converted.value, unit: converted.unit, system: UCUM_SYSTEM, code: converted.ucumCode } }, config);
}

export function bodyCompositionToObservation(reading: DeviceReading, config?: GeneratorConfig): FhirObservation {
  if (reading.deviceType !== 'body-composition') throw new Error('Invalid body-composition reading.');
  const supported = Object.keys(COMPONENTS).filter((key) => ['weight', 'bmi', 'bodyFat', 'fatMass', 'muscleMass', 'boneMass'].includes(key));
  const unsupported = Object.keys(reading.metrics ?? {}).filter((key) => !supported.includes(key));
  if (unsupported.length) throw new Error(`Body composition contains metrics without a safe default FHIR mapping: ${unsupported.join(', ')}.`);
  const components = supported.flatMap((key) => reading.metrics?.[key] ? [component(key, reading.metrics[key] as MetricValue)] : []);
  if (!components.length) throw new Error('Body composition has no FHIR-mappable metrics.');
  return checked({ ...base(reading, config), component: components }, config);
}

export function spirometryToObservation(reading: DeviceReading, config?: GeneratorConfig): FhirObservation {
  if (reading.deviceType !== 'spirometry' || typeof reading.value !== 'object' || reading.value === null) throw new Error('Invalid spirometry reading.');
  const value = reading.value as Record<string, number | undefined>;
  const components = ['fev1', 'fvc', 'pef', 'fev1FvcRatio'].flatMap((key) => {
    const found = metric(reading, key, value[key], key === 'pef' ? 'L/min' : key === 'fev1FvcRatio' ? '%' : 'L');
    return found ? [component(key, found)] : [];
  });
  if (!components.length) throw new Error('Spirometry reading contains no measurements.');
  return checked({ ...base(reading, config), component: components }, config);
}

export function sleepToObservation(reading: DeviceReading, config?: GeneratorConfig): FhirObservation {
  if (reading.deviceType !== 'sleep' || typeof reading.value !== 'object' || reading.value === null) throw new Error('Invalid sleep reading.');
  const value = reading.value as SleepValue;
  const total = metric(reading, 'totalSleep', value.totalDuration, reading.unit);
  if (!total) throw new Error('Sleep reading requires total duration.');
  const converted = convertUnit(total.value, total.unit, config?.targetUnit ?? 'min');
  const components = (['deepSleep', 'lightSleep', 'remSleep', 'awakeTime'] as const).flatMap((key) => {
    const found = metric(reading, key, value[key], reading.unit);
    return found ? [component(key, found)] : [];
  });
  const observation = base(reading, config);
  if (reading.metadata?.periodStart && reading.metadata?.periodEnd && typeof reading.metadata.periodStart === 'string' && typeof reading.metadata.periodEnd === 'string') {
    observation.effectivePeriod = { start: reading.metadata.periodStart, end: reading.metadata.periodEnd };
    delete (observation as Partial<FhirObservation>).effectiveDateTime;
  }
  return checked({ ...observation, valueQuantity: { value: converted.value, unit: converted.unit, system: UCUM_SYSTEM, code: converted.ucumCode }, ...(components.length ? { component: components } : {}) }, config);
}

export function ecgToObservation(reading: DeviceReading, config?: GeneratorConfig): FhirObservation {
  if (reading.deviceType !== 'ecg' || typeof reading.value !== 'object' || reading.value === null) throw new Error('Invalid ECG reading.');
  const value = reading.value as EcgValue;
  if (!value.rhythmClassification) throw new Error('ECG event requires rhythmClassification.');
  return checked({ ...base(reading, config), valueCodeableConcept: { text: value.rhythmClassification } }, config);
}
