---


id: handoff-2026-09-12-reconciliacao-calibracao-e-proveniencia
tipo: handoff
escopo: Site
ecossistema: nexus-sota
autor: Codex
criado_em: 2026-09-12T08:56:08-03:00
atualizado_em: 2026-09-12T08:56:08-03:00
commit: 65e0863bc3b73c30f2b198109a69fedf6bced220
classes: [interno, handoff, calibracao, proveniencia]
caminhos:
  - CLAUDE.md
  - scripts/ops/AgentCalibrationProvenance.ps1
  - scripts/ops/Register-AgentCalibrationFeedback.ps1
  - scripts/ops/New-AgentCalibrationDailyEvidence.ps1
  - scripts/ops/Record-AgentCalibration.ps1
  - reports/agent-calibration/feedback-ledger.jsonl
  - reports/agent-calibration/outlier-evidence-ledger.jsonl
  - reports/AUDITORIA-2026-09-12-proveniencia-executavel-do-feedback.md
  - tests/test_agent_calibration_provenance.py
  - tests/test_agent_calibration_feedback.py
  - tests/test_calibracao_portao_por_sessao.py
  - tests/test_calibracao_fechamento_do_ciclo.py
config_medida:
  runtime: pwsh 7.6.6
  automation_id: calibra-o-di-ria-de-coer-ncia-ag-ntica
  automation_status: ACTIVE
  schedule_local: '23:59 diariamente'
  feedback_records_physical: 58
  outlier_records_physical: 8
  effective_feedback_records: 22
  historical_incomplete_records: 9
  eligible_current_cycle: 1
  feedback_handoff_literal: 9.8
  feedback_source: instrucao explicita recebida da tarefa coordenadora 01a09547-c8df-7641-87b5-83723b4b645d


verificado:
  - configuracao persistida da automacao relida e regra acumulativa confirmada
  - duas cadeias validadas novamente em pwsh nesta consolidacao
  - gerador executado novamente confirma uma sessao elegivel no ciclo
  - 44 testes direcionados aprovados durante a implementacao sem warnings
  - 10 testes TimesFM aprovados durante a implementacao sem warnings
  - frontmatter YAML valido com 13 campos exigidos e 12 caminhos existentes
  - nenhuma referencia morta na verificacao dirigida do novo relatorio
  - nota literal 9.8 e ausencia de 10/10 verificadas no novo relatorio
nao_verificado:
  - suite integral e pre-commit nao executados
  - proximo disparo agendado ainda nao observado
  - ausencia de comprovacao especifica do regime de supervisao em sete registros efetivos
  - feedback 9.8 documentado neste relatorio sem novo append ao ledger nesta etapa
supersede: null
revisoes_de_ancora:
  - registro: handoff-2026-09-12-reconciliacao-calibracao-e-proveniencia
    caminhos:
      - CLAUDE.md
    parecer: >-
      Revisado em 2026-09-29 e mantido valido. Alteracoes aditivas e pontuais: registro do condutor Space-Bunny-Alpha em 4 pontos (SS7 piramide, SS3 pools, Hermes/Orquestracao) e remocao de contagem de MCP na SS8.0. Nenhuma regra, tier ou threshold alterado. As conclusoes deste registro sobre a piramide e sobre proveniencia seguem valendo. Diff desta revisada: +290/-259 linhas. Revisado em 2026-09-29; diff desta revisada: +290/-259.
  - registro: handoff-2026-09-12-reconciliacao-calibracao-e-proveniencia
    caminhos:
      - scripts/ops/AgentCalibrationProvenance.ps1
    parecer: >-
      Revisado em 2026-09-29 e mantido valido. Alteracoes aditivas e pontuais: registro do condutor Space-Bunny-Alpha em 4 pontos (SS7 piramide, SS3 pools, Hermes/Orquestracao) e remocao de contagem de MCP na SS8.0. Nenhuma regra, tier ou threshold alterado. As conclusoes deste registro sobre a piramide e sobre proveniencia seguem valendo. Diff desta revisada: +290/-259 linhas. Revisado em 2026-09-29; diff desta revisada: +34/-2.
  - registro: handoff-2026-09-12-reconciliacao-calibracao-e-proveniencia
    caminhos:
      - reports/AUDITORIA-2026-09-12-proveniencia-executavel-do-feedback.md
    parecer: >-
      Este registro foi consolidado: as duas copias de `revisoes_de_ancora` no frontmatter foram unidas em uma, e a perda silenciosa da primeira -- o parser aceita chave duplicada e a ultima vence -- foi o que o portao reprovou. Nenhum veredito mudou. Revisado em 2026-09-29; diff: +15/-0 linhas.
  - registro: handoff-2026-09-12-reconciliacao-calibracao-e-proveniencia
    caminhos:
      - tests/test_agent_calibration_provenance.py
    parecer: >-
      Revisado em 2026-09-29 e mantido valido. Alteracoes aditivas e pontuais: registro do condutor Space-Bunny-Alpha em 4 pontos (SS7 piramide, SS3 pools, Hermes/Orquestracao) e remocao de contagem de MCP na SS8.0. Nenhuma regra, tier ou threshold alterado. As conclusoes deste registro sobre a piramide e sobre proveniencia seguem valendo. Diff desta revisada: +290/-259 linhas. Revisado em 2026-09-29; diff desta revisada: +26/-2.

