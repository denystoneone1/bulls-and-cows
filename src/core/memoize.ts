type Primitive = string | number | boolean;

export const memoize = <Args extends readonly Primitive[], Result>(
  fn: (...args: Args) => Result,
): ((...args: Args) => Result) => {
  // Кеш спрятан в замыкании: снаружи функция остается чистой
  const cache = new Map<string, { readonly value: Result }>();

  return (...args) => {
    const key = JSON.stringify(args);
    const cached = cache.get(key);

    if (cached) {
      return cached.value;
    }

    const value = fn(...args);
    cache.set(key, { value });

    return value;
  };
};
