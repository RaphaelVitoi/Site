'use client';

import { calcBF } from '@/components/simulator/engine/utils';
import { SotaTooltip } from '@/components/simulator/ui/SotaTooltip';

interface BubbleFactorDiagnosticProps {
	ipRp: number;
	oopRp: number;
}

export const BubbleFactorDiagnostic = ({ ipRp, oopRp }: Readonly<BubbleFactorDiagnosticProps>) => {
	const ipBf = calcBF(ipRp);
	const oopBf = calcBF(oopRp);
	const deltaRp = ipRp - oopRp;
	const ipEquity = ipBf / (ipBf + 2);
	const oopEquity = oopBf / (oopBf + 2);
	const chipEvEquity = 1 / 3;
	const ipDelta = ((ipEquity - chipEvEquity) * 100).toFixed(1);
	const oopDelta = ((oopEquity - chipEvEquity) * 100).toFixed(1);

	const hasIpAdvantage = deltaRp < 0;

	let deltaLabel = 'Simetria de Pressão (ΔRP 0%)';
	let panelBgClass = 'bg-bg-panel/40 border-white/5';
	let iconBgClass = 'bg-white/5 text-text-muted';
	let iconClass = 'fa-equals';
	let textClass = 'text-text-muted';

	if (hasIpAdvantage) {
		deltaLabel = `IP com Vantagem de Risco (ΔRP ${Math.abs(deltaRp).toFixed(1)}%)`;
		panelBgClass = 'bg-accent-emerald/5 border-accent-emerald/20';
		iconBgClass = 'bg-accent-emerald/10 text-accent-emerald';
		iconClass = 'fa-bolt-lightning';
		textClass = 'text-accent-emerald';
	} else if (deltaRp > 0) {
		deltaLabel = `IP sob Punição de Valuation (ΔRP +${deltaRp.toFixed(1)}%)`;
		panelBgClass = 'bg-accent-rose/5 border-accent-rose/20';
		iconBgClass = 'bg-accent-rose/10 text-accent-rose';
		iconClass = 'fa-biohazard';
		textClass = 'text-accent-rose';
	}

	return (
		<div className="space-y-6">
			<div className="p-6 rounded-3xl bg-black/20 border border-white/5 shadow-inner">
				<h4 className="text-label mb-6 flex items-center gap-2">
					<i className="fa-solid fa-microscope text-accent-indigo" />
					<span className="uppercase tracking-widest font-black text-[0.6rem]">
						Diagnóstico de Assimetria
					</span>
				</h4>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
					<SotaTooltip
						align="left"
						title="Agressor (IP)"
						content="O agressor dita o preço. Se o RP dele é significativamente menor, ele usa o Leverage para extrair Fold Equity não-linear da mesa."
						theme="indigo"
					>
						<div className="h-full p-6 rounded-2xl bg-bg-panel/40 border border-accent-indigo/20 relative overflow-hidden group transition-all hover:bg-bg-panel/60">
							<div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
								<i className="fa-solid fa-chess-knight text-5xl text-accent-indigo" />
							</div>
							<p className="text-[0.55rem] text-accent-indigo-light font-black uppercase tracking-[0.2em] mb-2">
								Agressor (IP)
							</p>
							<div className="flex items-baseline gap-2 mb-3">
								<span className="text-4xl font-black text-text-bright leading-none tabular-nums font-mono">
									{ipRp.toFixed(1)}%
								</span>
								<span className="text-xs text-accent-indigo font-mono font-bold uppercase tracking-widest">
									RP
								</span>
							</div>
							<p className="text-xs text-text-muted m-0 font-medium">
								BF Equivalente:{' '}
								<span className="text-accent-indigo-light font-mono font-bold tabular-nums">
									{ipBf.toFixed(2)}x
								</span>
							</p>
							<div className="mt-6 pt-4 border-t border-white/5">
								<p className="text-[0.6rem] text-text-darker uppercase font-black tracking-widest mb-2">
									Impacto em MDF:
								</p>
								<p className="text-sm font-bold text-text-muted tabular-nums font-mono">
									{(ipEquity * 100).toFixed(1)}%{' '}
									<span className="text-[0.65rem] font-medium text-text-darker">
										vs 33% ChipEV
									</span>
								</p>
								<p className="text-[0.6rem] text-accent-rose font-black uppercase mt-1 tabular-nums tracking-tighter">
									+{ipDelta}pp Inflação
								</p>
							</div>
						</div>
					</SotaTooltip>

					<SotaTooltip
						align="right"
						title="Defensor (OOP)"
						content="O defensor paga a conta do ICM. Ele precisa de uma mão exponencialmente mais forte para justificar o call, ancorando a defesa no Teto de Risco."
						theme="indigo"
					>
						<div className="h-full p-6 rounded-2xl bg-bg-panel/40 border border-accent-rose/20 relative overflow-hidden group transition-all hover:bg-bg-panel/60">
							<div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
								<i className="fa-solid fa-shield-halved text-5xl text-accent-rose" />
							</div>
							<p className="text-[0.55rem] text-accent-rose-light font-black uppercase tracking-[0.2em] mb-2">
								Defensor (OOP)
							</p>
							<div className="flex items-baseline gap-2 mb-3">
								<span className="text-4xl font-black text-text-bright leading-none tabular-nums font-mono">
									{oopRp.toFixed(1)}%
								</span>
								<span className="text-xs text-accent-rose font-mono font-bold uppercase tracking-widest">
									RP
								</span>
							</div>
							<p className="text-xs text-text-muted m-0 font-medium">
								BF Equivalente:{' '}
								<span className="text-accent-rose-light font-mono font-bold tabular-nums">
									{oopBf.toFixed(2)}x
								</span>
							</p>
							<div className="mt-6 pt-4 border-t border-white/5">
								<p className="text-[0.6rem] text-text-darker uppercase font-black tracking-widest mb-2">
									Impacto em MDF:
								</p>
								<p className="text-sm font-bold text-text-muted tabular-nums font-mono">
									{(oopEquity * 100).toFixed(1)}%{' '}
									<span className="text-[0.65rem] font-medium text-text-darker">
										vs 33% ChipEV
									</span>
								</p>
								<p className="text-[0.6rem] text-accent-rose font-black uppercase mt-1 tabular-nums tracking-tighter">
									+{oopDelta}pp Inflação
								</p>
							</div>
						</div>
					</SotaTooltip>
				</div>
			</div>

			<div
				className={`p-6 rounded-3xl border flex items-center gap-6 ${panelBgClass} transition-all duration-500 shadow-lg`}
			>
				<div
					className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl ${iconBgClass} border border-white/10`}
				>
					<i className={`fa-solid ${iconClass} text-xl`} />
				</div>
				<div>
					<p className="text-[0.55rem] font-black text-text-muted uppercase tracking-[0.3em] mb-1">
						Vetor de Distorção de Nash
					</p>
					<p
						className={`text-2xl font-black m-0 font-heading tracking-tighter tabular-nums ${textClass}`}
					>
						{deltaRp > 0 ? '+' : ''}
						{deltaRp.toFixed(1)}% <span className="text-sm ml-1 opacity-60">ΔRP</span>
					</p>
					<p className="text-xs text-text-muted m-0 mt-1 font-medium">{deltaLabel}</p>
				</div>
			</div>
		</div>
	);
};
