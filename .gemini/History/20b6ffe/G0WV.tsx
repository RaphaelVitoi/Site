'use client';

/**
 * IDENTITY: Palco do Cenário SOTA
 * PATH: src/components/simulator/panels/ScenarioStage.tsx
 * ROLE: Exibe a narrativa do cenário atual e os medidores de risco visceral (Risk Gauges).
 */

import type { Scenario } from '../engine/types';
import styles from '../simulator.module.css';
import RiskGauge from '../ui/RiskGauge';

// Tooltips explicativos para cada morph — exibidos ao hover no RiskGauge
const MORPH_TOOLTIPS: Record<string, string> = {
  // IP
  'Valor Estrito': 'Aposta quase exclusivamente por valor — sem equity suficiente para blefar economicamente. O RP alto torna blefes EV-negativo.',
  'Especulativo': 'Calls pré-flop inflados para especular implied odds no pós-flop, evitando o all-in direto. Range misto, sem polarização clara.',
  'Polar Máximo': 'Apenas nuts e blefes no range — sem mãos médias. Resultado de pressão de shove total, que elimina sizings intermediários.',
  'Polar Extremo': 'Polarização máxima por pot-sized bet: o IP só aposta com mãos extremas (topo ou blefe puro). Mãos médias checam.',
  'Push Estendido': 'Range de shove mais amplo que o equilíbrio ChipEV indica. A Fold Equity acumulada torna lucrativo incluir mãos marginais.',
  'Modo Predador': 'RP próprio baixo + oponente em zona crítica. A Esperança Matemática favorece agressão máxima — o custo de perder é marginal.',
  'Polar Controlado': 'Polarização gerenciada: nuts e blefes selecionados, mas frequência total controlada para não fortalecer um rival (proteção de Perspectiva).',
  'Polar Perfeito': 'Equilíbrio Nash sem distorção ICM — blefes e valor em proporção exata. Gerado quando RP = 0 (ChipEV puro).',
  // OOP
  'Condensado': 'Range formado majoritariamente por mãos médias sem polarização — bom para realizar equity, mas incapaz de aplicar pressão. ICM aumenta a passividade.',
  'Flat Call Massivo': 'Calls pré-flop com range muito mais amplo que o equilíbrio ChipEV indicaria — especulação de implied odds sem expor a stack ao all-in direto.',
  'Bluffcatcher': 'Range composto quase só por mãos que batem blefes — sem bloqueadores, sem equity para re-aplicar pressão. Só pode call ou fold.',
  'Condensado Extremo': 'Range condensado sob pressão máxima: cada call cede chips irrecuperáveis. O ICM transforma cada confronto num sangramento de Perspectiva.',
  'Call Seletivo': 'O OOP chama apenas com mãos que cobrem o RP. Fora disso, folda — mesmo contra ranges inclinados ao blefe.',
  'Zona de Paralisia': 'RP > 40%: zona onde o custo matemático de qualquer confronto supera o ganho de chips. O OOP folda ranges que em ChipEV pagariam automaticamente.',
  'Inelástico': 'Resiste à pressão sem conseguir devolvê-la: calls seletivos com as melhores mãos, fold no resto. A posição impede re-aplicar pressão.',
  'Defesa Base': 'Frequência de defesa de equilíbrio em ChipEV puro — sem distorção ICM. MDF opera normalmente.',
};

// Bubble Factor: BF = 100 / (100 - rp)
const calcBF = ( rp: number ): string => {
  if ( rp >= 100 ) return '∞';
  if ( rp === 0 ) return '1.00';
  return ( 100 / ( 100 - rp ) ).toFixed( 2 );
};

