# Planner Memory

## Estrutura do Projeto

- Repositorio: `c:/Users/Raphael/OneDrive/Documentos/Site/`
- Tarefas: `docs/tasks/<slug>/` com pesquisa.md, prompt.md, PRD.md, SPEC.md
- Contexto compartilhado: `.claude/project-context.md`
- Sem framework web ativo; projeto e de documentacao/conteudo
- Autor: Raphael Vitoi.

## Padroes Observados

- Pipeline de agentes: pesquisador -> prompter -> planner -> auditor -> implementor -> verifier -> validador
- Cada agente le os artefatos dos anteriores antes de trabalhar
- Handoff Log no project-context.md para rastreabilidade

## Convencoes

- portugues (pt-BR) em tudo (codigo, docs, comentarios)
- Sem em-dash (--)
- Tom: direto, denso, sem condescendencia, sem validacao emocional vazia
- Conceitos proprios do usuario devem ser preservados com nomenclatura original

## Decisoes Relevantes

- Para aulas/conteudo educacional: SPEC deve ser detalhada o suficiente para que @implementor produza sem ambiguidade
- Cada secao da SPEC deve ter: conteudo obrigatorio, tom, criterio de verificacao
- Dados numericos devem ter fonte nomeada explicitamente
