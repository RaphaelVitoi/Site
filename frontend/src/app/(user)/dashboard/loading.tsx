/**
 * IDENTITY: Skeleton de rota do Dashboard SOTA
 * PATH: src/app/(user)/dashboard/loading.tsx
 * ROLE: Evita CLS durante navegação e streaming SSR dos painéis operacionais.
 */

export default function DashboardLoading() {
	return (
		<main className="mx-auto w-full max-w-7xl animate-pulse px-4 py-10 sm:px-6">
			<div className="mb-8 flex flex-col gap-3">
				<div className="h-4 w-44 rounded-full bg-white/10" />
				<div className="h-9 w-80 max-w-full rounded-2xl bg-white/10" />
			</div>

			<div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
				<div className="h-24 rounded-2xl border border-white/8 bg-slate-950/60" />
				<div className="h-24 rounded-2xl border border-white/8 bg-slate-950/60" />
				<div className="h-24 rounded-2xl border border-white/8 bg-slate-950/60" />
				<div className="h-24 rounded-2xl border border-white/8 bg-slate-950/60" />
			</div>

			<div className="space-y-6">
				<div className="h-64 w-full rounded-3xl border border-white/8 bg-slate-950/55" />
				<div className="h-72 w-full rounded-3xl border border-white/8 bg-slate-950/50" />
			</div>
		</main>
	);
}
