---
id: registro-2026-09-08-publicacao-assistida-do-saneamento-de-terminal
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: "Claude Opus 5 [Tier 1.B] -- sessao claude-opus5-site-2026-09-08-pmev"
criado_em: 2026-09-08T11:05:00-03:00
atualizado_em: 2026-09-08T11:05:00-03:00
classes: [interno, medido, publicacao, concorrencia]
caminhos:
  - scripts/llm_inference/run_inference.py
  - tests/test_run_inference_contrato.py
revisoes_de_ancora:
- registro: registro-2026-09-05-saneamento-nexus-ollama-e-auto-diagnostico
  caminhos:
  - scripts/llm_inference/run_inference.py
  - tests/test_run_inference_contrato.py
  parecer: >-
    Aquele registro ancora quatro propriedades nestes dois caminhos, e as quatro
    foram medidas nesta arvore, uma a uma. (1) "Streaming token-a-token com buffer
    liberado (flush=True), latencia inicial < 100ms": PRESERVADO -- o filtro novo
    e uma camada de saneamento SOBRE o stream, nao no lugar dele; `_flush_buffer`
    e `out_stream.flush()` seguem nas linhas 250, 256, 278-286 e o `print(...,
    flush=True)` da linha 644 esta intacto. (2) "Mantida query_gemma_proxy para
    testes de contrato": PRESERVADA em run_inference.py:356. (3) "52/52 testes
    aprovados em test_run_inference_contrato.py e test_cli_nexus.py": SUPERADO PARA
    MAIS, medido em 55/55 -- os tres testes novos do saneamento, nenhum removido.
    (4) "ASCII Guard: Pure ASCII verificado em todos os modulos alterados":
    ESTA ANCORA DEIXOU DE SER VERDADEIRA, e a divergencia se declara em vez de se
    omitir. Medido: 3 bytes >127 em run_inference.py (uma seta U+2192 na diretiva
    de persona) e 6 em test_run_inference_contrato.py (tres "e" acentuados, dois
    deles em fixtures que existem justamente para exercitar o filtro com texto em
    portugues). Sao arquivos .py, que o Python 3 le como UTF-8 por padrao, e a
    fase 5 do portao so cobra nao-ASCII em .ps1 -- por isso nada quebra e a suite
    completa segue verde. O que caducou foi a AFIRMACAO daquele registro, nao o
    funcionamento do codigo. RATIFICADO PELO TIER 0 em 2026-09-08, ao ser
    apresentado: o nao-ASCII e adequado ao chat conversacional, cuja saida e em
    portugues. A ancora nao e violacao a corrigir; e uma propriedade que a
    finalidade do modulo tornou obsoleta. Nao reescrevo registro publicado: a
    divergencia fica aqui, datada, medida e ratificada.
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  so: Windows
  python: '3.14.6'
  pwsh: '7.6.5'
objetivo: >-
  Publicar, por autorizacao expressa do Tier 0, o saneamento de saida de terminal
  produzido por uma sessao concorrente do Gemini 3.8 Flash que encerrou sem
  commitar, preservando a autoria individual e declarando a sobreposicao de malha.
classe_tarefa: publicacao-assistida-de-trabalho-concorrente
criterio_de_aceite:
  - A autoria do commit e de quem escreveu o codigo, nao de quem o publicou.
  - As ancoras do registro de 05/09 sao revisadas uma a uma, com medicao.
  - A sobreposicao de malha fica declarada, nao dissolvida no relato.
verificado:
  - >-
    SOBREPOSICAO DE MALHA OCORREU E ESTA DECLARADA. As 09h, durante esta sessao,
    apareceram em `git status` dois caminhos que nao eram meus --
    scripts/llm_inference/run_inference.py (+153) e
    tests/test_run_inference_contrato.py (+55). A Lei de Concorrencia da secao 7
    do Site/CLAUDE.md proibe dois modelos de fronteira sobre a mesma malha
    conectada; a sobreposicao foi real, nao hipotetica, e foi comunicada ao Tier 0
    no instante em que foi medida. A sessao autora encerrou sem commitar e o Tier 0
    autorizou expressamente a publicacao.
  - >-
    Suite completa medida NESTA arvore, com o trabalho concorrente presente:
    982 aprovados / 1 pulado / zero erros / zero warnings. O recorte dos dois
    arquivos ancorados: 55/55.
  - >-
    As quatro ancoras do registro de 05/09 foram medidas individualmente; tres se
    mantem e uma caducou. O detalhe esta em revisoes_de_ancora.
