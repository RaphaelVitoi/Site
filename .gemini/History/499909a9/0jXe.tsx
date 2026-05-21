'use client';

import { ReferencePointStatus } from '@/lib/perspectiva';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSotaSync } from './hooks/useSotaSync';

export function SotaHubNavbar ()
{
    const pathname = usePathname();
    const { physics, updatePhysics, isHydrated } = useSotaSync();

    if ( !isHydrated ) return null;

    const isActive = ( path: string ) => pathname === path;

    return (
        <div className="sticky top-24 z-40 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-2 pb-4">
            <div className="sota-glass-pill px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-4">

                {/* Navigation Links */ }
                <nav className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
                    <Link
                        href="/simulador"
                        className={ `px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${ isActive( '/simulador' ) ? 'bg-accent-indigo text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]' : 'text-slate-400 hover:text-white hover:bg-white/5' }` }
                    >
                        <i className="fa-solid fa-microchip mr-2"></i> Motor Mestre
                    </Link>
                    <Link
                        href="/aulas/icm-masterclass"
                        className={ `px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${ isActive( '/aulas/icm-masterclass' ) ? 'bg-accent-indigo text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]' : 'text-slate-400 hover:text-white hover:bg-white/5' }` }
                    >
                        <i className="fa-solid fa-chart-line mr-2"></i> Downward Drift
                    </Link>
                    <Link
                        href="/biblioteca/amortizacao-da-edge"
                        className={ `px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${ isActive( '/biblioteca/amortizacao-da-edge' ) ? 'bg-accent-indigo text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]' : 'text-slate-400 hover:text-white hover:bg-white/5' }` }
                    >
                        <i className="fa-solid fa-compress-arrows-alt mr-2"></i> Amortização da Edge
                    </Link>
                    <Link
                        href="/simulador/gto-cfr"
                        className={ `px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${ isActive( '/simulador/gto-cfr' ) ? 'bg-accent-indigo text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]' : 'text-slate-400 hover:text-white hover:bg-white/5' }` }
                    >
                        <i className="fa-solid fa-brain mr-2"></i> GTO AI (CFR)
                    </Link>
                </nav>

                {/* Global Physics State Indicator */ }
                <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-full border border-white/5 shadow-inner text-xs font-mono text-slate-300 w-full md:w-auto overflow-x-auto">
                    <div className="flex items-center gap-2 whitespace-nowrap">
                        <span className="text-emerald-400 font-bold">Hero:</span> { physics.heroStack }bb
                    </div>
                    <div className="w-px h-4 bg-white/20"></div>
                    <div className="flex items-center gap-2 whitespace-nowrap">
                        <span className="text-cyan-400 font-bold">Pote:</span> { physics.pot }bb
                    </div>
                    <div className="w-px h-4 bg-white/20"></div>
                    <div className="flex items-center gap-2 whitespace-nowrap">
                        <span className={ physics.position === 'IP' ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold' }>{ physics.position }</span>
                    </div>
                    <div className="w-px h-4 bg-white/20"></div>
                    <div className="flex items-center gap-2 whitespace-nowrap">
                        <select
                            className="bg-transparent border-none text-xs text-orange-400 font-bold focus:outline-hidden cursor-pointer"
                            value={ physics.referenceStatus }
                            onChange={ ( e ) => updatePhysics( { referenceStatus: e.target.value as ReferencePointStatus } ) }
                        >
                            <option value="baseline" className="bg-zinc-900">Baseline (EV)</option>
                            <option value="tilt" className="bg-zinc-900">Stuck / Tilt (Chasing)</option>
                            <option value="protecting" className="bg-zinc-900">Protecting Win (Aversa)</option>
                            <option value="bubble" className="bg-zinc-900">Bubble Survival</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
}
