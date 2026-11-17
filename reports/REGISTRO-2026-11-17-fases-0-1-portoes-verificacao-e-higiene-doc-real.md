---
id: registro-2026-11-17-fases-0-1-portoes-verificacao-e-higiene-doc-real
tipo: registro
escopo: "Site -- Fases 0-1 da auditoria SOTA: portoes de verificacao reais (Pyright/Jest/pytest no CI e deploy), sync requirements x pyproject, higiene documento-real"
ecossistema: nexus-sota
autor: "Devin (SWE-2 Flash) <158243242+devin-ai-integration[bot]@users.noreply.github.com>"
criado_em: "2026-11-17T13:51:54-03:00"
atualizado_em: "2026-11-17T13:51:54-03:00"
commit: HEAD
classes:
  - interno
  - medido
  - governanca
  - registro
  - dependencias
  - ci
caminhos:
  - .github/workflows/sota-ci.yml
  - .gitignore
  - README.md
  - cloudbuild.backend.yaml
  - frontmatter.json
  - main.py
  - package-lock.json
  - package.json
  - pyproject.toml
  - requirements.txt
  - tests/test_requirements_sync.py
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  condutor: Devin (SWE-2 Flash)
  veiculo: devin-desktop
  tier: 1
  supervisao: assistida
  data_das_medicoes: 2026-11-17
verificado:
  - "python:typecheck executa Pyright real: 229 arquivos, 0 erros, 0 warnings (flag --project pyproject.toml obrigatoria contra pyrightconfig.json do diretorio pai)"
  - "Jest no sota-ci.yml: baseline local 111 suites / 743 testes PASS em ~12 s; actionlint valido"
  - "cloudbuild.backend.yaml: pyright + pytest no quality-gate antes do docker-build; YAML valido"
  - "requirements.txt sincronizado com pyproject.toml (5 pisos) + tests/test_requirements_sync.py 4/4 PASS"
  - ".gitignore e pyproject.toml em SOTA v8.0 GOLD; README com claims ancorados em medicao"
  - "frontmatter.json pageFolders corrigidos; index.ts/stream.ts removidos; 4 deps vestigiais do package.json raiz removidas; lock -9 pacotes"
  - "main.py documentado como entrypoint API-only; core/runtime.py segue como stack completa"
  - "sota:audit verde (LCP 563ms, CLS ~0.0001, TBT 32ms, TTFB 119ms, heap 20MB, axe 0, CVEs 0, SRI ok, higiene ok)"
  - "suite_verde.py no pre-commit: 100% pytest sob 6 workers"
nao_verificado:
  - "cloudbuild.backend.yaml so sera exercido no proximo deploy real; receita identica a validada no GH CI e local"
  - "main.py x core/runtime.py documentados, nao unificados (unificacao e mudanca de comportamento fora de escopo)"
  - "Fases 2-5 do plano de auditoria seguem planejadas, nao executadas"
referencias_nao_resolviveis:
  - index.ts
  - stream.ts
