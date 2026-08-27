---
id: auditoria-2026-08-27-dashboard-comandos-vazios
tipo: auditoria
escopo: Site
ecossistema: gemini-antigravity
autor: claude@opus-5
criado_em: 2026-08-27T19:45-03:00
commit: f3f7084e
classes: [interno, medido]
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  baseline_suite_antes: 415 passed
  baseline_suite_depois: 437 passed
  data_das_medicoes: 2026-08-27
verificado:
  - os 18 atalhos do dashboard rastreados do cmd_map ate o corpo da funcao
  - painel anunciado conferido contra o cmd_map (18 x 18, nenhum botao orfao)
  - exit code de comando inexistente no despacho legado, antes e depois
  - bool(typer.OptionInfo) e o comportamento de optimize_ram() sem argumentos
  - os 5 call-sites de comando typer chamado como funcao Python
  - cwv_gate.ps1 executado: contagem de warnings e exit code reais
  - existencia em disco das 4 fontes de governanca que o handoff injeta
  - tres mutacoes aplicadas e revertidas, cada uma reprovando seu teste
  - segunda rodada: 7 formas de mutacao sobre as 9 correcoes de fechamento,
    cada uma reprovando seu teste, com a contagem de testes coletados conferida
nao_verificado:
  - `nexus ops maintenance` NAO foi executado ponta a ponta: o passo 3 e
    sanitize --apply, que deleta arquivos. A correcao foi provada por teste
    com as sub-etapas mockadas e pela execucao isolada do passo 1.
  - `nexus ops quality-gate` completo (10 fases) nao foi executado; a derivacao
    foi provada com a saida real do cwv_gate.ps1 injetada em teste.
  - o loop interativo do dashboard nao foi exercitado; so o caminho --once.
  - nenhuma chamada real a provedor de LLM (chaves revogadas neste ambiente).
supersede: null
---

# AUDITORIA — comandos vazios no Dashboard Executivo

> Solicitada por Raphael Vitoi em 2026-08-27: *"comandos/scripts vazios de
> função e devolvendo output gracioso de 0 inseridos no dashboard que n tive
> tempo de refatorar. Pode checar."*
>
> Sequência do [INTERLÚDIO](INTERLUDIO-2026-08-27-autoria-de-outra-sessao.md).
> **Correção de atribuição:** o interlúdio rotulou este código como "autoria de
> outra sessão". É trabalho do próprio vértice; só a integração foi terceirizada.
> A separação de registros por §13.D continua correta; o rótulo, não.

## 1. Cobertura

Os **18** atalhos do dashboard foram rastreados do `cmd_map` até o corpo da
função. O painel anunciado bate com o mapeado: 18 × 18, nenhum botão órfão e
nenhum comando anunciado sem destino.

## 2. O habilitador estrutural

`cli/commands.py`, fim de `_handle_cli_command`:

```python
    else:
        print(f"Comando desconhecido: {cmd}")
```

Imprimia e **retornava normalmente**. Medido: `task_executor.py
comando-que-nao-existe` → **EXIT=0**.

Consequência: um atalho apontando para um nome que não existe é
**indistinguível** de um que funciona. Os `subprocess.run(..., check=True)` do
`nexus.py` não têm como perceber, porque `check=True` confia no código de saída
— e o código de saída era 0. Esta é a peça que tornava a classe inteira
possível.

**Corrigido:** `sys.exit(2)`, mensagem para `stderr`. Verificado nos dois
sentidos (desconhecido → 2, válido → 0).

## 3. Os três botões errados

### 3.1 `[M] ops maintenance` — quebrado (regressão)

`run_maintenance` chamava `optimize_ram()` como função Python comum. Quando
`--watch` foi adicionado ao comando, os defaults viraram objetos
`typer.OptionInfo` — e **`bool(OptionInfo)` é `True`**:

```
=== SOTA MEMORY GUARD ATIVO (Trigger: >=<typer.models.OptionInfo object at 0x...>%
TypeError: '>=' not supported between instances of 'float' and 'OptionInfo'
```

Morria no passo 1, sem alcançar vacuum, sanitize, hygiene e RAG.

Se não estourasse, chegaria a `"[SUCESSO ABSOLUTO] Manutencao geral concluida
com sucesso!"` — **incondicional**, depois de quatro `try/except` que só
imprimiam.

**Corrigido** na raiz: chamar `_execute_ram_cleanse()`, o núcleo que já existia,
eliminando o acoplamento aos defaults do typer. Veredito passou a ser derivado
de uma lista de falhas, com `Exit(1)` em falha parcial.

### 3.2 `[4] ops quality-gate` — mentia hoje

| `cwv_gate.ps1`, passo real do gate | `Warnings: 2` · `FRAGIL (AMARELO)` · **exit 0** |
| :--- | :--- |
| **resumo impresso logo depois** | `Warnings: 0` · `SUCESSO (VERDE) Zero Erros & Zero Warnings` |

