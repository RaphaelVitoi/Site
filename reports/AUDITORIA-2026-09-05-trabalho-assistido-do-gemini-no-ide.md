---
id: auditoria-2026-09-05-trabalho-assistido-do-gemini-no-ide
tipo: auditoria
escopo: Site
ecossistema: nexus-sota
autor: "Claude Opus 5 [Tier 1.B] -- sessao claude-opus5-site-2026-09-05-fechamento-do-ciclo"
criado_em: 2026-09-05T00:00:00-03:00
atualizado_em: 2026-09-05T00:00:00-03:00
classes: [interno, medido, auditoria-assistida]
caminhos:
  - api/v1/server.py
  - docs/epics/cli-interativa/page.tsx
  - engine/jules_bridge.py
  - frontend/src/app/api/v1/telemetry/route.ts
  - frontend/src/components/analytics/TelemetryCharts.tsx
  - frontend/src/components/simulator/DashboardSOTA.tsx
  - frontend/src/components/simulator/InsolvencyMatrix.tsx
  - frontend/src/components/simulator/PmevRangeViewer.tsx
  - frontend/src/components/simulator/solver/evidenceContract.ts
  - frontend/src/components/simulator/ui/GravitationalScannerPanel.tsx
  - frontend/src/components/simulator/ui/SelectBtn.tsx
  - frontend/src/components/simulator/ui/SotaTooltip.tsx
  - frontend/src/components/ui/layout/Header.tsx
  - frontend/src/components/ui/layout/globals.css
  - scripts/ops/New-AgentCalibrationDailyEvidence.ps1
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  so: Windows
  python: '3.14.6'
  pwsh: '7.6.5'
verificado:
  - >-
    tsc --noEmit no frontend: exit 0.
  - >-
    eslint nos 7 arquivos de maior alteracao: zero problemas. As correcoes de
    fato zeraram os avisos que as motivaram.
  - >-
    next build de producao: exit 0, todas as rotas geradas.
  - >-
    As nove utilitarias Tailwind substituidas EXISTEM no CSS de producao, e os
    valores conferem: --spacing e .25rem, logo min-w-60 = 240px, min-w-40 =
    160px e max-w-95 = 380px, identicos aos arbitrarios que substituiram.
    text-light-text-main resolve para var(--color-light-text-main), a mesma
    custom property que a forma arbitraria usava.
  - >-
    Os tokens --color-light-* estao dentro do bloco @theme de
    frontend/src/app/globals.css, condicao para o Tailwind v4 gerar as
    utilitarias.
  - >-
    Cada simbolo extraido foi conferido como referenciado: HudView,
    ExecutiveKpiSection, StrategicAdvice, validateActionsComparability e os
    quatro handlers da rota de telemetria.
  - >-
    Equivalencia logica conferida linha a linha nas dez extracoes. A unica que
    mudou forma foi validateActionsComparability, onde if/else virou
    if + return -- equivalente.
  - >-
    O `continue` que descarta item de batch com identidade nao resolvida JA
    EXISTIA no HEAD (linha 65). Nao e regressao desta alteracao.
  - >-
    hideTooltip e useCallback e o efeito do SotaTooltip tem early return em
    !isOpen: o listener global de Escape nao se re-registra em laco.
  - >-
    REGRESSAO ENCONTRADA E CORRIGIDA: worker/ existe e e importado por
    core/runtime.py e worker/startup.py, e havia sido removido dos
    python.analysis.extraPaths. Restaurado nos dois arquivos, que voltaram
    byte a byte ao HEAD.
nao_verificado:
  - >-
    Nenhuma verificacao visual. Os testes de frontend nao cobrem estes
    arquivos -- existe apenas frontend/src/lib/markdown-url-policy.test.ts.
  - >-
    Comportamento em runtime das rotas de telemetria alteradas; nenhuma
    requisicao real foi emitida contra elas.