revisoes_de_ancora:
  - registro: auditoria-2026-09-01-formatacao-ruff-e-ancoras
    caminhos:
      - .github/workflows/sota-ci.yml
    parecer: "Revisado em 2026-11-17. Fases 0-1 da auditoria SOTA do projeto: portoes de verificacao tornados reais (Pyright em python:typecheck e no quality-gate do cloudbuild.backend.yaml, Jest incluido no job frontend do sota-ci.yml), sincronizacao requirements.txt x pyproject.toml com guarda executavel tests/test_requirements_sync.py, higiene documento-real (.gitignore e pyproject.toml em v8.0 GOLD, claims do README ancorados em medicao, frontmatter.json corrigido, remocao de index.ts/stream.ts e dependencias vestigiais, main.py documentado como entrypoint API-only). As mudancas nao alteram os contratos que este registro atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: auditoria-2026-09-12-o-ci-vermelho-que-nenhum-portao-local-media
    caminhos:
      - .github/workflows/sota-ci.yml
    parecer: "Revisado em 2026-11-17. Fases 0-1 da auditoria SOTA do projeto: portoes de verificacao tornados reais (Pyright em python:typecheck e no quality-gate do cloudbuild.backend.yaml, Jest incluido no job frontend do sota-ci.yml), sincronizacao requirements.txt x pyproject.toml com guarda executavel tests/test_requirements_sync.py, higiene documento-real (.gitignore e pyproject.toml em v8.0 GOLD, claims do README ancorados em medicao, frontmatter.json corrigido, remocao de index.ts/stream.ts e dependencias vestigiais, main.py documentado como entrypoint API-only). As mudancas nao alteram os contratos que este registro atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: auditoria-2026-10-08-integralidade-backend
    caminhos:
      - pyproject.toml
      - requirements.txt
    parecer: "Revisado em 2026-11-17. Fases 0-1 da auditoria SOTA do projeto: portoes de verificacao tornados reais (Pyright em python:typecheck e no quality-gate do cloudbuild.backend.yaml, Jest incluido no job frontend do sota-ci.yml), sincronizacao requirements.txt x pyproject.toml com guarda executavel tests/test_requirements_sync.py, higiene documento-real (.gitignore e pyproject.toml em v8.0 GOLD, claims do README ancorados em medicao, frontmatter.json corrigido, remocao de index.ts/stream.ts e dependencias vestigiais, main.py documentado como entrypoint API-only). As mudancas nao alteram os contratos que este registro atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: handoff-2026-09-09-ci-verde-e-as-seis-causas
    caminhos:
      - .github/workflows/sota-ci.yml
    parecer: "Revisado em 2026-11-17. Fases 0-1 da auditoria SOTA do projeto: portoes de verificacao tornados reais (Pyright em python:typecheck e no quality-gate do cloudbuild.backend.yaml, Jest incluido no job frontend do sota-ci.yml), sincronizacao requirements.txt x pyproject.toml com guarda executavel tests/test_requirements_sync.py, higiene documento-real (.gitignore e pyproject.toml em v8.0 GOLD, claims do README ancorados em medicao, frontmatter.json corrigido, remocao de index.ts/stream.ts e dependencias vestigiais, main.py documentado como entrypoint API-only). As mudancas nao alteram os contratos que este registro atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: handoff-2026-10-08-auditoria-e-remediacao-backend
    caminhos:
      - package-lock.json
      - pyproject.toml
      - requirements.txt
    parecer: "Revisado em 2026-11-17. Fases 0-1 da auditoria SOTA do projeto: portoes de verificacao tornados reais (Pyright em python:typecheck e no quality-gate do cloudbuild.backend.yaml, Jest incluido no job frontend do sota-ci.yml), sincronizacao requirements.txt x pyproject.toml com guarda executavel tests/test_requirements_sync.py, higiene documento-real (.gitignore e pyproject.toml em v8.0 GOLD, claims do README ancorados em medicao, frontmatter.json corrigido, remocao de index.ts/stream.ts e dependencias vestigiais, main.py documentado como entrypoint API-only). As mudancas nao alteram os contratos que este registro atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: handoff-2026-10-24-remediacao-dependabot-e-integridade-sota
    caminhos:
      - package-lock.json
      - package.json
      - pyproject.toml
      - requirements.txt
    parecer: "Revisado em 2026-11-17. Fases 0-1 da auditoria SOTA do projeto: portoes de verificacao tornados reais (Pyright em python:typecheck e no quality-gate do cloudbuild.backend.yaml, Jest incluido no job frontend do sota-ci.yml), sincronizacao requirements.txt x pyproject.toml com guarda executavel tests/test_requirements_sync.py, higiene documento-real (.gitignore e pyproject.toml em v8.0 GOLD, claims do README ancorados em medicao, frontmatter.json corrigido, remocao de index.ts/stream.ts e dependencias vestigiais, main.py documentado como entrypoint API-only). As mudancas nao alteram os contratos que este registro atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: handoff-2026-11-15-translategemma-timesfm-laya-roi
    caminhos:
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Fases 0-1 da auditoria SOTA do projeto: portoes de verificacao tornados reais (Pyright em python:typecheck e no quality-gate do cloudbuild.backend.yaml, Jest incluido no job frontend do sota-ci.yml), sincronizacao requirements.txt x pyproject.toml com guarda executavel tests/test_requirements_sync.py, higiene documento-real (.gitignore e pyproject.toml em v8.0 GOLD, claims do README ancorados em medicao, frontmatter.json corrigido, remocao de index.ts/stream.ts e dependencias vestigiais, main.py documentado como entrypoint API-only). As mudancas nao alteram os contratos que este registro atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-09-02-fast-uri-alto-e-contrato-de-evidencia-pmev
    caminhos:
      - package-lock.json
    parecer: "Revisado em 2026-11-17. Fases 0-1 da auditoria SOTA do projeto: portoes de verificacao tornados reais (Pyright em python:typecheck e no quality-gate do cloudbuild.backend.yaml, Jest incluido no job frontend do sota-ci.yml), sincronizacao requirements.txt x pyproject.toml com guarda executavel tests/test_requirements_sync.py, higiene documento-real (.gitignore e pyproject.toml em v8.0 GOLD, claims do README ancorados em medicao, frontmatter.json corrigido, remocao de index.ts/stream.ts e dependencias vestigiais, main.py documentado como entrypoint API-only). As mudancas nao alteram os contratos que este registro atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-09-04-lighthouse-certificado-e-o-certificado-que-nao-viajava
    caminhos:
      - .gitignore
    parecer: "Revisado em 2026-11-17. Fases 0-1 da auditoria SOTA do projeto: portoes de verificacao tornados reais (Pyright em python:typecheck e no quality-gate do cloudbuild.backend.yaml, Jest incluido no job frontend do sota-ci.yml), sincronizacao requirements.txt x pyproject.toml com guarda executavel tests/test_requirements_sync.py, higiene documento-real (.gitignore e pyproject.toml em v8.0 GOLD, claims do README ancorados em medicao, frontmatter.json corrigido, remocao de index.ts/stream.ts e dependencias vestigiais, main.py documentado como entrypoint API-only). As mudancas nao alteram os contratos que este registro atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-09-08-bindings-wasm-defasados
    caminhos:
      - .github/workflows/sota-ci.yml
    parecer: "Revisado em 2026-11-17. Fases 0-1 da auditoria SOTA do projeto: portoes de verificacao tornados reais (Pyright em python:typecheck e no quality-gate do cloudbuild.backend.yaml, Jest incluido no job frontend do sota-ci.yml), sincronizacao requirements.txt x pyproject.toml com guarda executavel tests/test_requirements_sync.py, higiene documento-real (.gitignore e pyproject.toml em v8.0 GOLD, claims do README ancorados em medicao, frontmatter.json corrigido, remocao de index.ts/stream.ts e dependencias vestigiais, main.py documentado como entrypoint API-only). As mudancas nao alteram os contratos que este registro atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-09-14-benchmark-icm-chipev-em-hand-history-e-next-env
    caminhos:
      - .github/workflows/sota-ci.yml
      - .gitignore
    parecer: "Revisado em 2026-11-17. Fases 0-1 da auditoria SOTA do projeto: portoes de verificacao tornados reais (Pyright em python:typecheck e no quality-gate do cloudbuild.backend.yaml, Jest incluido no job frontend do sota-ci.yml), sincronizacao requirements.txt x pyproject.toml com guarda executavel tests/test_requirements_sync.py, higiene documento-real (.gitignore e pyproject.toml em v8.0 GOLD, claims do README ancorados em medicao, frontmatter.json corrigido, remocao de index.ts/stream.ts e dependencias vestigiais, main.py documentado como entrypoint API-only). As mudancas nao alteram os contratos que este registro atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: 2026-09-22-auditoria-frontend-4-itens
    caminhos:
      - .gitignore
    parecer: "Revisado em 2026-11-17. Fases 0-1 da auditoria SOTA do projeto: portoes de verificacao tornados reais (Pyright em python:typecheck e no quality-gate do cloudbuild.backend.yaml, Jest incluido no job frontend do sota-ci.yml), sincronizacao requirements.txt x pyproject.toml com guarda executavel tests/test_requirements_sync.py, higiene documento-real (.gitignore e pyproject.toml em v8.0 GOLD, claims do README ancorados em medicao, frontmatter.json corrigido, remocao de index.ts/stream.ts e dependencias vestigiais, main.py documentado como entrypoint API-only). As mudancas nao alteram os contratos que este registro atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-10-04-remediacao-dependabot-pypdf
    caminhos:
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Fases 0-1 da auditoria SOTA do projeto: portoes de verificacao tornados reais (Pyright em python:typecheck e no quality-gate do cloudbuild.backend.yaml, Jest incluido no job frontend do sota-ci.yml), sincronizacao requirements.txt x pyproject.toml com guarda executavel tests/test_requirements_sync.py, higiene documento-real (.gitignore e pyproject.toml em v8.0 GOLD, claims do README ancorados em medicao, frontmatter.json corrigido, remocao de index.ts/stream.ts e dependencias vestigiais, main.py documentado como entrypoint API-only). As mudancas nao alteram os contratos que este registro atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-10-04-remediacao-dependabot-sentence-transformers-e-urllib3
    caminhos:
      - .github/workflows/sota-ci.yml
    parecer: "Revisado em 2026-11-17. Fases 0-1 da auditoria SOTA do projeto: portoes de verificacao tornados reais (Pyright em python:typecheck e no quality-gate do cloudbuild.backend.yaml, Jest incluido no job frontend do sota-ci.yml), sincronizacao requirements.txt x pyproject.toml com guarda executavel tests/test_requirements_sync.py, higiene documento-real (.gitignore e pyproject.toml em v8.0 GOLD, claims do README ancorados em medicao, frontmatter.json corrigido, remocao de index.ts/stream.ts e dependencias vestigiais, main.py documentado como entrypoint API-only). As mudancas nao alteram os contratos que este registro atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-10-05-atlas-cenarios-acessibilidade-e-design-system
    caminhos:
      - .github/workflows/sota-ci.yml
    parecer: "Revisado em 2026-11-17. Fases 0-1 da auditoria SOTA do projeto: portoes de verificacao tornados reais (Pyright em python:typecheck e no quality-gate do cloudbuild.backend.yaml, Jest incluido no job frontend do sota-ci.yml), sincronizacao requirements.txt x pyproject.toml com guarda executavel tests/test_requirements_sync.py, higiene documento-real (.gitignore e pyproject.toml em v8.0 GOLD, claims do README ancorados em medicao, frontmatter.json corrigido, remocao de index.ts/stream.ts e dependencias vestigiais, main.py documentado como entrypoint API-only). As mudancas nao alteram os contratos que este registro atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-10-08-auditoria-e-remediacao-backend
    caminhos:
      - package-lock.json
      - pyproject.toml
      - requirements.txt
    parecer: "Revisado em 2026-11-17. Fases 0-1 da auditoria SOTA do projeto: portoes de verificacao tornados reais (Pyright em python:typecheck e no quality-gate do cloudbuild.backend.yaml, Jest incluido no job frontend do sota-ci.yml), sincronizacao requirements.txt x pyproject.toml com guarda executavel tests/test_requirements_sync.py, higiene documento-real (.gitignore e pyproject.toml em v8.0 GOLD, claims do README ancorados em medicao, frontmatter.json corrigido, remocao de index.ts/stream.ts e dependencias vestigiais, main.py documentado como entrypoint API-only). As mudancas nao alteram os contratos que este registro atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-10-09-auditoria-governanca-e-remediacao-sota-v8-gold
    caminhos:
      - README.md
    parecer: "Revisado em 2026-11-17. Fases 0-1 da auditoria SOTA do projeto: portoes de verificacao tornados reais (Pyright em python:typecheck e no quality-gate do cloudbuild.backend.yaml, Jest incluido no job frontend do sota-ci.yml), sincronizacao requirements.txt x pyproject.toml com guarda executavel tests/test_requirements_sync.py, higiene documento-real (.gitignore e pyproject.toml em v8.0 GOLD, claims do README ancorados em medicao, frontmatter.json corrigido, remocao de index.ts/stream.ts e dependencias vestigiais, main.py documentado como entrypoint API-only). As mudancas nao alteram os contratos que este registro atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-10-13-remediacao-dependabot-e-offload-strata
    caminhos:
      - package-lock.json
      - package.json
    parecer: "Revisado em 2026-11-17. Fases 0-1 da auditoria SOTA do projeto: portoes de verificacao tornados reais (Pyright em python:typecheck e no quality-gate do cloudbuild.backend.yaml, Jest incluido no job frontend do sota-ci.yml), sincronizacao requirements.txt x pyproject.toml com guarda executavel tests/test_requirements_sync.py, higiene documento-real (.gitignore e pyproject.toml em v8.0 GOLD, claims do README ancorados em medicao, frontmatter.json corrigido, remocao de index.ts/stream.ts e dependencias vestigiais, main.py documentado como entrypoint API-only). As mudancas nao alteram os contratos que este registro atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-10-14-saneamento-tipagem-config-ide-e-dependencias
    caminhos:
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Fases 0-1 da auditoria SOTA do projeto: portoes de verificacao tornados reais (Pyright em python:typecheck e no quality-gate do cloudbuild.backend.yaml, Jest incluido no job frontend do sota-ci.yml), sincronizacao requirements.txt x pyproject.toml com guarda executavel tests/test_requirements_sync.py, higiene documento-real (.gitignore e pyproject.toml em v8.0 GOLD, claims do README ancorados em medicao, frontmatter.json corrigido, remocao de index.ts/stream.ts e dependencias vestigiais, main.py documentado como entrypoint API-only). As mudancas nao alteram os contratos que este registro atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-10-18-remediacao-dependabot-e-renovacao-axe
    caminhos:
      - pyproject.toml
      - requirements.txt
    parecer: "Revisado em 2026-11-17. Fases 0-1 da auditoria SOTA do projeto: portoes de verificacao tornados reais (Pyright em python:typecheck e no quality-gate do cloudbuild.backend.yaml, Jest incluido no job frontend do sota-ci.yml), sincronizacao requirements.txt x pyproject.toml com guarda executavel tests/test_requirements_sync.py, higiene documento-real (.gitignore e pyproject.toml em v8.0 GOLD, claims do README ancorados em medicao, frontmatter.json corrigido, remocao de index.ts/stream.ts e dependencias vestigiais, main.py documentado como entrypoint API-only). As mudancas nao alteram os contratos que este registro atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-10-19-evolucao-telemetria-mcp-s1-e-benchmark-regime
    caminhos:
      - .gitignore
    parecer: "Revisado em 2026-11-17. Fases 0-1 da auditoria SOTA do projeto: portoes de verificacao tornados reais (Pyright em python:typecheck e no quality-gate do cloudbuild.backend.yaml, Jest incluido no job frontend do sota-ci.yml), sincronizacao requirements.txt x pyproject.toml com guarda executavel tests/test_requirements_sync.py, higiene documento-real (.gitignore e pyproject.toml em v8.0 GOLD, claims do README ancorados em medicao, frontmatter.json corrigido, remocao de index.ts/stream.ts e dependencias vestigiais, main.py documentado como entrypoint API-only). As mudancas nao alteram os contratos que este registro atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-10-24-auditoria-geral-saneamento-e-reconciliacao
    caminhos:
      - package-lock.json
    parecer: "Revisado em 2026-11-17. Fases 0-1 da auditoria SOTA do projeto: portoes de verificacao tornados reais (Pyright em python:typecheck e no quality-gate do cloudbuild.backend.yaml, Jest incluido no job frontend do sota-ci.yml), sincronizacao requirements.txt x pyproject.toml com guarda executavel tests/test_requirements_sync.py, higiene documento-real (.gitignore e pyproject.toml em v8.0 GOLD, claims do README ancorados em medicao, frontmatter.json corrigido, remocao de index.ts/stream.ts e dependencias vestigiais, main.py documentado como entrypoint API-only). As mudancas nao alteram os contratos que este registro atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-10-24-remediacao-integral-74-vulnerabilidades-dependabot
    caminhos:
      - package-lock.json
      - package.json
      - pyproject.toml
      - requirements.txt
    parecer: "Revisado em 2026-11-17. Fases 0-1 da auditoria SOTA do projeto: portoes de verificacao tornados reais (Pyright em python:typecheck e no quality-gate do cloudbuild.backend.yaml, Jest incluido no job frontend do sota-ci.yml), sincronizacao requirements.txt x pyproject.toml com guarda executavel tests/test_requirements_sync.py, higiene documento-real (.gitignore e pyproject.toml em v8.0 GOLD, claims do README ancorados em medicao, frontmatter.json corrigido, remocao de index.ts/stream.ts e dependencias vestigiais, main.py documentado como entrypoint API-only). As mudancas nao alteram os contratos que este registro atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-10-26-unificacao-ssot-dependencias-e-pwsh-sota
    caminhos:
      - package.json
      - pyproject.toml
      - requirements.txt
    parecer: "Revisado em 2026-11-17. Fases 0-1 da auditoria SOTA do projeto: portoes de verificacao tornados reais (Pyright em python:typecheck e no quality-gate do cloudbuild.backend.yaml, Jest incluido no job frontend do sota-ci.yml), sincronizacao requirements.txt x pyproject.toml com guarda executavel tests/test_requirements_sync.py, higiene documento-real (.gitignore e pyproject.toml em v8.0 GOLD, claims do README ancorados em medicao, frontmatter.json corrigido, remocao de index.ts/stream.ts e dependencias vestigiais, main.py documentado como entrypoint API-only). As mudancas nao alteram os contratos que este registro atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-10-27-elevacao-dependencias-python-openai-pyspark-pytest
    caminhos:
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Fases 0-1 da auditoria SOTA do projeto: portoes de verificacao tornados reais (Pyright em python:typecheck e no quality-gate do cloudbuild.backend.yaml, Jest incluido no job frontend do sota-ci.yml), sincronizacao requirements.txt x pyproject.toml com guarda executavel tests/test_requirements_sync.py, higiene documento-real (.gitignore e pyproject.toml em v8.0 GOLD, claims do README ancorados em medicao, frontmatter.json corrigido, remocao de index.ts/stream.ts e dependencias vestigiais, main.py documentado como entrypoint API-only). As mudancas nao alteram os contratos que este registro atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-10-27-evolucao-project-context-e-reconciliacao-sota
    caminhos:
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Fases 0-1 da auditoria SOTA do projeto: portoes de verificacao tornados reais (Pyright em python:typecheck e no quality-gate do cloudbuild.backend.yaml, Jest incluido no job frontend do sota-ci.yml), sincronizacao requirements.txt x pyproject.toml com guarda executavel tests/test_requirements_sync.py, higiene documento-real (.gitignore e pyproject.toml em v8.0 GOLD, claims do README ancorados em medicao, frontmatter.json corrigido, remocao de index.ts/stream.ts e dependencias vestigiais, main.py documentado como entrypoint API-only). As mudancas nao alteram os contratos que este registro atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-10-27-harmonizacao-dependencias-ci-e-wasm
    caminhos:
      - package-lock.json
      - package.json
    parecer: "Revisado em 2026-11-17. Fases 0-1 da auditoria SOTA do projeto: portoes de verificacao tornados reais (Pyright em python:typecheck e no quality-gate do cloudbuild.backend.yaml, Jest incluido no job frontend do sota-ci.yml), sincronizacao requirements.txt x pyproject.toml com guarda executavel tests/test_requirements_sync.py, higiene documento-real (.gitignore e pyproject.toml em v8.0 GOLD, claims do README ancorados em medicao, frontmatter.json corrigido, remocao de index.ts/stream.ts e dependencias vestigiais, main.py documentado como entrypoint API-only). As mudancas nao alteram os contratos que este registro atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-10-27-harmonizacao-dependencias-katex-e-ci
    caminhos:
      - package-lock.json
    parecer: "Revisado em 2026-11-17. Fases 0-1 da auditoria SOTA do projeto: portoes de verificacao tornados reais (Pyright em python:typecheck e no quality-gate do cloudbuild.backend.yaml, Jest incluido no job frontend do sota-ci.yml), sincronizacao requirements.txt x pyproject.toml com guarda executavel tests/test_requirements_sync.py, higiene documento-real (.gitignore e pyproject.toml em v8.0 GOLD, claims do README ancorados em medicao, frontmatter.json corrigido, remocao de index.ts/stream.ts e dependencias vestigiais, main.py documentado como entrypoint API-only). As mudancas nao alteram os contratos que este registro atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-10-27-remediacao-dependabot-submodulo-e-integracao-sota
    caminhos:
      - package-lock.json
      - package.json
    parecer: "Revisado em 2026-11-17. Fases 0-1 da auditoria SOTA do projeto: portoes de verificacao tornados reais (Pyright em python:typecheck e no quality-gate do cloudbuild.backend.yaml, Jest incluido no job frontend do sota-ci.yml), sincronizacao requirements.txt x pyproject.toml com guarda executavel tests/test_requirements_sync.py, higiene documento-real (.gitignore e pyproject.toml em v8.0 GOLD, claims do README ancorados em medicao, frontmatter.json corrigido, remocao de index.ts/stream.ts e dependencias vestigiais, main.py documentado como entrypoint API-only). As mudancas nao alteram os contratos que este registro atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-10-28-atualizacao-laya-e-estabilizacao-playwright-smoke
    caminhos:
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Fases 0-1 da auditoria SOTA do projeto: portoes de verificacao tornados reais (Pyright em python:typecheck e no quality-gate do cloudbuild.backend.yaml, Jest incluido no job frontend do sota-ci.yml), sincronizacao requirements.txt x pyproject.toml com guarda executavel tests/test_requirements_sync.py, higiene documento-real (.gitignore e pyproject.toml em v8.0 GOLD, claims do README ancorados em medicao, frontmatter.json corrigido, remocao de index.ts/stream.ts e dependencias vestigiais, main.py documentado como entrypoint API-only). As mudancas nao alteram os contratos que este registro atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-10-28-saneamento-reconciliacao-e-elevacao-dependencias-triade-montecarlo
    caminhos:
      - pyproject.toml
      - requirements.txt
    parecer: "Revisado em 2026-11-17. Fases 0-1 da auditoria SOTA do projeto: portoes de verificacao tornados reais (Pyright em python:typecheck e no quality-gate do cloudbuild.backend.yaml, Jest incluido no job frontend do sota-ci.yml), sincronizacao requirements.txt x pyproject.toml com guarda executavel tests/test_requirements_sync.py, higiene documento-real (.gitignore e pyproject.toml em v8.0 GOLD, claims do README ancorados em medicao, frontmatter.json corrigido, remocao de index.ts/stream.ts e dependencias vestigiais, main.py documentado como entrypoint API-only). As mudancas nao alteram os contratos que este registro atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-10-31-estabilizacao-lifecycle-warmup-turbopack
    caminhos:
      - pyproject.toml
      - requirements.txt
    parecer: "Revisado em 2026-11-17. Fases 0-1 da auditoria SOTA do projeto: portoes de verificacao tornados reais (Pyright em python:typecheck e no quality-gate do cloudbuild.backend.yaml, Jest incluido no job frontend do sota-ci.yml), sincronizacao requirements.txt x pyproject.toml com guarda executavel tests/test_requirements_sync.py, higiene documento-real (.gitignore e pyproject.toml em v8.0 GOLD, claims do README ancorados em medicao, frontmatter.json corrigido, remocao de index.ts/stream.ts e dependencias vestigiais, main.py documentado como entrypoint API-only). As mudancas nao alteram os contratos que este registro atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-11-01-integracao-ai-mesh-sdk-e-otimizacao-jules
    caminhos:
      - package-lock.json
      - package.json
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Fases 0-1 da auditoria SOTA do projeto: portoes de verificacao tornados reais (Pyright em python:typecheck e no quality-gate do cloudbuild.backend.yaml, Jest incluido no job frontend do sota-ci.yml), sincronizacao requirements.txt x pyproject.toml com guarda executavel tests/test_requirements_sync.py, higiene documento-real (.gitignore e pyproject.toml em v8.0 GOLD, claims do README ancorados em medicao, frontmatter.json corrigido, remocao de index.ts/stream.ts e dependencias vestigiais, main.py documentado como entrypoint API-only). As mudancas nao alteram os contratos que este registro atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-11-01-resiliencia-proactor-winerror-10054
    caminhos:
      - main.py
    parecer: "Revisado em 2026-11-17. Fases 0-1 da auditoria SOTA do projeto: portoes de verificacao tornados reais (Pyright em python:typecheck e no quality-gate do cloudbuild.backend.yaml, Jest incluido no job frontend do sota-ci.yml), sincronizacao requirements.txt x pyproject.toml com guarda executavel tests/test_requirements_sync.py, higiene documento-real (.gitignore e pyproject.toml em v8.0 GOLD, claims do README ancorados em medicao, frontmatter.json corrigido, remocao de index.ts/stream.ts e dependencias vestigiais, main.py documentado como entrypoint API-only). As mudancas nao alteram os contratos que este registro atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-11-03-elevacao-dependencias-pyarrow-openai-anthropic-laya
    caminhos:
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Fases 0-1 da auditoria SOTA do projeto: portoes de verificacao tornados reais (Pyright em python:typecheck e no quality-gate do cloudbuild.backend.yaml, Jest incluido no job frontend do sota-ci.yml), sincronizacao requirements.txt x pyproject.toml com guarda executavel tests/test_requirements_sync.py, higiene documento-real (.gitignore e pyproject.toml em v8.0 GOLD, claims do README ancorados em medicao, frontmatter.json corrigido, remocao de index.ts/stream.ts e dependencias vestigiais, main.py documentado como entrypoint API-only). As mudancas nao alteram os contratos que este registro atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-11-03-otimizacao-agentes-watchdog-e-calibracao
    caminhos:
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Fases 0-1 da auditoria SOTA do projeto: portoes de verificacao tornados reais (Pyright em python:typecheck e no quality-gate do cloudbuild.backend.yaml, Jest incluido no job frontend do sota-ci.yml), sincronizacao requirements.txt x pyproject.toml com guarda executavel tests/test_requirements_sync.py, higiene documento-real (.gitignore e pyproject.toml em v8.0 GOLD, claims do README ancorados em medicao, frontmatter.json corrigido, remocao de index.ts/stream.ts e dependencias vestigiais, main.py documentado como entrypoint API-only). As mudancas nao alteram os contratos que este registro atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-11-03-remediacao-dependabot-pypdf-pyasn1-minimatch
    caminhos:
      - package-lock.json
      - package.json
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Fases 0-1 da auditoria SOTA do projeto: portoes de verificacao tornados reais (Pyright em python:typecheck e no quality-gate do cloudbuild.backend.yaml, Jest incluido no job frontend do sota-ci.yml), sincronizacao requirements.txt x pyproject.toml com guarda executavel tests/test_requirements_sync.py, higiene documento-real (.gitignore e pyproject.toml em v8.0 GOLD, claims do README ancorados em medicao, frontmatter.json corrigido, remocao de index.ts/stream.ts e dependencias vestigiais, main.py documentado como entrypoint API-only). As mudancas nao alteram os contratos que este registro atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-11-04-otimizacao-layout-header-e-elevacao-dependencias
    caminhos:
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Fases 0-1 da auditoria SOTA do projeto: portoes de verificacao tornados reais (Pyright em python:typecheck e no quality-gate do cloudbuild.backend.yaml, Jest incluido no job frontend do sota-ci.yml), sincronizacao requirements.txt x pyproject.toml com guarda executavel tests/test_requirements_sync.py, higiene documento-real (.gitignore e pyproject.toml em v8.0 GOLD, claims do README ancorados em medicao, frontmatter.json corrigido, remocao de index.ts/stream.ts e dependencias vestigiais, main.py documentado como entrypoint API-only). As mudancas nao alteram os contratos que este registro atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-11-05-saneamento-customizations-e-elevacao-dependencias
    caminhos:
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Fases 0-1 da auditoria SOTA do projeto: portoes de verificacao tornados reais (Pyright em python:typecheck e no quality-gate do cloudbuild.backend.yaml, Jest incluido no job frontend do sota-ci.yml), sincronizacao requirements.txt x pyproject.toml com guarda executavel tests/test_requirements_sync.py, higiene documento-real (.gitignore e pyproject.toml em v8.0 GOLD, claims do README ancorados em medicao, frontmatter.json corrigido, remocao de index.ts/stream.ts e dependencias vestigiais, main.py documentado como entrypoint API-only). As mudancas nao alteram os contratos que este registro atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-11-06-reparo-manifestos-e-declaracao-chrysalis
    caminhos:
      - package-lock.json
      - package.json
      - pyproject.toml
      - requirements.txt
    parecer: "Revisado em 2026-11-17. Fases 0-1 da auditoria SOTA do projeto: portoes de verificacao tornados reais (Pyright em python:typecheck e no quality-gate do cloudbuild.backend.yaml, Jest incluido no job frontend do sota-ci.yml), sincronizacao requirements.txt x pyproject.toml com guarda executavel tests/test_requirements_sync.py, higiene documento-real (.gitignore e pyproject.toml em v8.0 GOLD, claims do README ancorados em medicao, frontmatter.json corrigido, remocao de index.ts/stream.ts e dependencias vestigiais, main.py documentado como entrypoint API-only). As mudancas nao alteram os contratos que este registro atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-11-07-auditoria-jules-cloud-saneamento-linters-e-pyproject
    caminhos:
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Fases 0-1 da auditoria SOTA do projeto: portoes de verificacao tornados reais (Pyright em python:typecheck e no quality-gate do cloudbuild.backend.yaml, Jest incluido no job frontend do sota-ci.yml), sincronizacao requirements.txt x pyproject.toml com guarda executavel tests/test_requirements_sync.py, higiene documento-real (.gitignore e pyproject.toml em v8.0 GOLD, claims do README ancorados em medicao, frontmatter.json corrigido, remocao de index.ts/stream.ts e dependencias vestigiais, main.py documentado como entrypoint API-only). As mudancas nao alteram os contratos que este registro atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-11-07-elevacao-dependencias-fastapi-regex-types-aiofiles
    caminhos:
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Fases 0-1 da auditoria SOTA do projeto: portoes de verificacao tornados reais (Pyright em python:typecheck e no quality-gate do cloudbuild.backend.yaml, Jest incluido no job frontend do sota-ci.yml), sincronizacao requirements.txt x pyproject.toml com guarda executavel tests/test_requirements_sync.py, higiene documento-real (.gitignore e pyproject.toml em v8.0 GOLD, claims do README ancorados em medicao, frontmatter.json corrigido, remocao de index.ts/stream.ts e dependencias vestigiais, main.py documentado como entrypoint API-only). As mudancas nao alteram os contratos que este registro atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-11-08-elevacao-dependencias-regex-e-laya
    caminhos:
      - pyproject.toml
      - requirements.txt
    parecer: "Revisado em 2026-11-17. Fases 0-1 da auditoria SOTA do projeto: portoes de verificacao tornados reais (Pyright em python:typecheck e no quality-gate do cloudbuild.backend.yaml, Jest incluido no job frontend do sota-ci.yml), sincronizacao requirements.txt x pyproject.toml com guarda executavel tests/test_requirements_sync.py, higiene documento-real (.gitignore e pyproject.toml em v8.0 GOLD, claims do README ancorados em medicao, frontmatter.json corrigido, remocao de index.ts/stream.ts e dependencias vestigiais, main.py documentado como entrypoint API-only). As mudancas nao alteram os contratos que este registro atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-11-08-refinamento-sonarlint-e-code-review-triage
    caminhos:
      - package.json
    parecer: "Revisado em 2026-11-17. Fases 0-1 da auditoria SOTA do projeto: portoes de verificacao tornados reais (Pyright em python:typecheck e no quality-gate do cloudbuild.backend.yaml, Jest incluido no job frontend do sota-ci.yml), sincronizacao requirements.txt x pyproject.toml com guarda executavel tests/test_requirements_sync.py, higiene documento-real (.gitignore e pyproject.toml em v8.0 GOLD, claims do README ancorados em medicao, frontmatter.json corrigido, remocao de index.ts/stream.ts e dependencias vestigiais, main.py documentado como entrypoint API-only). As mudancas nao alteram os contratos que este registro atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-11-08-saneamento-code-review-triage
    caminhos:
      - package.json
    parecer: "Revisado em 2026-11-17. Fases 0-1 da auditoria SOTA do projeto: portoes de verificacao tornados reais (Pyright em python:typecheck e no quality-gate do cloudbuild.backend.yaml, Jest incluido no job frontend do sota-ci.yml), sincronizacao requirements.txt x pyproject.toml com guarda executavel tests/test_requirements_sync.py, higiene documento-real (.gitignore e pyproject.toml em v8.0 GOLD, claims do README ancorados em medicao, frontmatter.json corrigido, remocao de index.ts/stream.ts e dependencias vestigiais, main.py documentado como entrypoint API-only). As mudancas nao alteram os contratos que este registro atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-11-09-elevacao-dependencias-e-fork-eigen
    caminhos:
      - package-lock.json
      - package.json
      - pyproject.toml
      - requirements.txt
    parecer: "Revisado em 2026-11-17. Fases 0-1 da auditoria SOTA do projeto: portoes de verificacao tornados reais (Pyright em python:typecheck e no quality-gate do cloudbuild.backend.yaml, Jest incluido no job frontend do sota-ci.yml), sincronizacao requirements.txt x pyproject.toml com guarda executavel tests/test_requirements_sync.py, higiene documento-real (.gitignore e pyproject.toml em v8.0 GOLD, claims do README ancorados em medicao, frontmatter.json corrigido, remocao de index.ts/stream.ts e dependencias vestigiais, main.py documentado como entrypoint API-only). As mudancas nao alteram os contratos que este registro atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-11-10-ai-sdk-google-4-0-117-ai-7-0-169
    caminhos:
      - package-lock.json
      - package.json
    parecer: "Revisado em 2026-11-17. Fases 0-1 da auditoria SOTA do projeto: portoes de verificacao tornados reais (Pyright em python:typecheck e no quality-gate do cloudbuild.backend.yaml, Jest incluido no job frontend do sota-ci.yml), sincronizacao requirements.txt x pyproject.toml com guarda executavel tests/test_requirements_sync.py, higiene documento-real (.gitignore e pyproject.toml em v8.0 GOLD, claims do README ancorados em medicao, frontmatter.json corrigido, remocao de index.ts/stream.ts e dependencias vestigiais, main.py documentado como entrypoint API-only). As mudancas nao alteram os contratos que este registro atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-11-10-bump-deps-e-extra-paths-pylance
    caminhos:
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Fases 0-1 da auditoria SOTA do projeto: portoes de verificacao tornados reais (Pyright em python:typecheck e no quality-gate do cloudbuild.backend.yaml, Jest incluido no job frontend do sota-ci.yml), sincronizacao requirements.txt x pyproject.toml com guarda executavel tests/test_requirements_sync.py, higiene documento-real (.gitignore e pyproject.toml em v8.0 GOLD, claims do README ancorados em medicao, frontmatter.json corrigido, remocao de index.ts/stream.ts e dependencias vestigiais, main.py documentado como entrypoint API-only). As mudancas nao alteram os contratos que este registro atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-11-10-google-genai-3-1-0
    caminhos:
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Fases 0-1 da auditoria SOTA do projeto: portoes de verificacao tornados reais (Pyright em python:typecheck e no quality-gate do cloudbuild.backend.yaml, Jest incluido no job frontend do sota-ci.yml), sincronizacao requirements.txt x pyproject.toml com guarda executavel tests/test_requirements_sync.py, higiene documento-real (.gitignore e pyproject.toml em v8.0 GOLD, claims do README ancorados em medicao, frontmatter.json corrigido, remocao de index.ts/stream.ts e dependencias vestigiais, main.py documentado como entrypoint API-only). As mudancas nao alteram os contratos que este registro atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-11-10-lock-bundle-analyzer-16-4-6
    caminhos:
      - package-lock.json
    parecer: "Revisado em 2026-11-17. Fases 0-1 da auditoria SOTA do projeto: portoes de verificacao tornados reais (Pyright em python:typecheck e no quality-gate do cloudbuild.backend.yaml, Jest incluido no job frontend do sota-ci.yml), sincronizacao requirements.txt x pyproject.toml com guarda executavel tests/test_requirements_sync.py, higiene documento-real (.gitignore e pyproject.toml em v8.0 GOLD, claims do README ancorados em medicao, frontmatter.json corrigido, remocao de index.ts/stream.ts e dependencias vestigiais, main.py documentado como entrypoint API-only). As mudancas nao alteram os contratos que este registro atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-11-11-elevacao-fastapi-playwright-e-bump-deep-research
    caminhos:
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Fases 0-1 da auditoria SOTA do projeto: portoes de verificacao tornados reais (Pyright em python:typecheck e no quality-gate do cloudbuild.backend.yaml, Jest incluido no job frontend do sota-ci.yml), sincronizacao requirements.txt x pyproject.toml com guarda executavel tests/test_requirements_sync.py, higiene documento-real (.gitignore e pyproject.toml em v8.0 GOLD, claims do README ancorados em medicao, frontmatter.json corrigido, remocao de index.ts/stream.ts e dependencias vestigiais, main.py documentado como entrypoint API-only). As mudancas nao alteram os contratos que este registro atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-11-11-elevacao-pypdf-turbo-ai-sdk-google
    caminhos:
      - package-lock.json
      - package.json
      - pyproject.toml
      - requirements.txt
    parecer: "Revisado em 2026-11-17. Fases 0-1 da auditoria SOTA do projeto: portoes de verificacao tornados reais (Pyright em python:typecheck e no quality-gate do cloudbuild.backend.yaml, Jest incluido no job frontend do sota-ci.yml), sincronizacao requirements.txt x pyproject.toml com guarda executavel tests/test_requirements_sync.py, higiene documento-real (.gitignore e pyproject.toml em v8.0 GOLD, claims do README ancorados em medicao, frontmatter.json corrigido, remocao de index.ts/stream.ts e dependencias vestigiais, main.py documentado como entrypoint API-only). As mudancas nao alteram os contratos que este registro atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-11-11-elevacao-sentence-transformers-genai-prettier-exa-mcp
    caminhos:
      - package-lock.json
      - package.json
      - pyproject.toml
      - requirements.txt
    parecer: "Revisado em 2026-11-17. Fases 0-1 da auditoria SOTA do projeto: portoes de verificacao tornados reais (Pyright em python:typecheck e no quality-gate do cloudbuild.backend.yaml, Jest incluido no job frontend do sota-ci.yml), sincronizacao requirements.txt x pyproject.toml com guarda executavel tests/test_requirements_sync.py, higiene documento-real (.gitignore e pyproject.toml em v8.0 GOLD, claims do README ancorados em medicao, frontmatter.json corrigido, remocao de index.ts/stream.ts e dependencias vestigiais, main.py documentado como entrypoint API-only). As mudancas nao alteram os contratos que este registro atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-11-11-elevacao-typer-types-knip-harmonizacao
    caminhos:
      - package-lock.json
      - package.json
      - pyproject.toml
      - requirements.txt
    parecer: "Revisado em 2026-11-17. Fases 0-1 da auditoria SOTA do projeto: portoes de verificacao tornados reais (Pyright em python:typecheck e no quality-gate do cloudbuild.backend.yaml, Jest incluido no job frontend do sota-ci.yml), sincronizacao requirements.txt x pyproject.toml com guarda executavel tests/test_requirements_sync.py, higiene documento-real (.gitignore e pyproject.toml em v8.0 GOLD, claims do README ancorados em medicao, frontmatter.json corrigido, remocao de index.ts/stream.ts e dependencias vestigiais, main.py documentado como entrypoint API-only). As mudancas nao alteram os contratos que este registro atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-11-11-nota-pareamento-dev-dependency-groups
    caminhos:
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Fases 0-1 da auditoria SOTA do projeto: portoes de verificacao tornados reais (Pyright em python:typecheck e no quality-gate do cloudbuild.backend.yaml, Jest incluido no job frontend do sota-ci.yml), sincronizacao requirements.txt x pyproject.toml com guarda executavel tests/test_requirements_sync.py, higiene documento-real (.gitignore e pyproject.toml em v8.0 GOLD, claims do README ancorados em medicao, frontmatter.json corrigido, remocao de index.ts/stream.ts e dependencias vestigiais, main.py documentado como entrypoint API-only). As mudancas nao alteram os contratos que este registro atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-11-12-gitignore-claude-symlinks
    caminhos:
      - .gitignore
    parecer: "Revisado em 2026-11-17. Fases 0-1 da auditoria SOTA do projeto: portoes de verificacao tornados reais (Pyright em python:typecheck e no quality-gate do cloudbuild.backend.yaml, Jest incluido no job frontend do sota-ci.yml), sincronizacao requirements.txt x pyproject.toml com guarda executavel tests/test_requirements_sync.py, higiene documento-real (.gitignore e pyproject.toml em v8.0 GOLD, claims do README ancorados em medicao, frontmatter.json corrigido, remocao de index.ts/stream.ts e dependencias vestigiais, main.py documentado como entrypoint API-only). As mudancas nao alteram os contratos que este registro atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-11-12-gitignore-history-e-extensions
    caminhos:
      - .gitignore
    parecer: "Revisado em 2026-11-17. Fases 0-1 da auditoria SOTA do projeto: portoes de verificacao tornados reais (Pyright em python:typecheck e no quality-gate do cloudbuild.backend.yaml, Jest incluido no job frontend do sota-ci.yml), sincronizacao requirements.txt x pyproject.toml com guarda executavel tests/test_requirements_sync.py, higiene documento-real (.gitignore e pyproject.toml em v8.0 GOLD, claims do README ancorados em medicao, frontmatter.json corrigido, remocao de index.ts/stream.ts e dependencias vestigiais, main.py documentado como entrypoint API-only). As mudancas nao alteram os contratos que este registro atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-11-12-review-sweeps-endurecimento-sota
    caminhos:
      - package-lock.json
      - package.json
    parecer: "Revisado em 2026-11-17. Fases 0-1 da auditoria SOTA do projeto: portoes de verificacao tornados reais (Pyright em python:typecheck e no quality-gate do cloudbuild.backend.yaml, Jest incluido no job frontend do sota-ci.yml), sincronizacao requirements.txt x pyproject.toml com guarda executavel tests/test_requirements_sync.py, higiene documento-real (.gitignore e pyproject.toml em v8.0 GOLD, claims do README ancorados em medicao, frontmatter.json corrigido, remocao de index.ts/stream.ts e dependencias vestigiais, main.py documentado como entrypoint API-only). As mudancas nao alteram os contratos que este registro atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-11-13-elevacao-deps-e-saneamento-configs-ide
    caminhos:
      - package-lock.json
      - package.json
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Fases 0-1 da auditoria SOTA do projeto: portoes de verificacao tornados reais (Pyright em python:typecheck e no quality-gate do cloudbuild.backend.yaml, Jest incluido no job frontend do sota-ci.yml), sincronizacao requirements.txt x pyproject.toml com guarda executavel tests/test_requirements_sync.py, higiene documento-real (.gitignore e pyproject.toml em v8.0 GOLD, claims do README ancorados em medicao, frontmatter.json corrigido, remocao de index.ts/stream.ts e dependencias vestigiais, main.py documentado como entrypoint API-only). As mudancas nao alteram os contratos que este registro atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-11-13-revisao-ancora-pyproject-extra-path-cockpit
    caminhos:
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Fases 0-1 da auditoria SOTA do projeto: portoes de verificacao tornados reais (Pyright em python:typecheck e no quality-gate do cloudbuild.backend.yaml, Jest incluido no job frontend do sota-ci.yml), sincronizacao requirements.txt x pyproject.toml com guarda executavel tests/test_requirements_sync.py, higiene documento-real (.gitignore e pyproject.toml em v8.0 GOLD, claims do README ancorados em medicao, frontmatter.json corrigido, remocao de index.ts/stream.ts e dependencias vestigiais, main.py documentado como entrypoint API-only). As mudancas nao alteram os contratos que este registro atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-11-14-deps-refatoracoes-sonar-e-submodulos
    caminhos:
      - package-lock.json
      - package.json
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Fases 0-1 da auditoria SOTA do projeto: portoes de verificacao tornados reais (Pyright em python:typecheck e no quality-gate do cloudbuild.backend.yaml, Jest incluido no job frontend do sota-ci.yml), sincronizacao requirements.txt x pyproject.toml com guarda executavel tests/test_requirements_sync.py, higiene documento-real (.gitignore e pyproject.toml em v8.0 GOLD, claims do README ancorados em medicao, frontmatter.json corrigido, remocao de index.ts/stream.ts e dependencias vestigiais, main.py documentado como entrypoint API-only). As mudancas nao alteram os contratos que este registro atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-11-14-laya-pylint-e-refactors-sonar
    caminhos:
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Fases 0-1 da auditoria SOTA do projeto: portoes de verificacao tornados reais (Pyright em python:typecheck e no quality-gate do cloudbuild.backend.yaml, Jest incluido no job frontend do sota-ci.yml), sincronizacao requirements.txt x pyproject.toml com guarda executavel tests/test_requirements_sync.py, higiene documento-real (.gitignore e pyproject.toml em v8.0 GOLD, claims do README ancorados em medicao, frontmatter.json corrigido, remocao de index.ts/stream.ts e dependencias vestigiais, main.py documentado como entrypoint API-only). As mudancas nao alteram os contratos que este registro atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-11-14-roteamento-pools-transporte-e-validacao-hrc
    caminhos:
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Fases 0-1 da auditoria SOTA do projeto: portoes de verificacao tornados reais (Pyright em python:typecheck e no quality-gate do cloudbuild.backend.yaml, Jest incluido no job frontend do sota-ci.yml), sincronizacao requirements.txt x pyproject.toml com guarda executavel tests/test_requirements_sync.py, higiene documento-real (.gitignore e pyproject.toml em v8.0 GOLD, claims do README ancorados em medicao, frontmatter.json corrigido, remocao de index.ts/stream.ts e dependencias vestigiais, main.py documentado como entrypoint API-only). As mudancas nao alteram os contratos que este registro atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-11-14-sync-uvlock-ollama-cloud-circuit-e-ci
    caminhos:
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Fases 0-1 da auditoria SOTA do projeto: portoes de verificacao tornados reais (Pyright em python:typecheck e no quality-gate do cloudbuild.backend.yaml, Jest incluido no job frontend do sota-ci.yml), sincronizacao requirements.txt x pyproject.toml com guarda executavel tests/test_requirements_sync.py, higiene documento-real (.gitignore e pyproject.toml em v8.0 GOLD, claims do README ancorados em medicao, frontmatter.json corrigido, remocao de index.ts/stream.ts e dependencias vestigiais, main.py documentado como entrypoint API-only). As mudancas nao alteram os contratos que este registro atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-11-15-harmonizacao-sota-champions-seguranca
    caminhos:
      - .gitignore
    parecer: "Revisado em 2026-11-17. Fases 0-1 da auditoria SOTA do projeto: portoes de verificacao tornados reais (Pyright em python:typecheck e no quality-gate do cloudbuild.backend.yaml, Jest incluido no job frontend do sota-ci.yml), sincronizacao requirements.txt x pyproject.toml com guarda executavel tests/test_requirements_sync.py, higiene documento-real (.gitignore e pyproject.toml em v8.0 GOLD, claims do README ancorados em medicao, frontmatter.json corrigido, remocao de index.ts/stream.ts e dependencias vestigiais, main.py documentado como entrypoint API-only). As mudancas nao alteram os contratos que este registro atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-11-16-elevacao-deps-anthropic-laya-accelerate-e-deps-sync
    caminhos:
      - package.json
      - pyproject.toml
      - requirements.txt
    parecer: "Revisado em 2026-11-17. Fases 0-1 da auditoria SOTA do projeto: portoes de verificacao tornados reais (Pyright em python:typecheck e no quality-gate do cloudbuild.backend.yaml, Jest incluido no job frontend do sota-ci.yml), sincronizacao requirements.txt x pyproject.toml com guarda executavel tests/test_requirements_sync.py, higiene documento-real (.gitignore e pyproject.toml em v8.0 GOLD, claims do README ancorados em medicao, frontmatter.json corrigido, remocao de index.ts/stream.ts e dependencias vestigiais, main.py documentado como entrypoint API-only). As mudancas nao alteram os contratos que este registro atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
  - registro: registro-2026-11-17-elevacao-deps-google-genai-openai
    caminhos:
      - pyproject.toml
      - requirements.txt
    parecer: "Revisado em 2026-11-17. Fases 0-1 da auditoria SOTA do projeto: portoes de verificacao tornados reais (Pyright em python:typecheck e no quality-gate do cloudbuild.backend.yaml, Jest incluido no job frontend do sota-ci.yml), sincronizacao requirements.txt x pyproject.toml com guarda executavel tests/test_requirements_sync.py, higiene documento-real (.gitignore e pyproject.toml em v8.0 GOLD, claims do README ancorados em medicao, frontmatter.json corrigido, remocao de index.ts/stream.ts e dependencias vestigiais, main.py documentado como entrypoint API-only). As mudancas nao alteram os contratos que este registro atestou nos caminhos ancorados; onde o manifesto/lock foi tocado, a sincronizacao foi verificada por suite e guards executaveis."
