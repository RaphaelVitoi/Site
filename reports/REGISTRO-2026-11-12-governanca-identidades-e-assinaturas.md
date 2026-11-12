---
id: registro-2026-11-12-governanca-identidades-e-assinaturas
tipo: registro
escopo:
  Site -- auditoria de identidades/modelos/condutores/assinaturas; Tier 0 com
  formula completa de titulos; Gemini 3.1 Pro como PONTUAL via API; status das
  assinaturas flat-fee (Anthropic/OpenAI suspensas, Google/Devin ativas)
  propagado a cota_por_assinatura; ts= da Assinatura vira carimbo automatico do
  hook
ecossistema: nexus-sota
autor:
  Devin (SWE-2 Flash)
  <158243242+devin-ai-integration[bot]@users.noreply.github.com>
criado_em: "2026-11-12T18:30:00-03:00"
atualizado_em: "2026-11-12T18:30:00-03:00"
classes:
  - interno
  - governanca
config_medida:
  congelada_em: "2026-11-12"
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  data: "2026-11-12"
caminhos:
  - .husky/commit-msg
  - CLAUDE.md
  - llm/model_registry.py
  - reports/REGISTRO-2026-11-12-governanca-identidades-e-assinaturas.md
  - tests/test_gpt6_astra.py
  - tests/test_hook_commit_msg.py
