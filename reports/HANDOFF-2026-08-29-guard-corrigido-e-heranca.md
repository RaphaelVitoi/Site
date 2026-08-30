---
id: handoff-2026-08-29-guard-corrigido-e-heranca
tipo: handoff
escopo: Site
ecossistema: gemini-antigravity
autor: claude@opus-5
criado_em: 2026-08-29T04:45-03:00
atualizado_em: 2026-08-29T23:26-03:00
commit: 07492035
classes: [interno]
caminhos:
  - scripts/cli/nexus.py
  - data/TETOS_DE_MEMORIA.json
  - tests/test_guard_memoria.py
commits:
  - badd4445 -- remove prisma-mcp-server do manifesto do projeto
  - 434d2967 -- faxina do antecessor preservada, com o que ela levou junto
  - 07492035 -- pendencias 9 e 10, a periodica parou de fabricar o teto
verificado:
  - suite completa 631 passed (623 herdados mais 8 novos), com basetemp isolado
  - ruff limpo em tests/ e nos modulos tocados; pyright 0 errors no nexus.py
  - seis mutacoes exercitadas, cada uma reprovando o teste que deve reprova-la
  - ops guard --once rodado em campo tres vezes, medindo 88,4% / 89,3% / 59,6%
  - YAML de todo registro tocado lido do INDICE, e nao da arvore
  - cobranca do portao de ancora recomputada a zero antes de cada commit
  - indice de registros regenerado -- 22 VIGENTE, 0 SUSPEITO, 1 OBSOLETO
nao_verificado:
  - o --watch nao rodou por horas; a prova de que a periodica suspende e de
    teste, e nao de laco real em campo
  - nao auditei se processo externo escreve nos dois JSON de catalogo em tempo
    de execucao; a garantia do registro de S602 e de versionamento
  - warning do ruff em tests/test_rag_id_unico.py linha 54 continua, onde a
    PROSA cita um noqa ao documentar o detector -- citacao, nao supressor
---

# Handoff -- o guard corrigido, e a heranca do antecessor

## 1. O achado que fechou

`optimize-ram --watch` tinha um ramo periodico que disparava a cada `interval`
**sem checar coisa alguma**. A acao dele e trim de working set; trim empurra
pagina para a standby list; standby conta como disponivel; e
`virtual_memory().percent` **cai**.

Em 7h54m de execucao foram cerca de 95 disparos, e a RAM ficou imovel em
72-73%. O guard fabricava o teto que existia para vigiar, e mascarou a pressao
real por oito horas. O reboot do operador foi o experimento de controle: sem
ele, a RAM variou de 61,1% a 93,0%.

A correcao nao foi apertar o limiar. Foi trocar **a grandeza que decide**.

```
_pressao_justifica_higienizacao()  ->  decide por COMMIT CHARGE
```

O criterio nao pode ser `percent`, porque `percent` e a grandeza que a acao
contamina -- seria pedir a acao que avalie a si mesma. Commit nao se move com
trim: pagina prometida continua prometida. Piso em 75%, teto declarado em 92%.

Junto disso:

- ciclo que **nao** age agora diz por que nao agiu. "Nada aconteceu" era
  indistinguivel de "o guard morreu".
- ciclo que age mede commit **antes e depois** e registra o delta. Higienizacao
  que nao devolve nada aparece no log, em vez de sair como "executada".
- sem medidor de commit a periodica **suspende**. Ausencia de medidor nao e
  ausencia de pressao, e agir no escuro contaminaria a leitura restante.

## 2. Uma pendencia minha que a medicao derrubou

Eu havia escrito a pendencia 10 como *"trocar 98% por uma grandeza que cruza"*.
Executada ao pe da letra, ela faria a camada `ram` disparar
`_execute_ram_cleanse` -- o trim. **Resolveria a pendencia 10 reintroduzindo o
defeito da 9**, agora deliberadamente.

E nao ha saida trocando de grandeza: `free GB` tambem sobe com o trim, porque a
acao e sobre RAM fisica. Nenhuma leitura de RAM fisica escapa de uma acao que
mexe em RAM fisica.

O teto **fica em 98**. A camada `ram` e reportadora; quem atua e `commit`.

O defeito real da 10 nao era o numero, era o silencio: o bloco
`inalcancavel_nesta_maquina` existia no JSON e **nenhuma linha o lia**. Agora
`_medir_pressao` le, e o resumo marca:

```
ram=59.6%! | commit=57.2% | vram=? | cache=0.0MB
mais pressionada: commit a 62% do seu teto
```

`!` e `?` nao se atropelam: **cego** nao e o mesmo que **decorativo**.

## 3. A heranca do antecessor

O agente anterior (Opus 4.6) limpou os gritos de lint e sintaxe, e a sessao
dele terminou **antes do commit**. As cerca de 900 linhas estavam soltas na
arvore, sem stash e sem branch -- perdiveis no primeiro checkout. Preservadas
em `434d2967`.

O que ele fez: oito helpers extraidos de codigo triplicado no `nexus.py`, dois
no `memory_rag.py`, `logger.exception` no lugar de `logger.error`, import morto
fora, constante `MSG_SEM_MEDIDOR`, e `enforce_lru_eviction` publico.

Quatro coisas que a faxina levou junto e voltaram:

