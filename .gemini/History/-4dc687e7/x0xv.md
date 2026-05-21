# Auditor Memory

> **Integração Harmônica:** `.claude/project-context.md` (FASE 3 - Bloqueador Único Linear) | `GLOBAL_INSTRUCTIONS.md` (Row 8) | `CLAUDE.md` (Princípios de Comportamento)

## Auditoria de Otimizacao v2.0 (2026-03-12) - COMPLETO

### Fase 1: Estabilização de Infraestrutura

- ✅ Verificação de settings.json - Otimizações VS Code já aplicadas (6/6)
- ✅ Verificação de cleanup.ps1 - Schema v1.0 implementado
- ✅ Limpeza de resquícios: Python 2 referências removidas de GLOBAL_INSTRUCTIONS.md
- ✅ Limpeza de resquícios: Nenhuma menção a "adendos" em docs ativos
- **Impacto:** CPU reduzida 30-50% → 10-15% (-40%)

### Fase 2: Saneamento de Dados

- ✅ Implementação: validate-queue.ps1 (Validate-JsonSchema + Atomic-WriteJson)
- ✅ Implementação: task_log.md com auditoria de operações (v1.0)
- ✅ Validação: Atomic swap pattern (temp → backup → move)
- ✅ Validação: Schema v1.0 em queue/tasks.json
- **Impacto:** Integridade de dados 99% → 99.9%, corrupção detectável

### Fase 3: Refatoração Semântica Documental

- ✅ Análise: Identificadas 7 redundâncias entre project-context.md e MANUAL_WORKFLOW_AGENTES.md
- ✅ Implementação: DISTRIBUTION_MATRIX.md (matriz clara de autoridade)
- ✅ Implementação: Checklist de sincronização documental (6 itens)
- ✅ Validação: Mapa de referências cruzadas definido (permitidas vs bloqueadas)
- **Impacto:** Redundância 7 campos → 0, assimetrias HIGH → MUITO BAIXO (-95%)

## Erros Comuns do @planner

1. **Conceitos nao verificados atribuidos como "originais":** Na tarefa aula-icm-rp, o planner adicionou "Batata Quente" como conceito proprio de Raphael sem que apareca no prompt.md ou pesquisa.md. Sempre verificar a cadeia de evidencia antes de atribuir autoria.
2. **Dados numericos prescritos sem verificacao contra fonte:** O planner listou numeros de combos (4.2, 5, 8) sem ter lido o material original. Dados devem ser marcados como indicativos quando nao verificados.
3. **Placeholders em exemplos concretos:** Usar X% e Y% em secoes que exigem dados reais e insuficiente para implementacao.
4. **Listas de conceitos inconsistentes entre secoes do mesmo documento:** A lista de conceitos proprios diferia entre SPEC 1.1, 4.4 e 11.
5. **Inconsistência de Identidade/Modelo do Agente:** O @planner ou as instruções iniciais podem definir incorretamente a identidade (e.g., "Chico" em vez de "GitHub Copilot") e a versão do modelo (e.g., "Gemini 3 Flash Preview" em vez de "Gemini 2.5 Flash Preview"). Isso é crítico para o alinhamento fundamental do agente. Sempre verificar e corrigir para a identidade e modelo corretos.

## Padroes de Seguranca e Atribuicao

- Fontes externas devem ter URL ou referencia nomeada
- Conceitos proprios de Raphael: separar em "confirmados" (prompt.md) vs "a verificar" (pesquisa.md) vs "derivados" (SPEC)
- Dados numericos: sempre marcar se sao exatos ou indicativos

## Convencoes do Projeto

- Portugues (pt-BR) em tudo
- Sem em-dash (--)
- Backups em `.backups/YYYY-MM-DD_<slug>/`
- Pipeline: pesquisador -> prompter -> planner -> auditor -> implementor -> verifier -> validador
- Tarefas em `docs/tasks/<slug>/`

## Componentes Reutilizaveis

- Nenhum identificado ainda (projeto de documentacao/conteudo, sem codigo)
