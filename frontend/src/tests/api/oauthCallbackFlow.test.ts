/**
 * @jest-environment node
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';

/**
 * O `@auth/core` é ESM puro e o Jest deste projeto não o carrega sem transformar node_modules. Em vez de
 * alargar a transformação para toda a suíte, o fluxo OAuth completo roda num processo Node próprio
 * (scripts/verificar-oauth-callback.mjs), e esta guarda exige que ele saia verde.
 */
describe('fluxo OAuth completo do Auth.js com provedor simulado', () => {
	it('recusa e-mail não verificado e aceita o verificado, do csrf à sessão', () => {
		const frontend = path.resolve(__dirname, '..', '..', '..');
		const execucao = spawnSync(
			process.execPath,
			['--disable-warning=MODULE_TYPELESS_PACKAGE_JSON', 'scripts/verificar-oauth-callback.mjs'],
			{ cwd: frontend, encoding: 'utf8', timeout: 60_000 },
		);
		const resultado = execucao.stdout.slice(execucao.stdout.indexOf('{'), execucao.stdout.lastIndexOf('}') + 1);
		expect({ status: execucao.status, saida: execucao.stdout.split('\n').at(-2) }).toEqual({
			status: 0,
			saida: 'OK: fluxo OAuth completo recusa e-mail nao verificado e aceita o verificado.',
		});
		const { recusado, aceito } = JSON.parse(resultado) as Record<string, { sessaoCriada: boolean; pkce: string }>;
		expect(recusado?.sessaoCriada).toBe(false);
		expect(aceito?.sessaoCriada).toBe(true);
		expect(aceito?.pkce).toBe('S256');
	});
});
