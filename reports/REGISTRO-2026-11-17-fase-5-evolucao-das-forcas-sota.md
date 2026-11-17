---
id: registro-2026-11-17-fase-5-evolucao-das-forcas-sota
tipo: registro
escopo: "Site -- Fase 5 (ultima) da auditoria SOTA: evolucao das forcas (coverage gate real com superficie expandida e fail_under medido, benchmark de claims executado, contrato do.ps1->task_executor->dispatch tornado executavel com drift real corrigido, caracterizacao de queue_manager/memory_rag medida)"
ecossistema: nexus-sota
autor: "Devin (SWE-2 Flash) <158243242+devin-ai-integration[bot]@users.noreply.github.com>"
criado_em: "2026-11-17T23:30:00-03:00"
atualizado_em: "2026-11-17T23:30:00-03:00"
commit: HEAD
classes:
  - interno
  - medido
  - seguranca
  - governanca
  - registro
  - documentacao
caminhos:
  - pyproject.toml
  - scripts/ops/suite_verde.py
  - .github/workflows/sota-ci.yml
  - cloudbuild.backend.yaml
  - package.json
  - README.md
  - do.ps1
  - task_executor.py
  - cli/commands.py
  - tests/test_task_dispatch_contract.py
  - tests/test_lancedb_chroma_dual_rag.py
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  condutor: Devin (SWE-2 Flash)
  veiculo: devin-desktop
  tier: 1
  supervisao: assistida
  data_das_medicoes: 2026-11-17
verificado:
  - "Cobertura medida ANTES de declarar: suite integral (2304 testes, 6 workers xdist) com --cov --cov-report=term|html. Superficie antiga (8 pacotes): TOTAL 70%. Superficie expandida para o caminho de runtime completo (+cli, conductor, memory, monitoring, mcp-bridge, main, memory_rag, task_executor, predictive_forest): TOTAL 64,50% (25.154 stmts, 7.128 branches) -- subestimado porque 276 testes de infra/git abortaram com FileNotFoundError por edicoes concorrentes na mesma arvore durante a medicao; a medicao limpa do portao tende a ser maior"
  - "Fail_under=60 fixado em [tool.coverage.report] -- piso ~4,5 pts abaixo do medido (64,50%) para nao reprovar ruido de plataforma; ratchet, nao meta. Verificado empiricamente: pytest --cov reprova 'Coverage failure: total of X is less than fail-under=60' sem flag extra"
  - "Surface antes cega corrigida: memory_rag.py (raiz), task_executor.py, cli/commands.py, main.py, predictive_forest.py e os pacotes cli/conductor/memory/monitoring/mcp-bridge NAO estavam em [tool.coverage.run] source -- zero medicao apesar de serem caminho de runtime. cli/commands.py media 0% (734 stmts), memory_rag.py 44%, task_executor.py 31%, predictive_forest.py 15%"
  - "Portao passa a medir: suite_verde.py agora invoca pytest --cov; o custo so e pago quando a arvore de conteudo muda (marcador ensure ja pulava a suite em arvore verde). CI (sota-ci.yml) alinhado de '--cov=engine --cov-fail-under=10' (piso simbolico) para 'pytest --cov' herdando source+fail_under do pyproject; cloudbuild.backend.yaml (gate de deploy) idem; package.json python:coverage idem; README.md atualizado (alegava o piso antigo)"
  - "DRIFT REAL CORRIGIDO: do.ps1:845 invocava 'task_executor.py apply-god-mode' -- comando inexistente nas 3 camadas de dispatch (_LOCAL_HANDLERS, nexus typer, _COMMAND_HANDLERS de cli/commands.py); o fluxo -Ingest caia no exit 2 'Comando desconhecido'. Trocado para 'ingest' (handler real _cli_ingest -> apply_god_mode, com guard de path traversal; do.ps1 ja deleta o dropzone manualmente). Confirmado por git log -S que o nome existiu e sumiu na reorganizacao do CLI"
  - "DRIFT REAL CORRIGIDO: _nexus_cmds em task_executor.py tinha 18 nomes planos da CLI anterior ao typer -- apenas 3 resolviam como comando top-level do nexus v8 (dashboard, status, autonomy). 15 eram zumbis rejeitados com 'No such command': sanitize e watch existem como 'ops sanitize'/'ops watch', start-worker como 'ops worker'; os outros 12 (stop-worker, optimize-ide, purge-ext, scan, audit-routing, audit-api, monitor, test-breaker, visualize-map, purge-rag, ingest-rag, refactor) nao tem equivalente em nenhuma camada -- removidos. Validado end-to-end: 'task_executor.py sanitize --help' agora imprime a ajuda real de 'nexus ops sanitize'"
  - "Contrato tornado executavel: tests/test_task_dispatch_contract.py (5 testes) extrai todo 'task_executor.py <cmd>' do do.ps1 (formas direta e via $ExecutorScript) e asserta resolucao nas 3 camadas; cruza _NEXUS_CMDS/_NEXUS_LEGACY_MAP com a arvore typer real (registered_commands/registered_groups, resolvendo DefaultPlaceholder via typer_instance.info.name); impede a volta de alias zumbi. Para isso, _LOCAL_HANDLERS/_NEXUS_* subiram para o nivel do modulo em task_executor.py e o dict de handlers de cli/commands.py virou _COMMAND_HANDLERS module-level"
  - "Caracterizacao medida: database/queue_manager.py 82% (568 stmts) -- modulo coeso e bem coberto (ACID, concorrencia WAL, recover/promote, bayesian health); decomposicao NAO justificada pela segunda medicao consecutiva. memory_rag.py 44% -- superficie de decisao (routing auto/chroma/lance/hybrid_federated, failover bidirecional, sync_lance_to_chroma, storage_health) ja caracterizada; adicionados 2 testes de orquestracao de ingest_all_memories (noop sem manifesto; uniao de ids -> purge). O massa nao coberta (~450 stmts) sao internals dos backends Chroma/Lance e caminhos que exigem servico vivo -- decomposicao deferida com rationale medido, nao forcada"
  - "Benchmark executado (scripts/benchmark_sota_suite.py --amostras 3, modo inventario): Veredito OK em 5,3s -- ICM Malmuth-Harville ~15,9k ops/s, Perspectiva Vitoi v7 ~220k ops/s, geometric sizing ~2,45M ops/s, WASM Monte Carlo ~3,3-4,3M/s, llama.cpp 24 executaveis inventariados, Ollama 22 modelos locais. Claim de throughput Spark 54,7k regs/s no README ja estava honestamente etiquetado como medicao historica de checkpoint externo -- nenhuma divergencia encontrada nos claims vivos"
nao_verificado:
  - "Primeira execucao de suite_verde com --cov: a arvore de conteudo mudou nesta fase, entao o portao local medira cobertura limpa no commit -- se o Linux do CI/Cloud Build medir abaixo de 60 por delta de plataforma, o piso precisa ser recalibrado com o numero medido la (nao ha como medir Linux nesta maquina)"
  - "Timeout do job python-test-and-lint no GitHub Actions (10min, serial): o tracing de cobertura ja era pago antes (--cov=engine); ampliar a fonte nao muda o custo de tracing, mas a suite serial + relatorio maior pode aproximar o teto -- observar a primeira execucao"
  - "memory/notepad_memory.py e memory/replay_buffer.py medem 0% (227 stmts) e mcp-bridge/server.py 38% -- lacunas reais registradas para fases futuras de cobertura, nao bloqueantes para o piso"
