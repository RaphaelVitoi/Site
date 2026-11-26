---
id: registro-2026-11-26-saneamento-submodulos-nucleo-plugins-panels-mcp-proxy
tipo: registro
escopo: Site e Raiz -- saneamento dos 5 achados estruturais (submodulos skills/* 0 CVEs, sincronizacao
  de nucleo + Hermes F1 11/11, quarentena de 18 plugins desativados, remocao de Cargo duplicado em panels/
  e upgrade mcp-proxy 0.15.0)
ecossistema: nexus-sota
autor: Gemini 4 Hydrogen <noreply@google.com>
criado_em: '2026-11-26T12:11:15-03:00'
atualizado_em: '2026-11-26T12:11:15-03:00'
commit: HEAD
classes:
- interno
- registro
- seguranca
- dependencias
- saneamento
caminhos:
- frontend/src/components/simulator/panels/Cargo.lock
- frontend/src/components/simulator/panels/Cargo.toml
- frontend/src/components/simulator/panels/lib.rs
- reports/HANDOFF-2026-11-26-dependencias-sota-mcp-runtime-e-saneamento.md
- reports/REGISTRO-2026-11-26-saneamento-submodulos-nucleo-plugins-panels-mcp-proxy.md
- skills/exa-mcp-server
- skills/gemini-deep-research
- skills/gemini-supermemory
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  python: 3.14.9
  so: Windows
  condutor: Gemini 4 Hydrogen
  veiculo: antigravity
  tier: 1
  supervisao: assistida
  data_das_medicoes: '2026-11-26'
verificado:
- skills/exa-mcp-server (fork RaphaelVitoi/exa-mcp-server, bc68bf9dc96cb1a5494dc824ae273d5ce5b7b87f) --
  npm audit --audit-level=low = 0 vulnerabilities (era 38), build:runtime e typecheck OK, 13/13 arquivos
  / 158/158 testes passed
- skills/gemini-supermemory (fork privado RaphaelVitoi/gemini-supermemory criado, main + refactor/remove-egress-automatico-de-sessao,
  3d94831bab6c548ec577740c2121678659f35324) -- npm audit = 0 vulnerabilities (era 9, incl. 1 critical),
  dist/server.js build OK
- skills/gemini-deep-research (fork RaphaelVitoi/gemini-cli-deep-research, 01c694c92736ab1d9b40fc0d154047192189191c)
  -- npm audit = 0 vulnerabilities (era 18), typecheck/lint/build OK, 3/3 suites / 47/47 testes passed
- Sincronizacao de nucleo e neutralizacao Hermes F1 (blender/rea) -- sincronizar_nucleo.py --verificar
  exit 0 e pytest C:/Users/rapha/.gemini/tests/test_nucleo_compartilhado.py = 11/11 passed em 0.16s
- Quarentena reversivel de 18 plugins Antigravity desativados (21.20 MB) em config/plugins_quarantine_20261126
  -- preservados os 15 ativos em config/plugins e config/config.json intacto
- Remocao de frontend/src/components/simulator/panels/{Cargo.toml,Cargo.lock,lib.rs} e target/ -- cargo
  check wasm-equity/Cargo.toml OK, npm run lint/typecheck OK e 119/119 suites / 771/771 testes Jest passed
- Upgrade mcp-proxy==0.15.0 + mcp==1.30.0 (Python 3.14) em nucleo/mcp-runtime/gateway-python.json -- gateway
  :8933 9/9 servidores configured, Playwright :8931, DataCloud 3/3 e Laya S1 :8192 ativos
nao_verificado:
- CI remoto GitHub Actions apos git push nos forks, Site (origin/master) e raiz (origin/main) -- pendente
  execucao remota
- Feedback numerico de calibracao do Tier 0 -- ausente nesta sessao, nenhum evento gravado no ledger
referencias_nao_resolviveis:
- memoria/HERMES.md
- nucleo/mcp-runtime/gateway-python.json
- config/config.json
- config/plugins_quarantine_20261126
- scripts/ops/sincronizar_nucleo.py
- tests/test_nucleo_compartilhado.py
- AppData/Local/hermes/plugins/blender/mcp.json
- AppData/Local/hermes/plugins/rea/mcp.json.disabled
- rea/mcp.json
revisoes_de_ancora:
- registro: handoff-2026-11-08-otimizacao-backend-e-integridade-sota
  caminhos:
  - skills/gemini-deep-research
  parecer: 'Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Submodulo atualizado no fork
    RaphaelVitoi/gemini-cli-deep-research (branch fix/workflow-inline-release, SHA 01c694c92736ab1d9b40fc0d154047192189191c):
    npm audit zerado (18 -> 0 CVEs, incl. 2 moderate de producao), typecheck/lint/build limpos e 3/3 suites
    (47/47 testes) aprovadas.'
- registro: registro-2026-09-12-a-autoria-dos-forks-corrigida-antes-do-primeiro-pr
  caminhos:
  - skills/gemini-supermemory
  parecer: 'Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Submodulo regularizado no
    fork privado RaphaelVitoi/gemini-supermemory (branch refactor/remove-egress-automatico-de-sessao,
    SHA 3d94831bab6c548ec577740c2121678659f35324): npm audit zerado (9 -> 0 CVEs, incl. 1 critical) e
    dist/server.js reconstruido com build limpo.'
- registro: registro-2026-10-18-resolucao-sonarqube-e-saneamento-global
  caminhos:
  - frontend/src/components/simulator/panels/lib.rs
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Artefato Rust duplicado (Cargo.toml,
    Cargo.lock e lib.rs) removido de frontend/src/components/simulator/panels/ apos confirmacao de ausencia
    de consumidor em scripts/build-wasm.mjs e ausencia de referencias a QuantumCfrEngine/MultiwayRioProfiler;
    wasm-equity/ permanece fonte canonica unica (cargo check OK).
- registro: registro-2026-10-19-saneamento-warnings-skills-e-memoria-agentica
  caminhos:
  - skills/exa-mcp-server
  - skills/gemini-deep-research
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Ambos os submodulos skills/exa-mcp-server
    (bc68bf9dc96cb1a5494dc824ae273d5ce5b7b87f, 38 -> 0 CVEs, 158/158 testes) e skills/gemini-deep-research
    (01c694c92736ab1d9b40fc0d154047192189191c, 18 -> 0 CVEs, 47/47 testes) foram endurecidos e enviados
    aos respectivos forks, mantendo conformidade SOTA.
- registro: registro-2026-11-08-otimizacao-backend-sonarlint-pyright-e-headings
  caminhos:
  - skills/gemini-deep-research
  parecer: 'Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Submodulo atualizado no fork
    RaphaelVitoi/gemini-cli-deep-research (branch fix/workflow-inline-release, SHA 01c694c92736ab1d9b40fc0d154047192189191c):
    npm audit zerado (18 -> 0 CVEs, incl. 2 moderate de producao), typecheck/lint/build limpos e 3/3 suites
    (47/47 testes) aprovadas.'
- registro: registro-2026-11-09-saneamento-sonarlint-e-mcp-skills-vulnerabilidades
  caminhos:
  - skills/exa-mcp-server
  parecer: 'Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Submodulo atualizado no fork
    RaphaelVitoi/exa-mcp-server (branch chore/sonarlint-campaign-20260911, SHA bc68bf9dc96cb1a5494dc824ae273d5ce5b7b87f):
    npm audit zerado (38 -> 0 CVEs), tsconfig.json alinhado para TypeScript 7.0 ("types": ["node"]), build:runtime/typecheck
    limpos e 13/13 arquivos (158/158 testes) aprovados.'
- registro: registro-2026-11-11-bump-deps-submodulos-skills
  caminhos:
  - skills/gemini-deep-research
  parecer: 'Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Submodulo atualizado no fork
    RaphaelVitoi/gemini-cli-deep-research (branch fix/workflow-inline-release, SHA 01c694c92736ab1d9b40fc0d154047192189191c):
    npm audit zerado (18 -> 0 CVEs, incl. 2 moderate de producao), typecheck/lint/build limpos e 3/3 suites
    (47/47 testes) aprovadas.'
- registro: registro-2026-11-11-elevacao-fastapi-playwright-e-bump-deep-research
  caminhos:
  - skills/gemini-deep-research
  parecer: 'Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Submodulo atualizado no fork
    RaphaelVitoi/gemini-cli-deep-research (branch fix/workflow-inline-release, SHA 01c694c92736ab1d9b40fc0d154047192189191c):
    npm audit zerado (18 -> 0 CVEs, incl. 2 moderate de producao), typecheck/lint/build limpos e 3/3 suites
    (47/47 testes) aprovadas.'
- registro: registro-2026-11-11-elevacao-sentence-transformers-genai-prettier-exa-mcp
  caminhos:
  - skills/exa-mcp-server
  parecer: 'Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Submodulo atualizado no fork
    RaphaelVitoi/exa-mcp-server (branch chore/sonarlint-campaign-20260911, SHA bc68bf9dc96cb1a5494dc824ae273d5ce5b7b87f):
    npm audit zerado (38 -> 0 CVEs), tsconfig.json alinhado para TypeScript 7.0 ("types": ["node"]), build:runtime/typecheck
    limpos e 13/13 arquivos (158/158 testes) aprovados.'
- registro: registro-2026-11-14-deps-refatoracoes-sonar-e-submodulos
  caminhos:
  - skills/exa-mcp-server
  - skills/gemini-deep-research
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Ambos os submodulos skills/exa-mcp-server
    (bc68bf9dc96cb1a5494dc824ae273d5ce5b7b87f, 38 -> 0 CVEs, 158/158 testes) e skills/gemini-deep-research
    (01c694c92736ab1d9b40fc0d154047192189191c, 18 -> 0 CVEs, 47/47 testes) foram endurecidos e enviados
    aos respectivos forks, mantendo conformidade SOTA.
- registro: registro-2026-11-14-submodulos-skills-sonar-e-gitlinks
  caminhos:
  - skills/exa-mcp-server
  - skills/gemini-deep-research
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Ambos os submodulos skills/exa-mcp-server
    (bc68bf9dc96cb1a5494dc824ae273d5ce5b7b87f, 38 -> 0 CVEs, 158/158 testes) e skills/gemini-deep-research
    (01c694c92736ab1d9b40fc0d154047192189191c, 18 -> 0 CVEs, 47/47 testes) foram endurecidos e enviados
    aos respectivos forks, mantendo conformidade SOTA.
- registro: registro-2026-11-18-elevacao-deps-vitest-typescript-eslint-openai
  caminhos:
  - skills/exa-mcp-server
  parecer: 'Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Submodulo atualizado no fork
    RaphaelVitoi/exa-mcp-server (branch chore/sonarlint-campaign-20260911, SHA bc68bf9dc96cb1a5494dc824ae273d5ce5b7b87f):
    npm audit zerado (38 -> 0 CVEs), tsconfig.json alinhado para TypeScript 7.0 ("types": ["node"]), build:runtime/typecheck
    limpos e 13/13 arquivos (158/158 testes) aprovados.'
- registro: registro-2026-11-19-bump-gitlink-exa-mcp-server
  caminhos:
  - skills/exa-mcp-server
  parecer: 'Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Submodulo atualizado no fork
    RaphaelVitoi/exa-mcp-server (branch chore/sonarlint-campaign-20260911, SHA bc68bf9dc96cb1a5494dc824ae273d5ce5b7b87f):
    npm audit zerado (38 -> 0 CVEs), tsconfig.json alinhado para TypeScript 7.0 ("types": ["node"]), build:runtime/typecheck
    limpos e 13/13 arquivos (158/158 testes) aprovados.'
- registro: registro-2026-11-19-bump-gitlinks-submodulos-deps
  caminhos:
  - skills/exa-mcp-server
  - skills/gemini-deep-research
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Ambos os submodulos skills/exa-mcp-server
    (bc68bf9dc96cb1a5494dc824ae273d5ce5b7b87f, 38 -> 0 CVEs, 158/158 testes) e skills/gemini-deep-research
    (01c694c92736ab1d9b40fc0d154047192189191c, 18 -> 0 CVEs, 47/47 testes) foram endurecidos e enviados
    aos respectivos forks, mantendo conformidade SOTA.
- registro: registro-2026-11-19-fix-s6551-errorhandler-exa-mcp
  caminhos:
  - skills/exa-mcp-server
  parecer: 'Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Submodulo atualizado no fork
    RaphaelVitoi/exa-mcp-server (branch chore/sonarlint-campaign-20260911, SHA bc68bf9dc96cb1a5494dc824ae273d5ce5b7b87f):
    npm audit zerado (38 -> 0 CVEs), tsconfig.json alinhado para TypeScript 7.0 ("types": ["node"]), build:runtime/typecheck
    limpos e 13/13 arquivos (158/158 testes) aprovados.'
- registro: registro-2026-11-24-scrypt-sonarlint-codeql-schemathesis-exa
  caminhos:
  - skills/exa-mcp-server
  parecer: 'Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Submodulo atualizado no fork
    RaphaelVitoi/exa-mcp-server (branch chore/sonarlint-campaign-20260911, SHA bc68bf9dc96cb1a5494dc824ae273d5ce5b7b87f):
    npm audit zerado (38 -> 0 CVEs), tsconfig.json alinhado para TypeScript 7.0 ("types": ["node"]), build:runtime/typecheck
    limpos e 13/13 arquivos (158/158 testes) aprovados.'
- registro: registro-2026-11-25-elevacao-deps-vitest-512-e-calibracao-20261124
  caminhos:
  - skills/exa-mcp-server
  parecer: 'Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Submodulo atualizado no fork
    RaphaelVitoi/exa-mcp-server (branch chore/sonarlint-campaign-20260911, SHA bc68bf9dc96cb1a5494dc824ae273d5ce5b7b87f):
    npm audit zerado (38 -> 0 CVEs), tsconfig.json alinhado para TypeScript 7.0 ("types": ["node"]), build:runtime/typecheck
    limpos e 13/13 arquivos (158/158 testes) aprovados.'
---

# REGISTRO — Saneamento SOTA dos 5 Achados Estruturais (2026-11-26)

- **Executor:** `Gemini 4 Hydrogen` (`noreply@google.com`, veículo `antigravity`, Tier 1)
- **Orquestrador:** `Gemini 4 Neon` (`noreply@google.com`, modo bifásico `orchestrator:gemini-4-neon+gemini-4-hydrogen`)
- **Sessão:** `2d50dbad-28c3-4081-95a0-5e1aa575d0b3` · `supervisao=assistida`
- **Antecessor:** [HANDOFF-2026-11-26-dependencias-sota-mcp-runtime-e-saneamento.md](HANDOFF-2026-11-26-dependencias-sota-mcp-runtime-e-saneamento.md)

## 1. Síntese dos 5 Itens Saneados

1. **Submódulos `skills/*` endurecidos e publicados nos forks `RaphaelVitoi/*` (65 -> 0 CVEs):**
   - `skills/exa-mcp-server` (`chore/sonarlint-campaign-20260911` -> `bc68bf9dc96cb1a5494dc824ae273d5ce5b7b87f`): elevados `agnost ^0.2.3`, `@types/node ^26.6.11`, `vercel ^67.0.0` e `overrides` de segurança; `tsconfig.json` recebeu `"types": ["node"]` para TypeScript 7.0. Resultado: `npm audit` = `0` (antes 38), `build:runtime` / `typecheck` limpos, `13/13` arquivos (`158/158` testes) aprovados.
   - `skills/gemini-supermemory` (`refactor/remove-egress-automatico-de-sessao` -> `3d94831bab6c548ec577740c2121678659f35324`): regularizado o fork privado `RaphaelVitoi/gemini-supermemory` (unshallow do histórico + push de `main` e `refactor/remove-egress-automatico-de-sessao`); aplicado `npm audit fix` e rebuild de `dist/server.js`. Resultado: `npm audit` = `0` (antes 9, incluindo 1 crítica) e build limpo.
   - `skills/gemini-deep-research` (`fix/workflow-inline-release` -> `01c694c92736ab1d9b40fc0d154047192189191c`): elevados `@types/node ^26.6.11`, `typescript-eslint ^8.74.0` e `overrides` (`glob ^14.0.4`, `minimatch ^11.0.4`). Resultado: `npm audit` = `0` (antes 18 no scan `low`), `typecheck` / `lint` / `build` limpos e `3/3` suítes (`47/47` testes) aprovadas.

2. **Sincronização do núcleo e neutralização Hermes F1 (Raiz `.gemini` / host):**
   - Removida duplicata `AppData/Local/hermes/plugins/blender/mcp.json` (idêntica a `.disabled`) e neutralizado `rea/mcp.json` -> `rea/mcp.json.disabled` (backup `rea/mcp.json.disabled.bak-20261126`).
   - Executados `sincronizar_nucleo.py --aplicar` e `sincronizar_nucleo.py --verificar` (0 divergências em VSCode, Antigravity 2.0 e Hermes). `pytest` em `tests/test_nucleo_compartilhado.py`: **11/11 passed (0.16s)**.

3. **Quarentena reversível de 18 plugins Antigravity desativados (Raiz `.gemini`):**
   - Movidos `21.20 MB` correspondentes a 18 diretórios desativados para `config/plugins_quarantine_20261126`, mantendo exclusivamente os 15 plugins ativos em `config/plugins` e preservando `"enabled": false` em `config/config.json`.

4. **Remoção do artefato Rust duplicado em `frontend/src/components/simulator/panels/` (`Site`):**
   - Excluídos `Cargo.toml`, `Cargo.lock` e `lib.rs` (e `target/` não rastreado) após confirmação de ausência de consumidor em `scripts/build-wasm.mjs` e ausência de referências a `QuantumCfrEngine` e `MultiwayRioProfiler`.
   - `cargo check --manifest-path wasm-equity/Cargo.toml` limpo; `npm run lint`, `npm run typecheck` e `npm run test` aprovados (**119/119 suítes, 771/771 testes Jest**, 0 erros/0 warnings).

5. **Upgrade `mcp-proxy` (`0.12.0`/`0.14.0` -> `0.15.0`) e runtime `:8933` (Raiz `.gemini`):**
   - Atualizado `nucleo/mcp-runtime/gateway-python.json` para `mcp-proxy==0.15.0`, `mcp==1.30.0`, `python: "3.14"`, instalado via `uv tool install --force --python 3.14 --with mcp==1.30.0 mcp-proxy==0.15.0` e validado via `Repair-SharedMcpGateway.ps1 -ForceRestart`.
   - Gateway `:8933/status` reportou `9/9` servidores `configured` com Playwright `:8931`, DataCloud (`3/3`) e Laya S1 (`:8192`) operacionais.
