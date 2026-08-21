/**
 * gen_favicon.mjs — SOTA Favicon Generator
 * Generates favicon.ico (multi-resolution ICO) from the project SVG.
 * Uses sharp for rasterization and ico-endec/png-to-ico for ICO packaging.
 */
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'frontend', 'public');

const svgSource = Buffer.from(
  '<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">' +
  '<circle cx="32" cy="32" r="30" fill="#0b0e11" stroke="#3b82f6" stroke-width="3"/>' +
  '<rect x="23" y="23" width="18" height="18" rx="2" transform="rotate(45 32 32)" fill="#10b981"/>' +
  '</svg>'
);

async function generateSizes() {
  const sizes = [16, 32, 48];
  const buffers = [];

  for (const size of sizes) {
    const buf = await sharp(svgSource, { density: 300 })
      .resize(size, size)
      .png()
      .toBuffer();
    buffers.push({ size, buf });
    console.log(`[OK] ${size}x${size} PNG generated (${buf.length} bytes)`);
  }

  return buffers;
}

function buildIco(pngBuffers) {
  // ICO file format: header + directory + image data
  const numImages = pngBuffers.length;
  const HEADER_SIZE = 6;
  const DIR_ENTRY_SIZE = 16;
  const headerBuf = Buffer.alloc(HEADER_SIZE);
  headerBuf.writeUInt16LE(0, 0); // reserved
  headerBuf.writeUInt16LE(1, 2); // type: ICO
  headerBuf.writeUInt16LE(numImages, 4);

  let imageDataOffset = HEADER_SIZE + DIR_ENTRY_SIZE * numImages;
  const dirEntries = [];
  
  for (const { size, buf } of pngBuffers) {
    const entry = Buffer.alloc(DIR_ENTRY_SIZE);
    entry.writeUInt8(size === 256 ? 0 : size, 0);  // width
    entry.writeUInt8(size === 256 ? 0 : size, 1);  // height
    entry.writeUInt8(0, 2);   // color count
    entry.writeUInt8(0, 3);   // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(buf.length, 8); // image size
    entry.writeUInt32LE(imageDataOffset, 12); // offset
    dirEntries.push(entry);
    imageDataOffset += buf.length;
  }

  const parts = [headerBuf, ...dirEntries, ...pngBuffers.map(p => p.buf)];
  return Buffer.concat(parts);
}

const pngBuffers = await generateSizes();
const icoBuffer = buildIco(pngBuffers);
const icoPath = join(publicDir, 'favicon.ico');
writeFileSync(icoPath, icoBuffer);
console.log(`[OK] favicon.ico written → ${icoPath} (${icoBuffer.length} bytes)`);
