'use client';

interface SectionHeaderProps
{
    readonly step: string;
    readonly label: string;
    readonly title: string;
    readonly description: string;
    readonly id?: string;
}

/**
 * IDENTITY: SectionHeader (SOTA UI)
 * ROLE: Cabeçalho padronizado para seções, seguindo o Design System.
 *       Elimina a necessidade de inline styles e garante consistência visual.
 */
export function SectionHeader ( { step, label, title, description, id }: Readonly<SectionHeaderProps> )
{
    return (
        <div id={ id } className="w-full mx-auto px-0 pt-12 pb-8 relative group">
            <div className="absolute left-0 top-12 bottom-8 w-px bg-gradient-to-b from-accent-indigo/50 via-accent-indigo/10 to-transparent opacity-50" />
            <div className="pl-6">
                <div className="flex items-center gap-4 mb-4">
                    <span className="text-[0.65rem] font-black text-accent-indigo bg-accent-indigo/5 border border-accent-indigo/20 px-3 py-1.5 rounded-sm tracking-widest font-mono">
                    { step }
                </span>
                    <div className="h-px w-8 bg-white/10" />
                    <span className="text-[0.65rem] font-bold text-text-muted uppercase tracking-[0.3em]">
                    { label }
                </span>
            </div>
                <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-black m-0 mb-5 tracking-tighter text-white font-heading uppercase group-hover:text-accent-indigo-light transition-colors duration-500">
                { title }
            </h2>
            <p className="m-0 text-[0.95rem] text-text-muted leading-relaxed max-w-2xl font-body italic border-l-2 border-white/5 pl-4">
                { description }
            </p>
            </div>
        </div>
    );
}