referencias_nao_resolviveis: []
revisoes_de_ancora:
  - registro: auditoria-2026-09-01-formatacao-ruff-e-ancoras
    caminhos:
      - .github/workflows/sota-ci.yml
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: o passo pytest do job python-test-and-lint passou de '--cov=engine --cov-fail-under=10' (piso simbolico sobre um octavo da superficie) para 'pytest --cov', herdando a superficie e o fail_under=60 declarados no pyproject. O job, matrix, timeouts e demais steps nao mudaram. Os contratos que este documento atestou nos caminhos ancorados permanecem validos — a intencao do portao (suite verde) foi preservada e a medicao foi ampliada."
  - registro: auditoria-2026-09-12-o-ci-vermelho-que-nenhum-portao-local-media
    caminhos:
      - .github/workflows/sota-ci.yml
      - scripts/ops/suite_verde.py
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: o passo pytest do job python-test-and-lint passou de '--cov=engine --cov-fail-under=10' (piso simbolico sobre um octavo da superficie) para 'pytest --cov', herdando a superficie e o fail_under=60 declarados no pyproject. O job, matrix, timeouts e demais steps nao mudaram. Os contratos que este documento atestou nos caminhos ancorados permanecem validos — a intencao do portao (suite verde) foi preservada e a medicao foi ampliada. Revisado em 2026-11-17. Fase 5 da auditoria SOTA: rodar_suite passou a invocar 'pytest -q --cov', fazendo o portao medir a superficie declarada no pyproject e reprovar abaixo de fail_under=60. O mecanismo de marcador por arvore de conteudo, o paralelismo xdist e o --dist loadfile foram preservados -- a suite so e remediada quando o conteudo muda. Os contratos que este documento atestou nos caminhos ancorados permanecem validos."
  - registro: auditoria-2026-10-08-integralidade-backend
    caminhos:
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: [tool.coverage.run].source foi expandido de 8 para 17 entradas (todo o caminho de runtime de producao, incl. cli, conductor, memory, monitoring, mcp-bridge e os entrypoints da raiz) e fail_under=60 foi declarado em [tool.coverage.report] com base em medicao real (64,50% medido, piso com margem). Nenhuma dependencia, versao, extra ou configuracao de build foi alterada -- as mudancas sao exclusivamente de medicao de cobertura. Os contratos que este documento atestou nos caminhos ancorados permanecem validos."
  - registro: handoff-2026-09-09-ci-verde-e-as-seis-causas
    caminhos:
      - .github/workflows/sota-ci.yml
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: o passo pytest do job python-test-and-lint passou de '--cov=engine --cov-fail-under=10' (piso simbolico sobre um octavo da superficie) para 'pytest --cov', herdando a superficie e o fail_under=60 declarados no pyproject. O job, matrix, timeouts e demais steps nao mudaram. Os contratos que este documento atestou nos caminhos ancorados permanecem validos — a intencao do portao (suite verde) foi preservada e a medicao foi ampliada."
  - registro: handoff-2026-09-23-ci-ram-e-rustfmt-staged
    caminhos:
      - scripts/ops/suite_verde.py
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: rodar_suite passou a invocar 'pytest -q --cov', fazendo o portao medir a superficie declarada no pyproject e reprovar abaixo de fail_under=60. O mecanismo de marcador por arvore de conteudo, o paralelismo xdist e o --dist loadfile foram preservados -- a suite so e remediada quando o conteudo muda. Os contratos que este documento atestou nos caminhos ancorados permanecem validos."
  - registro: handoff-2026-09-23-nucleo-mcp-curadoria-codex
    caminhos:
      - scripts/ops/suite_verde.py
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: rodar_suite passou a invocar 'pytest -q --cov', fazendo o portao medir a superficie declarada no pyproject e reprovar abaixo de fail_under=60. O mecanismo de marcador por arvore de conteudo, o paralelismo xdist e o --dist loadfile foram preservados -- a suite so e remediada quando o conteudo muda. Os contratos que este documento atestou nos caminhos ancorados permanecem validos."
  - registro: handoff-2026-10-05-fechamento-do-ciclo-medicoes-cwv-e-cacheabilidade
    caminhos:
      - scripts/ops/suite_verde.py
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: rodar_suite passou a invocar 'pytest -q --cov', fazendo o portao medir a superficie declarada no pyproject e reprovar abaixo de fail_under=60. O mecanismo de marcador por arvore de conteudo, o paralelismo xdist e o --dist loadfile foram preservados -- a suite so e remediada quando o conteudo muda. Os contratos que este documento atestou nos caminhos ancorados permanecem validos."
  - registro: handoff-2026-10-08-auditoria-e-remediacao-backend
    caminhos:
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: [tool.coverage.run].source foi expandido de 8 para 17 entradas (todo o caminho de runtime de producao, incl. cli, conductor, memory, monitoring, mcp-bridge e os entrypoints da raiz) e fail_under=60 foi declarado em [tool.coverage.report] com base em medicao real (64,50% medido, piso com margem). Nenhuma dependencia, versao, extra ou configuracao de build foi alterada -- as mudancas sao exclusivamente de medicao de cobertura. Os contratos que este documento atestou nos caminhos ancorados permanecem validos."
  - registro: handoff-2026-10-24-remediacao-dependabot-e-integridade-sota
    caminhos:
      - package.json
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: apenas o script python:coverage mudou (--cov=engine -> --cov, alinhado a superficie completa do pyproject). Nenhuma dependencia npm, versao ou script de build foi alterado. Os contratos que este documento atestou nos caminhos ancorados permanecem validos. Revisado em 2026-11-17. Fase 5 da auditoria SOTA: [tool.coverage.run].source foi expandido de 8 para 17 entradas (todo o caminho de runtime de producao, incl. cli, conductor, memory, monitoring, mcp-bridge e os entrypoints da raiz) e fail_under=60 foi declarado em [tool.coverage.report] com base em medicao real (64,50% medido, piso com margem). Nenhuma dependencia, versao, extra ou configuracao de build foi alterada -- as mudancas sao exclusivamente de medicao de cobertura. Os contratos que este documento atestou nos caminhos ancorados permanecem validos."
  - registro: handoff-2026-11-15-translategemma-timesfm-laya-roi
    caminhos:
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: [tool.coverage.run].source foi expandido de 8 para 17 entradas (todo o caminho de runtime de producao, incl. cli, conductor, memory, monitoring, mcp-bridge e os entrypoints da raiz) e fail_under=60 foi declarado em [tool.coverage.report] com base em medicao real (64,50% medido, piso com margem). Nenhuma dependencia, versao, extra ou configuracao de build foi alterada -- as mudancas sao exclusivamente de medicao de cobertura. Os contratos que este documento atestou nos caminhos ancorados permanecem validos."
  - registro: registro-2026-09-08-bindings-wasm-defasados
    caminhos:
      - .github/workflows/sota-ci.yml
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: o passo pytest do job python-test-and-lint passou de '--cov=engine --cov-fail-under=10' (piso simbolico sobre um octavo da superficie) para 'pytest --cov', herdando a superficie e o fail_under=60 declarados no pyproject. O job, matrix, timeouts e demais steps nao mudaram. Os contratos que este documento atestou nos caminhos ancorados permanecem validos — a intencao do portao (suite verde) foi preservada e a medicao foi ampliada."
  - registro: registro-2026-09-13-append-em-jsonl-e-suite-em-todos-os-nucleos
    caminhos:
      - scripts/ops/suite_verde.py
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: rodar_suite passou a invocar 'pytest -q --cov', fazendo o portao medir a superficie declarada no pyproject e reprovar abaixo de fail_under=60. O mecanismo de marcador por arvore de conteudo, o paralelismo xdist e o --dist loadfile foram preservados -- a suite so e remediada quando o conteudo muda. Os contratos que este documento atestou nos caminhos ancorados permanecem validos."
  - registro: registro-2026-09-14-benchmark-icm-chipev-em-hand-history-e-next-env
    caminhos:
      - .github/workflows/sota-ci.yml
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: o passo pytest do job python-test-and-lint passou de '--cov=engine --cov-fail-under=10' (piso simbolico sobre um octavo da superficie) para 'pytest --cov', herdando a superficie e o fail_under=60 declarados no pyproject. O job, matrix, timeouts e demais steps nao mudaram. Os contratos que este documento atestou nos caminhos ancorados permanecem validos — a intencao do portao (suite verde) foi preservada e a medicao foi ampliada."
  - registro: registro-2026-09-14-harmonizacao-canonicos-astra-luna-gemini-anthropic
    caminhos:
      - do.ps1
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: o fluxo -Ingest chamava 'task_executor.py apply-god-mode', comando inexistente nas 3 camadas de dispatch (caia no exit 2). Corrigido para 'ingest', handler real de cli/commands.py que executa apply_god_mode com guard de path traversal. Nenhum outro parametro, switch ou fluxo do do.ps1 foi alterado. Os contratos que este documento atestou nos caminhos ancorados permanecem validos — onde o texto citava o nome antigo, o nome vigente e 'ingest'."
  - registro: registro-2026-09-17-integracao-dream-rsi-e-timesfm-autopoiese
    caminhos:
      - task_executor.py
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: as tabelas de dispatch (_LOCAL_HANDLERS, _NEXUS_CMDS, _NEXUS_LEGACY_MAP, _NEXUS_DISPATCH) subiram para o nivel do modulo para serem verificaveis; _nexus_cmds continha 15 aliases planos zumbis da CLI anterior ao typer -- 3 foram mapeados para o argv real (sanitize->ops sanitize, watch->ops watch, start-worker->ops worker) e 12 sem equivalente foram removidos. O comportamento dos comandos validos e identico. Os contratos que este documento atestou nos caminhos ancorados permanecem validos — onde o texto listava nomes zumbis, a lista vigente e a do modulo."
  - registro: registro-2026-09-18-interceptador-silencioso-par2-e-dream-rsi-sem-consumidor
    caminhos:
      - task_executor.py
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: as tabelas de dispatch (_LOCAL_HANDLERS, _NEXUS_CMDS, _NEXUS_LEGACY_MAP, _NEXUS_DISPATCH) subiram para o nivel do modulo para serem verificaveis; _nexus_cmds continha 15 aliases planos zumbis da CLI anterior ao typer -- 3 foram mapeados para o argv real (sanitize->ops sanitize, watch->ops watch, start-worker->ops worker) e 12 sem equivalente foram removidos. O comportamento dos comandos validos e identico. Os contratos que este documento atestou nos caminhos ancorados permanecem validos — onde o texto listava nomes zumbis, a lista vigente e a do modulo."
  - registro: registro-2026-09-23-otimizacao-cache-suite-verde-e-paralelismo
    caminhos:
      - scripts/ops/suite_verde.py
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: rodar_suite passou a invocar 'pytest -q --cov', fazendo o portao medir a superficie declarada no pyproject e reprovar abaixo de fail_under=60. O mecanismo de marcador por arvore de conteudo, o paralelismo xdist e o --dist loadfile foram preservados -- a suite so e remediada quando o conteudo muda. Os contratos que este documento atestou nos caminhos ancorados permanecem validos."
  - registro: registro-2026-09-25-fechamento-pendencia-ci-ram
    caminhos:
      - scripts/ops/suite_verde.py
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: rodar_suite passou a invocar 'pytest -q --cov', fazendo o portao medir a superficie declarada no pyproject e reprovar abaixo de fail_under=60. O mecanismo de marcador por arvore de conteudo, o paralelismo xdist e o --dist loadfile foram preservados -- a suite so e remediada quando o conteudo muda. Os contratos que este documento atestou nos caminhos ancorados permanecem validos."
  - registro: registro-2026-10-04-http-metrics-correlation-e-worker-shutdown
    caminhos:
      - scripts/ops/suite_verde.py
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: rodar_suite passou a invocar 'pytest -q --cov', fazendo o portao medir a superficie declarada no pyproject e reprovar abaixo de fail_under=60. O mecanismo de marcador por arvore de conteudo, o paralelismo xdist e o --dist loadfile foram preservados -- a suite so e remediada quando o conteudo muda. Os contratos que este documento atestou nos caminhos ancorados permanecem validos."
  - registro: registro-2026-10-04-remediacao-dependabot-pypdf
    caminhos:
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: [tool.coverage.run].source foi expandido de 8 para 17 entradas (todo o caminho de runtime de producao, incl. cli, conductor, memory, monitoring, mcp-bridge e os entrypoints da raiz) e fail_under=60 foi declarado em [tool.coverage.report] com base em medicao real (64,50% medido, piso com margem). Nenhuma dependencia, versao, extra ou configuracao de build foi alterada -- as mudancas sao exclusivamente de medicao de cobertura. Os contratos que este documento atestou nos caminhos ancorados permanecem validos."
  - registro: registro-2026-10-04-remediacao-dependabot-sentence-transformers-e-urllib3
    caminhos:
      - .github/workflows/sota-ci.yml
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: o passo pytest do job python-test-and-lint passou de '--cov=engine --cov-fail-under=10' (piso simbolico sobre um octavo da superficie) para 'pytest --cov', herdando a superficie e o fail_under=60 declarados no pyproject. O job, matrix, timeouts e demais steps nao mudaram. Os contratos que este documento atestou nos caminhos ancorados permanecem validos — a intencao do portao (suite verde) foi preservada e a medicao foi ampliada."
  - registro: registro-2026-10-05-atlas-cenarios-acessibilidade-e-design-system
    caminhos:
      - .github/workflows/sota-ci.yml
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: o passo pytest do job python-test-and-lint passou de '--cov=engine --cov-fail-under=10' (piso simbolico sobre um octavo da superficie) para 'pytest --cov', herdando a superficie e o fail_under=60 declarados no pyproject. O job, matrix, timeouts e demais steps nao mudaram. Os contratos que este documento atestou nos caminhos ancorados permanecem validos — a intencao do portao (suite verde) foi preservada e a medicao foi ampliada."
  - registro: registro-2026-10-08-auditoria-e-remediacao-backend
    caminhos:
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: [tool.coverage.run].source foi expandido de 8 para 17 entradas (todo o caminho de runtime de producao, incl. cli, conductor, memory, monitoring, mcp-bridge e os entrypoints da raiz) e fail_under=60 foi declarado em [tool.coverage.report] com base em medicao real (64,50% medido, piso com margem). Nenhuma dependencia, versao, extra ou configuracao de build foi alterada -- as mudancas sao exclusivamente de medicao de cobertura. Os contratos que este documento atestou nos caminhos ancorados permanecem validos."
  - registro: registro-2026-10-09-auditoria-governanca-e-remediacao-sota-v8-gold
    caminhos:
      - README.md
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: a secao de validacao automatizada foi atualizada para descrever a cobertura real (superficie do pyproject, fail_under=60, tres portoes). Nenhuma outra afirmacao tecnica do README foi alterada. Os contratos que este documento atestou nos caminhos ancorados permanecem validos."
  - registro: registro-2026-10-10-evolucao-malha-agentica-sota-v8-gold
    caminhos:
      - task_executor.py
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: as tabelas de dispatch (_LOCAL_HANDLERS, _NEXUS_CMDS, _NEXUS_LEGACY_MAP, _NEXUS_DISPATCH) subiram para o nivel do modulo para serem verificaveis; _nexus_cmds continha 15 aliases planos zumbis da CLI anterior ao typer -- 3 foram mapeados para o argv real (sanitize->ops sanitize, watch->ops watch, start-worker->ops worker) e 12 sem equivalente foram removidos. O comportamento dos comandos validos e identico. Os contratos que este documento atestou nos caminhos ancorados permanecem validos — onde o texto listava nomes zumbis, a lista vigente e a do modulo."
  - registro: registro-2026-10-13-remediacao-dependabot-e-offload-strata
    caminhos:
      - package.json
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: apenas o script python:coverage mudou (--cov=engine -> --cov, alinhado a superficie completa do pyproject). Nenhuma dependencia npm, versao ou script de build foi alterado. Os contratos que este documento atestou nos caminhos ancorados permanecem validos."
  - registro: registro-2026-10-14-saneamento-tipagem-config-ide-e-dependencias
    caminhos:
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: [tool.coverage.run].source foi expandido de 8 para 17 entradas (todo o caminho de runtime de producao, incl. cli, conductor, memory, monitoring, mcp-bridge e os entrypoints da raiz) e fail_under=60 foi declarado em [tool.coverage.report] com base em medicao real (64,50% medido, piso com margem). Nenhuma dependencia, versao, extra ou configuracao de build foi alterada -- as mudancas sao exclusivamente de medicao de cobertura. Os contratos que este documento atestou nos caminhos ancorados permanecem validos."
  - registro: registro-2026-10-18-remediacao-dependabot-e-renovacao-axe
    caminhos:
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: [tool.coverage.run].source foi expandido de 8 para 17 entradas (todo o caminho de runtime de producao, incl. cli, conductor, memory, monitoring, mcp-bridge e os entrypoints da raiz) e fail_under=60 foi declarado em [tool.coverage.report] com base em medicao real (64,50% medido, piso com margem). Nenhuma dependencia, versao, extra ou configuracao de build foi alterada -- as mudancas sao exclusivamente de medicao de cobertura. Os contratos que este documento atestou nos caminhos ancorados permanecem validos."
  - registro: registro-2026-10-18-resolucao-sonarqube-e-saneamento-global
    caminhos:
      - scripts/ops/suite_verde.py
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: rodar_suite passou a invocar 'pytest -q --cov', fazendo o portao medir a superficie declarada no pyproject e reprovar abaixo de fail_under=60. O mecanismo de marcador por arvore de conteudo, o paralelismo xdist e o --dist loadfile foram preservados -- a suite so e remediada quando o conteudo muda. Os contratos que este documento atestou nos caminhos ancorados permanecem validos."
  - registro: registro-2026-10-24-remediacao-integral-74-vulnerabilidades-dependabot
    caminhos:
      - package.json
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: apenas o script python:coverage mudou (--cov=engine -> --cov, alinhado a superficie completa do pyproject). Nenhuma dependencia npm, versao ou script de build foi alterado. Os contratos que este documento atestou nos caminhos ancorados permanecem validos. Revisado em 2026-11-17. Fase 5 da auditoria SOTA: [tool.coverage.run].source foi expandido de 8 para 17 entradas (todo o caminho de runtime de producao, incl. cli, conductor, memory, monitoring, mcp-bridge e os entrypoints da raiz) e fail_under=60 foi declarado em [tool.coverage.report] com base em medicao real (64,50% medido, piso com margem). Nenhuma dependencia, versao, extra ou configuracao de build foi alterada -- as mudancas sao exclusivamente de medicao de cobertura. Os contratos que este documento atestou nos caminhos ancorados permanecem validos."
  - registro: registro-2026-10-26-unificacao-ssot-dependencias-e-pwsh-sota
    caminhos:
      - package.json
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: apenas o script python:coverage mudou (--cov=engine -> --cov, alinhado a superficie completa do pyproject). Nenhuma dependencia npm, versao ou script de build foi alterado. Os contratos que este documento atestou nos caminhos ancorados permanecem validos. Revisado em 2026-11-17. Fase 5 da auditoria SOTA: [tool.coverage.run].source foi expandido de 8 para 17 entradas (todo o caminho de runtime de producao, incl. cli, conductor, memory, monitoring, mcp-bridge e os entrypoints da raiz) e fail_under=60 foi declarado em [tool.coverage.report] com base em medicao real (64,50% medido, piso com margem). Nenhuma dependencia, versao, extra ou configuracao de build foi alterada -- as mudancas sao exclusivamente de medicao de cobertura. Os contratos que este documento atestou nos caminhos ancorados permanecem validos."
  - registro: registro-2026-10-27-elevacao-dependencias-python-openai-pyspark-pytest
    caminhos:
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: [tool.coverage.run].source foi expandido de 8 para 17 entradas (todo o caminho de runtime de producao, incl. cli, conductor, memory, monitoring, mcp-bridge e os entrypoints da raiz) e fail_under=60 foi declarado em [tool.coverage.report] com base em medicao real (64,50% medido, piso com margem). Nenhuma dependencia, versao, extra ou configuracao de build foi alterada -- as mudancas sao exclusivamente de medicao de cobertura. Os contratos que este documento atestou nos caminhos ancorados permanecem validos."
  - registro: registro-2026-10-27-evolucao-project-context-e-reconciliacao-sota
    caminhos:
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: [tool.coverage.run].source foi expandido de 8 para 17 entradas (todo o caminho de runtime de producao, incl. cli, conductor, memory, monitoring, mcp-bridge e os entrypoints da raiz) e fail_under=60 foi declarado em [tool.coverage.report] com base em medicao real (64,50% medido, piso com margem). Nenhuma dependencia, versao, extra ou configuracao de build foi alterada -- as mudancas sao exclusivamente de medicao de cobertura. Os contratos que este documento atestou nos caminhos ancorados permanecem validos."
  - registro: registro-2026-10-27-harmonizacao-dependencias-ci-e-wasm
    caminhos:
      - package.json
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: apenas o script python:coverage mudou (--cov=engine -> --cov, alinhado a superficie completa do pyproject). Nenhuma dependencia npm, versao ou script de build foi alterado. Os contratos que este documento atestou nos caminhos ancorados permanecem validos."
  - registro: registro-2026-10-27-remediacao-dependabot-submodulo-e-integracao-sota
    caminhos:
      - package.json
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: apenas o script python:coverage mudou (--cov=engine -> --cov, alinhado a superficie completa do pyproject). Nenhuma dependencia npm, versao ou script de build foi alterado. Os contratos que este documento atestou nos caminhos ancorados permanecem validos."
  - registro: registro-2026-10-28-atualizacao-laya-e-estabilizacao-playwright-smoke
    caminhos:
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: [tool.coverage.run].source foi expandido de 8 para 17 entradas (todo o caminho de runtime de producao, incl. cli, conductor, memory, monitoring, mcp-bridge e os entrypoints da raiz) e fail_under=60 foi declarado em [tool.coverage.report] com base em medicao real (64,50% medido, piso com margem). Nenhuma dependencia, versao, extra ou configuracao de build foi alterada -- as mudancas sao exclusivamente de medicao de cobertura. Os contratos que este documento atestou nos caminhos ancorados permanecem validos."
  - registro: registro-2026-10-28-saneamento-reconciliacao-e-elevacao-dependencias-triade-montecarlo
    caminhos:
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: [tool.coverage.run].source foi expandido de 8 para 17 entradas (todo o caminho de runtime de producao, incl. cli, conductor, memory, monitoring, mcp-bridge e os entrypoints da raiz) e fail_under=60 foi declarado em [tool.coverage.report] com base em medicao real (64,50% medido, piso com margem). Nenhuma dependencia, versao, extra ou configuracao de build foi alterada -- as mudancas sao exclusivamente de medicao de cobertura. Os contratos que este documento atestou nos caminhos ancorados permanecem validos."
  - registro: registro-2026-10-31-estabilizacao-lifecycle-warmup-turbopack
    caminhos:
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: [tool.coverage.run].source foi expandido de 8 para 17 entradas (todo o caminho de runtime de producao, incl. cli, conductor, memory, monitoring, mcp-bridge e os entrypoints da raiz) e fail_under=60 foi declarado em [tool.coverage.report] com base em medicao real (64,50% medido, piso com margem). Nenhuma dependencia, versao, extra ou configuracao de build foi alterada -- as mudancas sao exclusivamente de medicao de cobertura. Os contratos que este documento atestou nos caminhos ancorados permanecem validos."
  - registro: registro-2026-11-01-integracao-ai-mesh-sdk-e-otimizacao-jules
    caminhos:
      - package.json
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: apenas o script python:coverage mudou (--cov=engine -> --cov, alinhado a superficie completa do pyproject). Nenhuma dependencia npm, versao ou script de build foi alterado. Os contratos que este documento atestou nos caminhos ancorados permanecem validos. Revisado em 2026-11-17. Fase 5 da auditoria SOTA: [tool.coverage.run].source foi expandido de 8 para 17 entradas (todo o caminho de runtime de producao, incl. cli, conductor, memory, monitoring, mcp-bridge e os entrypoints da raiz) e fail_under=60 foi declarado em [tool.coverage.report] com base em medicao real (64,50% medido, piso com margem). Nenhuma dependencia, versao, extra ou configuracao de build foi alterada -- as mudancas sao exclusivamente de medicao de cobertura. Os contratos que este documento atestou nos caminhos ancorados permanecem validos."
  - registro: registro-2026-11-03-elevacao-dependencias-pyarrow-openai-anthropic-laya
    caminhos:
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: [tool.coverage.run].source foi expandido de 8 para 17 entradas (todo o caminho de runtime de producao, incl. cli, conductor, memory, monitoring, mcp-bridge e os entrypoints da raiz) e fail_under=60 foi declarado em [tool.coverage.report] com base em medicao real (64,50% medido, piso com margem). Nenhuma dependencia, versao, extra ou configuracao de build foi alterada -- as mudancas sao exclusivamente de medicao de cobertura. Os contratos que este documento atestou nos caminhos ancorados permanecem validos."
  - registro: registro-2026-11-03-otimizacao-agentes-watchdog-e-calibracao
    caminhos:
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: [tool.coverage.run].source foi expandido de 8 para 17 entradas (todo o caminho de runtime de producao, incl. cli, conductor, memory, monitoring, mcp-bridge e os entrypoints da raiz) e fail_under=60 foi declarado em [tool.coverage.report] com base em medicao real (64,50% medido, piso com margem). Nenhuma dependencia, versao, extra ou configuracao de build foi alterada -- as mudancas sao exclusivamente de medicao de cobertura. Os contratos que este documento atestou nos caminhos ancorados permanecem validos."
  - registro: registro-2026-11-03-remediacao-dependabot-pypdf-pyasn1-minimatch
    caminhos:
      - package.json
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: apenas o script python:coverage mudou (--cov=engine -> --cov, alinhado a superficie completa do pyproject). Nenhuma dependencia npm, versao ou script de build foi alterado. Os contratos que este documento atestou nos caminhos ancorados permanecem validos. Revisado em 2026-11-17. Fase 5 da auditoria SOTA: [tool.coverage.run].source foi expandido de 8 para 17 entradas (todo o caminho de runtime de producao, incl. cli, conductor, memory, monitoring, mcp-bridge e os entrypoints da raiz) e fail_under=60 foi declarado em [tool.coverage.report] com base em medicao real (64,50% medido, piso com margem). Nenhuma dependencia, versao, extra ou configuracao de build foi alterada -- as mudancas sao exclusivamente de medicao de cobertura. Os contratos que este documento atestou nos caminhos ancorados permanecem validos."
  - registro: registro-2026-11-04-otimizacao-layout-header-e-elevacao-dependencias
    caminhos:
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: [tool.coverage.run].source foi expandido de 8 para 17 entradas (todo o caminho de runtime de producao, incl. cli, conductor, memory, monitoring, mcp-bridge e os entrypoints da raiz) e fail_under=60 foi declarado em [tool.coverage.report] com base em medicao real (64,50% medido, piso com margem). Nenhuma dependencia, versao, extra ou configuracao de build foi alterada -- as mudancas sao exclusivamente de medicao de cobertura. Os contratos que este documento atestou nos caminhos ancorados permanecem validos."
  - registro: registro-2026-11-05-saneamento-customizations-e-elevacao-dependencias
    caminhos:
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: [tool.coverage.run].source foi expandido de 8 para 17 entradas (todo o caminho de runtime de producao, incl. cli, conductor, memory, monitoring, mcp-bridge e os entrypoints da raiz) e fail_under=60 foi declarado em [tool.coverage.report] com base em medicao real (64,50% medido, piso com margem). Nenhuma dependencia, versao, extra ou configuracao de build foi alterada -- as mudancas sao exclusivamente de medicao de cobertura. Os contratos que este documento atestou nos caminhos ancorados permanecem validos."
  - registro: registro-2026-11-06-reparo-manifestos-e-declaracao-chrysalis
    caminhos:
      - package.json
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: apenas o script python:coverage mudou (--cov=engine -> --cov, alinhado a superficie completa do pyproject). Nenhuma dependencia npm, versao ou script de build foi alterado. Os contratos que este documento atestou nos caminhos ancorados permanecem validos. Revisado em 2026-11-17. Fase 5 da auditoria SOTA: [tool.coverage.run].source foi expandido de 8 para 17 entradas (todo o caminho de runtime de producao, incl. cli, conductor, memory, monitoring, mcp-bridge e os entrypoints da raiz) e fail_under=60 foi declarado em [tool.coverage.report] com base em medicao real (64,50% medido, piso com margem). Nenhuma dependencia, versao, extra ou configuracao de build foi alterada -- as mudancas sao exclusivamente de medicao de cobertura. Os contratos que este documento atestou nos caminhos ancorados permanecem validos."
  - registro: registro-2026-11-07-auditoria-jules-cloud-saneamento-linters-e-pyproject
    caminhos:
      - pyproject.toml
      - tests/test_lancedb_chroma_dual_rag.py
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: [tool.coverage.run].source foi expandido de 8 para 17 entradas (todo o caminho de runtime de producao, incl. cli, conductor, memory, monitoring, mcp-bridge e os entrypoints da raiz) e fail_under=60 foi declarado em [tool.coverage.report] com base em medicao real (64,50% medido, piso com margem). Nenhuma dependencia, versao, extra ou configuracao de build foi alterada -- as mudancas sao exclusivamente de medicao de cobertura. Os contratos que este documento atestou nos caminhos ancorados permanecem validos. Revisado em 2026-11-17. Fase 5 da auditoria SOTA: +2 testes de caracterizacao da orquestracao de ingest_all_memories (noop sem manifesto; uniao de ids -> purge). Nenhum teste existente foi alterado ou removido. Os contratos que este documento atestou nos caminhos ancorados permanecem validos."
  - registro: registro-2026-11-07-elevacao-dependencias-fastapi-regex-types-aiofiles
    caminhos:
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: [tool.coverage.run].source foi expandido de 8 para 17 entradas (todo o caminho de runtime de producao, incl. cli, conductor, memory, monitoring, mcp-bridge e os entrypoints da raiz) e fail_under=60 foi declarado em [tool.coverage.report] com base em medicao real (64,50% medido, piso com margem). Nenhuma dependencia, versao, extra ou configuracao de build foi alterada -- as mudancas sao exclusivamente de medicao de cobertura. Os contratos que este documento atestou nos caminhos ancorados permanecem validos."
  - registro: registro-2026-11-08-elevacao-dependencias-regex-e-laya
    caminhos:
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: [tool.coverage.run].source foi expandido de 8 para 17 entradas (todo o caminho de runtime de producao, incl. cli, conductor, memory, monitoring, mcp-bridge e os entrypoints da raiz) e fail_under=60 foi declarado em [tool.coverage.report] com base em medicao real (64,50% medido, piso com margem). Nenhuma dependencia, versao, extra ou configuracao de build foi alterada -- as mudancas sao exclusivamente de medicao de cobertura. Os contratos que este documento atestou nos caminhos ancorados permanecem validos."
  - registro: registro-2026-11-08-refinamento-sonarlint-e-code-review-triage
    caminhos:
      - package.json
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: apenas o script python:coverage mudou (--cov=engine -> --cov, alinhado a superficie completa do pyproject). Nenhuma dependencia npm, versao ou script de build foi alterado. Os contratos que este documento atestou nos caminhos ancorados permanecem validos."
  - registro: registro-2026-11-08-saneamento-code-review-triage
    caminhos:
      - package.json
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: apenas o script python:coverage mudou (--cov=engine -> --cov, alinhado a superficie completa do pyproject). Nenhuma dependencia npm, versao ou script de build foi alterado. Os contratos que este documento atestou nos caminhos ancorados permanecem validos."
  - registro: registro-2026-11-09-elevacao-dependencias-e-fork-eigen
    caminhos:
      - package.json
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: apenas o script python:coverage mudou (--cov=engine -> --cov, alinhado a superficie completa do pyproject). Nenhuma dependencia npm, versao ou script de build foi alterado. Os contratos que este documento atestou nos caminhos ancorados permanecem validos. Revisado em 2026-11-17. Fase 5 da auditoria SOTA: [tool.coverage.run].source foi expandido de 8 para 17 entradas (todo o caminho de runtime de producao, incl. cli, conductor, memory, monitoring, mcp-bridge e os entrypoints da raiz) e fail_under=60 foi declarado em [tool.coverage.report] com base em medicao real (64,50% medido, piso com margem). Nenhuma dependencia, versao, extra ou configuracao de build foi alterada -- as mudancas sao exclusivamente de medicao de cobertura. Os contratos que este documento atestou nos caminhos ancorados permanecem validos."
  - registro: registro-2026-11-10-ai-sdk-google-4-0-117-ai-7-0-169
    caminhos:
      - package.json
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: apenas o script python:coverage mudou (--cov=engine -> --cov, alinhado a superficie completa do pyproject). Nenhuma dependencia npm, versao ou script de build foi alterado. Os contratos que este documento atestou nos caminhos ancorados permanecem validos."
  - registro: registro-2026-11-10-bump-deps-e-extra-paths-pylance
    caminhos:
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: [tool.coverage.run].source foi expandido de 8 para 17 entradas (todo o caminho de runtime de producao, incl. cli, conductor, memory, monitoring, mcp-bridge e os entrypoints da raiz) e fail_under=60 foi declarado em [tool.coverage.report] com base em medicao real (64,50% medido, piso com margem). Nenhuma dependencia, versao, extra ou configuracao de build foi alterada -- as mudancas sao exclusivamente de medicao de cobertura. Os contratos que este documento atestou nos caminhos ancorados permanecem validos."
  - registro: registro-2026-11-10-google-genai-3-1-0
    caminhos:
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: [tool.coverage.run].source foi expandido de 8 para 17 entradas (todo o caminho de runtime de producao, incl. cli, conductor, memory, monitoring, mcp-bridge e os entrypoints da raiz) e fail_under=60 foi declarado em [tool.coverage.report] com base em medicao real (64,50% medido, piso com margem). Nenhuma dependencia, versao, extra ou configuracao de build foi alterada -- as mudancas sao exclusivamente de medicao de cobertura. Os contratos que este documento atestou nos caminhos ancorados permanecem validos."
  - registro: registro-2026-11-11-elevacao-fastapi-playwright-e-bump-deep-research
    caminhos:
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: [tool.coverage.run].source foi expandido de 8 para 17 entradas (todo o caminho de runtime de producao, incl. cli, conductor, memory, monitoring, mcp-bridge e os entrypoints da raiz) e fail_under=60 foi declarado em [tool.coverage.report] com base em medicao real (64,50% medido, piso com margem). Nenhuma dependencia, versao, extra ou configuracao de build foi alterada -- as mudancas sao exclusivamente de medicao de cobertura. Os contratos que este documento atestou nos caminhos ancorados permanecem validos."
  - registro: registro-2026-11-11-elevacao-pypdf-turbo-ai-sdk-google
    caminhos:
      - package.json
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: apenas o script python:coverage mudou (--cov=engine -> --cov, alinhado a superficie completa do pyproject). Nenhuma dependencia npm, versao ou script de build foi alterado. Os contratos que este documento atestou nos caminhos ancorados permanecem validos. Revisado em 2026-11-17. Fase 5 da auditoria SOTA: [tool.coverage.run].source foi expandido de 8 para 17 entradas (todo o caminho de runtime de producao, incl. cli, conductor, memory, monitoring, mcp-bridge e os entrypoints da raiz) e fail_under=60 foi declarado em [tool.coverage.report] com base em medicao real (64,50% medido, piso com margem). Nenhuma dependencia, versao, extra ou configuracao de build foi alterada -- as mudancas sao exclusivamente de medicao de cobertura. Os contratos que este documento atestou nos caminhos ancorados permanecem validos."
  - registro: registro-2026-11-11-elevacao-sentence-transformers-genai-prettier-exa-mcp
    caminhos:
      - package.json
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: apenas o script python:coverage mudou (--cov=engine -> --cov, alinhado a superficie completa do pyproject). Nenhuma dependencia npm, versao ou script de build foi alterado. Os contratos que este documento atestou nos caminhos ancorados permanecem validos. Revisado em 2026-11-17. Fase 5 da auditoria SOTA: [tool.coverage.run].source foi expandido de 8 para 17 entradas (todo o caminho de runtime de producao, incl. cli, conductor, memory, monitoring, mcp-bridge e os entrypoints da raiz) e fail_under=60 foi declarado em [tool.coverage.report] com base em medicao real (64,50% medido, piso com margem). Nenhuma dependencia, versao, extra ou configuracao de build foi alterada -- as mudancas sao exclusivamente de medicao de cobertura. Os contratos que este documento atestou nos caminhos ancorados permanecem validos."
  - registro: registro-2026-11-11-elevacao-typer-types-knip-harmonizacao
    caminhos:
      - package.json
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: apenas o script python:coverage mudou (--cov=engine -> --cov, alinhado a superficie completa do pyproject). Nenhuma dependencia npm, versao ou script de build foi alterado. Os contratos que este documento atestou nos caminhos ancorados permanecem validos. Revisado em 2026-11-17. Fase 5 da auditoria SOTA: [tool.coverage.run].source foi expandido de 8 para 17 entradas (todo o caminho de runtime de producao, incl. cli, conductor, memory, monitoring, mcp-bridge e os entrypoints da raiz) e fail_under=60 foi declarado em [tool.coverage.report] com base em medicao real (64,50% medido, piso com margem). Nenhuma dependencia, versao, extra ou configuracao de build foi alterada -- as mudancas sao exclusivamente de medicao de cobertura. Os contratos que este documento atestou nos caminhos ancorados permanecem validos."
  - registro: registro-2026-11-11-nota-pareamento-dev-dependency-groups
    caminhos:
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: [tool.coverage.run].source foi expandido de 8 para 17 entradas (todo o caminho de runtime de producao, incl. cli, conductor, memory, monitoring, mcp-bridge e os entrypoints da raiz) e fail_under=60 foi declarado em [tool.coverage.report] com base em medicao real (64,50% medido, piso com margem). Nenhuma dependencia, versao, extra ou configuracao de build foi alterada -- as mudancas sao exclusivamente de medicao de cobertura. Os contratos que este documento atestou nos caminhos ancorados permanecem validos."
  - registro: registro-2026-11-12-review-sweeps-endurecimento-sota
    caminhos:
      - package.json
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: apenas o script python:coverage mudou (--cov=engine -> --cov, alinhado a superficie completa do pyproject). Nenhuma dependencia npm, versao ou script de build foi alterado. Os contratos que este documento atestou nos caminhos ancorados permanecem validos."
  - registro: registro-2026-11-13-elevacao-deps-e-saneamento-configs-ide
    caminhos:
      - package.json
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: apenas o script python:coverage mudou (--cov=engine -> --cov, alinhado a superficie completa do pyproject). Nenhuma dependencia npm, versao ou script de build foi alterado. Os contratos que este documento atestou nos caminhos ancorados permanecem validos. Revisado em 2026-11-17. Fase 5 da auditoria SOTA: [tool.coverage.run].source foi expandido de 8 para 17 entradas (todo o caminho de runtime de producao, incl. cli, conductor, memory, monitoring, mcp-bridge e os entrypoints da raiz) e fail_under=60 foi declarado em [tool.coverage.report] com base em medicao real (64,50% medido, piso com margem). Nenhuma dependencia, versao, extra ou configuracao de build foi alterada -- as mudancas sao exclusivamente de medicao de cobertura. Os contratos que este documento atestou nos caminhos ancorados permanecem validos."
  - registro: registro-2026-11-13-revisao-ancora-pyproject-extra-path-cockpit
    caminhos:
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: [tool.coverage.run].source foi expandido de 8 para 17 entradas (todo o caminho de runtime de producao, incl. cli, conductor, memory, monitoring, mcp-bridge e os entrypoints da raiz) e fail_under=60 foi declarado em [tool.coverage.report] com base em medicao real (64,50% medido, piso com margem). Nenhuma dependencia, versao, extra ou configuracao de build foi alterada -- as mudancas sao exclusivamente de medicao de cobertura. Os contratos que este documento atestou nos caminhos ancorados permanecem validos."
  - registro: registro-2026-11-14-deps-refatoracoes-sonar-e-submodulos
    caminhos:
      - package.json
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: apenas o script python:coverage mudou (--cov=engine -> --cov, alinhado a superficie completa do pyproject). Nenhuma dependencia npm, versao ou script de build foi alterado. Os contratos que este documento atestou nos caminhos ancorados permanecem validos. Revisado em 2026-11-17. Fase 5 da auditoria SOTA: [tool.coverage.run].source foi expandido de 8 para 17 entradas (todo o caminho de runtime de producao, incl. cli, conductor, memory, monitoring, mcp-bridge e os entrypoints da raiz) e fail_under=60 foi declarado em [tool.coverage.report] com base em medicao real (64,50% medido, piso com margem). Nenhuma dependencia, versao, extra ou configuracao de build foi alterada -- as mudancas sao exclusivamente de medicao de cobertura. Os contratos que este documento atestou nos caminhos ancorados permanecem validos."
  - registro: registro-2026-11-14-laya-pylint-e-refactors-sonar
    caminhos:
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: [tool.coverage.run].source foi expandido de 8 para 17 entradas (todo o caminho de runtime de producao, incl. cli, conductor, memory, monitoring, mcp-bridge e os entrypoints da raiz) e fail_under=60 foi declarado em [tool.coverage.report] com base em medicao real (64,50% medido, piso com margem). Nenhuma dependencia, versao, extra ou configuracao de build foi alterada -- as mudancas sao exclusivamente de medicao de cobertura. Os contratos que este documento atestou nos caminhos ancorados permanecem validos."
  - registro: registro-2026-11-14-roteamento-pools-transporte-e-validacao-hrc
    caminhos:
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: [tool.coverage.run].source foi expandido de 8 para 17 entradas (todo o caminho de runtime de producao, incl. cli, conductor, memory, monitoring, mcp-bridge e os entrypoints da raiz) e fail_under=60 foi declarado em [tool.coverage.report] com base em medicao real (64,50% medido, piso com margem). Nenhuma dependencia, versao, extra ou configuracao de build foi alterada -- as mudancas sao exclusivamente de medicao de cobertura. Os contratos que este documento atestou nos caminhos ancorados permanecem validos."
  - registro: registro-2026-11-14-sync-uvlock-ollama-cloud-circuit-e-ci
    caminhos:
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: [tool.coverage.run].source foi expandido de 8 para 17 entradas (todo o caminho de runtime de producao, incl. cli, conductor, memory, monitoring, mcp-bridge e os entrypoints da raiz) e fail_under=60 foi declarado em [tool.coverage.report] com base em medicao real (64,50% medido, piso com margem). Nenhuma dependencia, versao, extra ou configuracao de build foi alterada -- as mudancas sao exclusivamente de medicao de cobertura. Os contratos que este documento atestou nos caminhos ancorados permanecem validos."
  - registro: registro-2026-11-15-laya-0432-failover-arquitetura-s1
    caminhos:
      - tests/test_lancedb_chroma_dual_rag.py
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: +2 testes de caracterizacao da orquestracao de ingest_all_memories (noop sem manifesto; uniao de ids -> purge). Nenhum teste existente foi alterado ou removido. Os contratos que este documento atestou nos caminhos ancorados permanecem validos."
  - registro: registro-2026-11-16-elevacao-deps-anthropic-laya-accelerate-e-deps-sync
    caminhos:
      - package.json
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: apenas o script python:coverage mudou (--cov=engine -> --cov, alinhado a superficie completa do pyproject). Nenhuma dependencia npm, versao ou script de build foi alterado. Os contratos que este documento atestou nos caminhos ancorados permanecem validos. Revisado em 2026-11-17. Fase 5 da auditoria SOTA: [tool.coverage.run].source foi expandido de 8 para 17 entradas (todo o caminho de runtime de producao, incl. cli, conductor, memory, monitoring, mcp-bridge e os entrypoints da raiz) e fail_under=60 foi declarado em [tool.coverage.report] com base em medicao real (64,50% medido, piso com margem). Nenhuma dependencia, versao, extra ou configuracao de build foi alterada -- as mudancas sao exclusivamente de medicao de cobertura. Os contratos que este documento atestou nos caminhos ancorados permanecem validos."
  - registro: registro-2026-11-17-elevacao-deps-google-genai-openai
    caminhos:
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: [tool.coverage.run].source foi expandido de 8 para 17 entradas (todo o caminho de runtime de producao, incl. cli, conductor, memory, monitoring, mcp-bridge e os entrypoints da raiz) e fail_under=60 foi declarado em [tool.coverage.report] com base em medicao real (64,50% medido, piso com margem). Nenhuma dependencia, versao, extra ou configuracao de build foi alterada -- as mudancas sao exclusivamente de medicao de cobertura. Os contratos que este documento atestou nos caminhos ancorados permanecem validos."
  - registro: registro-2026-11-17-fase-3-backend-estrutural-sota
    caminhos:
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: [tool.coverage.run].source foi expandido de 8 para 17 entradas (todo o caminho de runtime de producao, incl. cli, conductor, memory, monitoring, mcp-bridge e os entrypoints da raiz) e fail_under=60 foi declarado em [tool.coverage.report] com base em medicao real (64,50% medido, piso com margem). Nenhuma dependencia, versao, extra ou configuracao de build foi alterada -- as mudancas sao exclusivamente de medicao de cobertura. Os contratos que este documento atestou nos caminhos ancorados permanecem validos."
  - registro: registro-2026-11-17-fases-0-1-portoes-verificacao-e-higiene-doc-real
    caminhos:
      - .github/workflows/sota-ci.yml
      - README.md
      - cloudbuild.backend.yaml
      - package.json
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: o passo pytest do job python-test-and-lint passou de '--cov=engine --cov-fail-under=10' (piso simbolico sobre um octavo da superficie) para 'pytest --cov', herdando a superficie e o fail_under=60 declarados no pyproject. O job, matrix, timeouts e demais steps nao mudaram. Os contratos que este documento atestou nos caminhos ancorados permanecem validos — a intencao do portao (suite verde) foi preservada e a medicao foi ampliada. Revisado em 2026-11-17. Fase 5 da auditoria SOTA: a secao de validacao automatizada foi atualizada para descrever a cobertura real (superficie do pyproject, fail_under=60, tres portoes). Nenhuma outra afirmacao tecnica do README foi alterada. Os contratos que este documento atestou nos caminhos ancorados permanecem validos. Revisado em 2026-11-17. Fase 5 da auditoria SOTA: o pytest-gate do deploy passou de '--cov=engine --cov-fail-under=10' para 'pytest --cov', alinhado ao CI e ao portao local. Nenhum step de build, dockerfile ou configuracao de deploy foi alterado. Os contratos que este documento atestou nos caminhos ancorados permanecem validos. Revisado em 2026-11-17. Fase 5 da auditoria SOTA: apenas o script python:coverage mudou (--cov=engine -> --cov, alinhado a superficie completa do pyproject). Nenhuma dependencia npm, versao ou script de build foi alterado. Os contratos que este documento atestou nos caminhos ancorados permanecem validos. Revisado em 2026-11-17. Fase 5 da auditoria SOTA: [tool.coverage.run].source foi expandido de 8 para 17 entradas (todo o caminho de runtime de producao, incl. cli, conductor, memory, monitoring, mcp-bridge e os entrypoints da raiz) e fail_under=60 foi declarado em [tool.coverage.report] com base em medicao real (64,50% medido, piso com margem). Nenhuma dependencia, versao, extra ou configuracao de build foi alterada -- as mudancas sao exclusivamente de medicao de cobertura. Os contratos que este documento atestou nos caminhos ancorados permanecem validos."
  - registro: registro-2026-11-17-suite-verde-loadfile-contra-flake-write-tree
    caminhos:
      - scripts/ops/suite_verde.py
    parecer: "Revisado em 2026-11-17. Fase 5 da auditoria SOTA: rodar_suite passou a invocar 'pytest -q --cov', fazendo o portao medir a superficie declarada no pyproject e reprovar abaixo de fail_under=60. O mecanismo de marcador por arvore de conteudo, o paralelismo xdist e o --dist loadfile foram preservados -- a suite so e remediada quando o conteudo muda. Os contratos que este documento atestou nos caminhos ancorados permanecem validos."
