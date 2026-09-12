---
id: auditoria-2026-09-12-o-ci-vermelho-que-nenhum-portao-local-media
tipo: auditoria
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: '2026-09-12T11:18:04-03:00'
atualizado_em: '2026-09-12T17:05:24-03:00'
classes: [interno, medido, calibracao, ci, proveniencia]
referencias_nao_resolviveis:
  # Este relatorio CITA os dois caminhos para dizer que eles nao resolvem aqui --
  # e o detector nao distingue citar para apontar de citar para diagnosticar, o
  # que a docstring dele ja previa. Declarados pelo mesmo motivo do relatorio de
  # 09-11: moram na raiz multiprojeto, que e outro repositorio.
  - 'scripts\ops\inventario-extensoes.ps1'
  - 'relatorios\RELATORIO_DECISAO_SCRIPTS_SEM_CONSUMIDOR_2026-09-10.md'
pendencias:
  - id: pend-2026-09-12-prs-upstream
    o_que: Abrir os tres PRs upstream das correcoes de submodulo -- branches ja nos forks, corpos redigidos, bloqueado so por o PAT ser fine-grained
    dono: Tier 0
    prazo: 2026-10-12
  - id: pend-2026-09-12-outlier-7e5ca052
    o_que: Reavaliar o outlier grave apos uma sessao posterior em contexto semelhante -- contramedida escrita nao e contramedida comprovada
    dono: Tier 0
    prazo: 2026-10-12
  - id: pend-2026-09-12-outlier-b39b7431
    o_que: Decidir promocao ou retencao do outlier POSITIVO de 03-09; descartar por ser positivo enviesaria o corpus so para falhas
    dono: Tier 0
    prazo: 2026-10-12
  - id: pend-2026-09-12-da7ef222-segunda-medicao
    o_que: Segunda medicao independente da hipotese de aceleracao sob estresse; a primeira a enfraqueceu, 4.1 para 3.1 por cento
    dono: agente
    prazo: 2026-11-12
  - id: pend-2026-09-12-scope-da-sequencia-11
    o_que: Reconciliar o scope do feedback de sequencia 11, hoje inelegivel por falta de fonte de encerramento
    dono: Tier 0
    prazo: 2026-10-12
  - id: pend-2026-09-12-render-desperdicado
    o_que: Registrar o numero de render desperdicado que a SS10.1 exige para o React.memo de PerspectiveChart
    dono: Tier 0
    prazo: 2026-10-12
verificado:
  - nota 9.8 do handoff do Codex gravada literal na sequencia 58 -- cadeia valida, 59 registros
  - conductor_model medido no rollout da propria sessao Codex -- gpt-5.6-terra em 52 turn_context
  - par de medicao do Codex obtido pelo instrumento canonico -- 109 chamadas, 2 erros, metodo sentinela
  - o CI esta vermelho em nove commits consecutivos, de 2026-09-11 09:56 a 2026-09-12 14:04
  - a causa e um unico teste -- test_o_corpus_prescritivo_nao_tem_referencia_morta
  - os dois caminhos mortos existem na raiz multiprojeto e nao neste repositorio
  - referencias mortas na arvore inteira do recorte prescritivo agora somam zero
  - o pre-commit e o pre-push NAO executam pytest -- lidos linha a linha em .husky/
  - o portao de 5 fases rodou as 09:45:38, antes do commit 180cc7f4 das 09:46:04
  - as duas cadeias validadas em pwsh apos os appends -- feedback 59, outliers 8
  - os 16 modelos canonicos resolvem todos para um veiculo sob o contrato novo -- 0 nao resolvidos
  - gpt-9.9-inexistente recusado pelo contrato novo; era aceito antes
  - campo em branco produz somente motivo missing, sem invalid duplicado
  - MODELOS_RETIRADOS lido da fonte -- claude-fable-5 e claude-fable-5-1, dois
  - ruff format e ruff check aprovados no arquivo de teste alterado
  - suite integral 1124 aprovados 1 pulado exit 0, com basetemp curto
  - o unico warning e pre-existente -- medido por A/B com git stash da alteracao
  - o pre-push novo foi exercido de ponta a ponta e barrou o push -- falha fechada, causa de ambiente
  - pytest-current e symlink morto e nem os.rmdir o remove -- WinError 5, medido
  - basetemp dentro da arvore reprova 3 testes; fora e curto, os tres passam -- medido nas duas formas
  - referencias_mortas resolve contra RAIZ.parent, a raiz multiprojeto -- aprova aqui e reprova no clone
  - este relatorio foi reprovado pelo CI por citar os caminhos que diagnostica; declarado e corrigido
  - varredura EQUIVALENTE A CLONE com RAIZ.parent neutralizado -- 210 prescritivos, zero mortas
  - sota-ci.yml declara paths-ignore para reports e md, e nao tem workflow_dispatch -- lido no arquivo
  - o primeiro commit vermelho 2ce819a7 tocou scripts e herdou divida de um commit so-documentacao
  - guard novo em tests/test_record_index.py -- 33 aprovados no arquivo, incluindo ele
  - paths-ignore agora isenta so 4 arquivos que teste nenhum le; workflow_dispatch acrescentado
  - o autoteste do guard apagava a medicao real -- A/B com e sem a fixture, 0 contra 1 warning
  - warning eliminado na origem por encoding utf-8 explicito -- 44 aprovados, zero warnings reais
  - chartData vem de useMemo em usePerspectiveCalculations -- a prop do React.memo E estavel
  - 812c1c2f saiu assinado Codex GPT-5 numa sessao do Gemini -- identidade residual, terceira vez
  - prompt do heartbeat ACTIVE e sem recorte diario -- lido em automation.toml
  - outlier 512fc3a6 encerrado na sequencia 8; cadeia de outliers valida em 9 registros
  - sete correcoes de supervision_mode aplicadas -- historicos incompletos de 9 para 2, cadeia valida em 66
  - os sete estao entre 01-09 e 03-09, dentro do corte declarado -- conferido antes de aplicar
  - outlier 2d55d92a encerrado na seq 9; da7ef222 com evidencia retida na seq 10; cadeia valida em 11
  - trecho posterior ao gatilho mede 3.1 por cento contra 4.1 antes -- ENFRAQUECE a hipotese do da7ef222
  - b39b7431 lido na integra e NAO descartado -- e outlier positivo com hipotese viva
  - mecanismo de pendencias com 5 guards; 6 pendencias semeadas, zero orfas
  - os oito patch retirados; os 8 submodulos limpos e commitados no fork, 1 a 2 commits alem do upstream
  - guard novo dos submodulos MORDE -- simulacao com um deles no upstream acusa gemini-supermemory
nao_verificado:
  - o numero de render desperdicado que a SS10.1 exige nao consta de relatorio que eu tenha lido
  - a corrida do CI sobre o commit desta ultima correcao ainda nao existia quando isto foi escrito
  - regime de supervisao dos sete registros historicos continua sem fonte especifica
caminhos:
  - reports/agent-calibration/feedback-ledger.jsonl
  - reports/HANDOFF-2026-09-11-o-alvo-declarado-e-o-objeto-que-o-github-ainda-serve.md
  - reports/HANDOFF-2026-09-12-reconciliacao-calibracao-e-proveniencia.md
  - reports/AUDITORIA-2026-09-12-proveniencia-executavel-do-feedback.md
  - scripts/ops/AgentCalibrationProvenance.ps1
  - scripts/ops/record_gate.py
  - tests/test_record_index.py
  - .github/workflows/sota-ci.yml
  - tests/test_agent_calibration_provenance.py
  - .husky/pre-push
  - tests/test_backend_hardening.py
  - reports/agent-calibration/outlier-evidence-ledger.jsonl
  - llm/model_registry.py
  - CLAUDE.md
  - patches/skills/README.md
  - tests/test_patches_skills.py
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  head_na_abertura: 812c1c2f
  sessao: claude-opus5-site-2026-09-12-preludio
  inicio_da_sessao: '2026-09-12T05:56:54-03:00'
  ultimo_ci_verde: ac1332b2
  commits_vermelhos_seguidos: 9
