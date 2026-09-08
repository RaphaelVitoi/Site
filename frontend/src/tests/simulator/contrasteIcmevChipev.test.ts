/**
 * IDENTITY: Contraste ICMev x ChipEV -- o modelo contra a evidencia
 * PATH: src/tests/simulator/contrasteIcmevChipev.test.ts
 * ROLE: Confrontar o que `solveIcmDistortion` PREVE com o que os sete pares da
 *       Aula 1.2 MEDEM, e fixar como contrato as propriedades estruturais que
 *       o confronto revelou.
 *
 * O QUE ESTE ARQUIVO NAO E: calibracao. Os sete pares seguem irreproduziveis
 * (`countReproduciblePairs` = 0), e nada aqui altera constante de motor. O
 * contraste mede a DISTANCIA entre modelo e evidencia; fecha-la e outra tarefa,
 * que exige pares reproduziveis.
 *
 * GRANDEZA DECLARADA: o RP usado e o `RISK_PREMIUM_DECLARADO` da fonte
 * (BTN 21.4 / BB 12.9), grandeza A -- (BF-1)/(BF+1). A escolha entre as duas
 * grandezas de RP segue aberta com o Tier 0; declarar qual se usa e o que torna
 * este contraste legivel, conforme o handoff de 2026-09-08.
 *
 * @format
 */

import {
	AULA_1_2_PAIRS,
	RISK_PREMIUM_DECLARADO,
} from '@/components/simulator/solver/__fixtures__/aula12Pairs';
import {
	classifyActionNoCenario,
	isRead,
	type ActionClass,
	type EvidenceScenario,
} from '@/components/simulator/solver/evidenceContract';
import { solveIcmDistortion } from '@/components/simulator/solver/nashSolver';

const RP_BTN = RISK_PREMIUM_DECLARADO.btnPct;
const RP_BB = RISK_PREMIUM_DECLARADO.bbPct;

/**
 * Quem AGE no no de cada par, na ordem de AULA_1_2_PAIRS. Lido dos nodeLabels
 * da fixture; nao e inferencia deste teste.
 */
const AGENTE: readonly ('BTN' | 'BB')[] = [
	'BB',
	'BTN',
	'BB',
	'BTN',
	'BB',
	'BTN',
	'BB',
];

/** Ramos agressivos (bet/raise) com sizing lido, do menor para o maior. */
function ramosAgressivos(s: EvidenceScenario): { sz: number; f: number }[] {
	const out: { sz: number; f: number }[] = [];
	for (const a of s.actions) {
		const c = classifyActionNoCenario(a.label, s);
		if (c !== 'bet' && c !== 'raise') continue;
		const f = a.frequencyPct;
		const sz = a.sizingBb;
		if (f === undefined || !isRead(f)) continue;
		if (sz === undefined || !isRead(sz)) continue;
		out.push({ sz: sz.value, f: f.value });
	}
	return out.sort((x, y) => x.sz - y.sz);
}

/** Frequencia somada por classe de acao. */
function porClasse(s: EvidenceScenario): Partial<Record<ActionClass, number>> {
	const out: Partial<Record<ActionClass, number>> = {};
	for (const a of s.actions) {
		const f = a.frequencyPct;
		if (f === undefined || !isRead(f)) continue;
		const classe = classifyActionNoCenario(a.label, s);
		out[classe] = (out[classe] ?? 0) + f.value;
	}
	return out;
}

// ---------------------------------------------------------------------------
// A1 -- Cardinalidade de ramos: o ICMev abre mais, e nunca menos
// ---------------------------------------------------------------------------

describe('A1 · cardinalidade de ramos agressivos', () => {
	/**
	 * A multiplicidade de sizings NAO e ruido de leitura a ser agregado: e
	 * comportamento diferencial entre os regimes. Quantos ramos cada motor abre
	 * no MESMO no e um dado do contraste, e a direcao medida e unilateral.
	 */
	it('o ICMev nunca abre menos ramos agressivos que o ChipEV', () => {
		const deficit = AULA_1_2_PAIRS.filter(
			p => ramosAgressivos(p.icmEv).length < ramosAgressivos(p.chipEv).length,
		);
		expect(deficit).toHaveLength(0);
	});

	it('o ICMev abre estritamente mais ramos em dois dos sete pares', () => {
		const excedentes = AULA_1_2_PAIRS.filter(
			p => ramosAgressivos(p.icmEv).length > ramosAgressivos(p.chipEv).length,
		);
		expect(excedentes).toHaveLength(2);
	});

	/**
	 * O ramo excedente e sempre INTERMEDIARIO -- nem o menor nem o maior -- e
	 * carrega massa que nao e residual. No par do turn ele fica com 42.8%, o
	 * maior peso do no inteiro. Um modelo com arvore fixa de dois sizings nao
	 * tem onde colocar essa massa.
	 */
	it('o ramo excedente e intermediario e carrega massa nao-residual', () => {
		const excedentes = AULA_1_2_PAIRS.filter(
			p => ramosAgressivos(p.icmEv).length > ramosAgressivos(p.chipEv).length,
		);
		expect(excedentes.length).toBeGreaterThan(0);
		for (const p of excedentes) {
			const m = ramosAgressivos(p.icmEv);
			const meio = m.slice(1, m.length - 1);
			expect(meio.length).toBeGreaterThan(0);
			const massa = meio.reduce((a, b) => a + b.f, 0);
			expect(massa).toBeGreaterThanOrEqual(20);
		}
	});
});

