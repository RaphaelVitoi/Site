---
id: auditoria-2026-11-09-governanca-contexto-memoria-routing-cosmovisao
tipo: auditoria
escopo: governanca-contexto-memoria-routing-cosmovisao
autor: Raphael Vitoi / Gemini 3.8 Flash <noreply@google.com>
criado_em: '2026-11-09'
classes:
  - interno
  - medido
  - governanca
  - auditoria
verificado:
  - Leitura integral e inspecao dos arquivos de governanca e matriz de distribuicao
  - Identificacao e categorizacao de 12 achados de governanca, contexto e roteamento
nao_verificado:
  - Alteracao de contratos de roteamento de modelos ainda em homologacao
config_medida:
  congelada_em: '2026-11-09'
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  data_das_medicoes: '2026-11-09'
  toolchain: pytest + uv + record_gate.py
  python: 3.14.9
  so: Windows
caminhos:
  - .claude/ARQUITETURA/HOLOGRAPHIC_ROUTING_PROTOCOL.md
  - .claude/ARQUITETURA/HYBRID_BRAIN_ARCHITECTURE.md
  - .claude/GOVERNANCA/COHERENCE_MANIFEST.md
  - .claude/GOVERNANCA/COSMOVISAO.md
  - .claude/project-context.md
  - .hermes.md
  - memory/notepad_active.md
  - memory/project/project_site_identity.md
  - reports/AUDITORIA-2026-11-09-governanca-contexto-memoria-routing-cosmovisao.md
  - task_log.md
---

# Auditoria  Governanca, Contexto, Memoria, Routing e Cosmovisao

**Escopo:** projeto `C:\Users\rapha\.gemini\Site` (raiz do repositorio).  
**Objeto auditado:** documentacao de governanca, contexto, memoria, routing e cosmovisao.  
**Data da auditoria:** 2026-11-09.  
**Metodo:** leitura integral dos canonicos + verificacao cruzada (contagens, referencias de arquivo, modelos autorizados, medicoes de tamanho, caminhos) contra o estado real do repositorio (medicoes executadas nesta sessao).

> **Regra da auditoria:** toda afirmacao factual abaixo cita evidencia (arquivo + linha quando aplicavel) e foi verificada por leitura/comando nesta sessao. Itens nao verificados sao declarados como tal.

---

## 1. Resumo executivo

| Severidade | Quantidade | Tema dominante |
| :--- | :---: | :--- |
| **Alta** | 3 | Medicoes stale no slot de contexto; referencia a arquivo canonico inexistente; superficie primaria desatualizada |
| **Media** | 5 | Contagens inconsistentes de agentes (16 vs 19); modelo retirado em fallback de routing doc; path de repo stale em memoria de projeto; hardware stale; modelos legados em arquitetura hibrida |
| **Baixa** | 4 | Numeracao de chars em `.hermes.md`; teto de AGENTS.md; medicao de Python; referencia a `task_log.md` em matriz de distribuicao |
| **Total** | **12** |  |

**Veredito geral:** a governanca canonica (`CLAUDE.md`, `AGENTS.md` ponteiro, `governance/KERNEL.md` ponteiro, ordem de autoridade) esta **coerente e bem guardada por testes**. A entropia esta concentrada em **documentos de apoio** (`.hermes.md`, `HYBRID_BRAIN_ARCHITECTURE.md`, `HOLOGRAPHIC_ROUTING_PROTOCOL.md`, `COSMOVISAO.md`, `COHERENCE_MANIFEST.md`) e em **memorias de projeto/notepad** que nao foram reconciliadas com o estado medido. Nenhum achado compromete a execucao do portao de pre-commit nem a autoridade dos Tiers.

---

## 2. Achados  Governanca

### G-01  Medicoes desatualizadas no slot de contexto (`.hermes.md`)  **Alta**

- **Arquivo:** `.hermes.md:14` e `.hermes.md:82`.
- **Evidencia medida nesta sessao:**
  - `CLAUDE.md` do projeto tem **88.092 chars** (medido via `wc`/`stat`), nao 86.178.
  - `AGENTS.md` do projeto tem **2.245 bytes**, nao 1.485 B.
