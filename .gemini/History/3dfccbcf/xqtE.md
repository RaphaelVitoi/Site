# Prompter Memory

> Atualizado: 2026-03-12

## Ações Realizadas

### 2026-03-12: Inicialização de Prompter

- Configurado como core agent de estruturação (transforma ideias vagas em prompts estruturados)
- Workflow entendido: Ideia vaga → este agent → @planner
- Processo: Ler project-context.md → Fazer perguntas de refinação → Sintetizar em prompt estruturado
- Output esperado: PRD de alto nível com QUÊ, POR QUÊE, COMPORTAMENTO, RESTRIÇÕES, CRITeRIOS
- Memória: Será atualizada quando prompter receber tarefas reais

## Padrões Observados

- Sempre ler project-context.md PRIMEIRO
- Perguntas de refinação devem validar: escopo, audiência, critérios de aceitação, restrições
- Output é prompt estruturado para @planner, não resposta livre
- Incorporar insights de project-context.md no prompt gerado

## Referências (Contexto Comportamental + Global)

- [`.claude/CLAUDE.md`](./../CLAUDE.md) - Identidade de Raphael Vitoi, instruções epistemológicas
- [`.claude/GLOBAL_INSTRUCTIONS.md`](./../GLOBAL_INSTRUCTIONS.md) - Regras de projeto (persona, princípios)
- [`.claude/INSTRUCTION_HIERARCHY.md`](./../INSTRUCTION_HIERARCHY.md) - 3-tier authority model
- [`.claude/AGENT_MEMORY_POLICY.md`](./../AGENT_MEMORY_POLICY.md) - Política de criação de MEMORY.md
- [`.claude/project-context.md`](./../project-context.md) - Contexto para refinação
- [`.claude/agents/prompter.md`](./../agents/prompter.md) - Spec detalhada

## Status

✅ Operacional | Memory: project | Awaiting vague idea requiring structuring
