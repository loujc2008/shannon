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
    it('should work with null', () => {
      const result = err(null);
      expect(result).toEqual({ ok: false, error: null });
    });

    it('should work with custom objects', () => {
      const errorObj = { code: 500, message: 'Internal Server Error' };
      const result = err(errorObj);
      expect(result).toEqual({ ok: false, error: errorObj });
    });

    it('should work with arrays', () => {
      const errorArray = ['error1', 'error2'];
      const result = err(errorArray);
      expect(result).toEqual({ ok: false, error: errorArray });
    });

    it('should work with numbers', () => {
      const result = err(404);
      expect(result).toEqual({ ok: false, error: 404 });
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
