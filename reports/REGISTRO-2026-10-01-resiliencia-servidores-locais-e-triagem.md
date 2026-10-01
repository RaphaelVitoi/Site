---
id: registro-2026-10-01-resiliencia-servidores-locais-e-triagem
tipo: registro
escopo: Site -- resiliencia dual dos servidores locais (Ollama e llama.cpp), correcao de triagem de modelos e contingencia graciosa
ecossistema: nexus-sota
autor: Gemini 3.8 Flash <noreply@google.com>
criado_em: '2026-10-01T20:00:00-03:00'
atualizado_em: '2026-10-01T20:00:00-03:00'
commit: HEAD
classes: [interno, medido, governanca, registro, ancoras, llm, servidores]
caminhos:
  - reports/REGISTRO-2026-10-01-resiliencia-servidores-locais-e-triagem.md
  - engine/gemma_server.py
  - engine/llm_api.py
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  session_id: 1eae919c-b5e6-4f60-8935-0e603f5c08d0
  session_started_at: '2026-10-01T19:00:00-03:00'
  condutor: Gemini 3.8 Flash <noreply@google.com>
  modelo: gemini-3.8-flash
  veiculo: antigravity
  tier: 1
  supervisao: assistida
  data_das_medicoes: 2026-10-01
verificado:
  - "inicializacao e operacao do daemon Ollama em 127.0.0.1:11434"
  - "inicializacao e operacao do llama-server Vulkan para G9v3-3B em 127.0.0.1:8081 com health ok"
  - "inicializacao e operacao do llama-server Vulkan para Qwen2.5-Coder-1.5B em 127.0.0.1:8083 com health ok"
  - "inicializacao e operacao do proxy FastAPI gemma_server em 127.0.0.1:17043 com health ok e mapeamento de gemma4:31b-cloud"
  - "otimizacao da triagem para priorizar modelos ageis (gemma4:e2b local, G9v3 llama.cpp 8081, QwenCoder 8083 ou gemini-3.5-flash-lite nuvem)"
  - "adicao de fallback dual em engine/llm_api.py (proxy 17043 -> Ollama 11434 -> Gemini Cloud Flash-Lite)"
  - "execucao completa da suite de testes de roteamento e integracao (89 passed com zero erros e zero warnings)"
nao_verificado:
  - "execucao de modelos de mais de 30B parametros em hardware local com VRAM limitada a 8GB"
revisoes_de_ancora:
  - registro: handoff-2026-09-30-expurgo-de-modelos-obsoletos-harmonizacao-qwen-e-calibracao
    caminhos:
      - engine/gemma_server.py
      - engine/llm_api.py
    parecer: >-
      Revisado em 2026-10-01 e mantido valido. Implementada resiliencia dual entre proxy 17043 e Ollama 11434, alem de fallback gracioso para triagem externa em gemini-3.5-flash-lite e suporte nativo ao LocalLlamaClient, preservando os invariantes de saneamento de modelos.
  - registro: registro-2026-08-29-tres-orfaos
    caminhos:
      - engine/gemma_server.py
    parecer: >-
      Revisado em 2026-10-01 e mantido valido. Adicionado endpoint de health e normalizacao de triagem para e2b e 31b_cloud, mantendo estrita a resolucao heuristica e eliminando chamadas desnecessarias a modelos pesados em operacoes ageis.
  - registro: registro-2026-09-30-expurgo-de-modelos-obsoletos-e-reconciliacao-de-ancoras
    caminhos:
      - engine/gemma_server.py
      - engine/llm_api.py
    parecer: >-
      Revisado em 2026-10-01 e mantido valido. Reconciliacao formal das rotas de execucao locais e cloud para assegurar alta disponibilidade sem violar a matriz holografica de roteamento.
---

# Registro: Resiliencia dos Servidores Locais e Otimizacao de Triagem

Data: 2026-10-01

Este registro formaliza:
1. A inicializacao e persistencia dos servidores de inferencia local: Ollama (porta 11434), llama.cpp G9v3 (porta 8081), llama.cpp Qwen2.5-Coder (porta 8083) e o proxy gemma_server (porta 17043).
2. O refinamento da triagem cognitiva, substituindo demandas pesadas por modelos rapidos (e2b localmente, 31b exclusivamente em nuvem via Ollama, e contingencia externa gratuita via gemini-3.5-flash-lite).
3. A resiliencia dual e tolerante a falhas nas chamadas assincronas de inferencia em engine/llm_api.py.
4. A reconciliacao das 3 ancoras ativas que guardam engine/gemma_server.py e engine/llm_api.py.
