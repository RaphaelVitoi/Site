/**
 * IDENTITY: SOTA Parallel Multi-Threaded ICM Monte Carlo Worker Pool (v8.0 GOLD)
 * PATH: src/lib/icmWorkerPool.ts
 * ROLE: Orquestra simulações de ICM Monte Carlo em paralelo via Web Workers
 *       com particionamento de sementes e fallback resiliente Single-Thread.
 */

import { calculateIcmMonteCarlo, type MonteCarloIcmResult } from './montecarlo';

export interface IcmSimulationOptions {
	stacks: number[];
	prizes: number[];
	iterations?: number;
	seed?: number;
	maxConcurrency?: number;
	timeoutMs?: number;
}

export type IcmParallelismMode = 'WORKER_POOL' | 'SINGLE_THREAD_FALLBACK';

export interface IcmSimulationResult {
	equities: number[];
	stdErrorPerPlayer: number[];
	iterations: number;
	seed: number | null;
	latencyMs: number;
	throughputIps: number;
	concurrency: number;
	mode: IcmParallelismMode;
	simulationId: string;
}

function getHighEntropyUint32(): number {
	if (typeof globalThis.crypto?.getRandomValues === 'function') {
		const buf = new Uint32Array(1);
		globalThis.crypto.getRandomValues(buf);
		const val = buf.at(0);
		if (val !== undefined) return val >>> 0;
	}
	const perfTime = typeof performance !== 'undefined' ? performance.now() * 1000 : 0;
	return ((Date.now() ^ Math.floor(perfTime)) >>> 0) || 0xdeadbeef;
}

export class IcmWorkerPool {
	private static instance: IcmWorkerPool | null = null;
	private workers: Worker[] = [];
	private workerCount: number = 0;
	private isInitialized: boolean = false;

	private constructor() {
		this.detectCapabilities();
	}

	public static getInstance(): IcmWorkerPool {
		IcmWorkerPool.instance ??= new IcmWorkerPool();
		return IcmWorkerPool.instance;
	}

	private detectCapabilities(): void {
		if (typeof window === 'undefined' || typeof Worker === 'undefined') {
			this.workerCount = 1;
			return;
		}

		const hardware = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4;
		// Concorrência calibrada entre 2 e 8 threads para manter o pool estável
		this.workerCount = Math.min(8, Math.max(2, hardware));
	}

	public async init(): Promise<void> {
		if (this.isInitialized || typeof window === 'undefined' || typeof Worker === 'undefined') {
			this.isInitialized = true;
			return;
		}

		try {
			for (let i = 0; i < this.workerCount; i++) {
				const worker = new Worker(
					new URL('../components/simulator/workers/icm.worker.ts', import.meta.url),
					{ type: 'module' },
				);
				this.workers.push(worker);
			}
			this.isInitialized = true;
		} catch (e) {
			console.warn('[IcmWorkerPool] Falha ao inicializar Web Workers. Ativando fallback Single-Thread:', e);
			this.workers = [];
			this.workerCount = 1;
			this.isInitialized = true;
		}
	}

