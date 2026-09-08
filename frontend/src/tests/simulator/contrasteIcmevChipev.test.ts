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
	MESA_COMPLETA_NO_OPEN,
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

/**
 * O no oferece APOSTA LIVRE quando ha `check` disponivel -- e o mesmo
 * discriminante de `classifyActionNoCenario`: nao se aumenta onde se pode pedir
 * mesa. Separar aposta de aumento nao e detalhe: o tamanho de um raise esta
 * ancorado na aposta que ele enfrenta, o de uma bet nao.
 */
function ehApostaLivre(s: EvidenceScenario): boolean {
	return s.actions.some(a => classifyActionNoCenario(a.label, s) === 'bet');
}

describe('A6 · sob ICM a massa migra para sizings menores', () => {
	/**
	 * MECANISMO (Tier 0): a valoracao da ficha e ASSIMETRICA entre as stacks.
	 * Quando a stack MAIOR aposta, aquelas fichas valem menos para ela do que
	 * valerao para a stack menor quando chegarem ao pote. A ameaca e avaliada na
	 * moeda do defensor, nao na do apostador -- entao a mesma pressao se exerce
	 * com menos fichas, e o sizing encolhe.
	 *
	 * O FENOMENO SO EXISTE DE UM LADO. No ChipEV a ficha vale ficha para
	 * qualquer stack, entao nao ha assimetria alguma a modelar -- e por isso que
	 * o GTO Wizard reduz o spot a 40/40 efetivas sem perder nada, e a fixture
	 * grava exatamente isso em STACKS_EFETIVOS_FLOP. O HRC carrega 52.88/37.88
	 * porque PRECISA das stacks reais para o ICM. O contraste aqui nao e entre
	 * duas assimetrias de tamanhos diferentes: e entre AUSENCIA e PRESENCA.
	 *
	 * ISTO NAO E A HIPOTESE DE DISTANCIA. A diferenca entre os RPs responde outra
	 * pergunta: quanto maior ela for, mais agressivo pode ser o lado de RP menor
	 * e mais seguro deve ser o de RP maior. Sao dois eixos, e A7 mede o que
	 * acontece quando um unico parametro tenta carregar os dois.
	 *
	 * METRICA IMUNE A ESCALA: fracao da massa agressiva no MAIOR ramo -- razao
	 * ENTRE FREQUENCIAS DO MESMO CENARIO, logo nao contaminada por o HRC operar
	 * sobre pote e stacks que o GTO Wizard nem representa.
	 *
	 * O RECORTE E `bet`, POR DESENHO. Uma versao anterior deste bloco filtrava
	 * so por massa e por fracao nao-nula, e os nos de raise caiam fora por
	 * ACIDENTE -- tinham fracao 0 nos dois regimes. O acidente escondia que nos
	 * raises o efeito NAO aparece, e chega a inverter (A8). Filtro que acerta
	 * por coincidencia reprova sozinho quando a fixture crescer.
	 */
	const informativos = AULA_1_2_PAIRS.filter(p => {
		if (!ehApostaLivre(p.chipEv)) return false;
		const c = fracaoNoMaiorRamo(p.chipEv);
		const m = fracaoNoMaiorRamo(p.icmEv);
		if (!Number.isFinite(c) || !Number.isFinite(m)) return false;
		return massaAgressiva(p.chipEv) > 0.5 && (c > 0 || m > 0);
	});

	it('tres nos de aposta livre sao informativos sobre sizing', () => {
		expect(informativos).toHaveLength(3);
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

describe('A7 · um unico parametro carrega dois eixos', () => {
	/**
	 * `signDelta = Math.sign(deltaRp)` multiplica os moduladores k_small (-3.5)
	 * e k_large (-12). Com deltaRp POSITIVO o modelo encolhe o sizing; com
	 * deltaRp NEGATIVO ele o AUMENTA.
	 *
	 * O PROBLEMA NAO E `deltaRp` EXISTIR. Ele modela uma hipotese legitima e
	 * geral -- a de DISTANCIA: quanto maior a diferenca entre os RPs, mais
	 * agressivo pode ser o lado de RP menor e mais seguro deve ser o de RP
	 * maior. Inverter com o sinal e o comportamento CERTO para esse eixo, porque
	 * trocar quem tem o RP maior realmente troca quem pode pressionar.
	 *
	 * O problema e o mesmo parametro governar TAMBEM o encolhimento de sizing,
	 * que e outro eixo: ele nasce da valoracao assimetrica da ficha entre as
	 * stacks (A6) e nao inverte quando o sinal inverte. Fundidos num fator so,
	 * um eixo arrasta o outro.
	 *
	 * MEDIDO: dos tres nos de APOSTA LIVRE com massa real, dois tem deltaRp
	 * negativo sob o RP declarado, e neles a fracao no maior ramo cai -48.5pp e
	 * -33.7pp -- enquanto o modelo, com o sinal invertido, preve o sizing
	 * crescer.
	 *
	 * ESTE TESTE NAO CORRIGE NADA. Ele fixa a divergencia para que ela seja
	 * decidida pelo Tier 0 em vez de reaparecer como erro numerico sem nome.
	 * Se a modelagem separar os dois eixos, este teste reprova -- e a mudanca
	 * fica declarada.
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

// ---------------------------------------------------------------------------
// A8 -- O encolhimento e fenomeno de APOSTA, nao de AUMENTO
// ---------------------------------------------------------------------------

describe('A8 · o efeito nao alcanca os nos de raise', () => {
	/**
	 * O tamanho de um raise esta ANCORADO na aposta que ele enfrenta; o de uma
	 * bet nao. Se o encolhimento vem da valoracao assimetrica de quem escolhe
	 * livremente quanto arriscar, ele nao tem por que se comportar igual onde a
	 * escolha ja chega restringida -- e, medido, nao se comporta.
	 *
	 * O QUE FOI MEDIDO, E NAO E O QUE EU HAVIA AFIRMADO: nos tres nos de raise
	 * informativos a direcao e MISTA -- dois sobem (+6.9% e +24.5% de medio
	 * normalizado) e um desce (-34.1%). Escrevi primeiro que "sobem", com dois
	 * dos tres em vista; o terceiro desmentiu. Fica a afirmacao fraca e
	 * verdadeira: nos raises NAO ha direcao unilateral.
	 *
	 * E E EXATAMENTE POR ISSO QUE O RECORTE IMPORTA. Nos nos de aposta livre a
	 * direcao e unilateral, 3 de 3 descendo; misturar as duas classes diluiria
	 * um efeito consistente num agregado sem direcao. Antes de separar por
	 * classe, A6 passava porque os raises caiam fora do filtro por ACIDENTE --
	 * fracao no maior ramo 0 nos dois lados --, e a generalizacao "sob ICM a
	 * massa migra para sizings menores" ficava ampla demais sem que nada
	 * acusasse.
	 *
	 * AMOSTRA DECLARADA: tres nos, com massa agressiva de 6.8%, 1.3% e 0.9%. E
	 * pouco, e o teste NAO afirma direcao -- afirma a ausencia dela.
	 */
	const medioNorm = (s: EvidenceScenario): number => {
		const r = ramosAgressivos(s);
		const massa = r.reduce((a, b) => a + b.f, 0);
		const maior = r[r.length - 1].sz;
		return r.reduce((a, b) => a + (b.sz / maior) * b.f, 0) / massa;
	};

	const nosDeRaise = AULA_1_2_PAIRS.filter(
		p =>
			!ehApostaLivre(p.chipEv) &&
			massaAgressiva(p.chipEv) > 0.5 &&
			massaAgressiva(p.icmEv) > 0,
	);

	it('os nos de raise informativos sao tres', () => {
		expect(nosDeRaise).toHaveLength(3);
	});

	it('neles a direcao e MISTA, ao contrario dos nos de aposta', () => {
		const subiram = nosDeRaise.filter(
			p => medioNorm(p.icmEv) > medioNorm(p.chipEv),
		);
		expect(subiram.length).toBeGreaterThan(0);
		expect(subiram.length).toBeLessThan(nosDeRaise.length);
	});
});

// ---------------------------------------------------------------------------
// A9 -- "Nao crescer o pote": a reacao de raise e o sizing minimo
// ---------------------------------------------------------------------------

describe('A9 · o lado de RP maior evita crescer o pote', () => {
	/**
	 * PRINCIPIO (Tier 0): quem tem RP maior reage menos de raise pos-flop, para
	 * nao crescer o pote -- especialmente com a equidade ainda aberta no turn e
	 * no river, onde o pote maior sera disputado com fichas que valem mais.
	 *
	 * MEDIDO nos tres nos de enfrentamento, em pontos percentuais absolutos --
	 * que e a leitura honesta quando as bases sao de 1%:
	 *
	 *   RP menor (BB, 12.9): +2.5pp   (6.8 -> 9.3)
	 *   RP maior (BTN, 21.4): -1.2pp  (1.3 -> 0.1, o raise e ABANDONADO)
	 *   RP maior (BTN, 21.4): +0.2pp  (0.9 -> 1.1, residuo)
	 *
	 * O caso forte e o abandono: o unico no em que o RP maior enfrenta um
	 * check-raise -- maior risco de crescimento de pote -- e o unico em que a
	 * agressao praticamente desaparece.
	 *
	 * AMOSTRA DECLARADA: um no de um lado, dois do outro, um deles em residuo.
	 * O teste fixa o ABANDONO, que e o fato robusto, e NAO afirma a regra geral,
	 * que esta amostra nao sustenta.
	 */
	const raisePct = (s: EvidenceScenario): number => porClasse(s).raise ?? 0;

	const parVsCheckRaise = AULA_1_2_PAIRS.find(
		p => (p.source.nodeLabel ?? '').includes('vs XR'),
	);

	it('o no de enfrentamento a check-raise existe na fixture', () => {
		expect(parVsCheckRaise).toBeDefined();
	});

	it('nele o lado de RP maior praticamente abandona o raise', () => {
		const p = parVsCheckRaise as NonNullable<typeof parVsCheckRaise>;
		const antes = raisePct(p.chipEv);
		const depois = raisePct(p.icmEv);
		expect(antes).toBeGreaterThan(depois);
		expect(depois).toBeLessThan(antes * 0.25);
	});

	/**
	 * COROLARIO: o sizing minimo em alta frequencia. Medido no no de cbet do
	 * flop, ele salta de 8.7% no ChipEV para 67.5% no ICMev -- fator 7.8x.
	 *
	 * E O INCENTIVO E COMUM AOS DOIS LADOS, nao de um deles. A mesa e um
	 * ORGANISMO (Tier 0): ha stacks curtas prestes a cair, e enquanto elas
	 * caem, tanto o BU quanto o BB ganham equidade de premiacao de graca.
	 * Inflar o pote entre si arrisca justamente o que a sobrevivencia alheia
	 * entregaria sem risco -- e por isso AMBAS as stacks se machucam ao crescer
	 * o pote, independentemente de qual delas tem o RP maior.
	 *
	 * ISTO RESOLVE O QUE EU HAVIA REGISTRADO COMO DIVERGENCIA. Escrevi que
	 * "sete pares nao separam 'e o RP maior' de 'e quem enfrenta oponente que
	 * nao aumenta'", lendo a ausencia de discriminante como fraqueza da
	 * amostra. Ela e o RESULTADO: nao ha discriminante por lado porque o
	 * incentivo nao vem da relacao entre os dois -- vem da mesa completa. E por
	 * isso que o encolhimento aparece em 3 de 3 nos de aposta livre com o BB
	 * agindo em dois e o BTN em um, sem separar por lado (A6).
	 *
	 * E O QUE FECHA O CONTRASTE INTEIRO: essa mesa completa e exatamente o que
	 * o GTO Wizard IGNORA e o HRC carrega -- a fixture o diz literalmente na
	 * nota de MESA_COMPLETA_NO_OPEN. Mais ramos (A1), sizing menor (A6) e menos
	 * raise (A9) decorrem todos de haver stacks fora do pote cuja eliminacao
	 * beneficia os dois que estao dentro dele.
	 */
	it('a mesa carrega stacks curtas que o ChipEV ignora', () => {
		const assentos: number[] = Object.values(MESA_COMPLETA_NO_OPEN.assentos);
		const efetiva = MESA_COMPLETA_NO_OPEN.efetivaPreOpenBb;
		const protagonistas = [
			MESA_COMPLETA_NO_OPEN.assentos.BU,
			MESA_COMPLETA_NO_OPEN.assentos.BB,
		];

		// Ha stacks em perigo real, e os dois protagonistas estao acima delas.
		const curtas = assentos.filter(s => s < efetiva / 2);
		expect(curtas.length).toBeGreaterThanOrEqual(3);
		for (const p of protagonistas) {
			expect(p).toBeGreaterThan(Math.max(...curtas));
		}

		// E a mesa tem mais assentos do que os dois que o GTO Wizard modela.
		expect(assentos.length).toBeGreaterThan(2);
	});

	it('o sizing minimo multiplica sua frequencia sob ICM', () => {
		const cbetFlop = AULA_1_2_PAIRS.find(p =>
			(p.source.nodeLabel ?? '').includes('IP action após BB check'),
		);
		expect(cbetFlop).toBeDefined();
		const p = cbetFlop as NonNullable<typeof cbetFlop>;
		const menorChip = ramosAgressivos(p.chipEv)[0];
		const menorIcm = ramosAgressivos(p.icmEv)[0];
		expect(menorIcm.f).toBeGreaterThan(menorChip.f * 3);
	});
});
