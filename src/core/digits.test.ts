import { describe, expect, it } from 'vitest';
import { createDigitValidator } from './digits.js';

describe('createDigitValidator', () => {
  it('returns a predicate function for the given base', () => {
    expect(createDigitValidator(10)).toBeTypeOf('function');
  });

  const DEC_DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const HEX_LETTERS = ['a', 'b', 'c', 'd', 'e', 'f'];

  it.each([
    { base: 2, valid: ['0', '1'], invalid: ['2', '7', '9', 'a', 'f'] },
    { base: 8, valid: DEC_DIGITS.slice(0, 8), invalid: ['8', '9', 'a', 'f'] },
    { base: 10, valid: DEC_DIGITS, invalid: HEX_LETTERS },
    { base: 16, valid: [...DEC_DIGITS, ...HEX_LETTERS], invalid: ['g', 'x', 'z'] },
  ] as const)('accepts only digits of base $base', ({ base, valid, invalid }) => {
    const isDigit = createDigitValidator(base);

    expect(valid.every(isDigit)).toBe(true);
    expect(invalid.some(isDigit)).toBe(false);
  });

  it('accepts uppercase hex digits the same as lowercase', () => {
    const isHexDigit = createDigitValidator(16);

    expect(['A', 'B', 'C', 'D', 'E', 'F'].every(isHexDigit)).toBe(true);
  });

  it('rejects uppercase letters outside the hex alphabet', () => {
    const isHexDigit = createDigitValidator(16);

    expect(isHexDigit('G')).toBe(false);
  });

  it.each(['', '12', ' ', '-', '.', '٣'])('rejects non-digit input %j', (input) => {
    expect(createDigitValidator(10)(input)).toBe(false);
  });

  it('creates independent validators for different bases', () => {
    const isBinaryDigit = createDigitValidator(2);
    const isDecimalDigit = createDigitValidator(10);

    expect(isBinaryDigit('5')).toBe(false);
    expect(isDecimalDigit('5')).toBe(true);
  });
});
