---
name: "Instrucoes de hospedeiro para GitHub Copilot"
description: "Adapta o contexto do projeto Site para GitHub Copilot sem duplicar governanca."
applyTo: "**"
---

# Instrucoes de hospedeiro para GitHub Copilot

<!-- type: rule | status: active | owner: site-governance | updated_at: 2026-11-25 -->

Este arquivo adapta o contexto para o Copilot (VS Code e VS Code Insiders); nao duplica governanca ou
politicas de engenharia.

- Fonte canonica do projeto: `CLAUDE.md` na raiz.
- Contexto de produto/runtime: `.claude/project-context.md`.
- Abrir `Site.code-workspace` no VS Code / VS Code Insiders; Gateway MCP compartilhado em `http://127.0.0.1:8933` (`sincronizar_nucleo.py`).
- Use `pyproject.toml` e `uv.lock` para o ambiente Python; a versao minima e
  Python 3.12.
- Preserve escopo, contratos, autoria e mudancas existentes.
- Antes de declarar capacidade integrada, identifique consumidor e verificacao.
- Declare separadamente medicao, inferencia, configuracao e estado desconhecido.
- Nao presuma bypass, credencial, runtime ativo ou verificacao que nao executou.
