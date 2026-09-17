/**
 * Contrato de deploy da autenticacao.
 *
 * Medido em 2026-09-17 com o servidor standalone rodando como a imagem Docker (NODE_ENV=production, sem .env,
 * que o .dockerignore exclui): /api/auth/session responde 500 UntrustedHost sem variavel de host, 500 tambem
 * com NEXTAUTH_URL, e 200 com AUTH_URL. O Auth.js v5 decide confiar no host por AUTH_URL, AUTH_TRUST_HOST,
 * VERCEL, CF_PAGES ou NODE_ENV fora de producao (@auth/core lib/utils/env.js); NEXTAUTH_URL so reescreve a URL.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const raiz = join(__dirname, '..', '..', '..');
const ler = (arquivo: string) => readFileSync(join(raiz, arquivo), 'utf8');
const variaveis = (texto: string) =>
	new Set(
		texto
			.split(/\r?\n/)
			.map((linha) => /^\s*([A-Z0-9_]+)\s*=/.exec(linha)?.[1])
			.filter((nome): nome is string => nome !== undefined),
	);

describe('deploy da autenticacao', () => {
	it('o .env.example documenta AUTH_URL, a variavel que o Auth.js v5 usa para confiar no host', () => {
		const nomes = variaveis(ler('.env.example'));
		expect(nomes.has('AUTH_URL')).toBe(true);
		expect(nomes.has('AUTH_SECRET')).toBe(true);
	});

	it('o .env.example nao ensina NEXTAUTH_URL, que em producao ainda responde 500 UntrustedHost', () => {
		expect(variaveis(ler('.env.example')).has('NEXTAUTH_URL')).toBe(false);
	});

	it('a imagem nao confia em qualquer host por conta propria', () => {
		expect(ler('Dockerfile')).not.toMatch(/^\s*ENV\s+AUTH_TRUST_HOST/m);
	});

	it('o Dockerfile declara as variaveis de autenticacao exigidas em runtime', () => {
		const dockerfile = ler('Dockerfile');
		expect(dockerfile).toMatch(/AUTH_URL/);
		expect(dockerfile).toMatch(/AUTH_SECRET/);
	});
});
