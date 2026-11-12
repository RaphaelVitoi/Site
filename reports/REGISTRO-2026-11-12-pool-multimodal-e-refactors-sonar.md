---
id: registro-2026-11-12-pool-multimodal-e-refactors-sonar
tipo: registro
escopo:
  Site -- pool multimodal Gemini (TTS/Video/Image/Translate, AI Studio +
  OpenRouter) provisionada em HKCU+HKLM e em llm/media_pool.py, remediacao de
  pend-2026-11-11-extensoes-chrome-risco via politica ExtensionSettings,
  refactors de complexidade cognitiva (S3776/S5713) em system2_local e
  gemini_decisions, e documentacao consolidada
ecossistema: nexus-sota
autor:
  Devin (SWE-2 Flash)
  <158243242+devin-ai-integration[bot]@users.noreply.github.com>
criado_em: "2026-11-12T15:00:00-03:00"
atualizado_em: "2026-11-12T15:00:00-03:00"
classes:
  - interno
  - medido
  - seguranca
  - governanca
config_medida:
  congelada_em: "2026-11-12"
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  data: "2026-11-12"
caminhos:
  - CLAUDE.md
  - data/engine_capabilities.json
  - docs/POOLS-DE-CHAVES.md
  - llm/gemini_decisions.py
  - llm/media_pool.py
  - llm/system2_local.py
  - reports/REGISTRO-2026-11-12-pool-multimodal-e-refactors-sonar.md
  - tests/test_media_pool.py
