---
id: registro-2026-11-17-renovacao-baseline-color-contrast-grain
tipo: registro
escopo: "Site -- renovacao da revisao humana aprovada de color-contrast em data/a11y_manual_review_baselines.json apos overlay decorativo bg-grain tornar 15 novos alvos inconclusivos no axe-core, e atualizacao do contrato truthfulness em tests/test_cwv_gate_truthfulness.py"
ecossistema: nexus-sota
autor: "Devin (SWE-2 Flash) <158243242+devin-ai-integration[bot]@users.noreply.github.com>"
criado_em: "2026-11-17T08:20:00-03:00"
atualizado_em: "2026-11-17T08:20:00-03:00"
commit: HEAD
classes:
  - interno
  - medido
  - governanca
  - registro
  - acessibilidade
caminhos:
  - data/a11y_manual_review_baselines.json
  - tests/test_cwv_gate_truthfulness.py
  - reports/REGISTRO-2026-11-17-renovacao-baseline-color-contrast-grain.md
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  condutor: Devin (SWE-2 Flash)
  veiculo: devin-desktop
  tier: 1
  supervisao: assistida
  data_das_medicoes: 2026-11-17
verificado:
  - "Inspecao manual dos 18 alvos inconclusivos no DOM renderizado via playwright + axe-core (reports/cwv/axe_color_contrast_inspect.json)"
  - "Contraste WCAG calculado: text-main #0C0A09 15.57-18.9:1; muted #5C5751 5.63-6.84:1; accent #6B501A 5.94-7.21:1, inclusive no pior caso do overlay grain"
  - "Causa do inconclusivo identificada: overlay bg-grain (SVG feTurbulence, opacity 0.03, mix-blend-multiply, pointer-events-none) em SotaBackground/Footer"
  - "cwv_gate.ps1 no perfil CDP Measure :9226: 0 erros, 0 warnings, AXE_INCOMPLETE REVIEW APPROVED (reports/cwv/cwv_report_20261117_075238.md)"
  - "pytest tests/test_cwv_gate_truthfulness.py -k axe_manual: verde"
  - "Quality Smoke E2E playwright.quality.config.ts: 8 passed apos install dos browsers chromium_headless_shell-1254"
nao_verificado:
  - "Revisao dos 15 alvos de footer/hero em viewport mobile (medicao feita em 1440x900); classes e tokens sao responsivos e herdados, risco residual baixo"
