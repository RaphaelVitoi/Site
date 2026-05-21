'use client';

/**
 * IDENTITY: Palco do Cenário SOTA
 * PATH: src/components/simulator/panels/ScenarioStage.tsx
 * ROLE: Exibe a narrativa do cenário atual e os medidores de risco visceral (Risk Gauges).
 */

import React, { useEffect, useRef } from 'react';
import RiskGauge from '../ui/RiskGauge';
import { useAudioFeedback } from '../hooks/useAudioFeedback';
import styles from '../simulator.module.css';

export default function ScenarioStage({ scenario }: { scenario: any }) {
  const { isMuted, playDeathZone, playPredatorZone } = useAudioFeedback();
  const prevScenarioRef = useRef<string>(scenario.id);

  // Feedback sonoro quando RP >= 40 (Death Zone / Predator Zone)
  useEffect(() => {
    if (prevScenarioRef.current !== scenario.id) {
      prevScenarioRef.current = scenario.id;

      if (scenario.oopRp >= 40) {
        playDeathZone(scenario.oopRp);
      }
      if (scenario.ipRp >= 40) {
        playDeathZone(scenario.ipRp);
      }
      // Se o oponente está na Death Zone, ativa Predator Mode
      if (scenario.oopRp >= 40 && scenario.ipRp < 40) {
        playPredatorZone(scenario.oopRp);
      }
      if (scenario.ipRp >= 40 && scenario.oopRp < 40) {
        playPredatorZone(scenario.ipRp);
      }
    }
  }, [scenario.id, scenario.ipRp, scenario.oopRp, playDeathZone, playPredatorZone]);

  // Bubble Factor: BF = 100 / (100 - rp). Mede o quanto ICM inflaciona o custo relativo de uma decisão.
  const calcBF = (rp: number): string => {
    if (rp >= 100) return '∞';
    if (rp === 0) return '1.00';
    return (100 / (100 - rp)).toFixed(2);
  };

  return (
    <div className={`${styles.glassPanel} ${styles.animateFadeUp}`} style={{ padding: '1.75rem' }}>
      {/* Narrativa + Verdict */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <h2
            className={styles.gradientText}
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.3rem)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            {scenario.narrativeTitle}
          </h2>
          {/* Verdict badge */}
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0.25rem 0.7rem',
            borderRadius: '8px',
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(225, 29, 72, 0.3)',
            fontSize: '0.58rem',
            fontWeight: 900,
            color: '#f43f5e',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            whiteSpace: 'nowrap',
          }}>
            {scenario.verdict}
          </span>
        </div>
        <div
          className={styles.stageContextBadge}
          style={{ marginTop: '0.6rem' }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.2rem 0.6rem',
              borderRadius: '6px',
              background: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              fontSize: '0.58rem',
              fontWeight: 700,
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            {scenario.narrativeSubtitle}
          </span>
        </div>
      </div>

      {/* Grid de Gauges: IP vs OOP */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1.5rem',
          marginBottom: '0.5rem',
        }}
      >
        {/* Gauge IP (Agressor) */}
        <div style={{ textAlign: 'center' }}>
          <RiskGauge
            value={scenario.ipRp}
            label="Agressor (IP)"
            pos={scenario.ipPos}
            stack={scenario.ipMorph}
            color="indigo"
            opponentValue={scenario.oopRp}
            isMuted={isMuted}
          />
          {/* Bubble Factor */}
          <p className={styles.dataMono} style={{ fontSize: '0.6rem', color: '#475569', margin: '0.2rem 0 0' }}>
            BF = {calcBF(scenario.ipRp)}×
          </p>
        </div>

        {/* Gauge OOP (Defensor) */}
        <div style={{ textAlign: 'center' }}>
          <RiskGauge
            value={scenario.oopRp}
            label="Defensor (OOP)"
            pos={scenario.oopPos}
            stack={scenario.oopMorph}
            color="rose"
            opponentValue={scenario.ipRp}
            isMuted={isMuted}
          />
          {/* Bubble Factor */}
          <p className={styles.dataMono} style={{ fontSize: '0.6rem', color: '#475569', margin: '0.2rem 0 0' }}>
            BF = {calcBF(scenario.oopRp)}×
          </p>
        </div>
      </div>
    </div>
  );
}