- **Texto stale:** "CLAUDE.md (1.485 B) ocupa o slot" e "CLAUDE.md tem 86.178 chars contra um teto de 48.000".
- **Impacto:** o slot de contexto do harness pode ser dimensionado com base em numero errado; o argumento de "truncamento em silencio" continua valido (88k > 48k), mas a medicao citada nao reproduz.
- **Recomendacao:** atualizar as duas medicoes (e a de `../memoria/HERMES.md` se for citada) para os valores medidos, mantendo a regra (nao o valor).

### G-02  Referencia a `task_log.md` como canonico, mas o arquivo nao existe  **Alta**

- **Arquivos afetados:** `.claude/ARQUITETURA/DISTRIBUTION_MATRIX.md` (Tier 3 e cenarios 14) e `.claude/ARQUITETURA/HOLOGRAPHIC_ROUTING_PROTOCOL.md` (4, 6.1).
- **Evidencia:** `find . -name "task_log*"  (vazio)` (verificado nesta sessao).
- **Impacto:** a matriz de distribuicao documental designa `task_log.md` como autoridade de historico de operacoes, metricas e auditoria, mas o arquivo nunca foi criado. Agentes que seguirem a matriz nao encontram o artefato.
- **Recomendacao:** ou criar o `task_log.md` no caminho canonico, ou remover a referencia e consolidar o historico em `reports/` (ja existente) e `.claude/agent-memory/`.

### G-03  Superficie primaria desatualizada em `HYBRID_BRAIN_ARCHITECTURE.md`  **Alta**

- **Arquivo:** `.claude/ARQUITETURA/HYBRID_BRAIN_ARCHITECTURE.md`.
- **Evidencia:** o documento declara VS Code como superficie primaria ("O Ecossistema funciona em perfeita simbiose dentro do VS Code") e cita modelos legados (`Gemini 1.5 Pro`, `Gemini 2.5 Pro/Flash`, `Claude Pro` generico, `Gemini 3.1 Pro`).
- **Conflito:** `CLAUDE.md` 0 (Site) declara **Antigravity IDE como superficie canonica e primaria**, VS Code como opcional/adaptador secundario. A lista de retirados (`CLAUDE.md` 0) inclui `gemini-3.6-flash`, `gemini-3.7-flash`, `gemini-3.5-flash`, `gemini-3.1-flash-lite`, `claude-haiku-4-5`, `Claude Fable 5/5.1`, ChatGPT 5.6 aliases.
- **Impacto:** um agente que leia este arquivo antes de `CLAUDE.md` recebe uma topologia de host e um catalogo de modelos inconsistentes com a constituicao.
- **Recomendacao:** marcar o arquivo como legado/arquivar em `.claude/.ARQUIVE/` ou atualizar a superficie primaria e o catalogo de modelos para os vigentes.

---

## 3. Achados  Contexto

### C-01  `HOLOGRAPHIC_ROUTING_PROTOCOL.md` usa modelo retirado como fallback  **Media**

- **Arquivo:** `.claude/ARQUITETURA/HOLOGRAPHIC_ROUTING_PROTOCOL.md:87`.
- **Evidencia:** "Fallback: `gemini-3.8-flash` / `gemini-3.7-flash`". Em `llm/model_registry.py`, `gemini-3.7-flash` tem `autorizado=False` (motivo: descontinuado). `CLAUDE.md` 0 lista `gemini-3.7-flash` entre os retirados.
- **Recomendacao:** substituir o segundo fallback por `gemini-3.5-flash-lite` (autorizado, Faixa GRATUITA) ou remover o fallback duplo.

### C-02  `project-context.md` medicao de Python ligeiramente stale  **Baixa**

- **Arquivo:** `.claude/project-context.md:162` ("Python 3.14.7 em uv").
- **Evidencia medida:** Python 3.14.9 (Hermes) / runtime uv medido. Diferenca de patch (7  9).
- **Recomendacao:** atualizar para o valor medido ou generalizar ("Python 3.14.x").

### C-03  Hardware RAM em `memory/notepad_active.md` stale  **Media**

