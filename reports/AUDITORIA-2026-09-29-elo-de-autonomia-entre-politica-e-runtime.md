---
id: auditoria-2026-09-29-elo-de-autonomia-entre-politica-e-runtime
tipo: auditoria
escopo: Site
ecossistema: nexus-sota
autor: space-bunny-alpha
criado_em: '2026-09-29T13:58:00-03:00'
atualizado_em: '2026-09-29T13:58:00-03:00'
classes: [interno, medido, proveniencia, portao, governanca, autonomia]
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  session_id: 20260929_111723_1f703f
  session_started_at: '2026-09-29T11:17:23-03:00'
  condutor: Space-Bunny-Alpha <noreply@hermes.com>
  modelo: space-bunny-alpha
  veiculo: hermes-agent
  tier: 2
  supervisao: assistida
  data_das_medicoes: 2026-09-29
caminhos:
  - governance/autonomy.yaml
  - agents/autonomy.py
  - governance/KERNEL.md
  - tests/test_autonomia_politica_declarada.py
  - tests/matriz_autonomia.py
  - scripts/ops/record_gate.py
verificado:
  - agents/autonomy.py nao importa yaml e nao menciona autonomy.yaml; os 5 modos estao hardcoded em _resolve_effective_mode
  - forbidden_tokens e state_changing_commands existem como literais dentro de _validate_command, nao carregados do YAML
  - o YAML tem `- 'format '` e YAML aparava o espaco final do escalar nao-quotado; quotado, o parse devolve `format ` e `npm run format` deixa de casar
  - comparacao elemento a elemento -- 6 tokens de forbidden_tokens, com unica divergencia a de `format`; 8 tokens de state_changing_commands, sem divergencia
  - protected_paths, approval_gates, write_rules e privileged_agent_classes nao tem leitura em nenhum .py de producao
  - _execute_commands desvia `sandbox` para _run_sandboxed_command e continua; _validate_command nao e chamado nesse ramo
  - _resolve_effective_mode devolve full_restricted, que nao esta em VALID_AUTONOMY_MODES nem no YAML
  - a checagem de state_changing_commands dispara so quando effective_mode == 'partial'
  - autonomy_mode efetivo lido de queue/tasks.db, system_state = 'full'; tem precedencia sobre o leitor legado
  - git log --all -- autonomy.json na raiz e vazio -- o arquivo nunca foi versionado
  - tests/test_autonomia_politica_declarada.py -- 10 aprovados
  - tests/matriz_autonomia.py -- 8 aprovados, e os 7 defeitos reintroduzidos sao reprovados um a um
  - 4 dos 7 escaparam na primeira rodada e viraram guarda nova -- uso de yaml por AST, safe_load sem nomear o arquivo, ramo sandbox por AST em _execute_commands, escopo de busca por pasta
  - 156 aprovados na combinacao de governanca, autonomia, agentes e manifesto
  - git diff --stat agents/ core/ cli/ database/ llm/ engine/ vazio -- nenhuma mudanca semantica de runtime
  - agents/autonomy.py aparece como modificado so por mtime obsoleto apos restauracao; git diff --numstat vazio e conteudo identico ao HEAD
nao_verificado:
  - o comportamento de `nexus autonomy <modo>` nao foi exercido nesta sessao; a pendencia abaixo descreve o que falta, nao uma falha reproduzida
  - a suite integral do repositorio nao foi rodada; a combinacao de 156 e o recorte de governanca
  - a ligacao do YAML ao runtime nao foi testada em branch -- foi rejeitada por medicao, e o teste que fixa a rejeicao falha se alguem ligar
  - o conteudo de Docker em opensandbox/execd:v1.0.7 nao foi inspecionado; o isolamento de sandbox foi lido no codigo, nao medido em execucao
