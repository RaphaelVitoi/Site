/**
 * PROTOCOLO VITOI 3.2 - PERSPECTIVA MATEMÁTICA
 * Contrato tipado estrito para injeção de dados no ecossistema Next.js/Prisma.
 */

export type TablePosition = 'UTG' | 'EP' | 'MP' | 'HJ' | 'CO' | 'BTN' | 'SB' | 'BB';

export interface IVitoiMathematicalPerspective {
  baseState: {
    chipEvFold: number; // O piso tradicional absoluto (-antes)
    icmValuation: number; // Valuation da stack no tempo 0
  };

  dynamicModifiers: {
    timeToBlindJumpMinutes: number; // Erosão Antecipada (t - 3)
    payjumpProximityFactor: number; // Escala 1.0 a 0.0 (Bolha)
    positionalUrgency: TablePosition; // Assimetria de rotação
  };

  structuralLiabilities: {
    multiwayOpponents: number; // Gatilho de x^2 para RIO
    reverseImpliedOddsPenalty: number; // O passivo estrutural base
  };

  edgeRelative: {
    stackDepthBb: number; // log(S) determina a poda da árvore (Nash vs Exploração)
    humanNoiseFactor: number; // 'fb' - Taxa de Besteira Emocional
    technicalSuperiority: number; // Multiplicador base
  };
}

export interface IInsolvencyAnalysis {
  potOddsRatio: number;
  perspectiveUtility: number;
  insolvencyCoefficient: number; // Ci = PotOdds / PM
  isViable: boolean; // Rejeição de Heurística Falsa
}
