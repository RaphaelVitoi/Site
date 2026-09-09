---
id: registro-2026-09-09-o-portao-local-passa-a-checar-o-que-o-ci-checa
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: "Claude Opus 5 [Tier 1.B] -- sessao claude-opus5-site-2026-09-08-aberturas"
criado_em: 2026-09-09T02:35:00-03:00
atualizado_em: 2026-09-09T02:35:00-03:00
classes: [interno, medido, portao, ci]
caminhos:
  - scripts/ops/cwv_gate.ps1
  - tests/test_cwv_gate_ruff_format.py
  - tests/test_cwv_gate_cobertura_cve.py
supersede: null
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  so: Windows
  python: '3.14.6'
verificado:
  - >-
    A LACUNA: o pre-commit executa cwv_gate.ps1, record_anchor_gate.ps1 e
    record_gate.py. Nenhum dos tres executava ruff format --check, que o CI
    executa. O portao local e o CI verificavam coisas diferentes.
  - >-
    A LACUNA MORDEU QUEM A DOCUMENTOU: no commit 87dc1f27 desta mesma sessao eu
    corrigi os 10 arquivos que mantinham o CI vermelho e escrevi, no registro,
    que o pre-commit nao checava formatacao. Em seguida criei os quatro testes
    novos em tests/test_cwv_gate_cobertura_cve.py, nao rodei o formatador, e o
    CI reprovou de novo pelo motivo identico -- "1 file would be reformatted,
    611 files already formatted".
  - >-
    PRIMEIRA VERSAO DA CORRECAO ESTAVA QUEBRADA, e a isca provou: com o arquivo
    mal formatado em stage, a saida trazia "RuffFormat | 1 | 0 | FAIL" e
    "Total de Erros: 0". A tabela da fase 5 apenas IMPRIME; quem bloqueia e o
    Add-QualityFinding, que eu nao havia escrito.
  - >-
    SEGUNDA ISCA, DEPOIS DO FINDING: "RuffFormat | 1 | 0 | FAIL",
    "- fora do formato do ruff: tests/__isca_fmt.py" e "Total de Erros: 1", com
    o componente repository.ruff-format nomeando o arquivo. A isca foi removida
    e o stage restaurado.
  - >-
    ERRO DE VARIAVEL PEGO ANTES DE COMMITAR: escrevi a verificacao contra
    $stagedPaths, que NAO EXISTE no script -- grep mostrou a variavel aparecendo
    unicamente na linha que eu acabara de criar. A variavel real e $staged
    (cwv_gate.ps1:891). Sem essa conferencia, o laco iteraria sobre vazio e a
    verificacao nunca acusaria nada, parecendo instalada.
  - >-
    A VERIFICACAO SE LIMITA AO STAGE, por $staged. Varrer o repositorio inteiro
    reprovaria por divida de formatacao alheia ao proprio diff, que e o defeito
    que a auditoria-2026-09-01-formatacao-ruff-e-ancoras corrigiu.
  - >-
    AST do PowerShell sem erro de parse; BOM UTF-8 unico conferido nos bytes.
  - >-
    SUITE: 1030 passed, 1 skipped, zero warnings. Eram 1027 antes; os 3 novos
    sao a guarda desta verificacao.
  - >-
    ESTADO DO CI NO PUSH ANTERIOR (c310f25c): o job de frontend passou a
    SUCCESS -- typecheck e build verdes depois da correcao do Prisma. O job
    Python reprovou no Ruff, e a causa foi este defeito meu.
nao_verificado:
  - >-
    Nao medi quanto tempo a verificacao acrescenta ao pre-commit. Ela roda um
    processo por arquivo .py em stage, o que e barato para commits pequenos e
    pode nao ser para commits grandes.
  - >-
    Nao verifiquei o comportamento quando o .venv esta ausente: o codigo cai
    para `python` do PATH, mas esse caminho nao foi exercido.
  - >-
    Nao confirmei ainda que o job Python do CI fica verde: exige o push. Restam
    tres falhas de pytest ja medidas e nao tratadas aqui --
    test_sentinela_delecoes e dois casos de test_timesfm_agent_calibration --,
    de dependencia de Windows num runner Ubuntu.
