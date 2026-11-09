import { parseRecords, serializeRecords, type GameRecord } from '../core/records.js';

const RECORDS_KEY = 'bulls-and-cows:records';

// localStorage может быть недоступен (приватный режим, запрет сайта), тогда рекорды живут до перезагрузки
export const loadRecords = (): readonly GameRecord[] => {
  try {
    return parseRecords(localStorage.getItem(RECORDS_KEY));
  } catch {
    return [];
  }
};

export const saveRecords = (records: readonly GameRecord[]): void => {
  try {
    localStorage.setItem(RECORDS_KEY, serializeRecords(records));
  } catch {
    // Хранилище недоступно: игра продолжает работать без сохранения
  }
};