// ---------------------------------------------------------------------------
// A2 / A3 -- A assimetria estrutural do modelo
// ---------------------------------------------------------------------------

describe('A2 · o lado agressor desloca por constante aditiva', () => {
	/**
	 * Algebra: com aggressionFactor = 1 e soma de entrada 100, o modelo produz
	 *
	 *     delta_aposta = sign(dRP) * (|dRP|/10)^b * (k_small + k_large)
	 *                  = sign(dRP) * (|dRP|/10)^b * (-15.5)
	 *
	 * que NAO contem a frequencia de entrada. O deslocamento e o mesmo se o
	 * ChipEV aposta 97.8% ou 42.7% -- e e por isso que o modelo preve ~13.5pp em
	 * todo no de aposta, enquanto a evidencia varia de 3.0 a 21.3pp.
	 *
	 * LIMITE DA PROPRIEDADE: `rawBetLarge = Math.max(0, ip_bet_large + delta)`.
	 * Abaixo de |delta_large| ~ 10.5pp o clamp morde e o deslocamento deixa de
	 * ser constante -- fixado no teste seguinte, porque um limite medido vale
	 * mais que uma propriedade enunciada sem ele.
	 *
	 * Fixado como CONTRATO e nao como estado: se alguem tornar o lado agressor
	 * sensivel a entrada, este teste reprova e a mudanca fica declarada.
	 */
	const deslocamentoDaAposta = (e: {
		ip_check: number;
		ip_bet_small: number;
		ip_bet_large: number;
	}) => {
		const r = solveIcmDistortion(RP_BTN, RP_BB, {
			...e,
			oop_call: 50,
			oop_fold: 40,
			oop_raise: 10,
		});
		const previsto = r.ip.bet_small.center + r.ip.bet_large.center;
		return previsto - (e.ip_bet_small + e.ip_bet_large);
	};

	it('o deslocamento da aposta independe da frequencia ChipEV de entrada', () => {
		// Todas longe da saturacao: bet_large bem acima do deslocamento aplicado.
		const entradas = [
			{ ip_check: 2.3, ip_bet_small: 8.7, ip_bet_large: 89.0 },
			{ ip_check: 57.3, ip_bet_small: 18.9, ip_bet_large: 23.8 },
			{ ip_check: 50, ip_bet_small: 25, ip_bet_large: 25 },
			{ ip_check: 30, ip_bet_small: 40, ip_bet_large: 30 },
		];
		const deslocamentos = entradas.map(deslocamentoDaAposta);
		for (const d of deslocamentos) {
			expect(d).toBeCloseTo(deslocamentos[0], 6);
		}
	});

	/**
	 * O UNICO ponto em que a entrada volta a importar e a saturacao do ramo
	 * grande. Nao e sensibilidade ao no: e o piso em zero, e ele so aparece
	 * quando o ChipEV ja aposta pouco no sizing maior.
	 */
	it('a constancia cessa quando o ramo grande satura em zero', () => {
		const semSaturar = deslocamentoDaAposta({
			ip_check: 50,
			ip_bet_small: 25,
			ip_bet_large: 25,
		});
		const entradaQueSatura = {
			ip_check: 80,
			ip_bet_small: 10,
			ip_bet_large: 10,
		};
		const saturado = deslocamentoDaAposta(entradaQueSatura);

		// Saturar corta parte do deslocamento: ele fica MENOS negativo.
		expect(saturado).toBeGreaterThan(semSaturar);

		// E o que caracteriza a saturacao e o ramo grande zerado -- nao um valor
		// derivado. O ramo PEQUENO segue deslocando normalmente, e e por isso
		// que o total nao para em -ip_bet_large.
		const r = solveIcmDistortion(RP_BTN, RP_BB, {
			...entradaQueSatura,
			oop_call: 50,
			oop_fold: 40,
			oop_raise: 10,
		});
		expect(r.ip.bet_large.center).toBe(0);
		expect(r.ip.bet_small.center).toBeGreaterThan(0);
	});
});

