'use client';

/**
 * IDENTITY: Calculadora Malmuth-Harville de Equidade ICM v7.0 GOLD
 * PATH: src/components/simulator/panels/EquityCalculator.tsx
 * ROLE: Inputs manuais de stacks + payouts + hand parser -> cálculo ICM real.
 * BINDING: [lib/icmEngine.ts, lib/handParser.ts, components/simulator/hooks/*, components/simulator/ui/*]
 */

import { parseHandHistory } from '@/lib/handParser';
import { downloadHRCJson, generateHRCJson } from '@/lib/hrcExport';
import type { ICMPlayer } from '@/lib/icmEngine';
import { use, useCallback, useDeferredValue, useMemo, useState } from 'react';
import { SotaWasmContext } from '../SotaContext';
import { useIcmCalculations } from '../hooks/useIcmCalculations';
import type { InsolvencyMetrics } from '../hooks/useQuantumEngine';
import AnimatedNumber from '../ui/AnimatedNumber';
import { DynamicFoldEquityWidget } from '../ui/DynamicFoldEquityWidget';
import { GeminiVoicePlayer } from '../ui/GeminiVoicePlayer';
import { InsolvencyRioPanel } from '../ui/InsolvencyRioPanel';
import { MonteCarloConvergenceWidget } from '../ui/MonteCarloConvergenceWidget';

const PRESETS = [
  { label: 'HU (2p)', stacks: [50, 50], prizes: [65, 35] },
  { label: '3-Way', stacks: [40, 35, 25], prizes: [50, 30, 20] },
  {
    label: 'FT (6p)',
    stacks: [30, 25, 20, 12, 8, 5],
    prizes: [35, 25, 18, 12, 7, 3],
  },
  { label: 'Bolha (4p)', stacks: [45, 25, 18, 12], prizes: [50, 30, 20] },
];

