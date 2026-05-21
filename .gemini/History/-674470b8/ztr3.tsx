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
    const alignClasses = {
        left: 'left-0',
        center: 'left-1/2 -translate-x-1/2',
        right: 'right-0'
    };

    const themeClasses = {
        indigo: 'border-accent-indigo/30 bg-bg-deep/90 shadow-[0_20px_50px_-12px_rgba(99,102,241,0.3)]',
        emerald: 'border-accent-emerald/30 bg-bg-deep/90 shadow-[0_20px_50px_-12px_rgba(16,185,129,0.3)]',
        rose: 'border-accent-rose/30 bg-bg-deep/90 shadow-[0_20px_50px_-12px_rgba(244,63,94,0.3)]'
    };

    const textThemeClasses = {
        indigo: 'text-accent-indigo-light',
        emerald: 'text-accent-emerald-light',
        rose: 'text-accent-rose-light'
    };

    const bgThemeClasses = {
        indigo: 'bg-accent-indigo',
        emerald: 'bg-accent-emerald',
        rose: 'bg-accent-rose'
    };

    return (
        <div className="relative group inline-flex items-center cursor-help">
            { children }
            <div className={ `absolute bottom-full ${alignClasses[align]} mb-3 w-72 max-w-[85vw] p-4 backdrop-blur-xl border rounded-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-50 pointer-events-none ${themeClasses[theme]}` }>
                <div className="flex items-center gap-2 mb-2">
                    <div className={ `w-1.5 h-1.5 rounded-full ${bgThemeClasses[theme]} animate-pulse` } />
                    <p className={ `text-[0.65rem] font-black uppercase tracking-[0.2em] m-0 ${textThemeClasses[theme]}` }>{ title }</p>
                </div>
                <p className="text-text-muted text-[0.7rem] leading-relaxed font-medium m-0 normal-case tracking-normal text-left">
                    { content || desc }
                </p>
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-bg-deep border-r border-b border-white/5 rotate-45" />
            </div>
        </div>
    );
}
