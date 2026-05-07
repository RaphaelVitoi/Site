# SOTA ECOSYSTEM CHECKPOINT - 2026-05-06

## 1. ESTADO ATUAL (v4.2 GOLD)
O sistema atingiu o pico de maturidade arquitetônica e estética. Todas as camadas (Referencial, Framework e Laboratório) estão sincronizadas.

## 2. MODIFICAÇÕES CRÍTICAS
- **Topologia de Mesa:** Reconfiguração 9-max completa. BTN ancorado em 90°, SB em 130°, BB em 170°. Jogadores renderizados atrás das fichas (raio R+45).
- **Dados Empíricos:** Restauração total de `ReferencialData.ts`. Matrizes de FT9 e Bubble Factor povoadas com dados reais.
- **Laboratório Pós-Flop:** Implementado o `isLocked` state. Permite alternar entre "Sincronizado" (Master Simulator) e "Manual" (Lab Exploration).
- **Interface:** Footer minimalista (Stealth Mode), aba de Auditoria com métricas de performance JIT e Diferencial RP.

## 3. INVARIANTES A PRESERVAR
- **Math Integrity:** `npm --workspace frontend run test -- src/tests/simulator/mathematical-integrity.test.ts`
- **Seating Order:** BTN (Fundo) -> SB -> BB -> UTG -> EP -> MP -> HJ -> CO -> P9.
- **WASM Pipeline:** Comunicação via Web Workers (`insolvency.worker.ts`, `equity.worker.ts`).

## 4. PRÓXIMOS PASSOS SUGERIDOS
- Implementação de exportação de mãos para formato PokerStars/GGPoker.
- Refinamento do motor de Realização (R) para considerar tendências específicas do Vilão (Vetor Exploit Kappa).

---
*Assinado: Chico (SOTA v6)*
