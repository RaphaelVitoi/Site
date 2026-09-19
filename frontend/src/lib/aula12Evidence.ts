/**
 * Ponte entre a evidência primária da Aula 1.2 e o motor bayesiano.
 *
 * POR QUE ELA EXISTE
 * Duas transcrições do mesmo documento coexistiam. A canônica
 * (`solver/evidencia/aula12Pairs.ts`, em `__fixtures__/` ate 2026-09-18) nasceu de dupla leitura cega sobre catorze capturas, com SHA-256 do
 * documento, índice de figura e procedência por valor. A segunda vive hardcoded em `bayesianRangeEngine.ts`, e
 * traz o que a primeira não tem: grid 13x13 por mão, classificação, gradiente de indiferença e filtragem por rua.
 * Medido em 2026-09-17: das 35 frequências do motor, **24 já existiam na fixture**. Esta ponte une as duas —
 * o motor mantém a capacidade, a evidência mantém a procedência.
 *
 * A REGRA QUE ELA RESPEITA, E COMO
 * O contrato de evidência proíbe normalizar ou redistribuir frequência, porque redistribuição silenciosa apaga a
 * diferença entre o medido e o calculado. Ele **não** proíbe valor derivado: proíbe valor derivado que se passa
 * por lido. Por isso toda largura aqui carrega `base`, dizendo de onde veio:
 *
 *   `combos`      -- razão entre combos lidos da captura. Não é normalização: 306.02/370.94 é o fato, e a
 *                    porcentagem é que era a grandeza derivada e arredondada.
 *   `frequencia`  -- a captura não expôs combos (o HRC não expõe), então a largura vem da frequência reescalada.
 *                    Derivação legítima, e **declarada** — que é a diferença entre melhorar e falsificar.
 *
 * `pct` nunca é tocado: continua sendo o dígito que a captura mostra, inclusive quando a soma dá 100.1.
 */

import {
	isRead,
	type EvidenceScenario,
	type MeasuredNumber,
} from '@/components/simulator/solver/evidenceContract';

export type BaseDaLargura = 'combos' | 'combos-com-inferido' | 'frequencia';

export interface AcaoComProcedencia {
	/** Rótulo como aparece na captura. */
	label: string;
	/** Frequência lida, em pontos percentuais. Nunca corrigida. */
	pct: number;
	/** Combos lidos da captura, ou null quando ela não os expõe. */
	combos: number | null;
	/** Proporção para desenho, somando 100 no conjunto. */
	largura: number;
	/** De onde a largura saiu. */
	base: BaseDaLargura;
}

function valor(m: MeasuredNumber | undefined): number | null {
	return m !== undefined && isRead(m) ? m.value : null;
}

/**
 * Converte um cenário de evidência em ações prontas para desenho, preservando a procedência de cada grandeza.
 *
 * Prefere combos porque eles são o dado primário; só cai para a frequência quando a captura não os expõe, e
 * marca a queda em `base`. Um cenário com soma zero devolve larguras zeradas em vez de dividir por zero.
 */
export function acoesComProcedencia(cenario: EvidenceScenario): AcaoComProcedencia[] {
	const brutas = cenario.actions.map((acao) => ({
		label: acao.label,
		pct: valor(acao.frequencyPct) ?? 0,
		combos: valor(acao.combos),
	}));

	const semCombos = brutas.filter((a) => a.combos === null);
	const totalDeclarado = valor(cenario.totalCombos);

	// Caminho 1 -- a captura expoe todos os combos. A razao entre eles e o fato.
	if (brutas.length > 0 && semCombos.length === 0) {
		return escalar(brutas, (a) => a.combos ?? 0, 'combos');
	}

	// Caminho 2 -- falta exatamente UM combo e a captura declara o total. Ele nao esta perdido: sai por subtracao,
	// e o resultado e aritmetica sobre valores lidos, nao chute. Rebaixar o conjunto inteiro para a frequencia aqui
	// seria deixar a regra endurecer contra o que a propria captura mostra. A inferencia fica marcada em `base`.
	const unicoFaltante = semCombos.length === 1 && totalDeclarado !== null && brutas.length > 1;
	if (unicoFaltante) {
		const somaConhecida = brutas.reduce((acc, a) => acc + (a.combos ?? 0), 0);
		const inferido = totalDeclarado - somaConhecida;
		if (inferido >= 0) {
			const completas = brutas.map((a) => (a.combos === null ? { ...a, combos: inferido } : a));
			return escalar(completas, (a) => a.combos ?? 0, 'combos-com-inferido');
		}
	}

	// Caminho 3 -- a captura nao expoe combos suficientes (o HRC nao os expoe). A largura vem da frequencia,
	// e a queda e declarada.
	return escalar(brutas, (a) => a.pct, 'frequencia');
}

function escalar(
	brutas: { label: string; pct: number; combos: number | null }[],
	grandeza: (a: { label: string; pct: number; combos: number | null }) => number,
	base: BaseDaLargura,
): AcaoComProcedencia[] {
	const total = brutas.reduce((acc, a) => acc + grandeza(a), 0);
	return brutas.map((a) => ({
		...a,
		base,
		largura: total > 0 ? (grandeza(a) * 100) / total : 0,
	}));
}

/**
 * Soma das frequências lidas, como a captura as mostra.
 *
 * Existe para que o resíduo de arredondamento seja **exibível**, e não escondido: medido em 2026-09-17, o nó
 * ChipEV do par 2 soma 100.1 porque o GTO Wizard arredonda cada linha para uma casa. Quem quiser mostrar isso
 * ao usuário tem o número; quem quiser desenhar tem `largura`.
 */
export function somaDasFrequencias(cenario: EvidenceScenario): number {
	return cenario.actions.reduce((acc, a) => acc + (valor(a.frequencyPct) ?? 0), 0);
}
