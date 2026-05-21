/**
 * SOTA V2 - ICM Evaluate Payload
 * Economia Generalizada: Transmissão estrita dos vetores necessários para o cálculo da Perspectiva Matemática.
 */

export interface IcmEvaluateRequest {
    tournamentId: string;
    spotId: string;
    heroPosition: string;
    villainPosition: string;
    potSize: number;
    betSize: number;
    stacks: number[]; // Array de stacks em BBs, refletindo o Table Draw atual
    payouts: number[]; // Estrutura de premiação restante para o cálculo de P(finish_i)
}

export interface IcmEvaluateResponse {
    bubbleFactor: number;
    riskPremium: number;   // Matematicamente: Bubble Factor - 1
    chipEv: number;        // Baseline de comparação
    icmEv: number;         // Soma(P(finish_i) * Prize_i)
    fgsProjection: number; // Erosão antecipada de stack (t-3) na Perspectiva Matemática
    tensionIndex: number;  // Índice heurístico de dor gerado pelas RIO e aversão ao risco (0.0 a 1.0)
}
