'use client';

/**
 * IDENTITY: Mesa de Poker Responsiva & Laboratório Didático de Boards
 * PATH: src/components/simulator/ui/BayesianPokerTable.tsx
 * ROLE: Visualizar a mesa de 6 jogadores com posições dinâmicas (Hero/Vilão/Dealer),
 *       cartas comunitárias no feltro e seletores interativos de bordo ao lado.
 */

import { useMemo } from 'react';
import { PlayingCard } from './PlayingCard';

export type TablePosition = 'BTN' | 'SB' | 'BB' | 'UTG' | 'MP' | 'CO';
export type BoardTextureId = 'aula1_2' | 'dry' | 'wet' | 'paired' | 'monotone';

export interface BoardPreset {
	id: BoardTextureId;
	name: string;
	cards: string[]; // 5 cartas completas (Flop + Turn + River)
	tacticalBadge: string;
	description: string;
}

export const CANONICAL_BOARD_PRESETS: Record<BoardTextureId, BoardPreset> = {
	aula1_2: {
		id: 'aula1_2',
		name: 'Aula 1.2 · FT Kd Jc Ts',
		cards: ['Kd', 'Jc', 'Ts', '2d', '3h'],
		tacticalBadge: 'Spot Canônico · RP +8.5%',
		description: 'FT 9-Max: BTN 38bb vs BB 53bb (cobre). Pot 5.63bb. BU RP 21.4% vs BB 12.9% (Risk Advantage +8.5%).',
	},
	dry: {
		id: 'dry',
		name: 'Bordo Seco',
		cards: ['Ah', 'Kd', '2c', '7s', '2h'],
		tacticalBadge: 'Desconectado · Top Heavy',
		description: 'Sem draws evidentes. Favorece broadways, trincas raras e top pairs secos.',
	},
	wet: {
		id: 'wet',
		name: 'Bordo Molhado',
		cards: ['Jh', 'Th', '9d', '8c', '2s'],
		tacticalBadge: 'Conectado · Alta Dinâmica',
		description: 'Densidade extrema de sequências e flush draws. Ranges médios retêm muita equidade.',
	},
	paired: {
		id: 'paired',
		name: 'Bordo Dobrado',
		cards: ['Qc', 'Qd', '4s', '9h', 'As'],
		tacticalBadge: 'Par Dobrado · Polarizado',
		description: 'Reduz combinações de top pairs. Polarização forte em trincas/full houses vs air.',
	},
	monotone: {
		id: 'monotone',
		name: 'Bordo Monotone',
		cards: ['Kh', '8h', '3h', 'Jh', '2c'],
		tacticalBadge: '3 Copas · Flush Alert',
		description: 'Três cartas do mesmo naipe. Mãos com o Às de copas ganham valor de blefe imenso.',
	},
};

const SEATS: { pos: TablePosition; label: string; xPct: number; yPct: number; isIpByDefault: boolean; ftStack: string }[] = [
	{ pos: 'BTN', label: 'Botão (BTN)', xPct: 20, yPct: 82, isIpByDefault: true, ftStack: '38 BB' },
	{ pos: 'SB', label: 'Small Blind', xPct: 5, yPct: 45, isIpByDefault: false, ftStack: '13 BB' },
	{ pos: 'BB', label: 'Big Blind', xPct: 20, yPct: 15, isIpByDefault: false, ftStack: '53 BB' },
	{ pos: 'UTG', label: 'Under the Gun', xPct: 50, yPct: 8, isIpByDefault: false, ftStack: '9.3 BB' },
	{ pos: 'MP', label: 'Middle Position', xPct: 80, yPct: 18, isIpByDefault: false, ftStack: '6.9 BB' },
	{ pos: 'CO', label: 'Cutoff', xPct: 85, yPct: 75, isIpByDefault: true, ftStack: '24 BB' },
];

export interface BayesianPokerTableProps {
	boardTexture: BoardTextureId;
	onSelectBoardTexture: (texture: BoardTextureId) => void;
	streetStep?: number; // 0: Flop (3 cartas), 1: Turn (4 cartas), 2: River (5 cartas)
	heroPosition?: TablePosition;
	villainPosition?: TablePosition;
	onSelectVillainPosition?: (pos: TablePosition) => void;
	onSelectHeroPosition?: (pos: TablePosition) => void;
	currentPot?: number;
}

