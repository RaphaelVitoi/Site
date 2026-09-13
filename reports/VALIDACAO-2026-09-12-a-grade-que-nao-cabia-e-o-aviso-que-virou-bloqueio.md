---
id: validacao-2026-09-12-a-grade-que-nao-cabia-e-o-aviso-que-virou-bloqueio
tipo: validacao
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: '2026-09-13T01:34:20-03:00'
atualizado_em: '2026-09-13T01:34:20-03:00'
classes: [interno, medido, frontend, governanca, proveniencia]
caminhos:
  - frontend/src/components/simulator/panels/BayesianBeliefPanel.tsx
  - .husky/commit-msg
  - tests/test_hook_commit_msg.py
  - CLAUDE.md
pendencias_resolvidas:
  - pend-2026-09-12-promover-assinatura-a-bloqueio
verificado:
  - antes, a 1600px de viewport - coluna 384px, grade 549px, transbordo 165px cortado em silencio
  - a causa era min-w-140 (35rem) dentro de contentor de 384px, com justify-center e scrollbar-hide
  - depois, a 1600px - grade 672px, 13 celulas visiveis, primeira AA e decima terceira A2s
  - depois, a 1280px - sidebar empilha, coluna 557px, celula 41.6px, 13 visiveis
  - em /biblioteca/hermeneutica-blefe a 1280px - coluna 926px, celula 50.5px, 13 visiveis
  - transbordo horizontal da PAGINA e zero nas duas rotas medidas
  - fonte do rotulo passou de 8.8px para 12.5px
  - existem SEIS grades de 13 colunas em quatro componentes; so o BayesianBeliefPanel tinha min-w
  - a ausencia de Assinatura passou de aviso a bloqueio, autorizada pelo Tier 0
  - os 8 casos antigos de assunto foram religados ao novo contrato sem perder o que mediam
  - tests/test_hook_commit_msg.py -- 41 aprovados
nao_verificado:
  - nao houve captura de tela; o pane do navegador devolveu imagem vazia e a evidencia e a medicao do DOM
  - nao foi medido em largura de telefone, so 1280 e 1600
  - as outras cinco grades de 13 colunas nao foram remedidas; nenhuma declara largura minima
