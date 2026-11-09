import { formatDuration, pluralize } from '../core/format.js';
import {
  createGame,
  getElapsedMs,
  submitGuess,
  type GameState,
  type GuessError,
} from '../core/game.js';
import { addRecord, createRecord, getRecordsFor, type GameRecord } from '../core/records.js';
import { generateSecret } from '../core/secret.js';
import type { GameSettings } from '../core/settings.js';
import { renderBoard, type BoardEffect } from './board-view.js';
import { el } from './dom.js';
import { renderHeader } from './header-view.js';
import { renderRecords } from './records-view.js';
import { renderRules } from './rules-view.js';
import { renderSettings } from './settings-view.js';
import { loadRecords, saveRecords } from './storage.js';
import { DIGITS } from './tag.js';
import { applyTheme, loadTheme, saveTheme, type Theme } from './theme.js';

interface AppState {
  readonly settings: GameSettings;
  readonly game: GameState | null;
  readonly draft: string;
  readonly message: string | null;
  readonly duplicateMove: number | null;
  readonly crossedOut: ReadonlySet<string>;
  readonly records: readonly GameRecord[];
  readonly newRecord: GameRecord | null;
  readonly rulesOpen: boolean;
  readonly historyExpanded: boolean;
  readonly theme: Theme;
}

const DEFAULT_SETTINGS: GameSettings = { length: 4, base: 10 };

const withItem = (set: ReadonlySet<string>, item: string, present: boolean): ReadonlySet<string> =>
  present ? new Set([...set, item]) : new Set([...set].filter((value) => value !== item));

export const mountApp = (root: HTMLElement): void => {
  // Состояние интерфейса заменяется целиком, как и состояние игры в ядре
  let state: AppState = {
    settings: DEFAULT_SETTINGS,
    game: null,
    draft: '',
    message: null,
    duplicateMove: null,
    crossedOut: new Set(),
    records: loadRecords(),
    newRecord: null,
    rulesOpen: false,
    historyExpanded: false,
    theme: loadTheme(),
  };
  let tick: number | undefined;
  // Куда поставить фокус после перерисовки; без него фокус остается на том же элементе
  let focusKey: string | null = null;
  let effect: BoardEffect = null;

  const stopTimer = (): void => {
    window.clearInterval(tick);
    tick = undefined;
  };

  const update = (patch: Partial<AppState>): void => {
    state = { ...state, ...patch };
    render();
  };

  const freshRound: Partial<AppState> = {
    draft: '',
    message: null,
    duplicateMove: null,
    crossedOut: new Set(),
    rulesOpen: false,
    historyExpanded: false,
  };

  const startGame = (): void => {
    const { settings } = state;
    focusKey = 'guess';
    update({
      ...freshRound,
      game: createGame(settings, generateSecret(settings.length, settings.base), Date.now()),
      newRecord: null,
    });
  };

  const newGame = (): void => {
    stopTimer();
    focusKey = 'start';
    update({ ...freshRound, game: null });
  };

  const rejectGuess = (game: GameState, error: GuessError): void => {
    const { length } = game.settings;
    effect = 'error';

    if (error === 'duplicate') {
      const move = game.history.findIndex((attempt) => attempt.guess === state.draft) + 1;
      update({
        message: `Это число уже проверяли на ${String(move)}-м ходу.`,
        duplicateMove: move,
      });
      return;
    }
    update({
      message: `Нужно ${String(length)} ${pluralize(length, DIGITS)} без повторов.`,
      duplicateMove: null,
    });
  };

  const finish = (game: GameState): void => {
    stopTimer();
    const record = createRecord(game);
    const records = record ? addRecord(state.records, record) : state.records;
    saveRecords(records);
    focusKey = 'new-game';
    effect = 'win';
    update({ ...freshRound, game, records, newRecord: record });
  };

  const submit = (): void => {
    if (!state.game) {
      return;
    }
    const { state: game, error } = submitGuess(state.game, state.draft, Date.now());
    focusKey = 'guess';

    if (error) {
      rejectGuess(state.game, error);
      return;
    }
    if (game.status === 'won') {
      finish(game);
      return;
    }
    effect = 'move';
    update({ game, draft: '', message: null, duplicateMove: null });
  };

  const changeDraft = (draft: string): void => {
    // Ошибка снимается, как только игрок начал править вариант
    if (state.message !== null) {
      update({ draft, message: null, duplicateMove: null });
      return;
    }
    state = { ...state, draft };
  };

  const toggleTheme = (): void => {
    const theme: Theme = state.theme === 'dark' ? 'light' : 'dark';
    saveTheme(theme);
    update({ theme });
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
    const target = key ? root.querySelector<HTMLElement>(`[data-key="${key}"]`) : null;
    target?.focus();
    // Курсор в конец: цифры дописываются справа
    if (target instanceof HTMLInputElement) {
      target.setSelectionRange(target.value.length, target.value.length);
    }
  };

  const recordPlace = (): number =>
    state.newRecord ? getRecordsFor(state.records, state.settings).indexOf(state.newRecord) + 1 : 0;

  const render = (): void => {
    const { game } = state;
    const previousKey =
      document.activeElement instanceof HTMLElement
        ? document.activeElement.dataset.key
        : undefined;
    applyTheme(state.theme);

    const board = game
      ? renderBoard({
          game,
          draft: state.draft,
          message: state.message,
          duplicateMove: state.duplicateMove,
          crossedOut: state.crossedOut,
          now: Date.now(),
          effect,
          place: recordPlace(),
          historyExpanded: state.historyExpanded,
          onDraft: changeDraft,
          onSubmit: submit,
          onToggleNote: (digit, crossed) => {
            state = { ...state, crossedOut: withItem(state.crossedOut, digit, crossed) };
          },
          onNewGame: newGame,
          onExpandHistory: () => {
            update({ historyExpanded: true });
          },
        })
      : null;

    const showRules = !game || state.rulesOpen;

    root.replaceChildren(
      el('div', { className: game ? 'app is-locked' : 'app' }, [
        renderHeader({
          theme: state.theme,
          showRulesToggle: game !== null,
          rulesOpen: state.rulesOpen,
          onToggleTheme: toggleTheme,
          onToggleRules: () => {
            update({ rulesOpen: !state.rulesOpen });
          },
        }),
        el('main', { className: 'layout' }, [
          el('div', { className: 'area-settings' }, [
            renderSettings({
              settings: state.settings,
              locked: game !== null,
              onChange: (settings) => {
                update({ settings, newRecord: null });
              },
              onStart: startGame,
            }),
          ]),
          el('div', { className: 'area-main' }, [
            showRules ? renderRules() : null,
            board?.element ?? null,
          ]),
          el('div', { className: 'area-records' }, [
            renderRecords({
              records: state.records,
              settings: state.settings,
              highlighted: state.newRecord,
            }),
          ]),
        ]),
      ]),
    );

    effect = null;
    if (board) {
      syncTimer(board.timer);
    }
    restoreFocus(previousKey);
  };

  render();
};