	/**
	 * Executa simulação ICM Monte Carlo paralelizada distribuindo iterações entre workers.
	 */
	public async calculateIcm(options: IcmSimulationOptions): Promise<IcmSimulationResult> {
		const {
			stacks,
			prizes,
			iterations = 10000,
			seed,
			maxConcurrency = this.workerCount,
			timeoutMs = 3000,
		} = options;

		const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();
		const simulationId = `icm_${Date.now()}_${getHighEntropyUint32().toString(36).slice(2, 7)}`;

		if (!this.isInitialized) {
			await this.init();
		}

		const activeWorkers = Math.min(this.workers.length, maxConcurrency);

		// Fallback Single-Thread se nenhum worker estiver ativo (ex: SSR, Node.js ou ambiente sem Worker)
		if (activeWorkers <= 0) {
			return this.runSingleThreadFallback(stacks, prizes, iterations, seed, simulationId, t0);
		}

		const iterationsPerWorker = Math.ceil(iterations / activeWorkers);
		const baseSeed = seed ?? (getHighEntropyUint32() & 0x7fffffff);

		const promises: Promise<{
			equities: number[];
			stdErrorPerPlayer: number[];
			iterations: number;
		}>[] = [];

		for (let i = 0; i < activeWorkers; i++) {
			const worker = this.workers.at(i);
			if (!worker) continue;

			const workerSeed = (baseSeed + (i * 1013904223)) >>> 0;
			const taskPromise = new Promise<{
				equities: number[];
				stdErrorPerPlayer: number[];
				iterations: number;
			}>((resolve, reject) => {
				const timer = setTimeout(() => {
					reject(new Error(`Timeout no ICM Worker thread ${i}`));
				}, timeoutMs);

				const handler = (e: MessageEvent) => {
					if (e.data?.simulationId === simulationId && e.data?.type === 'SUCCESS') {
						clearTimeout(timer);
						worker.removeEventListener('message', handler);
						resolve({
							equities: e.data.equities ?? [],
							stdErrorPerPlayer: e.data.stdErrorPerPlayer ?? [],
							iterations: e.data.iterations || iterationsPerWorker,
						});
					} else if (e.data?.simulationId === simulationId && e.data?.type === 'ERROR') {
						clearTimeout(timer);
						worker.removeEventListener('message', handler);
						reject(new Error(e.data.error || 'Erro no ICM Worker'));
					}
				};

				worker.addEventListener('message', handler);
				worker.postMessage({
					type: 'CALCULATE',
					stacks,
					prizes,
					iterations: iterationsPerWorker,
					simulationId,
					seed: workerSeed,
					workerIndex: i,
				});
			});

			promises.push(taskPromise);
		}

		try {
			const results = await Promise.all(promises);

			let totalIterations = 0;
			const numPlayers = stacks.length;
			const weightedEquitySum = new Array<number>(numPlayers).fill(0);

			for (const r of results) {
				totalIterations += r.iterations;
				for (let p = 0; p < numPlayers; p++) {
					weightedEquitySum[p] = (weightedEquitySum[p] ?? 0) + (r.equities[p] ?? 0) * r.iterations;
				}
			}

			const meanEquities = weightedEquitySum.map((sum) => (totalIterations > 0 ? sum / totalIterations : 0));
			const stdErrorPerPlayer = meanEquities.map((p) =>
				Math.sqrt((p * (1 - p)) / Math.max(totalIterations, 1)),
			);

			const latencyMs = Number(
				((typeof performance !== 'undefined' ? performance.now() : Date.now()) - t0).toFixed(2),
			);
			const throughputIps = latencyMs > 0 ? Math.round((totalIterations / latencyMs) * 1000) : 0;

			return {
				equities: meanEquities,
				stdErrorPerPlayer,
				iterations: totalIterations,
				seed: baseSeed,
				latencyMs,
				throughputIps,
				concurrency: activeWorkers,
				mode: 'WORKER_POOL',
				simulationId,
			};
		} catch (err) {
			console.warn('[IcmWorkerPool] Erro na orquestração paralela. Invocando fallback Single-Thread:', err);
			return this.runSingleThreadFallback(stacks, prizes, iterations, seed, simulationId, t0);
		}
	}

	private runSingleThreadFallback(
		stacks: number[],
		prizes: number[],
		iterations: number,
		seed: number | undefined,
		simulationId: string,
		t0: number,
	): IcmSimulationResult {
		const result: MonteCarloIcmResult = calculateIcmMonteCarlo(stacks, prizes, {
			iterations,
			seed,
		});

		const latencyMs = Number(
			((typeof performance !== 'undefined' ? performance.now() : Date.now()) - t0).toFixed(2),
		);
		const throughputIps = latencyMs > 0 ? Math.round((iterations / latencyMs) * 1000) : 0;

		return {
			equities: result.equities,
			stdErrorPerPlayer: result.stdErrorPerPlayer,
			iterations: result.iterations,
			seed: result.seed,
			latencyMs,
			throughputIps,
			concurrency: 1,
			mode: 'SINGLE_THREAD_FALLBACK',
			simulationId,
		};
	}

	public destroy(): void {
		for (const w of this.workers) {
			try {
				w.terminate();
			} catch {
				// Silently handle termination
			}
		}
		this.workers = [];
		this.isInitialized = false;
	}
}

export const icmWorkerPool = IcmWorkerPool.getInstance();