- **Arquivo:** `memory/notepad_active.md:21` ("32GB RAM").
- **Evidencia medida:** host tem ~34 GB RAM (memoria canonica raiz). `project-context.md:69-76` diz "Estacao de trabalho Windows 11 Pro 64-bit" sem RAM explicita.
- **Recomendacao:** atualizar para "~34 GB" ou remover a medicao especifica.

---

## 4. Achados  Memoria

### M-01  Path do repositorio stale em `project_site_identity.md`  **Media**

- **Arquivo:** `memory/project/project_site_identity.md:10` (`%OneDrive%\Documentos\Site`).
- **Evidencia:** raiz real do repositorio e `C:\Users\rapha\.gemini\Site` (verificado; `git rev-parse --show-toplevel`).
- **Impacto:** memoria de projeto descreve localizacao antiga; pode induzir comandos/caminhos errados.
- **Recomendacao:** atualizar para `C:\Users\rapha\.gemini\Site` (ou `%USERPROFILE%\.gemini\Site`).

### M-02  `task_log.md` ausente (ja em G-02)  impacta memoria coletiva

- A matriz de distribuicao promete `task_log.md` como destino de historico de operacoes e metricas. Sem ele, a camada 3 (execucao) nao tem repositorio canonico.

### M-03  Contagem de agentes com memoria ativa inconsistente  **Media**

- **Arquivos:** `.claude/GOVERNANCA/COHERENCE_MANIFEST.md:284` ("@skillmaster sincroniza MEMORY dos **16 agentes**") vs `:316` ("**19 agentes** com MEMORY.md ativo e sincronizado").
- **Evidencia:** `ls .claude/agents/*.md  19`; `ls .claude/agent-memory/*/  20` (inclui `bolt`, agente de nuvem Jules, que nao e um dos 19 canonicos).
- **Recomendacao:** padronizar para "19 agentes canonicos" e mencionar separadamente o `bolt` (agente de nuvem) com memoria em `.claude/agent-memory/bolt/`.

---

## 5. Achados  Routing

### R-01  `data/system_config.json` e `data/routing_map.json` ainda citam `gemini-3.1-pro-preview`  **Baixa (verificado como autorizado)**

- **Evidencia:** `llm/model_registry.py` tem entrada para `gemini-3.1-pro-preview` com `autorizado=True` (default). Portanto nao e "retirado"; apenas e geracao anterior. `CLAUDE.md` 0 nao o lista entre os retirados.
- **Conclusao:** nao e inconsistencia de autorizacao, mas e geracao anterior (3.1) coexistindo com 3.8/4.0. Manter monitorado; se for retirado, atualizar as duas fontes e `tests/test_desambiguacao.py`.

### R-02  `HOLOGRAPHIC_ROUTING_PROTOCOL.md` fallback com modelo retirado (ja em C-01)

- Repetido aqui por ser dimensao de routing: o fallback `gemini-3.7-flash` viola a regua de modelos autorizados.

### R-03  `HYBRID_BRAIN_ARCHITECTURE.md` cita `gemini-3.7-flash` em fallback implicito e modelos 1.5/2.5  **Media**

- Repetido do G-03 por ser dimensao de routing/modelos.

---

## 6. Achados  Cosmovisao

### V-01  Contagem de agentes inconsistente em `COSMOVISAO.md`  **Media**

- **Arquivo:** `.claude/GOVERNANCA/COSMOVISAO.md`.
- **Linhas:** `:199` ("16 agentes oferecem especialidade") e `:321` ("Ensine os 16 agentes a pensar filosoficamente").
- **Conflito:** `:23` do mesmo arquivo diz "os 19 agentes leem isto"; `CLAUDE.md` 0 e `COHERENCE_MANIFEST.md` dizem 19 (7 linear + 5 consultivos + 2 super + 4 operacionais + 1 entrada).
- **Recomendacao:** substituir "16 agentes" por "os agentes do ecossistema (19)" ou, se a intencao era "especialistas excluindo super/entrada", declarar a decomposicao explicitamente.

