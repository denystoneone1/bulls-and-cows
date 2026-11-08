import { describe, expect, it } from 'vitest';
import { createDigitValidator } from './digits.js';
import { sanitizeGuessInput } from './input.js';

describe('sanitizeGuessInput', () => {
  const isOctalDigit = createDigitValidator(8);
  const isHexDigit = createDigitValidator(16);

  it('keeps a clean input as is', () => {
    expect(sanitizeGuessInput('0127', isOctalDigit, 4)).toBe('0127');
  });

  it('drops characters that are not digits of the base', () => {
    expect(sanitizeGuessInput('1x8 9-2', isOctalDigit, 4)).toBe('12');
  });

  it('lowercases hex digits', () => {
    expect(sanitizeGuessInput('AbC', isHexDigit, 4)).toBe('abc');
  });

  it('drops repeated digits, keeping the first one', () => {
    expect(sanitizeGuessInput('1213', isOctalDigit, 4)).toBe('123');
    expect(sanitizeGuessInput('aA', isHexDigit, 4)).toBe('a');
  });

  it('cuts the input to the secret length', () => {
    expect(sanitizeGuessInput('012345', isOctalDigit, 4)).toBe('0123');
  });

  it('returns an empty string when nothing is valid', () => {
    expect(sanitizeGuessInput('xyz', isOctalDigit, 4)).toBe('');
  });
});
