---
id: auditoria-2026-08-28-skills
tipo: auditoria
escopo: multiprojeto
ecossistema: gemini-antigravity
autor: claude@opus-5
criado_em: 2026-08-28T02:10-03:00
commit: 4792e73b
classes: [interno, medido]
config_medida:
  raiz: C:/Users/rapha/.gemini
  data_das_medicoes: 2026-08-28
  exclusoes: [node_modules, .venv, .git]
verificado:
  - os 8 diretorios de Site/skills identificados como SUBMODULOS (.gitmodules,
    gitlinks modo 160000, HEAD de cada um batendo com o gitlink registrado)
  - estado sujo de cada submodulo medido por git status --porcelain
  - SKILL.md ativos e SKILL.md.bak contados em toda a arvore, por diretorio
  - manifesto gemini-extension.json lido nos 8 -- versao, mcpServers, env
  - registro de habilitacao e ledger de integridade do CLI conferidos
nao_verificado:
  - NENHUMA skill foi executada. "Funcional" aqui significa estruturalmente
    apta a carregar (manifesto valido, arquivo de contexto presente, SKILL.md
    nao renomeado), nunca observacao de funcionamento.
  - os servidores MCP nao foram levantados; nenhuma chamada foi feita.
  - o manifesto nao declarar variavel de ambiente NAO prova que a skill
    dispensa credencial -- o servidor MCP pode exigi-la em tempo de execucao.
    As chaves deste ambiente estao revogadas.
  - as modificacoes locais nos submodulos foram contadas e classificadas por
    tipo de arquivo, mas o CONTEUDO dos 62 fontes modificados nao foi lido.
  - nao foi medido por que cada SKILL.md foi renomeado nem por quem.
supersede: null
---

# AUDITORIA — as skills: funcionais, agregam, evoluem?

> Solicitada por Raphael Vitoi em 2026-08-28.
> Sequência do [MAPA DE REFERÊNCIA](PLANO-2B-CURADORIA-ESTRUTURAL.md) §1.5.

## 0. Correção — meu achado de ontem estava errado sobre a natureza

A §1.5.5 do plano concluiu que `Site/skills/` era um *"fork mais novo que não
roda"*, com 53 arquivos de trabalho recente supostamente perdidos.

**A natureza estava errada.** Existe `.gitmodules`, os 8 diretórios são gitlinks
modo `160000`, e o `HEAD` de cada um bate exatamente com o gitlink registrado.
São **submódulos** apontando para upstreams públicos — `obra/superpowers`,
`exa-labs/exa-mcp-server`, `gemini-cli-extensions/*`.

Os "53 divergentes" não eram trabalho editado: eram **versões diferentes**. O
`Site/skills/superpowers/CLAUDE.md` de 7.574 B não foi encolhido por alguém — é o que o
upstream publica hoje, e o de 8.506 B em `extensions/` é uma cópia congelada de
01/06.

O que estava certo: a árvore que o CLI carrega é `extensions/`, e ela está mais
velha. O que estava errado: chamar de fork o que é submódulo, e falar em perda
de trabalho onde havia atualização de dependência.

**Por que errei:** medi `cmp` e `mtime`, que respondem *"são diferentes?"*, e
pulei `git ls-files -s`, que responde *"o que isto é?"*. A pergunta de natureza
precede a de diferença.

---

## 1. Onde as skills realmente estão

Contagem global (fora de `node_modules`): **95 ativas, 376 desligadas.**

| Diretório | Ativas | Desligadas | Natureza |
| :--- | ---: | ---: | :--- |
| `~/.gemini/skills/` | **29** | 0 | Conjunto GCP/BigQuery, coeso e íntegro |
| `~/.gemini/config/plugins/` | **45** | 38 | Skills de plugin (firebase, flutter, maps, chrome-devtools…) |
| `Site/` (fora de `skills/`) | 6 | 50 | |
| `antigravity/` | 5 | 0 | |
| `Site/skills/` (submódulos) | **2** | 18 | |
| `extensions/` | **0** | **56** | **a árvore que o CLI carrega** |
| `antigravity-cli/plugins/` | **0** | **93** | espelho de `extensions/` |
| `plugins_quarantine/` | 0 | 135 | **quarentena deliberada e bem nomeada** |

**Achado 1 — a árvore viva tem zero skills ativas.** Em `extensions/`, que é
onde o registro de habilitação do CLI mora, todas as 56 estão renomeadas. O
mesmo em seu espelho `antigravity-cli/plugins/`, com 93.

