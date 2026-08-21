import React from 'react';

interface GlassPanelProps {
	children: React.ReactNode;
	className?: string | undefined;
	id?: string | undefined;
	style?: React.CSSProperties | undefined;
	role?: string | undefined;
	'aria-label'?: string | undefined;
	onClick?: React.MouseEventHandler<HTMLDivElement> | undefined;
	onKeyDown?: React.KeyboardEventHandler<HTMLDivElement> | undefined;
	tabIndex?: number | undefined;
}

export function GlassPanel({
	children,
	className = '',
	id,
	style,
	role,
	'aria-label': ariaLabel,
	onClick,
	onKeyDown,
	tabIndex,
}: Readonly<GlassPanelProps>) {
	const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> | undefined =
		onKeyDown ??
		(onClick
			? (e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						(e.currentTarget as HTMLDivElement).click();
					}
			  }
			: undefined);

	return (
		<div
			id={id}
			style={style}
			role={role ?? (onClick ? 'button' : undefined)}
			aria-label={ariaLabel}
			onClick={onClick}
			onKeyDown={handleKeyDown}
			tabIndex={tabIndex ?? (onClick ? 0 : undefined)}
			className={`glass-panel ${className}`}
		>
			{children}
		</div>
	);
}
