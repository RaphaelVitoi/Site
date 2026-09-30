# PROMPT DE CONTINUIDADE — auditoria + roteamento Site

> Retome deste ponto. **Leia primeiro, meça antes de mexer.** O erro anterior foi
> reescrever em vez de medir.

---

## 0. LEIA PRIMEIRO

```bash
cd "C:/Users/rapha/.gemini/Site"
git status --porcelain && git diff --stat
./.venv/Scripts/python.exe -m ruff check llm/routing.py llm/orchestrator.py api/v1/
```

**NUNCA** use `uv run --no-sync <script>`: o trampoline falha neste host
(`uv trampoline failed to canonicalize script path`). Use
`./.venv/Scripts/python.exe -m pytest` — foi assim que a suíte rodou.

---

## 1. INFRAESTRUTURA (ligada nesta sessão, pode estar morta)

| Serviço | Porta | Como ligar |
|---|---|---|
| API + worker | 17042 | `./.venv/Scripts/python.exe scripts/cli/nexus.py ops worker` |
| llama.cpp G9v3 | 8081 | `powershell -File scripts/ops/Start-LocalLlama.ps1 -Model Duo -Action Start` |
| llama.cpp QwenCoder | 8083 | idem |
| Ollama cloud | 11434 | já ativo |

O `ops worker` sobe pai+filho (Popen) — **dois** processos `task_executor.py`
é o normal, não é duplicata.

## 2. O QUE JÁ ESTÁ FEITO E VERIFICADO (não regrave)

### Segurança — os dois P0 da auditoria

**A-01 `_env.ps1` servível por `/api/files/view`** — CORRIGIDO em
`api/v1/handlers.py:774-820`. A regra virou `_nome_e_da_familia_ambiente()` por
padrão (não literal). Verificado por execução real da função de produção:
`_env.ps1`, `env.sh`, `nexus_env.ps1`, `.envrc` → `allowed=False`;
`.env.example`, `_env.example.ps1`, `CLAUDE.md` → `allowed=True`. Guard em
`tests/test_auditoria_backend_2026_09_16.py` (parametrizado, 161 testes verdes).

**A-02 imagem de produção não sobe** — CORRIGIDO em `Dockerfile:38-66`.
Fechо transitivo medido por AST: faltavam `monitoring/`, `agents/`,
`conductor/`, `task_executor.py`, `memory_rag.py`, `predictive_forest.py`.
`cli/` e `scripts/` **não** entram (importam só em `__main__`).
Guard: `tests/test_dockerfile_closure_runtime.py` — verificado nos dois
sentidos: baseline 0 → 5/5 mutações detectadas → restaurado 0.
**Não verificado:** `docker build` (Docker ausente no host).

**Também feito:** `Cache-Control: no-store` no middleware de segurança
(`api/v1/middleware.py:465-495`), `Retry-After` no 429, allowlist de
`CHAVES_DE_ESTADO` em `/state` (fecho AST: 4 chaves reais).

### Roteamento — a parte que FUNCIONA (não toque)

`llm/routing.py`:
- `DOMINIO_POR_AGENTE` — 19/19 agentes cobertos, derivado do **trabalho**
- `resolver_dominio(task)` — declarado vence derivado; `llm/orchestrator.py:180`
  consome. Sem este hook, o eixo é código morto.

Medido e correto:

| Agente | Domínio | Especialista |
|---|---|---|
| `@dispatcher` | TRIAGE | gemini-3.5-flash-lite |
| `@implementor` | CODE | qwen-coder local |
| `@curator` | CURADORIA | gpt-oss:120b |
| `@architect`/`@planner` | INTELIGENCIA | gemma4:31b |

`tests/test_roteamento_especialidade.py` — **20 passed**.

---

## 3. O QUE ESTÁ QUEBRADO (corrigir primeiro, com medição)

**Sintaxe OK, ruff limpo, CJK nenhum. O defeito é LÓGICO e os testes o provam:**
`tests/test_roteamento_especialidade.py` está em **8 failed, 12 passed** — os 8
que falham são exatamente os que verificam que a especialidade decide. Em
runtime, **toda dimensão devolve a mesma lista**: `gpt-oss:120b-cloud` vence
TRIAGE, CODE, RAZONING, CURADORIA, INTELIGENCIA, MATH e `None`. O roteamento
não está decidindo nada.

