---
id: registro-2026-09-11-auditoria-da-campanha-de-lint-em-31-testes
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: claude-code@claude-opus-5
criado_em: '2026-09-11T15:05:00-03:00'
classes:
  - interno
  - medido
  - lint
caminhos:
  - tests/test_adapters_anthropic_http.py
  - llm/free_router.py
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  baseline_head: c989ad2562d07e66b48a41d06e95465228f88480
  google_genai: 2.6.0
verificado:
  - 'Suite completa apos a auditoria: 1086 testes passando, 1 pulado com motivo declarado, portao
    de qualidade com 0 erros e 0 warnings.'
  - 'llm/free_router.py: a campanha trocara types.ThinkingConfig(thinking_level=...) por dicionario
    cru. Medido no google-genai 2.6.0 instalado -- ThinkingConfig TEM o campo thinking_level, as
    duas formas produzem o mesmo objeto, e as duas rejeitam chave errada com ValidationError. A
    troca nao consertava TypeError algum: era neutra. Revertida por ser injustificada e por destoar
    do types.GenerateContentConfig da mesma linha.'
  - 'tests/test_adapters_anthropic_http.py: duas assercoes `assert headers == {}` viraram
    `assert not headers`. Esta foi a unica alteracao da campanha com perda de poder de deteccao --
    `not headers` tambem passa para None, [], "" e 0. Revertidas.'
  - 'Os 15 comentarios `# pylint: disable` foram examinados um a um e mantidos: sao falsos positivos
    conhecidos do pylint sobre idioma de pytest, nao contorno de portao.'
  - 'Imports locais promovidos ao topo (PLC0415): verifiquei o risco real -- import local em teste
    as vezes e deliberado, para controlar o momento do import depois de monkeypatch. Nao se aplica
    aqui, porque os modulos promovidos ja eram importados no topo dos mesmos arquivos.'
  - 'tests/test_governanca_agents.py estava fora do formato do ruff e bloqueou o commit. Formatado,
    e a AST comparada antes e depois e identica: a unica diferenca e uma linha em branco apos
    docstring.'
nao_verificado:
  - 'Nao reexecutei a suite sob a versao anterior dos 31 arquivos para comparar cobertura linha a
    linha. A verificacao e de aprovacao e de leitura do diff inteiro, nao de equivalencia de
    cobertura.'
  - 'Nao medi o efeito dos `# pylint: disable` no relatorio do pylint em CI: o portao local nao
    executa pylint, so ruff. A avaliacao deles e por leitura do idioma, nao por execucao.'
