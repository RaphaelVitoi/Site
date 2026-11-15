---
name: Calibracao formal presencial exclusiva do Tier 0 (separacao coleta / auto-minima / formal)
description: Regra explicitada pelo Tier 0 em 2026-11-15: coleta de feedback e auto-calibragem minima (-AutoMinima) nao equivalem a calibracao formal (-Tier0Present), que exige presenca do administrador e e a unica que zera o ciclo.
type: feedback
---

Em 2026-11-15, o administrador (Tier 0 — Raphael Vitoi) detectou que a `seq 93` (`calibration_id: 0fa6509e-06cd-4a03-b2b0-bceebbfce686`, gravada em `2026-11-14T07:10:12-03:00`) havia fechado o ciclo do ledger sem sessao presencial de calibracao do Tier 0.

**Regra corrigida e blindada em codigo (`Record-AgentCalibration.ps1` + `New-AgentCalibrationDailyEvidence.ps1`):**

1. **Coleta de feedback (`Register-AgentCalibrationFeedback.ps1`)** apenas registra nota/proveniencia/comentario no ledger.
2. **Auto-calibragem minima (`Record-AgentCalibration.ps1 -AutoMinima`)** e autorizada apos `>= 3` sessoes distintas elegiveis, grava `record_type: auto_calibration`, e **nao** reinicia nem substitui o ciclo formal.
3. **Calibracao formal (`Record-AgentCalibration.ps1 -Tier0Present`)** so ocorre **com presenca explicita do Tier 0** e e o unico registro (`record_type: calibration`) que reinicia o portao de sessoes.
4. **Retratacao append-only (`-RetractCalibrationId ... -Tier0Present`)** anula formalmente fechamentos indevidos sem editar manualmente o JSONL.

**Why:** Sem essa trava executavel, agentes podiam fechar o portao formal sozinhos ao ver `>= 3` sessoes acumuladas, falsificando `ultima_calibracao` e silenciando o aviso de calibracao presencial ao Tier 0.

**How to apply:** Ao atingir `>= 3` sessoes, proponha a calibracao presencial ao Tier 0; use `-AutoMinima` somente para registro minimo autonomo quando cabivel, e nunca acione `-Tier0Present` sem sessao conduzida com Raphael Vitoi.
