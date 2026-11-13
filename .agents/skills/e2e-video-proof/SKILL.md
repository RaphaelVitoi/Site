---
name: e2e-video-proof
description: "Prova end-to-end com video — equivalente local do 'testing mode' do Devin (grava tela, anota passos, entrega evidencia). Use antes de PR/merge para demonstrar que o fluxo principal funciona, ou quando pedirem 'prove que funciona' / 'grava um video'."
argument-hint: "[fluxo a testar ou URL/ambiente alvo]"
allowed-tools:
  - read
  - grep
  - glob
  - exec
triggers:
  - user
  - model
metadata:
  hermes:
    tags: ["e2e", "testing", "video", "playwright", "proof", "qa"]
    category: qa
    related_skills: ["computer-use-local", "preview-sota", "devin-managed-ops"]
---

# E2E Video Proof — testing mode local

Referencia: docs.devin.ai — Devin grava video anotado do teste e2e pos-PR.
O equivalente local usa o **Playwright MCP** (`127.0.0.1:8931`, fonte unica
via nucleo) que suporta `browser_video` nativo — sem subir nada na nuvem.

## 0. Decisor: local vs. Devin Cloud

| Cenario | Rota |
| :--- | :--- |
| App local / Site / qualquer coisa rodando nesta maquina | **local** (este skill) — zero custo, zero exposicao |
| PR feito por sessao Devin Cloud | pedir testing mode no prompt da sessao cloud (ver §4) |
| App atras de login/VPN que so existe na nuvem | Devin Cloud — local nao alcanca |

## 1. Fluxo (espelha as 3 fases do Devin)

**Fase 1 — Setup.** Subir o app no ambiente certo (dev server, `.venv`,
porta do projeto). Login: usar sessao existente do `mcpbrowser` (cookies
preservados) ou playwright com storageState — nunca pedir credencial no
chat; se faltar, reportar bloqueio.

**Fase 2 — Plano de teste.** UM fluxo e2e principal que prova a feature —
passos concretos ("clicar em Save no canto superior direito"), ancorados
no codigo/diff real. Declarar o plano ANTES de executar para o Tier 0
corrigir se preciso. So adicionar fluxo extra se for edge case critico.

**Fase 3 — Gravar e executar.** Playwright MCP com video ligado:

- `browser_navigate` → alvo
- executar cada passo do plano
- screenshots em momentos-chave (console limpo, estado final)
- `browser_close` → video salvo em `Site/reports/e2e/<data>-<slug>/`

## 2. Padrao de qualidade da prova

- **Curto e focado** — sanity check de um fluxo; cobertura exaustiva e
  trabalho de pytest/CI, nao de video.
- **Anotacao equivalente** — como o Devin escreve labels no video, aqui
  o equivalente e: titulo do relatorio + passo a passo numerado +
  screenshot por marco. Se o video nao tiver legenda, o markdown cobre.
- **Evidencia antes de alegacao** (§8 governanca) — o relatorio so diz
  "funciona" com artefato anexado: video + screenshots + saida de
  console sem erros.

## 3. Saida padrao

```
reports/e2e/YYYY-MM-DD-<slug>/
├── video.webm          (do playwright)
├── 01-inicio.png
├── 02-acao.png
├── 03-resultado.png
└── RELATORIO.md        (plano, passos, veredito, console)
```

`RELATORIO.md` minimo: plano executado, resultado por passo
(pass/fail), erros de console encontrados, veredito.

## 4. Lado Devin Cloud (quando a sessao for la)

Em sessao gerenciada via `devin-managed-ops`/`devin_session_create`,
incluir no prompt: *"apos o PR, entre em testing mode e grave video
da prova e2e"* — ou `Pre-approve testing` em Settings > Preferences
para nao depender de clique. Insights da sessao depois via
`devin-session-insights`.

## 5. Proibicoes

- Nao gravar video de fluxo que toca credencial — mascara o campo.
- Nao declarar "testado" sem artefato — video ou screenshot e
  obrigatorio.
- Nao usar o video como substituto de teste unitario — ele prova o
  caminho feliz, nao a suite.
