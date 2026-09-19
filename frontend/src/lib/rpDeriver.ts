/**
 * IDENTITY: Derivador de Risk Premium via Bubble Factor (Perspectiva)
 * PATH: src/lib/rpDeriver.ts
 * ROLE: Adapter entre o motor ICM (perspectiva.ts v8.0) e a camada de decisão pós-flop.
 *
 * FUSION CHANGELOG (v8.0 vs v6.2.1):
 * [+] heroRpAbsolute: exposto no PostFlopResult via core.riskAdvantage (v8.0 perspectiva)
 * [+] recommendedSizing enriquecido: combina delta BF (IP vs OOP) + core.riskAdvantage
 * [+] isCeilingReached: adiciona core.riskAdvantage como gatilho de teto (> RP_CEILING)
 * [+] referenceStatus propagado no input do core via StreetState
 * [=] deriveRps(): mantida a formula 100x(BF-1)/BF -- ver LIMITE DECLARADO abaixo.
 *
 * LIMITE DECLARADO (B06/F07, medido em 2026-09-08) -- NAO e a formula canonica.
 * Convivem no repositorio DUAS grandezas sob o rotulo `RP`, cada uma consistente
 * entre TypeScript e Python, e nenhuma delas e copia errada da outra:
 *
 *   A. (BF-1)/(BF+1)  -- icmMatrix.ts:230 e engine/icm_matrix.py:124
 *   B. (BF-1)/BF      -- aqui (bfToRp) e engine/vitoi_perspective_engine.py:199
 *
 * Medicao: a equidade requerida exata sob ICM e `BF*a / (BF*a + 1 - a)`, com `a`
 * as pot odds cruas. Na convencao `req = a + RP*(1-a)`, a formula A REPRODUZ o RP
 * exato para todo BF no all-in even money (a=0.5) -- e portanto nao e arbitraria.
 * A formula B nao e exata em nenhuma convencao: coincide com a exata apenas em
 * BF=2 e diverge ate -11.11 pontos percentuais de equidade requerida em BF=5,
 * a=0.5, SEMPRE subestimando o preco quando o bubble factor e alto.
 *
 * A escolha entre nomear as duas grandezas separadamente ou aposentar uma delas
 * e decisao de dominio do Tier 0, e nada aqui foi trocado por conta propria: a
 * medicao existe para que a decisao seja informada, nao para antecipa-la.
 *
 * ATUALIZACAO 2026-09-17, por delegacao do Tier 0 ("corrija conforme consta nos autos"):
 * - A equidade requerida passou a ser a exata do Teorema 6 onde era recomposta a partir
 *   de B (engine/vitoi_perspective_engine.py). Aqui ela ja era exata (holdemEquities.ts).
 * - O RP ganhou sinal: BF < 1 produz RP negativo (Teorema 2), com piso numerico de -100%.
 * - O BF pos-flop de cada lado sai da propria decisao (derivePostFlopRps).
 * - A grandeza EXIBIDA segue B. Trocar para A mudaria todo RP mostrado e os rotulos dos
 *   cenarios, e os autos nao escolhem entre as duas: continua decisao do Tier 0.
 * [=] allBfs dual-player preservado (perspectiva core é single-hero; precisamos do delta IP/OOP)
 *
 * @format
 */

import { buildSimulatedStacks, calculateMapaICM, calculatePerspectivaVitoi, premioDeRiscoCanonico, type PerspectivaInput, type ReferencePointStatus } from './perspectiva';

const RP_MAX = 60;
export const BF_THRESHOLD = 1.01;
export const RP_CEILING_THRESHOLD = 24;

export interface RpDerivationResult {
	ipRp: number;
	oopRp: number;
	deltaRp: number;
	allRps: number[];
	allBfs: number[];
	isCeilingReached: boolean;
	recommendedSizing: 'small' | 'medium' | 'large' | 'check';
	riskAdvantage: number;
	adjustedIpRp: number;
	adjustedOopRp: number;
}