revisoes_de_ancora:
  - registro: taxonomia-canonica-de-documentacao-e-relatorios
    caminhos:
      - 'CLAUDE.md'
      - 'scripts/ops/record_gate.py'
    parecer: >-
      REVISADO E MANTIDO VALIDO, com a taxonomia ESTENDIDA e nada
      reclassificado. Os quatro diretorios canonicos, seus papeis e seus
      padroes de nome seguem identicos; a SS9.2 acrescenta um CAMPO ao
      frontmatter, nao um lugar novo -- exatamente para nao criar um artefato
      paralelo, que e o defeito que os catorze dias expuseram. No portao, a
      checagem de pendencia nasce ao lado das existentes e nenhuma delas mudou
      de criterio.
  - registro: auditoria-2026-09-03-trabalho-do-gemini-3-8-flash
    caminhos:
      - 'CLAUDE.md'
    parecer: >-
      REVISADO E MANTIDO VALIDO. Aquela auditoria cobrou modelo e supervisao
      como dado obrigatorio; a declaracao em bloco de hoje supre
      supervision_mode em sete registros do periodo que ela examinou,
      inclusive o da sessao Gemini de 02-09. Nenhuma nota, modelo ou conector
      foi alterado, e nada foi deduzido: o Tier 0 declarou o que presenciou.
  - registro: auditoria-2026-09-12-a-tarefa-que-ficou-em-aberto-e-a-memoria-de-curto-prazo
    caminhos:
      - 'patches/skills/README.md'
      - 'tests/test_patches_skills.py'
    parecer: >-
      REVISADO E CUMPRIDO. Aquela auditoria mediu os catorze dias, apontou que
      os oito patch haviam mudado de natureza -- de seguro contra perda para
      instantaneo historico -- e registrou que o guard passava vacuamente. As
      duas coisas foram resolvidas aqui: os patch sairam porque nao ha mais
      trabalho nao commitado a segurar, e o guard trocou a pergunta 'existe
      patch' pela pergunta 'o endereco publicado resolve', que e a que teria
      fechado os quinze dias de exposicao. O diagnostico dela permanece
      integro; o que muda e que deixou de ser diagnostico.
  - registro: auditoria-2026-09-12-proveniencia-executavel-do-feedback
    caminhos:
      - 'CLAUDE.md'
    parecer: >-
      REVISADO E MANTIDO VALIDO. A SS9.2 nao toca o contrato de proveniencia:
      nao acrescenta, remove ou reinterpreta campo algum do ledger, e o portao
      de elegibilidade continua exatamente como ele o deixou. Pendencia e
      sobre trabalho a fazer; proveniencia e sobre origem de dado ja
      registrado.
  - registro: checkpoint-2026-06-14-infrastructure-hardening
    caminhos:
      - 'CLAUDE.md'
    parecer: >-
      REVISADO E MANTIDO VALIDO. Nenhum controle de infraestrutura daquele
      checkpoint e alcancado: a adicao e uma clausula de taxonomia documental,
      sem efeito sobre superficie de execucao, permissao ou rede.
  - registro: handoff-2026-08-29-governanca-8tiers-vulnerabilidades-subagents
    caminhos:
      - 'CLAUDE.md'
    parecer: >-
      REVISADO E MANTIDO VALIDO. A hierarquia de oito Tiers e a atribuicao de
      subagentes nao mudam. A SS9.2 acrescenta um campo com DONO declarado, o
      que reforca aquela hierarquia em vez de a diluir: pendencia sem dono e
      observacao, e foi assim que uma recomendacao ficou catorze dias sem que
      ninguem se reconhecesse responsavel por ela.
  - registro: handoff-2026-08-29-quatro-pendencias-e-o-que-elas-eram
    caminhos:
      - 'scripts/ops/record_gate.py'
    parecer: >-
      REVISADO, MANTIDO VALIDO E COM IRONIA UTIL. Aquele handoff rastreou
      quatro pendencias em PROSA, que e precisamente a forma que os catorze
      dias mostraram ser insuficiente. O mecanismo novo lhes daria id, dono e
      prazo, e as exibiria em todo commit. Nenhuma verificacao que ele ancorou
      foi alterada: a coleta de pendencia e adicional e nao bloqueante.
  - registro: handoff-2026-08-30-auditoria-malha-agentica-e-trava-de-lfs
    caminhos:
      - 'CLAUDE.md'
    parecer: >-
      REVISADO E MANTIDO VALIDO. A malha agentica auditada e a trava de LFS
      nao sao tocadas por uma clausula de taxonomia documental.
  - registro: handoff-2026-09-12-reconciliacao-calibracao-e-proveniencia
    caminhos:
      - 'CLAUDE.md'
    parecer: >-
      REVISADO E MANTIDO VALIDO. A SS8.3 que ele reconciliou permanece
      intacta, inclusive o texto do heartbeat. A SS9.2 e vizinha e
      independente: pendencia e trabalho por fazer, calibracao e evidencia ja
      produzida, e nenhuma le o campo da outra.
  - registro: interludio-2026-08-28-concorrencia-e-isolamento
    caminhos:
      - 'scripts/ops/record_gate.py'
    parecer: >-
      REVISADO E MANTIDO VALIDO. A coleta de pendencia e leitura de
      frontmatter de arquivos ja rastreados, sem processo concorrente, sem
      lock e sem escrita -- nao cria superficie de concorrencia nenhuma sobre
      o que aquele interludio isolou.
  - registro: plano-2b-painel-de-estado
    caminhos:
      - 'scripts/ops/record_gate.py'
    parecer: >-
      REVISADO E DIRETAMENTE SERVIDO. O painel de estado quer saber o que a
      malha tem em aberto; ate hoje o portao sabia dizer o que foi verificado
      e nao o que falta fazer. A secao de pendencias e uma fonte estruturada
      para exatamente esse painel, com id, dono, prazo e origem por item.
  - registro: registro-2026-08-29-governanca-piramidal-sota
    caminhos:
      - 'CLAUDE.md'
    parecer: >-
      REVISADO E MANTIDO VALIDO. A governanca piramidal nao muda; a clausula
      nova e promovida por arbitragem aditiva do Tier 0, que e o canal que
      aquele registro estabelece para regra nova.
  - registro: registro-2026-08-29-o-portao-le-o-indice
    caminhos:
      - 'scripts/ops/record_gate.py'
    parecer: >-
      REVISADO E MANTIDO VALIDO. O portao continua lendo o indice canonico
      para raizes de escopo e para tudo o que aquele registro fixou. A coleta
      de pendencia usa `git ls-files` sobre docs e reports, o mesmo alcance
      que o portao ja emprega para ancora, sem introduzir uma segunda nocao de
      corpus.
  - registro: registro-2026-09-01-ancora-de-merge-e-instrucao-indexada
    caminhos:
      - 'CLAUDE.md'
      - 'scripts/ops/record_gate.py'
    parecer: >-
      REVISADO E MANTIDO VALIDO. `caminhos_herdados_de_merge` nao foi tocada e
      a subtracao em merge continua igual. A pendencia nao participa da logica
      de ancora: e uma leitura separada, que nao entra em `tocados` nem em
      `revisoes_aceitas`.
  - registro: registro-2026-09-01-resolucao-de-skill-e-referencia-por-ponto-de-partida
    caminhos:
      - 'scripts/ops/record_gate.py'
    parecer: >-
      REVISADO E MANTIDO VALIDO. A resolucao de referencia por ponto de
      partida declarado nao e alterada; a adicao nao resolve caminho algum --
      le campos declarativos do frontmatter e os exibe.
  - registro: registro-2026-09-02-correcao-de-escala-e-timestamp-no-ledger
    caminhos:
      - 'CLAUDE.md'
    parecer: >-
      REVISADO E APLICADO NO MESMO COMMIT. A regra de ler o relogio em vez de
      digitar a data foi seguida aqui: `atualizado_em` desta auditoria veio
      medido, e os prazos das seis pendencias sao datas ISO validadas pelo
      portao -- prazo malformado bloqueia.
  - registro: registro-2026-09-02-portao-de-calibracao-por-sessao
    caminhos:
      - 'CLAUDE.md'
    parecer: >-
      REVISADO E MANTIDO VALIDO. O minimo de tres sessoes distintas e a
      unidade de contagem nao mudam. As sete correcoes de supervision_mode de
      hoje afetam elegibilidade HISTORICA e nao o limiar: o ciclo corrente
      segue com duas sessoes elegiveis e o portao, corretamente, fechado.
  - registro: registro-2026-09-03-triade-fronteira-chico-e-concorrencia
    caminhos:
      - 'CLAUDE.md'
    parecer: >-
      REVISADO E MANTIDO VALIDO. A triade e a lei de concorrencia nao sao
      alcancadas. Vale notar que o campo `dono` da pendencia aceita agente,
      veiculo ou Tier 0, o que preserva a distincao entre grupo e individuo
      que aquele registro fixou.
  - registro: registro-2026-09-05-regua-para-agente-autonomo-de-nuvem
    caminhos:
      - 'CLAUDE.md'
    parecer: >-
      REVISADO E MANTIDO VALIDO. A regua do Jules continua exigindo medicao
      antes de otimizar e ordenacao em vez de pergunta. A SS9.2 e
      complementar: ela da endereco durave a uma tarefa que atravessa sessoes,
      que e justamente o que uma sessao de nuvem nao consegue carregar
      consigo.
  - registro: registro-2026-09-07-integracao-gpt6-astra-e-retirada-do-fable
    caminhos:
      - 'CLAUDE.md'
    parecer: >-
      REVISADO E MANTIDO VALIDO. Nem o registro de modelos nem os tetos de
      esforco sao tocados pela clausula de pendencia.
  - registro: registro-2026-09-08-alternancia-de-extensoes-no-portao-de-registro
    caminhos:
      - 'scripts/ops/record_gate.py'
    parecer: >-
      REVISADO E MANTIDO VALIDO. A alternancia .ts/.tsx e .js/.jsx vive em
      `referencias_mortas`, que nao foi tocada. A adicao e um bloco proprio,
      posterior a todas as verificacoes existentes.
  - registro: registro-2026-09-08-arbitragem-soberana-sobre-a-lei-de-concorrencia
    caminhos:
      - 'CLAUDE.md'
    parecer: >-
      REVISADO E EXERCIDO. A clausula da SS9.2 entra por arbitragem aditiva,
      que e o mecanismo que aquele registro descreve. E o limite dele foi
      respeitado hoje num caso concreto: a aprovacao em bloco cobria descartar
      o outlier b39b7431, e a leitura integral mostrou que ele e um outlier
      POSITIVO. Arbitragem governa permissao, nao fato -- a recomendacao
      aprovada nao foi executada, e a razao esta registrada.
  - registro: registro-2026-09-09-saneamento-medicao-datada-identificacao-agentes
    caminhos:
      - 'CLAUDE.md'
    parecer: >-
      REVISADO E MANTIDO VALIDO. A identificacao medida de agentes segue; o
      campo `dono` da pendencia nomeia responsavel por tarefa e nao substitui
      a identificacao de autoria, que continua vindo do commit e do registro.
  - registro: registro-2026-09-12-preludio-o-instrumento-que-sabia-abrir-e-nao-fechar
    caminhos:
      - 'CLAUDE.md'
      - 'patches/skills/README.md'
    parecer: >-
      REVISADO E CONCLUIDO NO QUE ELE DEIXOU ABERTO. O preludio reclassificou
      o patch do supermemory de 'ajustes' para 'seguranca' e registrou que a
      saida 1 -- os PRs upstream -- seguia aberta. Ela continua aberta e agora
      tem id, dono e prazo, em vez de viver em prosa. O README daquela
      reclassificacao e reescrito para registrar fork, gitlink e branch por
      skill; a narrativa do preludio nao e alterada.
  - registro: relatorio-2026-06-16-auditoria-e-harmonizacao-v8-gold
    caminhos:
      - 'CLAUDE.md'
    parecer: >-
      REVISADO E MANTIDO VALIDO. A harmonizacao v8 GOLD nao e reaberta por uma
      clausula de taxonomia documental.
  - registro: relatorio-2026-08-29-analise-integral-ecossistema-sota-v8-gold
    caminhos:
      - 'CLAUDE.md'
    parecer: >-
      REVISADO E MANTIDO VALIDO. O escopo do ecossistema analisado nao muda; a
      adicao e local a SS9 e nao altera nenhuma das camadas que ele descreve.
  - registro: relatorio-2026-08-29-impacto-quantitativo-qualitativo-sota-v8-gold
    caminhos:
      - 'CLAUDE.md'
    parecer: >-
      REVISADO E MANTIDO VALIDO. As metricas de impacto daquele corte
      permanecem descritivas do momento em que foram tomadas; nada aqui as
      recalcula.
  - registro: auditoria-2026-09-12-proveniencia-executavel-do-feedback
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
      - scripts/ops/AgentCalibrationProvenance.ps1
      - tests/test_agent_calibration_provenance.py
    parecer: >-
      REVISADO E MANTIDO VALIDO, com o contrato ESTREITADO e nunca afrouxado.
      Esta auditoria confere as contagens dele por medicao propria -- 22
      auditados, 9 historicos incompletos, 1 elegivel no ciclo, 0 excluidos -- e
      as tres batem. O append 58 acrescenta a segunda sessao elegivel e nao
      altera conclusao alguma daquele documento; corrige a pendencia que ele
      proprio declarou. No script, a checagem de sintaxe que ele documenta
      permanece intacta e ganha uma segunda camada de existencia lida da fonte
      canonica, alem de deixar de emitir motivo duplicado para campo em branco;
      nenhum registro antes elegivel deixou de ser, e a invariante dos 16
      modelos canonicos e agora guardada por teste no arquivo que ele criou.
  - registro: auditoria-2026-09-01-formatacao-ruff-e-ancoras
    caminhos: ['.github/workflows/sota-ci.yml']
    parecer: >-
      REVISADO E MANTIDO VALIDO. A checagem de formatacao do ruff que aquela
      auditoria ancorou continua no mesmo job, com o mesmo comando. So o gatilho
      mudou -- ela passa a rodar tambem nos commits que antes eram isentados.
  - registro: handoff-2026-09-09-ci-verde-e-as-seis-causas
    caminhos: ['.github/workflows/sota-ci.yml']
    parecer: >-
      REVISADO, MANTIDO VALIDO E ESTENDIDO. Aquele handoff nomeou seis causas de
      CI vermelho e as fechou. Nenhuma delas e reaberta aqui: os jobs sao os
      mesmos. O que se acrescenta e uma SETIMA causa, de outra natureza -- nao
      um passo que falha, e sim um gatilho que nao dispara. O paths-ignore
      isentava justamente os arquivos que a suite verifica, entao a quebra
      entrava sem corrida e o vermelho aparecia no commit seguinte de codigo.
      Uma causa que aquele handoff nao tinha como ver, porque ela nao aparece
      em job nenhum.
  - registro: plano-frentes-abertas-2026-09-08
    caminhos: ['.github/workflows/sota-ci.yml']
    parecer: >-
      REVISADO E MANTIDO VALIDO. As frentes que o plano acompanha nao mudam de
      estado por esta alteracao de gatilho; o workflow continua com os mesmos
      tres jobs e as mesmas condicoes de aprovacao.
  - registro: registro-2026-09-01-fronteira-http-e-portao-independente-de-perfil
    caminhos: [tests/test_backend_hardening.py]
    parecer: >-
      REVISADO E MANTIDO VALIDO. Os testes de fronteira HTTP e de portao
      independente de perfil nao sao tocados: a alteracao adiciona uma fixture
      de isolamento ao autoteste do SotaGuardState e um guard contra a remocao
      dela. Nenhuma assercao existente muda -- o que muda e que o estado real do
      guard deixa de ser apagado no meio da suite.
  - registro: handoff-2026-09-03-sessao-outlier-infraestrutura
    caminhos: [reports/agent-calibration/outlier-evidence-ledger.jsonl]
    parecer: >-
      REVISADO E MANTIDO VALIDO. Os outliers de infraestrutura daquela sessao
      permanecem abertos e intactos; o append e um encerramento dirigido ao
      512fc3a6 por -Resolves, e nao alcanca nenhum outro registro.
  - registro: handoff-2026-09-12-reconciliacao-calibracao-e-proveniencia
    caminhos: [reports/agent-calibration/outlier-evidence-ledger.jsonl]
    parecer: >-
      REVISADO E COMPLETADO. Aquele handoff validou a cadeia de outliers em 8
      registros e deixou o 512fc3a6 em aberto; ele fechou o primeiro componente
      -- o prompt do heartbeat -- e o segundo sem nomea-lo, ao excluir o
      feedback de scope intrasessao-outlier do universo elegivel. O encerramento
      registrado aqui apenas reconhece o que o trabalho dele produziu.
  - registro: registro-2026-09-03-nota-10-e-outlier-de-aceleracao
    caminhos: [reports/agent-calibration/outlier-evidence-ledger.jsonl]
    parecer: >-
      REVISADO E MANTIDO VALIDO. O outlier de aceleracao continua aberto e sua
      evidencia intacta. O feedback de scope intrasessao-outlier que ele
      originou permanece no ledger de feedback, agora explicitamente inelegivel
      -- preservado como evidencia, nunca promovido a handoff.
  - registro: registro-2026-09-08-bindings-wasm-defasados
    caminhos: ['.github/workflows/sota-ci.yml']
    parecer: >-
      REVISADO E MANTIDO VALIDO. O achado dos bindings WASM defasados depende do
      que o workflow EXECUTA, e nenhum passo, versao de toolchain ou etapa de
      build foi alterado. So o gatilho mudou: o CI deixa de ignorar os arquivos
      que a suite verifica, e ganha disparo manual. A cobertura que aquele
      registro ancorou passa a rodar em MAIS commits, nunca em menos.
  - registro: registro-2026-09-09-actionlint-e-a-fronteira-do-submodulo
    caminhos: ['.github/workflows/sota-ci.yml']
    parecer: >-
      REVISADO E MANTIDO VALIDO. A fronteira do submodulo que aquele registro
      fixou -- actionlint enumera por git ls-files e nao valida workflow de
      submodulo -- nao e tocada: os jobs, seus passos e o escopo de enumeracao
      permanecem identicos. A mudanca e so de GATILHO: paths-ignore deixa de
      isentar os arquivos que a propria suite verifica, e workflow_dispatch
      passa a existir. Um workflow que roda mais vezes nao afrouxa nada.
  - registro: registro-2026-09-11-fechamento-automatico-do-dia-10-e-o-outlier-sem-sessao
    caminhos: [reports/agent-calibration/outlier-evidence-ledger.jsonl]
    parecer: >-
      REVISADO E MANTIDO VALIDO. O outlier sem sessao daquele registro continua
      separado e intacto; o append de hoje e um registro de ENCERRAMENTO do
      512fc3a6, com -Resolves e disposition resolved, e nao reescreve nem
      reclassifica nenhum outlier anterior. A cadeia segue valida, agora em 9.
  - registro: registro-2026-09-12-preludio-o-instrumento-que-sabia-abrir-e-nao-fechar
    caminhos: [reports/agent-calibration/outlier-evidence-ledger.jsonl]
    parecer: >-
      REVISADO E MANTIDO VALIDO. O outlier grave 7e5ca052, registrado naquele
      preludio, permanece ABERTO e nao foi tocado -- encerrar um outlier nao
      encerra os demais. O que fecha aqui e o 512fc3a6, cujos dois componentes
      foram verificados na fonte.
  - registro: registro-2026-09-01-resolucao-de-skill-e-referencia-por-ponto-de-partida
    caminhos: [tests/test_record_index.py]
    parecer: >-
      REVISADO E MANTIDO VALIDO. Aquele registro fixou que referencia se resolve
      a partir de um PONTO DE PARTIDA declarado, e o teste novo e a aplicacao
      literal disso: mede o que resolve tomando o repositorio como ponto de
      partida, em vez de aceitar o que resolve porque a raiz irma esta ao lado.
      Nenhuma regra de resolucao existente foi alterada.
  - registro: registro-2026-09-05-fechamento-do-ciclo-de-calibracao
    caminhos: [tests/test_record_index.py]
    parecer: >-
      REVISADO E MANTIDO VALIDO. O fechamento de ciclo nao depende de nada que
      este teste toque; a adicao e um caso novo no mesmo arquivo, sem alterar os
      guards de indice ou de portao que aquele registro ancorou.
  - registro: registro-2026-09-08-alternancia-de-extensoes-no-portao-de-registro
    caminhos: [tests/test_record_index.py]
    parecer: >-
      REVISADO E MANTIDO VALIDO. A alternancia de extensoes -- .ts que tambem
      aceita .tsx, .js que aceita .jsx -- continua sendo exercida pelos testes
      que ele ancorou, e o caso novo a percorre igual: ele reusa
      `referencias_mortas` inteira, mudando apenas UMA das tres raizes de busca.
      A cobertura daquela regra nao encolheu.
  - registro: registro-2026-09-08-ruff-format-e-o-ci-vermelho
    caminhos: [tests/test_record_index.py]
    parecer: >-
      REVISADO, MANTIDO VALIDO E DIRETAMENTE CONFIRMADO. Aquele registro tratou
      de um CI vermelho por seis dias porque o portao local e o CI checavam
      COISAS DIFERENTES -- o formato do ruff so era cobrado la. O achado de hoje
      e a mesma forma noutra verificacao: o detector de referencia morta resolve
      contra a raiz multiprojeto e aprova aqui o que reprova no clone. A adicao
      e um teste novo, sem tocar nos que ele ancorou: refaz a varredura com a
      raiz irma neutralizada, para que local e CI passem a medir a mesma coisa.
      Nenhuma assercao existente foi alterada; os 33 testes do arquivo passam.
  - registro: handoff-2026-08-30-auditoria-malha-agentica-e-trava-de-lfs
    caminhos: ['.husky/pre-push']
    parecer: >-
      REVISADO E MANTIDO VALIDO. Aquele handoff ancorou os tres hooks ao auditar
      a malha agentica, e a trava de LFS que ele instalou continua sendo a
      primeira etapa do pre-push, intacta. A alteracao e ADITIVA em duas frentes
      e nao remove verificacao nenhuma: declara o set -e que faltava -- sem ele
      o codigo de saida do hook era o do ultimo comando, defeito latente porque
      so havia uma verificacao bloqueante -- e acrescenta a suite Python depois
      do portao de qualidade. A ordem preserva LFS primeiro, como ele definiu.
  - registro: handoff-2026-09-12-reconciliacao-calibracao-e-proveniencia
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
      - scripts/ops/AgentCalibrationProvenance.ps1
      - tests/test_agent_calibration_provenance.py
    parecer: >-
      REVISADO COM RESSALVA DE DEFASAGEM, conteudo tecnico mantido. Ele declara
      em nao_verificado que o feedback 9.8 nao foi anexado ao ledger; isso deixa
      de valer aqui, com a sequencia 58. Declara tambem que nao houve commit,
      push nem pre-commit -- os tres ocorreram depois de ele ser escrito, e a
      secao 3 desta auditoria mede os horarios. Nada e reescrito: a defasagem e
      registrada onde ela pode ser lida. No script e no teste que ele entregou,
      a mudanca estreita o contrato -- existencia do modelo alem da sintaxe,
      falha fechada quando a fonte canonica nao responde -- e mantem cada
      recusa que ele ja fazia.
  - registro: registro-2026-09-12-preludio-o-instrumento-que-sabia-abrir-e-nao-fechar
    caminhos: [reports/agent-calibration/feedback-ledger.jsonl]
    parecer: >-
      REVISADO E MANTIDO VALIDO. O preludio ja se fechou pelo handoff de nota
      9.0, sequencia 55, e nada aqui reabre a sessao. O append 58 pertence a
      OUTRA sessao, a do Codex, e por isso soma uma sessao distinta ao ciclo em
      vez de adensar a minha.
  - registro: auditoria-2026-09-12-a-tarefa-que-ficou-em-aberto-e-a-memoria-de-curto-prazo
    caminhos: [reports/agent-calibration/feedback-ledger.jsonl]
    parecer: >-
      REVISADO E CONFIRMADO PELO PROPRIO ACHADO DE HOJE. Aquela auditoria disse
      que nao existe registro de tarefa aberta que atravesse sessoes; o CI
      vermelho por nove commits e a mesma lacuna noutra superficie -- uma
      pendencia que nenhum mecanismo cobrava, visivel so para quem fosse olhar.
  - registro: registro-2026-09-02-correcao-de-escala-e-timestamp-no-ledger
    caminhos: [reports/agent-calibration/feedback-ledger.jsonl]
    parecer: >-
      REVISADO E APLICADO. A regra que aquele registro fixou -- nota literal,
      sem conversao de escala -- foi verificada campo a campo apos a gravacao:
      score saiu 9.8, nao 0.98 nem 10. O timestamp da sessao veio do rollout
      medido, nao digitado.
  - registro: registro-2026-09-08-o-padrao-de-desvio-de-foco
    caminhos: [reports/agent-calibration/feedback-ledger.jsonl]
    parecer: >-
      REVISADO E MANTIDO VALIDO. O padrao segue apoiado nas seis corroboracoes
      qualitativas ja registradas; o feedback 58 e evidencia nova e ainda nao
      corroborada, e nao foi contado como confirmacao de padrao nenhum.
  - registro: auditoria-2026-09-08-massa-de-fichas-fonte-nao-unica-e-desvio-de-foco
    caminhos: [reports/agent-calibration/feedback-ledger.jsonl]
    parecer: >-
      REVISADO E MANTIDO VALIDO. A licao sobre fonte nao unica reaparece na
      secao 5 desta auditoria: a validacao de modelo por regex e uma segunda
      fonte para um fato que ja tem fonte canonica em llm/model_registry.py.
  - registro: auditoria-2026-09-01-retrospectiva-prioridade-sessao
    caminhos: [reports/agent-calibration/feedback-ledger.jsonl]
    parecer: >-
      REVISADO E MANTIDO VALIDO. A nota 7.5 e sua critica seguem literais na
      cadeia; aquele evento continua entre os nove historicos sem
      supervision_mode, preservado e inelegivel, sem que nada tenha sido
      deduzido para completa-lo.
  - registro: auditoria-2026-09-02-curadoria-mcp-e-processos-residuais
    caminhos: [reports/agent-calibration/feedback-ledger.jsonl]
    parecer: >-
      REVISADO E MANTIDO VALIDO. A curadoria e sua nota permanecem intactas; a
      unica mudanca que as alcancou foi a correcao 57 de scope, feita pelo Codex
      com fonte primaria nomeada, e esta auditoria a conferiu no registro.
  - registro: auditoria-2026-09-02-retrospectiva-e-observacao-de-calibracao
    caminhos: [reports/agent-calibration/feedback-ledger.jsonl]
    parecer: >-
      REVISADO E MANTIDO VALIDO. A serie historica que a retrospectiva observou
      continua completa no ledger; elegibilidade restringe uso futuro e nao
      apaga observacao passada.
  - registro: handoff-2026-09-01-prioridade-pmev-continuacao
    caminhos: [reports/agent-calibration/feedback-ledger.jsonl]
    parecer: >-
      REVISADO E MANTIDO VALIDO. Prioridade PMev e a nota daquele handoff nao
      sao tocadas; o append de hoje e de outra sessao e de outro veiculo.
  - registro: handoff-2026-09-02-curadoria-mcp-quarentena-e-roteamento-lazy
    caminhos: [reports/agent-calibration/feedback-ledger.jsonl]
    parecer: >-
      REVISADO E MANTIDO VALIDO. Foi a fonte primaria da correcao 57; conferi
      que a correcao cita esse documento pelo nome e nao altera nota, modelo nem
      conector do evento alvo.
  - registro: handoff-2026-09-03-guarda-de-governanca-camada-anthropic-e-cobertura-cve
    caminhos: [reports/agent-calibration/feedback-ledger.jsonl]
    parecer: >-
      REVISADO E MANTIDO VALIDO. Serviu de confirmacao secundaria a mesma
      correcao 57. A cobertura de CVE que ele registra continua sendo a fase 3
      do portao, que aprovou na corrida das 09:45:38 medida aqui.
  - registro: handoff-2026-09-03-procedencia-de-solve-e-portao-de-reprodutibilidade
    caminhos: [reports/agent-calibration/feedback-ledger.jsonl]
    parecer: >-
      REVISADO E MANTIDO VALIDO. Procedencia de solve e reprodutibilidade seguem
      valendo; esta auditoria acrescenta um caso em que a reprodutibilidade
      falhou por ambiente -- o mesmo detector reprova no clone e aprova aqui.
  - registro: handoff-2026-09-04-pmev-credenciais-e-submodulos
    caminhos: [reports/agent-calibration/feedback-ledger.jsonl]
    parecer: >-
      REVISADO E MANTIDO VALIDO. Nada em credenciais ou submodulos e reavaliado;
      o ledger recebeu somente um feedback de handoff novo.
  - registro: handoff-2026-09-04-refinamento-sota-radar-telemetria-e-mcps-google
    caminhos: [reports/agent-calibration/feedback-ledger.jsonl]
    parecer: >-
      REVISADO E MANTIDO VALIDO. A nota daquele refinamento continua imutavel na
      cadeia, que segue valida em 59 registros apos o append.
  - registro: handoff-2026-09-05-fechamento-do-ciclo-e-regua-do-jules
    caminhos: [reports/agent-calibration/feedback-ledger.jsonl]
    parecer: >-
      REVISADO, E A REGUA DO JULES VOLTA A SER PERTINENTE. O ciclo fechado na
      sequencia 27 continua sendo o marco de reinicio, e o ciclo atual passa de
      uma para duas sessoes elegiveis. A secao 7 registra, sem auditar, um
      commit da malha que cai na classe que a secao 10.3 nomeia.
  - registro: handoff-2026-09-07-integracao-astra-e-calibracao-de-procedimento
    caminhos: [reports/agent-calibration/feedback-ledger.jsonl]
    parecer: >-
      REVISADO E MANTIDO VALIDO. As correcoes sucessivas de modelo daquele
      periodo continuam aplicadas na ordem certa; o modelo do registro 58 nao
      veio de inferencia sobre nome de sessao, veio do rollout.
  - registro: handoff-2026-09-07-orquestrador-free-tier-e-calibracao-9-0
    caminhos: [reports/agent-calibration/feedback-ledger.jsonl]
    parecer: >-
      REVISADO E MANTIDO VALIDO. A nota 9.0 daquele handoff nao se confunde com
      a 9.0 da sequencia 55 nem com a 9.8 da 58; as tres tem event_id, sessao e
      veiculo distintos, verificados aqui.
  - registro: handoff-2026-09-10-raiz-versionada-e-o-portao-que-media-outra-pagina
    caminhos: [reports/agent-calibration/feedback-ledger.jsonl]
    parecer: >-
      REVISADO, E O TITULO DELE DESCREVE O ACHADO DE HOJE. Um portao que media
      outra pagina e exatamente o que a secao 4 encontra: o detector de
      referencia morta media o disco desta maquina, onde a raiz existe, e nao o
      clone, onde ela nao existe.
  - registro: registro-2026-09-02-adapters-ligado-ao-caminho-real-anthropic
    caminhos: [reports/agent-calibration/feedback-ledger.jsonl]
    parecer: >-
      REVISADO E MANTIDO VALIDO. O diagnostico de import daquele registro nao e
      alcancado por appends de calibracao.
  - registro: registro-2026-09-03-nota-10-e-outlier-de-aceleracao
    caminhos: [reports/agent-calibration/feedback-ledger.jsonl]
    parecer: >-
      REVISADO E MANTIDO VALIDO. O feedback de scope intrasessao-outlier daquele
      episodio continua no ledger e agora aparece explicitamente inelegivel, com
      motivo completed_handoff_not_declared -- preservado, nao promovido.
  - registro: registro-2026-09-04-nota-9-5-e-analise-paralela-de-nos
    caminhos: [reports/agent-calibration/feedback-ledger.jsonl]
    parecer: >-
      REVISADO E MANTIDO VALIDO. Nenhum evento historico foi reescrito; a cadeia
      so cresceu.
  - registro: registro-2026-09-05-saneamento-nexus-ollama-e-auto-diagnostico
    caminhos: [reports/agent-calibration/feedback-ledger.jsonl]
    parecer: >-
      REVISADO E MANTIDO VALIDO. O saneamento e seu auto-diagnostico continuam
      historicos e separados da amostra elegivel.
  - registro: registro-2026-09-10-feedback-9-5-multimodal-sota
    caminhos: [reports/agent-calibration/feedback-ledger.jsonl]
    parecer: >-
      REVISADO E MANTIDO VALIDO. A identidade de sessao daquele feedback ja
      havia sido reconciliada por correcao; o estado efetivo continua sendo lido
      antes de qualquer contagem.
  - registro: registro-2026-09-11-fechamento-automatico-do-dia-10-e-o-outlier-sem-sessao
    caminhos: [reports/agent-calibration/feedback-ledger.jsonl]
    parecer: >-
      REVISADO E MANTIDO VALIDO. O outlier sem sessao segue separado da serie de
      feedback, e o fechamento automatico do dia 10 nao e reaberto por este
      append.
  - registro: registro-2026-09-11-teoria-sota-e-saneamento-multimodal
    caminhos: [reports/agent-calibration/feedback-ledger.jsonl]
    parecer: >-
      REVISADO E MANTIDO VALIDO. Nada da teoria nem do saneamento multimodal
      depende da elegibilidade de calibracao alterada aqui.
  - registro: agent-calibration-daily-2026-09-02
    caminhos: [reports/agent-calibration/feedback-ledger.jsonl]
    parecer: >-
      REVISADO E MANTIDO VALIDO. O snapshot diario e fotografia daquele dia; o
      gerador atual produz um retrato novo, com elegiveis e excluidos, sem
      reescrever o antigo.