revisoes_de_ancora:
  - registro: research-pmev-experimentos-controlados-h3-h4-h8
    caminhos:
      - tests/test_pmev_controlled_experiments.py
    parecer: >-
      Revisado e mantido valido. A mudanca neste commit toca a ancora compartilhada em
      tests/test_pmev_controlled_experiments.py, from __future__ import annotations e import
      declarado no topo e import de typing.Any -- adia a avaliacao de anotacao em tempo de
      execucao; nenhum teste deste arquivo inspeciona anotacao em runtime; import acrescentado no
      topo, sem remover nenhum existente e sem tocar corpo de teste; apenas anotacao de tipo, sem
      efeito em execucao. Nenhuma assercao, fixture, parametrizacao ou contrato verificado foi
      alterado, logo nada do que este registro afirma depende do que mudou. Suite completa apos a
      alteracao: 1086 testes passando, 1 pulado com motivo declarado, portao de qualidade com 0
      erros e 0 warnings.
  - registro: plan-pmev-contract-port-2026-09-01
    caminhos:
      - tests/test_pmev_controlled_experiments.py
    parecer: >-
      Revisado e mantido valido. A mudanca neste commit toca a ancora compartilhada em
      tests/test_pmev_controlled_experiments.py, from __future__ import annotations e import
      declarado no topo e import de typing.Any -- adia a avaliacao de anotacao em tempo de
      execucao; nenhum teste deste arquivo inspeciona anotacao em runtime; import acrescentado no
      topo, sem remover nenhum existente e sem tocar corpo de teste; apenas anotacao de tipo, sem
      efeito em execucao. Nenhuma assercao, fixture, parametrizacao ou contrato verificado foi
      alterado, logo nada do que este registro afirma depende do que mudou. Suite completa apos a
      alteracao: 1086 testes passando, 1 pulado com motivo declarado, portao de qualidade com 0
      erros e 0 warnings.
  - registro: auditoria-2026-09-02-curadoria-mcp-e-processos-residuais
    caminhos:
      - tests/test_mcp_addon_routing.py
    parecer: >-
      Revisado e mantido valido. A mudanca neste commit toca a ancora compartilhada em
      tests/test_mcp_addon_routing.py, supressao de falso positivo do pylint no topo do arquivo e
      import local de funcao promovido ao topo (PLC0415) -- comentario de supressao nao e
      executavel e nao altera coleta, assercao nem fixture; redefined-outer-name e literalmente
      como fixture de pytest funciona, e protected-access e o proposito declarado destes testes;
      import local em teste as vezes e deliberado, para controlar o momento do import depois de
      monkeypatch -- verifiquei que nao e o caso aqui, porque os modulos promovidos ja eram
      importados no topo do mesmo arquivo. Nenhuma assercao, fixture, parametrizacao ou contrato
      verificado foi alterado, logo nada do que este registro afirma depende do que mudou. Suite
      completa apos a alteracao: 1086 testes passando, 1 pulado com motivo declarado, portao de
      qualidade com 0 erros e 0 warnings.
  - registro: auditoria-2026-09-03-disco-extensao-e-roteador-de-modelo
    caminhos:
      - tests/test_gemma_server_sota.py
    parecer: >-
      Revisado e mantido valido. A mudanca neste commit toca a ancora compartilhada em
      tests/test_gemma_server_sota.py, import local de funcao promovido ao topo (PLC0415) --
      import local em teste as vezes e deliberado, para controlar o momento do import depois de
      monkeypatch -- verifiquei que nao e o caso aqui, porque os modulos promovidos ja eram
      importados no topo do mesmo arquivo. Nenhuma assercao, fixture, parametrizacao ou contrato
      verificado foi alterado, logo nada do que este registro afirma depende do que mudou. Suite
      completa apos a alteracao: 1086 testes passando, 1 pulado com motivo declarado, portao de
      qualidade com 0 erros e 0 warnings.
  - registro: auditoria-2026-09-03-trabalho-do-gemini-3-8-flash
    caminhos:
      - tests/test_gemma_server_sota.py
    parecer: >-
      Revisado e mantido valido. A mudanca neste commit toca a ancora compartilhada em
      tests/test_gemma_server_sota.py, import local de funcao promovido ao topo (PLC0415) --
      import local em teste as vezes e deliberado, para controlar o momento do import depois de
      monkeypatch -- verifiquei que nao e o caso aqui, porque os modulos promovidos ja eram
      importados no topo do mesmo arquivo. Nenhuma assercao, fixture, parametrizacao ou contrato
      verificado foi alterado, logo nada do que este registro afirma depende do que mudou. Suite
      completa apos a alteracao: 1086 testes passando, 1 pulado com motivo declarado, portao de
      qualidade com 0 erros e 0 warnings.
  - registro: auditoria-2026-09-07-preludio-jules-astra-e-correcao-da-delegacao
    caminhos:
      - tests/test_gpt6_astra.py
    parecer: >-
      Revisado e mantido valido. A mudanca neste commit toca a ancora compartilhada em
      tests/test_gpt6_astra.py, supressao de falso positivo do pylint no topo do arquivo --
      comentario de supressao nao e executavel e nao altera coleta, assercao nem fixture;
      redefined-outer-name e literalmente como fixture de pytest funciona, e protected-access e o
      proposito declarado destes testes. Nenhuma assercao, fixture, parametrizacao ou contrato
      verificado foi alterado, logo nada do que este registro afirma depende do que mudou. Suite
      completa apos a alteracao: 1086 testes passando, 1 pulado com motivo declarado, portao de
      qualidade com 0 erros e 0 warnings.
  - registro: auditoria-2026-09-10-passe-de-lint-e-reconciliacao-de-ancoras
    caminhos:
      - tools/hybrid_router/test_hybrid_router.py
    parecer: >-
      Revisado e mantido valido. A mudanca neste commit toca a ancora compartilhada em
      tools/hybrid_router/test_hybrid_router.py, import declarado no topo -- import acrescentado
      no topo, sem remover nenhum existente e sem tocar corpo de teste. Nenhuma assercao,
      fixture, parametrizacao ou contrato verificado foi alterado, logo nada do que este registro
      afirma depende do que mudou. Suite completa apos a alteracao: 1086 testes passando, 1
      pulado com motivo declarado, portao de qualidade com 0 erros e 0 warnings.
  - registro: frente-4-2026-08-28-autoridade-de-roteamento
    caminhos:
      - tests/test_frente4_autoridade_de_roteamento.py
    parecer: >-
      Revisado e mantido valido. A mudanca neste commit toca a ancora compartilhada em
      tests/test_frente4_autoridade_de_roteamento.py, import local de funcao promovido ao topo
      (PLC0415) -- import local em teste as vezes e deliberado, para controlar o momento do
      import depois de monkeypatch -- verifiquei que nao e o caso aqui, porque os modulos
      promovidos ja eram importados no topo do mesmo arquivo. Nenhuma assercao, fixture,
      parametrizacao ou contrato verificado foi alterado, logo nada do que este registro afirma
      depende do que mudou. Suite completa apos a alteracao: 1086 testes passando, 1 pulado com
      motivo declarado, portao de qualidade com 0 erros e 0 warnings.
  - registro: handoff-2026-09-02-curadoria-mcp-quarentena-e-roteamento-lazy
    caminhos:
      - tests/test_mcp_addon_routing.py
    parecer: >-
      Revisado e mantido valido. A mudanca neste commit toca a ancora compartilhada em
      tests/test_mcp_addon_routing.py, supressao de falso positivo do pylint no topo do arquivo e
      import local de funcao promovido ao topo (PLC0415) -- comentario de supressao nao e
      executavel e nao altera coleta, assercao nem fixture; redefined-outer-name e literalmente
      como fixture de pytest funciona, e protected-access e o proposito declarado destes testes;
      import local em teste as vezes e deliberado, para controlar o momento do import depois de
      monkeypatch -- verifiquei que nao e o caso aqui, porque os modulos promovidos ja eram
      importados no topo do mesmo arquivo. Nenhuma assercao, fixture, parametrizacao ou contrato
      verificado foi alterado, logo nada do que este registro afirma depende do que mudou. Suite
      completa apos a alteracao: 1086 testes passando, 1 pulado com motivo declarado, portao de
      qualidade com 0 erros e 0 warnings.
  - registro: handoff-2026-09-08-forense-fechada-e-o-sentinela-em-vigilia
    caminhos:
      - tests/test_sentinela_delecoes.py
    parecer: >-
      Revisado e mantido valido. A mudanca neste commit toca a ancora compartilhada em
      tests/test_sentinela_delecoes.py, formatacao do ruff, sem mudanca de AST -- reformatacao do
      ruff com AST comparada antes e depois e identica. Nenhuma assercao, fixture, parametrizacao
      ou contrato verificado foi alterado, logo nada do que este registro afirma depende do que
      mudou. Suite completa apos a alteracao: 1086 testes passando, 1 pulado com motivo
      declarado, portao de qualidade com 0 erros e 0 warnings.
  - registro: registro-2026-09-01-ancora-de-merge-e-instrucao-indexada
    caminhos:
      - tests/test_record_gate_merge.py
    parecer: >-
      Revisado e mantido valido. A mudanca neste commit toca a ancora compartilhada em
      tests/test_record_gate_merge.py, supressao de falso positivo do pylint no topo do arquivo
      -- comentario de supressao nao e executavel e nao altera coleta, assercao nem fixture;
      redefined-outer-name e literalmente como fixture de pytest funciona, e protected-access e o
      proposito declarado destes testes. Nenhuma assercao, fixture, parametrizacao ou contrato
      verificado foi alterado, logo nada do que este registro afirma depende do que mudou. Suite
      completa apos a alteracao: 1086 testes passando, 1 pulado com motivo declarado, portao de
      qualidade com 0 erros e 0 warnings.
  - registro: registro-2026-09-01-cache-por-mtime-e-fusao-do-project-context
    caminhos:
      - tests/test_cache_invalidacao.py
    parecer: >-
      Revisado e mantido valido. A mudanca neste commit toca a ancora compartilhada em
      tests/test_cache_invalidacao.py, supressao de falso positivo do pylint no topo do arquivo
      -- comentario de supressao nao e executavel e nao altera coleta, assercao nem fixture;
      redefined-outer-name e literalmente como fixture de pytest funciona, e protected-access e o
      proposito declarado destes testes. Nenhuma assercao, fixture, parametrizacao ou contrato
      verificado foi alterado, logo nada do que este registro afirma depende do que mudou. Suite
      completa apos a alteracao: 1086 testes passando, 1 pulado com motivo declarado, portao de
      qualidade com 0 erros e 0 warnings.
  - registro: registro-2026-09-01-resolucao-de-skill-e-referencia-por-ponto-de-partida
    caminhos:
      - tests/test_record_index.py
    parecer: >-
      Revisado e mantido valido. A mudanca neste commit toca a ancora compartilhada em
      tests/test_record_index.py, import local de funcao promovido ao topo (PLC0415) -- import
      local em teste as vezes e deliberado, para controlar o momento do import depois de
      monkeypatch -- verifiquei que nao e o caso aqui, porque os modulos promovidos ja eram
      importados no topo do mesmo arquivo. Nenhuma assercao, fixture, parametrizacao ou contrato
      verificado foi alterado, logo nada do que este registro afirma depende do que mudou. Suite
      completa apos a alteracao: 1086 testes passando, 1 pulado com motivo declarado, portao de
      qualidade com 0 erros e 0 warnings.
  - registro: registro-2026-09-03-cobertura-cve-e-a-fronteira-do-submodulo
    caminhos:
      - tests/test_cwv_gate_cobertura_cve.py
    parecer: >-
      Revisado e mantido valido. A mudanca neste commit toca a ancora compartilhada em
      tests/test_cwv_gate_cobertura_cve.py, supressao de falso positivo do pylint no topo do
      arquivo -- comentario de supressao nao e executavel e nao altera coleta, assercao nem
      fixture; redefined-outer-name e literalmente como fixture de pytest funciona, e
      protected-access e o proposito declarado destes testes. Nenhuma assercao, fixture,
      parametrizacao ou contrato verificado foi alterado, logo nada do que este registro afirma
      depende do que mudou. Suite completa apos a alteracao: 1086 testes passando, 1 pulado com
      motivo declarado, portao de qualidade com 0 erros e 0 warnings.
  - registro: registro-2026-09-03-procedencia-de-solve-e-o-portao-de-reprodutibilidade
    caminhos:
      - tests/test_hrc_procedencia.py
    parecer: >-
      Revisado e mantido valido. A mudanca neste commit toca a ancora compartilhada em
      tests/test_hrc_procedencia.py, import local de funcao promovido ao topo (PLC0415) -- import
      local em teste as vezes e deliberado, para controlar o momento do import depois de
      monkeypatch -- verifiquei que nao e o caso aqui, porque os modulos promovidos ja eram
      importados no topo do mesmo arquivo. Nenhuma assercao, fixture, parametrizacao ou contrato
      verificado foi alterado, logo nada do que este registro afirma depende do que mudou. Suite
      completa apos a alteracao: 1086 testes passando, 1 pulado com motivo declarado, portao de
      qualidade com 0 erros e 0 warnings.
  - registro: registro-2026-09-05-fechamento-do-ciclo-de-calibracao
    caminhos:
      - tests/test_calibracao_fechamento_do_ciclo.py
      - tests/test_record_index.py
    parecer: >-
      Revisado e mantido valido. A mudanca neste commit toca a ancora compartilhada em
      tests/test_calibracao_fechamento_do_ciclo.py, supressao de falso positivo do pylint no topo
      do arquivo -- comentario de supressao nao e executavel e nao altera coleta, assercao nem
      fixture; redefined-outer-name e literalmente como fixture de pytest funciona, e
      protected-access e o proposito declarado destes testes; em tests/test_record_index.py,
      import local de funcao promovido ao topo (PLC0415) -- import local em teste as vezes e
      deliberado, para controlar o momento do import depois de monkeypatch -- verifiquei que nao
      e o caso aqui, porque os modulos promovidos ja eram importados no topo do mesmo arquivo.
      Nenhuma assercao, fixture, parametrizacao ou contrato verificado foi alterado, logo nada do
      que este registro afirma depende do que mudou. Suite completa apos a alteracao: 1086 testes
      passando, 1 pulado com motivo declarado, portao de qualidade com 0 erros e 0 warnings.
  - registro: registro-2026-09-05-saneamento-nexus-ollama-e-auto-diagnostico
    caminhos:
      - tests/test_run_inference_contrato.py
    parecer: >-
      Revisado e mantido valido. A mudanca neste commit toca a ancora compartilhada em
      tests/test_run_inference_contrato.py, supressao de falso positivo do pylint no topo do
      arquivo e import local de funcao promovido ao topo (PLC0415) -- comentario de supressao nao
      e executavel e nao altera coleta, assercao nem fixture; redefined-outer-name e literalmente
      como fixture de pytest funciona, e protected-access e o proposito declarado destes testes;
      import local em teste as vezes e deliberado, para controlar o momento do import depois de
      monkeypatch -- verifiquei que nao e o caso aqui, porque os modulos promovidos ja eram
      importados no topo do mesmo arquivo. Nenhuma assercao, fixture, parametrizacao ou contrato
      verificado foi alterado, logo nada do que este registro afirma depende do que mudou. Suite
      completa apos a alteracao: 1086 testes passando, 1 pulado com motivo declarado, portao de
      qualidade com 0 erros e 0 warnings.
  - registro: registro-2026-09-07-delegacao-gemini-flash-lite-cinco-itens
    caminhos:
      - tests/test_gpt6_astra.py
    parecer: >-
      Revisado e mantido valido. A mudanca neste commit toca a ancora compartilhada em
      tests/test_gpt6_astra.py, supressao de falso positivo do pylint no topo do arquivo --
      comentario de supressao nao e executavel e nao altera coleta, assercao nem fixture;
      redefined-outer-name e literalmente como fixture de pytest funciona, e protected-access e o
      proposito declarado destes testes. Nenhuma assercao, fixture, parametrizacao ou contrato
      verificado foi alterado, logo nada do que este registro afirma depende do que mudou. Suite
      completa apos a alteracao: 1086 testes passando, 1 pulado com motivo declarado, portao de
      qualidade com 0 erros e 0 warnings.
  - registro: registro-2026-09-07-integracao-gpt6-astra-e-retirada-do-fable
    caminhos:
      - tests/test_gpt6_astra.py
    parecer: >-
      Revisado e mantido valido. A mudanca neste commit toca a ancora compartilhada em
      tests/test_gpt6_astra.py, supressao de falso positivo do pylint no topo do arquivo --
      comentario de supressao nao e executavel e nao altera coleta, assercao nem fixture;
      redefined-outer-name e literalmente como fixture de pytest funciona, e protected-access e o
      proposito declarado destes testes. Nenhuma assercao, fixture, parametrizacao ou contrato
      verificado foi alterado, logo nada do que este registro afirma depende do que mudou. Suite
      completa apos a alteracao: 1086 testes passando, 1 pulado com motivo declarado, portao de
      qualidade com 0 erros e 0 warnings.
  - registro: registro-2026-09-07-orquestrador-api-keys-free-e-pmev
    caminhos:
      - tests/test_free_router_concurrency.py
    parecer: >-
      Revisado e mantido valido. A mudanca neste commit toca a ancora compartilhada em
      tests/test_free_router_concurrency.py, supressao de falso positivo do pylint no topo do
      arquivo -- comentario de supressao nao e executavel e nao altera coleta, assercao nem
      fixture; redefined-outer-name e literalmente como fixture de pytest funciona, e
      protected-access e o proposito declarado destes testes. Nenhuma assercao, fixture,
      parametrizacao ou contrato verificado foi alterado, logo nada do que este registro afirma
      depende do que mudou. Suite completa apos a alteracao: 1086 testes passando, 1 pulado com
      motivo declarado, portao de qualidade com 0 erros e 0 warnings.
  - registro: registro-2026-09-08-a-fase-3-passa-a-ver-python
    caminhos:
      - tests/test_cwv_gate_cobertura_cve.py
    parecer: >-
      Revisado e mantido valido. A mudanca neste commit toca a ancora compartilhada em
      tests/test_cwv_gate_cobertura_cve.py, supressao de falso positivo do pylint no topo do
      arquivo -- comentario de supressao nao e executavel e nao altera coleta, assercao nem
      fixture; redefined-outer-name e literalmente como fixture de pytest funciona, e
      protected-access e o proposito declarado destes testes. Nenhuma assercao, fixture,
      parametrizacao ou contrato verificado foi alterado, logo nada do que este registro afirma
      depende do que mudou. Suite completa apos a alteracao: 1086 testes passando, 1 pulado com
      motivo declarado, portao de qualidade com 0 erros e 0 warnings.
  - registro: registro-2026-09-08-a-porta-que-responde-e-a-porta-que-mede
    caminhos:
      - tests/test_cwv_gate_porta_cdp.py
    parecer: >-
      Revisado e mantido valido. A mudanca neste commit toca a ancora compartilhada em
      tests/test_cwv_gate_porta_cdp.py, supressao de falso positivo do pylint no topo do arquivo
      -- comentario de supressao nao e executavel e nao altera coleta, assercao nem fixture;
      redefined-outer-name e literalmente como fixture de pytest funciona, e protected-access e o
      proposito declarado destes testes. Nenhuma assercao, fixture, parametrizacao ou contrato
      verificado foi alterado, logo nada do que este registro afirma depende do que mudou. Suite
      completa apos a alteracao: 1086 testes passando, 1 pulado com motivo declarado, portao de
      qualidade com 0 erros e 0 warnings.
  - registro: registro-2026-09-08-adaptacao-gemini-flash-e-saneamento-amostragem
    caminhos:
      - tests/test_adapters_gemini_http.py
    parecer: >-
      Revisado e mantido valido. A mudanca neste commit toca a ancora compartilhada em
      tests/test_adapters_gemini_http.py, import declarado no topo e import de typing.Any --
      import acrescentado no topo, sem remover nenhum existente e sem tocar corpo de teste;
      apenas anotacao de tipo, sem efeito em execucao. Nenhuma assercao, fixture, parametrizacao
      ou contrato verificado foi alterado, logo nada do que este registro afirma depende do que
      mudou. Suite completa apos a alteracao: 1086 testes passando, 1 pulado com motivo
      declarado, portao de qualidade com 0 erros e 0 warnings.
  - registro: registro-2026-09-08-alternancia-de-extensoes-no-portao-de-registro
    caminhos:
      - tests/test_record_index.py
    parecer: >-
      Revisado e mantido valido. A mudanca neste commit toca a ancora compartilhada em
      tests/test_record_index.py, import local de funcao promovido ao topo (PLC0415) -- import
      local em teste as vezes e deliberado, para controlar o momento do import depois de
      monkeypatch -- verifiquei que nao e o caso aqui, porque os modulos promovidos ja eram
      importados no topo do mesmo arquivo. Nenhuma assercao, fixture, parametrizacao ou contrato
      verificado foi alterado, logo nada do que este registro afirma depende do que mudou. Suite
      completa apos a alteracao: 1086 testes passando, 1 pulado com motivo declarado, portao de
      qualidade com 0 erros e 0 warnings.
  - registro: registro-2026-09-08-forense-das-delecoes-e-o-sentinela
    caminhos:
      - tests/test_sentinela_delecoes.py
    parecer: >-
      Revisado e mantido valido. A mudanca neste commit toca a ancora compartilhada em
      tests/test_sentinela_delecoes.py, formatacao do ruff, sem mudanca de AST -- reformatacao do
      ruff com AST comparada antes e depois e identica. Nenhuma assercao, fixture, parametrizacao
      ou contrato verificado foi alterado, logo nada do que este registro afirma depende do que
      mudou. Suite completa apos a alteracao: 1086 testes passando, 1 pulado com motivo
      declarado, portao de qualidade com 0 erros e 0 warnings.
  - registro: registro-2026-09-08-publicacao-assistida-do-saneamento-de-terminal
    caminhos:
      - tests/test_run_inference_contrato.py
    parecer: >-
      Revisado e mantido valido. A mudanca neste commit toca a ancora compartilhada em
      tests/test_run_inference_contrato.py, supressao de falso positivo do pylint no topo do
      arquivo e import local de funcao promovido ao topo (PLC0415) -- comentario de supressao nao
      e executavel e nao altera coleta, assercao nem fixture; redefined-outer-name e literalmente
      como fixture de pytest funciona, e protected-access e o proposito declarado destes testes;
      import local em teste as vezes e deliberado, para controlar o momento do import depois de
      monkeypatch -- verifiquei que nao e o caso aqui, porque os modulos promovidos ja eram
      importados no topo do mesmo arquivo. Nenhuma assercao, fixture, parametrizacao ou contrato
      verificado foi alterado, logo nada do que este registro afirma depende do que mudou. Suite
      completa apos a alteracao: 1086 testes passando, 1 pulado com motivo declarado, portao de
      qualidade com 0 erros e 0 warnings.
  - registro: registro-2026-09-08-ruff-format-e-o-ci-vermelho
    caminhos:
      - tests/test_computational_molds.py
      - tests/test_record_index.py
      - tests/test_run_inference_contrato.py
    parecer: >-
      Revisado e mantido valido. A mudanca neste commit toca a ancora compartilhada em
      tests/test_computational_molds.py, formatacao do ruff, sem mudanca de AST -- reformatacao
      do ruff com AST comparada antes e depois e identica; em tests/test_record_index.py, import
      local de funcao promovido ao topo (PLC0415) -- import local em teste as vezes e deliberado,
      para controlar o momento do import depois de monkeypatch -- verifiquei que nao e o caso
      aqui, porque os modulos promovidos ja eram importados no topo do mesmo arquivo; em
      tests/test_run_inference_contrato.py, supressao de falso positivo do pylint no topo do
      arquivo e import local de funcao promovido ao topo (PLC0415) -- comentario de supressao nao
      e executavel e nao altera coleta, assercao nem fixture; redefined-outer-name e literalmente
      como fixture de pytest funciona, e protected-access e o proposito declarado destes testes;
      import local em teste as vezes e deliberado, para controlar o momento do import depois de
      monkeypatch -- verifiquei que nao e o caso aqui, porque os modulos promovidos ja eram
      importados no topo do mesmo arquivo. Nenhuma assercao, fixture, parametrizacao ou contrato
      verificado foi alterado, logo nada do que este registro afirma depende do que mudou. Suite
      completa apos a alteracao: 1086 testes passando, 1 pulado com motivo declarado, portao de
      qualidade com 0 erros e 0 warnings.
  - registro: registro-2026-09-09-actionlint-e-a-fronteira-do-submodulo
    caminhos:
      - tests/test_actionlint_fronteira_do_submodulo.py
    parecer: >-
      Revisado e mantido valido. A mudanca neste commit toca a ancora compartilhada em
      tests/test_actionlint_fronteira_do_submodulo.py, supressao de falso positivo do pylint no
      topo do arquivo -- comentario de supressao nao e executavel e nao altera coleta, assercao
      nem fixture; redefined-outer-name e literalmente como fixture de pytest funciona, e
      protected-access e o proposito declarado destes testes. Nenhuma assercao, fixture,
      parametrizacao ou contrato verificado foi alterado, logo nada do que este registro afirma
      depende do que mudou. Suite completa apos a alteracao: 1086 testes passando, 1 pulado com
      motivo declarado, portao de qualidade com 0 erros e 0 warnings.
  - registro: registro-2026-09-09-appkey-lida-por-string-e-a-fronteira-de-autoridade
    caminhos:
      - tests/test_appkey_contexto_da_app.py
      - tests/test_database_sota.py
    parecer: >-
      Revisado e mantido valido. A mudanca neste commit toca a ancora compartilhada em
      tests/test_appkey_contexto_da_app.py, supressao de falso positivo do pylint no topo do
      arquivo e from __future__ import annotations e import local de funcao promovido ao topo
      (PLC0415) -- comentario de supressao nao e executavel e nao altera coleta, assercao nem
      fixture; redefined-outer-name e literalmente como fixture de pytest funciona, e
      protected-access e o proposito declarado destes testes; adia a avaliacao de anotacao em
      tempo de execucao; nenhum teste deste arquivo inspeciona anotacao em runtime; import local
      em teste as vezes e deliberado, para controlar o momento do import depois de monkeypatch --
      verifiquei que nao e o caso aqui, porque os modulos promovidos ja eram importados no topo
      do mesmo arquivo; em tests/test_database_sota.py, supressao de falso positivo do pylint no
      topo do arquivo e from __future__ import annotations e import local de funcao promovido ao
      topo (PLC0415) -- comentario de supressao nao e executavel e nao altera coleta, assercao
      nem fixture; redefined-outer-name e literalmente como fixture de pytest funciona, e
      protected-access e o proposito declarado destes testes; adia a avaliacao de anotacao em
      tempo de execucao; nenhum teste deste arquivo inspeciona anotacao em runtime; import local
      em teste as vezes e deliberado, para controlar o momento do import depois de monkeypatch --
      verifiquei que nao e o caso aqui, porque os modulos promovidos ja eram importados no topo
      do mesmo arquivo. Nenhuma assercao, fixture, parametrizacao ou contrato verificado foi
      alterado, logo nada do que este registro afirma depende do que mudou. Suite completa apos a
      alteracao: 1086 testes passando, 1 pulado com motivo declarado, portao de qualidade com 0
      erros e 0 warnings.
  - registro: registro-2026-09-09-o-axe-mede-extensao-de-navegador
    caminhos:
      - tests/test_probe_fronteira_da_extensao.py
    parecer: >-
      Revisado e mantido valido. A mudanca neste commit toca a ancora compartilhada em
      tests/test_probe_fronteira_da_extensao.py, supressao de falso positivo do pylint no topo do
      arquivo -- comentario de supressao nao e executavel e nao altera coleta, assercao nem
      fixture; redefined-outer-name e literalmente como fixture de pytest funciona, e
      protected-access e o proposito declarado destes testes. Nenhuma assercao, fixture,
      parametrizacao ou contrato verificado foi alterado, logo nada do que este registro afirma
      depende do que mudou. Suite completa apos a alteracao: 1086 testes passando, 1 pulado com
      motivo declarado, portao de qualidade com 0 erros e 0 warnings.
  - registro: registro-2026-09-09-o-guard-media-o-interpretador-e-nao-o-sistema
    caminhos:
      - tests/test_sentinela_delecoes.py
    parecer: >-
      Revisado e mantido valido. A mudanca neste commit toca a ancora compartilhada em
      tests/test_sentinela_delecoes.py, formatacao do ruff, sem mudanca de AST -- reformatacao do
      ruff com AST comparada antes e depois e identica. Nenhuma assercao, fixture, parametrizacao
      ou contrato verificado foi alterado, logo nada do que este registro afirma depende do que
      mudou. Suite completa apos a alteracao: 1086 testes passando, 1 pulado com motivo
      declarado, portao de qualidade com 0 erros e 0 warnings.
  - registro: registro-2026-09-09-o-portao-local-passa-a-checar-o-que-o-ci-checa
    caminhos:
      - tests/test_cwv_gate_cobertura_cve.py
      - tests/test_cwv_gate_ruff_format.py
    parecer: >-
      Revisado e mantido valido. A mudanca neste commit toca a ancora compartilhada em
      tests/test_cwv_gate_cobertura_cve.py, supressao de falso positivo do pylint no topo do
      arquivo -- comentario de supressao nao e executavel e nao altera coleta, assercao nem
      fixture; redefined-outer-name e literalmente como fixture de pytest funciona, e
      protected-access e o proposito declarado destes testes; em
      tests/test_cwv_gate_ruff_format.py, supressao de falso positivo do pylint no topo do
      arquivo -- comentario de supressao nao e executavel e nao altera coleta, assercao nem
      fixture; redefined-outer-name e literalmente como fixture de pytest funciona, e
      protected-access e o proposito declarado destes testes. Nenhuma assercao, fixture,
      parametrizacao ou contrato verificado foi alterado, logo nada do que este registro afirma
      depende do que mudou. Suite completa apos a alteracao: 1086 testes passando, 1 pulado com
      motivo declarado, portao de qualidade com 0 erros e 0 warnings.
