---
id: registro-2026-09-02-tensor-portavel-e-varredura-fora-de-python
tipo: relatorio
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: 2026-09-02T01:35-03:00
atualizado_em: 2026-09-02T01:35-03:00
classes: [interno, medido]
config_medida:
  raiz: /home/user/Site
  branch: master
  so: Linux
  distribuicao: Ubuntu 24.04.4 LTS (container remoto, nao a maquina do operador)
  compilador: g++ (Ubuntu 13.3.0)
  python_da_suite: '3.12.3'
  suite_antes: 775 passed, 10 skipped, 0 failed
  suite_depois: 778 passed, 7 skipped, 0 failed
caminhos:
  - core/tensor_engine/CMakeLists.txt
  - frontend/src/app/api/v1/telemetry/route.ts
  - .claude/ARQUITETURA/CHICO_PERSONA.md
  - .claude/ARQUITETURA/SOTA_REFERENCE_ARCHITECTURE.md
  - .claude/agent-memory/organizador/MEMORY.md
verificado:
  - >-
    O port das flags MSVC foi verificado por MEDICAO, nao por analogia de nome.
    Modulo compilado com g++ usando -O2 -ffast-math -mavx2, e os quatro testes de
    tests/test_tensor_engine.py passam: isometria de perspectiva a rtol 1e-5,
    distorcao ICM a rtol 5e-3 e conservacao estrita de probabilidade a 1e-4. Os
    tres que pulavam por "modulo nao compilado" agora executam.
  - >-
    O que autoriza o port e que os proprios testes ja declaram tolerancia de
    fast-math no corpo ("Simetria e tolerancia numerica AVX2 Fast-Math"). Se
    -ffast-math violasse a isometria que eles medem, reprovariam. Nao reprovaram.
  - >-
    Varredura de referencias a `.cerebro/` fora de Python (.mjs, .js, .ts, .ps1,
    .json, .yml, .md): 177 ocorrencias. Apenas UMA em codigo executavel --
    frontend/src/app/api/v1/telemetry/route.ts, que resolvia
    `process.cwd()/../.cerebro/logs/wasm_telemetry_dump.jsonl`, diretorio
    extinto. Reapontado para .claude/logs/, que existe.
  - >-
    Das 176 em markdown, a maioria e registro historico que cita corretamente o
    que existia. Foram corrigidas apenas as que INSTRUEM e estao injetadas no
    system prompt: CHICO_PERSONA.md (6 referencias, entra como IDENTIDADE DO
    USUARIO no manifesto) e SOTA_REFERENCE_ARCHITECTURE.md (5, entra como
    ARQUITETURA DE REFERENCIA SOTA). Mais uma em
    .claude/agent-memory/organizador/MEMORY.md, que o agente le.
  - >-
    Confirmado que os dois documentos corrigidos estao no manifesto e portanto
    chegam ao prompt: conferido contra docs/document_manifest.json.
  - >-
    O ImportError de `_read_memory_and_context` reportado na sessao era erro de
    sonda minha, nao defeito: a funcao chama-se
    `_read_agent_and_project_contexts`. Executada, devolve 8.720 caracteres de
    memoria e 7.599 de project-context, com o conteudo fundido presente.
  - >-
    Varredura de ancoras nos cinco caminhos tocados: apenas
    .claude/agent-memory/organizador/MEMORY.md e declarado por registro
    anterior, em dois (auditoria-2026-08-30-coderabbit-resolucao-e-integridade
    e handoff-2026-08-30-resolucao-coderabbit-linters-e-malha-sota), ambos
    revisados abaixo. Os outros quatro nao sao ancora de nenhum registro. Eu
    havia escrito uma revisao para auditoria-cwv-lighthouse-2026-09-01 citando
    o CMakeLists: aquele registro NAO declara esse caminho, a revisao era
    invencao minha e o portao a barrou. Removida.
  - Suite completa em 778 aprovados, 7 pulados, zero falhas.
nao_verificado:
  - >-
    O modulo compilado nao foi exercitado em Windows/MSVC apos a mudanca. O ramo
    `if(MSVC)` preserva as flags originais literalmente, mas preservar por
    leitura nao e o mesmo que rodar.
  - >-
    A isometria foi medida contra NumPy neste host x86-64 com AVX2. Nao foi
    medida em CPU sem AVX2, onde `-mavx2` gera instrucao ilegal em tempo de
    execucao -- risco identico ao que `/arch:AVX2` ja tinha no Windows, e
    portanto nao introduzido aqui.
  - >-
    O `.venv` do projeto esta em Python 3.14.0rc2, onde o pydantic quebra na
    coleta (`eval_type_backport` levanta AssertionError em
    _typing_extra.py:481). A suite NAO roda nesse venv. Achado independente
    desta mudanca, nao investigado aqui.
  - >-
    `ruff check .` no repositorio inteiro acusa E741 (nome ambiguo `l`) em
    tests/test_cwv_gate_truthfulness.py:149. Preexistente ao meu trabalho --
    confirmado com stash, o erro esta no HEAD -- e deixado intacto por ser
    escopo alheio.
