# Auditoria Técnica: ActionRangeGrid & Fundamentação ICM (SOTA Gold)

## 1. Coerência Matemática e Equilíbrio (Análise de Dados)

Os grids `BTN_ACTION_GRID` e `BB_ACTION_GRID` (em `ReferencialData.ts`) exibem a morfologia de decisão para um cenário de Final Table ($11 MTT).

### Pontos Positivos:
- **Calibração de Agressão:** A dominância de `raise` no range do BTN (33.6%) reflete o cenário de *Flat Payjump* (equilibrado), onde a posição permite maximizar a pressão, mas o Risco-Premio (RP) de 21.4% dita o limite da insolvência.
- **Complexidade do BB:** O grid do BB (82.9% de reação) demonstra uma transição correta entre defesa passiva (*call*), antecipação de falhas (*fold*) e shove polarizado como mecanismo de defesa contra o roubo de blinds.

### Observações Críticas (Refinamento Sugerido):
- **Otimização de Estrutura:** As células são definidas como `RangeCell[][]`. O uso de `100.0%` é absoluto. Em equilíbrios GTO puros, esperar-se-ia frequências fracionárias (e.g., 60% raise / 40% call). Atualmente, o sistema parece estar operando em modo "Estratégia Pura" (Threshold-based), o que simplifica a visualização mas mascara a volatilidade natural do GTO.
- **Sugestão:** Implementar suporte a *frequências mixadas* no componente `ActionRangeGrid` para espelhar com maior precisão o motor Solver (HRC/Pio).

## 2. Visuais e Densidade de Informação (SOTA Gold)

O componente `ActionRangeGrid` é eficiente visualmente, mas sofre de densidade excessiva para telas pequenas.

- **Legibilidade:** As labels das mãos (e.g., "AA", "KK") em `0.45rem` são limpas, mas a distinção de cor entre ações (`raise` vs `shove`) está excelente e cumpre o propósito de diferenciação rápida.
- **Interação:** O `hover:scale-[1.2]` adiciona uma camada de "feedback tátil" soberana.
- **Problema de Escala:** A renderização fixa em 13x13 é estática. Em cenários com Ranges dinâmicos (e.g., `BayesianRangeGrid`), a performance pode colapsar se a re-renderização for desnecessária.

## 3. Conclusão da Auditoria

O sistema é **Soberano** em sua arquitetura atual, com dados consistentes entre o motor de cálculo (`ReferencialData.ts`) e a representação visual (`ReferencialAula12.tsx`).

### Plano de Refinamento:
1. **Mixagem de Ações:** Alterar o grid de `RangeAction` para permitir um array de ações por célula, habilitando a visualização de frequências GTO puras (misturadas).
2. **Debouncing:** Garantir que o `ActionRangeGrid` utilize `useMemo` com dependências de estado estritas para evitar re-cálculos durante o *live-streaming* de equidade.
3. **Legenda Dinâmica:** Adicionar uma legenda que explique que os grids atuais representam *estratégia de limiar* (threshold), justificando a ausência de mixagem absoluta neste nível de detalhe pedagógico.