revisoes_de_ancora:
  - registro: auditoria-2026-08-31-integridade-e-integracao-antigravity
    caminhos:
      - frontend/src/components/simulator/PmevRangeViewer.tsx
    parecer: >-
      A alteracao extrai o ternario aninhado do delta para formatDeltaDisplay.
      Os tres ramos e seus formatos de saida sao os mesmos, na mesma ordem: 0
      produz o travessao de "aguarda no", positivo ganha o sinal, negativo
      mantem o proprio. Nenhuma metrica que aquela auditoria mediu passa por
      este ponto de formatacao.
  - registro: auditoria-2026-09-03-trabalho-do-gemini-3-8-flash
    caminhos:
      - scripts/ops/New-AgentCalibrationDailyEvidence.ps1
    parecer: >-
      A alteracao remove $distinctSessionIds, que em HEAD era DEFINIDA E NUNCA
      USADA -- conferido por grep no blob do HEAD, que devolve uma unica
      ocorrencia, a da propria atribuicao. Remocao de codigo morto nao altera
      saida. Aquela auditoria tambem verificou BOM UTF-8 nos .ps1; o BOM deste
      arquivo esta presente e unico, reconferido nesta sessao.
  - registro: registro-2026-09-01-fronteira-http-e-portao-independente-de-perfil
    caminhos:
      - api/v1/server.py
    parecer: >-
      A alteracao apenas REORDENA o import de api.v1.keys para a posicao
      alfabetica, junto dos demais imports de api.v1. Os quatro simbolos
      importados sao os mesmos -- AUDIT_ENGINE_KEY, LAB_MANAGER_KEY,
      MANAGER_KEY, START_TIME_KEY -- e nenhuma rota, middleware ou fronteira
      HTTP que aquele registro fixou muda de comportamento.
  - registro: registro-2026-09-02-correcao-de-escala-e-timestamp-no-ledger
    caminhos:
      - scripts/ops/New-AgentCalibrationDailyEvidence.ps1
    parecer: >-
      Nada no caminho de correcoes foi tocado: a colecao de registros
      correction, sua aplicacao sobre o alvo antes da contagem e os campos
      correcoes_no_ledger e correcoes_aplicadas seguem como aquele registro os
      fixou. A unica alteracao e a remocao de uma variavel morta.
  - registro: registro-2026-09-02-cultura-invariante-no-gerador-de-evidencia
    caminhos:
      - scripts/ops/New-AgentCalibrationDailyEvidence.ps1
    parecer: >-
      A indirecao de cultura Get-InstanteDoRegistro nao foi tocada, e segue
      sendo o unico caminho de leitura de recorded_at no script. A variavel
      removida nao participava de nenhuma leitura de data. Os guards de
      tests/test_calibracao_portao_por_sessao.py seguem verdes.
  - registro: registro-2026-09-02-etapa-b-river-e-classe-de-acao-no-cenario
    caminhos:
      - frontend/src/components/simulator/solver/evidenceContract.ts
    parecer: >-
      As classes de acao que aquele registro instituiu -- fold, check, call,
      bet, raise, unknown -- continuam sendo exatamente as seis percorridas, na
      mesma ordem, e a comparacao por contagem por classe e identica. O bloco
      apenas saiu de dentro de validateEvidencePair para a funcao nomeada
      validateActionsComparability.
  - registro: registro-2026-09-02-fast-uri-alto-e-contrato-de-evidencia-pmev
    caminhos:
      - frontend/src/components/simulator/solver/evidenceContract.ts
    parecer: >-
      Os dois codigos de violacao daquele contrato -- ACTION_SET_INCOMPARABLE e
      SIZING_CORRESPONDENCE_UNVERIFIABLE -- sao emitidos com a mesma severidade
      warning, o mesmo path pair.actions e os mesmos campos de detalhe. A
      condicao de emissao tambem: o if/else original virou if + return, que e
      equivalente.
  - registro: registro-2026-09-02-tensor-portavel-e-varredura-fora-de-python
    caminhos:
      - frontend/src/app/api/v1/telemetry/route.ts
    parecer: >-
      O formato do payload persistido nao muda: buildTelemetryEventData reune
      os mesmos campos, com os mesmos fallbacks de nomenclatura dupla
      (evLoss/ev_loss, isCorrect/is_correct, latency/time_ms). As respostas
      mantem status, type e ids. A varredura que aquele registro descreve
      consome o registro persistido, e ele e byte a byte o mesmo.
  - registro: registro-2026-09-03-procedencia-de-solve-e-o-portao-de-reprodutibilidade
    caminhos:
      - frontend/src/components/simulator/solver/evidenceContract.ts
    parecer: >-
      A ordem de validacao dentro de validateEvidencePair e preservada:
      contexto, cenario chipEv, cenario icmEv e so entao a comparabilidade. As
      tolerancias continuam vindo de resolveTolerances e sao repassadas
      intactas a validateActionsComparability. Nenhum criterio de procedencia
      ou reprodutibilidade depende do formato do bloco.
  - registro: registro-2026-09-04-credenciais-submodulos-e-adaptador-hrc
    caminhos:
      - engine/jules_bridge.py
      - frontend/src/components/simulator/solver/evidenceContract.ts
    parecer: >-
      Em jules_bridge.py a alteracao CORRIGE um defeito: o parametro
      include_activities era aceito e ignorado, e as atividades vinham sempre.
      Agora ele e respeitado. Nenhuma credencial, submodulo ou caminho do
      adaptador HRC e tocado. Em evidenceContract.ts, ver o parecer da
      procedencia de solve acima: extracao sem mudanca de comportamento.
  - registro: registro-2026-09-02-portao-de-calibracao-por-sessao
    caminhos:
      - scripts/ops/New-AgentCalibrationDailyEvidence.ps1
    parecer: >-
      A metrica do portao permanece sessoes distintas com feedback, minimo
      tres, acumulativa. A variavel removida nao alimentava a contagem: o
      perfil por sessao e construido a partir de $universo e $todasAsSessoes,
      nao dela. Medido no ledger real apos a remocao: 10 sessoes, 11
      feedbacks, media 9,09 -- inalterados.
  - registro: registro-2026-09-04-refinamento-sota-radar-telemetria-scanner-e-mcps
    caminhos:
      - engine/jules_bridge.py
      - frontend/src/app/api/v1/telemetry/route.ts
      - frontend/src/components/analytics/TelemetryCharts.tsx
      - frontend/src/components/simulator/DashboardSOTA.tsx
      - frontend/src/components/simulator/InsolvencyMatrix.tsx
      - frontend/src/components/simulator/ui/GravitationalScannerPanel.tsx
      - frontend/src/components/simulator/ui/SelectBtn.tsx
    parecer: >-
      Este e o registro com maior sobreposicao, e nenhuma peca visual que ele
      entregou muda de aparencia. As substituicoes de classe sao equivalencias
      exatas, MEDIDAS no CSS de producao: min-w-60 e 240px, min-w-40 e 160px e
      max-w-95 e 380px, com --spacing em .25rem. As demais alteracoes sao
      extracoes de JSX para HudView, ExecutiveKpiSection e StrategicAdvice, os
      tres referenciados e com os mesmos ramos condicionais. Em jules_bridge.py,
      a correcao de include_activities descrita acima.
  - registro: registro-2026-09-05-fechamento-do-ciclo-de-calibracao
    caminhos:
      - scripts/ops/New-AgentCalibrationDailyEvidence.ps1
    parecer: >-
      Registro desta mesma data e da mesma sessao. O corte por sequencia, a
      leitura unica do ledger em $allRecords e o recorte de calibration que ele
      instituiu nao sao tocados pela remocao da variavel morta. Os onze guards
      de tests/test_calibracao_fechamento_do_ciclo.py seguem verdes.
  - registro: agent-calibration-daily-2026-09-02
    caminhos:
      - scripts/ops/New-AgentCalibrationDailyEvidence.ps1
    parecer: >-
      A evidencia daquele dia mediu portao fechado em 2 de 3 sessoes distintas,
      e a medicao permanece reproduzivel: a variavel removida nao entrava em
      nenhuma contagem publicada. Nenhum numero daquele dia se move.
