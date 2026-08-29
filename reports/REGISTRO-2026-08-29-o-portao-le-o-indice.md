---
id: registro-2026-08-29-o-portao-le-o-indice
tipo: registro
escopo: Site
ecossistema: gemini-antigravity
autor: claude@opus-5
criado_em: 2026-08-29T13:00-03:00
commit: 2fd5da40
classes: [interno]
decide: o portao de registro passa a julgar o conteudo do INDICE, nao o da arvore
caminhos:
  - scripts/ops/record_gate.py
  - scripts/ops/record_index.py
  - tests/test_portao_le_o_indice.py
verificado:
  - "as cinco leituras de arvore em record_gate.py localizadas e classificadas -- quatro sobre arquivo EM STAGE (corrigidas) e uma sobre arquivo fora do stage (mantida de proposito)"
  - "tres testes novos encenam o desacordo entre indice e arvore nas duas direcoes, mais a queda deliberada para a arvore"
  - "duas mutacoes exercitadas, cada uma reprovando dois dos tres testes -- helper voltando a ler a arvore, e _e_prescritivo voltando a ler o disco"
  - "suite completa 635 passed, 0 skipped, basetemp isolado"
  - "ruff no repositorio inteiro -- um unico erro, o N818 preexistente em llm/routing_policy.py, que nao e deste commit"
nao_verificado:
  - "scripts/ops/record_anchor_gate.ps1 tem a MESMA falha na linha 134 (Get-Content da arvore) e NAO foi corrigido neste commit -- fica declarado abaixo"
  - "nao encenei o desacordo com um commit real de ponta a ponta; a prova e sobre o leitor, em repositorio de teste"
---

# O portao lia a tela, o commit levava outra coisa

## O defeito

`scripts/ops/record_gate.py` pegava a **lista** de arquivos do indice:

```python
saida = _git("diff", "--cached", "--name-only", "--diff-filter=ACM")
```

e depois lia o **conteudo** do disco:

```python
texto = caminho.read_text(encoding="utf-8-sig", errors="ignore")
```

Sao dois estados diferentes. `git add` congela uma versao; a edicao seguinte
nao entra no commit, mas entrava na leitura. O portao julgava o que estava na
tela enquanto o commit levava o que estava congelado.

Nao e hipotese. Esta sessao ja viveu as duas metades: um comando anunciou
*"ancora de commit adicionada"* e o arquivo nao tinha a linha, e mais cedo o
predecessor leu da arvore um YAML que eu commitaria um minuto depois e o
reportou como invalido.

## O que foi corrigido, e o que nao foi

Cinco leituras de arvore no arquivo. **Quatro sao sobre arquivo em stage** e
passaram a ler o indice, por um so ponto:

```python
def texto_como_vai_ao_commit(rel: str) -> str | None:
    r = subprocess.run(["git", "show", f":{rel}"], cwd=RAIZ, capture_output=True, check=False)
    if r.returncode == 0:
        return r.stdout.decode("utf-8-sig", errors="ignore")
    ...  # fora do indice: a arvore e a unica fonte que existe
```

As quatro: `linhas_em_bloco_de_comentario`, `_e_prescritivo`,
`referencias_mortas` e o bloco G1 que valida o frontmatter dos registros em
stage.

**A quinta ficou como estava, de proposito.** E o laco do G2, que percorre
`git ls-files docs/*.md reports/*.md` para descobrir quem declara `caminhos:`
atingidos pelo commit. Esses documentos **nao estao no stage** -- e justamente
por isso que o portao os cobra. Ler o indice ali daria o conteudo de HEAD e
esconderia declaracao recem-escrita. Regra: **le-se do indice o que vai no
commit; le-se da arvore o que esta sendo consultado.**

`ler_frontmatter` ganhou uma irma, `ler_frontmatter_de_texto`, porque
`git show` devolve texto e nao um `Path`. A funcao original virou uma camada
fina sobre ela -- duas implementacoes do mesmo formato divergiriam em silencio,
que e o modo de falha desta base.

## A queda para a arvore nao reabre o buraco

`texto_como_vai_ao_commit` cai para o disco quando o caminho nao esta no
indice. Isso e necessario (os testes de `referencias_mortas` montam arvore sem
`git add`) e e seguro: em `verificar()` os caminhos vem de
`--cached --diff-filter=ACM`, portanto estao **sempre** no indice, e a queda
nunca dispara ali. O terceiro teste trava esse comportamento para que a queda
continue deliberada em vez de virar acidente.

## A prova

`tests/test_portao_le_o_indice.py` monta um repositorio de verdade e encena o
desacordo nas duas direcoes:

| teste | encenacao | o que trava |
| :--- | :--- | :--- |
| `test_le_o_indice_e_nao_a_arvore` | stage **quebrado**, arvore consertada | a direcao perigosa: aprovar o conserto e commitar o quebrado |
| `test_stage_bom_e_arvore_quebrada_continua_bom` | stage **bom**, arvore virou rascunho | o falso positivo que a correcao nao pode criar |
| `test_fora_do_indice_cai_para_a_arvore` | arquivo sem `git add` | a queda deliberada |

Duas mutacoes exercitadas -- o helper voltando a ler a arvore primeiro, e
`_e_prescritivo` voltando a ler o disco. Cada uma reprova dois dos tres testes;
restaurado, os tres passam.

## Divida declarada no mesmo movimento

`scripts/ops/record_anchor_gate.ps1` tem **a mesma falha**, na linha 134:

```powershell
$linhas = Get-Content -LiteralPath $arq -Encoding UTF8 -ErrorAction SilentlyContinue
```

A lista dele vem de `git diff --cached --name-only` e a leitura vem do disco --
identico ao que acabou de ser corrigido do lado Python. **Nao foi corrigido
aqui**: sao dois portoes, duas linguagens e dois conjuntos de teste, e misturar
as duas correcoes esconderia qual delas quebrou algo. Fica como o proximo passo
obvio desta pendencia, com o caminho ja mapeado -- `git show ":$arq"` com queda
para a arvore, e os mesmos tres casos de teste.

## Licao

A lista e o conteudo vinham de fontes diferentes e ninguem notou porque **as
duas estavam certas isoladamente**: `--cached` para a lista e o correto, e
`read_text` para o conteudo e o obvio. O defeito nasce da juncao, e juncao nao
aparece em revisao de linha. Vale como pergunta de bolso ao ler qualquer portao:
*de onde vem a lista, e de onde vem o conteudo?* Se as respostas forem
diferentes, ha uma janela entre elas.
