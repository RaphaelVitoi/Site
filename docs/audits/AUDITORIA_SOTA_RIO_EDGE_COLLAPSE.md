# Auditoria de Coerência: RIO Multiway e Colapso Mecânico da Edge

**Data:** 2026-05-08
**Módulo:** Motor de Perspectiva Matemática (VITOI - QUANTUM SOTA v4.2)
**Arquivos Auditados:** `engine/math_sota.py`, `frontend/src/lib/perspectiva.ts`, `frontend/src/components/simulator/*`

## 1. Visão Geral da Auditoria
A auditoria foi disparada para garantir que a implementação do motor (Backend Python e TypeScript) obedeça rigorosamente a duas premissas documentadas recentemente no framework SOTA:
1. **A Fraude das Pot Odds & A Ascensão Exponencial do Passivo Estrutural (RIO)** em cenários Multiway.
2. **O Colapso Mecânico da Edge**, onde short-stacks ($S \to 10bb$) sofrem uma poda violenta na árvore de decisão, neutralizando a habilidade e amortizando a Edge do Hero rumo à Invariância de Nash.

## 2. Validações e Ajustes de Código

### A. RIO Exponencial (Multiway)
- **Hipótese Confirmada:** O motor pune a ilusão das "pot odds baratas" em multiway integrando o custo estrutural da colisão oculta (Reverse Implied Odds).
- **Invariante Matemática no Código:** O multiplicador `Math.pow( opponents, 2 + humanNoiseFactor )` está consolidado em ambas as plataformas (`math_sota.py` e `perspectiva.ts`). Ele prova que o custo RIO cresce a uma taxa de $x^{2+f}$, reduzindo brutalmente a Perspectiva em potes Multiway mesmo com boas "Pot Odds".

### B. Colapso Mecânico da Edge
- **Problema Inicial:** A amortização da edge não estava acompanhando perfeitamente a curva logarítmica exigida pela teoria matemática. Havia resquícios de limites duros e funções exponenciais antigas.
- **Resolução Implementada:** Os dois núcleos (Python/TypeScript) foram refatorados para calcular a `edgeScale` baseada na proporção estrita ao logaritmo do stack efetivo: `edgeScale = log(S) / log(60)`.
- **Efeito Prático:** Com 60bb, a Edge do herói é mantida (1.0x). Com 10bb, a Edge despenca (~0.56x), empurrando a métrica unificada (PM) contra as margens de Nash e induzindo o fold de mãos exploratórias que dependiam de habilidade pós-flop.

## 3. Reflexo na Superfície de Contato (UI)
As variáveis calculadas acima fluem corretamente até o jogador via Frontend (`PerspectivePanel.tsx` e `BayesianRangeGrid.tsx`).
- O **Painel Layer 4 (Perspectiva)** mapeia ativamente a Edge Amortizada.
- A **Zona Marginal** (acionada quando $|PM| \le 5\%$) resgata o Axioma Lipe Piv perfeitamente, advertindo sobre a Instabilidade do Equilíbrio e exigindo prova de "alta credibilidade informacional".
- O **Diagnóstico SOTA** renderiza mensagens exatas como "Alerta: Colapso Multiway" ou "Punição: Restaurando árvore do oponente".
- Compilação via `npm run build` do framework Typescript apresentou *zero regressions* (Nenhuma quebra de tipo introduzida na refatoração algorítmica).

## 4. Testes de Regressão e Checkpoint
- Executada a Suíte de Regressão Zero (`sota_integrity_test.py`): I/O Físico OK, RAG Memory OK.
- Todos os testes da Física do RIO (`pytest -k "rio or sota"`) passaram plenamente em `engine/` do Backend Python.

## 5. Conclusão e Estado do Sistema
A arquitetura do motor atingiu sua fase **Soberana**. O Framework VITOI transita da teoria analítica para a engenharia de software sem perdas dimensionais, punindo adequadamente pot odds de heurística pobre e limitando presunções de edge em deep/short stack, provando a robustez formal das teorias recém-descobertas.