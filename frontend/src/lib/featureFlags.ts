/**
 * Portoes de superficie para capacidades em desenvolvimento.
 *
 * Existe porque isolamento de calculo e isolamento de exposicao sao coisas diferentes, e ate 2026-09-17 esta base
 * tinha so o primeiro: o PKO nao contaminava nenhuma saida vanilla -- ha seis testes provando isso --, mas o seu
 * controle era renderizado incondicionalmente em `NashPanel`, sem `NODE_ENV`, sem flag, sem nada. Uma capacidade
 * que o proprio codigo chama de "em desenvolvimento" chegava a producao para qualquer visitante.
 *
 * Todo portao aqui **falha fechado**: variavel ausente, vazia ou com qualquer valor que nao seja exatamente
 * `'true'` mantem a capacidade desligada. O default de um recurso incompleto nunca e "aparece".
 */

/** O leitor e uma funcao, e nao uma constante de modulo, para que o valor seja lido a cada chamada. */
function habilitada(variavel: string): boolean {
	return process.env[variavel] === 'true';
}

/**
 * Controle de PKO (bounty), em desenvolvimento.
 *
 * Os autos poem PKO fora do escopo do template Vanilla: bounties exigem modelo proprio e regras da sala. Enquanto
 * esse modelo nao existir, o controle so aparece com `NEXT_PUBLIC_PKO_DEV=true` no ambiente de quem desenvolve.
 */
export function pkoEmDesenvolvimentoHabilitado(): boolean {
	return habilitada('NEXT_PUBLIC_PKO_DEV');
}
