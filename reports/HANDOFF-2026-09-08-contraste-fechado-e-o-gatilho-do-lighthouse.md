---
id: handoff-2026-09-08-contraste-fechado-e-o-gatilho-do-lighthouse
tipo: handoff
escopo: Site
ecossistema: nexus-sota
autor: "Claude Opus 5 [Tier 1.B] -- sessao claude-opus5-site-2026-09-08-contraste"
criado_em: 2026-09-08T19:20:00-03:00
atualizado_em: 2026-09-08T21:30:00-03:00
classes: [interno, medido, handoff, pmev, icm, portao]
caminhos:
  - frontend/src/tests/simulator/contrasteIcmevChipev.test.ts
  - scripts/ops/lighthouse_cwv_audit.mjs
  - reports/cwv/latest_lighthouse_production.json
referencias_nao_resolviveis:
  # Sonda de diagnostico nunca versionada, citada aqui justamente por ter sido a
  # causa medida da terceira expiracao do certificado. Apagada em 2026-09-08 por
  # decisao do Tier 0, depois de o recorte do fingerprint torna-la inerte para o
  # portao. O caminho e citado para dizer que sumiu, nao para apontar.
  - frontend/src/tests/simulator/__d5probe.test.ts
revisoes_de_ancora:
- registro: registro-2026-09-04-lighthouse-certificado-e-o-certificado-que-nao-viajava
  caminhos: [reports/cwv/latest_lighthouse_production.json]
  parecer: >-
    Aquele registro existe para que o certificado VIAJE -- seja versionado em vez
    de local. Esta atualizacao e o comportamento prescrito por ele: o fingerprint
    expirou e recertifiquei. Veredito identico ao dele: TBT 0 ms, CLS 0, score
    1.0, exit 0. LCP 400.27 ms, dentro dos mesmos limiares.
- registro: registro-2026-09-08-contraste-icmev-chipev-executado
  caminhos: [reports/cwv/latest_lighthouse_production.json]
  parecer: >-
    E o registro desta mesma sessao, e ele ancora o certificado apenas como
    prova de que o contraste foi verificado sob TBT zerado. A propriedade segue
    intacta nesta recertificacao -- TBT 0 ms, exit 0 --, e nenhum dos oito
    achados do contraste depende do valor de LCP, que e o unico que mudou
    (377.72 -> 400.27 ms, ambos com 5x de margem contra o teto).
- registro: registro-2026-09-07-certificacao-tbt-e-zero-warnings-cwv
  caminhos: [reports/cwv/latest_lighthouse_production.json]
  parecer: >-
    Aquele registro ancora o certificado pelo TBT zerado e pela ausencia de
    warnings; as duas propriedades seguem verdadeiras nesta 13a execucao. Este
    handoff nao muda limiar nem instrumento -- so mede que o TBT segue 0 e
    documenta que o GATILHO de recertificacao dispara por arquivo que nao entra
    no bundle.
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  so: Windows
  python: '3.14.6'
  pwsh: '7.6.5'
objetivo: >-
  Entregar a proxima sessao com o contraste ICMev x ChipEV FECHADO, e com a
  unica decisao pendente medida e pronta para arbitragem: o gatilho de
  recertificacao do Lighthouse.
classe_tarefa: handoff-de-continuidade
criterio_de_aceite:
  - O contraste nao e refeito nem reauditado.
  - A decisao sobre o Lighthouse chega ao Tier 0 medida, nao opinada.
