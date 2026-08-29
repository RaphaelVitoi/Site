---
id: handoff-2026-08-29-diagnostico-de-memoria
tipo: relatorio
escopo: Site
ecossistema: gemini-antigravity
autor: claude@opus-5
criado_em: 2026-08-29T05:30-03:00
commit: 1fc6ec64
classes: [interno, medido]
caminhos:
  - scripts/cli/nexus.py
  - tests/test_guard_memoria.py
  - reports/FRENTE-3-2026-08-29-guard-tri-camada.md
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  commits_da_janela: 1
  suite: 623
  maquina: i9-9900K 8c/16t, 31.86 GB RAM, RX 570 8 GB Vulkan, NVMe WD SN550
  uptime_investigado: 15.7 h
verificado:
  - suite completa (623) e os dois portoes antes do commit 1fc6ec64
  - tres mutacoes no guard --once, todas detectadas, arquivo restaurado byte a byte
  - experimento de alocacao rodado DUAS vezes, resultados a 0.1 ponto um do outro
  - latencia do medidor amostrada a 50 ms durante alocacao e liberacao
  - snapshot do RAMMap (.RMP, 401 MB) decodificado e VALIDADO contra a tela --
    os 14 contadores de UseCounts e os 7 de ListCounts batem exatamente
  - as listas <PFNs> por processo somam 1.461.262 paginas = Process Private
    Active da tabela, confirmando o parse
  - o defeito da higienizacao periodica lido no fonte, linha 1852
nao_verificado:
  - nenhuma chamada real a provedor de LLM
  - NAO foi possivel separar quanto do pagefile e do Repurposed veio de carga
    real e quanto foi fabricado pelo trim periodico do guard antigo
  - desgaste dos SSD nao medido -- dois discos atras de controladora RAID
    bloqueiam SMART, e o NVMe nao devolveu contadores
  - exclusoes do Defender nao lidas (exigem privilegio elevado)
  - o experimento de alocacao NAO foi rodado com a maquina carregada; o estado
    foi destruido antes de eu pensar em medi-lo
supersede: null
---

# HANDOFF — diagnóstico de memória da estação de trabalho

**Estado:** `master 1fc6ec64` · **623 passed** · índice 20 VIGENTE, 0 SUSPEITO.

> **Árvore com trabalho em voo de outro agente.** `.mcp.json`,
> `core/sota_context_engine.py`, `engine/llm_api.py`, `memory_rag.py`,
> `scripts/cli/nexus.py` e `tests/test_cli_nexus.py` estão sendo **limpos por
> um agente irmão (Opus 4.6)** — 608 linhas só em `nexus.py`. É correção de
> código que **esta linhagem escreveu**, não refatoração cosmética. Nada disso
> foi estagiado aqui: o motivo é estar em voo e não revisado por mim, não ser
> de outro autor. Confira com `git status` antes de commitar.

## 1. O achado principal, e ele é sobre código nosso

**`nexus ops optimize-ram --watch` fabricava o teto de RAM que passamos a noite
tentando explicar.**

```python
# scripts/cli/nexus.py:1852  — AINDA PRESENTE, não corrigido
if now - last_periodic >= interval:
    _execute_ram_cleanse(verbose=False)   # sem checar limiar
    last_periodic = now
```

O ramo do limiar (98%) nunca disparava. O **periódico** disparava sempre, a cada
300 s. Em 7h54m de execução: **~95 vezes**. E `_execute_ram_cleanse` faz
`gc.collect()` + `_trim_working_set()` + `_trim_background_workers()`.

Trim empurra página para standby → standby conta como disponível →
`percent = (total − disponível)/total` **cai**. O número era reposto à força a
cada cinco minutos.

**Experimento de controle, feito pelo operador ao reiniciar a máquina:**

| | com o guard | sem o guard |
| :--- | :--- | :--- |
| faixa de RAM observada | 71,6 – 73,5% | **61,1 → 80,4 → 93,0%** |
| amplitude em 90 s | 1,30 pts | livre |

Pior que cosmético: `data/TETOS_DE_MEMORIA.json` **já declarava** que trim em
processo ativo troca RAM por I/O sem liberar nada estável. O `--watch` violava
esse aviso a cada 5 minutos, sem pressão que o justificasse. Parte dos 495,6 GB
de `Repurposed` e dos 10,7 GB de pagefile pode ter sido gerada por ele — e **não
consigo separar** o que era carga real do que a ferramenta criou.

## 2. Os dois guards têm o defeito oposto

