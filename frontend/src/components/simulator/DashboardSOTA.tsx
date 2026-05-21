'use client';

/**
 * IDENTITY: Dashboard SOTA v4.6 GOLD
 * PATH: src/components/simulator/DashboardSOTA.tsx
 * ROLE: Orquestrador de Telemetria e Assinatura Cognitiva.
 * AESTHETIC: SOTA Gold Standard (Visual Symmetry, Glassmorphism, Tabular Nums).
 */

import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import Image from 'next/image'; // SOTA: ImportaÃ§Ã£o estrita obrigatÃ³ria para evitar colisÃ£o com o DOM
import { use } from 'react';
import {
	PolarAngleAxis,
	PolarGrid,
	PolarRadiusAxis,
	Radar,
	RadarChart,
	Tooltip as RechartsTooltip,
	ResponsiveContainer,
} from 'recharts';
import { TelemetryCharts } from '../analytics/TelemetryCharts';
import { solveIcmDistortion } from './engine/nashSolver';
import { GemmaAnalysisPanel } from './GemmaAnalysisPanel';
import { InsolvencyMatrix } from './InsolvencyMatrix';
import { SotaMetricsContext, SotaSpotContext } from './SotaContext';
import { RiskGauge } from './ui/RiskGauge';

interface HistorianData {
	profile?: Record<string, number>;
	telemetry?: Array<{
		evLoss: number;
		isCorrect: boolean;
		createdAt: string | Date;
	}>;
}

interface DashboardSOTAProps {
	initialData?: HistorianData | null;
}

