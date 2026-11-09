import { createDigitValidator, getDigits, type Base } from '../core/digits.js';
import { formatDuration } from '../core/format.js';
import { getElapsedMs, type Attempt, type GameState } from '../core/game.js';
import { sanitizeGuessInput } from '../core/input.js';
import { el } from './dom.js';
import { alertIcon, clockIcon } from './icons.js';
import {
  DIGITS,
  MOVES,
  countWord,
  describeResult,
  digitRange,
  renderMarkLegend,
  renderMarks,
  renderTag,
  settingsLabel,
} from './tag.js';

// Одноразовый повод для анимации: появляется только в ответ на действие игрока
export type BoardEffect = 'move' | 'error' | 'win' | null;

interface BoardViewProps {
  readonly game: GameState;
  readonly draft: string;
  readonly message: string | null;
  readonly duplicateMove: number | null;
  readonly crossedOut: ReadonlySet<string>;
  readonly now: number;
  readonly effect: BoardEffect;
  readonly place: number;
  readonly historyExpanded: boolean;
  readonly onDraft: (draft: string) => void;
  readonly onSubmit: () => void;
  readonly onToggleNote: (digit: string, crossed: boolean) => void;
  readonly onNewGame: () => void;
  readonly onExpandHistory: () => void;
}

export interface BoardView {
  readonly element: HTMLElement;
  readonly timer: HTMLElement;
}

const HISTORY_PREVIEW = 8;

const allowedDigitsText = (base: Base): string => (base === 16 ? '0-9 и A-F' : digitRange(base));

const newGameButton = (className: string, key: string, onNewGame: () => void): HTMLButtonElement =>
  el('button', {
    className,
    text: 'Новая игра',
    attrs: { type: 'button', 'data-key': key },
    on: { click: onNewGame },
  });

const readout = (label: string, value: readonly (Node | string)[]): HTMLElement =>
  el('div', { className: 'readout' }, [
    el('span', { className: 'readout-label', text: label }),
    el('span', { className: 'readout-value' }, value),
  ]);

const renderStatusBar = (
  game: GameState,
  timer: HTMLElement,
  onNewGame: () => void,
): HTMLElement => {
  const { length } = game.settings;

  return el('div', { className: 'status-bar' }, [
    readout('Ход', [String(game.history.length + 1)]),
    el('span', { className: 'status-divider', attrs: { 'aria-hidden': 'true' } }),
    readout('Время', [clockIcon(), timer]),
    el('div', { className: 'status-end' }, [
      el(
        'span',
        {
          className: 'hidden-secret',
          attrs: { role: 'img', 'aria-label': `Загадано ${countWord(length, DIGITS)}` },
        },
        Array.from({ length }, () => renderTag('?', 'tag-hidden')),
      ),
      newGameButton('button button-outline new-game-desktop', 'new-game', onNewGame),
    ]),
  ]);
};

