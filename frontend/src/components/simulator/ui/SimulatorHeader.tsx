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

export default function SimulatorHeader ( { scenarioName, stacks: _stacks, effectiveIpRp, effectiveOopRp, rpSource: _rpSource, sidebarOpen: _sidebarOpen, onToggleSidebar }: Readonly<SimulatorHeaderProps> )
{
    return (
        <header className="p-4 border-b border-white/10 flex justify-between items-center bg-bg-panel/50 backdrop-blur-md sticky top-0 z-50">
            <div className="flex items-center gap-4">
                <button onClick={ onToggleSidebar } className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-md hover:bg-white/10 text-white transition-colors">
                    <i className="fa-solid fa-bars" />
                </button>
                <h1 className="text-sm font-bold text-text-bright uppercase tracking-widest">
                    { scenarioName || 'Laboratório SOTA' }
                </h1>
            </div>
            <div className="flex gap-4 text-xs font-mono font-bold text-text-muted">
                <span><span className="text-accent-indigo-light mr-1">IP RP</span> { effectiveIpRp?.toFixed( 1 ) }%</span>
                <span><span className="text-accent-danger mr-1">OOP RP</span> { effectiveOopRp?.toFixed( 1 ) }%</span>
            </div>
        </header>
    );
}