---

## 2. O achado de nomenclatura: dois mecanismos para a mesma intenção

Você pediu para refletir sobre nomes e ambiguidades. Ela está aqui, e é nítida.

**Existem duas formas de desligar uma skill nesta casa:**

| | Mecanismo explícito | Mecanismo implícito |
| :--- | :--- | :--- |
| Onde | `plugins_quarantine/` | em qualquer lugar, no próprio diretório |
| Como | mover, e sufixar `.disabled` | renomear `SKILL.md` → `SKILL.md.bak` |
| Quantas | 135 | **241** |
| Visível? | sim — o nome do diretório declara a intenção | **não** — parece backup |
| Reversível? | óbvio | sim, mas ninguém sabe que precisa |

**O `.bak` é um nome que mente.** Nenhum dos 376 tem um `SKILL.md` ao lado —
não são cópia de segurança de coisa alguma. **São a própria skill, desligada.**
Um nome que descreve o mecanismo (`.bak` = copiei antes de mexer) onde deveria
descrever a intenção (`.disabled` = desliguei de propósito).

O `plugins_quarantine/` prova que a casa **já sabe** a forma certa: nome que
declara a intenção, separação física, sufixo `.disabled`. O padrão bom existe e
não foi aplicado nos outros 241.

**Achado 2 — não é falta de convenção, é convenção não propagada.**

### 2.1 Evidência viva, desta própria sessão

O prompt desta sessão carrega:

```
cat: .../superpowers/6.3.0/skills/using-superpowers/SKILL.md: No such file or directory
Error reading using-superpowers skill
```

A skill que apresenta as demais falhou ao carregar, **agora**, por `SKILL.md`
ausente. É o mesmo mecanismo, atingindo o ponto de entrada de todo o conjunto.

---

## 3. `ignore = dirty` — 128 modificações locais invisíveis

Todos os 8 submódulos declaram `ignore = dirty` no `.gitmodules`. Isso instrui
o `git status` a **não reportar** alteração dentro deles.

Resultado medido: `git status` diz árvore limpa, e há **128 arquivos
modificados** — 62 deles código-fonte (`.ts`, `.js`, `.py`).

| Submódulo | Sujos | Fontes modificados |
| :--- | ---: | ---: |
| `superpowers` | 40 | 7 |
| `exa-mcp-server` | 34 | 23 |
| `gemini-cli-security` | 22 | 12 |
| `gemini-supermemory` | 15 | 11 |
| `gemini-deep-research` | 12 | 7 |
| `Stitch` | 2 | 0 |
| `gemini-cli-jules` | 2 | 1 |
| `token-efficiency` | 1 | 1 |

**Achado 3 — árvore limpa por instrução, não por fato.** É a família de falha
desta casa em forma de configuração. `ignore = dirty` tem uso legítimo (evitar
ruído de build), mas aqui esconde 62 fontes modificados sobre upstream. Um
`git submodule update` os apaga sem aviso.

**Isto é o que corre risco real** — não os "53 divergentes" que eu tinha
apontado, que eram só versão.

---

## 4. As 8 skills, uma a uma

Legenda de **Estado**: *apta* = manifesto válido e `SKILL.md` presente;
*desligada* = `SKILL.md` renomeado; *sem skills* = extensão puramente MCP.

### `superpowers` v5.1.0 — biblioteca de skills · **desligada**
TDD, debugging, padrões de colaboração. Sem MCP: é biblioteca pura.
**14 de 14 `SKILL.md` desligados.** 7 fontes modificados localmente.
**Agrega:** alto — é o conjunto de método, e o mais alinhado ao rigor que esta
base já pratica (teste de mutação, ler o componente inteiro).
**Refinamento:** religar é a maior alavanca de valor de toda a lista. Antes,
decidir se as 7 modificações locais são customização a preservar ou deriva.

### `gemini-cli-security` v0.5.0 — **desligada** · maior desperdício medido
Dois servidores MCP: `securityServer` e **`osvScanner`**.
3 `SKILL.md` desligados, 12 fontes modificados.
**Agrega:** o `CLAUDE.md` §2 deste projeto **prescreve** consultar `api.osv.dev`
manualmente para auditar o `uv.lock`. Há um scanner OSV empacotado, desligado,
a três diretórios de distância da regra que pede o que ele faz.
**Refinamento:** religar e ligar ao portão de pre-commit fecha uma lacuna que
hoje é trabalho manual prescrito por escrito.

