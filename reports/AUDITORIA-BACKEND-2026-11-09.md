---
id: auditoria-backend-2026-11-09
tipo: auditoria
escopo: Site
ecossistema: nexus-sota
autor: Gemini 4 Argon
criado_em: '2026-11-09T03:00:00-03:00'
atualizado_em: '2026-11-09T03:00:00-03:00'
classes:
  - interno
  - medido
  - governanca
  - backend
caminhos:
  - reports/AUDITORIA-BACKEND-2026-11-09.md
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  host: Windows 11
  data_das_medicoes: '2026-11-09'
verificado:
  - backend aiohttp integro na porta 17042 com /ping e /health respondendo 200
  - testes de hardening e seguranca passando com zero erros
nao_verificado:
  - execucao em producao conteinerizada sob Cloud Run
---

# Auditoria de Backend — 2026-11-09 (corrigida)

## Escopo
Backend Python/aiohttp do projeto Site (`api/v1`, `database`, `core`, `llm`), incluindo integridade de dependencias, testes de hardening e smoke de runtime.

## Verificacoes executadas
- `ruff check .` — sem erros.
- `uv pip check` — 242 pacotes compativeis.
- `pip audit` — 5 vulnerabilidades conhecidas em `chromadb 1.5.9` (PYSEC-2026-311/3813/3814/3815), todas aceitas por arquitetura (somente `PersistentClient`, sem servidor HTTP).
- Testes focados: `test_auditoria_backend_2026_09_16`, `test_auditoria_backend_remediation_2026_10`, `test_backend_hardening`, `test_security_sanitization`, `test_middleware_correlation`, `test_db_summary_contrato` — todos verdes.
- Smoke de runtime: backend iniciado em `127.0.0.1:17042`; `/`, `/ping`, `/health` responderam 200; `/metrics`, `/db-summary`, `/system-status` protegidos por auth (401 sem token).
- `queue/tasks.db`: tabelas presentes, 29 tasks.

## Correcoes aplicadas
- `.env` e `.env.example`: adicionados `SUPABASE_JWT_ISSUER=supabase` e `SUPABASE_JWT_AUDIENCE=authenticated` (SEC-05).
- Relatorio de auditoria atualizado.

## Achados residuais
1. `SUPABASE_JWT_SECRET` segue dependente do ambiente/registro; fail-closed preservado.
2. Porta 8080 pertence ao Strata LLM, nao ao backend Nexus; backend canonico = 17042.
3. Vulnerabilidades chromadb permanecem no radar; manter proibicao de `HttpClient`/`chroma run`.

## Status
Homeostase aprovada para o backend auditado. Nenhuma regressao funcional detectada.