revisoes_de_ancora:
  - registro: taxonomia-canonica-de-documentacao-e-relatorios
    caminhos: ['CLAUDE.md']
    parecer: ALTERACAO UNICA E IDENTICA para os 20 registros que ancoram CLAUDE.md, e declarada como tal em vez de reescrita em 20 variantes -- a SS7 ganhou o ponteiro para data/agent_identities.json e a tabela de efeitos passou a dizer bloqueia onde dizia avisa. E acrescimo mais atualizacao de fato, dentro da SS7 e so dela -- nenhuma outra secao foi tocada, e nenhuma regra mudou de sentido.
  - registro: auditoria-2026-09-03-trabalho-do-gemini-3-8-flash
    caminhos: ['CLAUDE.md']
    parecer: ALTERACAO UNICA E IDENTICA para os 20 registros que ancoram CLAUDE.md, e declarada como tal em vez de reescrita em 20 variantes -- a SS7 ganhou o ponteiro para data/agent_identities.json e a tabela de efeitos passou a dizer bloqueia onde dizia avisa. E acrescimo mais atualizacao de fato, dentro da SS7 e so dela -- nenhuma outra secao foi tocada, e nenhuma regra mudou de sentido.
  - registro: auditoria-2026-09-12-o-ci-vermelho-que-nenhum-portao-local-media
    caminhos: ['CLAUDE.md']
    parecer: ALTERACAO UNICA E IDENTICA para os 20 registros que ancoram CLAUDE.md, e declarada como tal em vez de reescrita em 20 variantes -- a SS7 ganhou o ponteiro para data/agent_identities.json e a tabela de efeitos passou a dizer bloqueia onde dizia avisa. E acrescimo mais atualizacao de fato, dentro da SS7 e so dela -- nenhuma outra secao foi tocada, e nenhuma regra mudou de sentido.
  - registro: auditoria-2026-09-12-proveniencia-executavel-do-feedback
    caminhos: ['CLAUDE.md']
    parecer: ALTERACAO UNICA E IDENTICA para os 20 registros que ancoram CLAUDE.md, e declarada como tal em vez de reescrita em 20 variantes -- a SS7 ganhou o ponteiro para data/agent_identities.json e a tabela de efeitos passou a dizer bloqueia onde dizia avisa. E acrescimo mais atualizacao de fato, dentro da SS7 e so dela -- nenhuma outra secao foi tocada, e nenhuma regra mudou de sentido.
  - registro: checkpoint-2026-06-14-infrastructure-hardening
    caminhos: ['CLAUDE.md']
    parecer: ALTERACAO UNICA E IDENTICA para os 20 registros que ancoram CLAUDE.md, e declarada como tal em vez de reescrita em 20 variantes -- a SS7 ganhou o ponteiro para data/agent_identities.json e a tabela de efeitos passou a dizer bloqueia onde dizia avisa. E acrescimo mais atualizacao de fato, dentro da SS7 e so dela -- nenhuma outra secao foi tocada, e nenhuma regra mudou de sentido.
  - registro: handoff-2026-08-29-governanca-8tiers-vulnerabilidades-subagents
    caminhos: ['CLAUDE.md']
    parecer: ALTERACAO UNICA E IDENTICA para os 20 registros que ancoram CLAUDE.md, e declarada como tal em vez de reescrita em 20 variantes -- a SS7 ganhou o ponteiro para data/agent_identities.json e a tabela de efeitos passou a dizer bloqueia onde dizia avisa. E acrescimo mais atualizacao de fato, dentro da SS7 e so dela -- nenhuma outra secao foi tocada, e nenhuma regra mudou de sentido.
  - registro: handoff-2026-08-30-auditoria-malha-agentica-e-trava-de-lfs
    caminhos: ['.husky/commit-msg', 'CLAUDE.md']
    parecer: ALTERACAO UNICA E IDENTICA para os 20 registros que ancoram CLAUDE.md, e declarada como tal em vez de reescrita em 20 variantes -- a SS7 ganhou o ponteiro para data/agent_identities.json e a tabela de efeitos passou a dizer bloqueia onde dizia avisa. E acrescimo mais atualizacao de fato, dentro da SS7 e so dela -- nenhuma outra secao foi tocada, e nenhuma regra mudou de sentido. No commit-msg, a ausencia de Assinatura passou de aviso a bloqueio por autorizacao do Tier 0, e a checagem de coerencia continua exatamente como estava.
  - registro: handoff-2026-09-12-reconciliacao-calibracao-e-proveniencia
    caminhos: ['CLAUDE.md']
    parecer: ALTERACAO UNICA E IDENTICA para os 20 registros que ancoram CLAUDE.md, e declarada como tal em vez de reescrita em 20 variantes -- a SS7 ganhou o ponteiro para data/agent_identities.json e a tabela de efeitos passou a dizer bloqueia onde dizia avisa. E acrescimo mais atualizacao de fato, dentro da SS7 e so dela -- nenhuma outra secao foi tocada, e nenhuma regra mudou de sentido.
  - registro: registro-2026-08-29-governanca-piramidal-sota
    caminhos: ['CLAUDE.md']
    parecer: ALTERACAO UNICA E IDENTICA para os 20 registros que ancoram CLAUDE.md, e declarada como tal em vez de reescrita em 20 variantes -- a SS7 ganhou o ponteiro para data/agent_identities.json e a tabela de efeitos passou a dizer bloqueia onde dizia avisa. E acrescimo mais atualizacao de fato, dentro da SS7 e so dela -- nenhuma outra secao foi tocada, e nenhuma regra mudou de sentido.
  - registro: registro-2026-09-01-ancora-de-merge-e-instrucao-indexada
    caminhos: ['CLAUDE.md']
    parecer: ALTERACAO UNICA E IDENTICA para os 20 registros que ancoram CLAUDE.md, e declarada como tal em vez de reescrita em 20 variantes -- a SS7 ganhou o ponteiro para data/agent_identities.json e a tabela de efeitos passou a dizer bloqueia onde dizia avisa. E acrescimo mais atualizacao de fato, dentro da SS7 e so dela -- nenhuma outra secao foi tocada, e nenhuma regra mudou de sentido.
  - registro: registro-2026-09-02-correcao-de-escala-e-timestamp-no-ledger
    caminhos: ['CLAUDE.md']
    parecer: ALTERACAO UNICA E IDENTICA para os 20 registros que ancoram CLAUDE.md, e declarada como tal em vez de reescrita em 20 variantes -- a SS7 ganhou o ponteiro para data/agent_identities.json e a tabela de efeitos passou a dizer bloqueia onde dizia avisa. E acrescimo mais atualizacao de fato, dentro da SS7 e so dela -- nenhuma outra secao foi tocada, e nenhuma regra mudou de sentido.
  - registro: registro-2026-09-02-portao-de-calibracao-por-sessao
    caminhos: ['CLAUDE.md']
    parecer: ALTERACAO UNICA E IDENTICA para os 20 registros que ancoram CLAUDE.md, e declarada como tal em vez de reescrita em 20 variantes -- a SS7 ganhou o ponteiro para data/agent_identities.json e a tabela de efeitos passou a dizer bloqueia onde dizia avisa. E acrescimo mais atualizacao de fato, dentro da SS7 e so dela -- nenhuma outra secao foi tocada, e nenhuma regra mudou de sentido.
  - registro: registro-2026-09-03-triade-fronteira-chico-e-concorrencia
    caminhos: ['CLAUDE.md']
    parecer: ALTERACAO UNICA E IDENTICA para os 20 registros que ancoram CLAUDE.md, e declarada como tal em vez de reescrita em 20 variantes -- a SS7 ganhou o ponteiro para data/agent_identities.json e a tabela de efeitos passou a dizer bloqueia onde dizia avisa. E acrescimo mais atualizacao de fato, dentro da SS7 e so dela -- nenhuma outra secao foi tocada, e nenhuma regra mudou de sentido.
  - registro: registro-2026-09-05-regua-para-agente-autonomo-de-nuvem
    caminhos: ['CLAUDE.md']
    parecer: ALTERACAO UNICA E IDENTICA para os 20 registros que ancoram CLAUDE.md, e declarada como tal em vez de reescrita em 20 variantes -- a SS7 ganhou o ponteiro para data/agent_identities.json e a tabela de efeitos passou a dizer bloqueia onde dizia avisa. E acrescimo mais atualizacao de fato, dentro da SS7 e so dela -- nenhuma outra secao foi tocada, e nenhuma regra mudou de sentido.
  - registro: registro-2026-09-07-integracao-gpt6-astra-e-retirada-do-fable
    caminhos: ['CLAUDE.md']
    parecer: ALTERACAO UNICA E IDENTICA para os 20 registros que ancoram CLAUDE.md, e declarada como tal em vez de reescrita em 20 variantes -- a SS7 ganhou o ponteiro para data/agent_identities.json e a tabela de efeitos passou a dizer bloqueia onde dizia avisa. E acrescimo mais atualizacao de fato, dentro da SS7 e so dela -- nenhuma outra secao foi tocada, e nenhuma regra mudou de sentido.
  - registro: registro-2026-09-08-arbitragem-soberana-sobre-a-lei-de-concorrencia
    caminhos: ['CLAUDE.md']
    parecer: ALTERACAO UNICA E IDENTICA para os 20 registros que ancoram CLAUDE.md, e declarada como tal em vez de reescrita em 20 variantes -- a SS7 ganhou o ponteiro para data/agent_identities.json e a tabela de efeitos passou a dizer bloqueia onde dizia avisa. E acrescimo mais atualizacao de fato, dentro da SS7 e so dela -- nenhuma outra secao foi tocada, e nenhuma regra mudou de sentido.
  - registro: registro-2026-09-09-saneamento-medicao-datada-identificacao-agentes
    caminhos: ['CLAUDE.md']
    parecer: ALTERACAO UNICA E IDENTICA para os 20 registros que ancoram CLAUDE.md, e declarada como tal em vez de reescrita em 20 variantes -- a SS7 ganhou o ponteiro para data/agent_identities.json e a tabela de efeitos passou a dizer bloqueia onde dizia avisa. E acrescimo mais atualizacao de fato, dentro da SS7 e so dela -- nenhuma outra secao foi tocada, e nenhuma regra mudou de sentido.
  - registro: registro-2026-09-12-a-identidade-do-antigravity-e-o-catalogo-que-faltava
    caminhos: ['.husky/commit-msg', 'tests/test_hook_commit_msg.py']
    parecer: No commit-msg, a ausencia de Assinatura passou de aviso a bloqueio por autorizacao do Tier 0, e a checagem de coerencia continua exatamente como estava. O auxiliar dos testes de assunto passou a anexar assinatura canonica, para que cada caso siga medindo a regra de assunto e nao a nova.
  - registro: registro-2026-09-12-ativacao-solvers-teoria-dos-jogos-e-multiway-pmev
    caminhos: ['frontend/src/components/simulator/panels/BayesianBeliefPanel.tsx']
    parecer: A grade 13x13 mudou de dimensionamento -- largura minima removida, quebra da sidebar por container e tipografia em cqw. Nenhum dado, calculo ou contrato do painel foi tocado.
  - registro: registro-2026-09-12-preludio-o-instrumento-que-sabia-abrir-e-nao-fechar
    caminhos: ['CLAUDE.md']
    parecer: ALTERACAO UNICA E IDENTICA para os 20 registros que ancoram CLAUDE.md, e declarada como tal em vez de reescrita em 20 variantes -- a SS7 ganhou o ponteiro para data/agent_identities.json e a tabela de efeitos passou a dizer bloqueia onde dizia avisa. E acrescimo mais atualizacao de fato, dentro da SS7 e so dela -- nenhuma outra secao foi tocada, e nenhuma regra mudou de sentido.
  - registro: relatorio-2026-06-16-auditoria-e-harmonizacao-v8-gold
    caminhos: ['CLAUDE.md']
    parecer: ALTERACAO UNICA E IDENTICA para os 20 registros que ancoram CLAUDE.md, e declarada como tal em vez de reescrita em 20 variantes -- a SS7 ganhou o ponteiro para data/agent_identities.json e a tabela de efeitos passou a dizer bloqueia onde dizia avisa. E acrescimo mais atualizacao de fato, dentro da SS7 e so dela -- nenhuma outra secao foi tocada, e nenhuma regra mudou de sentido.
  - registro: relatorio-2026-08-29-analise-integral-ecossistema-sota-v8-gold
    caminhos: ['CLAUDE.md']
    parecer: ALTERACAO UNICA E IDENTICA para os 20 registros que ancoram CLAUDE.md, e declarada como tal em vez de reescrita em 20 variantes -- a SS7 ganhou o ponteiro para data/agent_identities.json e a tabela de efeitos passou a dizer bloqueia onde dizia avisa. E acrescimo mais atualizacao de fato, dentro da SS7 e so dela -- nenhuma outra secao foi tocada, e nenhuma regra mudou de sentido.
  - registro: relatorio-2026-08-29-impacto-quantitativo-qualitativo-sota-v8-gold
    caminhos: ['CLAUDE.md']
    parecer: ALTERACAO UNICA E IDENTICA para os 20 registros que ancoram CLAUDE.md, e declarada como tal em vez de reescrita em 20 variantes -- a SS7 ganhou o ponteiro para data/agent_identities.json e a tabela de efeitos passou a dizer bloqueia onde dizia avisa. E acrescimo mais atualizacao de fato, dentro da SS7 e so dela -- nenhuma outra secao foi tocada, e nenhuma regra mudou de sentido.
  - registro: validacao-2026-09-12-a-identidade-de-autoria-deixa-de-ser-prosa
    caminhos: ['.husky/commit-msg', 'CLAUDE.md', 'tests/test_hook_commit_msg.py']
    parecer: ALTERACAO UNICA E IDENTICA para os 20 registros que ancoram CLAUDE.md, e declarada como tal em vez de reescrita em 20 variantes -- a SS7 ganhou o ponteiro para data/agent_identities.json e a tabela de efeitos passou a dizer bloqueia onde dizia avisa. E acrescimo mais atualizacao de fato, dentro da SS7 e so dela -- nenhuma outra secao foi tocada, e nenhuma regra mudou de sentido. No commit-msg, a ausencia de Assinatura passou de aviso a bloqueio por autorizacao do Tier 0, e a checagem de coerencia continua exatamente como estava. O auxiliar dos testes de assunto passou a anexar assinatura canonica, para que cada caso siga medindo a regra de assunto e nao a nova.
