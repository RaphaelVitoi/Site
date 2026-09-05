'use client';

import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export type TooltipAlign = 'left' | 'center' | 'right';
export type TooltipTheme = 'indigo' | 'emerald' | 'rose';

export interface SotaTooltipProps {
	title: string;
	content?: string;
	desc?: string;
	align?: TooltipAlign;
	position?: 'top' | 'bottom';
	theme?: TooltipTheme;
	fullWidth?: boolean;
	children: React.ReactNode;
}

const THEME_CLASSES: ReadonlyMap<TooltipTheme, string> = new Map([
	['indigo', 'border-accent-indigo/40 bg-[#080b14]/95 shadow-[0_30px_60px_-15px_rgba(99,102,241,0.5)]'],
	['emerald', 'border-accent-emerald/40 bg-[#08140f]/95 shadow-[0_30px_60px_-15px_rgba(16,185,129,0.5)]'],
	['rose', 'border-accent-rose/40 bg-[#14080a]/95 shadow-[0_30px_60px_-15px_rgba(244,63,94,0.5)]'],
]);

const DOT_CLASSES: ReadonlyMap<TooltipTheme, string> = new Map([
	['indigo', 'bg-accent-indigo shadow-[0_0_10px_rgba(99,102,241,0.8)]'],
	['emerald', 'bg-accent-emerald shadow-[0_0_10px_rgba(16,185,129,0.8)]'],
	['rose', 'bg-accent-rose shadow-[0_0_10px_rgba(244,63,94,0.8)]'],
]);

const TITLE_CLASSES: ReadonlyMap<TooltipTheme, string> = new Map([
	['indigo', 'text-accent-indigo-light'],
	['emerald', 'text-accent-emerald-light'],
	['rose', 'text-accent-rose-light'],
]);

interface TooltipCoords {
	top: number;
	left: number;
	arrowLeft: number;
	actualPosition: 'top' | 'bottom';
}

function getTooltipAnimationTranslate(isVisible: boolean, actualPosition: 'top' | 'bottom'): string {
	if (isVisible) {
		return 'translate-y-0';
	}
	return actualPosition === 'bottom' ? '-translate-y-2' : 'translate-y-2';
}

