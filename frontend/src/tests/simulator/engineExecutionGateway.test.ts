/// <reference types="jest" />

import {
	createPluribusApiExecutor,
	EngineExecutionError,
	executePluribusEngine,
	executePluribusLocally,
} from '../../lib/engineExecutionGateway';
import { solvePluribusMultiway, type PluribusStateConfig } from '../../lib/pluribusMultiwayEngine';

const INPUT: PluribusStateConfig = {
	pot: 100,
	numPlayers: 3,
	heroPosition: 'BTN',
	nominalEquity: 0.85,
	activeStacks: [100, 120, 140],
	street: 'flop',
	depthStreets: 2,
	iterations: 30,
};

describe('engineExecutionGateway', () => {
	it('falls back observably from unavailable WASM and failed API to TypeScript', async () => {
		const envelope = await executePluribusEngine(
			{ input: INPUT, preferredRuntimes: ['wasm', 'api', 'typescript'] },
			{ api: async () => Promise.reject(new Error('API offline')) },
		);

		expect(envelope.runtimeUsed).toBe('typescript');
		expect(envelope.fallbackUsed).toBe(true);
		expect(envelope.attempts).toEqual([
			{ runtime: 'wasm', status: 'unavailable', reason: 'executor not configured' },
			{ runtime: 'api', status: 'failed', reason: 'API offline' },
			{ runtime: 'typescript', status: 'succeeded' },
		]);
		expect(envelope.result).toEqual(solvePluribusMultiway(INPUT));
	});

	it('uses a real configured WASM executor without claiming fallback', async () => {
		const wasmResult = { ...solvePluribusMultiway(INPUT), optimalAction: 'CALL' as const };
		const envelope = await executePluribusEngine(
			{ input: INPUT, preferredRuntimes: ['wasm', 'typescript'] },
			{ wasm: async () => wasmResult },
		);

		expect(envelope.runtimeUsed).toBe('wasm');
		expect(envelope.fallbackUsed).toBe(false);
		expect(envelope.attempts).toEqual([{ runtime: 'wasm', status: 'succeeded' }]);
		expect(envelope.result).toBe(wasmResult);
	});

	it('fails closed with the complete attempt ledger when no runtime succeeds', async () => {
		await expect(
			executePluribusEngine(
				{ input: INPUT, preferredRuntimes: ['wasm', 'api'] },
				{ api: async () => Promise.reject(new Error('unauthorized')) },
			),
		).rejects.toMatchObject<Partial<EngineExecutionError>>({
			name: 'EngineExecutionError',
			attempts: [
				{ runtime: 'wasm', status: 'unavailable', reason: 'executor not configured' },
				{ runtime: 'api', status: 'failed', reason: 'unauthorized' },
			],
		});
	});

	it('wraps direct local execution in the same provenance envelope', () => {
		const envelope = executePluribusLocally(INPUT);

		expect(envelope.runtimeUsed).toBe('typescript');
		expect(envelope.fallbackUsed).toBe(false);
		expect(envelope.attempts).toEqual([{ runtime: 'typescript', status: 'succeeded' }]);
		expect(envelope.provenance.engineId).toBe('pluribus-multiway-adapter');
		expect(envelope.provenance.implementationLevel).toBe('heuristic');
	});

	it('executes the authenticated HTTP adapter and maps its explicit contract', async () => {
		const fetchMock = jest.fn(async () =>
			Promise.resolve({
				ok: true,
				status: 200,
				json: async () => ({
					status: 'SUCCESS',
					optimal_action: 'CALL',
					strategy: { FOLD: 0.1, CALL: 0.8, RAISE_POT: 0.1 },
					structural_liability: 33.75,
					effective_equity: 0.64,
					pos_multiplier: 1.15,
					k_opponents: 2,
					depth_streets: 2,
					future_streets: 1,
					effective_stack: 100,
					stack_to_pot_ratio: 1,
					call_cost: 50,
					raise_cost: 100,
					horizon_liability: 3.375,
					action_evs: { FOLD: 0, CALL: 51.8125, RAISE_POT: 39.675 },
					iterations_run: 30,
				}),
			}) as Response,
		);
		const executor = createPluribusApiExecutor('jwt-token', fetchMock);
		const result = await executor(INPUT);

		expect(fetchMock).toHaveBeenCalledTimes(1);
		const [url, init] = fetchMock.mock.calls[0];
		expect(String(url)).toContain('/api/v1/game-theory/pluribus/solve');
		expect(init?.headers).toMatchObject({ Authorization: 'Bearer jwt-token' });
		expect(JSON.parse(String(init?.body))).toMatchObject({
			state: { active_stacks: INPUT.activeStacks, num_players: INPUT.numPlayers },
			depth_streets: INPUT.depthStreets,
		});
		expect(result.optimalAction).toBe('CALL');
		expect(result.evs.RAISE).toBe(39.675);
	});
});
