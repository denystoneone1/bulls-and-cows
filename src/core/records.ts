import type { GameState } from './game.js';
import type { GameSettings } from './settings.js';

export interface GameRecord extends GameSettings {
  readonly attempts: number;
  readonly timeMs: number;
  readonly finishedAt: number;
}

export const RECORDS_LIMIT = 10;

const KNOWN_BASES: readonly number[] = [2, 8, 10, 16];

export const compareRecords = (a: GameRecord, b: GameRecord): number =>
  a.attempts - b.attempts || a.timeMs - b.timeMs;

const isSameSettings =
  (settings: GameSettings) =>
  (record: GameRecord): boolean =>
    record.length === settings.length && record.base === settings.base;

export const getRecordsFor = (
  records: readonly GameRecord[],
  settings: GameSettings,
): readonly GameRecord[] => records.filter(isSameSettings(settings)).sort(compareRecords);

export const addRecord = (
  records: readonly GameRecord[],
  record: GameRecord,
  limit: number = RECORDS_LIMIT,
): readonly GameRecord[] => {
  const settings: GameSettings = { length: record.length, base: record.base };
  const isSame = isSameSettings(settings);
  const top = getRecordsFor([...records, record], settings).slice(0, limit);
  const others = records.filter((item) => !isSame(item));

  return [...others, ...top];
};

export const createRecord = (state: GameState): GameRecord | null =>
  state.status === 'won' && state.finishedAt !== null
    ? {
        length: state.settings.length,
        base: state.settings.base,
        attempts: state.history.length,
        timeMs: state.finishedAt - state.startedAt,
        finishedAt: state.finishedAt,
      }
    : null;

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const isGameRecord = (value: unknown): value is GameRecord => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  const numericFields = [
    candidate.length,
    candidate.attempts,
    candidate.timeMs,
    candidate.finishedAt,
  ];

  return (
    numericFields.every(isFiniteNumber) &&
    isFiniteNumber(candidate.base) &&
    KNOWN_BASES.includes(candidate.base)
  );
};

const parseJson = (raw: string): unknown => {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const parseRecords = (raw: string | null): readonly GameRecord[] => {
  const parsed = raw === null ? null : parseJson(raw);

  return Array.isArray(parsed) ? parsed.filter(isGameRecord) : [];
};

export const serializeRecords = (records: readonly GameRecord[]): string => JSON.stringify(records);
