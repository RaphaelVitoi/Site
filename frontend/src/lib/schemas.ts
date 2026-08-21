import { z } from 'zod';

/**
 * IDENTITY: SOTA Semantic Schemas
 * ROLE: Garantir integridade de dados entre Prisma, API e Motor Matemático.
 * PRINCIPLE: Economia Generalizada (Shannon) - Tipagem forte reduz entropia de erro.
 */

// Schema para Stacks (Array de números positivos)
export const StacksSchema = z.array(z.number().nonnegative()).min(2);

// Schema para Prizes (Array de números positivos decrescentes)
export const PrizesSchema = z.array(z.number().nonnegative());

// Schema para a Física da Mesa (PhysicsSnapshot)
export const PhysicsSnapshotSchema = z.object({
	heroStack: z.number().positive(),
	villain1Stack: z.number().positive().optional(),
	villain2Stack: z.number().positive().optional(),
	pot: z.number().positive(),
	heroInvested: z.number().nonnegative(),
	edgeFactor: z.number().min(0.5).max(2).default(1).optional(),
	position: z.enum(['IP', 'OOP', 'BB', 'SB']),
	referenceStatus: z.enum(['baseline', 'tilt', 'protecting', 'bubble']).default('baseline'),
	riskAdvantage: z.number().optional(), // SOTA v7.0
	bountyPower: z.number().optional(), // SOTA v7.0
});

// Schema para Requisição de Inferência (InferenceRequest)
export const InferenceRequestSchema = z.object({
	prompt: z.string(),
	system_prompt: z.string().optional(),
	physics_snapshot: PhysicsSnapshotSchema.optional(),
	predictive_profile: z.record(z.string(), z.unknown()).optional(),
	max_tokens: z.number().int().default(1024),
	model: z.string().optional(),
});

// Schema para entrada do Motor de Perspectiva
export const PerspectivaInputSchema = z.object({
	stacks: StacksSchema,
	prizes: PrizesSchema,
	heroIdx: z.number().int().nonnegative(),
	villainIdx: z.number().int().nonnegative(),
	potSize: z.number().positive(),
	heroCost: z.number().nonnegative(),
	winProb: z.number().min(0).max(1),
	realizationFactor: z.number().min(0).max(2).default(1),
	edgeBase: z.number().default(1),
	numPlayersInPot: z.number().int().min(2).default(2),
	bountyValue: z.number().optional(),
	kappa: z.number().optional(),
	humanNoiseFactor: z.number().default(0).optional(),
	isNearPayjump: z.boolean().optional(),
	blindsRisingSoon: z.boolean().optional(),
	currentEquityPct: z.number().optional(),
	heroPosition: z.string().optional(),
	spr: z.number().optional(),
	investidoAcumulado: z.number().optional(),
	blindCost: z.number().optional(),
	referenceStatus: z.enum(['baseline', 'tilt', 'protecting', 'bubble']).default('baseline').optional(),
});

// Schema para o resultado do Motor de Perspectiva (PerspectivaResult)
export const PerspectivaResultSchema = z.object({
	handEquity: z.number(),
	currentEquityPct: z.number(),
	deltaWinPct: z.number(),
	deltaLosePct: z.number(),
	deltaFoldPct: z.number(),
	valuation: z.number(),
	rioLiability: z.number(),
	fgsHealth: z.number(),
	survivalPressure: z.number(),
	dynamicEvFold: z.number(),
	perspectivaPct: z.number(),
	amortizedEdge: z.number(),
	ci: z.number(),
	marginInstability: z.number(),
	threshEq: z.number(),
	realizationFactor: z.number(),
	isActionBetterThanFold: z.boolean(),
	diagnostico: z.string(),
	bountyPower: z.number(),
	currentMapaICM: z.array(z.number()),
	winMapaICM: z.array(z.number()),
	loseMapaICM: z.array(z.number()),
});

// === PERSPECTIVA SOTA v7.0 GOLD ===

export const PerspectiveMetricSchema = z.object({
	scenarioId: z
		.string()
		.nullish()
		.transform((val) => val || null),
	baseState: z.object({
		chipEvFold: z.number(),
		icmValuation: z.number(),
	}),
	dynamicModifiers: z.object({
		timeToBlindJumpMinutes: z.number(),
		payjumpProximityFactor: z.number(),
		positionalUrgency: z.number(),
	}),
	structuralLiabilities: z.object({
		multiwayOpponents: z.number(),
		reverseImpliedOddsPenalty: z.number(),
	}),
	edgeRelative: z.object({
		stackDepthBb: z.number(),
		humanNoiseFactor: z.number().default(0),
		technicalSuperiority: z.number(),
	}),
	insolvency: z.object({
		potOddsRatio: z.number(),
		perspectiveUtility: z.number(),
		insolvencyCoefficient: z.number().nullable(),
		isViable: z.boolean(),
	}),
});

// === TELEMETRIA SOTA ===

export const TelemetryCategorySchema = z.enum([
	'quiz',
	'simulator',
	'performance',
	'error',
	'Risk Premium',
	'Fundamentos SOTA',
	'Bolha',
	'Pos-Flop',
	'Pós-Flop',
] as const);

export const GeneralTelemetrySchema = z.object({
	category: z.enum([
		'quiz',
		'simulator',
		'performance',
		'error',
		'Risk Premium',
		'Fundamentos SOTA',
		'Bolha',
		'Pos-Flop',
		'Pós-Flop',
	]),
	componentName: z.string().nullable().optional(),
	scenarioContext: z.unknown().nullable().optional(),
	userAction: z.string().nullable().optional(),
	optimalAction: z.string().nullable().optional(),
	evLoss: z.number().default(0),
	isCorrect: z.boolean().default(true),
	latency: z.number().default(0),
	metadata: z.record(z.string(), z.unknown()).nullable().optional(),
});

export const TelemetryPayloadSchema = z.object({
	category: z.string(), // Permissivo para rota API, mantendo compatibilidade
	componentName: z.string().nullable().optional(),
	scenarioContext: z.unknown().nullable().optional(),
	userAction: z.string().nullable().optional(),
	optimalAction: z.string().nullable().optional(),
	evLoss: z.number().default(0),
	isCorrect: z.boolean().default(true),
	latency: z.number().default(0),
	metadata: z.record(z.string(), z.unknown()).nullable().optional(),
	// Legacy mapping properties
	type: z.string().optional(),
	time_ms: z.number().optional(),
	is_correct: z.boolean().optional(),
	ev_loss: z.number().optional(),
	user_id: z.string().optional(),
});

export type PhysicsSnapshot = z.infer<typeof PhysicsSnapshotSchema>;
export type InferenceRequest = z.infer<typeof InferenceRequestSchema>;
export type PerspectivaInputValidated = z.infer<typeof PerspectivaInputSchema>;
export type TelemetryPayload = z.input<typeof TelemetryPayloadSchema>;

