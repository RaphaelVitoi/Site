# MATRIZ HOLOGRAFICA DE ROTEAMENTO (SOTA)

> **Gerado Automaticamente** | Data: 2026-03-20 14:30:51

## 1. A Malha de Entrada (Usuario -> Agente)

| Agente             | Prioridade | Padrao de Gatilho (Regex) |
| ------------------ | ---------- | ------------------------- |
| **@maverick**      | 1          | `estrategi                |
| **@curator**       | 1          | `estetic                  |
| **@prompter**      | 1          | `prompt                   |
| **@securitychief** | 1          | `vulnerab                 |
| **@skillmaster**   | 1          | `backup                   |
| **@auditor**       | 2          | `audit                    |
| **@implementor**   | 2          | `codar                    |
| **@verifier**      | 2          | `test                     |
| **@validador**     | 2          | `matematic                |
| **@organizador**   | 2          | `organiz                  |
| **@pesquisador**   | 2          | `pesquis                  |
| **@chico**         | 2          | `sintese                  |
| **@sequenciador**  | 2          | `sequenci                 |
| **@historian**     | 2          | `relatorio                |
| **@architect**     | 3          | `design                   |
| **@planner**       | 3          | `planej                   |
| **@bibliotecario** | 3          | `rag                      |
| **@gemma4**        | 3          | `gemma                    |
| **@dispatcher**    | 4          | `backlog                  |

## 2. A Malha de Handoff Automatica (Parte -> Parte)

| Agente Origem    | Passa o bastao para | Condicao                                 |
| ---------------- | ------------------- | ---------------------------------------- |
| **@architect**   | **@pesquisador**    | Automatico ao concluir tarefa sem falhas |
| **@pesquisador** | **@prompter**       | Automatico ao concluir tarefa sem falhas |
| **@prompter**    | **@planner**        | Automatico ao concluir tarefa sem falhas |
| **@planner**     | **@auditor**        | Automatico ao concluir tarefa sem falhas |
| **@auditor**     | **@implementor**    | Automatico ao concluir tarefa sem falhas |
| **@implementor** | **@verifier**       | Automatico ao concluir tarefa sem falhas |
| **@verifier**    | **@validador**      | Automatico ao concluir tarefa sem falhas |
| **@validador**   | **@curator**        | Automatico ao concluir tarefa sem falhas |
| **@curator**     | **@sequenciador**   | Automatico ao concluir tarefa sem falhas |
| **@sequenciador**| **@historian**      | Automatico ao concluir tarefa sem falhas |
| **@historian**   | **@gemma4**         | Automatico ao concluir tarefa sem falhas |

## 3. Topologia de Cognicao (Agente -> LLM Tier)

| Agente             | Nivel de Raciocinio | Modelos Alocados (Cascata)                                                                         |
| ------------------ | ------------------- | -------------------------------------------------------------------------------------------------- |
| **@maverick**      | `deep_thinking`     | gemini-3.7-flash, poolside/laguna-s-2.1:free, qwen2.5-coder:7b-instruct-q5_K_M, gpt-oss:120b-cloud  |
| **@architect**     | `deep_thinking`     | gemini-3.7-flash, poolside/laguna-s-2.1:free, gemma4:31b-cloud, qwen2.5-coder:7b-instruct-q5_K_M    |
| **@planner**       | `deep_thinking`     | gemini-3.7-flash, gemma4:31b-cloud, poolside/laguna-s-2.1:free, qwen2.5-coder:7b-instruct-q5_K_M    |
| **@auditor**       | `deep_thinking`     | gemini-3.7-flash, poolside/laguna-s-2.1:free, qwen-code-surgical:latest, qwen2.5-coder:7b-instruct  |
| **@implementor**   | `deep_thinking`     | qwen-code-surgical:latest, qwen2.5-coder:7b-instruct-q5_K_M, gemini-3.7-flash, laguna-s-2.1:free    |
| **@verifier**      | `deep_thinking`     | gemini-3.7-flash, qwen-code-surgical:latest, poolside/laguna-s-2.1:free                             |
| **@securitychief** | `deep_thinking`     | gemini-3.7-flash, poolside/laguna-s-2.1:free, qwen2.5-coder:7b-instruct-q5_K_M                     |
| **@curator**       | `deep_thinking`     | gemma4:31b-cloud, gemini-3.7-flash, qwen-poetics:latest                                             |
| **@validador**     | `deep_thinking`     | qwen-pmev-math:latest, gemini-3.7-flash, gemma4:31b-cloud                                           |
| **@historian**     | `deep_thinking`     | gemini-3.7-flash, gemma4:31b-cloud, poolside/laguna-s-2.1:free, qwen-poetics:latest                 |
| **@chico**         | `deep_thinking`     | gemini-3.7-flash, gemma4:31b-cloud, poolside/laguna-s-2.1:free                                       |
| **@skillmaster**   | `fast_operations`   | gemini-3.5-flash-lite, poolside/laguna-xs-2.1:free, qwen2.5-coder:1.5b                              |
| **@dispatcher**    | `fast_operations`   | gemini-3.5-flash-lite, poolside/laguna-xs-2.1:free, qwen2.5-coder:1.5b                              |
| **@pesquisador**   | `fast_operations`   | gemini-3.5-flash-lite, poolside/laguna-xs-2.1:free, ai9stars_G9v3-3B                                |
| **@organizador**   | `fast_operations`   | gemini-3.5-flash-lite, poolside/laguna-xs-2.1:free, qwen2.5-coder:1.5b                              |
| **@sequenciador**  | `fast_operations`   | gemini-3.5-flash-lite, poolside/laguna-xs-2.1:free, qwen2.5-coder:1.5b                              |
| **@prompter**      | `fast_operations`   | gemini-3.5-flash-lite, poolside/laguna-xs-2.1:free, qwen2.5-coder:1.5b                              |
| **@bibliotecario** | `fast_operations`   | gemini-3.5-flash-lite, poolside/laguna-xs-2.1:free, ai9stars_G9v3-3B                                |
| **@gemma4**        | `fast_operations`   | gemma4:e4b, gemma4:12b, ai9stars_G9v3-3B, qwen2.5-coder:1.5b                                        |

