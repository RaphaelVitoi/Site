'use client';

import { motion, useScroll, useSpring } from 'framer-motion';

export interface ReadingProgressBarProps {
	className?: string;
}

/**
 * SOTA: Barra de Progresso de Leitura Isolada
 * Desacoplada do ciclo de vida global do Header.
 * Renderizada sob demanda apenas em páginas de conteúdo longo (aulas e biblioteca),
 * eliminando hooks de scroll e spring de páginas operacionais (Simulador, Templo, Dashboard).
 */
export function ReadingProgressBar({ className = '' }: Readonly<ReadingProgressBarProps>) {
	const { scrollYProgress } = useScroll();
	const scaleX = useSpring(scrollYProgress, {
		stiffness: 100,
		damping: 30,
		restDelta: 0.001,
	});

	return (
		<div
			aria-hidden="true"
			className="pointer-events-none fixed top-0 right-0 left-0 z-100 h-1 overflow-hidden"
		>
			<motion.div
				className={`h-full w-full origin-left bg-linear-to-r from-accent-indigo via-indigo-400 to-accent-emerald shadow-[0_0_15px_rgba(99,102,241,0.6)] ${className}`}
				style={{ scaleX }}
			/>
		</div>
	);
}

export default ReadingProgressBar;
