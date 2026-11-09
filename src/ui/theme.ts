export type Theme = 'light' | 'dark';

const THEME_KEY = 'bulls-and-cows:theme';

const systemTheme = (): Theme =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

// Выбор игрока важнее системной темы; без хранилища берем системную
export const loadTheme = (): Theme => {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
  } catch {
    // Хранилище недоступно: остаемся на системной теме
  }
  return systemTheme();
};

export const saveTheme = (theme: Theme): void => {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Хранилище недоступно: тема сбросится при перезагрузке
  }
};

export const applyTheme = (theme: Theme): void => {
  document.documentElement.dataset.theme = theme;
};
