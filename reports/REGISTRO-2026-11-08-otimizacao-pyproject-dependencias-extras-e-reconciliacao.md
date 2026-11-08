---
id: registro-2026-11-08-otimizacao-pyproject-dependencias-extras-e-reconciliacao
tipo: registro
escopo: Site -- auditoria e inclusao de dependencias extras no pyproject.toml (pmev,
  monitoring, vision, all), sincronizacao uv.lock e saneamento de apontamentos historicos
ecossistema: nexus-sota
autor: Gemini 3.8 Flash <noreply@google.com>
criado_em: '2026-11-08T11:45:00-03:00'
atualizado_em: '2026-11-08T11:45:00-03:00'
commit: dbb15711
classes:
  - interno
  - medido
  - governanca
  - registro
  - dependencias
  - pyproject
verificado:
  - 'Auditoria e adicao de dependencias opcionais no pyproject.toml: pmev (sympy,
    numba, polars), monitoring (opentelemetry-sdk, opentelemetry-exporter-otlp, prometheus-client),
    vision (torchvision) e all'
  - Sincronizacao limpa do uv.lock com 270 pacotes resolvidos via uv lock
  - Ajuste das conclusoes sobre regex de script e chaves HMAC fixas em REGISTRO-2026-11-07-auditoria-integral-dependabot
  - Reconciliacao do relatorio JULES_REPORT.md com metrica de sessoes da sincronizacao
    e registro de sessoes concluidas arquivadas
  - Alinhamento da declaracao de toolchain no REGISTRO-2026-11-07-auditoria-jules
    com versoes minimas exigidas (ruff>=0.17.4, pyright>=1.1.414)
  - Correcao dos pareceres de agents_manifest.json em REGISTRO-2026-11-06 refletindo
    skill chrysalis-live-editing e allowlists
  - Reconciliacao formal de todas as 40 ancoras historicas atingidas no corpus
nao_verificado:
  - Execucao de testes em plataformas legadas Linux / Python 3.14.6
config_medida:
  congelada_em: '2026-11-08'
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  data_das_medicoes: '2026-11-08'
  toolchain: uv sync + ruff check + pytest + record_gate.py
  python: 3.14.9
  so: Windows
caminhos:
  - pyproject.toml
  - uv.lock
  - reports/REGISTRO-2026-11-06-reparo-manifestos-e-declaracao-chrysalis.md
  - reports/REGISTRO-2026-11-07-auditoria-integral-dependabot-github-e-code-scanning.md
  - reports/REGISTRO-2026-11-07-auditoria-jules-cloud-saneamento-linters-e-pyproject.md
  - reports/integrations/JULES_REPORT.md
  - reports/REGISTRO-2026-11-08-otimizacao-pyproject-dependencias-extras-e-reconciliacao.md