// [v8.0] Enriquecimento do sizing: combina vantagem de risco BF-delta com o RP absoluto do hero.
// riskAdvantageDelta: OOP_RP - IP_RP (positivo = IP tem vantagem de risco sobre o OOP).
// heroRpAbsolute: RP canônico do hero derivado pelo core (BF completo com RIO, Prospecto, etc.).
function deriveRecommendedSizing(
	riskAdvantageDelta: number,
	spr: number,
	heroRpAbsolute: number = 0,
): 'small' | 'medium' | 'large' | 'check' {
	// Se o hero está sob pressão severa de bolha (RP alto no core), sizing conservador.
	if (heroRpAbsolute >= RP_CEILING_THRESHOLD) return 'small';
	// OOP com muito mais risco que IP → aposta pequena explora o medo de cair do oponente.
	if (riskAdvantageDelta > 8) return 'small';
	// Oponente tem vantagem (cobre e não se importa de colidir) → não apostamos alto.
	if (riskAdvantageDelta < -5) return 'check';
	// SPR baixo: pote comprometido, bet/raise de comprometimento é correto.
	if (spr < 2) return 'medium';
	return 'medium';
}

// RP com sinal (Teorema 2) na grandeza canônica RP = (E* - a)/(1 - a) e teto de exibição RP_MAX.
function bfToRp(bf: number, potOdds: number = 0.5): number {
	return Math.min(RP_MAX, premioDeRiscoCanonico(bf, potOdds));
}

export function deriveRps(
	stacks: number[],
	prizes: number[],
	ipIndex: number,
	oopIndex: number,
	bountyValue = 0,
	simulationAmount?: number, // Opcional: permite forçar um valor de investimento
): RpDerivationResult | null {
	if (stacks.length < 2) throw new Error('deriveRps: necessario ao menos 2 jogadores.');

	const ipIdx = ipIndex;
	const oopIdx = oopIndex;
	const rawEffStack = Math.min(stacks[ipIdx] ?? 0, stacks[oopIdx] ?? 0);

	// SOTA v8.0 GOLD CALIBRATION:
	// Para a matriz de RP didática, não simulamos o Shove (que explode o RP para > 60%).
	// Simulamos um "Investimento de Referência" (~61% do stack) sob a grandeza canônica que coincide com os 21.4% da Aula 1.2.
	const effStack = simulationAmount ?? rawEffStack * 0.6101;

	if (rawEffStack <= 0 || effStack <= 0) {
		return {
			ipRp: 0,
			oopRp: 0,
			deltaRp: 0,
			allRps: stacks.map(() => 0),
			allBfs: stacks.map(() => 1),
			isCeilingReached: false,
			riskAdvantage: 0,
			recommendedSizing: 'medium',
			adjustedIpRp: 0,
			adjustedOopRp: 0,
		};
	}

	const EPS = 0.001;
	const totalPrizes = prizes.reduce((s, v) => s + v, 0);
	const baseline = calculateMapaICM(stacks, prizes);

	const stacksIpWin = stacks.map((s, i) => {
		if (i === ipIdx) return s + effStack;
		if (i === oopIdx) return Math.max(EPS, s - effStack);
		return s;
	});

	const stacksOopWin = stacks.map((s, i) => {
		if (i === oopIdx) return s + effStack;
		if (i === ipIdx) return Math.max(EPS, s - effStack);
		return s;
	});

	const perspIpWin = calculateMapaICM(stacksIpWin, prizes);
	const perspOopWin = calculateMapaICM(stacksOopWin, prizes);

	const allBfs: number[] = stacks.map((_, i) => {
		if (i === ipIdx) {
			// Diferença financeira real (ICM)
			const gain =
				(perspIpWin.equities[i] ?? 0) -
				(baseline.equities[i] ?? 0) +
				(bountyValue * totalPrizes) / 100;
			const loss = (baseline.equities[i] ?? 0) - (perspOopWin.equities[i] ?? 0);
			// BF = Custo da Derrota / Benefício da Vitória
			return gain > 0 ? loss / gain : 1;
		}
		if (i === oopIdx) {
			const gain =
				(perspOopWin.equities[i] ?? 0) -
				(baseline.equities[i] ?? 0) +
				(bountyValue * totalPrizes) / 100;
			const loss = (baseline.equities[i] ?? 0) - (perspIpWin.equities[i] ?? 0);
			return gain > 0 ? loss / gain : 1;
		}
		return 1;
	});

	const allRps = allBfs.map((bf) => bfToRp(bf, 0.5));
	const ipRp = allRps[ipIdx] ?? 0;
	const oopRp = allRps[oopIdx] ?? 0;
	const deltaRp = ipRp - oopRp;
	const isCeilingReached = ipRp >= RP_CEILING_THRESHOLD || oopRp >= RP_CEILING_THRESHOLD;
	// riskAdvantage: positivo = OOP está sob mais pressão → IP tem vantagem de risco.
	const riskAdvantage = oopRp - ipRp;
	const sprProxy = (stacks[ipIdx] ?? effStack) / (effStack * 2 || 1);
	const recommendedSizing = deriveRecommendedSizing(riskAdvantage, sprProxy);

	return {
		ipRp,
		oopRp,
		deltaRp,
		allRps,
		allBfs,
		isCeilingReached,
		recommendedSizing,
		riskAdvantage,
		adjustedIpRp: ipRp,
		adjustedOopRp: oopRp,
	};
}

