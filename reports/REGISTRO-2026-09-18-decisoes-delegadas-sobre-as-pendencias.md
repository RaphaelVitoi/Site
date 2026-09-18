---
id: registro-2026-09-18-decisoes-delegadas-sobre-as-pendencias
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: '2026-09-18T10:30:00-03:00'
atualizado_em: '2026-09-18T10:30:00-03:00'
classes: [interno, medido, governanca, dependencias]
caminhos:
  - reports/REGISTRO-2026-09-18-decisoes-delegadas-sobre-as-pendencias.md
  - package.json
  - package-lock.json
  - frontend/package.json
  - engine/pmev_dream_bridge.py
  - engine/discovery_recorder.py
  - engine/dream_replay_simulator.py
  - tests/test_dream_rsi_experimental.py
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  commit_base: f1dba0da
  host: Windows 11 Pro 10.0.26200
  data_das_medicoes: 2026-09-18
verificado:
  - react-markdown 10.1.0, framer-motion 13.2.0 e typescript 7.0.2 resolvidos no repositorio real
  - typecheck da raiz passa a usar o tsc 7.0.2 do workspace -- isca TS2322 da exit 1 pelos quatro caminhos, limpo sem ela
  - tsc do worker e audit-ts limpos; jest 93 suites 625 testes
  - trava do Dream-RSI experimental morde -- import isca em task_executor.py reprova, arquivo restaurado limpo
nao_verificado:
  - next build com as tres dependencias novas; roda no CI
  - fechamento automatico dos PRs 58, 59 e 60 pelo Dependabot depois do push
pendencias_resolvidas:
  - pend-2026-09-18-merge-prs-major-e-tsc-unico
  - pend-2026-09-17-portao-nao-le-sonarlint
  - pend-2026-09-18-dream-rsi-sem-consumidor-no-runtime
  - pend-2026-09-17-motor-consumir-evidencia-nos-demais-nos
  - pend-2026-09-12-prs-upstream
---

# Decisões delegadas sobre as pendências

O Tier 0 delegou as decisões em 2026-09-18: *"delego as decisões a vc; mas seja eficiente e pragmático"*.
Critério usado em todas: a opção mais barata que resolve de fato, sem apagar o que tem valor e sem deixar
decisão em prosa sem trava.

| Pendência | Decisão | Por quê |
| :--- | :--- | :--- |
| `merge-prs-major-e-tsc-unico` | **aplicadas** as três versões num commit, e o `typecheck` da raiz passa a chamar o `tsc` do workspace | os PRs estavam verdes isolados; o `tsc` da raiz resolvia o TS 6 içado pelo `@prisma/client`, e o CI validaria o TS 7 com o compilador errado. O Dependabot fecha os PRs quando o `master` já tem a versão |
| `portao-nao-le-sonarlint` | **recusada** | SonarLint é extensão de IDE, sem CLI local; trazê-lo ao portão exigiria servidor Sonar ou dependência nova para achados consultivos. O que bloqueia — tipos, ESLint, CVE, A11y, CWV — já está no portão |
| `dream-rsi-sem-consumidor-no-runtime` | **declarados experimentais**, com trava | apagar descartaria trabalho recente; fingir integração violaria a secção 6.5. O marcador está na docstring dos três módulos e `tests/test_dream_rsi_experimental.py` reprova import vindo do runtime |
| `motor-consumir-evidencia-nos-demais-nos` | **absorvida** pela `recaptura-aula12` | com 0 de 7 pares reproduzíveis, ligar mais nós só propaga `unreadable`. O trabalho passa a valer quando a recaptura existir, e começa por ela |
| `prs-upstream` | **encerrada sem abrir** | as correções já são publicadas pelos forks, que o gitlink resolve; o PR upstream é cortesia ao mantenedor, não proteção nossa. As URLs de um clique seguem na §4 do registro de 2026-09-12 para quando houver interesse |

**Ficam com o Tier 0, e não por falta de decisão:** `recaptura-aula12` (exige HRC e GTO Wizard),
`calibracao-global` (sessão própria, decisão de 2026-09-17), `migracao-rp-canonico` (depende da convenção
em que os estudos do PioSolver foram rodados, que só ele sabe) e `modelo-de-bounty-pko` (matemática do PMev).

**Um falso alarme do instrumento, registrado porque quase virou conclusão:** a primeira isca no `typecheck`
novo mostrou o erro e *exit 0*. Era o `Select-Object -First 1` do PowerShell encerrando o pipeline antes de o
npm gravar o código de saída. Sem pipe, pelos quatro caminhos, o exit é 1.
