/**
 * Runtime quality probe for the canonical Chrome Dev CDP instance.
 *
 * This is deliberately a probe, not a browser launcher: it connects only to a
 * loopback CDP endpoint supplied by the PowerShell gate, opens one temporary
 * tab, gathers browser-native observations, then closes that tab.  A metric
 * that cannot be observed is returned as null rather than estimated.
 */
import process from "node:process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const axeSource = require("axe-core").source;

function argument(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1] ?? null;
}

const cdpEndpoint = argument("--cdp");
const targetUrl = argument("--url");
const debug = process.argv.includes("--debug");

function trace(stage) {
  if (debug) process.stderr.write(`[runtime-quality-probe] ${stage}\n`);
}

if (!cdpEndpoint || !targetUrl) {
  throw new Error("Uso: node runtime_quality_probe.mjs --cdp <endpoint> --url <url>");
}

const target = new URL(targetUrl);
if (!["localhost", "127.0.0.1", "[::1]"].includes(target.hostname)) {
  throw new Error("O probe aceita somente um alvo loopback local.");
}

class NativeCdp {
  constructor(webSocketUrl) {
    this.webSocketUrl = webSocketUrl;
    this.nextId = 1;
    this.pending = new Map();
    this.events = [];
    this.waiters = [];
    this.socket = null;
  }

  async connect() {
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("CDP WebSocket connection timeout.")), 10_000);
      this.socket = new WebSocket(this.webSocketUrl);
      this.socket.onopen = () => {
        clearTimeout(timeout);
        resolve();
      };
      this.socket.onerror = () => {
        clearTimeout(timeout);
        reject(new Error("CDP WebSocket connection failed."));
      };
      this.socket.onmessage = (event) => this.receive(JSON.parse(event.data));
    });
  }

  receive(message) {
    if (message.id) {
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      if (message.error) pending.reject(new Error(`${message.error.code}: ${message.error.message}`));
      else pending.resolve(message.result ?? {});
      return;
    }

    const waiterIndex = this.waiters.findIndex(
      (waiter) => waiter.method === message.method && waiter.sessionId === message.sessionId,
    );
    if (waiterIndex >= 0) {
      const [waiter] = this.waiters.splice(waiterIndex, 1);
      waiter.resolve(message.params ?? {});
    } else {
      this.events.push(message);
    }
  }

  send(method, params = {}, sessionId = undefined) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    });
  }

  waitFor(method, sessionId) {
    const existing = this.events.findIndex((event) => event.method === method && event.sessionId === sessionId);
    if (existing >= 0) return Promise.resolve(this.events.splice(existing, 1)[0].params ?? {});
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        const index = this.waiters.findIndex((waiter) => waiter.resolve === resolve);
        if (index >= 0) this.waiters.splice(index, 1);
        reject(new Error(`Timeout esperando evento CDP ${method}.`));
      }, 20_000);
      this.waiters.push({ method, sessionId, resolve: (value) => { clearTimeout(timeout); resolve(value); } });
    });
  }

  close() {
    this.socket?.close();
  }
}

const observerSource = `(() => {
  const measurements = { cls: 0, inp: null, lcp: null, longTask: null };
  const observe = (type, callback) => { try { new PerformanceObserver((entries) => callback(entries.getEntries())).observe({ type, buffered: true }); } catch {} };
  observe('largest-contentful-paint', (entries) => { const last = entries.at(-1); if (last) measurements.lcp = last.startTime; });
  observe('layout-shift', (entries) => { for (const entry of entries) if (!entry.hadRecentInput) measurements.cls += entry.value; });
  observe('event', (entries) => { for (const entry of entries) { measurements.inp = measurements.inp === null ? entry.duration : Math.max(measurements.inp, entry.duration); } });
  observe('longtask', (entries) => { for (const entry of entries) measurements.longTask = (measurements.longTask ?? 0) + Math.max(0, entry.duration - 50); });
  window.__sotaRuntimeQuality = measurements;
})();`;

