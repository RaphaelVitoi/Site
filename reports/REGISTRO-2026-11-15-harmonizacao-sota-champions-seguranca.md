---
id: registro-2026-11-15-harmonizacao-sota-champions-seguranca
tipo: registro
escopo: Site -- hardening anti DNS-rebinding/DOM-injection em core/mcp_routing.py e enriquecimento SOTA das skills site-session-handoff e sota-quality-gate
ecossistema: nexus-sota
autor: Gemini 4 Hydrogen <noreply@google.com>
criado_em: '2026-11-15T13:42:00-03:00'
atualizado_em: '2026-11-15T13:42:00-03:00'
classes:
- interno
- medido
- governanca
config_medida:
  congelada_em: '2026-11-15'
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  data: '2026-11-15'
caminhos:
- .gitignore
- core/mcp_routing.py
- tests/test_mcp_addon_routing.py
- .agents/skills/site-session-handoff/SKILL.md
- .agents/skills/sota-quality-gate/SKILL.md
- reports/REGISTRO-2026-11-15-harmonizacao-sota-champions-seguranca.md
revisoes_de_ancora:
- registro: registro-2026-09-04-lighthouse-certificado-e-o-certificado-que-nao-viajava
  caminhos:
  - .gitignore
  parecer: 'Revisado contra o diff -- acrescenta apenas .grepai/ ao final do .gitignore sem alterar regras de build, cache ou Lighthouse.'
- registro: registro-2026-09-14-benchmark-icm-chipev-em-hand-history-e-next-env
  caminhos:
  - .gitignore
  parecer: 'Revisado contra o diff -- acrescenta apenas .grepai/ ao .gitignore mantendo exclusoes de hand history, env e Next intactas.'
- registro: 2026-09-22-auditoria-frontend-4-itens
  caminhos:
  - .gitignore
  parecer: 'Revisado contra o diff -- acrescenta apenas .grepai/ ao .gitignore sem alterar configuracoes ou exclusoes do frontend.'
- registro: registro-2026-10-19-evolucao-telemetria-mcp-s1-e-benchmark-regime
  caminhos:
  - .gitignore
  parecer: 'Revisado contra o diff -- acrescenta apenas .grepai/ ao .gitignore preservando exclusoes de telemetria e benchmarks.'
- registro: registro-2026-11-12-gitignore-claude-symlinks
  caminhos:
  - .gitignore
  parecer: 'Revisado contra o diff -- acrescenta apenas .grepai/ apos frontend/.claude/ e /history/, preservando regras de symlinks locais.'
- registro: registro-2026-11-12-gitignore-history-e-extensions
  caminhos:
  - .gitignore
  parecer: 'Revisado contra o diff -- acrescenta apenas .grepai/ apos /history/, preservando exclusoes anteriores intactas.'
- registro: auditoria-2026-08-31-integridade-e-integracao-antigravity
  caminhos:
  - .agents/skills/sota-quality-gate/SKILL.md
  parecer: 'Revisado contra o diff -- acrescenta secao 2.1 sobre invariantes multi-agente e seguranca de skills mantendo o gate de 5 fases intacto.'
- registro: auditoria-2026-09-02-curadoria-mcp-e-processos-residuais
  caminhos:
  - core/mcp_routing.py
  - tests/test_mcp_addon_routing.py
  parecer: 'Revisado contra o diff -- adiciona helpers puros de guarda anti DNS-rebinding e limpeza DOM sem alterar o roteamento dos 3 addons canonicos.'
- registro: handoff-2026-09-02-curadoria-mcp-quarentena-e-roteamento-lazy
  caminhos:
  - core/mcp_routing.py
  - tests/test_mcp_addon_routing.py
  parecer: 'Revisado contra o diff -- preserva roteamento lazy e exatamente 3 addons ativos; adiciona validacao aditiva de Origin/Host e DOM oculto.'
- registro: handoff-2026-09-25-governanca-pools-openrouter-e-impacto
  caminhos:
  - .agents/skills/site-session-handoff/SKILL.md
  parecer: 'Revisado contra o diff -- adiciona apenas contrato de handoff tipado claimed-once na secao 4.5, preservando regras de pools e impacto.'
- registro: registro-2026-09-22-skill-handoff-e-calibracao
  caminhos:
  - .agents/skills/site-session-handoff/SKILL.md
  parecer: 'Revisado contra o diff -- adicao da secao 4.5 estende o checklist de handoff sem modificar calibracoes anteriores.'
- registro: registro-2026-09-25-precedencia-economica-assinaturas-pro-e-nuvem-free
  caminhos:
  - .agents/skills/site-session-handoff/SKILL.md
  parecer: 'Revisado contra o diff -- adicao da secao 4.5 preserva integralmente a hierarquia de precedencia economica.'
- registro: registro-2026-09-25-skill-avaliacao-impacto-sessao
  caminhos:
  - .agents/skills/site-session-handoff/SKILL.md
  parecer: 'Revisado contra o diff -- secao 4.5 adiciona contrato claimed-once mantendo avaliacao de impacto intacta.'
- registro: registro-2026-10-18-resolucao-sonarqube-e-saneamento-global
  caminhos:
  - core/mcp_routing.py
  parecer: 'Revisado contra o diff -- novos helpers de seguranca mantem conformidade Sonar/Ruff sem introduzir violacoes.'
- registro: registro-2026-11-03-sincronizacao-e-correcao-frontmatter-skills-sota
  caminhos:
  - .agents/skills/site-session-handoff/SKILL.md
  - .agents/skills/sota-quality-gate/SKILL.md
  parecer: 'Revisado contra o diff -- frontmatter YAML de ambas as skills preservado integralmente; extensoes restritas ao corpo.'
- registro: registro-2026-11-05-saneamento-customizations-e-elevacao-dependencias
  caminhos:
  - .agents/skills/site-session-handoff/SKILL.md
  parecer: 'Revisado contra o diff -- adicao da secao 4.5 preserva referencias de customizations e dependencias.'
verificado:
  - Ruff check e format check em core/mcp_routing.py e tests/test_mcp_addon_routing.py (All checks passed, 2 files already formatted)
  - Suite direcionada tests/test_mcp_addon_routing.py e tests/test_record_index.py (62 passed, 0 errors, 0 warnings)
  - Varredura estatica SkillSpector v2.13.4 --no-llm em site-session-handoff e sota-quality-gate (Score 0/100 LOW SAFE, Coverage 100%)
  - Validacao dos portoes scripts/ops/record_gate.py e scripts/ops/record_anchor_gate.ps1 sobre o staged tree
nao_verificado:
  - Analise semantica LLM do SkillSpector sem --no-llm (requer provedor/chave LLM configurado para SkillSpector)
  - Suite completa integral do repositorio Site fora do escopo direcionado
---

# Registro de Harmonizacao SOTA, Champions e Hardening

- `core/mcp_routing.py` e `tests/test_mcp_addon_routing.py`: adiciona `_extract_host_without_port`, `validate_localhost_origin_and_host` e `strip_hidden_dom_injection_markers` com teste unitario dedicado, preservando os 3 addons canonicos em modo lazy.
- `.agents/skills/site-session-handoff/SKILL.md`: acrescenta secao 4.5 com contrato de handoff tipado claimed-once e deliverables verificaveis.
- `.agents/skills/sota-quality-gate/SKILL.md`: acrescenta secao 2.1 com invariantes multi-agente, seguranca estatica de skills via SkillSpector e leis matematicas de invariancia.
