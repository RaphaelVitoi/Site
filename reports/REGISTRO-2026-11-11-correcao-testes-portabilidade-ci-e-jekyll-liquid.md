---
id: "2026-11-11-correcao-testes-portabilidade-ci-e-jekyll-liquid"
tipo: registro
escopo: site
autor: "Devin (SWE-2 Flash) [Tier 1]"
criado_em: "2026-11-11"
verificado:
  - "CI remoto (SOTA v8.0 GOLD) estava vermelho em TODOS os pushes ha 2+ dias —
    9 failed/2085 passed no run 43086112566. Causas raiz identificadas e
    corrigidas: testes acoplados a ambiente local (Rscript,
    ~/.gemini/settings.json, polars do extra pmev), referencia morta em
    registro, tag Liquid nao escapada em doc LaTeX."
  - "tests/test_r_statistical_bridge.py: skipif resolve_rscript_path() is None
    nos 3 testes dependentes de R; test_fallback_when_r_unavailable segue
    executando (caminho de fallback)."
  - "tests/test_antigravity_sdk_bridge.py: skipif GEMINI_CLI_SETTINGS.is_file()
    nos 3 testes que auditam o ecossistema local (audit_ecosystem_structure,
    nexus status, status --json)."
  - "tests/test_pmev_engines_consumption.py: pytest.importorskip('polars') no
    test_polars_game_tree_conversion — mesmo padrao do skip prometheus_client no
    mesmo arquivo."
  - "reports/REGISTRO-2026-11-09-...: caminho sota_site_bridge.py corrigido para
    extensions/sota-chrome-cockpit/... e declarado em
    referencias_nao_resolviveis (vive fora do repo Site, em
    ~/.gemini/extensions)."
  - "docs/research/pmev/enciclopedia/Enciclopedia_Teorica_PMev_Vitoi.md linhas
    267-268: '{%}' literal LaTeX substituido por '\\%' — quebrava o parser
    Liquid do Jekyll no GitHub Pages (build failure)."
  - "Validacao local: 81/81 testes dos 4 arquivos modificados passam (pytest -q
    --tb=short)."
nao_verificado:
  - "Correcao so sera confirmada no proximo run do CI remoto (em andamento para
    o push anterior); skips declarados nao sao aprovacao — cobertura dependente
    de ambiente segue nao executada no CI por desenho."
  - "Pages build (Jekyll) pode ter outros documentos com tags Liquid nao
    escapadas — so o primeiro erro foi medido e corrigido; build remoto dirá se
    restam."
  - "warning YAML em memory/user_chico_identity.md (mapping values line 3)
    persiste — nao fatal, nao tratado neste escopo."
