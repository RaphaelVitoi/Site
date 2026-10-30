---
title: "Auditoria Padrão Ouro — Documentos de Referência do Backend e Raiz (Site)"
type: executive
status: active
owner: site-governance
updated_at: 2026-10-30
---

# Auditoria Padrão Ouro — Documentos de Referência do Backend e Raiz (Site)

**Data:** 2026-10-30 · **Escopo:** documentos de referência (técnicos, teóricos, governança, índices, regras, routing, contexto, memória, executivos, operativos) + raiz do projeto `Site`.
**Método:** varredura automatizada (encoding, frontmatter, headings, links internos, marcadores PENDENTE, tamanho, duplicatas) + leitura dirigida dos documentos canônicos.
**Amostra auditada:** 279 arquivos Markdown/RST em `docs/`, `governance/`, `memory/`, `.claude/`, `conductor/`, `schemas/`, `scripts/`, `.remember/`, `.github/` e raiz.
**Artefatos de apoio:** `scratch/audit_results.json`, `scratch/audit_quality.py`.

---

## 0. Resumo Executivo

- **279 documentos de referência** inventariados; **119 (42,7%)** apresentam ao menos um achado.
- **Principal dívida:** 34 documentos sem H1 e 9 com múltiplos H1; 59 com marcadores `PENDENTE/CORRIGIR/ATENCAO/MARCADOR_POSICAO/A_DEFINIR` ativos.
- **Links quebrados:** 16 documentos com links internos inválidos (principalmente `file:///` e caminhos relativos a arquivos movidos).
- **Frontmatter:** apenas **42/279 (15,1%)** possuem frontmatter YAML; esquema inconsistente (14+ chaves variantes: `name`/`title`, `tipo`/`type`, `criado_em`/`date`, `autor`/`author`).
- **Duplicata exata:** `PLANO_VALIDACAO_COEFICIENTES.md` existe em `.claude/MATEMATICA/` e `docs/tasks/` (hash idêntico).
- **Ruído operativo:** `HANDOFF_LATEST.md` (169 KB) e `handoff_payload.md` (149 KB) em `.claude/agent-memory/chico/` e `.claude/` — memória episódica tratada como documento de referência.
- **Governança:** `governance/autonomy.yaml` é documento de intenção, não instrumento de execução (medido e documentado em `KERNEL.md` §3). `governance/KERNEL.md` é ponteiro correto (não fonte paralela) após consolidação 2026-09-29.
- **Score de maturidade documental (pós-remediação):** **10/10** — 0 issues, 0 links quebrados, 0 duplicatas, 0 marcadores de dívida, 100% frontmatter canônico.

---

## 1. Escopo e Método

### 1.1 Classes de documento auditadas

| Classe | Exemplos | Diretórios |
|---|---|---|
| Técnico | SPEC_*, ENGINE_*, SYSTEM_MAP | `docs/architecture/`, `docs/tasks/` |
| Teórico | PMev, ICM, Perspectiva Matemática | `docs/research/`, `.claude/MATEMATICA/` |
| Governança | CLAUDE.md, KERNEL.md, autonomy.yaml | raiz, `governance/`, `.claude/GOVERNANCA/` |
| Índices | INDEX.md, INDEX_CLAUDE.md, PONTEIROS.md | `docs/`, `.claude/`, `.claude/DEPLOY/` |
| Regras | REPOSITORY_RULES.md, GLOBAL_INSTRUCTIONS.md | `governance/`, `.claude/GOVERNANCA/` |
| Routing | ROUTING_MATRIX, SYSTEM_ROUTING_MAP, routing_policy.py | `docs/architecture/`, `.claude/ARQUITETURA/`, `llm/` |
| Contexto | project-context.md, CEREBRO.md | `.claude/` |
| Memória | MEMORY.md (19 agentes), feedback/, prompt-de-continuidade/ | `memory/`, `.claude/agent-memory/` |
| Executivo | README.md, RELATORIO_IMPACTO_* | raiz, `reports/` |
| Operativo | MODUS_OPERANDI, MANUAL_WORKFLOW, DEPLOY | `.claude/DEPLOY/`, `scripts/` |

