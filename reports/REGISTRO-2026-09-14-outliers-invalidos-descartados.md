---
id: registro-2026-09-14-outliers-invalidos-descartados
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: '2026-09-14T06:50:58-03:00'
atualizado_em: '2026-09-14T06:50:58-03:00'
classes: [interno, medido, calibracao, arbitragem]
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  so: Windows
  pwsh: '7.6.6'
  validador: scripts/ops/Test-AgentCalibrationLedger.ps1
  congelada_em: '2026-09-14'
caminhos:
  - reports/agent-calibration/outlier-evidence-ledger.jsonl
pendencias_resolvidas:
  - pend-2026-09-12-outlier-b39b7431
  - pend-2026-09-12-da7ef222-segunda-medicao
verificado:
  - arbitragem do Tier 0 em 2026-09-14 -- outliers validos continuam citados, invalidos excluidos
  - descarte por append com Record-AgentCalibrationOutlier.ps1 -Disposition discarded-with-reason, nenhuma linha apagada
  - sequencia 11 descarta da7ef222; sequencia 12 descarta b39b7431
  - cadeia validada em pwsh 7 -- 13 registros, cauda 77dfbc29115a46538eddbf24f4eb055229034740da5d7c714456ceca81f5f967
nao_verificado:
  - o efeito no relatorio diario -- o prompt da automacao foi alterado em 2026-09-14 com autorizacao do Tier 0 (assinar Gemini 3.8 Flash e citar so outliers sem resolves posterior), e so o relatorio de 14/09 mostra se ela obedece
---

# Outliers inválidos descartados

Arbitragem do Tier 0 em 2026-09-14: o ciclo de calibração continua citando
outliers **válidos**; os **inválidos** saem. O descarte é um registro acrescentado
com `discarded-with-reason`. A evidência original fica no ledger e a cadeia de hash
segue íntegra — excluir não é apagar.

| Outlier | Decisão | Motivo |
| :--- | :--- | :--- |
| `da7ef222` | descartado (seq. 11) | a evidência de origem, 4 erros em 16 chamadas em 2026-09-03, é do dia que o Tier 0 atribuiu à degradação dos servidores da Anthropic (`2d55d92a`/`6d9a2cce`); a única medição dirigida posterior (`d86cbde0`) foi contrária |
| `b39b7431` | descartado (seq. 12) | não há desvio medido contra linha de base; é avaliação positiva no ledger errado. O motivo é a ausência de desvio, não o sinal positivo |
| `7e5ca052` | válido | outlier grave, medido e com causa; a pendência `pend-2026-09-12-outlier-7e5ca052` segue aberta |
| `d86cbde0` | válido | medição real; permanece como dado, embora a hipótese que testava tenha sido descartada |

A pendência `pend-2026-09-12-da7ef222-segunda-medicao` também fecha: ela pedia
segunda medição de uma hipótese que agora está descartada, e medir o que não
está mais em teste só geraria dado sem pergunta.

Já fechados antes desta decisão: `512fc3a6`, `99da81dc` e `2d55d92a` (12/09).

**Contagem que muda para quem lê o ledger:** 13 registros físicos; 2 outliers
válidos abertos (`7e5ca052`, `d86cbde0`).