revisoes_de_ancora:
  - registro: taxonomia-canonica-de-documentacao-e-relatorios
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: aditivo - nova bullet de Pool Multimodal Gemini
      (GEMINI_{TTS,VIDEO,IMAGE,TRANSLATE}_KEY + OPENROUTER_GEMINI_*_KEY,
      llm/media_pool.py) e correcao da contagem de chaves OpenRouter no item 3o
      Nivel da piramide (16->21+3+4); nenhuma regra removida."
  - registro: auditoria-2026-09-03-trabalho-do-gemini-3-8-flash
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: aditivo - nova bullet de Pool Multimodal Gemini
      (GEMINI_{TTS,VIDEO,IMAGE,TRANSLATE}_KEY + OPENROUTER_GEMINI_*_KEY,
      llm/media_pool.py) e correcao da contagem de chaves OpenRouter no item 3o
      Nivel da piramide (16->21+3+4); nenhuma regra removida."
  - registro: auditoria-2026-09-12-o-ci-vermelho-que-nenhum-portao-local-media
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: aditivo - nova bullet de Pool Multimodal Gemini
      (GEMINI_{TTS,VIDEO,IMAGE,TRANSLATE}_KEY + OPENROUTER_GEMINI_*_KEY,
      llm/media_pool.py) e correcao da contagem de chaves OpenRouter no item 3o
      Nivel da piramide (16->21+3+4); nenhuma regra removida."
  - registro: auditoria-2026-09-12-proveniencia-executavel-do-feedback
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: aditivo - nova bullet de Pool Multimodal Gemini
      (GEMINI_{TTS,VIDEO,IMAGE,TRANSLATE}_KEY + OPENROUTER_GEMINI_*_KEY,
      llm/media_pool.py) e correcao da contagem de chaves OpenRouter no item 3o
      Nivel da piramide (16->21+3+4); nenhuma regra removida."
  - registro: auditoria-2026-09-22-paridade-config-identidade
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: aditivo - nova bullet de Pool Multimodal Gemini
      (GEMINI_{TTS,VIDEO,IMAGE,TRANSLATE}_KEY + OPENROUTER_GEMINI_*_KEY,
      llm/media_pool.py) e correcao da contagem de chaves OpenRouter no item 3o
      Nivel da piramide (16->21+3+4); nenhuma regra removida."
  - registro: auditoria-2026-09-24-laya-multilingual-s1
    caminhos:
      - data/engine_capabilities.json
    parecer:
      "engine_capabilities.json: aditivo - novo engine_id media-key-pool
      espelhando o contrato dos demais pools; nenhum engine_id, family, contrato
      ou rotulo existente removido ou redefinido."
  - registro: auditoria-2026-09-24-mcp-gateway-compartilhado-e-persistencia
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: aditivo - nova bullet de Pool Multimodal Gemini
      (GEMINI_{TTS,VIDEO,IMAGE,TRANSLATE}_KEY + OPENROUTER_GEMINI_*_KEY,
      llm/media_pool.py) e correcao da contagem de chaves OpenRouter no item 3o
      Nivel da piramide (16->21+3+4); nenhuma regra removida."
  - registro: checkpoint-2026-06-14-infrastructure-hardening
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: aditivo - nova bullet de Pool Multimodal Gemini
      (GEMINI_{TTS,VIDEO,IMAGE,TRANSLATE}_KEY + OPENROUTER_GEMINI_*_KEY,
      llm/media_pool.py) e correcao da contagem de chaves OpenRouter no item 3o
      Nivel da piramide (16->21+3+4); nenhuma regra removida."
  - registro: handoff-2026-08-29-governanca-8tiers-vulnerabilidades-subagents
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: aditivo - nova bullet de Pool Multimodal Gemini
      (GEMINI_{TTS,VIDEO,IMAGE,TRANSLATE}_KEY + OPENROUTER_GEMINI_*_KEY,
      llm/media_pool.py) e correcao da contagem de chaves OpenRouter no item 3o
      Nivel da piramide (16->21+3+4); nenhuma regra removida."
  - registro: handoff-2026-08-30-auditoria-malha-agentica-e-trava-de-lfs
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: aditivo - nova bullet de Pool Multimodal Gemini
      (GEMINI_{TTS,VIDEO,IMAGE,TRANSLATE}_KEY + OPENROUTER_GEMINI_*_KEY,
      llm/media_pool.py) e correcao da contagem de chaves OpenRouter no item 3o
      Nivel da piramide (16->21+3+4); nenhuma regra removida."
  - registro: handoff-2026-09-12-reconciliacao-calibracao-e-proveniencia
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: aditivo - nova bullet de Pool Multimodal Gemini
      (GEMINI_{TTS,VIDEO,IMAGE,TRANSLATE}_KEY + OPENROUTER_GEMINI_*_KEY,
      llm/media_pool.py) e correcao da contagem de chaves OpenRouter no item 3o
      Nivel da piramide (16->21+3+4); nenhuma regra removida."
  - registro: handoff-2026-09-13-integracao-de-engines-wasm-e-economia-de-gate
    caminhos:
      - data/engine_capabilities.json
    parecer:
      "engine_capabilities.json: aditivo - novo engine_id media-key-pool
      espelhando o contrato dos demais pools; nenhum engine_id, family, contrato
      ou rotulo existente removido ou redefinido."
  - registro: handoff-2026-09-22-integracao-system1-llm-dashboard
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: aditivo - nova bullet de Pool Multimodal Gemini
      (GEMINI_{TTS,VIDEO,IMAGE,TRANSLATE}_KEY + OPENROUTER_GEMINI_*_KEY,
      llm/media_pool.py) e correcao da contagem de chaves OpenRouter no item 3o
      Nivel da piramide (16->21+3+4); nenhuma regra removida."
  - registro: handoff-2026-09-22-paridade-config-identidade
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: aditivo - nova bullet de Pool Multimodal Gemini
      (GEMINI_{TTS,VIDEO,IMAGE,TRANSLATE}_KEY + OPENROUTER_GEMINI_*_KEY,
      llm/media_pool.py) e correcao da contagem de chaves OpenRouter no item 3o
      Nivel da piramide (16->21+3+4); nenhuma regra removida."
  - registro: handoff-2026-09-24-laya-gpu-homologacao-e-solver-bridge
    caminhos:
      - data/engine_capabilities.json
    parecer:
      "engine_capabilities.json: aditivo - novo engine_id media-key-pool
      espelhando o contrato dos demais pools; nenhum engine_id, family, contrato
      ou rotulo existente removido ou redefinido."
  - registro: handoff-2026-09-24-laya-multilingual-s1-integracao
    caminhos:
      - data/engine_capabilities.json
    parecer:
      "engine_capabilities.json: aditivo - novo engine_id media-key-pool
      espelhando o contrato dos demais pools; nenhum engine_id, family, contrato
      ou rotulo existente removido ou redefinido."
  - registro: handoff-2026-09-25-governanca-pools-openrouter-e-impacto
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: aditivo - nova bullet de Pool Multimodal Gemini
      (GEMINI_{TTS,VIDEO,IMAGE,TRANSLATE}_KEY + OPENROUTER_GEMINI_*_KEY,
      llm/media_pool.py) e correcao da contagem de chaves OpenRouter no item 3o
      Nivel da piramide (16->21+3+4); nenhuma regra removida."
  - registro: handoff-2026-09-29-contraste-acessibilidade-e-identidade-de-condutor
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: aditivo - nova bullet de Pool Multimodal Gemini
      (GEMINI_{TTS,VIDEO,IMAGE,TRANSLATE}_KEY + OPENROUTER_GEMINI_*_KEY,
      llm/media_pool.py) e correcao da contagem de chaves OpenRouter no item 3o
      Nivel da piramide (16->21+3+4); nenhuma regra removida."
  - registro: handoff-2026-10-20-harmonizacao-tier1-gemini-38
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: aditivo - nova bullet de Pool Multimodal Gemini
      (GEMINI_{TTS,VIDEO,IMAGE,TRANSLATE}_KEY + OPENROUTER_GEMINI_*_KEY,
      llm/media_pool.py) e correcao da contagem de chaves OpenRouter no item 3o
      Nivel da piramide (16->21+3+4); nenhuma regra removida."
  - registro: plano-laya-integracao-s1s2-pmev-2026-09-20
    caminhos:
      - data/engine_capabilities.json
    parecer:
      "engine_capabilities.json: aditivo - novo engine_id media-key-pool
      espelhando o contrato dos demais pools; nenhum engine_id, family, contrato
      ou rotulo existente removido ou redefinido."
  - registro: registro-2026-08-29-governanca-piramidal-sota
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: aditivo - nova bullet de Pool Multimodal Gemini
      (GEMINI_{TTS,VIDEO,IMAGE,TRANSLATE}_KEY + OPENROUTER_GEMINI_*_KEY,
      llm/media_pool.py) e correcao da contagem de chaves OpenRouter no item 3o
      Nivel da piramide (16->21+3+4); nenhuma regra removida."
  - registro: registro-2026-09-01-ancora-de-merge-e-instrucao-indexada
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: aditivo - nova bullet de Pool Multimodal Gemini
      (GEMINI_{TTS,VIDEO,IMAGE,TRANSLATE}_KEY + OPENROUTER_GEMINI_*_KEY,
      llm/media_pool.py) e correcao da contagem de chaves OpenRouter no item 3o
      Nivel da piramide (16->21+3+4); nenhuma regra removida."
  - registro: registro-2026-09-02-correcao-de-escala-e-timestamp-no-ledger
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: aditivo - nova bullet de Pool Multimodal Gemini
      (GEMINI_{TTS,VIDEO,IMAGE,TRANSLATE}_KEY + OPENROUTER_GEMINI_*_KEY,
      llm/media_pool.py) e correcao da contagem de chaves OpenRouter no item 3o
      Nivel da piramide (16->21+3+4); nenhuma regra removida."
  - registro: registro-2026-09-02-portao-de-calibracao-por-sessao
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: aditivo - nova bullet de Pool Multimodal Gemini
      (GEMINI_{TTS,VIDEO,IMAGE,TRANSLATE}_KEY + OPENROUTER_GEMINI_*_KEY,
      llm/media_pool.py) e correcao da contagem de chaves OpenRouter no item 3o
      Nivel da piramide (16->21+3+4); nenhuma regra removida."
  - registro: registro-2026-09-03-triade-fronteira-chico-e-concorrencia
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: aditivo - nova bullet de Pool Multimodal Gemini
      (GEMINI_{TTS,VIDEO,IMAGE,TRANSLATE}_KEY + OPENROUTER_GEMINI_*_KEY,
      llm/media_pool.py) e correcao da contagem de chaves OpenRouter no item 3o
      Nivel da piramide (16->21+3+4); nenhuma regra removida."
  - registro: registro-2026-09-05-regua-para-agente-autonomo-de-nuvem
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: aditivo - nova bullet de Pool Multimodal Gemini
      (GEMINI_{TTS,VIDEO,IMAGE,TRANSLATE}_KEY + OPENROUTER_GEMINI_*_KEY,
      llm/media_pool.py) e correcao da contagem de chaves OpenRouter no item 3o
      Nivel da piramide (16->21+3+4); nenhuma regra removida."
  - registro: registro-2026-09-07-integracao-gpt6-astra-e-retirada-do-fable
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: aditivo - nova bullet de Pool Multimodal Gemini
      (GEMINI_{TTS,VIDEO,IMAGE,TRANSLATE}_KEY + OPENROUTER_GEMINI_*_KEY,
      llm/media_pool.py) e correcao da contagem de chaves OpenRouter no item 3o
      Nivel da piramide (16->21+3+4); nenhuma regra removida."
  - registro: registro-2026-09-08-arbitragem-soberana-sobre-a-lei-de-concorrencia
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: aditivo - nova bullet de Pool Multimodal Gemini
      (GEMINI_{TTS,VIDEO,IMAGE,TRANSLATE}_KEY + OPENROUTER_GEMINI_*_KEY,
      llm/media_pool.py) e correcao da contagem de chaves OpenRouter no item 3o
      Nivel da piramide (16->21+3+4); nenhuma regra removida."
  - registro: registro-2026-09-09-saneamento-medicao-datada-identificacao-agentes
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: aditivo - nova bullet de Pool Multimodal Gemini
      (GEMINI_{TTS,VIDEO,IMAGE,TRANSLATE}_KEY + OPENROUTER_GEMINI_*_KEY,
      llm/media_pool.py) e correcao da contagem de chaves OpenRouter no item 3o
      Nivel da piramide (16->21+3+4); nenhuma regra removida."
  - registro: registro-2026-09-12-preludio-o-instrumento-que-sabia-abrir-e-nao-fechar
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: aditivo - nova bullet de Pool Multimodal Gemini
      (GEMINI_{TTS,VIDEO,IMAGE,TRANSLATE}_KEY + OPENROUTER_GEMINI_*_KEY,
      llm/media_pool.py) e correcao da contagem de chaves OpenRouter no item 3o
      Nivel da piramide (16->21+3+4); nenhuma regra removida."
  - registro: registro-2026-09-13-contrato-de-capacidades-e-paridade-de-engines
    caminhos:
      - data/engine_capabilities.json
    parecer:
      "engine_capabilities.json: aditivo - novo engine_id media-key-pool
      espelhando o contrato dos demais pools; nenhum engine_id, family, contrato
      ou rotulo existente removido ou redefinido."
  - registro: registro-2026-09-14-correcoes-pos-auditoria-handoff-tier-e-dependencias
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: aditivo - nova bullet de Pool Multimodal Gemini
      (GEMINI_{TTS,VIDEO,IMAGE,TRANSLATE}_KEY + OPENROUTER_GEMINI_*_KEY,
      llm/media_pool.py) e correcao da contagem de chaves OpenRouter no item 3o
      Nivel da piramide (16->21+3+4); nenhuma regra removida."
  - registro: registro-2026-09-14-harmonizacao-canonicos-astra-luna-gemini-anthropic
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: aditivo - nova bullet de Pool Multimodal Gemini
      (GEMINI_{TTS,VIDEO,IMAGE,TRANSLATE}_KEY + OPENROUTER_GEMINI_*_KEY,
      llm/media_pool.py) e correcao da contagem de chaves OpenRouter no item 3o
      Nivel da piramide (16->21+3+4); nenhuma regra removida."
  - registro: registro-2026-09-22-skill-handoff-e-calibracao
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: aditivo - nova bullet de Pool Multimodal Gemini
      (GEMINI_{TTS,VIDEO,IMAGE,TRANSLATE}_KEY + OPENROUTER_GEMINI_*_KEY,
      llm/media_pool.py) e correcao da contagem de chaves OpenRouter no item 3o
      Nivel da piramide (16->21+3+4); nenhuma regra removida."
  - registro: registro-2026-09-24-harmonizacao-arquitetura-hibrida-vulkan-pytorch
    caminhos:
      - data/engine_capabilities.json
    parecer:
      "engine_capabilities.json: aditivo - novo engine_id media-key-pool
      espelhando o contrato dos demais pools; nenhum engine_id, family, contrato
      ou rotulo existente removido ou redefinido."
  - registro: registro-2026-09-24-laya-gpu-homologacao-e-solver-bridge
    caminhos:
      - data/engine_capabilities.json
    parecer:
      "engine_capabilities.json: aditivo - novo engine_id media-key-pool
      espelhando o contrato dos demais pools; nenhum engine_id, family, contrato
      ou rotulo existente removido ou redefinido."
  - registro: registro-2026-09-24-laya-multilingual-s1-integracao
    caminhos:
      - data/engine_capabilities.json
    parecer:
      "engine_capabilities.json: aditivo - novo engine_id media-key-pool
      espelhando o contrato dos demais pools; nenhum engine_id, family, contrato
      ou rotulo existente removido ou redefinido."
  - registro: registro-2026-09-24-mcp-gateway-compartilhado-e-persistencia
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: aditivo - nova bullet de Pool Multimodal Gemini
      (GEMINI_{TTS,VIDEO,IMAGE,TRANSLATE}_KEY + OPENROUTER_GEMINI_*_KEY,
      llm/media_pool.py) e correcao da contagem de chaves OpenRouter no item 3o
      Nivel da piramide (16->21+3+4); nenhuma regra removida."
  - registro: registro-2026-09-25-precedencia-economica-assinaturas-pro-e-nuvem-free
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: aditivo - nova bullet de Pool Multimodal Gemini
      (GEMINI_{TTS,VIDEO,IMAGE,TRANSLATE}_KEY + OPENROUTER_GEMINI_*_KEY,
      llm/media_pool.py) e correcao da contagem de chaves OpenRouter no item 3o
      Nivel da piramide (16->21+3+4); nenhuma regra removida."
  - registro: registro-2026-09-25-skill-avaliacao-impacto-sessao
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: aditivo - nova bullet de Pool Multimodal Gemini
      (GEMINI_{TTS,VIDEO,IMAGE,TRANSLATE}_KEY + OPENROUTER_GEMINI_*_KEY,
      llm/media_pool.py) e correcao da contagem de chaves OpenRouter no item 3o
      Nivel da piramide (16->21+3+4); nenhuma regra removida."
  - registro: registro-2026-09-25-soberania-commit-push-e-staging-perpetuo
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: aditivo - nova bullet de Pool Multimodal Gemini
      (GEMINI_{TTS,VIDEO,IMAGE,TRANSLATE}_KEY + OPENROUTER_GEMINI_*_KEY,
      llm/media_pool.py) e correcao da contagem de chaves OpenRouter no item 3o
      Nivel da piramide (16->21+3+4); nenhuma regra removida."
  - registro: registro-2026-09-25-teto-de-commits-e-push-obrigatorio
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: aditivo - nova bullet de Pool Multimodal Gemini
      (GEMINI_{TTS,VIDEO,IMAGE,TRANSLATE}_KEY + OPENROUTER_GEMINI_*_KEY,
      llm/media_pool.py) e correcao da contagem de chaves OpenRouter no item 3o
      Nivel da piramide (16->21+3+4); nenhuma regra removida."
  - registro: registro-2026-10-20-harmonizacao-tier1-e-gemini-38
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: aditivo - nova bullet de Pool Multimodal Gemini
      (GEMINI_{TTS,VIDEO,IMAGE,TRANSLATE}_KEY + OPENROUTER_GEMINI_*_KEY,
      llm/media_pool.py) e correcao da contagem de chaves OpenRouter no item 3o
      Nivel da piramide (16->21+3+4); nenhuma regra removida."
  - registro: registro-2026-11-12-arquitetura-s1-s2-llama-vulkan
    caminhos:
      - data/engine_capabilities.json
      - llm/gemini_decisions.py
      - llm/system2_local.py
    parecer:
      "engine_capabilities.json: aditivo - novo engine_id media-key-pool
      espelhando o contrato dos demais pools; nenhum engine_id, family, contrato
      ou rotulo existente removido ou redefinido. llm/gemini_decisions.py:
      refatoracao de complexidade cognitiva (S3776) - criterios de
      normalize_questions extraidos para normalizadores por tipo
      (_norm_{noul,choice,score}_criteria); comportamento identico, coberto
      pelos testes existentes. llm/system2_local.py: refatoracao de complexidade
      (S3776) e excecoes redundantes (S5713) - sonda de hardware e caminhos
      locais do system2_generate extraidos para helpers; comportamento identico,
      coberto pelos testes existentes."
  - registro: registro-2026-11-12-pools-chaves-reposicao-e-doc-consolidada
    caminhos:
      - CLAUDE.md
      - data/engine_capabilities.json
      - docs/POOLS-DE-CHAVES.md
    parecer:
      "CLAUDE.md: aditivo - nova bullet de Pool Multimodal Gemini
      (GEMINI_{TTS,VIDEO,IMAGE,TRANSLATE}_KEY + OPENROUTER_GEMINI_*_KEY,
      llm/media_pool.py) e correcao da contagem de chaves OpenRouter no item 3o
      Nivel da piramide (16->21+3+4); nenhuma regra removida.
      engine_capabilities.json: aditivo - novo engine_id media-key-pool
      espelhando o contrato dos demais pools; nenhum engine_id, family, contrato
      ou rotulo existente removido ou redefinido. POOLS-DE-CHAVES.md: secao 4
      nova (Pool Multimodal, fingerprints sha8 por provider) e tabela de
      verificacao ampliada; secoes existentes preservadas."
  - registro: relatorio-2026-06-16-auditoria-e-harmonizacao-v8-gold
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: aditivo - nova bullet de Pool Multimodal Gemini
      (GEMINI_{TTS,VIDEO,IMAGE,TRANSLATE}_KEY + OPENROUTER_GEMINI_*_KEY,
      llm/media_pool.py) e correcao da contagem de chaves OpenRouter no item 3o
      Nivel da piramide (16->21+3+4); nenhuma regra removida."
  - registro: relatorio-2026-08-29-analise-integral-ecossistema-sota-v8-gold
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: aditivo - nova bullet de Pool Multimodal Gemini
      (GEMINI_{TTS,VIDEO,IMAGE,TRANSLATE}_KEY + OPENROUTER_GEMINI_*_KEY,
      llm/media_pool.py) e correcao da contagem de chaves OpenRouter no item 3o
      Nivel da piramide (16->21+3+4); nenhuma regra removida."
  - registro: relatorio-2026-08-29-impacto-quantitativo-qualitativo-sota-v8-gold
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: aditivo - nova bullet de Pool Multimodal Gemini
      (GEMINI_{TTS,VIDEO,IMAGE,TRANSLATE}_KEY + OPENROUTER_GEMINI_*_KEY,
      llm/media_pool.py) e correcao da contagem de chaves OpenRouter no item 3o
      Nivel da piramide (16->21+3+4); nenhuma regra removida."
  - registro: validacao-2026-09-12-a-grade-que-nao-cabia-e-o-aviso-que-virou-bloqueio
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: aditivo - nova bullet de Pool Multimodal Gemini
      (GEMINI_{TTS,VIDEO,IMAGE,TRANSLATE}_KEY + OPENROUTER_GEMINI_*_KEY,
      llm/media_pool.py) e correcao da contagem de chaves OpenRouter no item 3o
      Nivel da piramide (16->21+3+4); nenhuma regra removida."
  - registro: validacao-2026-09-12-a-identidade-de-autoria-deixa-de-ser-prosa
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: aditivo - nova bullet de Pool Multimodal Gemini
      (GEMINI_{TTS,VIDEO,IMAGE,TRANSLATE}_KEY + OPENROUTER_GEMINI_*_KEY,
      llm/media_pool.py) e correcao da contagem de chaves OpenRouter no item 3o
      Nivel da piramide (16->21+3+4); nenhuma regra removida."
