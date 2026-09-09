---
id: validacao-2026-09-07-findings-do-astra-contra-o-codigo
tipo: validacao
escopo: Site
ecossistema: nexus-sota
autor: "Claude Opus 5 [Tier 1.B] -- sessao claude-opus5-site-2026-09-07-preludio"
criado_em: 2026-09-07T19:05:00-03:00
atualizado_em: 2026-09-09T11:30:00-03:00
classes: [interno, medido, verificacao-independente, icm, procedencia]
caminhos:
  - engine/timesfm_engine.py
  - core/perspective_schemas.py
  - frontend/src/lib/perspectiva.ts
  - frontend/src/lib/icmEngine.ts
  - frontend/src/lib/rpDeriver.ts
  - database/lab_manager.py
  - wasm-equity/lib.rs
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  so: Windows
  python: '3.14.6'
  pwsh: '7.6.5'
verificado:
  - >-
    Os 17 findings da auditoria do Astra (2026-09-05) foram EXECUTADOS contra o
    codigo atual, nao lidos no relatorio de implementacao dele. Cinco fechados,
    um parcial, nove abertos, dois nao conclusivos.
  - >-
    B01 fechado nos dois lados: RANGE_MASK_BYTE_LENGTH=338 e indice esparso
    hi*52+lo tanto em rangeParser.ts quanto em wasm-equity/lib.rs.
  - >-
    B02 fechado por execucao: ICM([100,0],[70,30]) devolve [70,30] com soma 100
    (era [70,0], soma 70); bf_matrix=1.0 e req_equity_matrix=50.0 em HU 50/50
    (eram 2.5 e 71.43%).
  - >-
    B03 ABERTO com reproducao identica a da auditoria: _buildSimulatedStacks
    com [50,50], pot 10, heroCost 5, investido 2 produz massas 105/110/108.
  - >-
    B04 ABERTO com reproducao identica: _model e None, a serie [1,2,3,4] com
    H=3 devolve [5.0,6.0,7.0] e model_used declara
    'google/timesfm-2.0-500m-pytorch'.
  - >-
    B05 PARCIAL: fold_equity=2 passou a ser rejeitado, mas valuation_stack=-1
    continua ACEITO em PerspectiveTreeRequest e e rejeitado em
    PerspectiveCalculationRequest -- exatamente a nao propagacao que o finding
    descreve.
  - >-
    F01, F02 e F04 fechados: os cinco pedidos do worker existem com
    MULTIWAY_RIO_RESULT, DEMO_FALLBACK esta no tipo e na UI, e icmMatrix.ts
    declara agregacao por subconjuntos O(n*2^n).
  - >-
    Revisao de ancora em 2026-09-09: o import padrao math foi movido do escopo
    local para o topo de engine/timesfm_engine.py. A reproducao B04, seu
    veredito historico e os demais findings permanecem inalterados.
nao_verificado:
  - >-
    F03: humanNoiseFactor existe e e consumido, mas nao verifiquei a fundo se a
    origem (source=baseline) chega ao calculo. Precisa de rastreio do fluxo, nao
    de grep.
  - >-
    F05: o arquivo tem 8 classes responsivas, o que sugere correcao, mas NAO
    reinspecionei em viewport 390x844. Sem medicao visual, nao declaro fechado.
  - >-
    Nao reexecutei as medicoes de performance do relatorio do Astra
    (7.287 ms -> 69-122 ms). Verifiquei o mecanismo (subconjuntos), nao o tempo.
  - >-
    Nenhum finding foi CORRIGIDO nesta sessao. Esta e uma validacao; a correcao
    e trabalho proprio e nao foi autorizada aqui.
---

# Validação: os 17 findings do Astra, executados contra o código

**Sessão:** `claude-opus5-site-2026-09-07-preludio`

Motivo: o relatório de implementação do Astra descreve as correções, mas
descrever não é verificar. Esta validação **executa as reproduções literais** que
a auditoria dele registrou, contra o código de hoje.

---

## 1. O quadro