### `exa-mcp-server` v3.2.1 — busca web · **sem skills, MCP ativo**
1 `SKILL.md` desligado; a função principal é o MCP `exa`.
**23 fontes modificados** — o mais customizado do conjunto.
**174 MB, 17.081 arquivos** (`node_modules` do submódulo).
**Agrega:** busca e crawling web, capacidade que o ambiente não tem de outro
jeito. **Ressalva não verificada:** o manifesto não declara variável de
ambiente, mas o serviço Exa normalmente exige `EXA_API_KEY` — e as chaves deste
ambiente estão revogadas.
**Refinamento:** ler os 23 fontes modificados antes de qualquer `submodule
update`. É onde há mais trabalho local em risco.

### `gemini-supermemory` v1.0.0 — memória persistente · **sem skills, MCP**
11 fontes modificados.
**Agrega:** *sobreposição direta* com o `memory_rag.py` + LanceDB que o `Site`
já opera. Duas memórias persistentes concorrentes é a mesma classe de problema
da frente 4 do plano (dois paradigmas de roteamento).
**Refinamento:** decidir qual é a autoridade **antes** de investir em qualquer
uma. Enquanto não decidir, melhorar as duas é retrabalho garantido.

### `gemini-deep-research` v0.2.11 — **1 SKILL.md ativo**
MCP próprio, `contextFileName: deep-research-GEMINI.md` (nome próprio — não
colide com os outros 30 `GEMINI.md`, e é o único que faz isso).
7 fontes modificados. Não existe em `extensions/`.
**Agrega:** pesquisa profunda multi-etapa. Sem sobreposição no ecossistema.
**Refinamento:** o nome do arquivo de contexto é o **padrão correto** que as
outras deveriam seguir — ver §5.

### `token-efficiency` v1.0.0 — **1 SKILL.md ativo**
Sem MCP. 1 fonte modificado. 18 arquivos, 48 KB — a mais leve.
**Agrega:** reduzir desperdício de token em bash e processamento de arquivo.
Alinhada com o volume de operação desta casa.
**Refinamento:** é pequena e ativa. Candidata natural a servir de modelo de
como uma skill saudável se parece aqui.

### `gemini-cli-jules` v0.1.0 — **sem skills, MCP** · sem descrição
MCP `julesServer`. 1 fonte modificado. Manifesto **sem campo `description`**.
**Agrega:** indeterminado — o manifesto não diz o que faz, e é v0.1.0.
**Refinamento:** exige decisão sua sobre manter. Sem descrição e na primeira
versão menor, é a de menor evidência de valor do conjunto.

### `Stitch` v0.1.4 — geração de UI a partir de texto/imagem · **sem skills**
8 arquivos, 31 KB. MCP `stitch`. Zero fontes modificados — intocada.
**Agrega:** geração de UI. O `Site` tem frontend Next.js, então há encaixe
possível, mas nada no repositório a consome.
**Refinamento:** é a única jamais modificada. Ou é a mais estável, ou a menos
usada — e essas duas hipóteses se distinguem pelo uso, que não é medível aqui.

---

## 5. Nomes e ambiguidades — o que refinar

| # | Ambiguidade | Evidência | Proposta |
| :--- | :--- | :--- | :--- |
| 1 | `SKILL.md.bak` diz "backup" e significa "desligada" | 376 arquivos, **zero** com `SKILL.md` ao lado | Adotar o sufixo que a casa já usa: `.disabled` |
| 2 | Dois mecanismos de desligamento coexistem | 135 em quarentena nomeada × 241 renomeados no lugar | Um só: mover para quarentena, ou sufixar `.disabled`. Nunca ambos |
| 3 | `Site/skills/` não contém skills do `Site` | são 8 submódulos upstream; `Site/.claude/skills` não existe | Renomear para `Site/vendor/gemini-extensions/` ou similar — o nome promete o que não entrega |
| 4 | 30 `GEMINI.md` homônimos como arquivo de contexto | só `gemini-deep-research` usa nome próprio (`deep-research-GEMINI.md`) | Propagar o padrão dele: `<extensao>-GEMINI.md` |
| 5 | `extensions/` × `antigravity-cli/plugins/` × `Site/skills/` | três árvores, espelho incompleto nos dois sentidos | Declarar qual é a instalada; as outras viram referência explícita |
| 6 | `plugins_quarantine/` mistura `.disabled` e nome limpo | `flutter` e `flutter.disabled`, `science` e `science.disabled` | Sufixo consistente, ou subdiretórios `ativas/` e `desligadas/` |