---

# Fase 5 -- Evolucao das forcas (ultima fase da auditoria SOTA)

## Sumario executivo

A Fase 5 fechou a trilogia "declarado vs. executado" nos pontos onde a
medicao mostrou que a declaracao nao correspondia a execucao:

1. **Coverage gate**: a configuracao de cobertura existia mas nunca era
   executada (addopts com `--cov-report` sem `--cov`; CI com piso
   simbolico de 10% sobre `engine` apenas; `suite_verde` sem flag).
   Agora a superficie medida e o caminho de runtime completo, o piso e
   medido (60, abaixo do 64,50% real subestimado) e os tres portoes
   (local, CI, deploy) rodam o mesmo comando.

2. **Contrato do.ps1**: a costura membrana->dispatch tinha dois drifts
   reais corrigidos (comando zumbi `apply-god-mode`; 15 aliases planos
   mortos em `_nexus_cmds`) e ganhou teste de contrato que extrai os
   comandos do proprio do.ps1 e os resolve contra a arvore typer real.

3. **Caracterizacao**: queue_manager (82%) confirmado coeso --
   decomposicao descartada com medicao; memory_rag (44%) teve a
   superficie de decisao ja coberta e ganhou testes de orquestracao de
   ingestao; a massa restante sao internals dependentes de servico vivo.

