export type Base = 2 | 8 | 10 | 16;

export type DigitValidator = (char: string) => boolean;

const ALL_DIGITS = '0123456789abcdef';

export const normalizeDigit = (char: string): string => char.toLowerCase();

export const getDigits = (base: Base): readonly string[] => ALL_DIGITS.slice(0, base).split('');

export const createDigitValidator = (base: Base): DigitValidator => {
  const allowedDigits = new Set(getDigits(base));

  return (char) => allowedDigits.has(normalizeDigit(char));
};
