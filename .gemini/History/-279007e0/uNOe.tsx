import React from 'react';

interface LessonHeaderProps {
    title: string;
    category: string;
}

export default function LessonHeader({ title, category }: LessonHeaderProps) {
    return (
        <header className="page-header text-center mb-12 animate-fade-up">
            <p className="font-mono text-sm uppercase tracking-widest text-emerald-400">
                {category}
            </p>
            <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight font-heading" style={{
                background: 'linear-gradient(135deg, #fff 0%, #10b981 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textWrap: 'balance', // Improves title wrapping for multi-line titles
            }}>
                {title}
            </h1>
        </header>
    );
}