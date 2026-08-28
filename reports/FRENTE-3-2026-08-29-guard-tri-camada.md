---
id: frente-3-2026-08-29-guard-tri-camada
tipo: relatorio
escopo: Site
ecossistema: gemini-antigravity
autor: claude@opus-5
criado_em: 2026-08-29T01:10-03:00
atualizado_em: 2026-08-29T02:05-03:00
commit: db9acdd9
classes: [interno, medido]
caminhos:
  - scripts/cli/nexus.py
  - core/sota_context_engine.py
  - data/TETOS_DE_MEMORIA.json
  - utils/ram_optimizer.py
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  data: 2026-08-29
  gpu: Radeon RX 570, 8 GiB, backend Vulkan
  ram_total_gb: 31.9
  teto_ram_pct: 98
  teto_vram_pct: 85
  teto_cache_mb: 4096
  teto_commit_pct: 92
  camadas: 4
verificado:
  - as tres camadas lidas em execucao contra a maquina real -- RAM 71,6%,
    VRAM 0,0% de 8,0 GiB, cache 0,0 MB
  - intervalo adaptativo medido em uso -- 172 s com RAM a 73% do teto, contra
    os 300 s fixos de antes
  - tres mutacoes com baseline explicita, todas detectadas
  - os DOIS estados do guard exercitados -- sem estouro nao age, com teto
    rebaixado age e a acao e observada
  - suite completa antes do commit
nao_verificado:
  - o guard NAO foi exercitado sob pressao real de 98% de RAM; os dois estados
    foram provados com teto rebaixado e gauge dublado, nao com a maquina saturada
  - nao foi medido quanto cada acao efetivamente libera; o guard age e mede de
    novo no ciclo seguinte, mas nao ha estudo de eficacia por acao
  - o teto de VRAM em 85% e palpite declarado, nao medicao de KV cache
  - o teto de commit em 92% tambem e palpite; nao houve episodio de exaustao
    medido para calibra-lo
  - nenhuma chamada real a provedor de LLM
supersede: null
---

# FRENTE 3 — o guard tri-camada

> Passo 5 e último do plano da validação de memória. O que o vértice pediu no
> começo da sessão: `free_ram_optimizer` automático em ≥98% com periodicidade
> estratégica. Chegou aqui porque duas das três camadas não tinham medidor.

## 1. O que existia

`nexus ops optimize-ram --watch` já tinha gatilho reativo e higienização
periódica — e vigiava **só RAM**, com limiar 90% e intervalo de 300 s fixos,
passados por flag.

Os 300 s fixos têm os dois defeitos ao mesmo tempo: **gastam CPU quando não há
pressão nenhuma, e demoram até cinco minutos para reagir quando há.**

## 2. Por que as outras duas camadas não podiam ser vigiadas

| Camada | Estado antes |
| :--- | :--- |
| **VRAM** | medidor **cego** — os três leitores cobriam NVIDIA, AMD nativo e ROCm; esta máquina é Vulkan. Corrigido em `a86168df` |
| **Cache** | `max_cache_size_mb = 4096` atribuído no `__init__` e **nunca lido** — a evicção olhava `len(buckets) > 100` |

O segundo é o mesmo padrão do primeiro e do `CHUNK_SIZE`: **um teto declarado
que o mecanismo não honra**. E aqui a grandeza estava trocada de forma explícita
— o teto nomeia megabytes e a evicção contava baldes, e 100 baldes podem ser
1 MB ou 400 MB dependendo do que cabe neles.

`ContextBucket` ganhou `bytes_payload`, medido uma vez na criação —
`token_count` é estimativa (`chars // 4`) e serve para orçamento de prompt; para
teto de **memória** o que vale é byte. `tamanho_mb()` expõe o total, e a evicção
passou a honrar o teto que sempre esteve escrito.

## 3. O guard

`nexus ops guard` lê as três camadas num laço só. Os tetos vêm de
`data/TETOS_DE_MEMORIA.json`, que declara **o número e a medição que o
justifica** — teto sem origem declarada vira literal que ninguém ousa mexer.

| Camada | Teto | Ação |
| :--- | ---: | :--- |
| RAM | 98% | GC + trim do working set dos workers de **background** |
| VRAM | 85% | `optimize_ollama_keepalive(0)` — descarrega modelo ocioso |
| cache | 4096 MB | evicta o efêmero menos usado até voltar abaixo |

**Uma ação por camada, não uma para as três.** Expurgo de RAM não resolve VRAM
cheia, e zerar keepalive do Ollama não devolve nada ao cache de contexto.

### 3.1 O cuidado que a medição impôs

**Não trimar o processo que está trabalhando.** Ele pagina tudo de volta no
instante seguinte: troca RAM por I/O e fica mais lento sem liberar nada de forma
estável. Trim paga em processo **ocioso**, e é por isso que a ação de RAM usa
`_trim_background_workers` por PID.

