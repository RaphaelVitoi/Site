import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import initWasm, {
	initSync,
	solve_pluribus_multiway_adapter_wasm,
} from '@/lib/engine/generated/vitoi_equity_engine';
import {
	executePluribusWasmKernel,
	wrapPluribusWasmKernel,
} from '@/lib/pluribusWasmAdapter';
import type { PluribusExecutor } from '@/lib/engineExecutionGateway';

let initialization: Promise<void> | undefined;

function initializePluribusWasm(): Promise<void> {
	if (initialization) return initialization;
	initialization = (async () => {
		const cwd = process.cwd();
		const candidates = [
			path.resolve(__dirname, 'engine/generated/vitoi_equity_engine_bg.wasm'),
			path.resolve(cwd, 'src/lib/engine/generated/vitoi_equity_engine_bg.wasm'),
			path.resolve(cwd, 'frontend/src/lib/engine/generated/vitoi_equity_engine_bg.wasm'),
			path.resolve(cwd, 'public/wasm/vitoi_equity_engine_bg.wasm'),
			path.resolve(cwd, 'frontend/public/wasm/vitoi_equity_engine_bg.wasm'),
		];
		const wasmPath = candidates.find(existsSync);
		if (!wasmPath) {
			await initWasm();
			return;
		}
		const wasmBytes = readFileSync(wasmPath);
		try {
			initSync({ module: new WebAssembly.Module(wasmBytes) });
		} catch {
			await initWasm(wasmBytes.buffer);
		}
	})();
	return initialization;
}

export function createPluribusNodeWasmExecutor(): PluribusExecutor {
	return async (input) => {
		await initializePluribusWasm();
		return executePluribusWasmKernel(wrapPluribusWasmKernel(solve_pluribus_multiway_adapter_wasm), input);
	};
}
