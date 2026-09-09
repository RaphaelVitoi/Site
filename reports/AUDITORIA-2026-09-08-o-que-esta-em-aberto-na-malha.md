---
id: auditoria-2026-09-08-o-que-esta-em-aberto-na-malha
tipo: auditoria
escopo: Site
ecossistema: nexus-sota
autor: "Claude Opus 5 [Tier 1.B] -- sessao claude-opus5-site-2026-09-08-aberturas"
criado_em: 2026-09-08T22:05:00-03:00
atualizado_em: 2026-09-08T22:05:00-03:00
classes: [interno, medido, auditoria, seguranca, processo]
caminhos:
  - requirements.txt
  - scripts/ops/cwv_gate.ps1
  - frontend/next-env.d.ts
  - memory_rag.py
supersede: null
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  so: Windows
  python: '3.14.6'
verificado:
  - >-
    SUITE PYTHON: 1020 passed, 1 skipped em 242,44 s, zero erros e zero
    warnings, veredito VERDE. O unico pulado e
    test_ingestao_superseded.py::test_arvore_superada_do_repositorio_fica_fora,
    por nao haver arvore declarada superada no repositorio.
  - >-
    NPM AUDIT: found 0 vulnerabilities, com --audit-level=low.
  - >-
    PIP-AUDIT CONTRA A DECLARACAO (-r requirements.txt): 4 vulnerabilidades
    conhecidas em chromadb 1.5.9, coluna Fix Versions VAZIA nas quatro.
  - >-
    OSV PARA AS QUATRO IDs: PYSEC-2026-311 (pre-auth code injection via
    endpoint de tenants), CVE-2026-45833 (code injection autenticado, mesmo
    endpoint), CVE-2026-45830 e CVE-2026-45831 (falha de autorizacao entre
    tenants, esta ultima no SimpleRBACAuthorizationProvider). O vetor das
    QUATRO e o servidor HTTP do Chroma.
  - >-
    ALCANCE REAL DO VETOR: grep por HttpClient, chroma run, cliente HTTP do
    chromadb e trust_remote_code em .py/.ps1/.json/.yml de todo o repositorio,
    excluindo .venv e node_modules, devolveu UMA ocorrencia -- do.ps1:776, que
    e System.Net.Http.HttpClient do .NET e nada tem com Chroma. O consumo real
    e o cliente persistente embarcado, em memory_rag.py:208 e
    scripts/utils/ingest_rag.py:27, como requirements.txt:26 ja declarava.
  - >-
    AUSENCIA DE CORRECAO: a API do PyPI devolve 1.5.9 como ultima versao
    publicada de chromadb. Nao existe versao para a qual atualizar; a coluna
    Fix Versions vazia do pip-audit e fato, nao omissao da ferramenta.
  - >-
    COBERTURA DA FASE 3 DO PORTAO: grep por pip-audit, pip_audit,
    requirements.txt e osv em scripts/ops/cwv_gate.ps1 nao devolve NENHUMA
    ocorrencia. A fase executa npm audit --json e mais nada.
  - >-
    CHROMADB E CONSUMIDO: memory_rag.py o importa e instancia o cliente
    persistente; scripts/utils/ingest_rag.py tambem. Nao e dependencia orfa.
  - >-
    OSCILACAO DE next-env.d.ts: medido o conteudo do arquivo em seis commits
    consecutivos que o tocam -- 73b65165, 7883f6c2, 080cda35, 7c5b28ad,
    95913907, 9c3e2178. O caminho importado alterna PERFEITAMENTE entre a forma
    de build e a forma de dev, seis de seis.
  - >-
    WORKTREES: git worktree list devolve tres alem da principal, todas de
    2026-09-01. git rev-list --count master ate cada branch devolve 0 para as
    tres -- o trabalho esta integralmente em master. du -sh soma 5,5 GB
    (2,5 + 1,5 + 1,5).
  - >-
    BRANCH chore/submodule-ownership-rationalization: ahead 10, behind 294 de
    origin/master; ultimo commit 2026-08-22 08:20:31, autor Raphael Vitoi. A
    unica nao mesclada em master. Ela removia seis submodulos de skills/, e
    .gitmodules mais a listagem de skills/ mostram os diretorios presentes hoje
    -- a intencao nao foi realizada por outro caminho.
  - >-
    DIVERGENCIA ACUMULADA DAQUELA BRANCH: git diff --stat contra master devolve
    339 insercoes em llm/model_registry.py, 376 em llm/routing_policy.py e 933
    em scripts/ops/cwv_gate.ps1 -- os tres sao fonte unica declarada na secao 3
    do CLAUDE.md do projeto.
  - >-
    SUBMODULOS: git submodule status devolve nove entradas, todas com prefixo
    de espaco (sincronizadas). Nenhuma suja nem dessincronizada.
  - >-
    JULES: a consulta de status para a sessao 6388626450245619671 devolve
    HTTP 401 UNAUTHENTICATED, reason CREDENTIALS_MISSING, com a mensagem de que
    chaves de API nao sao suportadas e que se espera token OAuth2.
    logs/jules_cloud_sessions.log tem como ultimo snapshot 2026-08-29T18:24:10,
    onde aquela sessao consta In Progress.
  - >-
    O diretorio .jules nao existe no repositorio, e
    .claude/agent-memory/bolt/MEMORY.md existe -- a secao 10.6a do CLAUDE.md
    esta cumprida.
  - >-
    TAREFA AGENDADA: NexusSOTA-AgentCalibrationDailyEvaluation esta em estado
    Ready no Agendador de Tarefas.
  - >-
    LEDGER DE CALIBRACAO: Test-AgentCalibrationLedger devolve status valid, 21
    registros, exit 0. A evidencia diaria devolve 17 sessoes distintas com
    feedback e planejamento de calibracao permitido.
  - >-
    ACHADOS DO ASTRA: a validacao de 2026-09-07 marca B05 PARCIAL; B07, B08,
    B09 e F06 ABERTOS; F03 e F05 nao conclusivos. Nenhum foi fechado desde.
