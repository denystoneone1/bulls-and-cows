export type PluralForms = readonly [one: string, few: string, many: string];

// Русские правила: 1 ход, 2 хода, 5 ходов, но 11-14 всегда "ходов"
export const pluralize = (count: number, [one, few, many]: PluralForms): string => {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;
  const isTeen = lastTwoDigits >= 11 && lastTwoDigits <= 14;

  if (isTeen) {
    return many;
  }
  if (lastDigit === 1) {
    return one;
  }
  return lastDigit >= 2 && lastDigit <= 4 ? few : many;
};

const padTwo = (value: number): string => String(value).padStart(2, '0');

export const formatDuration = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return hours > 0
    ? `${String(hours)}:${padTwo(minutes)}:${padTwo(seconds)}`
    : `${String(minutes)}:${padTwo(seconds)}`;
};
