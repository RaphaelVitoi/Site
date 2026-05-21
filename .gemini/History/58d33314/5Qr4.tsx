'use client';

/**
 * IDENTITY: Calculadora Malmuth-Harville de Equidade ICM
 * PATH: src/components/simulator/panels/EquityCalculator.tsx
 * ROLE: Inputs manuais de stacks + payouts + hand parser -> cálculo ICM real.
 * BINDING: [lib/icmEngine.ts, lib/handParser.ts, simulator.module.css]
 */

import { useCallback, useContext, useDeferredValue, useEffect, useId, useMemo, useRef, useState } from 'react';
import { parseHandHistory } from '../../../lib/handParser';
import { downloadHRCJson, generateHRCJson } from '../../../lib/hrcExport';
import type { ICMPlayer, ICMResult } from '../../../lib/icmEngine';
import { logger } from '../../../lib/logger';
import { SotaWasmContext } from '../SotaContext';
import AnimatedNumber from '../ui/AnimatedNumber';
import styles from './EquityCalculator.module.css';

function InsolvencyRioPanel ( { insolvency, isCalculating }: Readonly<{ insolvency: any, isCalculating: boolean; }> )
{
  if ( isCalculating ) return <div className="p-4 mt-6 rounded-xl border border-white/5 bg-bg-deep flex items-center justify-center text-xs font-bold text-text-darker uppercase tracking-widest animate-pulse shadow-inner">Calculando Termodinâmica WASM...</div>;
  if ( !insolvency ) return null;

  const winPct = ( insolvency.winRate * 100 ).toFixed( 1 );
  let riskLevel = "Controlado";
  let riskColor = "text-accent-emerald";

  if ( insolvency.riskIndex > 0.8 )
  {
    riskLevel = "Crítico";
    riskColor = "text-accent-danger";
  } else if ( insolvency.riskIndex > 0.4 )
  {
    riskLevel = "Moderado";
    riskColor = "text-accent-amber";
  }

  return (
    <div className="grid grid-cols-2 gap-4 p-4 mt-6 bg-bg-deep rounded-xl border border-white/5 shadow-xl">
      <div className="flex flex-col">
        <span className="text-[0.65rem] font-black text-text-muted uppercase tracking-wider mb-1">True Insolvency EV</span>
        <span className={ `text-xl font-bold font-mono ${ insolvency.trueInsolvencyEv < 0 ? 'text-accent-danger' : 'text-accent-emerald' }` }>
          { insolvency.trueInsolvencyEv > 0 ? '+' : '' }{ insolvency.trueInsolvencyEv.toFixed( 2 ) } bb
        </span>
        <span className="text-[0.65rem] text-text-darker mt-1 italic">Ajustado por Reverse Implied Odds</span>
      </div>

      <div className="flex flex-col border-l border-white/5 pl-4">
        <span className="text-[0.65rem] font-black text-text-muted uppercase tracking-wider mb-1">Índice de Risco (RIO)</span>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold font-mono text-text-bright">{ insolvency.riskIndex.toFixed( 2 ) }</span>
          <span className={ `text-[0.6rem] font-bold px-2 py-0.5 rounded-full bg-black/40 ${ riskColor }` }>
            { riskLevel }
          </span>
        </div>
        <span className="text-[0.65rem] text-text-darker mt-1 italic">Distorção Axioma Lipe Piv aplicada</span>
      </div>

      <div className="col-span-2 mt-2">
        <div className="flex justify-between text-[0.65rem] font-bold text-text-muted mb-1">
          <span>Sobrevivência (Monte Carlo WASM)</span>
          <span>Win: { winPct }%</span>
        </div>
        <div className="flex w-full h-1.5 rounded-full overflow-hidden opacity-80">
          <div style={{ width: `${ winPct }%` }} className="bg-accent-emerald" />
          <div style={{ width: `${ ( insolvency.tieRate * 100 ) }%` }} className="bg-text-darker" />
          <div style={{ width: `${ ( insolvency.loseRate * 100 ) }%` }} className="bg-accent-danger" />
        </div>
      </div>
    </div>
  );
}

// Presets de cenários rápidos
const PRESETS = [
  { label: 'HU (2p)', stacks: [ 50, 50 ], prizes: [ 65, 35 ] },
  { label: '3-Way', stacks: [ 40, 35, 25 ], prizes: [ 50, 30, 20 ] },
  { label: 'FT (6p)', stacks: [ 30, 25, 20, 12, 8, 5 ], prizes: [ 35, 25, 18, 12, 7, 3 ] },
  { label: 'Bolha (4p)', stacks: [ 45, 25, 18, 12 ], prizes: [ 50, 30, 20 ] },
];