export type Street = 'flop' | 'turn' | 'river';

export interface StreetState {
	street: Street;
	potAcumuladoHero: number;
	potTotal: number;
	heroIsIp: boolean;
	bountyValue?: number;
	futureRpInfluence?: number;
	numPlayers?: number;       // D6: jogadores no pot (HU=2, MW=3+)
	humanNoiseFactor?: number;
	referenceStatus?: ReferencePointStatus; // [v8.0] Estado psicológico do hero (Prospecto)
}

export interface PostFlopResult extends RpDerivationResult {
	evFoldStreet: number;
	sprRemanescente: number;
	rStreet: number;
	stackHeroRemanescente: number;
	// D6: Componentes PM por street
	rioMwStreet: number;      // RIO multiway por street (O(N²) × pot_acumulado)
	valuationStreet: number;  // ICM valuation dinâmica (gain/loss ratio)
	pmStreet: number;         // Perspectiva Matemática por street
	ciStreet: number;         // Coeficiente de Insolvência por street
	threshEqStreet: number;   // Teto do RP dinâmico por street
	potEntrapmentRatio: number; // Razão EV_fold / stack_hero (severidade do aprisionamento)
	// [v8.0] Métricas do core fused
	heroRpAbsolute: number;   // RP canônico do hero (core.riskAdvantage — BF + RIO + Prospecto)
}