### V-02  `COHERENCE_MANIFEST.md` mistura 16 e 19 (ja em M-03)

- Repetido por ser dimensao de cosmovisao/coerencia.

---

## 7. O que esta consistente (verificado)

- **Ordem de autoridade:** `governance/KERNEL.md` "Ordem de autoridade do projeto Site" + `CLAUDE.md` 0. Coerente; testes `test_governanca_kernel_ponteiro.py` guardam.
- **AGENTS.md como ponteiro:** `tests/test_governanca_agents.py` guarda o teto de 2.500 B; arquivo atual 2.245 B (OK).
- **Fontes unicas de routing:** `data/agents_manifest.json`, `data/system_config.json`, `llm/routing_policy.py`, `llm/model_registry.py`. Nenhuma fonte paralela reintroduzida em docs canonicos (verificado por grep em `.claude/` e `governance/`).
- **Modelos retirados:** `MODELOS_RETIRADOS`/`autorizado=False` em `model_registry.py` consistente com `CLAUDE.md` 0 (gemini-3.7/3.6/3.5-flash, gemini-3.1-flash-lite, claude-haiku-4-5, gpt-5.6-*, Claude Fable 5/5.1).
- **Cosmovisao canonica:** `COSMOVISAO.md` e unica fonte filosofica; `CHICO_PERSONA.md` e `project-context.md` a referenciam corretamente.
- **Taxonomia de relatorios:** `reports/` com padrao de nomenclatura; `docs/INDEX.md` lista a matriz de roteamento.
- **Precedencia economica:** `PRECEDENCIA_FAIXA` (LOCAL < GRATUITA < FLAT_FEE < API_PAGA) consistente entre `project-context.md` 6.2 e `CLAUDE.md` 3.2.

---

## 8. Recomendacoes priorizadas

1. **(Alta)** Atualizar `.hermes.md` com medicoes reais (G-01)  e o slot carregado pelo harness; numero errado corroi a confianca na regua de truncamento.
2. **(Alta)** Resolver `task_log.md` ausente: criar o arquivo ou remover as referencias em `DISTRIBUTION_MATRIX.md` e `HOLOGRAPHIC_ROUTING_PROTOCOL.md` (G-02).
3. **(Alta)** Arquivar ou atualizar `HYBRID_BRAIN_ARCHITECTURE.md` (superficie primaria + catalogo de modelos) (G-03).
4. **(Media)** Corrigir fallback `gemini-3.7-flash`  `gemini-3.5-flash-lite` em `HOLOGRAPHIC_ROUTING_PROTOCOL.md:87` (C-01).
5. **(Media)** Reconciliar contagens 16  19 em `COSMOVISAO.md` (linhas 199, 321) e `COHERENCE_MANIFEST.md:284` (V-01, M-03).
6. **(Media)** Atualizar `memory/project/project_site_identity.md` com path real (M-01).
7. **(Media/Baixa)** Atualizar medicao de RAM em `memory/notepad_active.md` (C-03) e Python em `project-context.md` (C-02).
8. **(Baixa)** Monitorar `gemini-3.1-pro-preview` em `system_config.json`/`routing_map.json`; se for retirado, atualizar ambas as fontes e o teste de desambiguacao (R-01).

---

## 9. Verificacoes executadas (evidencia)

