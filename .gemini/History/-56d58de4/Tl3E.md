# PROTOCOLO SOTA: RESOLUCAO DE LATENCIA PROGRESSIVA

> **Status:** Ativo | **Implementacao:** Raphael Vitoi & CHICO System
> **Objetivo:** Obliterar gargalos de I/O, CPU e Rede na IDE e no Ecossistema Hibrido.

## 1. O Grafo de Decisao (Fluxo Deterministico)

Abaixo esta a arvore de diagnostico exata que o sistema (ou o arquiteto) deve percorrer ao detectar uma arritmia na velocidade de resposta ou execucao:

```mermaid
graph TD
    A[Deteccao de Latencia Progressiva] --> B{Reinicio efetuado?}
    B -- Nao --> C[Solicitar Restart do Extension Host]
    B -- Sim --> D{Consumo CPU > 15% iddle?}
    D -- Sim --> E[Executar Script de Purga de Extensoes]
    D -- Nao --> F{Network Throttling?}
    F -- Sim --> G[Verificar Cota de API / TPM]
    F -- Nao --> H[Verificar Conflito de I/O em pastas mortas]
    H --> I[Aplicar watcherExclude via Script]
    I --> J[Elevar Prioridade do Processo do Extension Host]
```

## 2. Integracao Sistematica (A Cura Embutida)

Este grafo transcende a teoria. Ele esta fisicamente ancorado nas rotinas de infraestrutura do nosso repositorio. Quando o fluxo atinge as camadas de execucao, as seguintes ferramentas cirurgicas sao acionadas:

*   **No [E] - Purga de Extensoes:** Aciona a aniquilacao de IAs redundantes e ruidos no Extension Host.
    *   `python .\scripts\routines\vitoi_extension_purge.py`
*   **No [I] - Aplicar watcherExclude:** Aplica a "cegueira seletiva" na IDE, bloqueando o Git e a telemetria de varrerem diretorios de alta densidade (node_modules, .venv, .backups_sota).
    *   `python .\scripts\routines\vitoi_optimize_vscode.py`

---
*A arquitetura SOTA nao confia na memoria humana para resolver crises; ela codifica a solucao nas paredes do proprio labirinto.*