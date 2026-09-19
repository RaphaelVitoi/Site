/**
 * IDENTITY: SOTA Parallel Multi-Threaded ICM Monte Carlo Worker Pool (v8.0 GOLD)
 * PATH: src/lib/icmWorkerPool.ts
 * ROLE: Orquestra simulações de ICM Monte Carlo em paralelo via Web Workers
 *       com particionamento de sementes e fallback resiliente Single-Thread.
 */

import { calculateIcmMonteCarlo, deriveSeed, type MonteCarloIcmResult } from './montecarlo';

export interface IcmSimulationOptions {
	stacks: number[];
	prizes: number[];
	iterations?: number;
	seed?: number;
	maxConcurrency?: number;
	timeoutMs?: number;
}

export type IcmParallelismMode = 'WORKER_POOL' | 'SINGLE_THREAD_FALLBACK';

/**
 * Resultado de uma corrida paralela.
 *
 * REPLAY: reproduzir uma corrida do pool exige TRES campos, nao so a semente —
 * `seed`, `iterations` e `concurrency`. O pool particiona as iteracoes entre os
 * workers e da a cada um uma semente derivada da base, entao o numero de workers
 * faz parte do experimento: a mesma `seed` em uma maquina de 4 nucleos e em uma
 * de 8 produz particoes diferentes e, portanto, numeros diferentes. Por isso
 * `concurrency` volta no resultado; para replay exato, passe-o de volta em
 * `maxConcurrency`. O caminho single-thread (`calculateIcmMonteCarlo`) nao tem
 * essa dependencia: la a semente basta.
 */
export interface IcmSimulationResult {
	equities: number[];
	stdErrorPerPlayer: number[];
	iterations: number;
	/** Semente efetivamente usada — nunca nula. Ver nota de replay abaixo. */
	seed: number;
	latencyMs: number;
	throughputIps: number;
	concurrency: number;
	mode: IcmParallelismMode;
	simulationId: string;
	placementDistribution?: number[][] | undefined;
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
		const simulationId = `icm_${Date.now()}_${deriveSeed().toString(36).slice(2, 7)}`;

		if (!this.isInitialized) {
			await this.init();
		}

		const activeWorkers = Math.min(this.workers.length, maxConcurrency);

		// Fallback Single-Thread se nenhum worker estiver ativo (ex: SSR, Node.js ou ambiente sem Worker)
		if (activeWorkers <= 0) {
			return this.runSingleThreadFallback(stacks, prizes, iterations, seed, simulationId, t0);
		}

		const iterationsPerWorker = Math.ceil(iterations / activeWorkers);
		const baseSeed = seed ?? (deriveSeed() & 0x7fffffff);

		const promises: Promise<{
			equities: number[];
			stdErrorPerPlayer: number[];
			placementDistribution?: number[][];
			iterations: number;
		}>[] = [];

		for (let i = 0; i < activeWorkers; i++) {
			const worker = this.workers.at(i);
			if (!worker) continue;

			const workerSeed = (baseSeed + (i * 1013904223)) >>> 0;
			const taskPromise = new Promise<{
				equities: number[];
				stdErrorPerPlayer: number[];
				placementDistribution?: number[][];
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
							placementDistribution: e.data.placementDistribution,
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
			const weightedVarianceSum = new Array<number>(numPlayers).fill(0);
			const k = Math.min(numPlayers, prizes.length);
			const weightedPlacementSum: number[][] = Array.from({ length: numPlayers }, () => new Array(k).fill(0));
			let hasPlacements = false;

			for (const r of results) {
				const nW = r.iterations;
				totalIterations += nW;
				for (let p = 0; p < numPlayers; p++) {
					weightedEquitySum[p] = (weightedEquitySum[p] ?? 0) + (r.equities[p] ?? 0) * nW;
					const seW = r.stdErrorPerPlayer[p] ?? 0;
					// Var(X_comb) = sum(n_w^2 * se_w^2) / n_total^2
					weightedVarianceSum[p] = (weightedVarianceSum[p] ?? 0) + (nW * nW * seW * seW);

					if (r.placementDistribution?.[p]) {
						hasPlacements = true;
						for (let j = 0; j < k; j++) {
							weightedPlacementSum[p]![j] = (weightedPlacementSum[p]![j] ?? 0) + (r.placementDistribution[p]![j] ?? 0) * nW;
						}
					}
				}
			}

			const meanEquities = weightedEquitySum.map((sum) => (totalIterations > 0 ? sum / totalIterations : 0));
			const stdErrorPerPlayer = weightedVarianceSum.map((wVar) => {
				if (totalIterations <= 0) return 0;
				return Number(Math.sqrt(wVar / (totalIterations * totalIterations)).toFixed(4));
			});
			const placementDistribution = hasPlacements && totalIterations > 0
				? weightedPlacementSum.map((row) => row.map((sum) => sum / totalIterations))
				: undefined;

			const latencyMs = Number(
				((typeof performance !== 'undefined' ? performance.now() : Date.now()) - t0).toFixed(2),
			);
			const throughputIps = latencyMs > 0 ? Math.round((totalIterations / latencyMs) * 1000) : 0;

			return {
				equities: meanEquities,
				stdErrorPerPlayer,
				placementDistribution,
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
			placementDistribution: result.placementDistribution,
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
