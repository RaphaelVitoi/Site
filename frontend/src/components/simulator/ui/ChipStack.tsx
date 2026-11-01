'use client';

/**
 * IDENTITY: ChipStack (Componente Visual 3D de Fichas de Casino)
 * PATH: src/components/simulator/ui/ChipStack.tsx
 * ROLE: Renderização vetorial SVG de pilhas de fichas com estética SOTA de casino,
 *       bordas serrilhadas, listras de segurança e iluminação de profundidade.
 */

import { useMemo } from 'react';

export interface ChipStackProps {
	amountBb: number;
	className?: string;
	showLabel?: boolean;
}

interface Denomination {
	val: number;
	label: string;
	color: string;
	stripeColor: string;
	textColor: string;
	rimColor: string;
}

const DENOMINATIONS: Denomination[] = [
	{ val: 100, label: '100', color: '#090d16', stripeColor: '#f59e0b', textColor: '#fef3c7', rimColor: '#d97706' },
	{ val: 25, label: '25', color: '#047857', stripeColor: '#ffffff', textColor: '#ecfdf5', rimColor: '#10b981' },
	{ val: 5, label: '5', color: '#be123c', stripeColor: '#ffffff', textColor: '#fff1f2', rimColor: '#f43f5e' },
	{ val: 1, label: '1', color: '#1d4ed8', stripeColor: '#ffffff', textColor: '#eff6ff', rimColor: '#60a5fa' },
];

interface ChipDiskProps {
	id: string;
	denom: Denomination;
	layer: number;
	count: number;
}

function ChipDisk({ id, denom, layer, count }: Readonly<ChipDiskProps>) {
	const bottomOffset = layer * 3;
	const isTop = layer === count - 1;

	return (
		<svg
			key={id}
			width="22"
			height="10"
			viewBox="0 0 22 10"
			className="absolute drop-shadow-[0_2px_3px_rgba(0,0,0,0.6)] transition-all"
			style={{ bottom: `${bottomOffset}px` }}
			aria-hidden="true"
		>
			<ellipse cx="11" cy="5" rx="10" ry="4" fill={denom.color} stroke={denom.rimColor} strokeWidth="0.8" />
			<rect x="3" y="3" width="1.5" height="4" fill={denom.stripeColor} rx="0.5" opacity="0.9" />
			<rect x="17.5" y="3" width="1.5" height="4" fill={denom.stripeColor} rx="0.5" opacity="0.9" />
			<rect x="10.25" y="1.5" width="1.5" height="4" fill={denom.stripeColor} rx="0.5" opacity="0.9" />
			<ellipse
				cx="11"
				cy="5"
				rx="6"
				ry="2.2"
				fill="none"
				stroke={denom.rimColor}
				strokeWidth="0.6"
				strokeDasharray="1.5 1.5"
			/>
			{isTop ? <ellipse cx="11" cy="5" rx="3.5" ry="1.4" fill="rgba(255,255,255,0.15)" /> : null}
		</svg>
	);
}

interface ChipPillarProps {
	denom: Denomination;
	count: number;
	stackIdx: number;
}

function ChipPillar({ denom, count, stackIdx }: Readonly<ChipPillarProps>) {
	const heightPx = 14 + (count - 1) * 3;
	const layers = useMemo(
		() => Array.from({ length: count }, (_, i) => ({ layer: i, id: `chip-${denom.val}-lvl-${i}` })),
		[count, denom.val]
	);

	return (
		<div
			key={`stack-${denom.val}-${stackIdx}`}
			className="relative flex flex-col-reverse items-center"
			style={{ height: `${heightPx}px`, width: '22px' }}
		>
			{layers.map(({ layer, id }) => (
				<ChipDisk key={id} id={id} denom={denom} layer={layer} count={count} />
			))}
		</div>
	);
}

export function ChipStack({ amountBb, className = '', showLabel = false }: Readonly<ChipStackProps>) {
	const stacks = useMemo(() => {
		let remaining = Math.max(0, amountBb);
		const result: { denom: Denomination; count: number }[] = [];

		for (const denom of DENOMINATIONS) {
			if (remaining >= denom.val) {
				const count = Math.min(6, Math.floor(remaining / denom.val));
				remaining = remaining % denom.val;
				result.push({ denom, count });
			}
		}

		if (result.length === 0) {
			result.push({ denom: DENOMINATIONS.at(-1)!, count: 1 });
		}

		return result.slice(0, 3);
	}, [amountBb]);

	const rootClasses = ['inline-flex items-end gap-1.5 select-none', className].filter(Boolean).join(' ');

	return (
		<div className={rootClasses}>
			{stacks.map(({ denom, count }, stackIdx) => (
				<ChipPillar
					key={`pillar-${denom.val}-${stackIdx}`}
					denom={denom}
					count={count}
					stackIdx={stackIdx}
				/>
			))}

			{showLabel ? (
				<span className="text-[0.65rem] font-mono font-bold text-accent-emerald-light tabular-nums leading-none ml-1">
					{amountBb.toFixed(1)} BB
				</span>
			) : null}
		</div>
	);
}
