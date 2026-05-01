import React from 'react';

interface SotaTooltipProps {
    readonly content: React.ReactNode;
    readonly children: React.ReactNode;
}

/**
 * IDENTITY: SotaTooltip
 * ROLE: Componente de UI para exibir dicas contextuais (Tooltips) de forma nao intrusiva.
 * PRINCIPLE: Friccao Zero (CSS-only hover, sem Javascript event listeners pesados).
 */
export function SotaTooltip( { content, children }: SotaTooltipProps ) {
    return (
        <div className="group relative inline-flex items-center justify-center">
            { children }
            <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-max max-w-xs -translate-x-1/2 scale-95 opacity-0 blur-sm transition-all duration-200 group-hover:scale-100 group-hover:opacity-100 group-hover:blur-0">
                <div className="glass-panel px-3 py-2 text-xs font-mono text-text-muted">
                    { content }
                </div>
            </div>
        </div>
    );
}
