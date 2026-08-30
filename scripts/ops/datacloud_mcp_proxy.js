#!/usr/bin/env node
/**
 * SOTA v8.0 GOLD: Resilient Autopoietic Data Cloud MCP Proxy.
 * Connects to the Antigravity IDE Data Cloud named pipe (\\?\pipe\datacloud-mcp-<id>)
 * when active, while providing comprehensive, immediate MCP JSON-RPC responses for ALL
 * methods (initialize, tools, resources, prompts, ping) when offline.
 */

const net = require("node:net");
const os = require("node:os");
const path = require("node:path");
const readline = require("node:readline");

const RETRY_DELAY_MS = 3000;

function getSocketPath(idOrPath) {
  if (path.isAbsolute(idOrPath)) {
    return idOrPath;
  }
  if (idOrPath.startsWith("\\\\?\\pipe\\")) {
    return idOrPath;
  }
  if (process.platform === "win32") {
    return path.join("\\\\?\\pipe\\", `datacloud-mcp-${idOrPath}`);
  }
  return path.join(os.tmpdir(), `datacloud-mcp-${idOrPath}.sock`);
}

function sendResponse(obj) {
  process.stdout.write(JSON.stringify(obj) + "\n");
}

function main() {
  const arg = process.argv[2] || "dataAgentKit-antigravityide";
  const socketPath = getSocketPath(arg);

  let isConnected = false;
  let activeClient = null;

  function handleFallbackStdin(line) {
    const trimmed = line.trim();
    if (!trimmed) return;
    try {
      const msg = JSON.parse(trimmed);
      const { id, method } = msg;

      // Notifications (no id) must never receive a response
      if (id === undefined) {
        return;
      }

      switch (method) {
        case "initialize":
          sendResponse({
            jsonrpc: "2.0",
            id,
            result: {
              protocolVersion: "2024-11-05",
              capabilities: {
                tools: { listChanged: false },
                resources: { subscribe: false, listChanged: false },
                prompts: { listChanged: false },
              },
              serverInfo: {
                name: `datacloud-${arg}`,
                version: "0.9.1",
              },
            },
          });
          break;

        case "tools/list":
          sendResponse({
            jsonrpc: "2.0",
            id,
            result: { tools: [] },
          });
          break;

        case "resources/list":
          sendResponse({
            jsonrpc: "2.0",
            id,
            result: { resources: [] },
          });
          break;

        case "resources/templates/list":
          sendResponse({
            jsonrpc: "2.0",
            id,
            result: { resourceTemplates: [] },
          });
          break;

        case "prompts/list":
          sendResponse({
            jsonrpc: "2.0",
            id,
            result: { prompts: [] },
          });
          break;

        case "ping":
          sendResponse({
            jsonrpc: "2.0",
            id,
            result: {},
          });
          break;

        case "tools/call":
          sendResponse({
            jsonrpc: "2.0",
            id,
            result: {
              isError: true,
              content: [
                {
                  type: "text",
                  text: `Data Cloud service '${arg}' is currently offline. Start a Data Cloud session in Antigravity IDE to activate tools.`,
                },
              ],
            },
          });
          break;

        case "resources/read":
          sendResponse({
            jsonrpc: "2.0",
            id,
            error: {
              code: -32602,
              message: `Resource not found (Data Cloud service '${arg}' is offline)`,
            },
          });
          break;

        case "prompts/get":
          sendResponse({
            jsonrpc: "2.0",
            id,
            error: {
              code: -32602,
              message: `Prompt not found (Data Cloud service '${arg}' is offline)`,
            },
          });
          break;

        default:
          sendResponse({
            jsonrpc: "2.0",
            id,
            error: {
              code: -32601,
              message: `Method '${method}' not found (Data Cloud '${arg}' is offline)`,
            },
          });
          break;
      }
    } catch {
      // Graceful fallback for non-JSON lines
    }
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });

  rl.on("line", (line) => {
    if (isConnected && activeClient && !activeClient.destroyed) {
      try {
        activeClient.write(line + "\n");
      } catch {
        handleFallbackStdin(line);
      }
    } else {
      handleFallbackStdin(line);
    }
  });

  function tryConnect() {
    try {
      const client = net.createConnection(socketPath);
      client.on("connect", () => {
        isConnected = true;
        activeClient = client;
        client.pipe(process.stdout);
      });
      client.on("error", () => {
        isConnected = false;
        activeClient = null;
        setTimeout(tryConnect, RETRY_DELAY_MS);
      });
      client.on("close", () => {
        isConnected = false;
        activeClient = null;
        setTimeout(tryConnect, RETRY_DELAY_MS);
      });
    } catch {
      setTimeout(tryConnect, RETRY_DELAY_MS);
    }
  }

  tryConnect();
}

main();
