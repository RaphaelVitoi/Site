import { useCallback, useMemo, useState } from 'react';
import type { Scenario } from '../engine/types';

export function useScenario ( initialScenarios: Scenario[] ) {
  const [ activeId, setActiveId ] = useState( initialScenarios[ 0 ]?.id ?? '' );

  const scenario: Scenario = useMemo( () => {
    return initialScenarios.find( s => s.id === activeId ) || initialScenarios[ 0 ];
  }, [ activeId, initialScenarios ] );

  const setScenario = useCallback( ( id: string ) => {
    setActiveId( id );
  }, [] );

  return {
    scenario,
    setScenario,
    scenarios: initialScenarios
  };
}