---

# Auditoria da campanha de lint em 31 testes e 1 arquivo de producao

## 1. O que havia

A arvore do `Site` tinha 33 arquivos modificados e nao commitados, deixados por
uma campanha de lint anterior: 31 testes, `tools/hybrid_router/test_hybrid_router.py`
e -- o unico que importava de verdade -- `llm/free_router.py`, codigo de producao.

A regra que orientou a auditoria: **suite verde com a mudanca nao prova que a
mudanca e boa.** Prova que nada quebrou. Enfraquecer uma assercao tambem deixa a
suite verde, e e exatamente o que aconteceu em dois pontos.

## 2. Mantido, por ser correto

| Classe | Ocorrencias | Por que fica |
| :--- | ---: | :--- |
| `# pylint: disable` no topo | 15 | falso positivo conhecido em idioma de pytest |
| Import local promovido ao topo | 11 | os modulos ja eram importados no topo do mesmo arquivo |
| `from __future__ import annotations` | 3 | nenhum teste inspeciona anotacao em runtime |
| Renomeacao `nA` -> `node_a` | 1 arquivo | mesmos valores, mesma ordem, mesmas assercoes |
| Formatacao do ruff | 2 | AST comparada, identica |

Os `disable` merecem nota, porque **parecem** contorno de portao e nao sao.
`redefined-outer-name` e literalmente como fixture de pytest funciona: a funcao
recebe um parametro com o nome da fixture, que existe no escopo do modulo.
`protected-access` e o proposito declarado destes testes, que exercitam internals.
`unsubscriptable-object` sobre `model_fields[...]` e falso positivo do pylint em
pydantic, e ficou inline, estreito. Silenciar ruido conhecido de linter nao e o
mesmo que passar por cima de um portao que reprovou.

