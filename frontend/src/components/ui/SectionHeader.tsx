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
        <div id={ id } className="w-full mx-auto px-0 pt-12 pb-8">
            <div className="flex items-center gap-3 mb-3">
                <span className="text-[0.7rem] font-black text-accent-indigo bg-accent-indigo/10 border border-accent-indigo/20 px-2.5 py-1 rounded-md shadow-[0_0_12px_rgba(99,102,241,0.15)] font-mono">
                    { step }
                </span>
                <span className="text-[0.7rem] font-black text-text-muted uppercase tracking-[0.25em]">
                    { label }
                </span>
            </div>
            <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-black m-0 mb-4 tracking-tighter text-text-bright font-heading uppercase">
                { title }
            </h2>
            <p className="m-0 text-[0.95rem] text-text-muted leading-relaxed max-w-2xl font-body italic border-l-2 border-white/5 pl-4">
                { description }
            </p>
        </div>
    );
}
