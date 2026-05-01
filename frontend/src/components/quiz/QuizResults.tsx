import React from 'react';

interface QuizResultsProps
{
    score: number;
    total: number;
    onRestart: () => void;
}

export const QuizResults: React.FC<QuizResultsProps> = ( { score, total, onRestart } ) =>
{
    const percentage = Math.round( ( score / total ) * 100 );
    const isSuccess = percentage >= 70;
    const title = isSuccess ? 'Sincronia Alcançada' : 'Entropia Residual';
    const icon = isSuccess ? 'fa-bolt' : 'fa-triangle-exclamation';

    return (
        <div className="py-16 px-8 text-center animate-sota-in">
            <i className={ `fa-solid ${ icon } text-5xl mb-6 opacity-80 ${ isSuccess ? 'text-accent-emerald' : 'text-accent-danger' }` } />
            <h2 className="text-text-main mb-2 text-3xl font-extrabold">{ title }</h2>
            <p className="text-text-muted text-[0.95rem] max-w-100 mx-auto mb-8 leading-relaxed">
                O seu modelo cognitivo foi testado contra a topologia deste cenário.
            </p>

            <div className={ `inline-flex flex-col items-center justify-center w-45 h-45 rounded-full mb-10 border-2 ${ isSuccess ? 'border-accent-emerald/30 shadow-[0_0_30px_rgba(16,185,129,0.15)] bg-[radial-gradient(circle,rgba(15,23,42,1)_50%,rgba(16,185,129,0.1)_100%)]' : 'border-accent-danger/30 shadow-[0_0_30px_rgba(244,63,94,0.15)] bg-[radial-gradient(circle,rgba(15,23,42,1)_50%,rgba(244,63,94,0.1)_100%)]' }` }>
                <div className={ `text-5xl font-mono font-black leading-none ${ isSuccess ? 'text-accent-emerald' : 'text-accent-danger' }` }>
                    { percentage }%
                </div>
                <div className="text-text-dim text-xs uppercase tracking-widest mt-2 font-bold">
                    Precisão
                </div>
            </div>

            <div className="mb-12 flex gap-8 justify-center">
                <div className="text-center">
                    <span className="block text-text-dim text-xs uppercase tracking-widest mb-1 font-bold">Acertos</span>
                    <span className="text-2xl font-black font-mono text-accent-emerald">{ score }</span>
                </div>
                <div className="w-px bg-white/10" />
                <div className="text-center">
                    <span className="block text-text-dim text-xs uppercase tracking-widest mb-1 font-bold">Erros</span>
                    <span className="text-2xl font-black font-mono text-accent-danger">{ total - score }</span>
                </div>
            </div>

            <button
                onClick={ onRestart }
                className="px-10 py-3.5 bg-white/5 text-text-bright border border-white/10 rounded-lg cursor-pointer font-bold transition-all text-sm uppercase tracking-widest inline-flex items-center gap-2 hover:bg-white/10"
            >
                <i className="fa-solid fa-rotate-right" /> Calibrar Novamente
            </button>
        </div>
    );
};