nao_verificado:
  - >-
    Nao rodei pip-audit sem -r, isto e, contra o venv instalado. O que esta
    medido aqui e a DECLARACAO, que e o que a secao 2 do CLAUDE.md exige; a
    arvore instalada pode divergir e nao foi comparada.
  - >-
    Nao auditei uv.lock contra a OSV pelos pares nome e versao, como a secao 2
    do CLAUDE.md descreve para aquele arquivo.
  - >-
    Nao rodei a suite de frontend nem o typecheck. O veredito VERDE declarado
    aqui e da suite Python apenas.
  - >-
    Nao rodei a skill security-review sobre os arquivos alterados.
  - >-
    Nao inspecionei o conteudo das tres worktrees antes de medir seu tamanho:
    a conclusao de que nada se perde ao remove-las apoia-se na contagem de
    commits, nao em diff de arquivos nao rastreados dentro delas. Pode haver
    trabalho NAO COMMITADO ali dentro, e isso nao foi verificado.
  - >-
    Nao verifiquei se o estado da sessao Jules 6388626450245619671 mudou desde
    2026-08-29: a API nao respondeu, e nao ha outra fonte.
  - >-
    Nao medi se o build regenera next-env.d.ts na forma de build. A alternancia
    esta provada no historico; o mecanismo exato que a produz e inferencia a
    partir dela.
referencias_nao_resolviveis: []
---

# O que esta em aberto na malha -- auditoria de amplitude

Pedido do Tier 0: *"verifique e auditore o que esta em aberto, mesmo q n seja
seu"*. O que segue esta ordenado por severidade, e cada item traz o que foi
medido e o que a medicao **nao** alcanca.

## 1. A fase de CVE do portao nao ve Python -- e ha quatro CVEs abertos ali

`scripts/ops/cwv_gate.ps1` executa `npm audit --json` na fase 3 e nada alem
disso. Grep por `pip-audit`, `pip_audit`, `requirements.txt` e `osv` naquele
arquivo devolve **zero** ocorrencias.

Consequencia direta: quando o portao imprime CVE zerado, isso significa **zero
CVEs npm**, nao zero CVEs. Rodando a auditoria que a secao 2 do CLAUDE.md manda
rodar e que nada executa automaticamente:

```
Found 4 known vulnerabilities in 1 package
chromadb 1.5.9  PYSEC-2026-311 / CVE-2026-45830 / CVE-2026-45833 / CVE-2026-45831
```

O proprio portao ja tem a frase certa escrita, na linha 673, a respeito de
outra falha: *"Zero por ausencia de medicao nao e resultado de seguranca."* Ele
diz isso do npm e comete o mesmo erro com o Python.

**A regra existe e nao tem executor.** A secao 2 do CLAUDE.md determina
`pip_audit -r requirements.txt`, mas nenhum hook, gate ou tarefa o roda. E o
caso do proprio CLAUDE.md contra si: *se ninguem consome, e descuido ou
entropia* -- aqui aplicado a uma regra de governanca, nao a um modulo.

### 1.1 As quatro CVEs sao reais, nao alcancaveis aqui, e sem correcao

Consultei a OSV pelas quatro IDs. **O vetor das quatro e o servidor HTTP do
Chroma**: endpoints de tenants e databases, autorizacao entre tenants,
`SimpleRBACAuthorizationProvider`. A mais grave, PYSEC-2026-311, e
pre-autenticacao com CVSS 4.0 `AV:N/AC:L/PR:N/UI:N/VC:H/VI:H/VA:H`.

Este projeto **nao sobe esse servidor**. Grep em todo o repositorio pelos
construtos que o alcancariam devolveu uma unica ocorrencia -- `do.ps1:776`, que
e `System.Net.Http.HttpClient` do .NET e nada tem com Chroma. O consumo real e
o cliente persistente embarcado, em `memory_rag.py:208` e
`scripts/utils/ingest_rag.py:27`, exatamente como `requirements.txt:26` ja
documentava.

E **nao ha para onde atualizar**: a API do PyPI devolve `1.5.9` como ultima
versao publicada. A coluna `Fix Versions` vazia e fato, nao lacuna da
ferramenta.

Logo, as tres saidas obvias estao fechadas: nao da para atualizar, nao da para
remover (o RAG consome), e ignorar em silencio e o que produziu esta auditoria.
A saida que sobra e aditiva, na escada da secao 8.2: **medir e observar**.

## 2. `next-env.d.ts` versionado grava estado, nao contrato

O arquivo alterna entre a forma de build e a forma de dev conforme o ultimo
comando executado. Medido nos seis commits consecutivos que o tocam, a
alternancia e **perfeita, seis de seis**:

| commit | forma gravada |
| :--- | :--- |
| `73b65165` | build |
| `7883f6c2` | dev |
| `080cda35` | build |
| `7c5b28ad` | dev |
| `95913907` | build |
| `9c3e2178` | dev |

Nenhum desses seis commits foi uma decisao: cada sessao gravou a forma que
calhou e a seguinte a reverteu. E o padrao que
`teste-que-mede-o-estado-nao-o-contrato` descreve, aplicado a versionamento --
o repositorio guarda estado de runtime como se fosse fonte.

**Nao corrigi, e o motivo importa.** Por no `.gitignore` e a correcao aparente,
mas um runner limpo que rode typecheck sem antes rodar o dev ou o build ficaria
sem o arquivo e sem os tipos. Isso e risco de CI, e a escada da secao 8.2 pede
autorizacao antes de reducao material. Fica medido e proposto.

## 3. 5,5 GB em worktrees cujo trabalho ja esta todo em master

```
2,5G  Site-worktrees/dependency-boundary-plan-20260901
1,5G  Site-worktrees/integrate-agent-handoff-20260901
1,5G  Site-worktrees/integrate-pmev-contracts-20260901
```

A contagem de commits fora de master devolve **0** para as tres. O trabalho
entrou; as worktrees ficaram.

Alem do disco, ha custo cognitivo: `git branch -vv` as exibe marcadas com `+`,
e um agente que abra a sessao por ali conclui que ha frente aberta onde nao ha.

**Nao removi**: remover diretorio e destrutivo, e a auditoria nao verificou se
existe arquivo nao rastreado ou nao commitado dentro deles. A verificacao antes
de remover e um `git status --porcelain` dentro de cada worktree -- tres
comandos -- e ela precede qualquer remocao.

## 4. Uma branch humana de 2026-08-22, com a intencao nao realizada

