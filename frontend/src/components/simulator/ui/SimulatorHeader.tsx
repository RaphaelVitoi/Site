import { SotaTooltip } from '@/components/simulator/ui/SotaTooltip';
import { signOut } from 'next-auth/react';

export interface SimulatorHeaderProps
{
    readonly scenarioName?: string;
    readonly stacks?: number[];
    readonly effectiveIpRp?: number;
    readonly effectiveOopRp?: number;
    readonly rpSource?: string;
    readonly sidebarOpen?: boolean;
    readonly onToggleSidebar?: () => void;
}

export default function SimulatorHeader ( { scenarioName, effectiveIpRp, effectiveOopRp, onToggleSidebar }: Readonly<SimulatorHeaderProps> ) {
    return (
        <header className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-black/40 backdrop-blur-2xl sticky top-0 z-9999 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-6">
                <button onClick={ onToggleSidebar } className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-xl hover:bg-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] text-text-muted hover:text-white transition-all duration-300 group border border-white/5 cursor-pointer">
                    <i className="fa-solid fa-bars group-hover:scale-110 transition-transform" />
                </button>
                <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-black/20 border border-white/10 backdrop-blur-md shadow-[0_0_20px_rgba(255,255,255,0.03)] flex items-center justify-center relative overflow-hidden group-hover:border-white/20 transition-all duration-500">
                    <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10 text-white">
                      <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
                      <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
                      <path d="M2 7V17" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
                      <path d="M22 7V17" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
                      <path d="M12 12V22" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
                    </svg>
                    </div>
                    <div className="flex flex-col justify-center">
                    <h1 className="text-[0.85rem] font-black text-white uppercase tracking-[0.25em] leading-none m-0">
                        SOTA <span className="font-light text-white/70 tracking-widest ml-0.5">QUANTUM</span>
                        </h1>
                    <h2 className="text-[0.55rem] font-bold text-text-dim uppercase tracking-[0.3em] leading-none m-0 mt-1.5">
                            { scenarioName || 'Laboratório Analítico' }
                        </h2>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-5 text-[0.65rem] font-mono font-black uppercase tracking-widest bg-bg-deep/80 px-5 py-2.5 rounded-xl border border-white/5 shadow-inner">
                    <SotaTooltip title="IP Risk Premium" content="A taxa extra de equidade (além das Pot Odds) exigida pelo Agressor para compensar a gravidade do cenário e a morte no torneio." align="right" position="bottom" theme="indigo">
                        <div className="flex items-center gap-2.5">
                            <div className="relative flex items-center justify-center w-2.5 h-2.5">
                                <span className="absolute w-full h-full rounded-full bg-accent-indigo opacity-50 animate-ping" />
                                <span className="relative w-1.5 h-1.5 rounded-full bg-accent-indigo-light shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                            </div>
                            <span className="text-text-muted">IP RP</span>
                            <span className="text-white text-sm">{ effectiveIpRp?.toFixed( 1 ) }%</span>
                        </div>
                    </SotaTooltip>

                    <div className="w-px h-5 bg-white/10" />

                    <SotaTooltip title="OOP Risk Premium" content="A vulnerabilidade sistêmica do Defensor. RPs altos forçam overfold estrutural porque cada call errado custa o fim do torneio." align="right" position="bottom" theme="rose">
                        <div className="flex items-center gap-2.5">
                            <div className="relative flex items-center justify-center w-2.5 h-2.5">
                                <span className="absolute w-full h-full rounded-full bg-accent-rose opacity-50 animate-ping" style={{ animationDelay: '0.5s' }} />
                                <span className="relative w-1.5 h-1.5 rounded-full bg-accent-rose-light shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                            </div>
                            <span className="text-text-muted">OOP RP</span>
                            <span className="text-white text-sm">{ effectiveOopRp?.toFixed( 1 ) }%</span>
                        </div>
                    </SotaTooltip>
                </div>

                <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="flex items-center justify-center w-10 h-10 bg-rose-500/10 border border-rose-500/20 text-accent-rose rounded-xl hover:bg-rose-500/20 hover:border-rose-500/40 active:scale-95 transition-all shadow-lg cursor-pointer group"
                    title="Fuga Quântica (Logout)"
                >
                    <i className="fa-solid fa-power-off group-hover:scale-110 transition-transform" />
                </button>
            </div>
        </header>
    );
}
