/** @format */
/* eslint-disable no-console */
import init, { solve_insolvency_matrix_binary, solve_icm_distortion_v2, } from '../../../../wasm-equity/pkg/vitoi_equity_engine.js';
import { maskToBytes, rangeToBitmask } from './rangeParser';
// SOTA FIX: Forçar o arquivo a ser tratado como um ES Module estrito
export const __INSOLVENCY_WORKER__ = true;
let initPromise = null; // SOTA: Promise Guard evita Race Conditions na injeção assíncrona do WebAssembly
globalThis.onmessage = async (e) => {
    const data = e.data;
    const { id } = data;
    try {
        if (!initPromise) {
            const isDev = process.env.NODE_ENV === 'development';
            const cacheBuster = isDev ? `?v=${Date.now()}` : '';
            initPromise = init(`/wasm/vitoi_equity_engine_bg.wasm${cacheBuster}`);
        }
        await initPromise;
        if (data.type === 'MATRIX') {
            const villainMask = maskToBytes(rangeToBitmask(data.villainRange));
            const seed = Math.floor(Math.random() * 4294967296);
            // SOTA: Executa o motor real em Rust para a Matriz de Insolvência
            const matrix = solve_insolvency_matrix_binary(villainMask, data.board || '', data.rpFactor, data.heroInvested, data.currentPot, data.activePlayers, 5000, // iterations
            seed, data.kappa);
            globalThis.postMessage({ type: 'MATRIX', matrix, id });
        }
        else if (data.type === 'DISTORTION') {
            const [potFlop, potTurn, potRiver] = data.pots;
            const formatStreetResults = (res, freqs, ipRp, oopRp) => {
                const spread = Math.max(3, Math.abs(ipRp - oopRp) * 0.25);
                // Rust v2 mapping: res[0]=fold, res[1]=call, res[2]=raise
                return {
                    ip: {
                        check: { center: freqs.ip_check, spread, delta: 0 },
                        bet_small: { center: freqs.ip_bet_small, spread, delta: 0 },
                        bet_large: { center: freqs.ip_bet_large, spread, delta: 0 },
                    },
                    oop: {
                        fold: {
                            center: res[0] * 100,
                            spread,
                            delta: res[0] * 100 - freqs.oop_fold,
                        },
                        call: {
                            center: res[1] * 100,
                            spread,
                            delta: res[1] * 100 - freqs.oop_call,
                        },
                        raise: {
                            center: res[2] * 100,
                            spread,
                            delta: res[2] * 100 - freqs.oop_raise,
                        },
                    },
                    deltaRp: ipRp - oopRp,
                };
            };
            const nashResults = {
                flop: formatStreetResults(solve_icm_distortion_v2(data.ipRpFlop, data.oopRpFlop, data.topologicAggression, data.activePlayers, potFlop, 0, data.freqFlop.oop_fold / 100, data.freqFlop.oop_call / 100, data.freqFlop.oop_raise / 100), data.freqFlop, data.ipRpFlop, data.oopRpFlop),
                turn: formatStreetResults(solve_icm_distortion_v2(data.ipRpTurn, data.oopRpTurn, data.topologicAggression, data.activePlayers, potTurn, 1, data.freqTurn.oop_fold / 100, data.freqTurn.oop_call / 100, data.freqTurn.oop_raise / 100), data.freqTurn, data.ipRpTurn, data.oopRpTurn),
                river: formatStreetResults(solve_icm_distortion_v2(data.ipRpRiver, data.oopRpRiver, data.topologicAggression, data.activePlayers, potRiver, 2, data.freqRiver.oop_fold / 100, data.freqRiver.oop_call / 100, data.freqRiver.oop_raise / 100), data.freqRiver, data.ipRpRiver, data.oopRpRiver),
            };
            globalThis.postMessage({ type: 'DISTORTION', nashResults, id });
        }
    }
    catch (error) {
        let errorMessage = 'Erro desconhecido no motor de insolvência WASM.';
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        else if (typeof error === 'string') {
            errorMessage = error;
        }
        console.warn('[SOTA Insolvency Worker] Falha:', errorMessage);
        globalThis.postMessage({ error: errorMessage, id });
    }
};
