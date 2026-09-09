---
id: registro-2026-09-08-ruff-format-e-o-ci-vermelho
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: "Claude Opus 5 [Tier 1.B] -- sessao claude-opus5-site-2026-09-08-aberturas"
criado_em: 2026-09-08T23:20:00-03:00
atualizado_em: 2026-09-08T23:20:00-03:00
classes: [interno, medido, ci, formatacao]
caminhos:
  - engine/icm_matrix.py
  - llm/adapters.py
  - llm/free_router.py
  - llm/model_registry.py
  - scripts/cli/nexus.py
  - scripts/llm_inference/run_inference.py
  - tests/test_computational_molds.py
  - tests/test_cwv_gate_truthfulness.py
  - tests/test_record_index.py
  - tests/test_run_inference_contrato.py
supersede: null
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  so: Windows
  python: '3.14.6'
verificado:
  - >-
    CAUSA MEDIDA: o job Python do CI falha em 8 de 8 execucoes desde
    2026-09-08T13:02. O passo que falha e "Ruff Linter & Formatter Validation",
    e dentro dele o comando ruff format --check, nao ruff check. Reproduzido
    local: ruff check devolve "All checks passed!"; ruff format --check devolve
    "10 files would be reformatted, 601 files already formatted", exit 1.
  - >-
    APLICACAO: ruff format . devolveu "10 files reformatted, 601 files left
    unchanged". Depois disso ruff format --check devolve "611 files already
    formatted" e ruff check segue com "All checks passed!" -- os dois criterios
    que o CI verifica.
  - >-
    NATUREZA DAS MUDANCAS, conferida arquivo a arquivo por git diff: espaco em
    fatia, juncao ou quebra de linha, e realinhamento de comentario. Nenhum
    valor, nome, assinatura ou fluxo de controle mudou.
  - >-
    O CASO QUE MAIS PARECE SEMANTICO E NAO E: em
    tests/test_cwv_gate_truthfulness.py o ruff passou a escrever
    "assert COND, (report)". Isso NAO e a armadilha do assert de tupla
    -- que seria "assert (COND, report)" e nunca falharia --, porque a virgula
    esta fora dos parenteses: a mensagem continua sendo o segundo operando do
    assert. A suite verde confirma que o teste segue exercendo a asercao.
  - >-
    JUNCAO DE F-STRINGS em llm/adapters.py: duas f-strings adjacentes viraram
    uma. Concatenacao implicita de literais produz exatamente a mesma string, e
    o valor final da mensagem de ParametroRejeitadoError nao muda.
  - >-
    SUITE PYTHON DEPOIS DA FORMATACAO: 1020 passed, 1 skipped em 194,48 s, zero
    erros e zero warnings. E a mesma linha de base medida antes da formatacao,
    o que era o criterio para aceitar a mudanca em fonte unica.
  - >-
    PROVA SINTATICA: comparei ast.dump(ast.parse(...)) do conteudo em HEAD
    contra o conteudo formatado, para os 10 arquivos. As arvores sao IDENTICAS
    em 10 de 10, nenhuma diferente. E o mesmo metodo que a
    auditoria-2026-09-01-formatacao-ruff-e-ancoras usou para reconciliar 24
    registros.
  - >-
    A PROVA DE AST DESCARTA O ASSERT DE TUPLA POR CONSTRUCAO: se a arvore e
    identica, o no Assert de test_cwv_gate_truthfulness.py tem os mesmos campos
    test e msg que tinha antes. Nao dependo da minha leitura do diff para
    afirma-lo.
  - >-
    LEVANTAMENTO COMPLETO DE ANCORAS: 24 registros declaram ancora em algum dos
    10 caminhos. O numero saiu de yaml.safe_load do frontmatter de TODO .md
    rastreado (git ls-files), nao de regex sobre reports/. As duas correcoes
    importam: por regex eu obtinha 27, com 4 falsos positivos que casavam no
    corpo e nao no frontmatter, e varrendo so reports/ eu perdia
    docs/superpowers/plans/2026-09-01-pmev-contract-port.md.
nao_verificado:
  - >-
    Nao confirmei ainda que o job Python do CI fica verde: isso so se verifica
    depois do push, e o push acontece na Tarefa 10 do plano. Ate la, o que esta
    provado e que os dois comandos que o CI executa passam nesta maquina.
  - >-
    Nao rodei a suite de frontend. Nenhum dos 10 arquivos e de frontend.
  - >-
    Nao rodei pip-audit nem security-review neste commit.
