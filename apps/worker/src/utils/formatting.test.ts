import { describe, it, expect } from 'vitest';
import {
  formatDuration,
  formatTimestamp,
  calculatePercentage,
  extractAgentType
} from './formatting.js';

describe('formatDuration', () => {
  it('should format milliseconds correctly (ms < 1000)', () => {
    expect(formatDuration(500)).toBe('500ms');
    expect(formatDuration(0)).toBe('0ms');
    expect(formatDuration(999)).toBe('999ms');
  });

  it('should format seconds correctly (1000 <= ms < 60000)', () => {
    expect(formatDuration(1000)).toBe('1.0s');
    expect(formatDuration(1500)).toBe('1.5s');
    expect(formatDuration(59900)).toBe('59.9s');
  });

  it('should format minutes and seconds correctly (ms >= 60000)', () => {
    expect(formatDuration(60000)).toBe('1m 0s');
    expect(formatDuration(61000)).toBe('1m 1s');
    expect(formatDuration(119000)).toBe('1m 59s');
    expect(formatDuration(120000)).toBe('2m 0s');
    expect(formatDuration(3600000)).toBe('60m 0s');
    expect(formatDuration(3601500)).toBe('60m 1s');
  });

  it('should handle negative values correctly (though maybe unintended)', () => {
    expect(formatDuration(-500)).toBe('-500ms');
  });
});

describe('formatTimestamp', () => {
  it('should format timestamp to ISO string', () => {
    const timestamp = 1672531200000; // 2023-01-01T00:00:00.000Z
    expect(formatTimestamp(timestamp)).toBe('2023-01-01T00:00:00.000Z');
  });
});

describe('calculatePercentage', () => {
  it('should calculate percentages correctly', () => {
    expect(calculatePercentage(50, 100)).toBe(50);
    expect(calculatePercentage(1, 4)).toBe(25);
    expect(calculatePercentage(3, 3)).toBe(100);
  });

  it('should return 0 when total is 0 to avoid division by zero', () => {
    expect(calculatePercentage(50, 0)).toBe(0);
  });

  it('should return 0 when part is 0', () => {
    expect(calculatePercentage(0, 100)).toBe(0);
  });
});

describe('extractAgentType', () => {
  it('should extract correct agent types from description', () => {
    expect(extractAgentType('Running Pre-recon tests')).toBe('pre-reconnaissance');
    expect(extractAgentType('Starting Recon phase')).toBe('reconnaissance');
    expect(extractAgentType('Generating Final Report')).toBe('report generation');
  });

  it('should fallback to analysis for unknown descriptions', () => {
    expect(extractAgentType('Scanning ports')).toBe('analysis');
    expect(extractAgentType('Unknown task')).toBe('analysis');
  });
});
