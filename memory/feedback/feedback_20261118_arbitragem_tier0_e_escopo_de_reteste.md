---
name: Arbitragem soberana do Tier 0 e escopo causal de reteste
description: Regra operacional permanente definida por Raphael Vitoi (Tier 0) em 2026-11-18: zero hesitacao diante de arbitragem Tier 0 sobre hooks/governanca, e nunca reexecutar suite inteira quando o bloqueio nao envolve testes ou apos fix pontual.
type: feedback
---

Em 2026-11-18, Raphael Vitoi (Tier 0, CEO e arbitro maximo) determinou de forma definitiva:

1. **Primazia absoluta da arbitragem Tier 0:** Regras da malha (como bloqueio de `--no-verify` em hooks) existem para proteger agentes autonomos, nunca para bloquear ou gerar duvida diante de ordem expressa do Tier 0 (`CLAUDE.md` §1, Cláusula de arbitragem soberana). Ordem explicita do Tier 0 prevalece imediatamente.
2. **Causalidade no reteste antes de commit/push:** Se um commit ou push foi barrado por motivo sem relacao com testes (ex.: `commit-msg` rejeitando `Assinatura:`), a arvore de codigo nao mudou — **nao** reexecute `suite_verde.py` ou a suite inteira; valide apenas o hook/metadado que falhou e finalize o commit/push.
3. **Escopo minimo apos falha pontual:** Quando um teste especifico falha e e corrigido, reteste **apenas** os testes relacionados ao escopo alterado (nao a suite inteira do zero).

**Why:** Reexecutar `suite_verde.py` inteira apos bloqueio puramente de `commit-msg` ou apos fix isolado consome minutos de latencia, bloqueia o fluxo do Tier 0 e ignora a hierarquia soberana do ecossistema.

**How to apply:** Ao receber arbitragem explícita do Tier 0 para pular suíte/gate, execute imediatamente (declarando a arbitragem no corpo do commit quando aplicavel). Ao corrigir falha pontual ou erro de metadado, restrinja a verificação estritamente ao que mudou ou ao motivo exato do bloqueio.
