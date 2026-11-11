---
name: Registro mandatório do modelo condutor e regime de supervisão por sessão
description:
  Toda sessão no sistema deve registrar o modelo exato que conduziu e se foi
  assistida (arbitrada pelo Tier 0) ou automatizada.
type: feedback
---

# feedback session conductor model and mode

Cada sessão executada no ecossistema deve ter explicitamente registrado:

1. **Modelo condutor exato (`conductor_model`):** identificação nominal do
   modelo que operou a sessão (ex.: `gemini-4-argon`, `claude-opus-5.5`,
   `gpt-6.0-sol` ou agente especialista — IDs canônicos em
   `llm/model_registry.py`). Modelos servidos via Hermes Agent ou llama.cpp
   (harnesses-condutores que roteiam dinamicamente) ocupam o tier natural com
   sufixo `b` e são blindados desta calibração.
2. **Regime de supervisão (`supervision_mode`):**
   - `assistida`: assistida e arbitrada diretamente por Raphael Vitoi (Tier 0).
   - `automatizada`: autônoma, headless, background task, agendada ou pipeline
     de CI/CD.

**Why:** A governança piramidal exige rastreabilidade causal intransponível.
Saber exatamente qual modelo conduziu cada sessão e se houve
intervenção/arbitragem humana direta (Tier 0) ou se operou em regime autônomo é
indispensável para calibração bayesiana de performance, detecção de regressões e
atribuição de responsabilidade técnica sem ambiguidade.

**How to apply:** Em chamadas de registro de feedback
(`Register-AgentCalibrationFeedback.ps1`), passar sempre `-ConductorModel` e
`-SupervisionMode`. Em relatórios de handoff e auditorias diárias, declarar o
par condutor/regime no cabeçalho ou frontmatter.
