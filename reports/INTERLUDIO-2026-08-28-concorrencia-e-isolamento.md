---
id: interludio-2026-08-28-concorrencia-e-isolamento
tipo: relatorio
escopo: Site
ecossistema: gemini-antigravity
autor: claude@opus-5
criado_em: 2026-08-28T05:05-03:00
commit: 71934ef7
classes: [interno, medido]
caminhos:
  - scripts/ops/suite_isolada.py
  - scripts/ops/record_gate.py
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  suite_arvore_viva: 504 passed
  suite_arvore_isolada: 500 passed, 4 skipped
  data: 2026-08-28
verificado:
  - as 4 edicoes da outra sessao auditadas uma a uma por EXECUCAO, nao leitura
  - cwv_gate.ps1 parseado em pwsh 7 e em Windows PowerShell 5.1, e executado
  - veredito unico exercitado -- console, JSON, Markdown e exit code coerentes
  - identidade de modulo medida antes e depois (`a is b` de False para True)
  - suite completa rodada nas DUAS arvores, viva e isolada
  - o executor isolado exercitado com --sujo, --incluir-novos e --comando
  - guarda de subcomando git do executor provada -- pegou um `ls-files` novo
nao_verificado:
  - o handoff da outra sessao NAO foi commitado nem alterado; continua nao
    rastreado e e decisao do vertice
  - o risco P0 de credencial em argumento de MCP que aquele handoff declara nao
    foi verificado nem remediado -- exige rotacao no provedor, fora deste escopo
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

Não rodaram: o handoff da outra sessão continua não rastreado e intocado — é
decisão do vértice; o risco P0 de credencial que ele declara não foi verificado
nem remediado; o executor não foi rodado contra o `antigravity` de fato, só
testado em unidade; nenhum MCP, skill ou proxy foi levantado.
