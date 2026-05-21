'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function ScrollToTop() {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		let ticking = false;
		const toggleVisibility = () => {
			if (!ticking) {
				globalThis.requestAnimationFrame(() => {
					const isPageLong =
						document.documentElement.scrollHeight > globalThis.innerHeight * 1.5;
					if (isPageLong && globalThis.scrollY > 400) {
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

	const scrollToTop = () => {
		globalThis.scrollTo({ top: 0, behavior: 'smooth' });
	};

	return (
		<AnimatePresence>
			{isVisible && (
				<motion.button
					initial={{ opacity: 0, y: 20, scale: 0.9 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					exit={{ opacity: 0, y: 20, scale: 0.9 }}
					onClick={scrollToTop}
					className="fixed bottom-8 right-8 z-50 p-4 rounded-full bg-slate-800/80 text-white border border-white/10 backdrop-blur-md shadow-[0_10px_30px_-15px_rgba(0,0,0,0.5)] hover:bg-slate-700/80 hover:border-white/30 hover:-translate-y-1 transition-all flex items-center justify-center group"
					aria-label="Voltar ao topo"
				>
					<i className="fa-solid fa-arrow-up group-hover:-translate-y-1 transition-transform"></i>
				</motion.button>
			)}
		</AnimatePresence>
	);
}
