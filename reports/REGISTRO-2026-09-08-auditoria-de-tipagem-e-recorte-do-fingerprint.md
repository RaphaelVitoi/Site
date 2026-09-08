---
id: registro-2026-09-08-auditoria-de-tipagem-e-recorte-do-fingerprint
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: "Claude Opus 5 [Tier 1.B] -- sessao claude-opus5-site-2026-09-08-contraste"
criado_em: 2026-09-08T20:30:00-03:00
atualizado_em: 2026-09-08T21:05:00-03:00
classes: [interno, medido, auditoria, correcao, portao]
caminhos:
  - api/v1/handlers.py
  - engine/pmev_pipeline.py
  - llm/free_router.py
  - llm/orchestrator.py
  - llm/search.py
  - llm/session.py
  - scripts/ops/datacloud_mcp_proxy.js
  - scripts/ops/lighthouse_cwv_audit.mjs
  - tests/test_cwv_gate_truthfulness.py
  - reports/cwv/latest_lighthouse_production.json
revisoes_de_ancora:
- registro: frente-4-2026-08-28-autoridade-de-roteamento
  caminhos: [llm/orchestrator.py]
  parecer: >-
    Ancora o orchestrator pela AUTORIDADE de roteamento -- quem decide modelo e
    cadeia de fallback. A alteracao nao toca decisao alguma: troca tres
    construcoes de aiohttp.ClientTimeout pela funcao make_client_timeout, com os
    mesmos valores de total, connect e sock_read. Nenhuma rota, prioridade ou
    politica mudou.
- registro: registro-2026-09-01-fronteira-http-e-portao-independente-de-perfil
  caminhos: [api/v1/handlers.py]
  parecer: >-
    Ancora a fronteira HTTP e seus endpoints. A unica alteracao no arquivo e um
    comentario de pylint na linha 5 -- acrescimo de `too-many-lines` a supressao
    ja existente. Zero linhas de codigo executavel foram tocadas; nenhum handler,
    rota ou validacao de entrada mudou.
- registro: registro-2026-09-03-saneamento-regras-instrucoes-e-contexto-sota-v8-gold
  caminhos: [scripts/ops/datacloud_mcp_proxy.js]
  parecer: >-
    Ancora o proxy dentro do saneamento de regras e contexto. A alteracao e uma
    linha: o template literal com escapes duplos vira String.raw. A string
    resultante e VERIFICADA identica -- `\\.\pipe\datacloud-mcp-<id>` nos dois
    casos. Comportamento do named pipe inalterado.
- registro: registro-2026-09-04-correcao-mcp-proxy-datacloud-exit-134
  caminhos: [scripts/ops/datacloud_mcp_proxy.js]
  parecer: >-
    E o registro mais proximo desta linha: ele corrigiu o exit 134 do proxy, e
    fixou justamente que o caminho do named pipe do Windows nao pode passar por
    path.join. Essa propriedade esta INTACTA -- a alteracao mantem a formatacao
    canonica e so troca a forma de escapar as barras, produzindo a mesma string.
- registro: registro-2026-09-04-higienizacao-memoria-e-harmonizacao-fractal
  caminhos: [scripts/ops/datacloud_mcp_proxy.js]
  parecer: >-
    Ancora o proxy no contexto de higienizacao de memoria. A alteracao e local a
    funcao getSocketPath e nao toca ciclo de vida, buffer, memoria nem
    encerramento do processo. Uma linha, mesma string resultante.
- registro: registro-2026-09-07-orquestrador-api-keys-free-e-pmev
  caminhos: [engine/pmev_pipeline.py, llm/free_router.py]
  parecer: >-
    Ancora a faixa gratuita e o pipeline PMev. Em free_router.py o unico ajuste
    semantico e trocar a string "low" pelo enum types.ThinkingLevel.LOW -- mesmo
    nivel, com tipo forte; as cotas RPM/TPM/RPD nao foram tocadas. Em
    pmev_pipeline.py sai apenas import morto (`json`, `asdict`, conferido por
    grep) e parenteses supefluos numa comparacao encadeada, que `not` avalia
    identicamente por precedencia.
