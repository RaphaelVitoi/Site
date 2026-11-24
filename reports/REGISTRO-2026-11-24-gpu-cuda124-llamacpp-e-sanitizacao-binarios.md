---
id: registro-2026-11-24-gpu-cuda124-llamacpp-e-sanitizacao-binarios
tipo: registro
escopo: 'Site -- auditoria e higienizacao dos 46 itens pendentes de migracao CUDA 12.4 GTX 1060 6GB: untrack (--cached)
  de 43 binarios ignorados em engine/llama_cpp (*.dll/*.exe), correcao e padronizacao BOM UTF-8/CRLF nos 5 launchers
  PowerShell llama.cpp/Ollama, espacamento MD032 em CLAUDE.md e validacao integral nos portoes SOTA.'
ecossistema: nexus-sota
autor: Gemini 4 Hydrogen <noreply@google.com>
criado_em: '2026-11-24T07:05:00-03:00'
atualizado_em: '2026-11-24T07:05:00-03:00'
commit: HEAD
classes:
- interno
- registro
- infraestrutura
- governanca
- seguranca
caminhos:
- CLAUDE.md
- engine/llama_cpp/start_vulkan_daemon.ps1
- scripts/ops/Start-LlamaVulkan.ps1
- scripts/ops/Start-LlamaVulkanEngine.ps1
- scripts/ops/Start-LocalLlama.ps1
- scripts/start_model.ps1
- reports/REGISTRO-2026-11-24-gpu-cuda124-llamacpp-e-sanitizacao-binarios.md
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  python: 3.14.9
  so: Windows
  gpu: NVIDIA GeForce GTX 1060 6GB (CUDA 13.0, Driver 582.78) + Intel UHD Graphics 630 (31.0.101.2145)
  condutor: Gemini 4 Hydrogen
  planejador_orchestrator: Gemini 4 Neon
  veiculo: antigravity
  tier: 1
  supervisao: assistida
  data_das_medicoes: '2026-11-24'
verificado:
- PowerShell AST + BOM UTF-8 unico + CRLF verificados nos 5 scripts .ps1 (0 erros de sintaxe)
- scripts/start_model.ps1 -- priorizado ollama.exe serve antes do tray ollama app.exe; logs padronizados em start_vulkan_daemon.ps1
  e Start-LlamaVulkan.ps1
- git rm --cached em 43 binarios engine/llama_cpp/*.dll e *.exe (compatibilizacao com .gitignore linhas 51-52; arquivos
  intactos no disco)
- suite_verde.py -- 0 erros, 0 warnings, 1 pulado (frontend DOM), cobertura 67.67%
- cwv_gate.ps1 (5 fases em next start :3000) -- 0 erros, LCP 264.06 ms, TTFB 17.55 ms, CLS 0.00009, MAX_HEAP 10.56
  MB, axe 0, CVE 0, SRI VERIFIED, Higiene Fase 5 (PowerShell51=0, OversizedBlobs=0, UnroutedBinaries=0, RuffFormat=0)
- saude_da_malha.py -- 0 sinais pendentes
nao_verificado:
- CI remoto GitHub Actions pos-push
referencias_nao_resolviveis: []
revisoes_de_ancora:
- registro: taxonomia-canonica-de-documentacao-e-relatorios
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-24. Alteracoes em CLAUDE.md preservam integralmente os invariantes de governanca
    SOTA v8.0 GOLD, migram launchers llama.cpp para CUDA0 (GTX 1060 6GB) com fallback Vulkan0, corrigem scripts/start_model.ps1
    (prioridade ollama.exe serve, BOM UTF-8 unico + CRLF, 0 erros AST), ajustam espacamento MD032 em CLAUDE.md e
    removem apenas do indice Git (--cached) os 43 binarios ignorados em engine/llama_cpp.
- registro: auditoria-2026-09-03-trabalho-do-gemini-3-8-flash
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-24. Alteracoes em CLAUDE.md preservam integralmente os invariantes de governanca
    SOTA v8.0 GOLD, migram launchers llama.cpp para CUDA0 (GTX 1060 6GB) com fallback Vulkan0, corrigem scripts/start_model.ps1
    (prioridade ollama.exe serve, BOM UTF-8 unico + CRLF, 0 erros AST), ajustam espacamento MD032 em CLAUDE.md e
    removem apenas do indice Git (--cached) os 43 binarios ignorados em engine/llama_cpp.
- registro: auditoria-2026-09-12-o-ci-vermelho-que-nenhum-portao-local-media
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-24. Alteracoes em CLAUDE.md preservam integralmente os invariantes de governanca
    SOTA v8.0 GOLD, migram launchers llama.cpp para CUDA0 (GTX 1060 6GB) com fallback Vulkan0, corrigem scripts/start_model.ps1
    (prioridade ollama.exe serve, BOM UTF-8 unico + CRLF, 0 erros AST), ajustam espacamento MD032 em CLAUDE.md e
    removem apenas do indice Git (--cached) os 43 binarios ignorados em engine/llama_cpp.
- registro: auditoria-2026-09-12-proveniencia-executavel-do-feedback
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-24. Alteracoes em CLAUDE.md preservam integralmente os invariantes de governanca
    SOTA v8.0 GOLD, migram launchers llama.cpp para CUDA0 (GTX 1060 6GB) com fallback Vulkan0, corrigem scripts/start_model.ps1
    (prioridade ollama.exe serve, BOM UTF-8 unico + CRLF, 0 erros AST), ajustam espacamento MD032 em CLAUDE.md e
    removem apenas do indice Git (--cached) os 43 binarios ignorados em engine/llama_cpp.
- registro: auditoria-2026-09-22-paridade-config-identidade
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-24. Alteracoes em CLAUDE.md preservam integralmente os invariantes de governanca
    SOTA v8.0 GOLD, migram launchers llama.cpp para CUDA0 (GTX 1060 6GB) com fallback Vulkan0, corrigem scripts/start_model.ps1
    (prioridade ollama.exe serve, BOM UTF-8 unico + CRLF, 0 erros AST), ajustam espacamento MD032 em CLAUDE.md e
    removem apenas do indice Git (--cached) os 43 binarios ignorados em engine/llama_cpp.
- registro: auditoria-2026-09-24-mcp-gateway-compartilhado-e-persistencia
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-24. Alteracoes em CLAUDE.md preservam integralmente os invariantes de governanca
    SOTA v8.0 GOLD, migram launchers llama.cpp para CUDA0 (GTX 1060 6GB) com fallback Vulkan0, corrigem scripts/start_model.ps1
    (prioridade ollama.exe serve, BOM UTF-8 unico + CRLF, 0 erros AST), ajustam espacamento MD032 em CLAUDE.md e
    removem apenas do indice Git (--cached) os 43 binarios ignorados em engine/llama_cpp.
- registro: auditoria-2026-11-18-pools-chaves-observatorio-e-roteamento
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-24. Alteracoes em CLAUDE.md preservam integralmente os invariantes de governanca
    SOTA v8.0 GOLD, migram launchers llama.cpp para CUDA0 (GTX 1060 6GB) com fallback Vulkan0, corrigem scripts/start_model.ps1
    (prioridade ollama.exe serve, BOM UTF-8 unico + CRLF, 0 erros AST), ajustam espacamento MD032 em CLAUDE.md e
    removem apenas do indice Git (--cached) os 43 binarios ignorados em engine/llama_cpp.
- registro: checkpoint-2026-06-14-infrastructure-hardening
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-24. Alteracoes em CLAUDE.md preservam integralmente os invariantes de governanca
    SOTA v8.0 GOLD, migram launchers llama.cpp para CUDA0 (GTX 1060 6GB) com fallback Vulkan0, corrigem scripts/start_model.ps1
    (prioridade ollama.exe serve, BOM UTF-8 unico + CRLF, 0 erros AST), ajustam espacamento MD032 em CLAUDE.md e
    removem apenas do indice Git (--cached) os 43 binarios ignorados em engine/llama_cpp.
- registro: handoff-2026-09-12-reconciliacao-calibracao-e-proveniencia
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-24. Alteracoes em CLAUDE.md preservam integralmente os invariantes de governanca
    SOTA v8.0 GOLD, migram launchers llama.cpp para CUDA0 (GTX 1060 6GB) com fallback Vulkan0, corrigem scripts/start_model.ps1
    (prioridade ollama.exe serve, BOM UTF-8 unico + CRLF, 0 erros AST), ajustam espacamento MD032 em CLAUDE.md e
    removem apenas do indice Git (--cached) os 43 binarios ignorados em engine/llama_cpp.
- registro: handoff-2026-09-22-integracao-system1-llm-dashboard
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-24. Alteracoes em CLAUDE.md preservam integralmente os invariantes de governanca
    SOTA v8.0 GOLD, migram launchers llama.cpp para CUDA0 (GTX 1060 6GB) com fallback Vulkan0, corrigem scripts/start_model.ps1
    (prioridade ollama.exe serve, BOM UTF-8 unico + CRLF, 0 erros AST), ajustam espacamento MD032 em CLAUDE.md e
    removem apenas do indice Git (--cached) os 43 binarios ignorados em engine/llama_cpp.
- registro: handoff-2026-09-22-paridade-config-identidade
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-24. Alteracoes em CLAUDE.md preservam integralmente os invariantes de governanca
    SOTA v8.0 GOLD, migram launchers llama.cpp para CUDA0 (GTX 1060 6GB) com fallback Vulkan0, corrigem scripts/start_model.ps1
    (prioridade ollama.exe serve, BOM UTF-8 unico + CRLF, 0 erros AST), ajustam espacamento MD032 em CLAUDE.md e
    removem apenas do indice Git (--cached) os 43 binarios ignorados em engine/llama_cpp.
- registro: handoff-2026-09-25-governanca-pools-openrouter-e-impacto
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-24. Alteracoes em CLAUDE.md preservam integralmente os invariantes de governanca
    SOTA v8.0 GOLD, migram launchers llama.cpp para CUDA0 (GTX 1060 6GB) com fallback Vulkan0, corrigem scripts/start_model.ps1
    (prioridade ollama.exe serve, BOM UTF-8 unico + CRLF, 0 erros AST), ajustam espacamento MD032 em CLAUDE.md e
    removem apenas do indice Git (--cached) os 43 binarios ignorados em engine/llama_cpp.
- registro: handoff-2026-09-25-modelos-locais-saneamento-e-homeostase
  caminhos:
  - scripts/ops/Start-LocalLlama.ps1
  parecer: Revisado em 2026-11-24. Alteracoes em scripts/ops/Start-LocalLlama.ps1 preservam integralmente os invariantes
    de governanca SOTA v8.0 GOLD, migram launchers llama.cpp para CUDA0 (GTX 1060 6GB) com fallback Vulkan0, corrigem
    scripts/start_model.ps1 (prioridade ollama.exe serve, BOM UTF-8 unico + CRLF, 0 erros AST), ajustam espacamento
    MD032 em CLAUDE.md e removem apenas do indice Git (--cached) os 43 binarios ignorados em engine/llama_cpp.
- registro: handoff-2026-09-29-contraste-acessibilidade-e-identidade-de-condutor
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-24. Alteracoes em CLAUDE.md preservam integralmente os invariantes de governanca
    SOTA v8.0 GOLD, migram launchers llama.cpp para CUDA0 (GTX 1060 6GB) com fallback Vulkan0, corrigem scripts/start_model.ps1
    (prioridade ollama.exe serve, BOM UTF-8 unico + CRLF, 0 erros AST), ajustam espacamento MD032 em CLAUDE.md e
    removem apenas do indice Git (--cached) os 43 binarios ignorados em engine/llama_cpp.
- registro: handoff-2026-09-30-expurgo-de-modelos-obsoletos-harmonizacao-qwen-e-calibracao
  caminhos:
  - scripts/start_model.ps1
  parecer: Revisado em 2026-11-24. Alteracoes em scripts/start_model.ps1 preservam integralmente os invariantes
    de governanca SOTA v8.0 GOLD, migram launchers llama.cpp para CUDA0 (GTX 1060 6GB) com fallback Vulkan0, corrigem
    scripts/start_model.ps1 (prioridade ollama.exe serve, BOM UTF-8 unico + CRLF, 0 erros AST), ajustam espacamento
    MD032 em CLAUDE.md e removem apenas do indice Git (--cached) os 43 binarios ignorados em engine/llama_cpp.
- registro: handoff-2026-10-20-harmonizacao-tier1-gemini-38
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-24. Alteracoes em CLAUDE.md preservam integralmente os invariantes de governanca
    SOTA v8.0 GOLD, migram launchers llama.cpp para CUDA0 (GTX 1060 6GB) com fallback Vulkan0, corrigem scripts/start_model.ps1
    (prioridade ollama.exe serve, BOM UTF-8 unico + CRLF, 0 erros AST), ajustam espacamento MD032 em CLAUDE.md e
    removem apenas do indice Git (--cached) os 43 binarios ignorados em engine/llama_cpp.
- registro: handoff-2026-11-18-deps-openrouter-free-worker-hud-e-calibracao
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-24. Alteracoes em CLAUDE.md preservam integralmente os invariantes de governanca
    SOTA v8.0 GOLD, migram launchers llama.cpp para CUDA0 (GTX 1060 6GB) com fallback Vulkan0, corrigem scripts/start_model.ps1
    (prioridade ollama.exe serve, BOM UTF-8 unico + CRLF, 0 erros AST), ajustam espacamento MD032 em CLAUDE.md e
    removem apenas do indice Git (--cached) os 43 binarios ignorados em engine/llama_cpp.
- registro: handoff-2026-11-18-observatorio-chaves-roteamento-e-calibracao
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-24. Alteracoes em CLAUDE.md preservam integralmente os invariantes de governanca
    SOTA v8.0 GOLD, migram launchers llama.cpp para CUDA0 (GTX 1060 6GB) com fallback Vulkan0, corrigem scripts/start_model.ps1
    (prioridade ollama.exe serve, BOM UTF-8 unico + CRLF, 0 erros AST), ajustam espacamento MD032 em CLAUDE.md e
    removem apenas do indice Git (--cached) os 43 binarios ignorados em engine/llama_cpp.
- registro: handoff-2026-11-21-deps-sota-roi-neon-orchestrator-e-calibracao
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-24. Alteracoes em CLAUDE.md preservam integralmente os invariantes de governanca
    SOTA v8.0 GOLD, migram launchers llama.cpp para CUDA0 (GTX 1060 6GB) com fallback Vulkan0, corrigem scripts/start_model.ps1
    (prioridade ollama.exe serve, BOM UTF-8 unico + CRLF, 0 erros AST), ajustam espacamento MD032 em CLAUDE.md e
    removem apenas do indice Git (--cached) os 43 binarios ignorados em engine/llama_cpp.
- registro: registro-2026-09-01-ancora-de-merge-e-instrucao-indexada
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-24. Alteracoes em CLAUDE.md preservam integralmente os invariantes de governanca
    SOTA v8.0 GOLD, migram launchers llama.cpp para CUDA0 (GTX 1060 6GB) com fallback Vulkan0, corrigem scripts/start_model.ps1
    (prioridade ollama.exe serve, BOM UTF-8 unico + CRLF, 0 erros AST), ajustam espacamento MD032 em CLAUDE.md e
    removem apenas do indice Git (--cached) os 43 binarios ignorados em engine/llama_cpp.
- registro: registro-2026-09-02-correcao-de-escala-e-timestamp-no-ledger
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-24. Alteracoes em CLAUDE.md preservam integralmente os invariantes de governanca
    SOTA v8.0 GOLD, migram launchers llama.cpp para CUDA0 (GTX 1060 6GB) com fallback Vulkan0, corrigem scripts/start_model.ps1
    (prioridade ollama.exe serve, BOM UTF-8 unico + CRLF, 0 erros AST), ajustam espacamento MD032 em CLAUDE.md e
    removem apenas do indice Git (--cached) os 43 binarios ignorados em engine/llama_cpp.
- registro: registro-2026-09-02-portao-de-calibracao-por-sessao
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-24. Alteracoes em CLAUDE.md preservam integralmente os invariantes de governanca
    SOTA v8.0 GOLD, migram launchers llama.cpp para CUDA0 (GTX 1060 6GB) com fallback Vulkan0, corrigem scripts/start_model.ps1
    (prioridade ollama.exe serve, BOM UTF-8 unico + CRLF, 0 erros AST), ajustam espacamento MD032 em CLAUDE.md e
    removem apenas do indice Git (--cached) os 43 binarios ignorados em engine/llama_cpp.
- registro: registro-2026-09-03-triade-fronteira-chico-e-concorrencia
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-24. Alteracoes em CLAUDE.md preservam integralmente os invariantes de governanca
    SOTA v8.0 GOLD, migram launchers llama.cpp para CUDA0 (GTX 1060 6GB) com fallback Vulkan0, corrigem scripts/start_model.ps1
    (prioridade ollama.exe serve, BOM UTF-8 unico + CRLF, 0 erros AST), ajustam espacamento MD032 em CLAUDE.md e
    removem apenas do indice Git (--cached) os 43 binarios ignorados em engine/llama_cpp.
- registro: registro-2026-09-05-regua-para-agente-autonomo-de-nuvem
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-24. Alteracoes em CLAUDE.md preservam integralmente os invariantes de governanca
    SOTA v8.0 GOLD, migram launchers llama.cpp para CUDA0 (GTX 1060 6GB) com fallback Vulkan0, corrigem scripts/start_model.ps1
    (prioridade ollama.exe serve, BOM UTF-8 unico + CRLF, 0 erros AST), ajustam espacamento MD032 em CLAUDE.md e
    removem apenas do indice Git (--cached) os 43 binarios ignorados em engine/llama_cpp.
- registro: registro-2026-09-05-saneamento-nexus-ollama-e-auto-diagnostico
  caminhos:
  - scripts/start_model.ps1
  parecer: Revisado em 2026-11-24. Alteracoes em scripts/start_model.ps1 preservam integralmente os invariantes
    de governanca SOTA v8.0 GOLD, migram launchers llama.cpp para CUDA0 (GTX 1060 6GB) com fallback Vulkan0, corrigem
    scripts/start_model.ps1 (prioridade ollama.exe serve, BOM UTF-8 unico + CRLF, 0 erros AST), ajustam espacamento
    MD032 em CLAUDE.md e removem apenas do indice Git (--cached) os 43 binarios ignorados em engine/llama_cpp.
- registro: registro-2026-09-07-integracao-gpt6-astra-e-retirada-do-fable
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-24. Alteracoes em CLAUDE.md preservam integralmente os invariantes de governanca
    SOTA v8.0 GOLD, migram launchers llama.cpp para CUDA0 (GTX 1060 6GB) com fallback Vulkan0, corrigem scripts/start_model.ps1
    (prioridade ollama.exe serve, BOM UTF-8 unico + CRLF, 0 erros AST), ajustam espacamento MD032 em CLAUDE.md e
    removem apenas do indice Git (--cached) os 43 binarios ignorados em engine/llama_cpp.
- registro: registro-2026-09-08-arbitragem-soberana-sobre-a-lei-de-concorrencia
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-24. Alteracoes em CLAUDE.md preservam integralmente os invariantes de governanca
    SOTA v8.0 GOLD, migram launchers llama.cpp para CUDA0 (GTX 1060 6GB) com fallback Vulkan0, corrigem scripts/start_model.ps1
    (prioridade ollama.exe serve, BOM UTF-8 unico + CRLF, 0 erros AST), ajustam espacamento MD032 em CLAUDE.md e
    removem apenas do indice Git (--cached) os 43 binarios ignorados em engine/llama_cpp.
- registro: registro-2026-09-09-saneamento-medicao-datada-identificacao-agentes
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-24. Alteracoes em CLAUDE.md preservam integralmente os invariantes de governanca
    SOTA v8.0 GOLD, migram launchers llama.cpp para CUDA0 (GTX 1060 6GB) com fallback Vulkan0, corrigem scripts/start_model.ps1
    (prioridade ollama.exe serve, BOM UTF-8 unico + CRLF, 0 erros AST), ajustam espacamento MD032 em CLAUDE.md e
    removem apenas do indice Git (--cached) os 43 binarios ignorados em engine/llama_cpp.
- registro: registro-2026-09-12-preludio-o-instrumento-que-sabia-abrir-e-nao-fechar
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-24. Alteracoes em CLAUDE.md preservam integralmente os invariantes de governanca
    SOTA v8.0 GOLD, migram launchers llama.cpp para CUDA0 (GTX 1060 6GB) com fallback Vulkan0, corrigem scripts/start_model.ps1
    (prioridade ollama.exe serve, BOM UTF-8 unico + CRLF, 0 erros AST), ajustam espacamento MD032 em CLAUDE.md e
    removem apenas do indice Git (--cached) os 43 binarios ignorados em engine/llama_cpp.
- registro: registro-2026-09-14-correcoes-pos-auditoria-handoff-tier-e-dependencias
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-24. Alteracoes em CLAUDE.md preservam integralmente os invariantes de governanca
    SOTA v8.0 GOLD, migram launchers llama.cpp para CUDA0 (GTX 1060 6GB) com fallback Vulkan0, corrigem scripts/start_model.ps1
    (prioridade ollama.exe serve, BOM UTF-8 unico + CRLF, 0 erros AST), ajustam espacamento MD032 em CLAUDE.md e
    removem apenas do indice Git (--cached) os 43 binarios ignorados em engine/llama_cpp.
- registro: registro-2026-09-14-harmonizacao-canonicos-astra-luna-gemini-anthropic
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-24. Alteracoes em CLAUDE.md preservam integralmente os invariantes de governanca
    SOTA v8.0 GOLD, migram launchers llama.cpp para CUDA0 (GTX 1060 6GB) com fallback Vulkan0, corrigem scripts/start_model.ps1
    (prioridade ollama.exe serve, BOM UTF-8 unico + CRLF, 0 erros AST), ajustam espacamento MD032 em CLAUDE.md e
    removem apenas do indice Git (--cached) os 43 binarios ignorados em engine/llama_cpp.
- registro: registro-2026-09-22-skill-handoff-e-calibracao
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-24. Alteracoes em CLAUDE.md preservam integralmente os invariantes de governanca
    SOTA v8.0 GOLD, migram launchers llama.cpp para CUDA0 (GTX 1060 6GB) com fallback Vulkan0, corrigem scripts/start_model.ps1
    (prioridade ollama.exe serve, BOM UTF-8 unico + CRLF, 0 erros AST), ajustam espacamento MD032 em CLAUDE.md e
    removem apenas do indice Git (--cached) os 43 binarios ignorados em engine/llama_cpp.
- registro: registro-2026-09-24-mcp-gateway-compartilhado-e-persistencia
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-24. Alteracoes em CLAUDE.md preservam integralmente os invariantes de governanca
    SOTA v8.0 GOLD, migram launchers llama.cpp para CUDA0 (GTX 1060 6GB) com fallback Vulkan0, corrigem scripts/start_model.ps1
    (prioridade ollama.exe serve, BOM UTF-8 unico + CRLF, 0 erros AST), ajustam espacamento MD032 em CLAUDE.md e
    removem apenas do indice Git (--cached) os 43 binarios ignorados em engine/llama_cpp.
- registro: registro-2026-09-25-integracao-qwen-coder-e-blindagem-testes
  caminhos:
  - scripts/ops/Start-LocalLlama.ps1
  parecer: Revisado em 2026-11-24. Alteracoes em scripts/ops/Start-LocalLlama.ps1 preservam integralmente os invariantes
    de governanca SOTA v8.0 GOLD, migram launchers llama.cpp para CUDA0 (GTX 1060 6GB) com fallback Vulkan0, corrigem
    scripts/start_model.ps1 (prioridade ollama.exe serve, BOM UTF-8 unico + CRLF, 0 erros AST), ajustam espacamento
    MD032 em CLAUDE.md e removem apenas do indice Git (--cached) os 43 binarios ignorados em engine/llama_cpp.
- registro: registro-2026-09-25-modelos-locais-llama-g9v3-ling3
  caminhos:
  - scripts/ops/Start-LocalLlama.ps1
  parecer: Revisado em 2026-11-24. Alteracoes em scripts/ops/Start-LocalLlama.ps1 preservam integralmente os invariantes
    de governanca SOTA v8.0 GOLD, migram launchers llama.cpp para CUDA0 (GTX 1060 6GB) com fallback Vulkan0, corrigem
    scripts/start_model.ps1 (prioridade ollama.exe serve, BOM UTF-8 unico + CRLF, 0 erros AST), ajustam espacamento
    MD032 em CLAUDE.md e removem apenas do indice Git (--cached) os 43 binarios ignorados em engine/llama_cpp.
- registro: registro-2026-09-25-precedencia-economica-assinaturas-pro-e-nuvem-free
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-24. Alteracoes em CLAUDE.md preservam integralmente os invariantes de governanca
    SOTA v8.0 GOLD, migram launchers llama.cpp para CUDA0 (GTX 1060 6GB) com fallback Vulkan0, corrigem scripts/start_model.ps1
    (prioridade ollama.exe serve, BOM UTF-8 unico + CRLF, 0 erros AST), ajustam espacamento MD032 em CLAUDE.md e
    removem apenas do indice Git (--cached) os 43 binarios ignorados em engine/llama_cpp.
- registro: registro-2026-09-25-skill-avaliacao-impacto-sessao
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-24. Alteracoes em CLAUDE.md preservam integralmente os invariantes de governanca
    SOTA v8.0 GOLD, migram launchers llama.cpp para CUDA0 (GTX 1060 6GB) com fallback Vulkan0, corrigem scripts/start_model.ps1
    (prioridade ollama.exe serve, BOM UTF-8 unico + CRLF, 0 erros AST), ajustam espacamento MD032 em CLAUDE.md e
    removem apenas do indice Git (--cached) os 43 binarios ignorados em engine/llama_cpp.
- registro: registro-2026-09-25-soberania-commit-push-e-staging-perpetuo
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-24. Alteracoes em CLAUDE.md preservam integralmente os invariantes de governanca
    SOTA v8.0 GOLD, migram launchers llama.cpp para CUDA0 (GTX 1060 6GB) com fallback Vulkan0, corrigem scripts/start_model.ps1
    (prioridade ollama.exe serve, BOM UTF-8 unico + CRLF, 0 erros AST), ajustam espacamento MD032 em CLAUDE.md e
    removem apenas do indice Git (--cached) os 43 binarios ignorados em engine/llama_cpp.
- registro: registro-2026-09-25-teto-de-commits-e-push-obrigatorio
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-24. Alteracoes em CLAUDE.md preservam integralmente os invariantes de governanca
    SOTA v8.0 GOLD, migram launchers llama.cpp para CUDA0 (GTX 1060 6GB) com fallback Vulkan0, corrigem scripts/start_model.ps1
    (prioridade ollama.exe serve, BOM UTF-8 unico + CRLF, 0 erros AST), ajustam espacamento MD032 em CLAUDE.md e
    removem apenas do indice Git (--cached) os 43 binarios ignorados em engine/llama_cpp.
- registro: registro-2026-09-30-expurgo-de-modelos-obsoletos-e-reconciliacao-de-ancoras
  caminhos:
  - scripts/start_model.ps1
  parecer: Revisado em 2026-11-24. Alteracoes em scripts/start_model.ps1 preservam integralmente os invariantes
    de governanca SOTA v8.0 GOLD, migram launchers llama.cpp para CUDA0 (GTX 1060 6GB) com fallback Vulkan0, corrigem
    scripts/start_model.ps1 (prioridade ollama.exe serve, BOM UTF-8 unico + CRLF, 0 erros AST), ajustam espacamento
    MD032 em CLAUDE.md e removem apenas do indice Git (--cached) os 43 binarios ignorados em engine/llama_cpp.
- registro: registro-2026-10-20-harmonizacao-tier1-e-gemini-38
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-24. Alteracoes em CLAUDE.md preservam integralmente os invariantes de governanca
    SOTA v8.0 GOLD, migram launchers llama.cpp para CUDA0 (GTX 1060 6GB) com fallback Vulkan0, corrigem scripts/start_model.ps1
    (prioridade ollama.exe serve, BOM UTF-8 unico + CRLF, 0 erros AST), ajustam espacamento MD032 em CLAUDE.md e
    removem apenas do indice Git (--cached) os 43 binarios ignorados em engine/llama_cpp.
- registro: registro-2026-11-12-anatomia-assinatura-5-campos
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-24. Alteracoes em CLAUDE.md preservam integralmente os invariantes de governanca
    SOTA v8.0 GOLD, migram launchers llama.cpp para CUDA0 (GTX 1060 6GB) com fallback Vulkan0, corrigem scripts/start_model.ps1
    (prioridade ollama.exe serve, BOM UTF-8 unico + CRLF, 0 erros AST), ajustam espacamento MD032 em CLAUDE.md e
    removem apenas do indice Git (--cached) os 43 binarios ignorados em engine/llama_cpp.
- registro: registro-2026-11-12-arquitetura-s1-s2-llama-vulkan
  caminhos:
  - scripts/ops/Start-LlamaVulkan.ps1
  parecer: Revisado em 2026-11-24. Alteracoes em scripts/ops/Start-LlamaVulkan.ps1 preservam integralmente os invariantes
    de governanca SOTA v8.0 GOLD, migram launchers llama.cpp para CUDA0 (GTX 1060 6GB) com fallback Vulkan0, corrigem
    scripts/start_model.ps1 (prioridade ollama.exe serve, BOM UTF-8 unico + CRLF, 0 erros AST), ajustam espacamento
    MD032 em CLAUDE.md e removem apenas do indice Git (--cached) os 43 binarios ignorados em engine/llama_cpp.
- registro: registro-2026-11-12-governanca-identidades-e-assinaturas
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-24. Alteracoes em CLAUDE.md preservam integralmente os invariantes de governanca
    SOTA v8.0 GOLD, migram launchers llama.cpp para CUDA0 (GTX 1060 6GB) com fallback Vulkan0, corrigem scripts/start_model.ps1
    (prioridade ollama.exe serve, BOM UTF-8 unico + CRLF, 0 erros AST), ajustam espacamento MD032 em CLAUDE.md e
    removem apenas do indice Git (--cached) os 43 binarios ignorados em engine/llama_cpp.
- registro: registro-2026-11-12-pool-multimodal-e-refactors-sonar
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-24. Alteracoes em CLAUDE.md preservam integralmente os invariantes de governanca
    SOTA v8.0 GOLD, migram launchers llama.cpp para CUDA0 (GTX 1060 6GB) com fallback Vulkan0, corrigem scripts/start_model.ps1
    (prioridade ollama.exe serve, BOM UTF-8 unico + CRLF, 0 erros AST), ajustam espacamento MD032 em CLAUDE.md e
    removem apenas do indice Git (--cached) os 43 binarios ignorados em engine/llama_cpp.
- registro: registro-2026-11-12-pools-chaves-reposicao-e-doc-consolidada
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-24. Alteracoes em CLAUDE.md preservam integralmente os invariantes de governanca
    SOTA v8.0 GOLD, migram launchers llama.cpp para CUDA0 (GTX 1060 6GB) com fallback Vulkan0, corrigem scripts/start_model.ps1
    (prioridade ollama.exe serve, BOM UTF-8 unico + CRLF, 0 erros AST), ajustam espacamento MD032 em CLAUDE.md e
    removem apenas do indice Git (--cached) os 43 binarios ignorados em engine/llama_cpp.
- registro: registro-2026-11-12-preferencia-devin-e-data-governanca
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-24. Alteracoes em CLAUDE.md preservam integralmente os invariantes de governanca
    SOTA v8.0 GOLD, migram launchers llama.cpp para CUDA0 (GTX 1060 6GB) com fallback Vulkan0, corrigem scripts/start_model.ps1
    (prioridade ollama.exe serve, BOM UTF-8 unico + CRLF, 0 erros AST), ajustam espacamento MD032 em CLAUDE.md e
    removem apenas do indice Git (--cached) os 43 binarios ignorados em engine/llama_cpp.
- registro: registro-2026-11-12-review-sweeps-endurecimento-sota
  caminhos:
  - scripts/ops/Start-LlamaVulkan.ps1
  parecer: Revisado em 2026-11-24. Alteracoes em scripts/ops/Start-LlamaVulkan.ps1 preservam integralmente os invariantes
    de governanca SOTA v8.0 GOLD, migram launchers llama.cpp para CUDA0 (GTX 1060 6GB) com fallback Vulkan0, corrigem
    scripts/start_model.ps1 (prioridade ollama.exe serve, BOM UTF-8 unico + CRLF, 0 erros AST), ajustam espacamento
    MD032 em CLAUDE.md e removem apenas do indice Git (--cached) os 43 binarios ignorados em engine/llama_cpp.
- registro: registro-2026-11-14-correcao-devin-e-entrypoints-gemini-3-1-pro
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-24. Alteracoes em CLAUDE.md preservam integralmente os invariantes de governanca
    SOTA v8.0 GOLD, migram launchers llama.cpp para CUDA0 (GTX 1060 6GB) com fallback Vulkan0, corrigem scripts/start_model.ps1
    (prioridade ollama.exe serve, BOM UTF-8 unico + CRLF, 0 erros AST), ajustam espacamento MD032 em CLAUDE.md e
    removem apenas do indice Git (--cached) os 43 binarios ignorados em engine/llama_cpp.
- registro: registro-2026-11-14-identidade-e-governanca-gemini-4-hydrogen
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-24. Alteracoes em CLAUDE.md preservam integralmente os invariantes de governanca
    SOTA v8.0 GOLD, migram launchers llama.cpp para CUDA0 (GTX 1060 6GB) com fallback Vulkan0, corrigem scripts/start_model.ps1
    (prioridade ollama.exe serve, BOM UTF-8 unico + CRLF, 0 erros AST), ajustam espacamento MD032 em CLAUDE.md e
    removem apenas do indice Git (--cached) os 43 binarios ignorados em engine/llama_cpp.
- registro: registro-2026-11-14-llama-cpp-b12387-router-9931
  caminhos:
  - engine/llama_cpp/start_vulkan_daemon.ps1
  - scripts/ops/Start-LlamaVulkan.ps1
  - scripts/ops/Start-LocalLlama.ps1
  parecer: Revisado em 2026-11-24. Alteracoes em engine/llama_cpp/start_vulkan_daemon.ps1, scripts/ops/Start-LlamaVulkan.ps1,
    scripts/ops/Start-LocalLlama.ps1 preservam integralmente os invariantes de governanca SOTA v8.0 GOLD, migram
    launchers llama.cpp para CUDA0 (GTX 1060 6GB) com fallback Vulkan0, corrigem scripts/start_model.ps1 (prioridade
    ollama.exe serve, BOM UTF-8 unico + CRLF, 0 erros AST), ajustam espacamento MD032 em CLAUDE.md e removem apenas
    do indice Git (--cached) os 43 binarios ignorados em engine/llama_cpp.
- registro: registro-2026-11-14-regua-graduada-familia-gemini-tier1
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-24. Alteracoes em CLAUDE.md preservam integralmente os invariantes de governanca
    SOTA v8.0 GOLD, migram launchers llama.cpp para CUDA0 (GTX 1060 6GB) com fallback Vulkan0, corrigem scripts/start_model.ps1
    (prioridade ollama.exe serve, BOM UTF-8 unico + CRLF, 0 erros AST), ajustam espacamento MD032 em CLAUDE.md e
    removem apenas do indice Git (--cached) os 43 binarios ignorados em engine/llama_cpp.
- registro: registro-2026-11-15-blindagem-calibracao-presencial-tier0
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-24. Alteracoes em CLAUDE.md preservam integralmente os invariantes de governanca
    SOTA v8.0 GOLD, migram launchers llama.cpp para CUDA0 (GTX 1060 6GB) com fallback Vulkan0, corrigem scripts/start_model.ps1
    (prioridade ollama.exe serve, BOM UTF-8 unico + CRLF, 0 erros AST), ajustam espacamento MD032 em CLAUDE.md e
    removem apenas do indice Git (--cached) os 43 binarios ignorados em engine/llama_cpp.
- registro: registro-2026-11-15-start-vulkan-daemon-e-license-plaintext
  caminhos:
  - engine/llama_cpp/start_vulkan_daemon.ps1
  parecer: Revisado em 2026-11-24. Alteracoes em engine/llama_cpp/start_vulkan_daemon.ps1 preservam integralmente
    os invariantes de governanca SOTA v8.0 GOLD, migram launchers llama.cpp para CUDA0 (GTX 1060 6GB) com fallback
    Vulkan0, corrigem scripts/start_model.ps1 (prioridade ollama.exe serve, BOM UTF-8 unico + CRLF, 0 erros AST),
    ajustam espacamento MD032 em CLAUDE.md e removem apenas do indice Git (--cached) os 43 binarios ignorados em
    engine/llama_cpp.
- registro: registro-2026-11-17-arbitragem-soberana-bypass-portao
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-24. Alteracoes em CLAUDE.md preservam integralmente os invariantes de governanca
    SOTA v8.0 GOLD, migram launchers llama.cpp para CUDA0 (GTX 1060 6GB) com fallback Vulkan0, corrigem scripts/start_model.ps1
    (prioridade ollama.exe serve, BOM UTF-8 unico + CRLF, 0 erros AST), ajustam espacamento MD032 em CLAUDE.md e
    removem apenas do indice Git (--cached) os 43 binarios ignorados em engine/llama_cpp.
- registro: registro-2026-11-17-auto-configuracao-harness-devin-swe2
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-24. Alteracoes em CLAUDE.md preservam integralmente os invariantes de governanca
    SOTA v8.0 GOLD, migram launchers llama.cpp para CUDA0 (GTX 1060 6GB) com fallback Vulkan0, corrigem scripts/start_model.ps1
    (prioridade ollama.exe serve, BOM UTF-8 unico + CRLF, 0 erros AST), ajustam espacamento MD032 em CLAUDE.md e
    removem apenas do indice Git (--cached) os 43 binarios ignorados em engine/llama_cpp.
- registro: registro-2026-11-17-fase-4-governanca-estrutural-sota
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-24. Alteracoes em CLAUDE.md preservam integralmente os invariantes de governanca
    SOTA v8.0 GOLD, migram launchers llama.cpp para CUDA0 (GTX 1060 6GB) com fallback Vulkan0, corrigem scripts/start_model.ps1
    (prioridade ollama.exe serve, BOM UTF-8 unico + CRLF, 0 erros AST), ajustam espacamento MD032 em CLAUDE.md e
    removem apenas do indice Git (--cached) os 43 binarios ignorados em engine/llama_cpp.
- registro: registro-2026-11-18-escopo-causal-reteste-e-arbitragem-tier0
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-24. Alteracoes em CLAUDE.md preservam integralmente os invariantes de governanca
    SOTA v8.0 GOLD, migram launchers llama.cpp para CUDA0 (GTX 1060 6GB) com fallback Vulkan0, corrigem scripts/start_model.ps1
    (prioridade ollama.exe serve, BOM UTF-8 unico + CRLF, 0 erros AST), ajustam espacamento MD032 em CLAUDE.md e
    removem apenas do indice Git (--cached) os 43 binarios ignorados em engine/llama_cpp.
- registro: registro-2026-11-18-worker-hud-governanca-argon-hydrogen-e-handoff
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-24. Alteracoes em CLAUDE.md preservam integralmente os invariantes de governanca
    SOTA v8.0 GOLD, migram launchers llama.cpp para CUDA0 (GTX 1060 6GB) com fallback Vulkan0, corrigem scripts/start_model.ps1
    (prioridade ollama.exe serve, BOM UTF-8 unico + CRLF, 0 erros AST), ajustam espacamento MD032 em CLAUDE.md e
    removem apenas do indice Git (--cached) os 43 binarios ignorados em engine/llama_cpp.
- registro: registro-2026-11-21-deps-sota-roi-neon-orchestrator-e-calibracao
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-24. Alteracoes em CLAUDE.md preservam integralmente os invariantes de governanca
    SOTA v8.0 GOLD, migram launchers llama.cpp para CUDA0 (GTX 1060 6GB) com fallback Vulkan0, corrigem scripts/start_model.ps1
    (prioridade ollama.exe serve, BOM UTF-8 unico + CRLF, 0 erros AST), ajustam espacamento MD032 em CLAUDE.md e
    removem apenas do indice Git (--cached) os 43 binarios ignorados em engine/llama_cpp.
- registro: registro-2026-11-22-icm-rules-ssot-e-roi-s1
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-24. Alteracoes em CLAUDE.md preservam integralmente os invariantes de governanca
    SOTA v8.0 GOLD, migram launchers llama.cpp para CUDA0 (GTX 1060 6GB) com fallback Vulkan0, corrigem scripts/start_model.ps1
    (prioridade ollama.exe serve, BOM UTF-8 unico + CRLF, 0 erros AST), ajustam espacamento MD032 em CLAUDE.md e
    removem apenas do indice Git (--cached) os 43 binarios ignorados em engine/llama_cpp.
- registro: relatorio-2026-06-16-auditoria-e-harmonizacao-v8-gold
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-24. Alteracoes em CLAUDE.md preservam integralmente os invariantes de governanca
    SOTA v8.0 GOLD, migram launchers llama.cpp para CUDA0 (GTX 1060 6GB) com fallback Vulkan0, corrigem scripts/start_model.ps1
    (prioridade ollama.exe serve, BOM UTF-8 unico + CRLF, 0 erros AST), ajustam espacamento MD032 em CLAUDE.md e
    removem apenas do indice Git (--cached) os 43 binarios ignorados em engine/llama_cpp.
- registro: validacao-2026-09-12-a-grade-que-nao-cabia-e-o-aviso-que-virou-bloqueio
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-24. Alteracoes em CLAUDE.md preservam integralmente os invariantes de governanca
    SOTA v8.0 GOLD, migram launchers llama.cpp para CUDA0 (GTX 1060 6GB) com fallback Vulkan0, corrigem scripts/start_model.ps1
    (prioridade ollama.exe serve, BOM UTF-8 unico + CRLF, 0 erros AST), ajustam espacamento MD032 em CLAUDE.md e
    removem apenas do indice Git (--cached) os 43 binarios ignorados em engine/llama_cpp.
- registro: validacao-2026-09-12-a-identidade-de-autoria-deixa-de-ser-prosa
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-24. Alteracoes em CLAUDE.md preservam integralmente os invariantes de governanca
    SOTA v8.0 GOLD, migram launchers llama.cpp para CUDA0 (GTX 1060 6GB) com fallback Vulkan0, corrigem scripts/start_model.ps1
    (prioridade ollama.exe serve, BOM UTF-8 unico + CRLF, 0 erros AST), ajustam espacamento MD032 em CLAUDE.md e
    removem apenas do indice Git (--cached) os 43 binarios ignorados em engine/llama_cpp.
---

# Registro — Auditoria CUDA 12.4 GTX 1060, Launchers llama.cpp e Higienizacao de Binarios Ignorados

## Sintese

Auditoria, otimizacao e fechamento dos itens pendentes relacionados a migracao do backend llama.cpp para CUDA 12.4 (CUDA0 na NVIDIA GeForce GTX 1060 6GB com fallback automatico Vulkan0):

1. **Higienizacao de indice Git (engine/llama_cpp/*.dll, *.exe):** 43 binarios anteriormente rastreados em Git LFS eram explicitamente ignorados por .gitignore (linhas 51-52), enquanto os novos shims/DLLs CUDA (llama-server-impl.dll, ggml-cuda.dll, cublas*.dll) nao estavam rastreados. Aplicado git rm --cached nos 43 binarios rastreados — removendo-os apenas do controle de versao e preservando todos os executaveis e DLLs intactos no disco local.
2. **Correcoes e padronizacao dos 5 scripts PowerShell:**
   - scripts/start_model.ps1: priorizado ollama.exe serve antes do fallback ollama app.exe (evitando sobrescrita do contexto para 262144 e OLLAMA_VULKAN=true); adicionado BOM UTF-8 unico + CRLF.
   - engine/llama_cpp/start_vulkan_daemon.ps1: log explicito de $KVCacheType / ; adicionado BOM UTF-8 unico + CRLF.
   - scripts/ops/Start-LlamaVulkan.ps1: prefixo de log unificado para [llama-server] args:.
   - scripts/ops/Start-LlamaVulkanEngine.ps1 e scripts/ops/Start-LocalLlama.ps1: validados com BOM UTF-8 unico e 0 erros AST.
3. **CLAUDE.md:** preservado espacamento MD032 em secoes de governanca existentes.
