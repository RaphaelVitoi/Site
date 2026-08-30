---
id: interludio-2026-08-28-concorrencia-e-isolamento
tipo: relatorio
escopo: Site
ecossistema: gemini-antigravity
autor: claude@opus-5
criado_em: 2026-08-28T05:05-03:00
commit: 71934ef7
atualizado_em: 2026-08-30T13:10-03:00
classes: [interno, medido]
caminhos:
  - scripts/ops/suite_isolada.py
  - scripts/ops/record_gate.py
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  suite_arvore_viva: 508 passed
  suite_arvore_isolada: 504 passed, 4 skipped
  data: 2026-08-28
verificado:
  - as 4 edicoes da outra sessao auditadas uma a uma por EXECUCAO, nao leitura
  - cwv_gate.ps1 parseado em pwsh 7 e em Windows PowerShell 5.1, e executado
  - veredito unico exercitado -- console, JSON, Markdown e exit code coerentes
  - identidade de modulo medida antes e depois (`a is b` de False para True)
  - suite completa rodada nas DUAS arvores, viva e isolada
  - o executor isolado exercitado com --sujo, --incluir-novos e --comando
  - guarda de subcomando git do executor provada -- pegou um `ls-files` novo
  - o resumo do executor foi corrigido em 2026-08-28 para reconhecer skipped e
    xfail, e exercitado nos tres estados; ver secao 8
nao_verificado:
  - o handoff da outra sessao teve a ANCORA normalizada e entrou no historico em
    c88ef53e -- so o frontmatter foi tocado, com verificado e nao_verificado
    TRANSCRITOS das declaracoes do proprio documento; corpo intacto e autoria
    preservada. Nada do CONTEUDO dele foi verificado por mim, exceto o P0
  - o risco P0 foi VERIFICADO em 2026-08-28T08:40 e nao reproduz na forma
    enunciada; ver secao 7. A rotacao das quatro chaves OpenRouter continua
    sendo ato do vertice no provedor, fora do alcance daqui
  - o executor isolado nao foi rodado contra o repositorio antigravity; a
    parametrizacao por --repo foi testada so em unidade
  - nenhum servidor MCP, skill ou proxy foi levantado nesta passagem
supersede: null
---

# INTERLÚDIO — concorrência e isolamento

> **Quebra deliberada do plano 2-B**, autorizada pelo vértice em 2026-08-28.
> Motivo: duas sessões trabalhando no mesmo repositório produziram uma classe de
> defeito que nenhuma frente do plano cobria.

## 1. O que a concorrência produziu

Três defeitos, e só o terceiro não tem cura por disciplina:

| # | Defeito | Cura |
| :--- | :--- | :--- |
| 1 | `git add -A` varreu para o stage um registro da outra sessão | Disciplina: caminho explícito, `git status` antes de cada commit |
| 2 | As duas sessões acrescentaram **a mesma chave** ao mesmo frontmatter; `yaml.safe_load` aceita em silêncio | Portão: critério G1c |
| 3 | As sondas dos portões **encenam violações** — criam arquivo, dão `git add`, medem, desfazem | **Nenhuma.** A sonda precisa do índice de verdade |

O terceiro é estrutural: medir um portão de verdade exige o índice de verdade, e
durante essa janela um commit alheio leva a sonda sintética junto. Coordenar as
sessões não resolve — só adia.

## 2. A saída: cada execução com o seu próprio índice

`git worktree` dá exatamente isso — segunda árvore de trabalho, índice próprio,
mesmo object store. Duas execuções simultâneas não se enxergam, e nenhuma
enxerga o working tree.

```bash
uv run python scripts/ops/suite_isolada.py                       # HEAD, limpo
uv run python scripts/ops/suite_isolada.py --sujo                # + rastreados
uv run python scripts/ops/suite_isolada.py --sujo --incluir-novos
uv run python scripts/ops/suite_isolada.py --repo ../antigravity
nexus test --suite security_governance --isolado
```

**Multiprojeto por construção:** `--repo` aceita qualquer repositório git, a
suíte é descoberta por convenção e trocável por `--comando`. Um repositório sem
`pytest` também serve.

**O padrão leva só o que o git rastreia,** e isso é decisão: numa máquina com
duas sessões, arquivo novo pode ser da outra. Levá-lo sem pedir seria a versão
silenciosa do `git add -A` que originou o executor. `--incluir-novos` é a porta
explícita.

Um teste garante que os únicos subcomandos git usados ali são de leitura, mais
`worktree`. Ele já pagou: pegou um `ls-files` acrescentado depois, e o
subcomando só entrou na lista após conferência.

## 3. O que a primeira execução achou

**Três testes meus só passavam numa árvore multiprojeto completa.** Falhavam em
worktree limpo — ou seja, falhariam em CI e em qualquer outra máquina. Nenhuma
execução local acharia isso, porque local tudo está montado.