nao_verificado:
  - >-
    NAO auditei o codigo publicado. Nao li o diff de 153 linhas em busca de
    defeito, nao revisei a logica do saneador de LaTeX nem a do filtro de stream,
    e nao avaliei se os tres testes novos cobrem o contrato que dizem cobrir. O que
    medi foi o entorno: a suite verde, as quatro ancoras e a preservacao do
    streaming. Publicacao nao e revisao, e tratar uma pela outra seria o parecer
    generico que a secao 1.2 proibe.
  - >-
    NAO ha, neste registro, avaliacao de merito sobre a decisao de operar duas
    sessoes concorrentes na mesma arvore. Isso e prerrogativa do Tier 0.
---

# Publicação assistida do saneamento de terminal

**Sessão:** `claude-opus5-site-2026-09-08-pmev` · **Regime:** `assistida`

---

## 1. Por que este registro existe separado

O trabalho publicado neste commit **não é meu**. Foi produzido por uma sessão
concorrente do `Gemini 3.8 Flash` que encerrou sem commitar. O Tier 0 autorizou
expressamente a publicação.

A §7 do `Site/CLAUDE.md` é literal: *"a assinatura é isolada, sempre individual"*.
Por isso o commit sai sob a autoria do Gemini — **quem escreveu assina** — e a
operação de publicação fica declarada no corpo. Um commit meu carregando código
que não escrevi tornaria a malha incapaz de auditar a si mesma, que é exatamente
a falha que a seção documenta.

---

## 2. A sobreposição de malha, declarada

A §7 proíbe dois modelos de fronteira operando sobre a mesma malha conectada.
Ela **ocorreu**, e não como hipótese: às 09h os dois caminhos apareceram no meu
`git status` no meio de uma medição minha, com o meu próprio trabalho de PMev
ainda não commitado na mesma árvore.

O risco concreto era um `git add -A` de qualquer um dos lados arrastando o
trabalho do outro. Foi por isso que o stage deste commit nomeia os dois caminhos
um a um, e o meu commit de PMev nomeia os seus sete — **em nenhum momento `-A` ou
`-a`**.

Isso não é reparo suficiente para a regra: a regra pede worktree disjunta. Fica
registrado como o que foi — uma sobreposição autorizada e contida, não uma
sobreposição inofensiva.

---

## 3. O que medi, e o que não medi

**Medi o entorno:** a suíte completa nesta árvore (982 / 1 pulado / 0 / 0), o
recorte dos dois arquivos (55/55, contra 52/52 ancorados), e as quatro
propriedades que o registro de 05/09 ancora nesses caminhos.

**Não auditei o código.** Não li as 153 linhas em busca de defeito, não revisei a
lógica do saneador de LaTeX nem a do filtro de stream. Publicação não é revisão, e
declarar uma como a outra produziria exatamente o parecer genérico que a §1.2
chama de *"pior que nenhum, porque parece revisão sem ser"*.

---

## 4. A âncora que caducou

Três das quatro âncoras se mantêm. A quarta não:

> *"ASCII Guard: Pure ASCII verificado em todos os módulos alterados"* — registro
> de 2026-09-05, §6.

Medido hoje: **3 bytes `>127`** em `run_inference.py` (uma seta `→`, numa diretiva
de persona que, ironicamente, instrui a escrever em *"ASCII legível"*) e **6** em
`test_run_inference_contrato.py` — três `é`, dois deles em fixtures que existem
justamente para exercitar o filtro com texto em português.

**Nada quebra:** são `.py`, que o Python 3 lê como UTF-8 por padrão, e a fase 5 do
portão só cobra não-ASCII em `.ps1` (§6.4). O que caducou é a **afirmação**, não o
funcionamento.

**Ratificado pelo Tier 0 em 2026-09-08**, ao lhe ser apresentado: para o chat
conversacional, está tudo bem. Isso muda o estatuto do achado — a âncora não é uma
violação a corrigir, e sim uma propriedade que a **finalidade do módulo tornou
obsoleta**. Um chat que responde em português não tem por que ser ASCII puro, e
insistir nisso seria preservar a letra de uma verificação contra o propósito dela.

Registro publicado não se reescreve. A divergência fica aqui, datada, medida e
ratificada.

---

**Assinatura:** `Claude Opus 5 [Tier 1.B]`
**Propósito:** publicar trabalho de outra linhagem preservando a autoria de quem o
escreveu, revisar as âncoras que ele toca com medição individual, e deixar a
sobreposição de malha declarada em vez de dissolvida no relato.