describe('A3 · o lado defensor desloca proporcionalmente a entrada', () => {
	/**
	 * `foldShift = oop_fold * (pressure * 0.015)` -- multiplicativo. E a
	 * assimetria com A2: o defensor escala com o no, o agressor nao. Medido, o
	 * lado que escala erra menos contra a evidencia (ver A4).
	 */
	it('o deslocamento do fold cresce com o fold de entrada', () => {
		const desloc = [10, 20, 30, 40].map(f => {
			const r = solveIcmDistortion(RP_BTN, RP_BB, {
				ip_check: 50,
				ip_bet_small: 25,
				ip_bet_large: 25,
				oop_fold: f,
				oop_call: 95 - f,
				oop_raise: 5,
			});
			return r.oop.fold.center - f;
		});
		for (let i = 1; i < desloc.length; i += 1) {
			expect(desloc[i]).toBeGreaterThan(desloc[i - 1]);
		}
	});
});

// ---------------------------------------------------------------------------
// A4 -- O contraste propriamente dito
// ---------------------------------------------------------------------------

interface Comparacao {
	par: number;
	tipo: 'aposta' | 'enfrenta';
	classe: string;
	chip: number;
	medido: number;
	previsto: number;
}

/** Confronta previsao e medicao nas comparacoes que os sete pares sustentam. */
function contrastar(): Comparacao[] {
	const out: Comparacao[] = [];
	AULA_1_2_PAIRS.forEach((p, i) => {
		const c = porClasse(p.chipEv);
		const m = porClasse(p.icmEv);
		const ehAposta = (c.check ?? 0) > 0 || (c.bet ?? 0) > 0;
		const btn = AGENTE[i] === 'BTN';
		const rpAgente = btn ? RP_BTN : RP_BB;
		const rpOutro = btn ? RP_BB : RP_BTN;
		const bets = ramosAgressivos(p.chipEv);
		const small = bets[0]?.f ?? 0;
		const large = bets.slice(1).reduce((a, b) => a + b.f, 0);

		const r = solveIcmDistortion(
			ehAposta ? rpAgente : rpOutro,
			ehAposta ? rpOutro : rpAgente,
			{
				ip_check: c.check ?? 0,
				ip_bet_small: small,
				ip_bet_large: large,
				oop_call: c.call ?? 0,
				oop_fold: c.fold ?? 0,
				oop_raise: c.raise ?? 0,
			},
		);

		const linhas: [string, number, number, number][] = ehAposta
			? [
					['check', c.check ?? 0, m.check ?? 0, r.ip.check.center],
					[
						'bet',
						c.bet ?? 0,
						m.bet ?? 0,
						r.ip.bet_small.center + r.ip.bet_large.center,
					],
				]
			: [
					['fold', c.fold ?? 0, m.fold ?? 0, r.oop.fold.center],
					['call', c.call ?? 0, m.call ?? 0, r.oop.call.center],
					['raise', c.raise ?? 0, m.raise ?? 0, r.oop.raise.center],
				];

		for (const [classe, chip, medido, previsto] of linhas) {
			out.push({
				par: i + 1,
				tipo: ehAposta ? 'aposta' : 'enfrenta',
				classe,
				chip,
				medido,
				previsto,
			});
		}
	});
	return out;
}

