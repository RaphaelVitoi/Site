---
id: registro-2026-11-17-fase-3-backend-estrutural-sota
tipo: registro
escopo: "Site -- Fase 3 da auditoria SOTA: backend estrutural (argv sem shell nos catalogos, estado global limitado, decomposicao de handlers, poda de dependencias para extras, revisao de compose e credenciais)"
ecossistema: nexus-sota
autor: "Devin (SWE-2 Flash) <158243242+devin-ai-integration[bot]@users.noreply.github.com>"
criado_em: "2026-11-17T18:30:00-03:00"
atualizado_em: "2026-11-17T18:30:00-03:00"
commit: HEAD
classes:
  - interno
  - medido
  - seguranca
  - governanca
  - registro
  - dependencias
  - backend
caminhos:
  - agents/prompts.py
  - api/v1/handler_support.py
  - api/v1/handlers.py
  - api/v1/handlers_files.py
  - api/v1/handlers_game_theory.py
  - api/v1/middleware.py
  - core/config.py
  - docker-compose.yml
  - engine/llm_api.py
  - llm/budget.py
  - pyproject.toml
  - requirements.txt
  - scripts/cli/nexus.py
  - tests/test_backend_hardening.py
  - tests/test_cli_nexus.py
  - tests/test_estado_global_limitado_fase3.py
  - uv.lock
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  condutor: Devin (SWE-2 Flash)
  veiculo: devin-desktop
  tier: 1
  supervisao: assistida
  data_das_medicoes: 2026-11-17
verificado:
  - "nexus.py: shell=True eliminado nos 2 call sites de catalogo; _comando_para_argv fail-closed (prefixos python/pwsh/node), shlex.split posix; 4 testes novos em test_cli_nexus.py (52 passed no arquivo)"
  - "Divida registrada quitada: registro-2026-08-29-shell-true-nos-catalogos declarava a conversao argv como correcao devida; noqa/Record-Id removidos junto com o shell"
  - "Estado global limitado: USUARIOS_DE_SESSAO (teto 4096 FIFO via cache_put_bounded), SYSTEM_PROMPT_CACHE (teto 64), KEY/GEMINI_MODEL_KEY/ROUTE_BLOCKLIST (purga de expirados + FIFO teto 1024), _TELEMETRY_LOCKS (tupla loop+lock com poda de loops fechados, padrao AsyncTokenBucket._lock_for_loop), KEY_BLOCKLIST sincrono de core/config.py (mesmo bound)"
  - "6 testes de regressao novos em tests/test_estado_global_limitado_fase3.py; 24 passed com test_identidade_de_usuario_2026_09_30.py"
  - "engine/llm_api.py: fallback API_SECRET_TOKEN/VITOI_AUTH_TOKEN documentado como contrato intencional do proxy Gemma :17043 (gemma_server.py valida X-Vitoi-Auth com hmac.compare_digest, bind 127.0.0.1, fail-closed); call_gemini segue exigindo api_key real -- credencial de servico nunca vira chave de provider cloud"
  - "handlers.py decomposto: handlers_game_theory.py (4 handlers PMev, 12/12 testes) e handlers_files.py (list/view + guards de traversal + parsing, 12/12 testes de servico de arquivo); INVALID_JSON_BODY e BASE_WORKSPACE_DIR promovidos a handler_support.py; re-exports 'as' preservam imports existentes; handlers.py 1963 -> 1323 linhas"
  - "pyproject.toml: 10 dependencias com ZERO imports Python medidos movidas para extras computer-use (opencv-headless, pyautogui, mss, playwright), analytics (duckdb, pyspark, scipy, matplotlib, seaborn) e embeddings (sentence-transformers); extra 'all' atualizado; requirements.txt espelhado; uv.lock regenerado (269 pacotes); test_requirements_sync 4/4"
  - "fastapi/uvicorn MANTIDOS no default: consumidos por engine/gemma_server.py (proxy :17043) e scripts de homologacao -- a suspeita 'fastapi morto vs aiohttp' nao se confirmou"
  - "Vector stores: chromadb (backend primario MemoryRAG, obrigatorio) e lancedb (backend secundario com fallback gracioso) sao arquiteturalmente distintos, nao duplicacao acidental; onnxruntime e dependencia real do ONNXMiniLM_L6_V2 do chromadb; nenhum removido"
  - "docker-compose.yml revisado: mounts ./.claude, ./queue e ./tasks.db sao funcionalmente necessarios (medido por varredura de paths); secrets ja usam docker secrets no frontend; comentario de justificativa adicionado"
  - "queue_manager.py (1235 ln) e memory_rag.py (1485 ln) avaliados e DEFERIDOS: modulos coesos de responsabilidade unica; decomposicao segura exige testes de caracterizacao previos -- registrado como divida consciente, nao esquecimento"
  - "ruff check verde em todos os arquivos tocados; pyright --project pyproject.toml executado"
