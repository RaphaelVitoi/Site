/**
 * IDENTITY: Matrizes de Calibração (Âncora Empírica Aula 1.2)
 * PATH: src/components/simulator/data/ReferencialData.ts
 * ROLE: Fonte de dados estáticos para o ReferencialAula12, desidratando o componente de UI.
 */

export const RANKS = [ 'A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2' ];

// BTN range — dados exatos da imagem (Aula 1.2)
export const BTN_FREQS = [
    [ 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100 ],
    [ 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 57 ],
    [ 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 52, 5 ],
    [ 100, 100, 100, 100, 100, 100, 100, 100, 100, 49, 0, 0, 0 ],
    [ 100, 100, 100, 100, 100, 100, 100, 100, 31, 0, 0, 0, 0 ],
    [ 100, 65, 54, 41, 51, 100, 100, 80, 13, 0, 0, 0, 0 ],
    [ 100, 22, 0, 0, 0, 0, 100, 100, 55, 0, 0, 0, 0 ],
    [ 92, 0, 0, 0, 0, 0, 0, 100, 69, 20, 0, 0, 0 ],
    [ 54, 0, 0, 0, 0, 0, 0, 0, 100, 52, 0, 0, 0 ],
    [ 100, 0, 0, 0, 0, 0, 0, 0, 0, 100, 24, 0, 0 ],
    [ 46, 0, 0, 0, 0, 0, 0, 0, 0, 0, 62, 0, 0 ],
    [ 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
    [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
];

// BB range — defesa 82.9% vs minirraise BTN
export const BB_FREQS = [
    [ 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100 ],
    [ 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100 ],
    [ 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100 ],
    [ 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 50, 0, 0 ],
    [ 100, 100, 100, 100, 100, 100, 100, 100, 100, 50, 0, 0, 0 ],
    [ 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 50, 0, 0 ],
    [ 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 0, 0, 0 ],
    [ 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 0, 0, 0 ],
    [ 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 50, 0, 0 ],
    [ 100, 100, 100, 50, 0, 0, 0, 0, 0, 100, 100, 50, 0 ],
    [ 100, 100, 100, 0, 0, 0, 0, 0, 0, 0, 100, 100, 50 ],
    [ 100, 100, 50, 0, 0, 0, 0, 0, 0, 0, 0, 100, 100 ],
    [ 100, 100, 50, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100 ],
];

export const PRIZES = [
    { pos: '1º', val: 237.34 }, { pos: '2º', val: 170.96 },
    { pos: '3º', val: 135.17 }, { pos: '4º', val: 109.99 },
    { pos: '5º', val: 90.28 }, { pos: '6º', val: 73.95 },
    { pos: '7º', val: 59.92 }, { pos: '8º', val: 47.56 },
    { pos: '9º', val: 36.47 },
];
export const TOTAL_PRIZES = PRIZES.reduce( ( s, p ) => s + p.val, 0 );
export const TOTAL_POOL = 1260; // ~126 entradas a $11 descontando o rake

// Bubble Factor matrix (9x9)
export const BF_PLAYERS = [ 'UTG', 'EP', 'MP1', 'MP2', 'HJ', 'CO', 'BU', 'SB', 'BB' ];
export const BF_STACKS = [ 9.4, 52.4, 22.2, 7, 44.3, 24.3, 40, 13.4, 55 ];
export const BF_MATRIX = [
    [ 0, 1.63, 1.53, 1.23, 1.62, 1.55, 1.61, 1.45, 1.64 ],
    [ 1.1, 0, 1.29, 1.07, 1.96, 1.32, 1.15, 1.15, 2.64 ],
    [ 1.21, 2.12, 0, 1.15, 2.09, 1.94, 2.06, 1.34, 2.13 ],
    [ 1.28, 1.48, 1.41, 0, 1.47, 1.42, 1.46, 1.33, 1.48 ],
    [ 1.12, 2.53, 1.35, 1.09, 0, 1.4, 2.06, 1.18, 2.55 ],
    [ 1.2, 2.18, 1.78, 1.14, 2.14, 0, 2.11, 1.32, 2.19 ],
    [ 1.13, 2.47, 1.39, 1.09, 2.41, 1.45, 0, 1.2, 2.49 ],
    [ 1.31, 1.83, 1.69, 1.2, 1.8, 1.71, 1.79, 0, 1.83 ],
    [ 1.1, 2.38, 1.27, 1.07, 1.86, 1.3, 1.69, 1.14, 0 ],
];

// Risk Premium matrix — valores do HRC (vitoi.hrcz)
export const RP_MATRIX = [
    [ 0, 12, 10.5, 5.2, 11.8, 10.7, 11.6, 9.2, 12.1 ],
    [ 2.4, 0, 6.2, 1.8, 16.2, 7, 21.2, 3.5, 22.6 ],
    [ 4.8, 18, 0, 3.5, 17.6, 16, 17.3, 7.3, 18.1 ],
    [ 6.1, 9.6, 8.4, 0, 9.5, 8.6, 9.7, 7.2, 9.7 ],
    [ 2.8, 21.7, 7.4, 2.1, 0, 8.3, 17.3, 4.1, 21.8 ],
    [ 4.5, 18.5, 15.1, 3.3, 18.1, 0, 17.8, 6.8, 18.6 ],
    [ 3.1, 13.7, 8.2, 2.3, 20.7, 9.2, 0, 4.5, 21.4 ],
    [ 6.7, 14.6, 13, 4.6, 14.3, 13, 14.2, 0, 14.7 ],
    [ 2.3, 20.4, 5.9, 1.7, 15.1, 6.6, 12.9, 3.4, 0 ],
];

export const TABLE_PLAYERS = [
    { name: 'BTN', stack: '39.88', angle: -50, highlight: true },
    { name: 'SB', stack: '12.73', angle: -15, highlight: false },
    { name: 'BB', stack: '53.88', angle: 20, highlight: true },
    { name: 'UTG', stack: '9.25', angle: 60, highlight: false },
    { name: 'EP', stack: '52.24', angle: 100, highlight: false },
    { name: 'MP1', stack: '22.08', angle: 140, highlight: false },
    { name: 'MP2', stack: '6.88', angle: 180, highlight: false },
    { name: 'HJ', stack: '44.16', angle: 220, highlight: false },
    { name: 'CO', stack: '24.16', angle: 260, highlight: false },
];

// === SOTA VITOI: Âncora da Bolha (26 Left, 126 Entradas, ITM 23) ===
// RP menor que na FT (~14.2% vs ~22.6%) não é uma lei universal, mas um reflexo da topologia de prêmios:
// Do 23º ao 14º o prêmio é idêntico ($16.76). A ausência de payjumps contínuos dilui o valor da sobrevivência.
// Na FT (9 left), CADA eliminação garante um payjump direto, maximizando a concentração de Risk Premium.
export const BUBBLE_PLAYERS = [ 'P1', 'Short', 'P3', 'P4', 'ChipL', 'P6', 'Vice', 'P8' ];
export const BUBBLE_STACKS = [ 22.18, 19.21, 23.22, 22.77, 40, 20, 31.12, 26 ];

export const BUBBLE_BF_MATRIX = [
    [ 0, 1.531, 1.6687, 1.6678, 1.6928, 1.5648, 1.6822, 1.6741 ],
    [ 1.6185, 0, 1.6208, 1.6198, 1.6439, 1.6134, 1.634, 1.6261 ],
    [ 1.6332, 1.5058, 0, 1.6612, 1.7076, 1.5376, 1.6968, 1.6886 ],
    [ 1.6473, 1.5165, 1.6771, 0, 1.7013, 1.5492, 1.6906, 1.6825 ],
    [ 1.3163, 1.2616, 1.3369, 1.3279, 0, 1.2756, 1.5283, 1.3966 ],
    [ 1.6323, 1.5888, 1.6345, 1.6336, 1.6579, 0, 1.6478, 1.6399 ],
    [ 1.4406, 1.3585, 1.4722, 1.4583, 1.794, 1.3792, 0, 1.5657 ],
    [ 1.5539, 1.4455, 1.5963, 1.5776, 1.7426, 1.4727, 1.7312, 0 ]
];

// Derivação rigorosa via Malmuth-Harville: RP = ((BF - 1) / (2 * (BF + 1))) * 100
export const BUBBLE_RP_MATRIX = BUBBLE_BF_MATRIX.map( row =>
    row.map( bf => bf <= 0 ? 0 : Number( ( ( ( bf - 1 ) / ( 2 * ( bf + 1 ) ) ) * 100 ).toFixed( 2 ) ) )
);

// === SOTA VITOI: Âncora do Early Game (3ª Mão) ===
// RP residual flutuando entre 2.1% e 2.4% (BF médio de 1.09).
// Prova empírica de que o ICM existe desde a primeira mão.
// O verdadeiro carrasco aqui não é o ICM, mas o Sprint de Entropia:
// as Reverse Implied Odds (Pot Entrapment pós-flop) com stacks profundas (80bb).
export const EG_PLAYERS = [ 'UTG', 'EP', 'MP1', 'MP2', 'HJ', 'CO', 'BTN', 'SB', 'BB' ];
export const EG_STACKS = [ 80, 80, 80, 80, 80, 80, 80, 80, 80 ];

export const EG_BF_MATRIX = new Array( 9 ).fill( 0 ).map( ( _, i ) =>
    new Array( 9 ).fill( 0 ).map( ( _, j ) => ( i === j ? 0 : 1.09 ) )
);

export const EG_RP_MATRIX = EG_BF_MATRIX.map( row =>
    row.map( bf => bf <= 0 ? 0 : Number( ( ( ( bf - 1 ) / ( 2 * ( bf + 1 ) ) ) * 100 ).toFixed( 2 ) ) )
);
