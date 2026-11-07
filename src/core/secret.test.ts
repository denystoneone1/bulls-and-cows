import { describe, expect, it } from 'vitest';
import { countPossibleSecrets } from './secret.js';

describe('countPossibleSecrets', () => {
  it.each([
    { length: 2, base: 2, expected: 2 },
    { length: 1, base: 10, expected: 10 },
    { length: 2, base: 10, expected: 90 },
    { length: 4, base: 10, expected: 5040 },
    { length: 6, base: 10, expected: 151200 },
    { length: 6, base: 8, expected: 20160 },
    { length: 4, base: 16, expected: 43680 },
    { length: 6, base: 16, expected: 5765760 },
  ])('counts $expected secrets of length $length in base $base', ({ length, base, expected }) => {
    expect(countPossibleSecrets(length, base)).toBe(expected);
  });

  it('counts secrets with a leading zero as distinct secrets', () => {
    // P(10, 4) = 10 * 9 * 8 * 7, без вычитания чисел с нулем в начале
    expect(countPossibleSecrets(4, 10)).toBe(10 * 9 * 8 * 7);
  });

  it('returns 1 for zero length as the recursion base case', () => {
    expect(countPossibleSecrets(0, 10)).toBe(1);
  });

  it('returns 0 when length exceeds the number of digits in the base', () => {
    expect(countPossibleSecrets(3, 2)).toBe(0);
  });

  it('returns the same value on repeated calls', () => {
    expect(countPossibleSecrets(5, 16)).toBe(countPossibleSecrets(5, 16));
  });
});