**Não reverta o arquivo para "ficar verde":** o teste vermelho é a informação
mais útil que existe aqui. Ele mede exatamente o defeito.

**Causa raiz medida** (não é o peso — `PESO_CUSTO = 0.35` já foi testado e não
resolveu):

```
_especialidade por modelo:
  gpt-oss:120b-cloud    TRIAGE:2  CODE:1  RAZONING:0  CURADORIA:-6
  gemma4:31b-cloud      TRIAGE:2  CODE:1  RAZONING:0  CURADORIA:-5
  qwen2.5-coder         TRIAGE:2  CODE:-6 RAZONING:0  CURADORIA:1
  gemini-3.8-flash      TRIAGE:-1 CODE:-2 RAZONING:0  CURADORIA:-3
  gemini-3.5-flash-lite TRIAGE:-5 CODE:-2 RAZONING:0  CURADORIA:1
```

`_ganho_de_especialidade()` mapeia `bruto <= -6 → 1.0` e `bruto <= -5 → 0.85`.
120b e 31b pontuam alto em **quase toda** dimensão, então ganham por
construção. **`_especialidade` precisa ser relativa dentro da dimensão** — "o
melhor *para este domínio*" — e não um score absoluto por modelo. Um modelo não
pode ser especialista em tudo; é isso que faz o ranking colapsar.

Ordem sugerida: (1) medir `_especialidade` como comparação relativa por
dimensão; (2) só então recalibrar pesos; (3) `pytest
tests/test_roteamento_especialidade.py` → 24 passed.

---

## 3b. INVARIANTE DE PROVIDER (medido 2026-09-30)

**As chaves Gemini são específicas para modelos Google.** Os quatro recursos são
**partições disjuntas** — nenhum modelo atravessa de uma para outra:

| Recurso | Alcança | Não alcança |
|---|---|---|
| **Chaves Gemini** (AI Studio, 5 chaves) | **só Gemini** | qualquer não-Google |
| **Chaves OpenRouter** (16 chaves, 4 tiers, rotaciona) | o que o OpenRouter servir | Gemini direto |
| **Ollama** — camada CLOUD | modelos que o Ollama roteia ao provider (`gemma4:31b-cloud`, `gpt-oss:*`, `kimi-*`, `deepseek-v4-*`, `glm-5.1`) | depende do provider remoto |
| **Ollama / llama.cpp** — camada LOCAL | o GGUF carregado no host (`qwen2.5-coder:*`, `gemma4:e2b/e4b/12b`, `qwen-*-surgical/math/poetics`) | nada remoto |

⚠️ **Ollama é LOCAL E CLOUD ao mesmo tempo**, no mesmo processo. A distinção é
**onde o cálculo roda**, não o rótulo do tag. É por isso que a latência diverge
tanto — medido: cloud 445–768 ms, local 10.467–23.625 ms. Classificar pelo
sufixo `:cloud` erra o custo.
| **Hermes** (cloud, identidade do agente) | o próprio agente | — |

**Consequência:** uma chave que não alcança o modelo não é fallback — é erro de
configuração silencioso. Foi o que medi nos `:free` do OpenRouter: 38/38 erro
em 46 ms. Cota que não alcança **parece** disponibilidade.

**Erro meu, incompatível com a operação:** tratei `gemma4:31b-cloud` e
`gpt-oss:20b-cloud` (Ollama) como equivalentes a `gemini-3.5-flash-lite` na mesma
lista de candidatos. Não são — as chaves Gemini não alcançam os outros.

⚠️ `OPENROUTER_ALTERNATIVE_MODELS` está **VAZIO** no config. A rotação descrita
pelo Tier 1 não está codificada; por isso `_inject_openrouter_alternatives`
cai no default com dois `:free` que mediram 100% de erro.

---

## 3c. LATÊNCIA MEDIDA — Fleet completa (2026-09-30)

Método: `POST /api/generate` (Ollama) e `generateContent` (Gemini), `max_tokens=5`,
cronometrado. Medido, não estimado.