revisoes_de_ancora:
  - registro: handoff-2026-11-08-otimizacao-backend-e-integridade-sota
    caminhos:
      - tests/test_r_statistical_bridge.py
    parecer:
      "Reconciliacao 2026-11-11: adicionado skipif de Rscript ausente nos 3
      testes dependentes de R. Integridade do bridge preservada — fallback
      python-native continua coberto por test_fallback_when_r_unavailable."
  - registro: registro-2026-11-08-elevacao-polars-2-1-e-consumo-integral-engines-sota
    caminhos:
      - tests/test_pmev_engines_consumption.py
    parecer:
      "Reconciliacao 2026-11-11: pytest.importorskip('polars') adicionado ao
      test_polars_game_tree_conversion. A elevacao polars 2.1 e o consumo dos
      engines permanecem intactos; o skip so atua quando o extra pmev nao esta
      instalado (CI sem --all-extras)."
  - registro: registro-2026-11-08-harmonizacao-r-4-6-1-jules-e-saneamento-ancoras
    caminhos:
      - tests/test_r_statistical_bridge.py
    parecer:
      "Reconciliacao 2026-11-11: skipif de Rscript ausente. Harmonizacao R 4.6.1
      inalterada — testes rodam normalmente onde R existe."
  - registro: registro-2026-11-08-integracao-sota-suite-antigravity-sdk-cli-acp
    caminhos:
      - tests/test_antigravity_sdk_bridge.py
    parecer:
      "Reconciliacao 2026-11-11: skipif de ~/.gemini/settings.json ausente nos 3
      testes acoplados ao ecossistema local. Suite antigravity permanece
      integral onde o ecossistema existe; no CI os testes de unidade pura seguem
      executando."
  - registro: registro-2026-11-08-otimizacao-backend-sonarlint-pyright-e-headings
    caminhos:
      - tests/test_r_statistical_bridge.py
    parecer:
      "Reconciliacao 2026-11-11: skipif de Rscript ausente. Otimizacao
      backend/sonarlint inalterada."
  - registro: plan-dependency-boundary-reconciliation-2026-09-01
    caminhos:
    - pyproject.toml
    parecer: "Reconciliacao 2026-11-11 (rodada 2 CI): filterwarnings do pytest ganhou 2 entradas escopadas — SyntaxWarning 'invalid escape sequence' de google.genai.* (defeito upstream documentado em types.py) e ResourceWarning 'unclosed database' (flake aiosqlite/GC sob xdist). Nenhuma regra de teste, codigo de producao ou contrato alterado; warnings deixam de contar no guarda SOTA do conftest que reprova a bateria acima do teto de 2."
  - registro: auditoria-2026-09-02-integridade-do-projeto-e-piso-de-transformers
    caminhos:
    - pyproject.toml
    parecer: "Reconciliacao 2026-11-11 (rodada 2 CI): filterwarnings do pytest ganhou 2 entradas escopadas — SyntaxWarning 'invalid escape sequence' de google.genai.* (defeito upstream documentado em types.py) e ResourceWarning 'unclosed database' (flake aiosqlite/GC sob xdist). Nenhuma regra de teste, codigo de producao ou contrato alterado; warnings deixam de contar no guarda SOTA do conftest que reprova a bateria acima do teto de 2."
  - registro: auditoria-2026-10-08-integralidade-backend
    caminhos:
    - pyproject.toml
    parecer: "Reconciliacao 2026-11-11 (rodada 2 CI): filterwarnings do pytest ganhou 2 entradas escopadas — SyntaxWarning 'invalid escape sequence' de google.genai.* (defeito upstream documentado em types.py) e ResourceWarning 'unclosed database' (flake aiosqlite/GC sob xdist). Nenhuma regra de teste, codigo de producao ou contrato alterado; warnings deixam de contar no guarda SOTA do conftest que reprova a bateria acima do teto de 2."
  - registro: handoff-2026-09-10-lint-lighthouse-e-aceite-cve
    caminhos:
    - pyproject.toml
    parecer: "Reconciliacao 2026-11-11 (rodada 2 CI): filterwarnings do pytest ganhou 2 entradas escopadas — SyntaxWarning 'invalid escape sequence' de google.genai.* (defeito upstream documentado em types.py) e ResourceWarning 'unclosed database' (flake aiosqlite/GC sob xdist). Nenhuma regra de teste, codigo de producao ou contrato alterado; warnings deixam de contar no guarda SOTA do conftest que reprova a bateria acima do teto de 2."
  - registro: handoff-2026-09-13-integracao-de-engines-wasm-e-economia-de-gate
    caminhos:
    - pyproject.toml
    parecer: "Reconciliacao 2026-11-11 (rodada 2 CI): filterwarnings do pytest ganhou 2 entradas escopadas — SyntaxWarning 'invalid escape sequence' de google.genai.* (defeito upstream documentado em types.py) e ResourceWarning 'unclosed database' (flake aiosqlite/GC sob xdist). Nenhuma regra de teste, codigo de producao ou contrato alterado; warnings deixam de contar no guarda SOTA do conftest que reprova a bateria acima do teto de 2."
  - registro: handoff-2026-10-08-auditoria-e-remediacao-backend
    caminhos:
    - pyproject.toml
    parecer: "Reconciliacao 2026-11-11 (rodada 2 CI): filterwarnings do pytest ganhou 2 entradas escopadas — SyntaxWarning 'invalid escape sequence' de google.genai.* (defeito upstream documentado em types.py) e ResourceWarning 'unclosed database' (flake aiosqlite/GC sob xdist). Nenhuma regra de teste, codigo de producao ou contrato alterado; warnings deixam de contar no guarda SOTA do conftest que reprova a bateria acima do teto de 2."
  - registro: handoff-2026-10-24-remediacao-dependabot-e-integridade-sota
    caminhos:
    - pyproject.toml
    parecer: "Reconciliacao 2026-11-11 (rodada 2 CI): filterwarnings do pytest ganhou 2 entradas escopadas — SyntaxWarning 'invalid escape sequence' de google.genai.* (defeito upstream documentado em types.py) e ResourceWarning 'unclosed database' (flake aiosqlite/GC sob xdist). Nenhuma regra de teste, codigo de producao ou contrato alterado; warnings deixam de contar no guarda SOTA do conftest que reprova a bateria acima do teto de 2."
  - registro: plano-laya-integracao-s1s2-pmev-2026-09-20
    caminhos:
    - pyproject.toml
    parecer: "Reconciliacao 2026-11-11 (rodada 2 CI): filterwarnings do pytest ganhou 2 entradas escopadas — SyntaxWarning 'invalid escape sequence' de google.genai.* (defeito upstream documentado em types.py) e ResourceWarning 'unclosed database' (flake aiosqlite/GC sob xdist). Nenhuma regra de teste, codigo de producao ou contrato alterado; warnings deixam de contar no guarda SOTA do conftest que reprova a bateria acima do teto de 2."
  - registro: registro-2026-09-09-remediacao-dependabot-httpx2
    caminhos:
    - pyproject.toml
    parecer: "Reconciliacao 2026-11-11 (rodada 2 CI): filterwarnings do pytest ganhou 2 entradas escopadas — SyntaxWarning 'invalid escape sequence' de google.genai.* (defeito upstream documentado em types.py) e ResourceWarning 'unclosed database' (flake aiosqlite/GC sob xdist). Nenhuma regra de teste, codigo de producao ou contrato alterado; warnings deixam de contar no guarda SOTA do conftest que reprova a bateria acima do teto de 2."
  - registro: registro-2026-09-13-ci-typecheck-e-fronteira-de-capacidades
    caminhos:
    - pyproject.toml
    parecer: "Reconciliacao 2026-11-11 (rodada 2 CI): filterwarnings do pytest ganhou 2 entradas escopadas — SyntaxWarning 'invalid escape sequence' de google.genai.* (defeito upstream documentado em types.py) e ResourceWarning 'unclosed database' (flake aiosqlite/GC sob xdist). Nenhuma regra de teste, codigo de producao ou contrato alterado; warnings deixam de contar no guarda SOTA do conftest que reprova a bateria acima do teto de 2."
  - registro: registro-2026-09-13-otimizacoes-helpers-antientropia-e-feedback
    caminhos:
    - pyproject.toml
    parecer: "Reconciliacao 2026-11-11 (rodada 2 CI): filterwarnings do pytest ganhou 2 entradas escopadas — SyntaxWarning 'invalid escape sequence' de google.genai.* (defeito upstream documentado em types.py) e ResourceWarning 'unclosed database' (flake aiosqlite/GC sob xdist). Nenhuma regra de teste, codigo de producao ou contrato alterado; warnings deixam de contar no guarda SOTA do conftest que reprova a bateria acima do teto de 2."
  - registro: registro-2026-10-04-remediacao-dependabot-pypdf
    caminhos:
    - pyproject.toml
    parecer: "Reconciliacao 2026-11-11 (rodada 2 CI): filterwarnings do pytest ganhou 2 entradas escopadas — SyntaxWarning 'invalid escape sequence' de google.genai.* (defeito upstream documentado em types.py) e ResourceWarning 'unclosed database' (flake aiosqlite/GC sob xdist). Nenhuma regra de teste, codigo de producao ou contrato alterado; warnings deixam de contar no guarda SOTA do conftest que reprova a bateria acima do teto de 2."
  - registro: registro-2026-10-08-auditoria-e-remediacao-backend
    caminhos:
    - pyproject.toml
    parecer: "Reconciliacao 2026-11-11 (rodada 2 CI): filterwarnings do pytest ganhou 2 entradas escopadas — SyntaxWarning 'invalid escape sequence' de google.genai.* (defeito upstream documentado em types.py) e ResourceWarning 'unclosed database' (flake aiosqlite/GC sob xdist). Nenhuma regra de teste, codigo de producao ou contrato alterado; warnings deixam de contar no guarda SOTA do conftest que reprova a bateria acima do teto de 2."
  - registro: registro-2026-10-14-saneamento-tipagem-config-ide-e-dependencias
    caminhos:
    - pyproject.toml
    parecer: "Reconciliacao 2026-11-11 (rodada 2 CI): filterwarnings do pytest ganhou 2 entradas escopadas — SyntaxWarning 'invalid escape sequence' de google.genai.* (defeito upstream documentado em types.py) e ResourceWarning 'unclosed database' (flake aiosqlite/GC sob xdist). Nenhuma regra de teste, codigo de producao ou contrato alterado; warnings deixam de contar no guarda SOTA do conftest que reprova a bateria acima do teto de 2."
  - registro: registro-2026-10-18-remediacao-dependabot-e-renovacao-axe
    caminhos:
    - pyproject.toml
    parecer: "Reconciliacao 2026-11-11 (rodada 2 CI): filterwarnings do pytest ganhou 2 entradas escopadas — SyntaxWarning 'invalid escape sequence' de google.genai.* (defeito upstream documentado em types.py) e ResourceWarning 'unclosed database' (flake aiosqlite/GC sob xdist). Nenhuma regra de teste, codigo de producao ou contrato alterado; warnings deixam de contar no guarda SOTA do conftest que reprova a bateria acima do teto de 2."
  - registro: registro-2026-10-24-remediacao-integral-74-vulnerabilidades-dependabot
    caminhos:
    - pyproject.toml
    parecer: "Reconciliacao 2026-11-11 (rodada 2 CI): filterwarnings do pytest ganhou 2 entradas escopadas — SyntaxWarning 'invalid escape sequence' de google.genai.* (defeito upstream documentado em types.py) e ResourceWarning 'unclosed database' (flake aiosqlite/GC sob xdist). Nenhuma regra de teste, codigo de producao ou contrato alterado; warnings deixam de contar no guarda SOTA do conftest que reprova a bateria acima do teto de 2."
  - registro: registro-2026-10-26-unificacao-ssot-dependencias-e-pwsh-sota
    caminhos:
    - pyproject.toml
    parecer: "Reconciliacao 2026-11-11 (rodada 2 CI): filterwarnings do pytest ganhou 2 entradas escopadas — SyntaxWarning 'invalid escape sequence' de google.genai.* (defeito upstream documentado em types.py) e ResourceWarning 'unclosed database' (flake aiosqlite/GC sob xdist). Nenhuma regra de teste, codigo de producao ou contrato alterado; warnings deixam de contar no guarda SOTA do conftest que reprova a bateria acima do teto de 2."
  - registro: registro-2026-10-27-elevacao-dependencias-python-openai-pyspark-pytest
    caminhos:
    - pyproject.toml
    parecer: "Reconciliacao 2026-11-11 (rodada 2 CI): filterwarnings do pytest ganhou 2 entradas escopadas — SyntaxWarning 'invalid escape sequence' de google.genai.* (defeito upstream documentado em types.py) e ResourceWarning 'unclosed database' (flake aiosqlite/GC sob xdist). Nenhuma regra de teste, codigo de producao ou contrato alterado; warnings deixam de contar no guarda SOTA do conftest que reprova a bateria acima do teto de 2."
  - registro: registro-2026-10-27-evolucao-project-context-e-reconciliacao-sota
    caminhos:
    - pyproject.toml
    parecer: "Reconciliacao 2026-11-11 (rodada 2 CI): filterwarnings do pytest ganhou 2 entradas escopadas — SyntaxWarning 'invalid escape sequence' de google.genai.* (defeito upstream documentado em types.py) e ResourceWarning 'unclosed database' (flake aiosqlite/GC sob xdist). Nenhuma regra de teste, codigo de producao ou contrato alterado; warnings deixam de contar no guarda SOTA do conftest que reprova a bateria acima do teto de 2."
  - registro: registro-2026-10-28-atualizacao-laya-e-estabilizacao-playwright-smoke
    caminhos:
    - pyproject.toml
    parecer: "Reconciliacao 2026-11-11 (rodada 2 CI): filterwarnings do pytest ganhou 2 entradas escopadas — SyntaxWarning 'invalid escape sequence' de google.genai.* (defeito upstream documentado em types.py) e ResourceWarning 'unclosed database' (flake aiosqlite/GC sob xdist). Nenhuma regra de teste, codigo de producao ou contrato alterado; warnings deixam de contar no guarda SOTA do conftest que reprova a bateria acima do teto de 2."
  - registro: registro-2026-10-28-saneamento-reconciliacao-e-elevacao-dependencias-triade-montecarlo
    caminhos:
    - pyproject.toml
    parecer: "Reconciliacao 2026-11-11 (rodada 2 CI): filterwarnings do pytest ganhou 2 entradas escopadas — SyntaxWarning 'invalid escape sequence' de google.genai.* (defeito upstream documentado em types.py) e ResourceWarning 'unclosed database' (flake aiosqlite/GC sob xdist). Nenhuma regra de teste, codigo de producao ou contrato alterado; warnings deixam de contar no guarda SOTA do conftest que reprova a bateria acima do teto de 2."
  - registro: registro-2026-10-31-estabilizacao-lifecycle-warmup-turbopack
    caminhos:
    - pyproject.toml
    parecer: "Reconciliacao 2026-11-11 (rodada 2 CI): filterwarnings do pytest ganhou 2 entradas escopadas — SyntaxWarning 'invalid escape sequence' de google.genai.* (defeito upstream documentado em types.py) e ResourceWarning 'unclosed database' (flake aiosqlite/GC sob xdist). Nenhuma regra de teste, codigo de producao ou contrato alterado; warnings deixam de contar no guarda SOTA do conftest que reprova a bateria acima do teto de 2."
  - registro: registro-2026-11-01-integracao-ai-mesh-sdk-e-otimizacao-jules
    caminhos:
    - pyproject.toml
    parecer: "Reconciliacao 2026-11-11 (rodada 2 CI): filterwarnings do pytest ganhou 2 entradas escopadas — SyntaxWarning 'invalid escape sequence' de google.genai.* (defeito upstream documentado em types.py) e ResourceWarning 'unclosed database' (flake aiosqlite/GC sob xdist). Nenhuma regra de teste, codigo de producao ou contrato alterado; warnings deixam de contar no guarda SOTA do conftest que reprova a bateria acima do teto de 2."
  - registro: registro-2026-11-03-elevacao-dependencias-pyarrow-openai-anthropic-laya
    caminhos:
    - pyproject.toml
    parecer: "Reconciliacao 2026-11-11 (rodada 2 CI): filterwarnings do pytest ganhou 2 entradas escopadas — SyntaxWarning 'invalid escape sequence' de google.genai.* (defeito upstream documentado em types.py) e ResourceWarning 'unclosed database' (flake aiosqlite/GC sob xdist). Nenhuma regra de teste, codigo de producao ou contrato alterado; warnings deixam de contar no guarda SOTA do conftest que reprova a bateria acima do teto de 2."
  - registro: registro-2026-11-03-otimizacao-agentes-watchdog-e-calibracao
    caminhos:
    - pyproject.toml
    parecer: "Reconciliacao 2026-11-11 (rodada 2 CI): filterwarnings do pytest ganhou 2 entradas escopadas — SyntaxWarning 'invalid escape sequence' de google.genai.* (defeito upstream documentado em types.py) e ResourceWarning 'unclosed database' (flake aiosqlite/GC sob xdist). Nenhuma regra de teste, codigo de producao ou contrato alterado; warnings deixam de contar no guarda SOTA do conftest que reprova a bateria acima do teto de 2."
  - registro: registro-2026-11-03-remediacao-dependabot-pypdf-pyasn1-minimatch
    caminhos:
    - pyproject.toml
    parecer: "Reconciliacao 2026-11-11 (rodada 2 CI): filterwarnings do pytest ganhou 2 entradas escopadas — SyntaxWarning 'invalid escape sequence' de google.genai.* (defeito upstream documentado em types.py) e ResourceWarning 'unclosed database' (flake aiosqlite/GC sob xdist). Nenhuma regra de teste, codigo de producao ou contrato alterado; warnings deixam de contar no guarda SOTA do conftest que reprova a bateria acima do teto de 2."
  - registro: registro-2026-11-04-otimizacao-layout-header-e-elevacao-dependencias
    caminhos:
    - pyproject.toml
    parecer: "Reconciliacao 2026-11-11 (rodada 2 CI): filterwarnings do pytest ganhou 2 entradas escopadas — SyntaxWarning 'invalid escape sequence' de google.genai.* (defeito upstream documentado em types.py) e ResourceWarning 'unclosed database' (flake aiosqlite/GC sob xdist). Nenhuma regra de teste, codigo de producao ou contrato alterado; warnings deixam de contar no guarda SOTA do conftest que reprova a bateria acima do teto de 2."
  - registro: registro-2026-11-05-saneamento-customizations-e-elevacao-dependencias
    caminhos:
    - pyproject.toml
    parecer: "Reconciliacao 2026-11-11 (rodada 2 CI): filterwarnings do pytest ganhou 2 entradas escopadas — SyntaxWarning 'invalid escape sequence' de google.genai.* (defeito upstream documentado em types.py) e ResourceWarning 'unclosed database' (flake aiosqlite/GC sob xdist). Nenhuma regra de teste, codigo de producao ou contrato alterado; warnings deixam de contar no guarda SOTA do conftest que reprova a bateria acima do teto de 2."
  - registro: registro-2026-11-06-reparo-manifestos-e-declaracao-chrysalis
    caminhos:
    - pyproject.toml
    parecer: "Reconciliacao 2026-11-11 (rodada 2 CI): filterwarnings do pytest ganhou 2 entradas escopadas — SyntaxWarning 'invalid escape sequence' de google.genai.* (defeito upstream documentado em types.py) e ResourceWarning 'unclosed database' (flake aiosqlite/GC sob xdist). Nenhuma regra de teste, codigo de producao ou contrato alterado; warnings deixam de contar no guarda SOTA do conftest que reprova a bateria acima do teto de 2."
  - registro: registro-2026-11-07-auditoria-integral-dependabot-github-e-code-scanning
    caminhos:
    - pyproject.toml
    parecer: "Reconciliacao 2026-11-11 (rodada 2 CI): filterwarnings do pytest ganhou 2 entradas escopadas — SyntaxWarning 'invalid escape sequence' de google.genai.* (defeito upstream documentado em types.py) e ResourceWarning 'unclosed database' (flake aiosqlite/GC sob xdist). Nenhuma regra de teste, codigo de producao ou contrato alterado; warnings deixam de contar no guarda SOTA do conftest que reprova a bateria acima do teto de 2."
  - registro: registro-2026-11-07-auditoria-jules-cloud-saneamento-linters-e-pyproject
    caminhos:
    - pyproject.toml
    parecer: "Reconciliacao 2026-11-11 (rodada 2 CI): filterwarnings do pytest ganhou 2 entradas escopadas — SyntaxWarning 'invalid escape sequence' de google.genai.* (defeito upstream documentado em types.py) e ResourceWarning 'unclosed database' (flake aiosqlite/GC sob xdist). Nenhuma regra de teste, codigo de producao ou contrato alterado; warnings deixam de contar no guarda SOTA do conftest que reprova a bateria acima do teto de 2."
  - registro: registro-2026-11-07-elevacao-dependencias-fastapi-regex-types-aiofiles
    caminhos:
    - pyproject.toml
    parecer: "Reconciliacao 2026-11-11 (rodada 2 CI): filterwarnings do pytest ganhou 2 entradas escopadas — SyntaxWarning 'invalid escape sequence' de google.genai.* (defeito upstream documentado em types.py) e ResourceWarning 'unclosed database' (flake aiosqlite/GC sob xdist). Nenhuma regra de teste, codigo de producao ou contrato alterado; warnings deixam de contar no guarda SOTA do conftest que reprova a bateria acima do teto de 2."
  - registro: registro-2026-11-08-elevacao-dependencias-regex-e-laya
    caminhos:
    - pyproject.toml
    parecer: "Reconciliacao 2026-11-11 (rodada 2 CI): filterwarnings do pytest ganhou 2 entradas escopadas — SyntaxWarning 'invalid escape sequence' de google.genai.* (defeito upstream documentado em types.py) e ResourceWarning 'unclosed database' (flake aiosqlite/GC sob xdist). Nenhuma regra de teste, codigo de producao ou contrato alterado; warnings deixam de contar no guarda SOTA do conftest que reprova a bateria acima do teto de 2."
  - registro: registro-2026-11-08-elevacao-polars-2-1-e-consumo-integral-engines-sota
    caminhos:
    - pyproject.toml
    parecer: "Reconciliacao 2026-11-11 (rodada 2 CI): filterwarnings do pytest ganhou 2 entradas escopadas — SyntaxWarning 'invalid escape sequence' de google.genai.* (defeito upstream documentado em types.py) e ResourceWarning 'unclosed database' (flake aiosqlite/GC sob xdist). Nenhuma regra de teste, codigo de producao ou contrato alterado; warnings deixam de contar no guarda SOTA do conftest que reprova a bateria acima do teto de 2."
  - registro: registro-2026-11-08-elevacao-pypdf-7-0-torchvision-e-ecossistema-npm
    caminhos:
    - pyproject.toml
    parecer: "Reconciliacao 2026-11-11 (rodada 2 CI): filterwarnings do pytest ganhou 2 entradas escopadas — SyntaxWarning 'invalid escape sequence' de google.genai.* (defeito upstream documentado em types.py) e ResourceWarning 'unclosed database' (flake aiosqlite/GC sob xdist). Nenhuma regra de teste, codigo de producao ou contrato alterado; warnings deixam de contar no guarda SOTA do conftest que reprova a bateria acima do teto de 2."
  - registro: registro-2026-11-08-integracao-sota-triade-stitch-exa-jules
    caminhos:
    - pyproject.toml
    parecer: "Reconciliacao 2026-11-11 (rodada 2 CI): filterwarnings do pytest ganhou 2 entradas escopadas — SyntaxWarning 'invalid escape sequence' de google.genai.* (defeito upstream documentado em types.py) e ResourceWarning 'unclosed database' (flake aiosqlite/GC sob xdist). Nenhuma regra de teste, codigo de producao ou contrato alterado; warnings deixam de contar no guarda SOTA do conftest que reprova a bateria acima do teto de 2."
  - registro: registro-2026-11-08-otimizacao-pyproject-dependencias-extras-e-reconciliacao
    caminhos:
    - pyproject.toml
    parecer: "Reconciliacao 2026-11-11 (rodada 2 CI): filterwarnings do pytest ganhou 2 entradas escopadas — SyntaxWarning 'invalid escape sequence' de google.genai.* (defeito upstream documentado em types.py) e ResourceWarning 'unclosed database' (flake aiosqlite/GC sob xdist). Nenhuma regra de teste, codigo de producao ou contrato alterado; warnings deixam de contar no guarda SOTA do conftest que reprova a bateria acima do teto de 2."
  - registro: registro-2026-11-09-elevacao-dependencias-e-fork-eigen
    caminhos:
    - pyproject.toml
    parecer: "Reconciliacao 2026-11-11 (rodada 2 CI): filterwarnings do pytest ganhou 2 entradas escopadas — SyntaxWarning 'invalid escape sequence' de google.genai.* (defeito upstream documentado em types.py) e ResourceWarning 'unclosed database' (flake aiosqlite/GC sob xdist). Nenhuma regra de teste, codigo de producao ou contrato alterado; warnings deixam de contar no guarda SOTA do conftest que reprova a bateria acima do teto de 2."
