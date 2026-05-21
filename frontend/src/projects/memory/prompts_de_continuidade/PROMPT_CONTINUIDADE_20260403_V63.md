---
name: Prompt de Continuidade V63
description: V63 — Auditoria completa simulador, morphs conectados (12 cenários), Matchup fix (lazy→direto), Radar fix (nashFlop prop), label especulação, solveNash removido. Próximo: auditar conteúdo icm-masterclass → formalizar E/P/E → CSS vars.
type: project
---

## Estado Atual (V63 — 2026-04-03)

### Commit
`af610d8` — fix(simulator): conectar morphs aos cenários, corrigir Matchup/Radar, limpar alias morto

### O que foi feito nesta sessão

1. **Auditoria completa do simulador + frontend** — Build passa limpo. Diagnosticados 6 issues, 4 corrigidos nesta sessão:

2. **ipMorph/oopMorph conectados a todos os 12 cenários** — Antes: campo undefined em todos, RiskGauge mostrava '--', 18 tooltips MORPH_TOOLTIPS nunca ativados. Agora:
   - chipev: Polar Perfeito / Defesa Base
   - icmev-puro: Valor Estrito / Condensado
   - paradoxo: Valor Estrito / Condensado
   - pacto: Polar Controlado / Inelástico
   - batata: Push Estendido / Condensado Extremo
   - agonia: Modo Predador / Bluffcatcher
   - lama: Especulativo / Call Seletivo
   - ameaca: Polar Controlado / Inelástico
   - especulacao: Especulativo / Call Seletivo
   - nodelock-b20: Valor Estrito / Flat Call Massivo
   - sniper: Modo Predador / Zona de Paralisia
   - bully: Modo Predador / Zona de Paralisia

3. **MatchupSelector fix** — React.lazy falhava silenciosamente no Turbopack (loading infinito). Convertido para import direto. Funciona.

4. **ComparisonRadar fix** — nashFlop não era passado como prop, bluff/defense no radar eram 0. Agora recebe nashFlop do MasterSimulator. Dropdown mostra 11 cenários (12 - o ativo, comportamento correto).

5. **Label cenário especulação corrigido** — ipPos 'BTN (CL)' → 'BTN (Mid)', oopPos 'BB (Mid)' → 'BB (CL)'. O 35bb NÃO é o CL, o 80bb é.

6. **solveNash alias removido** — Zero consumidores no codebase. Código morto eliminado.

### Issues pendentes da auditoria

| # | Sev | Item | Status |
|---|-----|------|--------|
| 1 | Alto | Quiz 1 opção (placeholder) em todos os cenários | PENDENTE |
| 2 | Alto | Theory 1 frase (placeholder) em todos os cenários | PENDENTE |
| 3 | Info | dangerouslySetInnerHTML em TheoryPanel (fonte interna, sem risco XSS) | MONITORAR |
| 4 | Info | `as any` em RiskGauge (Framer Motion limitation) e testes | ACEITÁVEL |
| 5 | Pendente | CSS vars (globals.css) em todos os painéis do simulador | PIPELINE V62 ITEM 3 |

### Pipeline de próximos passos (ordem de Raphael)

1. **Auditar conteúdo icm-masterclass** — Melhorar, corrigir, refinar. Aprender pontos que ainda não foram tocados.
2. **Formalizar conceitos E/P/E** — Página dedicada definindo Expectativa, Perspectiva, Esperança Matemática.
3. **CSS vars** — Migrar cores hardcoded para CSS variables do globals.css.
4. **Quiz expandir** — 3-4 opções por cenário (atualmente 1 = trivial).
5. **Theory expandir** — Conteúdo real do framework E/P/E substituindo placeholders de 1 frase.

### Explicação: por que não usar âncora empírica para todos os cenários

Os **coeficientes K** (calibrados na âncora ΔRP=8.5) SÃO usados em todos os cenários. O que varia são as **frequências ChipEV de entrada** (defaultStreetFreqs). Essas dependem de:
- Posições relativas (BTN vs BB ≠ UTG vs BB)
- SPR efetivo (shove 12bb ≠ deep 55bb)
- Board texture
- Número de jogadores

Para calibrar cada cenário, precisaria rodar cada spot no GTO Wizard. O motor compensa com spread (incerteza proporcional ao desvio da âncora).

### Build
Zero erros. Lint passa.
