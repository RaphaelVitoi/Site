'use client';

import { ReferencePointStatus } from '@/lib/perspectiva';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSotaSync } from './hooks/useSotaSync';

export function SotaHubNavbar() {
    const pathname = usePathname();
    const { physics, updatePhysics, isHydrated } = useSotaSync();

    if ( !isHydrated ) return null;

    const isActive = ( path: string ) => pathname === path;

    return (
        <div className="sticky top-0 z-40 w-full bg-black/60 backdrop-blur-md border-b border-white/10 shadow-lg">
            <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4">

                {/* Navigation Links */ }
                <nav className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
                    <Link
                        href="/laboratorio-v2"
                        className={ `px-4 py-1.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${isActive( '/laboratorio-v2' ) ? 'bg-accent-indigo text-white' : 'text-zinc-400 hover:text-white hover:bg-white/5'}` }
                    >
                        <i className="fa-solid fa-microchip mr-2"></i> Motor Mestre
                    </Link>
                    <Link
                        href="/aulas/icm-masterclass"
                        className={ `px-4 py-1.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${isActive( '/aulas/icm-masterclass' ) ? 'bg-accent-indigo text-white' : 'text-zinc-400 hover:text-white hover:bg-white/5'}` }
                    >
                        <i className="fa-solid fa-chart-line mr-2"></i> Downward Drift
                    </Link>
                    <Link
                        href="/biblioteca/amortizacao-da-edge"
                        className={ `px-4 py-1.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${isActive( '/biblioteca/amortizacao-da-edge' ) ? 'bg-accent-indigo text-white' : 'text-zinc-400 hover:text-white hover:bg-white/5'}` }
                    >
                        <i className="fa-solid fa-compress-arrows-alt mr-2"></i> Amortização da Edge
                    </Link>
                    <Link
                        href="/laboratorio-v2/gto-cfr"
                        className={ `px-4 py-1.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${isActive( '/laboratorio-v2/gto-cfr' ) ? 'bg-accent-indigo text-white' : 'text-zinc-400 hover:text-white hover:bg-white/5'}` }
                    >
                        <i className="fa-solid fa-brain mr-2"></i> GTO AI (CFR)
                    </Link>
                </nav>

                {/* Global Physics State Indicator */ }
                <div className="flex items-center gap-3 bg-white/5 px-4 py-1.5 rounded-xl border border-white/10 text-xs font-mono text-zinc-300 w-full md:w-auto overflow-x-auto">
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
