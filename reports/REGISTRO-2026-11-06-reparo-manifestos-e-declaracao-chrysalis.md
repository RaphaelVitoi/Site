---
id: registro-2026-11-06-reparo-manifestos-e-declaracao-chrysalis
tipo: registro
escopo: Site -- Reparo de manifestos corrompidos, bumps de dependencias validados e declaracao da skill chrysalis-live-editing
ecossistema: nexus-sota
autor: Hermes Agent <noreply@hermes.local>
criado_em: '2026-11-06T04:00:00-03:00'
atualizado_em: '2026-11-06T04:00:00-03:00'
commit: HEAD
verificado:
- Sintaxe de requirements.txt (packaging), parse de package.json e pyproject.toml
- Resolucao Python via uv pip compile (tenacity 9.1.4, google-genai 3.0.0, python-dateutil 4.0.0)
- Resolucao JS via npm install --dry-run apos alinhamento de overrides
- cargo check em wasm-equity e nexus-core-rust (default e --features python)
- cargo check --features wasm --target wasm32-unknown-unknown no nexus-core-rust (2026-11-06, getrandom 0.2.17 com feature js)
- tests/test_governanca_skills.py 10 passed
- npm audit high 0 apos revert do markdownlint-cli para 0.49.1
- Suite completa do Site verde via pre-push hook (arvores 75105fce e 940453eb, 2026-11-06)
- npm audit moderate 0 via overrides glob ^14.0.4 + deepmerge ^4.3.1 (2026-11-06; deepmerge restante com aceite formal em data/npm_cve_acceptances.json)
nao_verificado:
  - "Extensoes sota-chrome-cockpit/tab-autocomplete-nano: commits locais sem remoto (push impossivel); probe GPU corrigido em 94fc778/c448cdc"
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  data_das_medicoes: 2026-11-06
  toolchain: cargo check + uv pip compile + npm dry-run + pytest modulo governanca
classes:
- interno
- medido
- governanca
- registro
- backend
- sota
caminhos:
- .claude/agents/implementor.md
- core/nexus-core-rust/Cargo.lock
- core/nexus-core-rust/Cargo.toml
- data/agents_manifest.json
- package-lock.json
- package.json
- pyproject.toml
- requirements.txt
- tests/test_governanca_skills.py
- tools/hybrid_router/requirements.txt
- uv.lock
- wasm-equity/Cargo.lock
- wasm-equity/Cargo.toml
- reports/REGISTRO-2026-11-06-reparo-manifestos-e-declaracao-chrysalis.md
revisoes_de_ancora:
- registro: registro-2026-10-24-auditoria-geral-saneamento-e-reconciliacao
  caminhos:
  - package-lock.json
  - tests/test_governanca_skills.py
  parecer: 'Caminhos revisados em 2026-11-06: package-lock.json regenerado apos alinhamento de overrides (vitest 5, markdownlint revertido a 0.49.1 por re2js) e test_governanca_skills.py com chrysalis-live-editing incluido no allowlist da ponte. Conteudo dos registros anteriores segue valido para o restante dos caminhos.'
- registro: registro-2026-10-24-remediacao-integral-74-vulnerabilidades-dependabot
  caminhos:
  - package-lock.json
  - package.json
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: 'Caminhos revisados em 2026-11-06: manifestos reparados (versoes esvaziadas restauradas, tenacity compativel com google-genai 3.0.0, vitest 5 com override alinhado) com resolucao medida (uv pip compile, npm dry-run, cargo check). Bumps mantidos sao upgrades validados; markdownlint-cli revertido para 0.49.1 por vulnerabilidade re2js de alta severidade introduzida pelo bump para 0.50.0.'
- registro: registro-2026-11-05-saneamento-customizations-e-elevacao-dependencias
  caminhos:
  - pyproject.toml
  parecer: 'Caminho revisado em 2026-11-06: pyproject.toml com tenacity restaurado para >=9.1.4,<9.2.0 (faixa imposivel >=9.2.1,<9.2.0 corrigida contra o METADATA do google-genai 3.0.0) e python-dateutil 4.0.0 confirmado existente. Demais conteudos do registro seguem validos.'
- registro: auditoria-2026-10-08-integralidade-backend
  caminhos:
  - pyproject.toml
  - requirements.txt
  parecer: 'Caminho revisado em 2026-11-06: manifestos de dependencia reparados e validados (resolucao medida via uv/npm/cargo); alteracoes sao upgrades sem quebra de contrato declarada nos registros anteriores.'
- registro: handoff-2026-10-08-auditoria-e-remediacao-backend
  caminhos:
  - package-lock.json
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: 'Caminho revisado em 2026-11-06: manifestos de dependencia reparados e validados (resolucao medida via uv/npm/cargo); alteracoes sao upgrades sem quebra de contrato declarada nos registros anteriores.'
- registro: handoff-2026-10-24-remediacao-dependabot-e-integridade-sota
  caminhos:
  - package-lock.json
  - package.json
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: 'Caminho revisado em 2026-11-06: manifestos de dependencia reparados e validados (resolucao medida via uv/npm/cargo); alteracoes sao upgrades sem quebra de contrato declarada nos registros anteriores.'
- registro: registro-2026-09-25-teto-de-commits-e-push-obrigatorio
  caminhos:
  - data/agents_manifest.json
  parecer: 'Caminho revisado em 2026-11-06: manifestos de dependencia reparados e validados (resolucao medida via uv/npm/cargo); alteracoes sao upgrades sem quebra de contrato declarada nos registros anteriores.'
