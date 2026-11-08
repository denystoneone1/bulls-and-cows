import { formatDuration, pluralize, type PluralForms } from '../core/format.js';
import { getRecordsFor, type GameRecord } from '../core/records.js';
import { BASE_OPTIONS, type GameSettings } from '../core/settings.js';
import { el } from './dom.js';

interface RecordsViewProps {
  readonly records: readonly GameRecord[];
  readonly settings: GameSettings;
  readonly highlighted: GameRecord | null;
}

const DIGITS: PluralForms = ['цифра', 'цифры', 'цифр'];

const dateFormat = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' });

const baseName = (settings: GameSettings): string =>
  BASE_OPTIONS.find((option) => option.base === settings.base)?.name ?? String(settings.base);

const renderRow = (record: GameRecord, place: number, isNew: boolean): HTMLTableRowElement =>
  el('tr', { className: isNew ? 'record-new' : '' }, [
    el('td', { text: String(place) }),
    el('td', { text: String(record.attempts) }),
    el('td', { text: formatDuration(record.timeMs) }),
    el('td', { text: isNew ? 'только что' : dateFormat.format(record.finishedAt) }),
  ]);

export const renderRecords = ({
  records,
  settings,
  highlighted,
}: RecordsViewProps): HTMLElement => {
  const top = getRecordsFor(records, settings);
  const title = `Рекорды: ${baseName(settings)}, ${String(settings.length)} ${pluralize(settings.length, DIGITS)}`;

  return el('section', { className: 'records', attrs: { 'aria-labelledby': 'records-title' } }, [
    el('h2', { className: 'records-title', text: title, attrs: { id: 'records-title' } }),
    top.length === 0
      ? el('p', {
          className: 'records-empty',
          text: 'Здесь пока пусто. Угадайте число с этими настройками, и результат попадет в таблицу.',
        })
      : el('table', { className: 'records-table' }, [
          el('thead', {}, [
            el('tr', {}, [
              el('th', { text: 'Место', attrs: { scope: 'col' } }),
              el('th', { text: 'Ходов', attrs: { scope: 'col' } }),
              el('th', { text: 'Время', attrs: { scope: 'col' } }),
              el('th', { text: 'Когда', attrs: { scope: 'col' } }),
            ]),
          ]),
          el(
            'tbody',
            {},
            top.map((record, index) =>
              renderRow(record, index + 1, record.finishedAt === highlighted?.finishedAt),
            ),
          ),
        ]),
  ]);
};
