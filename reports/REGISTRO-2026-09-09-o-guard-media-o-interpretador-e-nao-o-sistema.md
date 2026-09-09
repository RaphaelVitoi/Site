---
id: registro-2026-09-09-o-guard-media-o-interpretador-e-nao-o-sistema
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: "Claude Opus 5 [Tier 1.B] -- sessao claude-opus5-site-2026-09-08-aberturas"
criado_em: 2026-09-09T03:05:00-03:00
atualizado_em: 2026-09-09T03:05:00-03:00
classes: [interno, medido, ci, testes]
caminhos:
  - scripts/ops/Invoke-AgentCalibrationQuantitativeSupport.ps1
  - tests/test_sentinela_delecoes.py
supersede: null
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  so: Windows
  python: '3.14.6'
verificado:
  - >-
    ESTADO DO CI NO COMMIT ae003287: job de frontend SUCCESS -- typecheck e
    build verdes. Passo do Ruff aprovado. A unica falha restante e o passo de
    pytest, com tres casos: test_sentinela_delecoes.py::test_captura_a_delecao_e_nomeia_suspeitos
    e dois de test_timesfm_agent_calibration.py.
  - >-
    OS TRES JA TINHAM skipif, E ELE MEDIA A COISA ERRADA: a condicao era
    `shutil.which("pwsh") is None` (ou PWSH is None). Os runners Ubuntu do
    GitHub TEM pwsh instalado, entao o skip nunca disparava e os testes rodavam
    e falhavam. O guard media a presenca do INTERPRETADOR quando a dependencia
    real e o SISTEMA OPERACIONAL.
  - >-
    CAUSA DOS DOIS CASOS DE TIMESFM -- BUG REAL, NAO INCOMPATIBILIDADE INERENTE:
    Invoke-AgentCalibrationQuantitativeSupport.ps1 resolvia o Python apenas por
    `.venv\\Scripts\\python.exe` (linhas 269 e 364), caminho que so existe no
    Windows. Em Linux o venv e `.venv/bin/python`, entao o `throw` disparava e o
    script saia com codigo 1.
  - >-
    O REPOSITORIO JA TINHA A SOLUCAO: scripts/ops/cwv_gate.ps1:811-821 resolve o
    Python testando o caminho Windows, depois o POSIX, e por fim Get-Command. A
    correcao reaproveita esse padrao em vez de inventar outro.
  - >-
    CAUSA DO SENTINELA -- DEPENDENCIA REAL: ele enumera processos por
    Get-Process e correlaciona delta de CPU para nomear suspeitos. E
    comportamento especifico do Windows, e nao ha correcao a fazer: o skip por
    plataforma e o registro honesto de cobertura perdida.
  - >-
    AST do PowerShell sem erro de parse apos a mudanca; BOM UTF-8 unico
    conferido nos bytes. ruff check e ruff format limpos no teste alterado.
  - >-
    SUITE COMPLETA COM AS DUAS MUDANCAS: 1030 passed, 1 skipped, zero warnings.
nao_verificado:
  - >-
    Nao executei os dois testes de TimesFM em Linux. A correcao e do caminho que
    o log do CI apontou, e a prova de que ela resolve so vem no proximo push.
  - >-
    ACHADO NAO TRATADO, e ele importa:
    test_new_agent_calibration_daily_evidence_includes_timesfm FALHA quando
    rodado ISOLADAMENTE e PASSA na suite completa. Confirmei que a falha isolada
    e PRE-EXISTENTE -- reproduz com a minha alteracao guardada em stash --, logo
    nao foi introduzida aqui. O erro e UnicodeDecodeError com byte 0xa0 na
    SAIDA do script (o .ps1 em si e UTF-8 valido, conferido nos bytes). Isso
    indica dependencia de ordem ou de estado entre testes, que nao foi
    investigada.
  - >-
    Nao verifiquei se outros testes da suite tem o mesmo guard mal calibrado
    (skipif por pwsh quando a dependencia e Windows). Ha pelo menos
    test_agent_calibration_feedback.py com a mesma forma, e ele nao apareceu
    entre as falhas do CI -- o que sugere que ali o script FUNCIONA em Linux,
    mas isso nao foi medido.
