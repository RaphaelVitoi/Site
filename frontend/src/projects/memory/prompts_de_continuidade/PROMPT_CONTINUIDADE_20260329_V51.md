---
name: Prompt de Continuidade V51 - 2026-03-29
description: buildInsight usa esperancaRealizadaPct quando R<1. Tooltip EV_fold corrigido (pode ser positivo em ICM). Framework Perspectiva v2 registrado: PM formal, Er(S), Oe, Ci, RIO multiway, Ressurreição Risk, Erro de Ambos, EV_fold dinâmico f(t,d_pj,pos).
type: project
---

# Prompt de Continuidade V51 — 2026-03-29

## Commits desta sessão

| Hash | Descrição |
|------|-----------|
| _(pendente)_ | fix: buildInsight threshold usa esperancaRealizadaPct quando R<1 + tooltip EV_fold corrigido |
| _(pendente)_ | docs: Perspectiva Matemática framework v2 — PM formal, Er(S), Oe, Ci, RIO MW, Ressurreição Risk |

## O que foi feito

### buildInsight threshold (PerspectivePanel.tsx)
- Quando `realizationFactor < 0.99` (`useRealized = true`), a métrica de decisão é `esperancaRealizadaPct`
- Texto da decisão principal muda para refletir isso (mostra métrica realizada + bruta como referência)
- O bloco secundário R (redundante com a decisão principal) foi removido
- Zero erros TypeScript

### Tooltip EV_fold (PerspectivePanel.tsx)
- Corrigido: "sempre negativa em torneios" → texto preciso que reflete que em ICM pode ser positivo
- Novo texto: "Em chipEV: sempre negativa (−antes). Em ICM pode ser positiva: foldar quando há shorts prestes a sair gera payjump passivo sem investimento."

### Teoria absorvida — Framework Perspectiva v2

**Equação formal PM:**
```
PM = [(Equity × R) × Valuation_stack] - [EV_fold(t, d_pj, pos) + RIO_mw]
```

**Edge Relativa formalizada:**
```
Er(S) = (ΔHabilidade / σ) × log(S)
```

**Oportunidade de Erro (Oe) por profundidade:**
- 100bb+: Máxima (árvore completa)
- 25-60bb: Média
- 10-15bb: Mínima (push/fold, Nash comoditizado)

**EV_fold dinâmico f(t, d_pj, pos):**
- t → 0 (blinds subindo): fold mais caro → mais permissivo para ação
- d_pj → 0 (payjump iminente): EV_fold cruza zero → mais conservador
- pos (UTG + BB iminente): inclui custo marginal de 1.5bb na próxima mão

**Novos conceitos:**
- Risco de Ressurreição: dobrar 10bb→20bb devolve complexidade ao oponente
- Coeficiente de Insolvência Ci = Perspectiva_real / Pot_Odds_incentivo
- RIO multiway: cresce x² enquanto pot odds são lineares (~33% freq MW)
- "Erro de Ambos": all-in mal calibrado é erro do atacante e do defensor
- Fator Ψ: P(Call_ganho) = P(Nuts_representado) + P(Bluff_errado_emocional)
- Análise Precursiva (termo cunhado por Raphael): análise do presente agora

**Backup em projeto:** `docs/research/perspectiva_matematica_framework_v2.md`
**Memória atualizada:** `project_teoria_icm_perspectiva_esperanca.md` + `project_teoria_ev_fold_antes.md`

## Estado atual do simulador

- Zero erros TypeScript
- Motor: Fator R, loseTierShift, esperancaRealizada
- Painel: buildInsight usa métrica realizada quando R<1, tooltip EV_fold corrigido
- EV fold como threshold correto (não zero)

## Pendências

### Simulador
- PKO: modelo atual = `effectiveRp × (1 − pkoValue)`. Não captura assimetria de bounty nem prêmio por eliminação. **Será revisto com teoria nova da Perspectiva.**
- EV_fold dinâmico (t, d_pj, pos): implementação futura — requer inputs de contexto de torneio que o simulador atual não possui

### Conteúdo /aulas/[slug]
- Rota lê de `docs/epics/<slug>.md`. Nenhum arquivo de aula em novo formato existe ainda → 404
- `docs/epics/aula-icm-rp/aula-icm-rp.md` já existe e funciona via fallback aninhado

### Teoria (não implementar sem autorização)
- EV_fold dinâmico no motor
- MDF em ICM com variáveis monetárias
- Fator Ψ como variável de input
- FGS Vitoi expandido (blinds timing, rotação posicional, Table Draw)