pendencias_resolvidas:
  - pend-2026-11-11-extensoes-chrome-risco
verificado:
  - "Pool multimodal: 8/8 chaves validadas HTTP 200 (4 AI Studio em
    /v1beta/models + 4 OpenRouter em /api/v1/auth/key), gravadas em HKCU e HKLM
    com broadcast WM_SETTINGCHANGE"
  - "llm/media_pool.py: MediaPoolManager com circuit breaker por (modalidade,
    provider), fallback controlado e MEDIA_POOL_PROVIDER; 9/9 testes hermeticos
    verdes"
  - "engine_capabilities.json: +media-key-pool; JSON valido e
    test_engine_capability_registry 4/4 verdes"
  - "pend-2026-11-11-extensoes-chrome-risco: politicas ExtensionSettings=blocked
    gravadas em HKCU para Chrome Dev (YouMind, Admin Tools) e Edge (ChatGPT
    duplicata, Magictool, Promptly Labs, Kami, Video Quality Enhancer, Audio
    Transcription); IDs conferidos contra Secure Preferences/manifests"
  - "Refactors SonarLint: normalize_questions (complexidade 51->helpers),
    hardware_snapshot/system2_generate (28/20->helpers), excepts redundantes
    URLError/TimeoutError->OSError; 45/45 testes verdes, ruff limpo, pyright 0
    erros"