- registro: registro-2026-09-07-procedencia-do-timesfm-e-json-do-cli
  caminhos: [api/v1/handlers.py]
  parecer: >-
    Ancora o JSON que o CLI consome pelos handlers. Nenhum contrato de resposta
    mudou: a alteracao no arquivo e exclusivamente o comentario de pylint no
    cabecalho. A procedencia do TimesFM e o formato de saida seguem como aquele
    registro os fixou.
- registro: validacao-2026-08-28-arquitetura-de-memoria
  caminhos: [llm/session.py]
  parecer: >-
    Ancora a sessao HTTP global dentro da arquitetura de memoria -- reuso de
    conector e limite de concorrencia. As duas propriedades seguem intactas:
    make_client_timeout apenas MONTA o ClientTimeout com os campos informados, e
    o timeout global segue total=600 / connect=15 / sock_read=300. O
    ceil_threshold=5.0 explicitado e o proprio default do aiohttp.
- registro: auditoria-2026-08-31-integridade-e-integracao-antigravity
  caminhos: [tests/test_cwv_gate_truthfulness.py]
  parecer: >-
    Ancora a suite de veracidade do gate dentro daquela auditoria de integridade.
    Nenhum teste existente foi alterado ou removido: os nove novos entraram ao
    FIM do arquivo, em append puro, e a contagem subiu de 17 para 26 aprovados
    sem nenhuma reprovacao.
- registro: auditoria-cwv-lighthouse-2026-09-01
  caminhos: [scripts/ops/lighthouse_cwv_audit.mjs, tests/test_cwv_gate_truthfulness.py]
  parecer: >-
    E a ancora mais proxima: ela fixa que o gate usa a CLI do coletor e jamais
    uma segunda implementacao do hash. Essa propriedade esta INTACTA -- o
    algoritmo, a ordem de enumeracao e o formato do digest nao mudaram. O que
    mudou foi apenas QUAIS ARQUIVOS entram na varredura, e o teste que fixa a
    propriedade segue no arquivo e segue passando.
- registro: handoff-2026-09-08-contraste-fechado-e-o-gatilho-do-lighthouse
  caminhos: [reports/cwv/latest_lighthouse_production.json, scripts/ops/lighthouse_cwv_audit.mjs]
  parecer: >-
    E o handoff que ENTREGOU esta analise ao Tier 0 e propos exatamente este
    recorte na sua secao 2.4. Este commit executa a proposta sob autorizacao
    explicita; nao a contraria. O certificado foi renovado com o algoritmo novo
    e o veredito e o mesmo: TBT 0 ms, CLS 0, score 1.0.
- registro: registro-2026-09-04-lighthouse-certificado-e-o-certificado-que-nao-viajava
  caminhos: [reports/cwv/latest_lighthouse_production.json]
  parecer: >-
    Ancora o certificado para que ele VIAJE, versionado em vez de local. Esta
    atualizacao preserva isso integralmente: o artefato segue versionado, com o
    mesmo schema e os mesmos campos obrigatorios. Muda o fingerprint, porque o
    conjunto varrido encolheu 4.4%.
- registro: registro-2026-09-07-certificacao-tbt-e-zero-warnings-cwv
  caminhos: [reports/cwv/latest_lighthouse_production.json]
  parecer: >-
    Ancora o certificado pelo TBT zerado e pela ausencia de warnings. As duas
    propriedades seguem verdadeiras nesta 14a execucao -- TBT 0 ms e gate com
    zero erros e zero warnings. O recorte nao afrouxa limiar algum: ele so evita
    exigir nova medicao quando o resultado provadamente nao pode mudar.
- registro: registro-2026-09-07-procedencia-do-timesfm-e-json-do-cli
  caminhos: [tests/test_cwv_gate_truthfulness.py]
  parecer: >-
    Ancora aquele arquivo de teste pela procedencia do TimesFM e pelo JSON do
    CLI. Nenhum dos testes que sustentam essas duas coisas foi tocado; os nove
    novos sao append ao fim e tratam exclusivamente do escopo do fingerprint.
- registro: registro-2026-09-08-contraste-icmev-chipev-executado
  caminhos: [reports/cwv/latest_lighthouse_production.json]
  parecer: >-
    Ancora o certificado apenas como prova de que o contraste foi verificado sob
    TBT zerado. A propriedade segue intacta -- TBT 0 ms, exit 0 --, e nenhum dos
    oito achados do contraste depende de LCP, o unico valor que variou
    (400.27 -> 417.20 ms, ambos com folga de 5x contra o teto).
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  so: Windows
  python: '3.14.6'
  pwsh: '7.6.5'
