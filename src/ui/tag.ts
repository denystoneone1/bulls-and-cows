import type { Base } from '../core/digits.js';
import { pluralize, type PluralForms } from '../core/format.js';
import type { GuessResult } from '../core/guess.js';
import { BASE_OPTIONS, type GameSettings } from '../core/settings.js';
import { el } from './dom.js';

const BULLS: PluralForms = ['бык', 'быка', 'быков'];
const COWS: PluralForms = ['корова', 'коровы', 'коров'];
export const DIGITS: PluralForms = ['цифра', 'цифры', 'цифр'];

export const MOVES: PluralForms = ['ход', 'хода', 'ходов'];

const DIGIT_RANGES: Readonly<Record<Base, string>> = {
  2: '0-1',
  8: '0-7',
  10: '0-9',
  16: '0-F',
};

export const digitRange = (base: Base): string => DIGIT_RANGES[base];

export const countWord = (count: number, forms: PluralForms): string =>
  `${String(count)} ${pluralize(count, forms)}`;

export const settingsLabel = ({ base, length }: GameSettings): string => {
  const name = BASE_OPTIONS.find((option) => option.base === base)?.name ?? String(base);
  return `${name} · ${countWord(length, DIGITS)}`;
};

export const describeResult = ({ bulls, cows }: GuessResult): string =>
  `${countWord(bulls, BULLS)}, ${countWord(cows, COWS)}`;

// Бирка: пластик с отверстием под крепление и крупной цифрой
export const renderTag = (
  text: string,
  variant: string,
  children: readonly Node[] = [],
): HTMLElement =>
  el('span', { className: `tag ${variant}` }, [
    el('span', { className: 'tag-hole', attrs: { 'aria-hidden': 'true' } }),
    el('span', { className: 'tag-text', text }),
    ...children,
  ]);

const markKind = (index: number, { bulls, cows }: GuessResult): string => {
  if (index < bulls) {
    return 'mark-bull';
  }
  return index < bulls + cows ? 'mark-cow' : 'mark-miss';
};

// Пробивки: сначала быки, потом коровы, потом "мимо", порядок не выдает позиций
export const renderMarks = (result: GuessResult, length: number): HTMLElement =>
  el(
    'span',
    { className: 'marks', attrs: { 'aria-hidden': 'true' } },
    Array.from({ length }, (_, index) =>
      el('span', {
        className: `mark ${markKind(index, result)}`,
        attrs: { style: `--i: ${String(index)}` },
      }),
    ),
  );

export const renderMarkLegend = (): HTMLElement =>
  el('span', { className: 'mark-legend', attrs: { 'aria-hidden': 'true' } }, [
    el('span', { className: 'mark-legend-item' }, [
      el('span', { className: 'mark mark-bull' }),
      'бык',
    ]),
    el('span', { className: 'mark-legend-item' }, [
      el('span', { className: 'mark mark-cow' }),
      'корова',
    ]),
    el('span', { className: 'mark-legend-item' }, [
      el('span', { className: 'mark mark-miss' }),
      'мимо',
    ]),
  ]);
