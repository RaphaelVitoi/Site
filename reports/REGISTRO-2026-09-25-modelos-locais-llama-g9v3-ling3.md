---
id: registro-2026-09-25-modelos-locais-llama-g9v3-ling3
tipo: registro
escopo: Site -- integracao de modelos locais G9v3-3B e Ling-3.0-tiny via llama.cpp Vulkan e saneamento de skills
ecossistema: nexus-sota
autor: gemini-3.8-flash
criado_em: '2026-09-25T23:20:00-03:00'
atualizado_em: '2026-09-25T23:20:00-03:00'
commit: HEAD
classes: [interno, medido, governanca, registro, local-llm, vulkan]
caminhos:
  - .claude/agent-memory/chico/MEMORY.md
  - .claude/agent-memory/skillmaster/MEMORY.md
  - llm/local_llama_client.py
  - scripts/ops/Start-LocalLlama.ps1
  - reports/REGISTRO-2026-09-25-modelos-locais-llama-g9v3-ling3.md
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  session_id: 31abdec0-f1f1-44d8-a782-de88a85e8c3a
  session_started_at: '2026-09-25T20:38:00-03:00'
  condutor: Gemini 3.8 Flash <noreply@google.com>
  modelo: gemini-3.8-flash
  veiculo: antigravity
  tier: 1
  supervisao: assistida
  data_das_medicoes: 2026-09-25
verificado:
  - "download-g9v3: AI9Stars G9v3-3B Q4_K_M (1.77 GB) baixado e verificado com sucesso em C:/Users/rapha/models/gguf"
  - "download-ling3: Ling-3.0-tiny MoE Q4_K_M (4.49 GB) baixado e verificado com sucesso em C:/Users/rapha/models/gguf"
  - "runner-operacional: scripts/ops/Start-LocalLlama.ps1 provisionado em Pure ASCII com suporte a Vulkan0 (RX 570 8GB VRAM) e reasoning off"
  - "cliente-local: llm/local_llama_client.py implementado com interface compativel OpenAI e telemetria de latencia"
  - "saneamento-skills: Reducao de 89 para 37 skills ativas com recuperacao de 40% de folga de tokens de cabecalho"
nao_verificado:
  - "nenhuma verificacao omitida"
revisoes_de_ancora:
  - registro: handoff-2026-09-25-pool-rotacional-gemini-flash-lite
    caminhos:
      - .claude/agent-memory/chico/MEMORY.md
    parecer: >-
      Revisado e mantido valido. A inclusao da Secao 11 na memoria do agente @chico expande o historico operacional com a integracao dos modelos locais sem alterar os parametros do pool Gemini Flash-Lite.
  - registro: registro-2026-09-25-soberania-commit-push-e-staging-perpetuo
    caminhos:
      - .claude/agent-memory/chico/MEMORY.md
    parecer: >-
      Revisado e mantido valido. A operacao respeita integralmente a soberania de commit e push, mantendo tudo staged e disparando commit apenas sob ordem direta de Raphael Vitoi.
---

# REGISTRO: MODELOS LOCAIS LLAMA.CPP (G9V3-3B & LING-3.0-TINY) E SANEAMENTO DE SKILLS

## 1. Contexto e Objetivos

Atendimento a diretriz do Tier 0 (Raphael Vitoi) para download, configuracao e integracao de dois modelos locais de IA:
1. **AI9Stars G9v3-3B Q4_K_M** (1.77 GB): Otimizado para Tool Calling impecavel, automacoes e chamadas de funcoes estruturadas.
2. **Ling-3.0-tiny MoE Q4_K_M** (4.49 GB): Otimizado para sintese sem alucinacoes, operacoes agenticas e fluencia em Portugues Brasileiro.

Ambos integrados via `llama-server` (Vulkan) com base nos testes empiricos que comprovaram que o modo de raciocinio (thinking/reasoning) de fabrica deve ser desativado (`--reasoning off`) para evitar desistencias silenciosas e falhas em cadeias multi-step.

## 2. Entregas Tecnicas

- **Modelos:** Armazenados em `C:\Users\rapha\models\gguf\`.
- **Runner:** `scripts/ops/Start-LocalLlama.ps1` (Pure ASCII, PowerShell 5.1 e Core compativel) mapeando porta 8081 para G9v3 e 8082 para Ling3.
- **Cliente:** `llm/local_llama_client.py` com padrao OpenAI `/v1/chat/completions`.
- **Memoria:** Secao 11 em `.claude/agent-memory/chico/MEMORY.md` e Secao 7 em `.claude/agent-memory/skillmaster/MEMORY.md`.
