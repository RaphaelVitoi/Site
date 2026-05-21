'use client';

import { useEffect, useMemo, useState, useContext } from "react";
import { derivePostFlopRps, type PostFlopResult, type Street } from '@/lib/rpDeriver';
import type { SprStage } from '../engine/types';
import { StreetCard } from '@/components/simulator/ui/StreetCard';
import { SotaMetricsContext, SotaWasmContext } from '../SotaContext';
import { formatCi, formatPct, getPmColorClass } from '@/components/simulator/engine/utils';

interface PostFlopPreset {
  label: string;
  stacks: number[];
  prizes: number[];
  ipIndex: number;
  oopIndex: number;
  ipLabel: string;
  oopLabel: string;
}

const PRESETS: PostFlopPreset[] = [
  {
    label: 'Paradoxo (HU @ FT)',
    stacks: [40, 55, 9.4, 52.4, 22.2, 7, 44.3, 24.3, 13.4],
    prizes: [237.34, 170.96, 135.17, 109.99, 90.28, 73.95, 59.92, 47.56, 36.47],
    ipIndex: 0,
    oopIndex: 1,
    ipLabel: 'BTN 40bb',
    oopLabel: 'BB 55bb',
  },
  {
    label: 'Pacto Silencioso',
    stacks: [65, 70, 15, 12, 8],
    prizes: [237.34, 170.96, 135.17, 109.99, 90.28],
    ipIndex: 0,
    oopIndex: 1,
    ipLabel: 'VP 65bb',
    oopLabel: 'CL 70bb',
  },
  {
    label: 'HU Puro (ChipEV)',
    stacks: [55, 45],
    prizes: [65, 35],
    ipIndex: 0,
    oopIndex: 1,
    ipLabel: 'BTN 55bb',
    oopLabel: 'BB 45bb',
  },
];

const STREET_LABEL: Record<Street, string> = { flop: 'FLOP', turn: 'TURN', river: 'RIVER' };
const DEFAULT_PRESET: PostFlopPreset = PRESETS[0] ?? {
  label: 'Fallback',
  stacks: [40, 55],
  prizes: [65, 35],
  ipIndex: 0,
  oopIndex: 1,
  ipLabel: 'IP',
  oopLabel: 'OOP',
};

function StackInput({ val, index, ipIdx, oopIdx, onUpdate }: Readonly<{ val: number; index: number; ipIdx: number; oopIdx: number; onUpdate: (idx: number, val: number) => void }>) {
  const isActive = index === ipIdx || index === oopIdx;
  let label = `P${index + 1}`;
  if (index === ipIdx) label = 'IP (AGR)';
  else if (index === oopIdx) label = 'OOP (DEF)';
  return (
    <div className={`flex flex-col gap-1.5 px-3 py-2 rounded-xl border transition-all ${isActive ? 'bg-accent-indigo/10 border-accent-indigo/30 ring-1 ring-accent-indigo/20' : 'bg-transparent border-white/5 opacity-40 hover:opacity-100'}`}>
      <span className={`text-[0.5rem] font-black uppercase tracking-tighter ${isActive ? 'text-accent-indigo-light' : 'text-text-darker'}`}>{label}</span>
      <div className="flex items-baseline gap-1">
        <input aria-label={`Stack do ${label}`} type="number" value={val} onChange={(e) => onUpdate(index, Number.parseFloat(e.target.value) || 0)} className={`w-full bg-transparent border-none text-[0.8rem] font-black outline-none font-mono tabular-nums ${isActive ? 'text-white' : 'text-text-dim'}`} />
        <span className="text-[0.5rem] font-black text-text-darker uppercase">bb</span>
      </div>
    </div>
  );
}

