---
id: registro-2026-11-03-sincronizacao-e-correcao-frontmatter-skills-sota
tipo: registro
escopo: Site -- Sincronizacao, renomeacao e correcao de frontmatter YAML nas skills SOTA
ecossistema: nexus-sota
autor: Gemini 3.8 Flash <noreply@google.com>
criado_em: '2026-11-03T19:15:00-03:00'
atualizado_em: '2026-11-03T19:49:00-03:00'
commit: HEAD
classes:
- interno
- medido
- governanca
- registro
- skills
- sota
caminhos:
- .agents/skills.json
- .agents/skills/chrome-devtools-agent-sota/SKILL.md
- .agents/skills/exa-search-engine/SKILL.md
- .agents/skills/google-jules-cloud/SKILL.md
- .agents/skills/google-stitch-design/SKILL.md
- .agents/skills/google-workspace-sota/SKILL.md
- .agents/skills/google-workspace-sota/references/api_reference.md
- .agents/skills/google-workspace-sota/scripts/drive_export.mjs
- .agents/skills/google-workspace-sota/scripts/probe_workspace.mjs
- .agents/skills/mcp-toolbox-database/SKILL.md
- .agents/skills/pmev-game-theory-engine/SKILL.md
- .agents/skills/poker-pmev-knowledge-engine/SKILL.md
- .agents/skills/session-impact-evaluator/SKILL.md
- .agents/skills/site-session-handoff/SKILL.md
- .agents/skills/sota-quality-gate/SKILL.md
- .agents/skills/sota-server-lifecycle-warmup/SKILL.md
- .agents/skills/strata-inference-engine/SKILL.md
- .agents/skills/timesfm-forecasting/SKILL.md
- .claude/agents/bibliotecario.md
- data/agents_manifest.json
- reports/REGISTRO-2026-11-03-sincronizacao-e-correcao-frontmatter-skills-sota.md
- tests/test_governanca_skills.py
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  python: 3.14.7
  so: Windows
  condutor: Gemini 3.8 Flash <noreply@google.com>
  modelo: gemini-3.8-flash
  veiculo: antigravity
  tier: 1
  supervisao: assistida
  data_das_medicoes: 2026-11-03
verificado:
  - Saneamento de chave duplicada metadata no frontmatter YAML de .agents/skills/google-workspace-sota/SKILL.md e .agents/skills/poker-pmev-knowledge-engine/SKILL.md
  - Renomeacao canonica da pasta google-workspace para google-workspace-sota em conformidade com o identificador da skill
  - Atualizacao de data/agents_manifest.json, .agents/skills.json e tests/test_governanca_skills.py
  - Sincronizacao de .claude/agents/bibliotecario.md via sync_agents_reality.ps1
  - Unificacao de metadados hermes em todas as 14 skills sob .agents/skills sem quebra de sintaxe
  - Validacao de parsing com UniqueKeyLoader em todas as 14 skills com 0 erros de frontmatter
  - Execucao de testes em tests/test_skill_pmev_knowledge.py com 18 testes aprovados em 9.64s
  - Execucao de testes em tests/test_governanca_skills.py com 10 testes aprovados em 10.57s
  - Execucao de testes em tests/test_llm_ollama_integracao_real.py com 5 testes aprovados em 13.57s
  - Lint e Typecheck frontend aprovados com 0 erros
  - 111 suites de testes frontend com 739 testes aprovados no Jest
nao_verificado:
  - Validacao de execucao real de chamadas externas de rede para APIs do Google Workspace em ambiente offline
revisoes_de_ancora:
- registro: auditoria-2026-08-31-integridade-e-integracao-antigravity
  caminhos:
  - .agents/skills/pmev-game-theory-engine/SKILL.md
  - .agents/skills/sota-quality-gate/SKILL.md
  - .agents/skills.json
  - tests/test_governanca_skills.py
  parecer: Revisado em 2026-11-03. Metadados de frontmatter sincronizados sob o padrao Chico SOTA v8.0 Gold.
- registro: auditoria-2026-09-22-paridade-config-identidade
  caminhos:
  - .agents/skills/google-jules-cloud/SKILL.md
  - .agents/skills/google-stitch-design/SKILL.md
  parecer: Revisado em 2026-11-03. Metadados de frontmatter sincronizados sob o padrao Chico SOTA v8.0 Gold.
