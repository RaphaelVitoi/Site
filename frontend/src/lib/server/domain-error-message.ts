/**
 * IDENTITY: Mensagem de erro segura para resposta HTTP
 * PATH: src/lib/server/domain-error-message.ts
 * ROLE: Separa erro de validação de domínio, escrito para o usuário, de falha inesperada de runtime.
 *
 * BK-15 (auditoria 2026-09-16). As rotas de experimento devolviam `error.message` de qualquer
 * `Error`. As bibliotecas lançam `new Error('texto para o usuário')` de propósito, mas um
 * `TypeError`/`RangeError` de runtime também é `Error`, e sua mensagem descreve o código, não o
 * pedido. A distinção é pela classe EXATA: só instância direta de `Error` (ou das classes de
 * domínio passadas em `permitidas`) tem a mensagem exposta.
 */
export function mensagemDeErroDeDominio(
	error: unknown,
	fallback: string,
	permitidas: ReadonlyArray<abstract new (...args: never[]) => Error> = [],
): string {
	if (!(error instanceof Error)) return fallback;
	const classe = Object.getPrototypeOf(error)?.constructor;
	if (classe === Error || permitidas.includes(classe)) return error.message;
	return fallback;
}