revisoes_de_ancora:
  - registro: registro-2026-09-03-cobertura-cve-e-a-fronteira-do-submodulo
    caminhos:
      - scripts/ops/cwv_gate.ps1
      - tests/test_cwv_gate_cobertura_cve.py
    parecer: >-
      Aquele registro ancora a fase 3 e o arquivo de teste dela. A fase 3 nao
      foi tocada: a verificacao nova esta na fase 5, de higiene. No arquivo de
      teste, a mudanca e apenas a formatacao aplicada pelo ruff aos casos que
      esta sessao acrescentou; os sete casos originais seguem intactos e a suite
      esta verde.
  - registro: registro-2026-09-01-bateria-substituta-de-compatibilidade-5-1
    caminhos:
      - scripts/ops/cwv_gate.ps1
    parecer: >-
      O codigo novo e PowerShell dentro do arquivo que aquela bateria protege.
      Construtos usados: @(), Where-Object, Join-Path, Test-Path, foreach, +=,
      -join e $LASTEXITCODE. Nenhum operador exclusivo do 7. ParseFile sem erro,
      BOM unico conferido nos bytes.
  - registro: auditoria-2026-08-31-integridade-e-integracao-antigravity
    caminhos:
      - scripts/ops/cwv_gate.ps1
    parecer: >-
      Aquela auditoria ancora o portao pela integridade das cinco fases. A
      mudanca acrescenta uma regra DENTRO da fase 5 ja existente, com teto zero,
      seguindo a forma das quatro que ja estavam la; nenhuma outra fase e
      tocada.
  - registro: auditoria-cwv-lighthouse-2026-09-01
    caminhos:
      - scripts/ops/cwv_gate.ps1
    parecer: >-
      Aquela auditoria ancora o portao pelo CWV e pelo Lighthouse. Nada desse
      caminho foi tocado: a mudanca esta inteiramente na fase 5.
  - registro: handoff-2026-08-29-auditoria-integridade-repositorio
    caminhos:
      - scripts/ops/cwv_gate.ps1
    parecer: >-
      Aquele handoff ancora o portao pela auditoria de integridade. A mudanca e
      aditiva: acrescenta verificacao, nao remove nem afrouxa nenhuma.
  - registro: plan-dependency-boundary-reconciliation-2026-09-01
    caminhos:
      - scripts/ops/cwv_gate.ps1
    parecer: >-
      Aquele plano ancora o portao pela fronteira de dependencias. Nada de
      dependencia foi tocado; a mudanca e de higiene de formatacao.
  - registro: registro-2026-09-01-fronteira-http-e-portao-independente-de-perfil
    caminhos:
      - scripts/ops/cwv_gate.ps1
    parecer: >-
      Aquele registro trata da fronteira HTTP e da independencia de perfil. A
      verificacao nova nao faz rede: invoca o ruff local sobre arquivos em
      stage.
  - registro: registro-2026-09-01-merge-da-fusao-e-autonomia-de-portao
    caminhos:
      - scripts/ops/cwv_gate.ps1
    parecer: >-
      Aquele registro trata da vaga de warning que a autonomia exigia. A regra
      nova gera ERRO, nao warning, e portanto nao consome nenhuma das duas
      vagas.
  - registro: registro-2026-09-04-higienizacao-memoria-e-harmonizacao-fractal
    caminhos:
      - scripts/ops/cwv_gate.ps1
    parecer: >-
      Aquele relatorio ancora o portao no contexto de higienizacao. A regra nova
      e literalmente de higiene, entra na fase que leva esse nome e amplia o que
      ela cobre.
  - registro: relatorio-fusao-cerebro-claude-quality-gate-2026-09-01
    caminhos:
      - scripts/ops/cwv_gate.ps1
    parecer: >-
      Aquele relatorio ancora o portao como produto da fusao. As cinco fases e
      seus vereditos permanecem; a fase 5 ganha uma regra ao lado das que ja
      tinha.
  - registro: auditoria-2026-09-08-o-que-esta-em-aberto-na-malha
    caminhos:
      - scripts/ops/cwv_gate.ps1
    parecer: >-
      Aquela auditoria ancora o portao e ja registrava que o veredito de um
      instrumento so vale sobre o que ele mede. Esta mudanca e uma aplicacao
      direta disso: o portao local passa a medir tambem o criterio de
      formatacao que o CI mede.
  - registro: plano-frentes-abertas-2026-09-08
    caminhos:
      - scripts/ops/cwv_gate.ps1
    parecer: >-
      O plano ancora o portao nas Tarefas 3 e 4, ja executadas. Esta mudanca NAO
      estava no plano: nasceu de um defeito que eu mesmo introduzi ao executa-lo.
      O plano nao perde validade -- ele nao previa esta regra, e nada do que ele
      previa foi desfeito.
  - registro: registro-2026-09-08-a-porta-que-responde-e-a-porta-que-mede
    caminhos:
      - scripts/ops/cwv_gate.ps1
    parecer: >-
      Aquele registro alterou o handshake CDP, no inicio do arquivo. Esta
      mudanca esta na fase 5, e as duas nao se tocam.
  - registro: registro-2026-09-08-a-fase-3-passa-a-ver-python
    caminhos:
      - scripts/ops/cwv_gate.ps1
      - tests/test_cwv_gate_cobertura_cve.py
    parecer: >-
      Aquele registro, imediatamente anterior, acrescentou a auditoria Python a
      fase 3 e os quatro testes ao arquivo de cobertura. Esta mudanca opera na
      fase 5 e nao toca a fase 3; no arquivo de teste, ela apenas aplica aos
      quatro casos novos a formatacao que eu deveria ter aplicado la -- as
      asercoes sao as mesmas e os 11 casos seguem passando.
