import { z } from 'zod';

/**
 * IDENTITY: SOTA Semantic Schemas
 * ROLE: Garantir integridade de dados entre Prisma, API e Motor Matemático.
 * PRINCIPLE: Economia Generalizada (Shannon) - Tipagem forte reduz entropia de erro.
 */

// Schema para Stacks (Array de números positivos)
export const StacksSchema = z.array( z.number().nonnegative() ).min( 2 );

// Schema para Prizes (Array de números positivos decrescentes)
export const PrizesSchema = z.array( z.number().nonnegative() );

// Schema para a Física da Mesa (SotaPhysicsState)
export const SotaPhysicsSchema = z.object( {
    heroStack: z.number().positive(),
    villain1Stack: z.number().positive(),
    villain2Stack: z.number().positive(),
    pot: z.number().positive(),
    heroInvested: z.number().nonnegative(),
    edgeFactor: z.number().min( 0.5 ).max( 2 ).default( 1 ),
    position: z.enum( ['IP', 'OOP'] ),
    referenceStatus: z.enum( ['baseline', 'distorted', 'quantum'] ).default( 'baseline' ),
} );

// Schema para entrada do Motor de Perspectiva
export const PerspectivaInputSchema = z.object( {
    stacks: StacksSchema,
    prizes: PrizesSchema,
    heroIdx: z.number().int().nonnegative(),
    villainIdx: z.number().int().nonnegative(),
    potSize: z.number().positive(),
    heroCost: z.number().nonnegative(),
    winProb: z.number().min( 0 ).max( 1 ),
    realizationFactor: z.number().min( 0 ).max( 2 ).default( 1 ),
    edgeBase: z.number().default( 1 ),
    numPlayersInPot: z.number().int().min( 2 ).default( 2 ),
} );

// === TELEMETRIA SOTA ===

export const TelemetryCategorySchema = z.enum( [
    'quiz', 'simulator', 'performance', 'error',
    'Risk Premium', 'Fundamentos SOTA', 'Bolha', 'Pós-Flop'
] as const );

export const TelemetryPayloadSchema = z.object( {
    category: TelemetryCategorySchema,
    scenarioContext: SotaPhysicsSchema.partial().optional(),
    userAction: z.string().optional(),
    optimalAction: z.string().optional(),
    evLoss: z.number().default( 0 ),
    isCorrect: z.boolean().default( true ),
    latency: z.number().optional(),
    componentName: z.string().default( 'unknown' ),
    metadata: z.record( z.any() ).optional(),
} );

export type SotaPhysics = z.infer<typeof SotaPhysicsSchema>;
export type PerspectivaInputValidated = z.infer<typeof PerspectivaInputSchema>;
export type TelemetryPayload = z.infer<typeof TelemetryPayloadSchema>;
