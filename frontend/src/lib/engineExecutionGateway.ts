import { buildNexusClientUrl } from '@/lib/api-contract';
import { getEngineCapability } from '@/lib/engineCapabilities';
import {
	solvePluribusMultiway,
	type PluribusSolveOutput,
	type PluribusStateConfig,
} from '@/lib/pluribusMultiwayEngine';

export type EngineRuntime = 'typescript' | 'api' | 'wasm';
export type EngineAttemptStatus = 'succeeded' | 'failed' | 'unavailable';

export interface EngineExecutionAttempt {
	runtime: EngineRuntime;
	status: EngineAttemptStatus;
	reason?: string;
}

export interface EngineExecutionEnvelope<T> {
	engineId: string;
	runtimeUsed: EngineRuntime;
	fallbackUsed: boolean;
	attempts: EngineExecutionAttempt[];
	result: T;
	provenance: {
		engineId: string;
		implementationLevel: string;
		assumptions: string[];
		limitations: string[];
	};
}

export interface PluribusGatewayRequest {
	input: PluribusStateConfig;
	preferredRuntimes: EngineRuntime[];
}

export type PluribusExecutor = (input: PluribusStateConfig) => Promise<PluribusSolveOutput>;
export type PluribusExecutors = Partial<Record<EngineRuntime, PluribusExecutor>>;
export type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

const ENGINE_ID = 'pluribus-multiway-adapter';

function provenance() {
	const capability = getEngineCapability(ENGINE_ID);
	return {
		engineId: capability.engine_id,
		implementationLevel: capability.implementation_level,
		assumptions: [...capability.assumptions],
		limitations: [...capability.limitations],
	};
}

function failureReason(error: unknown): string {
	if (error instanceof Error) return error.message;
	if (typeof error === 'string' && error.length > 0) return error;
	if (
		typeof error === 'object' &&
		error !== null &&
		'message' in error &&
		typeof error.message === 'string' &&
		error.message.length > 0
	) {
		return error.message;
	}
	return 'unknown executor failure';
}

function apiNumber(value: unknown, field: string): number {
	if (typeof value !== 'number' || !Number.isFinite(value)) {
		throw new TypeError(`Pluribus API response has invalid ${field}`);
	}
	return value;
}

function apiRecord(value: unknown, field: string): Record<string, unknown> {
	if (!value || typeof value !== 'object' || Array.isArray(value)) {
		throw new TypeError(`Pluribus API response has invalid ${field}`);
	}
	return value as Record<string, unknown>;
}

