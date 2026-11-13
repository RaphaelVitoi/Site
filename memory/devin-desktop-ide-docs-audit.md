---
title: "Devin Desktop IDE docs — estado medido, nada a instalar"
type: memory
status: active
created_at: 2026-11-13
source: "docs.devin.ai/desktop/{recommended-extensions,csharp-cpp,codemaps,best-practices/prompt-engineering}"
tags: [devin, desktop, extensions, codemaps, prompt-engineering, ide]
---

# IDE docs do Desktop — auditoria medida

## Recommended extensions — stack Python JA COMPLETO

Medido em `~/.devin/extensions/` (2026-11-13): `ms-python.python`,
`ms-python.debugpy`, `ms-python.pylint`, `codeium.windsurfpyright`,
`charliermarsh.ruff`, `eamodio.gitlens`, `bierner.markdown-mermaid`,
`github.vscode-pull-request-github` — todos os recomendados pela doc
presentes. **Nada a instalar.** C#/C++/Java/VB: stacks fora do Site
(Python/TS/Rust-wasm) — ignorar salvo projeto futuro nesses idiomas.

## Codemaps — equivalente ja existe

Codemaps = mapas hierarquicos codebase→execucao, gerados por agente,
shareable via link. Equivalente local: `egm-bootstrap` (docs bottom-up
via swarm), DeepWiki tools (`ask_wiki_question` etc. via Devin MCP),
`Site/memory/` notas de arquitetura. Se um dia quisermos o artefato
visual shareable, gerar via skill — nao ha pressa.

## Prompt engineering — disciplina ja codificada

Doc generica (objetivo claro, contexto via @-mentions, constraints).
Ja esta embutida nos nossos skills `*-sota` (metricas especificas,
periodo, formato, comparacao, SQL validado) e no `improved_prompt` do
Session Insights. Devin Coach (sugestoes no input) e a versao pre-envio.

## Licao transversal

Docs de "recommended setup" so valem depois de **medir o que ja esta
instalado** — nesta rodada, 100% de cobertura evitou instalacao
redundante de 4+ extensoes.