pendencias:
  - id: pend-2026-09-29-nexus-autonomy-imprimir-modo-efetivo
    o_que: Fazer `nexus autonomy <modo>` imprimir o modo gravado e o modo efetivo resolvido, e fixar a precedencia system_state sobre o leitor legado em teste. Hoje o unico jeito de saber o modo real e ler a tabela -- o comando aceita e nao confirma
    dono: Tier 0
    prazo: 2026-10-06
  - id: pend-2026-09-29-repor-protected-paths-antes-de-ligar-o-yaml
    o_que: Repor a lista de protecao antes de ligar autonomy.yaml ao runtime. protected_paths contem `governance` e `scripts`, o que bloqueia a propria manutencao de governanca -- inclusive o KERNEL.md §3 que mediu a lacuna. Repor e empresa maior que religar
    dono: Tier 0
    prazo: 2026-10-06
---

# Auditoria do elo de autonomia entre a política declarada e o runtime

## 1. O que foi pedido e o que foi medido

A auditoria documental de 2026-09-29 terminou com duas ações delegadas ao Tier 0
por mudarem o modo efetivo de execução. Para decidir sobre elas, a cadeia inteira
foi medida — inclusive a parte que o relatório anterior não tinha medido.

**O relatório anterior estava invertido.** Ele dizia que mover
`.claude/GOVERNANCA/autonomy.json` para a raiz "escalaria o sistema para autonomia
plena". A medição mostra o contrário: o fallback do leitor legado é `"stop"`, o
modo efetivo vem de `system_state.autonomy_mode` — medido `'full'` em
`queue/tasks.db` — e o arquivo do CWD **nunca foi versionado**. A
precedência é do banco, e o banco já está resolvido.

O risco real era outro, e maior.

## 2. A lacuna

`governance/autonomy.yaml` declara 5 modos, 4 famílias de política, uma lista de
`protected_paths` e um bloco de `approval_gates`. A especificação de 2026-05-22
exige que o runtime *"loads and validates `governance/autonomy.yaml`"*;
`governance/environment.md` promete fallback estrito na ausência do arquivo.

**Nada disso acontece.** `agents/autonomy.py` não importa `yaml` e não menciona o
arquivo uma única vez. O que é aplicado:

| Declarado | Onde de fato é aplicado |
| :--- | :--- |
| `forbidden_tokens` | literal em `_validate_command()` |
| `state_changing_commands` | literal em `_validate_command()` |
| 5 modos + resolução | literais em `_resolve_effective_mode()` |
| modo efetivo | `system_state.autonomy_mode` (`queue/tasks.db`) |

O que **não** tem leitura em nenhum `.py` de produção: `protected_paths`,
`approval_gates`, `write_rules`, `privileged_agent_classes` e o
`deny_state_changing_commands` de cada modo.

É a mesma classe de falha do `KERNEL.md` dual: arquivo com aparência normativa
que ninguém executa. `deny_state_changing_commands: false` sob `full` parece
autorização, e não é — quem autoriza é o valor na tabela.

## 3. Três desvios de enforcement, medidos

```
_execute_commands(effective_mode)
  stop | default              -> return; nada executa
  sandbox                     -> _run_sandboxed_command() e CONTINUA
                                 _validate_command NUNCA e chamado
  partial | full_restricted   -> _validate_command()
  full                        -> _validate_command()

_validate_command()
  encadeamento (; | && & $ ` > < \n ( ))  -> bloqueado se mode NAO for [full, full_restricted]
  forbidden_tokens                          -> bloqueado sem excecao de modo
  state_changing_commands                   -> bloqueado SO se mode == 'partial'
