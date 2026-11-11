---
name: focused-verify
description: "Verificação mínima e silenciosa para os arquivos alterados — estático primeiro, pytest/jest focado depois. Usar antes de qualquer suíte ampla ou commit."
argument-hint: "[paths ou descrição da mudança]"
allowed-tools:
  - read
  - grep
  - glob
  - exec
triggers:
  - user
  - model
---

# Focused Verify — portão de qualidade econômico

Execute a menor cadeia de verificação que prova a mudança, nesta ordem.
Economize tokens: flags silenciosas sempre, saída truncada, nunca suíte ampla
no loop iterativo.

## Passo 0 — Escopo

```bash
git status --porcelain
git diff --name-only HEAD
```

Classifique os arquivos alterados: **Python** (`*.py` sob raiz/tests),
**Frontend** (`frontend/**`), **Docs/config** (somente markdownlint se `.md`).

## Passo 1 — Estático (sempre primeiro, ~segundos)

Python alterado:

```bash
uv run --no-sync ruff check <arquivos.py> && uv run --no-sync ruff format --check <arquivos.py>
```

Frontend/TS alterado:

```bash
npm run typecheck --workspace frontend
```

Se o typecheck completo for lento, prefira `npx tsc --noEmit -p frontend` uma vez
ou aceite o custo — é estático e mais barato que teste de integração.

## Passo 2 — Teste focado (só o que cobre a mudança)

Mapeie cada arquivo de produção ao(s) teste(s) correspondente(s):

- `foo.py` → procure `tests/**/test_foo*.py` ou `grep -rl "import foo\|from foo" tests/`.
- Componente frontend → `*.test.*`/`*.spec.*` adjacente ou `__tests__/`.

```bash
# Python — UM arquivo, UM teste se possível
uv run --no-sync python -m pytest tests/caminho/test_alvo.py -q --tb=short -k "nome_do_teste"

# Frontend — jest focado
npm run test --workspace frontend -- --runTestsByPath src/caminho/arquivo.test.tsx
```

Sem teste existente para a mudança → reporte "sem cobertura focal" e siga para
lint/typecheck apenas; NÃO crie suíte nova sem pedido explícito.

## Passo 3 — Veredito

Reporte em ≤5 linhas: o que rodou, PASS/FAIL por etapa, e o próximo passo.
FAIL → corrigir causa raiz e re-rodar SOMENTE a etapa que falhou.

## Proibições

- Nunca `pytest tests/` inteiro, `npm test` global ou `sota:full` aqui — isso é
  checkpoint final pré-commit, não loop de desenvolvimento.
- Nunca flags verbosas (`-v`, `--tb=long`, logs debug) neste skill.
- Nunca editar teste para passar; se o teste está errado, reportar.
