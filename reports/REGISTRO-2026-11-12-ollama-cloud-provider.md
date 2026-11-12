---
id: registro-2026-11-12-ollama-cloud-provider
tipo: registro
escopo: >-
  "Site -- novo provider 'ollama' (Ollama Cloud, ollama.com/api/chat) na malha
  SOTA: modulo llm/ollama_cloud.py, strategy no providers.py, pool OLLAMA_KEYS
  no budget.py, branch no orchestrator e regra de inferencia em routing.py;
  credenciais OLLAMA_API_KEY e HF_TOKEN provisionadas no registro do usuario"
ecossistema: nexus-sota
autor:
  Devin (SWE-2 Flash)
  <158243242+devin-ai-integration[bot]@users.noreply.github.com>
criado_em: "2026-11-12T12:05:00-03:00"
atualizado_em: "2026-11-12T12:05:00-03:00"
classes:
  - interno
  - medido
  - seguranca
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  python: "3.14.9"
  so: Windows
caminhos:
  - llm/ollama_cloud.py
  - llm/budget.py
  - llm/providers.py
  - llm/orchestrator.py
  - llm/routing.py
  - reports/REGISTRO-2026-11-12-ollama-cloud-provider.md
pendencias_resolvidas: []
revisoes_de_ancora:
  - registro: handoff-2026-09-30-expurgo-de-modelos-obsoletos-harmonizacao-qwen-e-calibracao
    caminhos:
      - llm/orchestrator.py
      - llm/routing.py
    parecer: >-
      "Adicao de provider 'ollama' (Ollama Cloud): novo modulo llm/ollama_cloud.py, OLLAMA_KEYS em budget.py, OllamaCloudStrategy em providers.py, branch em orchestrator.py e regra de inferencia em routing.py. Mudanca aditiva -- nenhum contrato, tier, identidade ou rota existente alterado; chamadas previas preservadas."
  - registro: handoff-2026-10-20-harmonizacao-tier1-gemini-38
    caminhos:
      - llm/routing.py
    parecer: >-
      "Adicao de provider 'ollama' (Ollama Cloud): novo modulo llm/ollama_cloud.py, OLLAMA_KEYS em budget.py, OllamaCloudStrategy em providers.py, branch em orchestrator.py e regra de inferencia em routing.py. Mudanca aditiva -- nenhum contrato, tier, identidade ou rota existente alterado; chamadas previas preservadas."
  - registro: registro-2026-08-29-tres-orfaos
    caminhos:
      - llm/budget.py
    parecer: >-
      "Adicao de provider 'ollama' (Ollama Cloud): novo modulo llm/ollama_cloud.py, OLLAMA_KEYS em budget.py, OllamaCloudStrategy em providers.py, branch em orchestrator.py e regra de inferencia em routing.py. Mudanca aditiva -- nenhum contrato, tier, identidade ou rota existente alterado; chamadas previas preservadas."
  - registro: registro-2026-09-24-blindagem-ascii-e-harmonizacao-scripts
    caminhos:
      - llm/orchestrator.py
    parecer: >-
      "Adicao de provider 'ollama' (Ollama Cloud): novo modulo llm/ollama_cloud.py, OLLAMA_KEYS em budget.py, OllamaCloudStrategy em providers.py, branch em orchestrator.py e regra de inferencia em routing.py. Mudanca aditiva -- nenhum contrato, tier, identidade ou rota existente alterado; chamadas previas preservadas."
  - registro: registro-2026-09-25-integracao-qwen-coder-e-blindagem-testes
    caminhos:
      - llm/budget.py
    parecer: >-
      "Adicao de provider 'ollama' (Ollama Cloud): novo modulo llm/ollama_cloud.py, OLLAMA_KEYS em budget.py, OllamaCloudStrategy em providers.py, branch em orchestrator.py e regra de inferencia em routing.py. Mudanca aditiva -- nenhum contrato, tier, identidade ou rota existente alterado; chamadas previas preservadas."
  - registro: registro-2026-09-25-pools-de-chaves-openrouter-multi-tier
    caminhos:
      - llm/budget.py
    parecer: >-
      "Adicao de provider 'ollama' (Ollama Cloud): novo modulo llm/ollama_cloud.py, OLLAMA_KEYS em budget.py, OllamaCloudStrategy em providers.py, branch em orchestrator.py e regra de inferencia em routing.py. Mudanca aditiva -- nenhum contrato, tier, identidade ou rota existente alterado; chamadas previas preservadas."
  - registro: registro-2026-09-29-saneamento-lint-e-calibracao
    caminhos:
      - llm/budget.py
    parecer: >-
      "Adicao de provider 'ollama' (Ollama Cloud): novo modulo llm/ollama_cloud.py, OLLAMA_KEYS em budget.py, OllamaCloudStrategy em providers.py, branch em orchestrator.py e regra de inferencia em routing.py. Mudanca aditiva -- nenhum contrato, tier, identidade ou rota existente alterado; chamadas previas preservadas."
  - registro: registro-2026-09-30-expurgo-de-modelos-obsoletos-e-reconciliacao-de-ancoras
    caminhos:
      - llm/orchestrator.py
      - llm/routing.py
    parecer: >-
      "Adicao de provider 'ollama' (Ollama Cloud): novo modulo llm/ollama_cloud.py, OLLAMA_KEYS em budget.py, OllamaCloudStrategy em providers.py, branch em orchestrator.py e regra de inferencia em routing.py. Mudanca aditiva -- nenhum contrato, tier, identidade ou rota existente alterado; chamadas previas preservadas."
  - registro: registro-2026-10-10-evolucao-malha-agentica-sota-v8-gold
    caminhos:
      - llm/orchestrator.py
      - llm/providers.py
      - llm/routing.py
    parecer: >-
      "Adicao de provider 'ollama' (Ollama Cloud): novo modulo llm/ollama_cloud.py, OLLAMA_KEYS em budget.py, OllamaCloudStrategy em providers.py, branch em orchestrator.py e regra de inferencia em routing.py. Mudanca aditiva -- nenhum contrato, tier, identidade ou rota existente alterado; chamadas previas preservadas."
  - registro: registro-2026-10-13-saneamento-diagnosticos-ide-e-compatibilidade
    caminhos:
      - llm/orchestrator.py
    parecer: >-
      "Adicao de provider 'ollama' (Ollama Cloud): novo modulo llm/ollama_cloud.py, OLLAMA_KEYS em budget.py, OllamaCloudStrategy em providers.py, branch em orchestrator.py e regra de inferencia em routing.py. Mudanca aditiva -- nenhum contrato, tier, identidade ou rota existente alterado; chamadas previas preservadas."
  - registro: registro-2026-10-20-harmonizacao-tier1-e-gemini-38
    caminhos:
      - llm/routing.py
    parecer: >-
      "Adicao de provider 'ollama' (Ollama Cloud): novo modulo llm/ollama_cloud.py, OLLAMA_KEYS em budget.py, OllamaCloudStrategy em providers.py, branch em orchestrator.py e regra de inferencia em routing.py. Mudanca aditiva -- nenhum contrato, tier, identidade ou rota existente alterado; chamadas previas preservadas."
  - registro: registro-2026-10-24-auditoria-geral-saneamento-e-reconciliacao
    caminhos:
      - llm/routing.py
    parecer: >-
      "Adicao de provider 'ollama' (Ollama Cloud): novo modulo llm/ollama_cloud.py, OLLAMA_KEYS em budget.py, OllamaCloudStrategy em providers.py, branch em orchestrator.py e regra de inferencia em routing.py. Mudanca aditiva -- nenhum contrato, tier, identidade ou rota existente alterado; chamadas previas preservadas."
  - registro: registro-2026-11-07-auditoria-integral-dependabot-github-e-code-scanning
    caminhos:
      - llm/budget.py
    parecer: >-
      "Adicao de provider 'ollama' (Ollama Cloud): novo modulo llm/ollama_cloud.py, OLLAMA_KEYS em budget.py, OllamaCloudStrategy em providers.py, branch em orchestrator.py e regra de inferencia em routing.py. Mudanca aditiva -- nenhum contrato, tier, identidade ou rota existente alterado; chamadas previas preservadas."
  - registro: registro-2026-11-07-auditoria-jules-cloud-saneamento-linters-e-pyproject
    caminhos:
      - llm/providers.py
    parecer: >-
      "Adicao de provider 'ollama' (Ollama Cloud): novo modulo llm/ollama_cloud.py, OLLAMA_KEYS em budget.py, OllamaCloudStrategy em providers.py, branch em orchestrator.py e regra de inferencia em routing.py. Mudanca aditiva -- nenhum contrato, tier, identidade ou rota existente alterado; chamadas previas preservadas."
