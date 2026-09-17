'use client';

/**
 * IDENTITY: PlayingCard (Componente Atômico de Carta de Poker)
 * PATH: src/components/simulator/ui/PlayingCard.tsx
 * ROLE: Renderização visual de alta fidelidade e contraste de cartas de baralho
 *       com padrão casino (fundo branco nítido e 4-color oficial: Copas ♥, Ouros ♦, Paus ♣, Espadas ♠).
 */

export interface PlayingCardProps {
	card?: string; // ex: 'Ah', 'Kd', '2c', 'Ts'
	rank?: string; // ex: 'A', 'K', 'T', '9'
	suit?: string; // ex: 'h', 'd', 'c', 's' ou símbolos '♥', '♦', '♣', '♠'
	isFacedown?: boolean;
	size?: 'xs' | 'sm' | 'md' | 'lg';
	className?: string;
	highlight?: boolean;
}

interface SuitConfig {
	symbol: string;
	name: string;
	textColor: string;
}

const DEFAULT_SUIT_CONFIG: SuitConfig = {
	symbol: '♠',
	name: 'Espadas',
	textColor: 'text-slate-900',
};

const SUIT_CONFIGS: Record<string, SuitConfig> = {
	h: {
		symbol: '♥',
		name: 'Copas',
		textColor: 'text-rose-600',
	},
	'♥': {
		symbol: '♥',
		name: 'Copas',
		textColor: 'text-rose-600',
	},
	d: {
		symbol: '♦',
		name: 'Ouros',
		textColor: 'text-sky-600',
	},
	'♦': {
		symbol: '♦',
		name: 'Ouros',
		textColor: 'text-sky-600',
	},
	c: {
		symbol: '♣',
		name: 'Paus',
		textColor: 'text-emerald-700',
	},
	'♣': {
		symbol: '♣',
		name: 'Paus',
		textColor: 'text-emerald-700',
	},
	s: {
		symbol: '♠',
		name: 'Espadas',
		textColor: 'text-slate-900',
	},
	'♠': {
		symbol: '♠',
		name: 'Espadas',
		textColor: 'text-slate-900',
	},
};

const SIZE_CLASSES = {
	xs: {
		box: 'w-7.5 h-10.5 rounded-md',
		rank: 'text-[0.75rem] font-mono font-black',
		suit: 'text-[0.65rem]',
	},
	sm: {
		box: 'w-9 h-12.5 rounded-lg',
		rank: 'text-sm font-mono font-black',
		suit: 'text-xs',
	},
	md: {
		box: 'w-11 h-15 rounded-xl',
		rank: 'text-base font-mono font-black',
		suit: 'text-sm',
	},
	lg: {
		box: 'w-14 h-19 rounded-2xl',
		rank: 'text-lg font-mono font-black',
		suit: 'text-base',
	},
};

export function parseCard(cardStr: string): { rank: string; suit: string } {
	if (!cardStr || cardStr.length < 2) return { rank: '?', suit: 's' };
	const rank = cardStr.slice(0, 1).toUpperCase();
	const suit = cardStr.slice(1, 2).toLowerCase();
	return { rank, suit };
}

export function PlayingCard({
	card,
	rank: explicitRank,
	suit: explicitSuit,
	isFacedown = false,
	size = 'md',
	className = '',
	highlight = false,
}: Readonly<PlayingCardProps>) {
	const parsed = card ? parseCard(card) : { rank: explicitRank ?? '?', suit: explicitSuit ?? 's' };
	const rank = explicitRank ?? parsed.rank;
	const suitKey = (explicitSuit ?? parsed.suit).toLowerCase();
	const suitCfg = SUIT_CONFIGS[suitKey] ?? DEFAULT_SUIT_CONFIG;
	const sizeCfg = SIZE_CLASSES[size];

	if (isFacedown) {
		return (
			<div
				className={`relative ${sizeCfg.box} border border-indigo-400/30 bg-gradient-to-br from-indigo-950 via-slate-950 to-indigo-900 flex flex-col items-center justify-center shadow-lg overflow-hidden select-none transition-all ${className}`}
				title="Carta oculta (Rua futura)"
				aria-label="Carta oculta"
			>
				{/* Padrão geométrico no verso da carta */}
				<div className="absolute inset-1 rounded-sm border border-indigo-400/20 bg-indigo-900/25 flex items-center justify-center">
					<div className="w-2.5 h-2.5 rotate-45 border border-indigo-400/50 bg-indigo-500/20" />
				</div>
			</div>
		);
	}

	return (
		<div
			className={`relative ${sizeCfg.box} bg-gradient-to-b from-white via-white to-slate-100 border border-slate-300 flex flex-col items-center justify-center gap-0 select-none transition-all shadow-md ${
				highlight ? 'ring-2 ring-emerald-500 shadow-[0_0_14px_rgba(16,185,129,0.7)] scale-105' : ''
			} ${className}`}
			title={`${rank} de ${suitCfg.name}`}
			aria-label={`${rank} de ${suitCfg.name}`}
		>
			<span className={`leading-none ${suitCfg.textColor} ${sizeCfg.rank} select-none`}>
				{rank}
			</span>
			<span className={`leading-none ${suitCfg.textColor} ${sizeCfg.suit} select-none`}>
				{suitCfg.symbol}
			</span>
		</div>
	);
}
