import { memoize } from './memoize.js';

// P(base, length) = base * P(base - 1, length - 1), P(base, 0) = 1.
// Рекурсивный вызов идет через мемоизированную ссылку, поэтому кешируются и промежуточные шаги.
export const countPossibleSecrets: (length: number, base: number) => number = memoize(
  (length: number, base: number): number =>
    length <= 0 ? 1 : base * countPossibleSecrets(length - 1, base - 1),
);
