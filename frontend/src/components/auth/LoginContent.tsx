/**
 * IDENTITY: Portal de Acesso
 * PATH: src/components/auth/LoginContent.tsx
 * ROLE: Autenticação real pelos provedores NextAuth configurados no ambiente.
 *
 * FE-01 (auditoria 2026-09-17). O botão "Entrar como Convidado SOTA" só fazia `router.push` para a
 * rota protegida, sem autenticar: o proxy devolvia a /login e o visitante ficava num ciclo. O Google
 * estava `disabled` e nenhum ponto da interface chamava `signIn`. O rodapé afirmava "Encryption
 * Active" numa página que não autenticava ninguém (FE-15).
 *
 * Agora a página lista os provedores que o servidor de fato expõe, e diz com clareza quando não há
 * nenhum configurado ou quando a conta autenticada não é operador.
 */

'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getProviders, signIn, useSession } from 'next-auth/react';
import { GlassPanel } from '@/components/ui/layout/GlassPanel';
import { SotaButton } from '@/components/ui/layout/SotaButton';
import { safeRedirectPath } from '@/app/(auth)/callback/redirect';

const ICONE_DO_PROVEDOR: Record<string, string> = {
	google: 'fa-brands fa-google',
	discord: 'fa-brands fa-discord',
	'dev-operator': 'fa-solid fa-terminal text-accent-indigo-light',
	credentials: 'fa-solid fa-terminal text-accent-indigo-light',
};

type ProvedorCliente = NonNullable<Awaited<ReturnType<typeof getProviders>>>[string];
type EstadoProvedores = { status: 'carregando' } | { status: 'pronto'; lista: ProvedorCliente[] } | { status: 'erro' };

export function LoginContent() {
	const searchParams = useSearchParams();
	const { data: session } = useSession();
	const callbackUrl = safeRedirectPath(searchParams.get('callbackUrl'));
	const restrito = searchParams.get('motivo') === 'restrito';

	const [provedores, setProvedores] = useState<EstadoProvedores>({ status: 'carregando' });
	const [entrando, setEntrando] = useState<string | null>(null);

	useEffect(() => {
		let ativo = true;
		getProviders()
			.then((resultado) => {
				if (ativo) setProvedores({ status: 'pronto', lista: Object.values(resultado ?? {}) });
			})
			.catch(() => {
				if (ativo) setProvedores({ status: 'erro' });
			});
		return () => {
			ativo = false;
		};
	}, []);

	const entrar = (id: string) => {
		setEntrando(id);
		void signIn(id, { redirectTo: callbackUrl });
	};

	return (
		<GlassPanel className="max-w-md w-full p-10 border-white/5 relative z-10">
			<div className="text-center mb-10">
				<div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-indigo/10 border border-accent-indigo/20 mb-6">
					<i className="fa-solid fa-shield-halved text-2xl text-accent-indigo-light" />
				</div>
				<h1 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Acesso</h1>
				<p className="text-text-muted text-sm leading-relaxed">
					Entre com uma conta para usar os recursos que dependem de sessão: Oráculo Gemma, RAG, busca web e
					histórico de decisões.
				</p>
			</div>

			{restrito ? (
				<p role="alert" className="mb-6 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-200">
					{session
						? 'Esta área é restrita ao operador. A conta atual está autenticada, mas não tem esse acesso.'
						: 'Esta área é restrita ao operador.'}
				</p>
			) : null}

			<div className="space-y-4">
				{provedores.status === 'carregando' ? (
					<p className="text-center text-text-muted text-xs uppercase tracking-widest">Consultando provedores…</p>
				) : null}

				{provedores.status === 'erro' ? (
					<p role="alert" className="text-center text-sm text-rose-300">
						Não foi possível consultar os provedores de login. Tente novamente em instantes.
					</p>
				) : null}

				{provedores.status === 'pronto' && provedores.lista.length === 0 ? (
					<output className="block text-center text-sm text-text-muted">
						Nenhum provedor de login está configurado neste ambiente.
					</output>
				) : null}

				{provedores.status === 'pronto'
					? provedores.lista.map((provedor) => (
							<SotaButton
								key={provedor.id}
								variant="primary"
								fullWidth
								onClick={() => entrar(provedor.id)}
								disabled={entrando !== null}
							>
								<i className={`${ICONE_DO_PROVEDOR[provedor.id] ?? 'fa-solid fa-right-to-bracket'} mr-3`} aria-hidden="true" />
								{entrando === provedor.id ? 'Redirecionando…' : `Entrar com ${provedor.name}`}
							</SotaButton>
						))
					: null}
			</div>
		</GlassPanel>
	);
}

