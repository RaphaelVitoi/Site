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
                <div className="w-10 h-10 rounded-xl bg-black/60 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.15)] border border-accent-indigo/30 relative overflow-hidden group-hover:border-accent-indigo transition-colors duration-500">
                    <div className="absolute inset-0 bg-gradient-to-br from-accent-indigo/20 to-transparent opacity-50" />
                    <i className="fa-solid fa-gem text-accent-indigo-light text-sm relative z-10" />
                    </div>
                    <div className="flex flex-col justify-center">
                    <h1 className="text-[0.85rem] font-black text-white uppercase tracking-[0.25em] leading-none m-0">
                        SOTA <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-indigo-light to-accent-emerald-light">Quantum</span>
                        </h1>
                    <h2 className="text-[0.55rem] font-bold text-text-dim uppercase tracking-[0.3em] leading-none m-0 mt-1.5">
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