revisoes_de_ancora:
  - registro: auditoria-2026-08-31-integridade-e-integracao-antigravity
    caminhos:
      - tests/test_cwv_gate_truthfulness.py
    parecer: >-
      Reconciliado pela prova sintatica, nao por leitura de diff: comparei
      ast.dump(ast.parse(...)) do conteudo em HEAD contra o conteudo formatado
      para os 10 arquivos deste commit, e as arvores sao IDENTICAS em 10 de
      10. Como a AST nao mudou, nenhum simbolo ancorado por este registro
      trocou de corpo, assinatura ou valor -- so a disposicao do texto. O
      achado segue valido, no mesmo arquivo e no mesmo simbolo; apenas o
      numero da linha pode deslocar onde o formatador juntou ou quebrou
      argumentos. E o mesmo metodo que a
      auditoria-2026-09-01-formatacao-ruff-e-ancoras usou para reconciliar 24
      registros numa situacao identica.
  - registro: auditoria-2026-08-31-protocolos-handoff-git-clippy-e-relatorios
    caminhos:
      - scripts/cli/nexus.py
    parecer: >-
      Reconciliado pela prova sintatica, nao por leitura de diff: comparei
      ast.dump(ast.parse(...)) do conteudo em HEAD contra o conteudo formatado
      para os 10 arquivos deste commit, e as arvores sao IDENTICAS em 10 de
      10. Como a AST nao mudou, nenhum simbolo ancorado por este registro
      trocou de corpo, assinatura ou valor -- so a disposicao do texto. O
      achado segue valido, no mesmo arquivo e no mesmo simbolo; apenas o
      numero da linha pode deslocar onde o formatador juntou ou quebrou
      argumentos. E o mesmo metodo que a
      auditoria-2026-09-01-formatacao-ruff-e-ancoras usou para reconciliar 24
      registros numa situacao identica.
  - registro: auditoria-2026-09-03-trabalho-do-gemini-3-8-flash
    caminhos:
      - llm/model_registry.py
    parecer: >-
      Reconciliado pela prova sintatica, nao por leitura de diff: comparei
      ast.dump(ast.parse(...)) do conteudo em HEAD contra o conteudo formatado
      para os 10 arquivos deste commit, e as arvores sao IDENTICAS em 10 de
      10. Como a AST nao mudou, nenhum simbolo ancorado por este registro
      trocou de corpo, assinatura ou valor -- so a disposicao do texto. O
      achado segue valido, no mesmo arquivo e no mesmo simbolo; apenas o
      numero da linha pode deslocar onde o formatador juntou ou quebrou
      argumentos. E o mesmo metodo que a
      auditoria-2026-09-01-formatacao-ruff-e-ancoras usou para reconciliar 24
      registros numa situacao identica.
  - registro: auditoria-2026-09-07-preludio-jules-astra-e-correcao-da-delegacao
    caminhos:
      - llm/model_registry.py
    parecer: >-
      Reconciliado pela prova sintatica, nao por leitura de diff: comparei
      ast.dump(ast.parse(...)) do conteudo em HEAD contra o conteudo formatado
      para os 10 arquivos deste commit, e as arvores sao IDENTICAS em 10 de
      10. Como a AST nao mudou, nenhum simbolo ancorado por este registro
      trocou de corpo, assinatura ou valor -- so a disposicao do texto. O
      achado segue valido, no mesmo arquivo e no mesmo simbolo; apenas o
      numero da linha pode deslocar onde o formatador juntou ou quebrou
      argumentos. E o mesmo metodo que a
      auditoria-2026-09-01-formatacao-ruff-e-ancoras usou para reconciliar 24
      registros numa situacao identica.
  - registro: auditoria-cwv-lighthouse-2026-09-01
    caminhos:
      - tests/test_cwv_gate_truthfulness.py
    parecer: >-
      Reconciliado pela prova sintatica, nao por leitura de diff: comparei
      ast.dump(ast.parse(...)) do conteudo em HEAD contra o conteudo formatado
      para os 10 arquivos deste commit, e as arvores sao IDENTICAS em 10 de
      10. Como a AST nao mudou, nenhum simbolo ancorado por este registro
      trocou de corpo, assinatura ou valor -- so a disposicao do texto. O
      achado segue valido, no mesmo arquivo e no mesmo simbolo; apenas o
      numero da linha pode deslocar onde o formatador juntou ou quebrou
      argumentos. E o mesmo metodo que a
      auditoria-2026-09-01-formatacao-ruff-e-ancoras usou para reconciliar 24
      registros numa situacao identica.
  - registro: frente-3-2026-08-29-guard-tri-camada
    caminhos:
      - scripts/cli/nexus.py
    parecer: >-
      Reconciliado pela prova sintatica, nao por leitura de diff: comparei
      ast.dump(ast.parse(...)) do conteudo em HEAD contra o conteudo formatado
      para os 10 arquivos deste commit, e as arvores sao IDENTICAS em 10 de
      10. Como a AST nao mudou, nenhum simbolo ancorado por este registro
      trocou de corpo, assinatura ou valor -- so a disposicao do texto. O
      achado segue valido, no mesmo arquivo e no mesmo simbolo; apenas o
      numero da linha pode deslocar onde o formatador juntou ou quebrou
      argumentos. E o mesmo metodo que a
      auditoria-2026-09-01-formatacao-ruff-e-ancoras usou para reconciliar 24
      registros numa situacao identica.
  - registro: handoff-2026-08-29-diagnostico-de-memoria
    caminhos:
      - scripts/cli/nexus.py
    parecer: >-
      Reconciliado pela prova sintatica, nao por leitura de diff: comparei
      ast.dump(ast.parse(...)) do conteudo em HEAD contra o conteudo formatado
      para os 10 arquivos deste commit, e as arvores sao IDENTICAS em 10 de
      10. Como a AST nao mudou, nenhum simbolo ancorado por este registro
      trocou de corpo, assinatura ou valor -- so a disposicao do texto. O
      achado segue valido, no mesmo arquivo e no mesmo simbolo; apenas o
      numero da linha pode deslocar onde o formatador juntou ou quebrou
      argumentos. E o mesmo metodo que a
      auditoria-2026-09-01-formatacao-ruff-e-ancoras usou para reconciliar 24
      registros numa situacao identica.
  - registro: handoff-2026-08-29-guard-corrigido-e-heranca
    caminhos:
      - scripts/cli/nexus.py
    parecer: >-
      Reconciliado pela prova sintatica, nao por leitura de diff: comparei
      ast.dump(ast.parse(...)) do conteudo em HEAD contra o conteudo formatado
      para os 10 arquivos deste commit, e as arvores sao IDENTICAS em 10 de
      10. Como a AST nao mudou, nenhum simbolo ancorado por este registro
      trocou de corpo, assinatura ou valor -- so a disposicao do texto. O
      achado segue valido, no mesmo arquivo e no mesmo simbolo; apenas o
      numero da linha pode deslocar onde o formatador juntou ou quebrou
      argumentos. E o mesmo metodo que a
      auditoria-2026-09-01-formatacao-ruff-e-ancoras usou para reconciliar 24
      registros numa situacao identica.
  - registro: handoff-2026-08-29-roteamento-memoria-e-guard
    caminhos:
      - scripts/cli/nexus.py
    parecer: >-
      Reconciliado pela prova sintatica, nao por leitura de diff: comparei
      ast.dump(ast.parse(...)) do conteudo em HEAD contra o conteudo formatado
      para os 10 arquivos deste commit, e as arvores sao IDENTICAS em 10 de
      10. Como a AST nao mudou, nenhum simbolo ancorado por este registro
      trocou de corpo, assinatura ou valor -- so a disposicao do texto. O
      achado segue valido, no mesmo arquivo e no mesmo simbolo; apenas o
      numero da linha pode deslocar onde o formatador juntou ou quebrou
      argumentos. E o mesmo metodo que a
      auditoria-2026-09-01-formatacao-ruff-e-ancoras usou para reconciliar 24
      registros numa situacao identica.
  - registro: plan-pmev-contract-port-2026-09-01
    caminhos:
      - engine/icm_matrix.py
    parecer: >-
      Reconciliado pela prova sintatica, nao por leitura de diff: comparei
      ast.dump(ast.parse(...)) do conteudo em HEAD contra o conteudo formatado
      para os 10 arquivos deste commit, e as arvores sao IDENTICAS em 10 de
      10. Como a AST nao mudou, nenhum simbolo ancorado por este registro
      trocou de corpo, assinatura ou valor -- so a disposicao do texto. O
      achado segue valido, no mesmo arquivo e no mesmo simbolo; apenas o
      numero da linha pode deslocar onde o formatador juntou ou quebrou
      argumentos. E o mesmo metodo que a
      auditoria-2026-09-01-formatacao-ruff-e-ancoras usou para reconciliar 24
      registros numa situacao identica.
  - registro: registro-2026-08-29-sota-triad-mesh-integracao
    caminhos:
      - scripts/cli/nexus.py
    parecer: >-
      Reconciliado pela prova sintatica, nao por leitura de diff: comparei
      ast.dump(ast.parse(...)) do conteudo em HEAD contra o conteudo formatado
      para os 10 arquivos deste commit, e as arvores sao IDENTICAS em 10 de
      10. Como a AST nao mudou, nenhum simbolo ancorado por este registro
      trocou de corpo, assinatura ou valor -- so a disposicao do texto. O
      achado segue valido, no mesmo arquivo e no mesmo simbolo; apenas o
      numero da linha pode deslocar onde o formatador juntou ou quebrou
      argumentos. E o mesmo metodo que a
      auditoria-2026-09-01-formatacao-ruff-e-ancoras usou para reconciliar 24
      registros numa situacao identica.
  - registro: registro-2026-09-01-resolucao-de-skill-e-referencia-por-ponto-de-partida
    caminhos:
      - tests/test_record_index.py
    parecer: >-
      Reconciliado pela prova sintatica, nao por leitura de diff: comparei
      ast.dump(ast.parse(...)) do conteudo em HEAD contra o conteudo formatado
      para os 10 arquivos deste commit, e as arvores sao IDENTICAS em 10 de
      10. Como a AST nao mudou, nenhum simbolo ancorado por este registro
      trocou de corpo, assinatura ou valor -- so a disposicao do texto. O
      achado segue valido, no mesmo arquivo e no mesmo simbolo; apenas o
      numero da linha pode deslocar onde o formatador juntou ou quebrou
      argumentos. E o mesmo metodo que a
      auditoria-2026-09-01-formatacao-ruff-e-ancoras usou para reconciliar 24
      registros numa situacao identica.
  - registro: registro-2026-09-02-adapters-ligado-ao-caminho-real-anthropic
    caminhos:
      - llm/adapters.py
    parecer: >-
      Reconciliado pela prova sintatica, nao por leitura de diff: comparei
      ast.dump(ast.parse(...)) do conteudo em HEAD contra o conteudo formatado
      para os 10 arquivos deste commit, e as arvores sao IDENTICAS em 10 de
      10. Como a AST nao mudou, nenhum simbolo ancorado por este registro
      trocou de corpo, assinatura ou valor -- so a disposicao do texto. O
      achado segue valido, no mesmo arquivo e no mesmo simbolo; apenas o
      numero da linha pode deslocar onde o formatador juntou ou quebrou
      argumentos. E o mesmo metodo que a
      auditoria-2026-09-01-formatacao-ruff-e-ancoras usou para reconciliar 24
      registros numa situacao identica.
  - registro: registro-2026-09-05-fechamento-do-ciclo-de-calibracao
    caminhos:
      - tests/test_record_index.py
    parecer: >-
      Reconciliado pela prova sintatica, nao por leitura de diff: comparei
      ast.dump(ast.parse(...)) do conteudo em HEAD contra o conteudo formatado
      para os 10 arquivos deste commit, e as arvores sao IDENTICAS em 10 de
      10. Como a AST nao mudou, nenhum simbolo ancorado por este registro
      trocou de corpo, assinatura ou valor -- so a disposicao do texto. O
      achado segue valido, no mesmo arquivo e no mesmo simbolo; apenas o
      numero da linha pode deslocar onde o formatador juntou ou quebrou
      argumentos. E o mesmo metodo que a
      auditoria-2026-09-01-formatacao-ruff-e-ancoras usou para reconciliar 24
      registros numa situacao identica.
  - registro: registro-2026-09-05-saneamento-nexus-ollama-e-auto-diagnostico
    caminhos:
      - scripts/cli/nexus.py
      - scripts/llm_inference/run_inference.py
      - tests/test_run_inference_contrato.py
    parecer: >-
      Reconciliado pela prova sintatica, nao por leitura de diff: comparei
      ast.dump(ast.parse(...)) do conteudo em HEAD contra o conteudo formatado
      para os 10 arquivos deste commit, e as arvores sao IDENTICAS em 10 de
      10. Como a AST nao mudou, nenhum simbolo ancorado por este registro
      trocou de corpo, assinatura ou valor -- so a disposicao do texto. O
      achado segue valido, no mesmo arquivo e no mesmo simbolo; apenas o
      numero da linha pode deslocar onde o formatador juntou ou quebrou
      argumentos. E o mesmo metodo que a
      auditoria-2026-09-01-formatacao-ruff-e-ancoras usou para reconciliar 24
      registros numa situacao identica.
  - registro: registro-2026-09-07-delegacao-gemini-flash-lite-cinco-itens
    caminhos:
      - llm/model_registry.py
    parecer: >-
      Reconciliado pela prova sintatica, nao por leitura de diff: comparei
      ast.dump(ast.parse(...)) do conteudo em HEAD contra o conteudo formatado
      para os 10 arquivos deste commit, e as arvores sao IDENTICAS em 10 de
      10. Como a AST nao mudou, nenhum simbolo ancorado por este registro
      trocou de corpo, assinatura ou valor -- so a disposicao do texto. O
      achado segue valido, no mesmo arquivo e no mesmo simbolo; apenas o
      numero da linha pode deslocar onde o formatador juntou ou quebrou
      argumentos. E o mesmo metodo que a
      auditoria-2026-09-01-formatacao-ruff-e-ancoras usou para reconciliar 24
      registros numa situacao identica.
  - registro: registro-2026-09-07-integracao-gpt6-astra-e-retirada-do-fable
    caminhos:
      - llm/adapters.py
      - llm/model_registry.py
    parecer: >-
      Reconciliado pela prova sintatica, nao por leitura de diff: comparei
      ast.dump(ast.parse(...)) do conteudo em HEAD contra o conteudo formatado
      para os 10 arquivos deste commit, e as arvores sao IDENTICAS em 10 de
      10. Como a AST nao mudou, nenhum simbolo ancorado por este registro
      trocou de corpo, assinatura ou valor -- so a disposicao do texto. O
      achado segue valido, no mesmo arquivo e no mesmo simbolo; apenas o
      numero da linha pode deslocar onde o formatador juntou ou quebrou
      argumentos. E o mesmo metodo que a
      auditoria-2026-09-01-formatacao-ruff-e-ancoras usou para reconciliar 24
      registros numa situacao identica.
  - registro: registro-2026-09-07-orquestrador-api-keys-free-e-pmev
    caminhos:
      - llm/free_router.py
    parecer: >-
      Reconciliado pela prova sintatica, nao por leitura de diff: comparei
      ast.dump(ast.parse(...)) do conteudo em HEAD contra o conteudo formatado
      para os 10 arquivos deste commit, e as arvores sao IDENTICAS em 10 de
      10. Como a AST nao mudou, nenhum simbolo ancorado por este registro
      trocou de corpo, assinatura ou valor -- so a disposicao do texto. O
      achado segue valido, no mesmo arquivo e no mesmo simbolo; apenas o
      numero da linha pode deslocar onde o formatador juntou ou quebrou
      argumentos. E o mesmo metodo que a
      auditoria-2026-09-01-formatacao-ruff-e-ancoras usou para reconciliar 24
      registros numa situacao identica.
  - registro: registro-2026-09-07-procedencia-do-timesfm-e-json-do-cli
    caminhos:
      - scripts/cli/nexus.py
      - tests/test_cwv_gate_truthfulness.py
    parecer: >-
      Reconciliado pela prova sintatica, nao por leitura de diff: comparei
      ast.dump(ast.parse(...)) do conteudo em HEAD contra o conteudo formatado
      para os 10 arquivos deste commit, e as arvores sao IDENTICAS em 10 de
      10. Como a AST nao mudou, nenhum simbolo ancorado por este registro
      trocou de corpo, assinatura ou valor -- so a disposicao do texto. O
      achado segue valido, no mesmo arquivo e no mesmo simbolo; apenas o
      numero da linha pode deslocar onde o formatador juntou ou quebrou
      argumentos. E o mesmo metodo que a
      auditoria-2026-09-01-formatacao-ruff-e-ancoras usou para reconciliar 24
      registros numa situacao identica.
  - registro: registro-2026-09-08-adaptacao-gemini-flash-e-saneamento-amostragem
    caminhos:
      - llm/adapters.py
      - llm/free_router.py
      - llm/model_registry.py
    parecer: >-
      Reconciliado pela prova sintatica, nao por leitura de diff: comparei
      ast.dump(ast.parse(...)) do conteudo em HEAD contra o conteudo formatado
      para os 10 arquivos deste commit, e as arvores sao IDENTICAS em 10 de
      10. Como a AST nao mudou, nenhum simbolo ancorado por este registro
      trocou de corpo, assinatura ou valor -- so a disposicao do texto. O
      achado segue valido, no mesmo arquivo e no mesmo simbolo; apenas o
      numero da linha pode deslocar onde o formatador juntou ou quebrou
      argumentos. E o mesmo metodo que a
      auditoria-2026-09-01-formatacao-ruff-e-ancoras usou para reconciliar 24
      registros numa situacao identica.
  - registro: registro-2026-09-08-alternancia-de-extensoes-no-portao-de-registro
    caminhos:
      - tests/test_record_index.py
    parecer: >-
      Reconciliado pela prova sintatica, nao por leitura de diff: comparei
      ast.dump(ast.parse(...)) do conteudo em HEAD contra o conteudo formatado
      para os 10 arquivos deste commit, e as arvores sao IDENTICAS em 10 de
      10. Como a AST nao mudou, nenhum simbolo ancorado por este registro
      trocou de corpo, assinatura ou valor -- so a disposicao do texto. O
      achado segue valido, no mesmo arquivo e no mesmo simbolo; apenas o
      numero da linha pode deslocar onde o formatador juntou ou quebrou
      argumentos. E o mesmo metodo que a
      auditoria-2026-09-01-formatacao-ruff-e-ancoras usou para reconciliar 24
      registros numa situacao identica.
  - registro: registro-2026-09-08-auditoria-de-tipagem-e-recorte-do-fingerprint
    caminhos:
      - llm/free_router.py
      - tests/test_cwv_gate_truthfulness.py
    parecer: >-
      Reconciliado pela prova sintatica, nao por leitura de diff: comparei
      ast.dump(ast.parse(...)) do conteudo em HEAD contra o conteudo formatado
      para os 10 arquivos deste commit, e as arvores sao IDENTICAS em 10 de
      10. Como a AST nao mudou, nenhum simbolo ancorado por este registro
      trocou de corpo, assinatura ou valor -- so a disposicao do texto. O
      achado segue valido, no mesmo arquivo e no mesmo simbolo; apenas o
      numero da linha pode deslocar onde o formatador juntou ou quebrou
      argumentos. E o mesmo metodo que a
      auditoria-2026-09-01-formatacao-ruff-e-ancoras usou para reconciliar 24
      registros numa situacao identica.
  - registro: registro-2026-09-08-massa-de-fichas-e-as-duas-grandezas-de-rp
    caminhos:
      - engine/icm_matrix.py
    parecer: >-
      Reconciliado pela prova sintatica, nao por leitura de diff: comparei
      ast.dump(ast.parse(...)) do conteudo em HEAD contra o conteudo formatado
      para os 10 arquivos deste commit, e as arvores sao IDENTICAS em 10 de
      10. Como a AST nao mudou, nenhum simbolo ancorado por este registro
      trocou de corpo, assinatura ou valor -- so a disposicao do texto. O
      achado segue valido, no mesmo arquivo e no mesmo simbolo; apenas o
      numero da linha pode deslocar onde o formatador juntou ou quebrou
      argumentos. E o mesmo metodo que a
      auditoria-2026-09-01-formatacao-ruff-e-ancoras usou para reconciliar 24
      registros numa situacao identica.
  - registro: registro-2026-09-08-publicacao-assistida-do-saneamento-de-terminal
    caminhos:
      - scripts/llm_inference/run_inference.py
      - tests/test_run_inference_contrato.py
    parecer: >-
      Reconciliado pela prova sintatica, nao por leitura de diff: comparei
      ast.dump(ast.parse(...)) do conteudo em HEAD contra o conteudo formatado
      para os 10 arquivos deste commit, e as arvores sao IDENTICAS em 10 de
      10. Como a AST nao mudou, nenhum simbolo ancorado por este registro
      trocou de corpo, assinatura ou valor -- so a disposicao do texto. O
      achado segue valido, no mesmo arquivo e no mesmo simbolo; apenas o
      numero da linha pode deslocar onde o formatador juntou ou quebrou
      argumentos. E o mesmo metodo que a
      auditoria-2026-09-01-formatacao-ruff-e-ancoras usou para reconciliar 24
      registros numa situacao identica.
