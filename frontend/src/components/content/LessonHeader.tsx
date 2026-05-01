
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
        <header className="page-header text-center mb-12 animate-fade-up">
            <p className="font-mono text-[0.65rem] font-black uppercase tracking-widest text-accent-emerald bg-accent-emerald/10 border border-accent-emerald/20 px-3 py-1.5 rounded-full inline-block shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                { category }
            </p>
            <h1 className="mt-6 text-4xl sm:text-5xl font-extrabold tracking-tighter font-heading bg-linear-to-br from-text-main to-accent-emerald text-transparent bg-clip-text" style={ { textWrap: 'balance' } }>
                { title }
            </h1>

            { ( date || author ) && (
                <div className="mt-8 flex justify-center items-center gap-4 text-xs font-mono text-text-muted uppercase tracking-widest font-bold">
                    { author && (
                        <span><i className="fa-solid fa-user-astronaut mr-2" /> { author }</span>
                    ) }
                    { author && date && <span className="text-white/20">&bull;</span> }
                    { date && (
                        <span><i className="fa-regular fa-calendar mr-2" /> { new Date( date ).toLocaleDateString( 'pt-BR', { year: 'numeric', month: 'long', day: 'numeric' } ) }</span>
                    ) }
                </div>
            ) }
        </header>
    );
}