Quatro literais consecutivos (linhas 1815-1821). E como `_execute_step` levanta
`Exit(1)` em qualquer falha, o resumo **só** era alcançado quando tudo passava —
então sempre imprimia 0/0/VERDE. O tri-state era bi-state: ou estourava, ou
declarava SUCESSO VERDE. **O estado FRAGIL era inalcançável.**

O mesmo literal aparecia inline em **quatro** lugares (`QUALITY GATE`,
`SCRIPTS`, `AUDITS`, `ROUTINES`).

**Corrigido** nos quatro, com mecanismo único:
`_read_stream_and_log` passou a devolver as linhas; `_execute_step` devolve o
que a fase declarou; `_warnings_declarados()` distingue **"declarou zero"** de
**"não declarou"**; `_imprimir_resumo_tri_state()` deriva o veredito e, quando
alguma fase é muda, diz `PISO, NAO TETO` em vez de arredondar para zero.

### 3.3 `[5] agent handoff` — truncava hoje

Injetava 4 fontes de governança com `if exists()` sem `else`. Medido:

```
../MODUS_OPERANDI.md                  existe (40028 B)
GLOBAL_INSTRUCTIONS.md                AUSENTE
.claude/COSMOVISAO.md                 AUSENTE
.claude/ARCHITECTURAL_INVARIANTS.md   AUSENTE
```

Três de quatro faltavam. O handoff saía com um quarto da carga anunciada e
imprimia *"Handoff persistido com sucesso"*. Sem verificação de contexto
não-vazio: se as quatro sumissem, gravava arquivo **vazio** e reportava sucesso.

**Corrigido:** ausências declaradas item a item, `Handoff PARCIAL (N de M
fontes)` quando incompleto, e `Exit(1)` recusando gravar handoff vazio.

## 4. Fechamento — os 7 achados restantes, corrigidos

Registrados como pendência na primeira rodada e **fechados na segunda**, a
pedido do vértice. Todos tinham a mesma assinatura: a direção da falha
devolvia 0.

| Botão | Achado | Correção |
| :--- | :--- | :--- |
| `[6] agent route` | `except Exception` imprimia em vermelho e não levantava | `Exit(1)`. O atalho existe para descobrir que a malha parou; reportar sucesso ao achar o problema era a inversão exata |
| `[0]` `[c]` `[f]` | `except sqlite3.Error` imprimia `[FALHA]` e não levantava. Os irmãos `[v] vacuum` e `[9] audit-dag`, mesmo estilo, **levantam** — cinco comandos de banco, três divergindo na linha que decide se a falha conta | `Exit(1)` nos três, alinhando com os irmãos |
| `[3] ops sanitize` | `if exists()` sem `else` | Ausência de ferramenta é falha: mensagem + `Exit(1)` |
| `ops purify-memories` | mesma forma | idem |
| `ops hygiene` | tinha `else` e imprimia `[ERRO]`, mas não levantava — anunciava erro e reportava sucesso | `Exit(1)`. Ter o ramo de falha não basta; ele precisa reprovar |
| `[1] ops worker` | Afirmava *"desperto e vigilante"* logo após o `Popen` | `poll()` após 1,5 s: `Popen` sucede quando o processo **nasce**, não quando sobrevive. Agora reporta o PID medido ou reprova com o exit code |
| `[i]` `[g]` | Espera do proxy desistia após 20 s em silêncio e abria o chat contra um proxy morto | `for/else` com `Exit(1)` |
| `main()` | Gatilho de higiene em `Popen`/`DEVNULL`, sem sinal se o script sumisse | `logger.warning`. Best-effort por desenho — roda a cada invocação, então gritar no console seria ruído; mas sumir sem rastro não é opção |

Dois achados adicionais, da mesma família, fechados junto:

| Onde | Achado | Correção |
| :--- | :--- | :--- |
| `_get_key()` | Degradava em silêncio para sempre: qualquer exceção do `msvcrt` virava "nenhuma tecla", e o dashboard parecia travado sem nada explicar | Degrada **uma** vez dizendo o motivo e para de tentar. Só `ImportError`/`OSError` são esperados; o resto aparece |
| `run_inference.main()` | Turno único saía 0 com saída vazia — para quem chama por script (`do.ps1`), indistinguível de sucesso, inclusive com o proxy offline | `sys.exit(1)` quando não houve resposta |

### 4.1 Composição verificada

`typer.Exit` herda de `RuntimeError`, logo é capturado pelos `except Exception`
de `run_maintenance`. Endurecer `sanitize` e `hygiene` não quebra o protocolo de
manutenção: as falhas passam a **entrar na lista de falhas** e o veredito
derivado as reporta, em vez de serem engolidas. Verificado antes de escrever as
correções, não depois.

## 5. Os que estão certos

`[9] db audit-dag` é o padrão-ouro do arquivo: resolve o DB, `Exit(1)` se
ausente, consulta de verdade, `Exit(1)` se achar órfã, `Exit(1)` em erro SQL, e
só imprime `[OK]` no ramo em que efetivamente mediu. `[v] db vacuum` e
`[2] ops watch` seguem o mesmo padrão. `[7]`/`[8]` delegam a handlers que
existem e saem por `sys.exit`. `[R] optimize-ram` funciona pelo caminho do
typer — o defeito era só na chamada direta.

