export type Base = 2 | 8 | 10 | 16;

export type DigitValidator = (char: string) => boolean;

export const createDigitValidator = (_base: Base): DigitValidator => {
  throw new Error('Not implemented');
};
