# Protocolo de Handoff SOTA (Cérebro Híbrido)

> **Status:** Ativo e Canônico | **Proprietário:** @chico, @maverick

Este documento formaliza o mecanismo de "passagem de bastão" (handoff) que garante a fluidez e a continuidade das tarefas no ecossistema Nexus, operando em dois modos distintos, mas complementares.

---

## 1. Handoff Automático (Auto-Handoff)

O Handoff Automático é a espinha dorsal da nossa automação de workflows multi-agente.

- **Gatilho:** Conclusão bem-sucedida de uma tarefa por um agente, enquanto o sistema opera em modo de autonomia `full`.
- **Mecanismo:** O kernel `task_executor.py` verifica a diretriz `HANDOFF_PIPELINE` no arquivo de configuração `data/system_config.json`.
- **Ação:** Se o agente que finalizou a tarefa possui um sucessor definido na pipeline (ex: `@architect` -> `@planner`), o sistema gera e enfileira autonomamente uma nova tarefa com o prefixo `HANDOFF-`.
- **Propósito:** Orquestrar cadeias de execução complexas sem intervenção humana, garantindo que o output de um agente se torne o input do próximo de forma estruturada.

**Exemplo de Configuração (`system_config.json`):**

```json
"handoff_pipeline": {
    "@architect": "@planner",
    "@planner": "@implementor",
    "@implementor": "@verifier",
    "@verifier": "@curator"
}
```

## 2. Handoff Manual (Handoff Web)

O Handoff Manual é a manifestação do nosso conceito de "Cérebro Híbrido", permitindo alavancar LLMs externos para tarefas de alta complexidade.

- **Gatilho:** Execução do comando `nexus -Web` (ou `do.ps1 -Web`) pelo administrador.
- **Mecanismo:** O script `do.ps1` aciona a rotina `scripts/routines/Invoke-ContextAssembler.ps1`.
- **Ação:** O montador de contexto reúne todos os artefatos de conhecimento do sistema (instruções globais, identidade, contexto do projeto, etc.) em um único prompt otimizado e o copia para a área de transferência.
- **Propósito:** Permitir que o usuário utilize a interface de um LLM de ponta (Claude, Gemini) com o contexto completo do projeto, para então trazer a solução de volta ao ecossistema para materialização pelos agentes.

---

A coexistência destes dois modos nos confere a flexibilidade de automação interna e alavancagem cognitiva externa, atingindo o verdadeiro Estado da Arte em Fricção Zero.
