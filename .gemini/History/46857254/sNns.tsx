'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '@/app/biblioteca/biblioteca.module.css';

interface Article {
    href: string;
    label: string;
    title: string;
    description: string;
    readingTime: string;
    isNew: boolean;
}

interface AnimatedArticleGridProps {
    articles: Article[];
}

export default function AnimatedArticleGrid({ articles }: AnimatedArticleGridProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredArticles = useMemo(() => {
        if (!searchTerm) return articles;
        const lowerTerm = searchTerm.toLowerCase();
        return articles.filter(
            (article) =>
                article.title.toLowerCase().includes(lowerTerm) ||
                article.description.toLowerCase().includes(lowerTerm) ||
                article.label.toLowerCase().includes(lowerTerm)
        );
    }, [articles, searchTerm]);

    return (
        <div className="flex flex-col gap-10">
            {/* Barra de Pesquisa */}
            <div className="relative max-w-lg w-full mx-auto animate-fade-up">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                    <i className="fa-solid fa-search"></i>
                </div>
                <input
                    type="text"
                    placeholder="Buscar artigos, conceitos, heurísticas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-900/60 backdrop-blur-md border border-white/10 text-white rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-white/30 transition-all placeholder:text-slate-500 font-body shadow-inner"
                />
            </div>

            {/* Grid Animado */}
            <motion.section layout className={styles.articleGrid}>
                <AnimatePresence mode="popLayout">
                    {filteredArticles.map((article) => (
                        <motion.div
                            key={article.href}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.25 }}
                        >
                            <Link href={article.href} className={styles.articleCard}>
                                <div className={styles.cardContent}>
                                    <div className={styles.cardHeader}>
                                        <p className={styles.cardLabel}>{article.label}</p>
                                        {article.isNew && <span className={styles.newBadge}>Novo</span>}
                                    </div>
                                    <h3 className={styles.cardTitle}>{article.title}</h3>
                                    <p className={styles.cardDescription}>{article.description}</p>
                                </div>
                                <div className={styles.cardFooter}>
                                    <span className={styles.readingTime}>{article.readingTime}</span>
                                    <span>Ler artigo &rarr;</span>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.section>

            {/* Estado Vazio */}
            {filteredArticles.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12 text-slate-500 font-mono text-sm uppercase tracking-widest"
                >
                    Nenhum conhecimento encontrado para esta busca.
                </motion.div>
            )}
        </div>
    );
}