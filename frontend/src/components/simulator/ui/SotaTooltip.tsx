import React from 'react';

interface SotaTooltipProps {
    title: string;
    content?: string;
    desc?: string;
    align?: 'left' | 'center' | 'right';
    theme?: 'indigo' | 'emerald' | 'rose';
    fullWidth?: boolean;
    children: React.ReactNode;
}

export function SotaTooltip( { title, content, desc, align = 'center', theme = 'indigo', fullWidth = false, children }: Readonly<SotaTooltipProps> ) {
    const alignClasses = {
        left: 'left-0 origin-bottom-left',
        center: 'left-1/2 -translate-x-1/2 origin-bottom',
        right: 'right-0 origin-bottom-right'
    };

    const themeClasses = {
        indigo: 'border-accent-indigo/40 bg-[#080b14]/95 shadow-[0_30px_60px_-15px_rgba(99,102,241,0.5)]',
        emerald: 'border-accent-emerald/40 bg-[#08140f]/95 shadow-[0_30px_60px_-15px_rgba(16,185,129,0.5)]',
        rose: 'border-accent-rose/40 bg-[#14080a]/95 shadow-[0_30px_60px_-15px_rgba(244,63,94,0.5)]'
    };

    return (
        <div className={`relative group cursor-help items-center ${fullWidth ? 'flex w-full' : 'inline-flex'}`}>
            { children }
            <div className={ `absolute bottom-full mb-3 ${alignClasses[align]} w-max max-w-[280px] p-5 backdrop-blur-3xl border rounded-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-4 group-hover:translate-y-0 transition-all duration-300 ease-out z-[99999] pointer-events-none ${themeClasses[theme]}` }>
                {/* Bridge gap for hover continuity */}
                <div className="absolute -bottom-4 left-0 w-full h-4 pointer-events-auto" />
                
                <div className="flex items-center gap-3 mb-3 border-b border-white/10 pb-3">
                    <div className={ `w-2 h-2 rounded-full ${theme === 'indigo' ? 'bg-accent-indigo shadow-[0_0_10px_rgba(99,102,241,0.8)]' : theme === 'emerald' ? 'bg-accent-emerald shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 'bg-accent-rose shadow-[0_0_10px_rgba(244,63,94,0.8)]'} animate-pulse` } />
                    <p className={ `text-[0.7rem] font-black uppercase tracking-[0.25em] m-0 ${theme === 'indigo' ? 'text-accent-indigo-light' : theme === 'emerald' ? 'text-accent-emerald-light' : 'text-accent-rose-light'}` }>{ title }</p>
                </div>
                <p className="text-text-light text-[0.8rem] leading-relaxed font-medium m-0 normal-case tracking-normal text-left drop-shadow-md whitespace-pre-wrap">
                    { content || desc }
                </p>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-inherit border-r border-b border-inherit rotate-45 backdrop-blur-3xl" />
            </div>
        </div>
    );
}