## 6. Guardas permanentes

22 testes novos ao todo (415 → **437**), incluindo uma **guarda de ligação**: os
testes de helper não pegariam alguém revertendo o call-site para literal, então
`test_nexus_nao_reintroduz_contagem_literal_de_warnings` varre a fonte e proíbe
o dígito fixo — pulando linhas de comentário, para não repetir o defeito da
instância 10 (detector que reprova a prosa que o documenta).

Todo teste de fechamento exercita a **direção da falha**, porque era essa a
direção que devolvia 0. Dois controles acompanham (`worker` vivo, turno único
com resposta) para provar que o caminho feliz não foi reprovado junto.

**Dez mutações aplicadas e revertidas**, cada uma reprovando seu teste:

| Rodada | Mutação | Teste que reprovou |
| :--- | :--- | :--- |
| 1 | passo 1 do maintenance de volta para `optimize_ram()` | `test_maintenance_nao_invoca_comando_typer_como_funcao` |
| 1 | resumo do quality-gate de volta para literal | `test_nexus_nao_reintroduz_contagem_literal_de_warnings` |
| 1 | habilitador de volta para exit 0 | `test_comando_desconhecido_do_worker_reprova` |
| 2 | remover os 3 `raise` dos comandos de banco | `test_erro_de_banco_reprova` (3 params) |
| 2 | `sanitize` de volta ao no-op silencioso | `test_script_de_manutencao_ausente_reprova[comando0]` |
| 2 | tirar o `raise` do `else` do `hygiene` | mesmo teste, `[comando2]` |
| 2 | `route` engolindo de novo | `test_route_com_malha_quebrada_reprova` |
| 2 | tirar a checagem de sobrevivência do worker | `test_worker_que_morre_na_ignicao_reprova` |
| 2 | tirar o `for/else` da espera do proxy | `test_proxy_que_nunca_sobe_reprova` |
| 2 | tirar o `sys.exit(1)` do turno único | `test_turno_unico_sem_resposta_reprova` |

### 6.1 O arnês de mutação também precisou de auditoria

A primeira execução do lote reportou `7/7 detectores provados`. Uma delas era
falsa: o seletor `-k sanitize` **não casa** com o id do teste parametrizado
(`comando0-saneamento ausente`), então o pytest saiu 5 — *nenhum teste
coletado* — e o arnês, que media apenas `returncode != 0`, contou isso como
detector aprovado.

**O verificador de sinal verde era, ele próprio, um sinal verde desconectado.**
Refeito com o seletor correto e conferindo a contagem de testes coletados:
baseline `1 passed` → mutado `1 failed`. As outras seis somavam 42 em
`failed + deselected`, provando que rodaram.

## 7. Declaração (governança §5)

Rodaram: rastreamento dos 18 atalhos, medição do exit code do despacho legado
nos dois estados, execução real do `cwv_gate.ps1`, verificação em disco das
fontes do handoff, execução isolada do passo 1 do maintenance, verificação da
hierarquia de `typer.Exit` antes de endurecer os comandos, dez mutações com
reversão verificada (e a auditoria do próprio arnês de mutação), conferência de
que nenhum resto de mutação entrou no diff, e a suíte completa a cada etapa.

Não rodaram, e por quê: `maintenance` ponta a ponta (o passo 3 é `sanitize
--apply`, que deleta arquivos); `quality-gate` completo (10 fases); o loop
interativo do dashboard; um worker real morrendo na ignição (provado com
`Popen` mockado); um proxy real subindo (provado com `_is_port_open` mockado);
qualquer chamada real a provedor de LLM, porque as chaves deste ambiente estão
revogadas. Declarados no frontmatter e não contam como verificação aprovada.

## 7. O que permanece aberto

Nada da camada de CLI. O que segue pendente é **arquitetura ou remoção**, e
nenhuma das duas cabe numa rodada de correção:

| # | Pendência | Por que não aqui |
| :--- | :--- | :--- |
| A | Função de roteamento duplicada entre `Microsoft.PowerShell_profile.ps1` e `Setup-NexusProfile.ps1` (agora 2 funções, não 1) | Declarar a fonte única é o item 1.3 do plano 2-B. Corrigi o defeito nos dois lados; unificar exige decidir quem é o canônico |
| B | `_calculate_dynamic_context()` em `gemma_server.py` é inalcançável (`SOTA_STATIC_CONTEXT` nunca é definido) | Remoção é destrutiva e exige ordem explícita, item a item |
| C | `nexus` sem argumentos mudou de destino (`do.ps1` → `nexus.ps1`) | Mudança não declarada da porta de entrada. Pode ser intencional; é decisão do vértice |
| D | Payload do modo 2 leva `system_prompt` **e** `messages[0]` com o mesmo conteúdo | Pré-existente. Corrigir exige conhecer a semântica do proxy, que não foi levantado |
| E | `data/RECORD_INDEX.json` (§13.C) não existe: 2 dos 4 itens do portão §13.F seguem inativos | É a frente 2 do plano 2-B, trabalho novo e não correção |
