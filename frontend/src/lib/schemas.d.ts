import { z } from 'zod';
/**
 * IDENTITY: SOTA Semantic Schemas
 * ROLE: Garantir integridade de dados entre Prisma, API e Motor Matemático.
 * PRINCIPLE: Economia Generalizada (Shannon) - Tipagem forte reduz entropia de erro.
 */
export declare const StacksSchema: z.ZodArray<z.ZodNumber>;
export declare const PrizesSchema: z.ZodArray<z.ZodNumber>;
export declare const PhysicsSnapshotSchema: z.ZodObject<{
    heroStack: z.ZodNumber;
    villain1Stack: z.ZodOptional<z.ZodNumber>;
    villain2Stack: z.ZodOptional<z.ZodNumber>;
    pot: z.ZodNumber;
    heroInvested: z.ZodNumber;
    edgeFactor: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    position: z.ZodEnum<{
        IP: "IP";
        OOP: "OOP";
        BB: "BB";
        SB: "SB";
    }>;
    referenceStatus: z.ZodDefault<z.ZodEnum<{
        baseline: "baseline";
        tilt: "tilt";
        protecting: "protecting";
        bubble: "bubble";
    }>>;
}, z.core.$strip>;
export declare const InferenceRequestSchema: z.ZodObject<{
    prompt: z.ZodString;
    system_prompt: z.ZodOptional<z.ZodString>;
    physics_snapshot: z.ZodOptional<z.ZodObject<{
        heroStack: z.ZodNumber;
        villain1Stack: z.ZodOptional<z.ZodNumber>;
        villain2Stack: z.ZodOptional<z.ZodNumber>;
        pot: z.ZodNumber;
        heroInvested: z.ZodNumber;
        edgeFactor: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
        position: z.ZodEnum<{
            IP: "IP";
            OOP: "OOP";
            BB: "BB";
            SB: "SB";
        }>;
        referenceStatus: z.ZodDefault<z.ZodEnum<{
            baseline: "baseline";
            tilt: "tilt";
            protecting: "protecting";
            bubble: "bubble";
        }>>;
    }, z.core.$strip>>;
    predictive_profile: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    max_tokens: z.ZodDefault<z.ZodNumber>;
    model: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const PerspectivaInputSchema: z.ZodObject<{
    stacks: z.ZodArray<z.ZodNumber>;
    prizes: z.ZodArray<z.ZodNumber>;
    heroIdx: z.ZodNumber;
    villainIdx: z.ZodNumber;
    potSize: z.ZodNumber;
    heroCost: z.ZodNumber;
    winProb: z.ZodNumber;
    realizationFactor: z.ZodDefault<z.ZodNumber>;
    edgeBase: z.ZodDefault<z.ZodNumber>;
    numPlayersInPot: z.ZodDefault<z.ZodNumber>;
    bountyValue: z.ZodOptional<z.ZodNumber>;
    kappa: z.ZodOptional<z.ZodNumber>;
    humanNoiseFactor: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    isNearPayjump: z.ZodOptional<z.ZodBoolean>;
    blindsRisingSoon: z.ZodOptional<z.ZodBoolean>;
    currentEquityPct: z.ZodOptional<z.ZodNumber>;
    heroPosition: z.ZodOptional<z.ZodString>;
    spr: z.ZodOptional<z.ZodNumber>;
    investidoAcumulado: z.ZodOptional<z.ZodNumber>;
    blindCost: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const PerspectivaResultSchema: z.ZodObject<{
    handEquity: z.ZodNumber;
    currentEquityPct: z.ZodNumber;
    deltaWinPct: z.ZodNumber;
    deltaLosePct: z.ZodNumber;
    deltaFoldPct: z.ZodNumber;
    valuation: z.ZodNumber;
    rioLiability: z.ZodNumber;
    fgsHealth: z.ZodNumber;
    survivalPressure: z.ZodNumber;
    dynamicEvFold: z.ZodNumber;
    perspectivaPct: z.ZodNumber;
    amortizedEdge: z.ZodNumber;
    ci: z.ZodNumber;
    marginInstability: z.ZodNumber;
    threshEq: z.ZodNumber;
    realizationFactor: z.ZodNumber;
    isActionBetterThanFold: z.ZodBoolean;
    diagnostico: z.ZodString;
    bountyPower: z.ZodNumber;
    currentMapaICM: z.ZodArray<z.ZodNumber>;
    winMapaICM: z.ZodArray<z.ZodNumber>;
    loseMapaICM: z.ZodArray<z.ZodNumber>;
}, z.core.$strip>;
export declare const PerspectiveMetricSchema: z.ZodObject<{
    scenarioId: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string | null, string | null | undefined>>;
    baseState: z.ZodObject<{
        chipEvFold: z.ZodNumber;
        icmValuation: z.ZodNumber;
    }, z.core.$strip>;
    dynamicModifiers: z.ZodObject<{
        timeToBlindJumpMinutes: z.ZodNumber;
        payjumpProximityFactor: z.ZodNumber;
        positionalUrgency: z.ZodNumber;
    }, z.core.$strip>;
    structuralLiabilities: z.ZodObject<{
        multiwayOpponents: z.ZodNumber;
        reverseImpliedOddsPenalty: z.ZodNumber;
    }, z.core.$strip>;
    edgeRelative: z.ZodObject<{
        stackDepthBb: z.ZodNumber;
        humanNoiseFactor: z.ZodDefault<z.ZodNumber>;
        technicalSuperiority: z.ZodNumber;
    }, z.core.$strip>;
    insolvency: z.ZodObject<{
        potOddsRatio: z.ZodNumber;
        perspectiveUtility: z.ZodNumber;
        insolvencyCoefficient: z.ZodNullable<z.ZodNumber>;
        isViable: z.ZodBoolean;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const TelemetryCategorySchema: z.ZodEnum<{
    error: "error";
    quiz: "quiz";
    simulator: "simulator";
    performance: "performance";
    "Risk Premium": "Risk Premium";
    "Fundamentos SOTA": "Fundamentos SOTA";
    Bolha: "Bolha";
    "Pos-Flop": "Pos-Flop";
    "P\u00F3s-Flop": "Pós-Flop";
}>;
export declare const GeneralTelemetrySchema: z.ZodObject<{
    category: z.ZodEnum<{
        error: "error";
        quiz: "quiz";
        simulator: "simulator";
        performance: "performance";
        "Risk Premium": "Risk Premium";
        "Fundamentos SOTA": "Fundamentos SOTA";
        Bolha: "Bolha";
        "Pos-Flop": "Pos-Flop";
        "P\u00F3s-Flop": "Pós-Flop";
    }>;
    componentName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    scenarioContext: z.ZodOptional<z.ZodNullable<z.ZodUnknown>>;
    userAction: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    optimalAction: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    evLoss: z.ZodDefault<z.ZodNumber>;
    isCorrect: z.ZodDefault<z.ZodBoolean>;
    latency: z.ZodDefault<z.ZodNumber>;
    metadata: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
}, z.core.$strip>;
export declare const TelemetryPayloadSchema: z.ZodObject<{
    category: z.ZodString;
    componentName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    scenarioContext: z.ZodOptional<z.ZodNullable<z.ZodUnknown>>;
    userAction: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    optimalAction: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    evLoss: z.ZodDefault<z.ZodNumber>;
    isCorrect: z.ZodDefault<z.ZodBoolean>;
    latency: z.ZodDefault<z.ZodNumber>;
    metadata: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    type: z.ZodOptional<z.ZodString>;
    time_ms: z.ZodOptional<z.ZodNumber>;
    is_correct: z.ZodOptional<z.ZodBoolean>;
    ev_loss: z.ZodOptional<z.ZodNumber>;
    user_id: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type PhysicsSnapshot = z.infer<typeof PhysicsSnapshotSchema>;
export type InferenceRequest = z.infer<typeof InferenceRequestSchema>;
export type PerspectivaInputValidated = z.infer<typeof PerspectivaInputSchema>;
export type TelemetryPayload = z.input<typeof TelemetryPayloadSchema>;
