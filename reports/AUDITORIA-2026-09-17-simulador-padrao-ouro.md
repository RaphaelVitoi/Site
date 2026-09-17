---
id: auditoria-2026-09-17-simulador-padrao-ouro
tipo: auditoria
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: '2026-09-17T11:30:00-03:00'
atualizado_em: '2026-09-17T11:30:00-03:00'
classes: [interno, medido, frontend]
caminhos:
  - reports/AUDITORIA-2026-09-17-simulador-padrao-ouro.md
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  diretorio_de_trabalho: frontend
  branch: master
  commit_base: 4a112d31
  host: Windows 11 Pro 10.0.26200, dev server Next 16.3.5 em :3000, Chrome via DevTools em contexto isolado com Worker, fetch e PerformanceObserver instrumentados
  observacao: o Chrome automatizado limita requestAnimationFrame a cerca de 1 quadro por segundo; taxas de laco guiado por rAF foram lidas do codigo, nao medidas
  data_das_medicoes: 2026-09-17
verificado:
  - /biblioteca/estado-da-arte exibe FOLD 100.0%, CALL 0.0%, RAISE 0.0% como estrategia CFR; o console registra [SOTA CFR Worker] Invalid payload discarded para simulate_cfr_strategy
  - /simulador envia ao worker de equity heroRange random contra villainRange random; o worker responde result 0.50353 e o hook usa 50 pelo valor de reserva
  - Lente PM -- slider Equity Bruta em 70, Calcular cenario leva a 64, e depois mover para 30 e 85 mantem 64
  - Lente PM -- equity manual 72, troca para o cenario 03, a equity volta a 50
  - 8 edicoes seguidas do campo de pote em /simulador geram 8 POST /api/sota/bayesian-range, sem cancelamento
  - worker DISTORTION roda o mesmo solveIcmDistortion da thread principal com os mesmos argumentos; custo medido de 9,8 microssegundos por chamada no Jest
  - GtoCfrSimulator em /biblioteca/estado-da-arte -- 219 mensagens ao worker em 10,1 s com a pagina parada
  - MasterSimulator renderiza PmLensPanel sem nenhuma prop; o painel declara initialStacks e initialPrizes e cai em stacks, premios, pote e posicao padrao
  - usePmLensCalculations aceita pkoValue, mas PmLensPanel nao o passa e DashboardSOTA fixa pkoValue = 0, enquanto useQuantumEngine usa o PKO do usuario
nao_verificado:
  - correcao numerica dos modelos PMev, perspectiva, RIO e insolvencia -- formulacao do Tier 0, fora do escopo desta auditoria de engenharia
  - taxa real do laco rAF do CfrRegretPanel num navegador em primeiro plano
  - PmevRangeViewer, ReferencialAula12 e EquityCalculator alem das buscas por padrao; a recaptura da Aula 1.2 ja tem pendencia propria
  - consumo de bateria e CPU medido por perfilador
pendencias:
  - id: pend-2026-09-17-cfr-estrategia-fabricada
    o_que: Parar de exibir FOLD 100% como estrategia CFR quando o worker nao calculou nada (SIM-01)
    dono: Tier 0
    prazo: 2026-09-24
  - id: pend-2026-09-17-equity-nativa-fixa
    o_que: Destravar a equity da Lente PM apos o calculo e fazer o reset por cenario ser explicito (SIM-02)
    dono: Tier 0
    prazo: 2026-09-24
  - id: pend-2026-09-17-pko-divergente
    o_que: Ligar a Lente PM ao spot ativo e fazer PM Lens e Dashboard usarem o PKO do motor principal (SIM-03)
    dono: Tier 0
    prazo: 2026-09-24
---

# Auditoria do simulador — 2026-09-17

**Por que este aspecto.** O simulador é o produto central e a maior superfície do frontend:
`frontend/src/components/simulator` tem 26,6 mil linhas, mais os motores de `frontend/src/lib`. A auditoria de frontend
anterior (`reports/AUDITORIA-2026-09-17-frontend-padrao-ouro.md`) deixou declaradamente de fora "motores matemáticos,
workers e WASM".

