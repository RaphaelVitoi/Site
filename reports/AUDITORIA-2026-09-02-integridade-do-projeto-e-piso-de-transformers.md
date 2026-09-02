---
id: auditoria-2026-09-02-integridade-do-projeto-e-piso-de-transformers
tipo: relatorio
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: 2026-09-02T02:10-03:00
atualizado_em: 2026-09-02T02:10-03:00
commit_inicio_auditoria: e323487755f130012fa2f56bfe215f46bd35a4f3
classes: [interno, medido]
caminhos:
  - pyproject.toml
  - uv.lock
  - docs/MCP_ECOSYSTEM_TOPOLOGY_2026.md
config_medida:
  raiz: /home/user/Site
  branch: master
  so: Linux
  distribuicao: Ubuntu 24.04.4 LTS (container remoto, nao a maquina do operador)
  python_da_suite: '3.12.3'
  uv: 0.8.17
  ruff: 0.16.5
  suite: 778 passed, 7 skipped, 0 failed
  pacotes_no_lock: 210
  prompt_auditor_caracteres: 216368
verificado:
  - >-
    Suite completa em 778 aprovados, 7 pulados, zero falhas, antes e depois da
    mudanca. Os sete pulados sao lacunas de host ja declaradas pelo guard de
    cobertura: quatro por PowerShell 5.1 ausente, um sem medidor de commit
    charge, um sem GEMINI_ROOT e um sem arvore superada no repositorio.
  - >-
    Auditoria dos 210 pacotes do uv.lock contra api.osv.dev por querybatch,
    conforme CLAUDE.md SS2. Antes: SEIS advisories em dois pacotes. Depois do
    piso: CINCO, todas do chromadb.
  - >-
    A advisory fechada e GHSA-xrqw-3rrv-vx5w (HIGH) em transformers 5.9.0 --
    `save_pretrained` grava fora do diretorio de destino a partir do nome do
    chat template, o que permite escrita arbitraria de arquivo. Corrigida em
    5.10.0. Era a UNICA das seis com versao corrigida publicada.
  - >-
    O piso entrou como `transformers>=5.10.0` em [tool.uv]
    constraint-dependencies, e NAO como override-dependencies nem como
    dependencia direta: transformers e transitiva de sentence-transformers, e
    constraint respeita o teto do pai e falha alto se for impossivel.
  - >-
    Declaracao e lock foram reconciliados na mesma mudanca. `uv lock` resolveu
    os 210 pacotes e subiu transformers 5.9.0 -> 5.15.1 e safetensors 0.7.0 ->
    0.8.0. Declarar o piso sem relockar deixaria a versao vulneravel fixada --
    e exatamente a armadilha que o CLAUDE.md SS2 documenta.
  - >-
    As cinco advisories restantes sao do chromadb 1.5.9, duas CRITICAL e duas
    HIGH mais um PYSEC correlato, e NENHUMA tem versao corrigida publicada. O
    aceite de risco ja estava analisado no proprio pyproject.toml: so se usa
    chromadb.PersistentClient, embarcado, sem porta em escuta. Reconferido no
    codigo -- nenhum HttpClient em engine/gemma_server.py, memory_rag.py,
    scripts/cli/nexus.py ou scripts/utils/ingest_rag.py. O aceite permanece, e
    permanece condicional a isso.
  - >-
    docs/MCP_ECOSYSTEM_TOPOLOGY_2026.md:118 declarava a localizacao do servidor
    MCP dinamico como `Site/.cerebro/settings.local.json`, arvore extinta pela
    fusao. O arquivo real e `.claude/settings.local.json`, e existe. Corrigido.
  - >-
    Efeito medido no caminho de producao: o documento entra no manifesto e
    chegava ao system prompt. Antes da correcao o prompt do @auditor tinha UMA
    ocorrencia de `.cerebro/`; depois, com o cache expurgado, tem ZERO, e o
    tamanho segue em 216.368 caracteres. Era o ultimo caminho morto que chegava
    ao agente.
  - >-
    npm audit --audit-level=low: zero vulnerabilidades. Manifesto de documentos:
    20 caminhos, zero ausentes. Diretorio .claude/agents/ com 19 agentes. A
    arvore .cerebro nao existe no repositorio.
