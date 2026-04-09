import { describe, expect, it } from 'vitest';
import { calculatePercentage, extractAgentType, formatDuration, formatTimestamp } from './formatting.js';

describe('calculatePercentage', () => {
  it('calculates percentage correctly for normal values', () => {
    expect(calculatePercentage(50, 100)).toBe(50);
    expect(calculatePercentage(1, 4)).toBe(25);
    expect(calculatePercentage(3, 4)).toBe(75);
  });

  it('handles zero total to prevent divide by zero errors', () => {
    expect(calculatePercentage(10, 0)).toBe(0);
  });

  it('handles zero part correctly', () => {
    expect(calculatePercentage(0, 100)).toBe(0);
  });

  it('handles part larger than total', () => {
    expect(calculatePercentage(150, 100)).toBe(150);
  });

  it('handles negative values correctly', () => {
    expect(calculatePercentage(-25, 100)).toBe(-25);
  });
});

describe('formatDuration', () => {
  it('formats milliseconds correctly', () => {
    expect(formatDuration(500)).toBe('500ms');
  });

  it('formats seconds correctly', () => {
    expect(formatDuration(1500)).toBe('1.5s');
  });

  it('formats minutes and seconds correctly', () => {
    expect(formatDuration(60000)).toBe('1m 0s');
    expect(formatDuration(125000)).toBe('2m 5s');
  });
});

describe('formatTimestamp', () => {
  it('formats timestamp to ISO string', () => {
    const timestamp = 1672531200000; // 2023-01-01T00:00:00.000Z
    expect(formatTimestamp(timestamp)).toBe('2023-01-01T00:00:00.000Z');
  });

  it('uses current time if no argument provided', () => {
    const result = formatTimestamp();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });
});

describe('extractAgentType', () => {
  it('extracts correct type from descriptions', () => {
    expect(extractAgentType('Pre-recon agent')).toBe('pre-reconnaissance');
    expect(extractAgentType('Recon agent')).toBe('reconnaissance');
    expect(extractAgentType('Report agent')).toBe('report generation');
    expect(extractAgentType('Vuln agent')).toBe('analysis');
  });
});