nao_verificado:
  - "Imagem Docker final nao reconstruida nesta fase; a poda reflete no proximo build (uv sync --frozen instala so deps default)"
  - "Skills de computer-use que dependem dos extras nao exercitadas -- necessitam 'uv sync --extra computer-use'"
  - "Fases 4-5 do plano de auditoria seguem planejadas, nao executadas"
referencias_nao_resolviveis: []
revisoes_de_ancora:
  - registro: auditoria-2026-09-12-o-ci-vermelho-que-nenhum-portao-local-media
    caminhos:
      - tests/test_backend_hardening.py
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: auditoria-2026-10-08-integralidade-backend
    caminhos:
      - api/v1/handlers.py
      - engine/llm_api.py
      - pyproject.toml
      - requirements.txt
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: handoff-2026-09-19-documentos-loopback-sonar-e-download
    caminhos:
      - api/v1/handlers.py
      - api/v1/middleware.py
      - tests/test_backend_hardening.py
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: handoff-2026-09-22-integracao-system1-llm-dashboard
    caminhos:
      - api/v1/handlers.py
      - engine/llm_api.py
      - tests/test_backend_hardening.py
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: handoff-2026-09-30-expurgo-de-modelos-obsoletos-harmonizacao-qwen-e-calibracao
    caminhos:
      - core/config.py
      - engine/llm_api.py
      - scripts/cli/nexus.py
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: handoff-2026-10-05-fechamento-do-ciclo-medicoes-cwv-e-cacheabilidade
    caminhos:
      - engine/llm_api.py
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: handoff-2026-10-08-auditoria-e-remediacao-backend
    caminhos:
      - api/v1/handlers.py
      - engine/llm_api.py
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: handoff-2026-10-24-remediacao-dependabot-e-integridade-sota
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: handoff-2026-11-15-translategemma-timesfm-laya-roi
    caminhos:
      - api/v1/handlers.py
      - pyproject.toml
      - scripts/cli/nexus.py
      - uv.lock
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-09-01-fronteira-http-e-portao-independente-de-perfil
    caminhos:
      - api/v1/handlers.py
      - api/v1/middleware.py
      - tests/test_backend_hardening.py
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-09-01-identidade-de-agente-na-arvore-canonica
    caminhos:
      - agents/prompts.py
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-09-01-merge-da-fusao-e-autonomia-de-portao
    caminhos:
      - agents/prompts.py
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-09-02-adapters-ligado-ao-caminho-real-anthropic
    caminhos:
      - engine/llm_api.py
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-09-05-saneamento-nexus-ollama-e-auto-diagnostico
    caminhos:
      - scripts/cli/nexus.py
      - tests/test_cli_nexus.py
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-09-07-procedencia-do-timesfm-e-json-do-cli
    caminhos:
      - api/v1/handlers.py
      - scripts/cli/nexus.py
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-09-08-auditoria-de-tipagem-e-recorte-do-fingerprint
    caminhos:
      - api/v1/handlers.py
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-09-08-ruff-format-e-o-ci-vermelho
    caminhos:
      - scripts/cli/nexus.py
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-09-09-appkey-lida-por-string-e-a-fronteira-de-autoridade
    caminhos:
      - api/v1/handlers.py
      - api/v1/middleware.py
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-09-14-harmonizacao-canonicos-astra-luna-gemini-anthropic
    caminhos:
      - scripts/cli/nexus.py
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-09-18-dashboard-notificacoes-e-recomendacoes-acionaveis
    caminhos:
      - scripts/cli/nexus.py
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-09-18-dream-rsi-ligado-aula12-localizada-e-bounty-a-iniciar
    caminhos:
      - api/v1/handlers.py
      - scripts/cli/nexus.py
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-09-18-saneamento-geral-de-linters-e-gate-remocao-citada
    caminhos:
      - api/v1/handlers.py
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-09-18-saneamento-token-budget-e-harmonizacao-timesfm30
    caminhos:
      - scripts/cli/nexus.py
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-09-19-loopback-e-visualizador-pdf-chrome
    caminhos:
      - api/v1/handlers.py
      - api/v1/middleware.py
      - tests/test_backend_hardening.py
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-09-19-universal-document-viewer-e-seguranca-csp-pdf
    caminhos:
      - api/v1/handlers.py
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-09-24-correcao-markup-rich-e-wrappers-cli
    caminhos:
      - scripts/cli/nexus.py
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-09-24-refino-vram-atalhos-ceo-dashboard
    caminhos:
      - scripts/cli/nexus.py
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-09-24-retificacao-hardware-gpu-amd-vulkan
    caminhos:
      - scripts/cli/nexus.py
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-09-25-integracao-qwen-coder-e-blindagem-testes
    caminhos:
      - llm/budget.py
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-09-25-pools-de-chaves-openrouter-multi-tier
    caminhos:
      - llm/budget.py
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-09-29-saneamento-lint-e-calibracao
    caminhos:
      - llm/budget.py
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-09-30-expurgo-de-modelos-obsoletos-e-reconciliacao-de-ancoras
    caminhos:
      - core/config.py
      - engine/llm_api.py
      - scripts/cli/nexus.py
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-10-01-integracao-cloud-ollama-hermes-nous-e-chaves-registro
    caminhos:
      - engine/llm_api.py
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-10-01-resiliencia-servidores-locais-e-triagem
    caminhos:
      - engine/llm_api.py
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-10-04-http-metrics-correlation-e-worker-shutdown
    caminhos:
      - api/v1/handler_support.py
      - api/v1/handlers.py
      - api/v1/middleware.py
      - engine/llm_api.py
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-10-04-remediacao-dependabot-pypdf
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-10-04-remediacao-dependabot-sentence-transformers-e-urllib3
    caminhos:
      - uv.lock
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-10-05-resolucao-de-modelo-ollama-e-schema-json
    caminhos:
      - engine/llm_api.py
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-10-06-strata-moe-125b-e-dashboard-nexus
    caminhos:
      - engine/llm_api.py
      - scripts/cli/nexus.py
      - tests/test_cli_nexus.py
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-10-08-auditoria-e-remediacao-backend
    caminhos:
      - api/v1/handlers.py
      - engine/llm_api.py
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-10-10-evolucao-malha-agentica-sota-v8-gold
    caminhos:
      - agents/prompts.py
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-10-13-conclusao-4-trilhas-calibracao-rust-warmup-strata
    caminhos:
      - api/v1/middleware.py
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-10-13-remediacao-dependabot-e-offload-strata
    caminhos:
      - uv.lock
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-10-13-saneamento-diagnosticos-ide-e-compatibilidade
    caminhos:
      - api/v1/middleware.py
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-10-14-saneamento-tipagem-config-ide-e-dependencias
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-10-18-remediacao-dependabot-e-renovacao-axe
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-10-18-resolucao-sonarqube-e-saneamento-global
    caminhos:
      - agents/prompts.py
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-10-19-resolucao-sonarqube-nexus-mesh-e-logger
    caminhos:
      - tests/test_cli_nexus.py
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-10-19-saneamento-sonarqube-timesfm-e-a11y
    caminhos:
      - api/v1/handlers.py
      - scripts/cli/nexus.py
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-10-19-verificacao-neural-timesfm-e-evolucao-ecossistema
    caminhos:
      - api/v1/handlers.py
      - scripts/cli/nexus.py
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-10-20-saneamento-quality-gate-ascii-e-reconciliacao-de-ancoras
    caminhos:
      - scripts/cli/nexus.py
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-10-24-remediacao-integral-74-vulnerabilidades-dependabot
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-10-26-unificacao-ssot-dependencias-e-pwsh-sota
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-10-27-elevacao-dependencias-python-openai-pyspark-pytest
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-10-27-evolucao-project-context-e-reconciliacao-sota
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-10-27-remediacao-dependabot-submodulo-e-integracao-sota
    caminhos:
      - engine/llm_api.py
      - uv.lock
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-10-28-atualizacao-laya-e-estabilizacao-playwright-smoke
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-10-28-saneamento-reconciliacao-e-elevacao-dependencias-triade-montecarlo
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-10-31-estabilizacao-lifecycle-warmup-turbopack
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-11-01-integracao-ai-mesh-sdk-e-otimizacao-jules
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-11-03-elevacao-dependencias-pyarrow-openai-anthropic-laya
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-11-03-otimizacao-agentes-watchdog-e-calibracao
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-11-03-remediacao-dependabot-pypdf-pyasn1-minimatch
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-11-04-otimizacao-layout-header-e-elevacao-dependencias
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-11-05-saneamento-customizations-e-elevacao-dependencias
    caminhos:
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-11-06-reparo-manifestos-e-declaracao-chrysalis
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-11-07-auditoria-jules-cloud-saneamento-linters-e-pyproject
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-11-07-elevacao-dependencias-fastapi-regex-types-aiofiles
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-11-08-elevacao-dependencias-regex-e-laya
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-11-08-saneamento-pure-ascii-timesfm-e-handlers
    caminhos:
      - api/v1/handlers.py
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-11-09-automacao-modelos-locais-ollama-e-subagentes
    caminhos:
      - scripts/cli/nexus.py
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-11-09-elevacao-dependencias-e-fork-eigen
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-11-10-bump-deps-e-extra-paths-pylance
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-11-10-google-genai-3-1-0
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-11-11-elevacao-fastapi-playwright-e-bump-deep-research
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-11-11-elevacao-pypdf-turbo-ai-sdk-google
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-11-11-elevacao-sentence-transformers-genai-prettier-exa-mcp
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-11-11-elevacao-typer-types-knip-harmonizacao
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-11-11-nota-pareamento-dev-dependency-groups
    caminhos:
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-11-12-ollama-cloud-provider
    caminhos:
      - llm/budget.py
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-11-12-review-sweeps-endurecimento-sota
    caminhos:
      - llm/budget.py
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-11-13-elevacao-deps-e-saneamento-configs-ide
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-11-13-revisao-ancora-pyproject-extra-path-cockpit
    caminhos:
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-11-14-deps-refatoracoes-sonar-e-submodulos
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-11-14-laya-pylint-e-refactors-sonar
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-11-14-llama-cpp-b12387-router-9931
    caminhos:
      - scripts/cli/nexus.py
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-11-14-roteamento-pools-transporte-e-validacao-hrc
    caminhos:
      - engine/llm_api.py
      - llm/budget.py
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-11-14-sync-uvlock-ollama-cloud-circuit-e-ci
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-11-16-elevacao-deps-anthropic-laya-accelerate-e-deps-sync
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-11-17-elevacao-deps-google-genai-openai
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-11-17-fases-0-1-portoes-verificacao-e-higiene-doc-real
    caminhos:
      - pyproject.toml
      - requirements.txt
    parecer: "Revisado em 2026-11-17. Fase 3 da auditoria SOTA do backend: shell=True substituido por execucao argv nos dois catalogos do nexus.py (divida do registro-2026-08-29-shell-true-nos-catalogos quitada), bound/TTL aplicado ao estado global mutavel (USUARIOS_DE_SESSAO, SYSTEM_PROMPT_CACHE, blocklists de telemetria em llm/budget.py e core/config.py, poda de loops mortos em _TELEMETRY_LOCKS), fallback de credencial do proxy Gemma :17043 documentado como contrato intencional, handlers.py decomposto em handlers_game_theory.py e handlers_files.py com re-exports de compatibilidade, dependencias sem nenhum import Python movidas para extras (computer-use/analytics/embeddings) com requirements.txt e uv.lock ressincronizados, e compose.yml revisado sem alteracao de mounts (necessidade medida). As mudancas nao alteram os contratos que este documento atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
