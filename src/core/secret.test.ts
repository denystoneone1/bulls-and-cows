import { describe, expect, it, vi } from 'vitest';
import type { Base } from './digits.js';
import { isValidGuess } from './guess.js';
import { countPossibleSecrets, generateSecret, type RandomSource } from './secret.js';

const constant =
  (value: number): RandomSource =>
  () =>
    value;

// Возвращает значения по кругу: детерминированная замена Math.random
const sequence = (...values: readonly number[]): RandomSource => {
  const state = { index: 0 };

  return () => {
    const value = values[state.index % values.length] ?? 0;
    state.index += 1;
    return value;
  };
};

// Простой детерминированный генератор (LCG) для проверки свойств на многих секретах
const seededRandom = (seed: number): RandomSource => {
  const state = { seed };

  return () => {
    state.seed = (state.seed * 1103515245 + 12345) % 2147483648;
    return state.seed / 2147483648;
  };
};

describe('generateSecret', () => {
  it('picks the first remaining digit when random always returns 0', () => {
    expect(generateSecret(4, 10, constant(0))).toBe('0123');
  });

  it('picks the last remaining digit when random is close to 1', () => {
    expect(generateSecret(4, 10, constant(0.999))).toBe('9876');
  });

  it('picks digits by the given random sequence', () => {
    // [0..9] -> индекс 5 ('5'), [0,1,2,3,4,6,7,8,9] -> индекс 0 ('0'), [1,2,3,4,6,7,8,9] -> индекс 4 ('6')
    expect(generateSecret(3, 10, sequence(0.5, 0, 0.5))).toBe('506');
  });

  it('uses hex letters for base 16', () => {
    expect(generateSecret(3, 16, constant(0.999))).toBe('fed');
  });

  it('generates both possible binary secrets', () => {
    expect(generateSecret(2, 2, constant(0))).toBe('01');
    expect(generateSecret(2, 2, constant(0.999))).toBe('10');
  });

  it('returns the same secret for the same random sequence', () => {
    expect(generateSecret(5, 16, seededRandom(42))).toBe(generateSecret(5, 16, seededRandom(42)));
  });

  it.each([
    { length: 2, base: 2 },
    { length: 6, base: 8 },
    { length: 4, base: 10 },
    { length: 6, base: 10 },
    { length: 6, base: 16 },
  ] as const)(
    'always generates a valid secret of length $length in base $base',
    ({ length, base }: { length: number; base: Base }) => {
      const random = seededRandom(length * base);
      const secrets = Array.from({ length: 50 }, () => generateSecret(length, base, random));

      expect(secrets.every((secret) => isValidGuess(secret, length, base))).toBe(true);
    },
  );

  it('does not use Math.random when a random source is passed', () => {
    const mathRandom = vi.spyOn(Math, 'random');

    generateSecret(4, 10, constant(0.3));

    expect(mathRandom).not.toHaveBeenCalled();
    mathRandom.mockRestore();
  });

  it('falls back to Math.random by default', () => {
    expect(isValidGuess(generateSecret(4, 10), 4, 10)).toBe(true);
  });

  it('throws when length exceeds the number of digits in the base', () => {
    expect(() => generateSecret(3, 2, constant(0))).toThrow(RangeError);
  });
});

describe('countPossibleSecrets', () => {
  it.each([
    { length: 2, base: 2, expected: 2 },
    { length: 1, base: 10, expected: 10 },
    { length: 2, base: 10, expected: 90 },
    { length: 4, base: 10, expected: 5040 },
    { length: 6, base: 10, expected: 151200 },
    { length: 6, base: 8, expected: 20160 },
    { length: 4, base: 16, expected: 43680 },
    { length: 6, base: 16, expected: 5765760 },
  ])('counts $expected secrets of length $length in base $base', ({ length, base, expected }) => {
    expect(countPossibleSecrets(length, base)).toBe(expected);
  });

  it('counts secrets with a leading zero as distinct secrets', () => {
    // P(10, 4) = 10 * 9 * 8 * 7, без вычитания чисел с нулем в начале
    expect(countPossibleSecrets(4, 10)).toBe(10 * 9 * 8 * 7);
  });

  it('returns 1 for zero length as the recursion base case', () => {
    expect(countPossibleSecrets(0, 10)).toBe(1);
  });

  it('returns 0 when length exceeds the number of digits in the base', () => {
    expect(countPossibleSecrets(3, 2)).toBe(0);
  });

  it('returns the same value on repeated calls', () => {
    expect(countPossibleSecrets(5, 16)).toBe(countPossibleSecrets(5, 16));
  });
});
