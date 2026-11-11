---
id: registro-2026-11-11-hybrid-router-genai-jules-zod4
tipo: registro
escopo: Site -- google-genai>=3.2.0 em tools/hybrid_router e gitlink skills/gemini-cli-jules (zod4+SDK pin)
ecossistema: nexus-sota
autor: Devin (SWE-2 Flash) <158243242+devin-ai-integration[bot]@users.noreply.github.com>
criado_em: '2026-11-11T10:20:00-03:00'
atualizado_em: '2026-11-11T10:20:00-03:00'
classes:
- interno
- medido
- governanca
- dependencias
config_medida:
  congelada_em: '2026-11-11'
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  data: '2026-11-11'
caminhos:
- skills/gemini-cli-jules
- tools/hybrid_router/requirements.txt
- reports/REGISTRO-2026-11-11-hybrid-router-genai-jules-zod4.md
revisoes_de_ancora:
- registro: handoff-2026-11-08-otimizacao-backend-e-integridade-sota
  caminhos:
  - tools/hybrid_router/requirements.txt
  parecer: 'Reconciliacao SOTA 2026-11-11: piso google-genai>=3.0.0->>=3.2.0 em tools/hybrid_router/requirements.txt (harmonizacao com pyproject canonico; demais pins ja estavam no latest PyPI) e gitlink skills/gemini-cli-jules para 9f4bfa3 (zod 4.6.7 + pin SDK 1.32.2 no mcp-server, build+testes verdes no fork). Pisos de seguranca e contratos inalterados.'
- registro: registro-2026-11-06-reparo-manifestos-e-declaracao-chrysalis
  caminhos:
  - tools/hybrid_router/requirements.txt
  parecer: 'Reconciliacao SOTA 2026-11-11: piso google-genai>=3.0.0->>=3.2.0 em tools/hybrid_router/requirements.txt (harmonizacao com pyproject canonico; demais pins ja estavam no latest PyPI) e gitlink skills/gemini-cli-jules para 9f4bfa3 (zod 4.6.7 + pin SDK 1.32.2 no mcp-server, build+testes verdes no fork). Pisos de seguranca e contratos inalterados.'
- registro: registro-2026-11-08-elevacao-polars-2-1-e-consumo-integral-engines-sota
  caminhos:
  - tools/hybrid_router/requirements.txt
  parecer: 'Reconciliacao SOTA 2026-11-11: piso google-genai>=3.0.0->>=3.2.0 em tools/hybrid_router/requirements.txt (harmonizacao com pyproject canonico; demais pins ja estavam no latest PyPI) e gitlink skills/gemini-cli-jules para 9f4bfa3 (zod 4.6.7 + pin SDK 1.32.2 no mcp-server, build+testes verdes no fork). Pisos de seguranca e contratos inalterados.'
- registro: registro-2026-11-08-otimizacao-backend-sonarlint-pyright-e-headings
  caminhos:
  - tools/hybrid_router/requirements.txt
  parecer: 'Reconciliacao SOTA 2026-11-11: piso google-genai>=3.0.0->>=3.2.0 em tools/hybrid_router/requirements.txt (harmonizacao com pyproject canonico; demais pins ja estavam no latest PyPI) e gitlink skills/gemini-cli-jules para 9f4bfa3 (zod 4.6.7 + pin SDK 1.32.2 no mcp-server, build+testes verdes no fork). Pisos de seguranca e contratos inalterados.'
pendencias_resolvidas: []
verificado:
  - 'PyPI JSON API: fastapi 0.162.4, uvicorn 0.54.0, httpx 0.28.1, pydantic 2.14.3, google-genai 3.2.0, numpy 2.5.4, pandas 3.1.1, matplotlib 3.11.2, seaborn 0.13.2 -- todos os pins do hybrid_router ja no latest exceto google-genai'
  - 'jules-mcp-server: npm install + tsc build + vitest 2/2 verdes com zod 4.6.7 e SDK 1.32.2; npm audit 0 vulnerabilidades'
  - 'git push fork jules: 1b0a216..9f4bfa3 em fix/injecao-no-workflow-e-registro-da-tool'
nao_verificado:
  - 'Audit Rust (core/nexus-core-rust, wasm-equity, simulator Cargo.toml) nao executado: cargo ausente no PATH do ambiente; crates nao revalidadas contra crates.io nesta sessao'
  - 'gemini-supermemory e token-efficiency: npm outdated vazio (devDeps ja no latest); hooks.json sao configs sem deps versionadas'
  - 'engine/package.json: sem dependencies/devDependencies declaradas'
---
---

# google-genai>=3.2.0 no hybrid_router e gitlink skills/gemini-cli-jules

Auditoria ecosystem-wide de dependencias (hooks, plugins, extensoes,
frameworks, engines):

- `tools/hybrid_router/requirements.txt`: `google-genai>=3.0.0` -> `>=3.2.0`
  (harmonizacao com o piso canonico do pyproject; os demais 8 pins ja
  estavam no latest PyPI).
- `skills/gemini-cli-jules` gitlink -> `9f4bfa3`: mcp-server com zod
  ^4.6.7 e @modelcontextprotocol/sdk pinado ^1.32.2 (antes wildcard `*`).
  Commit anterior mantinha zod3 por suposta incompat de SDK -- refutado
  empiricamente: SDK 1.32 aceita zod3||zod4; tsc build e 2/2 vitest verdes,
  npm audit limpo.
- Superficies auditadas sem acao necessaria: gemini-supermemory e
  token-efficiency (npm outdated vazio), engine/package.json (sem deps),
  .husky hooks (shell, sem deps versionadas), gemini-extension.json
  (metadados de extensao, nao manifests de deps), core/vendor/drjit
  (vendored, intocavel).

## Reconciliacao de ancoras

4 registros vigentes ancorados nos caminhos tocados receberam
`revisoes_de_ancora` neste commit.