---

# REGISTRO — Fases 0 e 1 da auditoria SOTA: portões de verificação reais e higiene documento↔real

## Contexto

Auditoria profissional em três frentes (governança/documentação, backend, frontend)
identificou um padrão transversal: **portão declarado ≠ portão executado** e
documento divergente do real. Este registro cobre a execução das Fases 0 e 1 do
plano aprovado pelo Tier 0, em um único commit de fase (o pre-commit do projeto é
pesado por desenho).

## O que mudou

### Fase 0 — portões de verificação

- `python:typecheck` em `package.json` executava `ruff check` — nome prometia
  Pyright. Agora executa `uv run --no-sync pyright --project pyproject.toml`
  (o flag `--project` é obrigatório: pyright puro na raiz captura o
  `pyrightconfig.json` do diretório pai `~/.gemini` e enumera projetos irmãos —
  medido: ~52.802 erros fora do escopo). Medido: 229 arquivos, 0 erros,
  0 warnings.
- `.github/workflows/sota-ci.yml`: step `npm run test` (Jest) adicionado ao job
  frontend. Baseline local medido antes: 111 suites / 743 testes, 0 falhas.
- `cloudbuild.backend.yaml`: quality-gate agora roda `pyright` e `pytest` antes
  do build Docker (o `docker-build` espera `pytest-gate` via `waitFor`).

