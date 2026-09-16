import initWasm, {
	solve_pluribus_multiway_adapter_wasm,
} from '@/lib/engine/generated/vitoi_equity_engine';
import {
	executePluribusWasmKernel,
	wrapPluribusWasmKernel,
	type PluribusWasmKernel,
} from '@/lib/pluribusWasmAdapter';
import type { PluribusExecutor } from '@/lib/engineExecutionGateway';

let initialization: Promise<PluribusWasmKernel> | undefined;

function initializePluribusWasm(): Promise<PluribusWasmKernel> {
	initialization ??= initWasm({ module_or_path: '/wasm/vitoi_equity_engine_bg.wasm' }).then(
		() => wrapPluribusWasmKernel(solve_pluribus_multiway_adapter_wasm),
	);
	return initialization;
}

export function createPluribusBrowserWasmExecutor(): PluribusExecutor {
	return async (input) => executePluribusWasmKernel(await initializePluribusWasm(), input);
}