function PotControl({ label, val, min, max, anteSize, onChange }: Readonly<{ label: string; val: number; min: number; max: number; anteSize: number; onChange: (v: number) => void }>) {
  return (
    <div className="flex flex-col gap-4 group">
      <div className="flex justify-between items-end border-b border-white/5 pb-2">
        <span className="text-[0.65rem] text-accent-indigo-light font-black uppercase tracking-widest">{label}</span>
        <div className="flex items-baseline gap-1 bg-black/60 px-2.5 py-1 rounded-lg border border-white/10 shadow-inner">
          <span className="text-[0.85rem] text-white font-mono font-black tabular-nums">{val.toFixed(1)}</span>
          <span className="text-[0.5rem] text-text-darker font-black uppercase">bb</span>
        </div>
      </div>
      <div className="relative pt-2">
        <input type="range" min={min} max={max} step="0.5" value={val} onChange={e => onChange(Number(e.target.value))} aria-label={`Tamanho do pote acumulado no ${label}`} className="w-full accent-accent-indigo h-1 bg-white/5 rounded-full appearance-none cursor-pointer hover:bg-white/10 transition-colors [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-accent-indigo [&::-webkit-slider-thumb]:rounded-full" />
      </div>
      <div className="flex flex-col gap-1">
         <div className="flex justify-between text-[0.55rem] font-black uppercase tracking-tighter text-text-darker">
            <span>EV_fold EstÃ¡tico</span>
            <span className="text-accent-danger/80">-{ (val + (anteSize / 100)).toFixed(2) } bb</span>
         </div>
         <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-accent-danger/30 rounded-full" {...{ style: { width: `${Math.min((val/max)*100, 100)}%` } }} />
         </div>
      </div>
    </div>
  );
}

interface PostFlopPanelProps {
  anteSize?: number;
  scenarioId?: string;
  initialStacks?: number[];
  initialPrizes?: number[];
  heroIsIp?: boolean;
  activePlayers?: number;
  effectiveSprData?: SprStage[];
  pkoValue?: number;
  ipLabel?: string;
  oopLabel?: string;
}