- registro: registro-2026-10-04-remediacao-dependabot-pypdf
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Caminho revisado em 2026-11-06: manifestos de dependencia reparados e validados (resolucao medida via uv/npm/cargo); alteracoes sao upgrades sem quebra de contrato declarada nos registros anteriores.'
- registro: registro-2026-10-04-remediacao-dependabot-sentence-transformers-e-urllib3
  caminhos:
  - uv.lock
  parecer: 'Caminho revisado em 2026-11-06: manifestos de dependencia reparados e validados (resolucao medida via uv/npm/cargo); alteracoes sao upgrades sem quebra de contrato declarada nos registros anteriores.'
- registro: registro-2026-10-06-strata-moe-125b-e-dashboard-nexus
  caminhos:
  - data/agents_manifest.json
  parecer: 'Caminho revisado em 2026-11-06: manifestos de dependencia reparados e validados (resolucao medida via uv/npm/cargo); alteracoes sao upgrades sem quebra de contrato declarada nos registros anteriores.'
- registro: registro-2026-10-08-auditoria-e-remediacao-backend
  caminhos:
  - package-lock.json
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: 'Caminho revisado em 2026-11-06: manifestos de dependencia reparados e validados (resolucao medida via uv/npm/cargo); alteracoes sao upgrades sem quebra de contrato declarada nos registros anteriores.'
- registro: registro-2026-10-08-skill-sota-server-lifecycle-warmup
  caminhos:
  - data/agents_manifest.json
  parecer: 'Caminho revisado em 2026-11-06: manifestos de dependencia reparados e validados (resolucao medida via uv/npm/cargo); alteracoes sao upgrades sem quebra de contrato declarada nos registros anteriores.'
- registro: registro-2026-10-10-evolucao-malha-agentica-sota-v8-gold
  caminhos:
  - tests/test_governanca_skills.py
  parecer: 'Caminho revisado em 2026-11-06: manifestos de dependencia reparados e validados (resolucao medida via uv/npm/cargo); alteracoes sao upgrades sem quebra de contrato declarada nos registros anteriores.'
- registro: registro-2026-10-13-remediacao-dependabot-e-offload-strata
  caminhos:
  - package-lock.json
  - package.json
  - uv.lock
  parecer: 'Caminho revisado em 2026-11-06: manifestos de dependencia reparados e validados (resolucao medida via uv/npm/cargo); alteracoes sao upgrades sem quebra de contrato declarada nos registros anteriores.'
- registro: registro-2026-10-14-saneamento-tipagem-config-ide-e-dependencias
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Caminho revisado em 2026-11-06: manifestos de dependencia reparados e validados (resolucao medida via uv/npm/cargo); alteracoes sao upgrades sem quebra de contrato declarada nos registros anteriores.'
- registro: registro-2026-10-18-remediacao-dependabot-e-renovacao-axe
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: 'Caminho revisado em 2026-11-06: manifestos de dependencia reparados e validados (resolucao medida via uv/npm/cargo); alteracoes sao upgrades sem quebra de contrato declarada nos registros anteriores.'
---

# Registro 2026-11-06 — reparo de manifestos, bumps validados e declaracao chrysalis

## O que foi encontrado

Auditoria de edicoes pendentes em tres repos (Site, sota-chrome-cockpit,
tab-autocomplete-nano). No Site, os manifestos de dependencia continham
corrupcao de edicao automatizada: versoes esvaziadas (`aiohttp>=`,
`scikit-learn>=`, `regex>=`...), operador triplo (`timesfm[torch]===3.0.2`),
faixa impossivel (`tenacity>=9.2.1,<9.2.0`) e caps removidos. Alem disso, a
skill `chrysalis-live-editing` existia versionada sem declaracao no manifesto
de agentes, derrubando dois testes de governanca.

## O que foi corrigido

- `requirements.txt`: todas as linhas esvaziadas restauradas com versoes e
  caps do HEAD, alinhadas ao `pyproject.toml` onde ele evoluiu
  (python-dateutil 4.0.0, watchdog 7.1.0).
- `pyproject.toml`: tenacity restaurado para `>=9.1.4,<9.2.0` — o
  `google-genai 3.0.0` exige `tenacity<9.2.0` (medido no METADATA da wheel).
- `package.json`: override `@vitest/mocker` alinhado a `^5.1.0` (vitest 5);
  `markdownlint-cli` revertido a `^0.49.1` porque o bump para 0.50.0
  introduziu 3 vulnerabilidades altas (re2js, audit medido antes/depois:
  high 3 -> 0).
- `core/nexus-core-rust/Cargo.toml`: `getrandom 0.4.3` revertido a `0.2`
  porque a feature `js` nao existe mais no 0.4 (cargo check falhou na
  resolucao; apos o revert, check + `--features python` passam).
- Skill `chrysalis-live-editing` declarada no agente `implementor` em
  `data/agents_manifest.json`, `.claude/agents/implementor.md` regenerado
  pelo script canonico e allowlist da ponte atualizado no teste.

## Evidencia (medida, nao citada)

- Sintaxe: `packaging` valida todas as linhas de `requirements.txt`;
  `package.json` e `pyproject.toml` parseiam.
- Resolucao Python: `uv pip compile requirements.txt` resolve
  (tenacity 9.1.4, google-genai 3.0.0, python-dateutil 4.0.0).
- Resolucao JS: `npm install --dry-run` ok apos alinhamento de overrides.
- Rust: `cargo check` em `wasm-equity` e em `nexus-core-rust`
  (default e `--features python`) passam.
- Testes: `tests/test_governanca_skills.py` 10 passed.
- Seguranca: `npm audit` high 0 apos o revert do markdownlint (restam 17
  moderadas + 1 baixa do ecossistema jest 30, pre-existentes, cuja correcao
  exige downgrade major para jest 29 — fora do escopo: nao aplicado).
