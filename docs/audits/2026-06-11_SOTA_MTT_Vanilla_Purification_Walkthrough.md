# Walkthrough: Refatoração dos Motores Matemáticos (Purificação de Bounty e Pure Vanilla Standard)

Este walkthrough documenta a purificação de todas as camadas do ecossistema SOTA para remover referências a Bounty, PKO, `bountyValue`, e `pkoValue`, deixando o simulador estritamente alinhado à modalidade **Vanilla MTT Texas Holdem** (com possibilidade de upgrade futuro para PSKO).

## Mudanças Realizadas

### 1. Motores Matemáticos (Python & TypeScript)
*   **math_sota.py:** Confirmada a ausência de variáveis e referências a bounty na função principal de cálculo `compute_quantum_metrics`.
*   **perspectiva.ts & schemas.ts:** Interfaces, tipos (`PerspectivaInput`, `PerspectivaResult`) e esquemas Zod (`PerspectivaInputSchema`, `PerspectivaResultSchema`) purificados. Removidas as propriedades de bounty.
*   **rpDeriver.ts:** As funções de cálculo de Bubble Factor e Risk Premium (`deriveRps` e `derivePostFlopRps`) foram limpas de referências à fórmula simplificada de bounty, focando estritamente em ICM puro.

### 2. Interfaces do Usuário & Painéis
*   **NashPanel.tsx, PerspectivePanel.tsx, PmLensPanel.tsx, PostFlopPanel.tsx, MasterSimulator.tsx:** Removidos todos os sliders de interface sobre "Bounty Power" ou "PKO Bounty". As colunas de grades de layout foram simplificadas para uma coluna em subpainéis onde antes dividiam espaço com o slider de PKO.
*   **EquityCalculator.tsx:** Corrigida a assinatura de `generateHRCJson` removendo o terceiro parâmetro obsoleto `pkoValue`, garantindo conformidade estrita com a lib de exportação de HRC.

---

## Verificação e Validade

### 1. Testes Automatizados
*   **Backend unit tests (Pytest):** Execução de `pytest` retornou 100% de sucesso.
    *   **228 testes passaram** em 17.02 segundos, validando a estabilidade e a corretude física da PMev.
*   **Frontend unit tests (Jest):** Execução de `jest` retornou 100% de sucesso.
    *   **53 testes Jest passaram** com sucesso, abrangendo o cálculo de Malmuth-Harville e integridade matemática.

### 2. Auditoria de Tipos (TypeScript)
*   Executado `npx tsc --noEmit` no workspace do frontend para garantir conformidade total de tipagem sem erros de compilação.
    *   **Resultado:** Compilação finalizada com **0 erros**.
