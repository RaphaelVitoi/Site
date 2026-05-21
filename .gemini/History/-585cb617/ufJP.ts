/**
 * IDENTITY: Nash Solver Engine SOTA
 * PATH: src/lib/NashSolver.ts
 * ROLE: Coração Matemático do MasterSimulator. Calcula os impactos do Risk Premium nas ranges.
 */

export interface SolutionMetric {
    value: string;
    delta: string;
    label: string;
    totalRequired?: string;
}

export interface NashSolution {
    defense: SolutionMetric;
    bluff: SolutionMetric;
    evDiff: SolutionMetric;
    verdict: string;
}

export interface HandSimulation {
    action: 'CALL' | 'FOLD';
    margin: string;
    isClose: boolean;
    statusClass: 'status-positive' | 'status-negative';
}

export class NashSolver {
    private readonly BASELINE = {
        ALPHA: 33.33,
        MDF: 50.00,
        EQUITY: 33.33
    };

    /**
     * Calcula o equilíbrio ajustado pelo Risk Premium
     */
    public solve(ipRp: number, oopRp: number, agressionFactor: number = 1.0): NashSolution {
        // Sanitização extrema de Inputs
        const safeIpRp = Math.max(0, Number(ipRp) || 0);
        const safeOopRp = Math.max(0, Number(oopRp) || 0);
        const safeFactor = Math.max(0.1, Math.min(3.0, Number(agressionFactor) || 1.0));

        // Heurística de Ajuste ICM
        let defense = this.BASELINE.MDF - (safeOopRp * 1.4) + (safeIpRp * 0.2);
        let bluff = this.BASELINE.ALPHA + (safeOopRp * 1.0) - (safeIpRp * 1.1);

        // Modulação Comportamental
        bluff = bluff * safeFactor;

        // EV Diff (A conta final de sobrevivência)
        const requiredEquity = this.BASELINE.EQUITY + safeOopRp;

        // Clamping (Assegura as Leis da Física/Matemática: 0 a 100%)
        defense = Math.max(0, Math.min(100, defense));
        bluff = Math.max(0, Math.min(100, bluff));

        return {
            defense: {
                value: defense.toFixed(1),
                delta: (defense - this.BASELINE.MDF).toFixed(1),
                label: "MDF Ajustado"
            },
            bluff: {
                value: bluff.toFixed(1),
                delta: (bluff - this.BASELINE.ALPHA).toFixed(1),
                label: "Freq. Bluff Ótima"
            },
            evDiff: {
                value: (requiredEquity - this.BASELINE.EQUITY).toFixed(1),
                totalRequired: requiredEquity.toFixed(1),
                label: "EV Diff (Equity Shift)"
            },
            verdict: this._getVerdict(defense, bluff)
        };
    }

    private _getVerdict(def: number, bluff: number): string {
        if (def < 35) return "Overfold Massivo (Exploitável)";
        if (bluff < 20) return "Agressão Contida (Valor Puro)";
        if (bluff > 45) return "Overbluff (Punição de ICM)";
        return "Equilíbrio GTO Padrão";
    }

    /**
     * Simula a decisão para uma mão específica
     */
    public simulateHand(handEquity: number, requiredEquity: number): HandSimulation {
        const diff = handEquity - requiredEquity;
        const isCall = diff >= 0;

        return {
            action: isCall ? "CALL" : "FOLD",
            margin: Math.abs(diff).toFixed(1),
            isClose: Math.abs(diff) < 2.0, // Margem de erro SOTA ajustada
            statusClass: isCall ? "status-positive" : "status-negative"
        };
    }
}

// Exportação Singleton: Garante que apenas uma instância exista na memória do React
export const icmSolver = new NashSolver();