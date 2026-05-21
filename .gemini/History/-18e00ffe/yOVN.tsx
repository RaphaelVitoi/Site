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
        <div className="sticky top-0 z-40 w-full bg-bg-base/80 backdrop-blur-xl border-b border-white/5 shadow-lg">
            <div className="sota-container py-3 flex flex-col md:flex-row items-center justify-between gap-4">

                {/* Navigation Links */ }
                <nav className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
                    <Link
                        href="/simulador"
                        className={ `px-4 py-1.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${isActive( '/simulador' ) ? 'bg-accent-indigo text-white' : 'text-text-muted hover:text-text-bright hover:bg-white/5'}` }
                    >
                        <i className="fa-solid fa-microchip mr-2"></i> Motor Mestre
                    </Link>
                    <Link
                        href="/aulas/icm-pos-flop"
                        className={ `px-4 py-1.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${isActive( '/aulas/icm-pos-flop' ) ? 'bg-accent-indigo text-white' : 'text-text-muted hover:text-text-bright hover:bg-white/5'}` }
                    >
                        <i className="fa-solid fa-chart-line mr-2"></i> Downward Drift
                    </Link>
                    <Link
                        href="/biblioteca/amortizacao-da-edge"
                        className={ `px-4 py-1.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${isActive( '/biblioteca/amortizacao-da-edge' ) ? 'bg-accent-indigo text-white' : 'text-text-muted hover:text-text-bright hover:bg-white/5'}` }
                    >
                        <i className="fa-solid fa-compress-arrows-alt mr-2"></i> Amortização da Edge
                    </Link>
                    <Link
                        href="/artigos/estado-da-arte"
                        className={ `px-4 py-1.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${isActive( '/artigos/estado-da-arte' ) ? 'bg-accent-indigo text-white' : 'text-text-muted hover:text-text-bright hover:bg-white/5'}` }
                    >
                        <i className="fa-solid fa-brain mr-2"></i> GTO AI (CFR)
                    </Link>
                </nav>

                {/* Global Physics State Indicator */ }
                <div className="flex items-center gap-3 bg-white/2 px-4 py-1.5 rounded-xl border border-white/5 text-xs font-mono text-text-muted w-full md:w-auto overflow-x-auto">
                    <div className="flex items-center gap-2 whitespace-nowrap">
                        <span className="text-accent-emerald font-bold">Hero:</span> { physics.heroStack }bb
                    </div>
                    <div className="w-px h-4 bg-white/20"></div>
                    <div className="flex items-center gap-2 whitespace-nowrap">
                        <span className="text-accent-sky font-bold">Pote:</span> { physics.pot }bb
                    </div>
                    <div className="w-px h-4 bg-white/20"></div>
                    <div className="flex items-center gap-2 whitespace-nowrap">
                        <span className={ physics.position === 'IP' ? 'text-accent-emerald font-bold' : 'text-accent-danger font-bold' }>{ physics.position }</span>
                    </div>
                    <div className="w-px h-4 bg-white/20"></div>
                    <div className="flex items-center gap-2 whitespace-nowrap">
                        <select
                            className="bg-transparent border-none text-xs text-accent-amber font-bold focus:outline-none cursor-pointer"
                            value={ physics.referenceStatus }
                            onChange={ ( e ) => updatePhysics( { referenceStatus: e.target.value as ReferencePointStatus } ) }
                        >
                            <option value="baseline" className="bg-bg-deep">Baseline (EV)</option>
                            <option value="tilt" className="bg-bg-deep">Stuck / Tilt (Chasing)</option>
                            <option value="protecting" className="bg-bg-deep">Protecting Win (Aversa)</option>
                            <option value="bubble" className="bg-bg-deep">Bubble Survival</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
}
