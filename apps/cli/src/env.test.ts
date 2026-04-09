import { describe, it, expect, vi, afterEach } from 'vitest';
import { buildEnvFlags } from './env.js';

describe('buildEnvFlags', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should include TEMPORAL_ADDRESS by default', () => {
    const flags = buildEnvFlags();
    expect(flags).toContain('-e');
    expect(flags).toContain('TEMPORAL_ADDRESS=shannon-temporal:7233');
  });

  it('should push key=value to flags if FORWARD_VARS are set', () => {
    vi.stubEnv('ANTHROPIC_API_KEY', 'test_key');
    vi.stubEnv('ANTHROPIC_BASE_URL', 'http://test.local');

    const flags = buildEnvFlags();
    expect(flags).toContain('-e');
    expect(flags).toContain('ANTHROPIC_API_KEY=test_key');
    expect(flags).toContain('ANTHROPIC_BASE_URL=http://test.local');
  });

  it('should not push flags for undefined FORWARD_VARS', () => {
    vi.unstubAllEnvs();
    delete process.env.ANTHROPIC_API_KEY;

    const flags = buildEnvFlags();
    expect(flags).not.toContain('ANTHROPIC_API_KEY=');
  });

  it('should not push flags for empty string values in FORWARD_VARS', () => {
    vi.stubEnv('ANTHROPIC_API_KEY', '');

    const flags = buildEnvFlags();
    expect(flags).not.toContain('ANTHROPIC_API_KEY=');
  });
});
