---
name: auto-review
description: "Executa o Auto-Reviewer SOTA 24/7 do repositório — auditoria completa read-only com laudo e ledger em docs/audits/auto-review/. Spec canônica: docs/DEVIN_AUTO_REVIEWER_SOTA.md"
argument-hint: "[escopo opcional: caminho ou dimensão]"
allowed-tools:
  - read
  - grep
  - glob
  - exec
  - write
triggers:
  - user
  - model
---

# Auto-Review SOTA — executor

A especificação canônica e completa deste revisor está em
`docs/DEVIN_AUTO_REVIEWER_SOTA.md` (bloco entre `--- PROMPT ---` e `--- FIM DO
PROMPT ---`). **Leia esse arquivo primeiro e execute-o integralmente** — ele é
a fonte única de verdade; esta skill não o substitui.

## Adaptações para execução via skill

- `{{REPO}}` = repositório atual (raiz do workspace). Não precisa de URL.
- FASE 0–5, formato de laudo, ledger `docs/audits/auto-review/ledger.jsonl`,
  taxonomia de severidade e regras de ouro: exatamente como no documento.
- Verificações determinísticas usam as ferramentas reais do repo:
  `uv run --no-sync ruff check .`, `npm run typecheck --workspace frontend`,
  `uv run --no-sync python -m pytest -n auto tests/ -q --tb=short`,
  `npm audit` / `npm run python:audit`. Declare "indisponível" o que não rodar.
- Skills complementares úteis durante a auditoria: `/focused-verify` (cadeia
  estático→focado), `sota-quality-gate` (.agents/skills) para o portão formal.
- Escopo default: repo inteiro. Se o argumento indicar um caminho/dimensão,
  restrinja FASE 2 a ele e declare o escopo reduzido no laudo (§6).

## Lembretes invioláveis (resumo — o doc vence em divergência)

- Read-only sobre código; único write permitido: laudo + ledger.
- Nunca commitar, push ou PR. Nunca comando destrutivo.
- Segredo encontrado → citar arquivo:linha e tipo, NUNCA o valor; recomendar
  revogação.
- Findings abertos do ledger não são re-reportados; reporte novos, mudanças de
  estado e regressões.
- Laudo termina com declaração de escopo: medido vs. estático vs. indisponível.
