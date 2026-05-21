import { create } from 'zustand';

// SOTA: Tipagem alinhada com a "Perspectiva Matemática" e "Axioma do Fold"
interface IcmMetrics {
    riskPremium: number;
    bubbleFactor: number;
    evFold: number; // Baseline dinâmico
    insolvencyCoefficient: number; // Ci (Coeficiente de Insolvência para Multiway)
}

interface IcmState {
    activeScenarioId: string | null;
    isSimulating: boolean;
    metrics: IcmMetrics;

    // Ações SOTA
    setActiveScenario: ( id: string ) => void;
    setSimulating: ( status: boolean ) => void;
    updateMetrics: ( metrics: Partial<IcmMetrics> ) => void;
}

export const useIcmStore = create<IcmState>( ( set ) => ( {
    activeScenarioId: null,
    isSimulating: false,
    metrics: {
        riskPremium: 0,
        bubbleFactor: 1,
        evFold: 0,
        insolvencyCoefficient: 1,
    },

    setActiveScenario: ( id ) => set( { activeScenarioId: id } ),
    setSimulating: ( status ) => set( { isSimulating: status } ),
    updateMetrics: ( newMetrics ) => set( ( state ) => ( {
        metrics: { ...state.metrics, ...newMetrics }
    } ) ),
} ) );