---

# Auditoria de trabalho assistido -- Gemini 3.8 Flash na instancia do IDE

## (1) Por que esta auditoria existe

O trabalho deste commit foi produzido por uma instancia agentica do Gemini 3.8
Flash rodando no IDE, **fora da ancoragem direta no protocolo**. O Tier 0
declarou a origem e assumiu a causa: foi decisao dele rodar naquela instancia.

Isso cria duas condicoes que a governanca normalmente separa:

1. O trabalho nao passou pelos portoes no momento em que foi feito.
2. Quem commita nao e quem escreveu -- e a §7 do CLAUDE.md, junto da licao
   medida em 2026-09-03, diz que commitar trabalho alheio e defeito.

**A excecao para (2) foi autorizada explicitamente pelo Tier 0 nesta sessao**,
com esta auditoria como contrapartida. A autoria do commit permanece com
`Gemini 3.8 Flash <noreply@google.com>`, que escreveu o codigo; a linhagem
Claude entra como `Co-Authored-By`, no papel que de fato exerceu -- auditoria,
nao autoria. A assinatura nao foi substituida, foi acrescida.

## (2) O que o diff e

Quinze arquivos, e uma coisa so em tres familias.

**(2.a) Extracao de ternarios aninhados e JSX inline.** Dez simbolos novos:
`formatDeltaDisplay`, `getStackTextClasses`, `getTooltipAnimationTranslate`,
`resolvePlayerNames`, `getActiveInspectedBody`, `StrategicAdvice`,
`validateActionsComparability`, `HudView`, `ExecutiveKpiSection` e os quatro
handlers de `frontend/src/app/api/v1/telemetry/route.ts`. Conferidos um a um:
equivalentes.