### Fase 1 — higiene documento↔real

- `requirements.txt` sincronizado com `pyproject.toml` (5 pisos divergentes:
  fastapi, pydantic-settings, onnxruntime, playwright, regex) + guarda executável
  nova `tests/test_requirements_sync.py` (4 testes) impedindo reintrodução do
  drift.
- `.gitignore` e `pyproject.toml`: cabeçalhos de protocolo unificados em
  SOTA v8.0 GOLD (estavam v7.0 e "SOTA v2").
- `README.md`: claims não medidos corrigidos — "95% de cobertura" virou o gate
  real (`--cov-fail-under=10`); throughput 54.7k/s etiquetado como medição
  histórica com link ao checkpoint; "100% blindado" substituído por descrição
  factual.
- `frontmatter.json`: `pageFolders` apontavam para pastas sem Markdown; agora
  `frontend/src/content` e `docs`.
- `index.ts` e `stream.ts` (experimentos AI SDK órfãos na raiz) removidos;
  4 dependências vestigiais do `package.json` raiz removidas (o frontend tem as
  suas próprias); `package-lock.json` sincronizado (−9 pacotes).
- `main.py` documentado como entrypoint API-only local (:17042); a stack
  completa (worker + API + watchdog) é `core/runtime.py`, usada pelo Docker.

