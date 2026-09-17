/**
 * Só entra sessão com e-mail que o provedor declara verificado.
 *
 * A área do operador (NEXUS_OPERATOR_EMAILS) confia no e-mail da sessão. O provedor Discord do
 * `@auth/core` 0.41.3 copia `profile.email` sem ler `profile.verified`: quem cadastrasse o e-mail
 * do operador numa conta Discord, sem confirmá-lo, entraria como operador. Provedor desconhecido
 * falha fechado — um provedor novo precisa declarar aqui qual campo prova a verificação.
 */
export function emailVerificadoPeloProvedor(provider: string | undefined, profile: unknown): boolean {
	if (typeof profile !== 'object' || profile === null) return false;
	const campos = profile as Record<string, unknown>;
	switch (provider) {
		case 'discord':
			return campos['verified'] === true;
		case 'google':
			return campos['email_verified'] === true;
		default:
			return false;
	}
}
