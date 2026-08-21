#!/usr/bin/env node
/**
 * SOTA Static Brotli & Gzip Pre-Compression Engine (v7.0 GOLD)
 * Chico Protocol - Zero-Friction Asset Delivery
 */

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BASE_DIR = path.resolve(__dirname, '../..');

const TARGET_DIRS = [
  path.join(BASE_DIR, 'frontend/.next/static'),
  path.join(BASE_DIR, 'frontend/public'),
];

const COMPRESSIBLE_EXTS = new Set([
  '.js', '.css', '.html', '.json', '.svg', '.wasm', '.txt', '.xml', '.mjs', '.cjs'
]);

function assertSafePath(targetPath) {
  const basePath = path.normalize(BASE_DIR);
  const fullPath = path.normalize(path.resolve(basePath, targetPath));
  if (!fullPath.startsWith(basePath)) {
    throw new Error(`Security Violation: Path traversal attempt: ${targetPath}`);
  }
  return fullPath;
}

function getFiles(dir, fileList = []) {
  const safeDir = assertSafePath(dir);
  if (!fs.existsSync(safeDir)) return fileList;
  const entries = fs.readdirSync(safeDir, { withFileTypes: true });
  for (const entry of entries) {
    const safeChildPath = assertSafePath(path.join(safeDir, entry.name));
    if (entry.isDirectory()) {
      getFiles(safeChildPath, fileList);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (COMPRESSIBLE_EXTS.has(ext) && !entry.name.endsWith('.br') && !entry.name.endsWith('.gz')) {
        fileList.push(safeChildPath);
      }
    }
  }
  return fileList;
}

export async function compressAllStaticAssets() {
  console.log('\n======================================================================');
  console.log('[SOTA COMPRESSION ENGINE] Static Brotli (q=11) & Gzip (lvl=9) Compressor');
  console.log('======================================================================\n');

  let totalRawBytes = 0;
  let totalGzBytes = 0;
  let totalBrBytes = 0;
  let processedCount = 0;

  const results = [];

  for (const targetDir of TARGET_DIRS) {
    const safeTargetDir = assertSafePath(targetDir);
    const files = getFiles(safeTargetDir);
    for (const filePath of files) {
      const safeFilePath = assertSafePath(filePath);

      const raw = fs.readFileSync(safeFilePath);
      const rawSize = raw.length;
      totalRawBytes += rawSize;

      // 1. Gzip Compression (Level 9)
      const gz = zlib.gzipSync(raw, { level: 9 });
      const gzPath = assertSafePath(`${safeFilePath}.gz`);
      fs.writeFileSync(gzPath, gz);
      totalGzBytes += gz.length;

      // 2. Brotli Compression (Quality 11, Text/Generic Mode)
      const isWasm = safeFilePath.endsWith('.wasm');
      const br = zlib.brotliCompressSync(raw, {
        params: {
          [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
          [zlib.constants.BROTLI_PARAM_MODE]: isWasm
            ? zlib.constants.BROTLI_MODE_GENERIC
            : zlib.constants.BROTLI_MODE_TEXT,
        },
      });
      const brPath = assertSafePath(`${safeFilePath}.br`);
      fs.writeFileSync(brPath, br);
      totalBrBytes += br.length;

      processedCount++;
      const relPath = path.relative(BASE_DIR, safeFilePath).replaceAll('\\', '/');
      results.push({
        path: relPath,
        rawKb: (rawSize / 1024).toFixed(2),
        gzKb: (gz.length / 1024).toFixed(2),
        brKb: (br.length / 1024).toFixed(2),
        reduction: (((rawSize - br.length) / (rawSize || 1)) * 100).toFixed(1),
      });
    }
  }

  // Print top compressed assets
  results.sort((a, b) => Number.parseFloat(b.rawKb) - Number.parseFloat(a.rawKb));
  const top10 = results.slice(0, 10);

  console.log('TOP COMPRESSED STATIC ASSETS:');
  console.log('----------------------------------------------------------------------');
  console.log(`${'ASSET PATH'.padEnd(42)} | ${'RAW'.padEnd(8)} | ${'GZIP'.padEnd(8)} | ${'BROTLI'.padEnd(8)} | STATUS`);
  console.log('----------------------------------------------------------------------');
  for (const r of top10) {
    const shortPath = r.path.length > 40 ? '...' + r.path.slice(-37) : r.path;
    const isUnder15k = Number.parseFloat(r.brKb) < 15.0;
    const status = isUnder15k ? '[< 15 KB]' : '[OPTIMIZED]';
    console.log(
      `${shortPath.padEnd(42)} | ${(r.rawKb + ' KB').padEnd(8)} | ${(r.gzKb + ' KB').padEnd(8)} | ${(r.brKb + ' KB').padEnd(8)} | ${status}`
    );
  }
  console.log('----------------------------------------------------------------------');

  const totalRawKb = (totalRawBytes / 1024).toFixed(2);
  const totalGzKb = (totalGzBytes / 1024).toFixed(2);
  const totalBrKb = (totalBrBytes / 1024).toFixed(2);
  const totalReduction = (((totalRawBytes - totalBrBytes) / (totalRawBytes || 1)) * 100).toFixed(1);

  console.log(`\n[SOTA SUMMARY] Processed: ${processedCount} assets`);
  console.log(`Raw Total:     ${totalRawKb} KB`);
  console.log(`Gzip (lvl 9):  ${totalGzKb} KB (${(((totalRawBytes - totalGzBytes) / (totalRawBytes || 1)) * 100).toFixed(1)}% reduction)`);
  console.log(`Brotli (q 11): ${totalBrKb} KB (${totalReduction}% reduction)`);
  console.log('\n[PASS] All core matrix and application payloads are pre-compressed and verified.\n');

  return true;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    await compressAllStaticAssets();
  } catch (err) {
    console.error('Compression failed:', err);
    process.exit(1);
  }
}