supersede: null
---

# Auditoria — o CI vermelho que nenhum portão local media

Esta auditoria nasceu de uma instrução do Tier 0: *"a nota foi feita baseado no
relato de resolução. Se na sua auditoria vê-se que houveram erros, precisa
registrar que depois averiguo."* Ela registra, portanto, o que a conferência do
trabalho do Codex encontrou — o que confere, o que diverge, e um achado maior
que ninguém procurava e que também é meu.

---

## 1. A nota 9.8, agora com proveniência medida

O handoff do Codex declarava a nota em prosa e reconhecia, no próprio
`nao_verificado`, que não a havia anexado ao ledger. Pela §8.3 a nota mora no
handoff **e entra pelo escritor**; em prosa ela não conta para portão nenhum.

O Tier 0 confirmou a autoria da nota. Gravada na **sequência 58**, cadeia válida
em **59** registros, cauda `bacfb9c3`. Cada campo, e como foi obtido:

| Campo | Valor | Origem da medição |
| :--- | :--- | :--- |
| `score` | `9.8` | conferido literal após a gravação — não `0.98`, não `10` |
| `feedback` | fala do Tier 0 | transcrição de voz, segmento `01a09577-ed5e-7972-82ba-99fb78e49d7f`, literal |
| `session_id` | `01a09547-c8df-7641-87b5-83723b4b645d` | `session_meta` do rollout — é o mesmo id que os relatórios citam como "tarefa coordenadora" |
| `session_started_at` | `2026-09-12T08:01:44-03:00` | `timestamp` do `session_meta` |
| `conductor_model` | `gpt-5.6-terra` | 52 ocorrências em `turn_context` do rollout |
| `conductor_vehicle` | `codex` | topologia da §8.3, coerente com `model_provider: openai` |
| `supervision_mode` | `assistida` | arbitragem do Tier 0 por voz ao longo da sessão, presente na transcrição |
| par de medição | 109 / 2 / `sentinela` | `scripts/ops/agent_tool_error_index.py`, o instrumento canônico |

