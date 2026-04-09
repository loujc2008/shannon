import { describe, expect, it, vi } from 'vitest';
import { randomSuffix } from './docker.js';

describe('randomSuffix', () => {
  it('should return a string of length 6', () => {
    const mockRandom = vi.spyOn(Math, 'random').mockReturnValue(0.123456789);
    const suffix = randomSuffix();
    expect(suffix).toBe('4fzzzx');
    expect(suffix).toHaveLength(6);
    mockRandom.mockRestore();
  });

  it('should generate valid base36 strings', () => {
    const mockRandom = vi.spyOn(Math, 'random').mockReturnValue(0.987654321);
    const suffix = randomSuffix();
    expect(suffix).toMatch(/^[0-9a-z]{6}$/);
    mockRandom.mockRestore();
  });
});