export function derivePostFlopRps(
	stacks: number[],
	prizes: number[],
	ipIndex: number,
	oopIndex: number,
	state: StreetState,
): PostFlopResult | null {
	const {
		potAcumuladoHero,
		potTotal,
		heroIsIp,
		bountyValue = 0,
		futureRpInfluence = 0,
		humanNoiseFactor = 0,
		referenceStatus,
	} = state;
	const heroIdx = heroIsIp ? ipIndex : oopIndex;
	const villainIdx = heroIsIp ? oopIndex : ipIndex;
	const numPlayersInPot = state.numPlayers ?? 2;

	const heroCost = Math.max(0, potTotal - potAcumuladoHero); // O que falta pagar para ver a próxima street (ou showdown)

	const input: PerspectivaInput = {
		stacks,
		prizes,
		heroIdx,
		villainIdx,
		potSize: potTotal - heroCost, // Pote antes do investimento atual do hero
		heroCost: heroCost,
		winProb: 0.5,         // Baseline agnóstico
		realizationFactor: 1, // Será ajustado internamente pelo motor
		edgeBase: 1,
		bountyValue,
		numPlayersInPot,
		humanNoiseFactor,
		heroPosition: heroIsIp ? 'IP' : 'OOP',
		investidoAcumulado: potAcumuladoHero,
	};

	if (referenceStatus !== undefined) {
		input.referenceStatus = referenceStatus;
	}

	const core = calculatePerspectivaVitoi(input);

	// [v8.0] heroRpAbsolute: RP canônico derivado pelo core fused.
	// Inclui RIO_mw, Prospecto, FGS — mais rico que o BF simples.
	const heroRpAbsolute = core.riskAdvantage;

	const totalPrizes = prizes.reduce((s, v) => s + v, 0);
	const bountyContrib = (bountyValue * totalPrizes) / 100;

	// SOTA: Calcular Bubble Factors reais para IP e OOP sem aproximações de simetria.
	// Mantemos o cálculo dual-player: o core é single-hero, mas precisamos do delta IP↔OOP.
	const baseline = calculateMapaICM(stacks, prizes);
	const potSize = potTotal - heroCost;

	// B03: ate 2026-09-08 estas seis linhas eram uma COPIA MANUAL do
	// _buildSimulatedStacks defeituoso de perspectiva.ts, e sobreviveram a correcao
	// daquele arquivo -- a fonte unica nao era unica. Medido antes de trocar: o RP
	// daqui saturava em RP_MAX (60) em 3 de 4 cenarios e o teto de 24 disparava nos
	// 4, ou seja, era alarme permanentemente ligado, que nao discrimina nada.
	// Agora chama a funcao unica, cujo contrato de massa esta em massaDeFichas.test.ts.
	// BF de cada lado a partir da PROPRIA decisao: o mesmo pote e o mesmo custo, com os papeis trocados.
	// Ate 2026-09-17 o BF do nao-heroi saia dos ramos da decisao do heroi. Como a contribuicao dele ja esta no
	// pote, no ramo em que o heroi vence a stack dele nao muda: perda ~0, BF entre 0,02 e 0,3 em todos os 10
	// cenarios nao baseline e em todas as streets, trocando de lado junto com o papel de heroi. O piso de RP em 0
	// escondia o artefato, e o RP pos-flop do adversario saia sempre 0. Para o heroi a formula e identica a anterior.
	const bfDaPropriaDecisao = (jogador: number, oponente: number): number => {
		const { stacksWin, stacksLose } = buildSimulatedStacks(
			stacks,
			jogador,
			oponente,
			potSize,
			heroCost,
			potAcumuladoHero,
		);
		const base = baseline.equities[jogador] ?? 0;
		const gain = (calculateMapaICM(stacksWin, prizes).equities[jogador] ?? 0) - base + bountyContrib;
		const loss = base - (calculateMapaICM(stacksLose, prizes).equities[jogador] ?? 0);
		return gain > 0 ? loss / gain : 1;
	};

	const allBfs = stacks.map((_, i) => {
		if (i === ipIndex) return bfDaPropriaDecisao(ipIndex, oopIndex);
		if (i === oopIndex) return bfDaPropriaDecisao(oopIndex, ipIndex);
		return 1;
	});

	const aDecision = potTotal > 0 ? Math.min(Math.max(heroCost / potTotal, 0.001), 0.999) : 0.5;
	const allRps = allBfs.map((bf) => bfToRp(bf, aDecision));
	const ipRp = allRps[ipIndex] ?? 0;
	const oopRp = allRps[oopIndex] ?? 0;
	// Delta de risco entre os dois jogadores (perspectiva do IP agressor)
	const riskAdvantageDelta = oopRp - ipRp;
	const sprProxy = (stacks[heroIdx] ?? heroCost) / (heroCost * 2 || 1);

	// [v8.0] Sizing enriquecido: combina delta BF (IP vs OOP) + heroRpAbsolute do core.
	const recommendedSizing = deriveRecommendedSizing(riskAdvantageDelta, sprProxy, heroRpAbsolute);

	// [v8.0] isCeilingReached: teto ativado por RIO, BF individuais OU RP absoluto do core.
	const isCeilingReached =
		core.rioLiability > 20 ||
		ipRp >= RP_CEILING_THRESHOLD ||
		oopRp >= RP_CEILING_THRESHOLD ||
		heroRpAbsolute >= RP_CEILING_THRESHOLD;

	return {
		ipRp,
		oopRp,
		deltaRp: ipRp - oopRp,
		allRps,
		allBfs,
		isCeilingReached,
		recommendedSizing,
		riskAdvantage: riskAdvantageDelta,
		adjustedIpRp: ipRp + futureRpInfluence,
		adjustedOopRp: oopRp + futureRpInfluence,
		evFoldStreet: core.deltaFoldPct,
		sprRemanescente: core.marginInstability / 100,
		rStreet: core.realizationFactor,
		stackHeroRemanescente: stacks[heroIdx] ?? 0,
		rioMwStreet: core.rioLiability,
		valuationStreet: core.valuation,
		pmStreet: core.perspectivaPct,
		ciStreet: core.ci,
		threshEqStreet: core.threshEq,
		potEntrapmentRatio: Math.abs(core.deltaFoldPct) / (stacks[heroIdx] || 1),
		heroRpAbsolute,        // [v8.0] RP canônico do hero via core fused
	};
}
