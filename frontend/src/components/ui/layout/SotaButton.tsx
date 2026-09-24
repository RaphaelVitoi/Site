/**
 * IDENTITY: SOTA Button (The Atomic Trigger)
 * PATH: src/components/ui/SotaButton.tsx
 * ROLE: Botão ultra-estilizado com efeitos quânticos e suporte a fullWidth.
 */

'use client';

import { motion } from 'framer-motion';
import React from 'react';

export interface SotaButtonProps {
	children?: React.ReactNode;
	variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gold' | 'indigo';
	size?: 'sm' | 'md' | 'lg';
	isLoading?: boolean;
	fullWidth?: boolean;
	leftIcon?: React.ReactNode;
	rightIcon?: React.ReactNode;
	className?: string;
	disabled?: boolean;
	type?: 'button' | 'submit' | 'reset';
	onClick?: React.MouseEventHandler<HTMLButtonElement>;
	id?: string;
	title?: string;
	'aria-label'?: string;
}

function getButtonVariantClass(variant: string) {
	switch (variant) {
		case 'secondary':
			return 'bg-accent-emerald text-white shadow-[0_4px_15px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_30px_rgba(16,185,129,0.5)] border border-white/10 hover:border-white/20 hover:text-glow-emerald';
		case 'danger':
			return 'bg-rose-600 text-white shadow-[0_4px_15px_rgba(225,29,72,0.3)] hover:shadow-[0_8px_30px_rgba(225,29,72,0.5)] border border-white/10 hover:border-white/20';
		case 'outline':
			return 'bg-transparent border-2 border-white/10 text-white hover:bg-white/5 hover:border-white/20';
		case 'ghost':
			return 'bg-transparent text-text-muted hover:bg-white/5 hover:text-white';
		case 'indigo':
			return 'bg-accent-indigo text-white shadow-[0_4px_15px_rgba(99,102,241,0.3)] hover:shadow-[0_8px_30px_rgba(99,102,241,0.5)] border border-white/10 hover:border-white/20 hover:text-glow-indigo';
		case 'gold':
		case 'primary':
		default:
			return 'bg-linear-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 hover:shadow-lg hover:shadow-amber-500/30 border border-amber-400/40';
	}
}

function getButtonSizeClass(size: string) {
	switch (size) {
		case 'sm':
			return 'px-5 py-2.5 text-[0.65rem]';
		case 'lg':
			return 'px-12 py-5 text-sm';
		default:
			return 'px-8 py-3.5 text-xs';
	}
}

export const SotaButton: React.FC<SotaButtonProps> = ({
	children,
	variant = 'primary',
	size = 'md',
	isLoading = false,
	fullWidth = false,
	leftIcon,
	rightIcon,
	className = '',
	disabled,
	type = 'button',
	onClick,
	id,
	title,
	'aria-label': ariaLabel,
}) => {
	const baseStyles =
		'relative inline-flex items-center justify-center gap-3 font-heading font-black uppercase tracking-[0.15em] rounded-xl transition-all duration-300 overflow-hidden active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none select-none group';

	const variantClass = getButtonVariantClass(variant);
	const sizeClass = getButtonSizeClass(size);

	return (
		<motion.button
			type={type}
			onClick={onClick}
			id={id}
			title={title}
			aria-label={ariaLabel}
			whileHover={{ y: -2 }}
			whileTap={{ scale: 0.97 }}
			className={`
        ${baseStyles}
        ${variantClass}
        ${sizeClass}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
			disabled={disabled || isLoading}
		>
			{/* Shimmer Effect */}
			<div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.2)_50%,transparent_100%)] w-[200%] translate-x-[-150%] group-hover:animate-shimmer pointer-events-none" />

			{isLoading ? (
				<i className="fa-solid fa-circle-notch animate-spin text-sm" />
			) : (
				<>
					{leftIcon && <span className="opacity-70">{leftIcon}</span>}
					<span className="relative z-10">{children}</span>
					{rightIcon && <span className="opacity-70">{rightIcon}</span>}
				</>
			)}
		</motion.button>
	);
};

export default SotaButton;
