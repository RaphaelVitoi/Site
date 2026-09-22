# Instrucoes de hospedeiro para GitHub Copilot

Este arquivo adapta o contexto para o Copilot; nao duplica governanca ou
politicas de engenharia.

- Fonte canonica do projeto: `CLAUDE.md` na raiz.
- Contexto de produto/runtime: `.claude/project-context.md`.
- Use `pyproject.toml` e `uv.lock` para o ambiente Python; a versao minima e
  Python 3.12.
- Preserve escopo, contratos, autoria e mudancas existentes.
- Antes de declarar capacidade integrada, identifique consumidor e verificacao.
- Declare separadamente medicao, inferencia, configuracao e estado desconhecido.
- Nao presuma bypass, credencial, runtime ativo ou verificacao que nao executou.
