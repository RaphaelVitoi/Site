/**
 * Motor Matemático SOTA (Perspectiva Matemática vs Pot Odds)
 * Implementação estrita das equações definidas no PRD_icm_toy.md e SPEC_icm_toy.md.
 *
 * Transmuta a heurística falha de Pot Odds para a realidade dinâmica de Sistemas Complexos.
 */

export type DistanciaPayjump = 'Longe' | 'Moderado' | 'Bolha' | 'FT';
export type EdgeOponentes = 'Superior' | 'Neutro' | 'Inferior';

export interface GameState {
    readonly stack_efetivo: number;        // Profundidade do stack em BBs (ex: 10 a 100)
    readonly jogadores_ativos: number;     // De 2 (HU) a 9 (MW massivo)
    readonly pot_odds_imediatas: number;   // Razão imediata (ex: 0.20 para 4:1)
    readonly distancia_payjump: DistanciaPayjump;
    readonly tempo_blinds_min: number;     // Erosão por inanição
    readonly edge_oponentes: EdgeOponentes;

    // Parâmetros internos providos pelo simulador (baseline)
    readonly equity: number;               // Equidade bruta da mão (0.0 a 1.0)
    readonly realization_factor: number;   // R: Fator de Realização (ex: 0.8)
    readonly valuation_stack: number;      // Peso em $ do stack
    readonly rio_base: number;             // Passivo basal por colisão (ex: 0.1 BB)
}

export interface PerspectiveResult {
    ev_fold_dinamico: number;     // Baseline Móvel
    rio_mw: number;               // Passivo Estrutural
    pm_integrada: number;         // A Métrica Soberana
    coeficiente_insolvencia: number; // C_i = Pot_Odds / PM
    edge_relativa: number;        // Er
    decisao: 'Solvente (Agressão)' | 'Mecânico (Nash)' | 'Insolvente (Fold)';
    abstencao_ev: number;         // Custo de abstenção
}

export class MathEngine {
    // Axioma de Piso: O fold custa os antes em ChipEV
    private static readonly BASE_ANTE = 0.125;

    // Despacho Estático O(1) para redução de complexidade ciclomática
    private static readonly PAYJUMP_MULTIPLIER: Record<DistanciaPayjump, number> = {
        'Bolha': 1.5,     // Passar a vez gera lucro por eliminação alheia
        'FT': 0.8,
        'Moderado': 0.2,
        'Longe': 0.0
    };

    /**
     * Equação 2.2: EV_fold Dinâmico (Baseline Móvel)
     * Ajusta o peso da abstenção baseado na proximidade da bolha (payjump)
     * e na erosão do tempo (inanição).
     */
    public static calculateEVFold ( t: number, dpj: DistanciaPayjump ): number {
        let evFold = -this.BASE_ANTE + this.PAYJUMP_MULTIPLIER[ dpj ];

        // Erosão Antecipada (t-3): Subtrai utilidade pela iminência do aumento dos blinds
        if ( t <= 3 )
        {
            evFold -= 0.5; // Agrava o EV do fold, forçando agressão matemática
        }

        return evFold;
    }

    /**
     * Equação 2.3: Reverse Implied Odds Exponencial (RIO_mw)
     * O passivo de acertar a 2ª melhor mão explode em potes Multiway.
     */
    public static calculateRIOMw ( jogadores_ativos: number, rio_base: number ): number {
        if ( jogadores_ativos <= 2 ) return rio_base;
        return rio_base * Math.pow( jogadores_ativos, 2 );
    }

    /**
     * Equação 2.4: Edge Relativa (E_r)
     * Amortização da Edge pela falta de profundidade da árvore (Stack curto).
     */
    public static calculateEdgeRelativa ( stack: number, edge: EdgeOponentes ): number {
        let sigma_delta = 1;
        if ( edge === 'Superior' )
        {
            sigma_delta = 1.5;
        } else if ( edge === 'Inferior' )
        {
            sigma_delta = 0.7;
        }
        // Crescimento logarítmico: A edge só se manifesta em stacks profundos
        return sigma_delta * Math.log10( Math.max( stack, 1 ) );
    }

    /**
     * Fluxo de Execução Principal (Equação 2.1)
     * Processa a sobreposição da Perspectiva Matemática contra as Pot Odds ilusórias.
     */
    public static simulate ( state: GameState ): PerspectiveResult {
        const ev_fold = this.calculateEVFold( state.tempo_blinds_min, state.distancia_payjump );
        const rio_mw = this.calculateRIOMw( state.jogadores_ativos, state.rio_base );
        const er = this.calculateEdgeRelativa( state.stack_efetivo, state.edge_oponentes );

        // [ (Equity * R) * Valuation_stack ] - [ EV_fold + RIO_mw ]
        const esperanca = ( state.equity * state.realization_factor ) * state.valuation_stack;
        const pm_base = esperanca - ( ev_fold + rio_mw );

        // Filtro Final: Multiplicador de Abstenção/Extração
        const pm_integrada = pm_base * er;

        // Coeficiente de Insolvência (C_i): Mede a validade das Pot Odds
        const c_i = pm_integrada > 0 ? state.pot_odds_imediatas / pm_integrada : -1;

        // Classificador de Decisão Topológica
        const is_mecanico = state.stack_efetivo <= 12; // Poda da Árvore de Decisão

        let decisao: 'Solvente (Agressão)' | 'Mecânico (Nash)' | 'Insolvente (Fold)';
        if ( is_mecanico )
        {
            decisao = 'Mecânico (Nash)';
        } else if ( c_i >= 1 )
        {
            decisao = 'Solvente (Agressão)';
        } else
        {
            decisao = 'Insolvente (Fold)';
        }

        const abstencao_ev = ( decisao === 'Insolvente (Fold)' && er > 1.2 && pm_integrada > 0 ) ? pm_integrada : 0;

        return { ev_fold_dinamico: ev_fold, rio_mw, pm_integrada, coeficiente_insolvencia: c_i, edge_relativa: er, decisao, abstencao_ev };
    }
}
