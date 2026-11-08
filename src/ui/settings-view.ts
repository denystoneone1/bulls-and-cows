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

interface SettingsViewProps {
  readonly settings: GameSettings;
  readonly locked: boolean;
  readonly onChange: (settings: GameSettings) => void;
  readonly onStart: () => void;
}

const numberFormat = new Intl.NumberFormat('ru-RU');

interface ChoiceOptions {
  readonly name: string;
  readonly value: number;
  readonly label: readonly (Node | string)[];
  readonly accessibleName: string;
  readonly checked: boolean;
  readonly disabled: boolean;
  readonly onSelect: () => void;
}

const choice = (options: ChoiceOptions): HTMLLabelElement =>
  el('label', { className: 'choice' }, [
    el('input', {
      className: 'choice-input',
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
    el('span', { className: 'choice-mark' }, options.label),
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

  const baseChoices = BASE_OPTIONS.map(({ name, base }) =>
    choice({
      name: 'base',
      value: base,
      label: [name, el('sub', { text: String(base) })],
      accessibleName: `${name}, основание ${String(base)}`,
      checked: base === settings.base,
      disabled: false,
      onSelect: selectBase(base),
    }),
  );

  const lengthChoices = LENGTH_OPTIONS.map((length) =>
    choice({
      name: 'length',
      value: length,
      label: [String(length)],
      accessibleName: String(length),
      checked: length === settings.length,
      disabled: !isLengthAvailable(length, settings.base),
      onSelect: selectLength(length),
    }),
  );

  const variants = countPossibleSecrets(settings.length, settings.base);

  return el(
    'form',
    {
      className: 'settings',
      attrs: { 'aria-label': 'Настройки игры' },
      on: {
        submit: (event) => {
          event.preventDefault();
          onStart();
        },
      },
    },
    [
      el('fieldset', { className: 'setting', attrs: { disabled: locked } }, [
        el('legend', { className: 'setting-name', text: 'Система счисления' }),
        el('div', { className: 'choices' }, baseChoices),
      ]),
      el('fieldset', { className: 'setting', attrs: { disabled: locked } }, [
        el('legend', { className: 'setting-name', text: 'Цифр в числе' }),
        el('div', { className: 'choices' }, lengthChoices),
      ]),
      el('p', { className: 'variants' }, [
        'Возможных чисел: ',
        el('span', { className: 'variants-count', text: numberFormat.format(variants) }),
      ]),
      locked
        ? null
        : el('button', {
            className: 'button button-primary',
            text: 'Загадать число',
            attrs: { type: 'submit', 'data-key': 'start' },
          }),
    ],
  );
};
