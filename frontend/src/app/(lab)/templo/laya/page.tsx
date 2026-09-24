/**
 * IDENTITY: Painel Visual SOTA Laya Multilingual S1 (Solver Bridge & GPU Telemetria)
 * PATH: frontend/src/app/(lab)/templo/laya/page.tsx
 * ROLE: Interface visual para administradores e desenvolvedores inspecionarem,
 *       modularem e homologarem o modelo System-1 Laya Multilingual (322M) conectado
 *       aos solvers analíticos (CFR+, Monte Carlo, TimesFM 2.5/3.0, Dream-RSI, Pluribus).
 * VERSION: v8.0 GOLD
 */

'use client';

import { useState } from 'react';
import { ContentPageHeader } from '@/components/ui/layout/ContentPageHeader';
import { GlassPanel } from '@/components/ui/layout/GlassPanel';
import { SotaButton } from '@/components/ui/layout/SotaButton';
import {
	CANONICAL_LAYA_MODEL,
	CANONICAL_LAYA_REPO,
	type LayaSolverBridgePayload,
} from '@/lib/laya';

interface SolverConfig {
	id: string;
	name: string;
	badge: string;
	color: string;
	description: string;
	defaultParams: Record<string, number | string>;
}

const SOLVERS_CONFIG: SolverConfig[] = [
	{
		id: 'cfr-plus',
		name: 'CFR+ (Regret Matching+)',
		badge: 'Game Theory',
		color: 'from-blue-500/20 to-cyan-500/20 border-cyan-400/40 text-cyan-300',
		description: 'Modulação de iterações, Regret Discounting (alpha) e convergência para Equilíbrio de Nash.',
		defaultParams: { iterations: 2000, discount_alpha: 0.8 },
	},
	{
		id: 'monte-carlo',
		name: 'Monte Carlo Insolvency (WASM)',
		badge: 'Risk & Equity',
		color: 'from-emerald-500/20 to-teal-500/20 border-emerald-400/40 text-emerald-300',
		description: 'Expansão dinâmica de amostragem (1.5x) e injeção do Teorema de Ruína sob alta complexidade.',
		defaultParams: { simulations_count: 10000, confidence_level: 0.95 },
	},
	{
		id: 'timesfm',
		name: 'Google TimesFM 2.5 / 3.0',
		badge: 'Time Series Foundation',
		color: 'from-purple-500/20 to-indigo-500/20 border-purple-400/40 text-purple-300',
		description: 'Expansão de horizonte preditivo de EV e focalização em quantil de cauda (q90 vs q50).',
		defaultParams: { horizon: 15, mode: 'commercial' },
	},
	{
		id: 'dream-rsi',
		name: 'Google Dream-RSI (Recursive Self-Improvement)',
		badge: 'Autonomous Discovery',
		color: 'from-amber-500/20 to-orange-500/20 border-amber-400/40 text-amber-300',
		description: 'Poda preditiva antecipada de ramos da árvore e calibração de barreira termodinâmica.',
		defaultParams: { pruning_margin: 0.05, s1_pruning_threshold: 0.25 },
	},
	{
		id: 'pluribus',
		name: 'Pluribus (Depth-Limited)',
		badge: 'Multiway Solver',
		color: 'from-rose-500/20 to-pink-500/20 border-rose-400/40 text-rose-300',
		description: 'Multiplicador de profundidade de busca e calibração do coeficiente lambda de adversários.',
		defaultParams: { iterations: 1000, lambda_factor: 1.2 },
	},
];

const PRESET_SCENARIOS = [
	{
		label: 'Bolha de FT (88 no SB vs Shove do Chip Leader)',
		state: 'Final table bubble. Hero has 12bb in SB with 8c8d. Chip leader pushes all-in from cutoff. Risk of immediate bustout before payjump.',
		solver: 'cfr-plus',
	},
	{
		label: 'Flop Seco em Posição (AhKd em 2c 7d Jh)',
		state: 'Hero is in BB with AhKd. Flop is 2c 7d Jh. Pot 100, villain bets 50. High showdown equity but polarized turn pressure.',
		solver: 'monte-carlo',
	},
	{
		label: 'Série Temporal de Bankroll & Decaimento de EV',
		state: 'Multi-session MTT variance telemetry showing downward drift after bubble bursts with high ICM risk.',
		solver: 'timesfm',
	},
	{
		label: 'Simulação Evolving World & Poda Preditiva',
		state: 'Exploration of deep game tree branches with severe ICM penalty. Candidate branch evaluated for pruning.',
		solver: 'dream-rsi',
	},
];

