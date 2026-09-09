---
id: registro-2026-09-08-a-fase-3-passa-a-ver-python
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: "Claude Opus 5 [Tier 1.B] -- sessao claude-opus5-site-2026-09-08-aberturas"
criado_em: 2026-09-09T00:40:00-03:00
atualizado_em: 2026-09-09T00:40:00-03:00
classes: [interno, medido, seguranca, portao]
caminhos:
  - scripts/ops/cwv_gate.ps1
  - data/python_cve_acceptances.json
  - tests/test_cwv_gate_cobertura_cve.py
supersede: null
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  so: Windows
  python: '3.14.6'
verificado:
  - >-
    LACUNA MEDIDA: grep por pip-audit, pip_audit, requirements.txt e osv em
    scripts/ops/cwv_gate.ps1 devolvia ZERO ocorrencias. A fase 3 executava
    npm audit --json e nada alem disso.
  - >-
    O QUE PASSAVA POR ELA: pip_audit -r requirements.txt devolve 4
    vulnerabilidades em chromadb 1.5.9 -- PYSEC-2026-311, CVE-2026-45830,
    CVE-2026-45831 e CVE-2026-45833 --, todas com fix_versions vazio.
  - >-
    FORMATO DO pip_audit CONFERIDO ANTES DE ESCREVER CODIGO CONTRA ELE: a saida
    --format json tem chaves de topo dependencies e fixes; cada dependencia traz
    name, version e vulns[], e cada vuln traz id e fix_versions. Medido em 128
    dependencias.
  - >-
    LADO POSITIVO DO ACEITE: com os quatro IDs declarados, o portao imprime
    PY_CVE_ABERTAS 0 cves [PASS], PY_CVE_AUDIT_EXECUTADO sim [PASS] e
    PY_CVE_ACEITAS 4 aceites.
  - >-
    PROVA NEGATIVA EXECUTADA: removi PYSEC-2026-311 do arquivo de aceites e
    rodei o portao de novo. Resultado: PY_CVE_ABERTAS 1 cves [FAIL], Total de
    Erros 2, e o finding nomeia exatamente "chromadb|1.5.9|PYSEC-2026-311". O
    arquivo foi restaurado em seguida a partir da copia em %TEMP%.
  - >-
    TESTES: os quatro casos novos em tests/test_cwv_gate_cobertura_cve.py foram
    rodados ANTES da implementacao -- 4 failed, 7 passed -- e depois: 11 passed.
  - >-
    AST DO POWERSHELL: ParseFile sobre cwv_gate.ps1 nao devolve erro. O arquivo
    permanece UTF-8 com BOM unico, conferido nos bytes.
  - >-
    SUITE PYTHON: 1027 passed, 1 skipped, zero warnings. Eram 1020 antes desta
    etapa; os 7 novos sao 3 da guarda de porta CDP e 4 desta guarda de cobertura
    Python.
nao_verificado:
  - >-
    Nao verifiquei o comportamento do bloco quando pip_audit esta ausente do
    ambiente. O caminho de erro existe e foi lido, mas nao foi exercido: eu
    teria de desinstalar o pip_audit do venv para provoca-lo, e isso quebraria
    o proprio ambiente da sessao. O teste test_audit_python_falha_fechado cobre
    a PRESENCA do mecanismo no script, nao a sua execucao.
  - >-
    Nao auditei uv.lock contra a OSV pelos pares nome==versao, como a secao 2 do
    CLAUDE.md descreve para aquele arquivo. Esta fase cobre requirements.txt.
  - >-
    O Dependabot do GitHub reporta 3 vulnerabilidades no repositorio -- 1 high e
    2 moderate -- que nem npm audit nem pip-audit acusam. E uma TERCEIRA fonte,
    e ela nao foi investigada nesta etapa.
  - >-
    Nao medi o custo em tempo que a auditoria Python acrescenta ao pre-commit.
