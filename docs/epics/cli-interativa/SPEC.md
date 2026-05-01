# SPEC Tecnica: Implementacao da Smart CLI (do.ps1)

> **Autor:** @planner (via CHICO) | **Status:** IMPLEMENTADO

## 1. Arquitetura de Dados (Cortex Lexical)

O script exigira a leitura de tres arquivos estaticos:

- `data/intentmap.json`: Dicionario principal. `Key`: Agente. `Value`: Regex String.
- `data/synonyms.json`: Vetores secundarios de palavras. Agrupados em RegEx no momento do load.
- `data/aphorisms.json`: Array de strings contendo frases do sistema.

## 2. Logica de Scoring (Resolve-Intent)

A funcao de resolucao deve ser iterativa:

1. **Short-circuit:** Verifica se a string inicia com `^(@[a-zA-Z]+)`. Se sim, valida no map e retorna.
2. **Regex Match Counting:** Para cada agente no map, concatena o padrao primario com o array de sinonimos: `(pattern|syn1|syn2)`.
3. **Match Collection:** Conta as ocorrencias. O agente com maior numero de ocorrencias na string vence.
4. **Fallback:** Se empatar em zero, direcionar para o `@maverick`.

## 3. Interface de UX

O script utilizara os metodos:

- `[console]::Beep()` para fornecer feedback auditivo "Cyber" em sucessos e erros.
- `Write-Host -NoNewline` para gerar um efeito de console em "tempo real" durante a verificacao de agentes.

## 4. Integracao com o Worker (DAL)

Ao final do handshake, a CLI gera um payload Ordered Dictionary com schema exigido por `Test-TaskSchema` no `Agent-TaskManager.psm1` e o injeta via `Add-AgentTask`.