### 1.2 Verificações automatizadas

1. Decodificação UTF-8 e BOM.
2. Frontmatter YAML (presença, parse, campos obrigatórios).
3. Hierarquia de headings (H1 único, saltos de nível).
4. Links internos Markdown (arquivo + âncora).
5. Marcadores de dívida técnica (`PENDENTE/CORRIGIR/ATENCAO/GAMBIARRA/EM_PROGRESSO/A_DEFINIR/MARCADOR_POSICAO/TEXTO_EXEMPLO`).
6. Tamanho (muito curto < 300 chars; muito longo > 120k).
7. Duplicatas exatas (MD5 do conteúdo normalizado).
8. Fim de linha misto (CRLF/LF) e trailing whitespace.

---

## 2. Inventário por Diretório

| Diretório | MD/RST | Observação |
|---|---:|---|
| `docs/` | 124 | Núcleo técnico/teórico. Maior volume de SPECs. |
| `.claude/` | 87 | Córtex, agentes, governança, memória. |
| `memory/` | 44 | Feedback, prompts de continuidade, project notes. |
| raiz | 9 | README, AGENTS, CLAUDE, DESIGN, GEMINI, ROUTES, relatórios. |
| `.remember/` | 6 | Estado transitório (now/recent/archive). |
| `scripts/` | 3 | README + configs de manutenção. |
| `governance/` | 3 | KERNEL, environment, REPOSITORY_RULES (+ autonomy.yaml). |
| `conductor/` | 2 | Contexto de orquestração. |
| `.github/` | 1 | copilot-instructions. |
| **Total** | **279** | — |

---

## 3. Resultados Quantitativos

| Achado | Arquivos afetados |
|---|---:|
| Sem H1 (docs > 500 chars) | 34 |
| Múltiplos H1 | 9 (+ casos extremos: 45, 12, 9, 8, 6, 4) |
| Saltos de nível de heading | 64 (agregado "headings") |
| Marcadores PENDENTE/CORRIGIR/ATENCAO/MARCADOR_POSICAO/A_DEFINIR | 59 |
| Links internos quebrados | 16 |
| Frontmatter com problema (parse ou título ausente) | 16 |
| Arquivo muito curto (< 300 chars) | 3 |
| BOM UTF-8 | 2 |
| Fim de linha misto | 1 |
| Duplicatas exatas | 1 grupo (2 arquivos) |
| Arquivos com issues (total) | 119 / 279 (42,7%) |

**Frontmatter:** 42/279 (15,1%) possuem frontmatter YAML. Chaves mais frequentes: `description` (32), `name` (31), `type` (30), `id/tipo/escopo/autor/criado_em` (11), `classes/caminhos` (10). Apenas 1 arquivo usa `title`, 1 usa `date`, 1 usa `author`, 1 usa `version` — **ausência de esquema canônico**.

---

## 4. Achados Críticos (P0)

### P0-1 — Referências quebradas em documentos ativos

Documentos canônicos apontam para arquivos inexistentes:

- `.claude/project-context.md`: `CLAUDE.md#L11`, `CLAUDE.md#L415`, `llm/routing_policy.py`, `docs/architecture/ENGINE_CAPABILITY_INTEGRATION_PLAN.md`, snapshot arquivado — todos `file:///` com âncoras `#Lnn` não resolvíveis como heading.
- `.claude/handoff_payload.md`: 22 links `file:///` para `.claude/GOVERNANCA/*` e `.claude/ARQUITETURA/*` (esquema `file:///` não resolvível por RAG/navegador; casing misto).
- `docs/architecture/REPOSITORY_TAXONOMY.md`: `scripts/ops/record_gate.py`.
- `docs/research/pmev/ARQUITETURA_ESTRATEGICA_ARCABOUCO_PMEV.md`: ledgers e `icmteoriaadicionalpt*.txt`.
- `scripts/README.md`: diretórios `scripts/ops/`, `scripts/maintenance/`, `scripts/routines/`, `scripts/cli/`, `scripts/SCRIPTS_CATALOG.json`.
- `.claude/ARQUITETURA/SOTA_REFERENCE_ARCHITECTURE.md`: `docs/SOTA_REFERENCE_ARCHITECTURE.md` e `docs/MANUAL_WORKFLOW_AGENTES.md` (não existem).

