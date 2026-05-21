import type { ActiveTool } from '../MasterSimulator';

interface SimulatorNavigationProps {
    readonly activeTool: ActiveTool;
    readonly onSelectTool: ( tool: ActiveTool ) => void;
}

export default function SimulatorNavigation ( { activeTool, onSelectTool }: SimulatorNavigationProps ) {
    const tools: { id: ActiveTool; label: string; icon: string }[] = [
        { id: 'scenario', label: 'Cenario Ativo', icon: 'fa-chess-board' },
        { id: 'perspectiva', label: 'Quantum PM', icon: 'fa-atom' },
        { id: 'calculator', label: 'Calculadora', icon: 'fa-calculator' },
        { id: 'matchup', label: 'Matchups', icon: 'fa-people-arrows' },
        { id: 'comparar', label: 'Radar', icon: 'fa-bullseye' },
        { id: 'posflop', label: 'Pos-Flop', icon: 'fa-layer-group' },
        { id: 'cfr', label: 'CFR & IA', icon: 'fa-network-wired' },
    ];

    return (
        <nav style={ { display: 'flex', gap: '0.5rem', flexWrap: 'wrap', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' } }>
            { tools.map( t => (
                <button
                    key={ t.id }
                    onClick={ () => onSelectTool( t.id ) }
                    style={ {
                        padding: '0.5rem 0.8rem',
                        borderRadius: '8px',
                        background: activeTool === t.id ? 'rgba(99,102,241,0.15)' : 'rgba(30,41,59,0.4)',
                        border: `1px solid ${activeTool === t.id ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.05)'}`,
                        color: activeTool === t.id ? 'var(--accent-indigo-light)' : 'var(--text-muted)',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        transition: 'all 0.2s'
                    } }
                >
                    <i className={ `fa-solid ${t.icon}` } />
                    { t.label }
                </button>
            ) ) }
        </nav>
    );
}
