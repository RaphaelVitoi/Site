'use client';

import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring, useTransform, AnimatePresence } from 'framer-motion';

export default function ReadingProgress() {
    const [isVisible, setIsVisible] = useState(false);
    const { scrollYProgress } = useScroll();

    // Spring for smooth progress bar animation
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    // Transform for the percentage text
    const percentage = useTransform(
        scrollYProgress,
        (value) => `${Math.round(value * 100)}%`
    );

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 100) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const handleScrub = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const scrubPercentage = clickX / rect.width;

        const scrollableHeight = document.body.scrollHeight - window.innerHeight;
        const targetScrollY = scrollableHeight * scrubPercentage;

        window.scrollTo({ top: targetScrollY, behavior: 'smooth' });
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="fixed top-0 left-0 right-0 h-5 flex items-center justify-center z-[100] bg-slate-900/50 backdrop-blur-sm border-b border-white/5"
                    className="fixed top-0 left-0 right-0 h-5 flex items-center justify-center z-[100] bg-slate-900/50 backdrop-blur-sm border-b border-white/5 cursor-pointer hover:bg-slate-800/60 transition-colors"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    onClick={handleScrub}
                    title="Clique para navegar no artigo"
                >
                    <motion.div className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-400 to-fuchsia-500 origin-left shadow-[0_0_12px_rgba(217,70,239,0.5)]" style={{ scaleX }} />
                    <motion.span className="relative text-xs font-mono text-white/90" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                        {percentage}
                    </motion.span>
                </motion.div>
            )}
        </AnimatePresence>
    );
}