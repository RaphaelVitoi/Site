'use client';

import { useEffect, useMemo, useState, useContext } from 'react';
import { derivePostFlopRps, type PostFlopResult, type Street } from '@/lib/rpDeriver';
import type { SprStage } from '../solver/types';
import { StreetCard } from '@/components/simulator/ui/StreetCard';
import { SotaMetricsContext, SotaWasmContext } from '../SotaContext';
import { formatCi, formatPct, getPmColorClass } from '@/components/simulator/solver/utils';

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

const DEFAULT_PRESET: PostFlopPreset = PRESETS[0] ?? {
  label: 'Fallback',
  stacks: [40, 55],
  prizes: [65, 35],
  ipIndex: 0,
  oopIndex: 1,
  ipLabel: 'IP',
  oopLabel: 'OOP',
};

const POSTFLOP_LABELS = {
  fold: 'Fold',
  hybridIntelligence: 'Inteligência Híbrida',
  wasmLens: 'WASM + PM Lens',
  pmGlobal: 'PM Global:',
  insolvencyCi: 'Insolvência (Cᵢ)',
  insolvencyCiField: 'Insolvência (Cᵢ):',
  winRateReal: 'Win Rate Real',
  riskPremium: 'Risk Premium',
  evFold: 'EV_fold',
} as const;

function StackInput({
  val,
  index,
  ipIdx,
  oopIdx,
  onUpdate,
}: Readonly<{
  val: number;
  index: number;
  ipIdx: number;
  oopIdx: number;
  onUpdate: (idx: number, val: number) => void;
}>) {
  const isActive = index === ipIdx || index === oopIdx;
  let label = `P${index + 1}`;
  if (index === ipIdx) label = 'IP (AGR)';
  else if (index === oopIdx) label = 'OOP (DEF)';
  return (
    <div
      className={`flex flex-col gap-1.5 rounded-xl border px-3 py-2 transition-all ${isActive ? 'bg-accent-indigo/10 border-accent-indigo/30 ring-accent-indigo/20 ring-1' : 'border-white/5 bg-transparent opacity-40 hover:opacity-100'}`}
    >
      <span
        className={`text-[0.5rem] font-black tracking-tighter uppercase ${isActive ? 'text-accent-indigo-light' : 'text-text-darker'}`}
      >
        {label}
      </span>
      <div className="flex items-baseline gap-1">
        <input
          aria-label={`Stack do ${label}`}
          type="number"
          value={val}
          onChange={(e) => onUpdate(index, Number.parseFloat(e.target.value) || 0)}
          className={`w-full border-none bg-transparent font-mono text-[0.8rem] font-black tabular-nums outline-none ${isActive ? 'text-white' : 'text-text-dim'}`}
        />
        <span className="text-text-darker text-[0.5rem] font-black uppercase">bb</span>
      </div>
    </div>
  );
}