referencias_nao_resolviveis: []
---

# O portao local passa a checar o que o CI checa

## A lacuna, e como ela mordeu quem a documentou

O `pre-commit` executa `cwv_gate.ps1`, `record_anchor_gate.ps1` e
`record_gate.py`. **Nenhum dos tres executava `ruff format --check`**, que o CI
executa. Portao local e CI verificavam coisas diferentes, e um commit podia
passar num e reprovar no outro sem que nada acusasse. Foi assim que o job
Python ficou vermelho por **seis dias, em 8 de 8 execucoes**, sem aparecer em
handoff algum.

No commit `87dc1f27` desta mesma sessao eu corrigi aquilo e **escrevi no
registro** que o pre-commit nao checava formatacao. Duas tarefas depois,
acrescentei quatro testes a `tests/test_cwv_gate_cobertura_cve.py`, nao rodei o
formatador, commitei -- e o CI reprovou de novo, pelo motivo identico.

Uma lacuna que eu conhecia, tinha acabado de documentar, e ainda assim me pegou.
E a diferenca entre **anotar** um defeito e **instrumentar** contra ele.

## Duas versoes, e por que a primeira era pior que nada

A primeira implementacao imprimia na tabela e nao bloqueava:

```
RuffFormat                 | 1          | 0        | FAIL
• Total de Erros:    0 (Teto Maximo Permitido: 0)
```

A tabela da fase 5 **apenas imprime**; quem bloqueia e o `Add-QualityFinding`,
que eu nao havia escrito. O resultado seria um verificador que mostra `FAIL` e
deixa passar -- pior que nenhum, porque parece proteger.

Com o finding:

```
RuffFormat                 | 1          | 0        | FAIL
   - fora do formato do ruff: tests/__isca_fmt.py
• Total de Erros:    1
[1] ERROR -> repository.ruff-format | 1 arquivo(s) .py em stage fora do formato do ruff
```

**A isca e o que separa as duas versoes.** Sem ela, eu teria commitado a
primeira achando que estava instalada.

## Um segundo erro, pego antes de commitar

Escrevi o laco contra `$stagedPaths`. Essa variavel **nao existe** no portao --
o grep a mostrava aparecendo unicamente na linha que eu acabara de criar. A
variavel real e `$staged`, em `cwv_gate.ps1:891`.

Sem essa conferencia, o laco iteraria sobre vazio: a verificacao estaria
"instalada", nunca acusaria nada, e passaria por funcionando. E a mesma classe
de falha silenciosa que o sentinela de delecoes ja tinha exibido nesta casa, e
o motivo pelo qual a prova por isca nao e opcional.

## O que a verificacao NAO faz

Ela olha **somente o que esta em stage**, por `$staged`. Varrer o repositorio
inteiro reprovaria por divida de formatacao alheia ao proprio diff -- que e
exatamente o defeito que a `auditoria-2026-09-01-formatacao-ruff-e-ancoras`
corrigiu quando formatou 50 arquivos de uma vez. Nao se reintroduz.

## Estado do CI

O push anterior deixou o **job de frontend em SUCCESS**: typecheck e build
verdes depois da correcao do Prisma. O job Python reprovou no Ruff, e a causa
era este defeito meu.

Restam tres falhas de pytest ja medidas e **nao tratadas aqui**:
`test_sentinela_delecoes` e dois casos de `test_timesfm_agent_calibration`,
todas de dependencia de Windows num runner Ubuntu. Elas tem `skipif` -- mas por
`pwsh` ausente do PATH, e os runners Ubuntu **tem** pwsh. O guard mede a
presenca do interpretador quando a dependencia real e o sistema operacional.

**Assinatura:** `Claude Opus 5 [Tier 1.B]`
**Proposito:** fazer o portao local verificar o criterio de formatacao que o CI
verifica, com finding que bloqueia e prova por isca; e registrar os dois erros
que a implementacao passou antes de funcionar.
