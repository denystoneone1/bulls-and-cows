import type { DigitValidator } from './digits.js';

export const sanitizeGuessInput = (
  _value: string,
  _isDigit: DigitValidator,
  _maxLength: number,
): string => {
  throw new Error('Not implemented');
};