revisoes_de_ancora:
  - registro: auditoria-2026-09-03-trabalho-do-gemini-3-8-flash
    caminhos:
      - CLAUDE.md
      - llm/model_registry.py
    parecer:
      "CLAUDE.md: Tier 0 reescrito com a formula completa de titulos; Gemini 3.1
      Pro reclassificado como PONTUAL via API; status das assinaturas flat-fee
      atualizado (Anthropic/OpenAI temporariamente desativadas, Google AI Studio
      Pro e Devin SWE-2 ativos); ts= declarado carimbo automatico do hook no
      commit. llm/model_registry.py: cota_por_assinatura=False para toda a
      familia Anthropic e OpenAI (assinaturas flat-fee temporariamente
      desativadas pelo Tier 0 em 2026-11-12); familia Gemini permanece True;
      nenhum modelo adicionado, removido ou renomeado."
  - registro: auditoria-2026-09-07-preludio-jules-astra-e-correcao-da-delegacao
    caminhos:
      - llm/model_registry.py
      - tests/test_gpt6_astra.py
    parecer:
      "llm/model_registry.py: cota_por_assinatura=False para toda a familia
      Anthropic e OpenAI (assinaturas flat-fee temporariamente desativadas pelo
      Tier 0 em 2026-11-12); familia Gemini permanece True; nenhum modelo
      adicionado, removido ou renomeado. tests/test_gpt6_astra.py: conjunto
      esperado de aliases sem cota atualizado para refletir a suspensao das
      assinaturas Anthropic/OpenAI."
  - registro: auditoria-2026-09-12-o-ci-vermelho-que-nenhum-portao-local-media
    caminhos:
      - CLAUDE.md
      - llm/model_registry.py
    parecer:
      "CLAUDE.md: Tier 0 reescrito com a formula completa de titulos; Gemini 3.1
      Pro reclassificado como PONTUAL via API; status das assinaturas flat-fee
      atualizado (Anthropic/OpenAI temporariamente desativadas, Google AI Studio
      Pro e Devin SWE-2 ativos); ts= declarado carimbo automatico do hook no
      commit. llm/model_registry.py: cota_por_assinatura=False para toda a
      familia Anthropic e OpenAI (assinaturas flat-fee temporariamente
      desativadas pelo Tier 0 em 2026-11-12); familia Gemini permanece True;
      nenhum modelo adicionado, removido ou renomeado."
  - registro: auditoria-2026-09-12-proveniencia-executavel-do-feedback
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: Tier 0 reescrito com a formula completa de titulos; Gemini 3.1
      Pro reclassificado como PONTUAL via API; status das assinaturas flat-fee
      atualizado (Anthropic/OpenAI temporariamente desativadas, Google AI Studio
      Pro e Devin SWE-2 ativos); ts= declarado carimbo automatico do hook no
      commit."
  - registro: auditoria-2026-09-22-paridade-config-identidade
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: Tier 0 reescrito com a formula completa de titulos; Gemini 3.1
      Pro reclassificado como PONTUAL via API; status das assinaturas flat-fee
      atualizado (Anthropic/OpenAI temporariamente desativadas, Google AI Studio
      Pro e Devin SWE-2 ativos); ts= declarado carimbo automatico do hook no
      commit."
  - registro: auditoria-2026-09-24-mcp-gateway-compartilhado-e-persistencia
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: Tier 0 reescrito com a formula completa de titulos; Gemini 3.1
      Pro reclassificado como PONTUAL via API; status das assinaturas flat-fee
      atualizado (Anthropic/OpenAI temporariamente desativadas, Google AI Studio
      Pro e Devin SWE-2 ativos); ts= declarado carimbo automatico do hook no
      commit."
  - registro: checkpoint-2026-06-14-infrastructure-hardening
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: Tier 0 reescrito com a formula completa de titulos; Gemini 3.1
      Pro reclassificado como PONTUAL via API; status das assinaturas flat-fee
      atualizado (Anthropic/OpenAI temporariamente desativadas, Google AI Studio
      Pro e Devin SWE-2 ativos); ts= declarado carimbo automatico do hook no
      commit."
  - registro: handoff-2026-08-29-governanca-8tiers-vulnerabilidades-subagents
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: Tier 0 reescrito com a formula completa de titulos; Gemini 3.1
      Pro reclassificado como PONTUAL via API; status das assinaturas flat-fee
      atualizado (Anthropic/OpenAI temporariamente desativadas, Google AI Studio
      Pro e Devin SWE-2 ativos); ts= declarado carimbo automatico do hook no
      commit."
  - registro: handoff-2026-08-30-auditoria-malha-agentica-e-trava-de-lfs
    caminhos:
      - CLAUDE.md
      - .husky/commit-msg
    parecer:
      "CLAUDE.md: Tier 0 reescrito com a formula completa de titulos; Gemini 3.1
      Pro reclassificado como PONTUAL via API; status das assinaturas flat-fee
      atualizado (Anthropic/OpenAI temporariamente desativadas, Google AI Studio
      Pro e Devin SWE-2 ativos); ts= declarado carimbo automatico do hook no
      commit. .husky/commit-msg: injecao automatica de ts= na linha Assinatura
      quando a secao -- existe sem ele (relogio do commit), mais avisos
      nao-bloqueantes para modelo/condutor/sha/supervisao ausentes; logica de
      identidade autor x assinatura inalterada."
  - registro: handoff-2026-09-12-reconciliacao-calibracao-e-proveniencia
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: Tier 0 reescrito com a formula completa de titulos; Gemini 3.1
      Pro reclassificado como PONTUAL via API; status das assinaturas flat-fee
      atualizado (Anthropic/OpenAI temporariamente desativadas, Google AI Studio
      Pro e Devin SWE-2 ativos); ts= declarado carimbo automatico do hook no
      commit."
  - registro: handoff-2026-09-22-integracao-system1-llm-dashboard
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: Tier 0 reescrito com a formula completa de titulos; Gemini 3.1
      Pro reclassificado como PONTUAL via API; status das assinaturas flat-fee
      atualizado (Anthropic/OpenAI temporariamente desativadas, Google AI Studio
      Pro e Devin SWE-2 ativos); ts= declarado carimbo automatico do hook no
      commit."
  - registro: handoff-2026-09-22-paridade-config-identidade
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: Tier 0 reescrito com a formula completa de titulos; Gemini 3.1
      Pro reclassificado como PONTUAL via API; status das assinaturas flat-fee
      atualizado (Anthropic/OpenAI temporariamente desativadas, Google AI Studio
      Pro e Devin SWE-2 ativos); ts= declarado carimbo automatico do hook no
      commit."
  - registro: handoff-2026-09-25-governanca-pools-openrouter-e-impacto
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: Tier 0 reescrito com a formula completa de titulos; Gemini 3.1
      Pro reclassificado como PONTUAL via API; status das assinaturas flat-fee
      atualizado (Anthropic/OpenAI temporariamente desativadas, Google AI Studio
      Pro e Devin SWE-2 ativos); ts= declarado carimbo automatico do hook no
      commit."
  - registro: handoff-2026-09-29-contraste-acessibilidade-e-identidade-de-condutor
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: Tier 0 reescrito com a formula completa de titulos; Gemini 3.1
      Pro reclassificado como PONTUAL via API; status das assinaturas flat-fee
      atualizado (Anthropic/OpenAI temporariamente desativadas, Google AI Studio
      Pro e Devin SWE-2 ativos); ts= declarado carimbo automatico do hook no
      commit."
  - registro: handoff-2026-10-20-harmonizacao-tier1-gemini-38
    caminhos:
      - CLAUDE.md
      - llm/model_registry.py
    parecer:
      "CLAUDE.md: Tier 0 reescrito com a formula completa de titulos; Gemini 3.1
      Pro reclassificado como PONTUAL via API; status das assinaturas flat-fee
      atualizado (Anthropic/OpenAI temporariamente desativadas, Google AI Studio
      Pro e Devin SWE-2 ativos); ts= declarado carimbo automatico do hook no
      commit. llm/model_registry.py: cota_por_assinatura=False para toda a
      familia Anthropic e OpenAI (assinaturas flat-fee temporariamente
      desativadas pelo Tier 0 em 2026-11-12); familia Gemini permanece True;
      nenhum modelo adicionado, removido ou renomeado."
  - registro: plano-laya-integracao-s1s2-pmev-2026-09-20
    caminhos:
      - llm/model_registry.py
    parecer:
      "llm/model_registry.py: cota_por_assinatura=False para toda a familia
      Anthropic e OpenAI (assinaturas flat-fee temporariamente desativadas pelo
      Tier 0 em 2026-11-12); familia Gemini permanece True; nenhum modelo
      adicionado, removido ou renomeado."
  - registro: registro-2026-08-29-governanca-piramidal-sota
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: Tier 0 reescrito com a formula completa de titulos; Gemini 3.1
      Pro reclassificado como PONTUAL via API; status das assinaturas flat-fee
      atualizado (Anthropic/OpenAI temporariamente desativadas, Google AI Studio
      Pro e Devin SWE-2 ativos); ts= declarado carimbo automatico do hook no
      commit."
  - registro: registro-2026-09-01-ancora-de-merge-e-instrucao-indexada
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: Tier 0 reescrito com a formula completa de titulos; Gemini 3.1
      Pro reclassificado como PONTUAL via API; status das assinaturas flat-fee
      atualizado (Anthropic/OpenAI temporariamente desativadas, Google AI Studio
      Pro e Devin SWE-2 ativos); ts= declarado carimbo automatico do hook no
      commit."
  - registro: registro-2026-09-02-correcao-de-escala-e-timestamp-no-ledger
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: Tier 0 reescrito com a formula completa de titulos; Gemini 3.1
      Pro reclassificado como PONTUAL via API; status das assinaturas flat-fee
      atualizado (Anthropic/OpenAI temporariamente desativadas, Google AI Studio
      Pro e Devin SWE-2 ativos); ts= declarado carimbo automatico do hook no
      commit."
  - registro: registro-2026-09-02-portao-de-calibracao-por-sessao
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: Tier 0 reescrito com a formula completa de titulos; Gemini 3.1
      Pro reclassificado como PONTUAL via API; status das assinaturas flat-fee
      atualizado (Anthropic/OpenAI temporariamente desativadas, Google AI Studio
      Pro e Devin SWE-2 ativos); ts= declarado carimbo automatico do hook no
      commit."
  - registro: registro-2026-09-03-triade-fronteira-chico-e-concorrencia
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: Tier 0 reescrito com a formula completa de titulos; Gemini 3.1
      Pro reclassificado como PONTUAL via API; status das assinaturas flat-fee
      atualizado (Anthropic/OpenAI temporariamente desativadas, Google AI Studio
      Pro e Devin SWE-2 ativos); ts= declarado carimbo automatico do hook no
      commit."
  - registro: registro-2026-09-05-regua-para-agente-autonomo-de-nuvem
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: Tier 0 reescrito com a formula completa de titulos; Gemini 3.1
      Pro reclassificado como PONTUAL via API; status das assinaturas flat-fee
      atualizado (Anthropic/OpenAI temporariamente desativadas, Google AI Studio
      Pro e Devin SWE-2 ativos); ts= declarado carimbo automatico do hook no
      commit."
  - registro: registro-2026-09-07-delegacao-gemini-flash-lite-cinco-itens
    caminhos:
      - llm/model_registry.py
      - tests/test_gpt6_astra.py
    parecer:
      "llm/model_registry.py: cota_por_assinatura=False para toda a familia
      Anthropic e OpenAI (assinaturas flat-fee temporariamente desativadas pelo
      Tier 0 em 2026-11-12); familia Gemini permanece True; nenhum modelo
      adicionado, removido ou renomeado. tests/test_gpt6_astra.py: conjunto
      esperado de aliases sem cota atualizado para refletir a suspensao das
      assinaturas Anthropic/OpenAI."
  - registro: registro-2026-09-07-integracao-gpt6-astra-e-retirada-do-fable
    caminhos:
      - CLAUDE.md
      - llm/model_registry.py
      - tests/test_gpt6_astra.py
    parecer:
      "CLAUDE.md: Tier 0 reescrito com a formula completa de titulos; Gemini 3.1
      Pro reclassificado como PONTUAL via API; status das assinaturas flat-fee
      atualizado (Anthropic/OpenAI temporariamente desativadas, Google AI Studio
      Pro e Devin SWE-2 ativos); ts= declarado carimbo automatico do hook no
      commit. llm/model_registry.py: cota_por_assinatura=False para toda a
      familia Anthropic e OpenAI (assinaturas flat-fee temporariamente
      desativadas pelo Tier 0 em 2026-11-12); familia Gemini permanece True;
      nenhum modelo adicionado, removido ou renomeado. tests/test_gpt6_astra.py:
      conjunto esperado de aliases sem cota atualizado para refletir a suspensao
      das assinaturas Anthropic/OpenAI."
  - registro: registro-2026-09-08-adaptacao-gemini-flash-e-saneamento-amostragem
    caminhos:
      - llm/model_registry.py
    parecer:
      "llm/model_registry.py: cota_por_assinatura=False para toda a familia
      Anthropic e OpenAI (assinaturas flat-fee temporariamente desativadas pelo
      Tier 0 em 2026-11-12); familia Gemini permanece True; nenhum modelo
      adicionado, removido ou renomeado."
  - registro: registro-2026-09-08-arbitragem-soberana-sobre-a-lei-de-concorrencia
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: Tier 0 reescrito com a formula completa de titulos; Gemini 3.1
      Pro reclassificado como PONTUAL via API; status das assinaturas flat-fee
      atualizado (Anthropic/OpenAI temporariamente desativadas, Google AI Studio
      Pro e Devin SWE-2 ativos); ts= declarado carimbo automatico do hook no
      commit."
  - registro: registro-2026-09-08-ruff-format-e-o-ci-vermelho
    caminhos:
      - llm/model_registry.py
    parecer:
      "llm/model_registry.py: cota_por_assinatura=False para toda a familia
      Anthropic e OpenAI (assinaturas flat-fee temporariamente desativadas pelo
      Tier 0 em 2026-11-12); familia Gemini permanece True; nenhum modelo
      adicionado, removido ou renomeado."
  - registro: registro-2026-09-09-saneamento-medicao-datada-identificacao-agentes
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: Tier 0 reescrito com a formula completa de titulos; Gemini 3.1
      Pro reclassificado como PONTUAL via API; status das assinaturas flat-fee
      atualizado (Anthropic/OpenAI temporariamente desativadas, Google AI Studio
      Pro e Devin SWE-2 ativos); ts= declarado carimbo automatico do hook no
      commit."
  - registro: registro-2026-09-12-a-identidade-do-antigravity-e-o-catalogo-que-faltava
    caminhos:
      - .husky/commit-msg
      - tests/test_hook_commit_msg.py
    parecer:
      ".husky/commit-msg: injecao automatica de ts= na linha Assinatura quando a
      secao -- existe sem ele (relogio do commit), mais avisos nao-bloqueantes
      para modelo/condutor/sha/supervisao ausentes; logica de identidade autor x
      assinatura inalterada. tests/test_hook_commit_msg.py: tres testes novos
      cobrindo injecao automatica de ts=, ts declarado preservado e avisos
      nao-bloqueantes de campos ausentes."
  - registro: registro-2026-09-12-preludio-o-instrumento-que-sabia-abrir-e-nao-fechar
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: Tier 0 reescrito com a formula completa de titulos; Gemini 3.1
      Pro reclassificado como PONTUAL via API; status das assinaturas flat-fee
      atualizado (Anthropic/OpenAI temporariamente desativadas, Google AI Studio
      Pro e Devin SWE-2 ativos); ts= declarado carimbo automatico do hook no
      commit."
  - registro: registro-2026-09-13-portoes-enxutos-e-horizontais
    caminhos:
      - .husky/commit-msg
    parecer:
      ".husky/commit-msg: injecao automatica de ts= na linha Assinatura quando a
      secao -- existe sem ele (relogio do commit), mais avisos nao-bloqueantes
      para modelo/condutor/sha/supervisao ausentes; logica de identidade autor x
      assinatura inalterada."
  - registro: registro-2026-09-14-correcoes-pos-auditoria-handoff-tier-e-dependencias
    caminhos:
      - CLAUDE.md
      - .husky/commit-msg
      - tests/test_hook_commit_msg.py
    parecer:
      "CLAUDE.md: Tier 0 reescrito com a formula completa de titulos; Gemini 3.1
      Pro reclassificado como PONTUAL via API; status das assinaturas flat-fee
      atualizado (Anthropic/OpenAI temporariamente desativadas, Google AI Studio
      Pro e Devin SWE-2 ativos); ts= declarado carimbo automatico do hook no
      commit. .husky/commit-msg: injecao automatica de ts= na linha Assinatura
      quando a secao -- existe sem ele (relogio do commit), mais avisos
      nao-bloqueantes para modelo/condutor/sha/supervisao ausentes; logica de
      identidade autor x assinatura inalterada. tests/test_hook_commit_msg.py:
      tres testes novos cobrindo injecao automatica de ts=, ts declarado
      preservado e avisos nao-bloqueantes de campos ausentes."
  - registro: registro-2026-09-14-harmonizacao-canonicos-astra-luna-gemini-anthropic
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: Tier 0 reescrito com a formula completa de titulos; Gemini 3.1
      Pro reclassificado como PONTUAL via API; status das assinaturas flat-fee
      atualizado (Anthropic/OpenAI temporariamente desativadas, Google AI Studio
      Pro e Devin SWE-2 ativos); ts= declarado carimbo automatico do hook no
      commit."
  - registro: registro-2026-09-19-refatoracao-sonar-python-e-icm
    caminhos:
      - llm/model_registry.py
    parecer:
      "llm/model_registry.py: cota_por_assinatura=False para toda a familia
      Anthropic e OpenAI (assinaturas flat-fee temporariamente desativadas pelo
      Tier 0 em 2026-11-12); familia Gemini permanece True; nenhum modelo
      adicionado, removido ou renomeado."
  - registro: registro-2026-09-22-skill-handoff-e-calibracao
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: Tier 0 reescrito com a formula completa de titulos; Gemini 3.1
      Pro reclassificado como PONTUAL via API; status das assinaturas flat-fee
      atualizado (Anthropic/OpenAI temporariamente desativadas, Google AI Studio
      Pro e Devin SWE-2 ativos); ts= declarado carimbo automatico do hook no
      commit."
  - registro: registro-2026-09-24-mcp-gateway-compartilhado-e-persistencia
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: Tier 0 reescrito com a formula completa de titulos; Gemini 3.1
      Pro reclassificado como PONTUAL via API; status das assinaturas flat-fee
      atualizado (Anthropic/OpenAI temporariamente desativadas, Google AI Studio
      Pro e Devin SWE-2 ativos); ts= declarado carimbo automatico do hook no
      commit."
  - registro: registro-2026-09-25-precedencia-economica-assinaturas-pro-e-nuvem-free
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: Tier 0 reescrito com a formula completa de titulos; Gemini 3.1
      Pro reclassificado como PONTUAL via API; status das assinaturas flat-fee
      atualizado (Anthropic/OpenAI temporariamente desativadas, Google AI Studio
      Pro e Devin SWE-2 ativos); ts= declarado carimbo automatico do hook no
      commit."
  - registro: registro-2026-09-25-skill-avaliacao-impacto-sessao
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: Tier 0 reescrito com a formula completa de titulos; Gemini 3.1
      Pro reclassificado como PONTUAL via API; status das assinaturas flat-fee
      atualizado (Anthropic/OpenAI temporariamente desativadas, Google AI Studio
      Pro e Devin SWE-2 ativos); ts= declarado carimbo automatico do hook no
      commit."
  - registro: registro-2026-09-25-soberania-commit-push-e-staging-perpetuo
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: Tier 0 reescrito com a formula completa de titulos; Gemini 3.1
      Pro reclassificado como PONTUAL via API; status das assinaturas flat-fee
      atualizado (Anthropic/OpenAI temporariamente desativadas, Google AI Studio
      Pro e Devin SWE-2 ativos); ts= declarado carimbo automatico do hook no
      commit."
  - registro: registro-2026-09-25-teto-de-commits-e-push-obrigatorio
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: Tier 0 reescrito com a formula completa de titulos; Gemini 3.1
      Pro reclassificado como PONTUAL via API; status das assinaturas flat-fee
      atualizado (Anthropic/OpenAI temporariamente desativadas, Google AI Studio
      Pro e Devin SWE-2 ativos); ts= declarado carimbo automatico do hook no
      commit."
  - registro: registro-2026-10-05-regua-de-tier-efetivo-no-catalogo-de-identidade
    caminhos:
      - .husky/commit-msg
      - tests/test_hook_commit_msg.py
    parecer:
      ".husky/commit-msg: injecao automatica de ts= na linha Assinatura quando a
      secao -- existe sem ele (relogio do commit), mais avisos nao-bloqueantes
      para modelo/condutor/sha/supervisao ausentes; logica de identidade autor x
      assinatura inalterada. tests/test_hook_commit_msg.py: tres testes novos
      cobrindo injecao automatica de ts=, ts declarado preservado e avisos
      nao-bloqueantes de campos ausentes."
  - registro: registro-2026-10-20-harmonizacao-tier1-e-gemini-38
    caminhos:
      - CLAUDE.md
      - llm/model_registry.py
      - tests/test_gpt6_astra.py
    parecer:
      "CLAUDE.md: Tier 0 reescrito com a formula completa de titulos; Gemini 3.1
      Pro reclassificado como PONTUAL via API; status das assinaturas flat-fee
      atualizado (Anthropic/OpenAI temporariamente desativadas, Google AI Studio
      Pro e Devin SWE-2 ativos); ts= declarado carimbo automatico do hook no
      commit. llm/model_registry.py: cota_por_assinatura=False para toda a
      familia Anthropic e OpenAI (assinaturas flat-fee temporariamente
      desativadas pelo Tier 0 em 2026-11-12); familia Gemini permanece True;
      nenhum modelo adicionado, removido ou renomeado. tests/test_gpt6_astra.py:
      conjunto esperado de aliases sem cota atualizado para refletir a suspensao
      das assinaturas Anthropic/OpenAI."
  - registro: registro-2026-10-20-saneamento-quality-gate-ascii-e-reconciliacao-de-ancoras
    caminhos:
      - tests/test_hook_commit_msg.py
    parecer:
      "tests/test_hook_commit_msg.py: tres testes novos cobrindo injecao
      automatica de ts=, ts declarado preservado e avisos nao-bloqueantes de
      campos ausentes."
  - registro: registro-2026-11-12-anatomia-assinatura-5-campos
    caminhos:
      - CLAUDE.md
      - .husky/commit-msg
    parecer:
      "CLAUDE.md: Tier 0 reescrito com a formula completa de titulos; Gemini 3.1
      Pro reclassificado como PONTUAL via API; status das assinaturas flat-fee
      atualizado (Anthropic/OpenAI temporariamente desativadas, Google AI Studio
      Pro e Devin SWE-2 ativos); ts= declarado carimbo automatico do hook no
      commit. .husky/commit-msg: injecao automatica de ts= na linha Assinatura
      quando a secao -- existe sem ele (relogio do commit), mais avisos
      nao-bloqueantes para modelo/condutor/sha/supervisao ausentes; logica de
      identidade autor x assinatura inalterada."
  - registro: registro-2026-11-12-pool-multimodal-e-refactors-sonar
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: Tier 0 reescrito com a formula completa de titulos; Gemini 3.1
      Pro reclassificado como PONTUAL via API; status das assinaturas flat-fee
      atualizado (Anthropic/OpenAI temporariamente desativadas, Google AI Studio
      Pro e Devin SWE-2 ativos); ts= declarado carimbo automatico do hook no
      commit."
  - registro: registro-2026-11-12-pools-chaves-reposicao-e-doc-consolidada
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: Tier 0 reescrito com a formula completa de titulos; Gemini 3.1
      Pro reclassificado como PONTUAL via API; status das assinaturas flat-fee
      atualizado (Anthropic/OpenAI temporariamente desativadas, Google AI Studio
      Pro e Devin SWE-2 ativos); ts= declarado carimbo automatico do hook no
      commit."
  - registro: relatorio-2026-06-16-auditoria-e-harmonizacao-v8-gold
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: Tier 0 reescrito com a formula completa de titulos; Gemini 3.1
      Pro reclassificado como PONTUAL via API; status das assinaturas flat-fee
      atualizado (Anthropic/OpenAI temporariamente desativadas, Google AI Studio
      Pro e Devin SWE-2 ativos); ts= declarado carimbo automatico do hook no
      commit."
  - registro: relatorio-2026-08-29-analise-integral-ecossistema-sota-v8-gold
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: Tier 0 reescrito com a formula completa de titulos; Gemini 3.1
      Pro reclassificado como PONTUAL via API; status das assinaturas flat-fee
      atualizado (Anthropic/OpenAI temporariamente desativadas, Google AI Studio
      Pro e Devin SWE-2 ativos); ts= declarado carimbo automatico do hook no
      commit."
  - registro: relatorio-2026-08-29-impacto-quantitativo-qualitativo-sota-v8-gold
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: Tier 0 reescrito com a formula completa de titulos; Gemini 3.1
      Pro reclassificado como PONTUAL via API; status das assinaturas flat-fee
      atualizado (Anthropic/OpenAI temporariamente desativadas, Google AI Studio
      Pro e Devin SWE-2 ativos); ts= declarado carimbo automatico do hook no
      commit."
  - registro: validacao-2026-09-12-a-grade-que-nao-cabia-e-o-aviso-que-virou-bloqueio
    caminhos:
      - CLAUDE.md
      - .husky/commit-msg
      - tests/test_hook_commit_msg.py
    parecer:
      "CLAUDE.md: Tier 0 reescrito com a formula completa de titulos; Gemini 3.1
      Pro reclassificado como PONTUAL via API; status das assinaturas flat-fee
      atualizado (Anthropic/OpenAI temporariamente desativadas, Google AI Studio
      Pro e Devin SWE-2 ativos); ts= declarado carimbo automatico do hook no
      commit. .husky/commit-msg: injecao automatica de ts= na linha Assinatura
      quando a secao -- existe sem ele (relogio do commit), mais avisos
      nao-bloqueantes para modelo/condutor/sha/supervisao ausentes; logica de
      identidade autor x assinatura inalterada. tests/test_hook_commit_msg.py:
      tres testes novos cobrindo injecao automatica de ts=, ts declarado
      preservado e avisos nao-bloqueantes de campos ausentes."
  - registro: validacao-2026-09-12-a-identidade-de-autoria-deixa-de-ser-prosa
    caminhos:
      - CLAUDE.md
      - .husky/commit-msg
      - tests/test_hook_commit_msg.py
    parecer:
      "CLAUDE.md: Tier 0 reescrito com a formula completa de titulos; Gemini 3.1
      Pro reclassificado como PONTUAL via API; status das assinaturas flat-fee
      atualizado (Anthropic/OpenAI temporariamente desativadas, Google AI Studio
      Pro e Devin SWE-2 ativos); ts= declarado carimbo automatico do hook no
      commit. .husky/commit-msg: injecao automatica de ts= na linha Assinatura
      quando a secao -- existe sem ele (relogio do commit), mais avisos
      nao-bloqueantes para modelo/condutor/sha/supervisao ausentes; logica de
      identidade autor x assinatura inalterada. tests/test_hook_commit_msg.py:
      tres testes novos cobrindo injecao automatica de ts=, ts declarado
      preservado e avisos nao-bloqueantes de campos ausentes."
  - registro: taxonomia-canonica-de-documentacao-e-relatorios
    caminhos:
      - CLAUDE.md
    parecer:
      "CLAUDE.md: Tier 0 reescrito com a formula completa de titulos; Gemini 3.1
      Pro reclassificado como PONTUAL via API; status das assinaturas flat-fee
      atualizado (Anthropic/OpenAI temporariamente desativadas, Google AI Studio
      Pro e Devin SWE-2 ativos); ts= declarado carimbo automatico do hook no
      commit."
  - registro: registro-2026-11-07-auditoria-integral-dependabot-github-e-code-scanning
    caminhos:
      - tests/test_hook_commit_msg.py
    parecer:
      "tests/test_hook_commit_msg.py: tres testes novos cobrindo injecao
      automatica de ts=, ts declarado preservado e avisos nao-bloqueantes de
      campos ausentes; nenhuma regra do portao enfraquecida."
