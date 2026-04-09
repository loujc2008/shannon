import { describe, expect, it } from 'vitest';
import { isSpendingCapBehavior, matchesBillingApiPattern, matchesBillingTextPattern } from './billing-detection.js';

describe('billing-detection', () => {
  describe('matchesBillingApiPattern', () => {
    it('should return true for exact matches of billing patterns', () => {
      expect(matchesBillingApiPattern('billing_error')).toBe(true);
      expect(matchesBillingApiPattern('quota exceeded')).toBe(true);
      expect(matchesBillingApiPattern('daily rate limit')).toBe(true);
    });

    it('should return true for case-insensitive matches', () => {
      expect(matchesBillingApiPattern('BILLING_ERROR')).toBe(true);
      expect(matchesBillingApiPattern('Quota Exceeded')).toBe(true);
      expect(matchesBillingApiPattern('Daily Rate Limit')).toBe(true);
    });

    it('should return true for messages containing patterns', () => {
      expect(matchesBillingApiPattern('An error occurred: billing_error was returned')).toBe(true);
      expect(matchesBillingApiPattern('Error: your quota exceeded the limit')).toBe(true);
      expect(matchesBillingApiPattern('Warning: daily rate limit reached')).toBe(true);
    });

    it('should return false for unrelated messages', () => {
      expect(matchesBillingApiPattern('Network timeout')).toBe(false);
      expect(matchesBillingApiPattern('Internal server error')).toBe(false);
      expect(matchesBillingApiPattern('Authentication failed')).toBe(false);
    });

    it('should return false for empty strings', () => {
      expect(matchesBillingApiPattern('')).toBe(false);
    });
  });

  describe('matchesBillingTextPattern', () => {
    it('should return true for exact matches', () => {
      expect(matchesBillingTextPattern('spending cap')).toBe(true);
      expect(matchesBillingTextPattern('budget exceeded')).toBe(true);
    });

    it('should return true for case-insensitive matches', () => {
      expect(matchesBillingTextPattern('SPENDING CAP')).toBe(true);
      expect(matchesBillingTextPattern('Budget Exceeded')).toBe(true);
    });

    it('should return true for text containing patterns', () => {
      expect(matchesBillingTextPattern('I cannot continue as my spending cap has been reached.')).toBe(true);
      expect(matchesBillingTextPattern('Error: budget exceeded for this month')).toBe(true);
    });

    it('should return false for unrelated text', () => {
      expect(matchesBillingTextPattern('I will now run the nmap scan')).toBe(false);
      expect(matchesBillingTextPattern('The application is vulnerable to XSS')).toBe(false);
    });
  });

  describe('isSpendingCapBehavior', () => {
    it('should return true when turns <= 2, cost is 0, and text matches', () => {
      expect(isSpendingCapBehavior(1, 0, 'I hit the spending cap')).toBe(true);
      expect(isSpendingCapBehavior(2, 0, 'My budget exceeded the limit')).toBe(true);
    });

    it('should return false when turns > 2', () => {
      expect(isSpendingCapBehavior(3, 0, 'I hit the spending cap')).toBe(false);
      expect(isSpendingCapBehavior(10, 0, 'spending limit reached')).toBe(false);
    });

    it('should return false when cost is not 0', () => {
      expect(isSpendingCapBehavior(1, 0.01, 'I hit the spending cap')).toBe(false);
      expect(isSpendingCapBehavior(2, 5.5, 'budget exceeded')).toBe(false);
    });

    it('should return false when text does not match billing patterns', () => {
      expect(isSpendingCapBehavior(1, 0, 'I am ready to help')).toBe(false);
      expect(isSpendingCapBehavior(2, 0, 'Scan completed')).toBe(false);
    });
  });
});
