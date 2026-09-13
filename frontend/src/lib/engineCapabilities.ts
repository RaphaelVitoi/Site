import rawManifest from '../../../data/engine_capabilities.json';

export type ImplementationLevel =
	| 'analytic'
	| 'heuristic'
	| 'adapter'
	| 'simulation'
	| 'trained-model'
	| 'full-solver'
	| 'primitive';

export type RuntimeAvailability =
	| 'code-available'
	| 'runtime-dependent'
	| 'external-dependency';

export interface EngineCapability {
	engine_id: string;
	display_name: string;
	family: 'pmev' | 'cfr' | 'canonical' | 'forecast' | 'adapter';
	implementation_level: ImplementationLevel;
	runtime_availability: RuntimeAvailability;
	runtimes: string[];
	source_lineage: string[];
	safe_label: string;
	claims_allowed: string[];
	causal_parameters: string[];
	reserved_parameters: string[];
	units: string[];
	provenance_requirements: string[];
	assumptions: string[];
	limitations: string[];
	consumer_paths: string[];
	api_routes: string[];
	fallback_engine_id: string | null;
}

export interface EngineCapabilityManifest {
	manifest_version: string;
	governance: string;
	updated_at: string;
	runtime_probe_required: boolean;
	provenance_fields: string[];
	capabilities: EngineCapability[];
}

function isStringArray(value: unknown): value is string[] {
	return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isOneOf<T extends string>(value: unknown, options: readonly T[]): value is T {
	return typeof value === 'string' && options.includes(value as T);
}

function isEngineCapability(value: unknown): value is EngineCapability {
	if (typeof value !== 'object' || value === null) return false;
	const capability = value as Record<string, unknown>;
	return (
		typeof capability.engine_id === 'string' &&
		typeof capability.display_name === 'string' &&
		isOneOf(capability.family, ['pmev', 'cfr', 'canonical', 'forecast', 'adapter']) &&
		isOneOf(capability.implementation_level, [
			'analytic',
			'heuristic',
			'adapter',
			'simulation',
			'trained-model',
			'full-solver',
			'primitive',
		]) &&
		isOneOf(capability.runtime_availability, [
			'code-available',
			'runtime-dependent',
			'external-dependency',
		]) &&
		isStringArray(capability.runtimes) &&
		isStringArray(capability.source_lineage) &&
		typeof capability.safe_label === 'string' &&
		isStringArray(capability.claims_allowed) &&
		isStringArray(capability.causal_parameters) &&
		isStringArray(capability.reserved_parameters) &&
		isStringArray(capability.units) &&
		isStringArray(capability.provenance_requirements) &&
		isStringArray(capability.assumptions) &&
		isStringArray(capability.limitations) &&
		isStringArray(capability.consumer_paths) &&
		isStringArray(capability.api_routes) &&
		(capability.fallback_engine_id === null || typeof capability.fallback_engine_id === 'string')
	);
}

export function parseEngineCapabilityManifest(value: unknown): EngineCapabilityManifest {
	if (typeof value !== 'object' || value === null) {
		throw new Error('Engine capability manifest must be an object');
	}
	const manifest = value as Record<string, unknown>;
	if (
		typeof manifest.manifest_version !== 'string' ||
		typeof manifest.governance !== 'string' ||
		typeof manifest.updated_at !== 'string' ||
		typeof manifest.runtime_probe_required !== 'boolean' ||
		!isStringArray(manifest.provenance_fields) ||
		!Array.isArray(manifest.capabilities) ||
		!manifest.capabilities.every(isEngineCapability)
	) {
		throw new Error('Invalid engine capability manifest');
	}

	const capabilities = manifest.capabilities;
	const ids = capabilities.map(({ engine_id }) => engine_id);
	if (new Set(ids).size !== ids.length) {
		throw new Error('Engine capability manifest contains duplicate ids');
	}
	for (const capability of capabilities) {
		const reserved = new Set(capability.reserved_parameters);
		if (capability.causal_parameters.some((parameter) => reserved.has(parameter))) {
			throw new Error(`Engine capability ${capability.engine_id} overlaps parameter roles`);
		}
	}

	return value as EngineCapabilityManifest;
}

export const ENGINE_CAPABILITY_MANIFEST = parseEngineCapabilityManifest(rawManifest);

export function getEngineCapability(engineId: string): EngineCapability {
	const capability = ENGINE_CAPABILITY_MANIFEST.capabilities.find(
		({ engine_id }) => engine_id === engineId,
	);
	if (!capability) {
		throw new Error(`Unknown engine capability: ${engineId}`);
	}
	return capability;
}
