'use client';

import { useMemo, useRef, useState } from 'react';
import { applyHRCStructure, parseHRCStructures, type HRCStructureSource } from '@/lib/hrcStructure';
import { downloadHRCJson } from '@/lib/hrcExport';
import { defaultTournamentPayouts } from '@/lib/tournamentConditions';
import { extractHrcSettings } from '@/lib/hrcArchive';
import { completeField, fieldSetup, materializeHrcField } from '@/lib/fieldCompletion';
import { normalizeTournamentPlayers, parseTournamentSnapshot, selectAnalysisTable, TABLE_CAPACITY,
  type PokerRoom, type TableSelection, type TournamentSnapshot, type TournamentPlayer } from '@/lib/tournamentContext';

export interface AppliedTournamentContext {
  snapshot: TournamentSnapshot;
  population: TournamentPlayer[];
  selection: TableSelection;
  bigBlind: number | null;
  prizes: number[];
}
const fieldClass = 'w-full rounded-lg border border-white/20 bg-bg-panel p-3 text-text-light';

export default function TournamentTableImport({ onApply, initialContext, defaultRoom, mode = 'hh' }: Readonly<{ mode?: 'hh' | 'hrc'; defaultRoom?: PokerRoom; onApply: (context: AppliedTournamentContext) => void; initialContext?: AppliedTournamentContext | null }>) {
  const [structures, setStructures] = useState<HRCStructureSource[]>(initialContext?.snapshot.structureSource ? [initialContext.snapshot.structureSource] : []);
  const [structure, setStructure] = useState<HRCStructureSource | null>(initialContext?.snapshot.structureSource ?? null);
  const [structureRaw, setStructureRaw] = useState(initialContext?.snapshot.structureSource?.rawInput ?? '');
  const structureRevision = useRef(0);
  const [raw, setRaw] = useState(initialContext?.snapshot.rawInput ?? '');
  const [snapshot, setSnapshot] = useState<TournamentSnapshot | null>(initialContext?.snapshot ?? null);
  const [room, setRoom] = useState<PokerRoom | ''>(initialContext?.selection.room ?? '');
  const [bigBlind, setBigBlind] = useState(initialContext?.bigBlind?.toString() ?? '');
  const [payouts, setPayouts] = useState(initialContext?.prizes.join(', ') ?? '');
  const [selected, setSelected] = useState<string[]>(initialContext?.selection.playerIds ?? []);
  const [participants, setParticipants] = useState<string[]>(initialContext?.selection.participantIds ?? []);
  const [table, setTable] = useState('');
  const [search, setSearch] = useState('');
  const [remainingInput, setRemainingInput] = useState('');
  const inputRevision = useRef(0);
  const [error, setError] = useState<string | null>(null);
  const tables = useMemo(() => [...new Set(snapshot?.players.flatMap(p => p.tableId ? [p.tableId] : []) ?? [])], [snapshot]);
  const visible = useMemo(() => snapshot?.players.filter(p =>
    (!table || p.tableId === table) && (!search || (p.name + ' ' + p.id).toLowerCase().includes(search.toLowerCase()))
  ) ?? [], [snapshot, table, search]);
  const inference = useMemo(() => {
    if (!snapshot?.declaredTotalChips || !snapshot.fullPrizes) return null;
    try {
      const ids = snapshot.fieldModel?.method === 'table-empirical-quantiles-v1' ? snapshot.fieldModel.estimatedPlayerIds : [];
      const base = { ...snapshot, players: snapshot.players.filter(p => !ids.includes(p.id)) };
      const setup = fieldSetup(base, selected, Number(bigBlind) || undefined);
      return setup.outside.length ? null : { base, setup };
    } catch { return null; }
  }, [snapshot, selected, bigBlind]);

  function generateField() {
    if (!inference) return;
    try {
      const next = completeField(inference.base, selected, Number(remainingInput || inference.setup.suggestedCount), remainingInput ? 'user' : 'table-mean-estimate', Number(bigBlind) || undefined);
      setSnapshot(next); setPayouts(next.prizes!.join(', ')); setError(null);
    } catch (err) { setError(err instanceof Error ? err.message : 'Não foi possível gerar o field.'); }
  }

  function readInput(text = raw) {
    try {
      setSnapshot(null);
      setRemainingInput('');
      if (text.length > 5 * 1024 * 1024) throw new Error('Use um arquivo de configuração ou uma HH de até 5 MB.');
      const hand = parseTournamentSnapshot(text);
      const parsed = structure ? applyHRCStructure(hand, structure) : hand;
      const defaults = parsed.prizes === undefined;
      const prepared = defaults ? { ...parsed, prizes: defaultTournamentPayouts(parsed.players.length), payoutUnit: 'percent-remaining-pool' as const } : parsed;
      setSnapshot(prepared); setRoom(parsed.room ?? defaultRoom ?? '');
      setBigBlind(parsed.bigBlind?.toString() ?? ''); setPayouts(prepared.prizes?.join(', ') ?? '');
      setSelected(parsed.suggestedPlayerIds ?? []); setParticipants([]); setTable(''); setError(null);
    } catch (err) { setError(err instanceof Error ? err.message : 'Input inválido.'); }
  }

  function receiveText(text: string) {
    inputRevision.current++;
    if (text.trimStart().startsWith('{')) {
      try { const value: unknown = JSON.parse(text);
        if (value && typeof value === 'object' && ('structures' in value || 'folders' in value)) { readStructure(text); return; }
      } catch { /* The hand input reports malformed JSON below. */ }
    }
    setRaw(text); setSnapshot(null); setError(null);
    if (text.trim()) readInput(text);
  }

  function receiveFile(file?: File) {
    if (!file) return;
    const revision = ++inputRevision.current;
    setError(null); setSnapshot(null);
    const archive = /\.(?:hrcz|hrcv)$/i.test(file.name);
    if (!/\.(?:json|txt|hh|hrcz|hrcv)$/i.test(file.name) || file.size > (archive ? 256 : 5) * 1024 * 1024) {
      setError('Escolha HH/JSON de até 5 MB ou cenário .hrcz/.hrcv de até 256 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (revision !== inputRevision.current) return;
      try {
        const text = archive && reader.result instanceof ArrayBuffer ? extractHrcSettings(new Uint8Array(reader.result)) : reader.result;
        if (typeof text === 'string') receiveText(text.replace(/^\uFEFF/, ''));
      } catch (err) { setError(err instanceof Error ? err.message : 'Cenário HRC inválido.'); }
    };
    reader.onerror = () => { if (revision === inputRevision.current) setError('Não foi possível ler o arquivo.'); };
    if (archive) reader.readAsArrayBuffer(file); else reader.readAsText(file);
  }

  function chooseStructure(next: HRCStructureSource) {
    setRemainingInput('');
    setStructure(next);
    if (snapshot) {
      const combined = applyHRCStructure(snapshot, next);
      setSnapshot(combined); setPayouts(combined.prizes!.join(', '));
    }
    setError(null);
  }

  function readStructure(text: string) {
    try {
      const items = parseHRCStructures(text);
      setStructures(items); setStructureRaw(text);
      if (items.length === 1) chooseStructure(items[0]!);
      else setStructure(null);
      setError(null);
    } catch (err) { setError(err instanceof Error ? err.message : 'Estrutura inválida.'); }
  }

  function receiveStructureFile(file?: File) {
    if (!file) return;
    const revision = ++structureRevision.current;
    if (file.size > 5 * 1024 * 1024 || !/\.json$/i.test(file.name)) {
      setError('Escolha uma coleção de estruturas JSON de até 5 MB.'); return;
    }
    const reader = new FileReader();
    reader.onload = () => { if (revision === structureRevision.current && typeof reader.result === 'string') readStructure(reader.result.replace(/^\uFEFF/, '')); };
    reader.onerror = () => { if (revision === structureRevision.current) setError('Não foi possível ler a estrutura.'); };
    reader.readAsText(file);
  }

  function apply() {
    try {
      if (structures.length > 1 && !structure) throw new Error('Selecione a estrutura do torneio na coleção.');
      if (!snapshot || !room) throw new Error('Leia o input e selecione a sala.');
      if (snapshot.fieldModel?.method === 'table-empirical-quantiles-v1' && remainingInput && Number(remainingInput) !== snapshot.remainingPlayers) throw new Error('Gere novamente o field para aplicar a nova contagem.');
      const selection = { room, playerIds: selected, participantIds: participants };
      selectAnalysisTable(snapshot.players, selection);
      const prizes = payouts.trim() ? payouts.split(/[,;\s]+/).map(Number) : [];
      if (!prizes.length || prizes.length > snapshot.players.length || prizes.some(p => !Number.isFinite(p) || p < 0) ||
        prizes.some((p, i) => i > 0 && p > prizes[i - 1]!)) {
        throw new Error('Informe payouts restantes em ordem decrescente, separados por vírgula; use ponto para decimais.');
      }
      const blind = snapshot.stackUnit === 'chips' || structure ? Number(bigBlind) : null;
      if (blind !== null && (!Number.isFinite(blind) || blind <= 0)) throw new Error('Informe o big blind em fichas para reconciliar a estrutura com os stacks.');
      const population = normalizeTournamentPlayers(snapshot, blind ?? undefined);
      onApply({ snapshot, population, selection, bigBlind: blind, prizes });
    } catch (err) { setError(err instanceof Error ? err.message : 'Não foi possível selecionar a mesa.'); }
  }

  function toggleSeat(id: string) {
    setSelected(previous => previous.includes(id) ? previous.filter(item => item !== id) : [...previous, id]);
    setParticipants(previous => previous.filter(item => item !== id));
  }

  return <section aria-label="Importar torneio e selecionar mesa" className="space-y-4 rounded-2xl border border-white/15 p-4 text-sm text-text-light">
    <h4 className="text-lg font-bold">{mode === 'hrc' ? 'Importar cenário HRC' : 'Importar Hand History'}</h4>
    <p>MTT · No-Limit Texas Hold’em. Importe um snapshot dos jogadores restantes do torneio em JSON ou uma única Hand History. A equidade usa todos os stacks recebidos; a mesa analisada será selecionada abaixo.</p>
    <label className="block">Carregar HH ou configuração HRC
      <input aria-label="Carregar HH ou configuração HRC" type="file" accept=".txt,.hh,.json,.hrcz,.hrcv,text/plain,application/json" className={fieldClass}
        onChange={event => { receiveFile(event.target.files?.[0]); event.target.value = ''; }} />
    </label>
    <p>Cole uma HH em inglês do PokerStars/GGPoker ou abra um arquivo. Para HRC, escolha .hrcz/.hrcv ou JSON (Hand Config). A configuração da árvore, stacks, blinds e payouts são lidos do settings.json; estratégias e EVs armazenados nos binários do solver não são executados nesta bancada. Coleções de estruturas podem complementar a HH. Revise os defaults quando faltarem payouts.</p>
    <fieldset className="space-y-3 rounded-lg border border-white/20 p-3">
      <legend>Estrutura do torneio — HRC / fornecedor externo</legend>
      <label className="block">Carregar estrutura JSON
        <input aria-label="Carregar estrutura JSON" type="file" accept=".json,application/json" className={fieldClass}
          onChange={event => { void receiveStructureFile(event.target.files?.[0]); event.target.value = ''; }} />
      </label>
      <details><summary>Colar JSON de estrutura</summary>
        <textarea aria-label="JSON de estrutura" className={fieldClass} value={structureRaw}
          onChange={event => { structureRevision.current++; setStructureRaw(event.target.value); if (event.target.value.trim()) readStructure(event.target.value); }} />
      </details>
      {structures.length > 1 && <label>Selecionar estrutura
        <select aria-label="Selecionar estrutura" className={fieldClass} value={structure?.path ?? ''}
          onChange={event => { const item = structures.find(s => s.path === event.target.value); if (item) chooseStructure(item); }}>
          <option value="" disabled>Escolha o torneio</option>
          {structures.map(item => <option key={item.path} value={item.path}>{item.name} · {item.path}</option>)}
        </select>
      </label>}
      {structure && <>
        <p role="status">{structure.name} · {structure.chips.toLocaleString('pt-BR')} fichas · {structure.fullPrizes.length} posições pagas · pool por colocação {structure.fullPrizes.reduce((sum, value) => sum + value, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.</p>
        <p>A estrutura preenche fichas e premiação; a HH fornece mesa, stacks e blinds. Field inicial e jogadores restantes continuam dependendo dos inputs. Confira se os arquivos são do mesmo torneio e complete os stacks externos para reconciliar as fichas.</p>
        {structure.bountyType && <p>Formato de bounty: {structure.bountyType} · fator progressivo: {structure.progressiveFactor ?? 'não informado'}. Estes metadados são preservados. A equidade desta bancada considera apenas os prêmios por colocação; bounties por jogador e sua equidade ainda não são calculados.</p>}
        {!snapshot && <p>Estrutura carregada. Importe a HH ou o snapshot de stacks para selecionar a mesa.</p>}
        <button type="button" className={fieldClass} onClick={() => downloadHRCJson(structure.rawInput, 'hrc-structures-original.json')}>Exportar coleção de estruturas original</button>
      </>}
    </fieldset>
    <details>
      <summary className="cursor-pointer">Formato JSON de entrada</summary>
      <p>Use stackUnit: bb ou chips; neste último caso, informe bigBlind. Cada jogador precisa de id, name e stack. tableId e seat preservam a mesa e o assento quando conhecidos. prizes contém os payouts restantes, todos na mesma unidade. totalEntries informa o field total; remainingPlayers declara quantos jogadores restam e deve corresponder aos stacks recebidos.</p>
      <pre className="overflow-x-auto whitespace-pre-wrap text-xs">{'{"room":"PokerStars","stackUnit":"bb","players":[{"id":"a","name":"A","stack":40,"tableId":"FT","seat":1},{"id":"b","name":"B","stack":60,"tableId":"FT","seat":2}],"prizes":[65,35]}'}</pre>
      <p>Exemplo sintético. Este formato não representa um export nativo de solver.</p>
    </details>
    <label className="block">Input original
      <textarea aria-label="Input original" className={fieldClass + ' min-h-36 font-mono text-xs'} value={raw}
        onChange={event => receiveText(event.target.value)} />
    </label>
    <button type="button" className={fieldClass} onClick={() => readInput()}>Ler contexto do torneio</button>
    {snapshot && <>
      <p role="status">MTT NLHE · field total: {snapshot.totalEntries ?? 'não informado'} · {snapshot.players.length} stacks preservados. {selected.length} na mesa; {participants.length} participantes da mão.</p>
      {snapshot.sourceFormat === 'hand-history' && <p>HH reconhecida: {snapshot.room ?? 'sala não identificada'} · mesa {snapshot.players[0]?.tableId ?? 'não informada'} · SB {snapshot.smallBlind ?? 'não informado'} / BB {snapshot.bigBlind ?? 'não informado'} · ante {snapshot.ante ?? 'não informado'} · botão {snapshot.buttonSeat ?? 'não informado'}. Stacks são os do início da mão; payouts ausentes recebem defaults editáveis.</p>}
      {snapshot.sourceFormat === 'hrc-hand-config' && <p>Configuração HRC reconhecida: stacks, blinds, ante e payouts preenchidos. Configuração da árvore {snapshot.hrcConfig?.['treeconfig'] ? 'preservada para reexportação' : 'não informada no arquivo'}. A mesa veio selecionada; confirme a sala. Estratégias e EVs do solver não são importados como resultados desta bancada.</p>}
      {snapshot.sourceFormat === 'hrc-hand-config' && !snapshot.fieldModel && snapshot.players.some(p => !Number.isInteger(p.stack)) && <div className="space-y-2 rounded border border-amber-500/40 p-3">
        <p>Este cenário contém stacks fracionários modelados. A contagem já vem do arquivo: {snapshot.players.length} restantes. É possível materializar os stacks externos em fichas inteiras mantendo o total, a mesa e os valores originais no registro.</p>
        <button type="button" className={fieldClass} onClick={() => { try { setSnapshot(materializeHrcField(snapshot)); setError(null); } catch (err) { setError(err instanceof Error ? err.message : 'Distribuição incompatível.'); } }}>Usar distribuição HRC em fichas inteiras</button>
      </div>}
      {inference && <fieldset className="space-y-3 rounded border border-indigo-400/40 p-3">
        <legend>Completar field a partir da estrutura + HH</legend>
        <p>Mesa: {inference.setup.table.length} jogadores / {inference.setup.tableChips.toLocaleString('pt-BR')} fichas. Outras mesas: {inference.setup.externalChips.toLocaleString('pt-BR')} fichas disponíveis.</p>
        <label>Jogadores restantes (editável)<input aria-label="Jogadores restantes para estimar o field" type="number" min={selected.length} max="10000" step="1" className={fieldClass} value={remainingInput || inference.setup.suggestedCount} onChange={event => setRemainingInput(event.target.value)} /></label>
        <p>Sugestão: total de fichas dividido pela média da mesa, arredondado. Assume mesa representativa; informe a contagem do lobby quando disponível. A sugestão não é uma contagem observada nem tem margem de erro certificada.</p>
        <p>Distribuição externa: quantis dos stacks da mesa, ajustados ao saldo externo e convertidos em fichas inteiras com conservação exata. É uma hipótese editável de cenário, não uma reprodução do algoritmo proprietário do HRC.</p>
        <button type="button" className={fieldClass} onClick={generateField}>Gerar field estimado e preencher payouts</button>
      </fieldset>}
      {snapshot.fieldModel && <p role="status">Field modelado · {snapshot.fieldModel.remainingPlayers} restantes · {snapshot.fieldModel.estimatedPlayerIds.length} stacks externos derivados · origem da contagem: {snapshot.fieldModel.countOrigin}. Premissas acompanham o contexto exportado e o cálculo.</p>}
      {snapshot.declaredTotalChips !== undefined && <p>Total de fichas declarado no input: {snapshot.declaredTotalChips.toLocaleString('pt-BR')} fichas. Este total é do torneio; a HH pode conter apenas uma mesa.</p>}
      {snapshot.fullPrizes && <p>Resumo do torneio: {snapshot.totalEntries ?? 'field não informado'} entradas · {snapshot.paidPlaces} posições pagas · prize pool {snapshot.totalPrizePool?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}. Estrutura completa preservada; revise quantos jogadores restam nesta etapa.</p>}
      <p>{snapshot.remainingPlayers === undefined ? 'Revise a quantidade de jogadores restantes no contexto do MTT. Uma HH isolada contém apenas os stacks presentes naquela mesa.' : `${snapshot.remainingPlayers} jogadores restantes declarados; snapshot compatível com essa contagem.`}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <label>Sala
          <select aria-label="Sala da mesa" className={fieldClass} value={room} onChange={event => setRoom(event.target.value as PokerRoom | '')}>
            <option value="">Selecione a sala</option><option value="PokerStars">PokerStars — até 9p</option><option value="GGPoker">GGPoker — até 8p</option>
          </select>
        </label>
        {(snapshot.stackUnit === 'chips' || structure) && <label>Big blind em fichas
          <input aria-label="Big blind em fichas" type="number" min="0" className={fieldClass} value={bigBlind} onChange={event => setBigBlind(event.target.value)} />
        </label>}
        <label>Mesa registrada no input
          <select aria-label="Mesa registrada no input" className={fieldClass} value={table} onChange={event => {
            const id = event.target.value; setTable(id); setParticipants([]);
            setSelected(id ? snapshot.players.filter(p => p.tableId === id).map(p => p.id) : []);
          }}>
            <option value="">Selecionar assentos manualmente</option>{tables.map(id => <option key={id} value={id}>{id}</option>)}
          </select>
        </label>
        <label>Buscar jogador
          <input aria-label="Buscar jogador" className={fieldClass} value={search} onChange={event => setSearch(event.target.value)} />
        </label>
      </div>
      <div className="max-h-72 space-y-2 overflow-y-auto">
        {visible.map(player => <div key={player.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-white/10 p-2">
          <label className="min-w-0 flex-1"><input type="checkbox" checked={selected.includes(player.id)}
            disabled={!selected.includes(player.id) && !!room && selected.length >= TABLE_CAPACITY[room]}
            onChange={() => toggleSeat(player.id)} aria-label={`Mesa: ${player.name}`} />{' '}
            {player.name} — {player.stack} {snapshot.stackUnit}{player.tableId ? ` · mesa ${player.tableId}` : ''}{player.seat ? ` · assento ${player.seat}` : ''}
          </label>
          <label><input type="checkbox" checked={participants.includes(player.id)} disabled={!selected.includes(player.id)}
            aria-label={`Na mão: ${player.name}`} onChange={() => setParticipants(previous => previous.includes(player.id) ? previous.filter(id => id !== player.id) : [...previous, player.id])} /> Na mão</label>
        </div>)}
      </div>
      <label className="block">Payouts restantes de todo o torneio
        <textarea aria-label="Payouts restantes de todo o torneio" className={fieldClass} value={payouts} onChange={event => setPayouts(event.target.value)} />
      </label>
      <button type="button" className="rounded-xl bg-accent-indigo px-4 py-3 text-white" onClick={apply}>Analisar mesa com contexto completo</button>
    </>}
    {error && <p role="alert" className="text-accent-danger">{error}</p>}
  </section>;
}
