---
id: registro-2026-10-04-remediacao-dependabot-pypdf
tipo: registro
escopo: Site -- correcao de vulnerabilidades Dependabot em pypdf e definicao de pisos seguros em pyproject.toml
ecossistema: nexus-sota
autor: Gemini 3.8 Flash <noreply@google.com>
criado_em: '2026-10-04T11:27:00-03:00'
atualizado_em: '2026-10-04T11:27:00-03:00'
commit: HEAD
classes: [interno, medido, governanca, registro, seguranca, dependencias]
caminhos:
  - pyproject.toml
  - uv.lock
  - reports/REGISTRO-2026-10-04-remediacao-dependabot-pypdf.md
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  session_id: ea0abaa9-1d99-4dbb-9e9c-f1320fa85264
  session_started_at: '2026-10-04T11:06:00-03:00'
  condutor: Gemini 3.8 Flash <noreply@google.com>
  modelo: gemini-3.8-flash
  veiculo: antigravity
  tier: 1
  supervisao: assistida
  data_das_medicoes: 2026-10-04
verificado:
  - "auditoria de novos alertas 211 a 218 do Dependabot para pypdf (< 6.19.0)"
  - "atualizacao de pypdf de v6.16.1 para v6.19.0 no uv.lock e sincronizacao no venv"
  - "definicao formal de pisos seguros no pyproject.toml para sentence-transformers (>=5.6.0) e pypdf (>=6.19.0,<7.0.0)"
  - "bateria de testes de integridade de ingestao de documentos (test_skill_pmev_knowledge e test_backend_hardening) aprovada com 56 passed, 0 erros e 0 warnings"
nao_verificado:
  - "PRs major de dependencias frontend (Zod 4, Mermaid 12, Recharts 3, Vitest 5) rejeitados por quebrarem contratos e design system"
revisoes_de_ancora:
  - registro: registro-2026-10-04-remediacao-dependabot-sentence-transformers-e-urllib3
    caminhos:
      - uv.lock
    parecer: "Revisao de ancora de uv.lock decorrente da atualizacao subsequente de pypdf v6.16.1 para v6.19.0 sanando alertas Dependabot 211-218"
---

# Registro: Remediacao de Vulnerabilidades Dependabot em pypdf e Pisos Seguros

Data: 2026-10-04

## 1. Contexto

Apos a publicacao do commit ab39bc75 no branch master, o reprocessamento da arvore de dependencias pelo GitHub detectou vulnerabilidades historicas do pypdf (< 6.19.0) catalogadas nos alertas 211 a 218:
- Alertas 211 a 218: Riscos de DoS (long runtimes) e alto consumo de memoria em parsers de fontes, indirect objects e fluxos FlateDecode malformados.
- Versao corrigida recomendada pelo aviso de seguranca: 6.19.0.

## 2. Acoes Executadas

1. **Atualizacao no uv.lock:**
   `uv lock --upgrade-package pypdf` elevou `pypdf` de `6.16.1` para `6.19.0`.
   Ambiente sincronizado via `uv sync`.

2. **Fortalecimento de Pisos em pyproject.toml:**
   - `sentence-transformers>=5.6.0` (garantindo prevencao a GHSA-jhr6-gm9c-rqjv em qualquer instalacao direta).
   - `pypdf>=6.19.0,<7.0.0` (garantindo prevencao a GHSA-265f-4x97-w84f / alertas 211-218).

3. **Validacao de Regressao:**
   - 56 testes executados via pytest cobrindo leitura de PDFs corrompidos, ingestao e manipulacao segura.
   - Resultado: 56 passed, 0 erros, 0 warnings.