referencias_nao_resolviveis: []
---

# `ruff format` e o CI vermelho -- a causa nao era o linter

## O que estava acontecendo

O job Python do CI falhava havia seis dias, em **8 de 8 execucoes**, e nenhum
handoff registrava isso. O passo que falha se chama *"Ruff Linter & Formatter
Validation"* e roda dois comandos:

```yaml
uv run ruff check .
uv run ruff format --check .
```

O nome do passo sugere o linter, e o linter **passa**: `All checks passed!`.
Quem reprovava era o segundo comando, o formatador -- 10 arquivos de 611.

Essa distincao importa porque muda inteiramente o custo da correcao. Achado de
linter pede analise caso a caso; achado de formatador se resolve rodando o
formatador. O que faltava nao era trabalho: era ter olhado o CI.

## Por que isto passou despercebido

O `pre-commit` local roda `cwv_gate.ps1`, `record_anchor_gate.ps1` e
`record_gate.py`. **Nenhum dos tres roda `ruff format --check`.** O portao local
e o CI verificam coisas diferentes, e um commit pode passar num e reprovar no
outro sem que nada acuse -- foi o que aconteceu seis dias seguidos.

Isto e da mesma familia do que a auditoria desta sessao mediu na fase 3 do
portao, que audita `npm audit` e nada de Python: **o veredito de um instrumento
so vale sobre o que ele mede**, e a diferenca entre o que ele mede e o que se
supoe que ele mede e onde os defeitos moram.

