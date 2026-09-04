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

const INITIAL_RETRY_DELAY_MS = 5000;
const MAX_RETRY_DELAY_MS = 60000;
const RETRY_BACKOFF_FACTOR = 1.5;

function getSocketPath(idOrPath) {
  if (path.isAbsolute(idOrPath)) {
    return idOrPath;
  }
  if (idOrPath.startsWith("\\\\?\\pipe\\") || idOrPath.startsWith("\\\\.\\pipe\\")) {
    return idOrPath;
  }
  if (process.platform === "win32") {
    // Windows named pipes: formatar canonicamente sem normalizacao do path.join
    return `\\\\.\\pipe\\datacloud-mcp-${idOrPath}`;
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
  let connectingClient = null;
  let retryTimer = null;
  let currentRetryDelay = INITIAL_RETRY_DELAY_MS;
  let isTerminating = false;

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
                version: "0.10.0",
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

  function shutdown(code = 0) {
    if (isTerminating) return;
    isTerminating = true;

    if (retryTimer) {
      clearTimeout(retryTimer);
      retryTimer = null;
    }
    if (connectingClient) {
      connectingClient.removeAllListeners();
      try {
        connectingClient.destroy();
      } catch {}
      connectingClient = null;
    }
    if (activeClient) {
      activeClient.removeAllListeners();
      try {
        activeClient.unpipe(process.stdout);
      } catch {}
      try {
        activeClient.destroy();
      } catch {}
      activeClient = null;
    }
    process.exit(code);
  }

  rl.on("close", () => shutdown(0));
  process.stdin.on("end", () => shutdown(0));
  process.on("SIGINT", () => shutdown(0));
  process.on("SIGTERM", () => shutdown(0));

  function scheduleRetry() {
    if (isTerminating || isConnected || retryTimer || connectingClient) {
      return;
    }
    retryTimer = setTimeout(() => {
      retryTimer = null;
      tryConnect();
    }, currentRetryDelay);
    if (retryTimer && typeof retryTimer.unref === "function") {
      retryTimer.unref();
    }
    currentRetryDelay = Math.min(
      Math.round(currentRetryDelay * RETRY_BACKOFF_FACTOR),
      MAX_RETRY_DELAY_MS
    );
  }

  function tryConnect() {
    if (isTerminating || isConnected || connectingClient || activeClient) {
      return;
    }

    try {
      const client = net.createConnection(socketPath);
      connectingClient = client;

      let handled = false;
      function cleanupAndRetry() {
        if (handled) return;
        handled = true;

        client.removeAllListeners();
        try {
          client.unpipe(process.stdout);
        } catch {}
        try {
          client.destroy();
        } catch {}

        if (connectingClient === client) {
          connectingClient = null;
        }
        if (activeClient === client) {
          isConnected = false;
          activeClient = null;
        }
        scheduleRetry();
      }

      client.on("connect", () => {
        if (isTerminating) {
          try {
            client.destroy();
          } catch {}
          return;
        }
        isConnected = true;
        activeClient = client;
        connectingClient = null;
        currentRetryDelay = INITIAL_RETRY_DELAY_MS;
        if (retryTimer) {
          clearTimeout(retryTimer);
          retryTimer = null;
        }
        client.pipe(process.stdout);
      });

      client.on("error", cleanupAndRetry);
      client.on("close", cleanupAndRetry);
    } catch {
      connectingClient = null;
      scheduleRetry();
    }
  }

  tryConnect();
}

main();
