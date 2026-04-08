import { exec } from 'node:child_process';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { isTemporalReady, listRunningWorkers } from '../docker.js';
import { getMode } from '../mode.js';

export async function runMcpServer(version: string) {
  const server = new McpServer({
    name: 'shannon-mcp-server',
    version: version,
  });

  server.tool(
    'shannon_start',
    'Start a new Shannon pentest scan.',
    {
      url: z.string().describe('Target URL (required)'),
      repo: z.string().describe('Repository path (required)'),
      config: z.string().optional().describe('Configuration file (YAML)'),
      workspace: z.string().optional().describe('Named workspace (auto-resumes if exists)'),
      output: z.string().optional().describe('Copy deliverables to this directory after run'),
    },
    async (args) => {
      const mode = getMode();
      const prefix = mode === 'local' ? './shannon' : 'npx @keygraph/shannon';

      let cmd = `${prefix} start -u ${args.url} -r ${args.repo}`;
      if (args.config) cmd += ` -c ${args.config}`;
      if (args.workspace) cmd += ` -w ${args.workspace}`;
      if (args.output) cmd += ` -o ${args.output}`;

      // We spawn the process detached so it doesn't block the MCP server
      // Also we must redirect stdout/stderr so they don't break JSON-RPC
      const child = exec(`${cmd} > /dev/null 2>&1 &`);
      child.unref();

      return {
        content: [
          {
            type: 'text',
            text: `Triggered pentest scan with command: ${cmd}\nCheck 'shannon_status' or logs to monitor progress.`,
          },
        ],
      };
    },
  );

  server.tool('shannon_status', 'Show running workers and Temporal health.', {}, async () => {
    let result = '';
    const temporalUp = isTemporalReady();
    result += `Temporal: ${temporalUp ? 'running' : 'not running'}\n`;
    if (temporalUp) {
      result += '  Web UI: http://localhost:8233\n';
    }
    result += '\n';

    const workers = listRunningWorkers();
    if (workers) {
      result += 'Workers:\n';
      result += workers + '\n';
    } else {
      result += 'Workers: none running\n';
    }

    return {
      content: [{ type: 'text', text: result }],
    };
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
