'use client';

import { pkoEmDesenvolvimentoHabilitado } from '@/lib/featureFlags';
import { RP_PISO_NUMERICO } from '@/lib/perspectiva';
import type { PkoPreview } from '../hooks/useQuantumEngine';

/**
 * Opções de PKO, em desenvolvimento.
 *
 * Os autos do projeto (biblioteca/estruturas-de-torneio) põem PKO fora do escopo do template Vanilla: bounties exigem
 * modelo próprio e regras da sala. Por isso o peso do bounty não altera nenhuma saída estabelecida do simulador —
 * frequências, RPs, Lente PM, Dashboard, pós-flop e exportação HRC seguem vanilla. Ligado, ele só produz a leitura
 * paralela abaixo, lado a lado com o RP vanilla. Desligado, nada muda.
 */
interface PkoDevControlProps {
	pkoValue: number;
	onPkoChange: (value: number) => void;
	preview: PkoPreview | null;
	isBaseline?: boolean;
}

const PESO_PADRAO = 0.25;

export function PkoDevControl({ pkoValue, onPkoChange, preview, isBaseline = false }: Readonly<PkoDevControlProps>) {
	const ligado = pkoValue > 0;

	// O portao mora aqui, e nao em quem renderiza: assim qualquer ponto de uso futuro herda o isolamento em vez de
	// precisar lembrar dele. Sem NEXT_PUBLIC_PKO_DEV=true o controle nao existe na arvore, e o peso fica em zero.
	if (!pkoEmDesenvolvimentoHabilitado()) return null;

	return (
		<section
			aria-label="PKO em desenvolvimento"
			className="relative z-10 flex flex-col gap-4 rounded-3xl border border-white/10 bg-slate-900/40 p-6 shadow-2xl backdrop-blur-md transition-all duration-500 hover:border-amber-400/20"
		>
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div className="flex items-center gap-3">
					<div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs">
						<i className="fa-solid fa-crosshairs" />
					</div>
					<div>
						<div className="flex items-center gap-2.5">
							<span className="text-[0.75rem] font-black tracking-[0.25em] text-white uppercase">
								Módulo PKO · Peso do Bounty
							</span>
							<span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-2.5 py-0.5 text-[0.55rem] font-black tracking-widest text-amber-300 uppercase shadow-[0_0_12px_rgba(251,191,36,0.15)]">
								Em desenvolvimento
							</span>
						</div>
						<p className="m-0 mt-0.5 text-[0.65rem] font-medium leading-relaxed text-text-muted">
							Simulação experimental. O motor analítico e as frequências Nash permanecem 100% fiéis ao template Vanilla.
						</p>
					</div>
				</div>

				<button
					type="button"
					aria-pressed={ligado}
					aria-label={ligado ? 'Desligar PKO' : 'Explorar PKO'}
					onClick={() => onPkoChange(ligado ? 0 : PESO_PADRAO)}
					className={`group/pko flex cursor-pointer items-center gap-2.5 rounded-2xl border px-5 py-3 text-[0.65rem] font-black tracking-[0.2em] uppercase transition-all duration-500 active:scale-95 ${
						ligado
							? 'border-amber-400/50 bg-amber-400/10 text-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.15)] hover:bg-amber-400/20'
							: 'border-white/10 bg-slate-900/80 text-text-muted hover:border-amber-400/30 hover:text-white hover:bg-slate-900'
					}`}
				>
					<div
						className={`h-2 w-2 rounded-full transition-all duration-500 ${
							ligado ? 'bg-amber-400 shadow-[0_0_8px_var(--color-amber-400,#f59e0b)]' : 'bg-text-darker group-hover/pko:bg-amber-400/60'
						}`}
					/>
					<span>{ligado ? 'Desligar PKO' : 'Explorar PKO'}</span>
					<span className="rounded border border-amber-400/30 bg-amber-400/10 px-1.5 py-0.5 text-[0.5rem] font-black tracking-wider text-amber-300/80 uppercase">
						DEV
					</span>
				</button>
			</div>

			{ligado && (
				<div className="mt-2 flex flex-col gap-4 pt-4 border-t border-white/5 animate-sota-in">
					<label className="flex items-center gap-4 text-[0.65rem] font-black tracking-widest text-text-muted uppercase">
						<span className="shrink-0 font-mono text-amber-300">Bounty Pool {Math.round(pkoValue * 100)}%</span>
						<input
							type="range"
							min="0.05"
							max="0.5"
							step="0.05"
							value={pkoValue}
							aria-label="Peso do bounty PKO"
							onChange={(e) => onPkoChange(Number.parseFloat(e.target.value))}
							className="accent-amber-400 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10 hover:bg-white/20 transition-colors"
						/>
					</label>

					{isBaseline || preview === null ? (
						<output className="block m-0 text-[0.65rem] text-text-dim">
							Sem RP neste cenário: a leitura PKO só existe onde há estrutura de prêmios.
						</output>
					) : (
						<dl className="m-0 grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-[0.75rem]">
							{(['ipRp', 'oopRp'] as const).map((lado) => (
								<div key={lado} className="rounded-2xl border border-white/5 bg-black/40 p-4 shadow-inner">
									<div className="flex items-center justify-between">
										<dt className="text-[0.6rem] font-black tracking-widest text-text-darker uppercase">
											RP {lado === 'ipRp' ? 'Agressor (IP)' : 'Defensor (OOP)'}
										</dt>
										<span className="text-[0.55rem] font-mono text-amber-300/60 uppercase">Preview PKO</span>
									</div>
									<dd className="m-0 mt-2 text-white text-base font-bold">
										{preview.vanilla[lado].toFixed(1)}% vanilla →{' '}
										{preview.comPko[lado] <= RP_PISO_NUMERICO
											? `≤ ${RP_PISO_NUMERICO.toFixed(1)}% com PKO (piso)`
											: `${preview.comPko[lado].toFixed(1)}% com PKO`}
									</dd>
								</div>
							))}
						</dl>
					)}

					{preview !== null && (preview.comPko.ipRp <= RP_PISO_NUMERICO || preview.comPko.oopRp <= RP_PISO_NUMERICO) && (
						<div className="flex items-start gap-2.5 rounded-xl border border-amber-400/20 bg-amber-500/5 p-3 text-[0.65rem] leading-relaxed text-amber-300/90">
							<i className="fa-solid fa-triangle-exclamation mt-0.5 shrink-0 text-amber-400 text-xs" />
							<span>
								O modelo de bounty exploratório soma o peso sobre o pool inteiro de prêmios e satura no piso numérico com qualquer peso. Falta a calibração de escala que um modelo de PKO próprio exige.
							</span>
						</div>
					)}
				</div>
			)}
		</section>
	);
}