export default function EquityCalculator ()
{
  const compId = useId();
  const rawId = useId();
  const compId = useMemo(() => rawId.replace(/:/g, ''), [rawId]);
  const [ players, setPlayers ] = useState<ICMPlayer[]>( [
    { id: '1', name: 'Jogador 1', stack: 40 },
    { id: '2', name: 'Jogador 2', stack: 55 },
  ] );
  const [ prizes, setPrizes ] = useState<number[]>( [ 65, 35 ] );
  const [ handText, setHandText ] = useState( '' );
  const [ showParser, setShowParser ] = useState( false );
  const [ parserError, setParserError ] = useState<string | null>( null );
  const [ heroId, setHeroId ] = useState<string | null>( '1' );
  const [ pkoValue, setPkoValue ] = useState( 0 );

  const wasmContext = useContext( SotaWasmContext );
  const insolvency = wasmContext?.insolvencyMatrixData as any;

  const deferredPlayers = useDeferredValue( players );
  const deferredPrizes = useDeferredValue( prizes );

  const [ results, setResults ] = useState<ICMResult[]>( [] );
  const [ isWorkerCalculating, setIsWorkerCalculating ] = useState( false );
  const icmWorkerRef = useRef<Worker | null>( null );
  const activeJobIdRef = useRef<string>( '' );
  const activePlayersRef = useRef<ICMPlayer[]>( [] );

  const isCalculatingICM = players !== deferredPlayers || prizes !== deferredPrizes || isWorkerCalculating;

  // SOTA: Instanciação Homeostática do WebWorker
  useEffect( () => {
    const worker = new Worker( new URL( '../workers/icm.worker.ts', import.meta.url ) );
    worker.onmessage = ( e: MessageEvent ) => {
      if ( e.data.id !== activeJobIdRef.current ) return; // Previne colisão de estado
      if ( e.data.error ) {
        console.error( '[EquityCalculator] ICM Worker error:', e.data.error );
        setIsWorkerCalculating( false );
        return;
      }
      if ( e.data.type === 'ICM_RESULT' ) {
        const f64Results = e.data.payload as Float64Array;
        const currentPlayers = activePlayersRef.current;
        const decodedResults: ICMResult[] = currentPlayers.map( ( p, i ) => ( {
          id: p.id,
          name: p.name,
          equity: f64Results[ i * 3 + 0 ],
          equityPercent: f64Results[ i * 3 + 1 ],
          winProb: f64Results[ i * 3 + 2 ]
        } ) );
        setResults( decodedResults );
        const totalEq = decodedResults.reduce( ( sum, r ) => sum + r.equityPercent, 0 );
        logger.metric( 'EquityCalculator', 'icm_total_equity', totalEq, { playerCount: currentPlayers.length } );
        setIsWorkerCalculating( false );
      }
    };
    icmWorkerRef.current = worker;
    return () => worker.terminate(); // Limpeza garante imunidade a Memory Leaks (React Strict Mode)
  }, [] );

  // Disparo Assíncrono O(1) Fricção Zero
  useEffect( () => {
    if ( !icmWorkerRef.current || deferredPlayers.length === 0 ) return;
    // SOTA: Degradação Graciosa (Fallback Matemático)
    const id = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).substring(2);
    activeJobIdRef.current = id;
    activePlayersRef.current = deferredPlayers;
    setIsWorkerCalculating( true );
    icmWorkerRef.current.postMessage( { id, players: deferredPlayers, prizes: deferredPrizes } );
  }, [ deferredPlayers, deferredPrizes ] );

  const totalChips = useMemo(
    () => players.reduce( ( sum, p ) => sum + p.stack, 0 ),
    [ players ]
  );

  const totalPrizes = useMemo(
    () => prizes.reduce( ( sum, p ) => sum + p, 0 ),
    [ prizes ]
  );

  // Exportar para HRC
  const handleExportHRC = useCallback( () =>
  {
    const json = generateHRCJson( players, prizes, pkoValue );
    downloadHRCJson( json, `vitoi_spot_${ players.length }p.json` );
  }, [ players, prizes, pkoValue ] );

  // Bubble Factor range: menor e maior BF entre jogadores
  const { bfRange, bfRangeColor } = useMemo( () =>
  {
    if ( results.length < 2 || totalChips === 0 ) return { bfRange: '-', bfRangeColor: 'var(--text-darker)' };
    const bfs = results.map( r =>
    {
      const chip = ( players.find( p => p.id === r.id )?.stack ?? 0 ) / totalChips * 100;
      return chip > 0 ? r.equityPercent / chip : 1;
    } );
    const min = Math.min( ...bfs );
    const max = Math.max( ...bfs );
    let color = 'var(--sim-color-emerald)';
    let color = 'text-accent-emerald';
    if ( max > 1.3 )
    {
      color = 'var(--sim-color-rose)';
      color = 'text-accent-rose';
    } else if ( max > 1.1 )
    {
      color = 'var(--sim-color-amber)';
      color = 'text-accent-amber';
    }
    return { bfRange: `${ min.toFixed( 2 ) }-${ max.toFixed( 2 ) }`, bfRangeColor: color };
  }, [ results, players, totalChips ] );

  // Insight: quem mais ganha/perde com ICM vs proporcional
  const icmInsight = useMemo( () =>
  {
    if ( results.length < 2 || totalChips === 0 ) return null;
    let maxGain = { name: '', delta: -Infinity };
    let maxLoss = { name: '', delta: Infinity };
    for ( const r of results )
    {
      const chip = ( players.find( p => p.id === r.id )?.stack ?? 0 ) / totalChips * 100;
      const delta = r.equityPercent - chip;
      if ( delta > maxGain.delta ) maxGain = { name: r.name, delta };
      if ( delta < maxLoss.delta ) maxLoss = { name: r.name, delta };
    }
    if ( Math.abs( maxGain.delta ) < 0.5 && Math.abs( maxLoss.delta ) < 0.5 )
    {
      return 'Equidade ICM próxima da proporcional — pressão ICM baixa neste spot.';
    }
    return `${ maxGain.name } ganha +${ maxGain.delta.toFixed( 1 ) }% com ICM vs proporcional. ${ maxLoss.name } perde ${ Math.abs( maxLoss.delta ).toFixed( 1 ) }%. Short stacks acumulam equity desproporcional ao risco.`;
  }, [ results, players, totalChips ] );

  // Adicionar jogador
  const addPlayer = useCallback( () =>
  {
    setPlayers( prev => [
      ...prev,
      { id: Date.now().toString() + Math.random().toString(36).substring(2), name: `Jogador ${ prev.length + 1 }`, stack: 20 },
    ] );
  }, [] );

  // Remover jogador
  const removePlayer = useCallback( ( id: string ) =>
  {
    setPlayers( prev => prev.filter( p => p.id !== id ) );
    if ( heroId === id ) setHeroId( null );
  }, [ heroId ] );

  // Atualizar stack
  const updateStack = useCallback( ( id: string, stack: number ) =>
  {
    setPlayers( prev => prev.map( p => p.id === id ? { ...p, stack } : p ) );
  }, [] );

  // Atualizar nome
  const updateName = useCallback( ( id: string, name: string ) =>
  {
    setPlayers( prev => prev.map( p => p.id === id ? { ...p, name } : p ) );
  }, [] );

  // Atualizar prêmio
  const updatePrize = useCallback( ( idx: number, value: number ) =>
  {
    setPrizes( prev => prev.map( ( p, i ) => i === idx ? value : p ) );
  }, [] );

  // Adicionar prêmio
  const addPrize = useCallback( () =>
  {
    setPrizes( prev => [ ...prev, 10 ] );
  }, [] );

  // Remover prêmio
  const removePrize = useCallback( () =>
  {
    setPrizes( prev => prev.length > 1 ? prev.slice( 0, -1 ) : prev );
  }, [] );

  // Carregar preset
  const loadPreset = useCallback( ( preset: typeof PRESETS[ 0 ] ) =>
  {
    setPlayers(
      preset.stacks.map( ( stack, i ) => ( {
        id: String( i + 1 ),
        name: `Jogador ${ i + 1 }`,
        stack,
      } ) )
    );
    setPrizes( [ ...preset.prizes ] );
    setHeroId( '1' );
  }, [] );

  // Parse hand history
  const parseHand = useCallback( () =>
  {
    setParserError( null );
    try
    {
      let parsed = parseHandHistory( handText );
      if ( parsed.length >= 2 )
      {
        // SOTA: Limita a captura estritamente à Mesa Final (máx 9 players).
        // Protege o motor Malmuth-Harville de colapso termodinâmico O(N!) caso o usuário cole um lobby dump.
        if ( parsed.length > 9 ) parsed = parsed.slice( 0, 9 );

        setPlayers( parsed );
        setShowParser( false );
        setHandText( '' );
        setHeroId( parsed[ 0 ].id );
      } else
      {
        setParserError( 'Não foi possível identificar pelo menos 2 jogadores. Verifique o formato (ex: "Seat 1: Nome (15000 in chips)").' );
      }
    } catch ( error: unknown )
    {
      console.error( '[EquityCalculator] Hand parser error:', error instanceof Error ? error.message : error );
      setParserError( 'Falha catastrófica ao decodificar a Hand History. Verifique se o texto contém lixo invisível ou formatação corrompida.' );
    }
  }, [ handText ] );

  return (
    <div className={ styles.calcPanel }>
      {/* Header */ }
      <div className={ styles.calcHeader }>
        <h3 className={ styles.calcTitle }>
          Calculadora Malmuth-Harville
        </h3>
        <div className={ styles.calcHeaderActions }>
          <button
            onClick={ handleExportHRC }
            className={ styles.calcBtnOutline }
            title="Exportar cenário para HRC JSON"
          >
            <i className="fa-solid fa-file-export mr-1" />
            <span>HRC</span>
          </button>
          <button
            onClick={ () => setShowParser( !showParser ) }
            className={ `${ styles.calcBtnOutline } ${ showParser ? styles.calcBtnOutlineActive : '' }` }
            title="Alternar Parser de Hand History"
            aria-label="Alternar Parser de Hand History"
          >
            <i className="fa-solid fa-paste mr-1" />
            <span>Parser</span>
          </button>
        </div>
      </div>

      {/* Hand history parser */ }
      { showParser && (
        <div className={ styles.calcParserContainer }>
          <p className={ styles.calcParserLabel }>
            Cole uma hand history (PokerStars / Hand2Note):
          </p>
          <textarea
            value={ handText }
            onChange={ ( e ) => setHandText( e.target.value ) }
            placeholder={ 'Seat 1: Jogador1 (15000 in chips)\nSeat 2: Jogador2 (25000 in chips)' }
            rows={ 4 }
            className={ styles.calcParserTextarea }
          />
          { parserError && (
            <div className={ styles.calcParserError }>
              <i className="fa-solid fa-triangle-exclamation mr-1.5" />
              { parserError }
            </div>
          ) }
          <button
            onClick={ parseHand }
            disabled={ !handText.trim() }
            className={ `${ styles.calcParserBtn } ${ handText.trim() ? styles.calcParserBtnActive : '' }` }
          >
            Decodificar
          </button>
        </div>
      ) }

      {/* Presets rápidos */ }
      <div className={ styles.calcPresetContainer }>
        { PRESETS.map( ( preset ) => (
          <button
            key={ preset.label }
            onClick={ () => loadPreset( preset ) }
            className={ styles.calcPresetBtn }
          >
            { preset.label }
          </button>
        ) ) }
      </div>

      {/* Grid: Stacks | Payouts */ }
      <div className={ styles.calcGrid2Col }>
        {/* Stacks */ }
        <div className={ styles.calcSection }>
          <h4 className={ styles.calcSectionTitle }>
            Stacks (bb)
          </h4>
          { players.map( ( p, idx ) => (
            <div key={ p.id } className={ styles.calcRow }>
              <button
                type="button"
                onClick={ () => setHeroId( p.id ) }
                className={`cursor-pointer text-[0.65rem] bg-transparent border-none p-0 transition-colors ${heroId === p.id ? 'text-accent-indigo' : 'text-text-muted'}`}
                title="Definir como Hero"
                aria-label="Definir como Hero"
              >
                <i className={ `fa-solid ${ heroId === p.id ? 'fa-circle-user' : 'fa-user' }` } />
              </button>
              <input
                id={ `calc-player-name-${ compId }-${ p.id }-${ idx }` }
                name={ `player-name-${ p.id }` }
                value={ p.name }
                onChange={ ( e ) => updateName( p.id, e.target.value ) }
                className={ styles.calcInputText }
                aria-label={`Nome do Jogador ${idx + 1}`}
                title={`Nome do Jogador ${idx + 1}`}
                placeholder="Nome do Jogador"
              />
              <input
                id={ `calc-player-stack-${ compId }-${ p.id }-${ idx }` }
                name={ `player-stack-${ p.id }` }
                type="number"
                value={ p.stack }
                onChange={ ( e ) => updateStack( p.id, Math.max( 0, Number.parseInt( e.target.value ) || 0 ) ) }
                className={ styles.calcInputNumber }
                aria-label={`Stack do Jogador ${idx + 1}`}
                title={`Stack do Jogador ${idx + 1}`}
                placeholder="Stack (bb)"
              />
              { players.length > 2 && (
                <button onClick={ () => removePlayer( p.id ) } className={ styles.calcBtnRemove }>
                  &times;
                </button>
              ) }
            </div>
          ) ) }
          <button onClick={ addPlayer } className={ styles.calcBtnAdd }>
            + Jogador
          </button>
        </div>

        {/* Payouts */ }
        <div className={ styles.calcSection }>
          <h4 className={ styles.calcSectionTitle }>
            Payouts (%)
          </h4>
          { prizes.map( ( prize, idx ) => (
            <div key={ `prize-${ idx + 1 }-${ prize }` } className={ styles.calcRow }>
              <span className={ styles.calcPrizeIndex }>
                { idx + 1 }&ordm;
              </span>
              <input
                id={ `calc-prize-${ compId }-${ idx }` }
                name={ `prize-${ idx }` }
                type="number"
                value={ prize }
                onChange={ ( e ) => updatePrize( idx, Math.max( 0, Number.parseFloat( e.target.value ) || 0 ) ) }
                className={ styles.calcPrizeInput }
                aria-label={`Prêmio ${idx + 1}`}
                title={`Prêmio ${idx + 1}`}
                placeholder="Prêmio (%)"
              />
            </div>
          ) ) }
          <div className={ styles.calcBtnPrizeGroup }>
            <button onClick={ addPrize } className={ styles.calcBtnPrizeAdd }>
              + Prêmio
            </button>
            { prizes.length > 1 && (
              <button onClick={ removePrize } className={ styles.calcBtnPrizeRemove }>
                &minus;
              </button>
            ) }
          </div>
        </div>
      </div>

      {/* Resumo */ }
      <div className={ styles.calcStatGrid }>
        { [
          { label: 'Jogadores', value: String( players.length ), color: 'var(--sim-text-main)' },
          { label: 'Fichas', value: String( totalChips ), color: 'var(--sim-color-indigo-light)' },
          { label: 'Pool', value: `${ totalPrizes.toFixed( 1 ) }%`, color: 'var(--sim-color-emerald)' },
          { label: 'BF Range', value: bfRange, color: bfRangeColor },
          { label: 'Jogadores', value: String( players.length ), colorClass: 'text-text-main' },
          { label: 'Fichas', value: String( totalChips ), colorClass: 'text-accent-indigo-light' },
          { label: 'Pool', value: `${ totalPrizes.toFixed( 1 ) }%`, colorClass: 'text-accent-emerald' },
          { label: 'BF Range', value: bfRange, colorClass: bfRangeColor },
        ].map( ( stat ) => (
          <div key={ stat.label } className={ styles.calcStatCard }>
            <div className={ styles.calcStatLabel }>
              { stat.label }
            </div>
            <div className={ styles.calcStatValue } style={{ color: stat.color }}>
            <div className={ `${styles.calcStatValue} ${stat.colorClass}` }>
              { stat.value }
            </div>
          </div>
        ) ) }
      </div>

      {/* PKO Bounty Slider */ }
      <div className={`rounded-xl py-3.5 px-5 transition-all ${ pkoValue > 0 ? 'bg-amber-500/5 border border-amber-500/20' : 'bg-slate-900/40 border border-white/5' }`}>
        <div className="flex justify-between items-center mb-1.5">
          <span className={`text-[0.58rem] font-black uppercase tracking-widest ${ pkoValue > 0 ? 'text-accent-amber' : 'text-text-dim' }`}>
            PKO Bounty Weight
          </span>
          <span className={`font-mono tabular-nums text-[0.75rem] font-bold ${ pkoValue > 0 ? 'text-accent-amber' : 'text-text-darker' }`}>
            { pkoValue === 0 ? 'OFF' : `${ Math.round( pkoValue * 100 ) }%` }
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="0.8"
          step="0.05"
          value={ pkoValue }
          onChange={ ( e ) => setPkoValue( Number.parseFloat( e.target.value ) ) }
          className="w-full accent-accent-amber cursor-pointer"
          aria-label="Peso do PKO Bounty"
          title="Peso do PKO Bounty"
        />
        <p className="mt-1.5 text-[0.55rem] text-text-darker leading-relaxed m-0">
          Reduz o peso do Prize Pool (ICM) e aumenta o peso da Probabilidade de Vitória (Bounty Pool).
        </p>
      </div>

      {/* Resultados */ }
      <div className={ `${ styles.calcResultPanel } transition-[opacity,filter,transform] duration-300 ${ isCalculatingICM ? 'opacity-50 blur-[1px] scale-[0.99]' : 'opacity-100 blur-none scale-100' }` }>
        <h4 className={ styles.calcResultTitle }>
          { pkoValue > 0 ? 'Equidade Ajustada (ICM + PKO)' : 'Equidade ICM' }
        </h4>
        { results.map( ( r ) =>
        {
          const chipPercent = totalChips > 0
            ? ( ( players.find( p => p.id === r.id )?.stack ?? 0 ) / totalChips ) * 100
            : 0;

          // Cálculo PKO simplificado: blend entre ICM e WinProb baseado no pkoValue
          const equityPKO = pkoValue > 0
            ? ( 1 - pkoValue ) * r.equityPercent + pkoValue * ( r.winProb * 100 )
            : r.equityPercent;

          const delta = equityPKO - chipPercent;
          let deltaClass = styles.calcResultDeltaNeu;
          if ( delta > 0.5 )
          {
            deltaClass = styles.calcResultDeltaPos;
          } else if ( delta < -0.5 )
          {
            deltaClass = styles.calcResultDeltaNeg;
          }
          const deltaSign = delta > 0 ? '+' : '';
          const isHero = r.id === heroId;

          return (
            <div key={ r.id } className={ styles.calcResultRow }>
              <div className={ styles.calcResultHeader }>
                <span className={ styles.calcResultName }>
                  { isHero && <span className={ styles.calcHeroBadge }>Hero</span> }
                  { r.name }
                </span>
                <div className={ styles.calcResultValues }>
                  { pkoValue > 0 && (
                    <span className="font-mono tabular-nums text-[0.58rem] text-accent-amber font-bold mr-1" title="Win Prob (Bounty Weight)">
                      W: { ( r.winProb * 100 ).toFixed( 1 ) }%
                    </span>
                  ) }
                  <span className={ styles.calcResultChips }>
                    { chipPercent.toFixed( 1 ) }% chips
                  </span>
                  <span className={ styles.calcResultEquity }>
                    <AnimatedNumber value={ equityPKO } suffix="%" />
                  </span>
                  <span className={ `${ styles.calcResultDelta } ${ deltaClass }` }>
                    { deltaSign }{ delta.toFixed( 1 ) }%
                  </span>
                </div>
              </div>
              {/* Barras: cinza = fichas, indigo = ICM/PKO */ }
              <div className={ styles.calcResultBarContainer }>
                <div
                  className={ styles.calcResultBarChips }
                  style={{ width: `${ chipPercent }%` }}
                />
                <div
                  className={ styles.calcResultBarEquity }
                  className={ `${styles.calcResultBarEquity} ${isHero ? 'opacity-100' : 'opacity-80'} ${pkoValue > 0 ? 'bg-linear-to-r from-accent-indigo to-accent-amber' : 'bg-accent-indigo'}` }
                  style={{
                    width: `${ equityPKO }%`,
                    opacity: isHero ? 1 : 0.8,
                    background: pkoValue > 0 ? 'linear-gradient(90deg, var(--accent-indigo), var(--accent-amber))' : 'var(--accent-indigo)'
                    width: `${ equityPKO }%`
                  }}
                />
              </div>
            </div>
          );
        } ) }

        {/* Insight ICM vs ChipEV */ }
        { icmInsight && (
          <div className={ styles.calcInsightBox }>
            <i className={ `fa-solid fa-lightbulb ${ styles.calcInsightIcon }` } />
            { icmInsight }
          </div>
        ) }

        {/* Motor WASM Termodinâmico SOTA */ }
        <InsolvencyRioPanel insolvency={ insolvency } isCalculating={ wasmContext?.isCalculatingInsolvency ?? false } />
      </div>
    </div>
  );
}
