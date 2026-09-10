'use client';

/**
 * IDENTITY: Calculadora Malmuth-Harville de Equidade ICM v7.0 GOLD
 * PATH: src/components/simulator/panels/EquityCalculator.tsx
 * ROLE: Inputs manuais de stacks + payouts + hand parser -> cálculo ICM real.
 * BINDING: [lib/icmEngine.ts, lib/handParser.ts, components/simulator/hooks/*, components/simulator/ui/*]
 */

import { selectAnalysisTable, TABLE_CAPACITY, type PokerRoom } from '@/lib/tournamentContext';
import { defaultTournamentConditions, resolveTournamentPayouts, validateTournamentChipMass, type TournamentConditions } from '@/lib/tournamentConditions';
import TournamentConditionsPanel from './TournamentConditionsPanel';
import CounterfactualPanel from './CounterfactualPanel';
import IcmTransitionPanel from './IcmTransitionPanel';
import TournamentTableImport, { type AppliedTournamentContext } from './TournamentTableImport';
import { downloadHRCJson } from '@/lib/hrcExport';
import { generateHRCHandConfig } from '@/lib/hrcFormat';
import type { ICMPlayer } from '@/lib/icmEngine';
import { chipUnits, moneyUnits, tablePositions, validateChipLedger, validatePrizeLedger } from '@/lib/chipLedger';
import { use, useCallback, useMemo, useState } from 'react';
import { SotaWasmContext } from '../SotaContext';
import { useIcmCalculations } from '../hooks/useIcmCalculations';
import type { InsolvencyMetrics } from '../hooks/useQuantumEngine';
import { DynamicFoldEquityWidget } from '../ui/DynamicFoldEquityWidget';
import { GeminiVoicePlayer } from '../ui/GeminiVoicePlayer';
import { InsolvencyRioPanel } from '../ui/InsolvencyRioPanel';
import { MonteCarloConvergenceWidget } from '../ui/MonteCarloConvergenceWidget';

const PRESETS = [
  { label: 'FT MTT · HU', stacks: [50, 50], prizes: [65, 35] },
  { label: 'FT MTT · 3 restantes', stacks: [40, 35, 25], prizes: [50, 30, 20] },
  {
    label: 'FT MTT · 6 restantes',
    stacks: [30, 25, 20, 12, 8, 5],
    prizes: [35, 25, 18, 12, 7, 3],
  },
  { label: 'Toy MTT · bolha (4 restantes)', stacks: [45, 25, 18, 12], prizes: [50, 30, 20] },
];

