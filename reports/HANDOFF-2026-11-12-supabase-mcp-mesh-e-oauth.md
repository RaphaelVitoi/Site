---
id: handoff-2026-11-12-supabase-mcp-e-oauth-encerramento
tipo: handoff
escopo: >-
  "Fechamento da sessao 2026-11-12: provider Ollama Cloud, re-auth OAuth
  (ADC+Supabase) com escopos reduzidos, PAT SUPABASE_ACCESS_TOKEN,
  supabase-write nos 4 clientes MCP, Supabase SSR no frontend, deps de teste
  pmev/monitoring"
alvo: Site + ecossistema ~/.gemini
status: ativo
autor: Devin (SWE-2 Flash) [Tier 1]
criado_em: "2026-11-12"
verificado:
  - "Site master d8036def pushed; extension sota-chrome-cockpit 394d4d6 (repo
    local sem remote)"
  - "Portoes CWV/a11y/CVE/SRI/higiene + suite pytest verdes; 0 pendencias
    abertas no corpus"
  - "ADC gcloud: tokeninfo confirma openid/email/userinfo.email/cloud-platform
    -- sqlservice.login removido"
  - "Supabase read_only: re-consent feito; tools/list mostra 13 tools sem
    escrita; Management API 200"
  - "SUPABASE_ACCESS_TOKEN (PAT) em HKCU+HKLM; GET /v1/projects -> 200; projeto
    ACTIVE_HEALTHY"
  - "supabase-write registrado em config/, antigravity/, .codex/ e Devin user
    config (OAuth granular)"
  - "frontend Supabase SSR: envs + server.ts (PUBLISHABLE_KEY c/ fallback
    ANON_KEY) + client.ts; tsc+eslint limpos"
  - "polars 2.1.0 + prometheus-client 0.26.0 instalados;
    test_pmev_engines_consumption 5/5 passed, 0 skips"
nao_verificado:
  - "inferencia real Ollama Cloud -- HTTP 402 billing (ver pendencia abaixo)"
  - "string literal de escopo do grant Supabase -- token opaco; narrowing
    inferido por vendor doc + probes"
  - "supabase-write em sessao Devin nova -- tools carregam no start; primeira
    chamada real nao exercitada"
pendencias:
  - id: pend-2026-11-12-ollama-cloud-credits
    o_que: >-
      Adicionar creditos de uso ou atualizar metodo de pagamento em
      https://ollama.com/settings -- conta autentica (nao e 401) mas retorna
      HTTP 402 'usage credits auto reload payment failed' em /api/chat. Provider
      ollama esta integrado e roteado (glm-5.3-flash, ollama/*); basta re-testar
      call_ollama_cloud apos o billing.
    dono: Tier 0
    prazo: "2026-11-26"
referencias:
  - registro: reports/REGISTRO-2026-11-12-ollama-cloud-provider.md
  - registro: reports/REGISTRO-2026-11-12-reauth-oauth-scopes-medicao.md
  - registro: reports/REGISTRO-2026-11-12-reauth-oauth-scopes-encerramento.md
  - registro: reports/REGISTRO-2026-11-12-gitignore-claude-symlinks.md
  - auditoria: ~/.gemini/reports/saude_mcp/auditoria_oauth_onda3.md
---

# HANDOFF — Supabase MCP mesh, OAuth reduzido e fecho de sessao (2026-11-12)

## Estado final da malha de credenciais

| Credencial                  | Escopo/Estado                                                    | Onde vive                                                     |
| --------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------- |
| ADC gcloud                  | openid+email+userinfo+cloud-platform (sqlservice.login REMOVIDO) | `%APPDATA%\gcloud\application_default_credentials.json`       |
| Supabase OAuth read-only    | escopos narrowed (read_only=true na URL)                         | `antigravity/mcp_oauth_tokens.json` + `.mcp-auth` por cliente |
| SUPABASE_ACCESS_TOKEN (PAT) | account-wide, nao expira                                         | HKCU + HKLM `Environment`                                     |
| supabase-write Devin        | OAuth granular (projects/database/edge_functions/storage write)  | `%APPDATA%\devin\mcp_config.json` + credentials store         |
| OLLAMA_API_KEY / HF_TOKEN   | providers ollama + HF hub                                        | HKCU `Environment`                                            |
| EXA_API_KEY                 | busca Exa do orchestrator                                        | HKCU `Environment`                                            |

## Backups e reversao

- `~/.gemini/remediacao_backup_aplicado/oauth-supabase-reset-20261112-115459/` —
  tokens OAuth antigos (workspace:admin).
- `~/.gemini/remediacao_backup_aplicado/oauth-tokens-vivos-*/` — store
  Supabase + ADC pos-re-auth.
- `.mcp-auth/_orfaos_onda3_20261111/` — JWTs workspace:admin quarentenados.

## Commits da sessao (Site)

`91c23e8e` provider Ollama Cloud · `9b8a814c` pendencia key-pools · `37af7927`
medicao OAuth · `c985655b` encerramento OAuth · `e4e2eb18` Supabase SSR frontend
· `d8036def` gitignore symlinks. Extensao cockpit: `394d4d6` (repo local).

## Unica pendencia viva

`pend-2026-11-12-ollama-cloud-credits` — billing Ollama Cloud (402). Todo o
resto: zero pendencias abertas, zero sinais de saude.
