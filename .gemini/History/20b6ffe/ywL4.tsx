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
  const isNodelockB20 = scenario.name?.includes( 'B20' ) || scenario.narrativeTitle?.includes( 'B20' ) || scenario.id?.includes( 'b20' );

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
            { isNodelockB20 ? 'Ancoragem Forçada: Block Bet (20%)' : scenario.narrativeTitle }
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

      <div
        className="px-4 py-3 rounded-lg text-sm text-center leading-relaxed"
        style={ {
          background: isNodelockB20 ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.03)',
          color: isNodelockB20 ? 'var(--text-main)' : 'var(--text-light)',
          border: isNodelockB20 ? '1px solid rgba(99,102,241,0.2)' : '1px solid rgba(255,255,255,0.06)',
          marginBottom: '1.5rem'
        } }
      >
        <span style={ {
          display: 'block',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.65rem',
          fontWeight: 800,
          color: isNodelockB20 ? 'var(--accent-indigo)' : 'var(--text-darker)',
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          marginBottom: '0.5rem'
        } }>
          { isNodelockB20 ? 'Ancoragem Forçada: Block Bet (20%)' : scenario.verdict || 'Cenário Base' }
        </span>
        { isNodelockB20 ? (
          'A dinâmica foi travada. Agressor forçado a apostar pequeno para absorver fold equity sem inflar as RIOs.'
        ) : (
          <div dangerouslySetInnerHTML={ { __html: scenario.theory } } />
        ) }
      </div>

      {/* SOTA: Box Didático Exclusivo para o Nodelock B20 */ }
      { isNodelockB20 && (
        <div style={ {
          marginBottom: '1.5rem',
          padding: '1.15rem 1.25rem',
          background: 'rgba(245, 158, 11, 0.08)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          borderRadius: '10px',
          borderLeft: '4px solid var(--accent-amber)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        } }>
          <h3 style={ { margin: 0, fontSize: '0.7rem', fontWeight: 800, color: 'var(--accent-amber-light)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '8px' } }>
            <i className="fa-solid fa-lock text-amber-400"></i> Propósito da Ancoragem (Nodelock)
          </h3>
          <p style={ { margin: 0, fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: 1.6 } }>
            Cenário de <strong>Engenharia Reversa (Nodelock)</strong>. O solver foi forçado a restringir o agressor (IP) a uma única opção de aposta: <em>Block Bet de 20% do pote</em>. O objetivo didático não é replicar o GTO puro, mas observar a <strong>Adaptação do Ecossistema</strong>: como o defensor (OOP) deve reestruturar sua defesa e suas frequências de check-raise quando o agressor atua com um sizing fixo e explorável sob intensa pressão de ICM.
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
