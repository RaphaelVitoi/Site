---
id: registro-2026-08-29-shell-true-nos-catalogos
tipo: registro
escopo: Site
ecossistema: gemini-antigravity
autor: claude@opus-5
criado_em: 2026-08-29T04:10-03:00
commit: 434d2967
classes: [interno]
decide: supressao de S602 em scripts/cli/nexus.py, duas ocorrencias
verificado:
  - origem de cmd_str rastreada nas duas chamadas -- scripts/SCRIPTS_CATALOG.json
    e data/SYSTEM_OPERATIONS_MANIFEST.json, ambos versionados (git ls-files)
  - grep exaustivo por `get("command"` no nexus.py -- exatamente 2 ocorrencias,
    linhas 2440 e 2506, nenhuma outra origem
  - o argumento do operador (target_id) SELECIONA entrada do manifesto; nao
    fornece texto de comando
nao_verificado:
  - nao auditei se algum processo externo escreve nesses dois JSON em tempo de
    execucao; a garantia aqui e de versionamento, nao de imutabilidade em disco
  - nao reescrevi as chamadas para lista-sem-shell, que seria a remocao da
    supressao em vez do registro dela
---

# Por que `shell=True` fica, e por que precisa de registro

O portao de ancora (`scripts/ops/record_anchor_gate.ps1`, E1) exige que todo
supressor de seguranca carregue um `Record-Id`. A causa esta escrita no proprio
portao: em `tools/hybrid_router/app.py` o bind `0.0.0.0` recebeu
`# noqa: S104 # nosec B104` e **o achado parou de ser reportado sem parar de
existir**. Supressor e decisao; decisao sem registro nao e auditavel.

Este documento e o registro que faltava para duas linhas.

## As duas linhas

| local | chamada |
| :--- | :--- |
| `scripts/cli/nexus.py:2443` | catalogo de scripts, dentro de `_executar_categoria_scripts` |
| `scripts/cli/nexus.py:2511` | manifesto de operacoes, dentro de `_executar_bloco_operacoes` |

Ambas executam `subprocess.run(cmd_str, shell=True, ...)`.

## Por que a supressao e legitima

S602 existe porque `shell=True` com string monta uma linha de comando que o
shell interpreta -- metacaractere em entrada nao confiavel vira execucao. A
pergunta que decide, entao, nao e "usa shell?" e sim **de onde vem a string**.

Rastreado: `cmd_str` sai de `_resolver_comando(...get("command", ""))`, e
`get("command")` aparece exatamente duas vezes no arquivo. As duas leem dicts
carregados de arquivos versionados:

- `scripts/SCRIPTS_CATALOG.json`
- `data/SYSTEM_OPERATIONS_MANIFEST.json`

O operador escolhe uma categoria ou um `target_id`; isso **seleciona uma
entrada**, nao compoe o comando. Nao ha caminho de entrada externa ate a
string executada. Alterar o que roda exige alterar um arquivo versionado, que
passa por revisao e pelos mesmos portoes.

## O que este registro NAO afirma

Nao afirma que `shell=True` seja a melhor forma. A alternativa correta e passar
uma lista de argumentos e dispensar o shell -- `_resolver_comando` ja resolve o
binario absoluto, entao a conversao e viavel. Ela nao foi feita aqui porque
seria mudanca de comportamento em codigo que acabou de ser refatorado por outro
agente, e misturar as duas coisas esconderia qual delas quebrou algo.

Fica como divida declarada, nao como decisao final.

## Por que apareceu agora

O portao so cobra **linhas adicionadas** -- "divida preexistente continua fora".
As tres ocorrencias existiam no HEAD sem registro e passavam por isso. A faxina
do agente antecessor moveu e consolidou essas linhas (tres viraram duas), e
linha movida entra no diff como adicionada. O portao nao ficou mais rigoroso; a
divida e que parou de estar escondida atras da imobilidade.

Vale como padrao: **refatoracao expoe divida que a estabilidade escondia.** Nao
e regressao, e revelacao.
