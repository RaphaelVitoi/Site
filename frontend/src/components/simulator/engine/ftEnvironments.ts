/**
 * IDENTITY: Ambientes de Mesa Final — Matrizes RP
 * PATH: src/components/simulator/engine/ftEnvironments.ts
 * ROLE: 3 ambientes de FT com distribuições de stack e matrizes de Risk Premium
 *       extraídas do HRC (Hold'em Resources Calculator).
 *       Cada matriz [agressor][defensor] retorna o RP do agressor naquele confronto.
 * SOURCE: Apex Engine V50 (public/simulador/) — dados validados em 2026-03-17.
 * BINDING: [types.ts, nashSolver.ts]
 */

export interface FTPlayer {
  id: string;
  pos: string;
  /** Stack em big blinds (bb) */
  bb: number;
}

export interface FTEnvironment {
  id: string;
  title: string;
  description: string;
  stacks: FTPlayer[];
  /** rpMatrix[agressorId][defensorId] = RP do agressor (%) */
  rpMatrix: Record<string, Record<string, number>>;
}

// Estrutura de premiação de referência (buy-in $10k, 9 players)
export const PAYOUTS_10K = [
  { pos: '1º Lugar', val: '$355,000' },
  { pos: '2º Lugar', val: '$279,000' },
  { pos: '3º Lugar', val: '$219,000' },
  { pos: '4º Lugar', val: '$171,000' },
  { pos: '5º Lugar', val: '$134,000' },
  { pos: '6º Lugar', val: '$105,000' },
  { pos: '7º Lugar', val: '$83,000' },
  { pos: '8º Lugar', val: '$65,000' },
  { pos: '9º Lugar', val: '$51,000' },
] as const;

// --- FT 1: Dinâmica em Escada (Standard) ---
// Distribuição típica: CL dominante com escada decrescente até micro-stacks.
// Demonstra o gradiente de RP: stacks pequenas têm RP alto mesmo contra o CL.
const FT1_STACKS: FTPlayer[] = [
  { id: 'p1', pos: 'UTG (CL)', bb: 53.6 },
  { id: 'p2', pos: 'UTG+1',    bb: 44.8 },
  { id: 'p3', pos: 'MP',       bb: 35.2 },
  { id: 'p4', pos: 'MP2',      bb: 28.5 },
  { id: 'p5', pos: 'HJ',       bb: 22.1 },
  { id: 'p6', pos: 'CO',       bb: 15 },
  { id: 'p7', pos: 'BTN',      bb: 11.6 },
  { id: 'p8', pos: 'SB',       bb: 9.4  },
  { id: 'p9', pos: 'BB',       bb: 6.2  },
];

const FT1_MATRIX: Record<string, Record<string, number>> = {
  p1: { p1: 0,    p2: 12.9, p3: 12.9, p4:  8.5, p5:  4.5, p6:  4.2, p7:  3.8, p8:  3, p9:  2.4 },
  p2: { p1: 21.5, p2:  0,   p3: 19.7, p4: 11.5, p5:  5.8, p6:  5.5, p7:  4.9, p8:  4, p9:  3.5 },
  p3: { p1: 21.4, p2: 19.9, p3:  0,   p4: 10.6, p5:  5.6, p6:  5.3, p7:  4.7, p8:  3.8, p9:  3.3 },
  p4: { p1: 22.5, p2: 21.1, p3: 20.8, p4:  0,   p5: 11.2, p6: 10.5, p7:  9.8, p8:  8.2, p9:  7.5 },
  p5: { p1: 23, p2: 21.8, p3: 21.5, p4: 18.5, p5:  0,   p6: 14.5, p7: 13.2, p8: 11.5, p9: 10.2 },
  p6: { p1: 23.2, p2: 22, p3: 21.8, p4: 19.8, p5: 15.2, p6:  0,   p7: 13.8, p8: 12, p9: 10.8 },
  p7: { p1: 23.4, p2: 22.3, p3: 22.1, p4: 20.2, p5: 16.5, p6: 15.8, p7:  0,   p8: 13.5, p9: 12.1 },
  p8: { p1: 23.7, p2: 22.6, p3: 22.4, p4: 21, p5: 18, p6: 17.3, p7: 16, p8:  0,   p9: 14.2 },
  p9: { p1: 24, p2: 23, p3: 22.8, p4: 21.5, p5: 19.5, p6: 18.8, p7: 17.5, p8: 15.8, p9:  0   },
};

// --- FT 2: Pacto Silencioso (Dominância Dupla) ---
// Dois gigantes (CL e Vice CL) isolados por micro-stacks.
// Demonstra o Arquétipo I: RP mútuo altíssimo → 3-bet linear desaparece.
const FT2_STACKS: FTPlayer[] = [
  { id: 'p1', pos: 'CL',     bb: 65 },
  { id: 'p2', pos: 'Vice CL',bb: 60 },
  { id: 'p3', pos: 'P3',     bb: 14 },
  { id: 'p4', pos: 'P4',     bb: 12 },
  { id: 'p5', pos: 'P5',     bb: 10 },
  { id: 'p6', pos: 'P6',     bb:  9 },
  { id: 'p7', pos: 'P7',     bb:  8 },
  { id: 'p8', pos: 'P8',     bb:  7 },
  { id: 'p9', pos: 'P9',     bb:  5 },
];

