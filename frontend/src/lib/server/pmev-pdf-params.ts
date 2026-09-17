/**
 * IDENTITY: Validação e escape da entrada do tratado PDF PMev
 * PATH: src/lib/server/pmev-pdf-params.ts
 * ROLE: Garante que só números finitos e mãos canônicas cheguem ao content stream do PDF.
 *
 * BK-17 (auditoria 2026-09-16). A rota é pública e interpolava campos do corpo sem tipo nem teto
 * em strings literais PDF `( ... )`. Parênteses já eram removidos; a barra invertida não, e `\`
 * no fim da linha escapava o `)` de fechamento, corrompendo o arquivo. `expanded_hands` não tinha
 * limite de tamanho.
 */

/** Neutraliza texto para string literal PDF: sem delimitadores, sem escape, só ASCII imprimível. */
export function escapePdfText(texto: string): string {
	return texto.replace(/[()\\]/g, '').replace(/[^\x20-\x7e]/g, '');
}

const MAO_CANONICA = /^[2-9TJQKA]{2}[so]?$/;
export const MAX_MAOS_NO_TRATADO = 169;
const TETO_NUMERICO = 1_000_000;

function numeroFinito(valor: unknown, padrao: number, min: number, max: number): number | null {
	if (valor === undefined || valor === null) return padrao;
	return typeof valor === 'number' && Number.isFinite(valor) && valor >= min && valor <= max ? valor : null;
}

export interface ParametrosDoTratado {
	stack: number;
	bf: number;
	time: number;
	pmevThreshold: number | null;
	expandedHands: string[] | null;
}

/** Valida o corpo por tipo e faixa. `null` significa pedido inválido. */
export function validarParametrosDoTratado(body: unknown): ParametrosDoTratado | null {
	const b = (typeof body === 'object' && body !== null && !Array.isArray(body) ? body : {}) as Record<string, unknown>;
	const stack = numeroFinito(b['stack_bb'], 18.5, 0, TETO_NUMERICO);
	const bf = numeroFinito(b['bubble_factor'], 2.45, 0, TETO_NUMERICO);
	const time = numeroFinito(b['time_to_blind'], 3, 0, TETO_NUMERICO);
	if (stack === null || bf === null || time === null) return null;

	let pmevThreshold: number | null = null;
	if (b['pmev_threshold'] !== undefined && b['pmev_threshold'] !== null) {
		pmevThreshold = numeroFinito(b['pmev_threshold'], 0, 0, 1);
		if (pmevThreshold === null) return null;
	}

	let expandedHands: string[] | null = null;
	const maos = b['expanded_hands'];
	if (maos !== undefined && maos !== null) {
		if (!Array.isArray(maos) || maos.length > MAX_MAOS_NO_TRATADO) return null;
		if (!maos.every((m) => typeof m === 'string' && MAO_CANONICA.test(m))) return null;
		expandedHands = maos as string[];
	}
	return { stack, bf, time, pmevThreshold, expandedHands };
}

const LARGURA_MAXIMA_DE_LINHA = 95;

function quebrarEmLinhas(prefixo: string, itens: string[]): string[] {
	const linhas: string[] = [];
	let atual = prefixo;
	for (const item of itens) {
		const pedaco = atual === prefixo ? item : `, ${item}`;
		if ((atual + pedaco).length > LARGURA_MAXIMA_DE_LINHA && atual !== prefixo) {
			linhas.push(`${atual},`);
			atual = prefixo + item;
		} else {
			atual += pedaco;
		}
	}
	linhas.push(atual);
	return linhas;
}

/**
 * Seções 5 a 7 do tratado, derivadas SÓ do que a exportação conhece.
 *
 * Até 2026-09-17 estas seções afirmavam números fixos — limiar ICM 49.5%, "Delta -6.33%",
 * "Monte Carlo 100.000 iterações" com EV, taxa de sucesso e vantagem por decisão — ao lado dos
 * dados do usuário, como se fossem do cenário dele. Nenhum tinha fonte no repositório, e o
 * blocker "reduz AA/AK/AQ em 50%" contradiz a combinatória (AK e AQ caem 25%). Número sem medição
 * não entra no documento; o que não foi calculado é declarado como não calculado.
 */
export function linhasDoCenario(p: ParametrosDoTratado): string[] {
	const limiarPmev =
		p.pmevThreshold !== null
			? `   * Limiar PMev informado: ${(p.pmevThreshold * 100).toFixed(1)}% de equidade requerida.`
			: '   * Limiar PMev: nao informado nesta exportacao.';
	const classes = p.expandedHands?.length
		? quebrarEmLinhas('     ', p.expandedHands)
		: ['     Nenhuma classe expandida foi enviada nesta exportacao.'];

	return [
		'# 5. SEU CENARIO: DADOS ENVIADOS NESTA EXPORTACAO',
		`Stack efetivo: ${p.stack} BB * Bubble factor: ${p.bf} * Minutos ate o proximo nivel: ${p.time}`,
		limiarPmev,
		'   * Limiar ICM classico: nao calculado nesta exportacao. O comparativo exige rodar os dois',
		'     modelos sobre o mesmo spot; um valor fixo aqui descreveria outro cenario.',
		'',
		'# 6. VALIDACAO EMPIRICA',
		'   * Nenhuma simulacao Monte Carlo foi executada para gerar este documento.',
		'   * EV e risco de eliminacao dependem de stacks, estrutura de premios e ranges, e nao se',
		'     transferem entre cenarios. Rode o seu spot no simulador antes de usar um numero.',
		'',
		'# 7. CLASSES EXPANDIDAS NO SEU CENARIO',
		...classes,
		'   * Blocker de As: com um As na mao, AA cai de 6 para 3 combos, -50%; AK e AQ caem de',
		'     16 para 12 combos cada, -25%.',
		'   * Pares pequenos e conectores suited: a equidade realizada quando pagos depende do range',
		'     de call do adversario e nao tem valor unico.',
	];
}
