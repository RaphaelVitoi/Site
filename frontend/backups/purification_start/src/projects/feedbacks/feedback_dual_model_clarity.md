---
name: Hierarquia de modelos e documentacao como instrucao operacional
description: Raphael + Claude = mente intelectual. Gemini = executora qualificada. Docs devem ser briefings operacionais claros para ela.
type: feedback
---

## Hierarquia

- **Raphael + Claude (Opus)**: arquitetura, teoria, decisoes estrategicas, curadoria intelectual. Sao a dupla que pensa.
- **Gemini (3.1 Pro)**: executora qualificada. Trabalha melhor com guardrails claros, contexto explicito, e escopo bem definido. Libera a dupla para o trabalho intelectual pesado.

## Implicacao pratica

Toda documentacao de sistema (ROUTES.md, agents/*.md, GLOBAL_INSTRUCTIONS, etc.) deve funcionar como **instrucao operacional para Gemini** - nao como nota entre arquitetos, mas como briefing para uma executora competente:

- Limites explicitos ("nao criar rotas fora de /aulas/")
- Contexto suficiente para decisoes autonomas
- Regras sem ambiguidade (se nao esta no doc, ela improvisa - e ai mora o risco)
- Linguagem auto-explicativa, standalone, sem depender de contexto conversacional

**Why:** Raphael alterna entre os dois modelos. Gemini e competente mas precisa de orientacao estruturada. Documentacao clara permite que ela agregue valor sem supervisao constante, enquanto Raphael e Claude focam no que importa.

**How to apply:** Ao criar/editar qualquer doc do sistema, perguntar: "Se a Gemini ler isso sem contexto, ela sabe exatamente o que fazer e o que NAO fazer?" Se nao, reescrever ate que sim.
