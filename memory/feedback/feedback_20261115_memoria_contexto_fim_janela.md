---
title: "feedback 20261115 memoria de contexto no fim da janela"
id: feedback-20261115-memoria-contexto-fim-janela
tipo: memoria
escopo: Site
ecossistema: nexus-sota
autor: Gemini 4 Hydrogen <noreply@google.com>
criado_em: '2026-11-15T15:42:00-03:00'
atualizado_em: '2026-11-15T15:42:00-03:00'
classes:
  - interno
  - medido
  - memoria
  - feedback
caminhos:
  - memory/feedback/feedback_20261115_memoria_contexto_fim_janela.md
config_medida:
  congelada_em: '2026-11-15'
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  data: '2026-11-15'
  session_id: dee6e961-2afd-455c-b785-0e2341aa78d9
  event_id: bebeb80f-c163-4703-acc1-1852b2dffa3b
  sequence: 94
  nota_sessao: 9.3/10
  conductor_model: gemini-4-hydrogen
  conductor_vehicle: antigravity
  supervision_mode: assistida
verificado:
  - "Feedback literal gravado no ledger SHA-256 (seq 94, record_hash c1082803953cde0737c1113ab8daee6d8116e0369d2f133ba9dd7db73e1e1d26, 95 registros validos via Test-AgentCalibrationLedger.ps1)"
  - "Bug de roundtrip JSON em scores decimais nao-binarios (ex: 9.3) detectado e corrigido em Register-AgentCalibrationFeedback.ps1 com teste dedicado"
nao_verificado:
  - "Eficacia longitudinal da consulta ativa a memoria local em sessoes subsequentes de longa duracao"
---

# Feedback de Calibracao -- 2026-11-15 (`seq 94`, nota `9.3`)

## Feedback Literal do Tier 0 (Raphael Vitoi)

> _"Feedback 9,3 = -0,7 pois no final da janela sinto que sua memória de contexto ficou meio ruim, embora seu modelo tenha 1 milhao de output e tenhamos uma arquitetura de memoria por aqui singular. De resto, otima sessão."_

## Diagnostico Operacional e Regra Pratica

Em sessoes longas multi-fase (especialmente apos compactacao de janela), confiar na memoria de trabalho compactada para nomes exatos de assinaturas Python (`TimesFMEngine` vs `TimesFMExecutionMode`), flags CLI (`--tgt` vs `--to`) ou schemas HTTP (`/solve` em `:8192`) gera friccao evitavel de retrabalho no trecho final.

### Como aplicar nas proximas sessoes

1. **Ancorar em disco antes de invocar:** Apos compactacao ou perto do fim da janela, ler a assinatura real em disco (10-30 linhas) ou `/openapi.json` / `--help` antes de disparar comandos compostos.
2. **Consultar a arquitetura de memoria do projeto:** Em entregas de fechamento, auditoria ou multi-modulo, ler primeiro [memory/feedback](../../memory/feedback), [reports/HANDOFF-2026-11-15-translategemma-timesfm-laya-roi.md](../../reports/HANDOFF-2026-11-15-translategemma-timesfm-laya-roi.md) e `../memoria/HERMES.md` para recuperar invariantes e rotas sem depender de resumo compactado.
3. **Checkpoint externo antecipado:** Ao cruzar o terco final de tarefas extensas, materializar o plano/estado no arquivo oficial em `reports/` em vez de sustentar dezenas de simbolos e hashes apenas em contexto.