const renderGuessForm = ({
  game,
  draft,
  message,
  effect,
  onDraft,
  onSubmit,
}: BoardViewProps): HTMLElement => {
  const { length, base } = game.settings;
  const isDigit = createDigitValidator(base);
  const texts = Array.from({ length }, () => el('span', { className: 'tag-text' }));
  const cells = texts.map((text) =>
    el('span', { className: 'tag tag-cell' }, [
      el('span', { className: 'tag-hole' }),
      text,
      el('span', { className: 'caret' }),
    ]),
  );

  const showDraft = (value: string): void => {
    texts.forEach((text, index) => {
      text.textContent = value.charAt(index);
    });
    cells.forEach((cell, index) => {
      cell.classList.toggle('is-filled', index < value.length);
      cell.classList.toggle('is-current', index === value.length);
    });
  };

  const input = el('input', {
    className: 'guess-input',
    attrs: {
      id: 'guess-input',
      type: 'text',
      name: 'guess',
      'data-key': 'guess',
      value: draft,
      maxlength: length,
      inputmode: base === 16 ? 'text' : 'numeric',
      autocomplete: 'off',
      autocapitalize: 'off',
      spellcheck: 'false',
      'aria-describedby': 'guess-hint',
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

  const cellClasses = [
    'guess-cells',
    message ? 'is-error' : '',
    effect === 'error' ? 'is-shaking' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const note = message
    ? el('p', { className: 'guess-error', attrs: { id: 'guess-hint', role: 'alert' } }, [
        alertIcon(),
        message,
      ])
    : el('p', { className: 'guess-hint', attrs: { id: 'guess-hint' } }, [
        `Цифры ${allowedDigitsText(base)} без повторов.`,
        el('span', { className: 'hint-keys', text: ' Enter: проверить, Backspace: стереть.' }),
      ]);

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
      el('label', { className: 'field-label', text: 'Ваш вариант', attrs: { for: 'guess-input' } }),
      el('div', { className: 'guess-row' }, [
        el('div', { className: 'guess-field' }, [
          input,
          el('div', { className: cellClasses, attrs: { 'aria-hidden': 'true' } }, cells),
        ]),
        el('button', {
          className: 'button button-primary check-button',
          text: 'Проверить',
          attrs: { type: 'submit' },
        }),
      ]),
      note,
    ],
  );
};

const noteLabel = (digit: string, crossed: boolean): string =>
  `Цифра ${digit.toUpperCase()}${crossed ? ', вычеркнута' : ''}`;

const renderNote = (
  digit: string,
  crossed: boolean,
  onToggleNote: (digit: string, crossed: boolean) => void,
): HTMLButtonElement => {
  const button = el(
    'button',
    {
      className: 'note',
      attrs: {
        type: 'button',
        'aria-pressed': crossed ? 'true' : 'false',
        'aria-label': noteLabel(digit, crossed),
        'data-key': `note-${digit}`,
      },
      on: {
        // Черновик меняется на месте, без перерисовки: так видна анимация зачеркивания
        click: () => {
          const next = button.getAttribute('aria-pressed') !== 'true';
          button.setAttribute('aria-pressed', next ? 'true' : 'false');
          button.setAttribute('aria-label', noteLabel(digit, next));
          onToggleNote(digit, next);
        },
      },
    },
    [
      el('span', { className: 'note-digit', text: digit }),
      el('span', { className: 'note-strike', attrs: { 'aria-hidden': 'true' } }),
    ],
  );

  return button;
};

const renderDraft = ({ game, crossedOut, onToggleNote }: BoardViewProps): HTMLElement =>
  el('div', { className: 'draft' }, [
    el('div', { className: 'block-head' }, [
      el('h3', { className: 'block-title', text: 'Черновик', attrs: { id: 'draft-title' } }),
      el('span', { className: 'block-meta', text: 'нажмите на цифру, которой точно нет' }),
    ]),
    el(
      'div',
      {
        className: game.settings.base === 16 ? 'draft-digits draft-digits-hex' : 'draft-digits',
        attrs: { role: 'group', 'aria-labelledby': 'draft-title' },
      },
      getDigits(game.settings.base).map((digit) =>
        renderNote(digit, crossedOut.has(digit), onToggleNote),
      ),
    ),
  ]);

const renderWin = ({ game, now, effect, place, onNewGame }: BoardViewProps): HTMLElement => {
  const moves = game.history.length;

  return el('div', { className: 'win' }, [
    el('span', { className: 'field-label', text: 'Загаданное число' }),
    el(
      'div',
      {
        className: effect === 'win' ? 'win-tags is-celebrating' : 'win-tags',
        attrs: { role: 'img', 'aria-label': `Загадано ${game.secret.toUpperCase()}` },
      },
      game.secret
        .split('')
        .map((digit) => renderTag(digit, 'tag-win', [el('span', { className: 'tag-punch' })])),
    ),
    el('h2', {
      className: 'screen-title win-title',
      text: `Угадано за ${countWord(moves, MOVES)}. Время ${formatDuration(getElapsedMs(game, now))}.`,
    }),
    place > 0
      ? el('p', { className: 'win-place' }, [
          el('span', { className: 'place-badge', text: `${String(place)}-е место` }),
          `в рекордах ${settingsLabel(game.settings)}`,
        ])
      : null,
    el('div', { className: 'win-actions' }, [
      newGameButton('button button-primary', 'new-game', onNewGame),
      el('span', { className: 'block-meta', text: 'вернет к настройкам' }),
    ]),
  ]);
};

const countHeader = (long: string, short: string): HTMLTableCellElement =>
  el('th', { className: 'col-count', attrs: { scope: 'col' } }, [
    el('span', { className: 'label-long', text: long }),
    el('span', { className: 'label-short', text: short, attrs: { 'aria-hidden': 'true' } }),
  ]);

const renderHistoryRow = (
  attempt: Attempt,
  move: number,
  props: BoardViewProps,
  isNewest: boolean,
): HTMLTableRowElement => {
  const isWin = props.game.status === 'won' && move === props.game.history.length;
  const classes = [
    move === props.duplicateMove ? 'is-duplicate' : '',
    isWin ? 'is-win' : '',
    isNewest && props.effect !== null && props.effect !== 'error' ? 'is-new' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return el('tr', { className: classes }, [
    el('td', { className: 'history-move', text: String(move).padStart(2, '0') }),
    el('td', {}, [el('span', { className: 'tag-inline', text: attempt.guess })]),
    el('td', { className: 'history-marks' }, [
      renderMarks(attempt, props.game.settings.length),
      el('span', { className: 'visually-hidden', text: describeResult(attempt) }),
    ]),
    el('td', {
      className: attempt.bulls ? 'num count' : 'num count is-zero',
      text: String(attempt.bulls),
    }),
    el('td', {
      className: attempt.cows ? 'num count' : 'num count is-zero',
      text: String(attempt.cows),
    }),
  ]);
};

const renderHistory = (props: BoardViewProps): HTMLElement => {
  const { game, historyExpanded, onExpandHistory } = props;
  const moves = game.history.length;
  const isCollapsed = moves > HISTORY_PREVIEW && !historyExpanded;
  // Свежий ход сверху: его и смотрят чаще всего
  const rows = game.history
    .map((attempt, index) => renderHistoryRow(attempt, index + 1, props, index === moves - 1))
    .reverse();

  const head = el('div', { className: 'block-head' }, [
    el('h3', { className: 'block-title' }, [
      'История',
      moves > 0
        ? el('span', { className: 'block-count', text: ` · ${countWord(moves, MOVES)}` })
        : null,
    ]),
    renderMarkLegend(),
  ]);

  if (moves === 0) {
    return el('div', { className: 'history' }, [
      head,
      el('div', { className: 'empty' }, [
        el('span', { className: 'tag tag-ghost', attrs: { 'aria-hidden': 'true' } }, [
          el('span', { className: 'tag-hole' }),
        ]),
        el('div', { className: 'empty-body' }, [
          el('p', { className: 'empty-title', text: 'Ходов пока нет' }),
          el('p', {
            className: 'empty-text',
            text: 'Введите вариант, и здесь появится первая бирка с пробивками.',
          }),
        ]),
      ]),
    ]);
  }

  return el('div', { className: 'history' }, [
    head,
    el('div', { className: isCollapsed ? 'history-scroll is-collapsed' : 'history-scroll' }, [
      el('table', { className: 'history-table' }, [
        el('caption', { className: 'visually-hidden', text: 'История ходов, последний сверху' }),
        el('thead', {}, [
          el('tr', {}, [
            el('th', { text: 'Ход', attrs: { scope: 'col' } }),
            el('th', { text: 'Число', attrs: { scope: 'col' } }),
            el('th', { text: 'Пробивки', attrs: { scope: 'col' } }),
            countHeader('Быки', 'Б'),
            countHeader('Коровы', 'К'),
          ]),
        ]),
        el('tbody', {}, rows),
      ]),
      isCollapsed
        ? el(
            'button',
            {
              className: 'history-more',
              attrs: { type: 'button', 'data-key': 'history-more' },
              on: { click: onExpandHistory },
            },
            [
              'Показать ранние ходы ',
              el('span', { className: 'num', text: `· ${String(moves - HISTORY_PREVIEW)}` }),
            ],
          )
        : null,
    ]),
  ]);
};

export const renderBoard = (props: BoardViewProps): BoardView => {
  const { game, now, onNewGame } = props;
  const timer = el('span', {
    className: 'timer',
    text: formatDuration(getElapsedMs(game, now)),
  });

  const content =
    game.status === 'won'
      ? [renderWin(props), renderHistory(props)]
      : [
          renderStatusBar(game, timer, onNewGame),
          renderGuessForm(props),
          renderDraft(props),
          renderHistory(props),
          newGameButton(
            'button button-outline button-wide new-game-mobile',
            'new-game-mobile',
            onNewGame,
          ),
        ];

  return {
    element: el(
      'section',
      { className: 'board', attrs: { 'aria-label': 'Игровое поле' } },
      content,
    ),
    timer,
  };
};
