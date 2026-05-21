'use client';

/**
 * IDENTITY: Painel de Teoria com Tabs
 * PATH: src/components/simulator/panels/TheoryPanel.tsx
 * ROLE: Exibir Fundamento Teórico, Diluição SPR, Vetor de Exploit e Quiz por cenário.
 * BINDING: [engine/types.ts, ui/SprPipeline.tsx, ui/QuizEngine.tsx, simulator.module.css]
 */

import React, { useState, useEffect } from 'react';
import type { Scenario } from '../engine/types';
import SprPipeline from '../ui/SprPipeline';
import { QuizEngine } from '@/components/quiz/QuizEngine';
import RangeMatrix from './RangeMatrix';
import styles from '../simulator.module.css';

interface TheoryPanelProps {
  scenario: Scenario;
}

type TabId = 'theory' | 'ranges' | 'bubble' | 'spr' | 'exploit' | 'quiz';

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'theory', label: 'Fundamento', icon: 'fa-brain' },
  { id: 'ranges', label: 'Ranges (13x13)', icon: 'fa-table-cells' },
  { id: 'bubble', label: 'Bubble Factor', icon: 'fa-burst' },
  { id: 'spr', label: 'Dissipação RP', icon: 'fa-arrow-trend-down' },
  { id: 'exploit', label: 'Exploit', icon: 'fa-crosshairs' },
  { id: 'quiz', label: 'Quiz', icon: 'fa-circle-question' },
];

