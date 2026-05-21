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
            <div className="sota-glass-pill px-5 py-3 flex flex-col lg:flex-row items-center justify-between gap-4 w-full">

                {/* Navigation Links */ }
                <nav className="flex items-center justify-center gap-2 flex-wrap w-full lg:w-auto">
                    <Link
                        href="/simulador"
                        className={ `px-4 py-2 rounded-full text-[0.65rem] font-black uppercase tracking-widest transition-all ${ isActive( '/simulador' ) ? 'bg-accent-indigo text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10' }` }
                    >
                        <i className="fa-solid fa-microchip mr-2"></i> Motor Mestre
                    </Link>
                    <Link
                        href="/simulador/gto-cfr"
                        className={ `px-4 py-2 rounded-full text-[0.65rem] font-black uppercase tracking-widest transition-all ${ isActive( '/simulador/gto-cfr' ) ? 'bg-accent-indigo text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10' }` }
                    >
                        <i className="fa-solid fa-brain mr-2"></i> Laboratório CFR
                    </Link>
                </nav>

                {/* Global Physics State Indicator */ }
                <div className="flex items-center justify-center flex-wrap gap-x-4 gap-y-2 bg-black/40 px-5 py-2 rounded-3xl border border-white/5 shadow-inner text-xs font-mono text-slate-300 w-full lg:w-auto mt-2 lg:mt-0">
                    <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold">Hero:</span> { physics.heroStack }bb
                    </div>
                    <div className="hidden sm:block w-px h-4 bg-white/20"></div>
                    <div className="flex items-center gap-2">
                        <span className="text-cyan-400 font-bold">Pote:</span> { physics.pot }bb
                    </div>
                    <div className="hidden sm:block w-px h-4 bg-white/20"></div>
                    <div className="flex items-center gap-2">
                        <span className={ physics.position === 'IP' ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold' }>{ physics.position }</span>
                    </div>
                    <div className="hidden sm:block w-px h-4 bg-white/20"></div>
                    <div className="flex items-center gap-2">
                        <select
                            className="bg-transparent border-none text-xs text-orange-400 font-bold focus:outline-none cursor-pointer"
                            value={ physics.referenceStatus }
                            onChange={ ( e ) => updatePhysics( { referenceStatus: e.target.value as ReferencePointStatus } ) }
                        >
                            <option value="baseline" className="bg-zinc-900">Baseline (EV)</option>
                            <option value="tilt" className="bg-zinc-900">Stuck / Tilt</option>
                            <option value="protecting" className="bg-zinc-900">Protecting Win</option>
                            <option value="bubble" className="bg-zinc-900">Bubble Survival</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
}