export function BayesianPokerTable({
	boardTexture,
	onSelectBoardTexture,
	streetStep = 0,
	heroPosition = 'BTN',
	villainPosition = 'BB',
	onSelectVillainPosition,
	onSelectHeroPosition,
	currentPot = 15.0,
}: Readonly<BayesianPokerTableProps>) {
	const activePreset = CANONICAL_BOARD_PRESETS[boardTexture] ?? CANONICAL_BOARD_PRESETS.dry;

	const streetLabel = useMemo(() => {
		if (streetStep === 0) return 'Flop';
		if (streetStep === 1) return 'Turn';
		return 'River';
	}, [streetStep]);

	// Determina se o vilão está IP ou OOP relativo ao Hero
	const isHeroInPosition = useMemo(() => {
		const order: TablePosition[] = ['SB', 'BB', 'UTG', 'MP', 'CO', 'BTN'];
		const heroIdx = order.indexOf(heroPosition);
		const villainIdx = order.indexOf(villainPosition);
		return heroIdx > villainIdx;
	}, [heroPosition, villainPosition]);

	return (
		<div className="flex flex-col gap-6 w-full">
			{/* HEADER DO CARD DIDÁTICO */}
			<div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
				<div className="flex items-center gap-3">
					<div className="w-2.5 h-2.5 rounded-full bg-accent-emerald animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
					<h4 className="text-[0.75rem] font-black text-white uppercase tracking-[0.2em] m-0">
						Mesa Interativa &middot; Topologia do Spot
					</h4>
					<span className="text-[0.55rem] font-mono px-2 py-0.5 rounded-full bg-accent-emerald/10 border border-accent-emerald/30 text-accent-emerald uppercase font-bold">
						{streetLabel} Ativo
					</span>
					{boardTexture === 'aula1_2' && (
						<span className="text-[0.52rem] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 uppercase">
							Risk Advantage: +8.5% (BU 21.4% vs BB 12.9%)
						</span>
					)}
				</div>

				<div className="flex items-center gap-2 text-[0.6rem] font-mono">
					<span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
						Hero: {heroPosition} ({isHeroInPosition ? 'IP · Vantagem' : 'OOP'})
					</span>
					<span className="px-2.5 py-1 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold">
						Vilão: {villainPosition} ({!isHeroInPosition ? 'IP' : 'OOP · Alvo PBS'})
					</span>
				</div>
			</div>

			{/* CONTAINER PRINCIPAL: MESA RESPONSIVA + SELETOR DE BOARDS AO LADO */}
			<div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
				{/* COLUNA ESQUERDA (XL:COL-SPAN-8): MESA DE POKER EM FELTRO */}
				<div className="xl:col-span-8 flex flex-col justify-center">
					<div className="relative w-full aspect-video sm:aspect-18/9 rounded-4xl p-3 sm:p-5 bg-linear-to-b from-slate-900 to-black border border-white/10 shadow-3xl overflow-hidden flex items-center justify-center select-none">
						{/* Glow ambiente no feltro */}
						<div className="absolute inset-0 bg-radial-[at_center_center] from-indigo-500/15 via-emerald-500/5 to-transparent pointer-events-none" />

						{/* RAIL ACOLCHOADO EXTERNO */}
						<div className="relative w-full h-full rounded-5xl p-3 sm:p-4 bg-linear-to-br from-slate-800 via-slate-900 to-black border-2 border-slate-700/60 shadow-2xl flex items-center justify-center">
							{/* Costura sutil do rail */}
							<div className="absolute inset-1.5 rounded-[2.8rem] border border-dashed border-white/10 pointer-events-none" />

							{/* FELTRO OVAL DA MESA */}
							<div className="relative w-full h-full rounded-[2.5rem] bg-linear-to-b from-slate-950 via-[#06201b] to-black border border-emerald-500/20 shadow-inner flex flex-col items-center justify-center p-4 overflow-hidden">
								{/* Marca d'água no feltro */}
								<div className="absolute top-4 text-center pointer-events-none">
									<span className="text-[0.55rem] sm:text-[0.65rem] font-black tracking-[0.5em] uppercase text-emerald-500/15 font-mono">
										POKER RACIONAL &middot; GTO CFR
									</span>
								</div>

								{/* CARTAS COMUNITÁRIAS (BOARD) NO CENTRO DA MESA */}
								<div className="relative z-10 flex flex-col items-center gap-2.5">
									<div className="flex items-center gap-1.5 sm:gap-2 p-2 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-md shadow-2xl">
										{activePreset.cards.map((card, idx) => {
											// idx 0, 1, 2 = Flop; idx 3 = Turn; idx 4 = River
											const isFlopCard = idx < 3;
											const isTurnCard = idx === 3;
											const isRiverCard = idx === 4;

											let streetInitial = 'R';
											if (isFlopCard) streetInitial = 'F';
											else if (isTurnCard) streetInitial = 'T';

											let isFacedown = false;
											if (streetStep === 0 && !isFlopCard) isFacedown = true;
											if (streetStep === 1 && isRiverCard) isFacedown = true;

											return (
												<div key={`board-${card}-${idx}`} className="flex flex-col items-center gap-1">
													<PlayingCard
														card={card}
														isFacedown={isFacedown}
														size="md"
														highlight={
															(streetStep === 0 && isFlopCard) ||
															(streetStep === 1 && isTurnCard) ||
															(streetStep === 2 && isRiverCard)
														}
													/>
													<span className="text-[0.45rem] font-mono text-text-dim uppercase tracking-wider font-bold">
														{streetInitial}
													</span>
												</div>
											);
										})}
									</div>

									{/* CHIP POT INDICATOR */}
									<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/80 border border-emerald-500/30 text-[0.6rem] font-mono font-black text-white shadow-lg">
										<div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
										<span className="text-text-muted">POTE:</span>
										<span className="text-accent-emerald-light">
											{boardTexture === 'aula1_2' ? currentPot.toFixed(2) : currentPot.toFixed(1)} BB
										</span>
									</div>
								</div>

								{/* ASSENTOS DOS JOGADORES AO REDOR DA BORDA */}
								{SEATS.map((seat) => {
									const isHero = seat.pos === heroPosition;
									const isVillain = seat.pos === villainPosition;
									const isDealer = seat.pos === 'BTN';

									let borderClass = 'border-white/10 bg-black/60 text-text-dim';
									if (isHero) {
										borderClass =
											'border-emerald-400 bg-emerald-950/80 text-white ring-2 ring-emerald-400/50 shadow-[0_0_12px_rgba(16,185,129,0.5)]';
									} else if (isVillain) {
										borderClass =
											'border-rose-400 bg-rose-950/80 text-white ring-2 ring-rose-400/50 shadow-[0_0_12px_rgba(244,63,94,0.5)]';
									}

									return (
										<div
											key={seat.pos}
											style={{
												position: 'absolute',
												left: `${seat.xPct}%`,
												top: `${seat.yPct}%`,
												transform: 'translate(-50%, -50%)',
											}}
											className="z-20 group"
										>
											<button
												type="button"
												onClick={() => {
													// Alterna vilão ao clicar em um assento não-hero
													if (!isHero && onSelectVillainPosition) {
														onSelectVillainPosition(seat.pos);
													} else if (isHero && onSelectHeroPosition) {
														// Se clicou no hero, cicla para próxima posição
														const nextMap: Record<TablePosition, TablePosition> = {
															BTN: 'CO',
															CO: 'MP',
															MP: 'UTG',
															UTG: 'BB',
															BB: 'SB',
															SB: 'BTN',
														};
														onSelectHeroPosition(nextMap[heroPosition]);
													}
												}}
												className={`flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl border backdrop-blur-md transition-all active:scale-95 cursor-pointer ${borderClass}`}
												title={`Clique para configurar posição (${seat.label})`}
											>
												{/* DEALER BUTTON CHIP */}
												{isDealer && (
													<span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-black font-mono text-[0.55rem] flex items-center justify-center shadow-md">
														D
													</span>
												)}

												<div className="flex flex-col items-start leading-tight">
													<div className="flex items-center gap-1">
														<span className="text-[0.55rem] sm:text-[0.65rem] font-black font-mono">
															{seat.pos}
														</span>
														{isHero && (
															<span className="text-[0.45rem] font-bold text-emerald-300 uppercase tracking-tight">
																(Hero)
															</span>
														)}
														{isVillain && (
															<span className="text-[0.45rem] font-bold text-rose-300 uppercase tracking-tight">
																(Vilão)
															</span>
														)}
													</div>
													<div className="flex items-center gap-1 text-[0.45rem] text-text-dim">
														<span>{seat.isIpByDefault ? 'IP' : 'OOP'}</span>
														{boardTexture === 'aula1_2' && seat.ftStack && (
															<>
																<span>&middot;</span>
																<span className="font-mono text-white/90 font-bold">
																	{seat.ftStack}
																</span>
															</>
														)}
													</div>
												</div>
											</button>
										</div>
									);
								})}
							</div>
						</div>
					</div>
				</div>

				{/* COLUNA DIREITA (XL:COL-SPAN-4): SELETOR DE BOARDS AO LADO + INSIGHT */}
				<div className="xl:col-span-4 flex flex-col justify-between gap-4">
					<div className="bg-black/40 p-4 sm:p-5 rounded-3xl border border-white/5 shadow-inner flex flex-col gap-3">
						<div className="flex items-center justify-between">
							<h5 className="text-[0.6rem] font-black text-text-muted uppercase tracking-[0.2em] m-0 flex items-center gap-2">
								<i className="fa-solid fa-layer-group text-accent-indigo" />
								<span>Boards &middot; Texturas de Bordo</span>
							</h5>
							<span className="text-[0.5rem] font-mono text-accent-indigo-light uppercase bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
								Claudico EHS²
							</span>
						</div>

						<p className="text-[0.6rem] text-text-dim leading-relaxed m-0 font-medium">
							Selecione uma textura canônica para observar como o Teorema de Bayes e as cartas
							comunitárias reconfiguram a distribuição de crença do vilão:
						</p>

						{/* LISTA DE CARDS DE TEXTURA SELECIONÁVEIS */}
						<div className="flex flex-col gap-2">
							{Object.values(CANONICAL_BOARD_PRESETS).map((preset) => {
								const isSelected = boardTexture === preset.id;
								return (
									<button
										type="button"
										key={preset.id}
										onClick={() => onSelectBoardTexture(preset.id)}
										className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-2 ${
											isSelected
												? 'bg-accent-indigo/15 border-accent-indigo shadow-[0_0_15px_rgba(99,102,241,0.25)]'
												: 'bg-white/5 border-white/5 hover:border-white/15 hover:bg-white/10'
										}`}
									>
										<div className="flex items-center justify-between flex-wrap gap-1">
											<div className="flex items-center gap-2">
												<span
													className={`text-[0.7rem] font-black uppercase tracking-wider ${
														isSelected ? 'text-white' : 'text-text-bright'
													}`}
												>
													{preset.name}
												</span>
												<span className="text-[0.65rem] font-mono font-bold text-accent-indigo-light bg-black/50 px-2 py-0.5 rounded-md border border-white/10">
													{preset.cards.slice(0, 3).join(' ')}
												</span>
												{isSelected && (
													<span className="w-1.5 h-1.5 rounded-full bg-accent-indigo animate-pulse" />
												)}
											</div>
											<span className="text-[0.5rem] font-mono text-text-dim px-2 py-0.5 rounded-md bg-black/40 border border-white/5">
												{preset.tacticalBadge}
											</span>
										</div>

										{/* CARTAS DO FLOP DESTA TEXTURA */}
										<div className="flex items-center gap-3">
											<div className="flex items-center gap-1.5 shrink-0">
												{preset.cards.slice(0, 3).map((c) => (
													<PlayingCard key={`${preset.id}-${c}`} card={c} size="sm" />
												))}
											</div>
											<span className="text-[0.6rem] text-text-muted italic leading-relaxed">
												{preset.description}
											</span>
										</div>
									</button>
								);
							})}
						</div>
					</div>

					{/* NOTA DIDÁTICA: POR QUE A POSIÇÃO E O BORDO IMPORTAM? */}
					<div className="p-4 bg-accent-indigo/5 border border-accent-indigo/10 rounded-2xl flex items-start gap-3">
						<i className="fa-solid fa-atom text-accent-indigo-light text-xs mt-0.5 shrink-0" />
						<div className="text-[0.6rem] text-text-muted leading-relaxed font-medium">
							<strong className="text-white font-bold block mb-0.5">Didática do Spot:</strong>
							<p className="m-0">
								Como o <span className="text-emerald-400 font-bold">Hero ({heroPosition})</span> detém
								vantagem posicional (IP), o{' '}
								<span className="text-rose-400 font-bold">Vilão ({villainPosition})</span> é forçado a agir
								primeiro (OOP). Cada check ou aposta dele fornece evidência pura que comprime os 1326
								combos em direção aos extremos da matriz.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
