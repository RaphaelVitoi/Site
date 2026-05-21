# SPEC: Controles de Cenário de Fundador

**Autor:** @planner | **Data:** 2026-03-15 | **PRD:** ./PRD.md

---

## 1. Resumo da Investigação

A análise forense do arquivo `c:\Users\Raphael\OneDrive\Documentos\Site\docs\reports\SPEC.md` confirma que a arquitetura da Calculadora ICM existente é baseada em componentes React com gerenciamento de estado local via hooks (`useState`, `useReducer`). A diretiva de replicar o DNA visual de `icm_toy_game_simulator.html` permanece em vigor.

Esta nova funcionalidade será integrada diretamente no componente orquestrador `ICMCalculator.tsx`, que já gerencia o estado dos `stacks` e `payouts`. A `SPEC.md` original já prevê um componente `ScenarioSimulator.tsx`, que será agora detalhado e implementado.

## 2. Mudanças no Frontend

### 2.1. Estrutura de Dados do Cenário

Dentro de `ICMCalculator.tsx`, uma constante `founderScenarios` será definida para conter os cenários hardcoded.

```typescript
// Em: frontend/src/components/icm/ICMCalculator.tsx

interface Scenario {
  name: string;
  stacks: number[];
}

const founderScenarios: Scenario[] = [
  { name: "Equilibrado", stacks: [10000, 5000, 5000] },
  { name: "Fundador A Lidera", stacks: [15000, 3000, 2000] },
  { name: "Fundador B Lidera", stacks: [2000, 15000, 3000] },
];
```

### 2.2. Gerenciamento de Estado

O estado do cenário ativo será gerenciado no componente `ICMCalculator.tsx` usando um hook `useState`. Esta abordagem mantém o encapsulamento e adere à arquitetura existente.

```typescript
// Em: frontend/src/components/icm/ICMCalculator.tsx

const [activeScenario, setActiveScenario] = useState<string>(
  founderScenarios.name,
);

// Handler para mudar de cenário
const handleScenarioChange = (scenarioName: string) => {
  const scenario = founderScenarios.find((s) => s.name === scenarioName);
  if (scenario) {
    // Atualiza o estado principal dos stacks, que já está conectado à UI e ao cálculo
    setStacks(scenario.stacks);
    setActiveScenario(scenarioName);
  }
};
```

### 2.3. Componentes Modificados

**`frontend/src/components/icm/ICMCalculator.tsx`**

- **Responsabilidade:** Orquestrar a lógica de cenários.
- **Modificações:**
  - Implementar a estrutura de dados `founderScenarios`.
  - Adicionar o estado `activeScenario`.
  - Implementar a função `handleScenarioChange`.
  - Passar `founderScenarios`, `activeScenario`, e `handleScenarioChange` como props para `ScenarioSimulator.tsx`.

**`frontend/src/components/icm/ScenarioSimulator.tsx`**

- **Responsabilidade:** Renderizar os botões de controle e delegar eventos de clique.
- **Props:**
  ```typescript
  interface ScenarioSimulatorProps {
    scenarios: Scenario[];
    activeScenario: string;
    onScenarioChange: (name: string) => void;
  }
  ```
- **Lógica:** Mapear a prop `scenarios` para renderizar um `<button>` para cada cenário. O botão correspondente ao `activeScenario` receberá uma classe CSS distinta para feedback visual. O `onClick` de cada botão chamará `onScenarioChange` com o nome do cenário.

## 3. Ordem de Implementação

1.  **Estrutura de Dados:** Defina a interface `Scenario` e a constante `founderScenarios` dentro de `ICMCalculator.tsx`.
2.  **Estado e Lógica:** Adicione o estado `activeScenario` e a função `handleScenarioChange` em `ICMCalculator.tsx`.
3.  **Componente de UI:** Implemente `ScenarioSimulator.tsx` para que ele receba as props e renderize os botões dinamicamente.
4.  **Integração:** Passe as props necessárias de `ICMCalculator.tsx` para `ScenarioSimulator.tsx`.
5.  **Estilização:** Aplique estilos Tailwind CSS aos botões em `ScenarioSimulator.tsx` para corresponder ao tema "dark/cyber" e para diferenciar o estado ativo.
6.  **Conexão Final:** Garanta que a chamada a `setStacks` dentro de `handleScenarioChange` esteja corretamente atualizando os `PlayerInputRow` e, por consequência, o `ICMResultChart`.

## 4. Casos de Teste

- [ ] Ao carregar, o primeiro cenário ("Equilibrado") está ativo e os stacks correspondem.
- [ ] Clicar no botão "Fundador A Dispara" atualiza os valores de stack nos inputs para `[20000, 5000, ...]`.
- [ ] Após clicar em um cenário, o `ICMResultChart` é re-renderizado com a nova distribuição de equity.
- [ ] O botão do cenário atualmente ativo possui uma cor de fundo ou borda diferente dos outros.
