import { useCallback, useMemo, useState } from 'react';
import { SCENARIOS } from '../engine/scenarios';
import type { Scenario } from '../engine/types';

export function useScenario () {
  const [ activeId, setActiveId ] = useState( SCENARIOS[ 0 ].id );

  const scenario: Scenario = useMemo( () => {
    return SCENARIOS.find( s => s.id === activeId ) || SCENARIOS[ 0 ];
  }, [ activeId ] );

  const setScenario = useCallback( ( id: string ) => {
    setActiveId( id );
  }, [] );

  return {
    scenario,
    setScenario,
    scenarios: SCENARIOS
  };
}
