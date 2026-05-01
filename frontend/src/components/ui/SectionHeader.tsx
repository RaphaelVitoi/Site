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
        <div id={ id } className="max-w-300 mx-auto px-6 pt-16 pb-6">
            <div className="flex items-center gap-3 mb-3">
                <span className="text-[0.7rem] font-bold text-accent-indigo bg-accent-indigo/10 border border-accent-indigo/20 px-2.5 py-1 rounded-md shadow-[0_0_12px_rgba(99,102,241,0.15)] font-mono">
                    { step }
                </span>
                <span className="text-[0.7rem] font-bold text-text-muted uppercase tracking-[0.15em]">
                    { label }
                </span>
            </div>
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-extrabold m-0 mb-3 tracking-tight text-text-main font-heading">
                { title }
            </h2>
            <p className="m-0 text-[0.9rem] text-text-dim leading-relaxed max-w-3xl font-body">
                { description }
            </p>
        </div>
    );
}