revisoes_de_ancora:
  - registro: auditoria-2026-09-08-o-que-esta-em-aberto-na-malha
    caminhos:
      - scripts/ops/cwv_gate.ps1
    parecer: >-
      Aquela auditoria e a spec desta mudanca: a secao 1 dela mede a lacuna
      (grep com zero ocorrencias), a secao 1.1 estabelece que as quatro CVEs sao
      reais, nao alcancaveis aqui e sem correcao, e conclui que a saida que sobra
      e aditiva. Este commit executa exatamente isso. O achado nao perde
      validade -- ganha desfecho.
  - registro: plano-frentes-abertas-2026-09-08
    caminhos:
      - scripts/ops/cwv_gate.ps1
    parecer: >-
      O plano ancora o portao para descrever a Tarefa 4, e os oito passos foram
      seguidos, inclusive o passo 7, que exige a prova NEGATIVA. Uma divergencia
      do plano fica registrada: ele supunha o formato do JSON do pip_audit, e eu
      o medi antes de escrever codigo contra ele -- a suposicao estava certa,
      mas a verificacao nao era dispensavel.
  - registro: registro-2026-09-03-cobertura-cve-e-a-fronteira-do-submodulo
    caminhos:
      - scripts/ops/cwv_gate.ps1
      - tests/test_cwv_gate_cobertura_cve.py
    parecer: >-
      Aquele registro e o ancora mais proximo desta mudanca: ele estabeleceu a
      cobertura npm da fase 3, enumerando lockfiles por git ls-files, e a linha
      de cobertura declarada CVE_MANIFESTOS_AUDITADOS. Nada disso foi tocado --
      a enumeracao npm, os contadores e o fallback para a raiz permanecem
      identicos. A auditoria Python entra AO LADO, com metrica propria
      (PY_CVE_ABERTAS) e linha de execucao propria (PY_CVE_AUDIT_EXECUTADO),
      seguindo o mesmo principio que aquele registro fixou: zero por ausencia de
      medicao nao e resultado de seguranca. Quanto ao arquivo de teste, os sete
      casos que ele criou permanecem intactos e passando -- conferido, 4 failed
      e 7 passed antes da implementacao, 11 passed depois; os quatro novos sao
      acrescentados ao fim, sob cabecalho proprio, sem editar os existentes.
  - registro: registro-2026-09-01-bateria-substituta-de-compatibilidade-5-1
    caminhos:
      - scripts/ops/cwv_gate.ps1
    parecer: >-
      O codigo novo e PowerShell dentro do arquivo que aquela bateria protege.
      Construtos usados: Test-Path, Get-Content, ConvertFrom-Json, Join-Path,
      @(), foreach, += em array, -notcontains, -join, Substring, IndexOf e
      interpolacao. Nenhum operador exclusivo do 7 -- sem ??, ?., &&, ternario
      ou -Parallel. O ParseFile nao acusa erro, o BOM segue unico, e a propria
      bateria roda no commit.
  - registro: auditoria-2026-08-31-integridade-e-integracao-antigravity
    caminhos:
      - scripts/ops/cwv_gate.ps1
    parecer: >-
      Aquela auditoria ancora o portao pela integridade das cinco fases. A
      estrutura das fases nao muda: a auditoria Python entra dentro da fase 3
      ja existente, e nenhuma outra fase teve regra, limite ou veredito
      alterado.
  - registro: auditoria-cwv-lighthouse-2026-09-01
    caminhos:
      - scripts/ops/cwv_gate.ps1
    parecer: >-
      Aquela auditoria ancora o portao pelo CWV e pelo artefato Lighthouse.
      Nada do caminho de CWV, Lighthouse ou fingerprint foi tocado por esta
      mudanca, que ocorre inteiramente na fase 3.
  - registro: handoff-2026-08-29-auditoria-integridade-repositorio
    caminhos:
      - scripts/ops/cwv_gate.ps1
    parecer: >-
      Aquele handoff ancora o portao pela auditoria de integridade. A mudanca e
      aditiva na fase de seguranca e nao remove nem afrouxa verificacao alguma:
      acrescenta uma metrica com teto zero e uma linha de execucao que falha
      fechada.
  - registro: plan-dependency-boundary-reconciliation-2026-09-01
    caminhos:
      - scripts/ops/cwv_gate.ps1
    parecer: >-
      Aquele plano ancora o portao pela fronteira de dependencias, e esta
      mudanca o AFETA de forma favoravel: a fronteira auditada deixa de ser so
      a npm e passa a incluir a declaracao Python, que era justamente o lado
      que ninguem media. A enumeracao npm e a regra do submodulo permanecem
      intactas.
  - registro: registro-2026-09-01-fronteira-http-e-portao-independente-de-perfil
    caminhos:
      - scripts/ops/cwv_gate.ps1
    parecer: >-
      Aquele registro trata da fronteira HTTP e da independencia de perfil do
      portao. A mudanca nao toca handshake nem perfil; ela ocorre na fase 3, e o
      unico processo externo que invoca e o pip_audit local.
  - registro: registro-2026-09-01-merge-da-fusao-e-autonomia-de-portao
    caminhos:
      - scripts/ops/cwv_gate.ps1
    parecer: >-
      Aquele registro trata da vaga de warning que a autonomia exigia. Esta
      mudanca nao gera warning: ela gera ERRO quando a CVE nao esta aceita, e
      nada quando esta. O teto de dois warnings permanece intocado.
  - registro: registro-2026-09-04-higienizacao-memoria-e-harmonizacao-fractal
    caminhos:
      - scripts/ops/cwv_gate.ps1
    parecer: >-
      Aquele relatorio ancora o portao no contexto de higienizacao e
      resiliencia. A mudanca e aditiva e reversivel, e amplia o que o portao
      mede sem remover nada.
  - registro: relatorio-fusao-cerebro-claude-quality-gate-2026-09-01
    caminhos:
      - scripts/ops/cwv_gate.ps1
    parecer: >-
      Aquele relatorio ancora o portao como produto da fusao. As cinco fases,
      seus nomes e seus vereditos permanecem; a fase 3 ganha uma metrica ao lado
      das tres que ja tinha.
  - registro: registro-2026-09-08-a-porta-que-responde-e-a-porta-que-mede
    caminhos:
      - scripts/ops/cwv_gate.ps1
    parecer: >-
      Aquele registro, desta mesma sessao, alterou o handshake CDP no inicio do
      arquivo. Esta mudanca ocorre na fase 3, centenas de linhas abaixo, e as
      duas nao se tocam: a selecao de porta nao le nada da fase de seguranca, e
      a auditoria Python nao le nada do CDP.