revisoes_de_ancora:
  - registro: registro-2026-09-08-forense-das-delecoes-e-o-sentinela
    caminhos:
      - tests/test_sentinela_delecoes.py
    parecer: >-
      Aquele registro criou o sentinela e este teste, e o argumento central dele
      e que o instrumento tem de FALHAR RUIDOSAMENTE em vez de em silencio -- foi
      por isso que a versao com FileSystemWatcher foi descartada. A mudanca aqui
      e da mesma familia: o teste passa a declarar que nao cobre nada fora do
      Windows, em vez de falhar por um motivo que nao e defeito do sentinela. A
      asercao e o corpo do teste nao mudam; muda a condicao de execucao, e a
      cobertura perdida fica dita na mensagem do skip.
  - registro: handoff-2026-09-08-forense-fechada-e-o-sentinela-em-vigilia
    caminhos:
      - tests/test_sentinela_delecoes.py
    parecer: >-
      Aquele handoff entrega o sentinela em vigilia e adverte que instrumento so
      se declara funcionando depois de provado por isca. A mudanca nao afeta o
      sentinela nem a prova por isca no Windows, que segue rodando; ela apenas
      impede que o teste rode onde o mecanismo medido nao existe.
referencias_nao_resolviveis: []
---

# O guard media o interpretador, e a dependencia era o sistema

## Onde o CI parou

Com o Ruff, o WASM e o Prisma resolvidos, o job de frontend ficou **SUCCESS** e
sobrou uma unica falha: o passo de pytest, com tres casos.

Os tres **ja tinham `skipif`**. E a condicao era:

```python
@pytest.mark.skipif(shutil.which("pwsh") is None, reason="pwsh is required ...")
```

Os runners Ubuntu do GitHub **tem pwsh instalado**. O skip nunca disparava, os
testes rodavam e falhavam. O guard media a presenca do **interpretador** quando
a dependencia real era o **sistema operacional** -- e mediu isso por seis dias
sem que ninguem visse, porque o passo de pytest nunca chegava a rodar.

## Duas causas diferentes sob a mesma aparencia

**TimesFM: bug real.** O
`Invoke-AgentCalibrationQuantitativeSupport.ps1` resolvia o Python so por
`.venv\Scripts\python.exe`, nas linhas 269 e 364. Em Linux o venv e
`.venv/bin/python`, entao o `throw` disparava e o script saia com 1.

Isso **contraria** a secao 8.3 do CLAUDE.md, que declara `pwsh 7+` como runtime
padrao -- e pwsh 7 e cross-platform. Nao era incompatibilidade inerente: era
caminho hardcoded.

E o repositorio **ja tinha a solucao**, em `cwv_gate.ps1:811-821`: testa o
caminho Windows, depois o POSIX, e por fim `Get-Command`. A correcao reaproveita
esse padrao. Reinventa-lo teria criado a segunda forma de resolver a mesma
coisa, que e o defeito que a secao 3 do CLAUDE.md chama de fonte paralela.

**Sentinela: dependencia real.** Ele enumera processos por `Get-Process` e
correlaciona delta de CPU para nomear suspeitos. Nao ha correcao a fazer -- o
mecanismo medido nao existe fora do Windows. O `skipif` por plataforma e o
registro honesto de **cobertura perdida**, com o motivo escrito na mensagem.

## Um achado que fica aberto, e nao mascarado

`test_new_agent_calibration_daily_evidence_includes_timesfm` **falha quando
rodado sozinho e passa na suite completa**.

Verifiquei se a culpa era minha pelo discriminante limpo: guardei a alteracao em
`git stash` e rodei o teste isolado de novo. **Falhou igual** -- a falha isolada
e pre-existente.

O erro e `UnicodeDecodeError` com byte `0xa0` na **saida** do script; o `.ps1`
em si e UTF-8 valido, conferido nos bytes. Isso aponta para dependencia de
ordem ou de estado entre testes: algo que a suite prepara e a execucao isolada
nao tem.

Nao investiguei, e por isso esta em `nao_verificado` em vez de numa frase
tranquilizadora. Um teste que so passa acompanhado nao esta provando o que
parece provar.

**Assinatura:** `Claude Opus 5 [Tier 1.B]`
**Proposito:** corrigir a resolucao de Python do script de suporte quantitativo
para funcionar fora do Windows, e fazer o guard do sentinela medir a dependencia
real; deixando declarado o teste com dependencia de ordem.
