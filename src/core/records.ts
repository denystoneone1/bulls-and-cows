import type { GameState } from './game.js';
import type { GameSettings } from './settings.js';

export interface GameRecord extends GameSettings {
  readonly attempts: number;
  readonly timeMs: number;
  readonly finishedAt: number;
}

export const RECORDS_LIMIT = 10;

export const compareRecords = (_a: GameRecord, _b: GameRecord): number => {
  throw new Error('Not implemented');
};

export const getRecordsFor = (
  _records: readonly GameRecord[],
  _settings: GameSettings,
): readonly GameRecord[] => {
  throw new Error('Not implemented');
};

export const addRecord = (
  _records: readonly GameRecord[],
  _record: GameRecord,
  _limit: number = RECORDS_LIMIT,
): readonly GameRecord[] => {
  throw new Error('Not implemented');
};

export const createRecord = (_state: GameState): GameRecord | null => {
  throw new Error('Not implemented');
};

export const parseRecords = (_raw: string | null): readonly GameRecord[] => {
  throw new Error('Not implemented');
};

export const serializeRecords = (_records: readonly GameRecord[]): string => {
  throw new Error('Not implemented');
};