verificado:
  - >-
    CONTRASTE ICMev x ChipEV EXECUTADO E FECHADO, em dois commits: cf8f148e (o
    contraste) e 5189cb59 (a correcao causal). Contrato em A1..A9, 23 testes.
    Suite 34 suites / 264 aprovados / zero erros / zero warnings; typecheck exit
    0; Lighthouse exit 0, TBT 0 ms, LCP 377.72 ms, score 1.0.
  - >-
    OS OITO ACHADOS estao no REGISTRO-2026-09-08-contraste-icmev-chipev-executado,
    com a secao 6 corrigindo o diagnostico causal e a 7 fechando a divergencia
    pelo principio do organismo de mesa. NAO REFAZER.
  - >-
    LIGHTHOUSE, HISTORICO MEDIDO nesta sessao sobre 13 execucoes em 8 dias e 10
    fingerprints distintos: TBT = 0 em 13/13; CLS = 0 em 13/13; performanceScore
    = 1.0 em 13/13. Apenas o LCP varia -- 292.2 a 496.5 ms --, contra um teto de
    2500 ms, ou seja 5x de margem no pior caso observado.
  - >-
    O GATILHO DE RECERTIFICACAO E O PROBLEMA, NAO A VERIFICACAO.
    `fingerprintProductionInputs` em scripts/ops/lighthouse_cwv_audit.mjs
    hasheia TODO arquivo sob frontend/, excluindo apenas .git, .next, coverage,
    node_modules e reports. Medido: 811 arquivos e 255.68 MB, dos quais 35
    arquivos (4.3%) sao de teste -- `*.test.*`, `__tests__`, `__fixtures__`,
    `__mocks__` -- e NENHUM deles entra no bundle de producao.
  - >-
    CUSTO CONCRETO, observado nesta sessao: adicionar UM arquivo de teste
    invalidou o certificado e forcou DUAS recertificacoes de ~40 s cada. As
    duas deixaram um chrome.exe orfao segurando a porta 9230, exigindo
    intervencao manual antes da execucao seguinte (o script recusa encerrar
    processo que nao iniciou, e essa recusa esta CORRETA).
  - >-
    TERCEIRA OCORRENCIA MEDIDA, na retomada da sessao, com o instrumento OFICIAL
    (`lighthouse_cwv_audit.mjs --fingerprint`): um arquivo de sonda de 1075
    bytes, `frontend/src/tests/simulator/__d5probe.test.ts`, NAO VERSIONADO,
    invalidou sozinho o certificado de producao. Removido o arquivo, o
    fingerprint volta EXATAMENTE ao do certificado
    (51b389985b3c3fff04135682004efe7346ad3ade56359e76b21e44aad5aeafa5); com ele,
    da bba6a4a7. E o caso mais forte da serie: o arquivo nem entra no
    repositorio, e mesmo assim expira a certificacao.
  - >-
    DIVERGENCIA DE AUTORIA NOS DOIS COMMITS DO CONTRASTE, medida nesta retomada.
    `cf8f148e` e `5189cb59` foram publicados com autor
    `Gemini 3.8 Flash <noreply@google.com>`, porque o `git config` do
    repositorio carrega essa identidade e eu NAO a verifiquei antes de commitar.
    O corpo dos dois declara `Assinatura: Claude Opus 5 [Tier 1.B]` e o trailer
    `Co-Authored-By: Claude Opus 5`, mas o CAMPO DE AUTOR -- que e o que o
    GitHub usa -- diz outra coisa. Eu declarei assinatura correta no relatorio
    de fechamento; a declaracao estava ERRADA.
  - >-
    O TBT DO LIGHTHOUSE NAO E REDUNDANTE COM A FASE 1. A fase 1 do cwv_gate
    mede via CDP no DEV SERVER; o Lighthouse mede em BUILD DE PRODUCAO com
    Chrome isolado. O proprio gate os distingue na linha de cobertura composta,
    e `OBSERVED_LONG_TASK_BLOCKING_MS` esta marcado `Enforcement = Observe` com
    a nota "nao equivale a TBT laboratorial".
nao_verificado:
  - >-
    SUPERADO PELA SECAO 4: esta linha dizia "NAO ALTEREI o fingerprint... a
    decisao e do Tier 0". A decisao veio na mesma sessao, autorizando, e o
    recorte foi implementado por TDD em 4a9867a4. O estado corrente esta em
    registro-2026-09-08-auditoria-de-tipagem-e-recorte-do-fingerprint.
  - >-
    HA TRABALHO DE OUTRA LINHAGEM NAO COMMITADO NA ARVORE, e eu NAO o auditei
    nem o toquei: sete arquivos modificados por `Gemini 3.8 Flash` em
    api/v1/handlers.py, engine/pmev_pipeline.py, llm/free_router.py,
    llm/orchestrator.py, llm/search.py, llm/session.py e
    scripts/ops/datacloud_mcp_proxy.js (35 insercoes, 14 delecoes). Mais o
    `__d5probe.test.ts`, que preservei byte a byte (1075 bytes antes e depois da
    medicao). Nenhum entra nos meus commits.
  - >-
    NAO MEDI quanto tempo o hash de 255.68 MB custa isoladamente dentro dos
    ~40 s totais da auditoria. O grosso e `public` (163.65 MB em 70 arquivos).
  - >-
    NAO INVESTIGUEI por que src/ soma 90.55 MB em 674 arquivos, valor alto para
    codigo-fonte. Anotado, fora do foco da sessao.
  - >-
    Seguem abertos: os sete findings do Astra (B05, B07, B08, B09, F03, F05,
    F06); o AXE_INCOMPLETE com revisao humana aprovada; e a escolha entre as
    duas grandezas de RP, que e do Tier 0.
  - >-
    countReproduciblePairs segue 0 de 7. Enquanto for, o contraste mede
    DISTANCIA e nao autoriza calibrar motor.