| # | P | Finding | Veredito | Evidência de execução |
| :-- | :-- | :--- | :--- | :--- |
| `B01` | P1 | ranges perdem informação antes do WASM | **FECHADO** | `RANGE_MASK_BYTE_LENGTH = 338`; Rust usa `h*52+l` com `byte_idx < mask.len()` |
| `B02` | P1 | eliminação perde o prêmio garantido | **FECHADO** | `ICM([100,0],[70,30]) = [70,30]`, soma 100; `bf=1.0`; `req_eq=50.0` |
| `B03` | P1 | contrafactuais não preservam massa de fichas | **ABERTO** | somas 105 / 110 / 108 — idênticas às da auditoria |
| `B04` | P1 | TimesFM atribuído como executado | **ABERTO** | `_model=None`; `[1,2,3,4]→[5.0,6.0,7.0]`; `model_used='google/timesfm-2.0-500m-pytorch'` |
| `B05` | P1 | API de árvore aceita entrada impossível | **PARCIAL** | `fold_equity=2` rejeitado; `valuation_stack=-1` **aceito na árvore** |
| `B06` | P2 | semânticas diferentes sob o mesmo nome | **ABERTO** | `icm_matrix.py:124` usa `(bf−1)/(bf+1)`; `rpDeriver.ts:58` usa `(bf−1)/bf` |
| `B07` | P2 | autenticação e autoridade se misturam | **ABERTO** | `user_role` tem **0 ocorrências** em `handlers.py` |
| `B08` | P2 | persistência e schema Prisma divergem | **ABERTO** | `model Tournament`: **0** no `schema.prisma`; DAO consulta a tabela |
| `B09` | P2 | instalação e documentação divergem | **ABERTO** | `AGNOSTIC_SYSTEM.md` ausente; `system_config.json` ausente e copiado no Dockerfile; `EXPOSE 8000` vs 17042; `.cerebro` no README |
| `F01` | P1 | contrato hook/worker incompatível | **FECHADO** | os cinco pedidos existem; `MULTIWAY_RIO` devolve `MULTIWAY_RIO_RESULT` |
| `F02` | P1 | fallback Monte Carlo com resultado aparente | **FECHADO** | `DEMO_FALLBACK` no tipo e na UI: *"Molde ativo • nenhuma mão simulada"* |
| `F03` | P2 | perfil baseline sem procedência | **não conclusivo** | `humanNoiseFactor` existe e é consumido; o fluxo da origem não foi rastreado |
| `F04` | P2 | recomputação combinatória síncrona | **FECHADO** | `icmMatrix.ts:162` — agregação por subconjuntos `O(n·2ⁿ)` |
| `F05` | P2 | controles recortados no mobile | **não conclusivo** | 8 classes responsivas no arquivo; **sem reinspeção visual em 390 px** |
| `F06` | P2 | relays com políticas diferentes | **ABERTO** | `/api/proxy` continua ausente; relay usa `BACKEND_API_URL` com fallback literal |
| `F07` | P2 | duplicação de motores muda o estimando | **ABERTO** | N>10 reverte para ChipEV com `console.warn` e **nenhum campo de método no resultado** |
| `F08` | — | solver multiway em construção | **ABERTO por design** | `wasm-equity/lib.rs:891` — `// ->> wins[p] += 1.0` segue comentado |

**Cinco fechados, um parcial, nove abertos, dois não conclusivos.**

---

## 2. O que isto diz sobre o trabalho do Astra

**Ele não exagerou.** Cada finding que declarou fechado está fechado, e a
verificação é independente: `B02` foi conferido por execução, não por leitura, e
os três números que a auditoria previu — `[70,30]`, `BF=1`, `50%` — saíram
exatos. O mesmo para `B01`, cuja constante `338` é o número que ele calculou.

**E ele não escondeu o que não fechou.** `B04` está declarado em três âncoras
distintas do relatório dele como *"inferência real TimesFM não certificada"*;
`B03` aparece como limite explícito; `F08` está nomeado como capacidade em
construção. A auditoria e o relatório são consistentes entre si e com o código.

Os nove abertos, portanto, **não são regressão nem promessa não cumprida**: são
o escopo que aquela sessão não tomou, declarado como tal. O que faltava era
exatamente isto — alguém executar em vez de ler.

---

## 3. Ordenação do que ficou aberto

Por gravidade dividida por raio, e a primeira é a única que a malha **consome
hoje**:

1. **`B04` — procedência do TimesFM.** É o mais grave, e não pelo cálculo: a
   extrapolação é `last_val + trend*step` com bandas `1.28·std·√step`, e isso é
   legítimo como fallback. O defeito é o **rótulo**: `model_used` devolve
   `google/timesfm-2.0-500m-pytorch` para um cálculo que nunca carregou pesos.
   A §3 do `CLAUDE.md` separa capacidade, procedência e autorização justamente
   porque confundi-las corrompe as três — e há **consumidor ativo**: a §8.3
   declara que o TimesFM projeta a trajetória de `H=3` sessões na evidência de
   calibração. A malha está formulando hipótese sobre si mesma a partir de uma
   reta rotulada como modelo do Google.
   *Correção aditiva e barata: `model_used` declarar a extrapolação quando
   `_model is None`. Raio: 1 arquivo, mais os consumidores do campo.*

2. **`B03` — massa de fichas nos contrafactuais.** 105/110/108 para o mesmo
   pote. Deltas ICM, BF e utilidade capturam fichas criadas pela modelagem da
   transição. Exige escolher a convenção (stacks antes ou depois das
   contribuições) — é decisão de domínio, não refatoração.

3. **`B05` — `valuation_stack=-1` na árvore.** Meia correção é pior que
   nenhuma, porque o request pontual rejeita e a árvore aceita: quem lê um dos
   dois conclui errado sobre o outro. Raio: um validador.

4. **`B06` e `F07` — o mesmo rótulo para grandezas diferentes.** `RP` tem duas
   fórmulas; `calculateMapaICM` troca de estimando acima de N=10 avisando só no
   console. Ambos se resolvem declarando método e unidade **no resultado**, não
   no comentário.

5. **`B07`, `B08`, `B09`, `F06`** — dívida de fronteira, persistência e
   reprodutibilidade. Reais, sem consumidor em risco imediato numa bancada de
   operador único.

6. **`F08`** — capacidade em construção. Não é defeito.

---

**Assinatura:** `Claude Opus 5 [Tier 1.B]`
**Propósito:** fechar a única parte do trabalho do Astra que seguia sem
verificação independente, executando as reproduções da auditoria dele contra o
código atual e ordenando o que restou aberto.
