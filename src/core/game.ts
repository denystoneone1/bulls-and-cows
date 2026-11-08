import { evaluateGuess, isValidGuess, toDigits, type GuessResult } from './guess.js';
import type { GameSettings } from './settings.js';

export interface Attempt extends GuessResult {
  readonly guess: string;
}

export type GameStatus = 'playing' | 'won';

export interface GameState {
  readonly settings: GameSettings;
  readonly secret: string;
  readonly history: readonly Attempt[];
  readonly status: GameStatus;
  readonly startedAt: number;
  readonly finishedAt: number | null;
}

export type GuessError = 'invalid' | 'duplicate' | 'finished';

export interface SubmitResult {
  readonly state: GameState;
  readonly error: GuessError | null;
}

export const createGame = (settings: GameSettings, secret: string, now: number): GameState => ({
  settings,
  secret,
  history: [],
  status: 'playing',
  startedAt: now,
  finishedAt: null,
});

const normalizeGuess = (guess: string): string => toDigits(guess).join('');

const hasBeenGuessed = (history: readonly Attempt[], guess: string): boolean =>
  history.some((attempt) => attempt.guess === guess);

const getGuessError = (state: GameState, guess: string): GuessError | null => {
  if (state.status === 'won') {
    return 'finished';
  }
  if (!isValidGuess(guess, state.settings.length, state.settings.base)) {
    return 'invalid';
  }
  if (hasBeenGuessed(state.history, guess)) {
    return 'duplicate';
  }
  return null;
};

export const submitGuess = (state: GameState, rawGuess: string, now: number): SubmitResult => {
  const guess = normalizeGuess(rawGuess);
  const error = getGuessError(state, guess);

  if (error) {
    return { state, error };
  }

  const attempt: Attempt = { guess, ...evaluateGuess(state.secret, guess) };
  const isWin = attempt.bulls === state.settings.length;

  return {
    state: {
      ...state,
      history: [...state.history, attempt],
      status: isWin ? 'won' : 'playing',
      finishedAt: isWin ? now : null,
    },
    error: null,
  };
};

export const getElapsedMs = (state: GameState, now: number): number =>
  (state.finishedAt ?? now) - state.startedAt;
