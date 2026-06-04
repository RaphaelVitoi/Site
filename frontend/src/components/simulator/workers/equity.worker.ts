/** @format */

import init, {
	calculate_equity_monte_carlo_binary,
} from '../../../../../wasm-equity/pkg/vitoi_equity_engine.js';
import { expandPokerRange, maskToBytes, rangeToBitmask } from './rangeParser';

// SOTA: Injeção de tipagem para o bundler (Next.js) em contexto de WebWorker
declare const process: { env: { [key: string]: string | undefined } };

// SOTA FIX: Forçar o arquivo a ser tratado como um ES Module estrito
export const __EQUITY_WORKER__ = true;

interface EquityMessageData {
	heroRange: string;
	villainRange: string;
	board?: string;
	id: string | number;
	kappa?: number;
}

let initPromise: Promise<unknown> | null = null; // SOTA: Promise Guard evita Race Conditions na injeção assíncrona do WebAssembly

type EquityCalculatorFn = (
	heroMask: Uint8Array,
	villainMask: Uint8Array,
	board: string,
	iterations: number,
	seed: number,
	kappa: number,
) => number;

// SOTA: A instância do Web Worker atua como ponte de Fricção Zero para o motor combinatório em Rust.
globalThis.onmessage = async (e: MessageEvent<EquityMessageData>) => {
	const { heroRange, villainRange, board, id, kappa = 1 } = e.data;

	try {
		if (!initPromise) {
			// Instanciação Lazy SOTA (não trava o startup do worker)
			// SOTA: Cache Buster Termodinâmico apenas em dev (SOTA Deploy).
			const isDev = process.env.NODE_ENV === 'development';
			const cacheBuster = isDev ? `?v=${Date.now()}` : '';
			initPromise = init(`/wasm/vitoi_equity_engine_bg.wasm${cacheBuster}`);
		}
		await initPromise;

		const cleanHero = expandPokerRange(heroRange).replaceAll(/\\s+/g, '');
		const cleanVillain = expandPokerRange(villainRange).replaceAll(/\\s+/g, '');
		const cleanBoard = (board || '').replaceAll(/\\s+/g, '');

		// SOTA: Ponte de Fricção Zero para o Rust via Máscara de Bits (Bitmask O(1))
		const heroMask = maskToBytes(rangeToBitmask(cleanHero));
		const villainMask = maskToBytes(rangeToBitmask(cleanVillain));

		// SOTA: 10.000 iterações garantem significância estatística profunda com latência sub-50ms na CPU cliente isolada.
		const iterations = 10000;
		const seed = Math.floor(Math.random() * 4294967296); // SOTA: Injeção de Semente Absoluta (Resolve o pânico de entropia)

		// SOTA: Casting dinâmico blindando o compilador TS caso a FFI local gerada (d.ts) esteja fora de sincronia com a injeção do 6º parâmetro no Rust.
		const equity = (calculate_equity_monte_carlo_binary as unknown as EquityCalculatorFn)(
			heroMask,
			villainMask,
			cleanBoard,
			iterations,
			seed,
			kappa,
		);

		// Honestidade Intelectual: Interceptando os contratos de entropia do Rust
		if (equity === -1) throw new Error('Sintaxe inválida: Hero (Ex: AhKh, AKs, QQ).');
		if (equity === -2) throw new Error('Sintaxe inválida: Vilão (Ex: QdQc, AJo).');
		if (equity === -3)
			throw new Error(
				'Sintaxe inválida: Board (Use até 5 cartas exatas ou deixe em branco).',
			);
		if (equity === -4)
			throw new Error(
				'Anomalia Quântica: Cartas duplicadas (colisão) detectadas na entrada.',
			);
		if (equity < 0) throw new Error('Falha matemática no motor WASM.');

		globalThis.postMessage({ equity: Math.round(equity * 100), id });
	} catch (error: unknown) {
		// SOTA: Extração de mensagem de erro robusta para contornar o Error Overlay do Next.js
		let errorMessage = 'Erro desconhecido no motor WASM.';
		if (typeof error === 'string') {
			errorMessage = error;
		} else if (error instanceof Error) {
			errorMessage = error.message;
		}
		console.warn('[SOTA Worker] Falha silenciada na inferência WASM:', errorMessage);
		globalThis.postMessage({ error: errorMessage, id }); // SOTA: Não sobrescreve a equidade em caso de falha matemática
	}
};