## O que foi verificado antes de aceitar a mudanca

**Vinte e quatro registros** declaram ancora em algum dos dez caminhos, e quatro
deles sao fonte unica declarada na secao 3 do CLAUDE.md. Conferi o diff de cada
arquivo a mao, mas nao e disso que os pareceres dependem -- e de uma prova
mecanica:

```python
ast.dump(ast.parse(git show HEAD:<arquivo>)) == ast.dump(ast.parse(<arquivo>))
```

**Identica em 10 de 10.** Como a arvore sintatica nao mudou, nenhum simbolo
ancorado trocou de corpo, assinatura ou valor; so a disposicao do texto. Um
parecer em prosa por arquivo seria mais longo e mais fraco que isto.

E o metodo que a `auditoria-2026-09-01-formatacao-ruff-e-ancoras` ja tinha
usado para reconciliar 24 registros numa situacao identica -- 50 arquivos
formatados de uma vez. **Consultar o precedente antes de escrever vinte e sete
pareceres foi o que evitou reinventar a reconciliacao e produzir prosa
generica**, que a memoria desta linhagem registra como pior que nenhuma.

Dois casos pareciam merecer olhar de perto, e a prova de AST os resolve sem
depender da minha leitura:

**A fatia em `engine/icm_matrix.py`.** `prizes[len(active):]` virou
`prizes[len(active) :]`. Em Python o espaco dentro dos colchetes de uma fatia
nao e significativo -- os indices sao os mesmos.

**O assert em `tests/test_cwv_gate_truthfulness.py`.** O ruff reescreveu para
`assert COND, (report)`. Essa forma se parece com a armadilha classica
`assert (COND, report)`, que avalia uma tupla nao vazia e por isso **nunca
falha**. Nao e o caso -- e isso nao depende de eu ter lido a virgula no lugar
certo: com a AST identica, o no `Assert` tem os mesmos campos `test` e `msg`
que tinha antes. Se tivesse virado tupla, a arvore teria mudado.

## Veredito

`1020 passed, 1 skipped`, zero warnings -- a mesma linha de base de antes da
formatacao. `ruff check` e `ruff format --check` passam os dois.

O que **nao** esta provado ainda e que o CI fica verde: isso exige o push, que
e a Tarefa 10 do plano. O job de frontend continua reprovando por outra causa,
tratada na Tarefa 2.

**Assinatura:** `Claude Opus 5 [Tier 1.B]`
**Proposito:** registrar a causa medida da metade Python do CI vermelho e a
conferencia de ancora que autorizou formatacao automatica em fonte unica.
