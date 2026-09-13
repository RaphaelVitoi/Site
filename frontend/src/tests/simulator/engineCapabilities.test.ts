/// <reference types="jest" />

import {
	ENGINE_CAPABILITY_MANIFEST,
	getEngineCapability,
	parseEngineCapabilityManifest,
} from '../../lib/engineCapabilities';

describe('engine capability contract', () => {
	it('keeps a single typed identity for every capability', () => {
		const ids = ENGINE_CAPABILITY_MANIFEST.capabilities.map(({ engine_id }) => engine_id);

		expect(new Set(ids).size).toBe(ids.length);
	});

	it('separates causal and reserved Pluribus parameters', () => {
		const capability = getEngineCapability('pluribus-multiway-adapter');

		expect(capability.implementation_level).toBe('heuristic');
		expect(capability.causal_parameters).toEqual(
			expect.arrayContaining([
				'pot',
				'num_players',
				'hero_position',
				'nominal_equity',
				'active_stacks',
				'depth_streets',
			]),
		);
		expect(capability.reserved_parameters).toEqual([]);
		expect(capability.runtimes).toContain('wasm');
		expect(capability.consumer_paths).toContain('wasm-equity/lib.rs');
		expect(capability.safe_label).toBe('Adaptador multiway PMev inspirado em Pluribus');
	});

	it('declares the TimesFM fallback without claiming loaded weights', () => {
		const capability = getEngineCapability('timesfm-forecast');

		expect(capability.runtime_availability).toBe('runtime-dependent');
		expect(capability.fallback_engine_id).toBe('analytic-linear-forecast');
		expect(capability.provenance_requirements).toEqual(
			expect.arrayContaining(['model_used', 'intended_model', 'weights_loaded']),
		);
	});

	it('fails closed when a parameter is both causal and reserved', () => {
		const invalid = JSON.parse(JSON.stringify(ENGINE_CAPABILITY_MANIFEST)) as {
			capabilities: Array<{ causal_parameters: string[]; reserved_parameters: string[] }>;
		};
		const first = invalid.capabilities[0];
		expect(first).toBeDefined();
		if (!first) return;
		first.reserved_parameters = [...first.reserved_parameters, first.causal_parameters[0] ?? 'pot'];

		expect(() => parseEngineCapabilityManifest(invalid)).toThrow('overlaps parameter roles');
	});
});
