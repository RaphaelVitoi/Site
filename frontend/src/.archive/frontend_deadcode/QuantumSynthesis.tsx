'use client';

import { useMemo } from 'react';

interface QuantumSynthesisProps {
	readonly scenarioName: string;
	readonly verdict: string | null;
	readonly ipRp: number;
	readonly oopRp: number;
	readonly isNearPayjump: boolean;
	readonly blindsRisingSoon: boolean;
	readonly isVacuum: boolean;
}

function getContextualNarrative(
	isVacuum: boolean,
	isDeathZone: boolean,
	isNearPayjump: boolean,
	avgRp: number,
): string {
	if (isVacuum)
		return 'No Vácuo Matemático, a tensão é ZERO. Cada ficha vale exatamente 1 ficha. Aqui não há medo, apenas matemática linear.';
	if (isDeathZone && isNearPayjump)
		return 'ALERTA MÁXIMO: Death Zone + Bolha. A colisão é suicídio e o EV do fold é potencialmente positivo. Qualquer ação que não seja nuts puro é insolvente. O sistema exige paralisia quase absoluta do defensor.';
	if (isDeathZone)
		return 'ALERTA: Você está na Death Zone. A colisão aqui é suicídio mútuo. O sistema exige equity próxima ao nuts para prosseguir — a paz do Fold vale ouro.';
	if (isNearPayjump && avgRp > 20)
		return 'Tensão Extrema (RP alto + Payjump). O overfold é massivo e estrutural. EVs marginais são altamente instáveis: mãos com EV negativo no vácuo podem se tornar agressões lucrativas contra a aversão ao risco. O desvio (exploit) deve ser proporcional à credibilidade da leitura.';
	if (isNearPayjump)
		return 'Tensão Elevada (Bolha/Payjump). Oponentes tendem a dar overfold massivo. EVs marginais são instáveis: mãos fracas no vácuo podem ser agressões lucrativas explorando a aversão ao risco. Calibre o exploit pela credibilidade.';
	if (avgRp > 20)
		return 'Tensão Elevada. O ICM distorce o equilíbrio GTO. Overfold com mãos médias, ataque apenas com ranges polares. Calls marginais (EV perto de zero) são instáveis e perigosos contra humanos.';
	if (avgRp > 10)
		return 'Tensão Moderada. O jogo ainda se assemelha ao ChipEV, mas o peso dos payjumps começa a ser sentido. Stacks iguais sofrem mais; o CL opera com mais liberdade.';
	return 'Tensão Baixa. Próximo ao ChipEV puro. A assimetria ICM existe mas tem magnitude mínima — decisões marginais são estáveis.';
}

function getEsperancaMatConfig(isVacuum: boolean, isDeathZone: boolean, avgRp: number) {
	if (isVacuum) return { value: 'Linear', color: 'text-accent-emerald' };
	if (isDeathZone) return { value: 'Estrangulada', color: 'text-accent-danger' };
	if (avgRp > 20) return { value: 'Amortizada', color: 'text-accent-gold' };
	return { value: 'Dinâmica', color: 'text-accent-sky' };
}

function getThemeConfig(isDeathZone: boolean) {
	return {
		wrapperClass: isDeathZone
			? 'border-accent-danger/40 shadow-[0_0_40px_rgba(244,63,94,0.15)] animate-pulse'
			: 'border-accent-indigo/20 shadow-[0_8px_30px_rgba(99,102,241,0.15)] animate-sota-in',
		gaugeBorderTop: isDeathZone ? 'border-t-accent-danger' : 'border-t-accent-emerald',
		badgeColor: isDeathZone ? 'text-accent-danger' : 'text-accent-indigo-light',
		badgeBg: isDeathZone ? 'bg-accent-danger/10' : 'bg-accent-indigo/10',
		badgeText: isDeathZone ? '⚠️ ALERTA DE INSOLVÊNCIA' : 'Oráculo Pedagógico',
		rpColor: isDeathZone ? 'text-accent-danger' : 'text-accent-emerald',
		narrativeBorder: isDeathZone ? 'border-l-accent-danger' : 'border-l-accent-indigo',
		narrativeBg: isDeathZone
			? 'bg-gradient-to-r from-accent-danger/5 to-transparent'
			: 'bg-transparent',
	};
}

function getGaugeRightColor(avgRp: number, isDeathZone: boolean) {
	if (avgRp <= 20) return 'border-r-transparent';
	return isDeathZone ? 'border-r-accent-danger' : 'border-r-accent-gold';
}

