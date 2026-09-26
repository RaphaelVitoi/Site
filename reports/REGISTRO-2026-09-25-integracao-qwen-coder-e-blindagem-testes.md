---
id: registro-2026-09-25-integracao-qwen-coder-e-blindagem-testes
tipo: registro
escopo: Site -- integracao de Qwen2.5-Coder-1.5B Q8_0 no llama.cpp Vulkan, correcao de deteccao de chaves e isolamento de testes de CPU fallback
ecossistema: nexus-sota
autor: gemini-3.8-flash
criado_em: '2026-09-25T23:33:00-03:00'
atualizado_em: '2026-09-25T23:33:00-03:00'
commit: HEAD
classes: [interno, medido, governanca, registro, local-llm, qwen, vulkan]
caminhos:
  - llm/budget.py
  - llm/local_llama_client.py
  - scripts/ops/Start-LocalLlama.ps1
  - tests/test_laya_fase4_predict.py
  - tests/test_laya_fase5_solver_adapter.py
  - reports/REGISTRO-2026-09-25-integracao-qwen-coder-e-blindagem-testes.md
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  session_id: 31abdec0-f1f1-44d8-a782-de88a85e8c3a
  session_started_at: '2026-09-25T20:38:00-03:00'
  condutor: Gemini 3.8 Flash <noreply@google.com>
  modelo: gemini-3.8-flash
  veiculo: antigravity
  tier: 1
  supervisao: assistida
  data_das_medicoes: 2026-09-25
verificado:
  - "qwen-coder-1.5b: Modelo Qwen2.5-Coder-1.5B Q8_0 (1.57 GB) integrado em C:/Users/rapha/models/gguf e conectado na porta 8083"
  - "client-local-coder: get_local_coder() implementado em llm/local_llama_client.py para porta 8083"
  - "runner-qwen: scripts/ops/Start-LocalLlama.ps1 atualizado para suportar G9v3, Ling3 e QwenCoder"
  - "budget-key-check: llm/budget.py ajustado para validar chaves reais minimas e rejeitar dummy-"
  - "testes-isolados: tests/test_laya_fase4_predict.py e fase5 ajustados com isolamento de fixture para fallback CPU"
nao_verificado:
  - "nenhuma verificacao omitida"
revisoes_de_ancora:
  - registro: registro-2026-08-29-tres-orfaos
    caminhos:
      - llm/budget.py
    parecer: >-
      Revisado e mantido valido. O ajuste pontual no filtro de chaves de budget.py preserva os contratos de orfaos e compatibilidade de chaves.
  - registro: registro-2026-09-25-pools-de-chaves-openrouter-multi-tier
    caminhos:
      - llm/budget.py
    parecer: >-
      Revisado e mantido valido. A deteccao de chaves reais segue estritamente compativel com os pools multi-tier OpenRouter e Gemini.
  - registro: registro-2026-09-25-modelos-locais-llama-g9v3-ling3
    caminhos:
      - llm/local_llama_client.py
      - scripts/ops/Start-LocalLlama.ps1
    parecer: >-
      Revisado e mantido valido. A adicao do modelo Qwen2.5-Coder na porta 8083 expande o runner e cliente sem quebrar os servicos G9v3 e Ling3 existentes.
---

# REGISTRO: INTEGRACAO QWEN2.5-CODER-1.5B E BLINDAGEM DE TESTES

## 1. Contexto e Objetivos

Integracao do modelo local Qwen2.5-Coder-1.5B Q8_0 (1.57 GB) no cluster de inferencia local llama.cpp sobre a GPU AMD Radeon RX 570 8GB VRAM (Vulkan0), estabelecendo:
1. **Porta 8081:** AI9Stars G9v3-3B (Tool calling, automacoes e formatacao JSON).
2. **Porta 8082:** Ling-3.0-tiny MoE (Sintese sem alucinacao e fluencia em Portugues BR).
3. **Porta 8083:** Qwen2.5-Coder-1.5B Q8_0 (Engenharia de codigo cirurgica, patches, linting e autocomplete).

## 2. Ajustes de Homeostase

- **llm/budget.py:** `_is_real_key_value` atualizado para comprimento minimo de 12 caracteres (permitindo chaves sinteticas de teste) e rejeicao explicita de prefixos `dummy-`.
- **tests/test_laya_fase4_predict.py e tests/test_laya_fase5_solver_adapter.py:** Fixtures com `monkeypatch.setenv("CHICO_LAYA_PREDICT_ALLOW_CPU", "0")` para isolamento hermitico dos testes de fallback contra variaveis de ambiente de desenvolvimento.
