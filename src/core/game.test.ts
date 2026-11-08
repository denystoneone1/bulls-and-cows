import { describe, expect, it } from 'vitest';
import { createGame, getElapsedMs, submitGuess, type GameState } from './game.js';

const START = 1_000_000;

// Глубокая заморозка: любая мутация состояния в реализации бросит TypeError
const deepFreeze = <T>(value: T): T => {
  if (typeof value === 'object' && value !== null) {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
};

const decimalGame = (): GameState => deepFreeze(createGame({ length: 4, base: 10 }, '1234', START));

describe('createGame', () => {
  it('starts a game with empty history', () => {
    expect(createGame({ length: 4, base: 10 }, '1234', START)).toEqual({
      settings: { length: 4, base: 10 },
      secret: '1234',
      history: [],
      status: 'playing',
      startedAt: START,
      finishedAt: null,
    });
  });
});

describe('submitGuess', () => {
  it('adds an attempt with bulls and cows to the history', () => {
    const { state, error } = submitGuess(decimalGame(), '1243', START + 1000);

    expect(error).toBeNull();
    expect(state.history).toEqual([{ guess: '1243', bulls: 2, cows: 2 }]);
    expect(state.status).toBe('playing');
  });

  it('does not mutate the previous state', () => {
    const game = decimalGame();

    const { state } = submitGuess(game, '5678', START + 1000);

    expect(game.history).toEqual([]);
    expect(state).not.toBe(game);
    expect(state.history).not.toBe(game.history);
  });

  it('keeps earlier attempts unchanged when adding a new one', () => {
    const first = submitGuess(decimalGame(), '5678', START + 1000).state;
    const second = submitGuess(deepFreeze(first), '1243', START + 2000).state;

    expect(second.history).toEqual([
      { guess: '5678', bulls: 0, cows: 0 },
      { guess: '1243', bulls: 2, cows: 2 },
    ]);
    expect(second.history[0]).toBe(first.history[0]);
  });

  it('rejects an invalid guess without changing the state', () => {
    const game = decimalGame();

    const result = submitGuess(game, '1123', START + 1000);

    expect(result.error).toBe('invalid');
    expect(result.state).toBe(game);
  });

  it('rejects a repeated guess without duplicating the history entry', () => {
    const first = submitGuess(decimalGame(), '5678', START + 1000).state;

    const result = submitGuess(deepFreeze(first), '5678', START + 2000);

    expect(result.error).toBe('duplicate');
    expect(result.state.history).toHaveLength(1);
  });

  it('treats hex guesses in different case as the same guess', () => {
    const hexGame = deepFreeze(createGame({ length: 2, base: 16 }, 'ab', START));
    const first = submitGuess(hexGame, 'cd', START + 1000).state;

    expect(submitGuess(deepFreeze(first), 'CD', START + 2000).error).toBe('duplicate');
  });

  it('stores hex guesses in lowercase', () => {
    const hexGame = deepFreeze(createGame({ length: 2, base: 16 }, 'ab', START));

    expect(submitGuess(hexGame, 'CD', START + 1000).state.history[0]?.guess).toBe('cd');
  });

  it('finishes the game when all digits are bulls', () => {
    const { state, error } = submitGuess(decimalGame(), '1234', START + 5000);

    expect(error).toBeNull();
    expect(state.status).toBe('won');
    expect(state.finishedAt).toBe(START + 5000);
    expect(state.history).toHaveLength(1);
  });

  it('rejects guesses after the game is won', () => {
    const won = submitGuess(decimalGame(), '1234', START + 5000).state;

    const result = submitGuess(deepFreeze(won), '5678', START + 6000);

    expect(result.error).toBe('finished');
    expect(result.state).toBe(won);
  });
});

describe('getElapsedMs', () => {
  it('counts time from the start while the game is in progress', () => {
    expect(getElapsedMs(decimalGame(), START + 3000)).toBe(3000);
  });

  it('stops counting when the game is won', () => {
    const won = submitGuess(decimalGame(), '1234', START + 5000).state;

    expect(getElapsedMs(won, START + 60_000)).toBe(5000);
  });
});
