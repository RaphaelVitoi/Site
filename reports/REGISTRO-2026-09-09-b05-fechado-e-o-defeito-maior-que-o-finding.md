---
id: registro-2026-09-09-b05-fechado-e-o-defeito-maior-que-o-finding
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: "Claude Opus 5 [Tier 1.B] -- sessao claude-opus5-site-2026-09-08-aberturas"
criado_em: 2026-09-09T05:45:00-03:00
atualizado_em: 2026-09-09T05:45:00-03:00
classes: [interno, medido, api, validacao]
caminhos:
  - core/perspective_schemas.py
  - tests/test_perspective_tree_limites.py
supersede: null
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  so: Windows
  python: '3.14.6'
verificado:
  - >-
    MARCO: o CI fechou VERDE nos quatro jobs em a96842fe -- Python 3.12, Python
    3.13, Frontend TypeScript & Next.js Build e Security Headers & Architecture
    Quality Gate. Era 8 de 8 execucoes falhando quando esta sessao comecou.
  - >-
    B05 ERA MAIOR QUE O FINDING. A validacao de 2026-09-07 registrou que
    valuation_stack=-1 era aceito em PerspectiveTreeRequest e rejeitado em
    PerspectiveCalculationRequest. Comparando os dois schemas campo a campo,
    SEIS campos existem nos dois e tinham limite apenas no pontual --
    valuation_stack (ge=0.01), realization_factor (ge=0.1 le=2.5), edge_base
    (ge=0.0), aggression_factor (ge=0.0), base_rio (ge=0.0) e
    loss_aversion_base (ge=1.0).
  - >-
    TESTE ANTES DA CORRECAO: 8 failed, 11 passed. As 8 falhas sao exatamente os
    8 casos de limite ausente na arvore.
  - >-
    AS CONTRAPROVAS PASSARAM DESDE O INICIO: cada limite propagado tem um teste
    espelho que verifica se PerspectiveCalculationRequest de fato rejeita o
    mesmo valor. Sem essa contraprova, um limite INVENTADO por mim passaria por
    "propagado" sem ter origem no schema irmao.
  - >-
    DEPOIS DA CORRECAO: 19 passed no guard novo; 90 passed nos testes que tocam
    perspective, tree ou pmev, com zero regressao; suite completa em 1056
    passed, 1 skipped, zero warnings. Eram 1036 antes desta etapa.
  - >-
    ruff check e ruff format limpos em core/perspective_schemas.py e no teste.
nao_verificado:
  - >-
    Nao verifiquei se algum CONSUMIDOR da arvore dependia de aceitar valores
    fora dos limites -- por exemplo um teste de frontend ou um worker que
    enviasse realization_factor acima de 2.5. A suite Python inteira passa, mas
    ela nao cobre chamadas vindas do frontend.
  - >-
    Nao propaguei limites para fgs_health nem rp_opp, e a razao esta no corpo:
    eles nao tem schema irmao de onde derivar.
  - >-
    Nao fechei os demais achados do Astra: B06, B07, B08, B09 e F06 seguem
    abertos, e F03 e F05 seguem nao conclusivos.
revisoes_de_ancora:
  - registro: validacao-2026-09-07-findings-do-astra-contra-o-codigo
    caminhos:
      - core/perspective_schemas.py
    parecer: >-
      Aquela validacao e a spec desta correcao: ela classificou o B05 como
      PARCIAL e registrou, com precisao, que valuation_stack=-1 continuava
      aceito em PerspectiveTreeRequest enquanto era rejeitado em
      PerspectiveCalculationRequest. Este commit fecha o achado e vai alem do
      que ele descrevia -- a nao propagacao alcancava SEIS campos, nao um. O
      registro nao perde validade: ele estava certo e era conservador. A linha
      da tabela que marca B05 como PARCIAL passa a ter desfecho.
  - registro: registro-2026-09-03-procedencia-de-solve-e-o-portao-de-reprodutibilidade
    caminhos:
      - core/perspective_schemas.py
    parecer: >-
      Aquele registro ancora este arquivo pela classe SolverProvenance e pelo
      portao de reprodutibilidade -- build, e_nash, e_nash_unit, e o metodo
      esta_completa. NADA disso foi tocado: a mudanca ocorre inteiramente em
      PerspectiveTreeRequest, dezenas de linhas acima, e nao altera nenhum campo,
      docstring ou regra de procedencia. O achado segue valido.
  - registro: auditoria-2026-08-31-saneamento-linters-e-estabilizacao-core-e-api
    caminhos:
      - core/perspective_schemas.py
    parecer: >-
      Aquela auditoria ancora o arquivo pelo saneamento de linters. ruff check e
      ruff format seguem limpos neste arquivo apos a mudanca, conferido antes do
      commit. Nenhum import, tipo ou construto foi alterado -- apenas parametros
      de Field em um dos modelos.
  - registro: handoff-2026-08-31-saneamento-linters-e-estabilizacao-core-e-api
    caminhos:
      - core/perspective_schemas.py
    parecer: >-
      Mesmo objeto da auditoria correspondente: estabilizacao de core e api sob
      linters. A mudanca e de validacao de dominio em PerspectiveTreeRequest,
      nao de estrutura, e a suite completa passa em 1056 testes.
