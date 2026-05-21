/**
 * IDENTITY: Motor de Calculo ICM (Independent Chip Model)
 * PATH: frontend/src/lib/icm.ts
 * ROLE: Isolar a matematica pesada da logica de UI, permitindo reutilizacao e testes unitarios.
 * BINDING: [DownwardDriftSimulator.tsx, IcmUniversalLab.tsx (V2)]
 * TELEOLOGY: Evoluir para um motor de ICM completo que suporta calculos recursivos e FGS.
 */

/**
 * Calcula o Risk Premium (RP) com base no Bubble Factor (BF).
 * O RP representa a 'taxa' de equidade extra necessaria para justificar um risco.
 * @param bubbleFactor - O fator de dor financeira (BF).
 * @returns O Risk Premium como uma fracao (ex: 0.12 para 12%).
 */
export function calculateRiskPremium ( bubbleFactor: number ): number
{
    if ( bubbleFactor < 1 ) return 0;
    return ( bubbleFactor - 1 ) / bubbleFactor;
}

/**
 * Calcula a equidade minima necessaria para um call no river sob pressao de ICM.
 * @param pot - O tamanho do pote antes da aposta.
 * @param bet - O tamanho da aposta enfrentada.
 * @param bubbleFactor - O Bubble Factor do defensor.
 * @returns A equidade necessaria como uma fracao (ex: 0.41 para 41%).
 */
export function calculateRequiredEquity (
    pot: number,
    bet: number,
    bubbleFactor: number
): number
{
    if ( pot <= 0 || bet <= 0 ) return 0;

    const numerator = bet * bubbleFactor;
    const denominator = pot + bet + bet * bubbleFactor;

    return numerator / denominator;
}
