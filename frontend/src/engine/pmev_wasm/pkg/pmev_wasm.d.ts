/* tslint:disable */
/* eslint-disable */

export class PmevEngine {
    free(): void;
    [Symbol.dispose](): void;
    calculate_perspective(equity: number, realization_factor: number, valuation_stack: number, ev_fold_dynamic: number, structural_liability: number, stack_depth_bb: number, active_players: number, edge_base: number, aggression_factor: number, pot_size: number): any;
    constructor();
    simulate_decision_tree(equity: number, pot_size: number, stack_eff: number, active_players: number, street_idx: number, hero_invested: number, ev_fold_dynamic: number, structural_liability: number, valuation_stack: number, amortized_edge: number, aggression_factor: number, realization_factor: number, loss_aversion_base: number, fgs_health: number, rp_opp: number, fold_equity: number): any;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_pmevengine_free: (a: number, b: number) => void;
    readonly pmevengine_calculate_perspective: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number) => any;
    readonly pmevengine_new: () => number;
    readonly pmevengine_simulate_decision_tree: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number, n: number, o: number, p: number, q: number) => any;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
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
