# HANDOFF LATEST — integridade recuperada, e o portão de calibração por sessão

**Data:** 2026-09-02 · **Protocolo:** Chico SOTA v8.0 GOLD · **Estado:** publicado, `master == origin/master`.

## ⚠ Primeira coisa a fazer na próxima sessão

**O limiar de calibração bate na próxima nota.** Há **2 de 3 sessões** com feedback no ledger — `codex-site-2026-09-01-prioridade` e `claude-opus5-site-2026-09-02-integridade`. A sessão seguinte, ao receber feedback, fecha as três.

Quando isso acontecer, a obrigação é **avisar proativamente** e propor a calibração assistida, **se não houver tarefa em andamento** — calibração não interrompe trabalho. Não esperar as 23:59: aquela corrida é lastro de auditoria, não gatilho.

Confira antes de afirmar qualquer coisa:

```
pwsh -File scripts/ops/New-AgentCalibrationDailyEvidence.ps1
```

E declare o `session_id` **e** o `session_started_at` ao registrar o feedback. Sessão vai do início ao fim de um trabalho; **compactação não a encerra**. Uma sessão partida ao meio vira duas na contagem e falsearia o portão — o script detecta e recusa contar.

## Fonte canônica

- Handoff integral: `reports/HANDOFF-2026-09-02-integridade-portao-no-teto-e-fila-para-o-sucessor.md`.
- Portão de calibração por sessão: `reports/REGISTRO-2026-09-02-portao-de-calibracao-por-sessao.md`.
- Retrospectiva e feedback `0.8`: `reports/AUDITORIA-2026-09-02-retrospectiva-e-observacao-de-calibracao.md`.
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

0. **Registrar a tarefa das 23:59** na máquina Windows: `pwsh -File scripts/ops/Register-AgentCalibrationDailyTask.ps1`. Hoje ela sai com `NAO REGISTRADO` fora do Windows — e, por ser tarefa agendada, exige revalidação em PS 5.1 real (§1.1).
1. **PMev** — a extração de três pares verificáveis da Aula 1.2 segue intocada; é a prioridade herdada do handoff de 2026-09-01.
2. Certificar TBT e arbitrar o `color-contrast` na máquina Windows.
3. Smoke de embedding com `transformers` 5.15.1 (salto de seis minor releases).
4. Reconciliar os alertas Dependabot — Tarefa 1 do plano de fronteira de dependências, exige autenticação do proprietário.
5. Validar `cwv_gate.ps1` em PowerShell 5.1 real antes de release.
6. Higiene: três drafts obsoletos (#30, #31, #32) e sete branches mortas.

## Calibração

Feedback desta sessão: **`0.8`**, gravado literal, sem arredondamento — *"fluxo pouco linear e organizado; bom administrador de empresa, mas não de equipes"*. Cadeia `valid`, 3 registros, tail `9ec18e81`.

A crítica tem base factual verificável, e está registrada como fato, não como interpretação: operei como executor único, com **zero delegações** aos 19 agentes, zero subagentes e zero uso de `queue/tasks.db`, num repositório cuja arquitetura inteira é uma malha multiagente. E o fechamento teve quatro reversões de fluxo que verificação prévia teria evitado. **Quem herdar isto deveria tentar o caminho oposto: delegar de fato à malha.**

### A regra do portão, como ficou

| | |
| :--- | :--- |
| **Métrica** | ≥3 **sessões distintas** com feedback |
| **Densidade intra-sessão** | 3 feedbacks numa sessão é **dado retido**, não gatilho |
| **Acumulação** | não expira — dia sem sessão é dia sem avaliação, não dia que apaga evidência |
| **Nota** | aceita **decimal**, gravada literal (`0.8` é `0.8`) |
| **Gatilho** | aviso proativo ao bater o limiar, se não houver tarefa em andamento |
| **Lastro** | corrida diária às 23:59 — **ainda não registrada**, exige Windows |

Não contam, falhando fechado: feedback sem `session_id`, sessão com `session_started_at` divergente, cadeia inválida.

Guard em `tests/test_calibracao_portao_por_sessao.py` (7 testes) reprova quem voltar a contar por dia, deixar densidade abrir o portão, ou fizer evidência expirar.