export default function EquityCalculator() {
  const [chipPlayers, setChipPlayers] = useState<ICMPlayer[]>([
    { id: '1', name: 'Jogador 1', stack: 40000 },
    { id: '2', name: 'Jogador 2', stack: 55000 },
  ]);
  const [bigBlind, setBigBlind] = useState(1000);
  const [chipTotal, setChipTotal] = useState(95000);
  const [externalChips, setExternalChips] = useState<ICMPlayer[]>([]);
  const [seatOrder, setSeatOrder] = useState(['1', '2']);
  const [buttonId, setButtonId] = useState('1');
  const [showBb, setShowBb] = useState(false);
  const [showPercent, setShowPercent] = useState(false);
  const players = useMemo(() => chipPlayers.map(p => ({ ...p, stack: p.stack / bigBlind })), [chipPlayers, bigBlind]);
  const [prizes, setPrizes] = useState<number[]>([6500, 3500]);
  const [exportError, setExportError] = useState<string | null>(null);
  const [showParser, setShowParser] = useState(false);
  const [importMode, setImportMode] = useState<'hh' | 'hrc'>('hh');
  const [importedContext, setImportedContext] = useState<AppliedTournamentContext | null>(null);
  const [room, setRoom] = useState<PokerRoom>('PokerStars');
  const [manualParticipants, setManualParticipants] = useState<string[]>([]);
  const [conditions, setConditions] = useState<TournamentConditions>(() => ({ ...defaultTournamentConditions(2, 2), payoutUnit: 'absolute' }));
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
    subtitle: 'Equidade ICM da mesa com contexto de MTT',
    hhParser: 'Parser de Hand History',
    processStacks: 'Processar Estrutura de Stacks',
    playerStacks: 'Stacks dos Jogadores',
    payoutStructure: 'Payouts restantes do torneio',
    totalSum: 'Soma Total:',
    equitySummary: 'Resumo de Equidade',
    bubbleFactorVar: 'Razão ICM / proporcional',
    survivalUrgency: 'Coerência dos inputs',
    high: 'Válidos',
    icmInsight: 'ICM Insight SOTA',
    player: 'Jogador',
    stackBb: 'Stack (BB)',
    propPct: 'Prop. (%)',
    icmEqPct: 'ICM Eq (%)',
    delta: 'Delta (p.p.)',
  } as const;

  const population = useMemo(() => [...players, ...externalChips.map(p => ({ ...p, stack: p.stack / bigBlind }))], [players, externalChips, bigBlind]);
  const selection = useMemo(() => importedContext?.selection ?? { room, playerIds: players.map(p => p.id), participantIds: manualParticipants.filter(id => players.some(p => p.id === id)) }, [importedContext, room, players, manualParticipants]);
  const chipLedger = useMemo(() => ({ total: chipTotal, bigBlind, buttonId, seatOrder, fieldModel: importedContext?.snapshot.fieldModel,
    players: [...chipPlayers, ...externalChips].map(p => ({ id: p.id, chips: p.stack })) }), [chipTotal, bigBlind, buttonId, seatOrder, chipPlayers, externalChips, importedContext]);
  const positions = tablePositions(seatOrder, buttonId);
  const allocatedChips = chipLedger.players.reduce((sum, p) => sum + p.chips, 0);
  const allocatedPrizes = prizes.reduce((sum, value) => sum + value, 0);

  const inputError = useMemo(() => {
    try {
      validateChipLedger(chipLedger);
      validatePrizeLedger(conditions.totalPrizePool, conditions.remainingPrizePool, prizes);
      if (chipLedger.players.some(p => p.chips === 0)) throw new Error('Distribua fichas a cada jogador restante ou remova o assento zerado.');
      selectAnalysisTable(population, selection);
      resolveTournamentPayouts(conditions, population.length, prizes);
      validateTournamentChipMass(conditions, population.map(p => p.stack));
      return null;
    } catch (error) { return error instanceof Error ? error.message : 'Inputs incompatíveis.'; }
  }, [population, selection, conditions, prizes, chipLedger]);

  // SOTA v4.2: Orquestração de Cálculo Modularizada
  const { results, isWorkerCalculating, totalChips, metadata, error: calculationError } = useIcmCalculations({
    players: players,
    prizes: prizes,
    population: population,
    selection, conditions, inputError,
  });

  const isCalculatingICM = isWorkerCalculating;

  const handleExportHRC = useCallback(() => {
    if (inputError) return;
    try {
      const exportPlayers = population.map(p => ({ ...p, seat: selection.playerIds.includes(p.id) ? seatOrder.indexOf(p.id) + 1 : undefined }));
      const json = generateHRCHandConfig(exportPlayers, resolveTournamentPayouts(conditions, population.length, prizes), {
        selection, chipLedger, conditions: { ...conditions, declaredTotalChipsBb: chipTotal / bigBlind }, snapshot: {
          tournamentType: 'MTT', variant: 'NLHE', stackUnit: 'chips', players: chipPlayers, rawInput: '', sourceFormat: 'json',
          ...importedContext?.snapshot, buttonSeat: seatOrder.indexOf(buttonId) + 1,
        }, bigBlind,
      });
      downloadHRCJson(json, `pmev_hrc_hand_config_${players.length}p.json`);
      setExportError(null);
    } catch (error) { setExportError(error instanceof Error ? error.message : 'Não foi possível exportar.'); }
  }, [population, prizes, conditions, inputError, selection, importedContext, players.length, bigBlind, seatOrder, buttonId, chipTotal, chipPlayers, chipLedger]);

  const { bfRange, bfRangeColor } = useMemo(() => {
    if (results.length < 2 || totalChips === 0)
      return { bfRange: '-', bfRangeColor: 'text-text-darker' };
    const bfs = results.map((r) => {
      const chip = ((players.find((p) => p.id === r.id)?.stack ?? 0) / totalChips) * 100;
      return chip > 0 ? r.equityPercent / chip : null;
    }).filter((value): value is number => value !== null);
    if (!bfs.length) return { bfRange: '—', bfRangeColor: 'text-text-darker' };
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
      return 'Nesta seleção, as equidades ICM estão a menos de 0,5 ponto percentual da participação proporcional em fichas. Essa diferença não mede o risco de uma decisão.';
    }
    return `Diferença ICM menos participação em fichas, entre os jogadores selecionados: de ${maxLoss.delta.toFixed(1)} p.p. (${maxLoss.name}) a ${maxGain.delta.toFixed(1)} p.p. (${maxGain.name}). O denominador inclui todos os jogadores restantes.`;
  }, [results, players, totalChips]);

  const addPlayer = useCallback(() => {
    if (players.length >= TABLE_CAPACITY[room] || importedContext) return;
    setConditions(previous => ({ ...previous, remainingPlayers: previous.remainingPlayers + 1 }));
    const id = globalThis.crypto.randomUUID();
    setSeatOrder(previous => [...previous, id]);
    setChipPlayers((prev) => prev.length >= TABLE_CAPACITY[room] || importedContext ? prev : [
      ...prev,
      {
        id,
        name: `Jogador ${prev.length + 1}`,
        stack: 0,
      },
    ]);
  }, [room, importedContext, players.length]);

  const removePlayer = useCallback(
    (id: string) => {
      if (importedContext || chipPlayers.length <= 2 || chipPlayers.find(p => p.id === id)?.stack !== 0) return;
      setConditions(previous => ({ ...previous, remainingPlayers: previous.remainingPlayers - 1 }));
      setManualParticipants(previous => previous.filter(item => item !== id));
      setSeatOrder(previous => previous.filter(item => item !== id));
      if (buttonId === id) setButtonId(chipPlayers.find(p => p.id !== id)!.id);
      setChipPlayers((prev) => prev.filter((p) => p.id !== id));
      if (heroId === id) setHeroId(null);
    },
    [heroId, chipPlayers, buttonId, importedContext]
  );

  const updateStack = useCallback((id: string, stack: number) => {
    setChipPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, stack } : p)));
  }, []);

  const updateName = useCallback((id: string, name: string) => {
    setChipPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)));
  }, []);

  const updatePrize = useCallback((idx: number, value: number) => {
    setPrizes((prev) => prev.map((p, i) => (i === idx ? value : p)));
  }, []);

  const addPrize = useCallback(() => {
    setPrizes((prev) => [...prev, 0]);
  }, []);

  const removePrize = useCallback(() => {
    setPrizes((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }, []);

  const loadPreset = useCallback((preset: (typeof PRESETS)[0]) => {
    setImportedContext(null);
    setManualParticipants([]);
    const nextConditions = { ...defaultTournamentConditions(preset.stacks.length, preset.prizes.length), payoutUnit: 'absolute' as const };
    setConditions(nextConditions);
    setBigBlind(1000); setExternalChips([]); setChipTotal(preset.stacks.reduce((sum, value) => sum + value, 0) * 1000);
    setSeatOrder(preset.stacks.map((_, i) => String(i + 1))); setButtonId(preset.stacks.length === 2 ? '1' : String(preset.stacks.length - 2));
    setChipPlayers(
      preset.stacks.map((stack, i) => ({
        id: String(i + 1),
        name: `Jogador ${i + 1}`,
        stack: stack * 1000,
      }))
    );
    setPrizes(preset.prizes.map(value => value / 100 * nextConditions.remainingPrizePool));
    setHeroId('1');
  }, []);

  const applyTournament = useCallback((context: AppliedTournamentContext) => {
    const defaults = defaultTournamentConditions(context.population.length, context.prizes.length);
    const source = context.snapshot;
    const blind = chipUnits(context.bigBlind ?? source.bigBlind ?? 0);
    if (blind <= 0) throw new Error('Informe o big blind em fichas para preencher a bancada.');
    const rawPlayers = source.players.map(p => ({ ...p, stack: chipUnits(source.stackUnit === 'chips' ? p.stack : p.stack * blind) }));
    const table = rawPlayers.filter(p => context.selection.playerIds.includes(p.id));
    if (table.every(p => p.seat !== undefined)) table.sort((a, b) => a.seat! - b.seat!);
    const total = chipUnits(source.declaredTotalChips ?? rawPlayers.reduce((sum, p) => sum + p.stack, 0));
    const unit = source.payoutUnit ?? 'absolute';
    let paidPlaces = source.paidPlaces ?? defaults.paidPlaces;
    const poolDefault = context.population.length >= paidPlaces ? (source.totalPrizePool ?? defaults.totalPrizePool)
      : Math.min(defaults.remainingPrizePool, (source.totalPrizePool ?? defaults.totalPrizePool) / 10);
    const remainingPool = source.remainingPrizePool ?? (unit === 'absolute' ? context.prizes.reduce((sum, value) => sum + value, 0) : poolDefault);
    if (source.paidPlaces === undefined && source.totalPrizePool === remainingPool) paidPlaces = context.prizes.length;
    const nextPrizes = context.prizes.map(value => moneyUnits(unit === 'absolute' ? value : value / 100 * remainingPool) / 100);
    const nextConditions: TournamentConditions = {
      fieldSize: source.totalEntries ?? defaults.fieldSize,
      remainingPlayers: source.remainingPlayers ?? context.population.length,
      paidPlaces, remainingPrizePool: remainingPool, payoutUnit: 'absolute',
      totalPrizePool: source.totalPrizePool ?? (context.population.length >= paidPlaces ? remainingPool : Math.max(defaults.totalPrizePool, remainingPool)),
    };
    moneyUnits(nextConditions.totalPrizePool); moneyUnits(remainingPool);
    setImportedContext(context); setRoom(context.selection.room);
    setBigBlind(blind); setChipTotal(total); setChipPlayers(table);
    setExternalChips(rawPlayers.filter(p => !context.selection.playerIds.includes(p.id)));
    setSeatOrder(table.map(p => p.id));
    setButtonId(source.buttonSeat !== undefined ? (table.find(p => p.seat === source.buttonSeat)?.id ?? '') : source.sourceFormat === 'hrc-hand-config' ? table[table.length === 2 ? 0 : table.length - 3]!.id : '');
    setPrizes(nextPrizes); setConditions(nextConditions);
    setHeroId(source.heroId ?? null);
    setExportError(null);
    setShowParser(false);
  }, []);

  const exportContext = () => {
    if (inputError) return;
    downloadHRCJson(JSON.stringify({
      tournamentType: 'MTT', variant: 'NLHE', totalEntries: conditions.fieldSize, remainingPlayers: conditions.remainingPlayers, paidPlaces: conditions.paidPlaces,
      totalPrizePool: conditions.totalPrizePool, remainingPrizePool: conditions.remainingPrizePool, payoutUnit: conditions.payoutUnit,
      room, stackUnit: 'chips', bigBlind, declaredTotalChips: chipTotal, buttonSeat: seatOrder.indexOf(buttonId) + 1,
      players: [...chipPlayers.map(p => ({ ...p, seat: seatOrder.indexOf(p.id) + 1 })), ...externalChips], prizes,
      suggestedPlayerIds: selection.playerIds, heroId, chipLedger, fieldModel: importedContext?.snapshot.fieldModel,
      source: importedContext?.snapshot ?? { sourceFormat: 'manual' },
      analysis: { selection, metadata },
    }, null, 2), 'pmev-contexto-torneio.json');
  };

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
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => { setImportMode('hh'); setShowParser(true); }}
            aria-controls="tournament-import-panel"
            className={`px-4 py-2 rounded-xl text-[0.6rem] font-black uppercase tracking-widest transition-all border ${showParser ? 'bg-accent-indigo text-white border-accent-indigo shadow-lg' : 'bg-black/40 border-white/5 text-text-muted hover:bg-white/5 hover:text-white'}`}
          >
            <i className="fa-solid fa-code mr-1.5" /> Importar HH
          </button>
          <button type="button" aria-controls="tournament-import-panel" onClick={() => { setImportMode('hrc'); setShowParser(true); }}
            className="px-4 py-2 rounded-xl bg-accent-indigo/20 border border-accent-indigo/40 text-white text-[0.6rem] font-black uppercase tracking-widest">
            Importar cenário HRC
          </button>
          <button
            type="button"
            title="JSON Hand Config: stacks, blinds e payouts. Abra no HRC para revisar a árvore e iniciar um novo cálculo."
            onClick={handleExportHRC}
            disabled={inputError !== null}
            className="px-4 py-2 rounded-xl bg-black/40 border border-white/5 text-text-muted text-[0.6rem] font-black uppercase tracking-widest hover:bg-white/5 hover:text-white transition-all"
          >
            <i className="fa-solid fa-file-export mr-1.5" /> Export HRC
          </button>
        </div>
      </div>

      {showParser && <div id="tournament-import-panel" className="space-y-3">
        <button type="button" onClick={() => setShowParser(false)} className="rounded-lg border border-white/20 px-3 py-2 text-sm">Fechar importação</button>
        <TournamentTableImport mode={importMode} defaultRoom={room} onApply={applyTournament} initialContext={importedContext} />
      </div>}

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

      {exportError && <p role="alert" className="text-accent-danger">{exportError}</p>}
      <TournamentConditionsPanel value={conditions} onChange={setConditions} canonicalUnits />
      <fieldset className="space-y-3 rounded-xl border border-white/15 p-4 text-sm text-text-light">
        <legend>Fichas, posições e representação</legend>
        <p>Inputs em fichas inteiras e valores monetários. Os totais definem o cenário e não mudam ao editar stacks ou payouts. Alterá-los explicitamente configura outro cenário.</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <label>Total de fichas do torneio<input aria-label="Total de fichas do torneio" title="Montante de referência de todos os jogadores restantes, inclusive outras mesas. Não é recalculado pela edição dos stacks." type="number" min="1" step="1" value={Number.isNaN(chipTotal) ? '' : chipTotal} onChange={e => setChipTotal(e.target.value === '' ? NaN : Number(e.target.value))} className="w-full rounded bg-bg-panel p-2" /></label>
          <label>Big blind em fichas<input aria-label="Big blind em fichas" type="number" min="1" step="1" value={Number.isNaN(bigBlind) ? '' : bigBlind} onChange={e => setBigBlind(e.target.value === '' ? NaN : Number(e.target.value))} className="w-full rounded bg-bg-panel p-2" /></label>
          <label>Botão da mesa<select aria-label="Botão da mesa" value={buttonId} onChange={e => setButtonId(e.target.value)} className="w-full rounded bg-bg-panel p-2"><option value="">Informe o botão</option>{chipPlayers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
        </div>
        <label className="mr-4"><input type="checkbox" checked={showBb} onChange={e => setShowBb(e.target.checked)} /> Exibir BB</label>
        <label><input type="checkbox" checked={showPercent} onChange={e => setShowPercent(e.target.checked)} /> Exibir percentuais dos payouts</label>
        <p>Fichas distribuídas: {allocatedChips.toLocaleString('pt-BR')} / {chipTotal.toLocaleString('pt-BR')} · saldo a distribuir: {(chipTotal - allocatedChips).toLocaleString('pt-BR')}. Externas à mesa: {externalChips.reduce((sum, p) => sum + p.stack, 0).toLocaleString('pt-BR')}.</p>
        <p>Premiação já paga no cenário: {(conditions.totalPrizePool - conditions.remainingPrizePool).toFixed(2)} · restante a distribuir: {conditions.remainingPrizePool.toFixed(2)}. Use a mesma moeda em todos os campos; bounties ficam fora deste pool.</p>
      </fieldset>
      <p className="text-xs text-text-muted">Posições seguem a ordem circular dos assentos e o botão informado. HH preenche o botão quando disponível; HRC informa a ordem das posições. Presets têm botão sintético editável. Export HRC preserva a árvore original quando disponível; novos setups usam um molde push/fold editável no HRC.</p>
      <div className="space-y-3 rounded-xl border border-white/15 p-4 text-sm text-text-light">
        <label>Sala da bancada
          <select aria-label="Sala da bancada" value={room} disabled={importedContext !== null}
            onChange={event => setRoom(event.target.value as PokerRoom)} className="ml-3 rounded-lg bg-bg-panel p-2">
            <option value="PokerStars">PokerStars — até 9p</option><option value="GGPoker">GGPoker — até 8p</option>
          </select>
        </label>
        <p className="font-semibold">MTT · No-Limit Texas Hold’em · {importedContext ? 'snapshot importado' : 'toy game sintético de etapa final'}</p>
        <p>Field configurado: {conditions.fieldSize} entradas · restantes: {conditions.remainingPlayers} · stacks recebidos: {population.length} · assentos na mesa: {players.length}.</p>
        <p>{selection.participantIds.length ? `${selection.participantIds.length} participantes selecionados para a mão.` : 'Mão ainda não definida; exibindo o snapshot de equidade ICM.'}</p>

        {importedContext?.snapshot.declaredTotalChips !== undefined && <p>Fichas totais declaradas no arquivo: {importedContext.snapshot.declaredTotalChips.toLocaleString('pt-BR')} fichas. Soma dos stacks usados no cálculo: {totalChips.toLocaleString('pt-BR')} BB.</p>}
        <p>A equidade considera todos os stacks e payouts recebidos, incluindo jogadores fora da mesa. Percentuais referem-se ao prize pool restante informado; a mesa não é tratada como um torneio separado.</p>
        {importedContext?.snapshot.fieldModel && <p role="status">Field modelado: {importedContext.snapshot.fieldModel.estimatedPlayerIds.length} stacks externos estimados. Contagem {importedContext.snapshot.fieldModel.countOrigin === 'table-mean-estimate' ? 'estimada pela média da mesa' : importedContext.snapshot.fieldModel.countOrigin === 'imported-scenario' ? 'preservada do cenário HRC' : 'informada pelo usuário'}. O ICM é condicional a essa distribuição; não comprova os stacks reais das outras mesas.</p>}
        {importedContext?.snapshot.structureSource?.bountyType && <p>Estrutura {importedContext.snapshot.structureSource.name} · {importedContext.snapshot.structureSource.bountyType}. Equidade apenas da premiação por colocação; componente de bounty não calculado. A coleção original pode ser reexportada no painel de importação.</p>}
        {metadata && <p role="status">{metadata.method === 'malmuth-harville-exact' ? 'ICM exato' : `ICM aproximado · ${metadata.iterations.toLocaleString('pt-BR')} simulações · seed ${metadata.seed}`} · {metadata.populationSize} stacks avaliados</p>}
        {(inputError || calculationError) && <p role="alert" className="text-accent-danger">{inputError || calculationError}</p>}
        <button type="button" className="rounded-lg border border-white/20 px-3 py-2" disabled={inputError !== null} onClick={exportContext}>Exportar contexto e seleção</button>
        {importedContext && <p>Input original preservado no export de contexto. Para trocar assentos ou participantes, abra a importação. Presets iniciam uma nova bancada manual.</p>}
      </div>

      {!showParser && (
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
                disabled={importedContext !== null || players.length >= TABLE_CAPACITY[room]}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-accent-emerald text-[0.6rem] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all flex items-center gap-1.5"
              >
                <i className="fa-solid fa-plus text-[0.5rem]" /> Jogador
              </button>
            </div>
            <div className="space-y-2 max-h-100 overflow-y-auto pr-2 scrollbar-hide">
              {chipPlayers.map((p) => (
                <div
                  key={p.id}
                  className={`group flex flex-wrap sm:flex-nowrap items-center gap-2 p-3 rounded-2xl border transition-all ${heroId === p.id ? 'bg-accent-indigo/10 border-accent-indigo/30 shadow-[0_0_20px_rgba(99,102,241,0.1)]' : 'bg-black/40 border-white/5 hover:border-white/10'}`}
                >
                  <button
                    type="button"
                    onClick={() => setHeroId(p.id)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-[0.6rem] font-black uppercase tracking-tighter border transition-all ${heroId === p.id ? 'bg-accent-indigo text-white border-accent-indigo' : 'bg-black/60 text-text-darker border-white/5 hover:text-text-muted'}`}
                  >
                    {heroId === p.id ? 'HERO' : 'VILL'}
                  </button>
                  <span className="text-xs font-bold" title={`Assento na ordem circular: ${seatOrder.indexOf(p.id) + 1}`}>{positions[p.id] ?? 'Posição indefinida'}</span>
                  <input
                    type="text"
                    aria-label="Nome do Jogador"
                    title="Nome do Jogador"
                    placeholder="Nome"
                    value={p.name}
                    onChange={(e) => updateName(p.id, e.target.value)}
                    className="min-w-0 flex-1 bg-transparent border-none text-[0.75rem] font-bold text-text-light focus:outline-none focus:ring-0"
                  />
                  <div className="flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-xl border border-white/5 shadow-inner">
                    <input
                      type="number"
                      aria-label="Stack do Jogador"
                      title="Stack em fichas inteiras. Redistribua entre jogadores sem alterar o total do torneio."
                      min="0" step="1"
                      placeholder="Stack"
                      value={Number.isNaN(p.stack) ? '' : p.stack}
                      onChange={(e) => updateStack(p.id, e.target.value === '' ? NaN : Number(e.target.value))}
                      className="w-16 bg-transparent border-none text-[0.75rem] font-mono font-black text-right text-white focus:outline-none focus:ring-0"
                    />
                    <span className="text-[0.6rem] text-text-darker font-black uppercase">fichas</span>
                    {showBb && <span className="text-xs whitespace-nowrap">{(p.stack / bigBlind).toFixed(3)} BB</span>}
                  </div>
                  {!importedContext && <label className="text-xs text-text-light">
                    <input type="checkbox" aria-label={`Na mão: ${p.name}`} checked={manualParticipants.includes(p.id)}
                      onChange={() => setManualParticipants(previous => previous.includes(p.id) ? previous.filter(id => id !== p.id) : [...previous, p.id])} /> Na mão
                  </label>}
                  {!importedContext && players.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removePlayer(p.id)}
                      disabled={p.stack !== 0}
                      aria-label="Remover Jogador"
                      title="Redistribua todas as fichas deste jogador antes de remover o assento."
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-100 overflow-y-auto pr-2 scrollbar-hide">
              {prizes.map((val, i) => (
                <div
                  key={`prize-pos-${i}` /* NOSONAR */}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-black/40 border border-white/5 group"
                >
                  <span className="w-6 text-[0.65rem] font-black text-text-darker">{i + 1}º</span>
                  <input
                    type="number"
                    aria-label="Premiação"
                    title="Valor monetário por colocação, até dois decimais. A soma deve preservar o prize pool restante."
                    min="0" step="0.01"
                    placeholder="0"
                    value={Number.isNaN(val) ? '' : val}
                    onChange={(e) => updatePrize(i, e.target.value === '' ? NaN : Number(e.target.value))}
                    className="min-w-0 flex-1 bg-black/60 border border-white/5 rounded-lg px-3 py-1.5 text-[0.75rem] font-mono font-black text-right text-accent-emerald focus:outline-none focus:border-accent-emerald shadow-inner"
                  />
                  {showPercent && <span className="text-xs">{(val / conditions.remainingPrizePool * 100).toFixed(2)}%</span>}
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
              className={`mt-4 p-4 rounded-2xl border flex justify-between items-center font-mono tabular-nums ${Math.abs(allocatedPrizes - conditions.remainingPrizePool) < 1e-8 ? 'bg-accent-emerald/5 border-accent-emerald/20 text-accent-emerald' : 'bg-accent-amber/5 border-accent-amber/20 text-accent-amber'}`}
            >
              <span className="text-[0.6rem] font-black uppercase tracking-widest">
                {LABELS.totalSum}
              </span>
              <span className="text-[0.8rem] font-black">{allocatedPrizes.toFixed(2)} / {conditions.remainingPrizePool.toFixed(2)} · saldo {(conditions.remainingPrizePool - allocatedPrizes).toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      <CounterfactualPanel context={{ population, selection, conditions, prizes, chipLedger, heroId: heroId ?? '' }} inputError={inputError} />
      <IcmTransitionPanel context={{ population, selection, conditions, prizes, chipLedger, heroId: heroId ?? '' }} inputError={inputError} />

      {!inputError && !calculationError && <div className="pt-10 border-t border-white/5 flex flex-col gap-8">
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
                  {showBb ? LABELS.stackBb : 'Stack (fichas)'}
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
                      {showBb ? player?.stack.toFixed(3) : chipPlayers.find(p => p.id === r.id)?.stack.toLocaleString('pt-BR')}
                    </td>
                    <td className="px-4 py-4 text-right font-mono text-[0.75rem] text-text-darker tabular-nums">
                      {chipPct.toFixed(1)}%
                    </td>
                    <td className="px-4 py-4 text-right font-mono text-[0.8rem] font-black text-white tabular-nums">
                      {r.equityPercent.toFixed(2)}%
                    </td>
                    <td
                      className={`px-4 py-4 text-right font-mono text-[0.75rem] font-black tabular-nums ${delta >= 0 ? 'text-accent-emerald' : 'text-accent-danger'}`}
                    >
                      {delta >= 0 ? '+' : ''}
                      {delta.toFixed(1)} p.p.
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-2">
          <p className="mb-3 text-sm text-text-muted">Ferramentas auxiliares abaixo usam seus próprios inputs de ranges, pote e apostas; não representam a avaliação ICM do torneio acima.</p>
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
      </div>}
    </div>
  );
}
