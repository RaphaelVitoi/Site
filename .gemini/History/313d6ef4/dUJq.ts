import { describe, expect, it } from '@jest/globals';
import { GameState, MathEngine } from './MathEngine';

describe( 'MathEngine SOTA (Perspectiva Matemática)', () => {

    const baselineState: GameState = {
        stack_efetivo: 50,
        jogadores_ativos: 2,
        pot_odds_imediatas: 0.25, // 3:1 (25%)
        distancia_payjump: 'Longe',
        tempo_blinds_min: 10,
        edge_oponentes: 'Neutro',
        equity: 0.4,
        realization_factor: 0.8,
        valuation_stack: 100,
        rio_base: 0.1
    };

    describe( 'Equação 2.2: EV_fold Dinâmico', () => {
        it( 'deve computar o baseline de inanição (ChipEV)', () => {
            const ev = MathEngine.calculateEVFold( 10, 'Longe' );
            expect( ev ).toBe( -0.125 );
        } );

        it( 'deve adicionar utilidade passiva máxima na Bolha (Fold Positivo)', () => {
            const ev = MathEngine.calculateEVFold( 10, 'Bolha' );
            expect( ev ).toBe( 1.375 ); // -0.125 + 1.5
        } );

        it( 'deve forçar agressão matemática (t <= 3)', () => {
            const ev = MathEngine.calculateEVFold( 2, 'Longe' );
            expect( ev ).toBe( -0.625 ); // -0.125 - 0.5
        } );
    } );

    describe( 'Equação 2.3: Reverse Implied Odds Exponenciais (RIO_mw)', () => {
        it( 'deve manter o risco basal em embates Heads-Up', () => {
            const rio = MathEngine.calculateRIOMw( 2, 0.1 );
            expect( rio ).toBe( 0.1 );
        } );

        it( 'deve aplicar crescimento quadrático ao risco estrutural em Multiway (5-way)', () => {
            const rio = MathEngine.calculateRIOMw( 5, 0.1 );
            expect( rio ).toBe( 2.5 ); // 0.1 * (5^2)
        } );
    } );

    describe( 'Equação 2.4: Edge Relativa (E_r)', () => {
        it( 'deve anular vantagens cognitivas em sub-árvores curtas (Nash/Mecânico)', () => {
            const er = MathEngine.calculateEdgeRelativa( 1, 'Superior' );
            expect( er ).toBe( 0 ); // log10(1) * 1.5
        } );

        it( 'deve amplificar ganhos matemáticos perante Edge Superior (Stack = 100bb)', () => {
            const er = MathEngine.calculateEdgeRelativa( 100, 'Superior' );
            expect( er ).toBe( 3 ); // log10(100) * 1.5
        } );
    } );

    describe( 'Equação 2.1: Topologia Decisória (Integração)', () => {
        it( 'deve sentenciar "Mecânico (Nash)" perante escassez de Fichas (<= 12bb)', () => {
            const state: GameState = { ...baselineState, stack_efetivo: 10 };
            const result = MathEngine.simulate( state );
            expect( result.decisao ).toBe( 'Mecânico (Nash)' );
        } );

        it( 'deve garantir Imutabilidade Estrita (Side-Effect Free) durante a simulação', () => {
            const frozenState = Object.freeze( { ...baselineState } );
            expect( () => MathEngine.simulate( frozenState ) ).not.toThrow();
        } );

        it( 'deve aprovar agressão quando PM integrada for altamente solvente', () => {
            const solventState: GameState = {
                ...baselineState,
                equity: 0.7, // Equidade massiva reduz RIO e supera o Fold
                realization_factor: 1,
                edge_oponentes: 'Inferior'
            };
            const result = MathEngine.simulate( solventState );
            expect( result.decisao ).toBe( 'Solvente (Agressão)' );
        } );

        it( 'deve forçar "Insolvente (Fold)" e computar Custo de Abstenção', () => {
            const insolventeState: GameState = {
                ...baselineState,
                equity: 0.1, // Dominado
                jogadores_ativos: 6, // Passivo Multiway extremo
                edge_oponentes: 'Superior' // Desperdício de longo prazo
            };
            const result = MathEngine.simulate( insolventeState );
            expect( result.decisao ).toBe( 'Insolvente (Fold)' );
        } );
    } );
} );