export default function EquityCalculator() {
  const [players, setPlayers] = useState<ICMPlayer[]>([
    { id: '1', name: 'Jogador 1', stack: 40 },
    { id: '2', name: 'Jogador 2', stack: 55 },
  ]);
  const [prizes, setPrizes] = useState<number[]>([65, 35]);
  const [handText, setHandText] = useState('');
  const [showParser, setShowParser] = useState(false);
  const [parserError, setParserError] = useState<string | null>(null);
  const [heroId, setHeroId] = useState<string | null>('1');

  const wasmContext = use(SotaWasmContext);

  // SOTA Freeze: Shim estrito de retrocompatibilidade (Zero-Any)
  const safeWasmContext = wasmContext as unknown as {
    insolvencyMatrixData?: InsolvencyMetrics;
    isCalculatingInsolvency?: boolean;
  };
  const insolvency: InsolvencyMetrics | null = safeWasmContext?.insolvencyMatrixData ?? null;

  const LABELS = {
    title: 'Calculadora Malmuth-Harville',
    subtitle: 'Aproximação de Equidade por Malha de Combinações',
    hhParser: 'Parser de Hand History',
    processStacks: 'Processar Estrutura de Stacks',
    playerStacks: 'Stacks dos Jogadores',
    payoutStructure: 'Estrutura de Payouts (%)',
    totalSum: 'Soma Total:',
    equitySummary: 'Resumo de Equidade',
    bubbleFactorVar: 'Variação Bubble Factor',
    survivalUrgency: 'Urgência de Sobrevivência',
    high: 'Alta',
    icmInsight: 'ICM Insight SOTA',
    player: 'Jogador',
    stackBb: 'Stack (BB)',
    propPct: 'Prop. (%)',
    icmEqPct: 'ICM Eq (%)',
    delta: 'Delta',
  } as const;

  const deferredPlayers = useDeferredValue(players);
  const deferredPrizes = useDeferredValue(prizes);

  // SOTA v4.2: Orquestração de Cálculo Modularizada
  const { results, isWorkerCalculating, totalChips, totalPrizes } = useIcmCalculations({
    players: deferredPlayers,
    prizes: deferredPrizes,
  });

  const isCalculatingICM =
    players !== deferredPlayers || prizes !== deferredPrizes || isWorkerCalculating;

  const handleExportHRC = useCallback(() => {
    const json = generateHRCJson(players, prizes);
    downloadHRCJson(json, `vitoi_spot_${players.length}p.json`);
  }, [players, prizes]);

  const { bfRange, bfRangeColor } = useMemo(() => {
    if (results.length < 2 || totalChips === 0)
      return { bfRange: '-', bfRangeColor: 'text-text-darker' };
    const bfs = results.map((r) => {
      const chip = ((players.find((p) => p.id === r.id)?.stack ?? 0) / totalChips) * 100;
      return chip > 0 ? r.equityPercent / chip : 1;
    });
    const min = Math.min(...bfs);
    const max = Math.max(...bfs);
    let color = 'text-accent-emerald';
    if (max > 1.3) color = 'text-accent-danger';
    else if (max > 1.1) color = 'text-accent-amber';
    return {
      bfRange: `${min.toFixed(2)}-${max.toFixed(2)}`,
      bfRangeColor: color,
    };
  }, [results, players, totalChips]);

  const icmInsight = useMemo(() => {
    if (results.length < 2 || totalChips === 0) return null;
    let maxGain = { name: '', delta: -Infinity };
    let maxLoss = { name: '', delta: Infinity };
    for (const r of results) {
      const chip = ((players.find((p) => p.id === r.id)?.stack ?? 0) / totalChips) * 100;
      const delta = r.equityPercent - chip;
      if (delta > maxGain.delta) maxGain = { name: r.name, delta };
      if (delta < maxLoss.delta) maxLoss = { name: r.name, delta };
    }
    if (Math.abs(maxGain.delta) < 0.5 && Math.abs(maxLoss.delta) < 0.5) {
      return 'Equidade ICM próxima da proporcional — pressão ICM baixa neste spot.';
    }
    return `${maxGain.name} ganha +${maxGain.delta.toFixed(1)}% com ICM vs proporcional. ${maxLoss.name} perde ${Math.abs(maxLoss.delta).toFixed(1)}%. Short stacks acumulam equity desproporcional ao risco.`;
  }, [results, players, totalChips]);

  const addPlayer = useCallback(() => {
    setPlayers((prev) => [
      ...prev,
      {
        id: globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `${Date.now()}-${prev.length + 1}`,
        name: `Jogador ${prev.length + 1}`,
        stack: 20,
      },
    ]);
  }, []);

  const removePlayer = useCallback(
    (id: string) => {
      setPlayers((prev) => prev.filter((p) => p.id !== id));
      if (heroId === id) setHeroId(null);
    },
    [heroId]
  );

  const updateStack = useCallback((id: string, stack: number) => {
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, stack } : p)));
  }, []);

  const updateName = useCallback((id: string, name: string) => {
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)));
  }, []);

  const updatePrize = useCallback((idx: number, value: number) => {
    setPrizes((prev) => prev.map((p, i) => (i === idx ? value : p)));
  }, []);

  const addPrize = useCallback(() => {
    setPrizes((prev) => [...prev, 10]);
  }, []);

  const removePrize = useCallback(() => {
    setPrizes((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }, []);

  const loadPreset = useCallback((preset: (typeof PRESETS)[0]) => {
    setPlayers(
      preset.stacks.map((stack, i) => ({
        id: String(i + 1),
        name: `Jogador ${i + 1}`,
        stack,
      }))
    );
    setPrizes([...preset.prizes]);
    setHeroId('1');
  }, []);

  const parseHand = useCallback(() => {
    setParserError(null);
    try {
      let parsed = parseHandHistory(handText);
      if (parsed.length >= 2) {
        if (parsed.length > 9) parsed = parsed.slice(0, 9);
        const firstPlayer = parsed[0];
        if (!firstPlayer) {
          setParserError('Falha ao identificar o jogador hero.');
          return;
        }
        setPlayers(parsed);
        setShowParser(false);
        setHandText('');
        setHeroId(firstPlayer.id);
      } else {
        setParserError('Não foi possível identificar pelo menos 2 jogadores.');
      }
    } catch (error: unknown) {
      console.error('[HandParser] Erro ao decodificar Hand History:', error);
      setParserError('Falha ao decodificar a Hand History.');
    }
  }, [handText]);

  return (
    <div className="glass-panel flex flex-col gap-10 p-6 sm:p-8 lg:p-12 rounded-4xl bg-bg-panel/80 backdrop-blur-xl border border-white/10 shadow-2xl relative overflow-hidden transition-all duration-300">
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent-indigo/5 blur-3xl rounded-full pointer-events-none" />

      <div className="flex justify-between items-start border-b border-white/5 pb-6">
        <div>
          <h3 className="text-[0.75rem] font-black text-white uppercase tracking-[0.2em] m-0 text-glow-indigo transition-all duration-500">
            {LABELS.title}
          </h3>
          <p className="m-0 mt-1.5 text-[0.6rem] text-text-dim font-medium uppercase tracking-wider text-glow-indigo transition-all duration-500">
            {LABELS.subtitle}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowParser(!showParser)}
            className={`px-4 py-2 rounded-xl text-[0.6rem] font-black uppercase tracking-widest transition-all border ${showParser ? 'bg-accent-indigo text-white border-accent-indigo shadow-lg' : 'bg-black/40 border-white/5 text-text-muted hover:bg-white/5 hover:text-white'}`}
          >
            <i className="fa-solid fa-code mr-1.5" /> {showParser ? 'Config Manual' : 'Parser HH'}
          </button>
          <button
            type="button"
            onClick={handleExportHRC}
            className="px-4 py-2 rounded-xl bg-black/40 border border-white/5 text-text-muted text-[0.6rem] font-black uppercase tracking-widest hover:bg-white/5 hover:text-white transition-all"
          >
            <i className="fa-solid fa-file-export mr-1.5" /> Export HRC
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {PRESETS.map((p) => (
          <button
            type="button"
            key={p.label}
            onClick={() => loadPreset(p)}
            className="px-4 py-2 rounded-xl bg-black/40 border border-white/5 text-text-muted text-[0.65rem] font-black uppercase tracking-widest hover:bg-white/5 hover:text-white hover:border-white/20 transition-all shadow-inner"
          >
            {p.label}
          </button>
        ))}
      </div>

      {showParser ? (
        <div className="space-y-4 animate-sota-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-indigo shadow-[0_0_8px_var(--accent-indigo)]" />
            <p className="text-[0.65rem] font-black text-text-muted uppercase tracking-[0.2em] m-0">
              {LABELS.hhParser}
            </p>
          </div>
          <textarea
            value={handText}
            onChange={(e) => setHandText(e.target.value)}
            placeholder="Cole aqui o Hand History do PokerStars, Winamax ou 888poker..."
            className="w-full h-48 bg-black/40 border border-white/10 rounded-2xl p-5 text-[0.75rem] font-mono text-text-light placeholder:text-text-darker focus:outline-none focus:border-accent-indigo focus:ring-1 focus:ring-accent-indigo/30 transition-all shadow-inner resize-none scrollbar-hide"
          />
          {parserError && (
            <div className="p-4 bg-accent-danger/10 border border-accent-danger/20 rounded-xl text-accent-danger text-xs font-medium">
              {parserError}
            </div>
          )}
          <button
            type="button"
            onClick={parseHand}
            className="w-full py-4 rounded-2xl bg-accent-indigo text-white text-[0.75rem] font-black uppercase tracking-widest hover:bg-indigo-500 shadow-lg shadow-accent-indigo/20 transition-all active:scale-[0.98]"
          >
            {LABELS.processStacks}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div className="flex justify-between items-center px-1">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-text-darker" />
                <p className="text-[0.65rem] font-black text-text-muted uppercase tracking-[0.2em] m-0">
                  {LABELS.playerStacks}
                </p>
              </div>
              <button
                type="button"
                onClick={addPlayer}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-accent-emerald text-[0.6rem] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all flex items-center gap-1.5"
              >
                <i className="fa-solid fa-plus text-[0.5rem]" /> Jogador
              </button>
            </div>
            <div className="space-y-2 max-h-100 overflow-y-auto pr-2 scrollbar-hide">
              {players.map((p) => (
                <div
                  key={p.id}
                  className={`group flex items-center gap-3 p-3 rounded-2xl border transition-all ${heroId === p.id ? 'bg-accent-indigo/10 border-accent-indigo/30 shadow-[0_0_20px_rgba(99,102,241,0.1)]' : 'bg-black/40 border-white/5 hover:border-white/10'}`}
                >
                  <button
                    type="button"
                    onClick={() => setHeroId(p.id)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-[0.6rem] font-black uppercase tracking-tighter border transition-all ${heroId === p.id ? 'bg-accent-indigo text-white border-accent-indigo' : 'bg-black/60 text-text-darker border-white/5 hover:text-text-muted'}`}
                  >
                    {heroId === p.id ? 'HERO' : 'VILL'}
                  </button>
                  <input
                    type="text"
                    aria-label="Nome do Jogador"
                    title="Nome do Jogador"
                    placeholder="Nome"
                    value={p.name}
                    onChange={(e) => updateName(p.id, e.target.value)}
                    className="flex-1 bg-transparent border-none text-[0.75rem] font-bold text-text-light focus:outline-none focus:ring-0"
                  />
                  <div className="flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-xl border border-white/5 shadow-inner">
                    <input
                      type="number"
                      aria-label="Stack do Jogador"
                      title="Stack do Jogador"
                      placeholder="Stack"
                      value={p.stack}
                      onChange={(e) => updateStack(p.id, Number.parseFloat(e.target.value) || 0)}
                      className="w-16 bg-transparent border-none text-[0.75rem] font-mono font-black text-right text-white focus:outline-none focus:ring-0"
                    />
                    <span className="text-[0.6rem] text-text-darker font-black uppercase">BB</span>
                  </div>
                  {players.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removePlayer(p.id)}
                      aria-label="Remover Jogador"
                      title="Remover Jogador"
                      className="w-8 h-8 rounded-lg bg-white/0 text-text-darker hover:bg-accent-danger/10 hover:text-accent-danger transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center"
                    >
                      <i className="fa-solid fa-trash-can text-xs" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center px-1">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-text-darker" />
                <p className="text-[0.65rem] font-black text-text-muted uppercase tracking-[0.2em] m-0">
                  {LABELS.payoutStructure}
                </p>
              </div>
              <button
                type="button"
                onClick={addPrize}
                className="px-3 py-1.5 rounded-lg bg-accent-amber/10 border border-accent-amber/20 text-accent-amber text-[0.6rem] font-black uppercase tracking-widest hover:bg-accent-amber/20 transition-all flex items-center gap-1.5"
              >
                <i className="fa-solid fa-plus text-[0.5rem]" /> Posição
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-100 overflow-y-auto pr-2 scrollbar-hide">
              {prizes.map((val, i) => (
                <div
                  key={`prize-pos-${i}` /* NOSONAR */}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-black/40 border border-white/5 group"
                >
                  <span className="w-6 text-[0.65rem] font-black text-text-darker">{i + 1}º</span>
                  <input
                    type="number"
                    aria-label="Premiação"
                    title="Premiação"
                    placeholder="0"
                    value={val}
                    onChange={(e) => updatePrize(i, Number.parseFloat(e.target.value) || 0)}
                    className="flex-1 bg-black/60 border border-white/5 rounded-lg px-3 py-1.5 text-[0.75rem] font-mono font-black text-right text-accent-emerald focus:outline-none focus:border-accent-emerald shadow-inner"
                  />
                  {i === prizes.length - 1 && prizes.length > 1 && (
                    <button
                      type="button"
                      onClick={removePrize}
                      aria-label="Remover Prêmio"
                      title="Remover Prêmio"
                      className="w-8 h-8 rounded-lg text-text-darker hover:text-accent-danger transition-colors flex items-center justify-center"
                    >
                      <i className="fa-solid fa-circle-minus text-xs" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div
              className={`mt-4 p-4 rounded-2xl border flex justify-between items-center font-mono tabular-nums ${totalPrizes === 100 ? 'bg-accent-emerald/5 border-accent-emerald/20 text-accent-emerald' : 'bg-accent-amber/5 border-accent-amber/20 text-accent-amber'}`}
            >
              <span className="text-[0.6rem] font-black uppercase tracking-widest">
                {LABELS.totalSum}
              </span>
              <span className="text-[0.8rem] font-black">{totalPrizes.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      )}

      <div className="pt-10 border-t border-white/5 flex flex-col gap-8">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 p-6 bg-black/40 border border-white/5 rounded-3xl shadow-inner space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[0.6rem] font-black text-text-muted uppercase tracking-widest">
                {LABELS.equitySummary}
              </span>
              {isCalculatingICM && (
                <div className="w-2 h-2 rounded-full bg-accent-indigo animate-ping" />
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-black/60 p-4 rounded-2xl border border-white/5 flex flex-col gap-1">
                <span className="text-[0.5rem] text-text-darker uppercase font-black tracking-widest">
                  {LABELS.bubbleFactorVar}
                </span>
                <div
                  className={`text-xl font-black font-mono tracking-tighter tabular-nums ${bfRangeColor}`}
                >
                  {bfRange}
                </div>
              </div>
              <div className="bg-black/60 p-4 rounded-2xl border border-white/5 flex flex-col gap-1">
                <span className="text-[0.5rem] text-text-darker uppercase font-black tracking-widest">
                  {LABELS.survivalUrgency}
                </span>
                <div className="text-xl font-black font-mono tracking-tighter text-white tabular-nums">
                  {LABELS.high}
                </div>
              </div>
            </div>
          </div>

          {icmInsight && (
            <div className="flex-1 p-6 bg-accent-indigo/5 border border-accent-indigo/10 rounded-3xl flex items-start gap-4">
              <i className="fa-solid fa-lightbulb text-accent-indigo-light text-lg mt-1" />
              <p className="text-[0.7rem] text-text-muted leading-relaxed m-0 font-medium">
                <strong className="text-white uppercase tracking-widest text-[0.6rem] block mb-2">
                  {LABELS.icmInsight}
                </strong>
                {icmInsight}
              </p>
            </div>
          )}
        </div>

        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-4 py-4 text-left text-[0.6rem] font-black text-text-dim uppercase tracking-widest">
                  {LABELS.player}
                </th>
                <th className="px-4 py-4 text-right text-[0.6rem] font-black text-text-dim uppercase tracking-widest w-24">
                  {LABELS.stackBb}
                </th>
                <th className="px-4 py-4 text-right text-[0.6rem] font-black text-text-dim uppercase tracking-widest w-24">
                  {LABELS.propPct}
                </th>
                <th className="px-4 py-4 text-right text-[0.6rem] font-black text-text-dim uppercase tracking-widest w-24">
                  {LABELS.icmEqPct}
                </th>
                <th className="px-4 py-4 text-right text-[0.6rem] font-black text-text-dim uppercase tracking-widest w-24">
                  {LABELS.delta}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {results.map((r) => {
                const player = players.find((p) => p.id === r.id);
                const chipPct = player ? (player.stack / totalChips) * 100 : 0;
                const delta = r.equityPercent - chipPct;
                return (
                  <tr
                    key={r.id}
                    className={`group transition-colors ${heroId === r.id ? 'bg-accent-indigo/5' : 'hover:bg-white/5'}`}
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${heroId === r.id ? 'bg-accent-indigo' : 'bg-text-darker'}`}
                        />
                        <span className="text-[0.75rem] font-bold text-text-light">{r.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right font-mono text-[0.75rem] text-text-dim tabular-nums">
                      {player?.stack.toFixed(1)}
                    </td>
                    <td className="px-4 py-4 text-right font-mono text-[0.75rem] text-text-darker tabular-nums">
                      {chipPct.toFixed(1)}%
                    </td>
                    <td className="px-4 py-4 text-right font-mono text-[0.8rem] font-black text-white tabular-nums">
                      <AnimatedNumber value={r.equityPercent} decimals={2} />%
                    </td>
                    <td
                      className={`px-4 py-4 text-right font-mono text-[0.75rem] font-black tabular-nums ${delta >= 0 ? 'text-accent-emerald' : 'text-accent-danger'}`}
                    >
                      {delta >= 0 ? '+' : ''}
                      {delta.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-2">
          <MonteCarloConvergenceWidget />
        </div>

        <div className="mt-2">
          <DynamicFoldEquityWidget />
        </div>

        <div className="mt-2">
          <GeminiVoicePlayer
            title="Narrador de Insights ICM SOTA (Voz Neural PT-BR)"
            defaultText={
              icmInsight ||
              'Aproximação Malmuth-Harville calculada com sucesso sob governança de Raphael Vitoi.'
            }
          />
        </div>

        <div
          className={`mt-4 transition-[opacity,filter,transform] duration-300 ${isCalculatingICM ? 'opacity-50 blur-[1px] scale-[0.99]' : 'opacity-100 blur-none scale-100'}`}
        >
          <InsolvencyRioPanel
            insolvency={insolvency}
            isCalculating={safeWasmContext?.isCalculatingInsolvency ?? false}
          />
        </div>
      </div>
    </div>
  );
}