`chore/submodule-ownership-rationalization` -- ahead 10, **behind 294**, ultimo
commit `2026-08-22 08:20:31` de Raphael Vitoi. E a unica branch nao mesclada em
master.

O que ela pretendia: remover seis submodulos de `skills/`. Hoje `.gitmodules`
declara os submodulos e a listagem de `skills/` mostra os diretorios presentes
-- **a intencao nao foi realizada por nenhum outro caminho**.

O que mudou embaixo dela nesses dezessete dias:

| arquivo | divergencia |
| :--- | ---: |
| `scripts/ops/cwv_gate.ps1` | 933 insercoes |
| `llm/routing_policy.py` | 376 insercoes |
| `llm/model_registry.py` | 339 insercoes |

Os tres sao **fonte unica declarada** na secao 3 do CLAUDE.md do projeto.
Mesclar a branch hoje nao e mesclar: e reescrever tres fontes unicas a partir
de um estado de dezessete dias atras.

A decisao e do Tier 0 e tem tres formas: reextrair so a racionalizacao dos
submodulos como trabalho novo sobre o master atual; abandonar formalmente a
branch; ou mante-la parada, declarando que esta parada. **A que nao serve e a
atual**, em que ela existe sem que nada diga o que ela e.

## 5. A frente Jules esta cega

A consulta de status devolve **HTTP 401 UNAUTHENTICATED**, com
`reason: CREDENTIALS_MISSING` e a mensagem de que chaves de API nao sao
suportadas e que se espera token OAuth2. A `JULES_API_KEY` que a secao 6.4 da
raiz guarda em `HKCU:\Environment` **nao serve para esta API**.

`logs/jules_cloud_sessions.log` para em `2026-08-29T18:24:10`, e naquele
snapshot a sessao `6388626450245619671` consta **In Progress**. Passaram-se dez
dias. A memoria `agente-de-nuvem-travado-e-invisivel-ao-git` manda consultar a
API da plataforma justamente porque o git nao ve sessao parada -- e a API nao
responde.

Isso e capacidade declarada que nao opera, o que a secao 8.1.1 nomeia:
*referencia declarada nao e registro ativo*.

## 6. Pendencias ja declaradas, reconferidas

**Sete achados do Astra**, pela validacao de 2026-09-07: `B05` PARCIAL
(`valuation_stack=-1` aceito na arvore), `B07`, `B08`, `B09` e `F06` ABERTOS,
`F03` e `F05` nao conclusivos. Nenhum fechado desde.

**A fila do handoff** tem sete itens, encabecados pela calibracao assistida.

**Uma correcao de numero na propria fila:** a secao 3 do handoff diz *"quatro
sessoes distintas, duas condutoras"*. Medido agora,
`New-AgentCalibrationDailyEvidence.ps1` devolve **17 sessoes distintas** e
nenhuma calibracao anterior registrada. O portao esta aberto em qualquer
leitura, mas o numero citado subestima a evidencia acumulada por um fator de
quatro.

## 7. Higiene menor

- `master` esta **ahead 1** de `origin/master`: o commit `31dcc05d` desta
  sessao nao foi enviado.
- `pip-audit` emite `Permission denied` ao ler seu diretorio de cache sob
  `%LOCALAPPDATA%`. Nao invalida o resultado -- degrada desempenho -- mas e
  defeito de ambiente que reaparece a cada execucao.

## Onde isto conflita com o meu proprio comportamento

A secao 8.3 do CLAUDE.md e o `registro-2026-09-08-o-padrao-de-desvio-de-foco`
descrevem desvio de foco como o padrao reincidente desta linhagem. Uma
auditoria de amplitude e, por construcao, uma varredura larga -- e por isso ela
foi **pedida** em vez de assumida. Nada aqui foi corrigido por iniciativa
propria: os quatro itens que pedem acao (secoes 1 a 4) pedem decisao do Tier 0,
e estao formulados como decisao, nao como plano ja em curso.

**Assinatura:** `Claude Opus 5 [Tier 1.B]`
**Proposito:** levantar e medir o que esta em aberto na malha, inclusive o que
nao foi produzido por esta linhagem, sem alterar nenhuma das frentes
levantadas.
