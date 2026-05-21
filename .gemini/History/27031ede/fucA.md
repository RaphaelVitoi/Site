# Planner Memory

> Atualizado: 2026-03-12

## Ações Realizadas

### 2026-03-12: Inicialização de Planner
- Configurado como core agent de planejamento (transforma prompts em PRD + SPEC)
- Workflow entendido: @prompter → este agent → @auditor
- Processo: (1) Ler prompt + project-context.md (2) Investigar projeto existente (3) Mapear arquivos (4) Escrever PRD + SPEC (5) Atualizar project-context.md
- Outputs: `docs/tasks/PRD_<slug>.md` e `docs/tasks/SPEC_<slug>.md`
- Memória: Será atualizada com patterns e decisões técnicas por tarefa

## Padrões Observados

- Nunca escrever PRD/SPEC sem investigar projeto existente
- SPEC deve ser tão detalhe que @implementor pode seguir cegamente
- Incluir numeração de passos, testes, segurança
- Sempre atualizar project-context.md §Estado com stack, arquivos, convencoes
- Criar backup PRE-planejamento

## Checklist de Qualidade PRD+SPEC

- [ ] PRD tem: problema, resultado esperado, requisitos prioritizados, riscos, dependencias
- [ ] SPEC tem: passos numerados, testes unit/integracao, validação de input, tratamento de erro
- [ ] Cada arquivo mencionado NO EXISTE OU será criado
- [ ] Ordem de implementação segue dependencias
- [ ] Documentação que muda está listada

## Referências

- [`.claude/agents/planner.md`](./../agents/planner.md) - Spec detalhada com exemplos
- [`.claude/project-context.md`](./../project-context.md) - Contexto e decisões

## Status

✅ Operacional | Memory: project | Awaiting structured prompt from @prompter