export default function QuantumSynthesis({
	scenarioName,
	verdict: _verdict,
	ipRp,
	oopRp,
	isNearPayjump,
	blindsRisingSoon: _blindsRisingSoon,
	isVacuum,
}: Readonly<QuantumSynthesisProps>) {
	const avgRp = (ipRp + oopRp) / 2;
	const isDeathZone = avgRp > 35;

	const rotation = useMemo(() => {
		const clamped = Math.max(0, Math.min(60, avgRp));
		return (clamped / 60) * 180 - 90;
	}, [avgRp]);

	const borderRightClass = getGaugeRightColor(avgRp, isDeathZone);
	const ecoDoFuturoValue = isVacuum ? '0%' : 'Projetado';
	const estabilidadeEvColor =
		isNearPayjump || avgRp > 20 ? 'text-accent-pink' : 'text-accent-blue';
	const esperancaMat = getEsperancaMatConfig(isVacuum, isDeathZone, avgRp);

	const {
		wrapperClass,
		gaugeBorderTop,
		badgeColor,
		badgeBg,
		badgeText,
		rpColor,
		narrativeBorder,
		narrativeBg,
	} = getThemeConfig(isDeathZone);
	const narrativeText = getContextualNarrative(isVacuum, isDeathZone, isNearPayjump, avgRp);

	return (
		<div className={`mt-6 p-6 glass-panel border overflow-hidden relative ${wrapperClass}`}>
			<div className="flex justify-between items-start mb-5">
				<div className="flex gap-6 items-center">
					{/* Fear Gauge Visual */}
					<div className="w-20 h-11 relative overflow-hidden shrink-0">
						<div className="w-20 h-20 rounded-full border-8 border-white/5 absolute top-0 left-0"></div>
						<div
							className={`w-20 h-20 rounded-full border-8 border-transparent absolute top-0 left-0 -rotate-45 ${gaugeBorderTop} ${borderRightClass}`}
						></div>
						<div
							className="absolute bottom-0 left-1/2 w-0.5 h-8.75 bg-text-main origin-bottom -translate-x-1/2 shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-transform duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
							{...{
								style: { transform: `translateX(-50%) rotate(${rotation}deg)` },
							}}
						></div>
					</div>

					<div>
						<span
							className={`text-[0.55rem] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-md ${badgeColor} ${badgeBg}`}
						>
							{badgeText}
						</span>
						<h4 className="mt-2 text-lg text-text-main font-black font-heading tracking-tighter">
							{scenarioName}
						</h4>
					</div>
				</div>

				<div className="text-right">
					<span className="text-[0.55rem] text-text-dim uppercase font-black block tracking-widest">
						Tensão Sistêmica
					</span>
					<span className={`text-3xl font-black font-mono tracking-tighter ${rpColor}`}>
						{avgRp.toFixed(1)}%
					</span>
				</div>
			</div>

			<p
				className={`mb-6 text-sm text-text-light leading-relaxed border-l-4 ${narrativeBorder} pl-5 py-2 backdrop-blur-sm rounded-r-lg ${narrativeBg}`}
			>
				{narrativeText}
			</p>

			<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
				<ForceCard
					label="Gravidade ICM"
					value={isVacuum ? '0%' : 'Basal'}
					desc="Risco de queda na mesa de 9."
					active={!isVacuum}
				/>
				<ForceCard
					label="Prêmio Inatividade"
					value={isNearPayjump ? 'Ativo' : '0%'}
					desc="Lucro real por apenas existir."
					active={isNearPayjump}
					textColor="text-accent-gold"
				/>
				<ForceCard
					label="Eco do Futuro"
					value={ecoDoFuturoValue}
					desc="Tensão das próximas streets."
					active={!isVacuum}
					textColor="text-accent-violet"
				/>
				<ForceCard
					label="Estabilidade EV"
					value={isNearPayjump || avgRp > 20 ? 'Instável' : 'Linear'}
					desc="Margem de erros de range."
					active={true}
					textColor={estabilidadeEvColor}
				/>
				<ForceCard
					label="Esperança Mat."
					value={esperancaMat.value}
					desc="Viabilidade do outcome."
					active={true}
					textColor={esperancaMat.color}
				/>
			</div>
		</div>
	);
}

function ForceCard({
	label,
	value,
	desc,
	active,
	textColor = 'text-accent-emerald',
}: Readonly<{
	label: string;
	value: string;
	desc: string;
	active: boolean;
	textColor?: string;
}>) {
	const bgClass = active ? 'bg-gradient-to-br from-white/5 to-transparent' : 'bg-white/5';
	const borderClass = active
		? 'border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.02)]'
		: 'border-white/5';
	const opacityClass = active ? 'opacity-100' : 'opacity-40';
	const finalTextColor = active ? textColor : 'text-text-darker';

	return (
		<div
			className={`p-5 rounded-2xl border transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:border-white/20 ${bgClass} ${borderClass} ${opacityClass}`}
		>
			<span className="text-[0.5rem] text-text-dim uppercase font-black block mb-1 tracking-widest">
				{label}
			</span>
			<span
				className={`text-base font-black block font-heading tracking-tighter ${finalTextColor}`}
			>
				{value}
			</span>
			<span className="text-[0.55rem] text-text-darker leading-tight block mt-1.5">
				{desc}
			</span>
		</div>
	);
}
