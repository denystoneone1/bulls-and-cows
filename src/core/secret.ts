import type { Base } from './digits.js';
import { memoize } from './memoize.js';

export type RandomSource = () => number;

export const generateSecret = (
  _length: number,
  _base: Base,
  _random: RandomSource = Math.random,
): string => {
  throw new Error('Not implemented');
};

// P(base, length) = base * P(base - 1, length - 1), P(base, 0) = 1.
// Рекурсивный вызов идет через мемоизированную ссылку, поэтому кешируются и промежуточные шаги.
export const countPossibleSecrets: (length: number, base: number) => number = memoize(
  (length: number, base: number): number =>
    length <= 0 ? 1 : base * countPossibleSecrets(length - 1, base - 1),
);
