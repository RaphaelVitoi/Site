---
id: registro-2026-09-09-publicacao-bancadas-pmev
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: Chat GPT-6 Astra <noreply@openai.com>
criado_em: '2026-09-09'
classes:
  - interno
  - auditoria
  - publicacao
caminhos:
  - frontend/src/lib/counterfactualExperiment.ts
  - frontend/src/lib/icmTransitionExperiment.ts
  - frontend/src/components/simulator/panels/CounterfactualPanel.tsx
  - frontend/src/components/simulator/panels/IcmTransitionPanel.tsx
  - frontend/src/components/simulator/panels/EquityCalculator.tsx
  - frontend/src/app/api/sota/counterfactual/route.ts
  - frontend/src/app/api/sota/icm-transitions/route.ts
config_medida:
  baseline_head: 6fa707ac921d72f6a263e9b22c9d6f86138ebbd1
  branch: master
  finalidade: Fechar as duas primeiras bancadas antes de expandir defesa bilateral e continuacoes estrategicas
  assinatura: Chat GPT-6 Astra <noreply@openai.com>, Tier 1
verificado:
  - Diff limitado aos dois adaptadores, dois endpoints, dois paineis, integracao, testes e registros.
  - Frontend com 366 testes em 44 suites aprovados na bateria desta publicacao.
  - npm audit sem vulnerabilidades; Actionlint aprovado com expansao de arquivos pelo PowerShell.
  - Portao de registros aprovado para os 13 arquivos iniciais preparados.
nao_verificado:
  - Validacao empirica da PMev, solve de equilibrio e estimativa da capacidade futura de pressao.
  - Certificacao de CWV ou acessibilidade integral da interface.
referencias_nao_resolviveis: []
---

# Publicacao das bancadas experimentais PMev

Este fechamento foi autorizado por Raphael apos avaliar o marco funcional:
hipoteses explicitas, transicoes conservativas, valuation ICM do field completo,
comparacao de acoes, redistribuicao entre jogadores e exportacao rastreavel.
O proximo incremento, defesa bilateral e politicas futuras, fica separado.

## Registros conceituais e tecnicos

- [Primeiro adaptador de contrafactuais](REGISTRO-2026-09-09-adaptador-contrafactual-pmev.md).
- [Transicoes ICM, redistribuicao e fonte original](REGISTRO-2026-09-09-transicoes-icm-redistribuicao.md).

Os registros acima descrevem suas etapas anteriores ao commit. Este arquivo
documenta o fechamento posterior; a autoria e o status experimental das fontes
permanecem separados da assinatura de engenharia.

## Protocolo

Baseline local e remoto conferidos; escopo preparado explicitamente; bateria
integrada executada uma unica vez por tentativa, sem suites Python concorrentes.
O comando Actionlint foi executado sobre a lista versionada expandida em
PowerShell, equivalente ao script npm cuja substituicao de shell nao funciona
no cmd do Windows. Nao foram alterados hooks nem usadas dispensas.

## Continuacao

## Resultado dos controles de publicacao

`npm run sota:full` terminou com exit 0: Ruff, Pyright, ESLint, Markdown,
TypeScript, 366 testes frontend (44 suites) e 1077 testes Python aprovados.
Um teste Python foi pulado por ausencia de arvore declarada superada; nao conta
como aprovacao. Nenhuma falha de teste permaneceu e nao houve exclusao residual.

O gate de cinco fases foi executado em Windows PowerShell 5.1 e terminou com
exit 0, **FRAGIL**, zero erros e dois avisos: CWV e acessibilidade nao medidos
por ausencia de CDP. Nao se declara certificacao dessas duas superficies.
Os quatro aceites de CVEs Python ja existentes permanecem aceites, nao correcoes.

Commit e push devem executar novamente seus hooks reais, sem bypass. O recibo
local posterior com SHA, resultado do push e comparacao remota fica em
`reports/cwv/FECHAMENTO-PMEV-2026-09-09.txt`; esse diretorio e excluido do Git por
politica existente para evidencias locais. Este registro e os dois relatorios
conceituais sao versionados e consultaveis no repositorio.

## Proximo incremento

Partir deste marco para conectar defesa bilateral ao ledger existente. Preservar
risco do agressor e do defensor separadamente. As oportunidades futuras precisam
de politicas, acoes e horizonte explicitos; nenhum bonus arbitrario de pressao
deve ser somado ao ICM. O nome definitivo de Dissipacao do Valuation permanece
com Raphael. Field completo continua independente da mesa 9p PokerStars/8p GG.

**Auditor e implementador:** Chat GPT-6 Astra <noreply@openai.com>, Tier 1.