---

# Handoff — reconciliação da calibração e proveniência efetiva do feedback

## 1. Demanda, processo e alcance

A demanda foi reconciliar a auditoria diária do Site com sua governança e tornar
executável a proveniência exigida dos feedbacks. O trabalho começou por inspeção
somente de leitura: estado Git, governança, scripts, testes e configuração do
heartbeat Codex. O worktree estava limpo no início da reconciliação; nesta etapa
documental já contém as alterações entregues, que foram preservadas.

A primeira distinção operacional foi entre **origem da configuração e projeto
alvo**. O heartbeat é configurado fora do Site, no armazenamento local do Codex,
em `~/.codex/automations/` sob o identificador acima. Ele executa uma auditoria
do Site, mas seu prompt não era um arquivo versionado deste projeto. Corrigir
apenas o gerador ou o relatório não corrigiria a instrução que o agendador envia.

O prompt antigo exigia três feedbacks em duas ou mais sessões e vinculava a
insuficiência à ausência diária. A regra canônica e o gerador já exigiam **três
sessões distintas acumuladas desde a última calibração registrada**, sem expiração
por dia vazio. A reconciliação atualizou o prompt pela ferramenta da plataforma,
preservando estado ativo, execução às 23:59 e tarefa destinatária. A releitura
confirmou persistência. Não foi necessário mudar o limiar executável.

Foram corrigidos comentários contraditórios do gerador e acrescentados dois
contracasos: três feedbacks em duas sessões mantêm o portão fechado; dia vazio
com três sessões acumuladas mantém a suficiência estrutural. As duas confirmações
independentes do mesmo padrão permanecem uma exigência adicional ao limiar.

Na segunda etapa, autorizada, o escritor, o avaliador e o registrador de calibração
passaram a consumir a elegibilidade de proveniência. A auditoria histórica leu as
correções existentes e acrescentou somente dois registros sustentados por fontes
específicas. A etapa final executou testes direcionados, conferiu integridade e
produziu este relatório; não executou calibração nem publicação Git.

## 2. Erro de leitura, correção e aprendizados

**A auditoria inicial errou ao tratar campos brutos ausentes como proveniência
ainda não resolvida.** A arbitragem aditiva do Tier 0 já havia suprido modelo e
conector por registros de correção append-only. Julgar só o JSON original ignorava
a decisão existente e confundia ausência física no original com ausência no estado
efetivo. A leitura foi corrigida: primeiro se aplicam as correções, depois se julga
a elegibilidade. Isso não significa que o usuário deixou de auditar os registros.

Evidência concreta: sequências 28 e 29 suprem modelo e conector do feedback 1;
30–53 completam outros campos de origem; 54 reconcilia a identidade do feedback 21.
Essas correções foram respeitadas, não duplicadas. Todos os **22 feedbacks** possuem
modelo e conector no estado efetivo. O problema residual não é “ledgers não
verificados”: ambas as cadeias estão válidas. São lacunas específicas de campos ou
de declaração de encerramento, discriminadas na seção 4.

