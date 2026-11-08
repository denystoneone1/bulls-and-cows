import { describe, expect, it } from 'vitest';
import {
  BASE_OPTIONS,
  LENGTH_OPTIONS,
  fitLengthToBase,
  getAvailableLengths,
  isLengthAvailable,
} from './settings.js';

describe('settings options', () => {
  it('offers bin, oct, dec and hex bases', () => {
    expect(BASE_OPTIONS).toEqual([
      { name: 'bin', base: 2 },
      { name: 'oct', base: 8 },
      { name: 'dec', base: 10 },
      { name: 'hex', base: 16 },
    ]);
  });

  it('offers secret lengths from 2 to 6', () => {
    expect(LENGTH_OPTIONS).toEqual([2, 3, 4, 5, 6]);
  });
});

describe('isLengthAvailable', () => {
  it.each([
    { length: 2, base: 2, expected: true },
    { length: 3, base: 2, expected: false },
    { length: 6, base: 2, expected: false },
    { length: 6, base: 8, expected: true },
    { length: 6, base: 10, expected: true },
    { length: 6, base: 16, expected: true },
  ] as const)(
    'returns $expected for length $length in base $base',
    ({ length, base, expected }) => {
      expect(isLengthAvailable(length, base)).toBe(expected);
    },
  );
});

describe('getAvailableLengths', () => {
  it('allows only length 2 for binary base', () => {
    expect(getAvailableLengths(2)).toEqual([2]);
  });

  it.each([8, 10, 16] as const)('allows all lengths for base %i', (base) => {
    expect(getAvailableLengths(base)).toEqual([2, 3, 4, 5, 6]);
  });
});

describe('fitLengthToBase', () => {
  it('keeps the length when it is available in the base', () => {
    expect(fitLengthToBase(4, 10)).toBe(4);
  });

  it('falls back to the longest available length otherwise', () => {
    expect(fitLengthToBase(4, 2)).toBe(2);
  });
});
