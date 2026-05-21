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
                    <div style={ { display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.8rem' } }>
                        <span className={ styles.dataMono } style={ { fontSize: '0.7rem', color: 'var(--text-light)', fontWeight: 700 } }>
                            { scenarioName } ({ stacks[ 0 ] }bb vs { stacks[ 1 ] }bb)
                        </span>
                        <span style={ { fontSize: '0.7rem', color: 'var(--text-darker)', fontWeight: 600 } }>IP: { effectiveIpRp.toFixed( 1 ) }% | OOP: { effectiveOopRp.toFixed( 1 ) }%</span>
                        <span style={ { fontSize: '0.58rem', color: rpSource.includes( 'Quantum' ) ? 'var(--accent-emerald)' : 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase' } }>RP { rpSource }</span>
                    </div>
                </div>
                <div className={ styles.headerControls }>
                    <Link href="/" className={ styles.backButton }>Início</Link>
                    <button type="button" className={ styles.sidebarToggle } onClick={ onToggleSidebar }>
                        <i className={ `fa-solid ${sidebarOpen ? 'fa-xmark' : 'fa-bars'}` } />
                    </button>
                </div>
            </div>
        </div>
    );
}
