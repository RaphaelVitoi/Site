---
id: registro-2026-09-12-o-pat-que-nao-abre-pr-em-repositorio-de-terceiro
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: '2026-09-12T23:12:40-03:00'
atualizado_em: '2026-09-12T23:12:40-03:00'
classes: [interno, medido, seguranca, submodulos, fronteira]
caminhos:
  - reports/REGISTRO-2026-09-12-o-pat-que-nao-abre-pr-em-repositorio-de-terceiro.md
verificado:
  - a tentativa real de abrir o PR do stitch falhou -- Resource not accessible by personal access token (createPullRequest)
  - as duas contas autenticadas no gh usam token fine-grained; nenhuma e classica
  - os tres branches existem nos forks e batem com o gitlink do superprojeto -- 454e84a5, 9c848a2a, 1b0ca5a8
  - os tres comparam ahead e zero behind contra o upstream -- aplicam limpo, sem rebase
  - stitch 1 commit e 1 arquivo; jules 1 commit e 2 arquivos; supermemory 2 commits e 15 arquivos
  - default_branch dos tres upstreams e main -- lido pela API, nao suposto
  - os tres commits de fork estao assinados Raphael Vitoi -- e-mail pessoal, o que a SS7 proibe para agente
nao_verificado:
  - nenhum dos tres PRs foi aberto; o bloqueio e de modelo de permissao, nao de configuracao
  - o fluxo OAuth do stitch nao foi executado contra projeto real
  - o workflow de release do jules nao foi executado ponta a ponta
  - nenhum dos tres upstreams foi contatado por outro canal
pendencias:
  - id: pend-2026-09-12-autoria-dos-commits-de-fork
    o_que: Decidir o que fazer com os tres commits de fork assinados com o e-mail pessoal do Tier 0 -- historico publicado nao retroage pela SS7, mas os branches ainda nao viraram PR
    dono: Tier 0
    prazo: 2026-10-12
config_medida:
  tokens_gh: dois, ambos github_pat_ (fine-grained)
  bloqueio: createPullRequest em repositorio de terceiro
  contorno_recusado: PAT classico com public_repo
---

# O PAT que não abre PR em repositório de terceiro

## 1. O bloqueio saiu de diagnosticado para medido

A pendência dizia *"bloqueado só por o PAT ser fine-grained"*. Isso era inferência
a partir da documentação. Agora é medição — a tentativa real devolveu:

```
pull request create failed: GraphQL: Resource not accessible by
personal access token (createPullRequest)
```

**Não é configuração faltando; é o modelo de permissão.** Um token *fine-grained*
só concede permissão em repositórios que o dono do token pode conceder. Um PR de
fork para upstream exige `Pull requests: write` **no repositório de destino**, que
é de terceiro — inalcançável por construção, e nenhuma combinação de permissões
na conta do Tier 0 muda isso.

## 2. O contorno óbvio é desproporcional, e fica recusado

Um PAT clássico com `public_repo` resolveria. Ele também abriria escrita em
**todos** os repositórios públicos alcançáveis pela conta, permanentemente, para
resolver três pull requests. É exatamente o que a §3 da raiz chama de ampliar, e
o mesmo raciocínio que recusou relaxar `allow-git` na §2.5: *duas capacidades
nunca invocadas não pagam um controle permanente de cadeia de suprimentos*.

Recusado, e registrado como recusa — não como esquecimento.

## 3. O que foi medido sobre os três branches

Todos aplicam limpo. Nenhum precisa de rebase.

| Upstream | Branch no fork | Commits | Arquivos | Contra o upstream |
| :--- | :--- | ---: | ---: | :--- |
| `gemini-cli-extensions/stitch` | `fix/escopo-oauth-cloud-platform` | 1 | 1 | ahead 1, behind 0 |
| `gemini-cli-extensions/jules` | `fix/injecao-no-workflow-e-registro-da-tool` | 1 | 2 | ahead 1, behind 0 |
| `Rishabjs03/gemini-supermemory` | `refactor/remove-egress-automatico-de-sessao` | 2 | 15 | ahead 2, behind 0 |

## 4. O que sobra para o Tier 0, e é um clique cada

O caminho que não amplia nada é o formulário de comparação do GitHub, aberto na
conta dele. Os três, com título e corpo já redigidos:

- **stitch** — https://github.com/gemini-cli-extensions/stitch/compare/main...RaphaelVitoi:fix/escopo-oauth-cloud-platform?expand=1
- **jules** — https://github.com/gemini-cli-extensions/jules/compare/main...RaphaelVitoi:fix/injecao-no-workflow-e-registro-da-tool?expand=1
- **supermemory** — https://github.com/Rishabjs03/gemini-supermemory/compare/main...RaphaelVitoi:refactor/remove-egress-automatico-de-sessao?expand=1

Os corpos completos, em inglês, estão na §5. A versão com título e corpo
**pré-preenchidos na própria URL** foi entregue em arquivo à parte na sessão —
ela não entra aqui porque três URLs de 3 KB tornariam este registro ilegível, e
registro que ninguém lê é o defeito que a §9.2 combate.

## 5. Os corpos

### `stitch` — `fix(oauth): scope is cloud-platform, not cloud_platform`

Uma linha, um caractere: `cloud_platform` → `cloud-platform`. O escopo com
underscore não existe, e a autorização falha. Conferido contra três consumidores
independentes de OAuth do Google presentes no ambiente local — `google-auth`,
`google-genai` e o cliente Vertex da Anthropic —, todos com hífen. **Não
verificado:** o fluxo OAuth não foi executado contra projeto real.

### `jules` — `fix(ci): close script injection in release workflow`

`gh release upload ${{ github.event.release.tag_name || inputs.tag_name }}` —
interpolação de expressão do GitHub dentro de `run:` é o vetor clássico de
injeção em Actions: o valor entra no texto do shell **antes** da execução, então
nome de tag com metacaractere executa. Passa por variável de ambiente, aspeada.
No mesmo arquivo, `checkout` e `setup-node` saem de tag móvel para SHA fixo.

No servidor MCP: `exec` deixa de ser importado (só `execFile` era usado, e o
import ao lado deixava a API com shell a um caractere de distância),
`child_process` → `node:child_process`, e `server.tool()` → `registerTool()`.
Sem indireção por `Reflect`, que derrotaria análise estática sem ganho.

### `gemini-supermemory` — `fix(sec): remove session-end egress hook`

Remove o hook que enviava resumo de sessão para API externa, e **depois remove o
artefato compilado**. O segundo commit é o que importa para o revisor: `dist/`
está versionado e é o que o runtime carrega, então apagar só a fonte deixa o
caminho de egresso inteiramente operante — o comportamento some do código que se
lê e permanece no código que roda.

## 6. Um achado lateral, e ele é da nossa casa

Os três commits de fork estão assinados `Raphael Vitoi <raphavitoi@gmail.com>`.
É o e-mail pessoal do Tier 0 num commit produzido por agente, exatamente o que a
§7 proíbe e o incidente de 2026-08-30 documentou. A §7 também diz que **histórico
publicado não retroage** — e estes branches estão publicados nos forks.

A diferença aqui é que eles **ainda não viraram PR**: reescrevê-los não quebra
checkout de terceiro nem âncora de revisão, porque não há revisão. A janela para
corrigir sem custo fecha no instante em que o primeiro PR abrir. Declarado como
pendência, com prazo, e não decidido por mim — força-push em branch publicada é
decisão dele.

**Assinatura:** `Claude Opus 5 [Tier 1.B]` — sessão `claude-opus5-site-2026-09-12-preludio`