| | comportamento | consequência |
| :--- | :--- | :--- |
| `optimize-ram --watch` | **age SEMPRE** — 300 s, sem condição | fabricava o número |
| `ops guard` (escrito nesta janela) | **nunca age** — teto de RAM 98%, inalcançável | não olha para nada |

Nenhum dos dois calibrado, os dois no mesmo arquivo. **Não subir o antigo de
volta.**

## 3. O que foi entregue em código

Commit único, `1fc6ec64`: `ops guard --once` imprimia os quatro tetos, mandava a
leitura para um `logger` silencioso e saía com 0 — o comando de diagnóstico não
relatava o estado. O teste conferia `exit_code == 0` (*não quebrou*) quando o
contrato é *relatar*. Corrigido; três testes novos, três mutações detectadas.
Suíte 620 → 623.

## 4. O diagnóstico da máquina, medido

**A causa real da pressão era sprawl de processo, não memória.**

Uma sessão `codex` aberta há 14,7 h: **704 processos, 33,34 GB de commit, 0,56 GB
residentes**. Morta com autorização do operador:

| | antes | depois |
| :--- | ---: | ---: |
| processos | 1222 | **460** |
| commit | 87,6% | **45,2%** |
| pagefile escrito | 10,70 GB | **1,82 GB** |
| folga até recusa de alocação | 10,7 GB | **42,8 GB** |

**Não havia teto na RAM.** Alocando e *tocando* páginas: 63,6% → **88,7%**,
linear a 3,14 pts/GB (= 1 GB ÷ 31,86 GB), reproduzido duas vezes a 0,1 ponto. A
segunda corrida chegou a **93,0%**. O medidor responde em **160 ms**.

**Onde estava a memória "sem dono"** (RAMMap, `.RMP` decodificado e validado):

| categoria | Active |
| :--- | ---: |
| **Shareable** (seções compartilhadas, **sem dono por definição**) | **8,55 GB** |
| Process Private | 5,57 |
| Mapped File | 1,51 |
| Driver Locked | 0,37 |
| Page Table | 0,31 |

**`Repurposed`: 495,6 GB em 15,7 h** = 8,8 MB/s de reciclagem de cache contínua.

**A frota se reconstrói sozinha.** Após o reboot, em minutos: 643 processos.

| executável | n | RAM | commit | razão |
| :--- | ---: | ---: | ---: | ---: |
| **node.exe** | **99** | **0,10 GB** | **6,63 GB** | **70×** |
| chrome.exe | 89 | 1,58 | 7,98 | 5× |
| Antigravity IDE | 13 | 2,73 | 3,18 | 1× |

## 5. O que espera decisão

Os 8 itens do handoff anterior seguem abertos. Somam-se:

| # | Item | Por que não decidi |
| :--- | :--- | :--- |
| 9 | **Corrigir a higienização periódica** (`nexus.py:1852`) — torná-la condicional a pressão real | Muda o que a máquina faz sozinha |
| 10 | **Teto de RAM do `ops guard`** — trocar 98% por grandeza que cruza (GB livres, ou pagefile) | Idem |
| 11 | **Frota MCP** — 99 `node` num boot novo, 6,63 GB de commit | A alavanca real; é configuração do operador |
| 12 | Exclusões do Defender para diretórios de build | Estreita uma proteção; decisão dele |
| 13 | C: e D: abaixo de 10% livres (101 GB e 42,9 GB) | Higiene de disco |
| 14 | **O portão de registro lê a ÁRVORE, o commit leva o ÍNDICE** | Achado ao commitar este relatório — ver §9 |

## 6. Prompt de continuação

```
Contexto: Site em master 1fc6ec64, suite 623 passed, indice 20 VIGENTE.

ATENCAO: a arvore pode ter trabalho EM VOO de um agente irmao limpando
codigo que esta linhagem escreveu (.mcp.json, core/sota_context_engine.py,
engine/llm_api.py, memory_rag.py, scripts/cli/nexus.py,
tests/test_cli_nexus.py). Rode `git status` e nao estagie o que voce nao
revisou. `git add` sempre com caminho explicito, nunca -A.

Leia primeiro:
  reports/HANDOFF-2026-08-29-diagnostico-de-memoria.md   (este)
  reports/HANDOFF-2026-08-29-roteamento-memoria-e-guard.md
  reports/FRENTE-3-2026-08-29-guard-tri-camada.md

Antes de propor qualquer coisa:
  uv run pytest -q
  uv run python scripts/ops/record_index.py --suspeitos
  uv run python scripts/cli/nexus.py ops guard --once

Pendencia mais quente: scripts/cli/nexus.py:1852. A higienizacao periodica do
`optimize-ram --watch` roda `_execute_ram_cleanse` a cada 300s SEM checar
limiar, e o trim resultante DERRUBA `virtual_memory().percent`. Isso fabricou
um teto de 72-73% durante 8 horas e mascarou a pressao real. Corrigir exige
decisao do vertice porque muda o comportamento automatico da maquina.

Regras que esta base cobra:
- Medir a grandeza que DECIDE. Numero estavel demais para ser verdade e o
  sinal -- e desta vez a causa da estabilidade era a NOSSA ferramenta.
- A ferramenta de otimizacao pode alterar a grandeza que o medidor le. Antes
  de explicar um numero, conferir se algo nosso o esta escrevendo.
- Concordancia entre fontes valida a MEDICAO, nao a CONCLUSAO.
- Relato de experiencia do operador contra numero alarmante e sinal de que o
  numero mede outra coisa.
- Verde e suspeito. Mutacao com baseline, conferindo que a mutacao APLICOU.
- Portao que reprova: investigar, nunca contornar.
- git status antes de estagiar.

Frente 6 do plano 2-B continua a mais destravada.
```