revisoes_de_ancora:
  - registro: auditoria-2026-08-31-integridade-e-integracao-antigravity
    caminhos:
      - tests/test_cwv_gate_truthfulness.py
    parecer: "Revisado em 2026-11-17. O contrato truthfulness apenas enumerou os 18 alvos aprovados na nova revisao humana de color-contrast; assercoes de schema, autoridade Tier 0 e vinculo SHA-256 da origem preservadas."
  - registro: auditoria-2026-09-23-calibracao-terra-e-gate-cwv
    caminhos:
      - data/a11y_manual_review_baselines.json
    parecer: "Revisado em 2026-11-17. Baseline de color-contrast renovado com nova revisao aprovada pelo Tier 0 cobrindo os 18 alvos inconclusivos vigentes; schema 1.0, regra unica e vinculo de fonte mantidos."
  - registro: handoff-2026-09-23-sincronia-editor-calibracao-e-gate
    caminhos:
      - tests/test_cwv_gate_truthfulness.py
    parecer: "Revisado em 2026-11-17. Lista de alvos esperados atualizada para os 18 seletores aprovados; nenhuma assercao de aprovacao foi afrouxada."
  - registro: registro-2026-09-07-procedencia-do-timesfm-e-json-do-cli
    caminhos:
      - tests/test_cwv_gate_truthfulness.py
    parecer: "Revisado em 2026-11-17. Alteracao restrita a enumeracao de alvos do baseline; vinculo hash->fonte e demais invariantes inalterados."
  - registro: registro-2026-09-08-auditoria-de-tipagem-e-recorte-do-fingerprint
    caminhos:
      - tests/test_cwv_gate_truthfulness.py
    parecer: "Revisado em 2026-11-17. Alteracao restrita a enumeracao de alvos do baseline; vinculo hash->fonte e demais invariantes inalterados."
  - registro: registro-2026-09-08-ruff-format-e-o-ci-vermelho
    caminhos:
      - tests/test_cwv_gate_truthfulness.py
    parecer: "Revisado em 2026-11-17. Arquivo reformatado por ruff format apos edicao; conteudo das assercoes preservado."
  - registro: registro-2026-09-09-o-axe-mede-extensao-de-navegador
    caminhos:
      - data/a11y_manual_review_baselines.json
    parecer: "Revisado em 2026-11-17. Baseline renovado por expiracao de alvos; mecanismo de exclusao de raizes externas do axe nao foi tocado."
  - registro: registro-2026-09-10-o-encoding-que-matava-a-thread-leitora
    caminhos:
      - tests/test_cwv_gate_truthfulness.py
    parecer: "Revisado em 2026-11-17. Alteracao restrita a enumeracao de alvos do baseline; encoding e demais invariantes inalterados."
  - registro: registro-2026-09-18-cache-cve-calado-prs-major-e-maos-arquivadas
    caminhos:
      - tests/test_cwv_gate_truthfulness.py
    parecer: "Revisado em 2026-11-17. Alteracao restrita a enumeracao de alvos do baseline; vinculo hash->fonte e demais invariantes inalterados."
  - registro: registro-2026-10-04-http-metrics-correlation-e-worker-shutdown
    caminhos:
      - tests/test_cwv_gate_truthfulness.py
    parecer: "Revisado em 2026-11-17. Alteracao restrita a enumeracao de alvos do baseline; vinculo hash->fonte e demais invariantes inalterados."
  - registro: registro-2026-10-18-remediacao-dependabot-e-renovacao-axe
    caminhos:
      - data/a11y_manual_review_baselines.json
    parecer: "Revisado em 2026-11-17. Baseline renovado com evidencia medida de contraste; estrutura de revisao aprovada identica a anterior."
  - registro: registro-2026-10-18-resolucao-sonarqube-e-saneamento-global
    caminhos:
      - data/a11y_manual_review_baselines.json
    parecer: "Revisado em 2026-11-17. Baseline renovado com evidencia medida de contraste; estrutura de revisao aprovada identica a anterior."
---

# Renovacao do baseline de revisao humana — color-contrast (overlay grain)

## O que aconteceu

O `cwv_gate.ps1` reprovava com `AXE_INCOMPLETE` / `TARGET_MISMATCH`: a
revisao humana aprovada em 2026-10-18 cobria 3 alvos SVG e expirou (>30 dias)
quando a home ganhou o overlay decorativo `bg-grain`, que tornou o fundo
indeterminado para o axe-core em 15 alvos adicionais de texto.

## Medicao

- 18 alvos inconclusivos inspecionados no DOM renderizado (playwright, axe-core
  injetado): 3 textos SVG do grafico hero + 15 textos do footer/hero.
- Overlay causador: `bg-grain` — SVG `feTurbulence`, `opacity 0.03`,
  `mix-blend-multiply`, `pointer-events-none`, sem texto.
- Contraste calculado (WCAG relative luminance): text-main `#0C0A09`
  15.57–18.9:1; muted `#5C5751` 5.63–6.84:1; accent `#6B501A` 5.94–7.21:1 —
  todos acima de AA 4.5:1 inclusive no pior caso do grao.

## Decisao

Revisao humana renovada pelo Tier 0 (Raphael Vitoi) em sessao de 2026-11-17,
com `invalidated_by` estendido para `Footer.tsx`, `SotaBackground.tsx` e
`globals.css` — os arquivos que de fato produzem os alvos e o overlay.
`tests/test_cwv_gate_truthfulness.py` passou a enumerar os 18 alvos.

## Verificacao executada

`cwv_gate.ps1` (CDP Measure :9226): 0 erros, 0 warnings,
`AXE_INCOMPLETE REVIEW APPROVED` —
`reports/cwv/cwv_report_20261117_075238.md`.
