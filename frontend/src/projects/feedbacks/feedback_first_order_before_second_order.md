---
name: Primeira ordem antes da segunda ordem em derivações
description: Ao derivar qualquer função, expor o componente dominante (primeira ordem) antes das correções contextuais (segunda ordem). Nunca tratar ajustes como conteúdo principal.
type: feedback
---

Ao derivar EV_fold dinâmico f(t, d_pj, pos), o foco foi colocado nas três dimensões contextuais (t, d_pj, pos) — que são correções de segunda ordem — enquanto o componente principal `EV_fold = −investido` foi tratado como detalhe de setup.

**Why:** A primeira ordem é o que domina em magnitude e frequência. As correções contextuais só são estrategicamente relevantes em situações específicas — nunca substituem o baseline. Inverter a hierarquia distorce a compreensão do mecanismo e subestima o que realmente importa.

**How to apply:** Em qualquer derivação com baseline + correções:
1. Derivar e expor o baseline (primeira ordem) como conteúdo central
2. Nomear explicitamente que as correções são de segunda ordem
3. Só então derivar cada correção, com sua magnitude relativa ao baseline como referência
