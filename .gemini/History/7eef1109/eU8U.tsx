// Arquivo: frontend/src/components/quiz/QuizEngine.tsx

import { logTelemetryEvent } from '@/lib/telemetry-client';
import React, { useMemo, useState } from 'react';
import { QuizProgress } from './QuizProgress';
import { QuizQuestion } from './QuizQuestion';
import { QuizResults } from './QuizResults';
import { QuizQuestion as QuizQuestionType } from './types';

interface QuizEngineProps
{
    questions: QuizQuestionType[];
    onQuizRestart?: () => void;
}

const EMPTY_QUESTIONS: QuizQuestionType[] = [];

export const QuizEngine: React.FC<QuizEngineProps> = ( { questions, onQuizRestart } ) =>
{
    // Blindagem SOTA: Garante que questions sempre será iterável e lida com dados corrompidos.
    const safeQuestions = useMemo( () => ( Array.isArray( questions ) ? questions : EMPTY_QUESTIONS ), [ questions ] );

    // O(1) State Complexity: Usamos um Dicionário de Respostas em vez de Arrays mapeados
    const [ currentIndex, setCurrentIndex ] = useState( 0 );
    const [ answers, setAnswers ] = useState<Record<string, string>>( {} );

    const isFinished = currentIndex >= safeQuestions.length;

    // Avaliação em tempo real O(N) apenas no total de respostas preenchidas
    const score = useMemo( () =>
    {
        return safeQuestions.reduce( ( acc, q ) =>
        {
            return acc + ( answers[ q.id ] === q.correctOptionId ? 1 : 0 );
        }, 0 );
    }, [ answers, safeQuestions ] );

    const handleSelectOption = ( optionId: string ) =>
    {
        const currentQ = safeQuestions[ currentIndex ];
        if ( !currentQ ) return;
        setAnswers( prev => ( { ...prev, [ currentQ.id ]: optionId } ) );

        // ==========================================
        // TELEMETRIA SOTA: Disparo em Fricção Zero
        // ==========================================
        const isCorrect = optionId === currentQ.correctOptionId;
        logTelemetryEvent( {
            category: ( currentQ.category || "Fundamentos SOTA" ) as any,
            metadata: { questionId: currentQ.id, questionText: currentQ.text },
            userAction: optionId,
            optimalAction: currentQ.correctOptionId,
            evLoss: isCorrect ? 0 : 0.5, // Sangria fixa didática de 0.5% por erro
            isCorrect: isCorrect
        } ).catch( err => console.error( "[Telemetria] Falha silenciosa:", err ) );
    };

    const handleNext = () => setCurrentIndex( prev => prev + 1 );
    const handleRestart = () =>
    {
        setAnswers( {} );
        setCurrentIndex( 0 );
        if ( onQuizRestart ) onQuizRestart();
    };

    if ( safeQuestions.length === 0 ) return null;

    return (
        <div className="glass-panel max-w-3xl mx-auto overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,0,0,0.4)]">
            { isFinished ? (
                <QuizResults score={ score } total={ safeQuestions.length } onRestart={ handleRestart } />
            ) : (
                <>
                    <QuizProgress current={ currentIndex } total={ safeQuestions.length } score={ score } />

                    <QuizQuestion
                        question={ safeQuestions[ currentIndex ]! }
                        selectedOptionId={ safeQuestions[ currentIndex ] ? ( answers[ safeQuestions[ currentIndex ]!.id ] || '' ) : '' }
                        onSelectOption={ handleSelectOption }
                    />

                    <div className="px-8 pb-8 pt-0 flex justify-end min-h-[80px]">
                        { safeQuestions[ currentIndex ] && answers[ safeQuestions[ currentIndex ]!.id ] && (
                            <button
                                onClick={ handleNext }
                                className="px-6 py-2.5 bg-accent-indigo/15 text-accent-indigo-light border border-accent-indigo/30 rounded-md cursor-pointer font-bold transition-all uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-accent-indigo/25"
                            >
                                { currentIndex === safeQuestions.length - 1 ? 'Ver Impacto' : 'Avançar' } <i className="fa-solid fa-arrow-right" />
                            </button>
                        ) }
                    </div>
                </>
            ) }
        </div>
    );
};
