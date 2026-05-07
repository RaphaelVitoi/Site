'use client';

/**
 * IDENTITY: Seletor de Cenários Agrupado
 * PATH: src/components/simulator/ui/ScenarioSelector.tsx
 * ROLE: Lista interativa de cenários agrupados por categoria com estilo cyber.
 * BINDING: [engine/types.ts, simulator.module.css]
 */

import { useMemo } from 'react';
import type { Scenario } from '../engine/types';
import styles from '../simulator.module.css';

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
    <div className={ styles.selectorPanel }>
      <div className={ styles.selectorHeader }>
        <h2 className={ styles.selectorTitle }>Cenários</h2>
        <span className={ styles.selectorCount }>
          { scenarios.length } cenários
        </span>
      </div>

      <div className={ styles.selectorList }>
        { groups.map( ( [ category, items ] ) => (
          <div key={ category } className={ styles.selectorGroup }>
            <h3 className={ styles.selectorGroupLabel }>
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
                  className={ `${styles.scenarioBtn} ${isActive ? styles.scenarioBtnActive : ''}` }
                  aria-pressed={ isActive }
                  title={ `${sc.name} — ${sc.narrativeSubtitle}` }
                >
                  <div
                    className={ `${styles.scenarioIconBox} ${isActive ? styles.scenarioIconBoxActive : ''} relative` }
                  >
                    <i className={ `fa-solid ${sc.icon}` } />
                    {isActive && (
                      <div className={styles.scenarioDots}>
                        <div className={styles.aggressorDot} title="Agressor" />
                        <div className={styles.defenderDot} title="Defensor" />
                      </div>
                    )}
                  </div>
                  <div className={`${styles.scenarioBtnText} min-w-0 flex-1`}>
                    <span className={`${styles.scenarioBtnSub} block`}>
                      { sc.narrativeSubtitle }
                    </span>
                    <span className={`${styles.scenarioBtnName} block`}>
                      { sc.name }
                    </span>
                  </div>
                  <span className={ styles.scenarioChevron }>
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