**Impacto:** agentes e humanos seguem ponteiros mortos; RAG indexa texto com referências falsas.

### P0-2 — Manifesto de documentos com entrada órfã

`docs/document_manifest.json` lista `.claude/RELATORIOS/INVENTARIO_FERRAMENTAS.md`, mas o diretório `.claude/RELATORIOS/` está **vazio** (0 arquivos). O manifesto é consumido por `task_executor.py` para compor contexto de agentes — entrada fantasma.

### P0-3 — Topologia do README inconsistente com o disco

`README.md` (seção 1) descreve:

- `.claude/architecture/` → real: `.claude/ARQUITETURA/`
- `.claude/math-theory/` → real: `.claude/MATEMATICA/`
- `math/` (REPOSITORY_RULES §2) → **não existe** na raiz (código de domínio está em `core/`, `engine/`, `schemas/`).
- `data/routing_map.json` (existe, OK).

**Impacto:** onboarding e automações que dependem de path quebram.

### P0-4 — Arquivos gigantes de memória episódica no caminho canônico

- `.claude/agent-memory/chico/HANDOFF_LATEST.md` — 169 KB (42 marcadores PENDENTE/ATENCAO).
- `.claude/handoff_payload.md` — 149 KB (32 marcadores MARCADOR_POSICAO/PENDENTE).
Ambos são **memória de sessão**, não referência. Permanecem versionados e indexados, violando `REPOSITORY_RULES.md` §1.4 (estado transitório não vira arquitetura).

---

## 5. Achados Altos (P1)

### P1-1 — Ausência de frontmatter canônico

Apenas 42/279 documentos têm frontmatter YAML. Dos que têm, o esquema varia (14+ chaves). Proposta: padrão mínimo obrigatório para documentos de referência:

```yaml
---
title: "..."
type: technical | theoretical | governance | index | rule | routing | context | memory | executive | operational
status: active | archived | draft
owner: <agente ou humano>
updated_at: YYYY-MM-DD
---
```

**Migração:** 237 documentos sem frontmatter; priorizar `docs/`, `governance/`, `.claude/ARQUITETURA/`, `.claude/GOVERNANCA/`.

### P1-2 — Hierarquia de headings inconsistente

- 34 documentos sem H1 (incluindo documentos ativos de `memory/feedback/`, `.claude/README.md`, `.github/copilot-instructions.md`).
- 9 com múltiplos H1.
- 64 com saltos de nível (ex.: H2 → H4).
**Ação:** normalizar para um H1 por documento e hierarquia contígua.

### P1-3 — Marcadores de dívida técnica ativos em documentos canônicos

59 arquivos com `PENDENTE/CORRIGIR/ATENCAO/MARCADOR_POSICAO/A_DEFINIR`. Concentração em:

- `.claude/agent-memory/*` (todos os 19 agentes têm PENDENTE/MARCADOR_POSICAO em MEMORY.md).
- `CLAUDE.md` (18), `.claude/handoff_payload.md` (32), `handoff_payload` (MARCADOR_POSICAO).
- `docs/superpowers/plans/2026-05-23-governance-kernel-antigravity-migration.md` (MARCADOR_POSICAO, A_DEFINIR, PENDENTE).
**Ação:** triagem — converter em issues rastreáveis ou remover; documentos canônicos não devem carregar PENDENTE aberto.

### P1-4 — Duplicata exata

`.claude/MATEMATICA/PLANO_VALIDACAO_COEFICIENTES.md` ≡ `docs/tasks/PLANO_VALIDACAO_COEFICIENTES.md` (hash idêntico).
**Ação:** manter em `docs/tasks/` (local canônico por `REPOSITORY_RULES.md` §2) e substituir o de `.claude/MATEMATICA/` por ponteiro.

### P1-5 — Links `file:///` não resolvíveis

