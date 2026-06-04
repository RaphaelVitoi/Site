'use client';

import React from 'react';
import { motion } from 'framer-motion';

/**
 * IDENTITY: SotaDissolution SOTA v6.2 Gold
 * PATH: src/components/ui/layout/SotaDissolution.tsx
 * ROLE: Aplica efeito de dissolução progressiva em cascata ("Estilo Raphael Vitoi")
 * com fade-out de opacidade e scale descendente.
 */

export interface SotaDissolutionProps {
	children: React.ReactNode;
	isDissolved: boolean;
	onComplete?: () => void;
	className?: string;
}

const containerVariants = {
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.08,
			delayChildren: 0.02,
		},
	},
	hidden: {
		opacity: 0,
		transition: {
			staggerChildren: 0.06,
			staggerDirection: 1, // de cima para baixo
			when: 'afterChildren',
		},
	},
} as const;

const childVariants = {
	visible: {
		opacity: 1,
		scale: 1,
		y: 0,
		filter: 'blur(0px)',
		transition: {
			type: 'spring',
			stiffness: 100,
			damping: 15,
		},
	},
	hidden: {
		opacity: 0,
		scale: 0.94,
		y: 20, // queda progressiva
		filter: 'blur(4px)',
		transition: {
			ease: 'easeInOut',
			duration: 0.35,
		},
	},
} as const;

export const SotaDissolution: React.FC<SotaDissolutionProps> = ({
	children,
	isDissolved,
	onComplete,
	className = '',
}) => {
	const handleAnimationComplete = (definition: string) => {
		if (definition === 'hidden' && onComplete) {
			onComplete();
		}
	};

	// Transforma os filhos para que cada um seja envolvido por um motion.div com variants
	const items = React.Children.toArray(children);

	return (
		<motion.div
			variants={containerVariants}
			initial="visible"
			animate={isDissolved ? 'hidden' : 'visible'}
			onAnimationComplete={handleAnimationComplete}
			className={`space-y-4 ${className}`}
		>
			{items.map((item, index) => (
				<motion.div
					key={`dissolve-item-${index}`}
					variants={childVariants}
					className="origin-bottom"
				>
					{item}
				</motion.div>
			))}
		</motion.div>
	);
};
