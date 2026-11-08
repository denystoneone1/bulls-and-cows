import { formatDuration, pluralize, type PluralForms } from '../core/format.js';
import { createGame, getElapsedMs, submitGuess, type GameState } from '../core/game.js';
import { addRecord, createRecord, type GameRecord } from '../core/records.js';
import { generateSecret } from '../core/secret.js';
import type { GameSettings } from '../core/settings.js';
import { renderBoard } from './board-view.js';
import { el } from './dom.js';
import { renderRecords } from './records-view.js';
import { renderSettings } from './settings-view.js';
import { loadRecords, saveRecords } from './storage.js';

interface AppState {
  readonly settings: GameSettings;
  readonly game: GameState | null;
  readonly draft: string;
  readonly message: string | null;
  readonly crossedOut: ReadonlySet<string>;
  readonly records: readonly GameRecord[];
  readonly newRecord: GameRecord | null;
}

const DIGITS: PluralForms = ['цифра', 'цифры', 'цифр'];
const DEFAULT_SETTINGS: GameSettings = { length: 4, base: 10 };

const toggle = (set: ReadonlySet<string>, item: string): ReadonlySet<string> =>
  set.has(item) ? new Set([...set].filter((value) => value !== item)) : new Set([...set, item]);

export const mountApp = (root: HTMLElement): void => {
  // Состояние интерфейса заменяется целиком, как и состояние игры в ядре
  let state: AppState = {
    settings: DEFAULT_SETTINGS,
    game: null,
    draft: '',
    message: null,
    crossedOut: new Set(),
    records: loadRecords(),
    newRecord: null,
  };
  let tick: number | undefined;
  // Куда поставить фокус после перерисовки; без него фокус остается на том же элементе
  let focusKey: string | null = null;

  const stopTimer = (): void => {
    window.clearInterval(tick);
    tick = undefined;
  };

  const update = (patch: Partial<AppState>): void => {
    state = { ...state, ...patch };
    render();
  };

  const startGame = (): void => {
    const now = Date.now();
    focusKey = 'guess';
    update({
      game: createGame(
        state.settings,
        generateSecret(state.settings.length, state.settings.base),
        now,
      ),
      draft: '',
      message: null,
      crossedOut: new Set(),
      newRecord: null,
    });
  };

  const newGame = (): void => {
    stopTimer();
    focusKey = 'start';
    update({ game: null, draft: '', message: null, crossedOut: new Set() });
  };

  const explainRejection = (
    game: GameState,
    error: 'invalid' | 'duplicate' | 'finished',
  ): string => {
    const { length } = game.settings;
    if (error === 'duplicate') {
      const move = game.history.findIndex((attempt) => attempt.guess === state.draft) + 1;
      return `Это число уже проверяли на ${String(move)}-м ходу.`;
    }
    if (error === 'invalid') {
      return `Нужно ${String(length)} ${pluralize(length, DIGITS)} без повторов.`;
    }
    return 'Игра уже закончена.';
  };

  const finish = (game: GameState): void => {
    stopTimer();
    const record = createRecord(game);
    if (!record) {
      return;
    }
    const records = addRecord(state.records, record);
    saveRecords(records);
    focusKey = 'new-game';
    update({ game, draft: '', message: null, records, newRecord: record });
  };

  const submit = (): void => {
    if (!state.game) {
      return;
    }
    const { state: game, error } = submitGuess(state.game, state.draft, Date.now());
    focusKey = 'guess';

    if (error) {
      update({ message: explainRejection(state.game, error) });
      return;
    }
    if (game.status === 'won') {
      finish(game);
      return;
    }
    update({ game, draft: '', message: null });
  };

  const syncTimer = (timer: HTMLElement): void => {
    stopTimer();
    if (state.game?.status !== 'playing') {
      return;
    }
    tick = window.setInterval(() => {
      if (state.game) {
        timer.textContent = formatDuration(getElapsedMs(state.game, Date.now()));
      }
    }, 1000);
  };

  const restoreFocus = (previousKey: string | undefined): void => {
    const key = focusKey ?? previousKey;
    focusKey = null;
    if (key) {
      root.querySelector<HTMLElement>(`[data-key="${key}"]`)?.focus();
    }
  };

  const render = (): void => {
    const { game } = state;
    const previousKey =
      document.activeElement instanceof HTMLElement
        ? document.activeElement.dataset.key
        : undefined;
    const board = game
      ? renderBoard({
          game,
          draft: state.draft,
          message: state.message,
          crossedOut: state.crossedOut,
          now: Date.now(),
          onDraft: (draft) => {
            state = { ...state, draft, message: null };
          },
          onSubmit: submit,
          onToggleNote: (digit) => {
            update({ crossedOut: toggle(state.crossedOut, digit) });
          },
          onNewGame: newGame,
        })
      : null;

    root.replaceChildren(
      el('main', { className: 'page' }, [
        el('header', { className: 'page-head' }, [
          el('h1', { className: 'title', text: 'Быки и коровы' }),
          el('p', {
            className: 'rules',
            text: 'Компьютер загадывает число из разных цифр. После каждой попытки вы узнаете, сколько цифр стоят на своих местах (быки) и сколько есть в числе, но стоят не там (коровы).',
          }),
        ]),
        renderSettings({
          settings: state.settings,
          locked: game !== null,
          onChange: (settings) => {
            update({ settings, newRecord: null });
          },
          onStart: startGame,
        }),
        board?.element ?? null,
        renderRecords({
          records: state.records,
          settings: state.settings,
          highlighted: state.newRecord,
        }),
      ]),
    );

    if (board) {
      syncTimer(board.timer);
    }
    restoreFocus(previousKey);
  };

  render();
};
