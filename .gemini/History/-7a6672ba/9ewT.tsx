import Link from 'next/link';
import styles from '../simulator.module.css';

interface SimulatorHeaderProps {
    readonly scenarioName: string;
    readonly stacks: number[];
    readonly effectiveIpRp: number;
    readonly effectiveOopRp: number;
    readonly rpSource: string;
    readonly sidebarOpen: boolean;
    readonly onToggleSidebar: () => void;
}

export default function SimulatorHeader ( { scenarioName, stacks, effectiveIpRp, effectiveOopRp, rpSource, sidebarOpen, onToggleSidebar }: SimulatorHeaderProps ) {
    return (
        <div className={ styles.headerWrapper }>
            <div className={ styles.headerMain }>
                <div>
                    <h1 className={ styles.gradientText } style={ { fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 900, margin: 0 } }>Motor ICM</h1>
                    <p style={ { margin: '0.5rem 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' } }>Explore distorções GTO em tempo real com o Paradigma Vitoi.</p>
                    <div style={ { display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.8rem', flexWrap: 'wrap' } }>
                        <span className={ styles.dataMono } style={ { fontSize: '0.7rem', color: 'var(--text-light)', fontWeight: 700 } }>
                            { scenarioName } ({ stacks[ 0 ] }bb vs { stacks[ 1 ] }bb)
                        </span>
                        <span style={ { fontSize: '0.7rem', color: 'var(--text-darker)', fontWeight: 600 } }>IP: { effectiveIpRp.toFixed( 1 ) }% | OOP: { effectiveOopRp.toFixed( 1 ) }%</span>
                        <span style={ { fontSize: '0.58rem', color: rpSource.includes( 'Quantum' ) ? 'var(--accent-emerald)' : 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', padding: '2px 6px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)' } }>RP { rpSource }</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                    <Link href="/" className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-400 bg-transparent border border-transparent hover:bg-white/5 hover:text-white transition-all">
                        <i className="fa-solid fa-arrow-left" /> <span className="hidden sm:inline">Início</span>
                    </Link>
                    <button
                        type="button"
                        onClick={ onToggleSidebar }
                        className={ `flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all shadow-sm ${sidebarOpen ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20' : 'bg-slate-900/60 text-slate-300 border border-white/5 hover:bg-slate-800 hover:border-white/10'}` }
                    >
                        <i className={ `fa-solid ${sidebarOpen ? 'fa-folder-open' : 'fa-folder'}` } />
                        <span className="hidden sm:inline">Cenários</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
