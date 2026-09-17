/**
 * Percorre o fluxo OAuth inteiro do Auth.js -- csrf, signin, callback, sessao -- sem credencial real.
 *
 * O `@auth/core` que o next-auth usa em producao roda de verdade: estado, PKCE, cookies, troca do
 * codigo e o callback `signIn` do projeto. So o Discord e simulado, pelo `customFetch` que o proprio
 * Auth.js expoe para isso. O que este script NAO prova: que o Discord e o Google reais devolvem
 * `verified`/`email_verified` no formato esperado, nem que as credenciais de producao estao certas.
 *
 * Uso, a partir de frontend/:  node scripts/verificar-oauth-callback.mjs
 * Sai com codigo 1 se algum cenario divergir.
 */
import { randomBytes } from 'node:crypto';
import { Auth, customFetch } from '@auth/core';
import Discord from '@auth/core/providers/discord';
import { emailVerificadoPeloProvedor } from '../src/lib/server/verified-email.ts';

const BASE = 'http://localhost:3000';

function configuracao(verificado) {
	const discordSimulado = async (url) => {
		const alvo = String(url);
		if (alvo.includes('/oauth2/token')) {
			return Response.json({ access_token: 'token-simulado', token_type: 'Bearer', expires_in: 3600, scope: 'identify email' });
		}
		if (alvo.includes('/users/@me')) {
			return Response.json({
				id: '80351110224678912',
				username: 'operador',
				global_name: 'Operador',
				discriminator: '0',
				avatar: null,
				email: 'operador@exemplo.com',
				verified: verificado,
			});
		}
		throw new Error(`requisicao inesperada ao provedor: ${alvo}`);
	};
	return {
		providers: [Discord({ clientId: 'id-simulado', clientSecret: 'segredo-simulado', [customFetch]: discordSimulado })],
		secret: randomBytes(32).toString('hex'),
		trustHost: true,
		basePath: '/api/auth',
		// Mesmo corpo do callback em src/auth.ts.
		callbacks: { signIn: ({ account, profile }) => emailVerificadoPeloProvedor(account?.provider, profile) },
	};
}

class Pote {
	cookies = new Map();
	guardar(resposta) {
		for (const linha of resposta.headers.getSetCookie()) {
			const [par] = linha.split(';');
			const i = par.indexOf('=');
			const nome = par.slice(0, i);
			const valor = par.slice(i + 1);
			if (valor === '' || /expires=Thu, 01 Jan 1970/i.test(linha)) this.cookies.delete(nome);
			else this.cookies.set(nome, valor);
		}
	}
	cabecalho() {
		return [...this.cookies].map(([k, v]) => `${k}=${v}`).join('; ');
	}
}

async function cenario(verificado) {
	const config = configuracao(verificado);
	const pote = new Pote();

	const csrf = await Auth(new Request(`${BASE}/api/auth/csrf`), config);
	pote.guardar(csrf);
	const { csrfToken } = await csrf.json();

	const signin = await Auth(
		new Request(`${BASE}/api/auth/signin/discord`, {
			method: 'POST',
			headers: { 'content-type': 'application/x-www-form-urlencoded', cookie: pote.cabecalho() },
			body: new URLSearchParams({ csrfToken, callbackUrl: `${BASE}/dashboard` }),
		}),
		config,
	);
	pote.guardar(signin);
	const autorizacao = new URL(signin.headers.get('location'));
	const state = autorizacao.searchParams.get('state');

	const callback = await Auth(
		new Request(`${BASE}/api/auth/callback/discord?code=codigo-simulado&state=${encodeURIComponent(state ?? '')}`, {
			headers: { cookie: pote.cabecalho() },
		}),
		config,
	);
	pote.guardar(callback);

	return {
		verificado,
		redirecionouAoDiscord: autorizacao.host === 'discord.com',
		pkce: autorizacao.searchParams.get('code_challenge_method'),
		statusCallback: callback.status,
		destino: callback.headers.get('location'),
		sessaoCriada: [...pote.cookies.keys()].some((k) => k.includes('session-token')),
	};
}

const recusado = await cenario(false);
const aceito = await cenario(true);
console.log(JSON.stringify({ recusado, aceito }, null, 2));

const falhas = [];
if (!recusado.redirecionouAoDiscord || !aceito.redirecionouAoDiscord) falhas.push('signin nao redirecionou ao provedor');
if (recusado.sessaoCriada) falhas.push('e-mail nao verificado criou sessao');
if (!String(recusado.destino).includes('error=AccessDenied')) falhas.push('recusa nao levou a AccessDenied');
if (!aceito.sessaoCriada) falhas.push('e-mail verificado nao criou sessao');
if (aceito.destino !== `${BASE}/dashboard`) falhas.push('login aceito nao voltou ao callbackUrl');
if (falhas.length) {
	console.error('DIVERGENCIA:', falhas);
	process.exit(1);
}
console.log('OK: fluxo OAuth completo recusa e-mail nao verificado e aceita o verificado.');
