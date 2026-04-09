import { describe, expect, it, vi } from 'vitest';
import { getAgentPrefix } from './output-formatters.js';

vi.mock('../session-manager.js', () => ({
  AGENTS: {
    'injection-vuln': { displayName: 'Injection vuln agent' },
    'xss-vuln': { displayName: 'XSS vuln agent' },
    'auth-vuln': { displayName: 'Auth vuln agent' },
    'authz-vuln': { displayName: 'Authz vuln agent' },
    'ssrf-vuln': { displayName: 'SSRF vuln agent' },
    'injection-exploit': { displayName: 'Injection exploit agent' },
    'xss-exploit': { displayName: 'XSS exploit agent' },
    'auth-exploit': { displayName: 'Auth exploit agent' },
    'authz-exploit': { displayName: 'Authz exploit agent' },
    'ssrf-exploit': { displayName: 'SSRF exploit agent' },
  },
}));

describe('getAgentPrefix', () => {
  it('should return exact match prefixes using AGENTS displayName', () => {
    expect(getAgentPrefix('Execution by Injection vuln agent')).toBe('[Injection]');
    expect(getAgentPrefix('Execution by XSS vuln agent')).toBe('[XSS]');
    expect(getAgentPrefix('Execution by Auth vuln agent')).toBe('[Auth]');
    expect(getAgentPrefix('Execution by Authz vuln agent')).toBe('[Authz]');
    expect(getAgentPrefix('Execution by SSRF vuln agent')).toBe('[SSRF]');

    expect(getAgentPrefix('Execution by Injection exploit agent')).toBe('[Injection]');
    expect(getAgentPrefix('Execution by XSS exploit agent')).toBe('[XSS]');
    expect(getAgentPrefix('Execution by Auth exploit agent')).toBe('[Auth]');
    expect(getAgentPrefix('Execution by Authz exploit agent')).toBe('[Authz]');
    expect(getAgentPrefix('Execution by SSRF exploit agent')).toBe('[SSRF]');
  });

  it('should return fallback partial match prefixes', () => {
    expect(getAgentPrefix('Testing injection vulnerability')).toBe('[Injection]');
    expect(getAgentPrefix('Testing xss vulnerability')).toBe('[XSS]');
    expect(getAgentPrefix('Testing authz vulnerability')).toBe('[Authz]');
    expect(getAgentPrefix('Testing auth vulnerability')).toBe('[Auth]');
    expect(getAgentPrefix('Testing ssrf vulnerability')).toBe('[SSRF]');
  });

  it('should prioritize authz over auth in fallback partial match', () => {
    // Both 'authz' and 'auth' are present, but 'authz' comes first in fallback list
    expect(getAgentPrefix('Testing auth and authz vulnerabilities')).toBe('[Authz]');
    expect(getAgentPrefix('Testing authz and auth vulnerabilities')).toBe('[Authz]');
  });

  it('should return default prefix when no match is found', () => {
    expect(getAgentPrefix('Unknown agent execution')).toBe('[Agent]');
    expect(getAgentPrefix('')).toBe('[Agent]');
    expect(getAgentPrefix('recon')).toBe('[Agent]');
    expect(getAgentPrefix('pre-recon')).toBe('[Agent]');
  });
});