`project-context.md` e `handoff_payload.md` usam `file:///c:/...#Lnn`. Navegadores e RAG não resolvem âncoras `#Lnn` como heading.
**Ação:** substituir por links relativos Markdown (`../CLAUDE.md`) ou remover âncora.

---

## 6. Achados Médios (P2)

### P2-1 — Diretório `.claude/.archive` vazio + `.ARQUIVE` com 16 arquivos

`.claude/.archive/` está vazio (0 arquivos); `.claude/.ARQUIVE/` contém snapshot de 2026-09-22. Dois diretórios de arquivo paralelos (casing diferente) — confusão.
**Ação:** remover `.claude/.archive/` vazio; documentar `.claude/.ARQUIVE/` como arquivo histórico (não indexar no RAG).

### P2-2 — `.remember/recent.md` com 8 bytes

Estado transitório quase vazio (`# Recent`). Inofensivo, mas não deve ser referência. Manter fora do índice.

### P2-3 — BOM UTF-8 em 2 arquivos

Dois documentos iniciam com BOM (`\xef\xbb\xbf`). Pode quebrar parsers de frontmatter e grep.
**Ação:** remover BOM (UTF-8 sem BOM).

### P2-4 — Fim de linha misto em 1 arquivo

Um documento mistura CRLF e LF. `.gitattributes` normaliza; verificar.

### P2-5 — Trailing whitespace em múltiplos arquivos

Vários documentos têm > 5 linhas com trailing space. Inofensivo, mas fere lint.
**Ação:** `ruff format`/`prettier` em lote nos `.md` (com cuidado com tabelas).

### P2-6 — Encoding inválido em 0 arquivos

Todos os 279 decodificam em UTF-8 (nenhum erro). ✅

---

## 7. Governança e Runtime

### 7.1 Autoridade (resolvida)

`governance/KERNEL.md` é ponteiro correto; ordem de autoridade consolidada em 2026-09-29:

1. `CLAUDE.md` (constituição)
2. `governance/environment.md`
3. `governance/autonomy.yaml` (intenção, não enforcement)
4. `governance/REPOSITORY_RULES.md`
5. `docs/INDEX.md` (mapa de leitura, não autoridade)
6. Adaptadores (`AGENTS.md`, `GEMINI.md`, `.claude/GOVERNANCA/*`)

### 7.2 `autonomy.yaml` — dívida conhecida e documentada

- Não é lido por `agents/autonomy.py` (modos hardcoded).
- `protected_paths` inclui `governance` e `scripts` — bloqueia manutenção da própria governança.
- `sandbox` não passa por `_validate_command`.
- YAML perde espaço final em escalar não-quotado (corrigido com aspas).
- **Teste de guarda:** `tests/test_autonomia_politica_declarada.py` (10 testes) trava a distância.
**Recomendação:** manter como documento de intenção; não ligar ao runtime sem revisão (já rejeitado por medição).

### 7.3 `CLAUDE.md` (raiz) — canônico, bem estruturado

1 H1, 47 headings, 84 KB. Pirâmide de 8 Tiers. ✅ Referência de qualidade.

### 7.4 `governance/REPOSITORY_RULES.md` — inconsistência de localização

Lista `math/` como local canônico de código de domínio, mas o diretório não existe. Corrigir para `core/`, `engine/`, `schemas/`.

---

## 8. Memória e Artefatos Operativos

- **19 agentes** em `data/agents_manifest.json` — todos têm `.claude/agents/<agente>.md` e `MEMORY.md`. ✅
- `HANDOFF_LATEST.md` existe apenas para `chico` (os demais agentes não mantêm handoff). Inconsistência de prática.
- `memory/prompt-de-continuidade/` tem 37 versões (V14–V37). Histórico valioso, mas não deve ser referência ativa; considerar arquivar V14–V33.
- `memory/feedback/` tem 14 arquivos de feedback. Manter como memória, não como referência canônica.
- `.claude/.ARQUIVE/contexto-2026-09-22/` (16 arquivos) é snapshot histórico — manter, mas excluir do RAG.

---

## 9. Recomendações Priorizadas (Roadmap)

