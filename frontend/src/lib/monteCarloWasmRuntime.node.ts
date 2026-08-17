import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import initWasm, {
	calculate_equity_monte_carlo_binary,
	initSync,
} from './engine/generated/vitoi_equity_engine';

export async function initializeMonteCarloWasm() {
	const cwd = process.cwd();
	const candidates = [
		path.resolve(__dirname, 'engine/generated/vitoi_equity_engine_bg.wasm'),
		path.resolve(cwd, 'src/lib/engine/generated/vitoi_equity_engine_bg.wasm'),
		path.resolve(cwd, 'frontend/src/lib/engine/generated/vitoi_equity_engine_bg.wasm'),
		path.resolve(cwd, 'public/wasm/vitoi_equity_engine_bg.wasm'),
		path.resolve(cwd, 'frontend/public/wasm/vitoi_equity_engine_bg.wasm'),
	];
	const wasmPath = candidates.find(existsSync);

	if (wasmPath) {
		const wasmBytes = readFileSync(wasmPath);
		try {
			initSync({ module: new WebAssembly.Module(wasmBytes) });
		} catch {
			await initWasm(wasmBytes.buffer);
		}
	} else {
		await initWasm();
	}

	return calculate_equity_monte_carlo_binary;
}
