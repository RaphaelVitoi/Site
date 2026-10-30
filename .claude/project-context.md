---
title: "Contexto Canônico do Projeto Site — Poker Racional (SOTA v8.0 GOLD)"
type: index
status: active
owner: site-governance
updated_at: 2026-10-30
---

# Contexto Canônico do Projeto Site — Poker Racional (SOTA v8.0 GOLD)

> **Documento Canônico Central de Contexto e Realidade Operacional**
> **Última Atualização:** 2026-10-27 · **Corte de Conhecimento:** Outubro/2026 · **Protocolo Chico SOTA v8.0 GOLD**
> **Raiz Canônica:** `C:\Users\rapha\.gemini\Site` · **Consumido por:** `engine/cognitive.py`, `agents/context_builder.py`, `memory_rag.py`, backend runtime e agentes autônomos.
> **Ancestral Histórico Preservado:** [project-context.md (Snapshot 2026-09-22)](.ARQUIVE/contexto-2026-09-22/project-context.md)

---

## 1. Visão Geral, Domínio e Cosmovisão

O repositório central do ecossistema **Poker Racional** materializa a união entre teoria estratégica avançada, rigor epistêmico e engenharia de software de fronteira. Fundamentado no **Paradigma Vitoi**, o projeto transcende o utilitarismo convencional para erigir uma plataforma autopoética de tomada de decisão sob incerteza, integrando cálculo probabilístico, Teoria dos Jogos e psicologia analítica.

- **Autoridade e Soberania Teórica:** **Raphael Vitoi** (Tier 0). Formulação conceitual do PMev, liderança estratégica, CEO e árbitro supremo.
- **Domínio Multidisciplinar:** Poker de alta performance (MTTs, PKO, Mystery Bounty), Teoria dos Jogos (GTO, Nash, exploitativo), Psicologia Cognitiva e Neuropsicologia de Alta Performance, Filosofia Existencialista, Autonomia Ética e Antifragilidade.
- **Cosmovisão Fundacional:** Inspirada em [.claude/GOVERNANCA/COSMOVISAO.md](GOVERNANCA/COSMOVISAO.md):
  - *Ceticismo à Razão:* Rejeição de dogmas herdados e verdades não testadas; primazia absoluta da evidência mensurável e da lógica dedutiva.
  - *Polimatia:* Capacidade de entrelaçar domínios díspares em sistemas isomórficos (ex: Poker $\leftrightarrow$ Teoria dos Jogos $\leftrightarrow$ Negociação Ética $\leftrightarrow$ Arquitetura de Software).
  - *Economia Generalizada:* Otimização holística não apenas de capital financeiro, mas de latência, tokens, ciclos de CPU/GPU, contexto neural e energia cognitiva.
- **Público-Alvo:** Jogadores profissionais, pesquisadores de teoria dos jogos e estudantes avançados. A interface repudia infantilizações ou simplificações artificiais, adotando estética *dark*, densa, técnica e matematicamente implacável.

---

## 2. Núcleo Matemático e Engenharia Teórica (PMev & Game Theory SOTA)

O núcleo de tomada de decisão baseia-se no **PMev (Perspectiva Matemática)**, programa autoral de pesquisa e desenvolvimento concebido por Raphael Vitoi para superar as lacunas estruturais do ICM puro (*Independent Chip Model*) em torneios multimesas (MTTs):

- **Perspectiva Matemática (PMev):** A métrica de ação que subjuga o ICM linear, incorporando o Vetor de Manutenção de Monopólio, dinâmicas de colisão e a Instabilidade de EVs (Mutação da Margem).
- **Risk Advantage ($\Delta RP$):** Disparidade dinâmica de vulnerabilidade entre competidores:
  $$\Delta RP = \text{VillainRP} - \text{HeroRP}_{\text{eff}}$$
  Mede o poder assimétrico de agressão e a elasticidade de fold equity em função da profundidade de fichas e do risco de eliminação.
