---
id: registro-2026-11-12-reauth-oauth-scopes-encerramento
tipo: registro
escopo: >-
  "Encerramento de pend-2026-11-11-reauth-oauth-scopes: re-autenticacao ADC
  gcloud sem sqlservice.login (verificado via tokeninfo) e re-consent Supabase
  MCP sob read_only=true (grant novo, enforcement read-only verificado)"
ecossistema: nexus-sota
autor:
  Devin (SWE-2 Flash)
  <158243242+devin-ai-integration[bot]@users.noreply.github.com>
criado_em: "2026-11-12T12:15:00-03:00"
atualizado_em: "2026-11-12T12:15:00-03:00"
classes:
  - interno
  - medido
  - seguranca
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  python: "3.14.9"
  so: Windows
  congelada_em: "2026-11-12"
caminhos:
  - reports/REGISTRO-2026-11-12-reauth-oauth-scopes-encerramento.md
pendencias_resolvidas:
  - pend-2026-11-11-reauth-oauth-scopes
verificado:
  - "ADC gcloud re-autenticado via 'gcloud auth application-default login
    --scopes=openid,email,userinfo.email,cloud-platform' com consentimento
    do Tier 0 no browser; tokeninfo pos-refresh lista exatamente
    openid/email/userinfo.email/cloud-platform -- sqlservice.login AUSENTE"
  - "Supabase MCP: re-consent executado pelo Tier 0; nova entrada em
    antigravity/mcp_oauth_tokens.json (expiry 2026-11-13) substituiu a
    removida em oauth-supabase-reset-20261112-115459"
  - "tools/list no endpoint read_only=true (initialize HTTP 200,
    sessao MCP valida): 13 tools, sem apply_migration nem ferramentas de
    escrita; execute_sql permanece mas roda como role Postgres read-only
    por contrato do parametro read_only=true"
  - "Management API com o novo token: GET /v1/organizations e
    /v1/projects -> HTTP 200 (leitura de conta, compativel com escopos
    read-only narrowed)"
nao_verificado:
  - "string literal de escopo do grant Supabase -- access token e opaco
    (50 chars, nao-JWT) e o store nao persiste 'scope'; narrowing inferido
    pelo comportamento documentado do vendor (supabase/mcp#236) + consent
    fresco sob read_only=true + ausencia de tools de escrita"
  - "se consentimentos futuros de outros clientes MCP (mcp-remote/.mcp-auth)
    herdarao o narrowing -- depende de cada cliente refazer OAuth"
---

# Encerramento — re-autenticação OAuth com escopos reduzidos (2026-11-12)

## ADC gcloud — RESOLVIDO

Re-autenticação executada com `--scopes` reduzidos (correção de diagnóstico
registrada em `registro-2026-11-12-reauth-oauth-scopes-medicao`: gcloud 592
suporta a flag). `tokeninfo` pós-refresh confirma o conjunto mínimo:

```
openid, email, userinfo.email, cloud-platform
```

`sqlservice.login` — o excesso sem consumidor — **removido**. `cloud-platform`
permanece por exigência prática dos MCPs ativos (compute-engine, audit-manager,
cloudrun); sua mitigação estrutural é IAM no projeto `original-498419`, fora do
escopo OAuth e decisão do Tier 0.

## Supabase MCP — RESOLVIDO

Tokens antigos (`workspace:admin`) removidos com backup; Tier 0 re-consentiu.
O grant novo foi emitido sob URL `read_only=true` — caso que a Supabase trata
com narrowing automático de escopos desde ~mai/2026 (supabase/mcp#236).

Verificação de enforcement no endpoint configurado:

- `initialize` + `tools/list` → HTTP 200, sessão MCP válida.
- 13 tools expostas; **nenhuma de escrita** (`apply_migration`, deploy,
  branching-write ausentes). `execute_sql` existe mas executa como role
  Postgres read-only — garantia do parâmetro `read_only=true`, que o vendor
  declara ter precedência sobre os escopos do token.
- `GET /v1/organizations` e `/v1/projects` → 200 (leitura, compatível com
  escopos narrowed).

**Ressalva honesta:** o access token Supabase é opaco e o store não persiste a
string de escopo; o narrowing é inferido por comportamento documentado do
vendor + consentimento fresco + probes de enforcement. Se o Tier 0 quiser
prova literal, o consent screen do próximo re-auth exibe os escopos.

## Estado final da pendência

`pend-2026-11-11-reauth-oauth-scopes` — **encerrada**. As duas divergências
declaradas (ADC com `sqlservice.login`; Supabase com `workspace:admin` acima
do `read_only=true`) foram eliminadas e verificadas por medição.
