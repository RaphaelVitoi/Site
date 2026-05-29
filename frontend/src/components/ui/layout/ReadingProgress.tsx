'use client';

import { AnimatePresence, motion, useScroll, useSpring, useTransform } from 'framer-motion';
import React, { useEffect, useState } from 'react';

export default function ReadingProgress() {
	const [isVisible, setIsVisible] = useState(false);
	const { scrollYProgress } = useScroll();

	// Spring for smooth progress bar animation
	const scaleX = useSpring(scrollYProgress, {
		stiffness: 100,
		damping: 30,
		restDelta: 0.001,
	});

	// Transform for the percentage text
	const percentage = useTransform(scrollYProgress, (value) => `${Math.round(value * 100)}%`);

	// Transform for the gradient animation
	const backgroundPosition = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

	useEffect(() => {
		let ticking = false;
		const toggleVisibility = () => {
			if (!ticking) {
				globalThis.requestAnimationFrame(() => {
					if (globalThis.scrollY > 100) {
						setIsVisible(true);
					} else {
						setIsVisible(false);
					}
					ticking = false;
				});
				ticking = true;
			}
		};

		globalThis.addEventListener('scroll', toggleVisibility, { passive: true });
		return () => globalThis.removeEventListener('scroll', toggleVisibility);
	}, []);

	const handleScrub = (e: React.MouseEvent<HTMLDivElement>) => {
		const rect = e.currentTarget.getBoundingClientRect();
		const clickX = e.clientX - rect.left;
		const scrubPercentage = clickX / rect.width;

		const scrollableHeight = document.body.scrollHeight - globalThis.innerHeight;
		const targetScrollY = scrollableHeight * scrubPercentage;

		globalThis.scrollTo({ top: targetScrollY, behavior: 'smooth' });
	};

	return (
		<AnimatePresence>
			{isVisible && (
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -20 }}
					transition={{ duration: 0.3 }}
					className="fixed top-0 left-0 right-0 h-5 hover:h-7 flex items-center justify-center z-100 bg-slate-900/50 backdrop-blur-sm border-b border-white/5 cursor-pointer hover:bg-slate-800/80 transition-all duration-300"
					onClick={handleScrub}
					title="Clique para navegar no artigo"
				>
					<motion.div
						style={{ scaleX, backgroundSize: '200% 200%', backgroundPosition }}
						className="absolute top-0 left-0 h-full bg-linear-to-r from-emerald-400 via-sky-400 to-fuchsia-500 origin-left shadow-[0_0_12px_rgba(217,70,239,0.5)]"
					/>
					<motion.span className="relative text-xs font-mono text-white mix-blend-difference font-bold">
						{percentage}
					</motion.span>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