**Escopo e limite.** Engenharia em volta dos motores: contratos entre thread principal e workers, corridas,
valores de reserva exibidos como resultado, coerência entre painéis e custo de execução. **Não** avalia a
formulação do PMev, da perspectiva, do RIO nem da insolvência: é matéria do Tier 0, e mexer ali por
auditoria de engenharia seria decidir modelo sem mandato.

**Método.** Leitura do fluxo `/simulador` → `MasterSimulator` → hooks → workers, com a página real
instrumentada: cada `postMessage` e cada resposta de worker, cada `fetch` e cada tarefa longa.

**Numeração:** `SIM-nn`.

## Resumo

| # | Sev. | Achado | Prova |
| :-- | :-- | :--- | :--- |
| SIM-01 | **P1** | Estratégia CFR exibida como FOLD 100% sem cálculo nenhum | DOM + console |
| SIM-02 | **P1** | Equity da Lente PM trava depois do cálculo; o reset por cenário vem de uma resposta descartada | Chrome + mensagens do worker |
| SIM-03 | **P1** | Lente PM desligada do spot ativo; PM Lens e Dashboard sem o PKO do motor principal | leitura |
| SIM-04 | P2 | Worker de distorção repete o cálculo da thread principal e dobra a renderização | mensagens + Jest |
| SIM-05 | P2 | POST bayesiano a cada tecla, sem cancelamento: resposta antiga pode sobrescrever a nova | fetch instrumentado |
| SIM-06 | P2 | Laços de CFR sem fim, inclusive fora da tela e com a aba oculta | mensagens do worker |
| SIM-07 | P3 | `winRate` 0 tratado como ausente, e a tela cai para 50 | leitura |
| SIM-08 | P3 | `useLlamaEngine()` chamado no simulador sem consumidor | leitura |

## P1

### SIM-01 — Estratégia CFR fabricada

`frontend/src/components/simulator/GtoCfrSimulator.tsx` inicia `cfrStrategy` em FOLD 100, CALL 0, RAISE 0 e envia
`{ id: 'simulate_cfr_strategy', evs }` ao worker. `frontend/src/components/simulator/workers/cfr.worker.ts` exige `nodes` e `pot`
numéricos, descarta a mensagem com aviso e nunca responde. O estado inicial fica na tela como resultado.

**Prova:** em `/biblioteca/estado-da-arte`, os cartões mostram `FOLD 100.0%`, `CALL 0.0%` e `RAISE 0.0%`, e o console
registra `[SOTA CFR Worker] Invalid payload discarded`. Nessa página não há `SotaSpotContext`: não existe spot nenhum
cuja estratégia pudesse ser calculada.

### SIM-02 — Equity da Lente PM travada

A equity é **entrada** editável: o slider "Equity Bruta" da Lente PM grava `nativeRangeMetric` por `setManualEquity`.
Dois caminhos a atropelam.

**1. Depois do cálculo, o slider para de responder.** `PmLensPanel.tsx` e `DashboardSOTA.tsx` exibem
`insolvencyMatrixData.winRate` sempre que ele existe, e só então o valor manual. Uma vez calculado o cenário,
o manual nunca mais aparece. Medido: slider em 70, "Calcular cenário" leva a 64, e mover para 30 e 85 mantém 64.

**2. O reset por cenário é acidental.** `useMasterCalculations.ts` envia ao worker de equity `random` contra
`random` a cada troca de cenário. O worker responde `{ type: 'SUCCESS', result: 0.50353 }`, e `extractWorkerEquity`
procura `result.hero_equity` e depois `equity`, não acha nenhum e grava 50. Medido: equity manual em 72, troca para o
cenário 03, volta a 50. O efeito — recomeçar em 50 num cenário novo — é defensável. O mecanismo não é:
50 mil iterações de WASM cujo resultado se joga fora, para produzir uma constante que "aleatória contra aleatória"
já dá por definição.