verificado:
  - "ruff check + ruff format --check limpos nos 5 arquivos Python tocados"
  - "pytest focado: 109 passed (llm_layer_sota, routing_policy,
    openrouter_pools, task_routing, laya_s1_routing, free_router_concurrency) +
    91 passed apos correcao da ordem de inferencia"
  - "_infer_provider_for_model: glm-5.3-flash e ollama/* -> ollama; gpt-6 ->
    openai; z-ai/glm-5 -> openrouter; claude -> anthropic; qwen local -> local
    -- medido em interpretador real"
  - "strategy ollama registrada em _STRATEGIES_MAP;
    _check_provider_availability(ollama) consulta is_configured()"
  - "chamada real POST https://ollama.com/api/chat executada via
    call_ollama_cloud: autenticou e a API respondeu HTTP 402 (billing) --
    caminho, auth e parsing de erro confirmados de ponta a ponta"
  - 'OLLAMA_API_KEY gravada em HKCU\\Environment (User) e carregada por
    env_loader.load_env(); OLLAMA_KEYS=1; HF_TOKEN idem, validado HTTP 200 em
    huggingface.co/api/whoami-v2 (user RaphaVitoi)'
nao_verificado:
  - "resposta de inferencia real do glm-5.3-flash -- conta Ollama sem creditos
    de uso (402: usage credits auto reload payment failed); teste deve ser
    repetido apos Tier 0 adicionar creditos em ollama.com/settings"
  - "se a conta Ollama pertence ao mesmo billing das demais chaves fornecidas --
    ambas as chaves testadas retornaram o mesmo 402"
  - "escopo fine-grained do HF_TOKEN em repositorios gated especificos -- whoami
    OK; download de modelo gated nao exercitado"
