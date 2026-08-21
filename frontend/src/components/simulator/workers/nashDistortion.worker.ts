/**
 * SOTA Nash Distortion Worker — WebWorker de Baixa Latência
 * Processa as matrizes de distorção de Nash e Risk Premium de forma paralela.
 * @format
 */

import { defaultNashSolver } from '../../../lib/nashSolver';
import { decodeNashDistortionPayload } from './nashDistortionPayload';

declare const self: DedicatedWorkerGlobalScope;

self.onmessage = (e: MessageEvent) => {
	const { id, type, payload, t0 } = e.data;
	const t1 = performance.now();

	if (type === 'NASH_PROFILER' && payload instanceof Float64Array) {
		const decodedPayload = decodeNashDistortionPayload(payload);
		if (!decodedPayload) {
			self.postMessage({
				id,
				type: 'ERROR',
				error: 'NASH_PROFILER requires ipRp, oopRp, and aggression values.',
			});
			return;
		}

		// Executa a resolução analítica de Nash através do NashSolver SOTA
		const solution = defaultNashSolver.solve(
			decodedPayload.ipRp,
			decodedPayload.oopRp,
			decodedPayload.aggression,
		);

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
