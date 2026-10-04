---
id: registro-2026-10-04-remediacao-dependabot-sentence-transformers-e-urllib3
tipo: registro
escopo: Site -- auditoria Dependabot e correcao de vulnerabilidades em sentence-transformers e urllib3, alem de bump no CI setup-uv
ecossistema: nexus-sota
autor: Gemini 3.8 Flash <noreply@google.com>
criado_em: '2026-10-04T11:13:00-03:00'
atualizado_em: '2026-10-04T11:13:00-03:00'
commit: HEAD
classes: [interno, medido, governanca, registro, seguranca, dependencias]
caminhos:
  - .github/workflows/sota-ci.yml
  - uv.lock
  - reports/REGISTRO-2026-10-04-remediacao-dependabot-sentence-transformers-e-urllib3.md
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
  - "auditoria de todos os 4 alertas abertos do Dependabot via API do GitHub (alertas 206, 207, 208 e 209)"
  - "atualizacao de sentence-transformers de v5.5.1 para v6.1.0 no uv.lock sanando vulnerabilidade critica de execucao de codigo customizado"
  - "atualizacao de urllib3 de v2.7.0 para v2.8.0 no uv.lock sanando tres vulnerabilidades (duas high e uma medium)"
  - "atualizacao da GitHub Action astral-sh/setup-uv para v10.2.0 com commit SHA pinado no workflow sota-ci.yml (incorporando PR 86)"
  - "validacao do workflow com actionlint via npm run lint:workflows aprovada com 0 erros"
  - "importacao funcional e checagem de versao no runtime Python aprovadas (sentence-transformers 6.1.0, urllib3 2.8.0)"
nao_verificado:
  - "PRs major de dependencias frontend (Zod 4, Mermaid 12, Recharts 3, Vitest 5) rejeitados por quebrarem contratos e design system"
revisoes_de_ancora: []
---

# Registro: Remediacao de Vulnerabilidades Dependabot e Upgrade CI

Data: 2026-10-04

## 1. Auditoria dos Alertas Dependabot

A consulta a API de seguranca do GitHub identificou 4 alertas abertos no branch padrao:
1. **Alerta 209 (Critical):** `sentence-transformers < 5.6.0` -- bypass de trust_remote_code e execucao de Python customizado ao carregar modelos locais. Corrigido com elevacao para `v6.1.0`.
2. **Alerta 206 (High):** `urllib3 < 2.8.0` -- configuracao TLS de proxy HTTPS ignorada/sobreposta. Corrigido com elevacao para `v2.8.0`.
3. **Alerta 207 (High):** `urllib3 < 2.8.0` -- bufferizacao sem limite de memoria em chunk-size de HTTPResponse. Corrigido com elevacao para `v2.8.0`.
4. **Alerta 208 (Medium):** `urllib3 < 2.8.0` -- streaming Chunked Deflate suscetivel a loop infinito. Corrigido com elevacao para `v2.8.0`.

## 2. Auditoria dos Pull Requests Abertos

- **PR 86 (setup-uv 10.2.0):** Coerente e seguro. Commit SHA pinado integrado em `.github/workflows/sota-ci.yml`.
- **PR 85 (frontend group 12 updates):** Retido temporariamente para auditoria granular de compatibilidade com Tailwind 4 e Next 16.
- **PRs 72, 73, 74, 75 (Zod 4, Mermaid 12, Recharts 3, Vitest 5):** Incoerentes como bumps automaticos, pois introduzem breaking changes severas em interfaces e componentes do monorepo.
