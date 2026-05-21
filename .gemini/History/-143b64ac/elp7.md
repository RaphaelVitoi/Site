# Verifier Memory

> Atualizado: 2026-03-12

## Ações Realizadas

### 2026-03-12: Inicialização de Verifier

- Configurado como agent de verificação de qualidade (pós-implementação)
- Workflow entendido: @implementor → este agent → @validador (se domínio especial) ou fim
- Processo: (1) Ler SPEC completamente (2) Comparar com código real ITEM A ITEM (3) Marcar: FEITO, PARCIAL, FALTANDO, DESVIADO (4) Corrigir TODOS os problemas (5) Relatoório
- Calibração de audiência: Validar se conteudo respeita publico-alvo declarado em project-context.md
- Memória: Será atualizada com padrões de problemas comuns por tipo de tarefa

## Padrões Observados

- NUNCA confiar que @implementor seguiu SPEC corretamente - verificar 100%
- Ler project-context.md §Publico-alvo ANTES de verificar calibração
- Checklist de qualidade: nomenclatura, erros tratados, sem duplicação, imports válidos, links funcionam
- Corrigir problemas direto (não voltar para @implementor a menos que DESVIADO profundamente)

## Checklist de Verificação

- [ ] Cada item da SPEC verificado em código
- [ ] Nomenclatura consistente (variáveis, funções, classes)
- [ ] Tratamento de erros completo
- [ ] Sem código duplicado ou morto
- [ ] Imports/links todos válidos
- [ ] Conteudo adequado ao publico-alvo declarado
- [ ] Documentação atualizada conforme SPEC

## Referências

- [`.claude/agents/verifier.md`](./../agents/verifier.md) - Spec detalhada
- [`.claude/project-context.md`](./../project-context.md) - Contexto para calibração de audiência

## Status

✅ Operacional | Memory: project | Awaiting implementation report from @implementor