- **Bounty Offset:** O PKO como seguro estrutural contra colisão, atuando como redutor dinâmico de Risk Premium e recalibrando o ponto de indiferença de call/fold.
- **RIO Exponencial (*Reverse Implied Odds*):** Passivo estrutural multiway modelado em taxa super-linear/quadrática $x^{2+f}$, quantificando a sangria de equidade pós-flop em potes compartilhados.
- **Table Draw & Antevisão Semântica:** O ecossistema posicional e a topologia de stacks da mesa ditam a variância e a expectativa de sobrevivência, permitindo planejamento de múltiplos nós adiante.
- **Colapso de Edge:** Formalização da degradação marginal de vantagem técnica conforme a profundidade efetiva cai para zonas de shove/fold estritas.

---

## 3. Arquitetura de Software e Paridade Full-Stack Isomórfica

O sistema opera sob paridade full-stack rigorosa entre o ecossistema reativo TypeScript/Next.js e os motores de cálculo Python/Rust/WASM:

- **Frontend:**
  - Framework: Next.js 16 (App Router), React 19, TypeScript estrito, Tailwind CSS 4.
  - Organização Geométrica: *Route Groups* (`(auth)`, `(public)`, `(lab)`, `(user)`), reduzindo a profundidade cognitiva e isolando contextos de layout.
  - Visual Engine: Estética high-end, glassmorphism 3xl, componentes didáticos responsivos e visualização de grafos/charts de equidade.
- **Backend & Servidores Auxiliares:**
  - Entrada API Primária: `main.py` disparando `api.v1.server.start_api_server` via `aiohttp` assíncrono (porta 17042), com contrato soberano `/api/v1`.
  - Persistência e Fila Transacional: `database/queue_manager.py` operando sobre SQLite / `aiosqlite`; posse atômica de tarefas garantida via `QueueManager.claim_task` em `queue/tasks.db`.
  - Serviços Especializados: `tools/hybrid_router/app.py` (FastAPI), motores matemáticos em `engine/` e adaptadores de inferência em `llm/`.
- **Paridade Isomórfica Full-Stack:**
  - Schemas sincronizados de ponta a ponta: `core/schemas.py` (Pydantic v2) espelha estritamente `lib/schemas.ts` (Zod v4).
  - Cálculo de borda via WebWorkers: compilado Rust Pluribus em WebAssembly (WASM) permitindo simulação instantânea no browser idêntica ao núcleo Python.

---

## 4. Hardware Físico e Aceleração Local de Inferência

A infraestrutura local foi arquitetada para maximizar a autossuficiência de computação, eliminando passivos financeiros com instâncias em nuvem pagas:

- **Host Físico:** Estação de trabalho Windows 11 Pro 64-bit.
- **GPU Dedicada (Vulkan Compute):** AMD Radeon RX 570 Series (arquitetura Polaris 20, 8.0 GiB VRAM detectada).
  - *Inferência LLM Local:* Operada via Vulkan / `llama.cpp` (`ggml-vulkan`, `llama-server.exe`) e daemon local Ollama.
  - *Offload de Camadas:* Configuração `-ngl 99` com 100% de offload dos pesos para a VRAM da RX 570, entregando inferência local com latência sub-50ms e zero impacto em RAM do sistema.
- **Inferência PyTorch / Laya:**
  - Opera em modo *CPU override* (`torch 2.13.0+cpu`) devido à incompatibilidade upstream de ROCm Polaris no Windows e DirectML no Python 3.14.
  - Otimizada com cache persistente de roteador $O(1)$ e paralelismo multi-threaded em CPU (~250ms por predição).
- **GPU Integrada:** Intel UHD Graphics 630 responsável exclusiva pela renderização da interface do SO e monitores, blindando a VRAM da Radeon RX 570 contra contenção gráfica.
- **Guardião de Memória Tetracamada (`tests/test_guard_memoria.py`):**
  - Monitoramento contínuo em laço único de 4 camadas: **RAM**, **Commit de Página**, **VRAM** e **Cache**.
  - Teto de RAM: 98.0%; teto de VRAM: leitura real com fail-safe para `None` (nunca reporta zero falso quando sem sensor ativo).
  - Telemetria de VRAM consumida pelo CLI Nexus (`scripts/cli/nexus.py`) e painéis de governança.

