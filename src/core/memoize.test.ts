import { describe, expect, it, vi } from 'vitest';
import { memoize } from './memoize.js';

describe('memoize', () => {
  it('returns the same result as the original function', () => {
    const add = memoize((a: number, b: number) => a + b);

    expect(add(2, 3)).toBe(5);
  });

  it('calls the original function only once for the same arguments', () => {
    const square = vi.fn((x: number) => x * x);
    const memoizedSquare = memoize(square);

    memoizedSquare(4);
    memoizedSquare(4);

    expect(square).toHaveBeenCalledTimes(1);
    expect(memoizedSquare(4)).toBe(16);
  });

  it('calls the original function again for different arguments', () => {
    const square = vi.fn((x: number) => x * x);
    const memoizedSquare = memoize(square);

    memoizedSquare(2);
    memoizedSquare(3);

    expect(square).toHaveBeenCalledTimes(2);
  });

  it('does not mix up arguments that join into the same string', () => {
    const join = memoize((a: number, b: number) => `${String(a)}|${String(b)}`);

    expect(join(1, 23)).toBe('1|23');
    expect(join(12, 3)).toBe('12|3');
  });

  it('caches falsy results too', () => {
    const isZero = vi.fn((x: number) => x === 0);
    const memoizedIsZero = memoize(isZero);

    memoizedIsZero(5);
    memoizedIsZero(5);

    expect(isZero).toHaveBeenCalledTimes(1);
  });

  it('keeps a separate cache for each memoized function', () => {
    const double = memoize((x: number) => x * 2);
    const triple = memoize((x: number) => x * 3);

    expect(double(5)).toBe(10);
    expect(triple(5)).toBe(15);
  });
});