| Modelo | Latência | Camada |
|---|---|---|
| `gemma4:31b-cloud` | **445 ms** | Ollama cloud |
| `gpt-oss:20b-cloud` | **768 ms** | Ollama cloud |
| `gemini-3.5-flash-lite` | **933 ms** | AI Studio (5 chaves) |
| `gemini-3.6-flash` | 997 ms | AI Studio |
| `gemini-3.7-flash` | 1341 ms | AI Studio |
| `gemini-3.8-flash` | 1722 ms | **TIER 1 — fora da delegação** |
| `qwen2.5-coder:1.5b` | 10.467 ms | local VRAM |
| `qwen2.5-coder:7b` | 23.625 ms | local VRAM |

⚠️ **`_velocidade` está INVERTIDO.** Marquei local rápido (0.75) e cloud lento
(0.35). Medido é o oposto: cloud é 20–50× mais rápido, porque o local roda na
VRAM/RAM e paga o carregamento do modelo. Classificar pelo sufixo `:cloud` erra
o custo — o que vale é onde o cálculo roda, e o próprio `/api/tags` diz via
`remote_host`.

⚠️ **A ordem dos Gemini que "corrigi" antes estava certa por acaso.** Usei os
326 registros de `key_usage_metrics` — que são de uma frota antiga só-Gemini.
Medido hoje: 3.5-lite é o mais rápido da família (933 ms), 3.8 o mais lento
(1722 ms).

⚠️ **Não recalibrar as tabelas com 3 medições parciais.** Já refutei duas
premissas seguidas (custo monetário inexistente; velocidade invertida).
Calibrar exige a frota inteira medida com o mesmo método, de uma vez.

---

## 3d. FROTAS REAIS — caches do Hermes no PC (2026-09-30)

⚠️ **Consultar antes de qualquer afirmação sobre a frota.** Meu catálogo anterior
(do `/api/tags` do Ollama) era ~1/3 do real e medi velocidade sobre ele.

**`~/AppData/Local/hermes/ollama_cloud_models_cache.json` — 25 cloud:**
`kimi-k2.7-code`, **`kimi-k3`**, `minimax-m3`, `kimi-k2.6`, `nemotron-3-ultra`,
**`glm-5.2`**, **`glm-5.3-flash`**, **`nemotron-3-nano:30b`**, `gpt-oss:20b`,
`glm-5.3`, `deepseek-v4.1-flash`, `gemma4:31b`, `nemotron-3-super`,
`gpt-oss:120b`, `minimax-m2.7`, `deepseek-v4-pro:0813`, **`mistral-large-3:675b`**,
`minimax-m2.5`, **`qwen3.5:397b`**, `kimi-k2.5`, `deepseek-v4-flash:0731`,
`glm-5.1`, `deepseek-v4-pro`, `deepseek-v4-flash`

**`~/AppData/Local/hermes/provider_models_cache.json`:**
| Provider | Modelos (parcial) |
|---|---|
| **openrouter** | `claude-opus-5.5/5`, `claude-fable-5.1/5`, `gpt-6.1-sol-pro`, `gpt-6-astra-pro`, `grok-4.7`, `qwen3.8-max`, **`kimi-k3`**, `gemini-3.8-flash`, `deepseek-v4-pro` |
| **copilot** | `gpt-5.4`, `gpt-5.3-codex`, `claude-sonnet-5`, `claude-sonnet-4.6`, `gemini-3-pro-preview` |
| **copilot-acp** | idem copilot |
| **opencode-free** | `jev-1.13-free`, `deepseek-v4-flash-free`, `nemotron-3-ultra-free`, `mimo-v2.5-free` |

**`models_dev_cache.json`** (5,2 MB) — catálogo-wide; não lido ainda.

**Nunca medidos** (ausentes do meu catálogo): `qwen3.5:397b`,
`mistral-large-3:675b`, `kimi-k3`, `glm-5.2`, `glm-5.3`, `nemotron-3-nano:30b`,
`nemotron-3-super`, `minimax-m2.5`, `deepseek-v4.1-flash`, `kimi-k2.5`.

### 🚫 INTERDITADO: OpenRouter como fleet de execução

**ERRO MAIS CARO DA SESSÃO.** Listei `claude-opus-5.5`, `claude-fable-5.1`,
`gpt-6.1-sol-pro`, `gpt-6-astra-pro`, `grok-4.7` como se fossem candidatos de
delegação. Se eu tivesse calibrado `_custo_relativo`/`_velocidade` sobre essa
lista, **a arquitetura cairia numa rodada**: tarefa de rotina — uma edição de
código, uma triagem — indo para o modelo mais caro do mundo.