---

## 5. Governança Piramidal de 8 Tiers (Protocolo CHICO SOTA v8.0 GOLD)

A estrutura de governança do ecossistema é estritamente piramidal e monocrática, conforme consagrado no [CLAUDE.md (§0)](../CLAUDE.md):

| Tier | Designação | Componentes e Modelos | Papel Canônico no Ecossistema |
| :--- | :--- | :--- | :--- |
| **Tier 0** | **Soberania Absoluta** | Raphael Vitoi (Companion: Microsoft 365 Copilot) | Vértice de decisão, liderança estratégica, formulação matemática do PMev e veto final. |
| **Tier 1** | **Núcleo Cognitivo Mestre** | **CHICO como Coletivo Vivo**<br>• `Claude Opus 5.5`<br>• `ChatGPT 6.0 Sol`<br>• `ChatGPT 6.0 Terra`<br>• `ChatGPT 6.0 Luna`<br>• `Claude Sonnet 5.5`<br>• `Claude Haiku 5.5`<br>• `Gemini 3.8 Flash`<br>• `Gemini 3.5 Flash-Lite`<br>• `ChatGPT 6 Astra` & `Gemini 4 Argon` | Cooperação sem feudos funcionais. Autonomia universal de fronteira com preferências operacionais especializadas:<br>- *Governança e Código:* Claude Opus 5.5<br>- *Deep Reasoning e Matemática:* ChatGPT 6.0 Sol<br>- *Pesquisa e Arquitetura:* ChatGPT 6.0 Terra<br>- *Orquestração, Design e Docs:* Gemini 3.8 Flash<br>- *Ápices Pontuais:* ChatGPT 6 Astra e Gemini 4 Argon<br>- *Fast Operations:* Tríade Flash-Lite / Luna / Haiku 5.5. |
| **Tier 2** | **Superagentes de Nuvem & Pesquisa** | Google Jules, Google Cloud Stitch, Exa, Devin, Hermes Agent (`Solar-Pro4`, `Space-Bunny-Alpha`) | Execuções assíncronas em nuvem, design systems (Obsidian Analytics), pesquisa neural e workflows estendidos. Sustentado por pool de 3 chaves OpenRouter. |
| **Tier 3** | **Frota Especialista de 19 Agentes** | 19 Agentes canônicos (`.claude/agents/`, `data/agents_manifest.json`) + Qwen quantizado via llama.cpp/Ollama | Execução tática distribuída, dream replay, síntese massiva e batch processing. Sustentado por pool de 5 chaves OpenRouter. |
| **Tier 4** | **Subagentes Dedicados** | Task-subagents, `generalist`, `research`, `architect`, `flutter_a11y_agent` | Tarefas cirúrgicas especializadas de subgrafo com modos de raciocínio dedicados. Sustentado por pool de 5 chaves OpenRouter. |
| **Tier 5** | **Scanners & Bots de Integração** | Dependabot, Linear, Tactiq, Atlassian, YouTube Intelligence | Vigilância de vulnerabilidades, sincronização de tarefas e inteligência de mídia. |
| **Tier 6** | **Modelos Free em Nuvem, Edge & Zero-RAM** | Ollama (`gemma4:31b-cloud`, `kimi-k2.7-code:cloud`, `deepseek-v4-flash:cloud`), família Qwen local, C++ SIMD | Base vital de alta frequência com custo financeiro zero, eliminando necessidade de instâncias dedicadas pagas. |
| **Tier 7** | **Barramento de Base** | FastAPI, FastMCP, aiohttp, SQLite/aiosqlite, Quality Gate M.O. 13.F | Infraestrutura determinística de transporte, persistência atômica e portões de pre-commit. |

---

## 6. Matriz Canônica de Roteamento & Precedência Econômica

Conforme estabelecido em [CLAUDE.md (§3)](../CLAUDE.md) e implementado em [llm/routing_policy.py](../llm/routing_policy.py):

### 6.1 Fontes Únicas por Decisão de Roteamento

