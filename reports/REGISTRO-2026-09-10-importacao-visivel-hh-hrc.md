---
id: registro-2026-09-10-importacao-visivel-hh-hrc
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: Chat GPT-6 Astra <noreply@openai.com>
criado_em: '2026-09-10'
config_medida:
  baseline_head: 4715d51067a7239e746d4c3c842f1759e49dfeca
  branch: master
  raiz: C:/Users/rapha/.gemini/Site
classes: [interno, medido, contrato, simulador]
caminhos:
  - frontend/src/components/simulator/panels/EquityCalculator.tsx
  - frontend/src/components/simulator/panels/TournamentTableImport.tsx
  - frontend/src/lib/hrcArchive.ts
  - frontend/src/tests/simulator/hrcArchive.test.ts
  - frontend/src/tests/simulator/equityCalculatorLedger.test.tsx
  - frontend/package.json
  - package-lock.json
revisoes_de_ancora:
  - registro: registro-2026-09-09-mtt-contexto-completo-hh-hrc
    caminhos:
      - frontend/src/components/simulator/panels/EquityCalculator.tsx
      - frontend/src/components/simulator/panels/TournamentTableImport.tsx
    parecer: Importacao HH e HRC ganha entradas separadas e painel no topo. Arquivos hr cz e hr cv agora fornecem settings.json diretamente; normalizacao e validacao existentes continuam ativas, sem importar estrategias como resultados.
  - registro: registro-2026-09-10-fichas-posicoes-premiacao
    caminhos:
      - frontend/src/components/simulator/panels/EquityCalculator.tsx
      - frontend/src/tests/simulator/equityCalculatorLedger.test.tsx
    parecer: Controles de importacao expostos sem alterar as regras de conservacao; arquivo real possui sete stacks externos fracionarios e nao recebe arredondamento silencioso.
verificado:
  - 15 testes focais em tres suites aprovados; TypeScript e ESLint aprovados.
  - Arquivo real de 93236877 bytes lido pelo novo extrator, com seis stacks de mesa e sete externos, treeconfig e engine presentes.
  - npm install auditou 1208 pacotes e informou zero vulnerabilidades.
  - git diff --check sem erros.
nao_verificado:
  - Execucao da arvore binaria e estrategias salvas do solver.
  - Importacao nativa no aplicativo HRC, responsividade completa, commit e push desta fase.
referencias_nao_resolviveis: []
---

# Entradas explicitas para HH e cenarios HRC

Raphael nao encontrava a importacao de HRC nem de HH. Existia um unico botao
generico, e o painel aparecia depois dos controles do torneio. Agora ha dois
botoes no cabecalho, Importar HH e Importar cenario HRC. O painel aparece logo
abaixo e permite escolher arquivo ou colar texto. Fechar importacao retorna a
mesa sem aplicar o rascunho.

HH/JSON: ate 5 MB. Saves .hrcz/.hrcv: ate 256 MB, procurando settings.json na
raiz com limite descomprimido de 5 MB. A leitura usa fflate 0.8.3 e nao inicia
descompressao de gametree.dat, nodedata.dat ou outros binarios. Nenhum conteudo
e extraido para disco ou enviado a terceiros pelo leitor.

Dependencia consultada na documentacao primaria:
https://github.com/101arrowz/fflate

Arquivo real verificado:
C:/Users/rapha/OneDrive/PANTS/Pantoja/Semi FT e Mid Resteal/SemiFT Resteal BU 30 BB 15.hrcz

Esse e o arquivo apontado pelo registro anterior; nao se afirma que foi
reencontrado no Google Drive nesta rodada. O extrator novo le sua configuracao
com treeconfig e engine. Os sete stacks externos sao fracionarios: a preview
preserva esses dados, mas a bancada fisica exige reconciliacao antes de aplicar.

Preservar treeconfig significa conservar as configuracoes da arvore para
reexportacao. Nao significa carregar gametree.dat como arvore navegavel nem
reproduzir os EVs e estrategias do solve salvo. Essa distincao aparece na UI.

Assinatura: Chat GPT-6 Astra <noreply@openai.com>.
