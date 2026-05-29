import { z } from 'zod';
/**
 * IDENTITY: SOTA Semantic Schemas
 * ROLE: Garantir integridade de dados entre Prisma, API e Motor MatemÃ¡tico.
 * PRINCIPLE: Economia Generalizada (Shannon) - Tipagem forte reduz entropia de erro.
 */
export declare const StacksSchema: z.ZodArray<z.ZodNumber, "many">;
export declare const PrizesSchema: z.ZodArray<z.ZodNumber, "many">;
export declare const PhysicsSnapshotSchema: z.ZodObject<{
    heroStack: z.ZodNumber;
    villain1Stack: z.ZodOptional<z.ZodNumber>;
    villain2Stack: z.ZodOptional<z.ZodNumber>;
    pot: z.ZodNumber;
    heroInvested: z.ZodNumber;
    edgeFactor: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    position: z.ZodEnum<["IP", "OOP", "BB", "SB"]>;
    referenceStatus: z.ZodDefault<z.ZodEnum<["baseline", "tilt", "protecting", "bubble"]>>;
    riskAdvantage: z.ZodOptional<z.ZodNumber>;
    bountyPower: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    pot: number;
    heroStack: number;
    heroInvested: number;
    position: "IP" | "OOP" | "BB" | "SB";
    referenceStatus: "baseline" | "tilt" | "protecting" | "bubble";
    villain1Stack?: number | undefined;
    villain2Stack?: number | undefined;
    edgeFactor?: number | undefined;
    riskAdvantage?: number | undefined;
    bountyPower?: number | undefined;
}, {
    pot: number;
    heroStack: number;
    heroInvested: number;
    position: "IP" | "OOP" | "BB" | "SB";
    villain1Stack?: number | undefined;
    villain2Stack?: number | undefined;
    edgeFactor?: number | undefined;
    referenceStatus?: "baseline" | "tilt" | "protecting" | "bubble" | undefined;
    riskAdvantage?: number | undefined;
    bountyPower?: number | undefined;
}>;
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
        position: z.ZodEnum<["IP", "OOP", "BB", "SB"]>;
        referenceStatus: z.ZodDefault<z.ZodEnum<["baseline", "tilt", "protecting", "bubble"]>>;
        riskAdvantage: z.ZodOptional<z.ZodNumber>;
        bountyPower: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        pot: number;
        heroStack: number;
        heroInvested: number;
        position: "IP" | "OOP" | "BB" | "SB";
        referenceStatus: "baseline" | "tilt" | "protecting" | "bubble";
        villain1Stack?: number | undefined;
        villain2Stack?: number | undefined;
        edgeFactor?: number | undefined;
        riskAdvantage?: number | undefined;
        bountyPower?: number | undefined;
    }, {
        pot: number;
        heroStack: number;
        heroInvested: number;
        position: "IP" | "OOP" | "BB" | "SB";
        villain1Stack?: number | undefined;
        villain2Stack?: number | undefined;
        edgeFactor?: number | undefined;
        referenceStatus?: "baseline" | "tilt" | "protecting" | "bubble" | undefined;
        riskAdvantage?: number | undefined;
        bountyPower?: number | undefined;
    }>>;
    predictive_profile: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    max_tokens: z.ZodDefault<z.ZodNumber>;
    model: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    prompt: string;
    max_tokens: number;
    system_prompt?: string | undefined;
    physics_snapshot?: {
        pot: number;
        heroStack: number;
        heroInvested: number;
        position: "IP" | "OOP" | "BB" | "SB";
        referenceStatus: "baseline" | "tilt" | "protecting" | "bubble";
        villain1Stack?: number | undefined;
        villain2Stack?: number | undefined;
        edgeFactor?: number | undefined;
        riskAdvantage?: number | undefined;
        bountyPower?: number | undefined;
    } | undefined;
    predictive_profile?: Record<string, unknown> | undefined;
    model?: string | undefined;
}, {
    prompt: string;
    system_prompt?: string | undefined;
    physics_snapshot?: {
        pot: number;
        heroStack: number;
        heroInvested: number;
        position: "IP" | "OOP" | "BB" | "SB";
        villain1Stack?: number | undefined;
        villain2Stack?: number | undefined;
        edgeFactor?: number | undefined;
        referenceStatus?: "baseline" | "tilt" | "protecting" | "bubble" | undefined;
        riskAdvantage?: number | undefined;
        bountyPower?: number | undefined;
    } | undefined;
    predictive_profile?: Record<string, unknown> | undefined;
    max_tokens?: number | undefined;
    model?: string | undefined;
}>;
export declare const PerspectivaInputSchema: z.ZodObject<{
    stacks: z.ZodArray<z.ZodNumber, "many">;
    prizes: z.ZodArray<z.ZodNumber, "many">;
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
}, "strip", z.ZodTypeAny, {
    stacks: number[];
    prizes: number[];
    heroIdx: number;
    villainIdx: number;
    potSize: number;
    heroCost: number;
    winProb: number;
    realizationFactor: number;
    edgeBase: number;
    numPlayersInPot: number;
    kappa?: number | undefined;
    bountyValue?: number | undefined;
    humanNoiseFactor?: number | undefined;
    isNearPayjump?: boolean | undefined;
    blindsRisingSoon?: boolean | undefined;
    currentEquityPct?: number | undefined;
    heroPosition?: string | undefined;
    spr?: number | undefined;
    investidoAcumulado?: number | undefined;
    blindCost?: number | undefined;
}, {
    stacks: number[];
    prizes: number[];
    heroIdx: number;
    villainIdx: number;
    potSize: number;
    heroCost: number;
    winProb: number;
    kappa?: number | undefined;
    realizationFactor?: number | undefined;
    edgeBase?: number | undefined;
    numPlayersInPot?: number | undefined;
    bountyValue?: number | undefined;
    humanNoiseFactor?: number | undefined;
    isNearPayjump?: boolean | undefined;
    blindsRisingSoon?: boolean | undefined;
    currentEquityPct?: number | undefined;
    heroPosition?: string | undefined;
    spr?: number | undefined;
    investidoAcumulado?: number | undefined;
    blindCost?: number | undefined;
}>;
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
    currentMapaICM: z.ZodArray<z.ZodNumber, "many">;
    winMapaICM: z.ZodArray<z.ZodNumber, "many">;
    loseMapaICM: z.ZodArray<z.ZodNumber, "many">;
}, "strip", z.ZodTypeAny, {
    bountyPower: number;
    realizationFactor: number;
    currentEquityPct: number;
    handEquity: number;
    deltaWinPct: number;
    deltaLosePct: number;
    deltaFoldPct: number;
    valuation: number;
    rioLiability: number;
    fgsHealth: number;
    survivalPressure: number;
    dynamicEvFold: number;
    perspectivaPct: number;
    amortizedEdge: number;
    ci: number;
    marginInstability: number;
    threshEq: number;
    isActionBetterThanFold: boolean;
    diagnostico: string;
    currentMapaICM: number[];
    winMapaICM: number[];
    loseMapaICM: number[];
}, {
    bountyPower: number;
    realizationFactor: number;
    currentEquityPct: number;
    handEquity: number;
    deltaWinPct: number;
    deltaLosePct: number;
    deltaFoldPct: number;
    valuation: number;
    rioLiability: number;
    fgsHealth: number;
    survivalPressure: number;
    dynamicEvFold: number;
    perspectivaPct: number;
    amortizedEdge: number;
    ci: number;
    marginInstability: number;
    threshEq: number;
    isActionBetterThanFold: boolean;
    diagnostico: string;
    currentMapaICM: number[];
    winMapaICM: number[];
    loseMapaICM: number[];
}>;
export declare const PerspectiveMetricSchema: z.ZodObject<{
    scenarioId: z.ZodEffects<z.ZodOptional<z.ZodNullable<z.ZodString>>, string | null, string | null | undefined>;
    baseState: z.ZodObject<{
        chipEvFold: z.ZodNumber;
        icmValuation: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        chipEvFold: number;
        icmValuation: number;
    }, {
        chipEvFold: number;
        icmValuation: number;
    }>;
    dynamicModifiers: z.ZodObject<{
        timeToBlindJumpMinutes: z.ZodNumber;
        payjumpProximityFactor: z.ZodNumber;
        positionalUrgency: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        timeToBlindJumpMinutes: number;
        payjumpProximityFactor: number;
        positionalUrgency: number;
    }, {
        timeToBlindJumpMinutes: number;
        payjumpProximityFactor: number;
        positionalUrgency: number;
    }>;
    structuralLiabilities: z.ZodObject<{
        multiwayOpponents: z.ZodNumber;
        reverseImpliedOddsPenalty: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        multiwayOpponents: number;
        reverseImpliedOddsPenalty: number;
    }, {
        multiwayOpponents: number;
        reverseImpliedOddsPenalty: number;
    }>;
    edgeRelative: z.ZodObject<{
        stackDepthBb: z.ZodNumber;
        humanNoiseFactor: z.ZodDefault<z.ZodNumber>;
        technicalSuperiority: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        humanNoiseFactor: number;
        stackDepthBb: number;
        technicalSuperiority: number;
    }, {
        stackDepthBb: number;
        technicalSuperiority: number;
        humanNoiseFactor?: number | undefined;
    }>;
    insolvency: z.ZodObject<{
        potOddsRatio: z.ZodNumber;
        perspectiveUtility: z.ZodNumber;
        insolvencyCoefficient: z.ZodNullable<z.ZodNumber>;
        isViable: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        potOddsRatio: number;
        perspectiveUtility: number;
        insolvencyCoefficient: number | null;
        isViable: boolean;
    }, {
        potOddsRatio: number;
        perspectiveUtility: number;
        insolvencyCoefficient: number | null;
        isViable: boolean;
    }>;
}, "strip", z.ZodTypeAny, {
    scenarioId: string | null;
    baseState: {
        chipEvFold: number;
        icmValuation: number;
    };
    dynamicModifiers: {
        timeToBlindJumpMinutes: number;
        payjumpProximityFactor: number;
        positionalUrgency: number;
    };
    structuralLiabilities: {
        multiwayOpponents: number;
        reverseImpliedOddsPenalty: number;
    };
    edgeRelative: {
        humanNoiseFactor: number;
        stackDepthBb: number;
        technicalSuperiority: number;
    };
    insolvency: {
        potOddsRatio: number;
        perspectiveUtility: number;
        insolvencyCoefficient: number | null;
        isViable: boolean;
    };
}, {
    baseState: {
        chipEvFold: number;
        icmValuation: number;
    };
    dynamicModifiers: {
        timeToBlindJumpMinutes: number;
        payjumpProximityFactor: number;
        positionalUrgency: number;
    };
    structuralLiabilities: {
        multiwayOpponents: number;
        reverseImpliedOddsPenalty: number;
    };
    edgeRelative: {
        stackDepthBb: number;
        technicalSuperiority: number;
        humanNoiseFactor?: number | undefined;
    };
    insolvency: {
        potOddsRatio: number;
        perspectiveUtility: number;
        insolvencyCoefficient: number | null;
        isViable: boolean;
    };
    scenarioId?: string | null | undefined;
}>;
export declare const TelemetryCategorySchema: z.ZodEnum<["quiz", "simulator", "performance", "error", "Risk Premium", "Fundamentos SOTA", "Bolha", "Pos-Flop", "PÃ³s-Flop"]>;
export declare const GeneralTelemetrySchema: z.ZodObject<{
    category: z.ZodEnum<["quiz", "simulator", "performance", "error", "Risk Premium", "Fundamentos SOTA", "Bolha", "Pos-Flop", "PÃ³s-Flop"]>;
    componentName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    scenarioContext: z.ZodOptional<z.ZodNullable<z.ZodUnknown>>;
    userAction: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    optimalAction: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    evLoss: z.ZodDefault<z.ZodNumber>;
    isCorrect: z.ZodDefault<z.ZodBoolean>;
    latency: z.ZodDefault<z.ZodNumber>;
    metadata: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
}, "strip", z.ZodTypeAny, {
    category: "quiz" | "simulator" | "performance" | "error" | "Risk Premium" | "Fundamentos SOTA" | "Bolha" | "Pos-Flop" | "PÃ³s-Flop";
    evLoss: number;
    isCorrect: boolean;
    latency: number;
    componentName?: string | null | undefined;
    scenarioContext?: unknown;
    userAction?: string | null | undefined;
    optimalAction?: string | null | undefined;
    metadata?: Record<string, unknown> | null | undefined;
}, {
    category: "quiz" | "simulator" | "performance" | "error" | "Risk Premium" | "Fundamentos SOTA" | "Bolha" | "Pos-Flop" | "PÃ³s-Flop";
    componentName?: string | null | undefined;
    scenarioContext?: unknown;
    userAction?: string | null | undefined;
    optimalAction?: string | null | undefined;
    evLoss?: number | undefined;
    isCorrect?: boolean | undefined;
    latency?: number | undefined;
    metadata?: Record<string, unknown> | null | undefined;
}>;
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
}, "strip", z.ZodTypeAny, {
    category: string;
    evLoss: number;
    isCorrect: boolean;
    latency: number;
    type?: string | undefined;
    componentName?: string | null | undefined;
    scenarioContext?: unknown;
    userAction?: string | null | undefined;
    optimalAction?: string | null | undefined;
    metadata?: Record<string, unknown> | null | undefined;
    time_ms?: number | undefined;
    is_correct?: boolean | undefined;
    ev_loss?: number | undefined;
    user_id?: string | undefined;
}, {
    category: string;
    type?: string | undefined;
    componentName?: string | null | undefined;
    scenarioContext?: unknown;
    userAction?: string | null | undefined;
    optimalAction?: string | null | undefined;
    evLoss?: number | undefined;
    isCorrect?: boolean | undefined;
    latency?: number | undefined;
    metadata?: Record<string, unknown> | null | undefined;
    time_ms?: number | undefined;
    is_correct?: boolean | undefined;
    ev_loss?: number | undefined;
    user_id?: string | undefined;
}>;
export type PhysicsSnapshot = z.infer<typeof PhysicsSnapshotSchema>;
export type InferenceRequest = z.infer<typeof InferenceRequestSchema>;
export type PerspectivaInputValidated = z.infer<typeof PerspectivaInputSchema>;
export type TelemetryPayload = z.input<typeof TelemetryPayloadSchema>;