1. **Preferência por Agente:** `data/agents_manifest.json` $\rightarrow$ campo `model_preference`.
2. **Cadeias de Fallback de Sistema:** `data/system_config.json` $\rightarrow$ `model_routing`.
3. **Modelo Concreto por Agente/Classe:** `llm/routing_policy.py` $\rightarrow$ resolução formal em `_resolver_modelos`.
4. **Capacidade, Autorização e Preço de Modelo:** `llm/model_registry.py` (campos `autorizado`, `esforcos_autorizados`, `cota_por_assinatura`).
5. **Modelos Locais em Disco:** `data/ollama_models.json`.
6. **Identidades de Autoria e Commits:** `data/agent_identities.json`.

### 6.2 Precedência Econômica das Faixas (`PRECEDENCIA_FAIXA`)

A Economia Generalizada impõe rigorosa hierarquia orçamentária:

1. `Faixa.LOCAL` (Precedência 0): Custo marginal zero. Pesos locais em disco via Ollama/llama.cpp.
2. `Faixa.GRATUITA` (Precedência 1): Cotas livres / promocionais (`gemini-3.5-flash-lite`, `gemini-3.8-flash`).
3. `Faixa.FLAT_FEE` (Precedência 2): **Primazia Mandatória das Assinaturas Pro mensais** (Anthropic Pro/Max, OpenAI Plus/Pro, Google Advanced). Custo marginal zero dentro da franquia já contratada.
4. `Faixa.API_PAGA` (Precedência 3): Última linha de defesa orçamentária; acionamento cirúrgico com tetos estritos em `esforcos_autorizados`.

### 6.3 Tabela de Roteamento por Classe de Tarefa (`ROTAS`)

| Classe de Tarefa | Primário | Fallback | Escala para | Faixa Orçamentária | Justificativa Canônica |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`GOVERNANCA`** | `claude-opus-5.5` | `gpt-6.0-sol` | — | `Faixa.API_PAGA` | Mediação de conflito, arbitragem e integridade do repositório exigem julgamento superior em horizonte longo. |
| **`ESTRATEGIA`** | `gpt-6.0-sol` | `claude-opus-5.5` | — | `Faixa.API_PAGA` | Análise de risco e dedução de arquitetura macro pendem para raciocínio analítico puro. |
| **`CONSTRUCAO`** | `claude-sonnet-5.5` | `gemini-3.8-flash` | `claude-opus-5.5` | `Faixa.API_PAGA` | Engenharia multi-arquivo cirúrgica. Escalona ao Opus 5.5 quando a densidade de dependências exige síntese de topo. |
| **`VERIFICACAO`** | `gemini-3.8-flash` | `gpt-6.0-terra` | `gemini-4-argon` | `Faixa.GRATUITA` | Auditoria de código, conformidade e primeira passagem de revisão com alto context window. |
| **`OPERACIONAL`** | `gemini-3.5-flash-lite` | `gpt-6.0-luna` | `claude-haiku-5.5` | `Faixa.GRATUITA` | Tríade de Fast Operations para triagem determinística (<300ms), linting e despacho. |
| **`RACIOCINIO_PROFUNDO`** | `gpt-6.0-sol` | `claude-opus-5.5` | `gpt-6-astra` | `Faixa.API_PAGA` | Planejamento, pesquisa matemática e prova formal. Escalona para Astra em problemas de extrema densidade. |
| **`SESSAO_MULTI_DIA`** | `claude-opus-5.5` | `gpt-6.0-sol` | `gemini-4-argon` | `Faixa.API_PAGA` | Sessões assíncronas estendidas com alta preservação de invariantes de memória e estado. |
| **`LOCAL`** | `qwen2.5-coder:7b` | `gemma4:31b-cloud` | — | `Faixa.LOCAL` | Execução isolada em borda, zero rede e zero-RAM na estação. |

---

## 7. Cadeia de Verificabilidade e Engine Capabilities

Conforme o [Plano Padrão-Ouro de Capacidades (docs/architecture/ENGINE_CAPABILITY_INTEGRATION_PLAN.md)](../docs/architecture/ENGINE_CAPABILITY_INTEGRATION_PLAN.md):