describe('A4 · previsao do modelo contra a evidencia medida', () => {
	const comparacoes = contrastar();

	it('os sete pares sustentam dezessete comparacoes', () => {
		expect(comparacoes).toHaveLength(17);
	});

	/**
	 * DIRECAO e o que o modelo acerta. Das 17 ele erra o SINAL da distorcao em
	 * duas -- ambas em `raise` com frequencia abaixo de 7%, onde a evidencia
	 * mostra a agressao subindo de leve e o modelo a preve caindo.
	 *
	 * Piso de 14 e nao 15: o teste guarda a PROPRIEDADE (o modelo acerta a
	 * direcao na grande maioria), nao o placar exato de hoje.
	 */
	it('acerta a direcao da distorcao em ao menos 14 das 17', () => {
		const acertos = comparacoes.filter(k => {
			const dm = k.medido - k.chip;
			const dp = k.previsto - k.chip;
			return Math.sign(Math.round(dm * 10)) === Math.sign(Math.round(dp * 10));
		});
		expect(acertos.length).toBeGreaterThanOrEqual(14);
	});

	/**
	 * MAGNITUDE e onde a assimetria A2/A3 aparece na evidencia: o lado que
	 * escala com a entrada erra cerca de metade do que erra o lado de
	 * deslocamento constante. Nao e coincidencia -- e a mesma propriedade,
	 * observada de fora.
	 */
	it('o lado defensor erra menos que o agressor', () => {
		const erroMedio = (t: 'aposta' | 'enfrenta') => {
			const g = comparacoes.filter(k => k.tipo === t);
			return g.reduce((a, k) => a + Math.abs(k.previsto - k.medido), 0) / g.length;
		};
		expect(erroMedio('enfrenta')).toBeLessThan(erroMedio('aposta'));
	});

	it('nenhuma previsao erra mais de 12 pontos percentuais', () => {
		const pior = Math.max(
			...comparacoes.map(k => Math.abs(k.previsto - k.medido)),
		);
		expect(pior).toBeLessThanOrEqual(12);
	});
});

// ---------------------------------------------------------------------------
// A5 -- O limite estrutural
// ---------------------------------------------------------------------------

describe('A5 · o modelo nao tem onde colocar o ramo excedente', () => {
	/**
	 * `ChipEvFreqs` expoe exatamente DOIS slots de aposta. Onde a evidencia abre
	 * tres ramos, o terceiro nao tem destino -- e nao e questao de calibrar
	 * constante, e de forma. Fixado para que a limitacao seja declarada em vez
	 * de reaparecer como erro numerico inexplicado.
	 */
	it('a arvore do modelo tem dois sizings, a evidencia chega a tres', () => {
		const r = solveIcmDistortion(RP_BTN, RP_BB, {
			ip_check: 50,
			ip_bet_small: 25,
			ip_bet_large: 25,
			oop_call: 50,
			oop_fold: 40,
			oop_raise: 10,
		});
		expect(Object.keys(r.ip).sort()).toEqual([
			'bet_large',
			'bet_small',
			'check',
		]);

		const maxRamos = Math.max(
			...AULA_1_2_PAIRS.map(p => ramosAgressivos(p.icmEv).length),
		);
		expect(maxRamos).toBe(3);
	});
});

// ---------------------------------------------------------------------------
// A6 -- O encolhimento de sizing sob ICM
// ---------------------------------------------------------------------------

/** Massa agressiva total do cenario, em pontos percentuais. */
function massaAgressiva(s: EvidenceScenario): number {
	return ramosAgressivos(s).reduce((a, b) => a + b.f, 0);
}

/** Fracao da massa agressiva que vai ao MAIOR ramo, em pp. */
function fracaoNoMaiorRamo(s: EvidenceScenario): number {
	const r = ramosAgressivos(s);
	const m = r.reduce((a, b) => a + b.f, 0);
	if (m <= 0) return NaN;
	return (r[r.length - 1].f / m) * 100;
}

