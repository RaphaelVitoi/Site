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

    const [ oracleResponse, setOracleResponse ] = useState<string | null>( null );
    const [ isAskingOracle, setIsAskingOracle ] = useState( false );

    const handleAskOracle = async () => {
        setIsAskingOracle( true );
        try
        {
            const res = await fetch( 'http://127.0.0.1:17042/ask-oracle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify( {
                    question: `Explique a lógica de poker por trás desta afirmação: ${question.explanation}`,
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
        } catch ( error )
        {
            console.error( "[Oráculo] Falha ao invocar Mente Coletiva:", error );

            // SOTA: Fallback resiliente para a Máquina Local (Zero Tokens)
            try
            {
                // 1. Tenta API Nativa do Navegador (Chrome window.ai SOTA)
                if ( 'ai' in globalThis && ( globalThis as any ).ai?.languageModel )
                {
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
                if ( ollamaRes.ok )
                {
                    const data = await ollamaRes.json();
                    setOracleResponse( `[Motor Local (Ollama) - Zero Tokens]\n\n${data.response}` );
                    return;
                }
            } catch ( localErr )
            {
                console.error( "[Oráculo Local] Motores locais indisponíveis:", localErr );
            }

            setOracleResponse( "Mente Coletiva (17042) offline e Motores Locais (Browser AI / Ollama) indisponíveis." );
        } finally
        {
            setIsAskingOracle( false );
        }
    };

    return (
        <div style={ { padding: '2rem' } }>
            <h2 style={ { color: 'var(--text-main)', marginBottom: '1.5rem', fontSize: '1.15rem', lineHeight: 1.6, fontWeight: 600 } }>
                { question.text }
            </h2>
            <div style={ { display: 'flex', flexDirection: 'column', gap: '0.75rem' } }>
                { question.options.map( ( option: QuizOption ) => {
                    const isSelected = selectedOptionId === option.id;
                    const isCorrect = option.id === question.correctOptionId;

                    let borderColor = 'rgba(255, 255, 255, 0.08)';
                    let bgColor = 'rgba(15, 23, 42, 0.4)';
                    let textColor = 'var(--text-light)';
                    let icon = null;

                    if ( isAnswered )
                    {
                        if ( isCorrect )
                        {
                            borderColor = 'rgba(16, 185, 129, 0.4)';
                            bgColor = 'rgba(16, 185, 129, 0.08)';
                            textColor = 'var(--accent-emerald-light)';
                            icon = <i className="fa-solid fa-check" style={ { color: 'var(--accent-emerald-light)' } } />;
                        } else if ( isSelected && !isCorrect )
                        {
                            borderColor = 'rgba(244, 63, 94, 0.4)';
                            bgColor = 'rgba(244, 63, 94, 0.08)';
                            textColor = 'var(--accent-rose)';
                            icon = <i className="fa-solid fa-xmark" style={ { color: 'var(--accent-rose)' } } />;
                        } else
                        {
                            borderColor = 'transparent';
                            bgColor = 'rgba(255, 255, 255, 0.02)';
                            textColor = 'var(--text-darker)';
                        }
                    }

                    return (
                        <button
                            key={ option.id }
                            onClick={ () => !isAnswered && onSelectOption( option.id ) }
                            disabled={ isAnswered }
                            style={ {
                                padding: '1rem 1.25rem', border: `1px solid ${borderColor}`, backgroundColor: bgColor, color: textColor,
                                borderRadius: '8px', textAlign: 'left', cursor: isAnswered ? 'default' : 'pointer',
                                transition: 'all 0.2s ease', outline: 'none', display: 'flex', justifyContent: 'space-between',
                                alignItems: 'center', gap: '1rem', fontSize: '0.95rem', lineHeight: 1.5
                            } }
                            onMouseEnter={ ( e ) => {
                                if ( !isAnswered ) { e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.5)'; e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.05)'; }
                            } }
                            onMouseLeave={ ( e ) => {
                                if ( !isAnswered ) { e.currentTarget.style.borderColor = borderColor; e.currentTarget.style.backgroundColor = bgColor; }
                            } }
                        >
                            <span>{ option.label }</span>
                            { icon && <span style={ { fontSize: '1.1rem', flexShrink: 0 } }>{ icon }</span> }
                        </button>
                    );
                } ) }
            </div>

            {/* Feedback Gamificado / Explicação */ }
            { isAnswered && question.explanation && (
                <div style={ {
                    marginTop: '2rem', padding: '1.5rem',
                    backgroundColor: isUserCorrect ? 'rgba(16, 185, 129, 0.05)' : 'rgba(244, 63, 94, 0.05)',
                    borderRadius: '8px', border: `1px solid ${isUserCorrect ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)'}`,
                    animation: 'fadeIn 0.4s ease'
                } }>
                    <div style={ { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' } }>
                        { isUserCorrect ? (
                            <><i className="fa-solid fa-circle-check" style={ { color: 'var(--accent-emerald)', fontSize: '1.2rem' } } />
                                <strong style={ { color: 'var(--accent-emerald)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.85rem' } }>Visão SOTA (Acerto)</strong></>
                        ) : (
                            <><i className="fa-solid fa-circle-xmark" style={ { color: 'var(--accent-danger)', fontSize: '1.2rem' } } />
                                <strong style={ { color: 'var(--accent-danger)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.85rem' } }>Entropia Detectada (Erro)</strong></>
                        ) }
                    </div>
                    <p style={ { color: 'var(--text-light)', fontSize: '0.95rem', margin: 0, lineHeight: 1.6 } }>{ question.explanation }</p>

                    {/* BOTÃO DO ORÁCULO SOTA */ }
                    { !isUserCorrect && (
                        <div style={ { marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' } }>
                            { !oracleResponse && !isAskingOracle && (
                                <button
                                    onClick={ handleAskOracle }
                                    style={ {
                                        padding: '0.5rem 1rem', backgroundColor: 'rgba(168, 85, 247, 0.15)', color: 'var(--accent-purple-light)',
                                        border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '6px', cursor: 'pointer',
                                        fontWeight: 'bold', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em',
                                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s ease'
                                    } }
                                >
                                    <i className="fa-solid fa-brain" /> Consultar Oráculo (Mente Coletiva)
                                </button>
                            ) }

                            { isAskingOracle && (
                                <div style={ { color: 'var(--accent-purple-light)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' } }>
                                    <i className="fa-solid fa-circle-notch fa-spin" /> Sincronizando com a Mente Coletiva...
                                </div>
                            ) }

                            { oracleResponse && (
                                <div style={ { marginTop: '1rem', padding: '1rem', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '6px', borderLeft: '3px solid var(--accent-purple)' } }>
                                    <h4 style={ { color: 'var(--accent-purple-light)', margin: '0 0 0.5rem 0', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' } }>Resposta do Oráculo (RAG)</h4>
                                    <div style={ { color: 'var(--text-light)', fontSize: '0.9rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' } }>{ oracleResponse }</div>
                                </div>
                            ) }
                        </div>
                    ) }
                </div>
            ) }
        </div>
    );
};