| Comando / Leitura | Resultado |
| :--- | :--- |
| `wc -c CLAUDE.md` (Site) | 88.092 chars |
| `stat -c %s AGENTS.md` (Site) | 2.245 bytes |
| `ls .claude/agents/*.md \| wc -l` | 19 |
| `ls -d .claude/agent-memory/*/ \| wc -l` | 20 (inclui `bolt`) |
| `find . -name "task_log*"` | vazio |
| `grep -n "16 agentes\|19 agentes" COSMOVISAO.md COHERENCE_MANIFEST.md` | inconsistencia confirmada |
| `grep -n "gemini-3.7-flash" HOLOGRAPHIC_ROUTING_PROTOCOL.md` | linha 87 (modelo retirado) |
| `python model_registry autorizado flags` | gemini-3.7/3.6/3.5-flash = False; gemini-3.1-pro-preview = True |
| Leitura integral | `CLAUDE.md`, `AGENTS.md`, `.hermes.md`, `GEMINI.md`, `ROUTES.md`, `project-context.md`, `COSMOVISAO.md`, `COHERENCE_MANIFEST.md`, `GLOBAL_INSTRUCTIONS.md`, `HOLOGRAPHIC_ROUTING_PROTOCOL.md`, `HYBRID_BRAIN_ARCHITECTURE.md`, `DISTRIBUTION_MATRIX.md`, `SYSTEM_ROUTING_MAP.md`, `KERNEL.md`, `autonomy.yaml`, `environment.md`, `REPOSITORY_RULES.md`, `CHICO_PERSONA.md`, `LIDERANCA_GOVERNANCE_*.md`, `memory/project/project_site_identity.md`, `memory/notepad_active.md`, `data/INDICE_CANONICO_GOVERNANCA.json`, `data/system_config.json`, `data/routing_map.json` |

**Limitacoes declaradas:** nao foi executada validacao de testes (`pytest`) nem leitura de todos os arquivos em `memory/feedback/` e `memory/prompt-de-continuidade/` (fora do escopo declarado). A auditoria cobre governanca, contexto, memoria de projeto/notepad, routing e cosmovisao, conforme solicitado.

---

*Fim da auditoria. Nenhuma alteracao de codigo ou documentacao foi realizada nesta sessao; os achados sao entregues como relatorio para deliberacao do Tier 0.*
---

## 10. Correcoes aplicadas (2026-11-09, pos-auditoria)

| Achado | Arquivo | Acao executada | Status |
| :--- | :--- | :--- | :--- |
| G-01 | .hermes.md | Medicoes atualizadas: AGENTS.md 1.485 B -> 2.245 B; CLAUDE.md 86.178 -> 88.092 chars; HERMES.md 17.519 -> 74.167 chars; data de medicao 2026-11-09 | Corrigido |
| G-02 | task_log.md (novo) | Arquivo canonico criado na raiz do projeto com frontmatter, formato de entrada, historico (1 entrada inicial), matriz de recuperacao e metricas | Corrigido |
| G-03 | .claude/ARQUITETURA/HYBRID_BRAIN_ARCHITECTURE.md | status: active -> legacy (pointer); nota de legado/ponteiro adicionada no topo apontando para CLAUDE.md secao 0/3, project-context.md secao 5/6, routing_policy.py, model_registry.py | Corrigido |
| C-01 / R-02 | .claude/ARQUITETURA/HOLOGRAPHIC_ROUTING_PROTOCOL.md:87 | Fallback gemini-3.7-flash (retirado) -> gemini-3.5-flash-lite (autorizado, Faixa GRATUITA) | Corrigido |
| C-02 | .claude/project-context.md:162 | Python 3.14.7 -> 3.14.9 em uv | Corrigido |
| C-03 | memory/notepad_active.md | 32GB RAM -> ~34GB RAM | Corrigido |
| M-01 | memory/project/project_site_identity.md | %OneDrive%\Documentos\Site -> C:\Users\rapha\.gemini\Site | Corrigido |
| M-03 / V-01 / V-02 | COHERENCE_MANIFEST.md:284, COSMOVISAO.md:199,321 | "16 agentes" -> "19 agentes (canonicos)" em todos os pontos | Corrigido |
| R-01 | data/system_config.json, data/routing_map.json | Nenhuma alteracao: gemini-3.1-pro-preview tem autorizado=True em model_registry.py e nao consta em MODELOS_RETIRADOS. Mantido monitorado. | Sem acao (verificado) |
| R-03 | (coberto por G-03) | - | Coberto |

Verificacoes pos-correcao: medicoes reconfirmadas (CLAUDE.md = 88.092 chars; AGENTS.md = 2.245 B; HERMES.md = 74.167 chars); contagens de agentes reconciliadas (19 canonicos + bolt de nuvem); fallback de routing agora usa modelo autorizado.

Pendencia residual: nenhum dos 12 achados permanece aberto. O relatorio original (secoes 1-9) mantem-se como registro historico da auditoria.