export function createPluribusApiExecutor(
	accessToken: string,
	fetchImpl: FetchLike = fetch,
): PluribusExecutor {
	if (!accessToken.trim()) throw new RangeError('accessToken must not be empty');

	return async (input) => {
		const response = await fetchImpl(
			buildNexusClientUrl('/api/v1/game-theory/pluribus/solve'),
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${accessToken}`,
				},
				body: JSON.stringify({
					state: {
						pot: input.pot,
						num_players: input.numPlayers,
						street: input.street ?? 'flop',
						active_stacks: input.activeStacks,
						lambda_factor: input.lambdaFactor ?? 2.25,
					},
					equity: input.nominalEquity,
					hero_position: input.heroPosition,
					depth_streets: input.depthStreets ?? 1,
					iterations: input.iterations ?? 60,
				}),
			},
		);
		const raw = (await response.json()) as unknown;
		const body = apiRecord(raw, 'body');
		if (!response.ok) {
			const detail = typeof body['error'] === 'string' ? `: ${body['error']}` : '';
			throw new Error(`Pluribus API ${response.status}${detail}`);
		}

		const strategy = apiRecord(body['strategy'], 'strategy');
		const actionEvs = apiRecord(body['action_evs'], 'action_evs');
		const optimalAction = body['optimal_action'] === 'RAISE_POT' ? 'RAISE' : body['optimal_action'];
		if (optimalAction !== 'FOLD' && optimalAction !== 'CALL' && optimalAction !== 'RAISE') {
			throw new Error('Pluribus API response has invalid optimal_action');
		}

		return {
			strategy: {
				FOLD: apiNumber(strategy['FOLD'], 'strategy.FOLD'),
				CALL: apiNumber(strategy['CALL'], 'strategy.CALL'),
				RAISE: apiNumber(strategy['RAISE_POT'], 'strategy.RAISE_POT'),
			},
			optimalAction,
			structuralLiability: apiNumber(body['structural_liability'], 'structural_liability'),
			effectiveEquity: apiNumber(body['effective_equity'], 'effective_equity'),
			posMultiplier: apiNumber(body['pos_multiplier'], 'pos_multiplier'),
			kOpponents: apiNumber(body['k_opponents'], 'k_opponents'),
			iterations: apiNumber(body['iterations_run'], 'iterations_run'),
			depthStreets: apiNumber(body['depth_streets'], 'depth_streets'),
			effectiveStack: apiNumber(body['effective_stack'], 'effective_stack'),
			stackToPotRatio: apiNumber(body['stack_to_pot_ratio'], 'stack_to_pot_ratio'),
			callCost: apiNumber(body['call_cost'], 'call_cost'),
			raiseCost: apiNumber(body['raise_cost'], 'raise_cost'),
			futureStreets: apiNumber(body['future_streets'], 'future_streets'),
			horizonLiability: apiNumber(body['horizon_liability'], 'horizon_liability'),
			evs: {
				FOLD: apiNumber(actionEvs['FOLD'], 'action_evs.FOLD'),
				CALL: apiNumber(actionEvs['CALL'], 'action_evs.CALL'),
				RAISE: apiNumber(actionEvs['RAISE_POT'], 'action_evs.RAISE_POT'),
			},
		};
	};
}

export class EngineExecutionError extends Error {
	public readonly attempts: EngineExecutionAttempt[];

	constructor(attempts: EngineExecutionAttempt[]) {
		super(`No configured runtime executed ${ENGINE_ID}`);
		this.name = 'EngineExecutionError';
		this.attempts = attempts;
	}
}

export function executePluribusLocally(
	input: PluribusStateConfig,
): EngineExecutionEnvelope<PluribusSolveOutput> {
	return {
		engineId: ENGINE_ID,
		runtimeUsed: 'typescript',
		fallbackUsed: false,
		attempts: [{ runtime: 'typescript', status: 'succeeded' }],
		result: solvePluribusMultiway(input),
		provenance: provenance(),
	};
}

export async function executePluribusEngine(
	request: PluribusGatewayRequest,
	executors: PluribusExecutors = {},
): Promise<EngineExecutionEnvelope<PluribusSolveOutput>> {
	if (request.preferredRuntimes.length === 0) {
		throw new RangeError('preferredRuntimes must contain at least one runtime');
	}
	if (new Set(request.preferredRuntimes).size !== request.preferredRuntimes.length) {
		throw new RangeError('preferredRuntimes must not contain duplicates');
	}

	const attempts: EngineExecutionAttempt[] = [];
	for (const [index, runtime] of request.preferredRuntimes.entries()) {
		const executor =
			executors[runtime] ??
			(runtime === 'typescript'
				? async (input: PluribusStateConfig) => solvePluribusMultiway(input)
				: undefined);
		if (!executor) {
			attempts.push({ runtime, status: 'unavailable', reason: 'executor not configured' });
			continue;
		}

		try {
			const result = await executor(request.input);
			attempts.push({ runtime, status: 'succeeded' });
			return {
				engineId: ENGINE_ID,
				runtimeUsed: runtime,
				fallbackUsed: index > 0,
				attempts,
				result,
				provenance: provenance(),
			};
		} catch (error) {
			attempts.push({ runtime, status: 'failed', reason: failureReason(error) });
		}
	}

	throw new EngineExecutionError(attempts);
}
