import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
	size?: 'sm' | 'md' | 'lg';
	isLoading?: boolean;
	leftIcon?: React.ReactNode;
	rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
	children,
	variant = 'primary',
	size = 'md',
	isLoading = false,
	leftIcon,
	rightIcon,
	className = '',
	disabled,
	...props
}) => {
	const baseStyles =
		'inline-flex items-center justify-center gap-2 font-heading font-extrabold uppercase letter-spacing-wider rounded-lg transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none';

	const variants = {
		primary:
			'bg-accent-primary text-white shadow-[0_4px_14px_rgba(99,102,241,0.25)] hover:bg-indigo-500 hover:shadow-[0_8px_25px_rgba(99,102,241,0.4)] hover:-translate-y-0.5',
		secondary:
			'bg-accent-secondary text-white shadow-[0_4px_14px_rgba(225,29,72,0.25)] hover:bg-rose-500 hover:shadow-[0_8px_25px_rgba(225,29,72,0.4)] hover:-translate-y-0.5',
		outline:
			'bg-transparent border-2 border-accent-primary text-accent-primary hover:bg-accent-primary/10 hover:-translate-y-0.5',
		ghost: 'bg-transparent text-text-muted hover:bg-white/5 hover:text-white',
	};

	const sizes = {
		sm: 'px-4 py-2 text-xs',
		md: 'px-8 py-3.5 text-sm',
		lg: 'px-12 py-5 text-base',
	};

	const currentVariant = variants[variant] || variants.primary;
	const currentSize = sizes[size] || sizes.md;

	return (
		<button
			className={`${baseStyles} ${currentVariant} ${currentSize} ${className}`}
			disabled={disabled || isLoading}
			{...props}
		>
			{isLoading ? (
				<i className="fa-solid fa-circle-notch animate-spin" />
			) : (
				<>
					{leftIcon}
					{children}
					{rightIcon}
				</>
			)}
		</button>
	);
};

export default Button;
