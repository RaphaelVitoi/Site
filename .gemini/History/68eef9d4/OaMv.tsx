// frontend/src/app/laboratorio-v2/gto-cfr/page.tsx
'use client';

import { ContentPageHeader } from '@/components/layout/ContentPageHeader';
import { GlassPanel } from '@/components/ui/GlassPanel';
import LZString from 'lz-string';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function GtoCfrContent ()
{
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [ pot, setPot ] = useState( 100 );
  const [ target, setTarget ] = useState( 1000 );
  const [ streets, setStreets ] = useState( 3 );
  const [ isLoaded, setIsLoaded ] = useState( false );
  const [ copied, setCopied ] = useState( false );

  // Sincronização SOTA: Hidratação a partir da URL (Descompressão Segura)
  useEffect( () =>
  {
    const stateParam = searchParams.get( 'state' );
    if ( stateParam )
    {
      try
      {
        const decompressed = LZString.decompressFromEncodedURIComponent( stateParam );
        if ( decompressed )
        {
          const parsed = JSON.parse( decompressed );
          if ( parsed.pot ) setPot( Number( parsed.pot ) );
          if ( parsed.target ) setTarget( Number( parsed.target ) );
          if ( parsed.streets ) setStreets( Number( parsed.streets ) );
        }
      } catch ( e )
      {
        console.error( "[SOTA] Falha ao descomprimir snapshot de estado.", e );
      }
    }
    setIsLoaded( true );
  }, [ searchParams ] );

  // Sincronização SOTA: Propagação do Estado para a URL
  useEffect( () =>
  {
    if ( !isLoaded ) return;
    const stateObj = { pot, target, streets };
    const compressed = LZString.compressToEncodedURIComponent( JSON.stringify( stateObj ) );
    const currentParams = new URLSearchParams( Array.from( searchParams.entries() ) );

    if ( currentParams.get( 'state' ) !== compressed )
    {
      currentParams.set( 'state', compressed );
      router.replace( `${ pathname }?${ currentParams.toString() }`, { scroll: false } );
    }
  }, [ pot, target, streets, isLoaded, pathname, router, searchParams ] );

  const handleShare = () =>
  {
    navigator.clipboard.writeText( window.location.href );
    setCopied( true );
    setTimeout( () => setCopied( false ), 2000 );
  };

  // Geometric formula replicating engine/math_sota.py
  const growthFactor = target / pot;
  const onePlusTwoF = Math.pow( growthFactor, 1 / streets );
  const f = ( onePlusTwoF - 1 ) / 2;

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

        <div className="bg-gradient-to-r from-bg-deep to-bg-base p-8 rounded-2xl border border-accent-emerald/20 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-6 group hover:border-accent-emerald/50 transition-all shadow-[0_0_30px_rgba(16,185,129,0.05)]">
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

      <GlassPanel className="p-8 sm:p-12 border-accent-indigo/20 opacity-60 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.02)_10px,rgba(255,255,255,0.02)_20px)]">
        <div className="flex items-center gap-3 mb-4">
          <i className="fa-solid fa-lock text-accent-indigo text-2xl" />
          <h2 className="text-2xl font-black text-white tracking-tighter uppercase font-heading">
            CFR Regret Matching Engine
          </h2>
        </div>
        <p className="text-text-muted text-sm uppercase tracking-widest font-bold">
          Módulo de convergência Bayesiana em desenvolvimento no Kernel SOTA...
        </p>
      </GlassPanel>
    </main>
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