---

# Fase 3 — Backend estrutural (auditoria SOTA)

Quarta fase do plano aprovado em 2026-11-17. Escopo: fechar os pontos de
atencao de backend levantados na auditoria -- execucao shell em catalogos,
estado global sem bound, fallback de credencial, god files, poda de
dependencias e higiene de compose.

## Decisoes e evidencias

### F3.1 -- shell=True eliminado (divida quitada)

Os dois call sites de catalogo (`_executar_categoria_scripts` e
`_executar_bloco_operacoes`) executavam strings de JSON versionado com
`shell=True`. O registro-2026-08-29-shell-true-nos-catalogos ja declarava a
conversao argv como correcao devida -- esta fase a executa. `_comando_para_argv`
resolve os prefixos python/pwsh/node para binarios absolutos (mesma politica do
resolver anterior), faz `shlex.split(posix=True)` -- convencao ja usada em
`agents/autonomy.py` -- e devolve `None` (fail-closed) para qualquer comando
fora do formato: um comando novo no catalogo nao escapa para shell por
omissao. Os catalogos consumidos (`SCRIPTS_CATALOG.json` e
`SYSTEM_OPERATIONS_MANIFEST.json`) contem apenas comandos argv simples; os
comandos com `$ProjectRoot`/`$(Get-Date)` pertencem a
`scripts/maintenance/skillmaster_config.json`, consumidor distinto, fora de
escopo.