pendencias_resolvidas: []
verificado:
  - "177 testes verdes: test_hook_commit_msg + test_gpt6_astra +
    test_model_registry + test_routing_policy"
  - "ruff limpo nos tres arquivos Python alterados"
  - "hook injeta ts= automaticamente (testado) e preserva ts declarado (testado)"
nao_verificado:
  - "Demais condutores fora do Devin ainda nao adotaram a anatomia completa -
    avisos sao nao-bloqueantes por decisao"
  - "Suite completa e gates de commit: executados pelo hook pre-commit deste
    commit"
---

# Governanca de identidades, modelos, condutores e assinaturas (2026-11-12)

## Auditoria

Verificado que a documentacao reflete: cada operador/condutor e UNICO, com
assinatura e registros INDIVIDUAIS (data/agent_identities.json, 15 identidades
canonicas); CHICO e a representacao COLETIVA do Tier 1 - agnostico, cooperativo,
sem feudos funcionais; Raphael Vitoi e Tier 0 com soberania, veto maximo e
arbitrio absoluto.

## Correcoes aplicadas

- **CLAUDE.md SS0:** linha do Tier 0 reescrita com a formula completa (CEO,
  Idealizador, Criador, Lider, Veto Maximo, Arbitro Absoluto, Dev/Engenheiro
  Responsavel, Arquiteto e Direcionador).
- **CLAUDE.md SS0:** Gemini 3.1 Pro reclassificado como PONTUAL via API
  (reasoning frontier denso, fora da identidade de autoria).
- **CLAUDE.md SS3.2 + model_registry.py:** assinaturas flat-fee Anthropic
  Pro/Max e OpenAI Plus/Pro temporariamente desativadas (Tier 0, 2026-11-12) -
  cota_por_assinatura=False em toda a familia; ativas: Google AI Studio Pro e
  Devin Desktop SWE-2 Flash Medium. Correcao de fato: claude-opus-5 e
  claude-sonnet-5 NAO foram aposentados - permanecem fallbacks de resiliencia.
- **.husky/commit-msg:** ts= da Assinatura passa a ser carimbo automatico do
  harness (injecao com o relogio do commit quando omitido);
  modelo/condutor/sha/supervisao ausentes viram aviso nao-bloqueante.
- **tests/test_hook_commit_msg.py:** 3 testes novos para o carimbo.
- **tests/test_gpt6_astra.py:** conjunto sem_cota atualizado (19 aliases).

## Reconciliacao de ancoras

52 registros vigentes ancorados nos caminhos alterados receberam
revisoes_de_ancora com parecer de revisao aditiva.
