'use client';

/**
 * IDENTITY: Calculadora Malmuth-Harville de Equidade ICM v4.2
 * PATH: src/components/simulator/panels/EquityCalculator.tsx
 * ROLE: Inputs manuais de stacks + payouts + hand parser -> cálculo ICM real.
 * BINDING: [lib/icmEngine.ts, lib/handParser.ts, components/simulator/hooks/*, components/simulator/ui/*]
 */

import { useCallback, useContext, useDeferredValue, useMemo, useState } from 'react';
import { parseHandHistory } from '@/lib/handParser';
import { downloadHRCJson, generateHRCJson } from '@/lib/hrcExport';
import type { ICMPlayer } from '@/lib/icmEngine';
import { SotaWasmContext } from '../SotaContext';
import { useIcmCalculations } from '../hooks/useIcmCalculations';
import { InsolvencyRioPanel } from '../ui/InsolvencyRioPanel';
import AnimatedNumber from '../ui/AnimatedNumber';
import styles from './EquityCalculator.module.css';

const PRESETS = [
  { label: 'HU (2p)', stacks: [ 50, 50 ], prizes: [ 65, 35 ] },
  { label: '3-Way', stacks: [ 40, 35, 25 ], prizes: [ 50, 30, 20 ] },
  { label: 'FT (6p)', stacks: [ 30, 25, 20, 12, 8, 5 ], prizes: [ 35, 25, 18, 12, 7, 3 ] },
  { label: 'Bolha (4p)', stacks: [ 45, 25, 18, 12 ], prizes: [ 50, 30, 20 ] },
];

