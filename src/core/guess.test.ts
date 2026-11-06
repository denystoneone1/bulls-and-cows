import { describe, expect, it } from 'vitest';
import { isValidGuess } from './guess.js';

describe('isValidGuess', () => {
  it.each([
    { guess: '0123', length: 4, base: 10 },
    { guess: '01', length: 2, base: 2 },
    { guess: '765', length: 3, base: 8 },
    { guess: '7a3f', length: 4, base: 16 },
    { guess: '7A3F', length: 4, base: 16 },
    { guess: '987654', length: 6, base: 10 },
  ] as const)('accepts $guess for length $length and base $base', ({ guess, length, base }) => {
    expect(isValidGuess(guess, length, base)).toBe(true);
  });

  it.each([
    { guess: '012', length: 4 },
    { guess: '01234', length: 4 },
    { guess: '', length: 2 },
  ] as const)('rejects $guess when length is not $length', ({ guess, length }) => {
    expect(isValidGuess(guess, length, 10)).toBe(false);
  });

  it.each([
    { guess: '0128', base: 8 },
    { guess: '02', base: 2 },
    { guess: '12g4', base: 16 },
    { guess: '1a23', base: 10 },
    { guess: '0 12', base: 10 },
  ] as const)('rejects $guess with digits outside base $base', ({ guess, base }) => {
    expect(isValidGuess(guess, guess.length, base)).toBe(false);
  });

  it.each([
    { guess: '1123', base: 10 },
    { guess: '00', base: 2 },
    { guess: 'aA12', base: 16 },
  ] as const)('rejects $guess with repeated digits', ({ guess, base }) => {
    expect(isValidGuess(guess, guess.length, base)).toBe(false);
  });
});