- registro: handoff-2026-08-30-auditoria-malha-agentica-e-trava-de-lfs
  caminhos:
  - data/agents_manifest.json
  - tests/test_governanca_skills.py
  parecer: Revisado em 2026-11-03. Atualizacao de skill do bibliotecario para google-workspace-sota.
- registro: handoff-2026-08-30-status-malha-agentica-e-routing
  caminhos:
  - data/agents_manifest.json
  parecer: Revisado em 2026-11-03. Atualizacao de skill do bibliotecario para google-workspace-sota.
- registro: handoff-2026-09-04-google-workspace-skill-e-curadoria-de-midia
  caminhos:
  - .agents/skills/google-workspace/SKILL.md
  parecer: Revisado em 2026-11-03. Renomeacao para google-workspace-sota e saneamento de frontmatter.
- registro: handoff-2026-09-22-paridade-config-identidade
  caminhos:
  - .agents/skills/google-jules-cloud/SKILL.md
  - .agents/skills/google-stitch-design/SKILL.md
  parecer: Revisado em 2026-11-03. Metadados de frontmatter sincronizados sob o padrao Chico SOTA v8.0 Gold.
- registro: handoff-2026-09-25-governanca-pools-openrouter-e-impacto
  caminhos:
  - .agents/skills/session-impact-evaluator/SKILL.md
  - .agents/skills/site-session-handoff/SKILL.md
  parecer: Revisado em 2026-11-03. Metadados de frontmatter sincronizados sob o padrao Chico SOTA v8.0 Gold.
- registro: registro-2026-09-11-teoria-sota-e-saneamento-multimodal
  caminhos:
  - .agents/skills/google-workspace/scripts/drive_export.mjs
  - .agents/skills/google-workspace/scripts/probe_workspace.mjs
  parecer: Revisado em 2026-11-03. Renomeacao para google-workspace-sota e saneamento de frontmatter.
- registro: registro-2026-09-13-pmev-contratos-baselines-composicao-e-skill
  caminhos:
  - .agents/skills/poker-pmev-knowledge-engine/SKILL.md
  parecer: Revisado em 2026-11-03. Saneamento de duplicidade de metadata no frontmatter YAML.
- registro: registro-2026-09-22-skill-handoff-e-calibracao
  caminhos:
  - .agents/skills/site-session-handoff/SKILL.md
  - .agents/skills.json
  - tests/test_governanca_skills.py
  parecer: Revisado em 2026-11-03. Metadados de frontmatter sincronizados sob o padrao Chico SOTA v8.0 Gold.
- registro: registro-2026-09-25-precedencia-economica-assinaturas-pro-e-nuvem-free
  caminhos:
  - .agents/skills/session-impact-evaluator/SKILL.md
  - .agents/skills/site-session-handoff/SKILL.md
  parecer: Revisado em 2026-11-03. Metadados de frontmatter sincronizados sob o padrao Chico SOTA v8.0 Gold.
- registro: registro-2026-09-25-skill-avaliacao-impacto-sessao
  caminhos:
  - .agents/skills/session-impact-evaluator/SKILL.md
  - .agents/skills/site-session-handoff/SKILL.md
  parecer: Revisado em 2026-11-03. Metadados de frontmatter sincronizados sob o padrao Chico SOTA v8.0 Gold.
- registro: registro-2026-09-25-teto-de-commits-e-push-obrigatorio
  caminhos:
  - data/agents_manifest.json
  parecer: Revisado em 2026-11-03. Atualizacao de skill do bibliotecario para google-workspace-sota.
- registro: registro-2026-09-29-saneamento-lint-e-calibracao
  caminhos:
  - .agents/skills/google-jules-cloud/SKILL.md
  parecer: Revisado em 2026-11-03. Metadados de frontmatter sincronizados sob o padrao Chico SOTA v8.0 Gold.
- registro: registro-2026-10-06-strata-moe-125b-e-dashboard-nexus
  caminhos:
  - .agents/skills/strata-inference-engine/SKILL.md
  - data/agents_manifest.json
  parecer: Revisado em 2026-11-03. Metadados de frontmatter sincronizados sob o padrao Chico SOTA v8.0 Gold.
