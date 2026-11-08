export type PluralForms = readonly [one: string, few: string, many: string];

export const pluralize = (_count: number, _forms: PluralForms): string => {
  throw new Error('Not implemented');
};

export const formatDuration = (_ms: number): string => {
  throw new Error('Not implemented');
};
