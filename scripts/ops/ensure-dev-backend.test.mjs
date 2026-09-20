import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { ensureBackend, isNexusReady } from './ensure-dev-backend.mjs';

async function freePort() {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  await new Promise((resolve) => server.close(resolve));
  return port;
}

test('simultaneous launchers start one backend and subsequent calls reuse it', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'nexus-dev-test-'));
  const base = `http://127.0.0.1:${await freePort()}`;
  try {
    await writeFile(path.join(root, 'main.py'), `
      const http = require('node:http');
      http.createServer((req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ status: 'PONG', pid: process.pid }));
        if (req.url === '/shutdown') setTimeout(() => process.exit(0), 20);
      }).listen(Number(process.env.NEXUS_PORT), process.env.HOST);
    `);
    const options = { root, base, python: process.execPath, timeoutMs: 5000 };
    const results = await Promise.all([ensureBackend(options), ensureBackend(options)]);
    assert.deepEqual(results.sort(), ['reused', 'started']);
    const before = await (await fetch(base)).json();
    assert.equal(await ensureBackend(options), 'reused');
    assert.equal((await (await fetch(base)).json()).pid, before.pid);
  } finally {
    await fetch(`${base}/shutdown`).catch(() => {});
    await new Promise((resolve) => setTimeout(resolve, 100));
    await rm(root, { recursive: true, force: true });
  }
});

test('an unrelated HTTP service is not accepted as Nexus or stopped', async () => {
  const server = createServer((_, res) => res.end('{"status":"ok"}'));
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    assert.equal(await isNexusReady(`http://127.0.0.1:${server.address().port}`), false);
    assert.equal(server.listening, true);
  } finally { await new Promise((resolve) => server.close(resolve)); }
});

test('failed backend startup reports failure and releases its lock', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'nexus-dev-test-'));
  try {
    await mkdir(path.join(root, 'logs'));
    await writeFile(path.join(root, 'main.py'), 'process.exit(7);');
    const options = { root, base: `http://127.0.0.1:${await freePort()}`, python: process.execPath, timeoutMs: 5000 };
    await assert.rejects(ensureBackend(options), /encerrou \(7\)/);
    await assert.rejects(ensureBackend(options), /encerrou \(7\)/);
  } finally { await rm(root, { recursive: true, force: true }); }
});
