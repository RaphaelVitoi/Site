# Contrato de Ambiente e Paridade de Engenharia

O repositório é um sistema único: backend Python, frontend Next.js, Prisma e
artefatos matemáticos devem resolver dependências de forma reprodutível antes de
qualquer validação. Este documento define a única rota suportada.

| Camada | Fonte de verdade | Bootstrap | Gate principal |
|---|---|---|---|
| Python | `pyproject.toml` + `uv.lock` | `uv sync --locked --group dev` | `uv run --no-sync ruff check .`, `pyright`, `pytest` |
| Node/Next/Prisma | `package.json` + `package-lock.json` | `corepack npm ci` | `corepack npm run lint`, `typecheck`, `build`, `test` |
| Dados de conteúdo | Prisma schema + `editorialManifest.ts` | `corepack npm --workspace frontend exec prisma generate` | build + testes de manifesto |

## Versões executáveis

- Node: `>=22`.
- npm: exatamente `10.9.2`, acionado por `corepack npm`. O npm global pode ter
  outra versão; não é uma rota suportada para este monorepo.
- Python: `>=3.12`; o ambiente local é sempre `.venv` gerido pelo `uv`.

## Procedimento limpo

```powershell
corepack npm ci
uv sync --locked --group dev
corepack npm run verify:toolchain
corepack npm --workspace frontend exec prisma generate
corepack npm run sota:full
corepack npm run sota:audit
```

`allowScripts` existe apenas no `package.json` do root. Scripts de dependências
que não sejam indispensáveis para o produto permanecem bloqueados. Nunca use
`pnpm approve-builds`, `--no-verify` ou atualização ad hoc de lockfile para
contornar um gate.

## Dois níveis de teste Python

- `corepack npm run python:test` executa a bateria completa e mede cobertura;
  é o gate de CI/release.
- `corepack npm run python:test:focused -- tests/test_pmev_spec.py` executa um
  recorte sem impor uma cobertura global artificial. Use-o durante iteração;
  nunca o apresente como substituto do gate completo.

## Fronteira PMev

O backend produz especificações, invariantes e experimentos; o frontend expõe
versão, fontes e limitações através do manifesto editorial. Nenhum selo público
de validação pode existir sem artefato versionado, teste e método rastreável.
