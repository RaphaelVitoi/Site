'use client';

/**
 * IDENTITY: Motor SOTA de Quiz e Fixação
 * PATH: src/components/simulator/ui/QuizEngine.tsx
 * ROLE: Validar o conhecimento do aluno sobre o cenário atual.
 * BINDING: [engine/types.ts, simulator.module.css]
 */

import React, { useState, useEffect } from 'react';
import type { QuizData } from '../engine/types';
import styles from '../simulator.module.css';

interface QuizEngineProps {
  quiz?: QuizData[];
}

export default function QuizEngine({ quiz }: Readonly<QuizEngineProps>) {
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Reset do quiz ao mudar de cenário
  useEffect(() => {
    setCurrentQuestionIdx(0);
    setSelectedOptionId(null);
    setShowExplanation(false);
    setScore(0);
    setIsFinished(false);
  }, [quiz]);

  if (!quiz || quiz.length === 0) {
    return (
      <div style={{ color: '#64748b', fontSize: '0.8rem', fontStyle: 'italic', textAlign: 'center', padding: '2rem' }}>
        Nenhum quiz cadastrado para este laboratório.
      </div>
    );
  }

  const currentQuestion = quiz[currentQuestionIdx];

  const handleOptionSelect = (optionId: string, isCorrect: boolean) => {
    if (selectedOptionId !== null) return; // Evita duplo clique e travamento

    setSelectedOptionId(optionId);
    setShowExplanation(true);

    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIdx < quiz.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
      setSelectedOptionId(null);
      setShowExplanation(false);
    } else {
      setIsFinished(true);
    }
  };

  if (isFinished) {
    const percentage = Math.round((score / quiz.length) * 100);
    const passed = percentage >= 70;

    return (
      <div className={styles.quizContainer} style={{ textAlign: 'center', padding: '2rem 1rem' }}>
        <h3 style={{ fontSize: '1.2rem', color: passed ? '#10b981' : '#f43f5e', marginBottom: '1rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {passed ? 'Avaliação SOTA Concluída' : 'Atenção Necessária'}
        </h3>
        <p style={{ fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '1.5rem' }}>
          Você acertou <strong style={{ color: '#fff' }}>{score}</strong> de <strong style={{ color: '#fff' }}>{quiz.length}</strong> questões ({percentage}%).
        </p>

        {passed ? (
          <p style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic', lineHeight: 1.5 }}>
            A entropia foi mitigada. Seu entendimento das pressões de ICM neste spot está consolidado.
          </p>
        ) : (
          <p style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic', lineHeight: 1.5 }}>
            Recomendamos invocar o <strong>Oráculo AI</strong> ou reler a aba de <strong>Fundamento</strong>. A letalidade do ICM não perdoa falhas.
          </p>
        )}

        <button
          onClick={() => {
            setCurrentQuestionIdx(0);
            setSelectedOptionId(null);
            setShowExplanation(false);
            setScore(0);
            setIsFinished(false);
          }}
          className={styles.toolButton}
          style={{ marginTop: '2rem', display: 'inline-flex', justifyContent: 'center' }}
        >
          Refazer Quiz <i className="fa-solid fa-rotate-right" />
        </button>
      </div>
    );
  }

  return (
    <div className={styles.quizContainer}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Questão {currentQuestionIdx + 1} de {quiz.length}
        </span>
        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', background: 'rgba(15,23,42,0.6)', padding: '4px 8px', borderRadius: '6px' }}>
          Score: <span style={{ color: '#10b981', marginLeft: '4px' }}>{score}</span>
        </span>
      </div>

      <h4 className={styles.quizQuestion}>
        {currentQuestion.question}
      </h4>

      <div className={styles.quizOptions}>
        {currentQuestion.options.map((option, index) => {
          // Fallback para IDs caso não existam no payload (A, B, C...)
          const optionId = option.id || String.fromCharCode(65 + index);
          const isSelected = selectedOptionId === optionId;
          const isCorrect = option.isCorrect;

          let stateClass = '';
          if (selectedOptionId !== null) {
            if (isCorrect) stateClass = styles.quizCorrect;
            else if (isSelected) stateClass = styles.quizWrong;
            else stateClass = styles.quizDisabled;
          }

          return (
            <button
              key={optionId}
              onClick={() => handleOptionSelect(optionId, option.isCorrect)}
              disabled={selectedOptionId !== null}
              className={`${styles.quizOption} ${stateClass}`}
            >
              <div className={styles.quizOptionIndicator}>
                {selectedOptionId !== null ? (
                  isCorrect ? (
                    <i className={`fa-solid fa-check ${styles.quizCheckIcon}`} />
                  ) : isSelected ? (
                    <i className={`fa-solid fa-xmark ${styles.quizXIcon}`} />
                  ) : (
                    <span style={{ opacity: 0.3 }}>{optionId.toUpperCase()}</span>
                  )
                ) : (
                  <span style={{ color: '#818cf8', fontWeight: 700 }}>{optionId.toUpperCase()}</span>
                )}
              </div>
              <span className={styles.quizOptionText}>{option.text}</span>
            </button>
          );
        })}
      </div>

      {showExplanation && (
        <div className={styles.quizExplanation}>
          <div className={styles.quizExplanationBar} />
          <h5 className={styles.quizExplanationTitle}>Por que esta é a resposta?</h5>
          <p className={styles.quizExplanationText}>
            {currentQuestion.explanation}
          </p>

          <button
            onClick={handleNextQuestion}
            style={{
              marginTop: '1.5rem',
              padding: '0.6rem 1.25rem',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              color: '#fff',
              border: 'none',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(99, 102, 241, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
            }}
          >
            {currentQuestionIdx < quiz.length - 1 ? 'Próxima Questão' : 'Ver Resultados'} <i className="fa-solid fa-arrow-right" />
          </button>
        </div>
      )}
    </div>
  );
}
