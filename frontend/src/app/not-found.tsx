import Link from 'next/link';

export default function NotFound() {
	return (
		<div className="flex min-h-[65vh] flex-col items-center justify-center px-4 py-16 text-center">
			<div className="border-border-subtle bg-bg-panel/40 mx-auto max-w-md rounded-2xl border p-8 shadow-2xl backdrop-blur-md">
				<div className="font-mono text-accent-gold mb-2 text-6xl font-extrabold tracking-widest">
					404
				</div>
				<h1 className="font-heading text-text-bright mb-3 text-2xl font-bold tracking-tight">
					Território Fora do Grafo
				</h1>
				<p className="text-text-muted mb-8 text-sm leading-relaxed">
					As coordenadas solicitadas não constam nos vetores indexados ou a rota foi
					deslocada pelo motor de topologia.
				</p>
				<div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
					<Link
						href="/"
						className="bg-accent-indigo hover:bg-accent-indigo-light inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all"
					>
						<i className="fa-solid fa-house" aria-hidden="true" />
						Página Principal
					</Link>
					<Link
						href="/simulador"
						className="border-border-subtle text-text-main hover:bg-bg-elevated hover:text-text-bright inline-flex items-center justify-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-medium transition-colors"
					>
						<i className="fa-solid fa-microchip" aria-hidden="true" />
						Simulador SOTA
					</Link>
				</div>
			</div>
		</div>
	);
}