export default function TheoryPanel({ scenario }: Readonly<TheoryPanelProps>) {
  const [activeTab, setActiveTab] = useState<TabId>('theory');

  // Reset tab ao mudar cenário
  useEffect(() => {
    setActiveTab('theory');
  }, [scenario.id]);

  // Cálculos do Bubble Factor
  const calcBF = (rp: number) => {
    if (rp >= 100) return 999; // Evitar infinito que quebra UI
    return 100 / (100 - rp);
  };

  // Adaptador SOTA: Transpila o formato de quiz legado para a nova matriz O(1) em tempo real
  const normalizeQuizData = (quizData: any) => {
    if (!quizData) return [];

    let rawList = [];
    if (Array.isArray(quizData)) {
      rawList = quizData;
    } else if (quizData.questions && Array.isArray(quizData.questions)) {
      rawList = quizData.questions;
    } else if (quizData.question || quizData.q || quizData.text) {
      rawList = [quizData];
    } else if (typeof quizData === 'object') {
      rawList = Object.values(quizData);
    }

    return rawList.map((q: any, index: number) => {
      if (!q) return null;
      if (q.id && q.text && q.correctOptionId !== undefined) return q;

      const questionText = q.text || q.question || q.q || q.title || 'Pergunta não definida';
      const rawOptions = q.options || q.choices || q.answers || q.respostas || [];
      const correctIndex = q.correctAnswer ?? q.correct ?? q.answer ?? q.a ?? 0;
      const explanationText = q.explanation || q.exp || q.reason || q.justification || '';

      return {
        id: `q-${scenario.id}-${index}`,
        text: questionText,
        options: rawOptions.map((opt: any, i: number) => ({
          id: `opt-${i}`,
          label: typeof opt === 'string' ? opt : (opt.label || opt.text || String(opt))
        })),
        correctOptionId: `opt-${correctIndex}`,
        explanation: explanationText
      };
    }).filter(Boolean);
  };

  return (
    <div className={styles.glassPanel} style={{ padding: '1.5rem' }}>
      {/* Tabs */}
      <div className={styles.tabsContainer}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`${styles.tabBtn} ${activeTab === tab.id ? styles.tabBtnActive : ''}`}
          >
            <i className={`fa-solid ${tab.icon}`} style={{ fontSize: '0.58rem' }} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Conteúdo por tab */}
      <div className={styles.animateFadeUp} key={`${scenario.id}-${activeTab}`}>
        {activeTab === 'theory' && (
          <div
            style={{ color: 'var(--sim-text-main)', lineHeight: 1.7, fontSize: '0.95rem' }}
            dangerouslySetInnerHTML={{ __html: scenario.theory }}
          />
        )}

        {activeTab === 'ranges' && (
          <RangeMatrix ipRp={scenario.ipRp} oopRp={scenario.oopRp} scenarioId={scenario.id} />
        )}

        {activeTab === 'bubble' && (() => {
          const ipBf = calcBF(scenario.ipRp);
          const oopBf = calcBF(scenario.oopRp);
          const deltaRp = scenario.ipRp - scenario.oopRp;
          // Equity para pot-sized call (delta vs ChipEV 33.3%)
          const ipEquity = ipBf / (ipBf + 2);
          const oopEquity = oopBf / (oopBf + 2);
          const chipEvEquity = 1 / 3;
          const ipDelta = ((ipEquity - chipEvEquity) * 100).toFixed(1);
          const oopDelta = ((oopEquity - chipEvEquity) * 100).toFixed(1);

          const hasIpAdvantage = deltaRp < 0;
          const deltaLabel = hasIpAdvantage
            ? `IP tem Vantagem de Risco (ΔRP ${Math.abs(deltaRp).toFixed(1)}%)`
            : deltaRp > 0
              ? `IP mais constrangido (ΔRP +${deltaRp.toFixed(1)}%)`
              : 'RP simétrico — pressão igual';

          return (
            <div>
              <h4 style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--sim-color-amber)', textTransform: 'uppercase', letterSpacing: '0.15em', margin: '0 0 1rem 0' }}>
                Bubble Factor — Multiplicador de Risco ICM
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                {/* IP BF Card */}
                <div className={styles.bfCardIp}>
                  <p style={{ fontSize: '0.58rem', color: 'var(--sim-color-indigo)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 0.25rem 0', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>Agressor (IP) · RP {scenario.ipRp.toFixed(1)}%</p>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--sim-color-indigo-light)', fontFamily: 'var(--sim-font-mono)', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                    {ipBf.toFixed(2)}x
                  </div>
                  <p style={{ fontSize: '0.6rem', color: 'var(--sim-text-dim)', margin: '0.5rem 0 0 0', lineHeight: 1.45 }}>
                    Pot-sized call:<br />
                    <span style={{ color: 'var(--sim-color-indigo-light)', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{(ipEquity * 100).toFixed(1)}% equity</span>
                    <span style={{ color: 'var(--sim-text-subtle)', fontVariantNumeric: 'tabular-nums' }}> vs 33.3% ChipEV</span><br />
                    <span style={{ color: 'var(--sim-color-rose)', fontSize: '0.58rem', fontVariantNumeric: 'tabular-nums' }}>+{ipDelta}pp acima do MDF</span>
                  </p>
                </div>

                {/* OOP BF Card */}
                <div className={styles.bfCardOop}>
                  <p style={{ fontSize: '0.58rem', color: 'var(--sim-color-rose)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 0.25rem 0', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>Defensor (OOP) · RP {scenario.oopRp.toFixed(1)}%</p>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--sim-color-rose-light)', fontFamily: 'var(--sim-font-mono)', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                    {oopBf.toFixed(2)}x
                  </div>
                  <p style={{ fontSize: '0.6rem', color: 'var(--sim-text-dim)', margin: '0.5rem 0 0 0', lineHeight: 1.45 }}>
                    Pot-sized call:<br />
                    <span style={{ color: 'var(--sim-color-rose-light)', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{(oopEquity * 100).toFixed(1)}% equity</span>
                    <span style={{ color: 'var(--sim-text-subtle)', fontVariantNumeric: 'tabular-nums' }}> vs 33.3% ChipEV</span><br />
                    <span style={{ color: 'var(--sim-color-rose)', fontSize: '0.58rem', fontVariantNumeric: 'tabular-nums' }}>+{oopDelta}pp acima do MDF</span>
                  </p>
                </div>
              </div>

              {/* ΔRP Badge */}
              <div style={{
                background: hasIpAdvantage ? 'rgba(16,185,129,0.08)' : deltaRp > 0 ? 'rgba(244,63,94,0.08)' : 'rgba(100,116,139,0.08)',
                border: `1px solid ${hasIpAdvantage ? 'rgba(16,185,129,0.25)' : deltaRp > 0 ? 'rgba(244,63,94,0.25)' : 'rgba(100,116,139,0.2)'}`,
                borderRadius: '6px',
                padding: '0.65rem 0.85rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
              }}>
                <span style={{ fontSize: '1rem', fontWeight: 900, color: hasIpAdvantage ? 'var(--sim-color-emerald)' : deltaRp > 0 ? 'var(--sim-color-rose)' : 'var(--sim-text-dim)', fontFamily: 'var(--sim-font-mono)', fontVariantNumeric: 'tabular-nums' }}>
                  {deltaRp > 0 ? '+' : ''}{deltaRp.toFixed(1)}%
                </span>
                <span style={{ fontSize: '0.6rem', color: 'var(--sim-text-dim)', lineHeight: 1.4 }}>
                  <strong style={{ color: 'var(--sim-text-main)', display: 'block', fontSize: '0.62rem' }}>ΔRP (IP − OOP)</strong>
                  {deltaLabel}
                </span>
              </div>

              {/* Visual Bar Comparison */}
              <div className={styles.comparisonCard}>
                <p style={{ fontSize: '0.58rem', color: 'var(--sim-text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 0.75rem 0', fontWeight: 800 }}>Assimetria de Pressão — Equity Necessária por Jogador</p>

                <div style={{ marginBottom: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.58rem', color: 'var(--sim-color-indigo)', marginBottom: '0.2rem', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                    <span>IP · ICM {(ipEquity * 100).toFixed(1)}%</span>
                    <span style={{ color: 'var(--sim-text-subtle)' }}>ChipEV 33.3%</span>
                  </div>
                  <div style={{ display: 'flex', height: '7px', borderRadius: '4px', overflow: 'hidden', background: 'var(--sim-bg-subpanel)', position: 'relative' }}>
                    <div style={{ width: `${(ipEquity) * 100}%`, background: 'var(--sim-color-indigo)', transition: 'width 0.4s ease' }} />
                    {/* Marcador ChipEV */}
                    <div style={{ position: 'absolute', left: '33.3%', top: 0, bottom: 0, width: '1px', background: 'rgba(255,255,255,0.3)' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.58rem', color: 'var(--sim-color-rose)', marginBottom: '0.2rem', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                    <span>OOP · ICM {(oopEquity * 100).toFixed(1)}%</span>
                    <span style={{ color: 'var(--sim-text-subtle)' }}>ChipEV 33.3%</span>
                  </div>
                  <div style={{ display: 'flex', height: '7px', borderRadius: '4px', overflow: 'hidden', background: 'var(--sim-bg-subpanel)', position: 'relative' }}>
                    <div style={{ width: `${(oopEquity) * 100}%`, background: 'var(--sim-color-rose)', transition: 'width 0.4s ease' }} />
                    <div style={{ position: 'absolute', left: '33.3%', top: 0, bottom: 0, width: '1px', background: 'rgba(255,255,255,0.3)' }} />
                  </div>
                </div>

                <p style={{ fontSize: '0.58rem', color: 'var(--sim-text-subtle)', fontStyle: 'italic', margin: '0.85rem 0 0 0', lineHeight: 1.55, textAlign: 'center' }}>
                  BF = 1/(1−RP). A linha branca marca 33.3% (MDF ChipEV para pot-sized bet). Cada ponto percentual acima é equity que o ICM extorque antes do showdown.
                </p>
              </div>
            </div>
          );
        })()}

        {activeTab === 'spr' && (
          <SprPipeline stages={scenario.sprData} activeStage={0} />
        )}

        {activeTab === 'exploit' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--sim-color-emerald)', textTransform: 'uppercase', letterSpacing: '0.15em', margin: 0 }}>
                Vetores de Exploit
              </h4>
              <span style={{ fontSize: '0.58rem', fontWeight: 700, color: 'var(--sim-text-subtle)', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '4px', padding: '2px 6px' }}>
                {scenario.exploit.length} vetor{scenario.exploit.length !== 1 ? 'es' : ''}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {scenario.exploit.map((item, idx) => (
                <div key={idx} className={styles.exploitItem} style={{ borderLeft: '2px solid rgba(16,185,129,0.4)', paddingLeft: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                    <span style={{ color: 'var(--sim-color-emerald)', fontWeight: 900, fontSize: '0.65rem', flexShrink: 0, marginTop: '2px', background: 'rgba(16,185,129,0.12)', borderRadius: '4px', padding: '1px 6px', fontFamily: 'var(--sim-font-mono)', fontVariantNumeric: 'tabular-nums' }}>
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <p style={{ color: 'var(--sim-text-main)', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>
                      {item}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'quiz' && (() => {
          const questions = normalizeQuizData(scenario.quiz);
          if (questions.length === 0) {
            return (
              <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--sim-text-muted)' }}>
                <i className="fa-solid fa-ghost" style={{ fontSize: '2rem', marginBottom: '1rem', opacity: 0.5, display: 'block' }} />
                Nenhum desafio de antevisão cravado para este cenário.
                {scenario.quiz && (
                  <div style={{ marginTop: '1.5rem', textAlign: 'left', padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', fontSize: '0.7rem', color: '#94a3b8', overflowX: 'auto' }}>
                    <strong style={{ color: '#f43f5e', display: 'block', marginBottom: '0.5rem' }}>DADOS BRUTOS (DEBUG):</strong>
                    <pre>{JSON.stringify(scenario.quiz, null, 2)}</pre>
                  </div>
                )}
              </div>
            );
          }
          return (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <QuizEngine questions={questions} />
            </div>
          );
        })()}
      </div>
    </div>
  );
}
