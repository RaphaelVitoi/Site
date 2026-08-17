import { copyFileSync, existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const crateDirectory = path.join(repositoryRoot, 'wasm-equity');
const generatedDirectory = path.join(repositoryRoot, 'frontend', 'src', 'lib', 'engine', 'generated');
const generatedTypes = path.join(generatedDirectory, 'vitoi_equity_engine.d.ts');
const generatedRawTypes = path.join(generatedDirectory, 'vitoi_equity_engine_bg.wasm.d.ts');
const generatedJavaScript = path.join(generatedDirectory, 'vitoi_equity_engine.js');
const generatedWasm = path.join(generatedDirectory, 'vitoi_equity_engine_bg.wasm');
const publicWasm = path.join(repositoryRoot, 'frontend', 'public', 'wasm', 'vitoi_equity_engine_bg.wasm');
const generatedIgnore = path.join(generatedDirectory, '.gitignore');
const wasmPackExecutable = process.platform === 'win32' ? 'wasm-pack.exe' : 'wasm-pack';

const expectedWasmPackVersion = 'wasm-pack 0.15.0';
const version = spawnSync(wasmPackExecutable, ['--version'], { encoding: 'utf8' });
if (version.status !== 0 || version.stdout.trim() !== expectedWasmPackVersion) {
	throw new Error(`Expected ${expectedWasmPackVersion}; received ${version.stdout.trim() || 'unavailable'}.`);
}

const build = spawnSync(
	wasmPackExecutable,
	[
		'build',
		crateDirectory,
		'--target',
		'web',
		'--out-dir',
		'../frontend/src/lib/engine/generated',
		'--release',
		'--no-pack',
		'--',
		'--locked',
	],
	{
		cwd: repositoryRoot,
		encoding: 'utf8',
		env: {
			...process.env,
			CARGO_TARGET_DIR: path.join(crateDirectory, 'target-wasm-pack'),
		},
	},
);

process.stdout.write(build.stdout);
process.stderr.write(build.stderr);
if (build.status !== 0) process.exit(build.status ?? 1);

if (existsSync(generatedIgnore)) rmSync(generatedIgnore);

for (const generatedTextFile of [generatedTypes, generatedRawTypes, generatedJavaScript]) {
	const strictGeneratedText = readFileSync(generatedTextFile, 'utf8').replace(/\bany\b/g, 'unknown');
	writeFileSync(generatedTextFile, strictGeneratedText, 'utf8');
}
copyFileSync(generatedWasm, publicWasm);
