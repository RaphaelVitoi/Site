export class NashSolver {
    constructor() {
        // Baseline para Pot Size Bet (PSB)
        // Alpha (Bluff) = 33.3% | MDF (Defesa) = 50.0%
        this.BASELINE = {
            ALPHA: 33.33,
            MDF: 50.00
        };
    }

    /**
     * Calcula o equilíbrio ajustado pelo Risk Premium
     * @param {number} ipRp - Risk Premium do Agressor (IP)
     * @param {number} oopRp - Risk Premium do Defensor (OOP)
     */
    solve(ipRp, oopRp) {
        // Heurística de Ajuste ICM
        // 1. Defensor (OOP): Perde MDF drasticamente conforme seu RP sobe.
        //    Ganha leve incentivo de call se o IP estiver sob risco extremo (IP blefa menos).
        let defense = this.BASELINE.MDF - (oopRp * 1.4) + (ipRp * 0.2);

        // 2. Agressor (IP): Aumenta blefes se OOP estiver pressionado (exploit).
        //    Reduz blefes drasticamente se seu próprio RP for alto (preservação).
        let bluff = this.BASELINE.ALPHA + (oopRp * 1.0) - (ipRp * 1.1);

        // Clamping (Limites físicos de 0% a 100%)
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
            verdict: this._getVerdict(defense, bluff)
        };
    }

    _getVerdict(def, bluff) {
        if (def < 35) return "Overfold Massivo (Exploitável)";
        if (bluff < 20) return "Agressão Contida (Valor Puro)";
        if (bluff > 45) return "Overbluff (Punição de ICM)";
        return "Equilíbrio GTO Padrão";
    }
}