/* eslint-disable no-await-in-loop */
import { spawn } from 'node:child_process';
import { mkdir, open, readFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';

export async function isFrontendReady(base) {
  try {
    const response = await fetch(new URL('/api/auth/session', base), { signal: AbortSignal.timeout(2000) });
    return response.ok;
  } catch {
    return false;
  }
}

async function acquireLock(lockPath, deadline, base) {
  while (Date.now() < deadline) {
    if (await isFrontendReady(base)) return 'reused';
    try {
      const lock = await open(lockPath, 'wx');
      await lock.writeFile(String(process.pid));
      return lock;
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
      await handleExistingLock(lockPath);
      await delay(250);
    }
  }
  return null;
}

async function handleExistingLock(lockPath) {
  const owner = Number(await readFile(lockPath, 'utf8').catch(() => ''));
  if (owner > 0) {
    try {
      process.kill(owner, 0);
    } catch (probeError) {
      if (probeError.code === 'ESRCH') await unlink(lockPath).catch(() => {});
    }
  }
}

async function startFrontend({ root, base, deadline, logs, lock, lockPath }) {
  let child;
  let ready = false;
  try {
    if (await isFrontendReady(base)) return 'reused';
    const outLog = await open(path.join(logs, 'dev-frontend.log'), 'a');
    const errLog = await open(path.join(logs, 'dev-frontend.err.log'), 'a');
    let spawnError;
    try {
      const isWin = process.platform === 'win32';
      const cmd = isWin ? 'cmd.exe' : 'npm';
      const args = isWin ? ['/c', 'npm', 'run', 'dev'] : ['run', 'dev'];
      child = spawn(cmd, args, {
        cwd: path.join(root, 'frontend'),
        detached: true,
        windowsHide: true,
        stdio: ['ignore', outLog.fd, errLog.fd],
        env: { ...process.env },
      });
      child.on('error', (error) => {
        spawnError = error;
      });
      child.unref();
    } finally {
      await outLog.close();
      await errLog.close();
    }
    while (Date.now() < deadline) {
      if (spawnError) throw spawnError;
      if (child.exitCode !== null) {
        throw new Error(`Frontend encerrou (${child.exitCode}); consulte logs/dev-frontend.err.log.`);
      }
      if (await isFrontendReady(base)) {
        ready = true;
        return 'started';
      }
      await delay(500);
    }
    throw new Error('Frontend nao respondeu dentro do prazo; consulte logs/dev-frontend.err.log.');
  } finally {
    if (child && !ready) child.kill();
    await lock.close();
    await unlink(lockPath).catch(() => {});
  }
}

export async function ensureFrontend({ root, base = 'http://localhost:3000', timeoutMs = 60000 }) {
  if (await isFrontendReady(base)) return 'reused';
  const url = new URL(base);
  if (url.protocol !== 'http:' || !['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)) {
    throw new Error('Frontend configurado indisponivel; inicializacao automatica limitada ao loopback HTTP.');
  }
  const logs = path.join(root, '..', 'site-dev-logs');
  await mkdir(logs, { recursive: true });
  const lockPath = path.join(logs, `dev-frontend-${url.port || '3000'}.lock`);
  const deadline = Date.now() + timeoutMs;
  const lock = await acquireLock(lockPath, deadline, base);
  if (lock === 'reused') return 'reused';
  if (!lock) throw new Error('Outra inicializacao do frontend nao concluiu dentro do prazo.');
  const result = await startFrontend({ root, base, deadline, logs, lock, lockPath });
  return result;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  try {
    const result = await ensureFrontend({ root, base });
    console.log(`[dev] Frontend ${result}: ${base}`);
  } catch (error) {
    console.error(`[dev] ${error.message}`);
    process.exitCode = 1;
  }
}
