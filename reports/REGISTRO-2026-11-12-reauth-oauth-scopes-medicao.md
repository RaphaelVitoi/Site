---
id: registro-2026-11-12-reauth-oauth-scopes-medicao
tipo: registro
escopo: >-
  "Medicao de escopos OAuth vigentes (ADC gcloud + Supabase MCP) contra a
  pendencia pend-2026-11-11-reauth-oauth-scopes; correcao de diagnostico da
  auditoria onda3 (gcloud ADC aceita --scopes; Supabase estreita escopos
  automaticamente quando read_only=true na URL); reset dos tokens Supabase com
  backup para forcar re-consentimento"
ecossistema: nexus-sota
autor:
  Devin (SWE-2 Flash)
  <158243242+devin-ai-integration[bot]@users.noreply.github.com>
criado_em: "2026-11-12T11:55:00-03:00"
atualizado_em: "2026-11-12T11:55:00-03:00"
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
  - reports/REGISTRO-2026-11-12-reauth-oauth-scopes-medicao.md
pendencias_resolvidas: []
verificado:
  - "ADC gcloud: refresh real + tokeninfo em 2026-11-12 -- escopos
    openid/email/userinfo.email/cloud-platform/sqlservice.login, identicos a
    auditoria onda3"
  - "gcloud 592.0.0: 'gcloud auth application-default login --help' confirma
    flag --scopes -- corrige diagnostico da auditoria onda3"
  - "3 configs MCP vivos usam URL Supabase com read_only=true; rollout de
    narrowing de escopos confirmado em supabase/mcp issue #236"
  - "reset executado: 2 entradas Supabase removidas de
    antigravity/mcp_oauth_tokens.json (restam 8); 2 arquivos .mcp-auth Supabase
    movidos p/ quarentena; backup em
    remediacao_backup_aplicado/oauth-supabase-reset-20261112-115459"
nao_verificado:
  - "novo escopo do grant Supabase pos re-consent -- depende de acao interativa
    do Tier 0 no browser; verificar ausencia de workspace:admin"
  - "ADC re-autenticado com --scopes -- comando entregue ao Tier 0; verificar
    tokeninfo sem sqlservice.login apos execucao"
---

# Registro — medição e preparação da re-auth OAuth (pend-2026-11-11)

## 1. O que foi medido (read-only, sem segredos impressos)

### ADC gcloud (`%APPDATA%\gcloud\application_default_credentials.json`)

Refresh real do `refresh_token` + `tokeninfo` (2026-11-12 ~11:50 -03:00):

```
openid
email
https://www.googleapis.com/auth/userinfo.email
https://www.googleapis.com/auth/cloud-platform
https://www.googleapis.com/auth/sqlservice.login
```

**Idêntico à auditoria onda3 de 2026-11-11** — nenhuma mudança espontânea. Conta
`raphavitoi@gmail.com`, `quota_project_id=original-498419`.

### Supabase MCP

- Os 3 configs vivos (`config/mcp_config.json`, `antigravity/mcp_config.json`,
  `.codex/config.toml`) usam a URL
  `https://mcp.supabase.com/mcp?project_ref=pbgktpltovmgjzqksxit&read_only=true&features=...`.
- Store `antigravity/mcp_oauth_tokens.json`: 2 entradas Supabase (URL base e URL
  `read_only=true`), access tokens opacos, `client_secret` presente em ambos. O
  token da URL `read_only=true` foi **rotacionado hoje** (expiry
  2026-11-12T19:35-03:00) — refresh automático **não altera escopo**; só
  re-consentimento altera.
- `.mcp-auth/mcp-remote-v1/`: 2 arquivos de token com JWTs
  `workspace:admin offline_access` (access tokens expirados ago–out/2026,
  refresh tokens potencialmente vivos).

## 2. Correções ao diagnóstico da auditoria onda3

1. **`gcloud auth application-default login` aceita `--scopes`** (verificado em
   `gcloud --version` 592.0.0 e `--help`). A afirmação "não há granularidade
   menor disponível por esse fluxo" estava incorreta. É possível re-autenticar o
   ADC sem `sqlservice.login`.
2. **Supabase estreita escopos automaticamente no consentimento** quando a URL
   contém `read_only=true` — rollout confirmado pelo maintainer (supabase/mcp
   issue #236, fechada em 2026-07-14). O grant atual é anterior a essa proteção;
   re-consentimento produz grant read-only sem configuração extra.

## 3. Ações executadas nesta sessão

- Backup em
  `~/.gemini/remediacao_backup_aplicado/oauth-supabase-reset-20261112-115459/`
  de `mcp_oauth_tokens.json` e dos 2 tokens `.mcp-auth` Supabase.
- Removidas as **2 entradas Supabase** de
  `~/.gemini/antigravity/mcp_oauth_tokens.json` (restam 8 entradas de outros
  servidores).
- Movidos para quarentena `~/.mcp-auth/_orfaos_onda3_20261111/` os 2 arquivos
  `4a30049c…` e `c3007512…` (JWTs `workspace:admin`).
- Nenhum segredo impresso, copiado para o repo ou persistido em texto claro.

**Efeito:** na próxima conexão do MCP Supabase, o cliente não encontra token e
refaz o fluxo OAuth — o consentimento sairá com escopos read-only
(`read_only=true` está na URL configurada nos 3 clientes).

## 4. Ações pendentes do Tier 0 (interativas, navegador)

### 4.1 Supabase — re-consentir

1. Reiniciar a IDE/sessão para o MCP Supabase reconectar.
2. No prompt OAuth do Supabase, aprovar — o grant deve sair read-only.
3. Verificação pós-consent (read-only): decodificar o novo JWT em
   `.mcp-auth`/`mcp_oauth_tokens.json` e confirmar ausência de
   `workspace:admin`.

### 4.2 ADC gcloud — re-autenticar sem `sqlservice.login`

```powershell
gcloud auth application-default login `
  --scopes=openid,email,https://www.googleapis.com/auth/userinfo.email,https://www.googleapis.com/auth/cloud-platform
```

Mantém `cloud-platform` (exigido na prática pelos MCPs compute-engine,
audit-manager e cloudrun — escopo por-serviço não é confiável para esses
endpoints). Remove `sqlservice.login`, único excesso com consumidor nulo
confirmado. A mitigação estrutural de `cloud-platform` segue sendo IAM no
projeto `original-498419` — decisão de infra do Tier 0, fora do escopo OAuth.

### 4.3 Encerramento da pendência

`pend-2026-11-11-reauth-oauth-scopes` **permanece aberta** até que:

- o re-consent Supabase ocorra e o novo escopo seja verificado (sem
  `workspace:admin`); e
- o ADC seja re-autenticado com `--scopes` e `tokeninfo` confirmar ausência de
  `sqlservice.login`.

Então declarar o id em `pendencias_resolvidas:` num registro novo.

## 5. Verificações declaradas

- `tokeninfo` do ADC via refresh real: executado, escopos listados acima.
- Decodificação JWT `.mcp-auth`: executado (apenas payload, sem assinatura).
- `expiry` dos tokens Antigravity: lido do store (strings ISO).
- Docs Supabase MCP + issue #236: consultados via web_search.
- `gcloud auth application-default login --help`: `--scopes` confirmado.
- Nenhuma chamada de inferência a provedor; nenhuma escrita fora dos stores de
  credencial listados.
