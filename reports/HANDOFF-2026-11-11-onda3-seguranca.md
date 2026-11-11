---
id: handoff-2026-11-11-onda3-seguranca
tipo: handoff
escopo: Onda 3 seguranca do ecossistema MCP/IDE — fechamento e pendencias do operador
alvo: ecossistema ~/.gemini (fora do Site; registro formalizado aqui para o portao de pendencias)
status: ativo
autor: Devin (SWE-2 Flash) [Tier 1]
criado_em: '2026-11-11'
verificado:
  - 'ACL .env: 9 arquivos endurecidos (rapha/SYSTEM/Admins=F, CodexSandboxUsers=RX), regressao RX->M revertida; backup local em acl_backup_onda3_20261111/'
  - 'sincronizar_nucleo.py --verificar: todos os hospedeiros batem com o nucleo (cloud-sql_remote em quarentena, disabled duravel)'
  - 'pytest tests/ nucleo: 42 passed'
  - 'commits raiz 442284c e Site 37d60eda pushed; gates CWV/suite verdes'
nao_verificado:
  - 'estado efetivo dos plugins partners na UI do Antigravity (enabled explícito gravado no config, efeito no runtime nao confirmado)'
pendencias:
  - id: pend-2026-11-11-reauth-oauth-scopes
    o_que: >-
      Re-autenticar ADC gcloud e Supabase para reduzir escopos OAuth: ADC detem
      cloud-platform (superficie total do GCP no projeto original-498419) +
      sqlservice.login excedente; token Supabase detem workspace:admin acima do
      read_only=true declarado no overlay. Exige fluxo OAuth interativo no
      navegador — detalhes em ~/.gemini/reports/saude_mcp/auditoria_oauth_onda3.md
    dono: Tier 0
    prazo: '2026-11-25'
  - id: pend-2026-11-11-extensoes-chrome-risco
    o_que: >-
      Desabilitar/remover na UI do navegador as extensoes de risco inventariadas:
      YouMind (debugger+cookies+all_urls+externally_connectable*), Admin Tools by
      Cloud Captains, ChatGPT duplicado no Edge, Magictool AI, Promptly Labs, Kami,
      Video Quality Enhancer, Audio Transcription. Nenhuma existe nos perfis de
      automacao SOTA. Lista completa e reversivel em
      ~/.gemini/reports/saude_mcp/auditoria_extensoes_chrome_onda3.md secao 7
    dono: Tier 0
    prazo: '2026-11-25'
referencias:
  - registro: ~/.gemini/relatorios/REGISTRO-2026-11-11-onda3-seguranca.md
  - pendencia_preexistente: pend-2026-11-10-key-pools-api (ate 2026-11-24, key pools API)
---

# HANDOFF — Onda 3 Segurança: fechamento e pendências do operador

A Onda 3 (ACL `.env`, escopos OAuth, preset TURBO, extensões Chrome) foi
concluída em 2026-11-11 com auditorias paralelas e decisões delegadas
executadas. Registro consolidado em
`~/.gemini/relatorios/REGISTRO-2026-11-11-onda3-seguranca.md`; relatórios
detalhados em `~/.gemini/reports/saude_mcp/auditoria_*_onda3.md`.

Este documento existe para formalizar no portão de pendências as duas
ações que **só o operador pode executar** (fluxo OAuth interativo e UI do
navegador). A terceira pendência do backlog — `pend-2026-11-10-key-pools-api`
— já estava registrada e segue até 2026-11-24.

## Estado final medido

| Item | Estado |
| :--- | :--- |
| ACL `.env` (9 arquivos) | endurecida, verificada 9/9, rollback local |
| `datacloud_cloud-sql_remote` | quarentena registrada, `disabled:true` durável |
| `google-compute-engine` | `gestao=extensao` mantido (correto por construção) |
| `.mcp-auth` órfãos | PostHog + adaption em `_orfaos_onda3_20261111/` |
| Plugins partners | `enabled` explícito nos 6 ambíguos |
| Preset TURBO | mantido por decisão; `antigravity_sota_guard.py` audita as 5 chaves |
| Sync nucleo | `--verificar` verde, 4 hosts convergidos |
| Testes nucleo | 42 passed |
