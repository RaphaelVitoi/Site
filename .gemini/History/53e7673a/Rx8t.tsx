'use client';

import { useMemo } from 'react';

interface QuantumSynthesisProps {
  readonly scenarioName: string;
  readonly verdict: string;
  readonly ipRp: number;
  readonly oopRp: number;
  readonly isNearPayjump: boolean;
  readonly blindsRisingSoon: boolean;
  readonly isVacuum: boolean;
}

export default function QuantumSynthesis ( {
  scenarioName,
  verdict,
  ipRp,
  oopRp,
  isNearPayjump,
  blindsRisingSoon,
  isVacuum
}: QuantumSynthesisProps ) {

  const avgRp = ( ipRp + oopRp ) / 2;
  const isDeathZone = avgRp > 35;

  const getContextualNarrative = () => {
    if ( isVacuum ) return "No Vácuo Matemático, a tensão é ZERO. Cada ficha vale exatamente 1 ficha. Aqui não há medo, apenas matemática linear.";
    if ( isDeathZone && isNearPayjump ) return "ALERTA MÁXIMO: Death Zone + Bolha. A colisão é suicídio e o EV do fold é potencialmente positivo. Qualquer ação que não seja nuts puro é insolvente. O sistema exige paralisia quase absoluta do defensor.";
    if ( isDeathZone ) return "ALERTA: Você está na Death Zone. A colisão aqui é suicídio mútuo. O sistema exige equity próxima ao nuts para prosseguir — a paz do Fold vale ouro.";
    if ( isNearPayjump && avgRp > 20 ) return "Tensão Extrema (RP alto + Payjump). O overfold é massivo e estrutural. EVs marginais são altamente instáveis: mãos com EV negativo no vácuo podem se tornar agressões lucrativas contra a aversão ao risco. O desvio (exploit) deve ser proporcional à credibilidade da leitura.";
    if ( isNearPayjump ) return "Tensão Elevada (Bolha/Payjump). Oponentes tendem a dar overfold massivo. EVs marginais são instáveis: mãos fracas no vácuo podem ser agressões lucrativas explorando a aversão ao risco. Calibre o exploit pela credibilidade.";
    if ( avgRp > 20 ) return "Tensão Elevada. O ICM distorce o equilíbrio GTO. Overfold com mãos médias, ataque apenas com ranges polares. Calls marginais (EV perto de zero) são instáveis e perigosos contra humanos.";
    if ( avgRp > 10 ) return "Tensão Moderada. O jogo ainda se assemelha ao ChipEV, mas o peso dos payjumps começa a ser sentido. Stacks iguais sofrem mais; o CL opera com mais liberdade.";
    return "Tensão Baixa. Próximo ao ChipEV puro. A assimetria ICM existe mas tem magnitude mínima — decisões marginais são estáveis.";
  };

  // Cálculo do arco do Fear Gauge
  const rotation = useMemo( () => {
    const clamped = Math.max( 0, Math.min( 60, avgRp ) );
    return ( clamped / 60 ) * 180 - 90; // -90 a 90 graus
  }, [ avgRp ] );

  let borderRightColor = 'transparent';
  if ( avgRp > 20 )
  {
    borderRightColor = isDeathZone ? 'var(--accent-danger)' : 'var(--accent-gold)';
  }

  const ecoDoFuturoValue = isVacuum ? "0%" : "Projetado";
  const estabilidadeEvColor = isNearPayjump || avgRp > 20 ? "var(--accent-pink-light)" : "var(--accent-blue)";

  let esperancaMatValue = "Dinâmica";
  let esperancaMatColor = "var(--accent-sky-light)";
  if ( isVacuum )
  {
    esperancaMatValue = "Linear";
    esperancaMatColor = "var(--accent-emerald)";
  } else if ( isDeathZone )
  {
    esperancaMatValue = "Estrangulada";
    esperancaMatColor = "var(--accent-danger)";
  } else if ( avgRp > 20 )
  {
    esperancaMatValue = "Amortizada";
    esperancaMatColor = "var(--accent-gold)";
  }

  return (
    <div style={ {
      marginTop: '1.5rem',
      padding: '1.5rem',
      background: 'rgba(10, 15, 30, 0.6)',
      borderRadius: '24px',
      border: `1px solid ${isDeathZone ? 'rgba(244, 63, 94, 0.4)' : 'rgba(99, 102, 241, 0.2)'}`,
      boxShadow: isDeathZone ? '0 0 40px rgba(244, 63, 94, 0.15)' : '0 10px 40px rgba(0,0,0,0.3)',
      animation: isDeathZone ? 'jitter 0.2s infinite' : 'fadeIn 0.5s ease-out',
      position: 'relative',
      overflow: 'hidden'
    } }>
      <style>{ `
        @keyframes jitter {
          0% { transform: translate(0,0); }
          25% { transform: translate(1px, 1px); }
          50% { transform: translate(-1px, 0); }
          75% { transform: translate(0, -1px); }
          100% { transform: translate(0,0); }
        }
        .gauge-needle {
          transition: transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>

      <div style={ { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' } }>
        <div style={ { display: 'flex', gap: '1.5rem', alignItems: 'center' } }>
          {/* Fear Gauge Visual */ }
          <div style={ { width: '80px', height: '45px', position: 'relative', overflow: 'hidden' } }>
            <div style={ { width: '80px', height: '80px', borderRadius: '50%', border: '8px solid rgba(255,255,255,0.05)', position: 'absolute', top: 0 } }></div>
            <div style={ {
              width: '80px', height: '80px', borderRadius: '50%',
              border: '8px solid transparent',
              borderTopColor: isDeathZone ? 'var(--accent-danger)' : 'var(--accent-emerald)',
              borderRightColor,
              position: 'absolute', top: 0,
              transform: 'rotate(-45deg)'
            } }></div>
            <div className="gauge-needle" style={ {
              position: 'absolute', bottom: 0, left: '50%', width: '2px', height: '35px',
              background: 'var(--text-main)', transformOrigin: 'bottom',
              transform: `translateX(-50%) rotate(${rotation}deg)`,
              boxShadow: '0 0 10px rgba(255,255,255,0.5)'
            } }></div>
          </div>

          <div>
            <span style={ {
              fontSize: '0.5rem', fontWeight: 900, color: isDeathZone ? 'var(--accent-danger)' : 'var(--accent-indigo-light)',
              textTransform: 'uppercase', letterSpacing: '0.2em',
              background: isDeathZone ? 'rgba(244, 63, 94, 0.1)' : 'rgba(99, 102, 241, 0.1)',
              padding: '4px 10px', borderRadius: '6px'
            } }>
              { isDeathZone ? '⚠️ ALERTA DE INSOLVÊNCIA' : 'Oráculo Pedagógico' }
            </span>
            <h4 style={ { margin: '0.5rem 0 0', fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 900 } }>{ scenarioName }</h4>
          </div>
        </div>

        <div style={ { textAlign: 'right' } }>
          <span style={ { fontSize: '0.5rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 800, display: 'block' } }>Tensão Sistêmica</span>
          <span style={ { fontSize: '1.6rem', fontWeight: 950, color: isDeathZone ? 'var(--accent-danger)' : 'var(--accent-emerald)', letterSpacing: '-0.02em' } }>
            { avgRp.toFixed( 1 ) }%
          </span>
        </div>
      </div>

      <p style={ {
        margin: '0 0 1.5rem', fontSize: '0.85rem', color: 'var(--text-light)', lineHeight: 1.7,
        borderLeft: `3px solid ${isDeathZone ? 'var(--accent-danger)' : 'var(--accent-indigo)'}`,
        paddingLeft: '1.25rem',
        background: isDeathZone ? 'linear-gradient(to right, rgba(244,63,94,0.05), transparent)' : 'transparent'
      } }>
        { getContextualNarrative() }
      </p>

      <div style={ { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' } }>
        <ForceCard
          label="Gravidade ICM"
          value={ isVacuum ? "0%" : "Basal" }
          desc="Risco de queda na mesa de 9."
          active={ !isVacuum }
        />
        <ForceCard
          label="Prêmio Inatividade"
          value={ isNearPayjump ? "Ativo" : "0%" }
          desc="Lucro real por apenas existir."
          active={ isNearPayjump }
          color="var(--accent-gold)"
        />
        <ForceCard
          label="Eco do Futuro"
          value={ ecoDoFuturoValue }
          desc="Tensão das próximas streets."
          active={ !isVacuum }
          color="var(--accent-violet)"
        />
        <ForceCard
          label="Estabilidade EV"
          value={ isNearPayjump || avgRp > 20 ? "Instável" : "Linear" }
          desc="Sensibilidade da margem a erros de range."
          active={ true }
          color={ estabilidadeEvColor }
        />
        <ForceCard
          label="Esperança Mat."
          value={ esperancaMatValue }
          desc="Viabilidade do outcome estratégico."
          active={ true }
          color={ esperancaMatColor }
        />
      </div>
    </div>
  );
}

function ForceCard ( { label, value, desc, active, color = "var(--accent-emerald)" }: Readonly<{ label: string, value: string, desc: string, active: boolean, color?: string }> ) {
  return (
    <div style={ {
      background: 'rgba(255,255,255,0.02)',
      padding: '0.85rem',
      borderRadius: '16px',
      border: `1px solid ${active ? color + '44' : 'rgba(255,255,255,0.05)'}`,
      opacity: active ? 1 : 0.3,
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
    } }>
      <span style={ { fontSize: '0.45rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 900, display: 'block', marginBottom: '4px' } }>{ label }</span>
      <span style={ { fontSize: '1rem', fontWeight: 900, color: active ? color : 'var(--text-darker)', display: 'block' } }>{ value }</span>
      <span style={ { fontSize: '0.55rem', color: 'var(--text-darker)', lineHeight: 1.3, display: 'block', marginTop: '6px' } }>{ desc }</span>
    </div>
  );
}
