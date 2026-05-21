import React from 'react';

interface SotaTooltipProps {
    title: string;
    content?: string;
    desc?: string;
    align?: 'left' | 'center' | 'right';
    theme?: 'indigo' | 'emerald' | 'rose';
    children: React.ReactNode;
}

export function SotaTooltip( { title, content, desc, align = 'center', theme = 'indigo', children }: Readonly<SotaTooltipProps> ) {
    const alignClasses = { left: 'left-0', center: 'left-1/2 -translate-x-1/2', right: 'right-0' };
    const themeClasses = {
        indigo: 'border-indigo-500/30 text-indigo-400 shadow-[0_10px_30px_-15px_rgba(99,102,241,0.4)]',
        emerald: 'border-emerald-500/30 text-emerald-400 shadow-[0_10px_30px_-15px_rgba(16,185,129,0.4)]',
        rose: 'border-rose-500/30 text-rose-400 shadow-[0_10px_30px_-15px_rgba(244,63,94,0.4)]'
    };
    return (
        <div className="relative group inline-flex items-center cursor-help">
            { children }
            <div className={ `absolute bottom-full ${alignClasses[align]} mb-2 w-64 sm:w-72 max-w-[85vw] p-3 bg-[#0a0f1c] border rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 pointer-events-none ${themeClasses[theme]}` }>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1">{ title }</p>
                <p className="text-neutral-300 text-[10px] leading-relaxed font-sans normal-case tracking-normal text-left">{ content || desc }</p>
            </div>
        </div>
    );
}