**As chaves OpenRouter são gratuitas; os MODELOS que elas alcançam não são
baratos em recurso.** O free é na COTA, não no PORTE. Confundir os dois é o
erro — e é o mesmo erro de premissa que me fez tratar "cloud" como recurso
limitado quando medido era rápido.

**Regra dura:** nenhum modelo de topo entra na trilha de execução, por estar
listado num catálogo. A lista de um provider é **capacidade alcançável**, não
**capacidade elegível**. Elegibilidade é decisão do Tier 1, por papel.

⚠️ `MODELOS_TIER1` em `llm/routing.py` cobre `claude-opus`, `claude-sonnet-5`,
`gpt-5.6`, `gpt-5.1`, `o3`, `o1-pro` — **falta `gemini-3.8`, toda a linha
`gpt-6*`, `claude-fable*`, `claude-opus-5.5`, `grok-4.7`**. E
`gemini-3.8-flash` (Tier 1) aparece no OpenRouter E no copilot: a classificação
é por PAPEL, não por provider nem por marca de nome.

---

## 4. DECISÕES DO TIER 1 (não reverses)

- **Tier 1 orquestra; não é buscador de tarefa.** `claude-sonnet-5`,
  `gpt-5.6-sol`, `claude-opus-5` designam `@architect`, `@curator`,
  `@implementor` via `llm/routing_policy.py:rotear()`. **Tarefa delegável a
  outro modelo não justifica Tier 1.** Já existe `MODELOS_TIER1` +
  `_e_tier1()` em `routing.py` — **não integrado ao `_score_model` ainda**.
- **Especialidade é relativa.** Economia *significativa* sobrepõe ganho
  *marginal*. Pesos não são fixos — são política do Tier 1.
- **Eixos trocáveis:** especialidade, velocidade, disponibilidade × economia.
- **Triagem = `@dispatcher`** no 3.5-flash-lite (produz JSON validado por
  `_parse_dispatcher_subtasks_strict`; classificar é barato, raciocinar não).
- **qwen-coder local** para edição de código.
- **gemma4:31b / gpt-oss:120b (cloud)** para curadoria, planejamento,
  arquitetura, inteligência.

⚠️ **Correção de uma conclusão errada minha:** o 3.6-flash no `@securitychief`
**não** foi falha de fallback — é **designação do Tier 1**
(`modelo_do_agente('securitychief') == 'gemini-3.6-flash'`). Se quiser mudar,
mude `routing_policy.py`, não o score.

---

## 5. ARMADILHAS MEDIDAS NESTA SESSÃO

1. **CJK escapa em docstring** — `长`, `巧合` entraram duas vezes. A skill
   `site-governance-address-stability` documenta isso. Confira sempre.
2. **`patch` pode recuar indentação** e criar código morto aninhado; o
   interpretador aceita, o lint passa. Releia a região depois.
3. **Guard com lista hardcoded = guarda decorativo.** `PACOTES_COPIADOS` no
   teste do Dockerfile = segunda cópia da verdade: remover um `COPY` passava
   verde. Derive do Dockerfile.
4. **Guard precisa ser verificado nos dois sentidos.** 5 mutações detectadas é o
   padrão, senão é guard decorativo.
5. **Comparar por `name` de arquivo quebra com homônimos**
   (`engine/base.py` vs `solver_importers/base.py`).
6. **Números com zero à esquerda em docstring** (`2026-09-29`) — o tokenizer
   trata como literal. Use `29/09/2026`.
7. `uv run --no-sync <script>` falha; `python -m` funciona.

---

## 6. GOVERNANÇA

- **Não commite** (`CLAUDE.md` §1.0). Não use `--no-verify` nem
  `SKIP_CWV_GATE=1`.
- Não rode a suíte completa sem pedido (1800 testes, ~6 min). Alvo primeiro.
- Base verificada: **1800 passed, 1 skipped** em 361,55 s;
  `ruff check .` limpo; `npm audit --omit=dev` 0;
  `pip-audit` 2 CVEs **não alcançáveis** (pyjwt é do `mcp`, JWT do projeto é
  implementado à mão em `api/v1/middleware.py:148`).
