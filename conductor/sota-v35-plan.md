# V35 Estética Ouro SOTA - Refinamento Visual do Motor ICM

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** Transformar o Motor ICM (`/simulador` e componentes relacionados) em uma interface SOTA de padrão ouro. Maximizar o uso de espaço, eliminar sobreposições de texto, aplicar simetria, enquadramento elegante e densidade informacional inteligente via tipografia, CSS Grid avançado e micro-interações.

**Architecture & Design System:**
- **Tipografia:** Uso estrito de `tabular-nums` para dados numéricos. Aplicação de `line-clamp-X` e `truncate` para textos de descrições e títulos para evitar vazamento do grid. Pesos de fonte (`font-black` vs `font-medium`) revisados para contraste claro.
- **Enquadramento & Simetria (Glassmorphism SOTA):** Paddings uniformes (e.g., `p-6` para desktop, `p-4` mobile), borders em `white/5` ou `white/10`, fundos translúcidos sem poluição.
- **Economia e Maximização de Espaço:** Transformar elementos secundários em tooltips (`SotaTooltip`) ou expansivos. Agrupar dados métricos (EV, Perspectiva, Regrets) em tabelas ou mini-grids justapostos.
- **Responsividade:** Estrutura base baseada em Grid/Flex com colapso fluído. Elementos densos (como radares ou distribuições de Nash) devem ter um height delimitado com container responsivo (`h-48`, `h-64`).

**Target Components (Core do Motor ICM):**
- `src/components/simulator/MasterSimulator.tsx` (Root do Layout)
- `src/components/simulator/panels/TheoryPanel.tsx` (E os sub-painéis de tabs)
- `src/components/simulator/panels/PostFlopPanel.tsx`
- `src/components/simulator/panels/NashPanel.tsx`
- `src/components/simulator/panels/MatchupSelector.tsx`

---

### Task 1: Refatoração do `MasterSimulator.tsx` (Grid Principal e Layout Geral)

**Files:** `frontend/src/components/simulator/MasterSimulator.tsx`

- [ ] **Step 1: Otimização do Layout Grid Principal**
  - Revisar a estrutura de grid base (`grid-cols-1 xl:grid-cols-4` ou similar) para garantir que a proporção entre a barra lateral (cenários) e o palco principal seja harmoniosa.
  - Eliminar scrollbars desnecessários ou paddings que "quebram" a tela. Garantir altura flexível controlada.
  - Aplicar o aviso/erro de `exhaustive-deps` (reportado anteriormente) caso `setManualEquity` seja dependência do `useMemo`.

### Task 2: Higienização Visual dos Painéis de Controle (Matchup, Payouts, Scenarios)

**Files:**
- `frontend/src/components/simulator/panels/MatchupSelector.tsx`
- `frontend/src/components/simulator/ui/ScenarioSelector.tsx`

- [ ] **Step 1: Otimização Tipográfica e Enquadramento**
  - Reduzir espaçamentos "soltos" e usar flexboxes densos, mas simétricos.
  - Textos de nomes de cenários devem usar `truncate` para evitar empurrar o layout em telas menores.
  - Padronizar os estilos de botões ativos/inativos usando classes reutilizáveis SOTA do Tailwind.

### Task 3: Refinamento de Dados Densos (TheoryPanel e Tabs Internas)

**Files:** 
- `frontend/src/components/simulator/panels/TheoryPanel.tsx`
- `frontend/src/components/simulator/panels/NashPanel.tsx`
- `frontend/src/components/simulator/panels/PerspectivePanel.tsx`

- [ ] **Step 1: Legibilidade de Gráficos e Tabelas**
  - Para `NashPanel` e `PerspectivePanel`, aplicar fontes menores, estritamente `tabular-nums` para porcentagens e valores de (EV/PM).
  - Prevenir sobreposição de eixos ou legendas em radares e gráficos garantindo a propriedade `responsive` ou heights fixas mínimas (ex: `min-h-[250px]`).
  - Usar bordas sutis internas (`divide-y divide-white/5`) ao invés de backgrounds pesados para tabelas métricas.

### Task 4: PostFlopPanel e Árvore de Decisão (Ajuste Fino SOTA)

**Files:** `frontend/src/components/simulator/panels/PostFlopPanel.tsx`

- [ ] **Step 1: Eliminação de Sobreposição de Fontes e Uso Inteligente do Espaço**
  - Onde há detalhamentos do "Paradoxo Valuation" ou dicas, encapsular o design.
  - Ajustar botões de ação do Hero para não invadirem outras áreas do grid em resoluções `md` ou `lg`.
  - Melhorar as barras de progresso (indicadores de range) para que fiquem nítidas sem poluição textual (ex: mover o valor numérico exato % para cima da barra alinhado à direita).

### Task 5: Revisão Geral, Teste e Responsividade

- [ ] **Step 1: Build & Lint Check**
  - Após as alterações, rodar `npm run lint` para garantir 0 errors.
  - Simular a interface e verificar se todo o conteúdo do Motor ICM coube na tela principal (desktop) sem transbordar, e se empilha majestosamente no Mobile.
