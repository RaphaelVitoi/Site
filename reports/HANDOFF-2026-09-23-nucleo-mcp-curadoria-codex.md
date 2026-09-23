---
id: handoff-2026-09-23-nucleo-mcp-curadoria-codex
tipo: handoff
escopo: Site e raiz multiprojeto — roteamento MCP, recursos Codex e consumo de memoria
ecossistema: nexus-sota
autor: Codex GPT-6 Luna <noreply@openai.com>
criado_em: '2026-09-23T16:02:00-03:00'
atualizado_em: '2026-09-23T16:02:00-03:00'
classes: [interno, medido, governanca, handoff, calibracao]
caminhos:
  - .mcp.json
  - .vscode/settings.json
  - Site.code-workspace
  - scripts/ops/suite_verde.py
  - tests/test_suite_verde.py
  - tests/test_dashboard_notifications.py
  - reports/agent-calibration/feedback-ledger.jsonl
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  commit_base: 43cc3ecafe2ec0db6a7ca96059876a45442c98a5
  session_id: 01a0cd79-1e50-7aa3-9865-32e051504374
  session_started_at: '2026-09-23T08:54:22.151Z'
  condutor: Codex GPT-6 Luna <noreply@openai.com>
  modelo: gpt-6-luna
  veiculo: codex
  tier: 1
  supervisao: assistida
  data_das_medicoes: 2026-09-23
verificado:
  - catalogo da raiz reconciliado nos hospedeiros por sincronizar_nucleo.py --verificar
  - inventario de plugins Codex medido pelo CLI antes e depois, 219 para 187 instalados e 102 para 80 habilitados
  - configuracao Codex valida como TOML e ledger de feedback valido com 83 registros
nao_verificado:
  - economia de RAM apos reiniciar Codex e IDE; clientes ativos podem conservar subprocessos da configuracao antiga
  - uso ponta a ponta de cada ferramenta MCP por todos os condutores depois do reinicio
  - CI remoto dos commits desta etapa
pendencias:
  - id: pend-2026-09-23-reinicio-clientes-mcp
    o_que: Reiniciar Codex e IDE e medir arvores MCP e RAM por consumidor antes de declarar economia efetiva.
    dono: Codex e Tier 0
    prazo: 2026-09-30
pendencias_resolvidas: []
revisoes_de_ancora:
  - registro: taxonomia-canonica-de-documentacao-e-relatorios
    caminhos: [CLAUDE.md]
    parecer: A adicao da regra de cooperacao do Tier 1 nao altera a taxonomia de diretorios, frontmatter ou portoes documentais; a especificacao permanece vigente.
  - registro: auditoria-2026-09-12-proveniencia-executavel-do-feedback
    caminhos: [CLAUDE.md]
    parecer: A regra nova remete ao catalogo de identidade e nao modifica escritor, validador, escala ou proveniencia do feedback; a auditoria mantem seu alcance original.
  - registro: checkpoint-2026-06-14-infrastructure-hardening
    caminhos: [CLAUDE.md]
    parecer: O checkpoint descreve estado historico de junho. A regra aditiva de compartilhamento nao altera seus fatos situados no tempo nem promove suas contagens antigas a estado atual.
  - registro: handoff-2026-09-12-reconciliacao-calibracao-e-proveniencia
    caminhos: [CLAUDE.md]
    parecer: A governanca acrescenta compartilhamento de recursos entre condutores; o contrato de feedback e identidade tratado nesse handoff permanece igual.
  - registro: registro-2026-09-19-refatoracao-sonar-python-e-icm
    caminhos: [scripts/ops/suite_verde.py]
    parecer: A suite agora limita workers pela RAM e serializa chamadas concorrentes, preservando a mesma selecao de testes e o contrato de cache pela arvore; o registro anterior de refatoracao Sonar continua historicamente valido.
  - registro: relatorio-2026-06-16-auditoria-e-harmonizacao-v8-gold
    caminhos: [CLAUDE.md]
    parecer: O relatorio e historico de junho e sua descricao de infraestrutura nao e reinterpretada como medicao presente pela regra nova de cooperacao.
---

# Handoff — nucleo compartilhado e curadoria do Codex

**Inicio:** Site em `master` no commit `43cc3ecafe2ec0db6a7ca96059876a45442c98a5`; raiz multiprojeto em `main` no commit `785596331371677e57d23de5cfced3f186330486`. Ambos com alteracoes locais da etapa. Raphael autorizou commit e push nos dois repositorios, mantendo o ambiente Python retido apenas no disco.

**Arquitetura e decisoes:** o catalogo da raiz multiprojeto e a fonte canonica dos MCPs. O IDE e interface dos projetos. Condutores acessam uma instancia compartilhada de servidores stdio por HTTP local, ou servidores remotos oficiais. Credenciais ficam no HKCU. Supabase passou ao catalogo compartilhado; Stitch continua sendo design. Os MCPs Data Cloud continuam especificos da extensao IDE. A curadoria de Claude Code e Antigravity 2.0 foi reservada aos respectivos condutores. Detalhes, limites e rollback constam no relatorio `../relatorios/RELATORIO_HARMONIZACAO_CODEX_GATEWAY_2026-09-23.md` da raiz multiprojeto.

**Site:** o MCP Supabase saiu da configuracao de projeto duplicada. Configuracoes do editor reduzem trabalho em segundo plano; a suite verde tem trava por clone e limite de workers guiado pela memoria. Os ajustes de Suite e seu teste ja estavam no conjunto local ao assumir este handoff e entram por autorizacao explicita para publicar todo o trabalho pendente. A primeira suite integral encontrou dois erros: o teste do dashboard lia o ledger vivo, que ganhou novo feedback, e o inventario de ferramentas estava ausente naquele instante. O teste do dashboard recebeu uma amostra deterministica de tres feedbacks; Raphael recuperou o inventario e o teste isolado passou. Uma medicao final do conteudo corrigido ainda e exigida antes da publicacao.

**Feedback:** o Tier 0 atribuiu **9,8/10** e pediu mais criatividade, proatividade e solucoes menos obvias. Foi registrado via `Register-AgentCalibrationFeedback.ps1` na sequencia 82; `Test-AgentCalibrationLedger.ps1` confirmou 83 registros e hash final `3b9dd64ec949eda9792c3470faea63855febbf125c2c6f0c427057fc0c3928f0`. O aprendizado foi encaminhado pela nota de memoria autorizada, sem edicao direta no indice de memoria.

**Limites para o sucessor:** configuracao sincronizada nao prova que os clientes ja abandonaram processos residentes antigos. Medir depois do reinicio antes de afirmar ganho de RAM. Nao retirar as origens Claude das skills compartilhadas antes de migrar seus consumidores. Os SHAs de publicacao e o estado de CI devem ser consultados no Git remoto; este registro documenta o estado anterior ao commit.