Aprendizados operacionais que orientaram a implementação:

- Modelo, conector e supervisão são campos independentes. Comparar a coerência
  entre eles não autoriza preencher um campo ausente automaticamente.
- GPT/ChatGPT → `codex`; Claude → `claude-code`; Gemini → `antigravity`, o runtime
  Antigravity 2.0. Antigravity IDE e outros editores compartilhados não identificam
  o executor. A checagem sintática não certifica por si a origem real declarada.
- Prelúdio é sessão ainda aberta; interlúdio separa trabalho emergencial ou não
  correlato autorizado; handoff é o encerramento onde reside o feedback. Os três
  preservam a identidade da sessão. Arbitragem aditiva é um canal separado, não
  uma quarta fase nem autorização para criar uma nova sessão por conveniência.
- Um nome não substitui o estado documentado: o feedback 55 continua elegível
  embora seu identificador contenha “preludio”, pois o registro canônico documenta
  que a nota chegou e a sessão foi encerrada.
- Uma correção individual não cria novo limiar geral. Validade criptográfica,
  proveniência efetiva, suficiência estrutural e corroboração são verificações
  distintas; nenhuma deve ser apresentada como substituta das demais.

Houve também uma falha local na primeira coleta dos novos testes: import incorreto
do módulo de fixtures. O import foi corrigido e a bateria posteriormente passou.
O resultado inicial não foi tratado como aprovação nem omitido do registro técnico.

## 3. Estado inicial versus estado entregue

| Superfície | Antes desta intervenção | Estado verificado |
| :--- | :--- | :--- |
| Heartbeat | Ativo às 23:59, com critério textual divergente | Continua ativo às 23:59; prompt persistido exige três sessões distintas acumuladas e corroboração separada |
| Escritor de handoff | Campos de condutor opcionais; podia gravar proveniência incompleta | Validação compartilhada recusa ausência/blank de sessão, modelo, conector, supervisão e escopo sem handoff antes da escrita |
| Evidência diária | Aplicava correções, mas não excluía incompletude de proveniência do limiar | Aplica correções antes da validação; publica elegíveis, excluídos, motivos e auditoria histórica |
| Corroboração | Referência existente e sessões distintas não garantiam proveniência completa | IDs precisam constar entre os elegíveis do ciclo; exceção de limiar não contorna proveniência; releitura sob lock |
| Histórico | 56 registros físicos; arbitragens de origem já presentes | 58 registros físicos: somente dois appends de scope; nenhuma duplicação das arbitragens anteriores |
| Ciclo atual | A calibração 27 já delimitava o reinício; feedback 55 era posterior | Uma sessão elegível após a calibração; insuficiência esperada, não defeito |
| Integridade | Histórico encadeado preservado | Feedback e outliers validados novamente: 58 e 8 registros físicos |
| Testes | Guards existentes de sessão/ciclo/feedback | 44 testes direcionados e 10 TimesFM aprovados; Ruff e diff check aprovados na implementação |
| Git | Worktree inicialmente limpo | Diffs locais preservados; nenhum commit, push ou reescrita de histórico nesta intervenção |

Artefato novo de código: `scripts/ops/AgentCalibrationProvenance.ps1`, com BOM UTF-8
único. Consumidores: escritor de feedback e gerador; o registrador de calibração
consome a lista efetiva emitida pelo gerador. O relatório técnico complementar é
`reports/AUDITORIA-2026-09-12-proveniencia-executavel-do-feedback.md`.

## 4. Correções históricas e limites de cobertura

| Append desta intervenção | Alvo | Campo / evidência |
| :--- | :--- | :--- |
| 56 — `1764ad6a-0835-47fd-a7fb-79cd5ddb00cb` | `0b30eafd-b57f-47dc-bf28-9822a0f36769` | scope → handoff; `reports/HANDOFF-2026-09-05-auditoria-site-moldes.md` identifica a sessão e seu feedback de encerramento |
| 57 — `afc7387e-3fbd-49cf-bf08-ac0339481556` | `15b9a610-70d5-449e-8192-bf1ad3b09565` | scope → handoff; `reports/HANDOFF-2026-09-02-curadoria-mcp-quarentena-e-roteamento-lazy.md` e confirmação em `reports/HANDOFF-2026-09-03-guarda-de-governanca-camada-anthropic-e-cobertura-cve.md` |

