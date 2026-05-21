---
name: Prompt de Continuidade V62
description: V62 — bug potSize corrigido, audio removido, NashPanel 3 streets, tipagem TheoryPanel, atribuição Downward Drift. Próximo: auditar conteúdo icm-masterclass, depois formalizar conceitos E/P/E.
type: project
---

## Estado Atual (V62 — 2026-04-03)

### Commit
`4e45775` — fix(simulator): corrigir bug potSize e remover audio, refinar tipagem

### O que foi feito nesta sessão

1. **Bug critico potSize corrigido** — MasterSimulator.tsx: `sprData.potSize` já era pote total, mas código passava como `potAcumuladoHero` e multiplicava por 2 para `potTotal`. SPR era calculado com pote 2x maior que a realidade, superestimando exponencialmente a distorção ICM pós-flop. Fix: `potAcumuladoHero = potSize / 2`, `potTotal = potSize`.

2. **Audio removido completamente** — `useAudioFeedback` hook já inexistente, `RiskGauge` sem `isMuted`/`playTone`, `ScenarioStage` limpo (tipado com `Scenario`, morph tooltips adicionados).

3. **NashPanel remodelado** — Tabs por street (flop/turn/river), props: `nashFlop/Turn/River`, `streetFreqs`, `streetRps`, `aggressionFactor`, `pkoValue`, `isNearPayjump`, `blindsRisingSoon` + callbacks. Design com `ActionRow` para cada uma das 6 ações (ip_check, ip_bet_small, ip_bet_large, oop_call, oop_fold, oop_raise).

4. **TheoryPanel tipagem** — `as any[]` eliminados do `normalizeQuizData`. Tipagem flui de `ScenarioQuiz` sem bypass.

5. **Atribuição Downward Drift** — O'Kearney & Carter creditados inline na prosa de icm-masterclass. Verificado: 4 páginas já tinham atribuição profissional correta.

6. **Teoria absorvida** — Lidos 2 artigos GTO Wizard (MDF vs ICM, How ICM Impacts Postflop). Confirmam: MDF quebra sob ICM (valida Opção B), covering player mais agressivo (valida ΔRP), large bets suprimidas (valida k_ip_bet_large = -12). GTO Wizard descreve fenômenos sem equação geral — framework E/P/E de Raphael explica o POR QUÊ.

7. **Framework E/P/E expandido** — Memória atualizada com hierarquia completa: ICM EV → Esperança → Expectativa → Perspectiva. Caso do CL (agressivo por Perspectiva, não ICM EV puro). Caso do river (RP aumentado vs Esperança). FGS em solvers: precário (raciocínio perfeito sobre modelo incompleto).

### Pipeline de integração verificado
```
scenario.sprData.potSize (pote total BB)
  → derivePostFlopRps(potAcumuladoHero = potSize/2, potTotal = potSize)
    → ipRpFlop/Turn/River, oopRpFlop/Turn/River
      → solveIcmDistortion(rps, streetFreqs, aggressionFactor)
        → IcmDistortionResult (6 ações com center/spread/delta)
          → NashPanel (tabs por street)
```

### Próximos passos (ordem definida por Raphael)

1. **Auditar conteúdo icm-masterclass** — Melhorar, corrigir, refinar. Aprender pontos que ainda não foram tocados e que estão na página.

2. **Formalizar conceitos E/P/E** — Página dedicada no site definindo formalmente: Expectativa Matemática, Perspectiva Matemática, Esperança Matemática. Prioridade documental declarada por Raphael.

3. **CSS vars** — NashPanel e demais componentes do simulador devem usar CSS variables do globals.css (--accent-primary, --bg-card, etc.) para que mudanças futuras no site propaguem automaticamente. Raphael pediu isso explicitamente.

### Build
Zero erros. Lint passa.

### Fontes absorvidas nesta sessão
- GTO Wizard: "MDF vs ICM: Rethinking Bluffing & Defense Strategies in MTTs"
- GTO Wizard: "How ICM Impacts Postflop Strategy"
- Downward Drift: Dara O'Kearney & Barry Carter (livro de ICM / PKO Poker Strategy, D&B Poker 2023)
