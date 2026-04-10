import { describe, test, expect } from 'vitest';
import { parseVoyagerDate } from './dates';

describe('parseVoyagerDate', () => {
  test('returns null for undefined', () => {
    expect(parseVoyagerDate(undefined)).toBeNull();
  });

  test('returns null for null', () => {
    expect(parseVoyagerDate(null)).toBeNull();
  });

  test('returns null when year is missing', () => {
    expect(parseVoyagerDate({ month: 5 })).toBeNull();
  });

  test('returns year only', () => {
    expect(parseVoyagerDate({ year: 2023 })).toBe('2023');
  });

  test('returns year and month', () => {
    expect(parseVoyagerDate({ year: 2023, month: 3 })).toBe('2023-03');
  });

  test('pads single-digit month', () => {
    expect(parseVoyagerDate({ year: 2023, month: 1 })).toBe('2023-01');
  });

  test('returns year, month, and day', () => {
    expect(parseVoyagerDate({ year: 2023, month: 11, day: 5 })).toBe('2023-11-05');
  });

  test('pads single-digit day', () => {
    expect(parseVoyagerDate({ year: 2023, month: 12, day: 1 })).toBe('2023-12-01');
  });
});
