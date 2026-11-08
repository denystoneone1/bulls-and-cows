import type { Base } from './digits.js';

export interface BaseOption {
  readonly name: 'bin' | 'oct' | 'dec' | 'hex';
  readonly base: Base;
}

export interface GameSettings {
  readonly length: number;
  readonly base: Base;
}

export const BASE_OPTIONS: readonly BaseOption[] = [];

export const LENGTH_OPTIONS: readonly number[] = [];

export const isLengthAvailable = (_length: number, _base: Base): boolean => {
  throw new Error('Not implemented');
};

export const getAvailableLengths = (_base: Base): readonly number[] => {
  throw new Error('Not implemented');
};

export const fitLengthToBase = (_length: number, _base: Base): number => {
  throw new Error('Not implemented');
};
