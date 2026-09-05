# HANDOFF LATEST — Fechamento do Ciclo de Calibração e a Régua do Jules

**Data:** 2026-09-05 · **Protocolo:** Chico SOTA v8.0 GOLD
**Condutor:** Claude Opus 5 [Tier 1.B] · **Regime:** Assistida (arbitrada diretamente pelo Tier 0 — Raphael Vitoi)
**Avaliação Operacional Tier 0:** **9.8 / 10**
**Relatório oficial:** [`reports/HANDOFF-2026-09-05-fechamento-do-ciclo-e-regua-do-jules.md`](../../../reports/HANDOFF-2026-09-05-fechamento-do-ciclo-e-regua-do-jules.md)

> **Esta sessão não era para ter acontecido assim.** Abriu com uma pergunta sobre
> o registro de calibração e virou auditoria de três frentes. O foco planejado —
> o prelúdio de credenciais — **continua pendente e é a primeira coisa da
> próxima sessão.**

---

## 1. O que foi consolidado

1. **O portão de calibração sabia abrir e não sabia fechar.** Três defeitos
   empilhados: nenhum script emitia `record_type: 'calibration'`; o leitor do
   marco filtrava `'calibration'` sobre uma coleção **já filtrada por
   `'feedback'`** — vazio por construção, o marco nunca seria lido nem depois de
   escrito; e o corte do universo era por relógio, não por sequência. Corrigidos
   por `scripts/ops/Record-AgentCalibration.ps1` e 11 guards em
   `tests/test_calibracao_fechamento_do_ciclo.py`.

2. **A tarefa das 23:59 nunca havia rodado.** Não estava sequer registrada no
   Agendador; ao registrar, falhou com `LastTaskResult 1`. Causa reproduzida: era
   criada com `-Command` carregando aspas aninhadas, e o nome do arquivo evaporava
   no parser — `Out-File` apontava para o diretório. Passou a `-File` via
   `scripts/ops/Write-AgentCalibrationDailyEvidence.ps1`. Agora
   `LastTaskResult 0`, e `daily/` tem os três primeiros `.json` de sua existência.

3. **Trabalho do Gemini no IDE, auditado e commitado sob exceção.** 15 arquivos
   produzidos fora da ancoragem no protocolo. Três famílias, todas verificadas;
   **uma regressão encontrada e corrigida**: `${workspaceFolder}/worker` removido
   dos `extraPaths` com `worker/` existindo e sendo importado. Nenhuma ferramenta
   acusaria — lint, build e tipos passavam com ela.

4. **Régua para o agente autônomo de nuvem (§10 e §10.6 do `CLAUDE.md`).** A
   sessão do Jules levantou três hipóteses de performance, não ordenou nenhuma e
   parou para perguntar às 03:21 UTC. Medidas, as três eram **duas
   contraproducentes e uma irrelevante** — escolher qualquer uma teria piorado o
   código. A lacuna não era falta de ordem de parada (o prompt já mandava parar);
   era falta de critério para chegar à parada sozinha.

---

## 2. As duas cláusulas que resolvem os dois problemas de uma vez

- **§10.1 — medir antes, e *medir e refutar é entrega*.** Sem isso o agente se
  sente obrigado a produzir diff, e produz o diff errado.
- **§10.2 — havendo vários caminhos, ordenar é a resposta, não a pergunta.**

E a §10.6 adequa o que ele **produz**: aprendizado em
`.claude/agent-memory/bolt/`, atribuição obrigatória no corpo do commit (porque
o campo `Author` vem da GitHub App e não é configurável), e entrada na malha
**apenas por merge local revisado** — a VM roda a suíte de frontend e nada mais.

---

## 3. Estado ao encerrar

| Item | Estado |
| :--- | :--- |
| Commits | `7861548b`, `fc6d3b97`, `485b3bfb` — **locais, não empurrados** |
| `origin/master` | `2381a85d` |
| Working tree | limpo |
| Suíte | 901 aprovados, 1 pulado |
| Portão de 5 fases | 0 erros, 1 warning (TBT, preexistente, teto 2) |
| Ledger | válido, 15 registros, tail `818d069f` |
| Portão de calibração | **aberto** — 11 sessões, média 9.15 |

---

## 4. Próxima sessão — a teoria PMev

**Decidido pelo Tier 0 ao encerrar: o foco é PMev.** Retoma de onde a sessão de
2026-09-04 parou, e nada mais abre a sessão.

O objeto é o **contraste ICMev × ChipEV no mesmo nó**. Procedência é meio, não
fim: existe para que a diferença observada seja atribuível ao **regime**, e não
ao motor, à versão ou a quanto cada solve caminhou.

**A barreira:** `countReproduciblePairs(AULA_1_2_PAIRS) = 0 de 7`, mínimo 3. Os
sete pares são válidos e consistentes; falta build, e-Nash e unidade nos dois
lados. Consistência é ausência de contradição interna — reprodutibilidade é
outra pessoa obter o mesmo número.

> **Não "consertar" esse teste.** É o portão. O número sobe quando o export
> chegar; preenchê-lo sem export é inventar a evidência.

Ler `reports/HANDOFF-2026-09-04-pmev-credenciais-e-submodulos.md` §7 para os
cinco fatos fixados pelo Tier 0, e as seções 8 e 9 de `evidenceContract.ts`.

**Credenciais saíram do escopo — as chaves foram COMPLETAMENTE INUTILIZADAS.**
Confirmado pelo Tier 0 em 2026-09-05. O blob de `080cda35` segue alcançável, mas
com a chave morta é segredo morto. **Instrução: não gastar tokens com a limpeza
do histórico — é delegável.** Não abrir sessão com isso nem tratar como
pendência de segurança. Detalhe na §2.1 do handoff oficial.

---

## 5. Dívidas declaradas, não corrigidas

- Dois `globals.css` com bloco `@theme`, divergindo em 817 linhas — fonte
  paralela de token de design.
- O reconhecedor de caminho do `record_gate.py` trunca `.jsonl` em `.json` e
  reprova por referência morta um arquivo que ninguém escreveu.
- Branch `bolt-journaling-optimization-learnings-14536923137986406349` no
  remoto, aguardando a revisão que o Tier 0 disse que liberaria.
- Contagem documental de agentes, delegada ao Gemini: `.claude/agents/` segue
  com **19** e as menções no `CLAUDE.md` estão corretas; `agent-memory/` é que
  foi a **20**.
