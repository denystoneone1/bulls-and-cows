import { createDigitValidator, normalizeDigit, type Base } from './digits.js';

export const toDigits = (value: string): readonly string[] => value.split('').map(normalizeDigit);

const hasUniqueItems = (items: readonly string[]): boolean => new Set(items).size === items.length;

export const isValidGuess = (guess: string, length: number, base: Base): boolean => {
  const digits = toDigits(guess);

  return (
    digits.length === length && digits.every(createDigitValidator(base)) && hasUniqueItems(digits)
  );
};
