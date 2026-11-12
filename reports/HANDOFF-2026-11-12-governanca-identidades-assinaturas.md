---
id: handoff-2026-11-12-governanca-identidades-e-assinaturas
tipo: handoff
escopo: Sessão Devin SWE-2 — auditoria de governança de identidades, modelos, condutores e assinaturas; pools de chaves e arquitetura S1/S2 já entregues em commits anteriores
alvo: ecossistema Site (projeto ativo)
status: ativo
autor: Devin (SWE-2 Flash) [Tier 1]
criado_em: '2026-11-12'
verificado:
  - '177 testes verdes: test_hook_commit_msg + test_gpt6_astra + test_model_registry + test_routing_policy'
  - 'Suite completa verde no commit 38acf5aa; portões de âncora e registro aprovados'
  - 'commit-msg injeta ts= automaticamente (comprovado no próprio commit 38acf5aa)'
  - 'data/agent_identities.json válido; 16 identidades canônicas após inclusão de Devin (SWE-1.6 Slow)'
nao_verificado:
  - 'Demais condutores ainda não adotaram a anatomia completa de 5 campos — avisos do hook são não-bloqueantes por decisão'
  - 'Reativação das assinaturas flat-fee Anthropic/OpenAI: data depende do Tier 0'
pendencias:
  - id: pend-2026-11-10-key-pools-api
    o_que: >-
      Repovoar as pools de chaves API restantes: Anthropic e OpenAI não foram
      provisionadas (Gemini pool, Decision pool, OpenRouter tiers 1-4 +
      dedicadas e multimodal já repovoadas e validadas em 2026-11-12).
      Rotas de nuvem Anthropic/OpenAI falham até lá.
    dono: Tier 0
    prazo: '2026-11-24'
  - id: pend-2026-11-11-reauth-oauth-scopes
    o_que: >-
      Re-autenticar ADC gcloud e Supabase para reduzir escopos OAuth
      (cloud-platform + sqlservice.login excedente no ADC; workspace:admin
      acima do read_only declarado no Supabase). Exige fluxo OAuth interativo
      no navegador — detalhes em ~/.gemini/reports/saude_mcp/auditoria_oauth_onda3.md
    dono: Tier 0
    prazo: '2026-11-25'
referencias:
  - registro: reports/REGISTRO-2026-11-12-governanca-identidades-e-assinaturas.md
  - registro: reports/REGISTRO-2026-11-12-anatomia-assinatura-5-campos.md
  - handoff: reports/HANDOFF-2026-11-11-onda3-seguranca.md
---

# HANDOFF — Governança de identidades, modelos e assinaturas (2026-11-12)

## Estado entregue nesta sessão

- **Arquitetura S1/S2 local-first** (commits `34f0d8ac`, `db7518f2`, `5188e531`):
  llama.cpp Vulkan na RX 570 Polaris (~13.4 t/s no Qwen3.6-35B-A3B-MTP via
  llama-swap :8080, tier `moe` no system2_local), pools Gemini/Decision/
  OpenRouter/multimodal repovoadas e validadas, Decision 1 testado live
  (conf 0.993).
- **Anatomia da assinatura** (commit `908d5b5d`): 5 campos obrigatórios —
  modelo, condutor, ts, sha, supervisao — canonizados no CLAUDE.md.
- **Auditoria de identidades** (commit `38acf5aa`): CHICO como coletivo
  Tier 1 sem feudos confirmado; Tier 0 com fórmula completa de títulos;
  Gemini 3.1 Pro = PONTUAL via API; assinaturas flat-fee Anthropic/OpenAI
  suspensas propagadas a `cota_por_assinatura` (Gemini/Devin ativas);
  `ts=` virou carimbo automático do hook.
- **Devin (SWE-1.6 Slow)** registrado no catálogo como identidade individual
  Tier 1, preferencial para engenharia de código densa junto de SWE-2 Flash.

## Pendências abertas (não-bloqueantes)

1. `pend-2026-11-10-key-pools-api` — faltam chaves Anthropic e OpenAI.
2. `pend-2026-11-11-reauth-oauth-scopes` — re-auth OAuth interativo (Tier 0).

## Nota de atualização

A governança carrega `updated_at: 2026-11-12` (08:23 -03:00) como referência
do estado vigente. Modelos novos, aposentadorias ou mudanças de franquia
exigem revisão deste documento e do `llm/model_registry.py`.
