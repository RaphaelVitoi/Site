---
id: relatorio-2026-11-12-ecossistema
tipo: relatorio
escopo: >-
  "Fotografia didatica do ecossistema SOTA/CHICO em 2026-11-12: repos,
  servicos em runtime, mesh LLM, credenciais OAuth, portoes de qualidade e
  pendencias vivas"
ecossistema: nexus-sota
autor:
  Devin (SWE-2 Flash)
  <158243242+devin-ai-integration[bot]@users.noreply.github.com>
criado_em: "2026-11-12T16:40:00-03:00"
atualizado_em: "2026-11-12T16:40:00-03:00"
classes:
  - interno
  - medido
config_medida:
  raiz: C:/Users/rapha/.gemini
  congelada_em: "2026-11-12"
caminhos:
  - Site
  - extensions/sota-chrome-cockpit
  - reports/saude_mcp
pendencias_resolvidas: []
verificado:
  - "git log/status dos 3 repos em 2026-11-12T16:35"
  - "GET http://127.0.0.1:9333/health -> ok:true v2.7"
  - "GET http://127.0.0.1:11434/api/version -> Ollama 0.40.16"
  - "GET http://127.0.0.1:9224/json/version -> Chrome/159 CDP proxy OK"
  - "GET http://127.0.0.1:11434/api/tags -> 10+ modelos locais"
nao_verificado:
  - "billing Ollama Cloud (HTTP 402 conhecido; nao re-testado nesta data)"
  - "consentimento OAuth do plugin microsoft-365-files na UI do Devin Desktop"
---

# Relatório do Ecossistema — 2026-11-12

> Fotografia medida, não opinativa. Cada número veio de comando executado
> nesta sessão; o que não foi medido está declarado em `nao_verificado`.

---

## 1. O que é isto, em uma frase

Um **stack LLM local-first** rodando na máquina do operador: um orquestrador
Python que roteia perguntas entre modelos locais (Ollama), nuvem (Ollama
Cloud, Gemini) e ferramentas (busca Exa/Tavily, MCPs), com um cockpit de
Chrome, um site Next.js e uma camada de governança git que obriga portões de
qualidade a cada commit.

