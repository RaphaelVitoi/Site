# Sequenciador Memory

> Atualizado: 2026-03-12

## Ações Realizadas

### 2026-03-12: Inicialização de Sequenciador (24/7 Orquestrador)

- Configurado como orquestrador inteligente de tarefas
- Entendido: Monitora queue/tasks.json, roteia para agentes apropriados conforme tráfego
- 3 Modos automáticos: LOW (0-2 = passthrough), MEDIUM (3-10 = FIFO), HIGH (10+ = prioridade inteligente)
- Algoritmo: score = (prioridade × 50) + (age × 0.33) + (bloqueadores × 10) + urgência
- Paralelismo máximo: 4 streams em modo HIGH
- Status: 24/7 ativo desde agora (não requer trigger manual)

## Padrões Operacionais

- Detecta nível de tráfego a cada 30 segundos (automático)
- Modo LOW: dispara @pesquisador/prompter/planner IMEDIATAMENTE (SLA <1s)
- Modo MEDIUM: processa FIFO com max 2 paralelos (SLA 2-5 min)
- Modo HIGH: ordena por score, cria 4 streams (SLA 5-30 min byevel)
- Transição automática entre modos conforme carga

## Routing Automático por Tipo de Tarefa

- Domínio especializado + sem contexto → @pesquisador
- Ideia vaga → @prompter
- Precisa planejar → @planner
- Precisa auditar → @auditor
- Precisa implementar → @implementor
- Precisa verificar → @verifier
- Precisa validar domínio → @validador

## Referências (Contexto Comportamental + Global)

- [`.claude/CLAUDE.md`](./../CLAUDE.md) - Identidade de Raphael Vitoi, instruções epistemológicas
- [`.claude/GLOBAL_INSTRUCTIONS.md`](./../GLOBAL_INSTRUCTIONS.md) - Regras de projeto (persona, princípios)
- [`.claude/INSTRUCTION_HIERARCHY.md`](./../INSTRUCTION_HIERARCHY.md) - 3-tier authority model
- [`.claude/AGENT_MEMORY_POLICY.md`](./../AGENT_MEMORY_POLICY.md) - Política de criação de MEMORY.md
- [`.claude/project-context.md`](./../project-context.md) - Contexto compartilhado
- [`.claude/agents/sequenciador.md`](./../agents/sequenciador.md) - Spec completa com exemplos
- [queue/tasks.json](../../../queue/tasks.json) - Fila de tarefas monitorada
- [`.claude/agents/skillmaster.md`](./../agents/skillmaster.md) - Integração com skillmaster

## Status

✅ Ativo 24/7 | Memory: project | Modo atual: Depende de carga | Pronto para HIGH LOAD desde início
