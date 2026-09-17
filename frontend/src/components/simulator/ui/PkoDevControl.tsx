'use client';

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

	return (
		<section
			aria-label="PKO em desenvolvimento"
			className="relative z-10 flex flex-col gap-4 rounded-2xl border border-dashed border-amber-400/30 bg-amber-500/5 p-5"
		>
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="flex items-center gap-3">
					<span className="text-[0.7rem] font-black tracking-[0.25em] text-white uppercase">PKO · peso do bounty</span>
					<span className="rounded border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[0.55rem] font-black tracking-widest text-amber-300 uppercase">
						Em desenvolvimento
					</span>
				</div>
				<button
					type="button"
					aria-pressed={ligado}
					onClick={() => onPkoChange(ligado ? 0 : PESO_PADRAO)}
					className="cursor-pointer rounded-xl border border-white/10 bg-slate-900/60 px-4 py-2 text-[0.6rem] font-black tracking-[0.2em] text-text-muted uppercase transition-colors hover:border-white/25 hover:text-white"
				>
					{ligado ? 'Desligar PKO' : 'Explorar PKO'}
				</button>
			</div>

			<p className="m-0 text-[0.65rem] leading-relaxed text-text-dim">
				Leitura exploratória. Não altera frequências, RPs, lentes nem a exportação HRC, que seguem o template vanilla.
			</p>

			{ligado && (
				<>
					<label className="flex items-center gap-4 text-[0.6rem] font-black tracking-widest text-text-muted uppercase">
						<span className="shrink-0">Peso {Math.round(pkoValue * 100)}%</span>
						<input
							type="range"
							min="0.05"
							max="0.5"
							step="0.05"
							value={pkoValue}
							aria-label="Peso do bounty PKO"
							onChange={(e) => onPkoChange(Number.parseFloat(e.target.value))}
							className="accent-amber-400 h-1 w-full cursor-pointer appearance-none rounded-full bg-white/10"
						/>
					</label>

					{isBaseline || preview === null ? (
						<output className="block m-0 text-[0.65rem] text-text-dim">
							Sem RP neste cenário: a leitura PKO só existe onde há estrutura de prêmios.
						</output>
					) : (
						<dl className="m-0 grid grid-cols-2 gap-3 font-mono text-[0.7rem]">
							{(['ipRp', 'oopRp'] as const).map((lado) => (
								<div key={lado} className="rounded-xl border border-white/5 bg-black/30 p-3">
									<dt className="text-[0.55rem] font-black tracking-widest text-text-darker uppercase">
										RP {lado === 'ipRp' ? 'IP' : 'OOP'}
									</dt>
									<dd className="m-0 mt-1 text-white">
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
						<p className="m-0 text-[0.6rem] leading-relaxed text-amber-300/80">
							O modelo de bounty exploratório soma o peso sobre o pool inteiro de prêmios e satura no piso numérico com
							qualquer peso. Falta a calibração de escala que um modelo de PKO próprio exige.
						</p>
					)}
				</>
			)}
		</section>
	);
}
