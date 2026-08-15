/**
 * SOTA Nash Distortion Worker — WebWorker de Baixa Latência
 * Processa as matrizes de distorção de Nash e Risk Premium de forma paralela.
 * @format
 */

import { defaultNashSolver } from '../../../lib/nashSolver';

declare const self: DedicatedWorkerGlobalScope;

self.onmessage = (e: MessageEvent) => {
	const { id, type, payload, t0 } = e.data;
	const t1 = performance.now();

	if (type === 'NASH_PROFILER' && payload instanceof Float64Array) {
		const ip_rp = payload[0] * 100;
		const oop_rp = payload[1] * 100;
		const kappa = payload[2];

		// Executa a resolução analítica de Nash através do NashSolver SOTA
		const solution = defaultNashSolver.solve(ip_rp, oop_rp, kappa);

		const t2 = performance.now();

		self.postMessage({
			id,
			t0,
			t1,
			t2,
			solution,
		});
	}
};