---

# Correcao de portabilidade dos testes para CI + Jekyll Liquid

## Diagnostico

O pipeline remoto SOTA v8.0 GOLD falhava em **todos** os pushes ha mais de dois
dias (verificado via `gh run list`: 8+ runs consecutivos `failure`). Gates
locais verdes nao detectavam porque o ambiente local tem R, polars
(--all-extras) e o ecossistema ~/.gemini provisionado — o CI nao.

## Falhas e correcoes

| Falha CI                         | Causa raiz                                      | Correcao                                                             |
| -------------------------------- | ----------------------------------------------- | -------------------------------------------------------------------- |
| 3x test_r_statistical_bridge     | Rscript ausente no runner                       | `skipif resolve_rscript_path() is None`                              |
| 3x test_antigravity_sdk_bridge   | `~/.gemini/settings.json` ausente               | `skipif GEMINI_CLI_SETTINGS.is_file()`                               |
| test_polars_game_tree_conversion | extra `pmev` nao instalado no CI                | `pytest.importorskip("polars")`                                      |
| 2x test_record_index             | referencia `sota_site_bridge.py` morta no clone | path corrigido para `extensions/...` + `referencias_nao_resolviveis` |
| pages build (Jekyll)             | `{%}` LaTeX literal quebrava parser Liquid      | `\%` nas linhas 267-268 da Enciclopedia                              |

## Principio aplicado

Skips sao **declarados** (motivo explicito, padrao ja usado no mesmo arquivo
para prometheus_client e agy CLI) — cobertura dependente de ambiente segue
visivel como "nao executada", nunca como aprovada.
