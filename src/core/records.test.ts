import { describe, expect, it } from 'vitest';
import { createGame, submitGuess } from './game.js';
import {
  addRecord,
  compareRecords,
  createRecord,
  getRecordsFor,
  parseRecords,
  serializeRecords,
  type GameRecord,
} from './records.js';

const record = (overrides: Partial<GameRecord> = {}): GameRecord => ({
  length: 4,
  base: 10,
  attempts: 5,
  timeMs: 30_000,
  finishedAt: 1_000_000,
  ...overrides,
});

describe('compareRecords', () => {
  it('ranks fewer attempts higher', () => {
    expect(compareRecords(record({ attempts: 3 }), record({ attempts: 5 }))).toBeLessThan(0);
  });

  it('ranks faster time higher when attempts are equal', () => {
    expect(compareRecords(record({ timeMs: 9000 }), record({ timeMs: 1000 }))).toBeGreaterThan(0);
  });

  it('prefers fewer attempts over faster time', () => {
    const slowButFew = record({ attempts: 3, timeMs: 90_000 });
    const fastButMany = record({ attempts: 4, timeMs: 1000 });

    expect(compareRecords(slowButFew, fastButMany)).toBeLessThan(0);
  });
});

describe('getRecordsFor', () => {
  it('returns sorted records only for the given length and base', () => {
    const records = [
      record({ attempts: 7 }),
      record({ attempts: 2, base: 16 }),
      record({ attempts: 4 }),
      record({ attempts: 1, length: 5 }),
    ];

    expect(getRecordsFor(records, { length: 4, base: 10 })).toEqual([
      record({ attempts: 4 }),
      record({ attempts: 7 }),
    ]);
  });
});

describe('addRecord', () => {
  it('adds a record without mutating the original list', () => {
    const records = Object.freeze([record({ attempts: 6 })]);

    const updated = addRecord(records, record({ attempts: 3 }));

    expect(updated).toEqual([record({ attempts: 3 }), record({ attempts: 6 })]);
    expect(records).toHaveLength(1);
  });

  it('keeps only the best records for the same settings', () => {
    const records = [record({ attempts: 2 }), record({ attempts: 4 })];

    const updated = addRecord(records, record({ attempts: 3 }), 2);

    expect(updated).toEqual([record({ attempts: 2 }), record({ attempts: 3 })]);
  });

  it('drops a record that does not make it into the top', () => {
    const records = [record({ attempts: 2 }), record({ attempts: 3 })];

    expect(addRecord(records, record({ attempts: 9 }), 2)).toEqual(records);
  });

  it('keeps records for other settings untouched', () => {
    const hexRecord = record({ base: 16, attempts: 20 });

    const updated = addRecord([hexRecord, record({ attempts: 2 })], record({ attempts: 3 }), 1);

    expect(updated).toContainEqual(hexRecord);
    expect(getRecordsFor(updated, { length: 4, base: 10 })).toEqual([record({ attempts: 2 })]);
  });
});

describe('createRecord', () => {
  const settings = { length: 2, base: 10 } as const;

  it('creates a record from a won game', () => {
    const playing = submitGuess(createGame(settings, '12', 1000), '34', 2000).state;
    const won = submitGuess(playing, '12', 6000).state;

    expect(createRecord(won)).toEqual({
      length: 2,
      base: 10,
      attempts: 2,
      timeMs: 5000,
      finishedAt: 6000,
    });
  });

  it('returns null for a game in progress', () => {
    expect(createRecord(createGame(settings, '12', 1000))).toBeNull();
  });
});

describe('parseRecords and serializeRecords', () => {
  it('restores records after serialization', () => {
    const records = [record({ attempts: 2 }), record({ base: 2, length: 2 })];

    expect(parseRecords(serializeRecords(records))).toEqual(records);
  });

  it.each([
    { raw: null, label: 'missing value' },
    { raw: '{not json', label: 'broken JSON' },
    { raw: '{"attempts":1}', label: 'non-array value' },
  ])('returns an empty list for $label', ({ raw }) => {
    expect(parseRecords(raw)).toEqual([]);
  });

  it('skips malformed entries', () => {
    const raw = JSON.stringify([record(), { attempts: 'many' }, { ...record(), base: 7 }, null]);

    expect(parseRecords(raw)).toEqual([record()]);
  });
});
