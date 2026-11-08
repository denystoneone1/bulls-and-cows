import type { Base } from './digits.js';

export interface BaseOption {
  readonly name: 'bin' | 'oct' | 'dec' | 'hex';
  readonly base: Base;
}

export interface GameSettings {
  readonly length: number;
  readonly base: Base;
}

export const BASE_OPTIONS: readonly BaseOption[] = [
  { name: 'bin', base: 2 },
  { name: 'oct', base: 8 },
  { name: 'dec', base: 10 },
  { name: 'hex', base: 16 },
];

const MIN_LENGTH = 2;
const MAX_LENGTH = 6;

export const LENGTH_OPTIONS: readonly number[] = Array.from(
  { length: MAX_LENGTH - MIN_LENGTH + 1 },
  (_, index) => MIN_LENGTH + index,
);

// Уникальных цифр в секрете не может быть больше, чем цифр в алфавите системы
export const isLengthAvailable = (length: number, base: Base): boolean => length <= base;

export const getAvailableLengths = (base: Base): readonly number[] =>
  LENGTH_OPTIONS.filter((length) => isLengthAvailable(length, base));

export const fitLengthToBase = (length: number, base: Base): number =>
  isLengthAvailable(length, base) ? length : Math.max(...getAvailableLengths(base));
