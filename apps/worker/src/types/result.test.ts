import { describe, expect, it } from 'vitest';
import { err, isErr, isOk, ok } from './result.js';

describe('Result types', () => {
  describe('ok()', () => {
    it('should create an Ok object with the provided value', () => {
      const value = { id: 1, name: 'test' };
      const result = ok(value);

      expect(result).toEqual({ ok: true, value });
      expect(result.ok).toBe(true);
      expect(result.value).toBe(value);
    });

    it('should work with primitive values', () => {
      const result = ok(42);
      expect(result).toEqual({ ok: true, value: 42 });
    });
  });

  describe('err()', () => {
    it('should create an Err object with the provided error', () => {
      const error = new Error('test error');
      const result = err(error);

      expect(result).toEqual({ ok: false, error });
      expect(result.ok).toBe(false);
      expect(result.error).toBe(error);
    });

    it('should work with string errors', () => {
      const result = err('not found');
      expect(result).toEqual({ ok: false, error: 'not found' });
    });
  });

  describe('isOk()', () => {
    it('should return true for an Ok result', () => {
      const result = ok('test');
      expect(isOk(result)).toBe(true);
    });

    it('should return false for an Err result', () => {
      const result = err(new Error('test error'));
      expect(isOk(result)).toBe(false);
    });
  });

  describe('isErr()', () => {
    it('should return false for an Ok result', () => {
      const result = ok('test');
      expect(isErr(result)).toBe(false);
    });

    it('should return true for an Err result', () => {
      const result = err(new Error('test error'));
      expect(isErr(result)).toBe(true);
    });
  });
});