const FT2_MATRIX: Record<string, Record<string, number>> = {
  p1: { p1:  0,   p2: 23.5, p3:  6.5, p4:  6.2, p5:  6, p6:  5.8, p7:  5.5, p8:  5.2, p9:  5 },
  p2: { p1: 24.5, p2:  0,   p3:  7, p4:  6.7, p5:  6.5, p6:  6.2, p7:  6, p8:  5.5, p9:  5.2 },
  p3: { p1: 18.5, p2: 18, p3:  0,   p4:  9.5, p5:  9.2, p6:  9, p7:  8.5, p8:  8, p9:  7.5 },
  p4: { p1: 19, p2: 18.5, p3:  9.8, p4:  0,   p5:  9.5, p6:  9.2, p7:  8.8, p8:  8.2, p9:  7.8 },
  p5: { p1: 19.5, p2: 19, p3: 10, p4:  9.8, p5:  0,   p6:  9.5, p7:  9, p8:  8.5, p9:  8 },
  p6: { p1: 20, p2: 19.5, p3: 10.2, p4: 10, p5:  9.8, p6:  0,   p7:  9.2, p8:  8.8, p9:  8.2 },
  p7: { p1: 20.5, p2: 20, p3: 10.5, p4: 10.2, p5: 10, p6:  9.8, p7:  0,   p8:  9, p9:  8.5 },
  p8: { p1: 21, p2: 20.5, p3: 10.8, p4: 10.5, p5: 10.2, p6: 10, p7:  9.5, p8:  0,   p9:  8.8 },
  p9: { p1: 21.5, p2: 21, p3: 11, p4: 10.8, p5: 10.5, p6: 10.2, p7:  9.8, p8:  9.5, p9:  0   },
};

// --- FT 3: Ameaça Orgânica (God Mode CL) ---
// CL massivo contra o field. Demonstra o Arquétipo IV:
// CL tem RP baixo vs todos EXCETO o Vice (criar rival é destruir hegemonia).
const FT3_STACKS: FTPlayer[] = [
  { id: 'p1', pos: 'God Mode', bb: 80 },
  { id: 'p2', pos: 'P2',       bb: 25 },
  { id: 'p3', pos: 'P3',       bb: 20 },
  { id: 'p4', pos: 'P4',       bb: 18 },
  { id: 'p5', pos: 'P5',       bb: 15 },
  { id: 'p6', pos: 'P6',       bb: 14 },
  { id: 'p7', pos: 'P7',       bb: 12 },
  { id: 'p8', pos: 'P8',       bb: 10 },
  { id: 'p9', pos: 'P9',       bb:  8 },
];

const FT3_MATRIX: Record<string, Record<string, number>> = {
  p1: { p1:  0,   p2:  4.5, p3:  3.5, p4:  3, p5:  2.8, p6:  2.5, p7:  2.2, p8:  2, p9:  1.8 },
  p2: { p1: 24, p2:  0,   p3: 10.5, p4:  9.5, p5:  8.5, p6:  8, p7:  7.5, p8:  7, p9:  6.5 },
  p3: { p1: 22, p2: 11.5, p3:  0,   p4:  9.5, p5:  9, p6:  8.5, p7:  8, p8:  7.5, p9:  7 },
  p4: { p1: 22.5, p2: 12.5, p3: 10.5, p4:  0,   p5:  9.5, p6:  9, p7:  8.5, p8:  8, p9:  7.5 },
  p5: { p1: 23, p2: 13.5, p3: 11, p4: 10, p5:  0,   p6:  9.5, p7:  9, p8:  8.5, p9:  8 },
  p6: { p1: 23.5, p2: 14, p3: 11.5, p4: 10.5, p5: 10, p6:  0,   p7:  9.5, p8:  9, p9:  8.5 },
  p7: { p1: 24, p2: 14.5, p3: 12, p4: 11, p5: 10.5, p6: 10, p7:  0,   p8:  9.5, p9:  9 },
  p8: { p1: 24.5, p2: 15, p3: 12.5, p4: 11.5, p5: 11, p6: 10.5, p7: 10, p8:  0,   p9:  9.5 },
  p9: { p1: 25, p2: 15.5, p3: 13, p4: 12, p5: 11.5, p6: 11, p7: 10.5, p8: 10, p9:  0   },
};

// Exportação consolidada
export const FT_ENVIRONMENTS: FTEnvironment[] = [
  {
    id: 'FT1',
    title: 'FT 1: Dinâmica em Escada',
    description: 'CL dominante com escada decrescente. Gradiente completo de RP do topo ao micro.',
    stacks: FT1_STACKS,
    rpMatrix: FT1_MATRIX,
  },
  {
    id: 'FT2',
    title: 'FT 2: Pacto Silencioso',
    description: 'Dois gigantes isolados por micro-stacks. RP mútuo > 23% → agressão bloqueada.',
    stacks: FT2_STACKS,
    rpMatrix: FT2_MATRIX,
  },
  {
    id: 'FT3',
    title: 'FT 3: Ameaça Orgânica',
    description: 'God Mode CL. RP baixo vs todos exceto o Vice — criar rival destrói hegemonia.',
    stacks: FT3_STACKS,
    rpMatrix: FT3_MATRIX,
  },
];
