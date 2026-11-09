import type { DigitValidator } from './digits.js';
import { toDigits } from './guess.js';

const isFirstOccurrence = (digit: string, index: number, digits: readonly string[]): boolean =>
  digits.indexOf(digit) === index;

// Оставляет только допустимые неповторяющиеся цифры, не длиннее секрета
export const sanitizeGuessInput = (
  value: string,
  isDigit: DigitValidator,
  maxLength: number,
): string => toDigits(value).filter(isDigit).filter(isFirstOccurrence).slice(0, maxLength).join('');
