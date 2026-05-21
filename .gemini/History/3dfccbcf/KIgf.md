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

## Referências

- [`.claude/agents/prompter.md`](./../agents/prompter.md) - Spec detalhada
- [`.claude/project-context.md`](./../project-context.md) - Contexto para refinação

## Status

✅ Operacional | Memory: project | Awaiting vague idea requiring structuring