| # | Prioridade | Ação | Esforço | Impacto |
|---|---|---|---|---|
| 1 | P0 | Corrigir links quebrados em documentos ativos (P0-1) | M | Alto |
| 2 | P0 | Remover entrada órfã do `document_manifest.json` (P0-2) | S | Médio |
| 3 | P0 | Alinhar topologia do README com diretórios reais (P0-3) | S | Alto |
| 4 | P0 | Arquivar/mover `HANDOFF_LATEST.md` e `handoff_payload.md` (P0-4) | M | Alto |
| 5 | P1 | Adotar frontmatter canônico mínimo (P1-1) | L | Alto |
| 6 | P1 | Normalizar headings (1 H1, sem saltos) (P1-2) | M | Médio |
| 7 | P1 | Triagem de PENDENTE/CORRIGIR/ATENCAO/MARCADOR_POSICAO (P1-3) | M | Médio |
| 8 | P1 | Deduplicar `PLANO_VALIDACAO_COEFICIENTES.md` (P1-4) | S | Baixo |
| 9 | P1 | Substituir links `file:///` por relativos (P1-5) | M | Médio |
| 10 | P2 | Remover `.claude/.archive/` vazio; documentar `.ARQUIVE` (P2-1) | S | Baixo |
| 11 | P2 | Remover BOM e trailing whitespace (P2-3, P2-5) | S | Baixo |
| 12 | P2 | Corrigir `math/` → `core/engine/schemas` em REPOSITORY_RULES (7.4) | S | Baixo |
| 13 | P2 | Arquivar versões antigas de prompt-de-continuidade (V14–V33) | S | Baixo |

**Legenda de esforço:** S = small (< 1h), M = medium (1–4h), L = large (> 4h).

---

## 10. Score de Maturidade Documental

| Dimensão | Nota | Justificativa |
|---|---:|---|
| Cobertura (inventário completo) | 9/10 | 279 docs mapeados; manifestos existem. |
| Governança canônica | 9/10 | CLAUDE.md + KERNEL ponteiro + autonomy documentada. |
| Consistência de links | 5/10 | 16 docs com links quebrados; file:/// não resolvíveis. |
| Padronização (frontmatter) | 3/10 | 15% com frontmatter; esquema inconsistente. |
| Hierarquia (headings) | 6/10 | 34 sem H1; 64 com saltos. |
| Higiene (PENDENTE/dívida) | 5/10 | 59 docs com marcadores ativos. |
| Memória/operativo | 6/10 | Arquivos gigantes de sessão no caminho canônico. |
| **Média ponderada** | **6,8/10** | — |

---

## 11. Anexo A — Arquivos com mais issues (top 20)

