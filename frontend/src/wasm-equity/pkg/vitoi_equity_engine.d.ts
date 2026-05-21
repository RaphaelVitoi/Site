/* tslint:disable */
/* eslint-disable */

export class MultiwayRioProfiler {
	free(): void;
	[Symbol.dispose](): void;
	compute_profile(max_players: number, spr_levels: number): Float32Array;
	constructor(base_tension: number);
}

export class QuantumCfrEngine {
	free(): void;
	[Symbol.dispose](): void;
	compute_cfr_heatmap(nodes: number, iterations: number, kappa: number): Float32Array;
	constructor();
}

export function calculate_equity_monte_carlo_binary(
	hero_mask: Uint8Array,
	villain_mask: Uint8Array,
	board: string,
	iterations: number,
	seed: number,
	kappa: number,
): number;

export function solve_icm_distortion_binary(
	ip_rp: number,
	oop_rp: number,
	topologic_aggression: number,
	active_players: number,
	freqs: any,
): any;

export function solve_icm_distortion_v2(
	ip_rp: number,
	oop_rp: number,
	topologic_aggression: number,
	active_players: number,
	pot_size: number,
	street_idx: number,
	fold: number,
	_call: number,
	raise: number,
): Float64Array;

export function solve_icm_distortion_zerocopy(payload: Float64Array): Float64Array;

export function solve_insolvency_matrix_binary(
	villain_mask: Uint8Array,
	board: string,
	rp_factor: number,
	hero_invested: number,
	current_pot: number,
	active_players: number,
	iterations: number,
	seed: number,
	kappa: number,
): Array<any>;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
	readonly memory: WebAssembly.Memory;
	readonly __wbg_multiwayrioprofiler_free: (a: number, b: number) => void;
	readonly __wbg_quantumcfrengine_free: (a: number, b: number) => void;
	readonly calculate_equity_monte_carlo_binary: (
		a: number,
		b: number,
		c: number,
		d: number,
		e: number,
		f: number,
		g: number,
		h: number,
		i: number,
	) => number;
	readonly multiwayrioprofiler_compute_profile: (a: number, b: number, c: number) => any;
	readonly quantumcfrengine_compute_cfr_heatmap: (
		a: number,
		b: number,
		c: number,
		d: number,
	) => any;
	readonly quantumcfrengine_new: () => number;
	readonly solve_icm_distortion_binary: (
		a: number,
		b: number,
		c: number,
		d: number,
		e: any,
	) => any;
	readonly solve_icm_distortion_v2: (
		a: number,
		b: number,
		c: number,
		d: number,
		e: number,
		f: number,
		g: number,
		h: number,
		i: number,
	) => any;
	readonly solve_icm_distortion_zerocopy: (a: number, b: number) => any;
	readonly solve_insolvency_matrix_binary: (
		a: number,
		b: number,
		c: number,
		d: number,
		e: number,
		f: number,
		g: number,
		h: number,
		i: number,
		j: number,
		k: number,
	) => any;
	readonly multiwayrioprofiler_new: (a: number) => number;
	readonly __wbindgen_malloc: (a: number, b: number) => number;
	readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
	readonly __wbindgen_exn_store: (a: number) => void;
	readonly __externref_table_alloc: () => number;
	readonly __wbindgen_externrefs: WebAssembly.Table;
	readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init(
	module_or_path?:
		| { module_or_path: InitInput | Promise<InitInput> }
		| InitInput
		| Promise<InitInput>,
): Promise<InitOutput>;
