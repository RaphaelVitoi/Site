# SPEC Técnica: Implementação da Smart CLI (do.ps1)

> **Autor:** @planner (via CHICO) | **Status:** IMPLEMENTADO

## 1. Arquitetura de Dados (Córtex Lexical)

O script exigirá a leitura de três arquivos estáticos:

- `data/intentmap.json`: Dicionário principal. `Key`: Agente. `Value`: Regex String.
- `data/synonyms.json`: Vetores secundários de palavras. Agrupados em RegEx no momento do load.
- `data/aphorisms.json`: Array de strings contendo frases do sistema.

## 2. Lógica de Scoring (Resolve-Intent)

A função de resolução deve ser iterativa:

1. **Short-circuit:** Verifica se a string inicia com `^(@[a-zA-Z]+)`. Se sim, valida no map e retorna.
2. **Regex Match Counting:** Para cada agente no map, concatena o padrão primário com o array de sinônimos: `(pattern|syn1|syn2)`.
3. **Match Collection:** Conta as ocorrências. O agente com maior número de ocorrências na string vence.
4. **Fallback:** Se empatar em zero, direcionar para o `@maverick`.

## 3. Interface de UX

O script utilizará os métodos:

- `[console]::Beep()` para fornecer feedback auditivo "Cyber" em sucessos e erros.
- `Write-Host -NoNewline` para gerar um efeito de console em "tempo real" durante a verificação de agentes.

## 4. Integração com o Worker (DAL)

Ao final do handshake, a CLI gera um payload Ordered Dictionary com schema exigido por `Test-TaskSchema` no `Agent-TaskManager.psm1` e o injeta via `Add-AgentTask`.