revisoes_de_ancora:
  - registro: auditoria-2026-08-30-coderabbit-resolucao-e-integridade
    caminhos:
      - .claude/agent-memory/organizador/MEMORY.md
    parecer: >-
      A memoria do @organizador muda em UMA linha, e apenas o caminho dentro de uma proposta: `.cerebro/.archive/` passa a `.claude/.archive/`, porque a arvore citada foi extinta pela fusao. Nenhum aprendizado, padrao ou decisao registrada e alterado, e o saneamento de linters e mojibake que este registro ancora permanece exatamente como estava.
  - registro: handoff-2026-08-30-resolucao-coderabbit-linters-e-malha-sota
    caminhos:
      - .claude/agent-memory/organizador/MEMORY.md
    parecer: >-
      A memoria do @organizador muda em UMA linha, e apenas o caminho dentro de uma proposta: `.cerebro/.archive/` passa a `.claude/.archive/`, porque a arvore citada foi extinta pela fusao. Nenhum aprendizado, padrao ou decisao registrada e alterado, e o saneamento de linters e mojibake que este registro ancora permanece exatamente como estava.
---

# Motor tensorial portavel, e a varredura fora de Python

## O port que so valia se fosse medido

`core/tensor_engine/CMakeLists.txt` fechava com
`target_compile_options(... /O2 /fp:fast /arch:AVX2)` -- sintaxe MSVC. O g++ e o
clang rejeitam, entao o modulo nao compilava fora do Windows e os tres testes de
isometria pulavam com *"Modulo quantum_tensor_engine nao compilado no
ambiente"*. Em todo agente, e no CI `ubuntu-latest`.

A objecao que eu mesmo levantei na auditoria anterior era legitima: `/fp:fast` e
`-ffast-math` **nao** dao as mesmas garantias de ponto flutuante, e esses testes
medem isometria numerica contra NumPy. Portar por analogia entre nomes de flag
seria trocar um skip declarado por um verde nao verificado.

O que resolve a objecao esta nos proprios testes. Eles ja declaram tolerancia de
fast-math no corpo -- *"Simetria e tolerancia numerica AVX2 Fast-Math"* -- com
`rtol=5e-3` na distorcao ICM, `rtol=1e-5` na perspectiva, e conservacao
**estrita** de probabilidade a `1e-4`. Se o port violasse a isometria, eles
reprovariam.

Compilado com g++ 13.3 e `-O2 -ffast-math -mavx2`: **quatro passam, zero
pulam**. O port esta verificado por medicao.

Suite: 775 aprovados com 10 pulados, antes; 778 com 7, depois.

## A varredura fora de Python

177 referencias a `.cerebro/` em `.mjs`, `.js`, `.ts`, `.ps1`, `.json`, `.yml` e
`.md`. O resultado surpreende para melhor: **apenas uma em codigo executavel**.

`frontend/src/app/api/v1/telemetry/route.ts` resolvia
`process.cwd()/../.cerebro/logs/wasm_telemetry_dump.jsonl` -- diretorio extinto.
A telemetria do WASM escrevia num caminho que nao existe. Reapontado para
`.claude/logs/`, que existe.

Das 176 em markdown, a maioria e **registro historico**, e citar `.cerebro` ali
esta correto: aquilo existia quando o documento foi escrito. Nao se reescreve
registro para caber no presente -- foi exatamente esse o erro que esta sessao
corrigiu num indice canonico horas antes.

O criterio de corte foi outro: **o documento instrui, e chega ao agente?**

| Documento | Referencias | Entra no prompt? |
| :--- | ---: | :--- |
| `.claude/ARQUITETURA/CHICO_PERSONA.md` | 6 | sim -- e `IDENTIDADE DO USUARIO` no manifesto |
| `.claude/ARQUITETURA/SOTA_REFERENCE_ARCHITECTURE.md` | 5 | sim -- e `ARQUITETURA DE REFERENCIA SOTA` |
| `.claude/agent-memory/organizador/MEMORY.md` | 1 | sim -- memoria lida pelo agente |
| `.claude/handoff_payload.md` | 39 | nao -- sem consumidor em codigo |
| reports/ e docs/reports/ | ~120 | nao -- registro datado |

Os tres primeiros foram corrigidos. O `CHICO_PERSONA.md` era o mais grave:
mandava *"LEITURA OBRIGATORIA INICIAL"* de `.cerebro/COSMOVISAO.md`. Um documento
que chega ao prompt e ordena ler um caminho morto ensina o agente a procurar
onde nao ha nada.

## Dois achados que ficam declarados

**O `.venv` do projeto esta em Python 3.14.0rc2**, e o pydantic quebra na coleta
(`eval_type_backport` levanta `AssertionError` em `_typing_extra.py:481`). A
suite nao roda nesse venv -- foi por isso que a verificacao do modulo teve de ser
feita contra um venv 3.12 separado. Independente desta mudanca, e nao
investigado aqui.

**`ruff check .` acusa E741** (nome ambiguo `l`) em
`tests/test_cwv_gate_truthfulness.py:149`. Confirmado preexistente com `git
stash`: o erro esta no HEAD, veio no merge `dfbc9ba3`. Deixado intacto por ser
escopo alheio -- corrigi-lo aqui arrastaria as ancoras daquele arquivo para
dentro de um commit que nao trata dele.
