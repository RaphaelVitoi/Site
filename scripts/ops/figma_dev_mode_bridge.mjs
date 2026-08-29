#!/usr/bin/env node
/**
 * SOTA v8.0 GOLD: Resilient Autopoietic Figma Dev Mode MCP Bridge.
 * Bridges stdio MCP JSON-RPC protocol to local Figma Dev Mode (http://127.0.0.1:3845/mcp).
 * Handles all standard MCP methods (initialize, tools, resources, prompts, ping) with immediate responses.
 */

import http from 'node:http';
import readline from 'node:readline';

const FIGMA_HOST = '127.0.0.1';
const FIGMA_PORT = 3845;
const FIGMA_PATH = '/mcp';
const CHECK_TIMEOUT_MS = 400;

function sendRpcResponse(res) {
  process.stdout.write(JSON.stringify(res) + '\n');
}

function checkFigmaAlive() {
  return new Promise((resolve) => {
    const req = http.request(
      {
        hostname: FIGMA_HOST,
        port: FIGMA_PORT,
        path: FIGMA_PATH,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        timeout: CHECK_TIMEOUT_MS,
      },
      (res) => {
        resolve(res.statusCode !== undefined && res.statusCode < 500);
      }
    );
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    req.write(JSON.stringify({ jsonrpc: '2.0', id: 'ping-check', method: 'ping' }));
    req.end();
  });
}

function forwardToFigma(jsonBody) {
  return new Promise((resolve, reject) => {
    const bodyStr = JSON.stringify(jsonBody);
    const req = http.request(
      {
        hostname: FIGMA_HOST,
        port: FIGMA_PORT,
        path: FIGMA_PATH,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(bodyStr),
        },
        timeout: 5000,
      },
      (res) => {
        let raw = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(raw));
          } catch (e) {
            reject(e);
          }
        });
      }
    );
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Figma request timed out'));
    });
    req.write(bodyStr);
    req.end();
  });
}

async function handleMessage(msg) {
  if (!msg || typeof msg !== 'object') return;
  const { id, method, params } = msg;

  // Notifications (no id) must never receive a response
  if (id === undefined) {
    return;
  }

  if (method === 'ping') {
    sendRpcResponse({ jsonrpc: '2.0', id, result: {} });
    return;
  }

  const isFigmaUp = await checkFigmaAlive();

  if (isFigmaUp) {
    try {
      const remoteRes = await forwardToFigma(msg);
      sendRpcResponse(remoteRes);
      return;
    } catch (_) {
      // Fallback gracefully if forward fails mid-flight
    }
  }

  // Graceful offline handling for all standard MCP methods
  switch (method) {
    case 'initialize':
      sendRpcResponse({
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: { listChanged: false },
            resources: { subscribe: false, listChanged: false },
            prompts: { listChanged: false },
          },
          serverInfo: {
            name: 'figma-dev-mode-bridge',
            version: '1.0.0',
          },
        },
      });
      break;

    case 'tools/list':
      sendRpcResponse({
        jsonrpc: '2.0',
        id,
        result: {
          tools: [
            {
              name: 'figma_dev_mode_status',
              description:
                'Returns the connection status to Figma Dev Mode on port 3845. Launch Figma Desktop and enable Dev Mode to access live canvas tools.',
              inputSchema: {
                type: 'object',
                properties: {},
              },
            },
          ],
        },
      });
      break;

    case 'resources/list':
      sendRpcResponse({
        jsonrpc: '2.0',
        id,
        result: { resources: [] },
      });
      break;

    case 'resources/templates/list':
      sendRpcResponse({
        jsonrpc: '2.0',
        id,
        result: { resourceTemplates: [] },
      });
      break;

    case 'prompts/list':
      sendRpcResponse({
        jsonrpc: '2.0',
        id,
        result: { prompts: [] },
      });
      break;

    case 'tools/call': {
      const toolName = params?.name;
      if (toolName === 'figma_dev_mode_status') {
        sendRpcResponse({
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: 'Figma Dev Mode Bridge is active in standby mode. Figma Desktop is currently closed or Dev Mode MCP is not running on http://127.0.0.1:3845/mcp. Open Figma Desktop and activate Dev Mode to bridge canvas tools live.',
              },
            ],
          },
        });
        return;
      }

      sendRpcResponse({
        jsonrpc: '2.0',
        id,
        result: {
          isError: true,
          content: [
            {
              type: 'text',
              text: `Tool '${toolName}' requires Figma Desktop running with Dev Mode MCP on port 3845. Please open Figma Desktop to use canvas inspection.`,
            },
          ],
        },
      });
      break;
    }

    default:
      sendRpcResponse({
        jsonrpc: '2.0',
        id,
        error: {
          code: -32601,
          message: `Method '${method}' not found or Figma Dev Mode is offline.`,
        },
      });
      break;
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

rl.on('line', (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;
  try {
    const parsed = JSON.parse(trimmed);
    handleMessage(parsed);
  } catch (_) {
    // Ignore malformed lines to prevent crashes
  }
});