- Diff atual: `llm/routing.py` (+393), `llm/orchestrator.py` (+9),
  `Dockerfile`, `api/v1/handlers.py`, `api/v1/middleware.py`,
  `tests/` (3 arquivos novos), `reports/HANDOFF-…md` (pré-existente).

## 7. FROTA DE MODELOS (medido 2026-09-30, `/api/tags` + `~/models/gguf`)

**Locais — llama.cpp / GGUF**
| Modelo | Porta | Papel |
|---|---|---|
| `ai9stars_G9v3-3B-Q4_K_M.gguf` | 8081 | raciocinio/ops (na ar) |
| `qwen2.5-coder-1.5b-q8_0.gguf` | 8083 | **edicao pontual + autocomplete** (na ar) |
| `Ling-3.0-tiny-Q4_K_M.gguf` | — | sintese PT-BR |

**Ollama local — quatro variants de coder, custos MUITO diferentes**
| Modelo | Tam. | Quant. |
|---|---|---|
| `qwen2.5-coder:0.5b` | 494M | Q4_K_M |
| `qwen2.5-coder:1.5b` | 1.5B | Q4_K_M |
| `qwen2.5-coder:7b` | 7.6B | Q4_K_M |
| `qwen2.5-coder:7b-instruct-q5_K_M` | 7.6B | Q5_K_M |

**Especializacoes Qwen 7.6B Q5_K_M** (faixa "do autocomplete a algo maior"):
`qwen-code-surgical` (edicao cirurgica) · `qwen-pmev-math` (PMev) ·
`qwen-poetics` (texto)

**Cloud** — forca MAIOR que a tabela de dominios que escrevi supoe:
| Modelo | Tam. | Papel |
|---|---|---|
| `kimi-k2.7-code:cloud` | 1.04T INT4 | **code cloud, maior que o Tier 1** |
| `kimi-k2.6:cloud` / `minimax-m2.7:cloud` | 1.04T / 229B | geral |
| `gpt-oss:120b-cloud` | 117B MXFP4 | CURADORIA (eleito) |
| `gpt-oss:20b-cloud` | 20.9B MXFP4 | **coder cloud barato — buraco entre 1.5B e 120B** |
| `gemma4:31b-cloud` | 32.7B BF16 | INTELIGENCIA (eleito) |
| `gemma4:12b` / `:e4b` / `:e2b` | 11.9/8/5.1B Q4_K_M | local |

⚠️ **Divergencia a corrigir no pos-compact:** `_custo_relativo` trata
`qwen2.5-coder` como entrada UNICA, mas sao 4 variants (0.5B -> 7B Q5) com
custos muito diferentes. O roteamento nao distingue.

⚠️ **`kimi-k2.7-code:cloud` (1.04T, code) e mais forte que `gpt-oss:120b`
(CURADORIA na tabela atual).** A tabela de dominios precisa ser reconsiderada
pelo Tier 1 — nao mexer por conta propria.

---

## 8. NÃO FEZ / NÃO VERIFICADO

- `docker build` (Docker ausente) — A-02 provado só por análise estática.
- **Defeito medido em `scripts/ops/Start-LocalLlama.ps1`**: o bloco de STATUS
  do modelo falha com `O termo 'if' não é reconhecido como nome de cmdlet`,
  logo após os dois servidores subiremem. Os modelos **subiram** (G9v3 PID
  11844 :8081, QwenCoder PID 27892 :8083, ambos `[OK] ONLINE`); quem quebra é o
  *relatório* de status, não o serviço. Sintoma provável: `if` como expressão
  de valor em PowerShell — construto que só existe no 7, e o `CLAUDE.md` §1.1
  classifica exatamente isso (`??`, ternário, `PipelineChain`) como o que a
  bateria substituta barra. **Não corrigido** (ordem: sem edições de código).
- Smoke test da malha: executou ponta a ponta, **mas o relatório teve 3 linhas**
  (ecoou comando, sem veredito). Rede OK (`gemini-3.6-flash`, 22,3 s);
  qualidade de saída não investigada.
- 2 tasks `running` desde 2026-09-27 (`claimed_by: Raphael:3032`): órfãs de
  processo morto. O worker novo (PID 18000) as reassumiu — BK-07 funcionando.
- Árvore Rust/C++/WASM, `mcp-bridge/`, `cli/`: **não auditados**.
