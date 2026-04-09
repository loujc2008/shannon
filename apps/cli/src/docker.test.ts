import { describe, expect, it } from 'vitest';
import { spawnWorker } from './docker.js';

describe('spawnWorker', () => {
  it('should throw on invalid URL', () => {
    expect(() => {
      spawnWorker({
        version: '1.0.0',
        url: 'not-a-url',
        repo: { hostPath: '/host', containerPath: '/container' },
        workspacesDir: '/workspaces',
        taskQueue: 'queue',
        containerName: 'name',
        envFlags: [],
        workspace: 'workspace',
      });
    }).toThrow(/Invalid URL:/);
  });

  it('should throw on invalid URL protocol', () => {
    expect(() => {
      spawnWorker({
        version: '1.0.0',
        url: 'file:///etc/passwd',
        repo: { hostPath: '/host', containerPath: '/container' },
        workspacesDir: '/workspaces',
        taskQueue: 'queue',
        containerName: 'name',
        envFlags: [],
        workspace: 'workspace',
      });
    }).toThrow(/Invalid URL protocol: file:/);
  });

  it('should throw on injected docker arguments in containerName', () => {
    expect(() => {
      spawnWorker({
        version: '1.0.0',
        url: 'http://example.com',
        repo: { hostPath: '/host', containerPath: '/container' },
        workspacesDir: '/workspaces',
        taskQueue: 'queue',
        containerName: '-v /:/host', // Malicious container name
        envFlags: [],
        workspace: 'workspace',
      });
    }).toThrow(/Invalid container name:/);
  });
});
