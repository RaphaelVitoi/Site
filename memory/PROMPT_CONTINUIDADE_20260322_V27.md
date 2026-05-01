---
name: Prompt de Continuidade V27
description: Estado da sessao 20260322/23 - Classificacao estruturas corrigida (FLAT 18.8%), tooltips NashPanel fixados, teoria consolidada em memoria. Auditoria 10/10 OK.
type: project
---

# Continuidade — Sessão 20260322 V27

## Ultimo commit: 96f3531
- NashPanel: tooltips ΔRP/Curv convertidos de title nativo para InfoTooltip (portal)
- fontSize NashPanel: 12 ocorrências abaixo de 0.58rem corrigidas

## Commits desta sessão (Claude)
1. `e06f007` - ReferencialAula12: grid 2-col, fichas BTN equalizadas, layout refinado
2. `ecc2c3f` - Legenda simétrica (grid 3-col 1fr), HÍBRIDA destacada, texto refinado
3. `eac1b93` - pct1 dinâmico, threshold TOP-HEAVY honesto (2× share plano)
4. `5a1c0de` - Legenda corrigida com framework Raphael (5 tipos)
5. `2596649` - Denominador corrigido TOTAL_POOL (não TOTAL_PRIZES), classificação FLAT
6. `96f3531` - NashPanel tooltips ΔRP/Curv portal + fontSize fix

## Sessão Gemini (V26) integrada
- V26 movido para memory e indexado
- Gemini fez: grid 1.2fr/1fr, display:contents, tipografia 0.85/0.75rem, barras TOTAL_POOL
- Integração funil: card Motor ICM em page.tsx, link Header, botão Início MasterSimulator
- Footer links corrigidos

## Teoria consolidada em memória
- **NOVO**: `project_classificacao_estruturas_premios.md` — framework completo:
  - TOP-HEAVY: 1º ≥ 25% do TOTAL_POOL
  - FLAT: 1º ≤ 18% do TOTAL_POOL
  - HÍBRIDA: 18-24%, análise de exclusão
  - PKO: top-heavyssimo, bounty compensa
  - SATÉLITE: tickets idênticos, sobrevivência pura
  - Denominador correto: TOTAL_POOL (prize pool torneio inteiro desde a bolha), NÃO TOTAL_PRIZES (soma dos prêmios ITM)
  - Esta estrutura: $237.34 / $1260 = 18.8% → FLAT (anomalia de 0.8pp não descaracteriza)

## Auditoria completa ReferencialAula12 — 10/10 OK
1. Dados consistentes (PRIZES, TOTAL_POOL, BF_MATRIX)
2. Legenda de estruturas coerente
3. Barras usam TOTAL_POOL
4. SVG Mesa (fichas SB/BB/ANTE/BTN corretas)
5. Tipografia: nenhum fontSize < 0.58rem
6. Layout: grid 2-col, maxWidth 1080px
7. Ranges: BTN 33.6%, BB 82.9%
8. Board: KJT-2-3 (internamente consistente)
9. BF Matrix 9x9: valores 1.07-2.64
10. JSX: sem erros

## Estado atual
- ReferencialAula12: layout e dados corretos, auditado
- NashPanel: tooltips funcionais via portal
- Todos os commits feitos e limpos
- TOTAL_POOL confirmado como denominador correto pelo usuário

## Pendentes
- Confirmar valor exato de TOTAL_POOL (usuário disse "depois confirmo o valor total desde a bolha")
- PKO Value feature (aprovada em memória, não iniciada)
- Validação visual browser localhost:3000/tools/simulador
- Opções V26: (A) Refinamento EquityCalculator, (B) Painéis interativos, (C) Polimento responsivo mobile
