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

function getContextualNarrative ( isVacuum: boolean, isDeathZone: boolean, isNearPayjump: boolean, avgRp: number ): string {
  if ( isVacuum ) return "No Vácuo Matemático, a tensão é ZERO. Cada ficha vale exatamente 1 ficha. Aqui não há medo, apenas matemática linear.";
  if ( isDeathZone && isNearPayjump ) return "ALERTA MÁXIMO: Death Zone + Bolha. A colisão é suicídio e o EV do fold é potencialmente positivo. Qualquer ação que não seja nuts puro é insolvente. O sistema exige paralisia quase absoluta do defensor.";
  if ( isDeathZone ) return "ALERTA: Você está na Death Zone. A colisão aqui é suicídio mútuo. O sistema exige equity próxima ao nuts para prosseguir — a paz do Fold vale ouro.";
  if ( isNearPayjump && avgRp > 20 ) return "Tensão Extrema (RP alto + Payjump). O overfold é massivo e estrutural. EVs marginais são altamente instáveis: mãos com EV negativo no vácuo podem se tornar agressões lucrativas contra a aversão ao risco. O desvio (exploit) deve ser proporcional à credibilidade da leitura.";
  if ( isNearPayjump ) return "Tensão Elevada (Bolha/Payjump). Oponentes tendem a dar overfold massivo. EVs marginais são instáveis: mãos fracas no vácuo podem ser agressões lucrativas explorando a aversão ao risco. Calibre o exploit pela credibilidade.";
  if ( avgRp > 20 ) return "Tensão Elevada. O ICM distorce o equilíbrio GTO. Overfold com mãos médias, ataque apenas com ranges polares. Calls marginais (EV perto de zero) são instáveis e perigosos contra humanos.";
  if ( avgRp > 10 ) return "Tensão Moderada. O jogo ainda se assemelha ao ChipEV, mas o peso dos payjumps começa a ser sentido. Stacks iguais sofrem mais; o CL opera com mais liberdade.";
  return "Tensão Baixa. Próximo ao ChipEV puro. A assimetria ICM existe mas tem magnitude mínima — decisões marginais são estáveis.";
}

function getEsperancaMatConfig ( isVacuum: boolean, isDeathZone: boolean, avgRp: number ) {
  if ( isVacuum ) return { value: "Linear", color: "#34d399" }; // emerald-400
  if ( isDeathZone ) return { value: "Estrangulada", color: "#f43f5e" }; // rose-500
  if ( avgRp > 20 ) return { value: "Amortizada", color: "#fbbf24" }; // amber-400
  return { value: "Dinâmica", color: "#38bdf8" }; // sky-400
}


function getGaugeRightColor ( avgRp: number, isDeathZone: boolean ) {
  if ( avgRp <= 20 ) return 'transparent';
  return isDeathZone ? '#f43f5e' : '#fbbf24';
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

  // Cálculo do arco do Fear Gauge
  const rotation = useMemo( () => {
    const clamped = Math.max( 0, Math.min( 60, avgRp ) );
    return ( clamped / 60 ) * 180 - 90; // -90 a 90 graus
  }, [ avgRp ] );

  const borderRightColor = getGaugeRightColor( avgRp, isDeathZone );

  const ecoDoFuturoValue = isVacuum ? "0%" : "Projetado";
  const estabilidadeEvColor = isNearPayjump || avgRp > 20 ? "#f472b6" : "#60a5fa"; // pink-400 / blue-400
  const esperancaMat = getEsperancaMatConfig( isVacuum, isDeathZone, avgRp );

  // Extração imperativa das cores e propriedades estéticas visando O(1) Cognitive Complexity no JSX Render
  const { wrapperBorder, wrapperBoxShadow, gaugeBorderTop, badgeColor, badgeBg, badgeText, rpColor, narrativeBorder, narrativeBg } = getThemeConfig( isDeathZone );
  const narrativeText = getContextualNarrative( isVacuum, isDeathZone, isNearPayjump, avgRp );

  return (
    <div
      className={ `relative mt-6 p-5 sm:p-6 bg-slate-950/60 rounded-[24px] overflow-hidden ${isDeathZone ? 'animate-[jitter_0.2s_infinite]' : 'animate-fade-in'}` }
      style={ {
        border: `1px solid ${wrapperBorder}`,
        boxShadow: wrapperBoxShadow,
      } }
    >
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

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
        <div className="flex gap-4 items-center">
          {/* Fear Gauge Visual */ }
          <div className="relative w-20 h-[45px] overflow-hidden shrink-0">
            <div className="absolute top-0 w-20 h-20 rounded-full border-8 border-white/5"></div>
            <div
              className="absolute top-0 w-20 h-20 rounded-full border-8 border-transparent"
              style={ { borderTopColor: gaugeBorderTop, borderRightColor, transform: 'rotate(-45deg)' } }
            ></div>
            <div
              className="gauge-needle absolute bottom-0 left-1/2 w-0.5 h-[35px] bg-slate-200 origin-bottom shadow-[0_0_10px_rgba(255,255,255,0.5)]"
              style={ { transform: `translateX(-50%) rotate(${rotation}deg)` } }
            ></div>
          </div>

          <div>
            <span
              className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md"
              style={ { color: badgeColor, background: badgeBg } }
            >
              { badgeText }
            </span>
            <h4 className="mt-2 text-lg sm:text-xl text-white font-black">{ scenarioName }</h4>
          </div>
        </div>

        <div className="text-left sm:text-right w-full sm:w-auto border-t sm:border-t-0 border-white/10 pt-3 sm:pt-0">
          <span className="text-[10px] text-slate-400 uppercase font-extrabold block">Tensão Sistêmica</span>
          <span
            className="text-3xl sm:text-4xl font-black font-mono tracking-tighter"
            style={ { color: rpColor } }
          >
            { avgRp.toFixed( 1 ) }%
          </span>
        </div>
      </div>

      <p
        className="mb-6 text-sm text-slate-300 leading-relaxed border-l-4 pl-4 py-1"
        style={ { borderColor: narrativeBorder, background: narrativeBg } }
      >
        { narrativeText }
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 custom-scrollbar overflow-x-auto pb-1">
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
          color="#fbbf24"
        />
        <ForceCard
          label="Eco do Futuro"
          value={ ecoDoFuturoValue }
          desc="Tensão das próximas streets."
          active={ !isVacuum }
          color="#a78bfa"
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
          value={ esperancaMat.value }
          desc="Viabilidade do outcome estratégico."
          active={ true }
          color={ esperancaMat.color }
        />
      </div>
    </div>
  );
}

function ForceCard ( { label, value, desc, active, color = "#34d399" }: Readonly<{ label: string, value: string, desc: string, active: boolean, color?: string }> ) {
  const cardBorder = active ? `${color}44` : 'rgba(255,255,255,0.05)';
  const cardOpacity = active ? 'opacity-100' : 'opacity-40';
  const valueColor = active ? color : '#64748b'; // slate-500

  return (
    <div
      className={ `bg-white/5 p-3 sm:p-4 rounded-2xl transition-all duration-500 ease-out flex flex-col justify-start ${cardOpacity}` }
      style={ { border: `1px solid ${cardBorder}` } }
    >
      <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">{ label }</span>
      <span className="text-lg sm:text-xl font-black font-mono" style={ { color: valueColor } }>{ value }</span>
      <span className="text-[10px] text-slate-500 leading-snug mt-2">{ desc }</span>
    </div>
  );
}