### F3.2 -- estado global com bound

| Mapa | Antes | Depois |
|---|---|---|
| `USUARIOS_DE_SESSAO` | crescimento eterno por cliente_id | teto 4096, FIFO via `cache_put_bounded` |
| `SYSTEM_PROMPT_CACHE` | um prompt compilado por agent_name novo, eterno | teto 64, FIFO no caminho de escrita |
| `KEY/GEMINI_MODEL_KEY/ROUTE_BLOCKLIST` | expirados so saiam se reconsultados | purga de expirados + FIFO teto 1024 sob o telemetry lock |
| `_TELEMETRY_LOCKS` | uma entrada eterna por `asyncio.run` (lock sem dono) | tupla `(loop, lock)` com poda de loops fechados -- mesmo desenho de `AsyncTokenBucket._lock_for_loop` |
| `core/config.KEY_BLOCKLIST` (sync, engine/llm_api) | sem bound | mesmo teto/purga do irmao async |

`cache_put_bounded` em `llm/budget.py` centraliza a politica FIFO para os
proximos mapas. Os dois circuit-breakers (sync em `core/config.py`, async em
`llm/budget.py`) atendem subsistemas distintos (`engine/llm_api.py` vs
`llm/providers.py`); convergir as assinaturas ficou fora do escopo -- o bound,
que era o defeito medido, foi aplicado nos dois.

