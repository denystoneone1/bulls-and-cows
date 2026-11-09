import { describe, expect, it } from 'vitest';
import { formatDuration, pluralize, type PluralForms } from './format.js';

describe('pluralize', () => {
  const MOVES: PluralForms = ['ход', 'хода', 'ходов'];

  it.each([
    { count: 1, expected: 'ход' },
    { count: 21, expected: 'ход' },
    { count: 2, expected: 'хода' },
    { count: 4, expected: 'хода' },
    { count: 34, expected: 'хода' },
    { count: 0, expected: 'ходов' },
    { count: 5, expected: 'ходов' },
    { count: 11, expected: 'ходов' },
    { count: 12, expected: 'ходов' },
    { count: 14, expected: 'ходов' },
    { count: 111, expected: 'ходов' },
  ])('uses "$expected" for $count', ({ count, expected }) => {
    expect(pluralize(count, MOVES)).toBe(expected);
  });
});

describe('formatDuration', () => {
  it.each([
    { ms: 0, expected: '0:00' },
    { ms: 999, expected: '0:00' },
    { ms: 5_000, expected: '0:05' },
    { ms: 65_000, expected: '1:05' },
    { ms: 600_000, expected: '10:00' },
    { ms: 3_725_000, expected: '1:02:05' },
  ])('formats $ms ms as $expected', ({ ms, expected }) => {
    expect(formatDuration(ms)).toBe(expected);
  });
});
