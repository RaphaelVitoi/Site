'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { logTelemetryEvent } from '@/lib/telemetry-client';

interface ErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
}

export default function AppError({ error, reset }: ErrorProps) {
	useEffect(() => {
		logTelemetryEvent({
			category: 'error',
			componentName: 'AppRouterErrorBoundary',
			metadata: {
				message: error.message,
				stack: error.stack,
				digest: error.digest,
			},
		});
		console.error('[SOTA SENSOR] Uncaught runtime exception intercepted:', error);
	}, [error]);

	return (
		<div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-12 text-center">
			<div className="border-border-subtle bg-bg-panel/60 mx-auto max-w-lg rounded-2xl border p-8 shadow-2xl backdrop-blur-md">
				<div className="bg-accent-rose/10 text-accent-rose mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full text-2xl">
					<i className="fa-solid fa-triangle-exclamation" aria-hidden="true" />
				</div>
				<h1 className="font-heading text-text-bright mb-3 text-2xl font-bold tracking-tight">
					Interrupção no Fluxo de Execução
				</h1>
				<p className="text-text-muted mb-6 text-sm leading-relaxed">
					Uma oscilação inesperada foi interceptada no subsistema. O incidente foi
					registrado na telemetria neural para análise e contingência.
				</p>
				{error.digest && (
					<p className="border-border-subtle/50 text-text-dim bg-bg-deep/50 mb-6 rounded-md border px-3 py-1.5 font-mono text-xs">
						Digest ID: {error.digest}
					</p>
				)}
				<div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
					<button
						type="button"
						onClick={() => reset()}
						className="bg-accent-indigo hover:bg-accent-indigo-light inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-accent-indigo/50"
					>
						<i className="fa-solid fa-rotate-right" aria-hidden="true" />
						Recalibrar Execução
					</button>
					<Link
						href="/"
						className="border-border-subtle text-text-main hover:bg-bg-elevated hover:text-text-bright inline-flex items-center justify-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-medium transition-colors"
					>
						<i className="fa-solid fa-house" aria-hidden="true" />
						Retornar ao Início
					</Link>
				</div>
			</div>
		</div>
	);
}
