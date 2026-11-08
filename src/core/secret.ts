import { getDigits, type Base } from './digits.js';
import { memoize } from './memoize.js';

export type RandomSource = () => number;

// Берет случайную цифру из пула и рекурсивно добирает остальные из пула без нее
const pickUniqueDigits = (
  pool: readonly string[],
  count: number,
  random: RandomSource,
): readonly string[] => {
  if (count <= 0 || pool.length === 0) {
    return [];
  }

  const index = Math.min(Math.floor(random() * pool.length), pool.length - 1);
  const picked = pool.slice(index, index + 1);
  const rest = pool.filter((_, poolIndex) => poolIndex !== index);

  return [...picked, ...pickUniqueDigits(rest, count - 1, random)];
};

export const generateSecret = (
  length: number,
  base: Base,
  random: RandomSource = Math.random,
): string => {
  if (length > base) {
    throw new RangeError(`Cannot pick ${String(length)} unique digits in base ${String(base)}`);
  }

  return pickUniqueDigits(getDigits(base), length, random).join('');
};

// P(base, length) = base * P(base - 1, length - 1), P(base, 0) = 1.
// Рекурсивный вызов идет через мемоизированную ссылку, поэтому кешируются и промежуточные шаги.
export const countPossibleSecrets: (length: number, base: number) => number = memoize(
  (length: number, base: number): number =>
    length <= 0 ? 1 : base * countPossibleSecrets(length - 1, base - 1),
);
