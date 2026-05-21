import { useState, useMemo } from 'react';
import { ALL_SCENARIOS } from '../../../data/scenarios';

export function useScenario() {
  const [activeId, setActiveId] = useState(ALL_SCENARIOS[0].id);

  const rawScenario = useMemo(() => {
    return ALL_SCENARIOS.find(s => s.id === activeId) || ALL_SCENARIOS[0];
  }, [activeId]);

  // Adaptador para injetar os dados no padrão que o MasterSimulator espera
  const scenario = useMemo(() => ({
    id: rawScenario.id,
    name: rawScenario.label,
    narrativeTitle: rawScenario.label,
    narrativeSubtitle: rawScenario.context,
    verdict: 'Avaliação de Risco',
    ipRp: rawScenario.data.ip.rp,
    oopRp: rawScenario.data.oop.rp,
    ipPos: rawScenario.data.ip.pos,
    oopPos: rawScenario.data.oop.pos,
    ipMorph: rawScenario.data.ip.morph,
    oopMorph: rawScenario.data.oop.morph,
    stacks: [parseInt(rawScenario.data.ip.stack), parseInt(rawScenario.data.oop.stack)],
    category: 'toyGame', // Padrão
    theory: rawScenario.content,
    sprData: [],
    exploit: [],
    quiz: []
  }), [rawScenario]);

  const scenariosList = ALL_SCENARIOS.map(s => ({ ...s, name: s.label }));

  return {
    scenario,
    setScenario: setActiveId,
    scenarios: scenariosList
  };
}