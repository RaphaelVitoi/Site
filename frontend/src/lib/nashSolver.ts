/**
 * SOTA Nash Equilibrium & Risk Premium Distortion Engine
 * Portado e refinado do repositório RaphaelVitoi/projetos sob governança de Raphael Vitoi
 *
 * Formalismo Matemático:
 * - MDF_ajustado = MDF_base - 1.4 * RP_OOP + 0.2 * RP_IP
 * - Alpha_ajustado = (Alpha_base + 1.0 * RP_OOP - 1.1 * RP_IP) * AgressionFactor
 * - Required Equity = Equity_ChipEV + RP_OOP
 *
 * @format
 */

export interface NashSolverBaseline {
	alpha: number; // Baseline Bluff Frequency (ex: 33.33% for Pot Size Bet)
	mdf: number; // Baseline Minimum Defense Frequency (ex: 50.00%)
	equity: number; // Baseline ChipEV Required Equity (ex: 33.33%)
}

export interface NashSolutionResult {
	defense: {
		value: number;
		delta: number;
		label: string;
	};
	bluff: {
		value: number;
		delta: number;
		label: string;
	};
	evDiff: {
		value: number;
		totalRequired: number;
		label: string;
	};
	verdict: string;
}

export interface HandSimulationDecision {
	action: 'CALL' | 'FOLD';
	margin: number;
	isClose: boolean;
	statusClass: string;
}

export class NashSolver {
	private readonly baseline: NashSolverBaseline = {
		alpha: 33.33,
		mdf: 50.0,
		equity: 33.33,
	};

	constructor(customBaseline?: Partial<NashSolverBaseline>) {
		if (customBaseline) {
			this.baseline = { ...this.baseline, ...customBaseline };
		}
	}

	/**
	 * Calcula o equilíbrio de Nash distorcido pelo Risk Premium de ambas as entidades (Agressor e Defensor)
	 * @param ipRp - Risk Premium do Agressor / In-Position (0% a 100%)
	 * @param oopRp - Risk Premium do Defensor / Out-of-Position (0% a 100%)
	 * @param agressionFactor - Fator de agressividade comportamental (0.5 a 3.0, padrão: 1.0)
	 */
	public solve(
		ipRp: number,
		oopRp: number,
		agressionFactor = 1.0
	): NashSolutionResult {
		const safeIpRp = Math.max(0, Number(ipRp) || 0);
		const safeOopRp = Math.max(0, Number(oopRp) || 0);
		const safeFactor = Math.max(0.1, Math.min(3.0, Number(agressionFactor) || 1.0));

		// Heurística Canônica de Ajuste ICM / Perspectiva Vitoi:
		// 1. Defesa (OOP): Perde MDF conforme seu RP sobe; ganha leve incentivo se IP estiver sob risco extremo
		let defense = this.baseline.mdf - safeOopRp * 1.4 + safeIpRp * 0.2;

		// 2. Blefe (IP): Aumenta blefes se OOP estiver pressionado; reduz se seu próprio RP for alto
		let bluff = (this.baseline.alpha + safeOopRp * 1.0 - safeIpRp * 1.1) * safeFactor;

		// 3. Equidade Necessária (ICM Shift)
		const requiredEquity = this.baseline.equity + safeOopRp;

		// Clamping [0.0, 100.0]
		defense = Math.max(0, Math.min(100, defense));
		bluff = Math.max(0, Math.min(100, bluff));

		const defVal = Number(defense.toFixed(2));
		const bluffVal = Number(bluff.toFixed(2));
		const reqEqVal = Number(requiredEquity.toFixed(2));

		return {
			defense: {
				value: defVal,
				delta: Number((defVal - this.baseline.mdf).toFixed(2)),
				label: 'MDF Ajustado (ICM)',
			},
			bluff: {
				value: bluffVal,
				delta: Number((bluffVal - this.baseline.alpha).toFixed(2)),
				label: 'Freq. Blefe Ótima',
			},
			evDiff: {
				value: Number((reqEqVal - this.baseline.equity).toFixed(2)),
				totalRequired: reqEqVal,
				label: 'EV Diff (Equity Shift)',
			},
			verdict: this.getVerdict(defVal, bluffVal),
		};
	}

	/**
	 * Avalia o veredito tático do ponto de equilíbrio
	 */
	public getVerdict(defense: number, bluff: number): string {
		if (defense < 35) return 'Overfold Estrutural (Exploitável)';
		if (bluff < 20) return 'Agressão Contida (Valor Puro / Sobrevivência)';
		if (bluff > 45) return 'Overbluff Agressivo (Punição de ICM)';
		return 'Equilíbrio GTO Padrão';
	}

	/**
	 * Simula a decisão ótima para uma mão específica comparando equidade bruta contra ICM
	 */
	public simulateHand(handEquity: number, requiredEquity: number): HandSimulationDecision {
		const diff = handEquity - requiredEquity;
		const isCall = diff >= 0;

		return {
			action: isCall ? 'CALL' : 'FOLD',
			margin: Number(Math.abs(diff).toFixed(2)),
			isClose: Math.abs(diff) < 2.0,
			statusClass: isCall ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold',
		};
	}
}

/**
 * Instância canônica exportada para uso no frontend
 */
export const defaultNashSolver = new NashSolver();
