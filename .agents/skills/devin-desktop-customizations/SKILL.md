---
name: devin-desktop-customizations
description: "Customizacoes do Devin Desktop/Local medidas no Site — regras (.devin/rules), skills (.agents vs .devin), plugins, MCPs por escopo, hooks e blueprint. Use ao criar/editar skills, regras, permissoes ou configuracao MCP voltada ao Devin, ou ao decidir onde um procedimento deve morar."
argument-hint: "[o que esta sendo customizado]"
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
    tags: ["devin", "desktop", "customization", "rules", "skills", "plugins", "mcp", "hooks"]
    category: devops
    related_skills: ["devin-managed-ops", "devin-session-supervision", "preview-sota"]
---

# Devin Desktop Customizations — o modelo de camadas, medido no Site

Referencia: docs.devin.ai/desktop/devin-local/customizations,
/desktop/advanced, /product-guides/plugin-ecosystem,
/desktop/context-awareness. O Devin Local compartilha o harness do CLI —
customization escrita para um vale para o outro.

## 0. Inventario medido em `Site/.devin/` (2026-11-13)

| Artefato | Conteudo | Papel |
| :--- | :--- | :--- |
| `config.json` | `permissions.allow`/`deny` (Read, Exec git/uv/ruff/pytest...) | Auto-aprovacao por padrao de comando — deny sempre vence |
| `rules/swe2-operating-model.md` | operating model SWE-2 (always-on, ativo nesta sessao) | Regra de comportamento |
| `rules/frontend-design-system.md` | regra de frontend | Regra de comportamento |
| `skills/auto-review`, `skills/focused-verify` | skills nativas Devin | Procedimentos Devin-especificos |
| `playbooks/design-system-review.md` | playbook legado | **em migracao para skill** (§4 managed-ops) |
| `blueprint.yaml` | environment blueprint git-backed | Snapshot/ambiente declarativo |

MCP user-scope real no Windows: `%APPDATA%/devin/mcp_config.json`
(equivale a `~/.config/devin/` da doc em Unix — `credentials.toml` vive no
mesmo dir, medido). Project-scope seria `Site/.devin/mcp_config.json`
(**ausente** — correto: MCPs vem do nucleo renderizado, nao de arquivo
de projeto paralelo).

## 1. As 5 camadas de customization (tabela da doc + onde mora aqui)

| Camada | Formato | Escopo | Equivalente local |
| :--- | :--- | :--- | :--- |
| **Rules** | `AGENTS.md`, `.devin/rules/*.md`, `.devin/global_rules.md`, `~/.devin/rules/` | always_on / glob / model_decision / manual via `trigger` | Nossas `CLAUDE.md`/`AGENTS.md`/`.windsurfrules` — mesmo papel, formatos importados |
| **Skills** | `SKILL.md` + arquivos de suporte | progressive disclosure (so name+description no contexto) | `.agents/skills/` (compartilhado) e `.devin/skills/` (Devin-only) |
| **Plugins** | `.devin-plugin/plugin.json` + bundles | instalavel, required/optional/forbidden | Nao temos equivalente — seria o pacote distribuivel de skills+rules+MCPs |
| **MCP** | `mcp_config.json` por escopo | project / local-override / user | **nucleo_compartilhado.json + sincronizar_nucleo.py** — nossa fonte unica e mais forte que a deles |
| **Hooks** | `.devin/hooks.v1.json` | PreToolUse etc., shell ou prompt | Nao auditado aqui — candidato se quisermos policy enforcement no harness Devin |

## 2. Decisor: `.agents/skills/` vs `.devin/skills/`

A doc confirma que o Devin Local le **ambos** (`.devin/skills/`,
`.agents/skills/` e `.windsurf/skills/` no workspace; `~/.agents/skills/`
global). Entao:

- Procedimento **reutilizavel entre harnesses** (Claude, Devin, Codex...) →
  `.agents/skills/` — foi onde todos os skills `*-sota` desta trilha foram.
- Procedimento **exclusivo do ecossistema Devin** (ex.: `devin plugins
  install`, formato plugin.json,peculiaridades do blueprint) →
  `.devin/skills/` — hoje so `auto-review` e `focused-verify` moram la.
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