---

# Handoff: o contraste está fechado; decide-se o gatilho do Lighthouse

**Publicado em:** `master` · **Commits da sessão:** `cf8f148e`, `5189cb59`

---

## 1. O que está fechado — não reabrir

O **contraste ICMev × ChipEV foi executado**, depois de duas sessões que só
prepararam terreno. Oito achados, contrato em `A1..A9`, **23 testes**.

Cinco deles nasceram de aportes de domínio do Tier 0 durante a sessão, e cada um
mudou o **resultado**, não a redação. O mais importante fechou uma divergência
que eu havia arquivado como aberta: **a mesa é um organismo**, e a ausência de
discriminante por lado era o resultado, não a fraqueza da amostra.

Está tudo em `REGISTRO-2026-09-08-contraste-icmev-chipev-executado`, com a §6
corrigindo o diagnóstico causal e a §7 fechando a divergência. **Não refaça nem
reaudite.**

---

## 2. A decisão pendente — e ela está medida

O Tier 0 perguntou se já é possível **desligar a verificação Lighthouse e tratar
os valores como canônicos**, por parecer inútil mantê-la.

### 2.1 A intuição tem lastro

Treze execuções, oito dias, dez fingerprints distintos — ou seja, através de
mudanças reais de código:

| métrica | resultado | teto |
| :--- | :--- | :--- |
| **TBT** | `0` em **13/13** | 200 ms |
| **CLS** | `0` em **13/13** | 0.1 |
| **score** | `1.0` em **13/13** | — |
| LCP | 292.2 – 496.5 ms | 2500 ms (**5× de margem**) |

Três das quatro grandezas **nunca variaram**.

### 2.2 Mas o inútil é o gatilho, não a verificação

`fingerprintProductionInputs` hasheia **todo** arquivo sob `frontend/`,
excluindo apenas `.git`, `.next`, `coverage`, `node_modules` e `reports`.

> **811 arquivos · 255.68 MB · dos quais 35 (4.3%) são de teste**

Arquivos de teste **não entram no bundle de produção** e não podem alterar o TBT.
Medido nesta sessão: adicionar **um** arquivo de teste invalidou o certificado e
forçou **duas** recertificações, cada uma deixando um `chrome.exe` órfão na porta
`9230` que exigiu intervenção manual.

### 2.2.1 Terceira ocorrência, medida na retomada — e é a mais forte

Ao retomar a sessão, o certificado estava **expirado outra vez**. A causa,
confirmada com o instrumento oficial (`--fingerprint`), foi um arquivo de sonda
de **1075 bytes**, `frontend/src/tests/simulator/__d5probe.test.ts`, com
`console.log` e **sequer versionado**:

| árvore | fingerprint |
| :--- | :--- |
| com a sonda | `bba6a4a7…` |
| **sem a sonda** | `51b38998…` |
| certificado vigente | `51b38998…` |

Removido o arquivo, o fingerprint volta **exatamente** ao do certificado. Ele é,
sozinho, a causa da invalidação.

É o caso mais forte da série porque o arquivo **não entra no repositório** — é
`untracked`. O certificado de produção expira por um artefato que nunca chegará
a um build, e o ciclo se repetiu **três vezes em um dia**.

*(O arquivo foi preservado byte a byte: 1075 bytes antes e depois da medição.)*

### 2.3 Por que não congelar

Congelar violaria a §5 — *verificação não executada não é verificação aprovada* —
e perderia a **única medição em build de produção**: a fase 1 mede via CDP no
**dev server**, que é outro artefato. O próprio gate os distingue, e marca
`OBSERVED_LONG_TASK_BLOCKING_MS` como `Observe` com a nota *"não equivale a TBT
laboratorial"*.

