# Exa MCP — Relatório de Governança, Busca Semântica & Pesquisa Autônoma

> **Repositório Monitorado:** `RaphaelVitoi/Site`
> **Governança:** Protocolo Master Chico SOTA v8.0 GOLD · Tríade Stitch, Exa & Jules
> **Data de Atualização:** `2026-10-28 11:54:24 UTC`
> **Origem dos Dados:** Exa Hosted MCP (`https://mcp.exa.ai/mcp`) & Exa API (`https://api.exa.ai`)

---

## 1. Resumo Executivo da Conexão Exa MCP

| Dimensão | Valor | Status Operacional |
| :--- | :--- | :--- |
| **Status de Conexão** | `CONECTADO E OPERACIONAL` | ✅ Operacional |
| **Equipe / Team** | `Raphael Vitoi's Personal` (`cmsxf2xch006ejw04uvohyrb8`) | Workspace Pessoal Autenticado |
| **Taxa Limite (Rate Limit)** | `10 QPS` | Capacidade nominal para buscas concorrentes |
| **Chave Ativa em Produção** | `exa1` | Configurada em `HKCU:\Environment\EXA_API_KEY` |
| **Latência de Probe Medida** | `338.56 ms` | Ingestão e ranking semântico em tempo real |
| **Transporte MCP** | HTTP SSE (`text/event-stream` / JSON-RPC 2.0) | Header `Accept: application/json, text/event-stream` |

---

## 2. Catálogo das 4 Ferramentas Exa MCP

| Ferramenta MCP | Título Oficial | Função Operacional | Disponibilidade |
| :--- | :--- | :--- | :--- |
| `web_search_exa` | **Web Search** | Busca semantica em linguagem natural na web com retorno de conteudo limpo. | `HABILITADO` |
| `web_search_advanced_exa` | **Advanced Web Search** | Busca avancada com filtros por dominio, categorias (people, news, pdf), datas e sumarios. | `HABILITADO (opt-in via tools parameter)` |
| `web_fetch_exa` | **Fetch Web Pages** | Extracao de texto completo em markdown purificado a partir de URLs conhecidas. | `HABILITADO` |
| `agent_run` | **Exa Agent** | Pesquisa profunda autonoma em multiplas etapas com suporte a budget, esforco e output schema. | `HABILITADO (via API Key / OAuth)` |

---

## 3. Validação Empírica & Telemetria de Probe

- **Consulta de Teste Executada:** `Raphael Vitoi Poker Racional PMev`
- **Tempo de Resposta:** `338.56 ms`
- **Resultados Retornados:** `2`

### Resultado #1: CNC Poker
- **URL:** [https://cncpoker.com/coaches/rapha-vitoi](https://cncpoker.com/coaches/rapha-vitoi)
- **Data de Publicação:** `N/A`
- **Prévia Textual:** *Title: CNC Poker URL: https://cncpoker.com/coaches/rapha-vitoi Published: N/A Author: N/A Highlights: CNC Poker  #### Coach Profile  Coaches Profiles  ##### @Rapha Vitoi  Premium  #### Rapha Vitoi - E*

### Resultado #2: RPTeam
- **URL:** [https://www.rafapokerteam.com.br/](https://www.rafapokerteam.com.br/)
- **Data de Publicação:** `N/A`
- **Prévia Textual:** *Title: RPTeam URL: https://www.rafapokerteam.com.br/ Published: N/A Author: N/A Highlights: RPTeam  # Nós somos RAFA POKER TEAM.    Selecionamos, treinamos e desenvolvemos jogadores em todos os limite*

---

## 4. Esteira de Pesquisa Contínua na Tríade (Jules · Stitch · Exa)

```mermaid
flowchart TD
    Exa["🔍 Exa MCP (Busca Semântica & Exa Agent)"] --> Theory["🧠 Base Teórica PMev & Estado da Arte"]
    Theory --> Jules["⚡ Jules Cloud (Refatorações, Monte Carlo & Testes)"]
    Theory --> Stitch["🎨 Stitch MCP (Prototipagem UI Generativa & Design System)"]
    Jules --> NexusSite["🚀 Nexus Next.js 16 + aiohttp Backend"]
    Stitch --> NexusSite

    classDef exa fill:#1a2332,stroke:#06b6d4,stroke-width:2px,color:#fff;
    classDef jules fill:#1a2332,stroke:#f59e0b,stroke-width:2px,color:#fff;
    classDef stitch fill:#1a2332,stroke:#ec4899,stroke-width:2px,color:#fff;
    classDef site fill:#111927,stroke:#10b981,stroke-width:2px,color:#fff;
    class Exa exa;
    class Jules jules;
    class Stitch stitch;
    class Theory,NexusSite site;
```

### Playbook de Invocação Rápida via Python Bridge

```python
from engine.exa_bridge import ExaClient

client = ExaClient()

# 1. Busca semântica natural:
resp = client.search(query="ICM multiway push fold equilibrium math", num_results=5)
for r in resp.results:
    print(f"{r.title} -> {r.url}")

# 2. Busca avançada com filtros:
adv_resp = client.search_advanced(
    query="Game Theory Poker Mathematical Foundations",
    category="pdf",
    include_domains=["arxiv.org"],
    enable_summary=True,
)

# 3. Disparo de pesquisa profunda via Exa Agent:
agent_run = client.run_agent(
    query="Mapear os 5 principais artigos recentes sobre Independent Chip Model em torneios PKO",
    effort="low",
    max_cost_dollars=1.0,
)
print(f"Run ID: {agent_run.run_id} | Status: {agent_run.status}")
```

---
*Relatório emitido pelo Sincronizador Exa MCP — Protocolo Chico SOTA v8.0 GOLD*
