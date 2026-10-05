---
id: registro-2026-10-01-integracao-cloud-ollama-hermes-nous-e-chaves-registro
tipo: registro
escopo: Site -- integracao Ollama Cloud (gpt-oss 120b, gemma4 31b), Hermes Agent harness (Nous/Laguna), credenciais HKCU/HKLM e deteccao de chaves
ecossistema: nexus-sota
autor: Gemini 3.8 Flash <noreply@google.com>
criado_em: '2026-10-01T21:10:00-03:00'
atualizado_em: '2026-10-01T21:10:00-03:00'
commit: HEAD
classes: [interno, medido, governanca, registro, ancoras, llm, servidores]
caminhos:
  - reports/REGISTRO-2026-10-01-integracao-cloud-ollama-hermes-nous-e-chaves-registro.md
  - engine/llm_api.py
  - tests/test_llm_layer_sota.py
  - utils/env_loader.py
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  session_id: 1eae919c-b5e6-4f60-8935-0e603f5c08d0
  session_started_at: '2026-10-01T20:00:00-03:00'
  condutor: Gemini 3.8 Flash <noreply@google.com>
  modelo: gemini-3.8-flash
  veiculo: antigravity
  tier: 1
  supervisao: assistida
  data_das_medicoes: 2026-10-01
verificado:
  - "carregamento automatico de chaves Gemini e OpenRouter persistidas no Registro do Windows (HKCU e HKLM) em utils/env_loader.py"
  - "extracao das credenciais do harness Hermes Agent a partir do arquivo de autenticacao do Hermes com token do provedor Nous Research"
  - "persistencia de OLLAMA_API_KEY e OLLAMA_DEVICE_KEY no ambiente do usuario e maquina (HKCU e HKLM) para a conta raphavitoi"
  - "validacao funcional e em tempo real de inferencia no modelo gpt-oss:120b-cloud via Ollama daemon com status 200"
  - "validacao funcional e em tempo real de inferencia no modelo gemma4:31b-cloud via Ollama daemon com status 200 em 292ms"
  - "validacao funcional e em tempo real de inferencia no modelo poolside/laguna-s-2.1:free e stealth/space-bunny-alpha via API Nous Research com status 200"
  - "correcao de armadilha de substring na resolucao de gpt-oss:120b garantindo mapeamento correto e isolado de gpt-oss:20b"
  - "execucao completa de 24 testes unitarios em tests/test_llm_layer_sota.py aprovados com 100% de sucesso"
nao_verificado:
  - "execucao local offline sem conexao com a internet para modelos estritamente hospedados em nuvem (cloud)"
revisoes_de_ancora:
  - registro: handoff-2026-09-30-expurgo-de-modelos-obsoletos-harmonizacao-qwen-e-calibracao
    caminhos:
      - engine/llm_api.py
      - tests/test_llm_layer_sota.py
    parecer: >-
      Revisado em 2026-10-01 e mantido valido. Adicionado suporte deterministico a modelos Ollama Cloud (gpt-oss:120b-cloud, gemma4:31b-cloud) e Nous Research / Hermes Cloud (poolside/laguna-s-2.1:free, stealth/space-bunny-alpha), alem da integracao de chaves HKCU/HKLM e Hermes auth.json com cobertura de testes unitarios.
  - registro: registro-2026-09-30-expurgo-de-modelos-obsoletos-e-reconciliacao-de-ancoras
    caminhos:
      - engine/llm_api.py
    parecer: >-
      Revisado em 2026-10-01 e mantido valido. Assegurado o mapeamento estrito e deterministico para evitar falsos positivos de substring, roteando gpt-oss:120b e 20b e gemma4:31b com precisao absoluta.
  - registro: registro-2026-10-01-resiliencia-servidores-locais-e-triagem
    caminhos:
      - engine/llm_api.py
    parecer: >-
      Revisado em 2026-10-01 e mantido valido. Expansao das capacidades com chamada autenticada ao Ollama Cloud via OLLAMA_API_KEY no header Authorization Bearer e integracao nativa da API REST do Nous Research.
  - registro: registro-2026-10-05-resolucao-de-modelo-ollama-e-schema-json
    caminhos:
      - engine/llm_api.py
      - tests/test_llm_layer_sota.py
    parecer: >-
      Revisado em 2026-10-05. O suporte a Ollama Cloud e a Nous Research permanece
      integro: a autenticacao por OLLAMA_API_KEY e o mapeamento das tags cloud nao foram
      tocados. A resolucao de alias do caminho LOCAL passou a consultar OLLAMA_MODEL_MAP,
      e o fallback de contingencia via gemini-3.5-flash-lite so e acionado quando ha
      credencial Gemini disponivel.
---

# Registro: Integracao de Ollama Cloud, Hermes Harness e Chaves de Registro

Data: 2026-10-01

Este registro formaliza:

1. Carregamento de chaves do Registro do Windows (HKCU/HKLM) e do harness Hermes Agent:
   - Leitura nativa de variaveis de ambiente de HKCU e HKLM via winreg.
   - Sincronizacao de tokens do provedor Nous Research a partir da configuracao do harness Hermes.
   - Persistencia segura de OLLAMA_API_KEY e OLLAMA_DEVICE_KEY em HKCU e HKLM para a conta raphavitoi sem exposicao de segredos em texto claro no repositorio.
   - Restricao estrita da pool de 5 chaves Gemini sob o projeto-original do Google API Studio exclusivamente para modelos Gemini.

2. Roteamento Deterministico de Modelos Especializados:
   - Ollama Cloud (Zero-RAM): gpt-oss:120b-cloud, gpt-oss:20b-cloud, gemma4:31b-cloud, glm-5.1:cloud.
   - Nous / Hermes Cloud (Free): poolside/laguna-s-2.1:free, stealth/space-bunny-alpha, hermes-3-llama-3.1-70b.
   - llama.cpp Local (Vulkan): ai9stars_G9v3-3B (porta 8081), qwen2.5-coder-1.5b (porta 8083).
   - Google Gemini API: chaves rotacionais 1 a 5 estritamente dedicadas a modelos Gemini.

3. Evidencias Experimentais:
   - Inferencia live em gemma4:31b-cloud completada em 292ms com resposta valida.
   - Inferencia live em gpt-oss:120b-cloud completada com resposta valida e thinking ativo.
   - Inferencia live em poolside/laguna-s-2.1:free via Nous API completada com HTTP 200.
   - Suite de testes unitarios tests/test_llm_layer_sota.py: 24 passed com 0 erros e 0 warnings.
