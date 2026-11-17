---
name: devin-desktop-customizations
description: "Customizacoes do Devin Desktop/Local medidas no Site — regras (.devin/rules), skills (.agents vs .devin), plugins, MCPs por escopo, hooks e blueprint. Use ao criar/editar skills, regras, permissoes ou configuracao MCP voltada ao Devin, ou ao decidir onde um procedimento deve morar."
argument-hint: "[opcional: escopo da customizacao]"
allowed-tools:
  - read
  - grep
  - glob
  - exec
triggers:
  - user
  - model
metadata:
  hermes:
    tags: ["devin", "customization", "rules", "skills", "mcp", "config"]
    category: devops
    related_skills: ["devin-desktop-architecture", "devin-managed-ops", "devin-session-insights"]
---

# Devin Desktop Customizations — o modelo de camadas, medido no Site

Referencia: docs.devin.ai/desktop/devin-local/customizations,
/desktop/advanced, /product-guides/plugin-ecosystem,
/desktop/context-awareness. O Devin Local compartilha o harness do CLI —
customization escrita para um vale para o outro.

## 0. Inventario medido em `Site/.devin/` (2026-11-13, atualizado 2026-11-17)

| Artefato | Conteudo | Papel |
| :--- | :--- | :--- |
| `config.json` | `permissions.allow`/`deny` (Read, Exec git/uv/ruff/pytest...) | Auto-aprovacao por padrao de comando — deny sempre vence |
| `rules/swe2-operating-model.md` | operating model SWE-2 (always-on, ativo nesta sessao) | Regra de comportamento |
| `rules/frontend-design-system.md` | regra de frontend (glob `frontend/**`) | Regra de comportamento |
| `skills/auto-review`, `skills/focused-verify`, `skills/design-system-review` | skills nativas Devin | Procedimentos Devin-especificos |
| `playbooks/design-system-review.md` | **PONTEIRO** — migrado p/ skill em 2026-11-17 | Legado; apagar quando a sessao agendada for repontada |
| `blueprint.yaml` | environment blueprint git-backed | Snapshot/ambiente declarativo |

MCP user-scope real no Windows: `%APPDATA%/devin/mcp_config.json`
(equivale a `~/.config/devin/` da doc em Unix — `credentials.toml` vive no
mesmo dir, medido). Project-scope `Site/.devin/mcp_config.json` **ausente** —
correto: MCPs vem do nucleo renderizado + plugins, nao de arquivo
paralelo. Os ~30 MCPs de sessao vem de `plugins_cache` (devin-marketplace) e do
`read_config_from.cloud` (default true).

User config `%APPDATA%/devin/config.json` (medido 2026-11-17): `agent.
pinned_models` = escada SWE-2 (`swe-2-medium`, `-lightning`, `swe-2-high`,
`swe-2-max`, `swe-1-7-medium`); `agent.subagent_model` = `swe-2-medium-lightning`.
`agent.model` NAO fixado de proposito — modelo e decisao de sessao.

## 1. As 5 camadas de customization (tabela da doc + onde mora aqui)

| Camada | Formato | Escopo | Equivalente local |
| :--- | :--- | :--- | :--- |
| **Rules** | `AGENTS.md`, `.devin/rules/*.md`, `.devin/global_rules.md`, `~/.devin/rules/` | always_on / glob / model_decision / manual via `trigger` | Nossas `CLAUDE.md`/`AGENTS.md`/`.windsurfrules` — mesmo papel, formatos importados |
| **Skills** | `SKILL.md` + arquivos de suporte | progressive disclosure (so name+description no contexto) | `.agents/skills/` (compartilhado) e `.devin/skills/` (Devin-only) |
| **Plugins** | `.devin-plugin/plugin.json` + bundles | instalavel, required/optional/forbidden | Nao temos equivalente — seria o pacote distribuivel de skills+rules+MCPs |
| **MCP** | `mcp_config.json` por escopo | project / local-override / user | **nucleo_compartilhado.json + sincronizar_nucleo.py** — nossa fonte unica e mais forte que a deles |
| **Hooks** | `.devin/hooks.v1.json` | PreToolUse etc., shell ou prompt | **Ausente por decisao** — ver §8 |

## 2. Decisor: `.agents/skills/` vs `.devin/skills/`

A doc confirma que o Devin Local le **ambos** (`.devin/skills/`,
`.agents/skills/` e `.windsurf/skills/` no workspace; `~/.agents/skills/`
global). Entao:

- Procedimento **reutilizavel entre harnesses** (Claude, Devin, Codex...) →
  `.agents/skills/` — foi onde todos os skills `*-sota` desta trilha foram.
- Procedimento **exclusivo do ecossistema Devin** (ex.: `devin plugins
  install`, formato plugin.json, peculiaridades do blueprint, playbooks
  migrados) → `.devin/skills/` — hoje `auto-review`, `focused-verify` e
  `design-system-review` moram la.
- **Nunca duplicar** o mesmo procedimento nos dois lugares — mesmo erro
  dos forks de governanca (§7 raiz).

## 3. Regras — o que a doc ensina e ja praticamos

- `AGENTS.md` = always-on sem frontmatter; `.devin/rules/*.md` = uma regra
  por arquivo com `trigger` (always_on/glob/model_decision/manual).
- **Custo de contexto e real**: regra always-on paga token em TODA
  sessao — a doc diz "keep rules short", nos diz "medir antes". Regra
  que so interessa as vezes vira skill, nao regra.
- `.windsurf/rules/` e `.windsurfrules` sao **importados por default** —
  nossos arquivos legados continuam valendo; `.devin/` vence em conflito
  quando ambos `global_rules.md` existem.

## 4. Plugins — o formato de distribuicao

`.devin-plugin/plugin.json` com `requiredPlugins`/`optionalPlugins`/
`forbiddenPlugins` — governance em 3 listas, maior autoridade vence,
**fail-open** se o manifest nao carrega. Limitacoes medidas pela doc:
hooks best-effort fail-open; subagents so em CLI/Desktop (nao cloud);
governanca falha aberta. **Nao adotar para uso critico de guardrail** —
nosso nucleo MCP ja e fail-closed por verificacao (`--verificar`).

## 5. Context awareness (RAG do Desktop)

Devin Desktop indexa o codebase local (M-Query) + arquivos abertos;
remote repos so para Teams/Enterprise. **Implicacao:** nosso equivalente
ja existe e e mais forte para o caso local — `code_search`, grep/glob,
`memory_rag.py` e os indices FTS5 do Site dao retrieval sob demanda sem
custo de indice proprietario. O RAG do Desktop melhora autocomplete/chat
dentro do editor; nao substitui a busca agentica.

## 6. Proibicoes

- Nao criar `Site/.devin/mcp_config.json` paralelo ao nucleo — MCP entra
  pelo catalogo canonico e renderiza (licao da sessao: paridade verde).
- Nao mover skills de `.agents/` para `.devin/` "porque e Devin" —
  `.agents/` e o escopo compartilhado; so mover o que for Devin-exclusive.
- Nao confiar em hook/plugin como guardrail unico — doc admite fail-open;
  portoes de verdade ficam em script versionado + verificacao.

## 7. Modelos SWE — IDs medidos no registry local (2026-11-17)

Extraidos de `%APPDATA%/devin/cli-next/logs/devin-next_*.log`
(`model_registry`). Familia SWE vigente nesta conta — **nao existem IDs
`swe-1-6` nem `swe-2-flash`**: "SWE-1.6 Slow" da governanca resolve na
pratica para a linha `swe-1-7`, e "SWE-2 Flash" para a linha `swe-2-*`.

| ID | Papel |
| :--- | :--- |
| `swe-2-medium` | SWE-2 medium base — identidade Devin principal |
| `swe-2-medium-lightning` | variante rapida/barata do medium — **fixado como `agent.subagent_model`** (subagents explore rodam nele, ACU menor) |
| `swe-2-high` / `swe-2-high-lightning` | degrau acima p/ tarefas densas |
| `swe-2-max` / `swe-2-max-lightning` | topo da linha SWE-2 |
| `swe-1-7` / `swe-1-7-medium` | geracao anterior — fallback |

`%APPDATA%/devin/config.json` ganhou `agent.pinned_models` (escada SWE
acima, ordem do `/model` no `Alt+N`) e `agent.subagent_model`.
`agent.model` foi **deliberadamente nao fixado** — a escolha de modelo e
decisao de sessao/governanca, nao default global.

## 8. Hooks — decisao medida (2026-11-17)

