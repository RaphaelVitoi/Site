---
id: registro-2026-11-12-pendencia-key-pools-resolvida
tipo: registro
escopo: >-
  "Site -- verificacao de encerramento da pend-2026-11-10-key-pools-api:
  re-medicao de todas as pools de chaves citadas na declaracao original (Gemini,
  OpenRouter tiers 1-4, Decision, GOOGLE, ANTHROPIC, OPENAI) contra os
  consumidores reais do codigo"
ecossistema: nexus-sota
autor:
  Devin (SWE-2 Flash)
  <158243242+devin-ai-integration[bot]@users.noreply.github.com>
criado_em: "2026-11-12T10:45:00-03:00"
atualizado_em: "2026-11-12T10:45:00-03:00"
classes:
  - interno
  - medido
  - seguranca
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  python: "3.14.9"
  so: Windows
caminhos:
  - reports/HANDOFF-2026-11-10-model-line-consolidation.md
  - reports/REGISTRO-2026-11-12-pendencia-key-pools-resolvida.md
pendencias_resolvidas:
  - pend-2026-11-10-key-pools-api
verificado:
  - "decision_pool_manager: has_credentials=True, 3 chaves dedicadas
    DECISION_API_1..3, 4 candidatas -- pool nao vazia"
  - "gemini_pool_manager: 5/5 disponiveis; budget.GEMINI_KEYS=14,
    OPENROUTER_KEYS=29, ANTHROPIC_KEYS=1 -- medido em 2026-11-12"
  - "openrouter tiers {1:4, 2:7, 3:5, 4:5} via get_pool_keys (registry HKCU +
    ambiente)"
  - "validacao HTTP direta 2026-11-12: ANTHROPIC_API_KEY ->
    api.anthropic.com/v1/models = 200; GOOGLE_API_KEY ->
    generativelanguage.googleapis.com/v1beta/models = 200;
    Gemini/Decision/OpenRouter validadas em db7518f2"
  - "nenhum modulo Python de producao chama api.openai.com (grep em llm/,
    engine/, core/: so testes); OPENAI_API_KEY e lida apenas em checks de
    presenca com fallback OPENROUTER_API_KEY (llm/providers.py:478,
    llm/routing_policy.py:570)"
  - 'HKCU\Environment inventariado por nome: DECISION_API_1..3,
    GEMINI_API_KEY(+_1..5, FLASH_KEY_1..5, IMAGE/TRANSLATE/TTS/VIDEO),
    GOOGLE_CLOUD_PROJECT(+NUMBER), GOOGLE_JULES_API_KEY,
    GOOGLE_OAUTH_CLIENT_ID/SECRET, GOOGLE_STITCH_API_KEY,
    OPENROUTER_API_KEY+TIER1..4_KEY_*+ESPECIALIZADAS, SOTA_OPENAI_*;
    ANTHROPIC_API_KEY e OPENAI_API_KEY chegam via utils/env_loader
    (registry/hermes), nao por HKCU'
nao_verificado:
  - "OPENAI_API_KEY presente no ambiente mas HTTP 401 em
    api.openai.com/v1/models -- chave invalida/morta; sem impacto em rotas
    porque nenhum caminho de producao a consome (GPT flui via OpenRouter).
    Recomenda-se ao Tier 0 revogar/substituir a variavel para nao virar
    armadilha futura"
  - "escopo OAuth do ADC/Supabase -- pendencia separada
    pend-2026-11-11-reauth-oauth-scopes, permanece aberta (fluxo interativo Tier
    0)"
---

# Encerramento da pend-2026-11-10-key-pools-api (2026-11-12)

## O que a pendencia declarava

Em 2026-11-10 o HANDOFF de consolidacao de linha de modelos mediu: GeminiPool=0,
OpenRouter tiers 1-4=0, HKCU/HKLM sem `ANTHROPIC_API_KEY`/`OPENAI_API_KEY`/
`GOOGLE`/`GEMINI`; apenas `.env.local` tinha `GEMINI_API_KEY` lida por um unico
modulo. O dano declarado: "rotas de nuvem falham ate la".

## Estado medido em 2026-10-12 (re-medicao independente)

Todas as pools nomeadas na declaracao estao povoadas nos consumidores reais
(`llm/budget.ALL_ENV_VARS` = `os.environ` + `utils/env_loader.load_env()`, que
ja consolida registro Windows + harness Hermes + `.env`):

- **Gemini:** pool manager 5/5; `GEMINI_KEYS`=14; HKCU com `GEMINI_API_KEY`,
  `_1..5`, `GEMINI_FLASH_KEY_1..5` e chaves especializadas.
- **OpenRouter:** tiers {1:4, 2:7, 3:5, 4:5}=21 + 3 dedicadas;
  `OPENROUTER_KEYS`=29.
- **Decision:** 3 chaves dedicadas + fallbacks; `has_credentials=True`.
- **Google:** `GOOGLE_API_KEY` validada HTTP 200; projeto, OAuth client e chaves
  Jules/Stitch presentes.
- **Anthropic:** `ANTHROPIC_API_KEY` presente e **validada HTTP 200** em
  `/v1/models` (via env_loader, nao HKCU).
- **OpenAI:** `OPENAI_API_KEY` presente mas **HTTP 401** — chave morta. Nao ha
  consumidor de producao: `grep api.openai.com` so encontra testes; modelos GPT
  sao servidos via provider `openrouter` (pool validada). Os checks de
  disponibilidade (`providers.py`, `routing_policy.py`) testam presenca e
  aceitam `OPENROUTER_API_KEY` como alternativa.

O registro `pools-chaves-reposicao-e-doc-consolidada` (commit `db7518f2`,
2026-11-12) ja havia repovoado e validado Gemini/Decision/OpenRouter via HTTP
200 e mantido a pendencia aberta apenas por Anthropic/OpenAI. A re-medicao
abaixo mostra que ambas as variaveis existem no ambiente efetivo — Anthropic
valida, OpenAI esta morta mas nao roteada.

## Decisao

Pendencia encerrada: o objeto declarado (pools vazias derrubando rotas de nuvem)
nao existe mais — todas as rotas de nuvem tem credencial valida ou fallback
validado. A chave OpenAI invalida fica registrada em `nao_verificado` como
divida de higiene para o Tier 0 (revogar ou substituir `OPENAI_API_KEY` no
ambiente para evitar que um futuro caminho direto a herde uma credencial morta).