export default function ScenarioStage ( { scenario }: Readonly<{ scenario: Scenario }> ) {
  const ipMorph = scenario.ipMorph ?? '--';
  const oopMorph = scenario.oopMorph ?? '--';

  return (
    <div className={ `${styles.glassPanel} ${styles.animateFadeUp}` } style={ { padding: '1.75rem' } }>
      {/* Narrativa + Verdict */ }
      <div style={ { marginBottom: '1.25rem' } }>
        <div style={ { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' } }>
          <h2
            className={ styles.gradientText }
            style={ {
              fontSize: 'clamp(1rem, 2vw, 1.3rem)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              margin: 0,
              lineHeight: 1.3,
            } }
          >
            { scenario.id === 'nodelock' ? 'Laboratório de Colisão (Sandbox)' : scenario.narrativeTitle }
          </h2>
          {/* Verdict badge */ }
          <span style={ {
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0.25rem 0.7rem',
            borderRadius: '8px',
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(225, 29, 72, 0.3)',
            fontSize: '0.58rem',
            fontWeight: 900,
            color: 'var(--accent-danger)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            whiteSpace: 'nowrap',
          } }>
            { scenario.verdict }
          </span>
        </div>
        <div
          className={ styles.stageContextBadge }
          style={ { marginTop: '0.6rem' } }
        >
          <span
            style={ {
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.2rem 0.6rem',
              borderRadius: '6px',
              background: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              fontSize: '0.58rem',
              fontWeight: 700,
              color: 'var(--text-dim)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            } }
          >
            { scenario.narrativeSubtitle }
          </span>
        </div>
      </div>

      {/* SOTA: Box Didático Exclusivo para a Sandbox */ }
      { scenario.id === 'nodelock' && (
        <div style={ {
          marginBottom: '1.5rem',
          padding: '1.15rem 1.25rem',
          background: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          borderRadius: '10px',
          borderLeft: '4px solid var(--accent-indigo)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        } }>
          <h3 style={ { margin: 0, fontSize: '0.7rem', fontWeight: 800, color: 'var(--accent-indigo-light)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '8px' } }>
            <i className="fa-solid fa-flask text-indigo-400"></i> Propósito do Ambiente Livre
          </h3>
          <p style={ { margin: 0, fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: 1.6 } }>
            Este ambiente anula as restrições pré-definidas para permitir a <strong>Engenharia do Caos</strong>. Diferente dos cenários estáticos, aqui você possui controle absoluto para forjar a realidade termodinâmica da mesa. Altere as <em>Stacks</em> e mutile a <em>Estrutura de Premiação</em> no painel de Payouts (PKO, Flat, Satélite) para observar como o GTO colapsa e a <strong style={ { color: 'var(--text-light)' } }>Perspectiva Matemática</strong> reage instantaneamente à nova entropia.
          </p>
        </div>
      ) }

      {/* Grid de Gauges: IP vs OOP */ }
      <div
        style={ {
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1.5rem',
          marginBottom: '0.5rem',
        } }
      >
        {/* Gauge IP (Agressor) */ }
        <div style={ { textAlign: 'center' } }>
          <RiskGauge
            value={ scenario.ipRp }
            label="Agressor (IP)"
            pos={ scenario.ipPos }
            stack={ ipMorph }
            stackTooltip={ MORPH_TOOLTIPS[ ipMorph ] }
            color="indigo"
            opponentValue={ scenario.oopRp }
          />
          <p className={ styles.dataMono } style={ { fontSize: '0.65rem', color: 'var(--text-dim)', margin: '0.3rem 0 0', letterSpacing: '0.03em' } }>
            RP { scenario.ipRp.toFixed( 1 ) }% · BF { calcBF( scenario.ipRp ) }×
          </p>
        </div>

        {/* Gauge OOP (Defensor) */ }
        <div style={ { textAlign: 'center' } }>
          <RiskGauge
            value={ scenario.oopRp }
            label="Defensor (OOP)"
            pos={ scenario.oopPos }
            stack={ oopMorph }
            stackTooltip={ MORPH_TOOLTIPS[ oopMorph ] }
            color="pink"
            opponentValue={ scenario.ipRp }
          />
          <p className={ styles.dataMono } style={ { fontSize: '0.65rem', color: 'var(--text-dim)', margin: '0.3rem 0 0', letterSpacing: '0.03em' } }>
            RP { scenario.oopRp.toFixed( 1 ) }% · BF { calcBF( scenario.oopRp ) }×
          </p>
        </div>
      </div>
    </div>
  );
}