function PotControl({
  label,
  val,
  min,
  max,
  anteSize,
  onChange,
}: Readonly<{
  label: string;
  val: number;
  min: number;
  max: number;
  anteSize: number;
  onChange: (v: number) => void;
}>) {
  const safeVal = Number.isNaN(Number(val)) || val == null ? 0 : Number(val);
  const safeAnte = Number.isNaN(Number(anteSize)) || anteSize == null ? 12.5 : Number(anteSize);
  return (
    <div className="group flex flex-col gap-4">
      <div className="flex items-end justify-between border-b border-white/5 pb-2">
        <span className="text-accent-indigo-light text-[0.65rem] font-black tracking-widest uppercase">{label}</span>
        <div className="flex items-baseline gap-1 rounded-lg border border-white/10 bg-black/60 px-2.5 py-1 shadow-inner">
          <span className="font-mono text-[0.85rem] font-black text-white tabular-nums">{safeVal.toFixed(1)}</span>
          <span className="text-text-darker text-[0.5rem] font-black uppercase">bb</span>
        </div>
      </div>
      <div className="relative pt-2">
        <input
          type="range"
          min={min}
          max={max}
          step="0.5"
          value={safeVal}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label={`Tamanho do pote acumulado no ${label}`}
          className="accent-accent-indigo [&::-webkit-slider-thumb]:bg-accent-indigo h-1 w-full cursor-pointer appearance-none rounded-full bg-white/5 transition-colors hover:bg-white/10 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full"
        />
      </div>
      <div className="flex flex-col gap-1">
        <div className="text-text-darker flex justify-between text-[0.55rem] font-black tracking-tighter uppercase">
          <span>EV_fold Estático</span>
          <span className="text-accent-danger/80">-{(safeVal + safeAnte / 100).toFixed(2)} bb</span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-white/5">
          <div
            className="bg-accent-danger/30 h-full rounded-full"
            style={{ width: `${Math.min((safeVal / max) * 100, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

interface PostFlopPanelProps {
  anteSize?: number | undefined;
  scenarioId?: string | undefined;
  initialStacks?: number[] | undefined;
  initialPrizes?: number[] | undefined;
  heroIsIp?: boolean | undefined;
  activePlayers?: number | undefined;
  effectiveSprData?: SprStage[] | undefined;
  pkoValue?: number | undefined;
  ipLabel?: string | undefined;
  oopLabel?: string | undefined;
}

export default function PostFlopPanel({
  anteSize = 12.5,
  scenarioId,
  initialStacks,
  initialPrizes,
  heroIsIp: heroIsIpProp,
  activePlayers: activePlayersProp,
  effectiveSprData,
  pkoValue = 0,
  ipLabel,
  oopLabel,
}: Readonly<PostFlopPanelProps>) {
  const isMasterControlled = Boolean(scenarioId && initialStacks?.length && initialPrizes?.length);
  const [isLocked, setIsLocked] = useState(isMasterControlled);
  const [presetIdx, setPresetIdx] = useState(0);
  const [heroIsIp, setHeroIsIp] = useState<boolean>(heroIsIpProp ?? true);
  const [numPlayers, setNumPlayers] = useState<number>(activePlayersProp ?? 2);

  const [potFlop, setPotFlop] = useState(3);
  const [potTurn, setPotTurn] = useState(9);
  const [potRiver, setPotRiver] = useState(22);

  const [stacks, setStacks] = useState<number[]>(DEFAULT_PRESET.stacks);
  const [prizes, setPrizes] = useState<number[]>(DEFAULT_PRESET.prizes);

  // SOTA: Acoplamento do Motor WebGPU (WASM) e Inteligência Híbrida (PmLens)
  const wasmCtx = useContext(SotaWasmContext);
  const metricsCtx = useContext(SotaMetricsContext);

  const isCalculatingWasm = wasmCtx?.isCalculatingInsolvency ?? false;
  const gpuWinRate = wasmCtx?.insolvencyMatrixData?.winRate ? wasmCtx.insolvencyMatrixData.winRate * 100 : null;
  const gpuRiskIndex = wasmCtx?.insolvencyMatrixData?.riskIndex ?? null;
  const pm = metricsCtx?.apiQuantumMetrics?.perspectiva ?? null;
  const ci = metricsCtx?.apiQuantumMetrics?.ci ?? null;

  // Sincronização Inteligente SOTA
  useEffect(() => {
    if (!isMasterControlled || !isLocked) return;

    setStacks(initialStacks ? [...initialStacks] : DEFAULT_PRESET.stacks);
    setPrizes(initialPrizes ? [...initialPrizes] : DEFAULT_PRESET.prizes);
    setHeroIsIp(heroIsIpProp ?? true);
    setNumPlayers(activePlayersProp ?? 2);

    const flopStage = effectiveSprData?.find((stage) => stage.name === 'FLOP')?.potSize;
    const turnStage = effectiveSprData?.find((stage) => stage.name === 'TURN')?.potSize;
    const riverStage = effectiveSprData?.find((stage) => stage.name === 'RIVER')?.potSize;

    if (flopStage != null && !Number.isNaN(Number(flopStage))) {
      setPotFlop(Number(flopStage) / 2);
    }
    if (turnStage != null && !Number.isNaN(Number(turnStage))) {
      setPotTurn(Number(turnStage) / 2);
    }
    if (riverStage != null && !Number.isNaN(Number(riverStage))) {
      setPotRiver(Number(riverStage) / 2);
    }
  }, [
    isLocked,
    isMasterControlled,
    scenarioId,
    initialStacks,
    initialPrizes,
    heroIsIpProp,
    activePlayersProp,
    effectiveSprData,
  ]);

  const handlePresetChange = (idx: number) => {
    const nextPreset = PRESETS.at(idx) ?? DEFAULT_PRESET;
    setPresetIdx(idx);
    setStacks(nextPreset.stacks);
    setPrizes(nextPreset.prizes);
    setIsLocked(false);
  };

  const addPhantom = () => {
    setStacks((prev) => [...prev, 20]);
    if (prizes.length < stacks.length + 1) {
      setPrizes((prev) => [...prev, Math.max(1, (prev.at(-1) || 10) * 0.8)]);
    }
    setIsLocked(false);
  };

  const updateStack = (idx: number, val: number) => {
    setStacks((prev) => prev.map((s, i) => (i === idx ? Math.max(0.1, val) : s)));
    setIsLocked(false);
  };

  const preset = PRESETS.at(presetIdx) ?? DEFAULT_PRESET;
  const ipIdx = preset.ipIndex;
  const oopIdx = preset.oopIndex;
  const ipStack = stacks.at(ipIdx) ?? 1;
  const oopStack = stacks.at(oopIdx) ?? 1;
  const minActiveStack = Math.min(ipStack, oopStack);
  const resolvedIpLabel = ipLabel ?? (heroIsIp ? 'HERO' : 'VILÃO');
  const resolvedOopLabel = oopLabel ?? (heroIsIp ? 'VILÃO' : 'HERO');

  const potTotalFlop = potFlop * 2;
  const potTotalTurn = potTurn * 2;
  const potTotalRiver = potRiver * 2;

  const isBaseline = prizes.length <= 1;

  const resultFlop = useMemo(
    () =>
      derivePostFlopRps(stacks, prizes, ipIdx, oopIdx, {
        street: 'flop',
        potAcumuladoHero: potFlop,
        potTotal: potTotalFlop,
        heroIsIp,
        numPlayers,
        bountyValue: pkoValue * 100,
      }),
    [stacks, prizes, ipIdx, oopIdx, potFlop, potTotalFlop, heroIsIp, numPlayers, pkoValue],
  );

  const resultTurn = useMemo(
    () =>
      derivePostFlopRps(stacks, prizes, ipIdx, oopIdx, {
        street: 'turn',
        potAcumuladoHero: potTurn,
        potTotal: potTotalTurn,
        heroIsIp,
        numPlayers,
        bountyValue: pkoValue * 100,
      }),
    [stacks, prizes, ipIdx, oopIdx, potTurn, potTotalTurn, heroIsIp, numPlayers, pkoValue],
  );

  const resultRiver = useMemo(
    () =>
      derivePostFlopRps(stacks, prizes, ipIdx, oopIdx, {
        street: 'river',
        potAcumuladoHero: potRiver,
        potTotal: potTotalRiver,
        heroIsIp,
        numPlayers,
        bountyValue: pkoValue * 100,
      }),
    [stacks, prizes, ipIdx, oopIdx, potRiver, potTotalRiver, heroIsIp, numPlayers, pkoValue],
  );

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
    } else if (gpuWinRate != null && !Number.isNaN(Number(gpuWinRate))) {
      winRateText = `${gpuWinRate.toFixed(1)}%`;
      winRateClass = 'text-white';
    }
    let riskIndexText = 'N/A';
    let riskIndexClass = 'text-text-darker';
    if (isCalculatingWasm) {
      riskIndexText = 'WASM...';
      riskIndexClass = 'text-text-dim animate-pulse';
    } else if (gpuRiskIndex != null && !Number.isNaN(Number(gpuRiskIndex))) {
      riskIndexText = `${(gpuRiskIndex * 100).toFixed(1)}%`;
      riskIndexClass = 'text-accent-amber';
    }
    return { winRateText, winRateClass, riskIndexText, riskIndexClass };
  };
  const { winRateText, winRateClass, riskIndexText, riskIndexClass } = getGpuMetricsClassText();

  return (
    <div className="glass-panel bg-bg-panel/80 relative flex flex-col gap-10 overflow-hidden rounded-4xl border border-white/10 p-8 shadow-2xl backdrop-blur-3xl transition-all duration-500 lg:p-12">
      <div className="bg-accent-indigo/5 pointer-events-none absolute top-0 right-0 h-64 w-64 rounded-full blur-[100px]" />

      <div className="relative z-10 flex flex-col items-start justify-between gap-6 xl:flex-row xl:items-center">
        <div className="max-w-2xl">
          <div className="mb-2 flex items-center gap-3">
            <span className="text-accent-indigo-light bg-accent-indigo/10 border-accent-indigo/30 rounded-md border px-2 py-0.5 text-[0.55rem] font-black tracking-[0.3em] uppercase shadow-inner">
              Post-Flop Analyzer
            </span>
            <h3 className="group-hover/pfp:text-glow-indigo m-0 text-base font-black tracking-[0.3em] text-white uppercase transition-all duration-500 sm:text-lg">
              Laboratório de Perspectiva &middot; <span className="text-text-muted">v7.0 GOLD</span>
            </h3>
            </div>
            <p className="text-text-muted mt-1.5 mb-0 text-[0.7rem] leading-relaxed font-medium">
            Mapeamento termodinâmico de EV_fold e Risk Premium. O descarte ({' '}
            <code className="text-accent-danger font-black px-1.5 py-0.5 rounded bg-accent-danger/10">{POSTFLOP_LABELS.fold}</code> ) possui valor intrínseco de sobrevivência baseado no
            Payjump e na inércia da mesa.
            </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-black/40 p-1.5 shadow-inner">
          <button
            type="button"
            onClick={() => setIsLocked(!isLocked)}
            aria-pressed={isLocked}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-[0.55rem] font-black tracking-[0.2em] uppercase transition-all ${isLocked ? 'bg-accent-indigo text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'text-text-dim bg-transparent hover:text-white'}`}
          >
            <i className={`fa-solid ${isLocked ? 'fa-link' : 'fa-link-slash'} text-[0.6rem]`} />
            {isLocked ? 'Sincronizado' : 'Manual (Lab)'}
          </button>
          <button
            type="button"
            onClick={addPhantom}
            aria-label="Adicionar Phantom Stack"
            className="text-text-dim flex items-center gap-2 rounded-lg border border-white/5 bg-white/5 px-4 py-2 text-[0.55rem] font-black tracking-[0.2em] uppercase transition-all hover:bg-white/10 hover:text-white"
          >
            <i className="fa-solid fa-plus text-[0.6rem]" /> Phantom
          </button>
        </div>
      </div>

      {/* SOTA: Stack Manager Grid */}
      <div className="relative z-10 grid grid-cols-3 gap-2 rounded-2xl border border-white/5 bg-black/50 p-3 shadow-inner md:grid-cols-5 xl:grid-cols-9">
        {stacks.map((s, i) => (
          <StackInput key={`stack-pos-${i}`} val={s} index={i} ipIdx={ipIdx} oopIdx={oopIdx} onUpdate={updateStack} /> // NOSONAR
        ))}
      </div>

      <div className="relative z-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="flex flex-col gap-6 lg:col-span-4">
          <div className="space-y-3">
            <span className="text-text-darker flex items-center gap-2 px-1 text-[0.55rem] font-black tracking-[0.3em] uppercase">
              <i className="fa-solid fa-flask-vial text-accent-indigo" /> Presets de Laboratório
            </span>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p, i) => (
                <button
                  type="button"
                  key={p.label}
                  onClick={() => handlePresetChange(i)}
                  aria-pressed={presetIdx === i}
                  className={`rounded-xl border px-4 py-2.5 text-[0.55rem] font-black transition-all duration-500 ${presetIdx === i ? 'bg-accent-indigo border-accent-indigo-light text-white shadow-lg' : 'text-text-muted border-white/5 bg-slate-800/40 hover:border-white/10 hover:text-white'}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-text-darker flex items-center gap-2 px-1 text-[0.55rem] font-black tracking-[0.3em] uppercase">
              <i className="fa-solid fa-arrows-left-right text-accent-sky" /> Posicionamento Hero
            </span>
            <div className="flex gap-2 rounded-2xl border border-white/5 bg-black/40 p-1.5 shadow-inner">
              {[true, false].map((isIp) => (
                <button
                  type="button"
                  key={String(isIp)}
                  onClick={() => {
                    setHeroIsIp(isIp);
                    setIsLocked(false);
                  }}
                  aria-pressed={heroIsIp === isIp}
                  className={`flex-1 rounded-xl border px-4 py-2.5 text-[0.55rem] font-black transition-all duration-500 ${heroIsIp === isIp ? 'from-accent-sky border-accent-sky-light bg-linear-to-r to-sky-700 text-white shadow-md' : 'text-text-dim border-transparent bg-transparent hover:text-white'}`}
                >
                  {isIp ? 'IP (Hero)' : 'OOP (Hero)'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-text-darker flex items-center gap-2 px-1 text-[0.55rem] font-black tracking-[0.3em] uppercase">
              <i className="fa-solid fa-users-viewfinder text-accent-violet" /> Entropia Multiway
            </span>
            <div className="flex gap-2 rounded-2xl border border-white/5 bg-black/40 p-1.5 shadow-inner">
              {[2, 3, 4, 5].map((n) => (
                <button
                  type="button"
                  key={n}
                  onClick={() => {
                    setNumPlayers(n);
                    setIsLocked(false);
                  }}
                  aria-pressed={numPlayers === n}
                  className={`flex-1 rounded-xl border py-2 text-[0.6rem] font-black transition-all duration-500 ${numPlayers === n ? 'bg-accent-violet border-accent-violet text-black' : 'text-text-muted border-transparent bg-transparent hover:text-white'}`}
                >
                  {n}
                  {n > 2 ? ' MW' : ' HU'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 rounded-4xl border border-white/5 bg-black/40 p-8 shadow-inner sm:grid-cols-3 lg:col-span-8">
          <PotControl
            label="FLOP"
            val={potFlop}
            min={1}
            max={minActiveStack * 0.4}
            anteSize={anteSize}
            onChange={(v) => {
              setPotFlop(v);
              setIsLocked(false);
            }}
          />
          <PotControl
            label="TURN"
            val={potTurn}
            min={1}
            max={minActiveStack * 0.7}
            anteSize={anteSize}
            onChange={(v) => {
              setPotTurn(v);
              setIsLocked(false);
            }}
          />
          <PotControl
            label="RIVER"
            val={potRiver}
            min={1}
            max={minActiveStack}
            anteSize={anteSize}
            onChange={(v) => {
              setPotRiver(v);
              setIsLocked(false);
            }}
          />
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {results.map(([street, result]) =>
          result ? (
            <StreetCard
              key={street}
              street={street}
              result={result}
              ipLabel={resolvedIpLabel}
              oopLabel={resolvedOopLabel}
              heroIsIp={heroIsIp}
              isBaseline={isBaseline}
            />
          ) : (
            <div
              key={street}
              className="flex flex-col items-center justify-center rounded-3xl border border-white/5 bg-black/40 p-10 text-center opacity-30 shadow-inner"
            >
              <i className="fa-solid fa-ban text-text-darker mb-4 text-2xl"></i>
              <span className="text-text-darker text-[0.6rem] font-black tracking-[0.3em] uppercase">
                {street.toUpperCase()} &middot; Vácuo de Dados
              </span>
            </div>
          ),
        )}
      </div>

      {/* SOTA: Inteligência Híbrida & WebGPU Telemetry (Integração PmLens) */}
      <div className="bg-bg-deep/80 group relative mt-4 overflow-hidden rounded-4xl border border-white/10 p-8 shadow-2xl backdrop-blur-3xl lg:p-10">
        <div className="bg-accent-emerald/5 pointer-events-none absolute top-0 right-0 h-64 w-64 rounded-full blur-[100px]" />
        <div className="from-accent-emerald/5 pointer-events-none absolute top-0 right-0 h-full w-32 bg-linear-to-l to-transparent" />

        <div className="relative z-10 mb-6 flex flex-col items-start justify-between gap-6 border-b border-white/5 pb-6 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div
              className={`h-2 w-2 rounded-full ${isCalculatingWasm ? 'bg-accent-emerald animate-pulse shadow-[0_0_12px_var(--accent-emerald)]' : 'bg-accent-indigo shadow-[0_0_12px_var(--accent-indigo)]'}`}
            ></div>
            <strong className="text-[0.75rem] font-black tracking-[0.3em] text-white uppercase">
              {POSTFLOP_LABELS.hybridIntelligence} &middot;{' '}
              <span className="text-text-muted">{POSTFLOP_LABELS.wasmLens}</span>
            </strong>
            <span
              className={`rounded-lg border px-3 py-1 font-mono text-[0.55rem] font-black tabular-nums ${isLocked ? 'bg-accent-indigo/10 border-accent-indigo/30 text-accent-indigo-light' : 'text-text-muted border-white/10 bg-white/5'}`}
            >
              {isLocked ? 'SINCRONIZADO' : 'VÁCUO (LAB)'}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {pm !== null && (
              <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-black/40 px-4 py-2 shadow-inner">
                <span className="text-text-dim text-[0.6rem] font-black tracking-[0.2em] uppercase">{POSTFLOP_LABELS.pmGlobal}</span>
                <span className={`font-mono text-[0.8rem] font-black tabular-nums ${getPmColorClass(pm)}`}>
                  {formatPct(pm)}
                </span>
              </div>
            )}
            {ci !== null && (
              <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-black/40 px-4 py-2 shadow-inner">
                <span className="text-text-dim text-[0.6rem] font-black tracking-[0.2em] uppercase">
                  {POSTFLOP_LABELS.insolvencyCiField}
                </span>
                <span
                  className={`font-mono text-[0.8rem] font-black tabular-nums ${ci < 1 ? 'text-accent-danger' : 'text-accent-emerald'}`}
                >
                  {formatCi(false, ci)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="flex flex-col gap-4">
            <span className="text-accent-emerald-light flex items-center gap-2 text-[0.6rem] font-black tracking-[0.3em] uppercase">
              <i className="fa-solid fa-microchip" /> Motor WebGPU
            </span>
            <div className="flex h-full flex-col justify-center gap-5 rounded-2xl border border-white/5 bg-black/50 p-5 shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-text-muted text-[0.65rem] font-bold tracking-[0.2em] uppercase">{POSTFLOP_LABELS.winRateReal}</span>
                <span className={`font-mono text-[0.9rem] font-black tabular-nums ${winRateClass}`}>{winRateText}</span>
              </div>
              <div className="h-px w-full bg-white/5" />
              <div className="flex items-center justify-between">
                <span className="text-text-muted text-[0.65rem] font-bold tracking-[0.2em] uppercase">A* Risk Infl.</span>
                <span className={`font-mono text-[0.9rem] font-black tabular-nums ${riskIndexClass}`}>
                  {riskIndexText}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center md:col-span-2">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-text-muted text-[0.6rem] font-black tracking-[0.3em] uppercase">
                Sinergia Sistêmica
              </span>
            </div>
            <p className="text-text-dim m-0 text-[0.8rem] leading-relaxed font-medium italic opacity-90">
              A Perspectiva Matemática (PM) atua sobre{' '}
              <code className="text-accent-danger bg-accent-danger/10 rounded px-1.5 py-0.5 font-bold">{POSTFLOP_LABELS.evFold}</code> e{' '}
              <code className="text-accent-indigo-light bg-accent-indigo/10 rounded px-1.5 py-0.5 font-bold">{POSTFLOP_LABELS.riskPremium}</code>.
              A <span className="text-accent-danger font-bold">{POSTFLOP_LABELS.insolvencyCi}</span> desmascara a ilusão do
              ChipEV, enquanto o Motor WebGPU injeta Pathfinding A*, mitigando o viés do vácuo pós-flop.
            </p>
            {!isLocked && (
              <button
                type="button"
                onClick={() => setIsLocked(true)}
                className="bg-accent-emerald/10 text-accent-emerald-light border-accent-emerald/30 hover:bg-accent-emerald/20 mt-6 self-start rounded-xl border px-5 py-2.5 text-[0.55rem] font-black tracking-[0.3em] uppercase transition-all hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95"
              >
                <i className="fa-solid fa-link mr-2" /> Reacoplar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