## 7. Declaração (governança §5)

**Rodaram:** suíte completa (623) e os dois portões antes do commit; três
mutações no `guard --once`, todas detectadas, com o arquivo restaurado byte a
byte; o experimento de alocação **duas vezes**, com resultados a 0,1 ponto um do
outro; a latência do medidor amostrada a 50 ms; o `.RMP` de 401 MB decodificado
e **validado contra a tela** — os 14 contadores de `UseCounts` e os 7 de
`ListCounts` batem exatamente, e as listas `<PFNs>` somam 1.461.262 páginas =
`Process Private Active`; o defeito da linha 1852 lido no fonte.

**Não rodaram:** nenhuma chamada a provedor de LLM. **Não foi possível separar**
quanto do pagefile e do `Repurposed` veio de carga real e quanto o trim
periódico fabricou — o estado carregado foi destruído antes de eu pensar em
medi-lo, e essa é a falha de método desta sessão: **matei a variável antes de
testá-la.** Desgaste dos SSD não medido (RAID bloqueia SMART, NVMe não devolveu
contadores). Exclusões do Defender não lidas (exigem elevação).

## 8. Erros meus nesta sessão, para o próximo agente não repetir

1. **Expliquei a estabilidade três vezes com teorias erradas** — "regulador
   saturado", "pouca rotatividade", "grandeza folgada" — antes de ler o próprio
   código que a causava. O operador derrubou as três com observação.
2. **Rodei o experimento no estado errado**, depois de destruir o estado que
   importava.
3. **Prometi uma coluna `Shareable` na aba Processes do RAMMap.** Ela não
   existe.
4. **Errei o offset do cabeçalho** em `SystemBigPoolInformation` e obtive
   94.920 GB de pool — número absurdo que só não passou porque era grande demais
   para ser verdade.
5. **Derivei standby com `psutil`** onde `free` e `available` são o mesmo campo:
   a conta dava zero por construção, não por medição.

## 9. O portão aprovou conteúdo que não foi commitado

Achado ao commitar **este** relatório, e é a mesma família que o projeto
cataloga — desta vez dentro do próprio portão.

Sequência: estagiei o arquivo → o portão reprovou por YAML inválido → **corrigi
o arquivo na árvore e re-rodei o portão sem re-estagiar** → o portão leu a
árvore (corrigida) e **APROVOU** → o `git commit` levou o índice (ainda
quebrado). Resultado: commit `826ea31a` com frontmatter inválido, carimbado por
um portão verde.

Prova direta:

```
git show 826ea31a:reports/HANDOFF-...md  →  YAML INVALIDO
o mesmo arquivo na arvore                →  YAML valido
```

**O portão não valida o que vai ser commitado.** Ele enumera os caminhos em
stage e depois lê esses caminhos do disco. Enquanto índice e árvore coincidem,
ninguém percebe; divergiram, e o verde passou a se referir a outro conteúdo.

A correção certa é o portão ler `git show :<caminho>` (o conteúdo do índice) em
vez de abrir o arquivo. Não corrigi: mexe em portão de governança, e o
diagnóstico precisa ser confirmado por quem mantém `record_gate.py`.

Enquanto não for corrigido, a regra prática é: **re-estagiar sempre depois de
qualquer correção, mesmo que o portão já tenha ficado verde.**

## Revisao de ancora -- 2026-08-29, faxina do antecessor

Ancoras atingidas: `scripts/cli/nexus.py`, `tests/test_guard_memoria.py`.

