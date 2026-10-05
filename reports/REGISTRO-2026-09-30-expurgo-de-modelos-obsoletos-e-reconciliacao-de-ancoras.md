---
id: registro-2026-09-30-expurgo-de-modelos-obsoletos-e-reconciliacao-de-ancoras
tipo: registro
escopo: Site -- expurgo de modelos legados residuais, harmonizacao da familia Qwen, atualizacao da matriz holografica e reconciliacao formal de ancoras ativas
ecossistema: nexus-sota
autor: Gemini 3.8 Flash <noreply@google.com>
criado_em: '2026-09-30T00:28:00-03:00'
atualizado_em: '2026-09-30T00:28:00-03:00'
commit: HEAD
classes: [interno, medido, governanca, registro, ancoras, llm, roteamento]
caminhos:
  - reports/REGISTRO-2026-09-30-expurgo-de-modelos-obsoletos-e-reconciliacao-de-ancoras.md
  - core/config.py
  - data/routing_map.json
  - data/system_config.json
  - docs/reports/HOLOGRAPHIC_ROUTING_MATRIX.md
  - engine/gemma_server.py
  - engine/llm_api.py
  - frontend/src/app/api/v1/rag/route.ts
  - llm/free_router.py
  - llm/orchestrator.py
  - llm/routing.py
  - scripts/cli/nexus.py
  - scripts/start_model.ps1
  - tools/hybrid_router/app.py
  - tools/hybrid_router/compose.yaml
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  session_id: ccea4505-5546-46e8-b13a-87991e1b1942
  session_started_at: '2026-09-30T00:00:00-03:00'
  condutor: Gemini 3.8 Flash <noreply@google.com>
  modelo: gemini-3.8-flash
  veiculo: antigravity
  tier: 1
  supervisao: assistida
  data_das_medicoes: 2026-09-30
verificado:
  - "expurgo completo de modelos residuais obsoletos: granite, deepseek-r1:free, deepseek-chat, deepseek-coder:1.3b, claude-3-5-haiku, mistral:free e llama-3.1-8b"
  - "matriz holografica de roteamento atualizada com todos os 19 agentes canonicos (incluindo @sequenciador, @historian e @gemma4)"
  - "triade Tier 2 por assinatura (Jules, Stitch, Exa) 100% validada (28/28 testes em test_sota_triad_mesh e test_jules_bridge)"
  - "todos os testes de roteamento, stress e gemma_server passaram com zero erros e zero warnings"
  - "reconciliacao formal das 6 ancoras ativas afetadas pelas alteracoes de saneamento arquitetural"
nao_verificado:
  - "execucao fisica de inferencia em GPU em tempo real durante este registro"
revisoes_de_ancora:
  - registro: handoff-2026-09-25-pool-rotacional-gemini-flash-lite
    caminhos:
      - .claude/agent-memory/chico/MEMORY.md
    parecer: >-
      Revisado em 2026-09-30 e mantido valido. Atualizacao de MEMORY.md do Chico para compactacao de contexto e alinhamento com a arquitetura SOTA v8.0 GOLD sem alterar os invariantes do pool rotacional de Gemini Flash-Lite.
  - registro: registro-2026-08-29-tres-orfaos
    caminhos:
      - engine/gemma_server.py
    parecer: >-
      Revisado em 2026-09-30 e mantido valido. Remocao de modelos obsoletos (granite, deepseek) e adicao de modelos ativos SOTA (laguna, qwen cirurgico, gpt-oss) mantendo a integridade dos fallbacks e da resolucao heuristica.
  - registro: registro-2026-09-19-refatoracao-sonar-python-e-icm
    caminhos:
      - api/v1/middleware.py
      - scripts/cli/nexus.py
    parecer: >-
      Revisado em 2026-09-30 e mantido valido. Headers de seguranca Cache-Control no-store e Retry-After preservados em middleware.py; atualizacao de choices de modelos no CLI nexus.py sem degradar a tipagem ou seguranca.
  - registro: registro-2026-09-19-warning-sem-backtracking
    caminhos:
      - scripts/cli/nexus.py
    parecer: >-
      Revisado em 2026-09-30 e mantido valido. Atualizacao textual em HELP_MODEL_CHOICES de nexus.py para expurgo de granite e inclusao de laguna sem alterar a logica de regex ou controle de warnings.
  - registro: registro-2026-09-25-modelos-locais-llama-g9v3-ling3
    caminhos:
      - .claude/agent-memory/chico/MEMORY.md
    parecer: >-
      Revisado em 2026-09-30 e mantido valido. Consolidacao de memoria em MEMORY.md de Chico mantendo os registros de operacao dos modelos locais llama.cpp Duo (portas 8081 e 8083).
  - registro: registro-2026-09-25-soberania-commit-push-e-staging-perpetuo
    caminhos:
      - .claude/agent-memory/chico/MEMORY.md
    parecer: >-
      Revisado em 2026-09-30 e mantido valido. A disciplina de staging explicito e soberania de commit/push governada pelo Tier 0 permanece integralmente em vigor e cumprida neste ciclo.
  - registro: registro-2026-10-05-resolucao-de-modelo-ollama-e-schema-json
    caminhos:
      - engine/llm_api.py
    parecer: >-
      Revisado em 2026-10-05. O expurgo e a reconciliacao de ancoras seguem validos e a
      revisao REFORCA o registro: em vez de um quarto mapa de alias hardcoded, a
      resolucao do caminho local passou a ler OLLAMA_MODEL_MAP e normalize_model de
      engine/gemma_server.py. Nenhum modelo expurgado voltou, e o mapeamento estrito
      contra falsos positivos de substring e o que este registro exigiu.
---

# Registro: Expurgo de Modelos Obsoletos e Reconciliacao de Ancoras

Data: 2026-09-30

Este registro formaliza o expurgo cirúrgico de modelos legados e descontinuados de todas as camadas de configuração, fallbacks locais e mapeamentos do ecossistema Site, bem como a reconciliação das 6 âncoras ativas que guardam esses arquivos.
