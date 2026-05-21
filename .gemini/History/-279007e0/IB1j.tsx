
interface LessonHeaderProps {
    title: string;
    category: string;
    date?: string;
    author?: string;
}

export default function LessonHeader ( { title, category, date, author }: Readonly<LessonHeaderProps> ) {
    return (
        <header className="page-header text-center mb-12 animate-fade-up">
            <p className="font-mono text-sm uppercase tracking-widest text-emerald-400">
                { category }
            </p>
            <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight font-heading" style={ {
                background: 'linear-gradient(135deg, #fff 0%, #10b981 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textWrap: 'balance', // Improves title wrapping for multi-line titles
            } }>
                { title }
            </h1>

            { ( date || author ) && (
                <div className="mt-6 flex justify-center items-center gap-4 text-sm font-mono text-slate-500 uppercase tracking-wider">
                    { author && (
                        <span><i className="fa-solid fa-user-astronaut mr-2" /> { author }</span>
                    ) }
                    { author && date && <span className="text-slate-700">&bull;</span> }
                    { date && (
                        <span><i className="fa-regular fa-calendar mr-2" /> { new Date( date ).toLocaleDateString( 'pt-BR', { year: 'numeric', month: 'long', day: 'numeric' } ) }</span>
                    ) }
                </div>
            ) }
        </header>
    );
}
