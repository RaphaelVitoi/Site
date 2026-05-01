import { buildNexusClientUrl } from '@/lib/api-contract';
import React, { useState } from 'react';
import { QuizOption, QuizQuestion as QuizQuestionType } from './types';

interface QuizQuestionProps
{
    question: QuizQuestionType;
    selectedOptionId?: string;
    onSelectOption: ( optionId: string ) => void;
}

export const QuizQuestion: React.FC<QuizQuestionProps> = ( { question, selectedOptionId, onSelectOption } ) =>
{
    const isAnswered = selectedOptionId !== undefined;
    const isUserCorrect = selectedOptionId === question.correctOptionId;

    const [ oracleResponse, setOracleResponse ] = useState<string | null>( null );
    const [ isAskingOracle, setIsAskingOracle ] = useState( false );

    const handleAskOracle = async () =>
    {
        setIsAskingOracle( true );
        try
        {
            const res = await fetch( buildNexusClientUrl( '/ask-oracle' ), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify( {
                    question: `Explique a lógica de poker por trás desta afirmação: ${ question.explanation }`,
                    n_results: 2
                } )
            } );
            const data = await res.json();
            if ( data.status === 'SUCCESS' )
            {
                setOracleResponse( data.answer );
            } else
            {
                setOracleResponse( "O Oráculo está em silêncio. (Falha de comunicação)" );
            }
        } catch ( error: unknown )
        {
            console.warn( "[Oráculo] Mente Coletiva (17042) offline. Comutando para Fallback local... Detalhe:", String( error ) );

            // SOTA: Fallback resiliente para a Máquina Local (Zero Tokens)
            try
            {
                // 1. Tenta API Nativa do Navegador (Chrome window.ai SOTA)
                if ( 'ai' in globalThis && ( globalThis as any ).ai?.languageModel )
                {
                    const model = await ( globalThis as any ).ai.languageModel.create();
                    const result = await model.prompt( `Explique a lógica de poker de forma curta: ${ question.explanation }` );
                    setOracleResponse( `[Motor Nativo (Browser AI) - Zero Tokens]\n\n${ result }` );
                    return;
                }

                // 2. Tenta Ollama Local (Llama 3.2 / Deepseek) como fallback de força bruta
                const ollamaRes = await fetch( 'http://127.0.0.1:11434/api/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify( { model: 'llama3.2:latest', prompt: `Explique a lógica de poker: ${ question.explanation }`, stream: false } )
                } );
                if ( ollamaRes.ok )
                {
                    const data = await ollamaRes.json();
                    setOracleResponse( `[Motor Local (Ollama) - Zero Tokens]\n\n${ data.response }` );
                    return;
                }
            } catch ( localErr: unknown )
            {
                console.warn( "[Oráculo Local] Motores locais (Browser AI / Ollama) indisponíveis. Detalhe:", String( localErr ) );
            }

            setOracleResponse( "Mente Coletiva (17042) offline e Motores Locais (Browser AI / Ollama) indisponíveis." );
        } finally
        {
            setIsAskingOracle( false );
        }
    };

    return (
        <div className="p-8">
            <h2 className="text-text-main mb-6 text-lg leading-relaxed font-semibold">
                { question.text }
            </h2>
            <div className="flex flex-col gap-3">
                { question.options.map( ( option: QuizOption ) =>
                {
                    const isSelected = selectedOptionId === option.id;
                    const isCorrect = option.id === question.correctOptionId;

                    let btnClasses = "p-4 border rounded-lg text-left transition-all duration-200 outline-none flex justify-between items-center gap-4 text-[0.95rem] leading-relaxed";
                    let icon = null;

                    if ( isAnswered )
                    {
                        if ( isCorrect )
                        {
                            btnClasses += " border-accent-emerald/40 bg-accent-emerald/10 text-accent-emerald-light cursor-default";
                            icon = <i className="fa-solid fa-check text-accent-emerald-light" />;
                        } else if ( isSelected && !isCorrect )
                        {
                            btnClasses += " border-accent-rose/40 bg-accent-rose/10 text-accent-rose cursor-default";
                            icon = <i className="fa-solid fa-xmark text-accent-rose" />;
                        } else
                        {
                            btnClasses += " border-transparent bg-white/5 text-text-darker cursor-default";
                        }
                    } else
                    {
                        btnClasses += " cursor-pointer border-white/10 bg-slate-900/40 text-text-light hover:border-accent-indigo/50 hover:bg-accent-indigo/5";
                    }

                    return (
                        <button
                            key={ option.id }
                            onClick={ () => !isAnswered && onSelectOption( option.id ) }
                            disabled={ isAnswered }
                            className={ btnClasses }
                        >
                            <span>{ option.label }</span>
                            { icon && <span className="text-lg shrink-0">{ icon }</span> }
                        </button>
                    );
                } ) }
            </div>

            {/* Feedback Gamificado / Explicação */ }
            { isAnswered && question.explanation && (
                <div className={ `mt-8 p-6 rounded-lg animate-sota-in border ${ isUserCorrect ? 'bg-accent-emerald/5 border-accent-emerald/20' : 'bg-accent-rose/5 border-accent-rose/20' }` }>
                    <div className="flex items-center gap-2 mb-3">
                        { isUserCorrect ? (
                            <><i className="fa-solid fa-circle-check text-accent-emerald text-xl" />
                                <strong className="text-accent-emerald uppercase tracking-[0.05em] text-[0.85rem] font-bold">Visão SOTA (Acerto)</strong></>
                        ) : (
                            <><i className="fa-solid fa-circle-xmark text-accent-danger text-xl" />
                                <strong className="text-accent-danger uppercase tracking-[0.05em] text-[0.85rem] font-bold">Entropia Detectada (Erro)</strong></>
                        ) }
                    </div>
                    <p className="text-text-light text-[0.95rem] m-0 leading-relaxed">{ question.explanation }</p>

                    {/* BOTÃO DO ORÁCULO SOTA */ }
                    { !isUserCorrect && (
                        <div className="mt-6 border-t border-white/10 pt-6">
                            { !oracleResponse && !isAskingOracle && (
                                <button
                                    onClick={ handleAskOracle }
                                    className="px-4 py-2 bg-purple-500/15 text-purple-400 border border-purple-500/30 rounded-md cursor-pointer font-bold text-xs uppercase tracking-widest inline-flex items-center gap-2 transition-all hover:bg-purple-500/25"
                                >
                                    <i className="fa-solid fa-brain" /> Consultar Oráculo (Mente Coletiva)
                                </button>
                            ) }

                            { isAskingOracle && (
                                <div className="text-purple-400 text-sm flex items-center gap-2">
                                    <i className="fa-solid fa-circle-notch fa-spin" /> Sincronizando com a Mente Coletiva...
                                </div>
                            ) }

                            { oracleResponse && (
                                <div className="mt-4 p-4 bg-black/30 rounded-md border-l-4 border-purple-500">
                                    <h4 className="text-purple-400 m-0 mb-2 text-xs uppercase tracking-widest font-bold">Resposta do Oráculo (RAG)</h4>
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
