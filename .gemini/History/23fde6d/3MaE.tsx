'use client';

/**
 * IDENTITY: Radar de Comparação Multi-Cenário
 * PATH: src/components/simulator/panels/ComparisonRadar.tsx
 * ROLE: Selecionar 2 cenários e comparar via radar chart (Recharts).
 * BINDING: [engine/types.ts, engine/nashSolver.ts, simulator.module.css]
 */

import React, { useState, useMemo } from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { Scenario } from '../engine/types';
import { solveNash } from '../engine/nashSolver';
import styles from '../simulator.module.css';

interface ComparisonRadarProps {
  scenarios: Scenario[];
  currentId: string;
}

// 5 eixos do radar
function buildRadarData(scenario: Scenario) {
  const nash = solveNash(scenario.ipRp, scenario.oopRp);
  return {
    rpIp: scenario.ipRp,
    rpOop: scenario.oopRp,
    bluff: nash.bluffFreq,
    defense: nash.defenseFreq,
    sprDecay: scenario.sprData.length > 0
      ? ((scenario.sprData[0].rpValue - (scenario.sprData.at(-1)?.rpValue ?? 0)) / Math.max(1, scenario.sprData[0].rpValue)) * 100
      : 0,
  };
}

export default function ComparisonRadar({ scenarios, currentId }: Readonly<ComparisonRadarProps>) {
  const [compareId, setCompareId] = useState<string>('');

  const currentScenario = scenarios.find(s => s.id === currentId);
  const compareScenario = scenarios.find(s => s.id === compareId);

  const radarData = useMemo(() => {
    if (!currentScenario) return [];
    const a = buildRadarData(currentScenario);
    const b = compareScenario ? buildRadarData(compareScenario) : null;

    return [
      { axis: 'RP IP', A: a.rpIp, B: b?.rpIp ?? 0 },
      { axis: 'RP OOP', A: a.rpOop, B: b?.rpOop ?? 0 },
      { axis: 'Bluff%', A: a.bluff, B: b?.bluff ?? 0 },
      { axis: 'Defesa%', A: a.defense, B: b?.defense ?? 0 },
      { axis: 'SPR Decay', A: a.sprDecay, B: b?.sprDecay ?? 0 },
    ];
  }, [currentScenario, compareScenario]);

  return (
    <div className={styles.glassPanel} style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '0.65rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          Comparação de Cenários
        </h3>
      </div>

      {/* Seletor de cenário para comparar */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ fontSize: '0.6rem', color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>
          Comparar com:
        </label>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <select
            value={compareId}
            onChange={(e) => setCompareId(e.target.value)}
            style={{
              flex: 1,
              background: '#0a0f1c',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#e2e8f0',
              padding: '0.5rem',
              fontSize: '0.7rem',
            }}
          >
            <option value="">Selecione um cenário</option>
            {scenarios
              .filter(s => s.id !== currentId)
              .map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
          </select>
          {compareId && (
            <button
              onClick={() => setCompareId('')}
              style={{
                padding: '0.4rem 0.7rem',
                borderRadius: '8px',
                background: 'rgba(225, 29, 72, 0.1)',
                border: '1px solid rgba(225, 29, 72, 0.3)',
                color: '#f43f5e',
                fontSize: '0.6rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Radar Chart */}
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
            <PolarGrid stroke="rgba(255, 255, 255, 0.08)" />
            <PolarAngleAxis
              dataKey="axis"
              tick={{ fill: '#94a3b8', fontSize: 10 }}
            />
            <PolarRadiusAxis
              angle={90}
              tick={{ fill: '#475569', fontSize: 9 }}
              domain={[0, 100]}
            />
            <Radar
              name={currentScenario?.name ?? 'Atual'}
              dataKey="A"
              stroke="#6366f1"
              fill="#6366f1"
              fillOpacity={0.3}
              strokeWidth={2}
            />
            {compareScenario && (
              <Radar
                name={compareScenario.name}
                dataKey="B"
                stroke="#e11d48"
                fill="#e11d48"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            )}
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: '8px',
                color: '#e2e8f0'
              }}
              itemStyle={{ fontSize: '0.75rem', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}
            />
            <Legend
              wrapperStyle={{ fontSize: '0.6rem', color: '#94a3b8' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
