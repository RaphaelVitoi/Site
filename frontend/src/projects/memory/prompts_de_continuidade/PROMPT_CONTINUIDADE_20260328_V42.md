---
name: Prompt de Continuidade V42 - 2026-03-28
description: Sessão pós-V41. 429 retry-after (todos os 3 providers), nexus-ping, PKO Value no simulador, VALID_AGENTS fix, do.test.ps1 Pester 3.x.
type: project
---

# Prompt de Continuidade V42 -- 2026-03-28

## Commits desta sessão

| Hash | Descrição |
|------|-----------|
| `63cc4ea` | feat: 429 retry-after + nexus-ping |
| `c410657` | feat: 429 retry-after para OpenRouter e Anthropic |
| `c4f7b50` | feat: PKO Value no MasterSimulator |
| `c9d1546` | fix: VALID_AGENTS NameError + do.test.ps1 Pester 3.x |

## O que foi feito

### 429 retry-after (todos os 3 providers)
- `llm/gemini.py`: intercepta 429 antes de raise_for_status, lê `error.details[].retryDelay` do JSON body, propaga como `RuntimeError("HTTP 429: RESOURCE_EXHAUSTED retry_after=Ns")`
- `llm/openrouter.py` e `llm/anthropic.py`: mesmo padrão via header HTTP `Retry-After`
- `llm/providers.py`: detecta `retry_after=N` no error_msg; delay ≤60s → sleep + retry mesma chave (rate limit por minuto); delay >60s → rotaciona imediatamente (quota diária)

### nexus-ping
- `Setup-NexusProfile.ps1`: função `nexus-ping` que enfileira tarefa via `/add`, faz polling de `/task-result?id=`, exibe PONG com latência. Parâmetros: `-Agent` (default @maverick), `-Timeout` (default 120s)
- `nexus-setup` rodado para injetar no profile

### PKO Value no MasterSimulator
- `MasterSimulator.tsx`: estado `pkoValue` (0-0.8), `pkoIpRp = effectiveIpRp * (1 - pkoValue)`, display de RP ajustado no header com label "· PKO" quando ativo
- `NashPanel.tsx`: slider PKO Bounty amber (0% OFF → 80% Pesado), borda ativa quando pkoValue > 0
- PKO aplicado antes do escalonamento por street → todas as 3 streets reagem automaticamente

### VALID_AGENTS NameError fix
- `task_executor.py`: `VALID_AGENTS` nunca era inicializado no nível de módulo (só em `_maybe_reload_config()`). Adicionado `VALID_AGENTS = list(INTENT_MAP.keys())` após inicialização do INTENT_MAP

### do.test.ps1 Pester 3.x
- Path corrigido: `$PSScriptRoot/do.ps1` (era `../../do.ps1`)
- `Remove-Mock` removido (Pester 5+)
- Stubs globais para `Invoke-ContextAssembler` e `Invoke-NexusScript`
- 3 testes passam (Get-Help, Invoke-WebRequest, routing)
- 6 marcados como `-Pending` com documentação de limitação (Pester 3.x não intercepta funções redefinidas em child scope de `& $scriptFile`)
- Caminho de resolução: Pester 5 upgrade OU flag `-TestMode` em do.ps1

### Regra de memória salva
- `feedback_next_steps_ordering.md`: ordenar próximos passos autonomamente (fechar padrões abertos → infra → operacional → produto → testes → docs)

## Estado atual do sistema

- Worker rodando com VALID_AGENTS fix (restart recomendado para carregar)
- 3 providers com 429 retry-after cobrindo rate limit por minuto E quota diária
- nexus-ping disponível após `nexus-setup` (já rodado)
- PKO slider funcional no simulador (testado via Next.js dev server)
- do.test.ps1: 3/9 verde, 6 pending documentados

## Pendente / próximas sessões

- Reiniciar worker para carregar VALID_AGENTS fix (se necessário)
- Pester 5 upgrade OU `-TestMode` em do.ps1 para desbloquear os 6 testes pending
- `/health` endpoint no servidor (cosmético, baixa prioridade)
