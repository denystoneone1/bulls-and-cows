import { createDigitValidator, getDigits } from '../core/digits.js';
import { formatDuration, pluralize, type PluralForms } from '../core/format.js';
import { getElapsedMs, type Attempt, type GameState } from '../core/game.js';
import { sanitizeGuessInput } from '../core/input.js';
import { el, svg } from './dom.js';

export const MOVES: PluralForms = ['ход', 'хода', 'ходов'];
const BULLS: PluralForms = ['бык', 'быка', 'быков'];
const COWS: PluralForms = ['корова', 'коровы', 'коров'];

interface BoardViewProps {
  readonly game: GameState;
  readonly draft: string;
  readonly message: string | null;
  readonly crossedOut: ReadonlySet<string>;
  readonly now: number;
  readonly onDraft: (draft: string) => void;
  readonly onSubmit: () => void;
  readonly onToggleNote: (digit: string) => void;
  readonly onNewGame: () => void;
}

export interface BoardView {
  readonly element: HTMLElement;
  readonly timer: HTMLElement;
}

// Обвод от руки: неровный эллипс, который "рисуется" при победе
const handDrawnCircle = (): SVGSVGElement =>
  svg(
    'svg',
    {
      class: 'ink-circle',
      viewBox: '0 0 100 40',
      preserveAspectRatio: 'none',
      'aria-hidden': 'true',
    },
    [
      svg('path', {
        d: 'M9 23 C5 10 34 4 58 4 C83 4 97 12 96 22 C95 33 66 38 41 37 C18 36 3 29 7 17 C9 12 15 9 21 8',
        pathLength: 1,
      }),
    ],
  );

const scoreLabel = ({ bulls, cows }: Attempt): string =>
  `${String(bulls)} ${pluralize(bulls, BULLS)}, ${String(cows)} ${pluralize(cows, COWS)}`;

const renderAttempt = (attempt: Attempt, index: number, isWinning: boolean): HTMLLIElement =>
  el('li', { className: isWinning ? 'attempt attempt-won' : 'attempt' }, [
    el('span', { className: 'attempt-number', text: `${String(index + 1)}.` }),
    el('span', { className: 'attempt-digits' }, [
      ...attempt.guess.split('').map((digit) => el('span', { className: 'cell', text: digit })),
      isWinning ? handDrawnCircle() : null,
    ]),
    el('span', {
      className: 'attempt-score',
      text: `${String(attempt.bulls)}Б ${String(attempt.cows)}К`,
      attrs: { 'aria-label': scoreLabel(attempt) },
    }),
  ]);

const renderNotes = (
  game: GameState,
  crossedOut: ReadonlySet<string>,
  onToggleNote: (digit: string) => void,
): HTMLElement =>
  el('div', { className: 'notes' }, [
    el('span', { className: 'notes-name', text: 'Черновик', attrs: { id: 'notes-name' } }),
    el(
      'div',
      { className: 'notes-digits', attrs: { role: 'group', 'aria-labelledby': 'notes-name' } },
      getDigits(game.settings.base).map((digit) =>
        el('button', {
          className: 'note',
          text: digit,
          attrs: {
            type: 'button',
            'data-key': `note-${digit}`,
            'aria-pressed': crossedOut.has(digit) ? 'true' : 'false',
            title: crossedOut.has(digit) ? 'Вернуть цифру' : 'Зачеркнуть цифру',
          },
          on: {
            click: () => {
              onToggleNote(digit);
            },
          },
        }),
      ),
    ),
  ]);

const renderGuessForm = (
  { game, draft, onDraft, onSubmit }: BoardViewProps,
  messageId: string,
): HTMLFormElement => {
  const { length, base } = game.settings;
  const isDigit = createDigitValidator(base);
  const cells = Array.from({ length }, () => el('span', { className: 'cell' }));

  const showDraft = (value: string): void => {
    cells.forEach((cell, index) => {
      cell.textContent = value.charAt(index);
      cell.classList.toggle('cell-current', index === value.length);
    });
  };

  const input = el('input', {
    className: 'guess-input',
    attrs: {
      type: 'text',
      name: 'guess',
      'data-key': 'guess',
      value: draft,
      maxlength: length,
      inputmode: base === 16 ? 'text' : 'numeric',
      autocomplete: 'off',
      autocapitalize: 'off',
      spellcheck: 'false',
      'aria-label': `Ваш вариант: ${String(length)} разных цифр`,
      'aria-describedby': messageId,
    },
    on: {
      // Недопустимый символ даже не попадает в поле
      beforeinput: (event) => {
        if (
          event instanceof InputEvent &&
          event.data !== null &&
          !event.data.split('').every(isDigit)
        ) {
          event.preventDefault();
        }
      },
      // Вставка и автозаполнение проходят через ту же фильтрацию
      input: () => {
        const clean = sanitizeGuessInput(input.value, isDigit, length);
        if (clean !== input.value) {
          input.value = clean;
        }
        showDraft(clean);
        onDraft(clean);
      },
    },
  });

  showDraft(draft);

  return el(
    'form',
    {
      className: 'guess',
      on: {
        submit: (event) => {
          event.preventDefault();
          onSubmit();
        },
      },
    },
    [
      el('label', { className: 'guess-field' }, [
        input,
        el('span', { className: 'guess-cells', attrs: { 'aria-hidden': 'true' } }, cells),
      ]),
      el('button', {
        className: 'button button-primary',
        text: 'Проверить',
        attrs: { type: 'submit' },
      }),
    ],
  );
};

export const renderBoard = (props: BoardViewProps): BoardView => {
  const { game, message, crossedOut, now, onToggleNote, onNewGame } = props;
  const isWon = game.status === 'won';
  const moves = game.history.length;
  const messageId = 'guess-message';

  const timer = el('span', {
    className: 'timer',
    text: formatDuration(getElapsedMs(game, now)),
    attrs: { role: 'timer', 'aria-label': 'Время' },
  });

  const guessForm = isWon ? null : renderGuessForm(props, messageId);

  const verdict = isWon
    ? el('p', {
        className: 'verdict',
        text: `Угадано за ${String(moves)} ${pluralize(moves, MOVES)}. Время ${formatDuration(getElapsedMs(game, now))}.`,
      })
    : null;

  const element = el('section', { className: 'board', attrs: { 'aria-label': 'Игра' } }, [
    el('p', { className: 'board-meta' }, [
      el('span', { text: isWon ? `Ходов: ${String(moves)}` : `Ход ${String(moves + 1)}` }),
      timer,
    ]),
    guessForm ?? verdict,
    el('p', {
      className: message ? 'message' : 'message message-empty',
      text: message ?? '',
      attrs: { id: messageId, role: 'status' },
    }),
    isWon ? null : renderNotes(game, crossedOut, onToggleNote),
    moves > 0
      ? el(
          'ol',
          { className: 'history', attrs: { 'aria-label': 'Ходы' } },
          game.history.map((attempt, index) =>
            renderAttempt(attempt, index, isWon && index === moves - 1),
          ),
        )
      : el('p', {
          className: 'history-empty',
          text: 'Ходов пока нет. Введите число и нажмите "Проверить".',
        }),
    el('button', {
      className: isWon ? 'button button-primary' : 'button button-quiet',
      text: 'Новая игра',
      attrs: { type: 'button', 'data-key': 'new-game' },
      on: { click: onNewGame },
    }),
  ]);

  return { element, timer };
};
