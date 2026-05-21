/// <reference types="jest" />

import {
    calculateMapaICM,
    calculatePerspectivaVitoi,
    PerspectivaInput
} from '../../lib/perspectiva';

describe( 'calculateMapaICM', () => {
    it( 'should correctly calculate position probabilities and equities for a simple 2-player scenario', () => {
        const stacks = [ 1000, 1000 ];
        const prizes = [ 100, 50 ];
        const result = calculateMapaICM( stacks, prizes );

        expect( result.positionProbs[ 0 ][ 0 ] ).toBeCloseTo( 0.5 );
        expect( result.equities[ 0 ] ).toBeCloseTo( 75 );
    } );

    it( 'should handle players with zero stack', () => {
        const stacks = [ 1000, 0, 2000 ];
        const prizes = [ 100, 50, 25 ];
        const result = calculateMapaICM( stacks, prizes );

        expect( result.equities[ 1 ] ).toBe( 0 );
    } );
} );

describe( 'calculatePerspectivaVitoi - Validação de Teoremas SOTA (D1 a D6)', () => {
    const baseInput: PerspectivaInput = {
        stacks: [ 1000, 1000, 1000, 1000 ],
        prizes: [ 1000, 500, 250, 0 ],
        heroIdx: 0,
        villainIdx: 1,
        potSize: 200,
        heroCost: 100,
        winProb: 0.5,
        realizationFactor: 1,
        edgeBase: 1,
        numPlayersInPot: 2,
    };

    it( 'Teorema D1: EV_fold dinâmico cruza para positivo (Laddering) com payjump iminente', () => {
        const resNormal = calculatePerspectivaVitoi( { ...baseInput, isNearPayjump: false } );
        const resPayjump = calculatePerspectivaVitoi( { ...baseInput, isNearPayjump: true } );

        expect( resPayjump.dynamicEvFold ).toBeGreaterThan( resNormal.dynamicEvFold );
        expect( resPayjump.dynamicEvFold ).toBeGreaterThan( 0 ); // Garante que foi positividado pelo bônus
    } );

    it( 'Teorema D2 e D3: RIO Multiway escala exponencialmente e derruba Ci (Coeficiente de Insolvência)', () => {
        const resHU = calculatePerspectivaVitoi( { ...baseInput, numPlayersInPot: 2 } );
        const resMW3 = calculatePerspectivaVitoi( { ...baseInput, numPlayersInPot: 3 } );
        const resMW4 = calculatePerspectivaVitoi( { ...baseInput, numPlayersInPot: 4 } );

        // Penalidade RIO cresce com N
        expect( resHU.rioLiability ).toBe( 0 );
        expect( resMW3.rioLiability ).toBeGreaterThan( 0 );
        expect( resMW4.rioLiability ).toBeGreaterThan( resMW3.rioLiability );

        // Coeficiente de Insolvência é esmagado pelo RIO
        expect( resMW4.ci ).toBeLessThan( resHU.ci );

        // Diagnóstico acusa o colapso
        expect( resMW4.diagnostico ).toContain( 'Colapso Multiway' );
    } );

    it( 'Teorema D4: Amortização de Edge com poda de árvore via proxy SPR', () => {
        const resDeep = calculatePerspectivaVitoi( { ...baseInput, spr: 20 } as any );
        const resShort = calculatePerspectivaVitoi( { ...baseInput, spr: 1 } as any );

        // Edge com SPR 1 (Push/Fold binário) deve ser estritamente menor que Edge Deep
        expect( resShort.amortizedEdge ).toBeLessThan( resDeep.amortizedEdge );
    } );

    it( 'Teorema D6: Alerta de Pot Entrapment Severo', () => {
        const resNormal = calculatePerspectivaVitoi( { ...baseInput, investidoAcumulado: 50 } as any );
        expect( resNormal.diagnostico ).not.toContain( 'Pot Entrapment Severo' );

        // Investimento > 30% do stack gera aprisionamento sistêmico
        const resEntrapment = calculatePerspectivaVitoi( { ...baseInput, investidoAcumulado: 350 } as any );
        expect( resEntrapment.diagnostico ).toContain( 'Pot Entrapment Severo' );
    } );
} );
