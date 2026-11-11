---
id: registro-2026-11-11-correcao-actionlint-sc2086-chrome-extensions-ci
tipo: registro
escopo: ci
autor: Devin (SWE-2 Flash) [Tier 1]
criado_em: "2026-11-11"
verificado:
  - "actionlint local (actionlint-py 1.7.12.25, mesma versao resolvida pelo CI via uv run --with): zero findings em chrome-extensions-ci.yml e sota-ci.yml."
  - "Run 43103540913 (workflow_dispatch, SHA 6b5db8ba): Python 3.12 success, Python 3.13 success, Frontend success; job Security Headers falhou apenas no step actionlint por SC2086 pre-existente."
  - "llm/routing_policy.py tinha SyntaxError de kwarg duplicado (edicao concorrente de outro agente, mtime 18:20) — reparado minimamente sem stage; 81 testes de routing verdes, import OK."
nao_verificado:
  - "Novo run de CI ainda nao executado com o workflow corrigido — dispatch sera feito apos commit."
  - "actionlint-py flutua via 'uv run --with' (latest); se o shellcheck apertar regras novas, o gate volta a falhar — candidato a pin de versao no workflow."
revisoes_de_ancora:
  - registro: registro-2026-11-07-auditoria-integral-dependabot-github-e-code-scanning
    caminhos:
      - .github/workflows/chrome-extensions-ci.yml
    parecer: "Correcao 2026-11-11: quoting de variaveis no step 'Package extensions' (SC2086). Nenhuma mudanca de comportamento — basename, mkdir, cp, zip recebem os mesmos argumentos, apenas citados. Auditoria dependabot/code-scanning inalterada."
---

# Correcao actionlint SC2086 — chrome-extensions-ci.yml

## Contexto

O run `43103540913` (dispatch pos-incidente GitHub) foi o primeiro em que o
job `Security Headers & Architecture Quality Gate` executou de verdade: nos
runs anteriores ele era `skipped` porque os jobs Python falhavam antes. Com
Python 3.12/3.13 verdes, o gate de seguranca rodou e o step **Actionlint +
shellcheck** reprovou com 6 ocorrencias `SC2086` (variaveis sem aspas) no
script `Package extensions` de `.github/workflows/chrome-extensions-ci.yml`.

Falha latente pre-existente — o arquivo nao mudava desde `119ffe88`; o que
mudou foi a visibilidade (job antes sempre pulado). O actionlint-py flutua
(`uv run --with actionlint-py` resolve `latest`), entao uma versao mais
recente do shellcheck pode ter apertado a regra.

## Correcao

Apenas aspas duplas nas expansões: `basename "$ext"`, `mkdir -p
"/tmp/dist/$name"`, `cp -r "$ext"/*`, `cp "/tmp/$name-manifest.json"
"/tmp/dist/$name/manifest.json"`, `cd "/tmp/dist" && zip -r "$name.zip"
"$name"`. O glob `"$ext"/*` preserva a expansao de arquivos. O `python3 -c`
embutido nao foi tocado (ja esta dentro de aspas duplas externas).

## Incidente adjacente (nao commitado)

`llm/routing_policy.py` estava com `SyntaxError` (kwarg `ancorado_em`
duplicado, edicao de outro agente as 18:20). Reparado minimamente —
`ancorado_em="2026-11-11"` no lugar do duplicado — **sem stage**, para nao
atribuir ao meu commit alteracao alheia. Fica para o agente autor commitar.
