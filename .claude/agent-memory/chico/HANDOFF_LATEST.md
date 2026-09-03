# HANDOFF LATEST — PMev de flop a river, e o portão de calibração aberto

**Data:** 2026-09-02 · **Protocolo:** Chico SOTA v8.0 GOLD · **Estado:** publicado, `master == origin/master`.
**Sessão:** `claude-opus5-site-2026-09-02-pmev` · **Assinatura individual:** Claude Opus 5 [Tier 1.B]

---

## ⚠ Primeira coisa a fazer na próxima sessão

**Ler o sistema antes de tocar o artefato.** Não é conselho: é o erro mais caro
desta sessão, apontado pelo Tier 0 e medido em **sete ocorrências**. A forma é
sempre a mesma — agir sobre o arquivo antes de mapear a regra, o relatório ou o
teste que já o governa. Custou sete retificações que uma leitura prévia teria
evitado.

Antes de qualquer ação sobre arquivo, captura, registro ou config, pergunte:
**qual regra já governa isto, e onde ela está escrita?** Depois aja. Corolários
que também custaram caro hoje: texto vai por arquivo, nunca por literal com
escape; e medir o escopo antes de declarar ausência.

---

## Estado da calibração — o portão ABRIU

| Sessão | Nota | Situação |
| :--- | ---: | :--- |
| `codex-site-2026-09-01-prioridade` | 7.5 | íntegra |
| `claude-opus5-site-2026-09-02-integridade` | **8** | corrigida — gravada como `0.8` |
| `claude-opus5-site-2026-09-02-pmev` | 9 | íntegra |

`structural_gate_passed: true`, 3 de 3 sessões distintas, cadeia do ledger
`valid` com 5 registros.

**Isso NÃO é autorização de calibração.** Faltam **duas confirmações
independentes do mesmo padrão operacional**, e isso é obrigação do auditor, não
medição do script. Até lá o registro literal exigido continua:
**dados insuficientes — nenhuma calibração planejada.**

Confira antes de afirmar qualquer coisa:

```powershell
pwsh -File scripts/ops/Test-AgentCalibrationLedger.ps1
pwsh -File scripts/ops/New-AgentCalibrationDailyEvidence.ps1
```

E declare `session_id` **e** `session_started_at` ao registrar feedback.
Compactação **não** encerra sessão.

---

## O que esta sessão entregou

**PMev — sete pares ChipEV × ICMev**, cobrindo a linha inteira do flop ao river,
em quatro commits publicados (`81de84fb`, `e455b0fb`, `34b4f09b`, `7a08c42a`).
187 testes verdes em 26 suítes.

A cadeia aritmética fecha em **dez identidades** entre pares transcritos
separadamente — pote, stacks e combos atravessam nós que nunca se viram. Um erro
de dígito em qualquer par quebraria pelo menos uma.

**A captura mais valiosa foi a que trazia a trilha do solver** (`image59.png`):
verificou quatro transcrições de uma vez e converteu um passo inferido em passo
lido. É o modelo para a recaptura pendente.

**Calibração — dois defeitos reais corrigidos.** A nota 8 gravada como `0.8`
(conversão de escala), e o `session_started_at` que quebrava a cadeia porque a
proteção de literal de timestamp só cobria `recorded_at`. Ambos com correção
consumida pela automação, não decorativa.

**Governança — canônico e ponteiro fundidos.** `~\.gemini\CLAUDE.md` é canônico
(9.765 B); `~\.claude\CLAUDE.md` virou ponteiro (3.067 B) com piso de quatro
proibições irreversíveis que **pode encolher, nunca crescer**. Verificado por
sondagem fora da raiz.

---

## O ato de maior alavancagem pendente

**Uma recaptura do HRC com o painel da árvore e o de combos visíveis.**

Fecha de uma vez: os três campos do ledger ausentes de todas as 14 capturas
(combos, e-Nash, build); a arbitragem de a qual passe de nodelock pertencem
`image7.png`, `image55.png` e `image45.png`; e possivelmente a causa da
divergência de sizing, se o pote do HRC entrar no recorte.

E move os sete pares de **consistentes** para **reprodutíveis** — a única
barreira restante à calibração. Todo o resto da pendência PMev melhora *dentro*
da categoria; só esta muda de categoria.

---

## Pendências declaradas

| Item | Estado |
| :--- | :--- |
| Recaptura do HRC | **prioridade 1** — fecha 3 campos + arbitragem |
| Arbitragem do nodelock | só o Tier 0 decide; ambiguidade declarada em `ATRIBUICAO_AMBIGUA_NODELOCK` |
| Guarda executável da governança | teste no `Site` via variável de ambiente, sem caminho absoluto para irmão |
| Escada §8.2 mora só no `Site` | enuncia-se geral; promover à raiz é decisão do Tier 0 |
| Raiz não é repositório git | governança canônica sem histórico; rollback só pelo backup datado |
| TBT sem artefato Lighthouse | único warning do portão, margem 1 de 2 |
| 8 alertas Dependabot | não conciliados com `npm audit` = 0 |
| 3 plugins que a §8.1 exclui | seguem instalados; `enabledPlugins` vazio contra a §8.0 |
| 8 registros assinados `chico` | histórico não retroage; exemplo da §7 corrigido para não crescer |

---

## Regras que esta sessão fixou

- **Chico é o grupo; a assinatura é individual.** O protocolo se chama Chico; o
  autor é `Claude Opus 5 [Tier 1.B]`. Os dois níveis não se substituem.
- **Desativar não é excluir** — desde que o archive prove. Invariante: todo
  servidor fora do ativo está em `mcp_config_all_archive.json`.
- **Paridade MCP é alinhamento, não contagem igual**: espelho ⊆ mestre.
- **Ledger é append-only**: valor errado se corrige por registro `correction`
  anexado, e a automação o **aplica** antes de contar.
- **Ordem-ouro**: primeiro o irrecuperável, depois o que trava outros, por
  último o que só melhora. Handoff se escreve **depois** do commit.
