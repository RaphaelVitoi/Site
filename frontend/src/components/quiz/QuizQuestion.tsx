import React from 'react';
import { QuizOption, QuizQuestion as QuizQuestionType } from './types';

interface QuizQuestionProps
{
    question: QuizQuestionType;
    selectedOptionId?: string;
    onSelectOption: ( optionId: string ) => void;
}

export const QuizQuestion: React.FC<QuizQuestionProps> = ( { question, selectedOptionId, onSelectOption } ) =>
{
    // Fix: explicitly check if selectedOptionId is truthy and not empty
    const isAnswered = selectedOptionId !== undefined && selectedOptionId !== '';
    const isUserCorrect = selectedOptionId === question.correctOptionId;

    return (
        <div className="p-8 lg:p-10">
            <h2 className="text-white mb-8 text-xl leading-relaxed font-black tracking-tight">
                { question.text }
            </h2>
            <div className="flex flex-col gap-4">
                { question.options.map( ( option: QuizOption ) =>
                {
                    const isSelected = selectedOptionId === option.id;
                    const isCorrect = option.id === question.correctOptionId;

                    let btnClasses = "p-5 rounded-xl text-left transition-all duration-300 outline-none flex justify-between items-center gap-4 text-[0.95rem] leading-relaxed border shadow-sm";
                    let icon = null;

                    if ( isAnswered )
                    {
                        if ( isCorrect )
                        {
                            btnClasses += " border-accent-emerald/40 bg-accent-emerald/10 text-accent-emerald-light shadow-[0_0_15px_rgba(16,185,129,0.15)] cursor-default";
                            icon = <i className="fa-solid fa-circle-check text-xl text-accent-emerald" />;
                        } else if ( isSelected && !isCorrect )
                        {
                            btnClasses += " border-accent-rose/40 bg-accent-rose/10 text-accent-rose shadow-[0_0_15px_rgba(244,63,94,0.15)] cursor-default";
                            icon = <i className="fa-solid fa-circle-xmark text-xl text-accent-rose" />;
                        } else
                        {
                            btnClasses += " border-white/5 bg-white/5 text-text-darker cursor-default opacity-50 grayscale";
                        }
                    } else
                    {
                        btnClasses += " cursor-pointer border-white/10 bg-bg-deep text-text-light hover:border-accent-indigo/50 hover:bg-accent-indigo/10 hover:-translate-y-0.5 hover:shadow-lg";
                    }

                    return (
                        <button
                            key={ option.id }
                            onClick={ () => !isAnswered && onSelectOption( option.id ) }
                            disabled={ isAnswered }
                            className={ btnClasses }
                        >
                            <span className="font-medium">{ option.label }</span>
                            { icon && <span className="shrink-0">{ icon }</span> }
                        </button>
                    );
                } ) }
            </div>

            {/* Feedback Gamificado / Explicação Didática */ }
            { isAnswered && question.explanation && (
                <div className={ `mt-10 p-8 rounded-2xl animate-sota-in border backdrop-blur-md ${ isUserCorrect ? 'bg-accent-emerald/5 border-accent-emerald/20' : 'bg-accent-danger/5 border-accent-danger/20' }` }>
                    <div className="flex items-center gap-3 mb-4">
                        { isUserCorrect ? (
                            <>
                                <div className="w-8 h-8 rounded-full bg-accent-emerald/20 flex items-center justify-center border border-accent-emerald/30">
                                    <i className="fa-solid fa-check text-accent-emerald text-sm" />
                                </div>
                                <h3 className="text-accent-emerald uppercase tracking-[0.1em] text-[0.85rem] font-black m-0">
                                    Visão SOTA Confirmada
                                </h3>
                            </>
                        ) : (
                            <>
                                <div className="w-8 h-8 rounded-full bg-accent-danger/20 flex items-center justify-center border border-accent-danger/30">
                                    <i className="fa-solid fa-xmark text-accent-danger text-sm" />
                                </div>
                                <h3 className="text-accent-danger uppercase tracking-[0.1em] text-[0.85rem] font-black m-0">
                                    Entropia Detectada
                                </h3>
                            </>
                        ) }
                    </div>
                    
                    <div className="text-text-light text-[0.95rem] m-0 leading-loose whitespace-pre-wrap">
                        { question.explanation }
                    </div>
                </div>
            ) }
        </div>
    );
};