objetivo: >-
  Auditar o trabalho de tipagem deixado por outra linhagem na arvore, e
  estreitar o gatilho de recertificacao do Lighthouse ao que compoe o bundle,
  ambos por autorizacao explicita do Tier 0.
classe_tarefa: auditoria-e-correcao-de-portao
criterio_de_aceite:
  - Nada do que foi auditado altera comportamento de runtime sem estar declarado.
  - O recorte do fingerprint estreita o GATILHO e nao a COBERTURA.
verificado:
  - >-
    AUTORIZACAO EXPLICITA DO TIER 0 para as duas frentes: estreitar o fingerprint
    (que e scripts/ops, territorio da secao 10.3) e auditar/commitar o trabalho
    em aberto com co-autoria de auditor.
  - >-
    RECORTE DO FINGERPRINT, POR TDD. Nove testes escritos ANTES da mudanca em
    tests/test_cwv_gate_truthfulness.py; cinco reprovavam e quatro passavam, que
    e o estado correto. Depois da mudanca, 26 aprovados no arquivo.
  - >-
    O RECORTE ESTREITA O GATILHO, NAO A COBERTURA. Excluidos apenas
    `__tests__`, `__fixtures__`, `__mocks__` e arquivos casando
    `\.(test|spec)\.[cm]?[jt]sx?$` -- 36 de 812 arquivos, 4.4%. VERIFICADO por
    grep antes de excluir: nenhum modulo de producao sob frontend/src importa
    de qualquer um desses diretorios.
  - >-
    CASAMENTO POR SUFIXO, NUNCA POR SUBSTRING, e ha teste adversarial para isso:
    `testemunho.tsx` e `contest.ts` contem "test" no nome, sao codigo de
    producao, e continuam expirando a certificacao. Substring produziria falso
    negativo SILENCIOSO, que e pior que a recertificacao a mais.
  - >-
    EFEITO MEDIDO NA ARVORE REAL: com e sem a sonda __d5probe.test.ts, o
    fingerprint agora e IDENTICO
    (bd4e4a08eacd92ede209a514c279365f43befd6ef7274a908134568087ff8964). Antes da
    mudanca divergia -- bba6a4a7 contra 51b38998.
  - >-
    AUDITORIA DO TRABALHO DE OUTRA LINHAGEM, sete arquivos, seis pontos
    verificados e nao presumidos: (1) `json` e `asdict` sem uso restante em
    pmev_pipeline.py; (2) `not (a<=w<=b)` e `not a<=w<=b` sao equivalentes por
    precedencia; (3) String.raw produz a mesma string do template com escapes
    duplos; (4) types.ThinkingLevel.LOW existe e types ja estava importado;
    (5) aiohttp segue usado em search.py e orchestrator.py, e `Any` ja estava
    importado em session.py; (6) `_ = estimated_tokens` NAO canoniza defeito --
    o estorno e LIFO e o pop() ja remove a entrada com o valor reservado.
  - >-
    ARQUIVO VERSIONADO AUSENTE DO DISCO, restaurado:
    .claude/RELATORIOS/INVENTARIO_FERRAMENTAS.md (1143 bytes) estava no indice e
    nao no working tree, reprovando
    tests/test_manifesto_de_documentos.py::test_todo_documento_declarado_resolve.
    Restaurado com `git checkout --`, e o teste voltou a passar.
  - >-
    Suite Python 993 aprovados / 1 pulado / zero erros / zero warnings (eram 984
    antes dos nove testes novos). Frontend 35 suites / 265 aprovados / zero
    warnings. Lighthouse exit 0, TBT 0 ms, LCP 417.20 ms, CLS 0, score 1.0.
