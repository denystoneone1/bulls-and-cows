import { formatDuration } from '../core/format.js';
import { getRecordsFor, type GameRecord } from '../core/records.js';
import type { GameSettings } from '../core/settings.js';
import { el } from './dom.js';
import { settingsLabel } from './tag.js';

interface RecordsViewProps {
  readonly records: readonly GameRecord[];
  readonly settings: GameSettings;
  readonly highlighted: GameRecord | null;
}

const dateFormat = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' });

const renderRow = (record: GameRecord, place: number, isNew: boolean): HTMLTableRowElement =>
  el('tr', { className: isNew ? 'record-new' : '' }, [
    el('td', { className: 'num', text: String(place) }),
    el('td', { className: 'num', text: String(record.attempts) }),
    el('td', { className: 'num num-light', text: formatDuration(record.timeMs) }),
    el('td', {
      className: 'records-when',
      text: isNew ? 'только что' : dateFormat.format(record.finishedAt),
    }),
  ]);

const renderEmpty = (): HTMLElement =>
  el('div', { className: 'empty' }, [
    el('span', { className: 'tag tag-ghost', attrs: { 'aria-hidden': 'true' } }, [
      el('span', { className: 'tag-hole' }),
    ]),
    el('div', { className: 'empty-body' }, [
      el('p', { className: 'empty-title', text: 'Рекордов пока нет' }),
      el('p', {
        className: 'empty-text',
        text: 'Угадайте число в этих настройках, и здесь появится первая запись.',
      }),
    ]),
  ]);

export const renderRecords = ({
  records,
  settings,
  highlighted,
}: RecordsViewProps): HTMLElement => {
  const top = getRecordsFor(records, settings);

  return el('section', { className: 'records', attrs: { 'aria-labelledby': 'records-title' } }, [
    el('div', { className: 'section-head' }, [
      el('h2', { className: 'section-title', text: 'Рекорды', attrs: { id: 'records-title' } }),
      el('span', { className: 'section-meta', text: settingsLabel(settings) }),
    ]),
    top.length === 0
      ? renderEmpty()
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
            top.map((record, index) => renderRow(record, index + 1, record === highlighted)),
          ),
        ]),
  ]);
};
