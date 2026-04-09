import { describe, expect, it } from 'vitest';
import { filterJsonToolCalls } from './output-formatters.js';

describe('filterJsonToolCalls', () => {
  it('handles null or undefined', () => {
    expect(filterJsonToolCalls(null)).toBe('');
    expect(filterJsonToolCalls(undefined)).toBe('');
  });

  it('handles regular text without modifications', () => {
    const text = 'Hello world\nThis is a test\nGoodbye';
    expect(filterJsonToolCalls(text)).toBe(text);
  });

  it('removes generic tool calls that are not handled specially', () => {
    const text = 'Hello\n{"type":"tool_use","name":"SomeTool","id":"123","input":{"foo":"bar"}}\nWorld';
    expect(filterJsonToolCalls(text)).toBe('Hello\nWorld');
  });

  it('formats Task tool calls properly', () => {
    const text =
      'Starting...\n{"type":"tool_use","name":"Task","id":"123","input":{"description":"search agent"}}\nDone';
    expect(filterJsonToolCalls(text)).toBe('Starting...\n🚀 Launching search agent\nDone');
  });

  it('formats Task tool calls with missing description', () => {
    const text = '{"type":"tool_use","name":"Task","id":"123","input":{}}';
    expect(filterJsonToolCalls(text)).toBe('🚀 Launching analysis agent');
  });

  it('formats TodoWrite tool calls properly with completed task', () => {
    const text =
      '{"type":"tool_use","name":"TodoWrite","id":"123","input":{"todos":[{"id":"1","status":"completed","content":"test item"}]}}';
    expect(filterJsonToolCalls(text)).toBe('✅ test item');
  });

  it('formats TodoWrite tool calls properly with in_progress task', () => {
    const text =
      '{"type":"tool_use","name":"TodoWrite","id":"123","input":{"todos":[{"id":"1","status":"in_progress","content":"test item"}]}}';
    expect(filterJsonToolCalls(text)).toBe('🔄 test item');
  });

  it('formats Bash tool calls containing playwright-cli', () => {
    const text =
      '{"type":"tool_use","name":"Bash","id":"123","input":{"command":"npx playwright-cli goto https://example.com"}}';
    expect(filterJsonToolCalls(text)).toBe('🌐 Navigating to example.com');
  });

  it('skips Bash tool calls not containing playwright-cli', () => {
    const text = 'Hello\n{"type":"tool_use","name":"Bash","id":"123","input":{"command":"ls -la"}}\nWorld';
    expect(filterJsonToolCalls(text)).toBe('Hello\nWorld');
  });

  it('handles invalid JSON gracefully', () => {
    const text = '{"type":"tool_use","name":"Task",...';
    expect(filterJsonToolCalls(text)).toBe('{"type":"tool_use","name":"Task",...');
  });

  it('ignores empty lines in input', () => {
    const text = 'Line 1\n\n\nLine 2';
    expect(filterJsonToolCalls(text)).toBe('Line 1\nLine 2');
  });
});