**(2.b) Classe Tailwind arbitraria trocada por escala ou token.** Esta era a
familia de maior risco, porque uma utilitaria que o Tailwind nao gere falha em
SILENCIO -- o elemento simplesmente perde a regra. Foi a unica que exigiu
medicao em vez de leitura, e ela esta na secao seguinte.

**(2.c) Correcoes pontuais.** Tres sao ganho real, nao cosmetica:

| Arquivo | O que mudou | Por que e ganho |
| :--- | :--- | :--- |
| `engine/jules_bridge.py` | `include_activities` passou a ser respeitado | o parametro era aceito e ignorado |
| `frontend/src/components/ui/layout/Header.tsx` | `onKeyDown` saiu de um `div` e foi para o `Link` | handler de teclado agora esta no elemento que recebe foco |
| `frontend/src/components/simulator/ui/SotaTooltip.tsx` | Escape virou listener global com cleanup | antes so funcionava com o elemento focado |

## (3) A medicao que sustenta a familia (2.b)

Inspecionar a config nao bastava: o que decide e o CSS que sai do build.

```
--spacing:.25rem
.min-w-60{min-width:calc(var(--spacing) * 60)}
.max-w-95{max-width:calc(var(--spacing) * 95)}
.text-light-text-main{color:var(--color-light-text-main)}
```

As nove utilitarias existem no CSS de producao. 60 x .25rem = 240px, 40 =
160px, 95 = 380px -- exatamente os valores arbitrarios substituidos. E
`text-light-text-main` resolve para a mesma custom property que
`text-[var(--color-light-text-main)]` usava.

> **Falso negativo do instrumento, declarado.** A primeira medicao varreu
> `.next/static/css`, diretorio que nao existe neste projeto -- o CSS de
> producao fica em `.next/static/chunks`. O comando devolveu "0 ocorrencias"
> para as nove classes, o que lido sozinho diria que nenhuma foi gerada. Era
> lista de arquivos vazia, nao ausencia de classe. O que denunciou foi a
> incoerencia entre "build passou" e "nenhum CSS existe".

## (4) A regressao, e por que nenhuma ferramenta a pegaria

`${workspaceFolder}/worker` foi removido de `python.analysis.extraPaths` em
`.vscode/settings.json` e em `Site.code-workspace`.

`worker/` **existe** -- tem `__init__.py`, `loop.py` e `startup.py` -- e e
importado por `core/runtime.py` e por `worker/startup.py`. Os outros seis
diretorios da mesma lista existem igual e ficaram; so `worker` saiu. O efeito e
o Pylance perder a resolucao daqueles modulos, em silencio e apenas no editor.

E o caso que a §4 da raiz nomeia: presumir que algo e orfao e remover ja
quebrou a toolchain aqui. Corrigido nesta sessao; os dois arquivos voltaram
byte a byte ao HEAD e por isso nao aparecem no diff deste commit.

**A leitura que importa para a proxima vez:** uma instancia fora do protocolo
produziu trabalho mecanicamente bom -- lint zerado, build verde, tipos limpos --
e errou exatamente onde a regra e situada em vez de mecanica. Nenhuma ferramenta
acusaria aquela remocao. So acusa quem sabe que `worker/` existe e quem o
importa.

## (5) Um achado estrutural, fora do escopo deste commit

Existem **dois** `globals.css`, ambos com bloco `@theme`:
`frontend/src/app/globals.css` e
`frontend/src/components/ui/layout/globals.css`. Em HEAD eles divergem em 817
linhas. Fonte dupla de token de design e o que a §3 do CLAUDE.md trata como
fonte paralela.

E preexistente e nao foi criado por este trabalho -- a alteracao de
`@supports (scrollbar-width: none)` no segundo arquivo esta, na verdade,
ALINHANDO-O ao padrao que o primeiro ja tinha. Fica registrado como divida,
nao como achado deste diff.
