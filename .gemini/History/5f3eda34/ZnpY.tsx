'use client';

import React from 'react';

interface GlassPanelProps {
    children: React.ReactNode;
    className?: string;
    hoverable?: boolean;
}

/**
 * IDENTITY: GlassPanel (SOTA UI)
 * ROLE: Componente de contêiner com efeito de vidro (Glassmorphism).
 *       Implementa a "Invariância Arquitetural" do Design System.
 */
export function GlassPanel ( { children, className = '', hoverable = false }: Readonly<GlassPanelProps> ) {
    return (
        <div className={ `
            bg-bg-panel/75 backdrop-blur-2xl border border-white/10 rounded-3xl
            shadow-sota-glass overflow-hidden transition-all duration-300
            ${hoverable ? 'hover:scale-[1.01] hover:shadow-indigo-500/10' : ''}
            ${className}
        `}>
            { children }
        </div>
    );
}