O caso dos imports exigiu medicao e nao leitura. Import local dentro de funcao de
teste **as vezes e deliberado**, para adiar o import ate depois de um `monkeypatch`
em `sys.path` ou em variavel de ambiente; promove-lo ao topo quebraria o teste de
forma sutil. Verifiquei arquivo a arquivo: nos 11 casos, o modulo promovido ja
constava do topo do mesmo arquivo. Nao havia adiamento a preservar.

## 3. Revertido

### 3.1 `llm/free_router.py` -- o unico arquivo de producao

A campanha trocou um objeto tipado do SDK por dicionario cru:

```
- cfg_kwargs["thinking_config"] = types.ThinkingConfig(thinking_level=thinking_level)
+ cfg_kwargs["thinking_config"] = {"thinking_level": thinking_level}
```

A hipotese obvia era que `ThinkingConfig` nao aceitasse `thinking_level` na versao
instalada, e o dicionario fosse contorno de `TypeError`. **Medi, e nao era.** No
`google-genai` 2.6.0 o campo existe, as duas formas produzem o mesmo
`ThinkingConfig(thinking_level=<ThinkingLevel.LOW>)`, e as duas rejeitam chave
errada com `ValidationError` -- pydantic coage o dicionario e valida igual.

Ou seja: neutra. Sem teste que a exigisse, sem justificativa, e destoando do
`types.GenerateContentConfig` da mesma linha. **Mudanca neutra e injustificada em
codigo de producao volta ao estado commitado.**