export function SotaTooltip({
	title,
	content,
	desc,
	align = 'center',
	position = 'top',
	theme = 'indigo',
	fullWidth = false,
	children,
}: Readonly<SotaTooltipProps>): React.JSX.Element {
	const [isOpen, setIsOpen] = useState(false);
	const [isVisible, setIsVisible] = useState(false);
	const [mounted, setMounted] = useState(false);
	const [coords, setCoords] = useState<TooltipCoords>({
		top: 0,
		left: 0,
		arrowLeft: 20,
		actualPosition: position,
	});

	const triggerRef = useRef<HTMLDivElement>(null);
	const tooltipRef = useRef<HTMLDivElement>(null);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);
	const tooltipId = useId();

	useEffect(() => {
		setMounted(true);
	}, []);

	const updateCoords = useCallback(() => {
		if (!triggerRef.current) return;
		const triggerRect = triggerRef.current.getBoundingClientRect();
		const tooltipEl = tooltipRef.current;
		const tooltipWidth = tooltipEl?.offsetWidth || 260;
		const tooltipHeight = tooltipEl?.offsetHeight || 80;
		const GAP = 10;

		// Calculate available space
		const spaceAbove = triggerRect.top;
		const spaceBelow = window.innerHeight - triggerRect.bottom;

		let actualPosition: 'top' | 'bottom' = position;
		if (position === 'top') {
			if (spaceAbove < tooltipHeight + GAP + 10 && spaceBelow > spaceAbove) {
				actualPosition = 'bottom';
			}
		} else if (spaceBelow < tooltipHeight + GAP + 10 && spaceAbove > spaceBelow) {
			actualPosition = 'top';
		}

		let top = 0;
		if (actualPosition === 'top') {
			top = triggerRect.top - tooltipHeight - GAP;
		} else {
			top = triggerRect.bottom + GAP;
		}

		let left = 0;
		if (align === 'center') {
			left = triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2;
		} else if (align === 'left') {
			left = triggerRect.left;
		} else if (align === 'right') {
			left = triggerRect.right - tooltipWidth;
		}

		// Clamp horizontally within viewport
		const maxLeft = window.innerWidth - tooltipWidth - 12;
		const clampedLeft = Math.max(12, Math.min(left, maxLeft));

		// Center arrow on trigger element center
		const triggerCenter = triggerRect.left + triggerRect.width / 2;
		const arrowLeft = Math.max(16, Math.min(triggerCenter - clampedLeft, tooltipWidth - 16));

		setCoords({
			top,
			left: clampedLeft,
			arrowLeft,
			actualPosition,
		});
	}, [align, position]);

	const showTooltip = useCallback(() => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}
		setIsOpen(true);
	}, []);

	const hideTooltip = useCallback(() => {
		timeoutRef.current = setTimeout(() => {
			setIsVisible(false);
			setIsOpen(false);
		}, 60);
	}, []);

	// Position and animation lifecycle
	useEffect(() => {
		if (!isOpen) {
			setIsVisible(false);
			return;
		}

		updateCoords();
		const rafId = requestAnimationFrame(() => {
			updateCoords();
			setIsVisible(true);
		});

		const handleReposition = () => {
			updateCoords();
		};

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				hideTooltip();
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('scroll', handleReposition, { passive: true, capture: true });
		window.addEventListener('resize', handleReposition, { passive: true });

		return () => {
			cancelAnimationFrame(rafId);
			window.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('scroll', handleReposition, { capture: true });
			window.removeEventListener('resize', handleReposition);
		};
	}, [isOpen, updateCoords, hideTooltip]);

	useEffect(() => {
		return () => {
			if (timeoutRef.current) clearTimeout(timeoutRef.current);
		};
	}, []);

	const safeThemeClass =
		THEME_CLASSES.get(theme) ??
		'border-accent-indigo/40 bg-[#080b14]/95 shadow-[0_30px_60px_-15px_rgba(99,102,241,0.5)]';
	const safeDotClass =
		DOT_CLASSES.get(theme) ?? 'bg-accent-indigo shadow-[0_0_10px_rgba(99,102,241,0.8)]';
	const safeTitleClass = TITLE_CLASSES.get(theme) ?? 'text-accent-indigo-light';

	const arrowClasses =
		coords.actualPosition === 'bottom'
			? '-top-2 border-l border-t border-inherit'
			: '-bottom-2 border-r border-b border-inherit';

	const animationTranslate = getTooltipAnimationTranslate(isVisible, coords.actualPosition);

	const bodyText = content || desc;

	return (
		<div
			ref={triggerRef}
			onMouseEnter={showTooltip}
			onMouseLeave={hideTooltip}
			onFocus={showTooltip}
			onBlur={hideTooltip}
			aria-describedby={isOpen ? tooltipId : undefined}
			className={`relative cursor-help ${fullWidth ? 'flex w-full' : 'inline-flex items-center'}`}
		>
			{children}

			{mounted &&
				isOpen &&
				createPortal(
					<div
						id={tooltipId}
						role="tooltip"
						ref={tooltipRef}
						style={{
							position: 'fixed',
							top: `${coords.top}px`,
							left: `${coords.left}px`,
							zIndex: 999999,
						}}
						className={`pointer-events-none w-max max-w-[min(280px,calc(100vw-24px))] sm:max-w-72 p-4 sm:p-5 backdrop-blur-3xl border rounded-2xl shadow-2xl transition-all duration-200 ease-out font-sans ${safeThemeClass} ${isVisible ? 'opacity-100' : 'opacity-0'} ${animationTranslate}`}
					>
						<div className="flex items-center gap-2.5 mb-2.5 border-b border-white/10 pb-2.5">
							<div className={`w-2 h-2 rounded-full ${safeDotClass} animate-pulse`} />
							<p
								className={`text-[0.68rem] font-black uppercase tracking-[0.2em] m-0 leading-tight ${safeTitleClass}`}
							>
								{title}
							</p>
						</div>
						{bodyText && (
							<p className="text-text-light text-[0.75rem] leading-relaxed font-medium m-0 normal-case tracking-normal text-left drop-shadow-md whitespace-pre-wrap">
								{bodyText}
							</p>
						)}
						<div
							className={`absolute w-3.5 h-3.5 bg-inherit rotate-45 backdrop-blur-3xl ${arrowClasses}`}
							style={{ left: `${coords.arrowLeft}px`, transform: 'translateX(-50%) rotate(45deg)' }}
						/>
					</div>,
					document.body
				)}
		</div>
	);
}
