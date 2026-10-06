---
name: strata-inference-engine
description: Runbook, governanca e integracao da engine Strata v0.1.39 (MoE 125B Qwen3.8-Flash-Next / ISTA-DASLab Coder). Use para consultar a arquitetura de cache hibrido de experts, gerenciar VRAM elastica (/v1/vram), despachar chamadas via OpenAI Responses API (/v1/responses), operar o cliente Python (Site/llm/strata_client.py) e inicializar o no local via scripts/ops/Start-StrataNode.ps1.
---

# SKILL: Strata MoE 125B — Engine de Inferência & Orquestração Híbrida

> **Repositório Oficial:** [github.com/Niko1221/Strata](https://github.com/Niko1221/Strata) (v0.1.39)  
> **Arquitetura Base:** Mixture-of-Experts 125B (Qwen3.8-Flash-Next, ISTA-DASLab Coder, Swift 1.5)  
> **Módulo Canônico Python:** [`Site/llm/strata_client.py`](file:///C:/Users/rapha/.gemini/Site/llm/strata_client.py)  
> **Script Operacional:** [`scripts/ops/Start-StrataNode.ps1`](file:///C:/Users/rapha/.gemini/scripts/ops/Start-StrataNode.ps1)  
> **Template de Configuração:** [`config/strata/strata-config.template.json`](file:///C:/Users/rapha/.gemini/config/strata/strata-config.template.json)  
> **Governança:** Protocolo Master Chico SOTA v8.0 GOLD (`RULE[user_global]`)

---

## 1. Identidade & Visão Geral da Engine

A **Strata** é uma engine de inferência C++ especializada na execução de modelos Mixture-of-Experts (MoE) de grande porte (125B parâmetros) em hardware de consumo através de particionamento dinâmico de experts, streaming de KV cache e decodificação especulativa nativa.

### Principais Pilares da v0.1.39:
- **Cache Adaptativo de Experts:** A VRAM retém os experts estatisticamente mais requisitados; o restante reside na RAM do sistema ou é transmitido via barramento PCIe.
- **MTP Speculative Decoding:** Rascunho de múltiplos tokens por rodada verificado em paralelo pelo grafo MoE central.
- **OpenAI Responses API (`POST /v1/responses`):** Suporte nativo compatível com Codex CLI e agentes de código, atingindo $\approx 96\%$ de reaproveitamento de prompt cache em turnos subsequentes.
- **VRAM Elástica (`POST /v1/vram`):** Redimensionamento dinâmico da fatia de VRAM alocada em blocos de 512 MiB sem interromper o processo do servidor.
- **Decodificação Paralela (`--parallel N`):** Serviço concorrente de até $N$ conversações com preempção inteligente de chunks para minimizar o Time to First Token (TTFT).

---

## 2. Contratos de API & Endpoints Suportados

O servidor escuta obrigatoriamente em `http://127.0.0.1:8080` (loopback):

| Endpoint | Método | Descrição |
| :--- | :--- | :--- |
| `/v1/chat/completions` | `POST` | Padrão OpenAI Chat Completions com streaming, tools e JSON Schema. |
| `/v1/responses` | `POST` | OpenAI Responses API para ferramentas e Codex CLI (`reasoning_effort`, function tools). |
| `/v1/vram` | `POST` | Redimensiona elasticamente o cache de VRAM (`{"reserve_mib": 4000}`). |
| `/health` | `GET` | Retorna status de prontidão (`{"status": "ok"}` ou `"loaded"`). |
| `/props` | `GET` | Retorna propriedades de runtime, incluindo se o modelo está descarregado (`is_sleeping`). |
| `/metrics` | `GET` | Métricas em tempo real de tokens/s, slots concorrentes e hit rate de experts. |
| `/unload` | `POST` | Descarrega o modelo da memória imediatamente para liberar VRAM/RAM. |
| `/load` | `POST` | Pré-carrega o modelo na memória antes de submeter requisições críticas. |

---

## 3. Runbook de Inicialização no Windows

Para contornar o bug de throttling de I/O de 24x no Agendador de Tarefas do Windows documentado pelos desenvolvedores da Strata, o processo **deve** ser iniciado com Prioridade Normal e privilégios elevados.

### Execução via PowerShell:
```powershell
# Pre-flight e inicialização controlada
pwsh -File C:\Users\rapha\.gemini\scripts\ops\Start-StrataNode.ps1 -Family coder -Model IQ1_M -Parallel 2
```

### Variáveis de Ambiente Mandatórias:
```powershell
$env:STRATA_ARENA_MMAP = "1"     # Mapeia arena de experts para economia de RAM
$env:STRATA_PREFILL_HELP = "1"   # Otimiza streaming de blocos de prefill
$env:STRATA_RING_BYTES = "1"     # Habilita ring buffer em bytes
$env:STRATA_IQ256_GATHER = "1"   # Ativa kernels AVX2 otimizados para quants IQ
```

---

## 4. Integração no Ecossistema Python (`Site/llm/strata_client.py`)

### Exemplo de Uso Síncrono:
```python
from llm.strata_client import LocalStrataClient

client = LocalStrataClient()

if client.is_healthy():
    # Chat Completion tradicional
    resposta = client.complete("Escreva um teste unitario para o modulo hand_evaluator.")
    
    # OpenAI Responses API com tool loop
    res = client.responses(
        input_messages=[{"role": "user", "content": "Analise a equidade do range."}],
        reasoning_effort="low",
    )
```

### Exemplo de Uso Assíncrono com Fallback Gracioso:
No módulo [`Site/engine/llm_api.py`](file:///C:/Users/rapha/.gemini/Site/engine/llm_api.py), chamadas com modelos contendo `strata` ou `qwen3.8` são roteadas automaticamente para a engine local. Se o servidor estiver offline ou descarregado, o circuito é interrompido e a requisição transita suavemente para o provedor Ollama/Gemini sem falha para o chamador.

---

## 5. Diretivas de Governança e Isolamento de Recursos

1. **Evitar Starvation de RAM/VRAM:** O nó Strata deve sempre operar com `--idle-unload 600` e `--min-free-vram-mib 4000` em ambientes compartilhados.
2. **Imutabilidade de Repositório:** Pesos binários (`.bin`, `.gguf`) e caches de experts **nunca** devem ser adicionados ao git; permanecem na pasta externa de dados (`Strata-data/`).
3. **Loopback Estrito:** O binding deve ocorrer exclusivamente em `127.0.0.1`.
