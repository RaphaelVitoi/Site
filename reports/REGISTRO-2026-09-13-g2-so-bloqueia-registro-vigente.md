---
id: registro-2026-09-13-g2-so-bloqueia-registro-vigente
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: '2026-09-13T15:39:59-03:00'
atualizado_em: '2026-09-13T15:39:59-03:00'
classes: [interno, medido, portao, governanca]
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  so: Windows
  python: '3.14.6'
  congelada_em: '2026-09-13'
caminhos:
  - scripts/ops/record_gate.py
  - scripts/ops/record_index.py
  - tests/test_record_index.py
verificado:
  - decisao do Tier 0 em 2026-09-13 -- opcao 1, so registro VIGENTE bloqueia pela ancora interna
  - antes da mudanca, dois commits do dia exigiram 34 revisoes de ancora; 1 delas sobre registro VIGENTE
  - cwv_gate.ps1 tinha 19 ancoras, nenhuma VIGENTE; record_gate.py tinha 11, uma VIGENTE
  - a regra de estado saiu de construir para avaliar_registro e estado_de, usadas pelo indice e pelo portao
  - regra antiga do HEAD contra regra nova sobre a mesma arvore -- 233 registros, 0 divergencias de estado ou motivo
  - neste commit o portao acusou 1 bloqueio VIGENTE e 12 avisos, contra 13 bloqueios pela regra antiga
  - tests/test_record_index.py, test_record_gate_merge.py e test_portao_le_o_indice.py -- 52 aprovados
  - casos novos cobrem SUSPEITO por commit inexistente, SUSPEITO por classe interna sem commit e OBSOLETO por supersede
  - o registro de teste que exige bloqueio passou a ser VIGENTE de fato; antes era SUSPEITO e bloqueava assim mesmo
  - ruff check e ruff format sem achados nos tres arquivos
nao_verificado:
  - registro interno sem commit declarado nasce SUSPEITO, e suas ancoras passam a so avisar; o efeito na disciplina de declarar commit ainda nao foi observado
  - a suite integral nesta arvore -- roda no pre-push por suite_verde.py
pendencias_resolvidas:
  - pend-2026-09-13-custo-da-revisao-de-ancora
revisoes_de_ancora:
  - registro: taxonomia-canonica-de-documentacao-e-relatorios
    caminhos: [scripts/ops/record_gate.py, scripts/ops/record_index.py]
    parecer: A taxonomia descreve onde cada artefato mora. O G2 muda quem bloqueia, nao move artefato de pasta nem altera o formato do registro.
---

# G2 so bloqueia registro VIGENTE

A ancora interna exigia revisar todo registro que declarasse um caminho tocado
pelo commit, inclusive os que o indice ja classifica como SUSPEITO ou OBSOLETO.
O custo crescia com o historico e o parecer virava texto repetido.

| Estado do registro | Antes | Depois |
| :--- | :--- | :--- |
| VIGENTE | bloqueia | bloqueia |
| SUSPEITO | bloqueia | aviso com o motivo |
| OBSOLETO | bloqueia | aviso |

Quem quiser que a ancora de um registro continue bloqueando precisa mante-lo
VIGENTE, em particular declarando `commit:` quando a classe for `interno`.
