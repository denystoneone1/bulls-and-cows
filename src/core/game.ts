import type { GuessResult } from './guess.js';
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

export const createGame = (_settings: GameSettings, _secret: string, _now: number): GameState => {
  throw new Error('Not implemented');
};

export const submitGuess = (_state: GameState, _guess: string, _now: number): SubmitResult => {
  throw new Error('Not implemented');
};

export const getElapsedMs = (_state: GameState, _now: number): number => {
  throw new Error('Not implemented');
};
