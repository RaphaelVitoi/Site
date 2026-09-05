# HANDOFF LATEST — PMev, Credenciais Expostas e Submódulos Quebrados

**Data:** 2026-09-04 · **Protocolo:** Chico SOTA v8.0 GOLD
**Condutor:** Claude Opus 5 [Tier 1.B] · **Regime:** Assistida (arbitrada diretamente pelo Tier 0 — Raphael Vitoi)
**Avaliação Operacional Tier 0:** **9.5 / 10**
**Relatório oficial:** [`reports/HANDOFF-2026-09-04-pmev-credenciais-e-submodulos.md`](../../../reports/HANDOFF-2026-09-04-pmev-credenciais-e-submodulos.md)

---

## 1. O que foi consolidado

1. **PMev — a ponte que faltava.** Não existia caminho de um arquivo de export até
   o portão de evidência; todo par era literal escrito à mão.
   `engine/solver_importers/hrc_evidence.py` converte dois exports do HRC num
   `EvidencePair` tipado, consumindo o extrator de procedência que já existia em
   vez de duplicá-lo.
2. **PMev — portão de convergência.** `assessConvergence()` e
   `CI_MAXIMO_ACEITAVEL_HRC = 4.9` em `evidenceContract.ts`.
   `assessReproducibility` mede **completude de campo** e passa com qualquer valor
   de e-Nash; o novo olha o **valor**. Um par pode ser reproduzível **e** mal
   convergido.
3. **Três credenciais expostas, dois vetores.** Uma literal em `stitch_bridge.py`
   (`080cda35`, já empurrada) e duas republicadas no `JULES_REPORT.md` a partir do
   prompt de uma sessão do Jules. O vetor estrutural foi fechado com
   `redigir_segredos()` **no gerador** — sanear o `.md` não bastaria, porque o
   prompt vive do lado do Google.
4. **Quatro submódulos quebrados, não um.** O Jules falhava havia 5 noites. Uma
   varredura dos 9 mostrou que `gemini-cli-jules`, `gemini-cli-security`,
   `gemini-deep-research` e `gemini-supermemory` apontavam para commits nunca
   empurrados. Corrigir um por vez custaria uma noite cada.
5. **Garantia de aprovação do Jules restaurada.** O bridge enviava
   `autoApprovePlan`, campo que a API não reconhece — e o default dela é
   auto-aprovar. `auto_approve_plan=False` produzia **o oposto** do que promete.
6. **`master` de volta ao verde.** Quatro testes vermelhos herdados de `080cda35`
   e `7b36594a` corrigidos.

---

## 2. Calibração — o feedback 9.5

> *"Faltou um pouco de análise paralela de nós, sem sair assumindo apressadamente
> um caminho ou rotina única e definitiva quando há várias opções."*

Procedente, com três evidências na própria sessão: concluí que o Jules não era
delegável tendo testado 2 de 4 combinações de credencial × método (a que faltava
funcionava); diagnostiquei o `if` do Stitch como bug quando o errado eram as
constantes; e corrigi 1 submódulo quando varrer os 9 custava o mesmo.

**Ajuste mandatório:** ao chegar a um nó de decisão, **enumerar as ramificações
antes de descer por uma**. Quando testar todas custa perto do que custa testar
uma, testar todas é o caminho **barato**. Convive com o *zoom out preditivo* da
sessão anterior: aquele antecipa os próximos nós; este proíbe podar ramos irmãos
antes de medi-los.

---

## 3. Estado do Ecossistema

| Item | Valor |
| :--- | :--- |
| **Branch** | `master`, sincronizada |
| **Suíte Python** | 889 aprovados, 1 pulado, 0 reprovados |
| **Suíte frontend** | 27 suites, 215 testes, 0 erro / 0 warning |
| **Submódulos** | 9/9 resolvem no upstream público |
| **PMev — portão** | **0 de 7** reproduzíveis (inalterado, por desenho) |
| **Jules** | leitura OK; escrita OK por POST com `x-goog-api-key`. O MCP `create_session` retorna 401 |
| **Stitch** | funcional — projeto `Nexus PMev & Poker Racional UI` |
| **Render** | MCP conectado; serviço `Site` (`srv-da91vnpsrm7s73au9l80`) já existente |
| **Semgrep** | desinstalado (escopo local), por ordem do Tier 0 |
| **Credenciais** | em `HKCU:\Environment` via `scripts/ops/Set-EcosystemCredential.ps1` |

---

## 4. Fila para o sucessor

1. **Revogar as três credenciais no provedor** — seguem no histórico de
   `origin/master`; trocar a variável não as invalida.
2. **Conferir o cron do Jules após 03:20 UTC** — é a prova de que o clone voltou.
3. **PMev, prioridade 1:** dois exports do HRC do mesmo nó (um ChipEV, outro
   ICMev) com o painel `CI` visível. O adaptador existe; falta o dado.
4. **Aberto:** `autopoietic_daily_cycle.py` não tem agendamento nenhum.

**O prompt de continuação da teoria PMev está na §7 do relatório oficial.**