config_medida:
  grades_de_13_colunas: 6
  componentes: 4
  com_defeito: 1
  unidade_da_tipografia: cqw (container), nao vw
---

# A grade que não cabia, e o aviso que virou bloqueio

## 1. A grade — a causa não era a largura, era o silêncio

Medido em `/simulador/gto-cfr`, a 1600px de viewport:

| | Antes | Depois |
| :--- | ---: | ---: |
| Coluna disponível | 384 px | 744 px |
| Largura da grade | 549 px | 672 px |
| **Transbordo** | **+165 px** | **−85 px** |
| Célula | 41 px | **50 px** |
| Fonte do rótulo | 8,8 px | **12,5 px** |
| Colunas visíveis na 1ª linha | 9 de 13 | **13 de 13** |

A largura mínima era `min-w-140` — 35rem, 560px — dentro de um contêiner de
384px. Isso sozinho seria visível: apareceria uma barra de rolagem. **O que
tornava o defeito invisível era o pai:** `justify-center` centraliza o
transbordo, aparando os dois lados igualmente, e `scrollbar-hide` removia a
única pista de que havia mais grade. `AA` e `AKs` sumiam à esquerda, `A3s` e
`A2s` à direita, e nada na tela dizia isso.

**O corte simétrico é a assinatura desse par**, e foi o que permitiu identificar
a causa a partir de uma captura de tela antes de abrir o código.

