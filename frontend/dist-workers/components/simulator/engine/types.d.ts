/**
 * IDENTITY: Tipos do Simulador Mestre ICM
 * PATH: src/components/simulator/engine/types.ts
 * ROLE: Interfaces TypeScript para o ecossistema completo do simulador.
 */
export interface SprStage {
    name: string;
    /** Tamanho do pot em big blinds (bb) */
    potSize: number;
    rpValue: number;
}
export interface ScenarioQuizOption {
    id?: string;
    text: string;
    isCorrect: boolean;
}
export interface ScenarioQuiz {
    question: string;
    options: ScenarioQuizOption[];
    explanation: string;
}
export type Quiz = ScenarioQuiz;
export type ScenarioColor = 'indigo' | 'rose' | 'emerald' | 'sky' | 'amber' | 'fuchsia' | 'slate' | 'blue';
export type ScenarioCategory = 'clinical' | 'baseline' | 'toyGame';
export interface ChipEvFreqs {
    ip_check: number;
    ip_bet_small: number;
    ip_bet_large: number;
    oop_call: number;
    oop_fold: number;
    oop_raise: number;
}
export type HeroPosition = 'IP' | 'SB' | 'BB' | 'OOP';
export type ActiveTool = 'scenario' | 'calculator' | 'matchup' | 'comparar' | 'perspectiva' | 'posflop';
export type Street = 'flop' | 'turn' | 'river';
export interface StreetChipEvFreqs {
    flop: ChipEvFreqs;
    turn: ChipEvFreqs;
    river: ChipEvFreqs;
}
export interface FreqResult {
    /** Frequência ICM estimada — centro da distribuição */
    center: number;
    /** Spread de incerteza: cresce para configurações além da âncora empírica */
    spread: number;
    /** Distorção em relação ao ChipEV fornecido (positivo = ação aumentou) */
    delta: number;
}
export interface IcmDistortionResult {
    ip: {
        check: FreqResult;
        bet_small: FreqResult;
        bet_large: FreqResult;
    };
    oop: {
        call: FreqResult;
        fold: FreqResult;
        raise: FreqResult;
    };
    /** Risk Advantage: RP_ip - RP_oop. Positivo = IP sob maior pressao ICM */
    deltaRp: number;
    /** Expoente b da curva concava — transparencia do modelo */
    bExponent: number;
    rawData: {
        ipRp: number;
        oopRp: number;
        chipEvFreqs: ChipEvFreqs;
    };
}
export interface NodelockConstraint {
    type: 'block_bet' | 'overbet' | 'check_100';
    sizePct: number;
    freqOverride: number;
}
export interface Scenario {
    id: string;
    name: string;
    category: ScenarioCategory;
    /** Stacks dos jogadores em big blinds (bb). ICM usa apenas razoes — a unidade é convencional. */
    stacks: number[];
    /** Nomes ou identificadores dos jogadores na mesa (opcional). */
    players?: string[];
    /** Estrutura de prêmios restantes (do 1º ao N-ésimo colocado).
     *  Usado pelo rpDeriver para derivar RP automaticamente via Malmuth-Harville. */
    prizes: number[];
    /** RP manual (fallback). Quando prizes está definido, o motor deriva RP automaticamente. */
    ipRp: number;
    /** RP manual (fallback). Quando prizes está definido, o motor deriva RP automaticamente. */
    oopRp: number;
    ipPos: string;
    ipMorph?: string;
    oopPos: string;
    oopMorph?: string;
    verdict: string;
    narrativeTitle: string;
    narrativeSubtitle: string;
    icon: string;
    color: ScenarioColor;
    theory: string;
    exploit: string[];
    sprData: SprStage[];
    /** Frequências ChipEV de referência por street — flop, turn, river (exemplo didático) */
    defaultStreetFreqs: StreetChipEvFreqs;
    quiz: ScenarioQuiz;
}
export interface TournamentScenario {
    id: string;
    tournamentId: string;
    name: string;
    description?: string;
    playersRemaining: number;
    createdAt: string;
    updatedAt: string;
}
export interface Tournament {
    id: string;
    name: string;
    buyIn: number;
    prizePool: number;
    startDate: string;
    endDate?: string;
    scenarios?: TournamentScenario[];
}
export interface IcmLabResponse<T> {
    status: 'SUCCESS' | 'ERROR';
    data?: T;
    error?: string;
}
export interface QuantumMetrics {
    amortizedEdgeMultiplier: number;
    rioMw: number;
    adjustedEvFold: number;
    esperanca: number;
    expectativa: number;
    perspectiva: number;
    threshEq: number | null;
    ci: number | null;
    riskAdvantage: number;
    bountyPower?: number;
    marginInstability: number;
    isSolvent: boolean;
    isActionable: boolean;
    bayesianWinProb?: number;
}
