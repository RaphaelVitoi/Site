'use client';

/**
 * IDENTITY: Calculadora Malmuth-Harville de Equidade ICM
 * PATH: src/components/simulator/panels/EquityCalculator.tsx
 * ROLE: Inputs manuais de stacks + payouts + hand parser -> cálculo ICM real.
 * BINDING: [lib/icmEngine.ts, lib/handParser.ts, simulator.module.css]
 */

import { useCallback, useMemo, useState } from 'react';
import { parseHandHistory } from '../../../lib/handParser';
import { downloadHRCJson, generateHRCJson } from '../../../lib/hrcExport';
import { calculateMalmuthHarville, type ICMPlayer } from '../../../lib/icmEngine';
import { logger } from '../../../lib/logger';
import AnimatedNumber from '../ui/AnimatedNumber';
import styles from './EquityCalculator.module.css';

// Presets de cenários rápidos
const PRESETS = [
  { label: 'HU (2p)', stacks: [ 50, 50 ], prizes: [ 65, 35 ] },
  { label: '3-Way', stacks: [ 40, 35, 25 ], prizes: [ 50, 30, 20 ] },
  { label: 'FT (6p)', stacks: [ 30, 25, 20, 12, 8, 5 ], prizes: [ 35, 25, 18, 12, 7, 3 ] },
  { label: 'Bolha (4p)', stacks: [ 45, 25, 18, 12 ], prizes: [ 50, 30, 20 ] },
];

