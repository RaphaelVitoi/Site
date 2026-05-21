import React, { useState } from 'react';
import { QuizOption, QuizQuestion as QuizQuestionType } from './types';

interface QuizQuestionProps {
    question: QuizQuestionType;
    selectedOptionId?: string;
    onSelectOption: ( optionId: string ) => void;
}

export const QuizQuestion: React.FC<QuizQuestionProps> = ( { question, selectedOptionId, onSelectOption } ) => {
    const isAnswered = selectedOptionId !== undefined;
    const isUserCorrect = selectedOptionId === question.correctOptionId;

    const [oracleResponse, setOracleResponse] = useState<string | null>( null );
    const [isAskingOracle, setIsAskingOracle] = useState( false );

    const handleAskOracle = async () => {
        setIsAskingOracle( true );
        try {
            const res = await fetch( 'http://127.0.0.1:17042/ask-oracle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify( {
                    question: `Explique a lógica de poker por trás desta afirmação: ${question.explanation}`,
                    n_results: 2
                } )
            } );
            const data = await res.json();
            if ( data.status === 'SUCCESS' ) {
                setOracleResponse( data.answer );
            } else {
                setOracleResponse( "O Oráculo está em silêncio. (Falha de comunicação)" );
            }
        } catch ( error ) {
            console.error( "[Oráculo] Falha ao invocar Mente Coletiva:", error );

            // SOTA: Fallback resiliente para a Máquina Local (Zero Tokens)
            try {
                // 1. Tenta API Nativa do Navegador (Chrome window.ai SOTA)
                if ( 'ai' in globalThis && ( globalThis as any ).ai?.languageModel ) {
                    const model = await ( globalThis as any ).ai.languageModel.create();
                    const result = await model.prompt( `Explique a lógica de poker de forma curta: ${question.explanation}` );
                    setOracleResponse( `[Motor Nativo (Browser AI) - Zero Tokens]\n\n${result}` );
                    return;
                }

                // 2. Tenta Ollama Local (Llama 3.2 / Deepseek) como fallback de força bruta
                const ollamaRes = await fetch( 'http://127.0.0.1:11434/api/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify( { model: 'llama3.2:latest', prompt: `Explique a lógica de poker: ${question.explanation}`, stream: false } )
                } );
                if ( ollamaRes.ok ) {
                    const data = await ollamaRes.json();
                    setOracleResponse( `[Motor Local (Ollama) - Zero Tokens]\n\n${data.response}` );
                    return;
                }
            } catch ( localErr ) {
                console.error( "[Oráculo Local] Motores locais indisponíveis:", localErr );
            }

            setOracleResponse( "Mente Coletiva (17042) offline e Motores Locais (Browser AI / Ollama) indisponíveis." );
        } finally {
            setIsAskingOracle( false );
        }
    };

    return (
        <div className="p-8">
            <h2 className="text-text-main mb-6 text-lg leading-relaxed font-semibold">
                { question.text }
            </h2>
            <div className="flex flex-col gap-3">
                { question.options.map( ( option: QuizOption ) => {
                    const isSelected = selectedOptionId === option.id;
                    const isCorrect = option.id === question.correctOptionId;

                    let borderClass = 'border-white/10 hover:border-accent-indigo/50';
                    let bgClass = 'bg-bg-panel/40 hover:bg-accent-indigo/5';
                    let textClass = 'text-text-light';
                    let icon = null;

                    if ( isAnswered ) {
                        borderClass = 'border-transparent';
                        bgClass = 'bg-white/5';
                        textClass = 'text-text-darker';

                        if ( isCorrect ) {
                            borderClass = 'border-accent-emerald/40';
                            bgClass = 'bg-accent-emerald/10';
                            textClass = 'text-accent-emerald-light';
                            icon = <i className="fa-solid fa-check text-accent-emerald-light" />;
                        } else if ( isSelected && !isCorrect ) {
                            borderClass = 'border-accent-danger/40';
                            bgClass = 'bg-accent-danger/10';
                            textClass = 'text-accent-danger';
                            icon = <i className="fa-solid fa-xmark text-accent-danger" />;
                        }
                    }

                    return (
                        <button
                            key={ option.id }
                            onClick={ () => !isAnswered && onSelectOption( option.id ) }
                            disabled={ isAnswered }
                            className={ `p-4 border rounded-lg text-left transition-all outline-none flex justify-between items-center gap-4 text-[0.95rem] leading-relaxed ${isAnswered ? 'cursor-default' : 'cursor-pointer'} ${borderClass} ${bgClass} ${textClass}` }
                        >
                            <span>{ option.label }</span>
                            { icon && <span className="text-lg shrink-0">{ icon }</span> }
                        </button>
                    );
                } ) }
            </div>

            {/* Feedback Gamificado / Explicação */ }
            { isAnswered && question.explanation && (
                <div className={ `mt-8 p-6 rounded-lg border animate-sota-in ${isUserCorrect ? 'bg-accent-emerald/5 border-accent-emerald/20' : 'bg-accent-danger/5 border-accent-danger/20'}` }>
                    <div className="flex items-center gap-2 mb-3">
                        { isUserCorrect ? (
                            <><i className="fa-solid fa-circle-check text-accent-emerald text-lg" />
                                <strong className="text-accent-emerald uppercase tracking-widest text-sm">Visão SOTA (Acerto)</strong></>
                        ) : (
                            <><i className="fa-solid fa-circle-xmark text-accent-danger text-lg" />
                                <strong className="text-accent-danger uppercase tracking-widest text-sm">Entropia Detectada (Erro)</strong></>
                        ) }
                    </div>
                    <p className="text-text-light text-[0.95rem] m-0 leading-relaxed">{ question.explanation }</p>

                    {/* BOTÃO DO ORÁCULO SOTA */ }
                    { !isUserCorrect && (
                        <div className="mt-6 border-t border-white/10 pt-6">
                            { !oracleResponse && !isAskingOracle && (
                                <button
                                    onClick={ handleAskOracle }
                                    className="px-4 py-2 bg-accent-violet/15 hover:bg-accent-violet/25 text-accent-violet-light border border-accent-violet/30 rounded-md cursor-pointer font-bold text-xs uppercase tracking-widest inline-flex items-center gap-2 transition-all"
                                >
                                    <i className="fa-solid fa-brain" /> Consultar Oráculo (Mente Coletiva)
                                </button>
                            ) }

                            { isAskingOracle && (
                                <div className="text-accent-violet-light text-sm flex items-center gap-2">
                                    <i className="fa-solid fa-circle-notch fa-spin" /> Sincronizando com a Mente Coletiva...
                                </div>
                            ) }

                            { oracleResponse && (
                                <div className="mt-4 p-4 bg-black/30 rounded-md border-l-4 border-accent-violet">
                                    <h4 className="text-accent-violet-light m-0 mb-2 text-xs uppercase tracking-widest">Resposta do Oráculo (RAG)</h4>
                                    <div className="text-text-light text-sm leading-relaxed whitespace-pre-wrap">{ oracleResponse }</div>
                                </div>
                            ) }
                        </div>
                    ) }
                </div>
            ) }
        </div>
    );
};