nao_verificado:
  - >-
    NAO INVESTIGUEI A CAUSA de INVENTARIO_FERRAMENTAS.md desaparecer do disco. E
    a TERCEIRA ocorrencia registrada -- 2026-09-03 (`cause unknown` no diario),
    2026-09-07 (restaurado) e agora --, e nenhuma delas foi commitada: algo apaga
    o arquivo fora do git. Restaurei; a causa segue aberta.
  - >-
    CAUSA DA AUSENCIA: DESCONHECIDA. Esta linha AFIRMAVA "houve atividade
    concorrente na arvore", e a afirmacao foi RETIRADA por evidencia primaria do
    Tier 0, que declarou que a atividade na arvore era a dele -- lint e aiohttp,
    exatamente o que foi auditado -- e que ninguem apagou o arquivo. Eu havia
    convertido inferencia em fato, e tratado o horario da PERCEPCAO (16:05, mtime
    do diretorio) como horario do EVENTO, que e a distincao que a secao 8.2 exige
    e eu nao fiz. Ver a secao 5 deste registro.
  - >-
    DUAS HIPOTESES DE MECANISMO TESTADAS E AMBAS SEM LASTRO: (a) hook ou script
    que limpe .claude/ -- nenhum existe, e os quatro settings.json tem `hooks`
    vazio; (b) ferramenta que gerencie o diretorio -- nao demonstravel, e
    .claude/RELATORIOS/ contem exatamente UM arquivo versionado. A causa segue
    aberta, e e a mesma que 2026-09-03 registrou como `cause unknown`.
  - >-
    NAO TOQUEI frontend/src/tests/simulator/__d5probe.test.ts, sonda exploratoria
    de outra linhagem com sete console.log. Ela segue untracked e portanto FORA
    do repositorio; nao a removi porque ha atividade concorrente e remover
    artefato em uso seria interferencia. Preservada byte a byte, 1075 bytes.
  - >-
    NAO EXCLUI do fingerprint os arquivos de configuracao de teste (jest.config,
    jest.setup, jest.reporter). Sao poucos, mudam raro, e cada exclusao adicional
    e risco de falso negativo. O recorte ficou no que e inequivocamente de teste.
  - >-
    NAO MEDI o ganho de tempo do recorte. O fingerprint segue hasheando os 776
    arquivos restantes, e o grosso do volume e `public` (163.65 MB), que nao foi
    tocado.
---

# Auditoria de tipagem, e o recorte do gatilho do Lighthouse

**Sessão:** `claude-opus5-site-2026-09-08-contraste` · **Regime:** `assistida`

---

## 1. Duas frentes, ambas autorizadas

O Tier 0 autorizou explicitamente: **estreitar o fingerprint** — que é
`scripts/ops/`, território da §10.3 — e **auditar e commitar** o trabalho de
outra linhagem que estava aberto na árvore, com co-autoria de auditor.

---

## 2. O recorte do fingerprint

### 2.1 O problema era o gatilho, nunca a verificação

Documentado no handoff da sessão: `TBT = 0` em **13 execuções** ao longo de oito
dias, e ainda assim o certificado expirava por arquivo que jamais chega a um
build. **Três vezes em um dia** — a última por uma sonda de 1075 bytes que
**sequer estava versionada**.

### 2.2 Feito por TDD, e o estado intermediário importa

Nove testes escritos **antes** da mudança. Rodados antes: **cinco reprovaram,
quatro passaram** — exatamente o estado correto, porque os quatro que passavam
são o guard de que o recorte não pode afrouxar.

### 2.3 O que foi excluído, e o que foi verificado antes

| Excluído | Critério |
| :--- | :--- |
| `__tests__`, `__fixtures__`, `__mocks__` | diretório de teste |
| `*.test.*`, `*.spec.*` | **sufixo**, nunca substring |

**36 de 812 arquivos — 4,4%.** E antes de excluir, verificado por `grep`:
**nenhum módulo de produção importa de qualquer um desses diretórios.**

O casamento é por **sufixo** de propósito, e há teste adversarial fixando isso:
`testemunho.tsx` e `contest.ts` contêm "test" no nome, são código de produção, e
**continuam expirando a certificação**. Substring produziria falso negativo
**silencioso** — pior que a recertificação a mais, porque o certificado
sobreviveria a uma mudança real.

### 2.4 Efeito medido na árvore

Com e sem a sonda, o fingerprint agora é **idêntico**
(`bd4e4a08…`). Antes divergia: `bba6a4a7` contra `51b38998`.

---

## 3. A auditoria do trabalho de outra linhagem

Sete arquivos, tipagem e lint. **Seis pontos verificados, nenhum presumido:**

