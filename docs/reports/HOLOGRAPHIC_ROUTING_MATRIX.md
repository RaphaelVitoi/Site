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
| **@architect**     | 3          | `design                   |
| **@planner**       | 3          | `planej                   |
| **@bibliotecario** | 3          | `rag                      |
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
| **@verifier**    | **@curator**        | Automatico ao concluir tarefa sem falhas |

## 3. Topologia de Cognicao (Agente -> LLM Tier)

| Agente             | Nivel de Raciocinio | Modelos Alocados (Cascata)                                                                         |
| ------------------ | ------------------- | -------------------------------------------------------------------------------------------------- |
| **@maverick**      | `deep_thinking`     | claude-3-7-sonnet-20250219, gemini-2.5-pro, deepseek/deepseek-r1:free, anthropic/claude-3.5-sonnet |
| **@architect**     | `deep_thinking`     | claude-3-7-sonnet-20250219, gemini-2.5-pro, deepseek/deepseek-r1:free, anthropic/claude-3.5-sonnet |
| **@planner**       | `deep_thinking`     | claude-3-7-sonnet-20250219, gemini-2.5-pro, deepseek/deepseek-r1:free, anthropic/claude-3.5-sonnet |
| **@auditor**       | `deep_thinking`     | claude-3-7-sonnet-20250219, gemini-2.5-pro, deepseek/deepseek-r1:free, anthropic/claude-3.5-sonnet |
| **@implementor**   | `deep_thinking`     | claude-3-7-sonnet-20250219, gemini-2.5-pro, deepseek/deepseek-r1:free, anthropic/claude-3.5-sonnet |
| **@verifier**      | `deep_thinking`     | claude-3-7-sonnet-20250219, gemini-2.5-pro, deepseek/deepseek-r1:free, anthropic/claude-3.5-sonnet |
| **@securitychief** | `deep_thinking`     | claude-3-7-sonnet-20250219, gemini-2.5-pro, deepseek/deepseek-r1:free, anthropic/claude-3.5-sonnet |
| **@curator**       | `deep_thinking`     | claude-3-7-sonnet-20250219, gemini-2.5-pro, deepseek/deepseek-r1:free, anthropic/claude-3.5-sonnet |
| **@validador**     | `deep_thinking`     | claude-3-7-sonnet-20250219, gemini-2.5-pro, deepseek/deepseek-r1:free, anthropic/claude-3.5-sonnet |
| **@chico**         | `deep_thinking`     | claude-3-7-sonnet-20250219, gemini-2.5-pro, deepseek/deepseek-r1:free, anthropic/claude-3.5-sonnet |
| **@skillmaster**   | `fast_operations`   | gemini-2.5-flash, meta-llama/llama-3.1-8b-instruct, claude-3-5-haiku-20241022                      |
| **@dispatcher**    | `fast_operations`   | gemini-2.5-flash, meta-llama/llama-3.1-8b-instruct, claude-3-5-haiku-20241022                      |
| **@pesquisador**   | `fast_operations`   | gemini-2.5-flash, meta-llama/llama-3.1-8b-instruct, claude-3-5-haiku-20241022                      |
| **@organizador**   | `fast_operations`   | gemini-2.5-flash, meta-llama/llama-3.1-8b-instruct, claude-3-5-haiku-20241022                      |
| **@prompter**      | `fast_operations`   | gemini-2.5-flash, meta-llama/llama-3.1-8b-instruct, claude-3-5-haiku-20241022                      |
| **@bibliotecario** | `fast_operations`   | gemini-2.5-flash, meta-llama/llama-3.1-8b-instruct, claude-3-5-haiku-20241022                      |