nao_verificado:
  - "Efeito das politicas ExtensionSettings: aplica-se na proxima inicializacao
    de cada navegador (politica nao altera sessao ja aberta)"
  - "pend-2026-11-11-reauth-oauth-scopes: NAO resolvida - reauth ADC produz os
    mesmos escopos (gcloud sempre pede cloud-platform+sqlservice.login);
    mitigacao real e IAM no projeto (raphavitoi@gmail.com e roles/owner) +
    re-consent Supabase interativo na IDE - decisao de Tier 0"
  - "Pools Anthropic e OpenAI: seguem nao provisionadas"
  - "Chaves multimodais coladas em chat: rotacao a cargo do operador"
  - "Suite pytest completa e gates de commit: executados pelo hook pre-commit
    deste commit"
---

# Pool multimodal Gemini + remediacao de pendencias + refactors SonarLint (2026-11-12)

## Pool Multimodal (`llm/media_pool.py`)

- Variaveis provisionadas em HKCU+HKLM: `GEMINI_{TTS,VIDEO,IMAGE,TRANSLATE}_KEY`
  (AI Studio) e `OPENROUTER_GEMINI_{TTS,VIDEO,IMAGE,TRANSLATE}_KEY`
  (OpenRouter).
- `MediaPoolManager` (singleton `media_pool_manager`): modalidades
  `tts|video|image|translate`, providers `aistudio|openrouter`, round-robin com
  circuit breaker por (modalidade, provider), fallback para
  `GEMINI_API_KEY`/`OPENROUTER_API_KEY` quando a dedicada falta, sufixos
  `_1.._5` aceitos, `MEDIA_POOL_PROVIDER` controla ordem, telemetria sha8.
