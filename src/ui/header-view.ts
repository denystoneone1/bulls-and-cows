import { el } from './dom.js';
import { moonIcon, questionIcon, sunIcon } from './icons.js';
import { renderTag } from './tag.js';
import type { Theme } from './theme.js';

interface HeaderViewProps {
  readonly theme: Theme;
  readonly showRulesToggle: boolean;
  readonly rulesOpen: boolean;
  readonly onToggleTheme: () => void;
  readonly onToggleRules: () => void;
}

export const renderHeader = ({
  theme,
  showRulesToggle,
  rulesOpen,
  onToggleTheme,
  onToggleRules,
}: HeaderViewProps): HTMLElement => {
  const isDark = theme === 'dark';

  const rulesToggle = showRulesToggle
    ? el(
        'button',
        {
          className: 'rules-toggle',
          attrs: {
            type: 'button',
            'aria-expanded': rulesOpen ? 'true' : 'false',
            'aria-controls': 'rules',
            'aria-label': 'Правила',
            'data-key': 'rules-toggle',
          },
          on: { click: onToggleRules },
        },
        [
          el('span', {
            className: 'rules-toggle-text',
            text: rulesOpen ? 'Скрыть правила' : 'Правила',
          }),
          el('span', { className: 'rules-toggle-icon' }, [questionIcon()]),
        ],
      )
    : null;

  return el('header', { className: 'page-header' }, [
    el('div', { className: 'brand' }, [
      renderTag('БК', 'tag-logo'),
      el('span', { className: 'brand-name', text: 'Быки и коровы' }),
    ]),
    el('div', { className: 'header-actions' }, [
      rulesToggle,
      el(
        'button',
        {
          className: 'icon-button',
          attrs: {
            type: 'button',
            'aria-label': isDark ? 'Включить светлую тему' : 'Включить темную тему',
            'data-key': 'theme-toggle',
          },
          on: { click: onToggleTheme },
        },
        [isDark ? sunIcon() : moonIcon()],
      ),
    ]),
  ]);
};
