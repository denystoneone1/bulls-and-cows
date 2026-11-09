import type { Base } from '../core/digits.js';
import { countPossibleSecrets } from '../core/secret.js';
import {
  BASE_OPTIONS,
  LENGTH_OPTIONS,
  fitLengthToBase,
  isLengthAvailable,
  type GameSettings,
} from '../core/settings.js';
import { el } from './dom.js';
import { infoIcon, lockIcon } from './icons.js';
import { digitRange, settingsLabel } from './tag.js';

interface SettingsViewProps {
  readonly settings: GameSettings;
  readonly locked: boolean;
  readonly onChange: (settings: GameSettings) => void;
  readonly onStart: () => void;
}

interface SegmentOptions {
  readonly name: string;
  readonly value: number;
  readonly face: readonly (Node | string)[];
  readonly accessibleName: string;
  readonly checked: boolean;
  readonly disabled: boolean;
  readonly onSelect: () => void;
}

const numberFormat = new Intl.NumberFormat('ru-RU');

// Настоящая радиокнопка под видом сегмента: работают стрелки и скринридеры
const segment = (options: SegmentOptions): HTMLLabelElement =>
  el('label', { className: 'segment' }, [
    el('input', {
      className: 'segment-input',
      attrs: {
        type: 'radio',
        name: options.name,
        value: options.value,
        checked: options.checked,
        disabled: options.disabled,
        'aria-label': options.accessibleName,
        'data-key': `${options.name}-${String(options.value)}`,
      },
      on: { change: options.onSelect },
    }),
    el('span', { className: 'segment-face' }, options.face),
  ]);

const renderCompact = (settings: GameSettings): HTMLElement =>
  el('p', { className: 'settings-compact' }, [
    lockIcon(18),
    el('span', { className: 'settings-compact-value', text: settingsLabel(settings) }),
    el('span', { className: 'settings-compact-note', text: 'заблокировано' }),
  ]);

export const renderSettings = ({
  settings,
  locked,
  onChange,
  onStart,
}: SettingsViewProps): HTMLElement => {
  const selectBase = (base: Base) => () => {
    onChange({ base, length: fitLengthToBase(settings.length, base) });
  };
  const selectLength = (length: number) => () => {
    onChange({ ...settings, length });
  };

  const baseSegments = BASE_OPTIONS.map(({ name, base }) =>
    segment({
      name: 'base',
      value: base,
      face: [
        el('span', { className: 'segment-label', text: name }),
        el('span', { className: 'segment-range', text: digitRange(base) }),
      ],
      accessibleName: `${name}, цифры ${digitRange(base)}`,
      checked: base === settings.base,
      disabled: false,
      onSelect: selectBase(base),
    }),
  );

  const lengthSegments = LENGTH_OPTIONS.map((length) =>
    segment({
      name: 'length',
      value: length,
      face: [el('span', { className: 'segment-label', text: String(length) })],
      accessibleName: String(length),
      checked: length === settings.length,
      disabled: !isLengthAvailable(length, settings.base),
      onSelect: selectLength(length),
    }),
  );

  const form = el(
    'form',
    {
      className: locked ? 'settings is-locked' : 'settings',
      attrs: { 'aria-labelledby': 'settings-title' },
      on: {
        submit: (event) => {
          event.preventDefault();
          onStart();
        },
      },
    },
    [
      el('div', { className: 'section-head' }, [
        el('h2', {
          className: 'section-title',
          text: 'Настройки',
          attrs: { id: 'settings-title' },
        }),
        locked
          ? el('p', { className: 'lock-note' }, [lockIcon(), 'заблокированы до конца партии'])
          : null,
      ]),
      el('fieldset', { className: 'setting', attrs: { disabled: locked } }, [
        el('legend', { className: 'setting-name', text: 'Система счисления' }),
        el('div', { className: 'segments segments-base' }, baseSegments),
      ]),
      el('fieldset', { className: 'setting', attrs: { disabled: locked } }, [
        el('legend', { className: 'setting-name', text: 'Длина числа' }),
        el('div', { className: 'segments segments-length' }, lengthSegments),
        settings.base === 2
          ? el('p', { className: 'setting-note' }, [infoIcon(), 'Для bin доступна только длина 2'])
          : null,
      ]),
      el('p', { className: 'variants' }, [
        el('span', { className: 'variants-label', text: 'Возможных чисел' }),
        el('span', {
          className: 'variants-count',
          text: numberFormat.format(countPossibleSecrets(settings.length, settings.base)),
        }),
      ]),
      locked
        ? null
        : el('button', {
            className: 'button button-primary button-wide',
            text: 'Загадать число',
            attrs: { type: 'submit', 'data-key': 'start' },
          }),
    ],
  );

  return el('section', { className: 'settings-section', attrs: { 'aria-label': 'Настройки' } }, [
    locked ? renderCompact(settings) : null,
    form,
  ]);
};
