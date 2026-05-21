'use client';

/**
 * IDENTITY: Motor SOTA de Quiz e Fixação
 * PATH: src/components/simulator/ui/QuizEngine.tsx
 * ROLE: Validar o conhecimento do aluno sobre o cenário atual.
 * BINDING: [engine/types.ts, simulator.module.css]
 */

import React, { useState, useEffect } from 'react';
import type { Quiz } from '../engine/types';
import styles from '../simulator.module.css';

interface QuizEngineProps {
  quiz?: Quiz | Quiz[];
}

const MOCK_QUIZ: Quiz[] = [
  {
    question: 'Qual é o impacto do Risk Premium (RP) em uma situação de Death Zone (RP ≥ 40%)?',
    options: [
      { id: 'A', text: 'O MDF do defensor aumenta para compensar a pressão.', isCorrect: false },
      { id: 'B', text: 'Ambos ignoram o ICM e jogam ChipEV.', isCorrect: false },
      { id: 'C', text: 'Ocorre um colapso nas frequências de defesa, forçando overfolds.', isCorrect: true },
      { id: 'D', text: 'A agressão (Alpha) é reduzida a zero.', isCorrect: false }
    ],
    explanation: 'Na Death Zone, o risco de eliminação é tão extremo que o Defensor é forçado a um overfold cirúrgico. O Agressor explora essa assimetria aumentando o Alpha.'
  },
  {
    question: 'O que o "Bubble Factor" (BF) representa matematicamente?',
    options: [
      { id: 'A', text: 'A quantidade de fichas necessárias para o ITM.', isCorrect: false },
      { id: 'B', text: 'O multiplicador de dor: quanto você arrisca (Custo) para ganhar $1.00 (Recompensa).', isCorrect: true },
      { id: 'C', text: 'A proporção direta de jogadores restantes no torneio.', isCorrect: false },
      { id: 'D', text: 'A equidade base dividida pelo tamanho do pote.', isCorrect: false }
    ],
    explanation: 'O Bubble Factor (BF) quantifica a assimetria do risco. Um BF de 2.0x significa que a ficha que você perde vale o dobro da ficha que você ganha.'
  }
];

export default function QuizEngine({ quiz }: Readonly<QuizEngineProps>) {
  const normalizeQuiz = (q?: Quiz | Quiz[]): Quiz[] | undefined => {
    if (!q) return undefined;
    return Array.isArray(q) ? q : [q];
  };

  const [activeQuiz, setActiveQuiz] = useState<Quiz[] | undefined>(normalizeQuiz(quiz));
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Sincroniza a prop quiz com o state caso o cenário mude na sidebar
  useEffect(() => {
    setActiveQuiz(normalizeQuiz(quiz));
  }, [quiz]);

  // Reset da UI de perguntas quando os dados do quiz ativo mudam
  useEffect(() => {
    setCurrentQuestionIdx(0);
    setSelectedOptionId(null);
    setShowExplanation(false);
    setScore(0);
    setIsFinished(false);
  }, [activeQuiz]);

  if (!activeQuiz || activeQuiz.length === 0) {
    return (
      <div style={{ color: '#64748b', fontSize: '0.8rem', fontStyle: 'italic', textAlign: 'center', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <p style={{ margin: 0 }}>Nenhum quiz cadastrado para este laboratório.</p>
        <button
          onClick={() => setActiveQuiz(MOCK_QUIZ)}
          className={styles.toolButton}
        >
          <i className="fa-solid fa-flask" /> Injetar Quiz SOTA (Teste)
        </button>
      </div>
    );
  }

  const currentQuestion = activeQuiz[currentQuestionIdx];

  // Trava de segurança: Previne crash no milissegundo entre a mudança de dados e o reset do useEffect
  if (!currentQuestion) return null;

  const handleOptionSelect = (optionId: string, isCorrect: boolean) => {
    if (selectedOptionId !== null) return; // Evita duplo clique e travamento

    setSelectedOptionId(optionId);
    setShowExplanation(true);

    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIdx < activeQuiz.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
      setSelectedOptionId(null);
      setShowExplanation(false);
    } else {
      setIsFinished(true);
    }
  };

  if (isFinished) {
    const percentage = Math.round((score / activeQuiz.length) * 100);
    const passed = percentage >= 70;

    return (
      <div className={styles.quizContainer} style={{ textAlign: 'center', padding: '2rem 1rem' }}>
        <h3 style={{ fontSize: '1.2rem', color: passed ? '#10b981' : '#f43f5e', marginBottom: '1rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {passed ? 'Avaliação SOTA Concluída' : 'Atenção Necessária'}
        </h3>
        <p style={{ fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '1.5rem' }}>
          Você acertou <strong style={{ color: '#fff' }}>{score}</strong> de <strong style={{ color: '#fff' }}>{activeQuiz.length}</strong> questões ({percentage}%).
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
          Questão {currentQuestionIdx + 1} de {activeQuiz.length}
        </span>
        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', background: 'rgba(15,23,42,0.6)', padding: '4px 8px', borderRadius: '6px' }}>
          Score: <span style={{ color: '#10b981', marginLeft: '4px' }}>{score}</span>
        </span>
      </div>

      <h4 className={styles.quizQuestion}>
        {currentQuestion.question}
      </h4>

      <div className={styles.quizOptions}>
        {currentQuestion.options.map((option, index: number) => {
          // Fallback para IDs caso não existam no payload (A, B, C...)
          const optionId = option.id || String.fromCharCode(65 + index);
          const isSelected = selectedOptionId === optionId;
          const isCorrect = option.isCorrect !== undefined ? option.isCorrect : (option as any).correct;

          let stateClass = '';
          if (selectedOptionId !== null) {
            if (isCorrect) stateClass = styles.quizCorrect;
            else if (isSelected) stateClass = styles.quizWrong;
            else stateClass = styles.quizDisabled;
          }

          return (
            <button
              key={optionId}
              onClick={() => handleOptionSelect(optionId, isCorrect)}
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
            className={styles.aiSubmitButton}
          >
            {currentQuestionIdx < activeQuiz.length - 1 ? 'Próxima Questão' : 'Ver Resultados'} <i className="fa-solid fa-arrow-right" />
          </button>
        </div>
      )}
    </div>
  );
}