async function browserWebSocketUrl(endpoint) {
  if (endpoint.startsWith("ws:")) return endpoint;
  const versionUrl = new URL("/json/version", endpoint).toString();
  const version = await fetch(versionUrl).then((response) => {
    if (!response.ok) throw new Error(`CDP version endpoint returned ${response.status}.`);
    return response.json();
  });
  if (!version.webSocketDebuggerUrl) throw new Error("CDP nao retornou webSocketDebuggerUrl.");
  return version.webSocketDebuggerUrl;
}

async function runtimeValue(client, sessionId, expression) {
  const response = await client.send(
    "Runtime.evaluate",
    { expression, awaitPromise: true, returnByValue: true },
    sessionId,
  );
  if (response.exceptionDetails) throw new Error(`Runtime.evaluate: ${response.exceptionDetails.text ?? "exception"}`);
  return response.result.value;
}

let client;
let targetId;
let result;
let exitCode = 0;
try {
  trace("resolve-cdp-websocket");
  client = new NativeCdp(await browserWebSocketUrl(cdpEndpoint));
  trace("connect-cdp");
  await client.connect();

  trace("create-temporary-target");
  ({ targetId } = await client.send("Target.createTarget", { url: "about:blank" }));
  const { sessionId } = await client.send("Target.attachToTarget", { targetId, flatten: true });
  await client.send("Page.enable", {}, sessionId);
  await client.send("Page.addScriptToEvaluateOnNewDocument", { source: observerSource }, sessionId);

  trace("navigate");
  const loaded = client.waitFor("Page.loadEventFired", sessionId);
  await client.send("Page.navigate", { url: targetUrl }, sessionId);
  await loaded;
  await new Promise((resolve) => setTimeout(resolve, 1_000));

  trace("collect-performance");
  const runtime = await runtimeValue(client, sessionId, `(() => {
    const navigation = performance.getEntriesByType('navigation')[0];
    const memory = performance.memory;
    const values = window.__sotaRuntimeQuality ?? {};
    return {
      lcpMs: values.lcp ?? null,
      cls: values.cls ?? null,
      // Event Timing observado sem interação humana controlada não é INP.
      eventLatencyMs: values.inp ?? null,
      ttfbMs: navigation ? navigation.responseStart : null,
      // Soma de long tasks desta sessão (inclusive Next dev); não é TBT de lab.
      longTaskBlockingMs: values.longTask ?? null,
      maxHeapMb: memory?.usedJSHeapSize ? memory.usedJSHeapSize / (1024 * 1024) : null,
    };
  })()`);

  trace("run-axe");
  await runtimeValue(client, sessionId, axeSource);
  const axe = await runtimeValue(client, sessionId, `(async () => {
    const report = await axe.run(document);
    const summarize = (items) => items.map((item) => ({
      id: item.id,
      impact: item.impact,
      nodes: item.nodes.length,
      help: item.help,
      // O resumo conserva somente seletor e motivo do axe: e suficiente para
      // localizar a causa no fonte sem despejar todo o DOM no artefato do gate.
      targets: item.nodes.slice(0, 50).map((node) => ({
        target: node.target,
        failureSummary: node.failureSummary,
      })),
    }));
    return {
      violations: report.violations.length,
      incomplete: report.incomplete.length,
      violationDetails: summarize(report.violations),
      incompleteDetails: summarize(report.incomplete),
    };
  })()`);

  trace("serialize-result");
  result = { runtime, axe };
} catch (error) {
  result = { error: error instanceof Error ? error.message : String(error) };
  exitCode = 1;
} finally {
  if (client && targetId) await client.send("Target.closeTarget", { targetId }).catch(() => {});
  client?.close();
  await new Promise((resolve) => process.stdout.write(`${JSON.stringify(result)}\n`, resolve));
  process.exit(exitCode);
}
