---
id: registro-2026-09-08-auditoria-de-tipagem-e-recorte-do-fingerprint
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: "Claude Opus 5 [Tier 1.B] -- sessao claude-opus5-site-2026-09-08-contraste"
criado_em: 2026-09-08T20:30:00-03:00
atualizado_em: 2026-09-08T20:30:00-03:00
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
    HOUVE ATIVIDADE CONCORRENTE NA ARVORE DURANTE ESTA SESSAO. A delecao acima
    ocorreu entre 15:15 (meu commit anterior) e 16:05, e nao fui eu. Nao
    identifiquei o processo responsavel.
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

### 4.2 Houve atividade concorrente na árvore

A deleção ocorreu entre **15:15** (meu commit anterior) e **16:05**, e não fui
eu. Não identifiquei o processo. Fica declarado.

---

**Assinatura:** `Claude Opus 5 [Tier 1.B]`
**Propósito:** estreitar o gatilho de recertificação sem afrouxar cobertura
alguma, auditar o trabalho pendente de outra linhagem antes de publicá-lo sob a
autoria dela, e declarar dois achados que a auditoria descobriu de passagem.
