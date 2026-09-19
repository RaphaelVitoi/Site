import 'server-only';

/**
 * IDENTITY: Identidade de operador do Nexus
 * PATH: src/lib/server/operator.ts
 * ROLE: Decide, num único lugar, quem é operador — e portanto quem vê dado do operador.
 *
 * FE-04 (auditoria 2026-09-17). `/dashboard` exigia só a existência de um token NextAuth, e os
 * provedores são Google e Discord: qualquer conta desses serviços veria a fila, o orçamento e o
 * perfil preditivo global do operador. Sessão prova quem a pessoa é, não o que ela pode ver.
 *
 * A lista vem de `NEXUS_OPERATOR_EMAILS` (separada por vírgula). Lista vazia falha FECHADO:
 * ninguém é operador até que o ambiente declare alguém.
 */
export const DEV_OPERATOR_EMAIL = 'operador@local.nexus';

export function operatorEmails(environment: Partial<NodeJS.ProcessEnv> = process.env): Set<string> {
	const emails = new Set(
		(environment['NEXUS_OPERATOR_EMAILS'] ?? '')
			.split(',')
			.map((email) => email.trim().toLowerCase())
			.filter((email) => email.includes('@')),
	);
	if (environment['NODE_ENV'] === 'development') {
		emails.add(DEV_OPERATOR_EMAIL);
	}
	return emails;
}

export function isOperatorEmail(
	email: unknown,
	environment: Partial<NodeJS.ProcessEnv> = process.env,
): boolean {
	if (typeof email !== 'string' || !email.includes('@')) return false;
	return operatorEmails(environment).has(email.trim().toLowerCase());
}
