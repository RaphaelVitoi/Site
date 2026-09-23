---
id: registro-2026-09-22-skill-handoff-e-calibracao
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: Codex GPT-6 Luna
criado_em: '2026-09-22T21:08:00-03:00'
atualizado_em: '2026-09-22T21:08:00-03:00'
classes: [interno, medido, governanca, handoff]
caminhos:
  - .agents/skills/site-session-handoff/SKILL.md
  - .agents/skills.json
  - CLAUDE.md
  - data/agents_manifest.json
  - scripts/ops/Register-AgentCalibrationFeedback.ps1
  - tests/test_agent_calibration_feedback.py
  - tests/test_governanca_skills.py
config_medida:
  branch: master
  operador_manifestado: 19
  testes_direcionados: '13 passed'
  suite_global: '0 failures; 2 skipped for documented prerequisites'
  cwv: 'pass; local runtime sample only'
  anchors: pass
  record_gate: pass after these anchor reviews
verificado:
  - A skill versionada cobre contextualizacao sistemica, relatorio oficial, auditoria, aprendizado, memoria, identidade, feedback numerico/qualitativo opcional e gates de publicacao.
  - O allowlist Antigravity inclui a skill; o manifesto dos 19 operadores declara a capacidade e os documentos foram regenerados pelo sincronizador canonico.
  - O gravador de calibracao aceita nota decimal sem comentario e omite a chave feedback quando nao ha comentario.
  - O validador oficial da skill, os testes direcionados, a suite global, CWV e o portao de ancoras passaram; os resultados e limites estao discriminados neste registro.
nao_verificado:
  - CI remoto e estado de execucao da skill em provedores fora dos operadores e da ponte versionada do projeto.
  - Pre-commit e pre-push finais, que ainda precisam executar sobre o commit/push autorizado.
revisoes_de_ancora:
  - registro: taxonomia-canonica-de-documentacao-e-relatorios
    caminhos: [CLAUDE.md]
    parecer: >-
      Revisado e mantido vigente. A unica adicao em CLAUDE.md aponta os operadores
      para a skill versionada de handoff e explicita que ela operacionaliza, sem
      substituir, a governanca canonica. Nao altera a taxonomia documental.
  - registro: auditoria-2026-09-01-retrospectiva-prioridade-sessao
    caminhos: [scripts/ops/Register-AgentCalibrationFeedback.ps1, tests/test_agent_calibration_feedback.py]
    parecer: >-
      Revisado e mantido vigente. O escritor passa a aceitar score decimal sem
      comentario qualitativo, em conformidade com CLAUDE.md §8.3; o teste novo
      cobre ausencia da chave feedback. Preservam-se score, identidade e cadeia.
  - registro: auditoria-2026-09-12-proveniencia-executavel-do-feedback
    caminhos: [CLAUDE.md, scripts/ops/Register-AgentCalibrationFeedback.ps1, tests/test_agent_calibration_feedback.py]
    parecer: >-
      Revisado e mantido vigente. A extensao permite comentario opcional sem
      alterar validacao de proveniencia, identidade, score ou append-only; a
      referencia em CLAUDE.md apenas aponta para o procedimento especializado.
  - registro: checkpoint-2026-06-14-infrastructure-hardening
    caminhos: [CLAUDE.md]
    parecer: >-
      Revisado e mantido vigente como historico de infraestrutura. O apontador
      de handoff acrescentado a CLAUDE.md nao altera conclusoes nem ancora de
      infraestrutura do checkpoint.
  - registro: handoff-2026-09-01-prioridade-pmev-continuacao
    caminhos: [scripts/ops/Register-AgentCalibrationFeedback.ps1, tests/test_agent_calibration_feedback.py]
    parecer: >-
      Revisado e mantido vigente como continuidade historica. A mudanca aditiva
      no escritor implementa a opcionalidade qualitativa ja declarada pela
      governanca, sem alterar os registros ou a calibracao PMev desse handoff.
  - registro: handoff-2026-09-12-reconciliacao-calibracao-e-proveniencia
    caminhos: [CLAUDE.md, scripts/ops/Register-AgentCalibrationFeedback.ps1, tests/test_agent_calibration_feedback.py]
    parecer: >-
      Revisado e mantido vigente. A nota opcional agora pode ser representada
      sem comentario ficticio, preservando os contratos de proveniencia e
      distinguindo dado quantitativo de qualitativo.
  - registro: relatorio-2026-06-16-auditoria-e-harmonizacao-v8-gold
    caminhos: [CLAUDE.md]
    parecer: >-
      Revisado e mantido vigente como historico. O apontador de handoff e
      aditivo e nao modifica as conclusoes historicas de infraestrutura ou
      harmonizacao registradas no relatorio.
supersede: null
---

# Skill versionada de handoff, calibracao e gates

## Objetivo

Reduzir latencia e custo de contexto no encerramento de sessoes do Site sem
perder governanca, proveniencia ou cobertura sistemica. Uma skill unica guia o
operador da reconstrucao do ecossistema ao fechamento verificavel, reutilizando
evidencias ja produzidas e evitando relatorios redundantes.

## Integracao realizada

- Fonte canonica: `.agents/skills/site-session-handoff/SKILL.md`, com validacao
  do skill creator.
- Distribuicao do projeto: allowlist da ponte versionada Antigravity, manifesto
  dos 19 operadores e documentos gerados pelo sincronizador oficial.
- Governanca: `CLAUDE.md` aponta para a skill e conserva as regras canonicas.
- Feedback: o registro suporta nota literal decimal de 0 a 10 com comentario
  opcional; sem comentario, a chave qualitativa nao e inventada.
- Portoes: staging explicito, suite, CWV, revisao de ancoras, registro,
  pre-commit e pre-push; sem bypass e sem capturar alteracoes preexistentes.

## Evidencia e limites

Os 13 testes direcionados passaram. A suite global passou sem erros nem
warnings, com dois testes pulados: um sem arvore supersedida e outro sem CUDA ou
override CPU. CWV, portao de ancoras e validacao estrutural da skill passaram.
Uma primeira chamada da suite com o Python global falhou porque aquele runtime
nao tinha `pytest-cov`; a repeticao pelo Python do `.venv` do projeto passou.
O portao de registros encontrou sete documentos vigentes ancorados; as revisoes
acima foram feitas por parecer central, sem editar os documentos historicos.

O pre-commit/pre-push e CI remoto nao sao declarados como executados neste
registro; dependem da etapa real de commit e push. A exposicao fica comprovada
para os 19 operadores do Site e a ponte configurada, nao para qualquer modelo
ou provider arbitrario fora desse ecossistema.
