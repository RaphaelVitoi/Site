# PLANO 2-B — painel de acesso rápido

> **Este arquivo é um PONTEIRO, não uma cópia.** O plano vive inteiro em
> [`reports/PLANO-2B-CURADORIA-ESTRUTURAL.md`](reports/PLANO-2B-CURADORIA-ESTRUTURAL.md).
> Duplicar o conteúdo aqui produziria a divergência que este plano existe para
> resolver — foi exatamente assim que dois `MODUS_OPERANDI.md` passaram meses
> contando histórias diferentes.
>
> O que este painel tem, e o outro não, é **estado**: em que pé está cada frente,
> e o que exige decisão do vértice.

**Atualizado em 2026-08-28** · `master 48b15e0e` · suíte 508 (viva) / 504 + 4 skipped (isolada)

---

## Estado das frentes

| # | Frente | Estado | Onde ler |
| :--- | :--- | :--- | :--- |
| 0.5 | **Prelúdio** — as duas portas de entrada | ✅ concluído | §0.5 do plano |
| 1 | **Homônimos** — declarar o canônico | ✅ entregue | §1.6 do plano · [`data/INDICE_CANONICO_GOVERNANCA.json`](data/INDICE_CANONICO_GOVERNANCA.json) |
| 2 | **Âncoras e índices** — `RECORD_INDEX` e §13.F | ✅ entregue | §2.3 do plano · [`scripts/ops/record_index.py`](scripts/ops/record_index.py) |
| 3 | **Contexto e memória** — qual corpus a memória deve ter | ⏸ decisão do vértice | §3.1 a §3.3 do plano |
| 4 | **Routing** — qual das duas políticas é a autoridade | ⏳ aberta | §4 do plano |
| 5 | **Referenciais** — quem aponta para quem | ✅ entregue | §5.1 do plano · [`scripts/ops/record_gate.py`](scripts/ops/record_gate.py) |
| 6 | **Imports e exports** — morto vs. não integrado | ⏳ aberta | §6 do plano |
| 7 | **Higienização** — mover e remover | 🔒 terminal, só depois de 1 a 6 | §7 do plano |

**A frente 4 é a que mais destrava:** enquanto não se decidir se a autoridade é a
política *declarada* ou a *executada*, toda melhoria em qualquer uma das duas tem
chance de virar retrabalho. E ela é pré-requisito da frente 6.

---

## O que espera decisão sua

| # | Item | Por que não decidi eu |
| :--- | :--- | :--- |
| 1 | Os 62 fontes modificados nos submódulos — PR upstream, fork próprio ou descartar | Patches já extraídos; o risco está contido, a direção é sua |
| 2 | As 2 extensões no ledger do CLI e fora de `extensions/` | Não sei se a instalação quebrou ou se o caminho é outro |
| 3 | Instalar LanceDB ao lado do Chroma | Faz sentido técnico, **com a partição declarada antes** (§3.2) |
| 4 | Rotação das 4 chaves OpenRouter | Ato no provedor, fora do alcance daqui |
| 5 | O handoff de Chrome/CDP de outra sessão | Trabalho de terceiro; só normalizei a âncora |

---

## Como rodar o que a sessão construiu

```bash
nexus index --suspeitos          # estado derivado dos registros, agora
nexus test --isolado             # suíte em worktree próprio, sem tocar seu working tree
uv run python scripts/ops/suite_isolada.py --repo ../antigravity
```

---

## Leitura, em ordem

1. [`reports/RETROSPECTIVA-2026-08-28-sessao.md`](reports/RETROSPECTIVA-2026-08-28-sessao.md) — o antes, o processo, os padrões acumulados
2. [`reports/HANDOFF-2026-08-28-auditorias-e-preludio.md`](reports/HANDOFF-2026-08-28-auditorias-e-preludio.md) — estado e prompt de continuação
3. [`reports/PLANO-2B-CURADORIA-ESTRUTURAL.md`](reports/PLANO-2B-CURADORIA-ESTRUTURAL.md) — o plano completo
4. [`reports/INTERLUDIO-2026-08-28-concorrencia-e-isolamento.md`](reports/INTERLUDIO-2026-08-28-concorrencia-e-isolamento.md) — concorrência, isolamento e o P0
5. [`reports/AUDITORIA-2026-08-28-skills.md`](reports/AUDITORIA-2026-08-28-skills.md) — as 8 skills
