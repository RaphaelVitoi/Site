# PLANO 2-B — painel de acesso rápido

> **Este arquivo é um PONTEIRO, não uma cópia.** O plano vive inteiro em
> [`reports/PLANO-2B-CURADORIA-ESTRUTURAL.md`](reports/PLANO-2B-CURADORIA-ESTRUTURAL.md).
> Duplicar o conteúdo aqui produziria a divergência que este plano existe para
> resolver — foi exatamente assim que dois `MODUS_OPERANDI.md` passaram meses
> contando histórias diferentes.
>
> O que este painel tem, e o outro não, é **estado**: em que pé está cada frente,
> e o que exige decisão do vértice.

**Atualizado em 2026-08-28** · frente 4 medida · suíte 518 (viva)

---

## Estado das frentes

| # | Frente | Estado | Onde ler |
| :--- | :--- | :--- | :--- |
| 0.5 | **Prelúdio** — as duas portas de entrada | ✅ concluído | §0.5 do plano |
| 1 | **Homônimos** — declarar o canônico | ✅ entregue | §1.6 do plano · [`data/INDICE_CANONICO_GOVERNANCA.json`](data/INDICE_CANONICO_GOVERNANCA.json) |
| 2 | **Âncoras e índices** — `RECORD_INDEX` e §13.F | ✅ entregue | §2.3 do plano · [`scripts/ops/record_index.py`](scripts/ops/record_index.py) |
| 3 | **Contexto e memória** — qual corpus a memória deve ter | ⏸ decisão do vértice | §3.1 a §3.3 do plano |
| 4 | **Routing** — qual tabela governa cada superficie | ⏸ medida; decisao do vertice | [`reports/FRENTE-4-2026-08-28-autoridade-de-roteamento.md`](reports/FRENTE-4-2026-08-28-autoridade-de-roteamento.md) |
| 5 | **Referenciais** — quem aponta para quem | ✅ entregue | §5.1 do plano · [`scripts/ops/record_gate.py`](scripts/ops/record_gate.py) |
| 6 | **Imports e exports** — morto vs. não integrado | ⏳ aberta | §6 do plano |
| 7 | **Higienização** — mover e remover | 🔒 terminal, só depois de 1 a 6 | §7 do plano |

**A frente 4 foi medida, e o enquadramento dela estava errado.** As duas nao
competem: `rotear` e `str -> str` e responde *qual modelo*; o reordenador de
`routing.py` e `list -> list` e responde *em que ordem*. A pergunta real era
outra -- **o caminho quente consulta a politica?** -- e a resposta e nao: 19 de
19 agentes e 13 de 13 subagentes divergem. O que resta e decisao de gasto, nao
de arquitetura; ver a tabela abaixo. A frente 6 fica destravada: sabe-se agora
que a autoridade em producao e `primary_model` do manifesto.

---

## O que espera decisão sua

| # | Item | Por que não decidi eu |
| :--- | :--- | :--- |
| 1 | Os 62 fontes modificados nos submódulos — PR upstream, fork próprio ou descartar | Patches já extraídos; o risco está contido, a direção é sua |
| 2 | As 2 extensões no ledger do CLI e fora de `extensions/` | Não sei se a instalação quebrou ou se o caminho é outro |
| 3 | Instalar LanceDB ao lado do Chroma | Faz sentido técnico, **com a partição declarada antes** (§3.2) |
| 4 | Rotação das 4 chaves OpenRouter | Ato no provedor, fora do alcance daqui |
| 5 | O handoff de Chrome/CDP de outra sessão | Trabalho de terceiro; só normalizei a âncora |
| 6 | **Superficie de agentes:** o caminho quente le `AGENT_MODEL_MAP` ou o manifesto continua autoridade? | Custo por chamada x5,5 na maioria e x37 no `chico`. E decisao de gasto |
| 7 | **Superficie de subagentes:** a tabela local de `subagents_mesh` governa, ou a politica? | Aqui a executada e toda local, custo zero; ligar a politica poe em API paga |

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
5. [`reports/FRENTE-4-2026-08-28-autoridade-de-roteamento.md`](reports/FRENTE-4-2026-08-28-autoridade-de-roteamento.md) — o falso dilema, as duas superficies e o que espera o vertice
6. [`reports/AUDITORIA-2026-08-28-skills.md`](reports/AUDITORIA-2026-08-28-skills.md) — as 8 skills
