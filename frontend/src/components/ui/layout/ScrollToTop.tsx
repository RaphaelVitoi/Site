'use client';

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
					setIsVisible(isPageLong && globalThis.scrollY > 400);
					ticking = false;
				});
				ticking = true;
			}
		};

		globalThis.addEventListener('scroll', toggleVisibility, { passive: true });
		return () => globalThis.removeEventListener('scroll', toggleVisibility);
	}, []);

	const scrollToTop = () => {
		const reducedMotion =
			typeof globalThis.matchMedia === 'function' &&
			globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches;
		globalThis.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
	};

	return (
		<button
			type="button"
			onClick={scrollToTop}
			aria-hidden={!isVisible}
			tabIndex={isVisible ? 0 : -1}
			className={`fixed bottom-8 right-8 z-50 p-4 rounded-full bg-slate-800/80 text-white border border-white/10 backdrop-blur-md shadow-[0_10px_30px_-15px_rgba(0,0,0,0.5)] hover:bg-slate-700/80 hover:border-white/30 hover:-translate-y-1 transition-all duration-200 flex items-center justify-center group ${
				isVisible
					? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
					: 'opacity-0 translate-y-5 scale-90 pointer-events-none'
			}`}
			aria-label="Voltar ao topo"
		>
			<i className="fa-solid fa-arrow-up group-hover:-translate-y-1 transition-transform" />
		</button>
	);
}