```

1. **`sandbox` não é validado.** O YAML declara
   `sandbox.deny_state_changing_commands: true`. O código desvia para o
   container e continua. O isolamento real vem de `--network bridge`,
   `no-new-privileges` e `cap-drop ALL` — não da validação de comando.
2. **`full_restricted` não é declarado.** `_resolve_effective_mode` o devolve
   para `@maverick` em modo `full`; não está em `VALID_AUTONOMY_MODES` nem no
   YAML. Não há bug de execução — ele nunca passa por `get_autonomy_mode`, que é
   quem valida — e há um buraco de documentação, que em política de autonomia é
   onde nasce permissão acidental.
3. **`full_restricted` escapa da checagem de estado.** A condição é
   `== 'partial'`, então o modo intermediário não recebe a proteção que o YAML
   promete a ele.

## 4. A ligação avaliada e rejeitada

A decisão natural — "fonte única de verdade = YAML" — **foi avaliada e
rejeitada por medição**. Três motivos:

1. **O YAML perde um token de segurança.** O autor escreveu `- format ` com
   espaço final para casar com o literal Python. **YAML apara o espaço final de
   escalar não-quotado**: a intenção se perde sem erro, sem aviso e sem diff.
   Só apareceu porque os tokens foram comparados um a um. Ligar o YAML teria
   introduzido `format` sem espaço, que reprova `npm run format` — comando
   oficial do `package.json` — em modo `partial`.
2. **`protected_paths` contém `governance` e `scripts`.** Aplicá-lo bloqueia a
   própria manutenção de governança, incluindo o `KERNEL.md` §3 que mediu a
   lacuna. A lista de proteção foi escrita antes de existir alguém para protegê-la.
3. **`sandbox` não passa por `_validate_command`.** Ligar o YAML criaria
   *aparência* de enforcement exatamente onde não há.

> **Princípio:** fonte única de verdade é criação de dívida. Ela converte bem um
> arquivo que já foi validado; com arquivo não validado, concentra o erro. Aqui a
> fonte não estava validada — e a validação é o que revelou o token perdido.

## 5. O que foi corrigido

Correção da **fonte**, não do consumidor:

- **Token quotado** (`- 'format '`) com comentário explicando que o espaço é
  semântico. `yaml.safe_load` agora devolve `format `, e `npm run format` deixa
  de casar. A intenção do autor sobrevive ao parser.
- **Cabeçalho do YAML** declara, na language em que é lido, o que é aplicado e
  o que não é. `authority.doctrine` passou a apontar para `../CLAUDE.md` — que é
  a constituição, e não este arquivo.
- **`KERNEL.md` §3** reescrito com a cadeia medida, os três desvios e a decisão.
- **Nenhuma linha de runtime mudou.** `git diff --stat` sobre
  `agents/ core/ cli/ database/ llm/ engine/` é vazio.

## 6. A guarda, e como ela foi verificada

`tests/test_autonomia_politica_declarada.py` — 10 testes que travam a distância.

`tests/matriz_autonomia.py` — 8 testes que **reintroduzem 7 defeitos e exigem
reprovação**. Existe porque um guard nunca reprovado não foi testado, e a
primeira rodada provou o porquê:

| Defeito reintroduzido | 1ª rodada | Causa do escape | Correção |
| :--- | :--- | :--- | :--- |
| quote de `format ` removido | pegou | — | — |
| lista do Python divergiu | pegou | — | — |
| `import yaml` no runtime | **escapou** | lia a *string* `autonomy.yaml` | detectar uso por AST |
| `safe_load` sem nomear o arquivo | **escapou** | carregar YAML não exige nome | idem |
| `sandbox` validando comando | **escapou** | regex casou no branch de `_forge_files` | AST em `_execute_commands` |
| `full_restricted` declarado | pegou | — | — |
| `protected_paths` com enforcement | **escapou** | guard varria só `agents/` | escopo por pasta |

**Passar com defeito é pior que reprovar sem defeito.** O guard vira decoração, e
quem confia nele acredita numa medição que não ocorreu.

Duas armadilhas de sintaxe custaram uma iteração cada: `ast.unparse` normaliza
`"sandbox"` → `'sandbox'`, então casar no texto do fonte deixa de casar; e
`ast.walk` sobre a função inclui o próprio `FunctionDef`.

A restauração das mutações é feita em `finally`, não no fim da função: um
timeout no meio deixou `_check()` órfão em `agents/autonomy.py`, e o módulo de
autonomia ficou adulterado até alguém reparar.

## 7. Encerramento

Ambas as ações que mudam modo de execução ficam em `pendencias:` acima, com dono
e prazo. Nenhuma delas foi tomada: religar o YAML ou alterar o precedimento do
banco é decisão de execução, e a auditoria documental não a toma.

O que coube foi tornar a distância visível, nomeada e instrumentada — e garantir
que o dia em que alguém religar o YAML encontre um portão com as três ressalvas
escritas na falha.
