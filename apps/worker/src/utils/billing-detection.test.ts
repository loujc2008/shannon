import { describe, expect, it } from 'vitest';
import {
  BILLING_API_PATTERNS,
  BILLING_TEXT_PATTERNS,
  isSpendingCapBehavior,
  matchesBillingApiPattern,
  matchesBillingTextPattern,
} from './billing-detection.js';

describe('billing-detection', () => {
  describe('matchesBillingTextPattern', () => {
    it('should match exact strings from patterns', () => {
      for (const pattern of BILLING_TEXT_PATTERNS) {
        expect(matchesBillingTextPattern(pattern)).toBe(true);
      }
    });

    it('should match patterns case-insensitively', () => {
      expect(matchesBillingTextPattern('SPENDING CAP')).toBe(true);
      expect(matchesBillingTextPattern('Usage Limit')).toBe(true);
    });

    it('should match patterns embedded in longer text', () => {
      expect(matchesBillingTextPattern('I am sorry, but your spending cap has been reached.')).toBe(true);
      expect(matchesBillingTextPattern('The budget exceeded limit.')).toBe(true);
    });

    it('should not match unrelated text', () => {
      expect(matchesBillingTextPattern('The weather is nice today')).toBe(false);
      expect(matchesBillingTextPattern('An error occurred during processing')).toBe(false);
    });
  });

  describe('matchesBillingApiPattern', () => {
    it('should match exact strings from patterns', () => {
      for (const pattern of BILLING_API_PATTERNS) {
        expect(matchesBillingApiPattern(pattern)).toBe(true);
      }
    });

    it('should match patterns case-insensitively', () => {
      expect(matchesBillingApiPattern('BILLING_ERROR')).toBe(true);
      expect(matchesBillingApiPattern('Insufficient Credits')).toBe(true);
    });

    it('should match patterns embedded in longer text', () => {
      expect(matchesBillingApiPattern('Error: billing_error occurred')).toBe(true);
      expect(matchesBillingApiPattern('Your credit balance is too low to proceed')).toBe(true);
    });

    it('should not match unrelated text', () => {
      expect(matchesBillingApiPattern('Internal server error')).toBe(false);
      expect(matchesBillingApiPattern('Invalid request parameters')).toBe(false);
    });
  });

  describe('isSpendingCapBehavior', () => {
    it('should handle boundary values for turns correctly', () => {
      // 0 turns (extreme lower bound)
      expect(isSpendingCapBehavior(0, 0, 'spending cap reached')).toBe(true);

      // 2 turns (exact upper bound of valid range)
      expect(isSpendingCapBehavior(2, 0, 'spending cap reached')).toBe(true);

      // 3 turns (just over the boundary)
      expect(isSpendingCapBehavior(3, 0, 'spending cap reached')).toBe(false);

      // Negative turns (edge case)
      expect(isSpendingCapBehavior(-1, 0, 'spending cap reached')).toBe(true);
    });

    it('should handle boundary values for cost correctly', () => {
      // Exactly zero
      expect(isSpendingCapBehavior(1, 0, 'spending cap reached')).toBe(true);

      // Negative zero (JS quirk)
      expect(isSpendingCapBehavior(1, -0, 'spending cap reached')).toBe(true);

      // Extremely small positive cost (just over boundary)
      expect(isSpendingCapBehavior(1, 0.0000001, 'spending cap reached')).toBe(false);
      expect(isSpendingCapBehavior(1, Number.EPSILON, 'spending cap reached')).toBe(false);

      // Extremely small negative cost
      expect(isSpendingCapBehavior(1, -0.0000001, 'spending cap reached')).toBe(false);
    });

    it('should return true for low turns, zero cost, and matching text', () => {
      expect(isSpendingCapBehavior(1, 0, 'spending cap reached')).toBe(true);
      expect(isSpendingCapBehavior(2, 0, 'usage limit exceeded')).toBe(true);
    });

    it('should return false if turns > 2', () => {
      expect(isSpendingCapBehavior(3, 0, 'spending cap reached')).toBe(false);
      expect(isSpendingCapBehavior(5, 0, 'usage limit exceeded')).toBe(false);
    });

    it('should return false if cost !== 0', () => {
      expect(isSpendingCapBehavior(1, 0.01, 'spending cap reached')).toBe(false);
      expect(isSpendingCapBehavior(2, 1.5, 'usage limit exceeded')).toBe(false);
    });

    it('should return false if text does not match billing patterns', () => {
      expect(isSpendingCapBehavior(1, 0, 'normal response')).toBe(false);
      expect(isSpendingCapBehavior(2, 0, 'i cannot do that')).toBe(false);
    });

    it('should return false for high turns, non-zero cost, and non-matching text', () => {
      expect(isSpendingCapBehavior(5, 2.5, 'here is your answer')).toBe(false);
    });
  });
});
