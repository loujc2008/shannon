import { describe, expect, it } from 'vitest';
import { formatWorkflowError } from './workflow-errors.js';

describe('formatWorkflowError', () => {
  it('should format a basic error with no context', () => {
    const error = new Error('Something went wrong');
    expect(formatWorkflowError(error, null, null)).toBe('Pipeline failed|Something went wrong');
  });

  it('should format a non-Error object', () => {
    expect(formatWorkflowError('Just a string error', null, null)).toBe('Pipeline failed|Just a string error');
    expect(formatWorkflowError({ msg: 'Object error' }, null, null)).toBe('Pipeline failed|[object Object]');
  });

  it('should include phase context', () => {
    const error = new Error('Compilation failed');
    expect(formatWorkflowError(error, 'Build', null)).toBe('Build failed|Compilation failed');
  });

  it('should include phase and agent context when they differ', () => {
    const error = new Error('Syntax error');
    expect(formatWorkflowError(error, 'Analysis', 'Coder')).toBe('Analysis failed (agent: Coder)|Syntax error');
  });

  it('should not include agent context when it is the same as phase', () => {
    const error = new Error('Syntax error');
    expect(formatWorkflowError(error, 'Coder', 'Coder')).toBe('Coder failed|Syntax error');
  });

  it('should sanitize pipe characters in the error message', () => {
    const error = new Error('Error | with | pipes');
    expect(formatWorkflowError(error, null, null)).toBe('Pipeline failed|Error / with / pipes');
  });

  it('should extract error type and add it as a segment', () => {
    const error = new Error('Custom error message');
    Object.assign(error, { type: 'CustomErrorType' });
    expect(formatWorkflowError(error, null, null)).toBe('Pipeline failed|CustomErrorType|Custom error message');
  });

  it('should match error type to REMEDIATION_HINTS', () => {
    const error = new Error('Auth failed');
    Object.assign(error, { type: 'AuthenticationError' });
    expect(formatWorkflowError(error, null, null)).toBe(
      'Pipeline failed|AuthenticationError|Auth failed|Hint: Verify ANTHROPIC_API_KEY or CLAUDE_CODE_OAUTH_TOKEN in .env is valid and not expired.',
    );
  });

  it('should unwrap activity error causes to find the innermost error with a type', () => {
    const innermostError = new Error('Inner auth failure');
    Object.assign(innermostError, { type: 'AuthenticationError' });

    const middleError = new Error('Middle error');
    Object.assign(middleError, { cause: innermostError });

    const outerError = new Error('Outer error');
    Object.assign(outerError, { cause: middleError });

    expect(formatWorkflowError(outerError, null, null)).toBe(
      'Pipeline failed|AuthenticationError|Inner auth failure|Hint: Verify ANTHROPIC_API_KEY or CLAUDE_CODE_OAUTH_TOKEN in .env is valid and not expired.',
    );
  });

  it('should ignore types in the chain that are not strings', () => {
    const innerError = new Error('Inner error');
    Object.assign(innerError, { type: 'ValidType' });

    const outerError = new Error('Outer error');
    Object.assign(outerError, { type: 123 }); // invalid type, should keep digging
    Object.assign(outerError, { cause: innerError });

    expect(formatWorkflowError(outerError, null, null)).toBe('Pipeline failed|ValidType|Inner error');
  });

  it('should fallback to outer error message if no typed cause is found', () => {
    const innerError = new Error('Inner error');

    const outerError = new Error('Outer error');
    Object.assign(outerError, { cause: innerError });

    expect(formatWorkflowError(outerError, null, null)).toBe('Pipeline failed|Outer error');
  });
});
