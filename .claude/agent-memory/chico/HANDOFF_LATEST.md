# HANDOFF LATEST — integridade recuperada, portão sem margem

**Data:** 2026-09-02 · **Protocolo:** Chico SOTA v8.0 GOLD · **Estado:** publicado, `master == origin/master`.

## Fonte canônica

- Handoff integral: `reports/HANDOFF-2026-09-02-integridade-portao-no-teto-e-fila-para-o-sucessor.md`.
- Auditoria de integridade: `reports/AUDITORIA-2026-09-02-integridade-do-projeto-e-piso-de-transformers.md`.
- Registro do motor tensorial e da varredura: `reports/REGISTRO-2026-09-02-tensor-portavel-e-varredura-fora-de-python.md`.
- Fonte de trabalho prioritária, ainda intocada: `docs/research/pmev/AULA_1_2_EVIDENCE_LEDGER.md`.

## Estado medido

- Base publicada: `master == origin/master == 61bc5fcf`, árvore limpa.
- Suíte: **778 aprovados, 7 pulados, zero falhas** (venv 3.12; o `.venv` do projeto está em 3.14.0rc2 e quebra na coleta).
- Portão de 5 fases: **FRAGIL — 0 erros, 2 warnings, teto 2. Sem margem.**
- Ledger de calibração: `valid`, 2 registros, tail `75fdb4d4`.
- Nenhum caminho `.cerebro/` chega mais ao system prompt (medido: 1 → 0).

## Regras que o sucessor herda

- **O portão está no teto.** Qualquer warning novo, de qualquer fase, reprova todo commit. Os dois ocupantes — TBT sem artefato Lighthouse e `color-contrast` inconclusivo com baseline expirada — exigem Windows e arbitragem Tier 0.
- **O aceite do chromadb é condicional:** vale só enquanto o uso for `PersistentClient` embarcado. `HttpClient` ou `chroma run` reabrem quatro advisories sem correção.
- **Piso de dependência vai como `constraint`, nunca `override`, e sempre com `uv lock` no mesmo commit.**
- **Âncora de registro não se inventa.** Confira que o registro citado declara mesmo o caminho, e varra `docs/superpowers/plans/` também — não só `reports/`.
- **Número de terceiro não vira número próprio.** Há três contagens de Dependabot em circulação (7 / 8 / 6) e nenhuma foi conciliada.
- **Uma execução do portão não é o estado do projeto.** No mesmo commit ele deu três resultados por condição de ambiente: `FRAGIL` com cobertura perdida (frontend e CDP fora do ar), `FALHOU` com LCP 14.672 ms e TTFB 14.172 ms (rota fria, compilação Turbopack sob demanda), e `FRAGIL` com os dois warnings conhecidos (rota aquecida). Aqueça a rota antes de medir — `curl` na mesma rota devolveu 81,9 / 68,2 / 63,4 ms logo após os 14 s.

## Fila

1. **PMev** — a extração de três pares verificáveis da Aula 1.2 segue intocada; é a prioridade herdada do handoff de 2026-09-01.
2. Certificar TBT e arbitrar o `color-contrast` na máquina Windows.
3. Smoke de embedding com `transformers` 5.15.1 (salto de seis minor releases).
4. Reconciliar os alertas Dependabot — Tarefa 1 do plano de fronteira de dependências, exige autenticação do proprietário.
5. Validar `cwv_gate.ps1` em PowerShell 5.1 real antes de release.
6. Higiene: três drafts obsoletos (#30, #31, #32) e sete branches mortas.

## Calibração

Feedback desta sessão **ainda não coletado**. Nota e texto só entram no ledger pelo `Register-AgentCalibrationFeedback.ps1`, com a resposta literal do administrador. Nada foi inventado nem estimado.
