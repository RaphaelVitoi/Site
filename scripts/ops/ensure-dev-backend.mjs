import { spawn } from 'node:child_process';
import { mkdir, open, readFile, unlink, access } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';

export async function isNexusReady(base) {
  try {
    const response = await fetch(new URL('/ping', base), { signal: AbortSignal.timeout(1500) });
    return response.ok && (await response.json()).status === 'PONG';
  } catch {
    return false;
  }
}

export async function ensureBackend({ root, base, python, timeoutMs = 60000 }) {
  if (await isNexusReady(base)) return 'reused';
  const url = new URL(base);
  if (url.protocol !== 'http:' || !['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)) {
    throw new Error('Backend configurado indisponivel; inicializacao automatica limitada ao loopback HTTP.');
  }
  await access(python);
  const logs = path.join(root, 'logs');
  await mkdir(logs, { recursive: true });
  const lockPath = path.join(logs, `dev-backend-${url.port || '80'}.lock`);
  const deadline = Date.now() + timeoutMs;
  let lock;
  while (!lock && Date.now() < deadline) {
    try {
      lock = await open(lockPath, 'wx');
      await lock.writeFile(String(process.pid));
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
      if (await isNexusReady(base)) return 'reused';
      const owner = Number(await readFile(lockPath, 'utf8').catch(() => ''));
      if (owner > 0) {
        try { process.kill(owner, 0); } catch (probeError) {
          if (probeError.code === 'ESRCH') await unlink(lockPath).catch(() => {});
        }
      }
      await delay(250);
    }
  }
  if (!lock) throw new Error('Outra inicializacao do backend nao concluiu dentro do prazo.');
  let child;
  let ready = false;
  try {
    if (await isNexusReady(base)) return 'reused';
    const log = await open(path.join(logs, 'dev-backend.log'), 'a');
    let spawnError;
    try {
      child = spawn(python, ['main.py'], {
        cwd: root, detached: true, windowsHide: true,
        stdio: ['ignore', log.fd, log.fd],
        env: { ...process.env, HOST: url.hostname.replaceAll(/[\[\]]/g, ''), NEXUS_PORT: url.port || '80' },
      });
      child.on('error', (error) => { spawnError = error; });
      child.unref();
    } finally { await log.close(); }
    while (Date.now() < deadline) {
      if (spawnError) throw spawnError;
      if (child.exitCode !== null) throw new Error(`Backend encerrou (${child.exitCode}); consulte logs/dev-backend.log.`);
      if (await isNexusReady(base)) { ready = true; return 'started'; }
      await delay(500);
    }
    throw new Error('Backend nao respondeu dentro do prazo; consulte logs/dev-backend.log.');
  } finally {
    if (child && !ready) child.kill();
    await lock.close();
    await unlink(lockPath);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  const require = createRequire(path.join(root, 'frontend/package.json'));
  require('@next/env').loadEnvConfig(path.join(root, 'frontend'), true);
  const base = process.env.NEXUS_API_BASE || process.env.BACKEND_API_URL ||
    process.env.NEXT_PUBLIC_NEXUS_API_BASE || process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:17042';
  const python = path.join(root, '.venv', process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python');
  ensureBackend({ root, base, python }).then(
    (result) => console.log(`[dev] Backend ${result}: ${new URL(base).origin}`),
    (error) => { console.error(`[dev] ${error.message}`); process.exitCode = 1; },
  );
}