`TBT = 0` é um valor de **saúde**, não uma constante da natureza. Uma dependência
pesada ou um componente client novo o tirariam de zero — e é exatamente essa
regressão que o gate existe para pegar.

### 2.4 A proposta, na escada da §8.2

**Corrigir a causa concreta antes de reduzir capacidade:** excluir do fingerprint
o que não compõe o bundle — `*.test.*`, `*.spec.*`, `__tests__/`, `__fixtures__/`,
`__mocks__/` e configs de teste.

**Ganho:** a recertificação passa a disparar só quando pode mudar o resultado.
**Perda de cobertura:** nenhuma.

Isso é mexer no instrumento que mede, então **depende de autorização do Tier 0** —
como foi o caso do `record_gate` em `fae6c6c5`.

---

## 2.5 Correção obrigatória: a autoria dos dois commits está errada

Medido na retomada: **`cf8f148e` e `5189cb59` foram publicados com autor
`Gemini 3.8 Flash <noreply@google.com>`.**

O `git config` deste repositório carrega a identidade da outra linhagem, que
operou aqui, e **eu não a verifiquei antes de commitar**. O corpo dos dois
commits declara `Assinatura: Claude Opus 5 [Tier 1.B]` e o trailer
`Co-Authored-By: Claude Opus 5` — mas o **campo de autor**, que é o que o GitHub
usa para atribuir, diz outra coisa.

**Eu declarei assinatura correta no relatório de fechamento. A declaração estava
errada.**

É precisamente o defeito que a §7 do `Site/CLAUDE.md` documenta, na variante
entre agentes: *"uma malha com múltiplos agentes que não distingue quem escreveu
o quê não consegue auditar a si mesma"*. E o discriminante que a §7 dá — nome,
fuso, trailer — aqui **também falha**, porque o nome é o da outra linhagem.

**Não se reescreve.** Os dois commits estão publicados, e a §7 é explícita:
histórico publicado não retroage, e força-push quebra checkout alheio e âncora de
revisão. A divergência fica **declarada aqui**, e a correção vale daqui em diante.

**O que muda no procedimento:** commit de agente passa a nomear a identidade
explicitamente na chamada — `git -c user.name=... -c user.email=... commit` —, em
vez de confiar no `git config` do repositório, que é estado compartilhado entre
linhagens e não é meu para alterar.

---

## 3. Prompt de continuação

> **Não refaça o contraste.** Ele foi executado e fechado em `cf8f148e` e
> `5189cb59`: oito achados, contrato `A1..A9`, 23 testes. Leia
> `handoff-2026-09-08-contraste-fechado-e-o-gatilho-do-lighthouse` e o
> `REGISTRO-2026-09-08-contraste-icmev-chipev-executado` **incluindo as seções 6
> e 7**, que corrigem o diagnóstico causal e fecham a divergência pelo princípio
> do organismo de mesa. Nada ali se reaudita.
>
> **O recorte do fingerprint JÁ FOI FEITO — não refaça.** O Tier 0 autorizou
> ainda nesta sessão, e `4a9867a4` o implementou por TDD: `__tests__`,
> `__fixtures__`, `__mocks__` e `*.test.*` / `*.spec.*` saíram do fingerprint,
> 36 de 812 arquivos. O casamento é por **sufixo** e há teste adversarial
> (`testemunho.tsx`, `contest.ts`) fixando que substring seria falso negativo
> silencioso. A §2 deste handoff virou registro histórico da decisão; o estado
> atual está em `registro-2026-09-08-auditoria-de-tipagem-e-recorte-do-fingerprint`.
>
> **O que continua aberto e é do Tier 0:** a escolha entre as duas grandezas de
> RP, e se o defeito de modelagem do `signDelta` deve ser corrigido — sete pares
> irreprodutíveis não autorizam mexer no motor, e a fixture o diz no próprio
> cabeçalho.
>
> **Se o caminho for avançar no PMev:** o gargalo real é
> `countReproduciblePairs = 0 de 7`, por `provenance` ausente. Enquanto for zero,
> o contraste mede **distância** e não autoriza calibração. Fechar isso é
> recaptura de fonte — versão de solver, build e e-Nash das capturas do HRC —, e
> não trabalho de código.
>
> **Método que esta sessão confirmou duas vezes:** medir antes de afirmar, e
> aceitar quando a medição refuta a própria hipótese. Aconteceu com a métrica de
> dominância estocástica, com o valor da saturação, com a contagem dos nós de
> raise, e com o palpite sobre `.next-dev` no fingerprint. **Um filtro que acerta
> por acidente é pior que um que reprova** — foi assim que o A6 escondeu que sua
> generalização era ampla demais.
>
> **Portões:** dev server na `:3000` e CDP na `:9222` antes de commitar; nunca
> `--no-verify` nem `SKIP_CWV_GATE=1`. Tocar `frontend/` invalida o certificado —
> recertifique com `scripts/ops/invoke_lighthouse_production_audit.ps1` e
> **confira a porta `9230` antes**, porque a execução anterior costuma deixar um
> `chrome.exe` órfão nela. Declare o veredito impresso.
>
> **Assinatura — verifique ANTES de commitar, não depois.** O `git config` deste
> repositório carrega a identidade de quem operou por último, e nesta sessão isso
> fez dois commits meus saírem como `Gemini 3.8 Flash` (§2.5). Nomeie a
> identidade na própria chamada:
> `git -c user.name="Claude Opus 5" -c user.email="noreply@anthropic.com" commit`.
> Nunca altere o `git config` do repositório para isso — é estado compartilhado
> entre linhagens. O corpo declara Assinatura e Propósito; o campo de autor é o
> que o GitHub lê.

