---
id: registro-2026-09-25-pools-de-chaves-openrouter-multi-tier
tipo: registro
escopo: Site
ecossistema: gemini-antigravity
autor: gemini-3.8-flash
criado_em: 2026-09-25T08:21-03:00
atualizado_em: 2026-09-25T08:23-03:00
commit: HEAD
classes: [interno]
decide: implantacao de pools de chaves OpenRouter particionados por tier em HKCU e HKLM com circuit breaker
caminhos:
  - llm/openrouter_pool.py
  - llm/budget.py
  - scripts/ops/Set-OpenRouterKeyPools.ps1
  - tests/test_openrouter_pools.py
  - reports/REGISTRO-2026-09-25-pools-de-chaves-openrouter-multi-tier.md
verificado:
  - "chaves-provisionadas: 16 chaves particionadas por tier gravadas em HKCU e HKLM com paridade 100% (Tier 1: 3 chaves, Tier 2: 3 chaves, Tier 3: 5 chaves, Tier 4: 5 chaves)"
  - "telemetria-sha8: auditoria de integridade com fingerprints sha8 truncados sem texto claro em git ou artefatos"
  - "circuit-breaker: circuit breaker com cooldown para HTTP 429 (5m), HTTP 500+ (2m) e banimento definitivo para HTTP 401/403"
  - "isolamento-de-cotas: pools dedicados impedem que saturacao em tarefas batch/dream (Tier 3) afete o Core Cognitivo (Tier 1)"
  - "suite-de-testes: 29/29 testes aprovados (test_openrouter_pools.py e test_llm_layer_sota.py) com zero erros e zero warnings"
  - "broadcast-windows: evento WM_SETTINGCHANGE emitido para atualizacao transparente de novos processos"
nao_verificado:
  - "esgotamento simultaneo de todas as 16 chaves em producao real sob carga continua de 24 horas"
revisoes_de_ancora:
  - registro: registro-2026-08-29-tres-orfaos
    caminhos:
      - llm/budget.py
    parecer: >-
      Revisado e mantido valido. A remocao anterior dos orfaos e a definicao canonica de orcamento permanecem intactas. Foram adicionados os pools particionados OPENROUTER_TIER1_KEYS a TIER4_KEYS e o helper get_openrouter_key_for_tier sem reintroduzir literais duplicados ou estruturas orfas.
---

# Pools de Chaves OpenRouter Particionados por Tier com Circuit Breaker Adaptativo

## 1. Contexto e Motivacao

Anteriormente, o sistema contava com uma unica variavel `OPENROUTER_API_KEY` global.
Essa arquitetura apresentava pontos de falha:
1. Concorrencia de cota: chamadas pesadas de background e sintese (Tier 3) podiam esgotar a cota de taxa (HTTP 429) e paralisar raciocinios criticos dos agentes do Core Cognitivo (Tier 1).
2. Falta de circuit breaker: chaves temporariamente em cooldown ou com saldo esgotado continuavam sendo consultadas repetidamente em cascata.
3. Ausencia de failover hierarquico granular entre tiers.

## 2. Topologia dos Pools (16 Chaves Homologadas)

As 16 chaves provisionadas foram distribuidas nos escopos de Usuario (`HKCU:\Environment`) e Maquina (`HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager\Environment`):

| Variavel | Tier | Funcao Arquitetural | Fingerprint (sha8) | Status HKCU/HKLM |
| :--- | :--- | :--- | :--- | :--- |
| `OPENROUTER_TIER1_KEY_1` | Tier 1 | Core Cognitivo (Deep Reasoning) | `ac7d8d9b` | OK / OK |
| `OPENROUTER_TIER1_KEY_2` | Tier 1 | Core Cognitivo (Deep Reasoning) | `e142509b` | OK / OK |
| `OPENROUTER_TIER1_KEY_3` | Tier 1 | Core Cognitivo (Deep Reasoning) | `91768e4b` | OK / OK |
| `OPENROUTER_TIER2_KEY_1` | Tier 2 | Superagentes e Web Research | `8a423c02` | OK / OK |
| `OPENROUTER_TIER2_KEY_2` | Tier 2 | Superagentes e Web Research | `f4c7b737` | OK / OK |
| `OPENROUTER_TIER2_KEY_3` | Tier 2 | Superagentes e Web Research | `f1b92e6c` | OK / OK |
| `OPENROUTER_TIER3_KEY_1` | Tier 3 | Frota Especialista e Heavy Batch | `79273654` | OK / OK |
| `OPENROUTER_TIER3_KEY_2` | Tier 3 | Frota Especialista e Heavy Batch | `5ebebb12` | OK / OK |
| `OPENROUTER_TIER3_KEY_3` | Tier 3 | Frota Especialista e Heavy Batch | `da8ee6b2` | OK / OK |
| `OPENROUTER_TIER3_KEY_4` | Tier 3 | Frota Especialista e Heavy Batch | `331cd9c7` | OK / OK |
| `OPENROUTER_TIER3_KEY_5` | Tier 3 | Frota Especialista e Heavy Batch | `1d7329b6` | OK / OK |
| `OPENROUTER_TIER4_KEY_1` | Tier 4 | Subagentes Dedicados | `76bd98a9` | OK / OK |
| `OPENROUTER_TIER4_KEY_2` | Tier 4 | Subagentes Dedicados | `add8da8a` | OK / OK |
| `OPENROUTER_TIER4_KEY_3` | Tier 4 | Subagentes Dedicados | `767c043c` | OK / OK |
| `OPENROUTER_TIER4_KEY_4` | Tier 4 | Subagentes Dedicados | `eb6cd78e` | OK / OK |
| `OPENROUTER_TIER4_KEY_5` | Tier 4 | Subagentes Dedicados | `4d9b9fba` | OK / OK |

## 3. Arquitetura do OpenRouterPoolManager

O modulo `llm/openrouter_pool.py` introduz:
- Carregamento hibrido: leitura de `os.environ` e `winreg` (HKCU/HKLM), garantindo que mudancas de registro sejam lidas imediatamente.
- Formula adaptativa de saude:
  Score = (Taxa de Sucesso %) - (Penalidade de Latencia) - (Penalidade de Falhas Consecutivas)
- Circuit Breaker:
  - HTTP 429: bloqueio temporario (cooldown de 5m ou Retry-After)
  - HTTP 500/502/503: cooldown de 2m
  - HTTP 401/403: banimento permanente e alerta critico
- Politica de degradacao:
  - Tier 2 -> fallback para Tier 4 e Tier 1
  - Tier 4 -> fallback para Tier 3
  - Tier 3 -> sem degradacao descendente (dispara fallback para Tier 6 local Ollama)
  - Tier 1 -> estritamente isolado; nunca degrada para tiers inferiores.