Os registros originais continuam intactos, com seus scopes temáticos. Não foram
alteradas notas. O regime de supervisão não foi deduzido do modelo, do editor ou
da simples presença de uma nota humana.

| Registros históricos | Lacuna efetiva restante | Tratamento |
| :--- | :--- | :--- |
| Feedbacks de sequências 1, 2, 3, 5, 7, 8 e 9 | `supervision_mode` ausente no estado efetivo consultado | Sete registros preservados, com motivo explícito e sem elegibilidade |
| Sequência 10 — `48443d06-2119-4ab9-9c36-6ba72d35c056` | `scope: intrasessao-outlier` | Evidência de outlier, não convertida automaticamente em feedback de handoff |
| Sequência 11 — `2b589f4c-f59e-451a-9e44-ba7d1cc1ef5c` | `scope: sessao`, sem fonte específica de encerramento localizada | Preservado e inelegível até reconciliação específica |

Isso delimita **nove registros históricos**, não nove exclusões no ciclo atual.
O ciclo atual tem uma entrada elegível e zero excluídas. Completar o histórico
dependerá de fonte ou arbitragem explícita que cubra o campo/caso faltante, se o
objetivo futuro for torná-lo elegível; não se exige nova arbitragem para dados já
supridos pelas correções existentes. Os IDs dos sete registros constam no relatório
técnico complementar e em `historical_provenance_audit` emitido pelo gerador.

## 5. Validação, rastreabilidade e fronteiras

Resultados observados durante a implementação, não rebatizados como suíte integral:

- Proveniência, feedback, portão por sessão e fechamento de ciclo: **44 passed**,
  **0 warnings**, 51,71 s.
- Integração TimesFM existente: **10 passed**, **0 warnings**, 5,45 s. Isso não
  equivale a executar um experimento de calibração comportamental.
- Ruff nos quatro arquivos de testes modificados: aprovado.
- `git diff --check`: aprovado. Nesta etapa documental, a verificação dirigida
  aprovou o frontmatter YAML, os 13 campos exigidos e os 12 caminhos declarados;
  `referencias_mortas` do portão canônico retornou lista vazia. Nota literal 9.8
  e ausência da nota incorreta foram conferidas. Sem staging ou pre-commit.
- Cadeias novamente validadas em PowerShell 7.6.6 nesta consolidação; configuração
  do heartbeat e saída efetiva do gerador também relidas.

Hashes das pontas conferidas:

- Feedback: `11824d7d37249b1bd4a9fee801cce4561029c74337e2fa3fd0ab0698a364b76f`.
- Outliers: `b69d6ec16b6f6d5181975e94152788ca5a2209a2e8288d4957edebe9a8ed18a7`.

Não executados: suíte integral, pre-commit, commit, push, calibração automática,
mudança de pesos de modelo, permissões de ferramentas ou configurações de acesso.
A mudança de configuração efetivamente autorizada foi o **prompt do heartbeat**;
não é correto dizer que nenhuma configuração mudou. Não houve exclusão nem
reescrita de evidência. O próximo disparo agendado ainda não foi observado.

## 6. Conclusão e avaliação do handoff

O contrato do agendador foi alinhado à regra executável, e a proveniência passou
a ter consumidores concretos na escrita, na contagem e na corroboração. A auditoria
respeita as arbitragens históricas e distingue as lacunas residuais sem fabricar
origem, supervisão ou continuidade.

**dados insuficientes — nenhuma calibração planejada**

Motivo atual: uma sessão elegível desde a última calibração, abaixo do mínimo de
três. Nenhuma microcalibração foi aplicada nem proposta como consequência desta
insuficiência.

**Feedback final deste handoff: 9.8/10**, preservado literalmente conforme a
correção explícita recebida da tarefa coordenadora. A nota é documentada aqui;
esta etapa não a anexou ao ledger nem inventou comentário qualitativo do usuário.
Notas citadas em documentos históricos pertencem às respectivas sessões, não à
avaliação deste handoff.
