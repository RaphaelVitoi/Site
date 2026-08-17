export interface InitSyncInput {
	module: WebAssembly.Module;
}

export default function initWasm(input?: unknown): Promise<void>;

export function initSync(input: InitSyncInput | WebAssembly.Module): void;

export function calculate_equity_monte_carlo_binary(
	heroRange: Uint8Array,
	villainRange: Uint8Array,
	board: string,
	iterations: number,
	seed: number,
	kappa: number
): number;
