---
id: registro-2026-09-09-publicacao-curadoria-pmev
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
  - reports/curation/pmev-2026-09-09/
  - scripts/validation/
config_medida:
  baseline_head: 8f73c75b5c3ac3e1706f752aae499ae17a386335
  branch: master
  assinatura: Chat GPT-6 Astra <noreply@openai.com>
  papel: Tier 1, auditor e implementador sob autorizacao de Raphael Vitoi
verificado:
  - Curadoria conferida novamente contra 14 arquivos originais e 13 extracoes.
  - Probe HRC nativo repetido com cinco casos positivos e controle negativo de ante.
  - Formato Ruff aplicado ao verificador, com igualdade de AST antes e depois.
nao_verificado:
  - Causa ou autoria do desaparecimento local de INVENTARIO_FERRAMENTAS.md.
  - Validacao empirica da PMev, solve HRC ou integracao das candidatas aos motores.
referencias_nao_resolviveis: []
---

# Publicacao da curadoria e da validacao nativa HRC

Este registro complementa os relatos de etapa, que documentavam corretamente a
ausencia de commit/push antes da autorizacao posterior de Raphael. O escopo inclui
curadoria rastreavel, experimentos sinteticos, verificadores e leitura nativa HRC.
As fontes mantem sua autoria; a assinatura de Astra identifica curadoria, codigo
e auditoria, sem transferir a autoria da teoria.

## Ocorrencias do pre-commit

O gate identificou falta de formatacao Ruff em `verify.py`. A correcao preservou
a AST e o verificador voltou a aprovar: 14 originais, 13 textos, 14 candidatas,
41 referencias, 118 entradas de assets, tres experimentos e quatro controles
negativos. O complemento bibliografico permanece em manifesto proprio.

Durante a suite, apareceu uma exclusao local nao preparada de
`.claude/RELATORIOS/INVENTARIO_FERRAMENTAS.md`, ausente do estado inicial.
O teste de resolucao do manifesto a detectou. O arquivo foi recuperado de HEAD,
sem diferenca residual. A causa nao foi determinada; a investigacao permanece
delegada, conforme orientacao de Raphael. A exclusao nao integra a publicacao.

`git diff --cached --check` sinalizou espacos finais no texto extraido S07.
Eles pertencem ao Markdown fornecido, inclusive quebras de linha; foram mantidos
para preservar a extracao e seus hashes, sem normalizacao editorial da fonte.

## Validacao para publicacao

- `npm run sota:full`: lint Python, Pyright, ESLint, Markdown, TypeScript e
  40 suites frontend / 339 testes aprovados. A primeira etapa Python terminou
  com 1072 aprovados, cinco falhas e um teste pulado; nao e registrada como verde.
- Apos corrigir a formatacao e recuperar o documento, os dois modulos afetados
  foram repetidos: **29 aprovados**, incluindo as cinco falhas anteriores.
  O teste pulado da suite completa exige uma arvore superada inexistente.
- Ruff do verificador e Markdown repetidos apos os ajustes: exit 0.
- `npm audit --audit-level=low`: zero vulnerabilidades. Actionlint: exit 0,
  executado com a lista versionada expandida pelo PowerShell; o script npm
  usa uma substituicao de shell que nao e suportada pelo cmd do Windows.
- Gate de qualidade inicial: bloqueio por Ruff, ja corrigido. CWV e A11y
  sem medicao por ausencia de CDP; dois avisos, dentro do teto operacional.
  Quatro CVEs Python constam como aceites existentes do projeto, nao como
  vulnerabilidades resolvidas. A publicacao depende dos hooks reais, sem bypass.

## Continuacao

Implementar o primeiro adaptador experimental a partir dos dois registros de
curadoria: contrafactuais e contabilidade comum de fold/call/raise, defesa
bilateral e sensibilidade marginal. Manter hipoteses e defaults identificados,
field MTT completo e analise de mesa limitada a 9p PokerStars ou 8p GGPoker,
incluindo mesas quebradas. Resultados sinteticos sao moldes funcionais.

**Assinatura:** Chat GPT-6 Astra <noreply@openai.com>, Tier 1, auditor e implementador.