- Validacao live: 8/8 HTTP 200. Fingerprints em `docs/POOLS-DE-CHAVES.md` §4.

## pend-2026-11-11-extensoes-chrome-risco — RESOLVIDA

Em vez de cliques de UI (que exigiriam fechar os navegadores do usuario), foram
gravadas politicas de extensao reversiveis em `HKCU`:

- `Software\Policies\Google\Chrome Dev\ExtensionSettings\<id>` =
  `installation_mode=blocked` para YouMind (`cnnenlbocdcjnmpkkbbdgjfejinfffjc`)
  e Admin Tools (`coldckiacfhnbeapgkjjpmpjgdonimfe`);
- `Software\Policies\Microsoft\Edge\ExtensionSettings\<id>` = blocked para
  ChatGPT duplicata (`odlomjlbamekndcpllcnffbgeohgkmjh`), Magictool
  (`fpncncnngnkggnjajalboihdobmdenml`), Promptly Labs
  (`kjmhecmpdjbcdpnifekoabjhchlphiof`), Kami
  (`opdaekibhicejocjkaekfecdjmjgojjo`), Video Quality Enhancer
  (`cklpedfffgibjcllnbegomhbpmkcflci`) e Audio Transcription
  (`mgekiekmhamibkobnlfbphhifjkhkohh` — nome conferido no manifest).