## 2. Duas unidades erradas, e a segunda só apareceu depois de corrigir a primeira

Tirar o `min-w` fez a grade caber — em **404px**, com célula de 29px. Ainda
apertado. A segunda causa é da mesma família:

**A quebra da sidebar olhava a viewport.** A 1600px o `xl:` já estava ativo, e
mesmo assim sobravam 404px, porque o painel inteiro tem 744px dentro do
`lg:col-span-7`. *Breakpoint de viewport respondia a pergunta errada* — quem
decide se cabem duas colunas é a largura do **painel**. Trocado por
`@container/split` com `@[56rem]/split:`, a sidebar empilha quando o painel não
comporta as duas, e o heatmap fica com a largura toda.

**A tipografia tinha o mesmo vício.** `text-[0.55rem]` é fixo, e numa célula de
29px o rótulo já não cabia. Agora é `clamp(0.42rem, 2.1cqw, 0.78rem)`: com 13
colunas cada célula ocupa ~7,7cqw, então 2,1cqw é proporcional **à célula**, com
piso legível e teto que impede a fonte de inchar.

## 3. Onde mais a matriz aparece

Perguntado pelo Tier 0, e medido: **seis grades de 13 colunas em quatro
componentes**.

| Componente | Onde aparece | Estado |
| :--- | :--- | :--- |
| `BayesianBeliefPanel` | `/simulador/gto-cfr`, `/biblioteca/hermeneutica-blefe` | **era o defeituoso** |
| `RangeMatrix` | `IcmDistortionsContent`, `MasterSimulator` | fluido, `w-full` |
| `PmevRangeViewer` (3 grades) | `biblioteca/entendendo-o-icm...`, `biblioteca/teoria-da-perspectiva` | fluido, `aspect-square` |
| `ReferencialAula12` | `MasterSimulator` | `repeat(13, 1fr)` inline |

