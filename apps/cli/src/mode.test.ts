import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getMode, setMode, isLocal, Mode } from './mode.js';

describe('mode', () => {
  beforeEach(() => {
    // Reset cached mode before each test
    setMode(undefined as unknown as Mode);
    // Reset process.env.SHANNON_LOCAL
    delete process.env.SHANNON_LOCAL;
  });

  describe('getMode', () => {
    it('returns local if SHANNON_LOCAL is 1', () => {
      process.env.SHANNON_LOCAL = '1';
      expect(getMode()).toBe('local');
    });

    it('returns npx if SHANNON_LOCAL is not 1', () => {
      process.env.SHANNON_LOCAL = '0';
      expect(getMode()).toBe('npx');
    });

    it('returns npx if SHANNON_LOCAL is undefined', () => {
      expect(getMode()).toBe('npx');
    });

    it('caches the mode', () => {
      process.env.SHANNON_LOCAL = '1';
      expect(getMode()).toBe('local');

      // Change env var, mode should still be local
      process.env.SHANNON_LOCAL = '0';
      expect(getMode()).toBe('local');
    });
  });

  describe('setMode', () => {
    it('overrides the cached mode', () => {
      setMode('local');
      expect(getMode()).toBe('local');

      setMode('npx');
      expect(getMode()).toBe('npx');
    });
  });

  describe('isLocal', () => {
    it('returns true if mode is local', () => {
      setMode('local');
      expect(isLocal()).toBe(true);
    });

    it('returns false if mode is npx', () => {
      setMode('npx');
      expect(isLocal()).toBe(false);
    });
  });
});