E trim **não reduz commit charge** — move páginas para standby, e página
comprometida continua comprometida. Medido nesta máquina no meio da sessão: o
aperto real era commit em **90% do limite** (85,9 de 95,6 GB), não working set.

## 4. Intervalo que responde à pressão

O intervalo interpola entre 600 s e 15 s conforme a camada **mais pressionada**
se aproxima do seu teto. Média esconderia a que está prestes a estourar.

Medido em uso: **172 s** com RAM a 73% do teto — contra os 300 s fixos de antes.
Sem medidor nenhum, vai ao máximo: vigiar de perto o que não se consegue medir é
só gastar CPU.

## 5. Desconhecido não é zero

A regra que atravessa o guard inteiro, e ela vem de um defeito real: os três
leitores de VRAM falhavam e `_get_vram_usage` convertia isso em
`(None, 0.0, 0.0)`. Qualquer teto que consumisse esse par concluiria VRAM vazia
e **nunca reagiria**.

Aqui, camada sem medidor devolve `None`, e `None` não dispara nem silencia: fica
fora do cálculo de pressão e aparece no log como `?`. Se virasse `0`, a camada
ficaria muda para sempre; se virasse `100`, dispararia sem parar. Dois testes
travam exatamente isso.

## 6. Declaração (governança §5)

Rodaram: as três camadas lidas em execução contra a máquina real; o intervalo
adaptativo medido em uso; três mutações com baseline explícita, todas detectadas
(`None` de VRAM virando número, intervalo voltando a ser fixo, ação nunca
disparando); os dois estados do guard, com teto rebaixado para provar que a ação
dispara; a suíte completa.

Não rodaram: **o guard não foi exercitado sob pressão real de 98% de RAM** — os
dois estados foram provados com teto rebaixado e gauge dublado, não com a máquina
saturada. Não foi medido quanto cada ação efetivamente libera. O teto de VRAM em
85% é palpite declarado, não medição de KV cache. Nenhuma chamada real a provedor
de LLM.

---

## 7. Adendo — virou quatro camadas, por uma observacao do operador

> *"RAM utilizada: 72% estavel, mesmo a cache: 18% estavel."*
>
> A frase parecia confirmacao de que estava tudo bem. Medida, era o contrario:
> **o guard que acabei de escrever vigiava a grandeza folgada.**

### 7.1 A medicao

| | medido em 2026-08-29 |
| :--- | ---: |
| RAM fisica (`virtual_memory().percent`) | **72,7%** |
| standby reclaimavel | 6.846 MB (21% da RAM) |
| **commit usado** | **74.583 MB** |
| commit limite | 90.348 MB |
| **commit % do limite** | **82,6%** |

Com 32,6 GB fisicos e 74,6 GB comprometidos, o pagefile carrega ~42 GB.

`virtual_memory().percent` conta `(total - disponivel)`, e **disponivel inclui
standby**. Por isso a RAM fica estavel em 72%: ha 6,8 GB reclaimaveis que o
numero ja desconta. O Windows recusa alocacao quando o **commit** bate no
limite, nao quando a RAM fisica sobe.

Um teto de 98% sobre a RAM fisica, nesta maquina, e **portao incapaz de ficar
vermelho** — o defeito que a tecnica "medir os dois estados" existe para achar,
e que eu acabara de introduzir num guard escrito para achar exatamente isso.

### 7.2 O que mudou

A camada `commit` entrou com medidor proprio (`GlobalMemoryStatusEx`), teto
declarado em 92% e acao propria. **A acao NAO e trim de working set**: trim move
pagina para standby, e pagina comprometida continua comprometida. O que devolve
commit e descarregar processo que segura memoria privada — daqui a acao ser a
mesma da VRAM, por motivos diferentes.

E o efeito nao ficou no log. Mesmo instante, mesma maquina:

| | intervalo do proximo ciclo |
| :--- | ---: |
| guard tri-camada (so RAM, VRAM, cache) | **172 s** |
| com a camada `commit` | **75 s** |

O guard passou a vigiar mais de perto porque enxerga a camada que esta a **90%
do seu teto**, em vez da que esta a 74%.

### 7.3 A licao, e ela e a mesma do dia inteiro

Terceira vez nesta sessao que medi **a grandeza errada com precisao**: o custo
por preco unitario em vez de por faixa, a recencia por `mtime` em vez de por
data declarada, e agora a pressao de memoria por RAM fisica em vez de commit.

O padrao nao e descuido de calculo — e escolher o campo obvio em vez do campo
que decide. E o que o quebrou nas tres vezes foi a mesma coisa: **um numero
estavel demais para ser verdade.**
