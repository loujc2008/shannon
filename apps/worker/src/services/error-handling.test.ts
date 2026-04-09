import { describe, expect, it } from 'vitest';
import { isRetryableError } from './error-handling.js';

describe('isRetryableError', () => {
  it('should return true for network and connection errors', () => {
    expect(isRetryableError(new Error('network error'))).toBe(true);
    expect(isRetryableError(new Error('connection refused'))).toBe(true);
    expect(isRetryableError(new Error('timeout exceeded'))).toBe(true);
    expect(isRetryableError(new Error('econnreset'))).toBe(true);
  });

  it('should return true for rate limits', () => {
    expect(isRetryableError(new Error('rate limit reached'))).toBe(true);
    expect(isRetryableError(new Error('too many requests'))).toBe(true);
    expect(isRetryableError(new Error('status code 429'))).toBe(true);
  });

  it('should return false for authentication errors', () => {
    expect(isRetryableError(new Error('authentication failed'))).toBe(false);
    expect(isRetryableError(new Error('invalid api key'))).toBe(false);
  });

  it('should return false for permission errors', () => {
    expect(isRetryableError(new Error('permission denied'))).toBe(false);
  });

  it('should return false when a non-retryable pattern matches even if a retryable pattern is present', () => {
    // Both 'invalid api key' (non-retryable) and 'network' (retryable) are present
    expect(isRetryableError(new Error('network failure due to invalid api key'))).toBe(false);
  });

  it('should return false for unknown errors (conservative fallback)', () => {
    expect(isRetryableError(new Error('something completely unexpected'))).toBe(false);
  });

  it('should handle case-insensitivity correctly', () => {
    expect(isRetryableError(new Error('RATE LIMIT EXCEEDED'))).toBe(true);
    expect(isRetryableError(new Error('TIMEOUT'))).toBe(true);
    expect(isRetryableError(new Error('INVALID API KEY'))).toBe(false);
  });
});