### 3.2 Duas assercoes que perderam precisao

```
- assert headers == {}
+ assert not headers
```

Um dos dois testes se chama `test_modelo_sem_beta_nao_inventa_header`. Ele existe
para fixar que o adaptador devolve **dicionario vazio**. A versao nova passa
tambem se o adaptador devolver `None`, `[]`, `""` ou `0` -- o teste deixaria de
detectar uma mudanca de contrato de retorno.

A regra de truthiness implicita esta certa em fluxo de controle e **errada em
assercao**, cujo proposito e ser exata. Foi a unica alteracao da campanha inteira
com perda real de poder de deteccao, e a unica razao pela qual esta auditoria
precisava existir.

## 4. O portao mandou comparar a AST, e eu comparei

`tests/test_governanca_agents.py` bloqueou o commit por estar fora do formato do
ruff. A mensagem do portao nao manda so formatar: manda **comparar a AST antes e
depois em vez de aceitar a mudanca**. Feito -- identicas. A diferenca e uma linha
em branco apos docstring.

## 5. Metodo, e uma correcao de processo

Os 32 pareceres de ancora deste commit foram gerados **depois** de rodar o portao
e obter a lista completa, e a partir da classificacao medida do diff de cada
caminho -- nao de suposicao sobre o conteudo dos registros.

Isto corrige um erro de processo do dia anterior, em que escrevi 3 pareceres,
descobri 19, escrevi 19 e descobri 29. Rodar o medidor antes de produzir o
documento custa um comando e evita tres rodadas. **O portao e barato de consultar
e caro de adivinhar.**