---

## 4. O que aconteceu DEPOIS deste handoff

Ele foi escrito antes de duas autorizações do Tier 0, e ambas foram executadas na
mesma sessão. **A §2 vale como registro da decisão, não como pendência.**

| commit | autoria | o que fez |
| :--- | :--- | :--- |
| `25e065b0` | **Gemini 3.8 Flash** | tipagem de timeouts e lint, auditada por Claude Opus 5 |
| `4a9867a4` | Claude Opus 5 | o recorte do fingerprint, por TDD |
| `47c51136` | Claude Opus 5 | retirada de uma afirmação causal indevida |

**Três correções sobre mim mesmo, todas declaradas:**

1. **Autoria** — `cf8f148e` e `5189cb59` saíram como `Gemini 3.8 Flash` porque o
   `git config` do repositório carrega a identidade de quem operou por último e
   eu não verifiquei (§2.5). Corrigido daqui em diante: identidade nomeada na
   chamada.
2. **Atribuição causal** — afirmei "atividade concorrente na árvore" quando o que
   eu tinha medido era "o arquivo sumiu e não fui eu". O Tier 0 esclareceu que a
   atividade era a dele. Retirado em `47c51136`.
3. **Datação** — usei o `mtime` do diretório como hora do evento, quando era hora
   da percepção. É a distinção que a §8.2 exige.

**Segue aberta, e é a única do gênero:** a causa de
`.claude/RELATORIOS/INVENTARIO_FERRAMENTAS.md` desaparecer do disco. Terceira
ocorrência (03/09, 07/09, 08/09), nenhuma commitada, duas hipóteses de mecanismo
testadas e sem lastro. Restaurado; causa desconhecida.

> **Emenda 2026-09-08, mesmo dia.** O que estava ausente era metade da história.
> `.claude/RELATORIOS/` foi esvaziado de propósito em `a22df57e` (01/09, 187
> arquivos, autor `Raphael Vitoi`), e `a1b70698` devolveu só este arquivo — os
> outros nove ficaram para trás, oito por mérito e um por engano, restaurado
> hoje em `6745cdcb`. **Isso não explica as três sumidas acima**: nenhum commit
> posterior apaga o caminho, e elas continuam sem mecanismo. O que muda é o
> método — eu consultara o git pelo arquivo e nunca pelo diretório. Ver a §6 de
> `REGISTRO-2026-09-08-auditoria-de-tipagem-e-recorte-do-fingerprint.md`.

---

**Assinatura:** `Claude Opus 5 [Tier 1.B]`
**Propósito:** fechar o contraste sem deixar resíduo para a próxima sessão, e
entregar a pergunta do Tier 0 sobre o Lighthouse medida e pronta para arbitragem
— com a distinção entre desligar a verificação e corrigir o gatilho dela.