A mesma leitura trata `winRate` 0 como ausência (SIM-07).

### SIM-03 — Lente PM desligada do spot ativo

`MasterSimulator.tsx` renderiza `<PmLensPanel />` sem nenhuma prop. O painel declara `initialStacks`, `initialPrizes`,
`currentPot`, `heroInvested`, `heroPosition`, `activePlayers` e `blindsRisingSoon`, e cai nos padrões:
`DEFAULT_STACKS` fixo de 9 jogadores, pote 2,5, posição BB e 2 jogadores. Escolher outro cenário no cockpit não
muda a lente, mas a equity e o cálculo de insolvência que ela usa vêm do contexto compartilhado com o cockpit. A lente
mistura, portanto, um spot fixo com resultados do spot ativo.

Além disso, `useQuantumEngine` passa `bountyValue: pkoValue * 100` à perspectiva, e `usePmLensCalculations` aceita
`pkoValue`, mas a lente não o recebe e `frontend/src/components/simulator/DashboardSOTA.tsx` fixa `const pkoValue = 0`, embora o
contexto do spot traga o valor. Com PKO ligado, o painel principal e as duas lentes calculam torneios diferentes.

**Decisão de harmonização.** A lente se descreve como ambiente de exploração, e isso fica: seleção de herói e
vilões, kappa, nodelock e sizing continuam dela. O que muda é o ponto de partida, que passa a ser o spot ativo, pelas
props que o próprio painel já declarava.

## P2

### SIM-04 — Distorção calculada duas vezes

O caso `DISTORTION` de `frontend/src/components/simulator/workers/insolvencyProcessor.ts` chama o mesmo `solveIcmDistortion`, com os
mesmos argumentos, que `useQuantumEngine` já calcula na thread principal. A cada mudança o despacho zera
`nashResults`, a tela renderiza o cálculo síncrono, e 150 ms depois o worker devolve o mesmo resultado e força
outra renderização. O solver custa 9,8 µs por chamada: o worker não alivia a thread principal, só acrescenta
espera, mensagem e renderização. `humanNoiseFactor` viaja no pedido e o solver não o lê.

### SIM-05 — POST bayesiano por tecla

8 edições do campo de pote geraram 8 `POST /api/sota/bayesian-range`. Não há `AbortController` nem descarte de
resposta obsoleta: se uma resposta anterior chegar depois de uma posterior, ela sobrescreve o valor mais novo.

### SIM-06 — Laços de CFR sem fim

- `GtoCfrSimulator`: `setTimeout` de 33 ms sem trava de ocupado. Mediu 219 mensagens em 10,1 s numa página de artigo parada, com o widget fora da tela. As dependências do efeito incluem `spot`, então cada nova identidade do contexto encerra e recria o worker.
- `CfrRegretPanel`: laço em `requestAnimationFrame` com trava de ocupado, mas sem pausa quando a aba está oculta ou o painel fora da tela. Pelo código, em primeiro plano são até 60 iterações por segundo, indefinidamente.

## P3

- **SIM-07.** `insolvencyMatrixData?.winRate ? … : undefined`, em `DashboardSOTA.tsx` e `PmLensPanel.tsx`, trata taxa de vitória 0 como ausência e exibe o reserva 50.
- **SIM-08.** `MasterSimulator` chama `useLlamaEngine()` e descarta o retorno: três estados e um efeito montados sem consumidor.

## Fora do escopo, registrado

- `GtoCfrSimulator` usa estatísticas de vilão fixas (`vpip 25`, `pfr 20`, `agg 3`) para classificar arquétipo num artigo. É ilustração editorial, não medição do usuário. Fica para a decisão editorial do Tier 0.
- Quatro `GET /api/auth/session` no carregamento em dev: dois vêm do StrictMode. Não é do simulador e não foi medido em produção.
