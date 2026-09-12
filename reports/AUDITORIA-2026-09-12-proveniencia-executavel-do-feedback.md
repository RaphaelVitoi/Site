---
id: auditoria-2026-09-12-proveniencia-executavel-do-feedback
tipo: auditoria
escopo: Site
ecossistema: nexus-sota
autor: Codex
criado_em: 2026-09-12T08:49:55-03:00
atualizado_em: 2026-09-12T08:49:55-03:00
commit: 65e0863bc3b73c30f2b198109a69fedf6bced220
classes: [interno, calibracao, proveniencia]
caminhos:
  - CLAUDE.md
  - scripts/ops/AgentCalibrationProvenance.ps1
  - scripts/ops/Register-AgentCalibrationFeedback.ps1
  - scripts/ops/New-AgentCalibrationDailyEvidence.ps1
  - scripts/ops/Record-AgentCalibration.ps1
  - reports/agent-calibration/feedback-ledger.jsonl
  - tests/test_agent_calibration_provenance.py
  - tests/test_agent_calibration_feedback.py
  - tests/test_calibracao_portao_por_sessao.py
  - tests/test_calibracao_fechamento_do_ciclo.py
config_medida:
  runtime: pwsh 7.6.6
  feedback_records_physical: 58
  outlier_records_physical: 8
  feedback_records_effective: 22
  eligible_current_cycle: 1
  historical_excluded: 9
verificado:
  - 44 testes direcionados aprovados em 51.71s sem warnings
  - 10 testes TimesFM aprovados em 5.45s sem warnings
  - Ruff aprovado nos quatro arquivos de testes alterados
  - ambas as cadeias validas depois de dois appends
  - git diff --check aprovado
nao_verificado:
  - suite integral e pre-commit nao executados
  - sem commit ou push
  - regime de supervisao de sete registros historicos nao comprovado pelas fontes consultadas
supersede: null
---

# Proveniência executável — auditoria e preservação histórica

## Contrato implementado

Escritor e gerador consomem a mesma validação. Novos feedbacks exigem identidade
de sessão, declaração de handoff, modelo versionado, conector e supervisão.
GPT/ChatGPT corresponde a `codex`, Claude a `claude-code`, Gemini a `antigravity`
(Antigravity 2.0). A IDE compartilhada não é conector. Nenhum campo é preenchido
por inferência: a checagem de sintaxe/coerência não certifica a verdade da declaração.

O histórico é lido no estado efetivo, após aplicar correções append-only.
O gerador mantém os registros e discrimina exclusões com event_id e motivo.
O registrador de calibração recusa corroboração inelegível inclusive sob exceção
de limiar e relê a evidência sob lock. Prelúdio/interlúdio não viram feedback.
Os escopos antigos `handoff-session-YYYY-MM-DD` continuam reconhecidos.

Estatísticas descritivas preservam a série histórica; não são a amostra elegível.
O ciclo atual começa depois da calibração de sequência 27: só o feedback 55
está nele. Gate fechado por uma sessão, não por ausência de atividade diária.
O nome da sessão 55 contém `preludio`, mas isso não a invalida: o encerramento
está explicitamente documentado em
`REGISTRO-2026-09-12-preludio-o-instrumento-que-sabia-abrir-e-nao-fechar.md`,
seção “A nota chegou — o prelúdio se fecha no handoff”.

## Arbitragem histórica respeitada

As correções existentes 28–29 suprem modelo/conector do evento 1; 30–53 suprem
outros modelos/conectores; 54 reconcilia a identidade da sessão do evento 21.
Foram consumidas, não duplicadas. Todos os 22 feedbacks têm modelo e conector
no estado efetivo. As correções de modelo 23 e 24 são sucessivas: vale a última,
`gpt-5.6-terra`, e não a inferência anterior `gpt-6-astra`.

## Dois appends desta intervenção

| Sequência / correction_id | Evento alvo | Campo | Fonte primária |
| :--- | :--- | :--- | :--- |
| 56 / `1764ad6a-0835-47fd-a7fb-79cd5ddb00cb` | `0b30eafd-b57f-47dc-bf28-9822a0f36769` | scope → handoff | `HANDOFF-2026-09-05-auditoria-site-moldes.md`: session_id exato e feedback final 10/10 |
| 57 / `afc7387e-3fbd-49cf-bf08-ac0339481556` | `15b9a610-70d5-449e-8192-bf1ad3b09565` | scope → handoff | `HANDOFF-2026-09-02-curadoria-mcp-quarentena-e-roteamento-lazy.md`: sessão exata; `HANDOFF-2026-09-03-guarda-de-governanca-camada-anthropic-e-cobertura-cve.md`: confirmação do feedback dessa sessão |

Autoridade registrada: Tier 0, execução delegada na tarefa
`01a09547-c8df-7641-87b5-83723b4b645d`. Os scopes originais eram descrições
temáticas; permanecem nos registros originais. Nenhuma nota foi alterada.

## Evidência preservada com elegibilidade incompleta

| Sequência | Event ID | Pendência específica |
| ---: | :--- | :--- |
| 1 | `c2c4cb6f-f864-4be5-9d77-bc8e28d51dfa` | supervision_mode ausente |
| 2 | `dcf7d9d2-eec7-4ce8-9f6c-b5c4f69a7933` | supervision_mode ausente |
| 3 | `ca8346a2-bea7-4930-a562-277bba6b77d3` | supervision_mode ausente |
| 5 | `15b9a610-70d5-449e-8192-bf1ad3b09565` | supervision_mode ausente, handoff agora explicitado |
| 7 | `06a2ae1d-0330-40fe-8b3b-33012e682772` | supervision_mode ausente |
| 8 | `55e7caae-f0ca-4702-a890-e299213c78c3` | supervision_mode ausente |
| 9 | `701d6e3c-7daf-4c2d-b3c6-16624946aada` | supervision_mode ausente |
| 10 | `48443d06-2119-4ab9-9c36-6ba72d35c056` | scope intrasessao-outlier; não promover a handoff |
| 11 | `2b589f4c-f59e-451a-9e44-ba7d1cc1ef5c` | scope sessao; fonte específica de handoff não localizada |

Não se deduz supervisão assistida apenas porque o feedback foi dado por um humano.
Os handoffs e correções consultados confirmam notas e origens, mas não fornecem
explicitamente esse campo para os sete. Arbitragem documentada que o forneça
poderá completar cada caso por append, sem reescrever o passado.

## Validação e limites

Os 44 testes cobrem ausência/blank de proveniência, três conectores aceitos,
IDE/associação incorreta/modelo desconhecido recusados, retenção do histórico,
bloqueio de corroboração e restauração por correção append-only. A primeira
coleta falhou por import incorreto do módulo de fixtures; corrigido antes da
execução aprovada. Os dez testes TimesFM verificam a integração existente,
não constituem experimento comportamental nem calibração aplicada.

Hashes finais: feedback
`11824d7d37249b1bd4a9fee801cce4561029c74337e2fa3fd0ab0698a364b76f`;
outliers `b69d6ec16b6f6d5181975e94152788ca5a2209a2e8288d4957edebe9a8ed18a7`.
Nenhuma calibração, commit, push ou alteração de permissões foi executada.
