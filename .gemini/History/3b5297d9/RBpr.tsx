
interface LessonHeaderProps
{
    title: string;
    category: string;
    date?: string;
    author?: string;
}

export default function LessonHeader ( { title, category, date, author }: Readonly<LessonHeaderProps> )
{
    return (
        <header className="page-header text-center mb-16 animate-fade-up relative">
            <div className="absolute left-1/2 -top-10 -translate-x-1/2 w-px h-8 bg-gradient-to-b from-transparent to-accent-emerald/50" />
            <p className="font-mono text-[0.6rem] font-black uppercase tracking-[0.3em] text-accent-emerald mb-8 inline-flex items-center gap-3">
                <span className="w-2 h-px bg-accent-emerald/50" />
                { category }
                <span className="w-2 h-px bg-accent-emerald/50" />
            </p>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tighter font-heading text-white uppercase" style={ { textWrap: 'balance' } }>
                { title }
            </h1>

            { ( date || author ) && (
                <div className="mt-10 flex justify-center items-center gap-6 text-[0.65rem] font-mono text-text-muted uppercase tracking-[0.2em] font-bold">
                    { author && (
                        <span className="flex items-center gap-2"><i className="fa-solid fa-gem text-accent-indigo/50" /> { author }</span>
                    ) }
                    { author && date && <span className="w-1 h-1 rounded-full bg-white/20" /> }
                    { date && (
                        <span className="flex items-center gap-2"><i className="fa-regular fa-clock opacity-50" /> { new Date( date ).toLocaleDateString( 'pt-BR', { year: 'numeric', month: 'long', day: 'numeric' } ) }</span>
                    ) }
                </div>
            ) }
        </header>
    );
}
