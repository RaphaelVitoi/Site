'use client';

/**
 * IDENTITY: Seletor de Cenários Agrupado
 * PATH: src/components/simulator/ui/ScenarioSelector.tsx
 * ROLE: Lista interativa de cenários agrupados por categoria com estilo cyber.
 * BINDING: [engine/types.ts, simulator.module.css]
 */

import { useMemo } from 'react';
import type { Scenario } from '../engine/types';

interface ScenarioSelectorProps {
  /** Lista completa de cenários */
  scenarios: Scenario[];
  /** ID do cenário ativo */
  activeId: string;
  /** Callback de seleção */
  onSelect: ( id: string ) => void;
}

// Labels e ordem das categorias
const CATEGORY_META: Record<string, { label: string; order: number }> = {
  clinical: { label: 'Cenários Clínicos', order: 0 },
  baseline: { label: 'Linha Base (ChipEV)', order: 1 },
  toyGame: { label: 'Toy Games', order: 2 },
};

// Ícones de categoria como Unicode direto (evita dangerouslySetInnerHTML)
const CATEGORY_ICONS: Record<string, string> = {
  clinical: '\u{1F9EA}',   // 🧪
  baseline: '\u2699',      // ⚙
  toyGame: '\u{1F3AF}',   // 🎯
};

export default function ScenarioSelector ( {
  scenarios,
  activeId,
  onSelect,
}: Readonly<ScenarioSelectorProps> ) {
  // Agrupar cenários por categoria
  const groups = useMemo( () => {
    const map = new Map<string, Scenario[]>();

    for ( const sc of scenarios )
    {
      const group = map.get( sc.category ) ?? [];
      group.push( sc );
      map.set( sc.category, group );
    }

    // Ordenar grupos pela ordem definida
    return Array.from( map.entries() ).sort(
      ( a, b ) =>
        ( CATEGORY_META[ a[ 0 ] ]?.order ?? 99 ) - ( CATEGORY_META[ b[ 0 ] ]?.order ?? 99 )
    );
  }, [ scenarios ] );

  return (
    <div className="flex flex-col gap-6 bg-slate-950/50 border border-white/5 rounded-2xl p-4 shadow-inner">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <h2 className="text-sm font-black text-slate-200 uppercase tracking-widest m-0">Cenários</h2>
        <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded-md border border-white/5">
          { scenarios.length } cenários
        </span>
      </div>

      <div className="flex flex-col gap-6 overflow-y-auto pr-1" style={ { maxHeight: 'calc(100vh - 250px)' } }>
        { groups.map( ( [ category, items ] ) => (
          <div key={ category } className="flex flex-col">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <span aria-hidden="true">{ CATEGORY_ICONS[ category ] ?? '' }</span>
              { ' ' }
              { CATEGORY_META[ category ]?.label ?? category }
            </h3>

            { items.map( ( sc ) => {
              const isActive = sc.id === activeId;
              return (
                <button
                  key={ sc.id }
                  id={ `scenario-${sc.id}` }
                  onClick={ () => onSelect( sc.id ) }
                  className={ `group flex items-center w-full p-2.5 mb-2 rounded-xl border transition-all duration-300 text-left ${isActive ? 'bg-indigo-500/10 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.1)]' : 'bg-slate-900/40 border-white/5 hover:bg-slate-800/60 hover:border-white/10'}` }
                  aria-pressed={ isActive }
                  title={ `${sc.name} — ${sc.narrativeSubtitle}` }
                >
                  <div
                    className={ `flex items-center justify-center w-10 h-10 rounded-lg border transition-colors shrink-0 ${isActive ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400' : 'bg-slate-800 border-white/5 text-slate-400 group-hover:text-slate-300'}` }
                  >
                    <i className={ `fa-solid ${sc.icon}` } />
                  </div>
                  <div className="flex flex-col ml-3 grow overflow-hidden">
                    <span className={ `text-[9px] font-bold uppercase tracking-widest truncate ${isActive ? 'text-indigo-400/80' : 'text-slate-500 group-hover:text-slate-400'}` }>
                      { sc.narrativeSubtitle }
                    </span>
                    <span className={ `text-xs font-bold truncate transition-colors ${isActive ? 'text-indigo-100' : 'text-slate-300 group-hover:text-white'}` }>
                      { sc.name }
                    </span>
                  </div>
                  <span className={ `text-lg transition-transform duration-300 ${isActive ? 'text-indigo-400 translate-x-1' : 'text-slate-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-1'}` }>
                    &#x203A;
                  </span>
                </button>
              );
            } ) }
          </div>
        ) ) }
      </div>
    </div>
  );
}