nao_verificado:
  - >-
    O Dependabot anuncia OITO vulnerabilidades no default branch (2 criticas, 4
    altas, 1 moderada, 1 baixa); eu medi SEIS em dois pacotes pela OSV sobre o
    lock. A diferenca NAO foi reconciliada -- pode ser contagem por alerta em
    vez de por advisory, ou ecossistema que esta varredura nao alcanca. Ha um
    terceiro numero em jogo: o plano de fronteira de dependencias registrou
    SETE alertas em 2026-09-01. Tres contagens, nenhuma conciliada. Numero de
    terceiro nao conferido nao vira numero meu.
  - >-
    O efeito de transformers 5.15.1 em tempo de execucao. A resolucao passou e a
    suite segue verde, mas a suite NAO exercita sentence-transformers com o
    pacote novo instalado: o venv desta medicao continua com o anterior. Salto
    de seis minor releases pede um smoke de embedding antes de release.
  - >-
    `ruff check .` acusa E741 (nome ambiguo `l`) em
    tests/test_cwv_gate_truthfulness.py:149, preexistente, herdado do merge
    dfbc9ba3 e deixado intacto por ser escopo alheio.
  - >-
    `ruff format --check .` aponta tres arquivos fora de forma
    (database/lab_manager.py, engine/llm_api.py, scripts/utils/notifications.py),
    todos por linha em branco apos docstring. Medido com ruff 0.16.5 contra o
    piso `>=0.16.3` do pyproject: nao foi possivel distinguir estado real do
    HEAD de diferenca entre versoes do formatador sem fixar a versao que a
    maquina do operador usa.
  - >-
    O portao de 5 fases esta em FRAGIL com 2 warnings no teto de 2, sem margem:
    TBT nao certificado por ausencia de artefato Lighthouse de producao, e
    color-contrast inconclusivo no axe com baseline TARGET_MISMATCH. Os dois
    exigem Chrome isolado e arbitragem humana na maquina Windows. Nao medidos
    aqui, e um warning novo de qualquer fase reprova o portao.
  - >-
    O .venv do projeto esta em Python 3.14.0rc2, onde o pydantic quebra na
    coleta. A suite nao roda nesse venv; toda medicao usou um venv 3.12
    separado. Achado independente, nao investigado.
revisoes_de_ancora:
  - registro: handoff-2026-08-30-auditoria-malha-agentica-e-trava-de-lfs
    caminhos:
      - pyproject.toml
    parecer: >-
      Aquele handoff ancora o pyproject pelo aceite de risco do chromadb, medido com pip-audit em quatro advisories e condicionado a so usar PersistentClient. O aceite nao e desfeito: e reconferido no codigo e mantido, e a mudanca aqui apenas ACRESCENTA um piso para transformers, pacote que aquela medicao nao alcancou. O bloco de comentario que sustenta o aceite fica intacto.
  - registro: handoff-2026-08-30-sanitizacao-linter-e-homeostase-total
    caminhos:
      - pyproject.toml
    parecer: >-
      Aquele handoff ancora o pyproject pelas exclusoes de ruff e pelas supressoes pontuais de S105 e N818, configuradas para evitar edicao inline na arvore. Nada disso e tocado: a alteracao vive em [tool.uv] constraint-dependencies, secao que nao interage com configuracao de linter. `ruff check` devolve o mesmo resultado antes e depois.
  - registro: plan-dependency-boundary-reconciliation-2026-09-01
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: >-
      Aquele plano nao e desfeito nem executado aqui: as quatro tarefas seguem abertas, e nenhuma delas -- allowlist com validade, portao que falha fechado em expansao de escopo, cobertura de Actions, integracao no cwv_gate -- foi tocada. O aceite do chromadb sobre o qual ele e construido permanece exatamente como estava, e foi reconferido no codigo. O que esta mudanca faz e ENTREGAR uma evidencia que o proprio plano declara faltar: ele registra que "pyproject.toml plus uv.lock are the canonical dependency contract and have not yet been audited through a locked export", e a auditoria de hoje varreu os 210 pacotes do lock contra a OSV. O resultado confirma a tese do plano em vez de contraria-la -- apareceu uma advisory que a evidencia por requirements.txt nunca viu, em transformers, transitiva com correcao publicada. Fica registrada tambem uma divergencia que o plano vai precisar reconciliar na sua Tarefa 1: ele anotou SETE alertas Dependabot em 2026-09-01, o push de hoje reporta OITO, e a minha varredura da OSV mede SEIS. Tres numeros, nenhum conciliado.
  - registro: handoff-2026-08-31-saneamento-linters-e-estabilizacao-core-e-api
    caminhos:
      - pyproject.toml
    parecer: >-
      Aquele handoff ancora o pyproject pelo saneamento de lints de ruff e Pyright em core/, api/, agents/ e tools/. A mudanca aqui nao encosta em configuracao de lint nem em codigo dessas pastas; e um piso de seguranca para dependencia transitiva. O saneamento ancorado segue valido e verificavel pelo mesmo comando.