export default function EquityCalculator ()
{
  const [ players, setPlayers ] = useState<ICMPlayer[]>(
    [
      { id: '1', name: 'Jogador 1', stack: 40 },
      { id: '2', name: 'Jogador 2', stack: 55 },
    ]
  );
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

  // SOTA v4.2: Orquestração de Cálculo Modularizada
  const { results, isWorkerCalculating, totalChips, totalPrizes } = useIcmCalculations({
    players: deferredPlayers, prizes: deferredPrizes
  });

  const isCalculatingICM = players !== deferredPlayers || prizes !== deferredPrizes || isWorkerCalculating;

  const handleExportHRC = useCallback( () =>
  {
    const json = generateHRCJson( players, prizes, pkoValue );
    downloadHRCJson( json, `vitoi_spot_${ players.length }p.json` );
  }, [ players, prizes, pkoValue ] );

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
    let color = 'text-accent-emerald';
    if ( max > 1.3 ) color = 'text-accent-rose';
    else if ( max > 1.1 ) color = 'text-accent-amber';
    return { bfRange: `${ min.toFixed( 2 ) }-${ max.toFixed( 2 ) }`, bfRangeColor: color };
  }, [ results, players, totalChips ] );

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

  const addPlayer = useCallback( () =>
  {
    setPlayers( prev => [
      ...prev,
      { id: Date.now().toString() + Math.random().toString(36).substring(2), name: `Jogador ${ prev.length + 1 }`, stack: 20 },
    ] );
  }, [] );

  const removePlayer = useCallback( ( id: string ) =>
  {
    setPlayers( prev => prev.filter( p => p.id !== id ) );
    if ( heroId === id ) setHeroId( null );
  }, [ heroId ] );

  const updateStack = useCallback( ( id: string, stack: number ) =>
  {
    setPlayers( prev => prev.map( p => p.id === id ? { ...p, stack } : p ) );
  }, [] );

  const updateName = useCallback( ( id: string, name: string ) =>
  {
    setPlayers( prev => prev.map( p => p.id === id ? { ...p, name } : p ) );
  }, [] );

  const updatePrize = useCallback( ( idx: number, value: number ) =>
  {
    setPrizes( prev => prev.map( ( p, i ) => i === idx ? value : p ) );
  }, [] );

  const addPrize = useCallback( () =>
  {
    setPrizes( prev => [ ...prev, 10 ] );
  }, [] );

  const removePrize = useCallback( () =>
  {
    setPrizes( prev => prev.length > 1 ? prev.slice( 0, -1 ) : prev );
  }, [] );

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

  const parseHand = useCallback( () =>
  {
    setParserError( null );
    try
    {
      let parsed = parseHandHistory( handText );
      if ( parsed.length >= 2 )
      {
        if ( parsed.length > 9 ) parsed = parsed.slice( 0, 9 );
        setPlayers( parsed );
        setShowParser( false );
        setHandText( '' );
        setHeroId( parsed[ 0 ].id );
      } else
      {
        setParserError( 'Não foi possível identificar pelo menos 2 jogadores.' );
      }
    } catch ( error: unknown )
    {
      console.error( '[HandParser] Erro ao decodificar Hand History:', error );
      setParserError( 'Falha ao decodificar a Hand History.' );
    }
  }, [ handText ] );

  return (
    <div className={ styles.calcPanel }>
      <div className={ styles.calcHeader }>
        <h3 className={ styles.calcTitle }>Calculadora Malmuth-Harville</h3>
        <div className={ styles.calcHeaderActions }>
          <button onClick={ handleExportHRC } className={ styles.calcBtnOutline } title="Exportar para HRC">
            <i className="fa-solid fa-file-export mr-1" />
            <span>HRC</span>
          </button>
          <button onClick={ () => setShowParser( !showParser ) } className={ `${ styles.calcBtnOutline } ${ showParser ? styles.calcBtnOutlineActive : '' }` }>
            <i className="fa-solid fa-paste mr-1" />
            <span>Parser</span>
          </button>
        </div>
      </div>

      { showParser && (
        <div className={ styles.calcParserContainer }>
          <textarea value={ handText } onChange={ ( e ) => setHandText( e.target.value ) } placeholder={ 'Seat 1: Jogador1 (15000 in chips)\nSeat 2: Jogador2 (25000 in chips)' } rows={ 4 } className={ styles.calcParserTextarea } />
          { parserError && <div className={ styles.calcParserError }><i className="fa-solid fa-triangle-exclamation mr-1.5" />{ parserError }</div> }
          <button onClick={ parseHand } disabled={ !handText.trim() } className={ `${ styles.calcParserBtn } ${ handText.trim() ? styles.calcParserBtnActive : '' }` }>Decodificar</button>
        </div>
      ) }

      <div className={ styles.calcPresetContainer }>
        { PRESETS.map( ( preset ) => ( <button key={ preset.label } onClick={ () => loadPreset( preset ) } className={ styles.calcPresetBtn }>{ preset.label }</button> ) ) }
      </div>

      <div className={ styles.calcGrid2Col }>
        <div className={ styles.calcSection }>
          <h4 className={ styles.calcSectionTitle }>Stacks (bb)</h4>
          { players.map( ( p, idx ) => (
            <div key={ p.id } className={ styles.calcRow }>
              <button type="button" onClick={ () => setHeroId( p.id ) } className={`cursor-pointer text-[0.65rem] bg-transparent border-none p-0 transition-colors ${heroId === p.id ? 'text-accent-indigo' : 'text-text-muted'}`} title="Hero"><i className={ `fa-solid ${ heroId === p.id ? 'fa-circle-user' : 'fa-user' }` } /></button>
              <input value={ p.name } onChange={ ( e ) => updateName( p.id, e.target.value ) } className={ styles.calcInputText } placeholder="Nome" />
              <input type="number" value={ p.stack } onChange={ ( e ) => updateStack( p.id, Math.max( 0, Number.parseInt( e.target.value ) || 0 ) ) } className={ styles.calcInputNumber } placeholder="Stack" />
              { players.length > 2 && ( <button onClick={ () => removePlayer( p.id ) } className={ styles.calcBtnRemove } aria-label="Remover Jogador">&times;</button> ) }
            </div>
          ) ) }
          <button onClick={ addPlayer } className={ styles.calcBtnAdd }>+ Jogador</button>
        </div>

        <div className={ styles.calcSection }>
          <h4 className={ styles.calcSectionTitle }>Payouts (%)</h4>
          { prizes.map( ( prize, idx ) => (
            <div key={ `prize-${ idx + 1 }-${ prize }` } className={ styles.calcRow }>
              <span className={ styles.calcPrizeIndex }>{ idx + 1 }&ordm;</span>
              <input type="number" value={ prize } onChange={ ( e ) => updatePrize( idx, Math.max( 0, Number.parseFloat( e.target.value ) || 0 ) ) } className={ styles.calcPrizeInput } />
            </div>
          ) ) }
          <div className={ styles.calcBtnPrizeGroup }>
            <button onClick={ addPrize } className={ styles.calcBtnPrizeAdd }>+ Prêmio</button>
            { prizes.length > 1 && ( <button onClick={ removePrize } className={ styles.calcBtnPrizeRemove } aria-label="Remover Prêmio">&minus;</button> ) }
          </div>
        </div>
      </div>

      <div className={ styles.calcStatGrid }>
        { [
          { label: 'Jogadores', value: String( players.length ), colorClass: 'text-text-main' },
          { label: 'Fichas', value: String( totalChips ), colorClass: 'text-accent-indigo-light' },
          { label: 'Pool', value: `${ totalPrizes.toFixed( 1 ) }%`, colorClass: 'text-accent-emerald' },
          { label: 'BF Range', value: bfRange, colorClass: bfRangeColor },
        ].map( ( stat ) => (
          <div key={ stat.label } className={ styles.calcStatCard }>
            <div className={ styles.calcStatLabel }>{ stat.label }</div>
            <div className={ `${styles.calcStatValue} ${stat.colorClass}` }>{ stat.value }</div>
          </div>
        ) ) }
      </div>

      <div className={`rounded-xl py-3.5 px-5 transition-all ${ pkoValue > 0 ? 'bg-amber-500/5 border border-amber-500/20' : 'bg-slate-900/40 border border-white/5' }`}>
        <div className="flex justify-between items-center mb-1.5">
          <span className={`text-[0.58rem] font-black uppercase tracking-widest ${ pkoValue > 0 ? 'text-accent-amber' : 'text-text-dim' }`}>PKO Bounty Weight</span>
          <span className={`font-mono tabular-nums text-[0.75rem] font-bold ${ pkoValue > 0 ? 'text-accent-amber' : 'text-text-darker' }`}>{ pkoValue === 0 ? 'OFF' : `${ Math.round( pkoValue * 100 ) }%` }</span>
        </div>
        <input type="range" min="0" max="0.8" step="0.05" value={ pkoValue } onChange={ ( e ) => setPkoValue( Number.parseFloat( e.target.value ) ) } className="w-full accent-accent-amber cursor-pointer" />
      </div>

      <div className={ `${ styles.calcResultPanel } transition-[opacity,filter,transform] duration-300 ${ isCalculatingICM ? 'opacity-50 blur-[1px] scale-[0.99]' : 'opacity-100 blur-none scale-100' }` }>
        <h4 className={ styles.calcResultTitle }>{ pkoValue > 0 ? 'Equidade Ajustada (ICM + PKO)' : 'Equidade ICM' }</h4>
        { results.map( ( r ) =>
        {
          const chipPercent = totalChips > 0 ? ( ( players.find( p => p.id === r.id )?.stack ?? 0 ) / totalChips ) * 100 : 0;
          const equityPKO = pkoValue > 0 ? ( 1 - pkoValue ) * r.equityPercent + pkoValue * ( r.winProb * 100 ) : r.equityPercent;
          const delta = equityPKO - chipPercent;
          let deltaClass = styles.calcResultDeltaNeu;
          if ( delta > 0.5 ) deltaClass = styles.calcResultDeltaPos;
          else if ( delta < -0.5 ) deltaClass = styles.calcResultDeltaNeg;
          const isHero = r.id === heroId;

          return (
            <div key={ r.id } className={ styles.calcResultRow }>
              <div className={ styles.calcResultHeader }>
                <span className={ styles.calcResultName }>{ isHero && <span className={ styles.calcHeroBadge }>Hero</span> }{ r.name }</span>
                <div className={ styles.calcResultValues }>
                  { pkoValue > 0 && <span className="font-mono tabular-nums text-[0.58rem] text-accent-amber font-bold mr-1">W: { ( r.winProb * 100 ).toFixed( 1 ) }%</span> }
                  <span className={ styles.calcResultChips }>{ chipPercent.toFixed( 1 ) }% chips</span>
                  <span className={ styles.calcResultEquity }><AnimatedNumber value={ equityPKO } suffix="%" /></span>
                  <span className={ `${ styles.calcResultDelta } ${ deltaClass }` }>{ delta > 0 ? '+' : '' }{ delta.toFixed( 1 ) }%</span>
                </div>
              </div>
              <div className={ styles.calcResultBarContainer }>
                <div className={ styles.calcResultBarChips } style={{ width: `${ chipPercent }%` }} />
                <div className={ `${styles.calcResultBarEquity} ${isHero ? 'opacity-100' : 'opacity-80'} ${pkoValue > 0 ? 'bg-linear-to-r from-accent-indigo to-accent-amber' : 'bg-accent-indigo'}` } style={{ width: `${ equityPKO }%` }} />
              </div>
            </div>
          );
        } ) }

        { icmInsight && <div className={ styles.calcInsightBox }><i className={ `fa-solid fa-lightbulb ${ styles.calcInsightIcon }` } />{ icmInsight }</div> }
        <InsolvencyRioPanel insolvency={ insolvency } isCalculating={ wasmContext?.isCalculatingInsolvency ?? false } />
      </div>
    </div>
  );
}
