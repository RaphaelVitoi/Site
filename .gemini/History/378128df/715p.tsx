'use client';

import { useState } from 'react';

export type PmLensTooltipProps = Readonly<{
    title: string;
    content: string;
    metricType?: 'entropy' | 'symmetry' | 'machine';
}>;

/**
 * [CLIENT] Tooltip de Topologia Fluida SOTA.
 * Erradica o transbordo no mobile utilizando ancoragem nativa (right-0) e limites responsivos.
 * Incorpora a Gamificação Visceral (Colorimetria Semântico-Associativa).
 */
export function PmLensTooltipSota ( { title, content, metricType = 'machine' }: PmLensTooltipProps ) {
    const [ isVisible, setIsVisible ] = useState( false );

    const colorMap = {
        entropy: 'border-red-500/50 text-red-400 bg-red-950/90',
        symmetry: 'border-emerald-500/50 text-emerald-400 bg-emerald-950/90',
        machine: 'border-cyan-500/50 text-cyan-400 bg-cyan-950/90',
    };

    const activeColor = colorMap[ metricType ];

    return (
        <div
            className="relative flex items-center"
        >
            <button
                type="button"
                className="text-zinc-500 hover:text-zinc-300 transition-colors ml-2 cursor-help focus:outline-hidden"
                aria-label="Mais informações"
                onMouseEnter={ () => setIsVisible( true ) }
                onMouseLeave={ () => setIsVisible( false ) }
                onFocus={ () => setIsVisible( true ) }
                onBlur={ () => setIsVisible( false ) }
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 16v-4"></path>
                    <path d="M12 8h.01"></path>
                </svg>
            </button>

            { isVisible && (
                <div
                    role="tooltip"
                    className={ `absolute top-full right-0 mt-2 z-50 w-max max-w-[min(100%,85vw)] sm:max-w-xs p-3 rounded-lg border backdrop-blur-md shadow-2xl ${activeColor}` }
                >
                    <h4 className="text-xs font-bold uppercase tracking-wider mb-1">{ title }</h4>
                    <p className="text-xs leading-relaxed opacity-90">{ content }</p>
                </div>
            ) }
        </div>
    );
}