**O modelo não foi deduzido do nome do veículo.** O prompt-base da sessão diz
*"an agent based on GPT-5"*, e `GPT-5` não existe no `MODEL_REGISTRY`: é texto de
system prompt, não identificador. O valor real estava no rollout.

Duas medições independentes convergiram no par: minha contagem bruta de saídas de
ferramenta deu 109, e o instrumento canônico deu 109 chamadas com 2 erros por
sentinela do harness. O portão passou de **uma** para **duas** sessões elegíveis
no ciclo — mínimo continua três, portanto segue fechado, corretamente.

---

## 2. O que confere no trabalho do Codex

Verificado por medição própria, e bate: cadeia de feedback válida antes do meu
append (58 registros, cauda `11824d7d`) e a de outliers (8, `b69d6ec1`); BOM
único nos quatro `.ps1`; **22** feedbacks auditados, **9** históricos
incompletos, **1** elegível no ciclo, **0** excluídos no ciclo. As duas correções
56 e 57 são `correction` sobre `scope`, com fonte primária nomeada, e não tocam
nota, modelo nem conector.

**Um achado que o próprio Codex não percebeu ter produzido.** O outlier
`512fc3a6` tem *dois* componentes, e o relatório dele só nomeia um. O segundo é
literal no registro original: *"o universo gerado inclui feedback
`48443d06-…` de scope `intrasessao-outlier`"*. Esse registro é a sequência 10, e
o novo portão o exclui com motivo `completed_handoff_not_declared`. **Os dois
componentes estão fechados** — é o único dos cinco outliers em condição de
arbitragem de encerramento.

