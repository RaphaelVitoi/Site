---
id: registro-2026-09-09-configuracoes-ide-e-calibracao-diaria
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: "Gemini 3.8 Flash [Tier 1.A] -- sessao gemini-site-2026-09-09-settings-calibracao"
criado_em: 2026-09-09T10:53:00-03:00
atualizado_em: 2026-09-09T10:53:00-03:00
classes: [interno, medido, configuracao]
caminhos:
  - .vscode/settings.json
revisoes_de_ancora:
  - registro: auditoria-cwv-lighthouse-2026-09-01
    caminhos: [.vscode/settings.json]
    parecer: >-
      Ancora a auditoria de CWV e Lighthouse. A adicao da flag
      claudeCode.disableLoginPrompt nao afeta portas, runtime do browser,
      build ou metricas de performance.
  - registro: handoff-2026-08-30-resolucao-coderabbit-linters-e-malha-sota
    caminhos: [.vscode/settings.json]
    parecer: >-
      Ancora a configuracao de linters e saneamento de memoria. As diretivas
      de linter e analise permanecem intocadas em .vscode/settings.json.
  - registro: registro-2026-09-04-otimizacao-settings-seguranca-e-io
    caminhos: [.vscode/settings.json]
    parecer: >-
      Ancora a otimizacao de settings e IO. As regras de watcherExclude e
      configuracoes do language server continuam preservadas.
  - registro: registro-2026-09-07-padronizacao-sistemica-markdownlint
    caminhos: [.vscode/settings.json]
    parecer: >-
      Ancora as configuracoes de markdownlint e autocura no salvamento.
      As invariantes de formatOnSave e codeActionsOnSave permanecem validas.
  - registro: relatorio-handoff-20260830-teoria-dos-jogos-pmev-sota-v8-gold
    caminhos: [.vscode/settings.json]
    parecer: >-
      Ancora os custom commands e rotinas de build do motor PMev. Nenhuma
      configuracao de execucao ou solver foi modificada.
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  so: Windows
  python: '3.14.6'
  pwsh: '7.6.5'
objetivo: >-
  Reconciliar ancoras de .vscode/settings.json para inclusao da diretiva
  claudeCode.disableLoginPrompt, integrando tambem os arquivos de settings
  do Claude e a evidencia diaria de calibracao de 2026-09-08.
classe_tarefa: sincronizacao-configuracao
criterio_de_aceite:
  - Ancoras de .vscode/settings.json revisadas e mantidas validas.
  - Formato JSON valido e sem quebra de diretivas preexistentes.
  - Arquivos de calibracao diaria integrados com frontmatter conforme M.O. 13.B.
  - Portoes de registro e integridade aprovados com zero erros.
verificado:
  - >-
    .vscode/settings.json atualizado com claudeCode.disableLoginPrompt: true.
  - >-
    .claude/settings.json atualizado com plugins habilitados e formatacao limpa.
  - >-
    reports/agent-calibration/daily/2026-09-08.md refinado com criado_em obrigatorio.
  - >-
    reports/agent-calibration/daily/2026-09-08.json integrado com dados do ciclo.
  - >-
    Portoes record_anchor_gate e record_gate aprovados com sucesso.
nao_verificado:
  - >-
    Comportamento de login de extensoes externas sob outros sistemas operacionais.
---

# Registro: Configuracoes de IDE e Calibracao Diaria (2026-09-08)

Integracao de settings do VS Code e Claude, e registro do ciclo diario de
calibracao de 2026-09-08 com ancoras reconciliadas.