---

## 6. Veredito

**Funcionais?** Estruturalmente aptas: **2 de 8** no `Site/skills/`, e **0 de 56**
na árvore que o CLI carrega. O ecossistema tem 95 skills ativas, mas nenhuma
delas vem de `extensions/`.

**Agregam?** Três agregam de forma clara e mensurável: `superpowers` (método),
`gemini-cli-security` (o scanner OSV que a própria governança pede à mão) e
`token-efficiency` (já ativa). Uma **conflita**: `gemini-supermemory` disputa
com o RAG do `Site`. Duas são indeterminadas por falta de evidência de uso
(`Stitch`, `gemini-cli-jules`).

**Evoluem?** Sim, e há 62 fontes modificados provando que já evoluíram — mas
essa evolução está **invisível ao `git status` e sujeita a apagamento** por um
`git submodule update`. Esse é o risco mais concreto desta auditoria.

### Ordem recomendada

1. **Preservar antes de qualquer coisa.** Os 62 fontes modificados nos
   submódulos precisam ser lidos e commitados nos forks, ou perdidos
   deliberadamente. Hoje estão num limbo que uma operação de rotina destrói.
2. **Padronizar o desligamento** (`.disabled`), que torna 376 decisões
   invisíveis em decisões legíveis. Barato e reversível.
3. **Religar `gemini-cli-security`**, a maior lacuna medida: a governança
   prescreve à mão o que ele automatiza.
4. **Decidir memória**: `supermemory` ou `memory_rag`. Antes de investir em
   qualquer uma.
5. **Renomear `Site/skills/`**, que não contém skills do `Site`.

Os itens 1 e 4 são decisão sua. Os 2, 3 e 5 são execução, com o item 5
dependendo da frente 1 do plano 2-B.

---

## 6.1 O portão me pegou, e eu não o afrouxei

Ao commitar esta auditoria, o portão de âncora **bloqueou** — uma docstring do
teste novo citava um supressor de linter ao documentar o próprio padrão. É a
quarta vez em dois dias que um detector desta casa reprova a prosa que o
descreve: o portão de âncora com os próprios comentários, o guard de roteamento
com `Convert-DeepJsonStringSOTA`, o guard do literal de warnings, e agora este.

A regra do portão pula linhas que são **só** comentário. Uma linha de docstring
não começa com `#`, então passa pelo filtro e cai no detector.

**A correção óbvia seria ampliar a isenção para docstrings** — e o princípio
declarado no próprio portão a sustentaria: *"prosa que CITA não é supressor"*.
Não fiz. Ampliar exceção de um detector de segurança para me desbloquear é a
forma sofisticada de contornar o hook, e a governança proíbe contornar hook que
falha. Reescrevi a prosa e deixo a mudança de regra para uma decisão com
contexto, não para um patch de conveniência às duas da manhã.

**Registrado como candidato a POSTULADO:** a recorrência (4×/2 dias) sugere que
o filtro deveria ser *"o supressor precisa anotar código na mesma linha"* em vez
de *"a linha não pode ser um comentário"*. É mudança em detector de segurança e
exige medição dos dois estados antes de qualquer coisa.

---

## 7. Declaração (governança §5)

Rodaram: identificação da natureza dos 8 diretórios via `.gitmodules` e
`git ls-files -s`; estado sujo de cada submódulo; contagem de `SKILL.md` e
`SKILL.md.bak` em toda a árvore, por diretório de topo; leitura dos 8
manifestos; conferência do registro de habilitação e do ledger de integridade.

**Não rodaram, e por quê:** nenhuma skill foi executada — *funcional* aqui
significa **estruturalmente apta a carregar**, jamais funcionamento observado.
Nenhum servidor MCP foi levantado. O manifesto não declarar variável de
ambiente **não prova** que a skill dispensa credencial: o MCP pode exigi-la em
runtime, e as chaves deste ambiente estão revogadas. O conteúdo dos 62 fontes
modificados foi contado e classificado, **não lido**. Não foi medido por que
cada `SKILL.md` foi renomeado nem por quem.