**Nenhuma das outras cinco declara largura mínima**, que é o que produzia o
transbordo. Não as remedi — ausência do padrão defeituoso não é prova de que
estejam boas, e digo isso como não verificado, não como aprovação.

## 4. O aviso que virou bloqueio

Autorizado pelo Tier 0 em 2026-09-12, no mesmo dia em que o aviso nasceu.
Ausência de `Assinatura:` passa a **bloquear** o commit.

O custo foi pesado antes e não mudou: atinge também o Tier 0 commitando à mão,
porque o hook não separa agente de humano sem confiar num campo que o próprio
agente escolhe — e confiar nele daria ao agente o botão de se isentar. **A regra
não tem exceção invocável, e esse é o preço.**

**Um efeito colateral que quase passou:** os oito casos antigos de assunto do
`test_hook_commit_msg.py` não traziam assinatura, e passariam a reprovar — pelo
motivo errado. Teste que reprova pelo motivo errado não mede nada, que é
exatamente a armadilha descrita no cabeçalho daquele arquivo. O auxiliar
`_rodar` passou a anexar assinatura canônica e a fixar o autor por ambiente, e
cada caso voltou a medir a regra que foi escrito para medir.

**Assinatura:** `Claude Opus 5 [Tier 1.B]` — sessão `claude-opus5-site-2026-09-12-preludio`
