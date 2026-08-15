/**
 * SOTA Nash Equilibrium & High-Stakes Risk Premium Distortion Engine
 * Portado e calibrado sob governança de Raphael Vitoi para cenários de MTT High Stakes & Final Tables
 *
 * Formalismo Matemático Estendido:
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
	asymmetryScore: number;
	zoneCategory: 'NORMAL' | 'ELEVATED' | 'HIGH_STAKES_FT' | 'EXTREME_PARALYSIS';
}

export interface HandSimulationDecision {
	action: 'CALL' | 'FOLD';
	margin: number;
	isClose: boolean;
	statusClass: string;
}

export interface HighStakesPreset {
	id: string;
	label: string;
	description: string;
	ipRp: number;
	oopRp: number;
	aggression: number;
}

export const HIGH_STAKES_PRESETS: HighStakesPreset[] = [
	{
		id: 'standard-bubble',
		label: 'Bolha Padrão MTT (15% Field)',
		description: 'Pressão moderada de eliminação próxima aos prêmios',
		ipRp: 12.0,
		oopRp: 22.0,
		aggression: 1.0,
	},
	{
		id: 'ft-3way-highstakes',
		label: 'Mesa Final 3-Handed High Stakes',
		description: 'Degraus exponenciais de premiação e stacks assimétricos',
		ipRp: 35.0,
		oopRp: 65.0,
		aggression: 1.25,
	},
	{
		id: 'monster-payjump-ladder',
		label: 'Ladder Extremo / Monster Pay Jump',
		description: 'Pulo de premiação crítico (ex: $500k de diferença entre 2º e 3º)',
		ipRp: 45.0,
		oopRp: 78.0,
		aggression: 1.6,
	},
	{
		id: 'cl-vs-short-punishment',
		label: 'Chip Leader vs Short Stack',
		description: 'Cobertura assimétrica com máxima punição de ICM sobre o vilão',
		ipRp: 5.0,
		oopRp: 72.0,
		aggression: 1.85,
	},
];

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
	 * Calcula o equilíbrio de Nash distorcido pelo Risk Premium em cenários normais e High Stakes (0% a 80%+)
	 * @param ipRp - Risk Premium do Agressor (0% a 80%)
	 * @param oopRp - Risk Premium do Defensor (0% a 80%)
	 * @param agressionFactor - Fator de agressividade comportamental (0.2x a 3.5x, padrão: 1.0)
	 */
	public solve(
		ipRp: number,
		oopRp: number,
		agressionFactor = 1.0
	): NashSolutionResult {
		const safeIpRp = Math.max(0, Math.min(90, Number(ipRp) || 0));
		const safeOopRp = Math.max(0, Math.min(90, Number(oopRp) || 0));
		const safeFactor = Math.max(0.1, Math.min(4.0, Number(agressionFactor) || 1.0));

		// 1. Defesa (OOP): Perde MDF severamente conforme seu RP sobe; leve recuperação se IP arriscar eliminação
		let defense = this.baseline.mdf - safeOopRp * 1.4 + safeIpRp * 0.2;

		// 2. Blefe (IP): Aumenta blefes exploratórios quando OOP está sob risco extremo
		let bluff = (this.baseline.alpha + safeOopRp * 1.0 - safeIpRp * 1.1) * safeFactor;

		// 3. Equidade Necessária (ICM Shift Total)
		const requiredEquity = this.baseline.equity + safeOopRp;

		// Clamping físico [0.0%, 100.0%]
		defense = Math.max(0, Math.min(100, defense));
		bluff = Math.max(0, Math.min(100, bluff));

		const defVal = Number(defense.toFixed(2));
		const bluffVal = Number(bluff.toFixed(2));
		const reqEqVal = Number(requiredEquity.toFixed(2));
		const asymmetry = Number((safeOopRp - safeIpRp).toFixed(2));

		let zone: 'NORMAL' | 'ELEVATED' | 'HIGH_STAKES_FT' | 'EXTREME_PARALYSIS' = 'NORMAL';
		if (safeOopRp >= 65 || safeIpRp >= 45) {
			zone = 'EXTREME_PARALYSIS';
		} else if (safeOopRp >= 40 || safeIpRp >= 30) {
			zone = 'HIGH_STAKES_FT';
		} else if (safeOopRp >= 20 || safeIpRp >= 15) {
			zone = 'ELEVATED';
		}

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
				label: 'EV Diff (Shift de Equidade)',
			},
			verdict: this.getVerdict(defVal, bluffVal, safeOopRp, safeIpRp),
			asymmetryScore: asymmetry,
			zoneCategory: zone,
		};
	}

	/**
	 * Avalia o veredito tático com granularidade para High Stakes e FTs
	 */
	public getVerdict(defense: number, bluff: number, oopRp: number, ipRp: number): string {
		if (oopRp >= 60 && defense <= 15) return '🚨 Paralisia Crítica de MDF (Overfold Extremo / ICM Nuclear)';
		if (oopRp - ipRp >= 40) return '⚡ Assimetria Máxima de Risco (Vantagem Absoluta de Cobertura)';
		if (ipRp >= 40 && bluff <= 10) return '🛡️ Preservação Extrema de ICM (Agressão Contida / Sobrevivência)';
		if (defense < 30) return 'Overfold Estrutural (Exploitável)';
		if (bluff > 55) return '🔥 Overbluff Agressivo (Punição Massiva de ICM)';
		if (bluff < 20) return 'Agressão Contida (Valor Puro)';
		return 'Equilíbrio GTO Padrão';
	}

	/**
	 * Simula a decisão ótima para uma mão específica
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

export const defaultNashSolver = new NashSolver();
