/* @ts-self-types="./vitoi_equity_engine.d.ts" */

/**
 * ========================================================================
 * SOTA MEMORY BRIDGE: ZERO-COPY ALLOCATION
 * ========================================================================
 * Aloca um buffer contíguo no Heap do WASM e devolve o ponteiro bruto ao JS.
 * Garante que o React deposite o array de ranges sem overflow.
 * @param {number} size
 * @returns {number}
 */
export function alloc_range_buffer(size) {
    const ret = wasm.alloc_range_buffer(size);
    return ret >>> 0;
}

/**
 * Interface FFI para Monte Carlo de Equidade
 * @param {Uint8Array} hero_mask
 * @param {Uint8Array} villain_mask
 * @param {string} board
 * @param {number} iterations
 * @param {number} seed
 * @param {number} kappa
 * @returns {number}
 */
export function calculate_equity_monte_carlo_binary(hero_mask, villain_mask, board, iterations, seed, kappa) {
    const ptr0 = passArray8ToWasm0(hero_mask, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray8ToWasm0(villain_mask, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passStringToWasm0(board, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len2 = WASM_VECTOR_LEN;
    const ret = wasm.calculate_equity_monte_carlo_binary(ptr0, len0, ptr1, len1, ptr2, len2, iterations, seed, kappa);
    return ret;
}

/**
 * SOTA: FFI Zero-Copy Pointer Input Multiway
 * O ecossistema React/WebWorker deposita a matriz probabilística diretamente na memória partilhada.
 * Fricção zero. Aniquila o Gargalo de Serialização JSON no ambiente Multiway.
 * @param {number} ranges_ptr
 * @param {number} num_players
 * @param {bigint} board_mask
 * @param {number} target_iterations
 * @param {number} seed
 * @returns {Float64Array}
 */
export function calculate_multiway_equity_zerocopy(ranges_ptr, num_players, board_mask, target_iterations, seed) {
    const ret = wasm.calculate_multiway_equity_zerocopy(ranges_ptr, num_players, board_mask, target_iterations, seed);
    return ret;
}

/**
 * Interface FFI para Perspectiva Matemática SOTA v7.0 GOLD
 * @param {number} current_equity_pct
 * @param {number} delta_win_pct
 * @param {number} delta_lose_pct
 * @param {number} dynamic_ev_fold
 * @param {number} realization_factor
 * @param {number} fgs_health
 * @param {number} active_players
 * @param {number} _hero_invested
 * @param {number} current_pot
 * @param {number} stack_eff
 * @param {number} hero_rp
 * @param {number} villain_rp
 * @param {number} bounty_value
 * @param {number} edge_base
 * @param {number} human_noise_factor
 * @returns {object}
 */
export function calculate_perspectiva_vitoi_wasm(current_equity_pct, delta_win_pct, delta_lose_pct, dynamic_ev_fold, realization_factor, fgs_health, active_players, _hero_invested, current_pot, stack_eff, hero_rp, villain_rp, bounty_value, edge_base, human_noise_factor) {
    const ret = wasm.calculate_perspectiva_vitoi_wasm(current_equity_pct, delta_win_pct, delta_lose_pct, dynamic_ev_fold, realization_factor, fgs_health, active_players, _hero_invested, current_pot, stack_eff, hero_rp, villain_rp, bounty_value, edge_base, human_noise_factor);
    return ret;
}

/**
 * Libera a memória previamente alocada. Mandatório no ciclo de vida (useEffect) do React.
 * @param {number} ptr
 * @param {number} size
 */
export function free_range_buffer(ptr, size) {
    wasm.free_range_buffer(ptr, size);
}

/**
 * Interface FFI para Distorção Quântica (Nash)
 * @param {number} ip_rp
 * @param {number} oop_rp
 * @param {number} topologic_aggression
 * @param {number} active_players
 * @param {any} freqs
 * @returns {any}
 */
export function solve_icm_distortion_binary(ip_rp, oop_rp, topologic_aggression, active_players, freqs) {
    const ret = wasm.solve_icm_distortion_binary(ip_rp, oop_rp, topologic_aggression, active_players, freqs);
    return ret;
}

/**
 * SOTA v4.2: Topologic Aggression 2.0 (Gravidade do Pote)
 * Implementa a inércia estratégica e o Downward Drift dinâmico.
 * @param {number} ip_rp
 * @param {number} oop_rp
 * @param {number} topologic_aggression
 * @param {number} active_players
 * @param {number} pot_size
 * @param {number} street_idx
 * @param {number} fold
 * @param {number} raise
 * @returns {Float64Array}
 */
export function solve_icm_distortion_v2(ip_rp, oop_rp, topologic_aggression, active_players, pot_size, street_idx, fold, raise) {
    const ret = wasm.solve_icm_distortion_v2(ip_rp, oop_rp, topologic_aggression, active_players, pot_size, street_idx, fold, raise);
    return ret;
}

/**
 * SOTA: FFI Zero-Copy O(1) para Distorção Quântica
 * @param {Float64Array} payload
 * @returns {Float64Array}
 */
export function solve_icm_distortion_zerocopy(payload) {
    const ptr0 = passArrayF64ToWasm0(payload, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.solve_icm_distortion_zerocopy(ptr0, len0);
    return ret;
}

/**
 * Interface FFI para Matriz de Insolvência
 * @param {Uint8Array} villain_mask
 * @param {string} board
 * @param {number} rp_factor
 * @param {number} hero_invested
 * @param {number} current_pot
 * @param {number} active_players
 * @param {number} iterations
 * @param {number} seed
 * @param {number} kappa
 * @returns {Array<any>}
 */
export function solve_insolvency_matrix_binary(villain_mask, board, rp_factor, hero_invested, current_pot, active_players, iterations, seed, kappa) {
    const ptr0 = passArray8ToWasm0(villain_mask, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(board, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.solve_insolvency_matrix_binary(ptr0, len0, ptr1, len1, rp_factor, hero_invested, current_pot, active_players, iterations, seed, kappa);
    return ret;
}
function __wbg_get_imports() {
    const import0 = {
        __proto__: null,
        __wbg___wbindgen_debug_string_edece8177ad01481: function(arg0, arg1) {
            const ret = debugString(arg1);
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg___wbindgen_number_get_f73a1244370fcc2c: function(arg0, arg1) {
            const obj = arg1;
            const ret = typeof(obj) === 'number' ? obj : undefined;
            getDataViewMemory0().setFloat64(arg0 + 8 * 1, isLikeNone(ret) ? 0 : ret, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
        },
        __wbg___wbindgen_throw_9c31b086c2b26051: function(arg0, arg1) {
            throw new Error(getStringFromWasm0(arg0, arg1));
        },
        __wbg_get_dcf82ab8aad1a593: function() { return handleError(function (arg0, arg1) {
            const ret = Reflect.get(arg0, arg1);
            return ret;
        }, arguments); },
        __wbg_new_02d162bc6cf02f60: function() {
            const ret = new Object();
            return ret;
        },
        __wbg_new_310879b66b6e95e1: function() {
            const ret = new Array();
            return ret;
        },
        __wbg_new_with_length_1278c16a5c5b497f: function(arg0) {
            const ret = new Float64Array(arg0 >>> 0);
            return ret;
        },
        __wbg_push_b77c476b01548d0a: function(arg0, arg1) {
            const ret = arg0.push(arg1);
            return ret;
        },
        __wbg_set_a0e911be3da02782: function() { return handleError(function (arg0, arg1, arg2) {
            const ret = Reflect.set(arg0, arg1, arg2);
            return ret;
        }, arguments); },
        __wbg_set_index_24a79f6bf22a9e3c: function(arg0, arg1, arg2) {
            arg0[arg1 >>> 0] = arg2;
        },
        __wbindgen_cast_0000000000000001: function(arg0) {
            // Cast intrinsic for `F64 -> Externref`.
            const ret = arg0;
            return ret;
        },
        __wbindgen_cast_0000000000000002: function(arg0, arg1) {
            // Cast intrinsic for `Ref(String) -> Externref`.
            const ret = getStringFromWasm0(arg0, arg1);
            return ret;
        },
        __wbindgen_init_externref_table: function() {
            const table = wasm.__wbindgen_externrefs;
            const offset = table.grow(4);
            table.set(0, undefined);
            table.set(offset + 0, undefined);
            table.set(offset + 1, null);
            table.set(offset + 2, true);
            table.set(offset + 3, false);
        },
    };
    return {
        __proto__: null,
        "./vitoi_equity_engine_bg.js": import0,
    };
}

function addToExternrefTable0(obj) {
    const idx = wasm.__externref_table_alloc();
    wasm.__wbindgen_externrefs.set(idx, obj);
    return idx;
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches && builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

let cachedDataViewMemory0 = null;
function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

let cachedFloat64ArrayMemory0 = null;
function getFloat64ArrayMemory0() {
    if (cachedFloat64ArrayMemory0 === null || cachedFloat64ArrayMemory0.byteLength === 0) {
        cachedFloat64ArrayMemory0 = new Float64Array(wasm.memory.buffer);
    }
    return cachedFloat64ArrayMemory0;
}

function getStringFromWasm0(ptr, len) {
    return decodeText(ptr >>> 0, len);
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        const idx = addToExternrefTable0(e);
        wasm.__wbindgen_exn_store(idx);
    }
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1, 1) >>> 0;
    getUint8ArrayMemory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function passArrayF64ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 8, 8) >>> 0;
    getFloat64ArrayMemory0().set(arg, ptr / 8);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }
    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = cachedTextEncoder.encodeInto(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
    numBytesDecoded += len;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
        cachedTextDecoder.decode();
        numBytesDecoded = len;
    }
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

const cachedTextEncoder = new TextEncoder();

if (!('encodeInto' in cachedTextEncoder)) {
    cachedTextEncoder.encodeInto = function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    };
}

let WASM_VECTOR_LEN = 0;

let wasmModule, wasmInstance, wasm;
function __wbg_finalize_init(instance, module) {
    wasmInstance = instance;
    wasm = instance.exports;
    wasmModule = module;
    cachedDataViewMemory0 = null;
    cachedFloat64ArrayMemory0 = null;
    cachedUint8ArrayMemory0 = null;
    wasm.__wbindgen_start();
    return wasm;
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);
            } catch (e) {
                const validResponse = module.ok && expectedResponseType(module.type);

                if (validResponse && module.headers.get('Content-Type') !== 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else { throw e; }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);
    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };
        } else {
            return instance;
        }
    }

    function expectedResponseType(type) {
        switch (type) {
            case 'basic': case 'cors': case 'default': return true;
        }
        return false;
    }
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (module !== undefined) {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports();
    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }
    const instance = new WebAssembly.Instance(module, imports);
    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (module_or_path !== undefined) {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (module_or_path === undefined) {
        module_or_path = new URL('vitoi_equity_engine_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync, __wbg_init as default };
