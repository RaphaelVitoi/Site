/**
 * Desktop Lighthouse collector for the canonical local Chrome Dev instance.
 *
 * The collector is deliberately narrow: it audits a loopback URL through the
 * existing remote-debugging port, leaves browser storage untouched, and writes
 * the raw Lighthouse result together with the exact CWV values used by the
 * PowerShell quality gate.  It never derives TBT from PerformanceObserver,
 * DevTools screenshot totals, or manually supplied values.
 */
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import lighthouse from 'lighthouse';

function argument(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : (process.argv[index + 1] ?? null);
}

function finiteAuditMetric(lhr, auditId) {
  const value = lhr?.audits?.[auditId]?.numericValue;
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

/**
 * Expose a tiny pure contract for tests and for the PowerShell gate.  The
 * result deliberately has null values when Lighthouse did not calculate a
 * metric; downstream policy must fail closed rather than estimate it.
 */
export function extractLighthouseCwv(lhr) {
  return {
    tbtMs: finiteAuditMetric(lhr, 'total-blocking-time'),
    lcpMs: finiteAuditMetric(lhr, 'largest-contentful-paint'),
    cls: finiteAuditMetric(lhr, 'cumulative-layout-shift'),
  };
}

const NON_PRODUCTION_INPUT_DIRECTORIES = new Set(['.git', '.next', 'coverage', 'node_modules', 'reports']);

async function listProductionInputs(root, directory = root) {
  const entries = await readdir(directory, { withFileTypes: true });
  const sortedEntries = entries.toSorted((left, right) => left.name.localeCompare(right.name));
  const files = [];
  for (const entry of sortedEntries) {
    const candidate = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!NON_PRODUCTION_INPUT_DIRECTORIES.has(entry.name)) {
        files.push(...(await listProductionInputs(root, candidate)));
      }
    } else if (entry.isFile()) {
      files.push(candidate);
    }
  }
  return files;
}

/**
 * Content-address the source tree that was handed to `next build`.
 *
 * The digest is independent from file timestamp and enumeration order. Symlinks
 * are deliberately excluded by `Dirent.isFile()`/`isDirectory()` so an audit
 * cannot silently certify files that live outside its declared source root.
 */
export async function fingerprintProductionInputs(sourceRoot) {
  const root = path.resolve(sourceRoot);
  const digest = createHash('sha256');
  for (const file of await listProductionInputs(root)) {
    const relative = path.relative(root, file).split(path.sep).join('/');
    const fileDigest = createHash('sha256')
      .update(await readFile(file))
      .digest('hex');
    digest.update(relative, 'utf8');
    digest.update('\0', 'utf8');
    digest.update(fileDigest, 'utf8');
    digest.update('\n', 'utf8');
  }
  return digest.digest('hex');
}

function validateLoopbackUrl(value) {
  const target = new URL(value);
  if (!['localhost', '127.0.0.1', '[::1]'].includes(target.hostname)) {
    throw new Error('A auditoria Lighthouse aceita somente alvo loopback local.');
  }
  return target.toString();
}

function outputPath(value) {
  if (!value) {
    throw new Error('Uso: --url <loopback> --port <CDP> --source-root <diretorio> --output <arquivo-json>');
  }
  return path.resolve(value);
}

async function collect() {
  const targetUrl = validateLoopbackUrl(argument('--url'));
  const port = Number(argument('--port'));
  const output = outputPath(argument('--output'));
  const sourceRoot = argument('--source-root');

  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error('A porta CDP deve ser um inteiro entre 1 e 65535.');
  }
  if (!sourceRoot) {
    throw new Error('A auditoria Lighthouse exige --source-root para vincular o resultado ao input de producao.');
  }
  const inputFingerprintSha256 = await fingerprintProductionInputs(sourceRoot);

  const result = await lighthouse(targetUrl, {
    port,
    onlyCategories: ['performance'],
    formFactor: 'desktop',
    throttlingMethod: 'provided',
    screenEmulation: { disabled: true },
    disableStorageReset: true,
    logLevel: 'error',
  });
  const lhr = result?.lhr;
  const metrics = extractLighthouseCwv(lhr);

  if (!lhr || metrics.tbtMs === null) {
    throw new Error('O Lighthouse terminou sem um valor numerico para total-blocking-time.');
  }

  const artifact = {
    schema_version: '1.0',
    source: 'lighthouse',
    generated_at: new Date().toISOString(),
    target_url: targetUrl,
    browser_port: port,
    input_fingerprint_sha256: inputFingerprintSha256,
    metrics,
    performance_score: lhr.categories?.performance?.score ?? null,
    lighthouse_report: lhr,
  };

  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(artifact, null, 2)}\n`, 'utf8');
  process.stdout.write(`${JSON.stringify({ output, metrics, performanceScore: artifact.performance_score })}\n`);
}

async function main() {
  if (process.argv.includes('--fingerprint')) {
    const sourceRoot = argument('--source-root');
    if (!sourceRoot) throw new Error('O modo --fingerprint exige --source-root.');
    process.stdout.write(`${await fingerprintProductionInputs(sourceRoot)}\n`);
    return;
  }
  await collect();
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    await main();
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}