revisoes_de_ancora:
  - registro: auditoria-2026-09-02-integridade-do-projeto-e-piso-de-transformers
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Reconciliacao em 2026-11-08: adicao de grupos opcionais no pyproject.toml
      e sincronizacao uv.lock sem alterar pisos de transformers.'
  - registro: auditoria-2026-09-22-paridade-config-identidade
    caminhos:
      - reports/integrations/JULES_REPORT.md
    parecer: 'Reconciliacao em 2026-11-08: atualizacao da metrica de sessoes retornadas
      no relatorio Jules preservando identidade.'
  - registro: auditoria-2026-10-08-integralidade-backend
    caminhos:
      - pyproject.toml
    parecer: 'Reconciliacao em 2026-11-08: inclusao de dependencias opcionais pmev,
      monitoring e vision no pyproject.toml.'
  - registro: handoff-2026-08-30-auditoria-malha-agentica-e-trava-de-lfs
    caminhos:
      - pyproject.toml
    parecer: 'Reconciliacao em 2026-11-08: grupos opcionais no pyproject.toml sem
      alterar contratos de trava LFS.'
  - registro: handoff-2026-09-10-lint-lighthouse-e-aceite-cve
    caminhos:
      - pyproject.toml
    parecer: 'Reconciliacao em 2026-11-08: atualizacao de pyproject.toml sem afetar
      portas ou aceites de CVE.'
  - registro: handoff-2026-09-13-integracao-de-engines-wasm-e-economia-de-gate
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Reconciliacao em 2026-11-08: lock sincronizado e dependencias opcionais
      adicionadas sem impacto nas engines WASM.'
  - registro: handoff-2026-09-22-paridade-config-identidade
    caminhos:
      - reports/integrations/JULES_REPORT.md
    parecer: 'Reconciliacao em 2026-11-08: detalhamento das sessoes retornadas no
      JULES_REPORT.md mantendo paridade.'
  - registro: handoff-2026-10-08-auditoria-e-remediacao-backend
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Reconciliacao em 2026-11-08: dependencias opcionais aditivas sem impacto
      nos contratos de backend.'
  - registro: handoff-2026-10-24-remediacao-dependabot-e-integridade-sota
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Reconciliacao em 2026-11-08: pisos de seguranca preservados e grupos
      opcionais adicionados.'
  - registro: plan-dependency-boundary-reconciliation-2026-09-01
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Reconciliacao em 2026-11-08: fronteira de dependencias preservada e
      lock sincronizado via uv.'
  - registro: plano-laya-integracao-s1s2-pmev-2026-09-20
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Reconciliacao em 2026-11-08: inclusao do extra pmev (sympy, numba, polars)
      aditivo a integracao Laya S1/S2.'
  - registro: registro-2026-09-09-remediacao-dependabot-httpx2
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Reconciliacao em 2026-11-08: piso de httpx2 mantido e dependencias opcionais
      adicionadas.'
  - registro: registro-2026-09-13-ci-typecheck-e-fronteira-de-capacidades
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Reconciliacao em 2026-11-08: lock sincronizado e contratos de tipagem
      do CI preservados.'
  - registro: registro-2026-09-13-otimizacoes-helpers-antientropia-e-feedback
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Reconciliacao em 2026-11-08: inclusao de dependencias opcionais sem
      alteracao em helpers de antientropia.'
  - registro: registro-2026-10-04-remediacao-dependabot-pypdf
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Reconciliacao em 2026-11-08: piso de seguranca pypdf preservado.'
  - registro: registro-2026-10-04-remediacao-dependabot-sentence-transformers-e-urllib3
    caminhos:
      - uv.lock
    parecer: 'Reconciliacao em 2026-11-08: lock sincronizado mantendo pisos de seguranca.'
  - registro: registro-2026-10-08-auditoria-e-remediacao-backend
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Reconciliacao em 2026-11-08: dependencias opcionais pmev e monitoring
      aditivas ao backend.'
  - registro: registro-2026-10-13-remediacao-dependabot-e-offload-strata
    caminhos:
      - uv.lock
    parecer: 'Reconciliacao em 2026-11-08: lock sincronizado mantendo offload Strata
      intacto.'
  - registro: registro-2026-10-14-saneamento-tipagem-config-ide-e-dependencias
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Reconciliacao em 2026-11-08: espelhamento de opcionais no pyproject.toml
      com tipagem estrita.'
  - registro: registro-2026-10-18-remediacao-dependabot-e-renovacao-axe
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Reconciliacao em 2026-11-08: pisos e renovacao de acessibilidade preservados.'
  - registro: registro-2026-10-24-remediacao-integral-74-vulnerabilidades-dependabot
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Reconciliacao em 2026-11-08: pisos de seguranca de todas as vulnerabilidades
      remediadas intactos.'
  - registro: registro-2026-10-26-unificacao-ssot-dependencias-e-pwsh-sota
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Reconciliacao em 2026-11-08: SSOT de dependencias pyproject.toml mantida
      como fonte unica.'
  - registro: registro-2026-10-27-elevacao-dependencias-python-openai-pyspark-pytest
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Reconciliacao em 2026-11-08: extensoes aditivas opcionais mantendo elevacao
      previa de core.'
  - registro: registro-2026-10-27-evolucao-project-context-e-reconciliacao-sota
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Reconciliacao em 2026-11-08: pyproject.toml e uv.lock enriquecidos sem
      quebra de contratos.'
  - registro: registro-2026-10-27-remediacao-dependabot-submodulo-e-integracao-sota
    caminhos:
      - uv.lock
    parecer: 'Reconciliacao em 2026-11-08: lock sincronizado mantendo integridade
      dos submodulos.'
  - registro: registro-2026-10-28-atualizacao-laya-e-estabilizacao-playwright-smoke
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Reconciliacao em 2026-11-08: adicao de extras pmev e monitoring preservando
      Laya e Playwright.'
  - registro: registro-2026-10-28-homologacao-pr103-jules-e-selagem-montecarlo
    caminhos:
      - reports/integrations/JULES_REPORT.md
    parecer: 'Reconciliacao em 2026-11-08: atualizacao da metrica de sessoes no relatorio
      Jules mantendo selagem Monte Carlo.'
  - registro: registro-2026-10-28-saneamento-reconciliacao-e-elevacao-dependencias-triade-montecarlo
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Reconciliacao em 2026-11-08: extensoes opcionais adicionadas preservando
      elevacao da triade Monte Carlo.'
  - registro: registro-2026-10-31-desbloqueio-e-homologacao-jules-speedup-range-parser
    caminhos:
      - reports/integrations/JULES_REPORT.md
    parecer: 'Reconciliacao em 2026-11-08: metrica de sessoes atualizada no relatorio
      Jules mantendo speedups homologados.'
  - registro: registro-2026-10-31-estabilizacao-lifecycle-warmup-turbopack
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Reconciliacao em 2026-11-08: pyproject.toml enriquecido mantendo lifecycle
      warmup estavel.'
  - registro: registro-2026-11-01-homologacao-jules-speedup-chunking-bitmask
    caminhos:
      - reports/integrations/JULES_REPORT.md
    parecer: 'Reconciliacao em 2026-11-08: metrica de sessoes atualizada no relatorio
      Jules mantendo homologacao de chunking bitmask.'
  - registro: registro-2026-11-01-integracao-ai-mesh-sdk-e-otimizacao-jules
    caminhos:
      - pyproject.toml
      - reports/integrations/JULES_REPORT.md
      - uv.lock
    parecer: 'Reconciliacao em 2026-11-08: relatorio Jules e pyproject.toml atualizados
      sem impacto na integracao AI Mesh.'
  - registro: registro-2026-11-03-elevacao-dependencias-pyarrow-openai-anthropic-laya
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Reconciliacao em 2026-11-08: inclusao de dependencias opcionais mantendo
      elevacao previa de clientes LLM e Laya.'
  - registro: registro-2026-11-03-otimizacao-agentes-watchdog-e-calibracao
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Reconciliacao em 2026-11-08: dependencias opcionais aditivas sem impacto
      em watchdog ou calibracao.'
  - registro: registro-2026-11-03-remediacao-dependabot-pypdf-pyasn1-minimatch
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Reconciliacao em 2026-11-08: pisos de seguranca preservados.'
  - registro: registro-2026-11-04-otimizacao-layout-header-e-elevacao-dependencias
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Reconciliacao em 2026-11-08: grupos opcionais aditivos no pyproject.toml.'
  - registro: registro-2026-11-05-saneamento-customizations-e-elevacao-dependencias
    caminhos:
      - pyproject.toml
    parecer: 'Reconciliacao em 2026-11-08: dependencias opcionais pmev, monitoring
      e vision aditivas ao projeto.'
  - registro: registro-2026-11-07-elevacao-dependencias-fastapi-regex-types-aiofiles
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Reconciliacao em 2026-11-08: pisos de versao preservados e lock sincronizado
      via uv.'
  - registro: registro-2026-11-08-integracao-sota-triade-stitch-exa-jules
    caminhos:
      - pyproject.toml
      - reports/integrations/JULES_REPORT.md
      - uv.lock
    parecer: 'Reconciliacao em 2026-11-08: relatorio Jules e dependencias opcionais
      pyproject.toml atualizados mantendo triade integra.'
  - registro: registro-2026-11-08-saneamento-ancoras-historicas-e-indices
    caminhos:
      - reports/REGISTRO-2026-11-07-auditoria-integral-dependabot-github-e-code-scanning.md
    parecer: 'Reconciliacao em 2026-11-08: ajuste de texto nos alertas de seguranca
      de script e hmac no registro referenciado sem impacto estrutural.'