### F3.3 -- credencial do proxy Gemma: contrato, nao defeito

`engine/llm_api.py` usava `API_SECRET_TOKEN`/`VITOI_AUTH_TOKEN` como bearer do
proxy local `:17043`. Verificacao: `engine/gemma_server.py` valida
`X-Vitoi-Auth` contra `API_SECRET_TOKEN` com `hmac.compare_digest`, bind em
127.0.0.1, fail-closed (503 sem token). O uso e o contrato desenhado do proxy
loopback -- nao e fallback de credencial de servico para provider cloud.
`call_gemini` ja endurecido exige `api_key` real do Gemini. Nenhuma mudanca de
comportamento; comentario de contrato adicionado no call site.

### F3.4 -- decomposicao de handlers.py

Duas extracoes coesas, ambas com re-exports `as` (convencao do arquivo) para
preservar `server.py` e testes:

- `handlers_game_theory.py` (282 ln): pluribus/deepstack/rebel-pbs/claudico --
  12/12 testes.
- `handlers_files.py` (427 ln): listagem, visualizacao/download, parsing por
  tipo e toda a familia de guards de traversal (`_is_sensitive_path`,
  `_is_file_access_allowed`) -- 12/12 testes de servico de arquivo.

`INVALID_JSON_BODY` e `BASE_WORKSPACE_DIR` subiram para `handler_support.py`
(lar neutro, sem ciclo). `BASE_WORKSPACE_DIR` passou a ser resolvido via modulo
em tempo de chamada para que monkeypatch de teste continue efetivo -- o alvo
do patch em `test_backend_hardening.py` foi atualizado para o lar canonico.

`queue_manager.py` (1235 ln) e `memory_rag.py` (1485 ln) foram avaliados e
**deferidos conscientemente**: sao modulos coesos de responsabilidade unica
(fila SQLite / RAG multi-backend). Uma decomposicao segura exige antes testes
de caracterizacao -- divida registrada, nao esquecida.

### F3.5 -- poda de dependencias

Varredura de imports Python em todo o repositorio (excluindo `.venv`,
`node_modules`, locks e docs): 10 dependencias default tinham **zero** imports.
Foram movidas para extras novos, sem nenhuma remocao do ecossistema:

- `computer-use`: opencv-python-headless, pyautogui, mss, playwright
  (vivem para as skills de computer-use sobre o venv)
- `analytics`: duckdb, pyspark, scipy, matplotlib, seaborn
- `embeddings`: sentence-transformers (RAG vigente usa ONNXMiniLM + Ollama)

`all` cobre os novos extras; `requirements.txt` espelha so o default (guarda
`test_requirements_sync` verde); `uv.lock` regenerado. O Dockerfile
(`uv sync --frozen --no-dev`) passa a produzir imagem menor no proximo build.

**Mantidos por evidencia, nao por inercia:** fastapi/uvicorn (gemma_server
:17043 + homologacao laya), onnxruntime (ONNXMiniLM do chromadb), lancedb
(backend secundario do RAG com fallback), torch/timesfm/sklearn/numba/pandas
(imports lazy reais em engine/api/tools).

### F3.6 -- compose revisado sem alteracao

`.claude` inteiro e necessario (agent-memory do RAG, agents/, GOVERNANCA/,
secrets/auth_secret.txt -- medido por varredura de paths); `./queue` e
`./tasks.db` sao locais reais do queue_manager/task_executor; secrets do
frontend ja usam docker `secrets:`. Comentario de justificativa adicionado ao
mount para a proxima auditoria.