---

# Integridade do projeto, e a unica advisory que tinha conserto

Auditoria de estado sobre `e3234877`, arvore limpa e sincronizada com o remoto.

## O que esta integro, por medicao

| Verificacao | Resultado |
| :--- | :--- |
| Suite (Python 3.12) | 778 aprovados, 7 pulados, 0 falhas |
| `npm audit --audit-level=low` | 0 vulnerabilidades |
| Manifesto de documentos | 20 caminhos, 0 ausentes |
| Agentes em `.claude/agents/` | 19 |
| Arvore `.cerebro` | inexistente |
| Prompt do `@auditor` | 216.368 caracteres |

Os sete pulados sao lacunas de host, declaradas uma a uma pelo guard de
cobertura. Nenhum e defeito de codigo.

## A advisory que tinha conserto, e as cinco que nao tem

A auditoria dos 210 pacotes do `uv.lock` contra a OSV devolveu seis advisories
em dois pacotes. O criterio que separa as duas metades nao e severidade: e
**existe versao corrigida publicada?**

| Pacote | Advisories | Corrigida em | Situacao |
| :--- | ---: | :--- | :--- |
| `transformers==5.9.0` | 1 HIGH | **5.10.0** | fechada aqui |
| `chromadb==1.5.9` | 5 (2 CRITICAL, 2 HIGH) | nenhuma | aceite mantido |

`GHSA-xrqw-3rrv-vx5w` deixa `save_pretrained` gravar fora do diretorio de
destino a partir do nome do chat template — escrita arbitraria de arquivo.
O pacote e **transitivo**, puxado pelo `sentence-transformers`, e o repositorio
ja tinha o mecanismo certo montado e documentado para esse caso: um piso em
`[tool.uv] constraint-dependencies`. Faltava a entrada.

Entrou como `constraint`, nao `override`, pelo motivo que o proprio bloco
registra: constraint respeita o teto do pai e **falha alto** se for impossivel;
override atropelaria e produziria combinacao que nao funciona.

**E foi relockado.** Declarar o piso sem rodar `uv lock` deixaria `5.9.0` fixado
no lock com a declaracao dizendo outra coisa — precisamente a armadilha que o
`CLAUDE.md` §2 documenta, e que ja custou uma sessao inteira com o `pillow`.
`uv lock` subiu `transformers` para 5.15.1 e `safetensors` para 0.8.0. A
reauditoria pos-lock devolve cinco, todas do chromadb.

As do chromadb ficam porque **nao ha para onde ir**: nenhuma tem correcao
publicada. O aceite ja estava analisado no `pyproject.toml` e foi reconferido —
so `PersistentClient`, embarcado, sem porta em escuta, em quatro consumidores.
Aceite condicional, e a condicao continua verdadeira.

## O ultimo caminho morto que chegava ao agente

`docs/MCP_ECOSYSTEM_TOPOLOGY_2026.md:118` afirmava que o servidor MCP dinamico
mora em `Site/.cerebro/settings.local.json`. Arvore extinta; o arquivo real e
`.claude/settings.local.json`.

A varredura de ontem cortou por *"o documento instrui, e chega ao agente?"* e
deixou este de fora por ser **descritivo**, nao ordem de leitura. O corte estava
certo em prioridade e errado em completude: um documento que chega ao prompt e
afirma um caminho morto como fato ensina o agente uma topologia falsa, mesmo sem
mandar ler nada.

Medido no caminho de producao, com cache expurgado: o prompt do `@auditor` tinha
**uma** ocorrencia de `.cerebro/`; agora tem **zero**.

## O que fica aberto, e nao e meu para fechar

O portao esta em **FRAGIL, 2 warnings no teto de 2 — sem margem**. Qualquer
warning novo, de qualquer fase, reprova todo commit. Os dois ocupantes exigem a
maquina Windows: TBT sem artefato Lighthouse de producao, e `color-contrast`
inconclusivo com baseline expirada.

E ha tres contagens de vulnerabilidade em circulacao: o plano de fronteira de
dependencias anotou **sete** alertas Dependabot em 2026-09-01, o push de hoje
reporta **oito**, e a minha varredura da OSV sobre o lock mede **seis**.
**Nao reconciliei nenhuma delas**, e nao vou adotar numero de terceiro nem
defender o meu sem base. Reconciliar isso e a Tarefa 1 daquele plano, e ela
exige autenticacao GitHub sob a conta do proprietario.