`.devin/hooks.v1.json` segue **ausente por decisao**: permissions
allow/deny de `.devin/config.json` ja cobrem os bloqueios duros (force
push, .env, sudo), e nao ha policy gap que um hook cobrisse sem custo por
tool-call. Reavaliar se surgir regra que dependa de contexto (ex.:
bloquear `git push` nao-interativo exige hook `prompt`, que gasta token
por chamada).
</content>
</invoke>" type="string"<|sep|>---
name: devin-desktop-customizations
description: "Customizacoes do Devin Desktop/Local medidas no Site — regras (.devin/rules), skills (.agents vs .devin), plugins, MCPs por escopo, hooks e blueprint. Use ao criar/editar skills, regras, permissoes ou configuracao MCP voltada ao Devin, ou ao decidir onde um procedimento deve morar."
argument-hint: "[opcional: escopo da customizacao]"
allowed-tools:
  - read
  - grep
  - glob
  - exec
triggers:
  - user
  - model
metadata:
  hermes:
    tags: ["devin", "customization", "rules", "skills", "mcp", "config"]
    category: devops
    related_skills: ["devin-desktop-architecture", "devin-managed-ops", "devin-session-insights"]
---

# Devin Desktop Customizations — o modelo de camadas, medido no Site

Referencia: docs.devin.ai/desktop/devin-local/customizations,
/desktop/advanced, /product-guides/plugin-ecosystem,
/desktop/context-awareness. O Devin Local compartilha o harness do CLI —
customization escrita para um vale para o outro.

## 0. Inventario medido em `Site/.devin/` (2026-11-13, atualizado 2026-11-17)

| Artefato | Conteudo | Papel |
| :--- | :--- | :--- |
| `config.json` | `permissions.allow`/`deny` (Read, Exec git/uv/ruff/pytest...) | Auto-aprovacao por padrao de comando — deny sempre vence |
| `rules/swe2-operating-model.md` | operating model SWE-2 (always-on, ativo nesta sessao) | Regra de comportamento |
| `rules/frontend-design-system.md` | regra de frontend (glob `frontend/**`) | Regra de comportamento |
| `skills/auto-review`, `skills/focused-verify`, `skills/design-system-review` | skills nativas Devin | Procedimentos Devin-especificos |
| `playbooks/design-system-review.md` | **PONTEIRO** — migrado p/ skill em 2026-11-17 | Legado; apagar quando a sessao agendada for repontada |
| `blueprint.yaml` | environment blueprint git-backed | Snapshot/ambiente declarativo |

MCP user-scope real no Windows: `%APPDATA%/devin/mcp_config.json`
(equivale a `~/.config/devin/` da doc em Unix — `credentials.toml` vive no
mesmo dir, medido). Project-scope `Site/.devin/mcp_config.json` **ausente** —
correto: MCPs vem do nucleo renderizado + plugins, nao de arquivo
paralelo. Os ~30 MCPs de sessao vem de `plugins_cache` (devin-marketplace) e do
`read_config_from.cloud` (default true).

User config `%APPDATA%/devin/config.json` (medido 2026-11-17): `agent.
pinned_models` = escada SWE-2 (`swe-2-medium`, `-lightning`, `swe-2-high`,
`swe-2-max`, `swe-1-7-medium`); `agent.subagent_model` = `swe-2-medium-lightning`.
`agent.model` NAO fixado de proposito — modelo e decisao de sessao.

## 1. As 5 camadas de customization (tabela da doc + onde mora aqui)

| Camada | Formato | Escopo | Equivalente local |
| :--- | :--- | :--- | :--- |
| **Rules** | `AGENTS.md`, `.devin/rules/*.md`, `.devin/global_rules.md`, `~/.devin/rules/` | always_on / glob / model_decision / manual via `trigger` | Nossas `CLAUDE.md`/`AGENTS.md`/`.windsurfrules` — mesmo papel, formatos importados |
| **Skills** | `SKILL.md` + arquivos de suporte | progressive disclosure (so name+description no contexto) | `.agents/skills/` (compartilhado) e `.devin/skills/` (Devin-only) |
| **Plugins** | `.devin-plugin/plugin.json` + bundles | instalavel, required/optional/forbidden | Nao temos equivalente — seria o pacote distribuivel de skills+rules+MCPs |
| **MCP** | `mcp_config.json` por escopo | project / local-override / user | **nucleo_compartilhado.json + sincronizar_nucleo.py** — nossa fonte unica e mais forte que a deles |
| **Hooks** | `.devin/hooks.v1.json` | PreToolUse etc., shell ou prompt | **Ausente por decisao** — ver §8 |

## 2. Decisor: `.agents/skills/` vs `.devin/skills/`

A doc confirma que o Devin Local le **ambos** (`.devin/skills/`,
`.agents/skills/` e `.windsurf/skills/` no workspace; `~/.agents/skills/`
global). Entao:

- Procedimento **reutilizavel entre harnesses** (Claude, Devin, Codex...) →
  `.agents/skills/` — foi onde todos os skills `*-sota` desta trilha foram.
- Procedimento **exclusivo do ecossistema Devin** (ex.: `devin plugins
  install`, formato plugin.json, peculiaridades do blueprint, playbooks
  migrados) → `.devin/skills/` — hoje `auto-review`, `focused-verify` e
  `design-system-review` moram la.
- **Nunca duplicar** o mesmo procedimento nos dois lugares — mesmo erro
  dos forks de governanca (§7 raiz).

## 3. Regras — o que a doc ensina e ja praticamos

- `AGENTS.md` = always-on sem frontmatter; `.devin/rules/*.md` = uma regra
  por arquivo com `trigger` (always_on/glob/model_decision/manual).
- **Custo de contexto e real**: regra always-on paga token em TODA
  sessao — a doc diz "keep rules short", nos diz "medir antes". Regra
  que so interessa as vezes vira skill, nao regra.
- `.windsurf/rules/` e `.windsurfrules` sao **importados por default** —
  nossos arquivos legados continuam valendo; `.devin/` vence em conflito
  quando ambos `global_rules.md` existem.

## 4. Plugins — o formato de distribuicao

`.devin-plugin/plugin.json` com `requiredPlugins`/`optionalPlugins`/
`forbiddenPlugins` — governance em 3 listas, maior autoridade vence,
**fail-open** se o manifest nao carrega. Limitacoes medidas pela doc:
hooks best-effort fail-open; subagents so em CLI/Desktop (nao cloud);
governanca falha aberta. **Nao adotar para uso critico de guardrail** —
nosso nucleo MCP ja e fail-closed por verificacao (`--verificar`).

## 5. Context awareness (RAG do Desktop)

Devin Desktop indexa o codebase local (M-Query) + arquivos abertos;
remote repos so para Teams/Enterprise. **Implicacao:** nosso equivalente
ja existe e e mais forte para o caso local — `code_search`, grep/glob,
`memory_rag.py` e os indices FTS5 do Site dao retrieval sob demanda sem
custo de indice proprietario. O RAG do Desktop melhora autocomplete/chat
dentro do editor; nao substitui a busca agentica.

## 6. Proibicoes

- Nao criar `Site/.devin/mcp_config.json` paralelo ao nucleo — MCP entra
  pelo catalogo canonico e renderiza (licao da sessao: paridade verde).
- Nao mover skills de `.agents/` para `.devin/` "porque e Devin" —
  `.agents/` e o escopo compartilhado; so mover o que for Devin-exclusive.
- Nao confiar em hook/plugin como guardrail unico — doc admite fail-open;
  portoes de verdade ficam em script versionado + verificacao.

## 7. Modelos SWE — IDs medidos no registry local (2026-11-17)

Extraidos de `%APPDATA%/devin/cli-next/logs/devin-next_*.log`
(`model_registry`). Familia SWE vigente nesta conta — **nao existem IDs
`swe-1-6` nem `swe-2-flash`**: "SWE-1.6 Slow" da governanca resolve na
pratica para a linha `swe-1-7`, e "SWE-2 Flash" para a linha `swe-2-*`.

| ID | Papel |
| :--- | :--- |
| `swe-2-medium` | SWE-2 medium base — identidade Devin principal |
| `swe-2-medium-lightning` | variante rapida/barata do medium — **fixado como `agent.subagent_model`** (subagents explore rodam nele, ACU menor) |
| `swe-2-high` / `swe-2-high-lightning` | degrau acima p/ tarefas densas |
| `swe-2-max` / `swe-2-max-lightning` | topo da linha SWE-2 |
| `swe-1-7` / `swe-1-7-medium` | geracao anterior — fallback |

`%APPDATA%/devin/config.json` ganhou `agent.pinned_models` (escada SWE
acima, ordem do `/model` no `Alt+N`) e `agent.subagent_model`.
`agent.model` foi **deliberadamente nao fixado** — a escolha de modelo e
decisao de sessao/governanca, nao default global.

## 8. Hooks — decisao medida (2026-11-17)

`.devin/hooks.v1.json` segue **ausente por decisao**: permissions
allow/deny de `.devin/config.json` ja cobrem os bloqueios duros (force
push, .env, sudo), e nao ha policy gap que um hook cobrisse sem custo por
tool-call. Reavaliar se surgir regra que dependa de contexto (ex.:
bloquear `git push` nao-interativo exige hook `prompt`, que gasta token
por chamada).
