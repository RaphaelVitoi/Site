---
id: validacao-2026-09-13-o-all-do-pmev-postflop-matrix
tipo: validacao
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: '2026-09-13T14:54:13-03:00'
atualizado_em: '2026-09-13T14:54:13-03:00'
classes: [interno, medido, correcao]
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  so: Windows
  python: '3.14.6'
  git: 2.55.0.windows.5
  congelada_em: '2026-09-13'
caminhos:
  - engine/pmev_postflop_matrix.py
verificado:
  - no commit c1905461 o __all__ exportava dois nomes que o modulo nao define -- simulate_postflop_matrix_aula_1_2 e compute_multivariate_hypergeometric_bunching
  - import estrela do modulo naquele commit falhava -- conferido carregando a versao do HEAD isolada
  - a correcao ficou sem commit na IDE depois da sessao do Gemini 3.8 Flash, sem sessao ativa segundo o Tier 0
  - a correcao define os dois nomes como aliases das funcoes existentes e ordena o __all__
  - com a correcao nenhum nome do __all__ falta no modulo
  - tests/test_pmev_compositional.py -- 12 aprovados
  - ruff check e ruff format sem achados no arquivo
  - nenhum consumidor dos nomes antigos fora do proprio modulo -- git grep no HEAD
nao_verificado:
  - se compute_multivariate_hypergeometric_bunching deveria ser multivariado de fato; o alias aponta para o fator escalar existente
revisoes_de_ancora:
  - registro: auditoria-2026-09-13-rearquitetura-computacional-pmev
    caminhos: [engine/pmev_postflop_matrix.py]
    parecer: Correcao de exportacao. Nenhuma funcao, constante ou resultado medido por aquela auditoria mudou.
  - registro: handoff-2026-09-13-rearquitetura-computacional-pmev
    caminhos: [engine/pmev_postflop_matrix.py]
    parecer: Completa o trabalho que o handoff entregou. O commit publicado deixou o __all__ inconsistente, e esta e a correcao que a propria sessao escreveu.
  - registro: registro-2026-09-13-rearquitetura-computacional-pmev
    caminhos: [engine/pmev_postflop_matrix.py]
    parecer: Mesma API medida no registro, agora importavel por inteiro. Nenhum valor numerico foi tocado.
---

# O `__all__` do `pmev_postflop_matrix`

O commit `c1905461` publicou um `__all__` com dois nomes que o modulo nao define.
A correcao existia na arvore de trabalho, sem commit, deixada pela sessao do
Gemini 3.8 Flash. Foi revisada, medida e commitada por arbitragem do Tier 0, com
a autoria do codigo preservada no campo de autor.