export default function EquityCalculator () {
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

  // Cálculo ICM memoizado
  const results = useMemo(
    () => {
      const res = calculateMalmuthHarville( players, prizes );

      // SOTA Audit: Loga métrica de conservação de valor
      const totalEq = res.reduce( ( sum, r ) => sum + r.equityPercent, 0 );
      logger.metric( 'EquityCalculator', 'icm_total_equity', totalEq, { playerCount: players.length } );

      return res;
    },
    [ players, prizes ]
  );

  const totalChips = useMemo(
    () => players.reduce( ( sum, p ) => sum + p.stack, 0 ),
    [ players ]
  );

  const totalPrizes = useMemo(
    () => prizes.reduce( ( sum, p ) => sum + p, 0 ),
    [ prizes ]
  );

  // Exportar para HRC
  const handleExportHRC = useCallback( () => {
    const json = generateHRCJson( players, prizes, pkoValue );
    downloadHRCJson( json, `vitoi_spot_${players.length}p.json` );
  }, [ players, prizes, pkoValue ] );

  // Bubble Factor range: menor e maior BF entre jogadores
  const { bfRange, bfRangeColor } = useMemo( () => {
    if ( results.length < 2 || totalChips === 0 ) return { bfRange: '-', bfRangeColor: 'var(--text-darker)' };
    const bfs = results.map( r => {
      const chip = ( players.find( p => p.id === r.id )?.stack ?? 0 ) / totalChips * 100;
      return chip > 0 ? r.equityPercent / chip : 1;
    } );
    const min = Math.min( ...bfs );
    const max = Math.max( ...bfs );
    let color = 'var(--sim-color-emerald)';
    if ( max > 1.3 )
    {
      color = 'var(--sim-color-rose)';
    } else if ( max > 1.1 )
    {
      color = 'var(--sim-color-amber)';
    }
    return { bfRange: `${min.toFixed( 2 )}-${max.toFixed( 2 )}`, bfRangeColor: color };
  }, [ results, players, totalChips ] );

  // Insight: quem mais ganha/perde com ICM vs proporcional
  const icmInsight = useMemo( () => {
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
    return `${maxGain.name} ganha +${maxGain.delta.toFixed( 1 )}% com ICM vs proporcional. ${maxLoss.name} perde ${Math.abs( maxLoss.delta ).toFixed( 1 )}%. Short stacks acumulam equity desproporcional ao risco.`;
  }, [ results, players, totalChips ] );

  // Adicionar jogador
  const addPlayer = useCallback( () => {
    setPlayers( prev => [
      ...prev,
      { id: Date.now().toString(), name: `Jogador ${prev.length + 1}`, stack: 20 },
    ] );
  }, [] );

  // Remover jogador
  const removePlayer = useCallback( ( id: string ) => {
    setPlayers( prev => prev.filter( p => p.id !== id ) );
    if ( heroId === id ) setHeroId( null );
  }, [ heroId ] );

  // Atualizar stack
  const updateStack = useCallback( ( id: string, stack: number ) => {
    setPlayers( prev => prev.map( p => p.id === id ? { ...p, stack } : p ) );
  }, [] );

  // Atualizar nome
  const updateName = useCallback( ( id: string, name: string ) => {
    setPlayers( prev => prev.map( p => p.id === id ? { ...p, name } : p ) );
  }, [] );

  // Atualizar prêmio
  const updatePrize = useCallback( ( idx: number, value: number ) => {
    setPrizes( prev => prev.map( ( p, i ) => i === idx ? value : p ) );
  }, [] );

  // Adicionar prêmio
  const addPrize = useCallback( () => {
    setPrizes( prev => [ ...prev, 10 ] );
  }, [] );

  // Remover prêmio
  const removePrize = useCallback( () => {
    setPrizes( prev => prev.length > 1 ? prev.slice( 0, -1 ) : prev );
  }, [] );

  // Carregar preset
  const loadPreset = useCallback( ( preset: typeof PRESETS[ 0 ] ) => {
    setPlayers(
      preset.stacks.map( ( stack, i ) => ( {
        id: String( i + 1 ),
        name: `Jogador ${i + 1}`,
        stack,
      } ) )
    );
    setPrizes( [ ...preset.prizes ] );
    setHeroId( '1' );
  }, [] );

  // Parse hand history
  const parseHand = useCallback( () => {
    setParserError( null );
    try {
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
    } catch ( error: unknown ) {
      console.error( '[EquityCalculator] Hand parser error:', String( error ) );
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
            <i className="fa-solid fa-file-export" style={ { marginRight: '4px' } } />
            <span>HRC</span>
          </button>
          <button
            onClick={ () => setShowParser( !showParser ) }
            className={ `${styles.calcBtnOutline} ${showParser ? styles.calcBtnOutlineActive : ''}` }
          >
            <i className="fa-solid fa-paste" style={ { marginRight: '4px' } } />
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
              <i className="fa-solid fa-triangle-exclamation" style={ { marginRight: '6px' } } />
              { parserError }
            </div>
          ) }
          <button
            onClick={ parseHand }
            disabled={ !handText.trim() }
            className={ `${styles.calcParserBtn} ${handText.trim() ? styles.calcParserBtnActive : ''}` }
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
          { players.map( ( p ) => (
            <div key={ p.id } className={ styles.calcRow }>
              <button
                type="button"
                onClick={ () => setHeroId( p.id ) }
                style={ {
                  cursor: 'pointer',
                  color: heroId === p.id ? 'var(--accent-indigo)' : 'var(--bg-subtle)',
                  fontSize: '0.65rem',
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                } }
                title="Definir como Hero"
              >
                <i className={ `fa-solid ${heroId === p.id ? 'fa-circle-user' : 'fa-user'}` } />
              </button>
              <input
                id={ `player-name-${p.id}` }
                name={ `player-name-${p.id}` }
                value={ p.name }
                onChange={ ( e ) => updateName( p.id, e.target.value ) }
                className={ styles.calcInputText }
              />
              <input
                id={ `player-stack-${p.id}` }
                name={ `player-stack-${p.id}` }
                type="number"
                value={ p.stack }
                onChange={ ( e ) => updateStack( p.id, Math.max( 0, Number.parseInt( e.target.value ) || 0 ) ) }
                className={ styles.calcInputNumber }
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
            <div key={ `prize-${idx + 1}-${prize}` } className={ styles.calcRow }>
              <span className={ styles.calcPrizeIndex }>
                { idx + 1 }&ordm;
              </span>
              <input
                id={ `prize-${idx}` }
                name={ `prize-${idx}` }
                type="number"
                value={ prize }
                onChange={ ( e ) => updatePrize( idx, Math.max( 0, Number.parseFloat( e.target.value ) || 0 ) ) }
                className={ styles.calcPrizeInput }
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
          { label: 'Pool', value: `${totalPrizes.toFixed( 1 )}%`, color: 'var(--sim-color-emerald)' },
          { label: 'BF Range', value: bfRange, color: bfRangeColor },
        ].map( ( stat ) => (
          <div key={ stat.label } className={ styles.calcStatCard }>
            <div className={ styles.calcStatLabel }>
              { stat.label }
            </div>
            <div className={ styles.calcStatValue } style={ { color: stat.color } }>
              { stat.value }
            </div>
          </div>
        ) ) }
      </div>

      {/* PKO Bounty Slider */ }
      <div style={ {
        background: pkoValue > 0 ? 'rgba(245, 158, 11, 0.05)' : 'rgba(15, 23, 42, 0.4)',
        border: pkoValue > 0 ? '1px solid rgba(245, 158, 11, 0.2)' : '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        padding: '0.85rem 1.25rem',
      } }>
        <div style={ { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' } }>
          <span style={ { fontSize: '0.58rem', fontWeight: 900, color: pkoValue > 0 ? 'var(--accent-amber)' : 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em' } }>
            PKO Bounty Weight
          </span>
          <span className="font-mono tabular-nums" style={ { fontSize: '0.75rem', fontWeight: 800, color: pkoValue > 0 ? 'var(--accent-amber)' : 'var(--text-darker)' } }>
            { pkoValue === 0 ? 'OFF' : `${Math.round( pkoValue * 100 )}%` }
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="0.8"
          step="0.05"
          value={ pkoValue }
          onChange={ ( e ) => setPkoValue( Number.parseFloat( e.target.value ) ) }
          style={ { width: '100%', accentColor: 'var(--accent-amber)', cursor: 'pointer' } }
        />
        <p style={ { margin: '0.4rem 0 0', fontSize: '0.55rem', color: 'var(--text-darker)', lineHeight: 1.4 } }>
          Reduz o peso do Prize Pool (ICM) e aumenta o peso da Probabilidade de Vitória (Bounty Pool).
        </p>
      </div>

      {/* Resultados */ }
      <div className={ styles.calcResultPanel }>
        <h4 className={ styles.calcResultTitle }>
          { pkoValue > 0 ? 'Equidade Ajustada (ICM + PKO)' : 'Equidade ICM' }
        </h4>
        { results.map( ( r ) => {
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
                    <span className="font-mono tabular-nums" style={ { fontSize: '0.58rem', color: 'var(--accent-amber)', fontWeight: 700, marginRight: '4px' } } title="Win Prob (Bounty Weight)">
                      W: { ( r.winProb * 100 ).toFixed( 1 ) }%
                    </span>
                  ) }
                  <span className={ styles.calcResultChips }>
                    { chipPercent.toFixed( 1 ) }% chips
                  </span>
                  <span className={ styles.calcResultEquity }>
                    <AnimatedNumber value={ equityPKO } suffix="%" />
                  </span>
                  <span className={ `${styles.calcResultDelta} ${deltaClass}` }>
                    { deltaSign }{ delta.toFixed( 1 ) }%
                  </span>
                </div>
              </div>
              {/* Barras: cinza = fichas, indigo = ICM/PKO */ }
              <div className={ styles.calcResultBarContainer }>
                <div
                  className={ styles.calcResultBarChips }
                  style={ { width: `${chipPercent}%` } }
                />
                <div
                  className={ styles.calcResultBarEquity }
                  style={ {
                    width: `${equityPKO}%`,
                    opacity: isHero ? 1 : 0.8,
                    background: pkoValue > 0 ? 'linear-gradient(90deg, var(--accent-indigo), var(--accent-amber))' : 'var(--accent-indigo)'
                  } }
                />
              </div>
            </div>
          );
        } ) }

        {/* Insight ICM vs ChipEV */ }
        { icmInsight && (
          <div className={ styles.calcInsightBox }>
            <i className={ `fa-solid fa-lightbulb ${styles.calcInsightIcon}` } />
            { icmInsight }
          </div>
        ) }
      </div>
    </div>
  );
}