referencias_nao_resolviveis: []
---

# B05 fechado, e o defeito era maior que o finding

## O contexto: o CI ficou verde

Este registro sai no mesmo commit em que o CI fechou **verde nos quatro jobs**,
pela primeira vez desde 2026-09-08. Eram oito de oito execucoes falhando quando
a sessao comecou, por seis causas independentes. Isso importa aqui por um motivo
pratico: a secao "Restricoes globais" do plano exigia CI verde antes da Tarefa 9,
justamente para que uma correcao de produto pudesse ser avaliada sem ruido.

## O finding, e o que a medicao acrescentou

O `B05` do Astra -- P1, *"API de arvore aceita entrada impossivel"* -- foi
fechado **pela metade** em 2026-09-07: `fold_equity` ganhou limite, e a
validacao daquele dia registrou honestamente que `valuation_stack=-1` continuava
aceito em `PerspectiveTreeRequest`.

Ao ir fechar, comparei os dois schemas campo a campo. **Seis** campos existem nos
dois e tinham limite apenas no pontual:

| campo | `PerspectiveCalculationRequest` | `PerspectiveTreeRequest` (antes) |
| :--- | :--- | :--- |
| `valuation_stack` | `ge=0.01` | nenhum |
| `realization_factor` | `ge=0.1, le=2.5` | nenhum |
| `edge_base` | `ge=0.0` | nenhum |
| `aggression_factor` | `ge=0.0` | nenhum |
| `base_rio` | `ge=0.0` | nenhum |
| `loss_aversion_base` | `ge=1.0` | nenhum |

O finding apontava um; a nao propagacao alcancava seis. **Meia correcao e pior
que nenhuma porque parece feita** -- e este e o caso literal: quem lesse o
registro de 07/09 veria `fold_equity` corrigido e presumiria o resto.

## O que NAO foi inventado

Cada limite aplicado e **derivado do schema irmao**, um a um. Nenhum foi
arbitrado por mim -- e o guard prova isso de forma explicita.

Para cada caso propagado ha um teste espelho:

```python
def test_o_schema_pontual_rejeita_o_mesmo_valor(campo, valor):
    with pytest.raises(ValidationError):
        PerspectiveCalculationRequest.model_validate({"equity": 0.5, campo: valor})
```

Sem essa contraprova, um limite que eu tivesse **inventado** na arvore passaria
por "propagado" sem ter origem alguma. Ela transforma a afirmacao *"isto vem do
schema pontual"* de prosa em verificacao.

Ha tambem um teste de controle que valida o caso legitimo -- sem ele, um schema
que recusasse **tudo** passaria em todos os testes de rejeicao.

## Os dois campos que ficaram sem limite, de proposito

`fgs_health` e `rp_opp` existem **apenas** em `PerspectiveTreeRequest`. Nao ha
schema irmao de onde derivar teto ou piso, e atribuir um por suposicao seria
fabricar contrato -- exatamente o oposto do que esta correcao faz.

Eles seguem sem limite, e isso esta **declarado no codigo e fixado por teste**:

```python
def test_campos_sem_par_seguem_declarados_sem_limite():
    """Este teste NAO afirma que eles deveriam ser livres -- afirma que a
    decisao de nao lhes atribuir limite foi consciente."""
```

Se o dominio definir limites para eles, que venham de medicao, e o teste cai
junto. De proposito.

**Assinatura:** `Claude Opus 5 [Tier 1.B]`
**Proposito:** fechar o B05 propagando para a arvore os limites que o schema
pontual ja declarava, com contraprova de origem para cada um, e declarar os dois
campos que deliberadamente nao receberam limite.