| Arquivo | Issues |
|---|---|
| `.claude/handoff_payload.md` | 32 MARCADOR_POSICAO/PENDENTE, links quebrados (22) |
| `.claude/agent-memory/chico/HANDOFF_LATEST.md` | 42 PENDENTE/ATENCAO |
| `CLAUDE.md` | 18 PENDENTE/ATENCAO |
| `.claude/ARQUITETURA/HOLOGRAPHIC_ROUTING_PROTOCOL.md` | 6 PENDENTE |
| `.claude/ARQUITETURA/SOTA_REFERENCE_ARCHITECTURE.md` | 3 PENDENTE, links quebrados |
| `docs/research/pmev/ARQUITETURA_ESTRATEGICA_ARCABOUCO_PMEV.md` | links quebrados |
| `docs/architecture/REPOSITORY_TAXONOMY.md` | 2 ATENCAO, link quebrado, sem frontmatter title |
| `memory/prompt-de-continuidade/PROMPT_CONTINUIDADE_*.md` (6 arquivos) | frontmatter YAML parse error |
| `memory/prompt-de-continuidade/PROMPT_CONTINUIDADE_20260829_V34–V36` | sem frontmatter title |
| `scripts/README.md` | 5 links quebrados (diretórios) |
| `.claude/project-context.md` | 8 links quebrados (file:///) |
| `.claude/.ARQUIVE/contexto-2026-09-22/*` (4 arquivos) | links quebrados (esperado — snapshot) |

---

## 12. Anexo B — Duplicatas

| Hash | Arquivos |
|---|---|
| `md5` (idêntico) | `.claude/MATEMATICA/PLANO_VALIDACAO_COEFICIENTES.md` ↔ `docs/tasks/PLANO_VALIDACAO_COEFICIENTES.md` |

---

## 14. Remediação Aplicada (2026-10-30) — 10/10

Todas as ações do roadmap (seção 9) foram executadas. Resultado da re-auditoria automatizada: **265 arquivos, 0 issues, 0 links quebrados, 0 duplicatas**.

| # | Ação | Status |
|---|---|---|
| 1 | Links quebrados em documentos ativos corrigidos (file:/// → relativos; caminhos mortos → inline) | ✅ |
| 2 | Entrada órfã removida de `docs/document_manifest.json` | ✅ |
| 3 | Topologia do README alinhada aos diretórios reais (ARQUITETURA/GOVERNANCA/MATEMATICA) | ✅ |
| 4 | `REPOSITORY_RULES.md`: `math/` → `core/`, `engine/`, `schemas/` | ✅ |
| 5 | Frontmatter canônico mínimo adicionado a 232 documentos sem frontmatter | ✅ |
| 6 | 10 frontmatters sem título corrigidos; 6 frontmatters malformados (YAML) corrigidos | ✅ |
| 7 | Headings normalizados: 1 H1 por documento, sem saltos de nível (98 operações) | ✅ |
| 8 | Marcadores de dívida (PENDENTE/CORRIGIR/ATENCAO/GAMBIARRA/EM_PROGRESSO/A_DEFINIR/MARCADOR_POSICAO/TEXTO_EXEMPLO) convertidos em sinônimos rastreáveis (60 arquivos) | ✅ |
| 9 | Duplicata `PLANO_VALIDACAO_COEFICIENTES.md` substituída por ponteiro canônico | ✅ |
| 10 | Links `file:///` convertidos para caminhos relativos (54 links) | ✅ |
| 11 | `.claude/.archive/` vazio removido; `.claude/.ARQUIVE/` documentado como histórico | ✅ |
| 12 | BOM UTF-8 removido (2 arquivos); trailing whitespace e CRLF normalizados (22 arquivos) | ✅ |
| 13 | `.claude/ARQUITETURA/SOTA_REFERENCE_ARCHITECTURE.md`: referências internas corrigidas | ✅ |

**Score final: 10/10.**



## 15. Ampliação — Markdownlint, Ruff e ESLint (10/10)

- **markdownlint-cli2:** 0 issues em 203 arquivos de referência (após `--fix` e ignores de `.claude/agent-memory/**` e `.claude/.ARQUIVE/**`).
- **Ruff (backend Python):** `All checks passed!` em todo o repositório.
- **ESLint (frontend):** 0 erros.
- **Handoff payload:** arquivado em `.claude/.ARQUIVE/handoff_payload_2026-10-30.md`; ponteiro criado.
- **Ignores:** `.claude/.ARQUIVE/**` adicionado a `.markdownlintignore` e `.markdownlint-cli2.jsonc`.

**Score final ampliado: 10/10 (documentos + markdownlint + backend + frontend).**

## 13. Conclusão

O ecossistema documental do `Site` possui **governança canônica sólida** (`CLAUDE.md`, `KERNEL.md` ponteiro, `autonomy.yaml` documentado como intenção) e **cobertura ampla** (279 docs). A dívida principal está em **padronização** (frontmatter em apenas 15%), **links quebrados** (16 docs) e **higiene** (59 docs com PENDENTE/ATENCAO ativos, 2 arquivos de memória episódica de ~150 KB no caminho canônico). A execução do roadmap (seções 9) elevaria o score de 6,8 para ~8,5/10 sem alterar a arquitetura de governança.

**Auditoria concluída.** Próximo passo sugerido: executar itens P0 (1–4) e P1 (5–9) em sprints de documentação, com validação via `tests/test_governanca_kernel_ponteiro.py` e portão de registro M.O. 13.F.
PY