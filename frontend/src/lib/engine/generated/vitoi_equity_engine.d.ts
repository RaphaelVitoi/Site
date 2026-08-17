/* tslint:disable */
/* eslint-disable */

/**
 * ========================================================================
 * SOTA MEMORY BRIDGE: ZERO-COPY ALLOCATION
 * ========================================================================
 * Aloca um buffer contíguo no Heap do WASM e devolve o ponteiro bruto ao JS.
 * Garante que o React deposite o array de ranges sem overflow.
 */
export function alloc_range_buffer(size: number): number;

/**
 * Interface FFI para Monte Carlo de Equidade
 */
export function calculate_equity_monte_carlo_binary(hero_mask: Uint8Array, villain_mask: Uint8Array, board: string, iterations: number, seed: number, kappa: number): number;

/**
 * SOTA: FFI Zero-Copy Pointer Input Multiway
 * O ecossistema React/WebWorker deposita a matriz probabilística diretamente na memória partilhada.
 * Fricção zero. Aniquila o Gargalo de Serialização JSON no ambiente Multiway.
 */
export function calculate_multiway_equity_zerocopy(ranges_ptr: number, num_players: number, board_mask: bigint, target_iterations: number, seed: number): Float64Array;

/**
 * Interface FFI para Perspectiva Matemática SOTA v7.0 GOLD
 */
export function calculate_perspectiva_vitoi_wasm(current_equity_pct: number, delta_win_pct: number, delta_lose_pct: number, dynamic_ev_fold: number, realization_factor: number, fgs_health: number, active_players: number, _hero_invested: number, current_pot: number, stack_eff: number, hero_rp: number, villain_rp: number, bounty_value: number, edge_base: number, human_noise_factor: number, reference_status: number): Float64Array;

/**
 * Libera a memória previamente alocada. Mandatório no ciclo de vida (useEffect) do React.
 */
export function free_range_buffer(ptr: number, size: number): void;

/**
 * Interface FFI para Distorção Quântica (Nash)
 */
export function solve_icm_distortion_binary(ip_rp: number, oop_rp: number, topologic_aggression: number, active_players: number, freqs: unknown): unknown;

/**
 * SOTA v4.2: Topologic Aggression 2.0 (Gravidade do Pote)
 * Implementa a inércia estratégica e o Downward Drift dinâmico.
 */
export function solve_icm_distortion_v2(ip_rp: number, oop_rp: number, topologic_aggression: number, active_players: number, pot_size: number, street_idx: number, fold: number, raise: number): Float64Array;

/**
 * SOTA: FFI Zero-Copy O(1) para Distorção Quântica
 */
export function solve_icm_distortion_zerocopy(payload: Float64Array): Float64Array;

/**
 * Interface FFI para Matriz de Insolvência
 */
export function solve_insolvency_matrix_binary(villain_mask: Uint8Array, board: string, rp_factor: number, hero_invested: number, current_pot: number, active_players: number, iterations: number, seed: number, kappa: number): Array<unknown>;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly alloc_range_buffer: (a: number) => number;
    readonly calculate_equity_monte_carlo_binary: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number) => number;
    readonly calculate_multiway_equity_zerocopy: (a: number, b: number, c: bigint, d: number, e: number) => unknown;
    readonly calculate_perspectiva_vitoi_wasm: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number, n: number, o: number, p: number) => unknown;
    readonly free_range_buffer: (a: number, b: number) => void;
    readonly solve_icm_distortion_binary: (a: number, b: number, c: number, d: number, e: unknown) => unknown;
    readonly solve_icm_distortion_v2: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => unknown;
    readonly solve_icm_distortion_zerocopy: (a: number, b: number) => unknown;
    readonly solve_insolvency_matrix_binary: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number) => unknown;
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
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
