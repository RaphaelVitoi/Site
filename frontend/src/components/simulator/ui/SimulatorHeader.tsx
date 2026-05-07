import { SotaTooltip } from '@/components/simulator/ui/SotaTooltip';

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
        <header className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-black/40 backdrop-blur-2xl sticky top-0 z-[9999] shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-6">
                <button onClick={ onToggleSidebar } className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-xl hover:bg-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] text-text-muted hover:text-white transition-all duration-300 group border border-white/5 cursor-pointer">
                    <i className="fa-solid fa-bars group-hover:scale-110 transition-transform" />
                </button>
                <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-xl bg-linear-to-br from-accent-indigo to-indigo-900 flex items-center justify-center shadow-[0_0_25px_rgba(99,102,241,0.5)] border border-accent-indigo-light/30">
                        <i className="fa-solid fa-bolt text-white text-sm" />
                    </div>
                    <div className="flex flex-col justify-center">
                        <h1 className="text-[0.8rem] font-black text-white uppercase tracking-[0.2em] leading-tight m-0">
                            SOTA <span className="text-accent-indigo-light">Quantum</span>
                        </h1>
                        <h2 className="text-[0.55rem] font-bold text-text-dim uppercase tracking-[0.25em] leading-tight m-0 mt-0.5">
                            { scenarioName || 'Laboratório Analítico' }
                        </h2>
                    </div>
                </div>
            </div>
            <div className="hidden sm:flex items-center gap-5 text-[0.65rem] font-mono font-black uppercase tracking-widest bg-bg-deep/80 px-5 py-2.5 rounded-xl border border-white/5 shadow-inner">
                <SotaTooltip title="IP Risk Premium" content="A taxa extra de equidade (além das Pot Odds) exigida pelo Agressor para compensar a gravidade do cenário e a morte no torneio." align="right" theme="indigo">
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
                
                <SotaTooltip title="OOP Risk Premium" content="A vulnerabilidade sistêmica do Defensor. RPs altos forçam overfold estrutural porque cada call errado custa o fim do torneio." align="right" theme="rose">
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
        </header>
    );
}