export default function DashboardSOTA({ initialData }: Readonly<DashboardSOTAProps> = {}) {
	const metricsContext = use(SotaMetricsContext);
	const spotContext = use(SotaSpotContext);

	const { data: session } = useSession();
	const userName = session?.user?.name || 'Operador AutÃ´nomo';

	const defaultProfile = {
		'AversÃ£o ao Risco': 0.85,
		'Pot Entrapment': 0.65,
		'Miopia de Payjump': 0.9,
		'Excesso de AgressÃ£o': 0.3,
		'Passivo Estrutural (RIO)': 0.75,
		'Desvio de Nash': 0.45,
	};

	const rawProfile = initialData?.profile || metricsContext?.predictiveProfile || defaultProfile;

	// SOTA Guard: Se a API falhar e retornar HTML/String, forÃ§a o fallback seguro.
	const activeProfile =
		typeof rawProfile === 'object' && rawProfile !== null && !Array.isArray(rawProfile)
			? rawProfile
			: defaultProfile;

	// SOTA: ExtraÃ§Ã£o do Contexto da Mesa (Fallbacks da Aula 1.2 empÃ­rica)
	const ipRp = spotContext?.effectiveIpRp ?? 21.4;
	const oopRp = spotContext?.effectiveOopRp ?? 12.9;
	const potSize = spotContext?.spotData?.pot ?? 7.5;

	// SOTA: Motor QuÃ¢ntico executado em tempo real na Interface
	const baselineFreqs = {
		ip_check: 40,
		ip_bet_small: 30,
		ip_bet_large: 30,
		oop_call: 50,
		oop_fold: 30,
		oop_raise: 20,
	};
	const nashResult = solveIcmDistortion(ipRp, oopRp, baselineFreqs, 1, potSize);

	const radarData = Object.keys(activeProfile).map((key) => ({
		subject: key,
		Deficiencia: Number((activeProfile[key as keyof typeof activeProfile] * 100).toFixed(1)),
	}));

	const topLeaks = Object.entries(activeProfile)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 3);

	const activeTelemetry = (initialData?.telemetry || metricsContext?.predictiveTelemetry)?.map(
		(t) => ({
			...t,
			createdAt: new Date(t.createdAt),
		}),
	) || [
		{
			evLoss: 1.2,
			isCorrect: false,
			createdAt: new Date(Date.now() - 7200000),
		},
		{ evLoss: 0, isCorrect: true, createdAt: new Date() },
	];

	return (
		<div className="flex flex-col gap-20 animate-sota-in tabular-nums">
			{/* Camada Superior: DiagnÃ³stico de Risco de RuÃ­na */}
			<div className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-12 items-stretch">
				<div className="glass-panel p-10 lg:p-14 rounded-4xl bg-bg-panel/40 border border-white/10 shadow-sota-glass relative transition-all duration-700 hover:border-white/20 group/insolvency-wrap overflow-hidden">
					<div className="absolute inset-0 bg-grain mix-blend-overlay opacity-5 pointer-events-none" />
					<div className="absolute inset-0 pointer-events-none">
						<div className="absolute -top-32 -right-32 w-64 h-64 bg-accent-indigo/10 blur-[120px] rounded-full group-hover/insolvency-wrap:bg-accent-indigo/20 transition-colors duration-1000" />
						<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(99,102,241,0.05),transparent)]" />
					</div>
					<div className="flex items-center justify-between mb-14 border-b border-white/5 pb-8 relative z-10">
						<div className="flex items-center gap-4">
							<div className="w-3 h-3 rounded-full bg-accent-indigo animate-pulse shadow-[0_0_15px_var(--color-accent-indigo)]" />
							<h3 className="text-[0.8rem] font-black text-white uppercase tracking-[0.4em] m-0 group-hover/insolvency-wrap:text-glow-indigo transition-all duration-500">
								Matriz de InsolvÃªncia SOTA
							</h3>
						</div>
						<div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 flex items-center gap-2">
							<div className="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-ping" />
							<span className="text-[0.55rem] font-black text-text-muted uppercase tracking-[0.3em]">
								Quantum Feed Live
							</span>
						</div>
					</div>
					<div className="relative z-10">
						<InsolvencyMatrix />
					</div>
				</div>

				<div className="glass-panel p-10 lg:p-14 rounded-4xl bg-bg-panel/40 border border-white/10 shadow-sota-glass flex flex-col justify-between relative transition-all duration-700 hover:border-white/20 group/pm-guide overflow-hidden">
					<div className="absolute inset-0 bg-grain mix-blend-overlay opacity-5 pointer-events-none" />
					<div className="absolute inset-0 pointer-events-none">
						<div className="absolute -top-24 -right-24 w-48 h-48 bg-accent-indigo/5 blur-3xl rounded-full transition-all duration-1000 group-hover/pm-guide:bg-accent-indigo/10" />
						<div className="absolute -bottom-32 -left-32 w-64 h-64 bg-accent-indigo/5 blur-3xl rounded-full transition-all duration-1000 group-hover/pm-guide:bg-accent-indigo/10" />
					</div>

					<div className="space-y-8 relative z-10">
						<div className="flex items-center gap-5 mb-6">
							<div className="w-14 h-14 rounded-2xl bg-accent-indigo/10 border border-accent-indigo/20 flex items-center justify-center text-accent-indigo-light relative overflow-hidden shadow-[0_0_30px_rgba(99,102,241,0.2)] group-hover/pm-guide:shadow-[0_0_40px_rgba(99,102,241,0.4)] transition-all duration-500">
								{/* SOTA: Blindagem JSX contra injeÃ§Ã£o de texto/comentÃ¡rios e tipagem estrita do componente Image */}
								{session?.user?.image ? (
									<Image
										src={session.user.image}
										alt={userName}
										width={56}
										height={56}
										className="object-cover"
									/>
								) : (
									<i className="fa-solid fa-user-gear text-2xl" />
								)}
							</div>
							<div>
								<h3 className="text-sm font-black text-white uppercase tracking-[0.25em] m-0 leading-none mb-2 group-hover/pm-guide:text-glow-indigo transition-all duration-500">
									Perspectiva MatemÃ¡tica
								</h3>
								<p className="text-[0.65rem] text-text-darker font-black uppercase tracking-widest m-0">
									Operador:{' '}
									<span className="text-accent-indigo-light font-bold">
										{userName}
									</span>
								</p>
							</div>
						</div>
						<p className="text-[0.9rem] text-text-muted leading-relaxed font-medium italic border-l-2 border-accent-indigo/40 pl-8 py-4 bg-white/2 rounded-r-2xl group-hover/pm-guide:border-accent-indigo transition-colors duration-500">
							&quot;A Matriz de InsolvÃªncia ao lado nÃ£o Ã© apenas um cÃ¡lculo de
							equidade, mas uma projeÃ§Ã£o A* Pathfinding de sobrevivÃªncia
							financeira.&quot;
						</p>

						{/* MÃ³dulo de Telemetria Visual SOTA */}
						<div className="flex justify-around items-center pt-2">
							<RiskGauge
								value={ipRp}
								label="IP (Agressor)"
								pos={spotContext?.spotData?.heroRange || 'BTN'}
								stack="40bb"
								baseColor="indigo"
								opponentValue={oopRp}
								dynamicDeathZone={41}
								maxRp={50}
							/>
							<RiskGauge
								value={oopRp}
								label="OOP (Defensor)"
								pos={spotContext?.spotData?.villainRange || 'BB'}
								stack="55bb"
								baseColor="pink"
								opponentValue={ipRp}
								dynamicDeathZone={41}
								maxRp={50}
							/>
						</div>

						{/* SOTA v4.5: Geometria do Risco & Estresse TopolÃ³gico */}
						<div className="grid grid-cols-3 gap-6 py-6 border-y border-white/5 my-4">
							<div className="flex flex-col items-center gap-1">
								<span className="text-[0.55rem] font-black text-text-darker uppercase tracking-widest">
									Fator Î¨
								</span>
								<span
									className={`text-sm font-black font-mono ${(activeProfile['Desvio de Nash'] ?? 0) > 0.5 ? 'text-accent-rose' : 'text-accent-indigo-light'}`}
								>
									{((activeProfile['Desvio de Nash'] ?? 0) * 100).toFixed(0)}%
								</span>
							</div>
							<div className="flex flex-col items-center gap-1">
								<span className="text-[0.55rem] font-black text-text-darker uppercase tracking-widest">
									Estresse
								</span>
								<span className="text-sm font-black font-mono text-white">
									{(
										metricsContext?.apiQuantumMetrics?.marginInstability ?? 0
									).toFixed(1)}
									%
								</span>
							</div>
							<div className="flex flex-col items-center gap-1">
								<span className="text-[0.55rem] font-black text-text-darker uppercase tracking-widest">
									SolvÃªncia
								</span>
								<div
									className={`w-3 h-3 rounded-full shadow-[0_0_10px_currentColor] ${metricsContext?.apiQuantumMetrics?.isSolvent ? 'text-accent-emerald bg-accent-emerald' : 'text-accent-danger bg-accent-danger animate-pulse'}`}
								/>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4 mt-2">
							<div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center flex flex-col items-center justify-center">
								<span className="block text-[0.6rem] text-text-muted uppercase tracking-widest mb-1">
									OOP Call (ChipEV)
								</span>
								<span className="text-xl font-mono font-black text-slate-400">
									50.0%
								</span>
							</div>
							<div className="p-4 bg-accent-rose/10 rounded-2xl border border-accent-rose/20 text-center flex flex-col items-center justify-center shadow-[0_0_15px_rgba(244,63,94,0.1)]">
								<span className="block text-[0.6rem] text-accent-rose uppercase tracking-widest mb-1">
									OOP Call (SOTA)
								</span>
								<span className="text-xl font-mono font-black text-accent-rose">
									{nashResult.oop.call.center.toFixed(1)}%
								</span>
							</div>
						</div>
						{/* SOTA v6: Bayesian Win Probability Expansion */}
						<div className="mt-4 p-4 bg-accent-indigo/10 rounded-2xl border border-accent-indigo/20 text-center flex flex-col items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.1)] relative overflow-hidden group/bayesian">
							<div className="absolute inset-0 bg-linear-to-r from-accent-indigo/0 via-accent-indigo/5 to-accent-indigo/0 -translate-x-full group-hover/bayesian:translate-x-full transition-transform duration-1000" />
							<span className="block text-[0.6rem] text-accent-indigo-light uppercase tracking-widest mb-1 relative z-10">
								Posterior Win Prob (Bayesian)
							</span>
							<span className="text-xl font-mono font-black text-accent-indigo-light relative z-10">
								{metricsContext?.apiQuantumMetrics?.bayesianWinProb?.toFixed(1) ??
									'--'}
								%
							</span>
						</div>
					</div>

					<div className="mt-12 pt-10 border-t border-white/5 relative z-10">
						<div className="flex items-center justify-between">
							<div className="flex flex-col gap-1">
								<span className="text-[0.55rem] font-black text-text-darker uppercase tracking-[0.4em]">
									Status da Mente
								</span>
								<div className="flex items-center gap-2">
									<div className="w-2 h-2 rounded-full bg-accent-indigo animate-pulse" />
									<span className="text-accent-indigo-light text-[0.65rem] font-black uppercase tracking-widest">
										Sincronizada (SOTA Gold)
									</span>
								</div>
							</div>
							<div className="flex -space-x-2">
								{[1, 2, 3].map((i) => (
									<div
										key={i}
										className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[0.5rem] font-bold text-slate-500"
									>
										U{i}
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Camada Inferior: Assinatura Cognitiva & Telemetria */}
			<section className="space-y-10 relative">
				<div className="flex items-center gap-8 mb-4">
					<h2 className="text-2xl font-black text-white tracking-tighter uppercase m-0 flex items-center gap-5 text-glow-emerald">
						<i className="fa-solid fa-brain text-accent-emerald shadow-[0_0_15px_var(--color-accent-emerald)]" />{' '}
						Assinatura Cognitiva
					</h2>
					<div className="h-px grow bg-linear-to-r from-white/10 to-transparent" />
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12">
					<div className="glass-panel p-10 rounded-4xl bg-bg-panel/40 border border-white/5 shadow-sota-glass flex flex-col items-center justify-between group/vulnerabilities relative overflow-hidden transition-all duration-700 hover:border-white/20">
						<div className="absolute inset-0 bg-grain mix-blend-overlay opacity-5 pointer-events-none" />
						<div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05),transparent)] pointer-events-none" />

						<div className="text-center space-y-2 mb-8 relative z-10">
							<h3 className="text-[0.7rem] font-black text-accent-indigo uppercase tracking-[0.3em] m-0 group-hover/vulnerabilities:text-glow-indigo transition-all duration-500">
								Vulnerabilidades
							</h3>
							<p className="text-[0.55rem] text-text-darker uppercase font-black tracking-widest">
								Mapeamento de Leaks Pre-Ffg
							</p>
						</div>

						<div className="h-80 w-full relative z-10">
							<ResponsiveContainer
								width="100%"
								height="100%"
								minWidth={0}
								minHeight={0}
							>
								<RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
									<defs>
										<linearGradient
											id="leakGradient"
											x1="0"
											y1="0"
											x2="1"
											y2="1"
										>
											<stop
												offset="5%"
												stopColor="var(--color-accent-emerald)"
												stopOpacity={0.6}
											/>
											<stop
												offset="95%"
												stopColor="var(--color-accent-emerald)"
												stopOpacity={0.1}
											/>
										</linearGradient>
									</defs>
									<PolarGrid
										stroke="rgba(255,255,255,0.05)"
										strokeDasharray="5 5"
									/>
									<PolarAngleAxis
										dataKey="subject"
										tick={{
											fill: '#94a3b8',
											fontSize: 10,
											fontWeight: 900,
											fontFamily: 'var(--font-mono)',
											letterSpacing: '0.1em',
										}}
									/>
									<PolarRadiusAxis
										angle={30}
										domain={[0, 100]}
										tick={false}
										axisLine={false}
									/>
									<Radar
										name="DeficiÃªncia (%)"
										dataKey="Deficiencia"
										stroke="var(--color-accent-emerald)"
										strokeWidth={3}
										fill="url(#leakGradient)"
										fillOpacity={0.4}
										animationDuration={2000}
									/>
									<RechartsTooltip
										contentStyle={{
											backgroundColor: '#020617',
											border: '1px solid rgba(16,185,129,0.3)',
											borderRadius: '16px',
											boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
											padding: '12px',
										}}
										itemStyle={{
											color: '#10b981',
											fontWeight: '900',
											textTransform: 'uppercase',
											fontSize: '10px',
										}}
									/>
								</RadarChart>
							</ResponsiveContainer>
						</div>

						<div className="w-full mt-10 space-y-6 relative z-10">
							<div className="flex items-center gap-3 border-b border-white/5 pb-4">
								<i className="fa-solid fa-microchip text-accent-indigo text-xs" />
								<h4 className="text-[0.6rem] font-black text-text-muted uppercase tracking-[0.2em] m-0">
									Top Leaks (IA Preditiva)
								</h4>
							</div>
							<div className="space-y-4">
								{topLeaks.map(([name, value], idx) => (
									<div key={name} className="flex flex-col gap-2 group/leak">
										<div className="flex justify-between items-center px-1">
											<span
												className={`text-[0.65rem] font-black uppercase tracking-widest transition-colors ${idx === 0 ? 'text-accent-rose group-hover/leak:text-glow-rose' : 'text-text-muted group-hover/leak:text-white'}`}
											>
												{name}
											</span>
											<span className="font-mono text-[0.7rem] font-black text-white tabular-nums">
												{(value * 100).toFixed(1)}%
											</span>
										</div>
										<div className="h-1 w-full bg-white/5 rounded-full overflow-hidden shadow-inner">
											<motion.div
												initial={{ width: 0 }}
												animate={{ width: `${value * 100}%` }}
												transition={{
													duration: 1.5,
													ease: 'easeOut',
													delay: idx * 0.2,
												}}
												className={`h-full rounded-full ${idx === 0 ? 'bg-accent-rose shadow-[0_0_8px_var(--color-accent-rose)]' : 'bg-accent-indigo shadow-[0_0_8px_var(--color-accent-indigo)]'}`}
											/>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>

					<div className="glass-panel p-10 rounded-4xl bg-bg-panel/40 border border-white/5 shadow-sota-glass flex flex-col relative overflow-hidden group/telemetry transition-all duration-700 hover:border-white/20">
						<div className="absolute inset-0 bg-grain mix-blend-overlay opacity-5 pointer-events-none" />
						<div className="absolute inset-0 bg-radial-[at_bottom_right] from-accent-emerald/5 to-transparent pointer-events-none transition-opacity duration-1000 group-hover/telemetry:opacity-100 opacity-60" />
						<div className="flex items-center justify-between mb-10 border-b border-white/5 pb-6 relative z-10">
							<div className="flex items-center gap-4">
								<div className="w-2.5 h-2.5 rounded-full bg-accent-emerald animate-pulse shadow-[0_0_10px_var(--color-accent-emerald)]" />
								<h3 className="text-[0.75rem] font-black text-white uppercase tracking-[0.4em] m-0 group-hover/telemetry:text-glow-emerald transition-all duration-500">
									Curva de Performance Temporal
								</h3>
							</div>
							<i className="fa-solid fa-chart-line text-text-darker text-sm group-hover/telemetry:text-accent-emerald transition-colors" />
						</div>
						<div className="relative z-10 grow flex flex-col justify-center">
							<TelemetryCharts data={activeTelemetry} />
						</div>
					</div>
				</div>

				{/* Painel OrÃ¡culo Local (Gemma Edge) */}
				<div className="mt-12 animate-sota-in">
					<div className="flex items-center gap-8 mb-4">
						<h2 className="text-2xl font-black text-white tracking-tighter uppercase m-0 flex items-center gap-5 text-glow-indigo">
							<i className="fa-solid fa-microchip text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" />{' '}
							Motor de InferÃªncia (Gemma Edge)
						</h2>
						<div className="h-px grow bg-linear-to-r from-white/10 to-transparent" />
					</div>
					<GemmaAnalysisPanel
						heroPos={spotContext?.spotData?.heroRange || 'BTN'}
						villainPos={spotContext?.spotData?.villainRange || 'BB'}
						potSize={potSize}
						heroStack={spotContext?.heroStack ?? 40}
						villainStack={spotContext?.villainStack ?? 55}
					/>
				</div>
			</section>
		</div>
	);
}