referencias_nao_resolviveis: []
---

# A fase 3 passa a ver Python

## A lacuna

`scripts/ops/cwv_gate.ps1` executava `npm audit --json` e **nada alem disso**.
Grep por `pip-audit`, `pip_audit`, `requirements.txt` e `osv` naquele arquivo:
zero ocorrencias.

Consequencia: quando o portao imprimia CVE zerado, ele queria dizer **zero CVEs
npm**. Quatro CVEs abertas em `chromadb 1.5.9` atravessaram todo commit sem que
nada acusasse.

O portao ja tinha a frase certa escrita, sobre o npm:

> *"Zero por ausencia de medicao nao e resultado de seguranca."*

Ele dizia isso do npm e cometia o mesmo erro com o Python, um andar acima.

**A regra existia e nao tinha executor.** A secao 2 do CLAUDE.md determina
`pip_audit -r requirements.txt`; nenhum hook, gate ou tarefa o rodava. E o
proprio criterio da secao 4 da raiz -- *se ninguem consome, e descuido ou
entropia* -- aplicado a uma regra de governanca.

## Por que aceite, e nao supressao

As quatro CVEs nao tem para onde ir: `1.5.9` e a ultima versao no PyPI, e o
proprio `pip-audit` devolve `fix_versions` vazio nas quatro. O pacote e
consumido de verdade -- `memory_rag.py:208` e `scripts/utils/ingest_rag.py:27`.

Atualizar, remover e ignorar estao os tres fechados. Sem um mecanismo de aceite,
a unica forma de commitar seria **desligar a verificacao** -- e ai ela nao teria
servido para nada.

O repositorio ja resolvera esse problema uma vez, em
`data/a11y_manual_review_baselines.json`, que vincula cada aprovacao a regra,
aos alvos e ao SHA-256 da origem. `data/python_cve_acceptances.json` copia esse
molde: o aceite amarra **pacote, versao e ID**, e traz vetor, alcance medido,
consumo real e autoridade.

Amarrar a versao nao e zelo: um aceite solto por ID sobreviveria a um upgrade
que reintroduzisse o problema noutra versao, e ninguem perceberia.

## A prova que importava era a negativa

O lado positivo prova pouco -- um aceite que aceita tudo tambem passa:

```
PY_CVE_ABERTAS             | 0 cves     | <= 0     | [PASS]
PY_CVE_AUDIT_EXECUTADO     | sim        | sim      | [PASS]
PY_CVE_ACEITAS             | 4 aceites  | -        | INFO
```

Removendo **um** ID do arquivo de aceites e rodando de novo:

```
PY_CVE_ABERTAS             | 1 cves     | <= 0     | [FAIL]
Total de Erros:    2
[2] ERROR -> security.python.aberta | CVE Python sem aceite: chromadb|1.5.9|PYSEC-2026-311
```

Ele nomeia exatamente o ID retirado. O arquivo foi restaurado em seguida.

## Falha fechada, pelo mesmo motivo que a fase npm

Se o `pip_audit` nao rodar -- ausente, JSON malformado, excecao --, isso e
**ERRO**, nao zero. A linha `PY_CVE_AUDIT_EXECUTADO` declara o fato, e o
finding `security.python.execucao` bloqueia. E a mesma correcao que a fase npm
recebeu em 2026-08-22, quando se descobriu que ela falhava aberta.

## Um cuidado de metodo

O plano supunha o formato do JSON do `pip_audit`. **Medi antes de escrever
codigo contra ele**: chaves de topo `dependencies` e `fixes`, cada dependencia
com `name`, `version` e `vulns[]`, cada vuln com `id` e `fix_versions`, em 128
dependencias. A suposicao estava certa -- e a verificacao nao era dispensavel
por isso.

## Uma terceira fonte de CVE, ainda nao investigada

O push desta sessao trouxe do GitHub:

> `GitHub found 3 vulnerabilities on RaphaelVitoi/Site's default branch (1 high, 2 moderate)`

Nem `npm audit` (0) nem `pip-audit` (4, todas de chromadb) reportam isso. O
Dependabot ve algo que as duas nao veem. Fica declarado como frente aberta,
nao investigada aqui.

**Assinatura:** `Claude Opus 5 [Tier 1.B]`
**Proposito:** fechar a lacuna de cobertura Python da fase 3 sem suprimir
achado, com aceite vinculado a pacote e versao e falha fechada.