4. **Benchmark**: executado no modo inventario; nenhum claim vivo
   divergiu das medicoes.

## O que mudou em cada arquivo

| Arquivo | Mudanca |
|---|---|
| `pyproject.toml` | `[tool.coverage.run].source` expandido de 8 para 17 entradas (caminho de runtime completo); `fail_under = 60` em `[tool.coverage.report]` |
| `scripts/ops/suite_verde.py` | `pytest -q` -> `pytest -q --cov` (custo amortizado pelo marcador de arvore) |
| `.github/workflows/sota-ci.yml` | `pytest --cov=engine --cov-fail-under=10` -> `pytest --cov` |
| `cloudbuild.backend.yaml` | idem (gate de deploy) |
| `package.json` | `python:coverage` -> `pytest --cov tests/` |
| `README.md` | claim de cobertura atualizado para a realidade dos 3 portoes |
| `do.ps1` | `apply-god-mode` -> `ingest` (+ comentario do drift) |
| `task_executor.py` | `_LOCAL_HANDLERS`/`_NEXUS_CMDS`/`_NEXUS_LEGACY_MAP`/`_NEXUS_DISPATCH` em nivel de modulo; 12 aliases zumbis removidos; 3 aliases legados mapeados para argv typer real |
| `cli/commands.py` | dict de handlers -> `_COMMAND_HANDLERS` module-level (visivel ao contrato) |
| `tests/test_task_dispatch_contract.py` | NOVO -- 5 testes de contrato da costura do.ps1 |
| `tests/test_lancedb_chroma_dual_rag.py` | +2 testes de orquestracao `ingest_all_memories` |

## Decisoes registradas

- **Piso 60, nao 64**: medicao subestimada (276 erros de infra na mesma
  arvore) + variacao de plataforma Windows->Linux -> margem honesta.
  Subir o piso e trabalho de fases futuras de cobertura.
- **12 aliases removidos, nao remapeados**: nao existe equivalente no
  nexus v8 nem no fallback; recria-los seria inventar funcionalidade.
  `stop-worker` segue existindo como funcao do profile do PowerShell
  (Setup-NexusProfile.ps1), que e o caminho vivo -- nao era alias do
  task_executor.
- **queue_manager/memory_rag nao decompostos**: duas medicoes
  consecutivas (Fase 3 deferiu, Fase 5 mediu 82%/44%) mostram modulos
  coesos; split sem fronteira clara seria o refactor forcado que a
  auditoria combate.
- **tools/ e locustfile fora da superficie**: ferramenta autocontida de
  benchmark/carga, nao caminho de runtime.