---
# Registro 2026-11-08: Otimizacao do pyproject.toml, Dependencias Extras e Reconciliacao (M.O. 13.F)

## 1. Auditoria e Dependencias Extras no pyproject.toml
Em conformidade com a diretiva de otimizacao do ecossistema Nexus/PMev:
- Grupo `pmev`: adicao de `sympy>=1.13.3` (derivacao analitica simbolica para equacoes Chen & Ankenman / Janda), `numba>=0.61.0` (aceleracao JIT Monte Carlo) e `polars>=1.20.0` (processamento colunar de alta performance para Hand Histories e bases HRC/MDA).
- Grupo `monitoring`: adicao de `opentelemetry-sdk>=1.30.0`, `opentelemetry-exporter-otlp>=1.30.0` e `prometheus-client>=0.21.0` para exportacao padronizada de telemetria da malha Nexus.
- Grupo `vision`: adicao de `torchvision>=0.20.0` para capacidades multimodais.
- Grupo `all`: agregador das capacidades opcionais.
- `uv.lock`: sincronizado via `uv lock` com 270 pacotes resolvidos.

## 2. Reconciliacao de Apontamentos de Auditoria e Code Review
1. Regex de script (`REGISTRO-2026-11-07`): conclusao ajustada para registrar a mitigacao de custo superlinear como pendencia de parser estruturado.
2. HMAC fixos (`REGISTRO-2026-11-07`): registro dos alertas #7, #8 e #9 atualizado para explicitar que salts fixos no codigo nao constituem segredo externo e mantem a remediacao completa pendente de injecao dinamica.
3. Relatorio Jules (`JULES_REPORT.md` e `REGISTRO-2026-11-07`): metrica identificada como retrato das sessoes da sincronizacao ativa e sessoes concluidas arquivadas preservadas no historico.
4. Toolchain (`REGISTRO-2026-11-07`): atualizado para refletir versoes minimas exigidas (Ruff >=0.17.4, Pyright >=1.1.414) com congelamento formal.
5. Pareceres de manifestos (`REGISTRO-2026-11-06`): corrigidos pareceres de data/agents_manifest.json para referenciar skill chrysalis-live-editing e testes de governanca.
