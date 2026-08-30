# PLANO 2-B — painel de acesso rápido

> **Este arquivo é um PONTEIRO, não uma cópia.** O plano vive inteiro em
> [`reports/PLANO-2B-CURADORIA-ESTRUTURAL.md`](reports/PLANO-2B-CURADORIA-ESTRUTURAL.md).
> Duplicar o conteúdo aqui produziria a divergência que este plano existe para
> resolver — foi exatamente assim que dois `MODUS_OPERANDI.md` passaram meses
> contando histórias diferentes.
>
> O que este painel tem, e o outro não, é **estado**: em que pé está cada frente,
> e o que exige decisão do vértice.

**Atualizado em 2026-08-29** · frentes 1, 2, 4 e 5 entregues · suíte 100% verde (viva)

---

## Estado das frentes

| # | Frente | Estado | Onde ler |
| :--- | :--- | :--- | :--- |
| 0.5 | **Prelúdio** — as duas portas de entrada | ✅ concluído | §0.5 do plano |
| 1 | **Homônimos** — declarar o canônico | ✅ entregue | §1.6 do plano · [`data/INDICE_CANONICO_GOVERNANCA.json`](data/INDICE_CANONICO_GOVERNANCA.json) |
| 2 | **Âncoras e índices** — `RECORD_INDEX` e §13.F | ✅ entregue | §2.3 do plano · [`scripts/ops/record_index.py`](scripts/ops/record_index.py) |
| 3 | **Contexto e memória** — qual corpus a memória deve ter | 🔶 parcial — memória consolidada, índice reconstruído, guard entregue | [`reports/VALIDACAO-2026-08-28-arquitetura-de-memoria.md`](reports/VALIDACAO-2026-08-28-arquitetura-de-memoria.md) |
| 4 | **Routing** — qual tabela governa cada superficie | ✅ entregue | [`reports/FRENTE-4-2026-08-28-autoridade-de-roteamento.md`](reports/FRENTE-4-2026-08-28-autoridade-de-roteamento.md) |
| 5 | **Referenciais** — quem aponta para quem | ✅ entregue | §5.1 do plano · [`scripts/ops/record_gate.py`](scripts/ops/record_gate.py) |
| 6 | **Imports e exports** — morto vs. não integrado | ⏳ aberta | §6 do plano |
| 7 | **Higienização** — mover e remover | 🔒 terminal, só depois de 1 a 6 | §7 do plano |

**A frente 4 foi medida e resolvida.** O enquadramento dela estava errado: as
duas nao competem -- `rotear` e `str -> str` e responde *qual modelo*, o
reordenador de `routing.py` e `list -> list` e responde *em que ordem*. A
pergunta real era **o caminho quente consulta a politica?**, e nao consultava:
19 de 19 agentes e 13 de 13 subagentes divergiam.

O vertice decidiu por superficie. **Agentes:** a politica e a autoridade, e o
caminho quente resolve por `core.config.modelo_do_agente` -- 19 de 19 seguem, e
12 deles ficam em custo marginal zero (11 na cota gratuita, 1 na frota local).
**Subagentes:** a tabela local de `subagents_mesh` governa, com custo zero como
invariante travado em teste, e a politica passou a recusar atribuir modelo a
tier. **`gemma4`:** alias corrigido para `gemma4:12b`.

Em cada superficie havia duas fontes para o mesmo fato, e a saida foi apagar a
segunda, nao sincroniza-la. A frente 6 fica destravada.

---

## O que espera decisão sua

| # | Item | Por que não decidi eu |
| :--- | :--- | :--- |
| 1 | Os 62 fontes modificados nos submódulos — PR upstream, fork próprio ou descartar | Patches já extraídos; o risco está contido, a direção é sua |
| 2 | As 2 extensões no ledger do CLI e fora de `extensions/` | Não sei se a instalação quebrou ou se o caminho é outro |
| 3 | Instalar LanceDB ao lado do Chroma | Faz sentido técnico, **com a partição declarada antes** (§3.2) |
| 4 | Rotação das 4 chaves OpenRouter | Ato no provedor, fora do alcance daqui |
| 5 | O handoff de Chrome/CDP de outra sessão | Trabalho de terceiro; só normalizei a âncora |
| 6 | O fallback declarado em `Rota.fallback` continua sem consumidor | Liga-lo torna `gemma4:e4b` alcancavel, e ha medicao de que ele nao cabe na VRAM. E decisao sobre a TABELA |

---

## Como rodar o que a sessão construiu

```bash
nexus index --suspeitos          # estado derivado dos registros, agora
nexus test --isolado             # suíte em worktree próprio, sem tocar seu working tree
uv run python scripts/ops/suite_isolada.py --repo ../antigravity
```

---

## Leitura, em ordem

1. [`reports/HANDOFF-2026-08-29-roteamento-memoria-e-guard.md`](reports/HANDOFF-2026-08-29-roteamento-memoria-e-guard.md) — estado atual e prompt de continuação
2. [`reports/RETROSPECTIVA-2026-08-28-sessao.md`](reports/RETROSPECTIVA-2026-08-28-sessao.md) — o antes, o processo, os padrões acumulados
3. [`reports/HANDOFF-2026-08-28-auditorias-e-preludio.md`](reports/HANDOFF-2026-08-28-auditorias-e-preludio.md) — estado e prompt de continuação
4. [`reports/PLANO-2B-CURADORIA-ESTRUTURAL.md`](reports/PLANO-2B-CURADORIA-ESTRUTURAL.md) — o plano completo
5. [`reports/INTERLUDIO-2026-08-28-concorrencia-e-isolamento.md`](reports/INTERLUDIO-2026-08-28-concorrencia-e-isolamento.md) — concorrência, isolamento e o P0
6. [`reports/FRENTE-4-2026-08-28-autoridade-de-roteamento.md`](reports/FRENTE-4-2026-08-28-autoridade-de-roteamento.md) — o falso dilema, as duas superficies e o que espera o vertice
7. [`reports/AUDITORIA-2026-08-28-skills.md`](reports/AUDITORIA-2026-08-28-skills.md) — as 8 skills
