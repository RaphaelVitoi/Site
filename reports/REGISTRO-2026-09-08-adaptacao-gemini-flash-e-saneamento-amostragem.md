---
id: registro-2026-09-08-adaptacao-gemini-flash-e-saneamento-amostragem
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: "antigravity@gemini-3.8-flash"
criado_em: 2026-09-08T20:55:00-03:00
atualizado_em: 2026-09-08T20:55:00-03:00
classes: [interno, medido, governanca, roteamento, adaptacao, saneamento]
caminhos:
  - engine/llm_api.py
  - frontend/package.json
  - llm/adapters.py
  - llm/free_router.py
  - llm/gemini.py
  - llm/model_registry.py
  - package-lock.json
  - package.json
  - tests/test_model_registry.py
  - tests/test_adapters_gemini_http.py
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  so: Windows
  python: '3.14.6'
  pwsh: '7.6.5'
verificado:
  - >-
    Suite de testes Python de conformidade Gemini Flash e amostragem aprovada
    com 174 passed em 3.42s no .venv com pytest tests/test_model_registry.py
    tests/test_adapters_gemini_http.py tests/test_routing_policy.py
    tests/test_llm_layer_sota.py tests/test_free_router_concurrency.py
    tests/test_adapters_anthropic_http.py tests/test_gpt6_astra.py.
  - >-
    Saneamento de vulnerabilidades npm audit com atualizacao de versoes seguras
    (next 16.3.4, js-yaml 4.3.2, sharp 0.35.4) resultando em zero vulnerabilidades.
  - >-
    Execucao do cwv_gate.ps1 com zero erros -- LCP 500ms, CLS 0, TTFB 113ms, Max Heap
    101MB, Axe violations 0, CVE count 0, SRI Verified, Hygiene Pass.
nao_verificado:
  - >-
    tbt_laboratorial_lighthouse_producao -- requer execucao dedicada com Chrome
    isolado sob novo fingerprint do frontend.
