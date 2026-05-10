'use client';

/**
 * IDENTITY: Navegação de Ferramentas SOTA v4.2 Gold
 * PATH: src/components/simulator/ui/SimulatorNavigation.tsx
 * ROLE: Orquestrador de visualização para as ferramentas do laboratório.
 */

import { motion } from 'framer-motion';
import type { ActiveTool } from '../MasterSimulator';

interface SimulatorNavigationProps {
    readonly activeTool: ActiveTool;
    readonly onSelectTool: ( tool: ActiveTool ) => void;
}

export default function SimulatorNavigation ( { activeTool, onSelectTool }: SimulatorNavigationProps ) {
    const tools: { id: ActiveTool; label: string; icon: string; color: string }[] = [
        { id: 'scenario', label: 'Cenário Ativo', icon: 'fa-chess-board', color: 'indigo' },
        { id: 'perspectiva', label: 'Quantum PM', icon: 'fa-atom', color: 'emerald' },
        { id: 'calculator', label: 'Calculadora', icon: 'fa-calculator', color: 'sky' },
        { id: 'matchup', label: 'Matchups', icon: 'fa-people-arrows', color: 'violet' },
        { id: 'comparar', label: 'Radar Topologia', icon: 'fa-bullseye', color: 'indigo' },
        { id: 'posflop', label: 'Pós-Flop', icon: 'fa-layer-group', color: 'rose' },
        { id: 'cfr', label: 'CFR & IA', icon: 'fa-network-wired', color: 'rose' },
    ];

    return (
        <nav className="flex flex-wrap items-center gap-3 p-2 bg-slate-950/40 backdrop-blur-2xl rounded-3xl border border-white/5 shadow-inner relative overflow-hidden group/nav">
            <div className="absolute inset-0 bg-radial-[at_top_left] from-white/5 to-transparent pointer-events-none" />
            
            { tools.map( t => {
                const isActive = activeTool === t.id;
                
                return (
                    <button
                        key={ t.id }
                        onClick={ () => onSelectTool( t.id ) }
                        className={ `relative px-5 py-3 rounded-2xl text-[0.65rem] font-black uppercase tracking-[0.15em] transition-all duration-500 flex items-center gap-3 whitespace-nowrap active:scale-95 group/btn ${
                            isActive 
                            ? 'text-white shadow-2xl scale-[1.02]' 
                            : 'text-text-muted hover:text-text-main hover:bg-white/5'
                        }` }
                    >
                        { isActive && (
                            <motion.div
                                layoutId="active-tool-bg"
                                className="absolute inset-0 bg-slate-800/80 border border-white/10 rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
                                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        
                        <div className={`relative z-10 w-5 h-5 flex items-center justify-center transition-transform duration-500 ${isActive ? 'scale-110' : 'opacity-60 group-hover/btn:opacity-100 group-hover/btn:scale-110'}`}>
                            <i className={`fa-solid ${t.icon} ${isActive ? 'text-accent-indigo-light' : 'text-text-darker'}`} />
                        </div>
                        
                        <span className="relative z-10">{ t.label }</span>
                        
                        { isActive && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="relative z-10 w-1.5 h-1.5 rounded-full bg-accent-indigo shadow-[0_0_8px_var(--accent-indigo)]"
                            />
                        )}
                    </button>
                );
            } ) }
        </nav>
    );
}
