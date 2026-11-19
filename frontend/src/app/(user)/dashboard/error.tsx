'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { ROUTES } from '@/constants/routes';

interface DashboardErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
}

export default function DashboardError({ error, reset }: Readonly<DashboardErrorProps>) {
	useEffect(() => {
		console.error('[DASHBOARD_BOUNDARY]', error.digest ?? error.message);
	}, [error]);

	return (
		<main className="mx-auto flex min-h-[70dvh] w-full max-w-3xl items-center justify-center px-6 py-16">
			<section className="glass-panel w-full rounded-3xl border border-rose-500/30 bg-slate-950/75 p-8 shadow-2xl">
				<div className="mb-4 flex items-center gap-3 text-rose-300">
					<i className="fa-solid fa-triangle-exclamation text-xl" aria-hidden="true" />
					<span className="font-mono text-xs font-bold tracking-[0.2em] uppercase">
						Falha na Telemetria do Painel
					</span>
				</div>
				<h1 className="m-0 text-2xl font-black tracking-tight text-white">
					Não foi possível renderizar o Dashboard
				</h1>
				<p className="text-text-muted mt-3 text-sm leading-relaxed">
					Ocorreu uma instabilidade ao carregar os blocos operacionais. Nenhum dado local foi perdido e você
					pode tentar sincronizar novamente.
				</p>
				{error.digest ? (
					<p className="text-text-muted mt-2 font-mono text-xs">
						Código de rastreio: <span className="text-white/80">{error.digest}</span>
					</p>
				) : null}
				<div className="mt-6 flex flex-wrap items-center gap-3">
					<button
						type="button"
						onClick={reset}
						className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/40 bg-cyan-500/20 px-4 py-2 text-xs font-bold text-cyan-200 transition-colors hover:bg-cyan-500/30"
					>
						<i className="fa-solid fa-rotate-right" aria-hidden="true" />
						<span>Tentar novamente</span>
					</button>
					<Link
						href={ROUTES.HOME}
						className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white/85 transition-colors hover:bg-white/10 hover:text-white"
					>
						Voltar ao início
					</Link>
				</div>
			</section>
		</main>
	);
}