| Causa | Por que é falso positivo | Correção |
| :--- | :--- | :--- |
| Submódulo não materializado | `git worktree` não inicializa submódulo; clone raso também não. O endereço é válido, o conteúdo é que não foi baixado | Prefixo lido do `.gitmodules`, não do disco |
| Caminho de projeto irmão | `antigravity/...` é inverificável **daqui**, não inexistente | Raízes de escopo lidas do índice canônico da frente 1 |
| Artefato derivado | `data/RECORD_INDEX.json` é gitignored por desenho | `git check-ignore` |
| Prefixo `Site/` deduzido do **nome do diretório** | O worktree se chama `suite-isolada-Site-<pid>-<epoch>` | Nome canônico do projeto vira dado declarado no índice |

A última é a mais instrutiva. **Nome canônico é dado declarado; nome de
diretório é acidente do sistema de arquivos** — e eu tinha escrito `RAIZ.name`
em quatro lugares como se fossem a mesma coisa.

## 4. Harmonizações

**Veredito único no `cwv_gate.ps1`.** Havia duas expressões: o relatório dizia
`FRAGILE` para qualquer warning, o console reprovava a partir de 3. Com 0 erros
e 3 warnings o portão **bloqueava** enquanto o arquivo declarava frágil. Agora
há uma expressão só, e console, JSON, Markdown e código de saída derivam dela.

**Um caminho de import.** Medido antes: `record_index` e
`scripts.ops.record_index` eram **dois objetos de módulo para o mesmo arquivo**,
e o `monkeypatch` de um não alcança o outro. `scripts/ops` virou pacote de
verdade; o import solto é reprovado por teste.

**Escrita atômica do índice.** Duas sessões rodando `--rebuild` juntas podiam
deixar JSON pela metade. `os.replace` é atômico no mesmo volume.

**`referencias_historicas` → `referencias_nao_resolviveis`.** O nome antigo
mentia: o campo cobre caminho que sumiu **e** caminho que existe no disco mas
nunca foi rastreado. O que importa não é por que não resolve — é que o autor
sabe que não resolve.

## 5. As edições da outra sessão, adotadas

Auditadas por execução, não por leitura. Todas corretas:

- `import os` sem uso removido — 0 usos medidos
- lint em `test_patches_skills.py` — comportamento idêntico
- `nexus index` pelo caminho estático do pacote — roda de dentro e de fora
- `cwv_gate.ps1`: sonda 9223 antes de 9222, e **conserta dois defeitos reais** —
  o relatório bi-state, e o `` `$TargetUrl` `` cuja crase o here-string escapava
  (os relatórios já gerados imprimiam o literal)

Uma edição delas entrou no commit `9d02b9fa` com a minha assinatura, antes de eu
perceber a concorrência. Registrado aqui porque desfazer exigiria reescrever
histórico, e o registro é mais barato que a reescrita.

## 6. Declaração (governança §5)

Rodaram: as 4 edições auditadas por execução; `cwv_gate.ps1` parseado nas duas
versões de PowerShell e executado; o veredito único exercitado ponta a ponta; a
identidade de módulo medida antes e depois; a suíte completa nas duas árvores;
o executor isolado exercitado em três modos.

No adendo da §7 rodaram também: 6 arquivos de configuração lidos com contagem
de bytes, 55 servidores MCP inventariados, 19 `.env` varridos, e a não-fuga do
`.env` para a árvore isolada provada por três fontes mais verificação empírica.
Três mutações com baseline explícita sobre a guarda nova.

Não rodaram: **nenhuma chave foi validada contra o provedor** (a
governança proíbe verificação que pressuponha chamada real a provedor de LLM, e
por isso forma é o que se mede, nunca liveness), então a rotação das quatro
chaves OpenRouter continua pendente e é ato do vértice; o executor não foi
rodado contra o `antigravity` de fato, só testado em unidade; nenhum MCP, skill
ou proxy foi levantado.

## 7. O risco P0, verificado

> Adendo de 2026-08-28T08:40, a pedido do vértice. **Nenhum valor de credencial
> foi impresso em nenhum momento desta verificação** — só caminho, chave, tipo e
> comprimento.

### 7.1 Na forma enunciada, não reproduz

O handoff da outra sessão declara *"uma credencial materializada como argumento
em configuração local"*. Medido:

| Verificação | Resultado |
| :--- | :--- |
| Arquivos de configuração lidos | **6**, com contagem de bytes confirmando a leitura |
| Servidores MCP inventariados | **55** (45 na raiz, 10 no antigravity) |
| Argumento de linha de comando com credencial | **0** |
| Parâmetro de credencial em URL | **0** |
| `env` com valor literal sensível | **0** — o único, `GITHUB_PERSONAL_ACCESS_TOKEN`, é `${env:GITHUB_TOKEN}` |