---

## 3. Os relatórios envelheceram antes de serem publicados

Ambos declaram em `nao_verificado`: *"suite integral e pre-commit nao
executados"* e *"sem commit ou push"*. Medido:

| Evento | Horário |
| :--- | :--- |
| auditoria e handoff escritos | 08:52:59 e 08:56:08 |
| portão de 5 fases executado | **09:45:38** — `FRAGILE`, 0 falhas, 1 warning, teto 2 |
| commit `180cc7f4` | **09:46:04** |
| publicado em `origin/master` | confirmado por `git ls-remote` |

O `commit:` do frontmatter aponta `65e0863b`, o HEAD anterior. **O documento
descreve um estado que deixou de existir antes de ele ser publicado, e foi
publicado no mesmo commit que o invalidou.** É a §2.4 em escala de minutos: data
escrita num documento descreve o documento, não o fato que ele narra.

O portão daquela corrida rodou com frontend no ar — LCP 1237 ms, CLS 0, TTFB
667 ms, axe com 0 violações. Não foi aprovação por ausência de medição.

As duas alterações de teste que o commit trouxe fora do assunto declarado são
benignas e comentadas: `timeout=45→90` sem enfraquecer asserção alguma, e
`setattr(m, "RAIZ", r)` → `m.RAIZ = r`, correção de Ruff B010.

**Levantei aqui um terceiro achado e ele não existia** — está retratado na
seção 6, item 4.

---

## 4. O achado maior — nove commits com o CI vermelho

Ninguém procurava por isto. Ao conferir a suíte, ela saiu com `exit=1`.

```
2026-09-12 14:04  812c1c2f  failure   ← Gemini, React.memo
2026-09-12 13:32  dc67058d  failure   ← Jules, PR #44
2026-09-12 12:49  180cc7f4  failure   ← Codex, proveniência
2026-09-12 11:08  5fbf50c7  failure   ← meu
2026-09-12 10:50  19e29634  failure   ← meu
2026-09-12 10:18  1d699f5e  failure   ← meu
2026-09-11 14:43  2a23d45d  failure
2026-09-11 12:30  24cb4532  failure
2026-09-11 09:56  2ce819a7  failure
2026-09-11 04:10  ac1332b2  success   ← último verde
```

