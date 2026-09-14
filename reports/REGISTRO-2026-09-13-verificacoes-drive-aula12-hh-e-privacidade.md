---
id: registro-2026-09-13-verificacoes-drive-aula12-hh-e-privacidade
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: '2026-09-13T23:28:15-03:00'
atualizado_em: '2026-09-13T23:28:15-03:00'
classes: [interno, medido, pmev, privacidade, governanca]
session_id: 186abdd7-d9aa-481f-bbe0-143b0d27bcff
conductor_model: claude-opus-5
conductor_vehicle: claude-code
supervision_mode: assistida
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  so: Windows
  python: '3.14.6'
  congelada_em: '2026-09-13'
caminhos:
  - reports/REGISTRO-2026-09-13-curadoria-drive-poker-e-pmev.md
  - tests/test_skill_pmev_knowledge.py
verificado:
  - chamada real ao Google Drive pela skill -- 3 buscas com exit 0 e 8 resultados cada, contagens paginadas e metadados com sha256
  - Aula 1.2.docx atual, no Drive e em Downloads, tem sha256 b3fc15ba0b22ae2e15e38b5ea1aa59e1356b168d866bba2a1516958a5c23f930, 329 paragrafos e 97 insercoes de figura sobre 84 arquivos; criado em 2026-09-02 e modificado em 2026-09-03
  - o sha256 transcrito 7ca7c89f52c1a4173ee404f1bc4059cabd564fddfb62129a6cd34789b86e4769 nao existe nas tres versoes do Drive nem nas 2 revisoes do arquivo; a revisao de 2026-08-22 devolve HTTP 403 ao download
  - o save BOLHA BTN 40 BB 55 posflop.hrcz tem 8 assentos com stacks de 16 a 55 bb, 18 jogadores fora da mesa e data de 2024-04-10; nao e o spot da Aula 1.2 e nao traz versao nem indicador de convergencia
  - nenhum par da Aula 1.2 e reproduzivel com as fontes disponiveis; build e e-Nash exigem nova captura no HRC e no GTO Wizard
  - o Drive tem 2125 HandsExport com 565.6 MB, 789 arquivos HH20 e 4069 resumos de torneio com 4054 ids
  - as maos amostradas trazem torneio, stacks por assento e blinds, e zero estrutura de premios e total de jogadores; iPoker e 888 usam formato que a contagem nao reconheceu
  - os resumos amostrados trazem prize pool, jogadores e a lista de colocacoes
  - cruzamento pelo nome -- 2 dos 789 torneios HH20 tem resumo; HandsExport usa numero local tourney_ e nao cruza pelo nome
  - inventario de discos pessoais retirado da secao 8 do registro de curadoria; nenhum marcador resta em arquivo versionado, e um teste cobre o repositorio inteiro
  - afirmacao anterior corrigida -- a remocao do script nao tinha tirado o inventario da arvore, que seguia no registro de curadoria
  - decisao delegada pelo Tier 0 -- historico nao reescrito; 10 commits desde c1905461 mudariam de SHA, caminhos pessoais aparecem em commits desde agosto, 16 branches remotos e 10 PRs abertos quebrariam, e o GitHub segue servindo objetos por SHA
nao_verificado:
  - cruzamento por conteudo dos HandsExport, com o id de torneio dentro das maos, contra os 4054 resumos; exige baixar 566 MB
  - formato de maos iPoker e 888
  - elegibilidade final do benchmark, que depende tambem da distribuicao de stacks do field em cada mao
  - caminhos do OneDrive e da pasta MonkerSolver citados em arquivos antigos do repositorio, fora do inventario de 2026-09-13
  - suite integral e CI remoto desta arvore; rodam no pre-push e no push
---

# Verificações de Drive, Aula 1.2 e hand histories, e a decisão sobre o histórico

Resposta ao pedido do Tier 0 de verificar os três itens que o
`registro-2026-09-13-pmev-contratos-baselines-composicao-e-skill` deixou sem verificar,
e de decidir, por delegação, a reescrita do histórico.

| Item | Resultado |
| :--- | :--- |
| Chamada real ao Google Drive | funciona |
| Reproduzir par da Aula 1.2 | impossível com as fontes atuais |
| Amostra elegível para benchmark | 2 torneios pelo nome; caminho para ampliar identificado |
| Reescrever o histórico | recusado, com o inventário retirado do HEAD |

## Aula 1.2

A versão transcrita em 2026-09-01 não existe mais em nenhum lugar acessível. O documento
atual foi recriado em 2026-09-02, com mais parágrafos e o mesmo número de figuras; isso
não prova que as capturas são as mesmas. O save HRC de 10,95 GB que a curadoria associava
ao spot é outro estado de torneio. Reproduzir um par exige resolver de novo o spot no HRC
e no GTO Wizard e capturar build e e-Nash, o que é trabalho manual no solver.

## Hand histories

O estado ICM de uma mão precisa de prêmios, field e colocação. As mãos têm a mesa, mas
não os prêmios; os resumos têm prêmios e colocações, mas cruzam com as mãos só por ID de
torneio. Pelo nome, cruzam 2 torneios. O próximo passo mensurável é ler o ID dentro dos
HandsExport e cruzar com os 4054 resumos.

## Histórico

Reescrever não apagaria nada do GitHub e quebraria referências, branches e PRs. O que
reduz a exposição foi feito: o inventário saiu do registro de curadoria, está preservado
em arquivo local ignorado pelo git, e um teste impede que volte a qualquer arquivo
versionado.
