import type {
	PluribusAction,
	PluribusSolveOutput,
	PluribusStateConfig,
	TablePosition,
	TableStreet,
} from '@/lib/pluribusMultiwayEngine';

/** Parâmetros de configuração passados ao kernel Pluribus WASM. */
export interface PluribusWasmKernelOptions {
	pot: number;
	numPlayers: number;
	activeStacks: Float64Array;
	lambdaFactor: number;
	nominalEquity: number;
	heroPosition: number;
	street: number;
	depthStreets: number;
	iterations: number;
}

/** Tipo público do kernel: recebe um objeto de opções e retorna o buffer WASM. */
export type PluribusWasmKernel = (options: PluribusWasmKernelOptions) => Float64Array;

/**
 * Adapta um kernel raw posicional (ABI Rust/WASM) para a interface de opções pública.
 * Use esta função nos runtimes para converter `solve_pluribus_multiway_adapter_wasm`.
 */
export function wrapPluribusWasmKernel(
	raw: (...args: [number, number, Float64Array, number, number, number, number, number, number]) => Float64Array,
): PluribusWasmKernel {
	return (o) => raw(o.pot, o.numPlayers, o.activeStacks, o.lambdaFactor, o.nominalEquity, o.heroPosition, o.street, o.depthStreets, o.iterations);
}

const POSITION_CODE: Record<TablePosition, number> = {
	BTN: 0,
	CO: 1,
	MP: 2,
	UTG: 3,
	SB: 4,
	BB: 5,
};

const STREET_CODE: Record<TableStreet, number> = {
	preflop: 0,
	flop: 1,
	turn: 2,
	river: 3,
};

const ACTION_BY_CODE: readonly PluribusAction[] = ['FOLD', 'CALL', 'RAISE'];
const OUTPUT_LENGTH = 19;

function finiteAt(output: Float64Array, index: number): number {
	const value = output[index];
	if (value === undefined || !Number.isFinite(value)) {
		throw new Error(`Pluribus WASM returned invalid value at index ${index}`);
	}
	return value;
}

export function executePluribusWasmKernel(
	kernel: PluribusWasmKernel,
	input: PluribusStateConfig,
): PluribusSolveOutput {
	const heroPositionCode = POSITION_CODE[input.heroPosition];
	if (heroPositionCode === undefined) {
		throw new RangeError('heroPosition must be BTN, CO, MP, UTG, SB, or BB');
	}
	const streetCode = STREET_CODE[input.street ?? 'flop'];
	if (streetCode === undefined) {
		throw new RangeError('street must be preflop, flop, turn, or river');
	}
	const output = kernel({
		pot: input.pot,
		numPlayers: input.numPlayers,
		activeStacks: new Float64Array(input.activeStacks),
		lambdaFactor: input.lambdaFactor ?? 2.25,
		nominalEquity: input.nominalEquity,
		heroPosition: heroPositionCode,
		street: streetCode,
		depthStreets: input.depthStreets ?? 1,
		iterations: input.iterations ?? 60,
	});
	if (output.length !== OUTPUT_LENGTH) {
		throw new Error(`Pluribus WASM returned ${output.length} values; expected ${OUTPUT_LENGTH}`);
	}

	const optimalAction = ACTION_BY_CODE[finiteAt(output, 3)];
	if (!optimalAction) throw new Error('Pluribus WASM returned an invalid optimal action');

	return {
		strategy: {
			FOLD: finiteAt(output, 0),
			CALL: finiteAt(output, 1),
			RAISE: finiteAt(output, 2),
		},
		optimalAction,
		structuralLiability: finiteAt(output, 4),
		effectiveEquity: finiteAt(output, 5),
		posMultiplier: finiteAt(output, 6),
		kOpponents: finiteAt(output, 7),
		iterations: finiteAt(output, 8),
		depthStreets: finiteAt(output, 9),
		effectiveStack: finiteAt(output, 10),
		stackToPotRatio: finiteAt(output, 11),
		callCost: finiteAt(output, 12),
		raiseCost: finiteAt(output, 13),
		futureStreets: finiteAt(output, 14),
		horizonLiability: finiteAt(output, 15),
		evs: {
			FOLD: finiteAt(output, 16),
			CALL: finiteAt(output, 17),
			RAISE: finiteAt(output, 18),
		},
	};
}