export default function PostFlopPanel( { anteSize = 12.5, scenarioId, initialStacks, initialPrizes, heroIsIp: heroIsIpProp, activePlayers: activePlayersProp, effectiveSprData, pkoValue = 0, ipLabel, oopLabel }: Readonly<PostFlopPanelProps> ) {
  const isMasterControlled = Boolean( scenarioId && initialStacks?.length && initialPrizes?.length );
  const [isLocked, setIsLocked] = useState( isMasterControlled );
  const [presetIdx, setPresetIdx] = useState( 0 );
  const [heroIsIp, setHeroIsIp] = useState<boolean>( heroIsIpProp ?? true );
  const [numPlayers, setNumPlayers] = useState<number>( activePlayersProp ?? 2 );

  const [potFlop, setPotFlop] = useState( 3 );
  const [potTurn, setPotTurn] = useState( 9 );
  const [potRiver, setPotRiver] = useState( 22 );

  const [stacks, setStacks] = useState<number[]>( DEFAULT_PRESET.stacks );
  const [prizes, setPrizes] = useState<number[]>( DEFAULT_PRESET.prizes );

  // SOTA: Acoplamento do Motor WebGPU (WASM) e InteligÃªncia HÃ­brida (PmLens)
  const wasmCtx = useContext(SotaWasmContext);
  const metricsCtx = useContext(SotaMetricsContext);

  const isCalculatingWasm = wasmCtx?.isCalculatingInsolvency ?? false;
  const gpuWinRate = wasmCtx?.insolvencyMatrixData?.winRate ? wasmCtx.insolvencyMatrixData.winRate * 100 : null;
  const gpuRiskIndex = wasmCtx?.insolvencyMatrixData?.riskIndex ?? null;
  const pm = metricsCtx?.apiQuantumMetrics?.perspectiva ?? null;
  const ci = metricsCtx?.apiQuantumMetrics?.ci ?? null;

  // SincronizaÃ§Ã£o Inteligente SOTA
  useEffect( () => {
    if ( !isMasterControlled || !isLocked ) return;

    setStacks( initialStacks ? [ ...initialStacks ] : DEFAULT_PRESET.stacks );
    setPrizes( initialPrizes ? [ ...initialPrizes ] : DEFAULT_PRESET.prizes );
    setHeroIsIp( heroIsIpProp ?? true );
    setNumPlayers( activePlayersProp ?? 2 );

    const flopStage = effectiveSprData?.find( stage => stage.name === 'FLOP' )?.potSize;
    const turnStage = effectiveSprData?.find( stage => stage.name === 'TURN' )?.potSize;
    const riverStage = effectiveSprData?.find( stage => stage.name === 'RIVER' )?.potSize;

    if ( flopStage ) setPotFlop( flopStage / 2 );
    if ( turnStage ) setPotTurn( turnStage / 2 );
    if ( riverStage ) setPotRiver( riverStage / 2 );
  }, [ isLocked, isMasterControlled, scenarioId, initialStacks, initialPrizes, heroIsIpProp, activePlayersProp, effectiveSprData ] );

  const handlePresetChange = ( idx: number ) => {
    const nextPreset = PRESETS[idx] ?? DEFAULT_PRESET;
    setPresetIdx( idx );
    setStacks( nextPreset.stacks );
    setPrizes( nextPreset.prizes );
    setIsLocked( false );
  };

  const addPhantom = () => {
    setStacks( prev => [...prev, 20] );
    if ( prizes.length < stacks.length + 1 ) {
      setPrizes( prev => [...prev, Math.max( 1, ( prev.at( -1 ) || 10 ) * 0.8 )] );
    }
    setIsLocked( false );
  };

  const updateStack = ( idx: number, val: number ) => {
    const newStacks = [...stacks];
    newStacks[idx] = Math.max( 0.1, val );
    setStacks( newStacks );
    setIsLocked( false );
  };

  const preset = PRESETS[presetIdx] ?? DEFAULT_PRESET;
  const ipIdx = preset.ipIndex;
  const oopIdx = preset.oopIndex;
  const ipStack = stacks[ipIdx] ?? 1;
  const oopStack = stacks[oopIdx] ?? 1;
  const minActiveStack = Math.min(ipStack, oopStack);
  const resolvedIpLabel = ipLabel ?? (heroIsIp ? 'HERO' : 'VILÃƒO');
  const resolvedOopLabel = oopLabel ?? (heroIsIp ? 'VILÃƒO' : 'HERO');

  const potTotalFlop = potFlop * 2;
  const potTotalTurn = potTurn * 2;
  const potTotalRiver = potRiver * 2;

  const isBaseline = prizes.length <= 1;

  const resultFlop = useMemo( () => derivePostFlopRps( stacks, prizes, ipIdx, oopIdx, {
    street: 'flop', potAcumuladoHero: potFlop, potTotal: potTotalFlop, heroIsIp, numPlayers, bountyValue: pkoValue * 100,
  } ), [stacks, prizes, ipIdx, oopIdx, potFlop, potTotalFlop, heroIsIp, numPlayers, pkoValue] );

  const resultTurn = useMemo( () => derivePostFlopRps( stacks, prizes, ipIdx, oopIdx, {
    street: 'turn', potAcumuladoHero: potTurn, potTotal: potTotalTurn, heroIsIp, numPlayers, bountyValue: pkoValue * 100,
  } ), [stacks, prizes, ipIdx, oopIdx, potTurn, potTotalTurn, heroIsIp, numPlayers, pkoValue] );

  const resultRiver = useMemo( () => derivePostFlopRps( stacks, prizes, ipIdx, oopIdx, {
    street: 'river', potAcumuladoHero: potRiver, potTotal: potTotalRiver, heroIsIp, numPlayers, bountyValue: pkoValue * 100,
  } ), [stacks, prizes, ipIdx, oopIdx, potRiver, potTotalRiver, heroIsIp, numPlayers, pkoValue] );

  const results: [Street, PostFlopResult | null][] = [
    ['flop', resultFlop],
    ['turn', resultTurn],
    ['river', resultRiver],
  ];

  const getGpuMetricsClassText = () => {
    let winRateText = 'N/A';
    let winRateClass = 'text-text-darker';
    if (isCalculatingWasm) {
      winRateText = 'WASM...';
      winRateClass = 'text-text-dim animate-pulse';
    } else if (gpuWinRate !== null) {
      winRateText = `${gpuWinRate.toFixed(1)}%`;
      winRateClass = 'text-white';
    }
    let riskIndexText = 'N/A';
    let riskIndexClass = 'text-text-darker';
    if (isCalculatingWasm) {
      riskIndexText = 'WASM...';
      riskIndexClass = 'text-text-dim animate-pulse';
    } else if (gpuRiskIndex !== null) {
      riskIndexText = `${(gpuRiskIndex * 100).toFixed(1)}%`;
      riskIndexClass = 'text-accent-amber';
    }
    return { winRateText, winRateClass, riskIndexText, riskIndexClass };
  };
  const { winRateText, winRateClass, riskIndexText, riskIndexClass } = getGpuMetricsClassText();

  return (
    <div className="glass-panel flex flex-col gap-6 border border-white/10 rounded-4xl shadow-2xl bg-bg-panel/90 backdrop-blur-2xl p-6 sm:p-8 lg:p-10 transition-all duration-500 hover:border-accent-indigo/40 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent-indigo/5 blur-[100px] pointer-events-none rounded-full" />

      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 relative z-10">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-2">
             <span className="text-[0.55rem] font-black text-accent-indigo-light uppercase tracking-widest bg-accent-indigo/10 border border-accent-indigo/20 px-2 py-0.5 rounded-md shadow-inner">Post-Flop Analyzer</span>
             <h3 className="text-base sm:text-lg font-black text-white m-0 tracking-tight uppercase">
               LaboratÃ³rio de Perspectiva <span className="text-accent-indigo opacity-60 font-mono">v4.2</span>
             </h3>
          </div>
          <p className="text-[0.7rem] text-text-muted mt-1.5 mb-0 leading-relaxed font-medium">
            Mapeamento termodinÃ¢mico de EV_fold e Risk Premium. O descarte (<code className="text-accent-danger/80">Fold</code>) possui valor intrÃ­nseco de sobrevivÃªncia baseado no Payjump e na inÃ©rcia da mesa.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-xl border border-white/5 shadow-inner">
           <button
             onClick={ () => setIsLocked(!isLocked) }
             {...{ 'aria-pressed': isLocked }}
             className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[0.55rem] font-black uppercase tracking-widest transition-all ${isLocked ? 'bg-accent-indigo text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'bg-transparent text-text-dim hover:text-white'}`}
           >
             <i className={`fa-solid ${isLocked ? 'fa-link' : 'fa-link-slash'} text-[0.6rem]`} />
             { isLocked ? 'Sincronizado' : 'Manual (Lab)' }
           </button>
           <button
             onClick={ addPhantom }
             aria-label="Adicionar Phantom Stack"
             className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[0.55rem] font-black uppercase tracking-widest bg-white/5 text-text-dim hover:text-white hover:bg-white/10 transition-all border border-white/5"
           >
             <i className="fa-solid fa-plus text-[0.6rem]" /> Phantom
           </button>
        </div>
      </div>

      {/* SOTA: Stack Manager Grid */}
      <div className="grid grid-cols-3 md:grid-cols-5 xl:grid-cols-9 gap-2 bg-black/50 border border-white/5 p-3 rounded-2xl shadow-inner relative z-10">
        { stacks.map( ( s, i ) => (
          <StackInput key={`stack-pos-${i}`} val={s} index={i} ipIdx={ipIdx} oopIdx={oopIdx} onUpdate={updateStack} /> // NOSONAR
        ) ) }
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">

        <div className="lg:col-span-4 flex flex-col gap-5">
          <div className="space-y-2">
            <span className="text-[0.55rem] font-black text-text-darker uppercase tracking-[0.2em] flex items-center gap-2 px-1"><i className="fa-solid fa-flask-vial text-accent-indigo" /> Presets de LaboratÃ³rio</span>
            <div className="flex gap-1.5 flex-wrap">
              { PRESETS.map( ( p, i ) => (
                <button
                  key={ p.label }
                  onClick={ () => handlePresetChange( i ) }
                  {...{ 'aria-pressed': presetIdx === i }}
                  className={ `px-3 py-2 rounded-lg text-[0.55rem] font-black border transition-all duration-300 ${presetIdx === i ? 'bg-accent-indigo text-white border-accent-indigo-light shadow-lg' : 'bg-slate-800/40 border-white/5 text-text-muted hover:text-white hover:border-white/10'}` }
                >
                  { p.label }
                </button>
              ) ) }
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[0.55rem] font-black text-text-darker uppercase tracking-[0.2em] flex items-center gap-2 px-1"><i className="fa-solid fa-arrows-left-right text-accent-sky" /> Posicionamento Hero</span>
            <div className="flex gap-1.5 p-1 bg-black/40 border border-white/5 rounded-xl shadow-inner">
              { [true, false].map( isIp => (
                <button
                  key={ String( isIp ) }
                  onClick={ () => { setHeroIsIp( isIp ); setIsLocked(false); } }
                  {...{ 'aria-pressed': heroIsIp === isIp }}
                  className={ `flex-1 px-3 py-2 rounded-lg text-[0.55rem] font-black border transition-all ${heroIsIp === isIp ? 'bg-linear-to-r from-accent-sky to-sky-700 border-accent-sky-light text-white shadow-md' : 'bg-transparent border-transparent text-text-dim hover:text-white'}` }
                >
                  { isIp ? 'IP (Hero)' : 'OOP (Hero)' }
                </button>
              ) ) }
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[0.55rem] font-black text-text-darker uppercase tracking-[0.2em] flex items-center gap-2 px-1"><i className="fa-solid fa-users-viewfinder text-accent-violet" /> Entropia Multiway</span>
            <div className="flex gap-1 p-1 bg-black/40 border border-white/5 rounded-xl shadow-inner">
              { [2, 3, 4, 5].map( n => (
                <button
                  key={ n }
                  onClick={ () => { setNumPlayers( n ); setIsLocked(false); } }
                  {...{ 'aria-pressed': numPlayers === n }}
                  className={ `flex-1 py-1.5 rounded-lg text-[0.6rem] font-black border transition-all ${numPlayers === n ? 'bg-accent-violet border-accent-violet text-black' : 'bg-transparent border-transparent text-text-muted hover:text-white'}` }
                >
                  { n }{ n > 2 ? ' MW' : ' HU' }
                </button>
              ) ) }
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6 bg-black/40 p-5 rounded-3xl border border-white/5 shadow-inner">
          <PotControl label="FLOP" val={potFlop} min={1} max={minActiveStack * 0.4} anteSize={anteSize} onChange={v => { setPotFlop(v); setIsLocked(false); }} />
          <PotControl label="TURN" val={potTurn} min={1} max={minActiveStack * 0.7} anteSize={anteSize} onChange={v => { setPotTurn(v); setIsLocked(false); }} />
          <PotControl label="RIVER" val={potRiver} min={1} max={minActiveStack} anteSize={anteSize} onChange={v => { setPotRiver(v); setIsLocked(false); }} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 relative z-10">
        { results.map( ( [street, result] ) =>
          result ? (
            <StreetCard
              key={ street }
              street={ street }
              result={ result }
              ipLabel={ resolvedIpLabel }
              oopLabel={ resolvedOopLabel }
              heroIsIp={ heroIsIp }
              isBaseline={ isBaseline }
            />
          ) : (
            <div key={ street } className="bg-black/40 border border-white/5 rounded-2xl p-8 flex flex-col items-center justify-center text-center opacity-30 shadow-inner">
              <i className="fa-solid fa-ban text-text-darker mb-3 text-xl"></i>
              <span className="text-[0.6rem] font-black text-text-darker uppercase tracking-widest">
                { STREET_LABEL[street] } - VÃ¡cuo de Dados
              </span>
            </div>
          )
        ) }
      </div>

      {/* SOTA: InteligÃªncia HÃ­brida & WebGPU Telemetry (IntegraÃ§Ã£o PmLens) */}
      <div className="bg-bg-deep/80 backdrop-blur-md border border-white/10 rounded-3xl p-5 lg:p-7 shadow-2xl relative overflow-hidden group mt-2">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-emerald/5 blur-[100px] pointer-events-none rounded-full" />
        <div className="absolute top-0 right-0 w-32 h-full bg-linear-to-l from-accent-emerald/5 to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-white/5 pb-4 mb-4 relative z-10 gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-1.5 h-1.5 rounded-full ${isCalculatingWasm ? 'bg-accent-emerald animate-pulse shadow-[0_0_10px_var(--accent-emerald)]' : 'bg-accent-indigo shadow-[0_0_10px_var(--accent-indigo)]'}`}></div>
            <strong className="text-[0.7rem] font-black text-white uppercase tracking-widest">
              InteligÃªncia HÃ­brida (WASM + PM Lens)
            </strong>
            <span className={`px-2 py-0.5 rounded border text-[0.55rem] font-mono tabular-nums ${isLocked ? 'bg-accent-indigo/10 border-accent-indigo/30 text-accent-indigo-light' : 'bg-white/5 border-white/10 text-text-muted'}`}>
              {isLocked ? 'Sincronizado' : 'VÃ¡cuo (Lab)'}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {pm !== null && (
              <div className="flex items-center gap-2 bg-black/40 px-2.5 py-1 rounded-lg border border-white/5 shadow-inner">
                <span className="text-[0.55rem] font-black text-text-dim uppercase tracking-widest">PM Global:</span>
                <span className={`text-[0.7rem] font-black font-mono tabular-nums ${getPmColorClass(pm)}`}>{formatPct(pm)}</span>
              </div>
            )}
            {ci !== null && (
              <div className="flex items-center gap-2 bg-black/40 px-2.5 py-1 rounded-lg border border-white/5 shadow-inner">
                <span className="text-[0.55rem] font-black text-text-dim uppercase tracking-widest">InsolvÃªncia (Cáµ¢):</span>
                <span className={`text-[0.7rem] font-black font-mono tabular-nums ${ci < 1 ? 'text-accent-danger' : 'text-accent-emerald'}`}>{formatCi(false, ci)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          <div className="flex flex-col gap-2.5">
            <span className="text-[0.6rem] font-black text-accent-emerald-light uppercase tracking-widest flex items-center gap-2">
              <i className="fa-solid fa-microchip" /> Motor WebGPU
            </span>
            <div className="bg-black/50 border border-white/5 rounded-xl p-3.5 flex flex-col justify-center gap-3.5 h-full shadow-inner">
              <div className="flex justify-between items-center">
                <span className="text-[0.6rem] text-text-muted font-bold uppercase tracking-widest">Win Rate Real</span>
                <span className={`text-[0.8rem] font-mono font-black tabular-nums ${winRateClass}`}>
                  {winRateText}
                </span>
              </div>
              <div className="w-full h-px bg-white/5" />
              <div className="flex justify-between items-center">
                <span className="text-[0.6rem] text-text-muted font-bold uppercase tracking-widest">A* Risk Infl.</span>
                <span className={`text-[0.8rem] font-mono font-black tabular-nums ${riskIndexClass}`}>
                  {riskIndexText}
                </span>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[0.6rem] font-black text-text-muted uppercase tracking-widest">Sinergia SistÃªmica</span>
            </div>
            <p className="text-[0.7rem] text-text-dim leading-relaxed m-0 italic font-medium">
              A Perspectiva MatemÃ¡tica (PM) atua sobre <code className="text-accent-danger font-bold bg-accent-danger/10 px-1 rounded">EV_fold</code> e <code className="text-accent-indigo-light font-bold bg-accent-indigo/10 px-1 rounded">Risk Premium</code>. A <span className="text-accent-danger font-bold">InsolvÃªncia (Cáµ¢)</span> desmascara a ilusÃ£o do ChipEV, enquanto o Motor WebGPU injeta Pathfinding A*, mitigando o viÃ©s do vÃ¡cuo pÃ³s-flop.
            </p>
            {!isLocked && (
              <button
                onClick={() => setIsLocked(true)}
                className="mt-3 self-start px-3 py-1.5 bg-accent-emerald/10 text-accent-emerald-light border border-accent-emerald/30 rounded-lg text-[0.55rem] font-black uppercase tracking-widest hover:bg-accent-emerald/20 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all"
              >
                <i className="fa-solid fa-link mr-1" /> Reacoplar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