Reversao: apagar as subchaves `ExtensionSettings\<id>` e reiniciar o navegador.
Enforce na proxima inicializacao de cada perfil.

## pend-2026-11-11-reauth-oauth-scopes — NAO resolvida (bloqueio real)

Medido: o ADC atual emite `cloud-platform`, `sqlservice.login`,
`userinfo.email`, `openid`, `email`. `gcloud auth application-default login` nao
oferece escopo menor — reautenticar produziria os mesmos escopos. A auditoria ja
concluiu que a mitigacao real e IAM: `raphavitoi@gmail.com` detem `roles/owner`
em `original-498419`. Reduzir Owner e decisao de Tier 0 (pode quebrar fluxos); o
re-consent Supabase e interativo na IDE. Pendencia mantida aberta.

## Refactors SonarLint (comportamento identico)

- `normalize_questions`: criteria por tipo extraido para
  `_norm_{noul,choice,score}_criteria` (complexidade cognitiva 51 -> <=15).
- `hardware_snapshot`: sondas RAM/VRAM extraidas para `_probe_ram_gb`,
  `_probe_vram_windows`, `_probe_gpu_device` (28 -> <=15).
- `system2_generate`: caminhos moe/ollama extraidos para `_try_moe_local`,
  `_try_ollama_local` (20 -> <=15).
- `except (OSError, URLError, TimeoutError)` -> `except OSError` (URLError e
  TimeoutError derivam de OSError; S5713).

## Reconciliacao de ancoras

Registros vigentes ancorados nos caminhos tocados receberam `revisoes_de_ancora`
individual com parecer aditivo.