revisoes_de_ancora:
  - registro: auditoria-2026-09-03-trabalho-do-gemini-3-8-flash
    caminhos:
      - llm/model_registry.py
    parecer: >-
      Ancora o model_registry apos auditoria do Gemini 3.8 Flash. A presente
      alteracao mantem o motor 3.8 Flash com 64k de saida e preco $0.75/$3.75,
      acrescentando no campo notas a vigencia promocional ate 31/12/2026 e o
      degrau pos-promocional para 2027, alem de promover o 3.7 Flash a
      VERIFICADO e corrigir o 3.6 Flash para limite base de 8.192 tokens.
  - registro: auditoria-2026-09-07-preludio-jules-astra-e-correcao-da-delegacao
    caminhos:
      - llm/model_registry.py
      - tests/test_model_registry.py
    parecer: >-
      Ancora a integridade do registro e testes correspondentes. O Astra e as
      cotas permanecem intactos. A adicao refina as especificacoes dos modelos
      Gemini Flash e expande a suite com testes de limites de saida e
      thinking_level.
  - registro: registro-2026-09-02-adapters-ligado-ao-caminho-real-anthropic
    caminhos:
      - engine/llm_api.py
      - llm/adapters.py
    parecer: >-
      Ancora os adaptadores e o caminho real da API. O padrao de arquitetura
      estabelecido para AnthropicAdapter (e_geracao_atual, build_http,
      extrair_texto) foi estendido de forma espelhada ao GoogleGenAIAdapter em
      llm/adapters.py e conectado ao call_gemini em engine/llm_api.py.
  - registro: registro-2026-09-07-delegacao-gemini-flash-lite-cinco-itens
    caminhos:
      - llm/model_registry.py
      - tests/test_model_registry.py
    parecer: >-
      Ancora o status cota_por_assinatura e os precos da delegacao. Os campos
      permanecem validos. O registro agora inclui teste de aceitacao de
      thinking_level minimal em gemini-3.5-flash-lite e rejeicao em 3.7 e 3.8.
  - registro: registro-2026-09-07-integracao-gpt6-astra-e-retirada-do-fable
    caminhos:
      - llm/adapters.py
      - llm/model_registry.py
      - tests/test_model_registry.py
    parecer: >-
      Ancora a retirada do Fable e adocao do Astra. Nenhuma configuracao do
      Astra ou dos modelos OpenAI foi alterada. Os ajustes afetam estritamente
      a familia Google Gemini 3.x.
  - registro: registro-2026-09-07-orquestrador-api-keys-free-e-pmev
    caminhos:
      - llm/free_router.py
    parecer: >-
      Ancora o pool multi-chave e o gateway gratuito. Em free_router.py, a
      injecao de temperature: 0.2 foi suprimida para modelos da serie Gemini
      3.x para compatibilidade com as breaking changes da Google DeepMind.
  - registro: registro-2026-09-08-auditoria-de-tipagem-e-recorte-do-fingerprint
    caminhos:
      - llm/free_router.py
    parecer: >-
      Ancora ajustes de tipagem e integridade no free_router.py. O ajuste atual
      mantem toda a tipagem e sanitiza o payload de saida, prevenindo envio
      de amostragem legada para modelos de raciocinio dinamico.
  - registro: relatorio-fusao-cerebro-claude-quality-gate-2026-09-01
    caminhos:
      - package-lock.json
      - package.json
    parecer: >-
      Revisado e mantido valido. Os manifestos package.json e package-lock.json
      foram atualizados para sanear 3 CVEs detectados pelo npm audit (next,
      js-yaml, sharp), mantendo integridade estrita de build e zero
      vulnerabilidades no ecossistema.
  - registro: auditoria-cwv-lighthouse-2026-09-01
    caminhos:
      - package-lock.json
      - package.json
    parecer: >-
      Revisado e mantido valido. A atualizacao de dependencias mitiga
      vulnerabilidades upstream sem alterar rotinas de auditoria CWV, scripts
      de qualidade ou portas de inspecao CDP.
  - registro: handoff-2026-08-29-governanca-8tiers-vulnerabilidades-subagents
    caminhos:
      - frontend/package.json
      - package.json
    parecer: >-
      Revisado e mantido valido. As dependencias foram elevadas para corrigir
      vulnerabilidades criticas e altas, preservando os scripts de governanca e
      a malha de subagentes.
  - registro: handoff-2026-08-30-auditoria-malha-agentica-e-trava-de-lfs
    caminhos:
      - package.json
    parecer: >-
      Revisado e mantido valido. A atualizacao de versoes seguras no
      package.json preserva todos os hooks husky, configuracoes de lock e
      politicas de governanca.
  - registro: registro-2026-09-02-fast-uri-alto-e-contrato-de-evidencia-pmev
    caminhos:
      - package-lock.json
    parecer: >-
      Revisado e mantido valido. A regeneracao do package-lock.json elimina
      CVEs em next, js-yaml e sharp sem alterar o contrato de evidencias PMev
      nem as dependencias matematicas.
  - registro: registro-2026-09-07-padronizacao-sistemica-markdownlint
    caminhos:
      - package.json
    parecer: >-
      Revisado e mantido valido. Os scripts de linting markdownlint adicionados
      ao package.json permanecem inalterados, ocorrendo apenas correcoes de
      versao de pacotes para seguranca.
  - registro: relatorio-2026-08-29-analise-integral-ecossistema-sota-v8-gold
    caminhos:
      - frontend/package.json
      - package.json
    parecer: >-
      Revisado e mantido valido. A atualizacao de dependencias de frontend e
      raiz mantem a arquitetura de 8 tiers e contratos de seguranca intactos.
  - registro: relatorio-2026-08-29-impacto-quantitativo-qualitativo-sota-v8-gold
    caminhos:
      - frontend/package.json
      - package.json
    parecer: >-
      Revisado e mantido valido. A atualizacao de dependencias assegura zero
      vulnerabilidades no npm audit, preservando a governanca e o baseline
      qualitativo.
---

# Registro: Adaptação da Família Gemini Flash 3.x e Saneamento de Amostragem

**Data:** 2026-09-08  
**Autor:** `antigravity@gemini-3.8-flash`  
**Escopo:** `Site` (Nexus SOTA v8.0 GOLD)

---

## 1. Contexto e Motivação

A evolução da família Flash da Google DeepMind consolidou uma transição crítica: a migração definitiva de modelos baseados em amostragem estocástica pura para inferência dinâmica com alocação adaptativa de computação em tempo de teste (*test-time compute*).

A análise do repositório revelou quatro pontos de vulnerabilidade e inconsistência documental:

1. **Parâmetros de Amostragem Obsoletos**: A API do Google descontinuou `temperature`, `top_p` e `top_k` para a série 3.x e rejeita ativamente com HTTP 400 penalidades explícitas (`frequency_penalty`, `presence_penalty`). No código local, `llm/gemini.py` e `llm/free_router.py` ainda passavam `temperature: 0.2` de forma incondicional.
2. **Rejeição de Trailing Role Model**: Requisições cujo último item do histórico possui `role: "model"` ou `type: "model_output"` são rejeitadas pela API.
3. **Inconsistência de Limite de Saída em Gemini 3.6 Flash**: O modelo estava cadastrado com `max_output_tokens=65_536` e preço de \$0.50 / \$2.50. A documentação técnica oficial confirma que sua especificação base mantém o teto de **8.192 tokens** e tabela regular de **\$0.75 / \$3.75**.
4. **Desacoplamento de Thinking em Gemini 3.8 Flash**: `llm/gemini.py` condicionava `thinkingConfig` a `"3.7" in model_str`, deixando o 3.8 Flash sem alocação dinâmica de computação em tempo de teste em chamadas diretas via REST.

---

## 2. Alterações Executadas

### 2.1 `llm/model_registry.py`
- `gemini-3.7-flash` promovido formalmente de `NAO_VERIFICADO` para `VERIFICADO`.
- `gemini-3.6-flash` corrigido para `max_output_tokens=8_192` e preço \$0.75 / \$3.75.
- `gemini-3.8-flash` anotado com a vigência promocional (\$0.75 / \$3.75) até 31/12/2026 e tabela pós-promocional (\$1.50 / \$7.50 em 2027).
- Adicionadas entradas documentais em `CORRECOES_APLICADAS`.

### 2.2 `llm/adapters.py`
- `GoogleGenAIAdapter` expandido com:
  - `e_geracao_atual(alias: str) -> bool`: detecção canônica de modelos Google ativos.
  - `validar_historico(contents)`: rejeição preemptiva de históricos com trailing role `model`.
  - `validar_thinking_level(alias, level)`: validação estrita (bloqueio de `minimal` em 3.7 e 3.8).
  - `build_http(...)`: montagem estrita de payload REST v1beta com mapeamento de `thinkingConfig` e `maxOutputTokens`.
  - `extrair_texto(resposta)`: extração resiliente que ignora blocos de pensamento intermediários (`thought: True`).

### 2.3 `llm/gemini.py`
- `_normalize_gemini_model` atualizado para incluir `"3.8"` na série estável.
- `_build_gemini_payload` atualizado:
  - Suprime `temperature` em todos os modelos da série 3.x.
  - Habilita `thinkingConfig` tanto para `gemini-3.8-flash` quanto para `gemini-3.7-flash`.
  - Valida histórico contra trailing role `model`.
- `_execute_primary_request` e `_execute_native_fallback` atualizados para extração resiliente de texto contra blocos de pensamento.

### 2.4 `llm/free_router.py`
- `_call_model` atualizado para suprimir `temperature: 0.2` em requisições para a série Gemini 3.x.

### 2.5 `engine/llm_api.py`
- `call_gemini` conectado diretamente a `GoogleGenAIAdapter.build_http` e `GoogleGenAIAdapter.extrair_texto`.

### 2.6 Suíte de Testes
- `tests/test_model_registry.py`: adicionados testes para teto de 8k e preço de 3.6 Flash, status verificado de 3.7 e 3.8 Flash, e validação de `thinking_level`.
- `tests/test_adapters_gemini_http.py`: nova suíte dedicada cobrindo reconhecimento de modelo, rejeição de amostragem legada, validação de histórico, montagem de payload HTTP REST e extração resiliente de texto.

---

## 3. Validação Empírica dos Testes

Execução da suíte completa de testes no ambiente `.venv`:
- `tests/test_adapters_gemini_http.py`: **11 passed**
- `tests/test_model_registry.py`: **31 passed**
- `tests/test_routing_policy.py`: **54 passed**
- `tests/test_llm_layer_sota.py`: **22 passed**
- `tests/test_free_router_concurrency.py`: **7 passed**
- `tests/test_adapters_anthropic_http.py`: **19 passed**
- `tests/test_gpt6_astra.py`: **30 passed**

Total: **174 passed em 3.42s**, 0 erros, 0 warnings.