| # | Verificação | Resultado |
| :-- | :--- | :--- |
| 1 | `json` / `asdict` ainda usados? | não — remoção correta |
| 2 | `not (a<=w<=b)` ≡ `not a<=w<=b`? | sim — precedência |
| 3 | `String.raw` produz a mesma string? | sim — idêntica |
| 4 | `types.ThinkingLevel.LOW` existe? | sim, e `types` importado |
| 5 | `aiohttp` e `Any` ainda usados? | sim — imports não ficaram órfãos |
| 6 | `_ = estimated_tokens` esconde defeito? | **não** — ver abaixo |

O item 6 era o único que podia ser grave. `release_reservation` estorna por
**LIFO**: `try_acquire` sempre acrescenta uma entrada, e o `pop()` remove
justamente essa, que já carrega o valor reservado. O parâmetro existe por
simetria de API.

**Acrescentei o docblock que explica isso** — para que ninguém "conserte" o
parâmetro e duplique o estorno.

---

## 4. Dois achados que não estavam no escopo

### 4.1 Um arquivo versionado sumiu do disco — terceira vez

`.claude/RELATORIOS/INVENTARIO_FERRAMENTAS.md` estava **no índice e não no
working tree**, reprovando `test_todo_documento_declarado_resolve`. Restaurado
com `git checkout --`; o teste voltou a passar.

**Nenhuma das três deleções foi commitada** — 03/09 (*"cause unknown"*), 07/09 e
agora. Algo apaga o arquivo **fora do git**. Restaurei; a causa segue aberta.

### 4.2 A causa é desconhecida — ver a emenda da §5

Esta seção afirmava atividade concorrente na árvore. **A afirmação foi retirada**
por evidência primária do Tier 0: a atividade era a dele, e ninguém apagou o
arquivo. A causa segue **desconhecida**, como em `2026-09-03`.

---

## 5. Emenda — eu afirmei atividade concorrente, e não tinha como

**Acrescentada no mesmo dia, após evidência primária do Tier 0.**

A §4.2 acima afirmava que *"houve atividade concorrente na árvore"*. **Isso foi
retirado.** O Tier 0 declarou que a atividade era a dele — correção de lints e o
trabalho de `aiohttp`, precisamente o que esta auditoria examinou — e que
**ninguém apagou o arquivo**.

### 5.1 O erro foi meu, e é de método

Dois defeitos, e o segundo é nomeado na própria §8.2:

**Converti inferência em fato.** O que eu tinha medido era *"o arquivo sumiu e
não fui eu"*. O que escrevi foi *"houve atividade concorrente"* — que é uma
explicação, não uma observação.

**Tratei o horário da percepção como horário do evento.** Usei o `mtime` do
diretório (`16:05`) para datar a deleção. A §8.2 exige distinguir *horário do
evento*, *da percepção*, *da captura* e *do diagnóstico*, e adverte que **uma
captura tardia jamais pode ser tratada como instante de início sem confirmação
explícita**. Eu não tinha essa confirmação.

### 5.2 O que permanece medido

O arquivo **estava ausente do disco** e `test_todo_documento_declarado_resolve`
reprovava; restaurei do índice e o teste voltou a passar. Isso não muda.

O que muda é a **causa**, que passa de "atividade concorrente" para
**desconhecida** — e é a mesma que `2026-09-03` já havia registrado como
*`cause unknown`*. Terceira ocorrência, causa nunca determinada.

### 5.3 Duas hipóteses de mecanismo, ambas testadas e sem lastro

| Hipótese | Teste | Resultado |
| :--- | :--- | :--- |
| hook ou script limpando `.claude/` | `grep` em `scripts/`, `.husky/`, settings | **nenhum existe**; os quatro `settings.json` têm `hooks` vazio |
| ferramenta gerenciando o diretório | inspeção do conteúdo | não demonstrável — há **um** arquivo versionado ali |

Não afirmo nenhuma das duas. A causa fica **aberta e declarada como tal**, que é
o registro correto quando o mecanismo não foi encontrado.

---

**Assinatura:** `Claude Opus 5 [Tier 1.B]`
**Propósito:** estreitar o gatilho de recertificação sem afrouxar cobertura
alguma, auditar o trabalho pendente de outra linhagem antes de publicá-lo sob a
autoria dela, e declarar dois achados que a auditoria descobriu de passagem.
