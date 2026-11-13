---
name: devin-session-supervision
description: "Supervisionar e steering de sessoes Devin Cloud/Desktop — progresso, side chats, takeover de IDE, browser interativo, persistencia de cookies e Local Hands (sessao cloud operando na sua maquina). Use quando uma sessao Devin estiver rodando e voce precisar monitorar, interferir ou emprestar a maquina local a ela."
argument-hint: "[sessao/devin-id ou contexto de supervisao]"
allowed-tools:
  - read
  - grep
  - exec
triggers:
  - user
  - model
metadata:
  hermes:
    tags: ["devin", "supervision", "session-tools", "local-hands", "takeover", "browser"]
    category: devops
    related_skills: ["devin-managed-ops", "devin-session-insights", "computer-use-local", "preview-sota"]
---

# Devin Session Supervision — ver, perguntar, assumir, emprestar

Referencia: docs.devin.ai/work-with-devin/devin-session-tools,
/cli/cloud e /work-with-devin/local-hands. Cobre as 4 formas de um humano
intervir numa sessao Devin em andamento.

## 1. Side chats (`/btw`)

Pergunta sobre a sessao **sem interromper** o trabalho principal — read-only,
com todo o contexto ate aquele ponto.

- Uso canonico: "por que escolheu essa abordagem?", "quanto ACU ja gastou?",
  "esse diff toca o arquivo X?" — clarification em voo.
- Equivalente local: `run_subagent`/`subagent_explore` ou simplesmente uma
  pergunta em paralelo — mas no Devin e uma feature de produto com contexto
  da sessao embutido.
- **Nao confundir com steer**: side chat nao muda o plano; para mudar,
  mensagem normal na thread principal.

## 2. Progress tab + command history

- Toda sessao loga shell, edits e browser num worklog unificado — auditar
  comandos e saidas e o equivalente Devin do nosso `record_gate`/ledger.
- Comandos "greyed out" = futuro na linha do tempo — o worklog e
  navegavel por tempo, util para reconstruir "o que ele tentou antes de
  mudar de abordagem" (insumo direto para Session Insights).

## 3. Takeover (IDE/shell/browser)

- **Stop → editar no IDE → resumir informando o que mudou.** Ordem
  importa: pausar ANTES de tocar, senao dois agentes editam o mesmo
  arquivo (nossa Lei de Concorrencia local, mesma regra la).
- Browser interativo: serve para CAPTCHA, MFA, OAuth, navegacao complexa
  — o humano faz o passo que o agente nao consegue e a sessao continua
  com o estado (cookies persistem na sessao).
- **"Save browser profile"**: pede ao Devin para zipar o perfil Chrome
  (cookies/localStorage) e propor update no blueprint → sessoes futuras
  ja nascem logadas. Equivalente local medido: perfis Chrome SOTA +
  CDP `:9222`/`:9223` persistentes — nao precisamos de blueprint porque
  o browser local JA e persistente por natureza.

## 4. Local Hands — o decisor de seguranca

Sessao **cloud** pedindo para rodar comandos/editar arquivos **na sua
maquina** via `devin connect` (CLI/Desktop), com aprovacao por tool call.

| Aspecto | Fato medido da doc |
| :--- | :--- |
| O que roda local | shell, read/search/edit de arquivos, copy VM↔maquina — **sem** screen/keyboard/mouse (Computer Use e so na VM) |
| Aprovacao | por chamada: Allow once / session / Deny; regras `allow`/`deny`/`ask` do CLI tambem valem |
| Bypass | `local_tools_bypass_permissions` ou botao — **desliga TODA aprovacao**; doc avisa: so em sessao confiavel |
| Always-ask | credenciais/chaves, privilege escalation, destrutivos, shell interpreters, secret stores, git config e shell profiles pedem aprovacao MESMO com bypass |
| Privacidade | conectar torna a sessao privada (so voce envia mensagens) — anti-injecao de terceiros; `--public` desliga |
| Expiracao | codigo de pareamento single-use, 10 min |
| Requisitos | sessao cloud propria (scheduled/automation/service-user NAO podem); CLI/Desktop logado na mesma conta; toggle Local Hands da org |

**Decisor ecossistema:** quando uma sessao cloud precisar da sua maquina,
Local Hands e preferivel a entregar VPN/credencial — cada tool call e
aprovada e auditavel. **Nunca** ativar bypass em sessao que voce nao
escreveu o prompt. O equivalente local ja e o default: agentes Tier 1/2/3
JA rodam na sua maquina com as regras de permissao do harness — Local
Hands so faz sentido na direcao inversa (cloud → local).

## 5. Proibicoes

- Nao rodar `devin connect`/bypass sem sessao cloud legitima esperando —
  e uma ponte de execucao remota na sua maquina; trate como tal.
- Nao aprovar tool call de Local Hands que toque credencial, git config
  ou destrutivo sem entender o porque — o "always ask" existe por isso.
- Takeover sem pausar a sessao = conflito garantido (mesma regra da
  concorrencia local).
