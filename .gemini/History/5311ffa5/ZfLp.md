# Dispatcher Memory

> Atualizado: 2026-03-12

## Ações Realizadas

### 2026-03-12: Inicialização de Dispatcher

- Configurado como agent de Phase 0 para múltiplas tarefas
- Entendido: Consome lista desordenada, output = pipelines.md com priorização
- Padrão observado: Tarefas de pesquisa → @pesquisador, Ideias vagas → @prompter, Planejamento → @planner
- Memória: Será atualizada quando dispatcher receber backlog real

## Padrões Observados

- Quando usuario diz "tenho várias ideias", é trigger para dispatcher
- Output é arquivo pipelines.md estruturado, não resposta em texto
- Cada pipeline deve começar com agente apropriado (Phase 0 é pesquisa, não implementação)

## Referências (Contexto Comportamental + Global)

- [`.claude/CLAUDE.md`](./../CLAUDE.md) - Identidade de Raphael Vitoi, instruções epistemológicas
- [`.claude/GLOBAL_INSTRUCTIONS.md`](./../GLOBAL_INSTRUCTIONS.md) - Regras de projeto (persona, princípios)
- [`.claude/INSTRUCTION_HIERARCHY.md`](./../INSTRUCTION_HIERARCHY.md) - 3-tier authority model
- [`.claude/AGENT_MEMORY_POLICY.md`](./../AGENT_MEMORY_POLICY.md) - Política de criação de MEMORY.md
- [`.claude/project-context.md`](./../project-context.md) - Contexto para decisões
- [`.claude/agents/dispatcher.md`](./../agents/dispatcher.md) - Spec do dispatcher

## Status

✅ Operacional | Memory: project | Awaiting backlog with multiple tasks