## Evidências medidas

- Pyright: 229 arquivos, 0 erros, 0 warnings.
- Jest: 111 suites / 743 testes PASS em ~12 s.
- `pytest tests/test_requirements_sync.py`: 4/4 PASS.
- `ruff` nos arquivos tocados: limpo.
- `actionlint` no workflow e parse YAML do cloudbuild: válidos.
- `sota:audit` (CWV/a11y/CVE/SRI/higiene): todos os gates verdes após warmup
  pelo lifecycle script (LCP 563 ms, CLS ~0.0001, TBT 32 ms, TTFB 119 ms,
  heap 20 MB, axe 0 violações, CVEs 0).
- `suite_verde.py` no pre-commit: 100% da suíte pytest sob 6 workers.

## Não verificado / limites

- O pipeline `cloudbuild.backend.yaml` só será exercido de fato no próximo
  deploy real; a receita de comandos é a mesma validada no GH CI e localmente.
- `main.py` × `core/runtime.py` foram documentados, não unificados — unificação
  é mudança de comportamento fora do escopo desta fase.
- Fases 2–5 do plano (frontend estrutural, backend estrutural, governança
  canônica, evolução das forças) permanecem planejadas e não executadas.

## Revisões de âncora

67 registros históricos vigentes declaram `caminhos:` que este commit toca
(`pyproject.toml`, `requirements.txt`, `package.json`, `package-lock.json`,
`.gitignore`, `.github/workflows/sota-ci.yml`, `README.md`, `main.py`). Todos
reconciliados neste mesmo commit via `revisoes_de_ancora` no frontmatter —
a via prevista pelo portão para auditoria central, sem reescrever registros
históricos.

## Arquivos removidos citados historicamente

`index.ts` e `stream.ts` existiam na raiz como experimentos avulsos de AI SDK,
sem consumidor no build nem no runtime. A remoção é declarada aqui para que
citações históricas a esses caminhos não sejam lidas como perda acidental.
