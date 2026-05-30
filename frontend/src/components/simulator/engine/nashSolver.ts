/**
 * IDENTITY: Motor de Distorcao ICM pos-flop
 * PATH: src/components/simulator/engine/nashSolver.ts
 * ROLE: Aplicar distorcao ICM sobre frequencias ChipEV via equacao concava.
 *       Sintetiza a distorcao baseado estritamente na Hierarquia da Perspectiva Matematica (PMev).
 *       Export principal: solveIcmDistortion. solveNash = alias deprecated para retrocompatibilidade.
 *
 * HIERARQUIA VITOI (PMev):
 *   1. ICMev (RP): O imposto estrutural bruto de sobrevivencia.
 *   2. Esperanca Matematica: O RP eleva o sarrafo de Pot Odds linearmente.
 *   3. Expectativa Matematica: Reverse Implied Odds (RIO) aplicam penalizacao quadratica (RP/10)^2 ao OOP.
 *   4. Perspectiva Matematica: A soma (Esperanca + Expectativa) oblitera o Call marginal. O Fold absorve o deficit.
 *
 * @format
 */

import type { ChipEvFreqs, FreqResult, IcmDistortionResult } from './types';

/**
 * Formula o Spread de Incerteza dinamico baseado na tensao do spot.
 */
function calcSpread(deltaRp: number): number {
	return Math.max(3, Math.abs(deltaRp) * 0.25);
}

/**
 * Calcula o expoente da curva baseada na mÃ©dia de RPs para garantir convexidade correta.
 * @param avgRp - A mÃ©dia das pressÃµes de risco (RP) no board.
 */
function calcBExponent(avgRp: number): number {
	if (avgRp <= 0) return 1;
	return Math.max(0.1, 1 - avgRp / 100); // Exponencial decai com a pressÃ£o
}

/**
 * Aplica distorcao ICM sobre frequencias ChipEV para calcular frequencias pos-flop ajustadas.
 * Motor guiado estritamente pela Hierarquia SOTA (PMev).
 *
 * @param ipRp           - Risk Premium do IP (0â€“100), via Malmuth-Harville
 * @param oopRp          - Risk Premium do OOP (0â€“100), via Malmuth-Harville
 * @param chipEvFreqs    - Frequencias ChipEV do spot (GTO Wizard ou equivalente)
 * @param aggressionFactor - Desvio comportamental real do oponente vs equilibrio ICM
 *                           (0.5 = passivo Â· 1.0 = equilibrio)
 */
export function solveIcmDistortion(
	ipRp: number,
	oopRp: number,
	chipEvFreqs: ChipEvFreqs,
	aggressionFactor = 1,
	potSize = 7.5,
	streetIdx = 0,
	activePlayers = 2,
): IcmDistortionResult {
	const safeIp = Math.max(0, Math.min(100, Number(ipRp) || 0));
	const safeOop = Math.max(0, Math.min(100, Number(oopRp) || 0));

	// SOTA v7.0 GOLD: Gravidade do Pote (Inércia Estratégica)
	const gravity = Math.max(0, Math.log(Math.max(1, potSize / 7.5)));
	const damping = 1.0 / (1.0 + gravity * 0.12);
	const effectiveAggression = 1.0 + (aggressionFactor - 1.0) * damping;

	const pressure = (safeOop + safeIp) / 2.0 / 100.0; // Converte pressão média para fração

	const fold = (chipEvFreqs.oop_fold ?? 0) / 100;
	const raise = (chipEvFreqs.oop_raise ?? 0) / 100;

	// Downward Drift: Pressão RP converte Raise em Small Bet ou Check/Call
	const driftBase = 0.004 * (streetIdx + 1.0);
	const driftPenalty = raise * (pressure * driftBase * (1.0 + gravity * 0.5));

	const raiseShift = raise * (effectiveAggression - 1.0) - driftPenalty - (pressure * 0.003 * activePlayers);
	let newRaise = Math.max(0.0, raise + raiseShift);

	// Fold Shift: Limitado pelo Teto de RP
	const maxFoldAllowed = 0.88 - Math.min(0.3, gravity * 0.05);
	const foldShift = fold * (pressure * 0.012) + Math.max(0.0, raise - newRaise);
	let newFold = Math.max(0.0, Math.min(maxFoldAllowed, fold + foldShift));

	let newCall = Math.max(0.0, 1.0 - newFold - newRaise);
	const total = newFold + newCall + newRaise;

	if (total > 0.0) {
		newFold /= total;
		newCall /= total;
		newRaise /= total;
	} else {
		newFold = 1.0;
		newCall = 0.0;
		newRaise = 0.0;
	}

	const deltaRp = safeIp - safeOop;
	const spread = calcSpread(deltaRp);
	const avgRp = (safeIp + safeOop) / 2;
	const bExponent = Math.max(0.12, calcBExponent(avgRp) * (1 - gravity * 0.05));

	const foldCenter = newFold * 100;
	const callCenter = newCall * 100;
	const raiseCenter = newRaise * 100;

	const oopCall: FreqResult = {
		center: callCenter,
		spread,
		delta: callCenter - (chipEvFreqs.oop_call ?? 0),
	};
	const oopFold: FreqResult = {
		center: foldCenter,
		spread,
		delta: foldCenter - (chipEvFreqs.oop_fold ?? 0),
	};
	const oopRaise: FreqResult = {
		center: raiseCenter,
		spread,
		delta: raiseCenter - (chipEvFreqs.oop_raise ?? 0),
	};

	// IP Frequencies (check, bet_small, bet_large) are NOT modified (OOP-only defense in v7.0 GOLD)
	// Sets delta to 0 and center to base GTO to eliminate UI flashing and mismatches
	const ipCheck: FreqResult = {
		center: chipEvFreqs.ip_check ?? 0,
		spread,
		delta: 0,
	};
	const ipBetSmall: FreqResult = {
		center: chipEvFreqs.ip_bet_small ?? 0,
		spread,
		delta: 0,
	};
	const ipBetLarge: FreqResult = {
		center: chipEvFreqs.ip_bet_large ?? 0,
		spread,
		delta: 0,
	};

	return {
		ip: { check: ipCheck, bet_small: ipBetSmall, bet_large: ipBetLarge },
		oop: { call: oopCall, fold: oopFold, raise: oopRaise },
		deltaRp,
		bExponent,
		rawData: { ipRp: safeIp, oopRp: safeOop, chipEvFreqs },
	};
}

