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
  baseline_suite_depois: 424 passed
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

## 4. Achados registrados e NÃO corrigidos

Fora do escopo autorizado nesta rodada. Todos medidos.

| Botão | Achado |
| :--- | :--- |
| `[6] agent route` | `except Exception` imprime em vermelho e **não levanta** → exit 0 |
| `[0]` `[c]` `[f]` | `except sqlite3.Error` imprime `[FALHA]` e **não levanta** → exit 0. Os irmãos `[v] vacuum` e `[9] audit-dag`, escritos no mesmo estilo, **levantam**. Cinco comandos de banco, três divergem na linha que decide se a falha conta |
| `[3] ops sanitize` | `if exists()` sem `else`. O script existe hoje; movê-lo torna o botão um no-op silencioso |
| `[1] ops worker` | Afirma *"Orquestrador desperto e vigilante"* logo após o `Popen`, sem verificar que o processo sobreviveu |
| `[i]` `[g]` | Espera do proxy (`for _ in range(40)`) desiste após 20 s sem dizer nada |
| `ops hygiene` | Tem `else`, imprime `[ERRO]`, mas **não levanta** → anuncia erro e reporta sucesso |
| `main()` | Gatilho de higiene em `Popen` com `DEVNULL`: sem sinal algum se o script sumir |

## 5. Os que estão certos

`[9] db audit-dag` é o padrão-ouro do arquivo: resolve o DB, `Exit(1)` se
ausente, consulta de verdade, `Exit(1)` se achar órfã, `Exit(1)` em erro SQL, e
só imprime `[OK]` no ramo em que efetivamente mediu. `[v] db vacuum` e
`[2] ops watch` seguem o mesmo padrão. `[7]`/`[8]` delegam a handlers que
existem e saem por `sys.exit`. `[R] optimize-ram` funciona pelo caminho do
typer — o defeito era só na chamada direta.

## 6. Guardas permanentes

9 testes novos (415 → **424**), incluindo uma **guarda de ligação**: os testes
de helper não pegariam alguém revertendo o call-site para literal, então
`test_nexus_nao_reintroduz_contagem_literal_de_warnings` varre a fonte e proíbe
o dígito fixo — pulando linhas de comentário, para não repetir o defeito da
instância 10 (detector que reprova a prosa que o documenta).

**Três mutações aplicadas e revertidas**, cada uma reprovando seu teste:

| Mutação | Teste que reprovou |
| :--- | :--- |
| passo 1 do maintenance de volta para `optimize_ram()` | `test_maintenance_nao_invoca_comando_typer_como_funcao` |
| resumo do quality-gate de volta para literal | `test_nexus_nao_reintroduz_contagem_literal_de_warnings` |
| habilitador de volta para exit 0 | `test_comando_desconhecido_do_worker_reprova` |

## 7. Declaração (governança §5)

Rodaram: rastreamento dos 18 atalhos, medição do exit code do despacho legado
nos dois estados, execução real do `cwv_gate.ps1`, verificação em disco das
fontes do handoff, execução isolada do passo 1 do maintenance, três mutações
com reversão verificada, e a suíte completa.

Não rodaram, e por quê: `maintenance` ponta a ponta (o passo 3 deleta
arquivos); `quality-gate` completo (10 fases); o loop interativo do dashboard;
qualquer chamada real a provedor de LLM. Declarados no frontmatter e não contam
como verificação aprovada.
