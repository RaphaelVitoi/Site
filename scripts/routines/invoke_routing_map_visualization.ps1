<#
.SYNOPSIS
    Materializa o mapa de roteamento do sistema como um artefato vivo.
.DESCRIPTION
    Esta rotina gera um diagrama Mermaid dinâmico que visualiza o fluxo de vida de uma tarefa,
    desde a ignição até a absorção na memória coletiva. Ele lê a configuração do pipeline de
    handoff para garantir que o diagrama reflita sempre o estado da arte da arquitetura.
#>

$ProjectRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$OutputFile = Join-Path $ProjectRoot "docs\SYSTEM_ROUTING_MAP.md"
$ConfigPath = Join-Path $ProjectRoot "data\system_config.json"

# Header para o arquivo Markdown
$MarkdownContent = @"
# Mapa de Roteamento de Tarefas (SOTA)

Este diagrama é gerado dinamicamente pela rotina `invoke_routing_map_visualization.ps1`.
Ele representa o fluxo de vida de uma tarefa, desde a ignição até a absorção na memória coletiva.
É um artefato vivo que se atualiza conforme a configuração do sistema (`system_config.json`) evolui.

```mermaid
graph TD
    subgraph "Fase 0: Ignição"
        A[<font size=5>👨‍💻</font><br/>Usuário] -->|`do.ps1 -Desc "..."`| B(do.ps1)
        B --> |HTTP POST| C{API Server<br/>(task_executor.py)}
        C --> |INSERT| D[(<font size=5>💾</font><br/>tasks.db)]
    end

    subgraph "Fase 1: Triagem"
        E(Worker) -->|`get_next_task`| F{@dispatcher}
        F -->|Gera Sub-tarefas| D
    end

    subgraph "Fase 2: Execução Especializada"
        E -->|`get_next_task`| G{@implementor}
        subgraph "Omnisciência Sistemica"
            direction LR
            H1[<font size=5>🧠</font><br/>RAG<br/>(memory_rag.py)]
            H2[<font size=5>📜</font><br/>Agent Memory]
            H3[<font size=5>🌍</font><br/>Global Context]
        end
        {H1, H2, H3} --> |Contexto| G
        G --> |Pensa| I{<font size=g>🤖</font><br/>LLM API}
    end

    subgraph "Fase 3: Materialização (God Mode)"
        I -->|Resposta| J(Orquestrador<br/>task_executor.py)
        J -->|`apply_god_mode`| K1[/<font size=5>📄</font><br/>Sistema de Arquivos/]
        J -->|`apply_god_mode`| K2{<font size=5>⚙️</font><br/>Shell}
    end

    subgraph "Fase 4: Homeostase (Sucesso / Falha)"
        J --> L{Resultado}
        L -- Sucesso --> M(Tarefa 'completed')
        L -- Falha --> N(Tarefa 'failed')

        subgraph "Caminho da Simetria (Sucesso)"
            M --> M1(Log de Auditoria)
            M --> M2{Auto-Handoff}
        end

        subgraph "Caminho da Entropia (Falha)"
            N --> N1(Notificação de Erro)
            N --> N2{{<font size=5>❤️‍🩹</font><br/>AUTOFIX<br/>(Mesmo Agente)}}
            N --> N3{{<font size=5>🧘</font><br/>RESONANCE<br/>(@maverick)}}
        end
    end

    subgraph "Fase 5: Memória Coletiva"
        O(@skillmaster) -->|`run_skillmaster_cron.ps1`| P(memory_rag.py ingest)
        P --> Q[(<font size=5>🧠</font><br/>ChromaDB)]
    end

    %% Styling
    classDef agent fill:#FFC300,stroke:#333,stroke-width:2px;
    classDef db fill:#DAF7A6,stroke:#333,stroke-width:2px;
    classDef script fill:#C70039,stroke:#FFF,stroke-width:2px,color:#FFF;
    classDef process fill:#581845,stroke:#FFF,stroke-width:2px,color:#FFF;
    classDef user fill:#FFF,stroke:#000,stroke-width:4px;

    class A user;
    class B,P script;
    class C,E,J,L,M2 process;
    class F,G,O,N2,N3 agent;
    class D,Q db;
```

$MarkdownContent | Out-File -FilePath $OutputFile -Encoding UTF8

Write-Host "[SOTA] Mapa de Roteamento de Tarefas materializado em: $OutputFile" -ForegroundColor Green