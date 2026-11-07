type Primitive = string | number | boolean;

export const memoize = <Args extends readonly Primitive[], Result>(
  _fn: (...args: Args) => Result,
): ((...args: Args) => Result) => {
  throw new Error('Not implemented');
};
