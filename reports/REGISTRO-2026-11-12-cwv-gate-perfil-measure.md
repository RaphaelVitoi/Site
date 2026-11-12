---
id: registro-2026-11-12-cwv-gate-perfil-measure
tipo: registro
escopo: >-
  "scripts/ops/cwv_gate.ps1: CdpPorts passa a preferir 9226 (perfil Chrome
  'Measure' dedicado, sem extensoes) antes de 9223/9222; fallback
  preservado. Isola a medicao CWV/a11y da carga do navegador diario."
ecossistema: nexus-sota
autor:
  Devin (SWE-2 Flash)
  <158243242+devin-ai-integration[bot]@users.noreply.github.com>
criado_em: "2026-11-12T14:00:00-03:00"
atualizado_em: "2026-11-12T14:00:00-03:00"
classes:
  - interno
  - medido
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  python: "3.14.9"
  so: Windows
  congelada_em: "2026-11-12"
caminhos:
  - scripts/ops/cwv_gate.ps1
pendencias_resolvidas: []
revisoes_de_ancora:
  - registro: plan-dependency-boundary-reconciliation-2026-09-01
    caminhos:
      - scripts/ops/cwv_gate.ps1
    parecer: >-
      "Mudanca restrita a ordem de preferencia de portas CDP no handshake
      (9226 primeiro). Nenhuma fronteira de dependencia, contrato de probe
      ou estrutura do gate alterada; o plano de reconciliacao permanece
      inalterado em substancia."
  - registro: relatorio-fusao-cerebro-claude-quality-gate-2026-09-01
    caminhos:
      - scripts/ops/cwv_gate.ps1
    parecer: >-
      "Mudanca restrita a ordem de preferencia de portas CDP no handshake.
      Fases, metricas, limites e vereditos do quality gate inalterados; o
      relatorio de fusao permanece valido em substancia."
  - registro: auditoria-cwv-lighthouse-2026-09-01
    caminhos:
      - scripts/ops/cwv_gate.ps1
    parecer: >-
      "A auditoria CWV/Lighthouse mediu metricas e limiares, nao a ordem de
      portas CDP. A preferencia pelo perfil Measure nao altera o que e
      medido nem os limiares; conclusoes da auditoria permanecem validas."
  - registro: auditoria-2026-09-08-o-que-esta-em-aberto-na-malha
    caminhos:
      - scripts/ops/cwv_gate.ps1
    parecer: >-
      "A lista de itens em aberto da malha nao e afetada pela ordem de
      preferencia CDP; a mudanca reduz flakiness de medicao, nao altera
      itens auditados. Inventario permanece inalterado em substancia."
  - registro: handoff-2026-10-05-fechamento-do-ciclo-medicoes-cwv-e-cacheabilidade
    caminhos:
      - scripts/ops/cwv_gate.ps1
    parecer: >-
      "O ciclo de medicoes CWV e cacheabilidade tratava de re-medicao e
      cache de suite; a ordem de portas CDP e ortogonal. Handoff permanece
      inalterado em substancia."
  - registro: plano-frentes-abertas-2026-09-08
    caminhos:
      - scripts/ops/cwv_gate.ps1
    parecer: >-
      "O plano de frentes abertas nao declara dependencia da ordem de
      portas CDP; a mudanca e de infraestrutura de medicao, nao de escopo
      das frentes. Plano permanece inalterado em substancia."
  - registro: 2026-09-22-auditoria-frontend-4-itens
    caminhos:
      - scripts/ops/cwv_gate.ps1
    parecer: >-
      "A auditoria frontend de 4 itens mediu a11y/estados de UI; a ordem
      de portas CDP nao altera alvos nem criterios auditados. Auditoria
      permanece inalterada em substancia."
  - registro: registro-2026-10-04-http-metrics-correlation-e-worker-shutdown
    caminhos:
      - scripts/ops/cwv_gate.ps1
    parecer: >-
      "O registro de metricas HTTP/correlacao e shutdown de worker e
      ortogonal a preferencia de porta CDP no handshake. Permanecce
      inalterado em substancia."
verificado:
  - "Commit executou o gate com '[CDP] Active runtime connection on 9226'
    e 1 pagina — perfil Measure dedicado (0 extensoes) mediu de fato"
  - "CWV no Measure: LCP 736,95ms / TTFB 91,44ms / CLS 0,0002 — verde sem
    flake, vs LCP 7.730ms/TTFB 4.181ms no perfil SOTA com 26 abas"
  - "Suite pytest verde na arvore do commit (0 erros, 0 warnings)"
  - "PSParser: sintaxe OK nos 3 arquivos alterados (gate + launcher +
    Start-SOTA-Background)"
nao_verificado:
  - "se o Chrome Measure sobrevive a reboot — auto-start cobre via
    Start-SOTA-Background (mesmo caminho interativo de SOTA/Admin)"
---

# cwv_gate — preferencia pelo perfil Measure :9226 (2026-11-12)

`$CdpPorts` passou de `@(9223, 9222)` para `@(9226, 9223, 9222)`. O perfil
`Measure` (novo em `Launch-ChromeSOTA.ps1`, commit `af25425` na raiz) e um
Chrome Dev dedicado: `User Data - Measure`, **zero extensoes**, porta 9226,
CDP restrito ao proxy 9224 como os demais.

**Motivacao medida:** duas medicoes nesta sessao falharam o gate com
LCP 7.730ms e TTFB 4.181ms no perfil SOTA (26 abas de trabalho abertas) e
passaram no retry com LCP ~500-820ms — flake ambiental, nao regressao. No
perfil Measure a primeira medicao ja saiu verde: LCP 737ms, TTFB 91ms.

**Fallback:** se 9226 nao responder, o gate cai para 9223/9222 como antes —
nenhum comportamento removido.