**Nove commits, três condutores, dois dias.** Uma única causa, e um único teste:
`tests/test_record_index.py::test_o_corpus_prescritivo_nao_tem_referencia_morta`,
com `1 failed, 1086 passed, 18 skipped`.

A referência morta está em
`reports/HANDOFF-2026-09-11-o-alvo-declarado-e-o-objeto-que-o-github-ainda-serve.md`,
que é **meu**, e cita dois caminhos:

- `scripts\ops\inventario-extensoes.ps1`
- `relatorios\RELATORIO_DECISAO_SCRIPTS_SEM_CONSUMIDOR_2026-09-10.md`

**Os dois existem — na raiz multiprojeto, que é outro repositório.** A própria
prosa da seção 3 diz *"na raiz"*. O detector não lê prosa.

### O mecanismo exato, medido depois que o CI reprovou este próprio relatório

A primeira redação desta auditoria dizia que o portão local "só varre o stage".
É verdade e é insuficiente: **mesmo varrendo a árvore inteira, aqui dá zero.**
Medido — `referencias_mortas` sobre todo o corpus prescritivo devolve `{}` nesta
máquina e acusa dois caminhos no CI, no mesmo commit.

A causa está numa linha de `record_gate.py`:

```python
achou = any((raiz / var).exists() for var in variantes
            for raiz in (RAIZ, caminho.parent, RAIZ.parent))
```

**`RAIZ.parent` é `~\.gemini`, a raiz multiprojeto.** Nesta máquina o `Site` mora
dentro dela, então o relatório de decisão dos scripts sem consumidor resolve —
não porque este repositório o tenha, mas porque o repositório *irmão* está no
disco ao lado. Num clone de CI não há irmão, e o mesmo endereço morre.

Não é bug de implementação: a busca no pai existe de propósito, para registros
multiprojeto que endereçam a partir de cima. O efeito colateral é que **o
veredito depende da topologia do disco de quem roda.** Verificação que aprova por
acidente de vizinhança é a §4 da raiz outra vez — *ferramenta que mede o escopo
que enxerga, não o escopo real* —, e aqui ela aprova o que o clone reprova, que é
a direção pior das duas: o local diz verde e a publicação diz vermelho.

O corolário prático já estava escrito no próprio detector, e é a saída correta:
onde a forma não separa citar-para-apontar de citar-para-dizer-que-sumiu, quem
separa é a **declaração do autor**. `referencias_nao_resolviveis` é
independente de máquina, e é por isso que o conserto funciona nos dois lados.

**O método que fecha o ciclo, e ele é reutilizável.** Verificar aqui não prova
nada, porque aqui passa por vizinhança. Antes de publicar, rodei a varredura
com `RAIZ.parent` apontado para um diretório inexistente — o que reproduz o
clone exatamente: **210 documentos prescritivos, zero referências mortas.** É a
diferença entre medir o próprio disco e medir o que o repositório entrega.

**Esta auditoria caiu na própria armadilha que descreve.** Ao narrar os dois
caminhos mortos, ela os citou — e o CI a reprovou por isso, enquanto aqui ela
passava. Corrigido pela mesma declaração.

### A causa-raiz: o CI ignora exatamente os arquivos que o teste valida

`sota-ci.yml` declara `paths-ignore` para `**/*.md`, `docs/**` e **`reports/**`**.
E o teste que reprovou é `test_o_corpus_prescritivo_nao_tem_referencia_morta`,
cujo objeto de verificação é justamente `reports/*.md`.

**Um commit que só mexe em relatório introduz a quebra e não dispara corrida
alguma.** O vermelho aparece no commit *seguinte* que toca código — atribuído a
quem não o causou. Foi exatamente a sequência: o relatório de 09-11 nasceu num
commit de documentação, o CI o ignorou, e o primeiro vermelho, `2ce819a7`, é um
commit de calibração que mexeu em `scripts/ops/*.ps1` e herdou a dívida alheia.

Não há `workflow_dispatch` no workflow, logo a corrida também não pode ser
pedida à mão. Um commit somente-documentação **não tem como ser verificado pelo
CI**, nem quando conserta o que o CI acusa.

**E isto revela um limite do portão que instalei nesta mesma sessão.** O
`pre-push` roda a suíte inteira, mas a suíte inteira contém o teste que aprova
por vizinhança — logo ele daria verde para a classe de defeito que motivou o
portão. Portão que não pega o defeito que o originou é falsa garantia.

Fechado por guard, e o guard é aditivo: `test_o_corpus_resolve_tambem_sem_o_
repositorio_irmao` refaz a varredura com `RAIZ.parent` apontado para caminho
inexistente. Agora a suíte local reprova o que o clone reprovaria, e o
`pre-push` passa a valer para esta classe. Nada foi alterado no detector — a
busca no pai continua onde estava, porque ela existe por um motivo legítimo; o
que mudou é que passou a existir uma medição que não depende dela.

### Por que nenhum portão local acusou, e essa é a parte que importa

Três mecanismos falharam juntos, cada um por um motivo diferente, e nenhum deles
é um defeito de implementação:

1. **O portão de registro só varre o stage.** É desenho declarado, para não
   reprovar dívida preexistente. Aquele arquivo nunca mais entrou em stage, logo
   nunca mais foi olhado.
2. **O teste que varre a árvore inteira só roda no CI.** Li `.husky/pre-commit`
   e `.husky/pre-push` linha a linha: eles executam `npm run sota:audit`, o
   portão de âncora e o `record_gate.py`. **Nenhum dos dois executa `pytest`.**
   A §6.1 exige suíte inteiramente verde e a §6.2 fala em "o pre-commit e o CI
   rejeitam", mas o hook, como está escrito, não roda a suíte Python.
3. **O relatório do Gemini disse "381 testes passando", e isso é verdade sobre
   outra suíte.** `npm test` roda o workspace de frontend; a suíte Python tem
   1086. Duas suítes, dois números, e o menor foi reportado como se cobrisse o
   todo.

`★` A forma é a mesma do §2.4 e do registro de 09-09: **um verificador que mede
uma coisa e é lido como se medisse outra.** Aqui em duas camadas — o portão local
mede o stage e foi lido como se medisse o repositório; o `npm test` mede o
frontend e foi lido como se medisse a suíte.

### O que fiz

Apliquei o mecanismo que o próprio detector prevê para exatamente este caso:
`referencias_nao_resolviveis` no frontmatter do relatório, que existe para
*"caminho que existe no disco mas NUNCA foi rastreado"*. Não reescrevi a
narrativa nem alterei nenhuma afirmação: declarei, onde a máquina lê, o que a
prosa já dizia para quem lê. Medido depois: **referências mortas na árvore
inteira do recorte prescritivo = zero.**

---

## 5. A proveniência valida sintaxe, e existe fonte canônica

`AgentCalibrationProvenance.ps1` decide o conector por expressão regular sobre o
nome do modelo. `gpt-9.9-inexistente` passa, e mapeia para `codex`. O script
declara isso com honestidade — *"Family/version syntax is checked, not guessed"*
—, mas a §3 já diz onde mora a existência de um modelo: `llm/model_registry.py`,
com `MODELOS_RETIRADOS` guardando os recusados **com o motivo**, precisamente
para que registro histórico não precise de regex.

Medido, e é o que torna a recomendação barata:

| Modelo no ledger | Ocorrências | No conjunto canônico? |
| :--- | ---: | :--- |
| `claude-opus-5` | 12 | sim |
| `gemini-3.8-flash` | 8 | sim |
| `gpt-5.6-terra` | 2 | sim |
| `gpt-6-astra` | 1 | sim |
| `Codex GPT-6` | 1 | **não** |

`MODEL_REGISTRY ∪ MODELOS_RETIRADOS` = 16 entradas, e cobre **todos** os modelos
reais do ledger. O único fora é `Codex GPT-6` — que é o registro defeituoso da
sequência 16, aquele que fundiu veículo e modelo num campo só e que a §8.3 cita
como a medição que originou os dois campos. Ele já foi corrigido por append.

**Trocar o regex por pertinência ao conjunto canônico não produz um falso
negativo sequer, e fecha a porta que hoje aceita um modelo inexistente.** Não
implementei: é mudança de contrato de portão, e portão é do Tier 0.

Achado menor no mesmo script: para campo vazio, `reasons` emite
`missing:supervision_mode` **e** `invalid:supervision_mode`, porque string vazia
falha nas duas checagens. Cosmético, mas duplica a contagem de motivos em
qualquer leitura agregada.

---

## 6. O que eu errei nesta auditoria

Três vezes, e as três valem mais registradas que omitidas:

1. **Contei 22 históricos incompletos onde há 9.** Filtrei por `$_.eligible`
   quando o campo é `provenance_complete`; em PowerShell `-not $null` é
   verdadeiro, então o filtro aprovava tudo. É a mesma classe do teste vacuário
   de ontem: uma expressão que nunca é falsa não filtra, carimba.
2. **Afirmei que o portão de registro tinha aprovado ontem com uma revisão de
   âncora só.** Fui medir: o prelúdio carregava **42**. Não havia anomalia no
   portão; havia erro na minha memória. Verifiquei antes de reportar, e por isso
   isto está aqui como erro meu e não como falso achado sobre o instrumento.
3. **Rodei um segundo `pytest` enquanto a suíte integral ainda corria**, e ele
   devolveu sete falhas que não existem. Descartei a medição. É a Lei de
   Concorrência aplicada a mim mesmo, vinte minutos depois de eu a invocar
   contra outro condutor.

