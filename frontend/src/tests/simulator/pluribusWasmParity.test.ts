/// <reference types="jest" />

import { TextDecoder, TextEncoder } from 'node:util';
import parityCorpus from '../../../../data/engine_parity_scenarios.json';
import { executePluribusEngine } from '../../lib/engineExecutionGateway';
import {
	solvePluribusMultiway,
	type PluribusStateConfig,
	type TablePosition,
	type TableStreet,
} from '../../lib/pluribusMultiwayEngine';

Object.assign(globalThis, { TextDecoder, TextEncoder });

async function nodeWasmExecutor() {
	const { createPluribusNodeWasmExecutor } = await import('../../lib/pluribusWasmRuntime.node');
	return createPluribusNodeWasmExecutor();
}

describe('real Pluribus adapter WASM parity', () => {
	it('executes the generated binary and matches every shared Pluribus scenario', async () => {
		const wasm = await nodeWasmExecutor();

		for (const scenario of parityCorpus.scenarios.pluribus_horizon_heuristic) {
			const input: PluribusStateConfig = {
				pot: scenario.input.pot,
				numPlayers: scenario.input.num_players,
				activeStacks: scenario.input.active_stacks,
				lambdaFactor: scenario.input.lambda_factor,
				nominalEquity: scenario.input.equity,
				heroPosition: scenario.input.hero_position as TablePosition,
				street: scenario.input.street as TableStreet,
				depthStreets: scenario.input.depth_streets,
				iterations: scenario.input.iterations,
			};
			const expected = solvePluribusMultiway(input);
			const envelope = await executePluribusEngine(
				{ input, preferredRuntimes: ['wasm', 'typescript'] },
				{ wasm },
			);

			expect(envelope.runtimeUsed).toBe('wasm');
			expect(envelope.fallbackUsed).toBe(false);
			expect(envelope.attempts).toEqual([{ runtime: 'wasm', status: 'succeeded' }]);
			expect(envelope.result).toEqual(expected);
		}
	});

	it('falls back observably when the real WASM wrapper rejects impossible input', async () => {
		const input: PluribusStateConfig = {
			pot: 100,
			numPlayers: 3,
			activeStacks: [100, 100],
			nominalEquity: 0.5,
			heroPosition: 'BTN',
		};

		await expect(
			executePluribusEngine(
				{ input, preferredRuntimes: ['wasm'] },
				{ wasm: await nodeWasmExecutor() },
			),
		).rejects.toMatchObject({
			attempts: [
				{
					runtime: 'wasm',
					status: 'failed',
					reason: 'active_stacks length must equal num_players',
				},
			],
		});
	});

	it('rejects invalid runtime position values before crossing the WASM ABI', async () => {
		const input = {
			pot: 100,
			numPlayers: 2,
			activeStacks: [100, 100],
			nominalEquity: 0.5,
			heroPosition: 'INVALID',
		} as unknown as PluribusStateConfig;

		await expect(
			executePluribusEngine(
				{ input, preferredRuntimes: ['wasm'] },
				{ wasm: await nodeWasmExecutor() },
			),
		).rejects.toMatchObject({
			attempts: [
				{
					runtime: 'wasm',
					status: 'failed',
					reason: 'heroPosition must be BTN, CO, MP, UTG, SB, or BB',
				},
			],
		});
	});
});