O que mudou nelas: a faxina do agente antecessor (Opus 4.6), preservada em
commit porque ficou solta na arvore quando a sessao dele terminou. Extracao de
helpers, `logger.exception` no lugar de `logger.error`, constante
`MSG_SEM_MEDIDOR`, flag de modulo para o teclado, e os testes do guard em
minusculas.

**O achado central deste handoff continua valendo, e nao foi corrigido.**
`nexus.py`, higienizacao periodica do `optimize-ram --watch`: roda
`_execute_ram_cleanse` a cada 300 s sem checar limiar, o trim derruba
`virtual_memory().percent`, e foi isso que fabricou o teto de 72-73% por oito
horas. Segue como pendencia 9. A faxina arrumou a forma ao redor; o defeito de
comportamento esta intacto porque muda o que a maquina faz sozinha.

Uma correcao ao proprio handoff: tres testes de `test_guard_memoria.py`
chamavam `_agir_por_camada("ram", {})` depois que a assinatura perdeu o
parametro `leitura`. O dict caia no lugar de `verbose`, e `bool({})` e `False`
-- passavam por acaso. Agora passam por contrato. Vale como instancia nova do
padrao ja catalogado nesta base: verde que nao esta ligado ao que mede.

## Pendencias 9 e 10 -- fechadas em 2026-08-29, com uma correcao ao proprio handoff

### 9. A higienizacao periodica agora exige pressao medida

`nexus._pressao_justifica_higienizacao()` decide se o ramo periodico age, e
decide por **commit charge**, nao por `virtual_memory().percent`. O motivo esta
no proprio achado: `percent` e a grandeza que a acao contamina -- trim empurra
pagina para standby, standby conta como disponivel, `percent` cai. Usar `percent`
como criterio seria pedir a acao que avalie a si mesma.

Commit nao se move com trim: pagina prometida continua prometida. Piso em 75%,
abaixo do teto declarado de 92%.

Tres coisas mudaram junto:

- ciclo que **nao** age agora diz por que nao agiu. "Nada aconteceu" era
  indistinguivel de "o guard morreu".
- ciclo que age mede commit **antes e depois** e registra o delta. Se a
  higienizacao nao devolver commit, isso aparece no log em vez de sair como
  "executada" sem evidencia.
- sem medidor de commit, a periodica **suspende**. Ausencia de medidor nao e
  ausencia de pressao, e agir no escuro contaminaria a unica leitura restante.

Exercitado por mutacao nos dois sentidos: fazer o criterio devolver sempre
`True` reprova `test_sem_pressao_de_commit_a_periodica_nao_age`; reintroduzir
`virtual_memory().percent` no criterio reprova
`test_a_decisao_nao_le_virtual_memory_percent`.

### 10. O teto de 98% FICA -- e a pendencia como eu a escrevi estava errada

Eu havia registrado: *"trocar 98% por uma grandeza que cruza (free GB, ou
pagefile)"*. A medicao contradiz isso, e vale mais que o que eu escrevi.

Baixar o teto faria a camada `ram` disparar `_execute_ram_cleanse`, cuja acao e
o trim. Ou seja: **resolveria a pendencia 10 reintroduzindo o defeito da
pendencia 9.** O guard voltaria a fabricar a leitura que julga, agora com a
minha assinatura em vez de por acidente.

E nao ha saida trocando de grandeza: `free GB` tambem sobe com o trim, porque a
acao e sobre RAM fisica. Nenhuma leitura de RAM fisica escapa de uma acao que
mexe em RAM fisica.

O que a camada `ram` e, entao: **reportadora, nao atuadora.** Quem atua e
`commit`. Isso ja estava certo; o que faltava era dizer.

O defeito real da pendencia 10 nao era o numero -- era o silencio. O bloco
`inalcancavel_nesta_maquina` existia no JSON desde 2026-08-29 e **nenhuma linha
de codigo o lia**, entao o operador via `ram=71.5%` ao lado de um teto de 98% e
concluia que havia vigilancia ali. Declaracao sem consumidor e a mesma falha que
este guard existe para achar nos outros.

Agora `_medir_pressao` le o bloco e o resumo imprime a marca:

```
ram=89.3%! | commit=82.7% | vram=? | cache=0.0MB
```

`!` e `?` dizem coisas diferentes e nao se atropelam: **cego** nao e o mesmo que
**decorativo**. Ha teste para cada um, e a mutacao que pinta `!` em toda camada
reprova dois deles.

Medido de passagem, e vale registrar: entre duas execucoes seguidas do
`--once`, a RAM foi de 88,4% a 89,3%. Com o guard antigo rodando ela nao saia
de 72-73% por oito horas. A variacao voltou.

