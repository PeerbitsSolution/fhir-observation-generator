import { describe, expect, it } from 'vitest';
import { toObservation, type DeviceReading } from '../src/index.js';

const base = { timestamp: '2026-08-15T10:00:00Z', patientRef: 'Patient/p-1', deviceId: 'Device/d-1' };

describe('extended observation generators', () => {
  it('generates a CGM Observation with the interstitial-fluid LOINC code', () => {
    const result = toObservation({ ...base, deviceType: 'continuous-glucose', value: { glucose: 120, trend: 'flat' }, unit: 'mg/dL' }, { validate: true });
    expect(result.code.coding?.[0].code).toBe('99504-3');
    expect(result.valueQuantity?.value).toBe(120);
  });

  it('generates one sleep Observation with stage components and a period', () => {
    const reading: DeviceReading = {
      ...base, deviceType: 'sleep', value: { totalDuration: 420, deepSleep: 80, lightSleep: 220, remSleep: 90, awakeTime: 30 }, unit: 'min',
      metadata: { periodStart: '2026-08-14T22:30:00Z', periodEnd: '2026-08-15T06:00:00Z' },
    };
    const result = toObservation(reading, { validate: true });
    expect(result.code.coding?.[0].code).toBe('93832-4');
    expect(result.effectivePeriod?.start).toBe('2026-08-14T22:30:00Z');
    expect(result.component?.map((item) => item.code.coding?.[0].code)).toEqual(['93831-6', '93830-8', '93829-0', '93828-2']);
  });

  it('converts sleep hours into canonical minutes', () => {
    const result = toObservation({ ...base, deviceType: 'sleep', value: { totalDuration: 7.5 }, unit: 'h' }, { validate: true });
    expect(result.valueQuantity?.value).toBe(450);
    expect(result.valueQuantity?.code).toBe('min');
  });

  it('does not guess HRV methods or perfusion measurement sites', () => {
    expect(() => toObservation({ ...base, deviceType: 'heart-rate-variability', value: 42, unit: 'ms' })).toThrow('hrvMethod');
    expect(() => toObservation({ ...base, deviceType: 'perfusion-index', value: 4, unit: '%' })).toThrow('measurementSite');
  });

  it('generates a spirometry panel with standard components', () => {
    const result = toObservation({ ...base, deviceType: 'spirometry', value: { fev1: 2.8, fvc: 3.5, pef: 420, fev1FvcRatio: 80 }, unit: 'mixed' }, { validate: true });
    expect(result.code.coding?.[0].code).toBe('81459-0');
    expect(result.component?.map((item) => item.code.coding?.[0].code)).toEqual(['20150-9', '19868-9', '33452-4', '19926-5']);
  });

  it('keeps ECG waveform data external and references it', () => {
    const result = toObservation({ ...base, deviceType: 'ecg', value: { rhythmClassification: 'atrial-fibrillation' }, unit: '1', waveformRef: { reference: 'DocumentReference/ecg-1' } }, { validate: true });
    expect(result.code.coding?.[0].code).toBe('8619-9');
    expect(result.derivedFrom?.[0].reference).toBe('DocumentReference/ecg-1');
  });
});