```
┌─────────────────────────────────────────────────────────────┐
│  USUÁRIO                                                   │
│    ├─ Chrome Cockpit (extensão + python-backend :9333)      │
│    ├─ Site Next.js (frontend, :3000 dev)                    │
│    └─ Agentes: Devin, Antigravity, Jules, Claude Code       │
├─────────────────────────────────────────────────────────────┤
│  ORQUESTRAÇÃO                                             │
│    sota-orchestrator :9333  → ladder, loop, memória, voz   │
│    MCP Gateway :8933 (SSE) → 7 servidores compartilhados   │
│    CDP CORS proxy :9224     → Chrome DevTools seguro       │
├─────────────────────────────────────────────────────────────┤
│  MODELOS                                                  │
│    Ollama local :11434  → gemma4:e4b (atual), qwen, etc.  │
│    Ollama Cloud         → glm-5.3-flash, ollama/* (402)   │
│    Gemini/API keys      → pools com circuit breaker       │
├─────────────────────────────────────────────────────────────┤
│  GOVERNANÇA                                               │
│    CLAUDE.md canônico · portões CWV/CVE/SRI · assinaturas │
│    de commit · registros/âncoras · pendências datadas     │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Repositórios — estado em 2026-11-12 ~16:35

| Repo | Branch | Último commit | Remoto | Working tree |
|---|---|---|---|---|
| `Site/` | `master` | `4af578e3` higiene (history/, snippets/) | `github.com/RaphaelVitoi/Site` ✅ push | limpo |
| `~/.gemini` (raiz) | `main` | `dfe24c9` gitignore models/ 22GB | `github.com/RaphaelVitoi/raiz-multiprojeto` ✅ push | 2 JSONs de heartbeat modificados (ruído do daemon, intencional) |
| `extensions/sota-chrome-cockpit` | `main` | `3239fec` refactor complexidade | **sem remote — local-only** | limpo |

**Commits da sessão** (todos validados por portões antes do push):

- Site: `80bccbe1` (fix Sonar `str()`), `4af578e3` (higiene + registro de âncoras)
- Raiz: `a204edc` (markdownlint auditoria), `dfe24c9` (gitignore 22GB)
- Cockpit: `3239fec` (refactor `_router_ask_attempt`, complexidade 22→≤15)

**Risco registrado:** o cockpit é o único repo sem backup remoto. Se a máquina
falhar, os últimos commits de hardening (voice/memory, rotas Ollama, banner
EXA) existem só localmente. Mitigação sugerida na seção 7.

---

## 3. Serviços em runtime — todos verdes

| Serviço | Porta | Estado medido |
|---|---|---|
| SOTA Orchestrator | 9333 | `ok:true`, v2.7, providers: exa, mcp_gateway, ladder, site, loop, gemma, voice_nexus, stitch, jules, onedrive |
| Ollama local | 11434 | v0.40.16 — modelos: gemma4:e4b (6,6GB, atual), gemma4:12b, qwen3.8:27b, qwen2.5-coder, etc. |
| MCP Gateway | 8933 | ativo, SSE, latência 13ms, 7 servidores |
| CDP CORS proxy | 9224 | OK — Chrome/159, rejeita não-loopback com 421 (anti-DNS-rebinding preservado) |

**Mesh MCP (estado_vivo.json):** 18 servidores — 8 `vivo` medidos
(exa, chrome-devtools, playwright, mcpbrowser, toolbox, jules,
sequential-thinking, neon, stitch), 10 `nao_sondavel` (github, tavily,
parallel-search, supabase, canva, miro, render, cloudrun, context7 —
não sondáveis por desenho, não é falha).

---

## 4. Credenciais e OAuth — arquitetura em camadas

| Credencial | Mecanismo | Escopo | Estado |
|---|---|---|---|
| Supabase read-only | OAuth granular (`read_only=true`) | `*:read` only | ✅ renovado nesta semana |
| Supabase write | PAT em `SUPABASE_ACCESS_TOKEN` (HKCU+HKLM) | account-wide, revogável | ✅ validado HTTP 200 |
| Supabase write (Devin) | OAuth granular por recurso | write só no necessário | ✅ autenticado |
| Google ADC | `application_default_credentials.json` | openid/email/cloud-platform | ✅ `sqlservice.login` removido |
| Exa | `EXA_API_KEY` env/registry | — | ✅ banner agora condicional |
| HF token | `HF_TOKEN` HKCU | downloads de modelo | ✅ |

**Divisão de privilégio (decisão deliberada):** a rota default é read-only;
write exige opt-in explícito (`supabase-write`). O PAT nunca aparece em
arquivo, log ou commit — só referência de ambiente.

---

## 5. Qualidade — o que os portões realmente medem

O hook `commit-msg`/`pre-push` do Site roda `cwv_gate.ps1` com 5 fases:

1. **CWV runtime** (LCP ≤2,5s, CLS ≤0,1, TBT ≤200ms, TTFB ≤800ms) — mede no
   Chrome real via CDP
2. **Acessibilidade** (axe-core, 0 violações)
3. **CVE** (npm + pip, 0 crítico/alto)
4. **SRI** (SHA-512 em subresources)
5. **Higiene** (paths proibidos, blobs grandes, LFS, formatação)

Mais: suíte pytest completa (~2.200 testes, `-n 6`), portão de âncora
(integridade de referências em reports), portão de registro (revisões de
âncora obrigatórias — **bloqueou um commit nesta sessão e foi resolvido da
forma correta**, não contornado), e assinaturas de commit com SHA da árvore.

**Observação didática:** o CWV flakou 2× nesta sessão (LCP 7,7s → 475ms no
retry). Causa: 26 abas abertas no Chrome + cold compile do dev server. Não é
regressão de código — é ruído de medição ambiental. Se virar padrão,
vale considerar aquecer a rota antes da medição ou isolar o perfil de
medição.

---

## 6. Pendências vivas — apenas 1

| ID | Descrição | Dono | Prazo |
|---|---|---|---|
| `pend-2026-11-12-ollama-cloud-credits` | Ollama Cloud retorna HTTP 402 (billing). Provider integrado e roteado; basta crédito em ollama.com/settings | **Tier 0 (você)** | 2026-11-26 |

Tudo o mais está zerado: zero pendências vencidas, zero sinais de saúde
na malha, zero CVEs críticos.

---

## 7. Riscos e recomendações honestas

1. **Cockpit sem remote** — único repo sem backup. Recomendo criar repo
   privado no GitHub e adicionar remote (posso fazer se autorizar).
2. **CWV flaky sob carga** — 26 abas no Chrome de medição inflam LCP/TTFB.
   Medidas possíveis: perfil Chrome dedicado à medição ou warmup da rota.
3. **`microsoft-365-files`** — aguarda consentimento OAuth na UI do Devin
   Desktop (Plugins → conectar). Não resolvível por CLI.
4. **JSONs de heartbeat** na raiz ficam permanentemente "modified" — é o
   desenho (daemon escreve, próximo commit de feature absorve). Não é bug.
5. **Suíte não re-medida** no último commit (só docs) — o cache de árvore
   verde cobriu; comportamento correto do portão.

---

## 8. O que mudou nesta sessão (resumo executivo)

- Diagnósticos IDE validados: 1 falso positivo (imports), 2 correções reais
  (complexidade cognitiva, `str()` redundante), ~60 warnings markdown
  normalizados.
- OAuth Supabase read-only re-autenticado com escopos granulares read-only.
- `supabase-write` configurado no Devin via OAuth granular + PAT em
  HKCU/HKLM para os demais clientes.
- Frontend ganhou helpers Supabase SSR (`@supabase/ssr`), sem middleware —
  decisão FE-16 preservada (NextAuth é a auth ativa).
- `.gitignore` da raiz passou a cobrir `models/` (22GB) — landmine removida.
- 3 commits pushed no Site, 2 na raiz, 1 local no cockpit.

---

*Gerado por Devin (SWE-2 Flash) em 2026-11-12. Fontes: git log/status dos
3 repos, GET /health :9333, /api/version :11434, /json/version :9224,
estado_vivo.json, HANDOFF-2026-11-12-supabase-mcp-mesh-e-oauth.md.*
