// frontend/src/app/laboratorio-v2/gto-cfr/page.tsx
'use client';

import { ContentPageHeader } from '@/components/layout/ContentPageHeader';
import { GlassPanel } from '@/components/ui/GlassPanel';
import LZString from 'lz-string';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';

function hydrateStateFromUrl ( stateParam: string | null )
{
  if ( !stateParam ) return null;
  try
  {
    const decompressed = LZString.decompressFromEncodedURIComponent( stateParam );
    return decompressed ? JSON.parse( decompressed ) : null;
  } catch ( e )
  {
    console.error( "[SOTA] Falha ao descomprimir snapshot de estado.", e );
    return null;
  }
}

function GtoCfrContent ()
{
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [ pot, setPot ] = useState( 100 );
  const [ target, setTarget ] = useState( 1000 );
  const [ streets, setStreets ] = useState( 3 );
  const [ regrets, setRegrets ] = useState( { fold: 10, call: 20, raise: -5 } );
  const [ isLoaded, setIsLoaded ] = useState( false );
  const [ copied, setCopied ] = useState( false );

  // Sincronização SOTA: Hidratação a partir da URL (Descompressão Segura)
  useEffect( () =>
  {
    const parsed = hydrateStateFromUrl( searchParams.get( 'state' ) );

    if ( parsed?.pot ) setPot( Number( parsed.pot ) );
    if ( parsed?.target ) setTarget( Number( parsed.target ) );
    if ( parsed?.streets ) setStreets( Number( parsed.streets ) );
    if ( parsed?.regrets ) setRegrets( parsed.regrets );

    setIsLoaded( true );
  }, [ searchParams ] );

  // Sincronização SOTA: Propagação do Estado para a URL
  useEffect( () =>
  {
    if ( !isLoaded ) return;
    const stateObj = { pot, target, streets, regrets };
    const compressed = LZString.compressToEncodedURIComponent( JSON.stringify( stateObj ) );
    const currentParams = new URLSearchParams( Array.from( searchParams.entries() ) );

    if ( currentParams.get( 'state' ) !== compressed )
    {
      currentParams.set( 'state', compressed );
      router.replace( `${ pathname }?${ currentParams.toString() }`, { scroll: false } );
    }
  }, [ pot, target, streets, regrets, isLoaded, pathname, router, searchParams ] );

  const handleShare = () =>
  {
    navigator.clipboard.writeText( globalThis.location.href );
    setTimeout( () => setCopied( false ), 2000 );
  };

  // Geometric formula replicating engine/math_sota.py
  const { growthFactor, onePlusTwoF, f } = useMemo( () =>
  {
    const gf = target / pot;
    const optf = Math.pow( gf, 1 / streets );
    return { growthFactor: gf, onePlusTwoF: optf, f: ( optf - 1 ) / 2 };
  }, [ pot, target, streets ] );

  // CFR Mock Engine
  const strategy = useMemo( () =>
  {
    const positiveRegrets = {
      fold: Math.max( 0, regrets.fold ),
      call: Math.max( 0, regrets.call ),
      raise: Math.max( 0, regrets.raise )
    };
    const totalPositive = positiveRegrets.fold + positiveRegrets.call + positiveRegrets.raise;
    return totalPositive > 0 ? {
      fold: positiveRegrets.fold / totalPositive,
      call: positiveRegrets.call / totalPositive,
      raise: positiveRegrets.raise / totalPositive
    } : { fold: 1 / 3, call: 1 / 3, raise: 1 / 3 };
  }, [ regrets ] );

  return (
    <main className="sota-container mt-8 space-y-12">
      <GlassPanel className="p-8 sm:p-12 border-accent-emerald/20 hover:border-accent-emerald/40 transition-colors">
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <i className="fa-solid fa-shapes text-accent-emerald text-2xl" />
            <h2 className="text-2xl font-black text-white tracking-tighter uppercase font-heading">
              A* Geometric Bet Sizing
            </h2>
          </div>
          <button
            onClick={ handleShare }
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold uppercase tracking-widest transition-all text-text-bright"
          >
            <i className={ `fa-solid ${ copied ? 'fa-check text-accent-emerald' : 'fa-link' }` } />
            { copied ? 'Copiado!' : 'Snapshot SOTA' }
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div className="flex flex-col">
            <label htmlFor="pot-input" className="text-[0.65rem] font-black uppercase tracking-widest text-accent-emerald mb-3">Pote Atual (ChipEV)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <i className="fa-solid fa-coins text-text-dim" />
              </div>
              <input
                id="pot-input"
                type="number"
                value={ pot }
                onChange={ e => setPot( Number( e.target.value ) ) }
                className="w-full bg-bg-deep border border-white/10 p-4 pl-12 rounded-xl text-white font-mono focus:outline-none focus:border-accent-emerald focus:ring-1 focus:ring-accent-emerald/50 transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label htmlFor="target-input" className="text-[0.65rem] font-black uppercase tracking-widest text-accent-emerald mb-3">Alvo (All-in River)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <i className="fa-solid fa-bullseye text-text-dim" />
              </div>
              <input
                id="target-input"
                type="number"
                value={ target }
                onChange={ e => setTarget( Number( e.target.value ) ) }
                className="w-full bg-bg-deep border border-white/10 p-4 pl-12 rounded-xl text-white font-mono focus:outline-none focus:border-accent-emerald focus:ring-1 focus:ring-accent-emerald/50 transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label htmlFor="streets-input" className="text-[0.65rem] font-black uppercase tracking-widest text-accent-emerald mb-3">Rodadas Restantes</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <i className="fa-solid fa-layer-group text-text-dim" />
              </div>
              <input
                id="streets-input"
                type="number"
                value={ streets }
                onChange={ e => setStreets( Number( e.target.value ) ) }
                className="w-full bg-bg-deep border border-white/10 p-4 pl-12 rounded-xl text-white font-mono focus:outline-none focus:border-accent-emerald focus:ring-1 focus:ring-accent-emerald/50 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="bg-linear-to-r from-bg-deep to-bg-base p-8 rounded-2xl border border-accent-emerald/20 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-6 group hover:border-accent-emerald/50 transition-all shadow-[0_0_30px_rgba(16,185,129,0.05)]">
          <div>
            <p className="text-text-muted text-xs font-black uppercase tracking-[0.2em] mb-2">Fração Geométrica Exata (f)</p>
            <div className="flex items-baseline gap-2">
              <p className="text-5xl sm:text-6xl font-black text-white tracking-tighter">{ ( f * 100 ).toFixed( 1 ) }%</p>
              <span className="text-sm font-bold text-accent-emerald uppercase tracking-widest mb-2">do pote</span>
            </div>
          </div>
          <div className="text-right flex flex-col gap-2">
            <div className="flex items-center justify-end gap-3 text-xs text-text-dim font-mono">
              <span className="uppercase tracking-widest text-[0.6rem]">Growth Factor:</span>
              <span className="text-white bg-white/5 px-2 py-1 rounded">{ growthFactor.toFixed( 2 ) }x</span>
            </div>
            <div className="flex items-center justify-end gap-3 text-xs text-text-dim font-mono">
              <span className="uppercase tracking-widest text-[0.6rem]">Exp. Scale:</span>
              <span className="text-white bg-white/5 px-2 py-1 rounded">{ onePlusTwoF.toFixed( 3 ) }</span>
            </div>
          </div>
        </div>
      </GlassPanel>

      <GlassPanel className="p-8 sm:p-12 border-accent-indigo/20 hover:border-accent-indigo/40 transition-colors">
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <i className="fa-solid fa-scale-balanced text-accent-indigo text-2xl" />
            <h2 className="text-2xl font-black text-white tracking-tighter uppercase font-heading">
              CFR Regret Matching
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h3 className="text-[0.65rem] font-black uppercase tracking-widest text-text-dim mb-4">Acúmulo de Regrets Iniciais</h3>
            <div className="flex flex-col gap-2">
              <label htmlFor="regret-fold" className="text-xs font-bold text-slate-400 uppercase tracking-widest">Fold Regret</label>
              <input id="regret-fold" type="number" value={ regrets.fold } onChange={ ( e ) => setRegrets( { ...regrets, fold: Number( e.target.value ) } ) } className="bg-bg-deep border border-white/10 p-3 rounded-lg text-white font-mono focus:border-accent-indigo outline-none" />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="regret-call" className="text-xs font-bold text-accent-emerald uppercase tracking-widest">Call Regret</label>
              <input id="regret-call" type="number" value={ regrets.call } onChange={ ( e ) => setRegrets( { ...regrets, call: Number( e.target.value ) } ) } className="bg-bg-deep border border-white/10 p-3 rounded-lg text-white font-mono focus:border-accent-indigo outline-none" />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="regret-raise" className="text-xs font-bold text-accent-rose uppercase tracking-widest">Raise Regret</label>
              <input id="regret-raise" type="number" value={ regrets.raise } onChange={ ( e ) => setRegrets( { ...regrets, raise: Number( e.target.value ) } ) } className="bg-bg-deep border border-white/10 p-3 rounded-lg text-white font-mono focus:border-accent-indigo outline-none" />
            </div>
          </div>

          <div className="space-y-6 flex flex-col justify-center">
            <h3 className="text-[0.65rem] font-black uppercase tracking-widest text-text-dim mb-4">Estratégia Mista (Probabilidades de Nash)</h3>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold font-mono">
                <span className="text-slate-400">FOLD</span>
                <span className="text-white">{ ( strategy.fold * 100 ).toFixed( 1 ) }%</span>
              </div>
              <div className="w-full bg-bg-deep rounded-full h-3 border border-white/5 overflow-hidden">
                <div className="bg-slate-500 h-full transition-all duration-500" style={ { width: `${ strategy.fold * 100 }%` } }></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold font-mono">
                <span className="text-accent-emerald">CALL</span>
                <span className="text-white">{ ( strategy.call * 100 ).toFixed( 1 ) }%</span>
              </div>
              <div className="w-full bg-bg-deep rounded-full h-3 border border-white/5 overflow-hidden">
                <div className="bg-accent-emerald h-full transition-all duration-500" style={ { width: `${ strategy.call * 100 }%` } }></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold font-mono">
                <span className="text-accent-rose">RAISE</span>
                <span className="text-white">{ ( strategy.raise * 100 ).toFixed( 1 ) }%</span>
              </div>
              <div className="w-full bg-bg-deep rounded-full h-3 border border-white/5 overflow-hidden">
                <div className="bg-accent-rose h-full transition-all duration-500" style={ { width: `${ strategy.raise * 100 }%` } }></div>
              </div>
            </div>
          </div>
        </div>
      </GlassPanel>
    </main >
  );
}

export default function GtoCfrDashboard ()
{
  return (
    <div className="min-h-screen bg-bg-base text-text-bright overflow-x-hidden font-body pb-24">
      <ContentPageHeader
        title="GTO & CFR SOTA"
        subtitle="Integração da Teoria de Sistemas com A* Geometric Sizing e Regret Matching."
        category="Laboratório"
        icon="fa-network-wired"
      />
      <Suspense fallback={ <div className="p-12 text-center text-text-muted">Carregando Malha Geométrica...</div> }>
        <GtoCfrContent />
      </Suspense>
    </div>
  );
}
