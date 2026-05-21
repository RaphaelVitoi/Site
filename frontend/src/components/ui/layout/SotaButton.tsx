/**
 * IDENTITY: SOTA Button (The Atomic Trigger)
 * PATH: src/components/ui/SotaButton.tsx
 * ROLE: Botão ultra-estilizado com efeitos quânticos e suporte a fullWidth.
 */

'use client';

import type { HTMLMotionProps } from 'framer-motion';
import { motion } from 'framer-motion';
import React from 'react';

interface SotaButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref' | 'children'> {
	children?: React.ReactNode;
	variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gold';
	size?: 'sm' | 'md' | 'lg';
	isLoading?: boolean;
	fullWidth?: boolean;
	leftIcon?: React.ReactNode;
	rightIcon?: React.ReactNode;
	className?: string;
	disabled?: boolean;
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
	...props
}) => {
	const baseStyles =
		'relative inline-flex items-center justify-center gap-3 font-heading font-black uppercase tracking-[0.15em] rounded-xl transition-all duration-300 overflow-hidden active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none select-none group';

	const variants = {
		primary:
			'bg-accent-indigo text-white shadow-[0_4px_15px_rgba(99,102,241,0.3)] hover:shadow-[0_8px_30px_rgba(99,102,241,0.5)] border border-white/10 hover:border-white/20 hover:text-glow-indigo',
		secondary:
			'bg-accent-emerald text-white shadow-[0_4px_15px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_30px_rgba(16,185,129,0.5)] border border-white/10 hover:border-white/20 hover:text-glow-emerald',
		danger: 'bg-rose-600 text-white shadow-[0_4px_15px_rgba(225,29,72,0.3)] hover:shadow-[0_8px_30px_rgba(225,29,72,0.5)] border border-white/10 hover:border-white/20',
		outline:
			'bg-transparent border-2 border-white/10 text-white hover:bg-white/5 hover:border-white/20',
		ghost: 'bg-transparent text-text-muted hover:bg-white/5 hover:text-white',
		gold: 'bg-gradient-to-r from-accent-amber/80 to-accent-gold/80 text-black shadow-[0_4px_15px_rgba(251,191,36,0.3)] hover:shadow-[0_8px_30px_rgba(251,191,36,0.5)] border border-accent-gold/50 hover:border-accent-gold',
	};

	const sizes = {
		sm: 'px-5 py-2.5 text-[0.65rem]',
		md: 'px-8 py-3.5 text-xs',
		lg: 'px-12 py-5 text-sm',
	};

	return (
		<motion.button
			whileHover={{ y: -2 }}
			whileTap={{ scale: 0.97 }}
			className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
			disabled={disabled || isLoading}
			{...props}
		>
			{/* Shimmer Effect */}
			<div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.2)_50%,transparent_100%)] w-[200%] -translate-x-[150%] group-hover:animate-shimmer pointer-events-none" />

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
