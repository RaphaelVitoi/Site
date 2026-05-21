/**
 * ANTEVISÃO: Motor SOTA de Força Bruta e Monte Carlo com suporte a Frequências GTO (Weights).
 * Aloca uma simulação intensiva consumindo a CPU limpa do Worker (Thread Separada do React).
 * @param {string} hero_hands_str
 * @param {string} villain_hands_str
 * @param {string} board_str
 * @param {number} iterations
 * @param {number} seed
 * @returns {number}
 */
export function calculate_equity_monte_carlo(hero_hands_str, villain_hands_str, board_str, iterations, seed) {
    const ptr0 = passStringToWasm0(hero_hands_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(villain_hands_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passStringToWasm0(board_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len2 = WASM_VECTOR_LEN;
    const ret = wasm.calculate_equity_monte_carlo(ptr0, len0, ptr1, len1, ptr2, len2, iterations, seed);
    return ret;
}

/**
 * SOTA: Variante de Fricção Zero que consome o Uint8Array (Bitmask) injetado diretamente pela ponte,
 * erradicando o payload de strings na interface FFI.
 * @param {Uint8Array} hero_mask
 * @param {Uint8Array} villain_mask
 * @param {string} board_str
 * @param {number} iterations
 * @param {number} seed
 * @returns {number}
 */
export function calculate_equity_monte_carlo_binary(hero_mask, villain_mask, board_str, iterations, seed) {
    const ptr0 = passArray8ToWasm0(hero_mask, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray8ToWasm0(villain_mask, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passStringToWasm0(board_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len2 = WASM_VECTOR_LEN;
    const ret = wasm.calculate_equity_monte_carlo_binary(ptr0, len0, ptr1, len1, ptr2, len2, iterations, seed);
    return ret;
}

/**
 * ANTEVISÃO: Função O(1) de alocação para avaliar o rank absoluto de uma mão Texas Hold'em.
 * Formato esperado em `cards_str`: "AhKh7d8c9s" (2 cartas da mão + 3 a 5 cartas do board).
 * Retorna um valor numérico representando a força da mão. Retorna -1 em caso de entropia (string inválida).
 * @param {string} cards_str
 * @returns {number}
 */
export function evaluate_hand_strength(cards_str) {
    const ptr0 = passStringToWasm0(cards_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.evaluate_hand_strength(ptr0, len0);
    return ret;
}

export function main_js() {
    wasm.main_js();
}

/**
 * @param {string} villain_range
 * @param {string} board
 * @param {number} rp_factor
 * @param {number} hero_invested
 * @param {number} current_pot
 * @param {number} active_players
 * @param {number} iterations
 * @param {number} seed
 * @returns {any}
 */
export function solve_insolvency_matrix(villain_range, board, rp_factor, hero_invested, current_pot, active_players, iterations, seed) {
    const ptr0 = passStringToWasm0(villain_range, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(board, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.solve_insolvency_matrix(ptr0, len0, ptr1, len1, rp_factor, hero_invested, current_pot, active_players, iterations, seed);
    return ret;
}

/**
 * SOTA: Variante Binary para a Matriz de Insolvência. Consome o vetor binário do vilão em Fricção Zero.
 * @param {Uint8Array} villain_mask
 * @param {string} board
 * @param {number} rp_factor
 * @param {number} hero_invested
 * @param {number} current_pot
 * @param {number} active_players
 * @param {number} iterations
 * @param {number} seed
 * @returns {any}
 */
export function solve_insolvency_matrix_binary(villain_mask, board, rp_factor, hero_invested, current_pot, active_players, iterations, seed) {
    const ptr0 = passArray8ToWasm0(villain_mask, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(board, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.solve_insolvency_matrix_binary(ptr0, len0, ptr1, len1, rp_factor, hero_invested, current_pot, active_players, iterations, seed);
    return ret;
}
export function __wbg___wbindgen_debug_string_dd5d2d07ce9e6c57(arg0, arg1) {
    const ret = debugString(arg1);
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
}
export function __wbg___wbindgen_throw_81fc77679af83bc6(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
}
export function __wbg_error_a6fa202b58aa1cd3(arg0, arg1) {
    let deferred0_0;
    let deferred0_1;
    try {
        deferred0_0 = arg0;
        deferred0_1 = arg1;
        console.error(getStringFromWasm0(arg0, arg1));
    } finally {
        wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
    }
}
export function __wbg_new_227d7c05414eb861() {
    const ret = new Error();
    return ret;
}
export function __wbg_new_4f9fafbb3909af72() {
    const ret = new Object();
    return ret;
}
export function __wbg_new_f3c9df4f38f3f798() {
    const ret = new Array();
    return ret;
}
export function __wbg_set_6be42768c690e380(arg0, arg1, arg2) {
    arg0[arg1] = arg2;
}
export function __wbg_set_6c60b2e8ad0e9383(arg0, arg1, arg2) {
    arg0[arg1 >>> 0] = arg2;
}
export function __wbg_stack_3b0d974bbf31e44f(arg0, arg1) {
    const ret = arg1.stack;
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
}
export function __wbindgen_cast_0000000000000001(arg0) {
    // Cast intrinsic for `F64 -> Externref`.
    const ret = arg0;
    return ret;
}
export function __wbindgen_cast_0000000000000002(arg0, arg1) {
    // Cast intrinsic for `Ref(String) -> Externref`.
    const ret = getStringFromWasm0(arg0, arg1);
    return ret;
}
export function __wbindgen_init_externref_table() {
    const table = wasm.__wbindgen_externrefs;
    const offset = table.grow(4);
    table.set(0, undefined);
    table.set(offset + 0, undefined);
    table.set(offset + 1, null);
    table.set(offset + 2, true);
    table.set(offset + 3, false);
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

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return decodeText(ptr, len);
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1, 1) >>> 0;
    getUint8ArrayMemory0().set(arg, ptr / 1);
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


let wasm;
export function __wbg_set_wasm(val) {
    wasm = val;
}