O padrão em uso é o correto: referência a variável de ambiente. E `GITHUB_TOKEN`
não está definido nesta shell, coerente com as chaves revogadas.

### 7.2 A exposição real é outra, e mais estreita

`Site/.env` tem **quatro chaves OpenRouter materializadas em texto claro**
(`sk-or-v1-…`, 73 caracteres). O que as contém:

- **não é rastreado** pelo git, e é coberto pelo `.gitignore` linha 102;
- **não vaza para a árvore isolada** — provado por três fontes independentes
  (`git diff HEAD`, `git ls-files --others --exclude-standard`, e o fato de o
  worktree materializar só rastreados) mais verificação empírica: criei um
  worktree e conferi que o arquivo não está lá.

As cinco `GEMINI_API_KEY_*` são **placeholders** (`COLOQUE_A_NOVA_CHAVE_AQUI`) —
casaram com um regex genérico durante a varredura, e é exatamente por isso que a
lista de padrões passou a aceitar só alta precisão.

**O que continua aberto e é do vértice:** rotação das quatro chaves no provedor.
Não testei se estão vivas — a governança proíbe verificação que pressuponha
chamada real a provedor de LLM, então **forma** é o que se mede, nunca liveness.

### 7.3 O que a verificação melhorou

**Fonte única de padrões.** Os mesmos padrões viviam duplicados no portão
PowerShell e num teste Python. Duplicata de regra de segurança diverge por
construção: quem acrescenta um padrão de um lado não sabe do outro, e o lado
esquecido continua aprovando. Agora ambos leem
`data/PADROES_DE_CREDENCIAL.json`, e o portão **falha duro** se ela sumir.

**A pergunta que nenhum portão fazia.** O portão vê o *diff* — recorte certo,
para não reprovar dívida preexistente. Ninguém via a **árvore**.
`tests/test_credenciais.py` vê. Achou uma ocorrência: uma *fixture* que prova o
filtro de mascaramento de log. Corrigida partindo o literal em tempo de execução
— valor idêntico em runtime, nenhum pedaço com forma de credencial — nunca
isentando o arquivo. **Décima primeira vez** que um detector desta base precisa
separar citar de afirmar.

**O arquivo de padrões contém o padrão PEM que procura.** A saída não foi
isentá-lo — isentar cria ponto cego no único lugar que descreve os segredos. É
uma propriedade do **achado**: credencial de verdade não contém metacaractere de
regex.

## 8. Adendo de 2026-08-28: o resumo do executor omitia uma categoria

> Revisao obrigada pelo proprio portao de registro: a frente 4 tocou
> `scripts/ops/suite_isolada.py`, que este registro declara em `caminhos`, e o
> criterio G6 exigiu que eu voltasse aqui em vez de deixar a declaracao
> envelhecer em silencio. E a segunda vez nesta semana que o portao me pega.

O `RE_RESUMO` do executor casava `passed|failed|error`. **Nao casava `skipped`.**
A arvore isolada pula por desenho os testes que dependem de submodulo
materializado, de projeto irmao ou de artefato derivado -- exatamente a
categoria *nao verificado* -- e o relatorio imprimia so `504 passed`.

O numero era verdadeiro. A **categoria** e que sumia, e era a que mais importa
num executor cujo proposito e provar portabilidade: um teste que nao rodou nao
e um teste que passou. Vocabulario de reporte que nao cobre uma categoria a
apaga do relatorio -- variante barata do padrao dominante desta base, dentro da
ferramenta escrita para medir a base.

Corrigido: o padrao passou a reconhecer `skipped`, `xfailed` e `xpassed`, e foi
exercitado nos tres estados (so passados; falhas com pulos; entrada sem resumo
reconhecivel). A execucao seguinte imprimiu `514 passed, 4 skipped` -- os mesmos
4 pulos de sempre, agora visiveis.

## Revisao de ancora -- 2026-08-29, o portao passou a ler o indice

Ancora tocada: `scripts/ops/record_gate.py`.

O portao pegava a LISTA de arquivos do indice (`git diff --cached`) e lia o
CONTEUDO do disco. Quatro leituras sobre arquivo em stage passaram a vir do
indice, por `git show :caminho`; a quinta, que consulta documentos FORA do
stage, ficou lendo a arvore de proposito.

**A conclusao deste interludio nao muda** -- ele trata de concorrencia entre
sessoes e isolamento de `basetemp`, e a correcao nao toca nisso. Mas reforca a
tese dele por outro caminho: o mesmo repositorio observado por dois relogios
diferentes produz julgamento sobre estado que ja passou. Aqui os dois relogios
eram o indice e a arvore, dentro de um unico processo.

Ver [[registro-2026-08-29-o-portao-le-o-indice]]. O portao PowerShell
(`record_anchor_gate.ps1`, linha 134) tem a mesma falha e continua aberta.