- registro: registro-2026-10-08-skill-sota-server-lifecycle-warmup
  caminhos:
  - .agents/skills/sota-server-lifecycle-warmup/SKILL.md
  - data/agents_manifest.json
  parecer: Revisado em 2026-11-03. Metadados de frontmatter sincronizados sob o padrao Chico SOTA v8.0 Gold.
- registro: registro-2026-10-10-evolucao-malha-agentica-sota-v8-gold
  caminhos:
  - .agents/skills.json
  - tests/test_governanca_skills.py
  parecer: Revisado em 2026-11-03. Atualizacao da ponte de skills e testes de governanca.
- registro: registro-2026-10-13-remediacao-dependabot-e-offload-strata
  caminhos:
  - .agents/skills/strata-inference-engine/SKILL.md
  parecer: Revisado em 2026-11-03. Metadados de frontmatter sincronizados sob o padrao Chico SOTA v8.0 Gold.
- registro: registro-2026-10-19-evolucao-telemetria-mcp-s1-e-benchmark-regime
  caminhos:
  - .agents/skills/session-impact-evaluator/SKILL.md
  parecer: Revisado em 2026-11-03. Metadados de frontmatter sincronizados sob o padrao Chico SOTA v8.0 Gold.
- registro: registro-2026-10-19-verificacao-neural-timesfm-e-evolucao-ecossistema
  caminhos:
  - .agents/skills/timesfm-forecasting/SKILL.md
  parecer: Revisado em 2026-11-03. Metadados de frontmatter sincronizados sob o padrao Chico SOTA v8.0 Gold.
- registro: registro-2026-10-24-auditoria-geral-saneamento-e-reconciliacao
  caminhos:
  - tests/test_governanca_skills.py
  parecer: Revisado em 2026-11-03. Atualizacao dos testes de governanca de skills.
- registro: registro-2026-10-28-fortalecimento-e-harmonizacao-sota-triade-stitch-e-exa
  caminhos:
  - .agents/skills/exa-search-engine/SKILL.md
  - .agents/skills/google-stitch-design/SKILL.md
  parecer: Revisado em 2026-11-03. Metadados de frontmatter sincronizados sob o padrao Chico SOTA v8.0 Gold.
- registro: registro-2026-10-28-saneamento-reconciliacao-e-elevacao-dependencias-triade-montecarlo
  caminhos:
  - .claude/agents/bibliotecario.md
  - data/agents_manifest.json
  parecer: Revisado em 2026-11-03. Sincronizacao da skill google-workspace-sota para o bibliotecario.
- registro: registro-2026-11-01-integracao-ai-mesh-sdk-e-otimizacao-jules
  caminhos:
  - .agents/skills/google-jules-cloud/SKILL.md
  parecer: Revisado em 2026-11-03. Metadados de frontmatter sincronizados sob o padrao Chico SOTA v8.0 Gold.
---

# Registro: Sincronizacao, Renomeacao e Correcao de Frontmatter das Skills SOTA

## 1. Contexto & Diagnostico
Durante a inicializacao e consumo de skills pelo harness agagico e runtime do Hermes Agent,
foram interceptadas falhas de decodificacao de frontmatter YAML nas seguintes skills:
- `.agents/skills/google-workspace-sota/SKILL.md`
- `.agents/skills/poker-pmev-knowledge-engine/SKILL.md`

O parser estrito em Go reportava:
`failed to decode frontmatter: yaml: unmarshal errors: line 7: mapping key "metadata" already defined at line 4`.

A causa-raiz foi a definicao concorrente da chave de primeiro nivel `metadata:` na secao nativa
e na injecao de propriedades `hermes:` (tags, categoria e skills correlatas).

## 2. Acoes Executadas
1. Unificacao das chaves `metadata` sob estrutura hierarquica unica e valida em todas as skills.
2. Confirmacao da renomeacao do diretorio `.agents/skills/google-workspace/` para `.agents/skills/google-workspace-sota/`.
3. Atualizacao de `data/agents_manifest.json`, `.agents/skills.json` e `tests/test_governanca_skills.py` com a nova denominacao e sincronizacao via `sync_agents_reality.ps1`.
4. Validacao programatica universal via `UniqueKeyLoader` em 100% dos manifestos `SKILL.md` locais e globais.
5. Execucao integral dos testes de governanca de skills em `tests/test_governanca_skills.py` (10 passed).
6. Reconciliacao formal de todas as ancoras historicas conforme M.O. 13.F.