4. **Acusei os relatórios do Codex de declararem `caminhos` errado, e o errado
   era eu.** Tratei o campo como manifesto dos arquivos alterados no commit.
   `record_gate.py:472` é explícito: *"Ancora e o campo `caminhos:`, nunca a
   prosa"* — ele declara **a que o registro se ancora**, isto é, o que obriga a
   revisá-lo quando mudar. Declarar um caminho não alterado é conservador, não
   falso; omitir um caminho alterado não viola nada. O achado foi retirado da
   seção 3 antes da publicação. Levantar defeito inexistente num instrumento
   alheio é pior que não auditar: gasta o crédito da auditoria inteira.

E uma medição anterior que também descartei: a primeira corrida da suíte
atravessou a janela em que o Gemini fazia o merge. Malha compartilhada não
produz medição.

---

## 7. Fora do escopo desta auditoria, e registrado para averiguação

O commit `812c1c2f` envolve `PerspectiveChart` em `React.memo`. **Não abri o
diff.** Registro apenas que ele cai na classe que a §10.3 item 2 nomeia
explicitamente como o que não se faz sem medir render desperdiçado — regra
escrita, em 05/09, a partir de uma proposta que teria feito exatamente isso. Se
houve medição prévia, ela não está em relatório que eu tenha lido.

Pela §10.6(c), branch do Jules entra na malha **apenas por merge local
revisado**, onde o `pre-commit` roda de fato. O merge do PR #44 foi local, o que
satisfaz a forma; o que a seção 4 mostra é que o `pre-commit` não cobre a suíte
Python, e portanto "aprovado no pre-commit" nunca significou "suíte verde".

---

## 8. Resolvido nesta sessão, por ordem de gravidade

O Tier 0 determinou *"resolva em ordem de gravidade"* e aceitou as duas
recomendações que dependiam de arbitragem. Executado:

**1 — O CI vermelho.** `referencias_nao_resolviveis` declarado no relatório de
09-11. Dívida de referência morta na árvore inteira: zero.

**2 — Nada local executava a suíte Python.** A suíte entrou no **`pre-push`**, e
não no `pre-commit`. O motivo é de proporção: ela leva cerca de seis minutos, e
no pre-commit seria paga várias vezes por hora — **portão caro é portão que
alguém contorna**, e a §1 já proíbe contornar. O push é a fronteira de
publicação, que é exatamente onde a §10.6(c) exige portão real e onde, sem isto,
o CI seria o primeiro a saber. O `pre-commit` fica como está.

Ao editar o arquivo apareceu um defeito latente: **o `pre-push` não declarava
`set -e`**. Ele tinha uma única verificação bloqueante ao final, então o efeito
não aparecia — mas a primeira linha acrescentada depois dela faria `sota:audit`
deixar de bloquear em silêncio. É o defeito que o comentário do `pre-commit`
documenta desde que aquele arquivo passou a ter mais de uma linha. Declarado.

**3 — Modelo validado por sintaxe.** Duas camadas agora, e elas respondem
perguntas diferentes: a expressão regular diz a **família** — e daí o conector
esperado; o conjunto canônico diz a **existência**. A lista é lida de
`llm/model_registry.py` em tempo de validação, resolvendo o Python do mesmo modo
que `New-AgentCalibrationDailyEvidence.ps1` já fazia; **não existe cópia**, logo
não existe segunda fonte. Se a fonte canônica não puder ser lida, o registro
**não** é aprovado: sai com `canonical_model_source_unreachable`, porque aprovar
por indisponibilidade seria degradação silenciosa.

A correção expôs uma divergência entre as duas camadas: `claude-fable-5` e
`claude-fable-5-1` estão em `MODELOS_RETIRADOS` — são **reais**, apenas
recusados por faixa de acesso — e a alternância da regex só cobria
`opus|sonnet|haiku`, devolvendo `unknown_or_nonexact` para um modelo que a fonte
canônica conhece. `fable` entrou. Guard novo assegura a invariante: **todos os
16 modelos canônicos resolvem para um veículo**, medido.

**5 — `reasons` duplicava motivo.** Campo em branco saía com
`missing:supervision_mode` **e** `invalid:supervision_mode`. Ausente e inválido
são coisas distintas; agora só o que existe pode ser julgado inválido. Não muda
elegibilidade, mas contagem agregada inflada é matéria-prima de conclusão errada.

Três guards novos em `tests/test_agent_calibration_provenance.py`: a invariante
dos 16, a recusa de `gpt-9.9-inexistente` e congêneres, e a ausência de motivo
duplicado.

---

### O portão novo barrou o primeiro push, e estava certo em barrar

A primeira execução real do `pre-push` **bloqueou a publicação sem que um único
teste tivesse reprovado.** O portão de 5 fases aprovou — 0 erros, 2 warnings,
teto 2 — e a suíte morreu no `sessionfinish`, não em asserção.

Causa: a raiz temporária compartilhada, `%TEMP%\pytest-of-rapha`, contém
`pytest-current`, um **symlink de diretório morto** — `islink` verdadeiro,
`isdir` falso, alvo já removido. No Windows, `Path.unlink()` sobre symlink de
diretório devolve `WinError 5`, então `cleanup_dead_symlinks` explode no
encerramento, o pytest sai com código não-zero, e o `set -e` aborta o push.
Medido: nem `os.rmdir`, que é a chamada correta para symlink de diretório no
Windows, consegue removê-lo — o SO o mantém travado. E ele reaparece toda vez
que uma corrida é interrompida.

**Falha fechada é o comportamento certo; a causa é que estava errada.** Um
portão que barra por artefato de ambiente treina o operador a desconfiar dele, e
desconfiança de portão é o primeiro passo para o contorno que a §1 proíbe.

A correção não afrouxa nada — mas **a primeira tentativa dela estava errada, e o
portão pegou isso também.** Apontei o `--basetemp` para `.pytest_tmp`, dentro da
árvore do repositório. O push seguinte reprovou com **3 failed, 1122 passed**, e
os três são precisamente os testes que criam repositórios git temporários: os
dois detectores de referência em `test_record_index.py` e — com ironia exata —
`test_suite_isolada.py::test_nao_inventa_repositorio_onde_nao_ha`. **Repositório
de teste criado dentro da árvore é um repositório onde não deveria haver um.**
Estar no `.gitignore` não o tira do disco; ignorar para versionar e ignorar para
enxergar são decisões diferentes, que é a mesma lição da §4 da raiz.

A raiz precisa de **duas** propriedades, e cada uma custou uma tentativa: curta,
senão os mesmos testes estouram o limite de caminho do Windows com `WinError
267` — o que produziu as nove falhas fantasma da seção 6 —, e **fora** da árvore.
O hook usa `${TEMP:-${TMPDIR:-/tmp}}/pt-sota`, que satisfaz as duas em Windows e
em POSIX. Verificado nos três testes: passam.

O remoto permaneceu em `812c1c2f` durante todo o episódio, nas duas tentativas:
nada foi publicado por um portão que não aprovou. **O portão que instalei para
pegar o que ninguém pegava pegou dois defeitos meus antes de deixar passar
qualquer coisa** — inclusive um defeito nele próprio.

### O contador de warnings do guard divergiu do pytest, e isso é achado

A suíte fechou **1124 aprovados, 1 pulado, exit 0**. O pytest declarou **1
warning**; o guard do `conftest.py`, na mesma corrida, declarou **`Total de
Warnings: 0`** e carimbou `SUCESSO (VERDE) — Homeostase Total`.

O warning é `PytestUnhandledThreadExceptionWarning`: a thread leitora do
`subprocess` bate em `UnicodeDecodeError` ao ler a saída do pwsh — byte `0xc6`,
mensagem de erro em português num console que não é UTF-8. **Não é meu**, e isso
foi medido, não suposto: com `git stash` da minha alteração, a versão anterior
do script produz o mesmo warning. Não há warning novo, e a §6.2 está cumprida.

O que sobra é a divergência. A §6.2 diz que o `conftest.py` deriva a contagem do
hook `pytest_warning_recorded` e que *"é a fonte, e é honesta"*. Nesta corrida
ela reportou zero enquanto havia um — e num teste isolado o mesmo guard reportou
`FRAGIL (AMARELO), 1 warning`, ou seja, ele **sabe** contar esse warning e não o
contou na suíte inteira. Um contador que acerta no pequeno e zera no grande é
pior que um que erra sempre: o carimbo `Homeostase Total` é exatamente o que
ninguém vai reauditar. Não mexi no instrumento — é o que a §10.3 item 3 proíbe
ao agente, e a correção depende de entender por que o hook não dispara ali.

---

## 8.1 Segunda rodada — os abertos, delegados e autorizados

O Tier 0 delegou e autorizou os itens que a seção 9 listava. Resolvidos:

### O `paths-ignore` que isentava o que a verificação mede

Retirados `**/*.md`, `docs/**` e `reports/**`. Ficam isentos só arquivos que
nenhum teste lê como conteúdo — `.gitignore`, `.gitattributes`, `.editorconfig`,
`LICENSE`. Acrescentado `workflow_dispatch`, sem o qual um commit
só-documentação **não tinha como ser verificado pelo CI nem quando corrigia o
que o próprio CI acusava** — foi literalmente o caso hoje.

### O contador de warnings: o autoteste apagava a medição

Causa localizada e é limpa. `tests/test_backend_hardening.py::test_sota_guard_blocks_on_errors_or_excess_warnings`
manipula o estado **global** do `SotaGuardState` e terminava chamando `reset()`,
que limpa `errors`, `warnings_list` e `skips`. Como ele roda no meio da suíte,
apagava os warnings **reais** registrados antes dele.