export default function LayaSolverBridgePage() {
	const [selectedSolverId, setSelectedSolverId] = useState<string>('cfr-plus');
	const [stateInput, setStateInput] = useState<string>(PRESET_SCENARIOS[0]?.state || '');
	const [loading, setLoading] = useState<boolean>(false);
	const [bridgeResult, setBridgeResult] = useState<LayaSolverBridgePayload | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState<'workbench' | 'telemetria' | 'deploy'>('workbench');
	const [copiedKey, setCopiedKey] = useState<string | null>(null);

	const activeSolver = SOLVERS_CONFIG.find((s) => s.id === selectedSolverId) || SOLVERS_CONFIG[0];

	const handleExecuteBridge = async () => {
		setLoading(true);
		setError(null);
		try {
			const res = await fetch('/api/sota/laya/solve', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					solver_name: selectedSolverId,
					state: stateInput,
					base_parameters: activeSolver?.defaultParams,
				}),
			});

			const json = await res.json();
			if (!res.ok || json.status === 'ERROR') {
				throw new Error(json.error || `Erro HTTP ${res.status}`);
			}
			setBridgeResult(json.bridge_result);
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : 'Falha na requisição da rota /api/sota/laya/solve';
			setError(msg);
		} finally {
			setLoading(false);
		}
	};

	const copyToClipboard = (text: string, key: string) => {
		navigator.clipboard.writeText(text);
		setCopiedKey(key);
		setTimeout(() => setCopiedKey(null), 2000);
	};

	return (
		<div className="min-h-screen bg-bg-base text-text-bright overflow-x-hidden font-body pb-24">
			<ContentPageHeader
				title="Laya Multilingual S1 — Solver Bridge"
				subtitle="Painel de Modulação Analítica System-1 & Telemetria GPU (Checkpoint Canônico 322M)"
				category="Área Restrita Dev / Admin"
				icon="fa-microchip"
			/>

			<div className="sota-container -mt-8 relative z-10 space-y-8">
				{/* Status & Telemetry Strip */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
					<GlassPanel className="p-4 border-cyan-500/30 bg-cyan-950/20">
						<div className="text-text-muted text-xs font-mono uppercase tracking-wider mb-1 flex items-center justify-between">
							<span>Modelo Canônico</span>
							<i className="fa-solid fa-cube text-cyan-400" />
						</div>
						<div className="text-sm font-black text-cyan-200 truncate" title={CANONICAL_LAYA_REPO}>
							{CANONICAL_LAYA_MODEL} (322M)
						</div>
						<div className="text-xs text-text-muted mt-1 font-mono">mmBERT-base · RLCD Calibrated</div>
					</GlassPanel>

					<GlassPanel className="p-4 border-emerald-500/30 bg-emerald-950/20">
						<div className="text-text-muted text-xs font-mono uppercase tracking-wider mb-1 flex items-center justify-between">
							<span>Latência de Forward Pass</span>
							<i className="fa-solid fa-bolt text-emerald-400" />
						</div>
						<div className="text-xl font-black text-emerald-300">~232 ms</div>
						<div className="text-xs text-text-muted mt-1 font-mono">CPU Validado · ~30ms em GPU</div>
					</GlassPanel>

					<GlassPanel className="p-4 border-purple-500/30 bg-purple-950/20">
						<div className="text-text-muted text-xs font-mono uppercase tracking-wider mb-1 flex items-center justify-between">
							<span>Router Cache</span>
							<i className="fa-solid fa-memory text-purple-400" />
						</div>
						<div className="text-xl font-black text-purple-300">Memória Ativa</div>
						<div className="text-xs text-text-muted mt-1 font-mono">Speedup de 100x vs recarga</div>
					</GlassPanel>

					<GlassPanel className="p-4 border-amber-500/30 bg-amber-950/20">
						<div className="text-text-muted text-xs font-mono uppercase tracking-wider mb-1 flex items-center justify-between">
							<span>Solvers Acoplados</span>
							<i className="fa-solid fa-network-wired text-amber-400" />
						</div>
						<div className="text-xl font-black text-amber-300">4 Pilares + 2 SOTA</div>
						<div className="text-xs text-text-muted mt-1 font-mono">CFR+, MC, TimesFM, Dream-RSI</div>
					</GlassPanel>
				</div>

				{/* Navigation Tabs */}
				<div className="flex space-x-2 border-b border-white/10 pb-2">
					<button
						type="button"
						onClick={() => setActiveTab('workbench')}
						className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
							activeTab === 'workbench'
								? 'bg-accent-indigo text-white shadow-lg shadow-indigo-500/20'
								: 'text-text-muted hover:text-white hover:bg-white/5'
						}`}
					>
						<i className="fa-solid fa-sliders" />
						Workbench Interativo
					</button>

					<button
						type="button"
						onClick={() => setActiveTab('telemetria')}
						className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
							activeTab === 'telemetria'
								? 'bg-accent-indigo text-white shadow-lg shadow-indigo-500/20'
								: 'text-text-muted hover:text-white hover:bg-white/5'
						}`}
					>
						<i className="fa-solid fa-chart-column" />
						Telemetria de Homologação
					</button>

					<button
						type="button"
						onClick={() => setActiveTab('deploy')}
						className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
							activeTab === 'deploy'
								? 'bg-accent-indigo text-white shadow-lg shadow-indigo-500/20'
								: 'text-text-muted hover:text-white hover:bg-white/5'
						}`}
					>
						<i className="fa-solid fa-server" />
						Deploy & Microserviço GPU
					</button>
				</div>

				{/* TAB 1: WORKBENCH INTERATIVO */}
				{activeTab === 'workbench' && (
					<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
						{/* Left Column: Configuration & Controls */}
						<div className="lg:col-span-5 space-y-6">
							<GlassPanel className="p-6 border-white/10">
								<h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
									<i className="fa-solid fa-bullseye text-cyan-400" />
									1. Selecione o Solver Analítico
								</h2>

								<div className="grid grid-cols-1 gap-2.5">
									{SOLVERS_CONFIG.map((solver) => {
										const isSelected = solver.id === selectedSolverId;
										return (
											<button
												key={solver.id}
												type="button"
												onClick={() => setSelectedSolverId(solver.id)}
												className={`text-left p-3 rounded-lg border transition-all ${
													isSelected
														? `bg-white/10 ${solver.color} shadow-md`
														: 'bg-white/2 border-white/5 text-text-muted hover:bg-white/5 hover:border-white/10'
												}`}
											>
												<div className="flex items-center justify-between">
													<span className="font-bold text-sm text-white">{solver.name}</span>
													<span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 border border-white/10">
														{solver.badge}
													</span>
												</div>
												<p className="text-xs text-text-muted mt-1 leading-relaxed">
													{solver.description}
												</p>
											</button>
										);
									})}
								</div>
							</GlassPanel>

							<GlassPanel className="p-6 border-white/10">
								<div className="flex items-center justify-between mb-3">
									<h2 className="text-base font-bold text-white flex items-center gap-2">
										<i className="fa-solid fa-file-lines text-amber-400" />
										2. Estado / Hand History
									</h2>
									<span className="text-xs font-mono text-text-muted">
										{stateInput.length} caracteres
									</span>
								</div>

								{/* Presets */}
								<div className="mb-3">
									<label htmlFor="preset-select" className="text-xs font-mono text-text-muted block mb-1">Cenários Prontos:</label>
									<select
										id="preset-select"
										aria-label="Cenários Prontos"
										className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-text-bright focus:outline-none focus:border-cyan-400"
										onChange={(e) => {
											const preset = PRESET_SCENARIOS[Number(e.target.value)];
											if (preset) {
												setStateInput(preset.state);
												setSelectedSolverId(preset.solver);
											}
										}}
									>
										{PRESET_SCENARIOS.map((p, idx) => (
											<option key={p.label} value={idx} className="bg-bg-surface text-text-bright">
												{p.label}
											</option>
										))}
									</select>
								</div>

								<textarea
									value={stateInput}
									onChange={(e) => setStateInput(e.target.value)}
									rows={4}
									placeholder="Descreva o estado do jogo, spot, ação ou parâmetros para o Laya System-1..."
									className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-text-bright focus:outline-none focus:border-cyan-400 font-mono leading-relaxed"
								/>

								<div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
									<div className="text-xs text-text-muted font-mono">
										Endpoint: <code className="text-cyan-300">/api/sota/laya/solve</code>
									</div>
									<SotaButton
										onClick={handleExecuteBridge}
										disabled={loading || !stateInput.trim()}
										className="px-6 py-2"
									>
										{loading ? (
											<>
												<i className="fa-solid fa-circle-notch fa-spin mr-2" />
												Modulando S1...
											</>
										) : (
											<>
												<i className="fa-solid fa-play mr-2" />
												Executar Modulação
											</>
										)}
									</SotaButton>
								</div>

								{error && (
									<div className="mt-4 p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300">
										<i className="fa-solid fa-triangle-exclamation mr-1.5" />
										{error}
									</div>
								)}
							</GlassPanel>
						</div>

						{/* Right Column: Visual Feedback & Modulation Diff */}
						<div className="lg:col-span-7 space-y-6">
							{bridgeResult ? (
								<>
									{/* Top Gauges: RLCD Signals */}
									<GlassPanel className="p-6 border-cyan-500/30 bg-cyan-950/10">
										<div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
											<div>
												<h3 className="text-lg font-bold text-white flex items-center gap-2">
													<i className="fa-solid fa-wave-square text-cyan-400" />
													Sinais Neurais System-1 (RLCD Calibrated)
												</h3>
												<p className="text-xs text-text-muted">
													Sinais derivados do forward pass direto no checkpoint mmBERT-base de 322M.
												</p>
											</div>
											<div className="text-xs font-mono px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300">
												{bridgeResult.target_solver.toUpperCase()}
											</div>
										</div>

										<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
											{/* Noul Gauge */}
											<div className="p-3 rounded-lg bg-black/40 border border-white/5 text-center">
												<div className="text-[11px] font-mono text-text-muted uppercase mb-1">
													Prob. Noul
												</div>
												<div className="text-2xl font-black text-cyan-300">
													{bridgeResult.s1_prediction.noul?.toFixed(4) ?? 'N/A'}
												</div>
												<div className="text-[10px] text-text-muted mt-0.5">
													{bridgeResult.s1_prediction.noul && bridgeResult.s1_prediction.noul > 0.6
														? 'Baixo Risco'
														: 'Incerteza / Risco'}
												</div>
											</div>

											{/* Choice Badge */}
											<div className="p-3 rounded-lg bg-black/40 border border-white/5 text-center">
												<div className="text-[11px] font-mono text-text-muted uppercase mb-1">
													Decisão (Choice)
												</div>
												<div className="text-lg font-black text-amber-300 capitalize truncate">
													{bridgeResult.s1_prediction.choice ?? 'N/A'}
												</div>
												<div className="text-[10px] text-text-muted mt-0.5">
													Triagem Categórica
												</div>
											</div>

											{/* Score */}
											<div className="p-3 rounded-lg bg-black/40 border border-white/5 text-center">
												<div className="text-[11px] font-mono text-text-muted uppercase mb-1">
													Score Contínuo
												</div>
												<div className="text-2xl font-black text-emerald-300">
													{bridgeResult.s1_prediction.score?.toFixed(3) ?? 'N/A'}
												</div>
												<div className="text-[10px] text-text-muted mt-0.5">
													Intensidade S1
												</div>
											</div>

											{/* Ruin Priority (Vitoi) */}
											<div className="p-3 rounded-lg bg-black/40 border border-white/5 text-center">
												<div className="text-[11px] font-mono text-text-muted uppercase mb-1">
													Prior de Ruína
												</div>
												<div className="text-2xl font-black text-rose-300">
													{bridgeResult.ruin_priority.toFixed(3)}x
												</div>
												<div className="text-[10px] text-text-muted mt-0.5">
													Barreira de Ruína
												</div>
											</div>
										</div>
									</GlassPanel>

									{/* Comparison Diff Matrix */}
									<GlassPanel className="p-6 border-white/10">
										<h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
											<i className="fa-solid fa-code-compare text-emerald-400" />
											Modulação de Parâmetros (Antes vs Adaptado pelo S1)
										</h3>

										<div className="overflow-x-auto">
											<table className="w-full text-left text-xs font-mono">
												<thead>
													<tr className="border-b border-white/10 text-text-muted uppercase tracking-wider">
														<th className="py-2 px-3">Parâmetro</th>
														<th className="py-2 px-3">Valor Base</th>
														<th className="py-2 px-3">Modulado Laya S1</th>
														<th className="py-2 px-3">Efeito Analítico</th>
													</tr>
												</thead>
												<tbody className="divide-y divide-white/5">
													{Object.entries(bridgeResult.adapted_parameters).map(([key, val]) => {
														const baseVal = activeSolver?.defaultParams[key];
														const isModified = baseVal !== undefined && baseVal !== val;
														return (
															<tr key={key} className={isModified ? 'bg-emerald-950/20' : ''}>
																<td className="py-2.5 px-3 text-cyan-200 font-bold">{key}</td>
																<td className="py-2.5 px-3 text-text-muted">{String(baseVal ?? '—')}</td>
																<td className="py-2.5 px-3">
																	<span
																		className={`px-2 py-0.5 rounded ${
																			isModified
																				? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30'
																				: 'text-text-bright'
																		}`}
																	>
																		{String(val)}
																	</span>
																</td>
																<td className="py-2.5 px-3 text-text-muted">
																	{isModified ? (
																		<span className="text-emerald-400">
																			<i className="fa-solid fa-arrow-trend-up mr-1" />
																			Ajustado por S1
																		</span>
																	) : (
																		'Preservado'
																	)}
																</td>
															</tr>
														);
													})}
												</tbody>
											</table>
										</div>
									</GlassPanel>

									{/* Framework Signals & Provenance Accordion */}
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<GlassPanel className="p-4 border-white/10">
											<h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
												<i className="fa-solid fa-tower-broadcast text-purple-400" />
												Sinais Emitidos para o Solver
											</h4>
											<div className="space-y-1.5 font-mono text-xs">
												{Object.entries(bridgeResult.framework_signals).map(([sigKey, sigVal]) => (
													<div
														key={sigKey}
														className="flex items-center justify-between p-2 rounded bg-black/40 border border-white/5"
													>
														<span className="text-text-muted">{sigKey}</span>
														<span className="text-purple-300 font-bold">{String(sigVal)}</span>
													</div>
												))}
											</div>
										</GlassPanel>

										<GlassPanel className="p-4 border-white/10">
											<h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
												<i className="fa-solid fa-stamp text-amber-400" />
												Contrato de Proveniência §4
											</h4>
											<div className="space-y-1 font-mono text-[11px] text-text-muted">
												<div>
													<span className="text-white/60">Engine ID:</span>{' '}
													<span className="text-amber-200">{bridgeResult.provenia.engine_id}</span>
												</div>
												<div>
													<span className="text-white/60">Runtime:</span>{' '}
													<span className="text-white">{bridgeResult.provenia.runtime_used}</span>
												</div>
												<div>
													<span className="text-white/60">Pesos Carregados:</span>{' '}
													<span
														className={
															bridgeResult.provenia.weights_loaded
																? 'text-emerald-400'
																: 'text-amber-400'
														}
													>
														{String(bridgeResult.provenia.weights_loaded)}
													</span>
												</div>
												<div>
													<span className="text-white/60">Fallback Ativo:</span>{' '}
													<span className="text-text-muted">
														{String(bridgeResult.provenia.fallback_used)}
													</span>
												</div>
												<div className="text-[10px] text-text-muted pt-1 truncate">
													Assunções: {bridgeResult.provenia.assumptions.join(', ')}
												</div>
											</div>
										</GlassPanel>
									</div>
								</>
							) : (
								<GlassPanel className="p-12 border-dashed border-white/10 text-center flex flex-col items-center justify-center min-h-[360px]">
									<i className="fa-solid fa-microchip text-4xl text-white/20 mb-4" />
									<h3 className="text-base font-bold text-white mb-2">Pronto para Modulação S1</h3>
									<p className="text-xs text-text-muted max-w-md leading-relaxed mb-6">
										Escolha um dos 4 pilares analíticos (CFR+, Monte Carlo, TimesFM, Dream-RSI) e
										clique em <strong>Executar Modulação</strong> para inspecionar os parâmetros adaptados
										em tempo real.
									</p>
									<SotaButton onClick={handleExecuteBridge} className="px-6 py-2">
										<i className="fa-solid fa-play mr-2" />
										Testar com Cenário Padrão
									</SotaButton>
								</GlassPanel>
							)}
						</div>
					</div>
				)}

				{/* TAB 2: TELEMETRIA DE HOMOLOGAÇÃO */}
				{activeTab === 'telemetria' && (
					<div className="space-y-6">
						<GlassPanel className="p-6 border-white/10">
							<h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
								<i className="fa-solid fa-chart-line text-emerald-400" />
								Benchmarks Medidos de Homologação (Local vs GPU Target)
							</h3>
							<p className="text-xs text-text-muted mb-6 leading-relaxed">
								Resultados obtidos via execução de{' '}
								<code className="text-cyan-300">scripts/ops/homologar_laya_gpu.py --allow-cpu</code> contra
								o checkpoint canônico 322M.
							</p>

							<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
								<div className="p-4 rounded-lg bg-black/40 border border-white/5">
									<div className="text-xs font-mono text-text-muted uppercase">Tempo de Warmup</div>
									<div className="text-2xl font-black text-white mt-1">28.74 s</div>
									<div className="text-[11px] text-text-muted mt-1">
										Download & carga do modelo de 322M (feita 1x)
									</div>
								</div>

								<div className="p-4 rounded-lg bg-black/40 border border-white/5">
									<div className="text-xs font-mono text-text-muted uppercase">
										Latência Média ($p_{'{50}'}$)
									</div>
									<div className="text-2xl font-black text-emerald-300 mt-1">234.84 ms</div>
									<div className="text-[11px] text-text-muted mt-1">
										CPU de validação (100x mais rápido que sem cache)
									</div>
								</div>

								<div className="p-4 rounded-lg bg-black/40 border border-white/5">
									<div className="text-xs font-mono text-text-muted uppercase">
										Vazão Concorrente (Batch 9)
									</div>
									<div className="text-2xl font-black text-cyan-300 mt-1">4.35 req/s</div>
									<div className="text-[11px] text-text-muted mt-1">
										Meta em GPU (L4 / A10G): &gt; 45.0 req/s
									</div>
								</div>
							</div>

							<div className="overflow-x-auto">
								<table className="w-full text-left text-xs font-mono">
									<thead>
										<tr className="border-b border-white/10 text-text-muted uppercase tracking-wider">
											<th className="py-2.5 px-3">Lote (Batch)</th>
											<th className="py-2.5 px-3">Requisições</th>
											<th className="py-2.5 px-3">Tempo Total (ms)</th>
											<th className="py-2.5 px-3">Latência Média</th>
											<th className="py-2.5 px-3">Vazão (req/s)</th>
											<th className="py-2.5 px-3">VRAM Alocada</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-white/5">
										<tr>
											<td className="py-2.5 px-3 font-bold text-white">Batch 1</td>
											<td className="py-2.5 px-3 text-text-muted">1</td>
											<td className="py-2.5 px-3 text-white">242.0 ms</td>
											<td className="py-2.5 px-3 text-emerald-400">242.0 ms</td>
											<td className="py-2.5 px-3 text-cyan-300">4.13 req/s</td>
											<td className="py-2.5 px-3 text-text-muted">0.0 MB (CPU)</td>
										</tr>
										<tr>
											<td className="py-2.5 px-3 font-bold text-white">Batch 4</td>
											<td className="py-2.5 px-3 text-text-muted">4</td>
											<td className="py-2.5 px-3 text-white">931.2 ms</td>
											<td className="py-2.5 px-3 text-emerald-400">232.8 ms</td>
											<td className="py-2.5 px-3 text-cyan-300">4.30 req/s</td>
											<td className="py-2.5 px-3 text-text-muted">0.0 MB (CPU)</td>
										</tr>
										<tr>
											<td className="py-2.5 px-3 font-bold text-white">Batch 9</td>
											<td className="py-2.5 px-3 text-text-muted">9</td>
											<td className="py-2.5 px-3 text-white">2071.0 ms</td>
											<td className="py-2.5 px-3 text-emerald-400">230.1 ms</td>
											<td className="py-2.5 px-3 text-cyan-300">4.35 req/s</td>
											<td className="py-2.5 px-3 text-text-muted">0.0 MB (CPU)</td>
										</tr>
									</tbody>
								</table>
							</div>
						</GlassPanel>
					</div>
				)}

				{/* TAB 3: DEPLOY & MICROSERVIÇO GPU */}
				{activeTab === 'deploy' && (
					<div className="space-y-6">
						<GlassPanel className="p-6 border-white/10">
							<h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
								<i className="fa-solid fa-server text-cyan-400" />
								Comandos de Deploy e Microserviço GPU
							</h3>
							<p className="text-xs text-text-muted mb-6 leading-relaxed">
								Receitas canônicas para subir o motor de inferência Laya Multilingual com aceleração
								por hardware NVIDIA CUDA.
							</p>

							<div className="space-y-4">
								{/* Docker Run */}
								<div className="p-4 rounded-lg bg-black/40 border border-white/5">
									<div className="flex items-center justify-between mb-2">
										<span className="text-xs font-mono font-bold text-white">
											Docker Run com Passthrough NVIDIA:
										</span>
										<button
											type="button"
											onClick={() =>
												copyToClipboard(
													'docker run --gpus all -d -p 8192:8192 --name laya-gpu nexus-sota/laya-multilingual-gpu:latest',
													'docker',
												)
											}
											className="text-xs font-mono text-cyan-400 hover:text-cyan-300"
										>
											{copiedKey === 'docker' ? 'Copiado!' : 'Copiar'}
										</button>
									</div>
									<pre className="text-xs font-mono text-text-muted p-2 rounded bg-black/60 overflow-x-auto">
										docker run --gpus all -d -p 8192:8192 --name laya-gpu
										nexus-sota/laya-multilingual-gpu:latest
									</pre>
								</div>

								{/* Docker Compose */}
								<div className="p-4 rounded-lg bg-black/40 border border-white/5">
									<div className="flex items-center justify-between mb-2">
										<span className="text-xs font-mono font-bold text-white">
											Docker Compose (tools/laya_service/docker-compose.gpu.yml):
										</span>
										<button
											type="button"
											onClick={() =>
												copyToClipboard(
													'docker compose -f tools/laya_service/docker-compose.gpu.yml up -d',
													'compose',
												)
											}
											className="text-xs font-mono text-cyan-400 hover:text-cyan-300"
										>
											{copiedKey === 'compose' ? 'Copiado!' : 'Copiar'}
										</button>
									</div>
									<pre className="text-xs font-mono text-text-muted p-2 rounded bg-black/60 overflow-x-auto">
										docker compose -f tools/laya_service/docker-compose.gpu.yml up -d
									</pre>
								</div>

								{/* GCP GCE */}
								<div className="p-4 rounded-lg bg-black/40 border border-white/5">
									<div className="flex items-center justify-between mb-2">
										<span className="text-xs font-mono font-bold text-white">
											Provisionamento GCP Compute Engine (NVIDIA L4 / T4):
										</span>
										<button
											type="button"
											onClick={() =>
												copyToClipboard(
													'gcloud compute instances create sota-laya-inference-node --zone=us-central1-a --machine-type=g2-standard-4 --accelerator=type=nvidia-l4,count=1',
													'gcp',
												)
											}
											className="text-xs font-mono text-cyan-400 hover:text-cyan-300"
										>
											{copiedKey === 'gcp' ? 'Copiado!' : 'Copiar'}
										</button>
									</div>
									<pre className="text-xs font-mono text-text-muted p-2 rounded bg-black/60 overflow-x-auto">
										gcloud compute instances create sota-laya-inference-node --zone=us-central1-a
										--machine-type=g2-standard-4 --accelerator=type=nvidia-l4,count=1
									</pre>
								</div>
							</div>
						</GlassPanel>
					</div>
				)}
			</div>
		</div>
	);
}