describe('A6 · sob ICM a massa migra para sizings menores', () => {
	/**
	 * MECANISMO (Tier 0): quanto maior o ICM, maior o preco MONETARIO da ficha.
	 * A mesma ameaca em dolares e exercida com menos fichas -- entao o sizing que
	 * o ChipEV precisa fazer grande, o ICMev faz menor. Escalona.
	 *
	 * METRICA IMUNE A ESCALA: fracao da massa agressiva no MAIOR ramo. Ela e uma
	 * razao ENTRE FREQUENCIAS DO MESMO CENARIO, e por isso nao e contaminada
	 * pelo pote menor nem pela stack menor que o HRC modela -- que sao a
	 * diferenca de estado ja documentada na fixture, nao o efeito procurado.
	 *
	 * INFORMATIVO exige massa dos dois lados: um no onde ninguem aposta, ou onde
	 * o maior ramo esta a 0% nos dois regimes, nao tem o que dizer sobre sizing.
	 */
	const informativos = AULA_1_2_PAIRS.filter(p => {
		const c = fracaoNoMaiorRamo(p.chipEv);
		const m = fracaoNoMaiorRamo(p.icmEv);
		if (!Number.isFinite(c) || !Number.isFinite(m)) return false;
		return massaAgressiva(p.chipEv) > 0.5 && (c > 0 || m > 0);
	});

	it('quatro dos sete pares sao informativos sobre sizing', () => {
		expect(informativos).toHaveLength(4);
	});

	it('a fracao no maior ramo cai em TODOS os pares informativos', () => {
		const subiu = informativos.filter(
			p => fracaoNoMaiorRamo(p.icmEv) > fracaoNoMaiorRamo(p.chipEv),
		);
		expect(subiu).toHaveLength(0);
	});

	/**
	 * SIZING MEDIO PONDERADO NORMALIZADO pelo maior ramo do PROPRIO cenario.
	 * Normalizar e o que separa o efeito procurado do confundidor: o HRC modela
	 * pote e stack menores, entao um sizing identico em %-do-pote ja apareceria
	 * menor em bb. Dividindo pelo maior ramo do proprio lado, os dois regimes
	 * passam a viver em [0, 1] e a comparacao e do FORMATO da distribuicao.
	 */
	const medioNormalizado = (s: EvidenceScenario): number => {
		const r = ramosAgressivos(s);
		const massa = r.reduce((a, b) => a + b.f, 0);
		const maior = r[r.length - 1].sz;
		return r.reduce((a, b) => a + (b.sz / maior) * b.f, 0) / massa;
	};

	it('o sizing medio normalizado cai em TODOS os pares informativos', () => {
		const subiu = informativos.filter(
			p => medioNormalizado(p.icmEv) >= medioNormalizado(p.chipEv),
		);
		expect(subiu).toHaveLength(0);
	});

	/**
	 * O ESCORRIMENTO E GRADUAL, NAO UM SALTO (Tier 0). Sizings altos escorrem
	 * para os medios e os medios para os baixos -- um posto por vez. A prova
	 * negativa e que a massa NAO se acumula na base: se o efeito fosse um salto
	 * do topo direto ao menor ramo, o medio normalizado do ICMev colapsaria
	 * rumo a zero.
	 *
	 * E por isso que dominancia estocastica de primeira ordem seria forte
	 * DEMAIS aqui, e foi medida falhando: no par do turn o ramo MENOR tambem
	 * perde massa (44.3% -> 19.0% da massa agressiva), porque ela subiu meio
	 * posto ate o intermediario novo em vez de descer ate a base.
	 */
	it('a massa desce um posto, sem colapsar na base', () => {
		for (const p of informativos) {
			expect(medioNormalizado(p.icmEv)).toBeGreaterThan(0.2);
		}
	});
});

// ---------------------------------------------------------------------------
// A7 -- Onde o modelo diverge da evidencia, e por que
// ---------------------------------------------------------------------------

describe('A7 · o modelo faz o encolhimento depender do SINAL de deltaRp', () => {
	/**
	 * `signDelta = Math.sign(deltaRp)` multiplica os moduladores k_small (-3.5)
	 * e k_large (-12). Com deltaRp POSITIVO o modelo encolhe o sizing, como a
	 * evidencia manda; com deltaRp NEGATIVO ele o AUMENTA.
	 *
	 * A evidencia nao faz isso: dos quatro nos de aposta, TRES tem deltaRp
	 * negativo sob o RP declarado, e neles o sizing encolhe do mesmo jeito
	 * (-48.5pp e -33.7pp de fracao no maior ramo). O encolhimento acompanha o
	 * REGIME, nao o sinal da diferenca entre os dois jogadores -- coerente com o
	 * mecanismo de A6, que depende do preco da ficha para QUEM AGE.
	 *
	 * ESTE TESTE NAO CORRIGE NADA. Ele fixa a divergencia para que ela seja
	 * decidida pelo Tier 0 em vez de reaparecer como erro numerico sem nome.
	 * Se a modelagem mudar, este teste reprova -- e a mudanca fica declarada.
	 */
	const base = {
		ip_check: 57.3,
		ip_bet_small: 18.9,
		ip_bet_large: 23.8,
		oop_call: 50,
		oop_fold: 40,
		oop_raise: 10,
	};
	const fracPrevista = (ipRp: number, oopRp: number) => {
		const r = solveIcmDistortion(ipRp, oopRp, base);
		const soma = r.ip.bet_small.center + r.ip.bet_large.center;
		return (r.ip.bet_large.center / soma) * 100;
	};
	const fracChip =
		(base.ip_bet_large / (base.ip_bet_small + base.ip_bet_large)) * 100;

	it('com deltaRp positivo o modelo encolhe o sizing, como a evidencia', () => {
		expect(fracPrevista(RP_BTN, RP_BB)).toBeLessThan(fracChip);
	});

	it('com deltaRp negativo o modelo AUMENTA o sizing, contra a evidencia', () => {
		expect(fracPrevista(RP_BB, RP_BTN)).toBeGreaterThan(fracChip);
	});
});