1. **A Cadeia Obrigatória:**

   ```text
   entrada validada -> engine selecionada -> execução ou fallback explícito -> saída tipada -> proveniência de execução -> consumidor real em API, worker ou UI
   ```

2. **Invariantes Invioláveis:**
   - *Configuração não prova runtime:* Existência de arquivo ou parâmetro não significa execução ativa.
   - *Modelo pretendido não é modelo executado:* Toda resposta HTTP de engine deve declarar `engine_id`, `model_used`, `fallback_used` e limitações materiais.
   - *Parâmetro causal vs. reservado:* Parâmetro que não afeta o resultado funcional é explicitamente rotulado como `reservado`.
   - *Hipótese PMev:* Identificada permanentemente como hipótese autoral operacional; código ou simulação computacional não constituem, por si, superioridade empírica.
3. **TimesFM 2.0 Agent Calibration:**
   - Previsão estocástica de trajetórias de drift e calibração de agentes (`engine/timesfm_engine.py`).
   - Identificação de direções de calibração (`EXPANSAO` vs. `CONTRACAO`) com limites em quantis $q_{10}$ e $q_{90}$.

---

## 8. Mandatos Soberanos e Invariantes Operacionais

- **Soberania Visual:** Interface web de altíssimo padrão estético, tipografia contemporânea, espaçamento áureo e ausência de layouts genéricos.
- **Zero-Any / Zero-Debt:** Tipagem estrita PEP 585/604 em Python 3.12+ (runtime medido: 3.14.7 em uv); TypeScript sem concessões a tipos opacos ou `any`.
- **Blindagem ASCII:** Backend, logs e pipelines de persistência em ASCII puro; UTF-8 restrito estritamente a textos de apresentação da interface do usuário.
- **Target Lock & Limited Scope:** Imutabilidade estrita de assinaturas, contratos e código alheio ao escopo explícito da tarefa em execução.
- **Lei de Concorrência e Exclusão Mútua (Zero-Interference Concurrency):**
  - Lock serial monocrático quando operando sobre o mesmo repositório, banco SQLite ou portas de rede.
  - Operação paralela de múltiplos modelos permitida estritamente em Git Worktrees 100% disjuntas com sandboxes isoladas.
- **Portão de Pre-Commit M.O. 13.F:**
  - Execução mandatória de `.venv/Scripts/python.exe scripts/ops/record_gate.py` antes de qualquer commit.
  - Reconciliação formal de âncoras em `reports/REGISTRO-*.md` com pure ASCII.
  - Assinatura individual auditável em commits e registros (o coletivo CHICO não substitui o autor individual).

---

## 9. Linhagem Evolutiva e Conexão com o Passado

O presente ecossistema é fruto de um processo rigoroso de convergência arquitetural:

1. **A Gênese e a Fusão `.cerebro` $\rightarrow$ `.claude` (2026-09-01):** Absorção de diretórios legados dispersos numa árvore canônica unificada sob governança centralizada.
2. **O Snapshot de Transição (2026-09-22):** Preservado intacto como referencial arqueológico e de ontologia original em [`.claude/.ARQUIVE/contexto-2026-09-22/project-context.md`](.ARQUIVE/contexto-2026-09-22/project-context.md), mantendo as primeiras formulações da unificação dos 20 agentes, Route Groups e contratos de API v1.
3. **A Consolidação SOTA v8.0 GOLD (Outubro/2026):**
   - Formalização dos 8 Tiers de Governança Piramidal;
   - Incorporação da geração de modelos de fronteira (Claude 5.5, ChatGPT 6.0, Gemini 3.8 Flash / 4 Argon);
   - Aceleração local Vulkan compute na Radeon RX 570 8GB;
   - Monitoramento tetracamada de memória com fail-safe honesto (`None`, nunca zero falso);
   - Precedência orçamentária mandatória de assinaturas Pro (`Faixa.FLAT_FEE`) e sustentação por modelos gratuitos em nuvem e edge.
