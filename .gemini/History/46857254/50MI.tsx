'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
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

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
    },
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
};

export default function AnimatedArticleGrid({ articles }: AnimatedArticleGridProps) {
    return (
        <motion.section className={styles.articleGrid} variants={containerVariants} initial="hidden" animate="visible">
            {articles.map((article) => (
                <motion.div key={article.href} variants={itemVariants}>
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
        </motion.section>
    );
}