Demonstrado por A/B, mesmos nove testes e o mesmo warning do pytest:

| | o guard diz | carimbo |
| :--- | :--- | :--- |
| sem a fixture | `Total de Warnings: 0` | `SUCESSO (VERDE) — Homeostase Total` |
| com a fixture | `Total de Warnings: 1` | `FRAGIL (AMARELO)` |

**O instrumento se autotestava destruindo a própria medição**, e o resultado era
o verde mais caro que existe: o que ninguém reaudita. Corrigido por fixture que
salva e restaura — nenhuma asserção do autoteste mudou. Guard novo impede a
regressão, que não produziria falha e sim verde.

E o warning em si foi eliminado na origem: `subprocess.run(..., text=True)` sem
`encoding` decodifica a saída do pwsh pela codificação do console, e a mensagem
de erro em português traz bytes que não são UTF-8 — a thread leitora levanta
`UnicodeDecodeError`. É a mesma classe do registro de 2026-09-10 sobre o
encoding que matava a thread leitora, e a mesma correção que
`test_cwv_gate_truthfulness.py` já aplicava. Agora são **zero warnings, e o zero
é verdadeiro** — antes ele era um zero apagado.

### O commit `812c1c2f` do Gemini — a suspeita não se confirmou

Abri o diff. `PerspectiveChart` recebe uma única prop, `chartData`, e ela vem de
`usePerspectiveCalculations`, onde é construída dentro de um `useMemo`. **A
referência é estável**, que é exatamente a pré-condição que a §10.3 item 2 exige
antes de memoizar. Cinco linhas, com `displayName` declarado. O commit está
correto e a minha ressalva era de classe, não de conteúdo — registro isso com a
mesma clareza com que registrei a suspeita.

Fica uma observação menor e uma real: a §10.1 pede o número medido de render
desperdiçado, que não consta de relatório que eu tenha lido; e o commit saiu
assinado **`Codex GPT-5 <noreply@openai.com>` numa sessão do Gemini** — a
identidade residual da §7, terceira ocorrência medida em três dias.

### Outlier `512fc3a6` — encerrado

Os dois componentes verificados na fonte, não presumidos. O prompt do heartbeat
está `ACTIVE` e exige sessões distintas **acumuladas desde a última calibração
registrada, delimitada por `sequence`**, com zero menções a recorte por dia como
limite de amostra. E o feedback de scope `intrasessao-outlier`, que o outlier
apontava como contaminação do universo, é hoje a sequência 10 da auditoria
histórica, excluída com motivo `completed_handoff_not_declared` — preservada
como evidência, nunca promovida. Registro de encerramento na sequência 8 do
ledger de outliers, cadeia válida em 9 registros. **Restam quatro.**

## 8.2 Terceira rodada — aprovação em bloco, na ordem 5 → 4 → 3 → 2

### 5 — Os sete registros sem `supervision_mode`

Declaração em bloco do Tier 0: **todas as sessões até 2026-09-03 foram
assistidas**. Conferido antes de aplicar que os sete estão dentro do corte — de
01/09 a 03/09 — e nenhum registro fora dele foi tocado. Sete correções
append, sequências 59–65, cadeia válida em 66.

A distinção que autoriza isto: a §3.1 diz que arbitragem governa *permissão* e
não *fato* — mas aqui **o Tier 0 é a fonte primária do fato**. Ele arbitrou as
sessões pessoalmente. Declarar o que se presenciou é testemunho, não inferência.
O que seria ilegítimo é o agente deduzir supervisão a partir do modelo, do editor
ou da presença de nota humana, e é isso que o portão recusa.

**Históricos incompletos: 9 → 2.** Os dois que restam são de escopo, não de
supervisão: a sequência 10 é `intrasessao-outlier` e a 11 tem `scope: sessao` sem
fonte de encerramento localizada.

### 4 — Os outliers

| Outlier | Ação | Por quê |
| :--- | :--- | :--- |
| `2d55d92a` | **encerrado**, seq 9 | não havia revisão pendente: a determinação já fora tomada **e** executada — `decisao-tier0:2026-09-03T20:40`, e a execução é a *ausência* de registro de feedback, verificada |
| `da7ef222` | evidência retida, seq 10 | medição dirigida à hipótese; **sem** `-Resolves` e **sem** `-Authority`, porque o próprio script recusa autoridade sem fechamento: retenção é medição, não decisão |
| `b39b7431` | **não descartado** | ver abaixo |
| `7e5ca052` | mantido aberto | conflito de interesse declarado: é meu, é de hoje |

**A medição do `da7ef222` contraria a minha própria recomendação, e é isso que a
torna valiosa.** A hipótese prevê degradação sob contexto de segurança ou erro
próprio. Esta sessão teve os dois ao mesmo tempo. Medido: até o handoff, 271
chamadas e 11 erros — 4,1%; sessão completa, 728 e 25 — 3,4%; **o trecho
posterior ao gatilho, 457 chamadas e 14 erros — 3,1%**. Sob exatamente a condição
que a hipótese prevê como degradante, a taxa caiu.

Não conta como uma das duas confirmações independentes, e não deve ser lida como
refutação: uma sessão, sem controle, sem cegamento. Fica registrada porque **o
viés de só anexar o que confirma é o mecanismo que transforma hipótese em
crença.** Nota adicional: a evidência de 09-03 que originou a hipótese está
confundida por degradação de infraestrutura, conforme a própria determinação do
`2d55d92a`.

**Por que não descartei o `b39b7431`, tendo recomendado descartá-lo.** Recomendei
com base numa linha de resumo. Ao lê-lo inteiro, ele é um outlier **positivo**:
53/53 testes, execução estendida sem degradação, com hipótese viva e testável
sobre homeostase sob verificação empírica contínua. Outlier não é sinônimo de
defeito — a §8.3 diz *"evidência retida, não erro descartável"*. Descartar o
único ponto positivo de um corpus feito de falhas enviesaria tudo o que vier
depois. Executar uma recomendação aprovada que eu descobri estar errada seria
inverter a §3.1: **arbitragem governa permissão, não fato.**

### 3 — Registro de tarefa aberta entre sessões

Campo `pendencias:` no frontmatter, lido e exibido pelo `record_gate.py` em todo
commit. Codificado na §9.2, por arbitragem aditiva.

Três propriedades, e cada uma responde a uma parte do defeito dos catorze dias:

- **mora onde um portão já olha** — não num artefato novo, que nasceria com o
  mesmo defeito do README;
- **encerra por append**, nunca por remoção — a pendência fica no registro que a
  criou, e quem resolve declara o `id` num registro novo. Encerrar id nunca
  declarado bloqueia: fechar o que não existe esconde o que existe;
- **não bloqueia** — portão que segura trabalho refém de pendência ensina o
  operador a apagar pendência. O que bloqueia é declaração **malformada**, porque
  pendência que o portão não exibe é o defeito que o campo existe para corrigir.

Seis pendências semeadas, com dono e prazo. Guards em `tests/test_record_index.py`
cobrem os cinco casos: aberta não bloqueia, encerra por append sem reescrever a
origem, vencida é marcada pela data, malformada bloqueia em seis formas, e
`pendencias_resolvidas` órfã bloqueia.

### 2 — Os oito `.patch`

Retirados. A medição que decide: **os oito submódulos estão limpos e todo o
trabalho está commitado em fork, 1 a 2 commits além do upstream.** O seguro não
tem mais risco a segurar, e um `.patch` que duplica história publicada é fonte
paralela — ela não diverge se alguém descuidar, diverge **por padrão**.

O `patches/skills/README.md` passou a registrar fork, gitlink e branch por skill:
ponteiro verificável no lugar de 640 KB que ninguém reconcilia.

**E o guard mudou de pergunta.** Ele perguntava *"existe patch?"* e passava
vacuamente desde que os submódulos ficaram limpos — mas, pior, **nunca teria
pego o defeito que de fato aconteceu**. Olhava para o lugar errado: a pergunta
não era se havia patch, era se **o endereço publicado resolve**. Agora são três
asserções com conteúdo, e a primeira roda **sem submódulo materializado**, que é
o caso do CI:

1. todo submódulo de `skills/` aponta para o fork no `.gitmodules` — é esta que
   teria fechado os quinze dias no dia em que nasceram;
2. o gitlink gravado resolve para um commit que existe no submódulo;
3. fonte modificada não fica sem commit — e a remediação agora é **commitar no
   fork**, não extrair patch: patch guarda o trabalho e não o publica.

Um quarto exige que todo `.patch` presente tenha objeto — submódulo limpo com
patch é a fonte paralela de volta.

Provei que a asserção 1 morde antes de aceitá-la: com um dos oito revertido ao
upstream em simulação, ela acusa `skills/gemini-supermemory`. Guard que eu não vi
falhar é o problema que estou consertando.

---

## 9. Em aberto para o Tier 0

- **Ninguém observa o CI.** Nove commits vermelhos por dois dias, três
  condutores, e o vermelho só apareceu porque uma auditoria foi olhar. O
  `pre-push` fecha a porta daqui em diante, mas não cria o observador. É a mesma
  lacuna dos catorze dias, noutra superfície.
- **Encerrar o outlier `512fc3a6`**, cujos dois componentes estão fechados.
- Os quatro outliers restantes, as três correções de segurança sem PR upstream,
  e o destino dos oito `.patch` — todos já registrados na auditoria de
  encerramento desta manhã e ainda em pé.
- **O commit `812c1c2f`**, pelo que a seção 7 registra e esta auditoria não
  verificou.