---

# Provider Ollama Cloud na malha SOTA (2026-11-12)

## O que foi feito

Integracao do Ollama Cloud (`https://ollama.com/api`, modelos cloud como
`glm-5.3-flash`) como provider de primeira classe, ao lado dos existentes —
nenhuma rota previa alterada:

- `llm/ollama_cloud.py` (novo): `call_ollama_cloud()` com a mesma assinatura de
  `call_openrouter` — POST `/api/chat`, `stream:false`, Bearer, semaphore SOTA,
  timeout, usage normalizado (`prompt_eval_count`/`eval_count` ->
  `prompt_tokens`/`completion_tokens`), `require_json` via `format:"json"`,
  corpo de erro lido antes do raise (corrige leitura de `response.text()`
  pos-raise_for_status que podia travar).
- `llm/budget.py`: `OLLAMA_KEYS` por nomes exatos (`OLLAMA_API_KEY`,
  `OLLAMA_CLOUD_KEY`) — `OLLAMA_AGENT_*` e credencial de outro produto e fica
  fora do pool de proposito.
- `llm/providers.py`: `OllamaCloudStrategy` registrada em `_STRATEGIES_MAP`
  (`"ollama"`) + `_check_provider_availability` dedicado.
- `llm/orchestrator.py`: branch `provider=="ollama"` -> `OLLAMA_KEYS`, herdando
  rotacao de chaves, circuit breaker e telemetria.
- `llm/routing.py`: `_infer_provider_for_model` — `ollama/*` e `glm-5.3-flash`
  -> `ollama`. **Correcao aplicada em revisao:** a regra foi movida para antes
  do match de `gpt`/`openai`, pois `ollama/gpt-oss` resolvia `openai` pelo
  substring.

## Credenciais (sem valores em codigo)

- `OLLAMA_API_KEY` -> `HKCU\Environment` (User), carregada por
  `utils/env_loader.load_env()`; tambem `OLLAMA_API_KEY=` em `.env.example`
  (arquivo local, gitignored).
- `HF_TOKEN` (fine-grained) -> `HKCU\Environment` (User); `huggingface_hub`
  (sentence-transformers, transformers/timesfm) passa a autenticar downloads
  automaticamente. Validado: whoami-v2 HTTP 200.
- Chave "Ollama Agent" fornecida junto NAO foi gravada — nao e a credencial do
  `/api/chat`.

## Estado de verificacao

O caminho completo foi exercido ate a API: POST real autenticado, resposta
definitiva **HTTP 402** ("usage credits auto reload payment failed") nas duas
chaves — conta sem creditos. Integracao pronta; inferencia real pendente de
billing do Tier 0.
