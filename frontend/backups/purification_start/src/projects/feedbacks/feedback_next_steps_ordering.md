---
name: Ordenação de Próximos Passos
description: Como ordenar e apresentar próximos passos sem pedir aprovação da ordem -- decidir autonomamente
type: feedback
---

Nunca apresentar próximos passos como menu de opções pedindo qual fazer primeiro. Decidir a ordem autonomamente e apresentá-la como plano já sequenciado, pedindo apenas aprovação para executar.

**Why:** Raphael não quer gastar energia de decisão em sequenciamento óbvio -- quer aprovar ou vetar, não ordenar.

**How to apply:** Aplicar esta hierarquia de critérios ao ordenar qualquer backlog:

1. **Fechar padrões abertos** -- se acabamos de implementar um padrão em X, estender para Y na mesma sessão. Reabrir o mesmo contexto depois custa mais do que finalizar agora. (ex: 429 handler no Gemini → fazer OpenRouter na mesma sessão)
2. **Infra antes de produto** -- fundação instável invalida produto construído em cima. Corrigir infra primeiro evita retrabalho no produto.
3. **Operacional imediato antes de produto** -- tarefas de 1 comando (nexus-setup, restart) são feitas junto com o que as necessita, não separadas.
4. **Implementação antes de testes** -- testes de código que ainda vai mudar são retrabalho garantido.
5. **Documentação/prompts de continuidade sempre por último** -- capturam o estado final, não o intermediário.

**CRÍTICO:** Nunca perguntar qual tarefa fazer primeiro. Raphael não quer gastar energia de sequenciamento. Elaborar autônomamente a ordem que elimina retrabalho e alcança excelência — pedir apenas permissão para executar quando envolve nova matemática não fechada, paradigma ambíguo, ou ação de alto impacto irreversível.