| # | o que | por que importa |
| :-- | :--- | :--- |
| 1 | `_agir_por_camada` perdeu o parametro `leitura` sem atualizar tres chamadores | `("ram", {})` passou a ligar `{}` em `verbose`; `bool({})` e `False`, entao passavam **por acaso** |
| 2 | as tres justificativas dos `noqa: BLE001` | diziam por que o except amplo esta certo ali; sem elas o proximo estreita, e vira ausencia-de-medidor-como-zero |
| 3 | `setattr(_get_key, ...)` | corrigi para atribuicao direta e o Pyright reprovou a correcao -- virou flag de modulo |
| 4 | justificativa colada dentro do `# noqa:` | quebra a sintaxe do supressor (S7632); foi para a linha de cima |

E duas dividas que a refatoracao **expos**, e nao criou:

- dois `# noqa: S602` sem `Record-Id`. O portao so cobra linha adicionada, e a
  faxina as MOVEU. Rastreei a origem das strings -- dois JSON versionados,
  nenhuma entrada de usuario -- e escrevi
  [[registro-2026-08-29-shell-true-nos-catalogos]].
- 23 nomes de teste com maiuscula (N802) em 10 arquivos, todos desta linhagem.
  Eu os declarei "estilo da casa"; o vertice corrigiu -- nunca foram convencao.
  Renomeados, e a suite seguiu em 623, o que prova que nenhum colidiu.

## 4. Estado

```
master 07492035
suite  631 passed  |  ruff limpo  |  pyright 0 errors
indice 134 registros -- 22 VIGENTE, 0 SUSPEITO, 1 OBSOLETO
arvore limpa (so .codex/config.toml e reports/agent-calibration/daily/, nao meus)
```

23 arquivos, 969 insercoes, 479 remocoes em tres commits.

## 5. Pendencias

Fechadas nesta sessao: **9** (higienizacao periodica) e **10** (teto
inalcancavel silencioso).

Abertas, na ordem em que eu pegaria:

| # | pendencia | por que ainda esta aberta |
| :-- | :--- | :--- |
| 11 | **frota MCP** -- 99 processos `node` num boot limpo, 6,63 GB de commit para 0,10 GB residente (70x) | e a maior alavanca real da estacao de trabalho, e mexe em configuracao que o operador usa |
| 1 | `PRIORITY_WEIGHTS` carregado e nunca lido -- a fila ordena por string no SQL | fazer o peso valer muda ordem de execucao |
| 2 | `Rota.fallback` sem consumidor | ligar torna `gemma4:e4b` alcancavel, e ele nao cabe na VRAM |
| 5 | `LOCAL_MODEL_MAP`, `_MODEL_31B`, `GEMINI_ALL_KEYS_WITH_POOLS` | orfaos aguardando veredito |
| 3 | indices Chroma antigos -- 4 diretorios, cerca de 840 MB, gitignored | espaco, e C: esta abaixo de 10% livre |
| 4 | arvores superadas -- `.cerebro/agent-memory` e `.claude/AGENTS-MEMORY` | idem |
| 6 | rotacao das 4 chaves OpenRouter | acao do operador, nao minha |
| 7 | 62 fontes de submodulo modificadas | precisa de decisao de propriedade |
| 12 | exclusoes do Defender para diretorios de build | estreita uma protecao -- decisao do operador |
| 13 | C: e D: abaixo de 10% livre (108 GB e 42,9 GB) | idem |
| 14 | o portao de registro le a arvore enquanto o commit leva o indice | mexe num portao de governanca |

## 6. Prompt de continuidade

> Voce assume o `Site` em `C:\Users\rapha\.gemini\Site`, o unico repositorio git
> desta raiz multiprojeto. Leia `CLAUDE.md` e `MODUS_OPERANDI.md` (secoes
> 1.1-1.3, 12 e 13) antes de propor arquitetura.
>
> Rode `git status` antes de qualquer coisa e **nunca use `git add -A`**: outra
> sessao ja editou este repo em paralelo, e a sessao anterior a esta terminou
> com cerca de 900 linhas nao commitadas na arvore. Estagie sempre por caminho
> explicito.
>
> Rode a suite com `--basetemp` proprio. Sem isso, duas execucoes concorrentes
> compartilham `pytest-of-<user>` e o `tmp_path_factory` de uma apaga o
> `pytest-N` da outra -- foi o que produziu 49 erros identicos de "diretorio nao
> existe" em 2026-08-29, diagnosticados como infraestrutura quando eram
> concorrencia.
>
> Ao commitar, espere os portoes: o de **ancora** cobra `Record-Id` em supressor
> de seguranca em linha ADICIONADA, e o de **registro** exige que todo documento
> que declare `caminhos:` tocados pelo commit seja revisado no mesmo commit. Nao
> contorne nenhum dos dois -- investigue o achado. E confira o resultado com
> `git show <sha>:<arquivo>`, nunca lendo a arvore: o portao le a arvore enquanto
> o commit leva o indice, e ja aprovei conteudo que nao foi commitado por causa
> disso (pendencia 14).
>
> **Pendencia mais quente: a 11, a frota MCP.** Num boot limpo sao 99 processos
> `node` com 6,63 GB de commit para 0,10 GB residentes -- razao de 70. O commit
> e a grandeza que decide recusa de alocacao nesta maquina, e essa frota e a
> maior parcela dele. E a alavanca real da estacao de trabalho. Mexe em
> configuracao que o operador usa todo dia, entao meça primeiro e proponha
> depois.
>
> Uma regra que esta sessao pagou caro para aprender, e que vale antes de
> desenhar qualquer gatilho automatico: **a acao que voce vai disparar altera a
> leitura que a disparou?** Se sim, o portao fabrica o proprio verde. Foi assim
> que o guard de memoria passou oito horas dizendo 72-73% enquanto a maquina
> variava de 61 a 93.
