# SPEC: MasterSimulator Component (TrueICM Engine)

**ID:** SPEC-20260317-001
**Relacionado:** [[PRD_SIMULADOR_ICM.md]]
**Status:** Pendente de Auditoria (@auditor)
**Stack:** React 19, Tailwind CSS, Recharts (ou Framer Motion para visualização vetorial).

## 1. Arquitetura do Componente

O componente `SimuladorICM.tsx` deve ser um **Client Component** (devido à interatividade intensa) localizado em `frontend/src/components/`.

### 1.1 Estrutura de Sub-componentes

- `RiskVisualizer`: Canvas/SVG que renderiza a distorção da equidade (Geometria do Risco).
- `ControlPanel`: Sliders de precisão para input de variáveis.
- `ArchetypeSelector`: Botões de disparo rápido para os 4 cenários clínicos.
- `ComparisonMetrics`: Display de KPIs (ChipEV vs ICMev).

## 2. Motor Matemático (Logic Layer)

As funções de cálculo devem ser memorizadas via `useMemo` para evitar re-renders custosos durante o deslize dos sliders.

```typescript
// Constantes e Fórmulas SOTA
const calculateBF = (rp: number) => 1 / (1 - rp);
const calculateRequiredEquity = (potOdds: number, rp: number) => potOdds + rp;
const calculateMDF = (potSize: number, betSize: number, rp: number) => {
  const chipMDF = potSize / (potSize + betSize);
  return chipMDF * (1 - rp); // Redução da frequência de defesa pela gravidade do ICM
};
```

## 3. Estado e Variáveis de Entrada

| Variável       | Tipo  | Range     | Padrão | Descrição                                     |
| :------------- | :---- | :-------- | :----- | :-------------------------------------------- |
| `riskPremium`  | float | 0.0 - 0.5 | 0.0    | Taxa extra de equidade necessária (0% a 50%). |
| `potSize`      | float | 1 - 200   | 10.0   | Tamanho do pote em BBs.                       |
| `betSize`      | float | 1 - 200   | 5.0    | Tamanho da aposta enfrentada.                 |
| `heroStack`    | float | 1 - 100   | 40.0   | Stack do Hero em BBs.                         |
| `villainStack` | float | 1 - 100   | 50.0   | Stack do Villain em BBs.                      |

## 4. Definição dos Arquétipos (Data Structure)

```json
{
  "pacto_silencioso": {
    "name": "O Pacto Silencioso",
    "rp": 0.22,
    "description": "CL vs Vice CL. Sobrevivência mútua é prioridade.",
    "theme": "indigo"
  },
  "paradoxo_valuation": {
    "name": "Paradoxo do Valuation",
    "rp": 0.18,
    "description": "Mid Stack estrangulado pela pressão do Big Stack.",
    "theme": "rose"
  },
  "guerra_lama": {
    "name": "A Guerra na Lama",
    "rp": 0.08,
    "description": "Short vs Short. O peso do laddering passivo.",
    "theme": "emerald"
  },
  "ameaca_organica": {
    "name": "A Ameaça Orgânica",
    "rp": 0.12,
    "description": "Proteção do God Mode contra dobras indesejadas.",
    "theme": "amber"
  }
}
```

## 5. UI/UX - Design System (Cyber-Dark)

- **Cores:**
  - Background: `#0f172a` (slate-900) com transparência glassmorphism.
  - Bordas: `rgba(255, 255, 255, 0.1)`.
  - Acentuação: Gradientes conforme o tema do arquétipo.
- **Interatividade:**
  - Sliders com feedback tátil visual.
  - Gráfico de "Drift": Mostrar uma curva de equidade que "murcha" conforme o `riskPremium` aumenta.
  - Tooltips explicativos para `Bubble Factor` e `MDF`.

## 6. Fluxo de Implementação

1. Criar o esqueleto do componente com `useState` para os inputs básicos.
2. Implementar o `Visualizer` usando `Framer Motion` para animar a transição entre estados de ChipEV e ICMev.
3. Integrar os 4 arquétipos via botões de preset.
4. Validar contra o **Caso de Teste 1**: Se Pote=10, Bet=10 (ChipMDF = 50%) e RP=20%, o ICM_MDF deve resultar em 40% (50% \* 0.8).

## 7. Verificação de Simetria

- O componente deve ser importado e renderizado na seção `#simulador-section` da página `aula-icm/page.tsx`.
- Deve respeitar as fontes e o grid definidos no `globals.css`.

---

_Assinado por @planner (Via CHICO Smart CLI)_---

_Assinado por @planner (Via CHICO Smart CLI)_
