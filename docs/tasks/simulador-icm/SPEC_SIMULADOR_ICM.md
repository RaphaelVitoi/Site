# SPEC: MasterSimulator Component (TrueICM Engine)

**ID:** SPEC-20260317-001
**Relacionado:** [[PRD_SIMULADOR_ICM.md]]
**Status:** Pendente de Auditoria (@auditor)
**Stack:** React 19, Tailwind CSS, Recharts (ou Framer Motion para visualizacao vetorial).

## 1. Arquitetura do Componente

O componente `SimuladorICM.tsx` deve ser um **Client Component** (devido a interatividade intensa) localizado em `frontend/src/components/`.

### 1.1 Estrutura de Sub-componentes

- `RiskVisualizer`: Canvas/SVG que renderiza a distorcao da equidade (Geometria do Risco).
- `ControlPanel`: Sliders de precisao para input de variaveis.
- `ArchetypeSelector`: Botoes de disparo rapido para os 4 cenarios clinicos.
- `ComparisonMetrics`: Display de KPIs (ChipEV vs ICMev).

## 2. Motor Matematico (Logic Layer)

As funcoes de calculo devem ser memorizadas via `useMemo` para evitar re-renders custosos durante o deslize dos sliders.

```typescript
// Constantes e Formulas SOTA
const calculateBF = (rp: number) => 1 / (1 - rp);
const calculateRequiredEquity = (potOdds: number, rp: number) => potOdds + rp;
const calculateMDF = (potSize: number, betSize: number, rp: number) => {
  const chipMDF = potSize / (potSize + betSize);
  return chipMDF * (1 - rp); // Reducao da frequencia de defesa pela gravidade do ICM
};
```

## 3. Estado e Variaveis de Entrada

| Variavel       | Tipo  | Range     | Padrao | Descricao                                     |
| :------------- | :---- | :-------- | :----- | :-------------------------------------------- |
| `riskPremium`  | float | 0.0 - 0.5 | 0.0    | Taxa extra de equidade necessaria (0% a 50%). |
| `potSize`      | float | 1 - 200   | 10.0   | Tamanho do pote em BBs.                       |
| `betSize`      | float | 1 - 200   | 5.0    | Tamanho da aposta enfrentada.                 |
| `heroStack`    | float | 1 - 100   | 40.0   | Stack do Hero em BBs.                         |
| `villainStack` | float | 1 - 100   | 50.0   | Stack do Villain em BBs.                      |

## 4. Definicao dos Arquetipos (Data Structure)

```json
{
  "pacto_silencioso": {
    "name": "O Pacto Silencioso",
    "rp": 0.22,
    "description": "CL vs Vice CL. Sobrevivencia mutua e prioridade.",
    "theme": "indigo"
  },
  "paradoxo_valuation": {
    "name": "Paradoxo do Valuation",
    "rp": 0.18,
    "description": "Mid Stack estrangulado pela pressao do Big Stack.",
    "theme": "rose"
  },
  "guerra_lama": {
    "name": "A Guerra na Lama",
    "rp": 0.08,
    "description": "Short vs Short. O peso do laddering passivo.",
    "theme": "emerald"
  },
  "ameaca_organica": {
    "name": "A Ameaca Organica",
    "rp": 0.12,
    "description": "Protecao do God Mode contra dobras indesejadas.",
    "theme": "amber"
  }
}
```

## 5. UI/UX - Design System (Cyber-Dark)

- **Cores:**
  - Background: `#0f172a` (slate-900) com transparencia glassmorphism.
  - Bordas: `rgba(255, 255, 255, 0.1)`.
  - Acentuacao: Gradientes conforme o tema do arquetipo.
- **Interatividade:**
  - Sliders com feedback tatil visual.
  - Grafico de "Drift": Mostrar uma curva de equidade que "murcha" conforme o `riskPremium` aumenta.
  - Tooltips explicativos para `Bubble Factor` e `MDF`.

## 6. Fluxo de Implementacao

1. Criar o esqueleto do componente com `useState` para os inputs basicos.
2. Implementar o `Visualizer` usando `Framer Motion` para animar a transicao entre estados de ChipEV e ICMev.
3. Integrar os 4 arquetipos via botoes de preset.
4. Validar contra o **Caso de Teste 1**: Se Pote=10, Bet=10 (ChipMDF = 50%) e RP=20%, o ICM_MDF deve resultar em 40% (50% \* 0.8).

## 7. Verificacao de Simetria

- O componente deve ser importado e renderizado na secao `#simulador-section` da pagina `aula-icm/page.tsx`.
- Deve respeitar as fontes e o grid definidos no `globals.css`.

---

_Assinado por @planner (Via CHICO Smart CLI)_---

_Assinado por @planner (Via CHICO Smart CLI)_
