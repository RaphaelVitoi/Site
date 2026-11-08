---
id: registro-2026-11-08-harmonizacao-logs-testes-e-materializacao-submodulos
tipo: registro
escopo: Site -- Harmonizacao e saneamento de live logs (test_middleware_correlation e test_routing_policy) e materializacao integral de submodulos de skills
ecossistema: nexus-sota
autor: Gemini 3.8 Flash <noreply@google.com>
criado_em: '2026-11-08T10:06:00-03:00'
atualizado_em: '2026-11-08T10:06:00-03:00'
commit: HEAD
verificado:
  - 'Materializacao e checkout de todos os submodulos de skills (Stitch, exa-mcp-server, gemini-cli-jules, gemini-cli-security, gemini-deep-research, gemini-supermemory, token-efficiency)'
  - 'Aprovacao de 100% dos testes de test_patches_skills.py sem nenhum teste pulado (0 skips)'
  - 'Supressao de traceback simulado 500 em test_middleware_correlation.py via controle de nivel de log no escopo do teste'
  - 'Supressao de avisos repetitivos de escalonamento em test_routing_policy.py no teste test_rotear_e_decidir_nunca_divergem'
  - 'Ruff check, ruff format e nexus ops check-ascii 100% aprovados'
nao_verificado:
  - 'Execucao em maquinas sem acesso a submodulos git'
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  data_das_medicoes: '2026-11-08'
  toolchain: uv sync + ruff check + pytest + record_gate.py
  python: 3.14.9
  so: Windows
classes:
  - interno
  - medido
  - governanca
  - registro
  - submodulos
  - telemetria
caminhos:
  - tests/test_middleware_correlation.py
  - tests/test_routing_policy.py
  - reports/REGISTRO-2026-11-08-harmonizacao-logs-testes-e-materializacao-submodulos.md
revisoes_de_ancora:
  - registro: registro-2026-08-29-o-fallback-que-nao-carrega
    caminhos:
      - tests/test_routing_policy.py
    parecer: 'Revisao em 2026-11-08: encapsulamento do nivel de log em test_rotear_e_decidir_nunca_divergem para evitar poluicao de live logs sem alterar a semantica de roteamento.'
  - registro: registro-2026-10-04-http-metrics-correlation-e-worker-shutdown
    caminhos:
      - tests/test_middleware_correlation.py
    parecer: 'Revisao em 2026-11-08: supressao do traceback simulado no logger aiohttp.server durante a assercao de HTTP 500.'
---

# Registro 2026-11-08: Harmonizacao de Logs e Materializacao de Submodulos

Resolucao integral das recomendacoes aprovadas pelo usuario:
1. **Materializacao de Submodulos:** Submodulos `skills/*` devidamente inicializados via `git submodule update --init`, eliminando os skips em `test_patches_skills.py` (5 passed).
2. **Higiene de Logs em Testes de Erro:** `test_middleware_correlation.py` agora suprime o traceback de `aiohttp.server` durante a falha simulada 500, eliminando falsos positivos de ERROR nos logs de CI.
3. **Harmonizacao de Roteamento:** `test_routing_policy.py` encapsula a checagem exaustiva de divergencia com nivel controlado de log, preservando a assercao de warning no teste dedicado `test_rotear_registra_o_escalonamento_que_nao_aconteceu`.
