---
id: registro-2026-09-07-orquestrador-api-keys-free-e-pmev
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: "Gemini 3.8 Flash (High) -- sessao de orquestracao preditiva de api keys free"
criado_em: 2026-09-07T20:25:00-03:00
atualizado_em: 2026-09-07T20:25:00-03:00
classes: [interno, medido, governanca, roteamento, pmev, seguranca]
caminhos:
  - llm/free_router.py
  - engine/pmev_pipeline.py
  - tests/test_free_router_concurrency.py
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  so: Windows
  python: '3.14.6'
  pwsh: '7.6.5'
verificado:
  - >-
    Substituicao estrategica do Gemini 3.8 Flash pelo duo Gemini 3.6 Flash
    (sintese/auditoria) e Gemini 3.5 Flash-Lite (triagem/parsing) no regime de API Keys
    Free, contornando o teto severo de 50 RPD e os thinking tokens descontrolados (4k-16k).
  - >-
    Implementacao do AtomicQuotaBucket com reserva preventiva em duas fases (try_acquire
    e reconcile) protegida por asyncio.Lock, eliminando condicoes de corrida (TOCTOU) sob
    rajadas assincronas.
  - >-
    Integracao direta aos pools multi-chave de llm/budget.py (GEMINI_FLASH_KEYS,
    GEMINI_KEYS), multiplicando a capacidade agregada em N vezes.
  - >-
    Adicao de cache semantico local SHA-256 em memoria para deduplicacao instantanea de
    consultas identicas sem consumo de tokens de API.
  - >-
    Blindagem do pipeline tripartite do PMev com validacao combinatoria deterministica
    local dos 1.326 combos de Texas Hold'em e calculo matricial de Malmuth-Harville
    com zero consumo de tokens de IA.
  - >-
    Suite de testes de concorrencia e combinatoria (tests/test_free_router_concurrency.py)
    100% aprovada (7 testes, 0 erros, 0 warnings).
  - >-
    Portao obrigatorio cwv_gate.ps1 e record_gate.py executados e aprovados com louvor
    nas 5 fases medidas (CWV, A11y, CVE, SRI e Higiene).
nao_verificado:
  - >-
    Latencia de nós de terceiros do pool gratuito do OpenRouter sob picos de congestionamento global.
---

# Registro: Orquestrador Canônico de API Keys Free & Integração PMev

## 1. Contexto e Motivação

Dois estudos de auditoria sobre o uso de chaves gratuitas do Google AI Studio e OpenRouter
foram analisados e submetidos ao rigor do Protocolo Chico SOTA v8.0 GOLD.

A proposta preliminar continha armadilhas de engenharia:
1. Alocação do Gemini 3.8 Flash no caminho crítico gratuito, esgotando o limite de 50 RPD
   em menos de uma hora de trabalho agêntico devido a thinking tokens excessivos;
2. Falhas de concorrência com condição de corrida (TOCTOU) em Token Buckets não atômicos;
3. Ilusão de economia de TPM via "Context Caching" no Free Tier (recurso faturado da API);
4. Acoplamento indevido de chamadas de LLM aos hooks determinísticos de pré-commit do git.

## 2. Decisões Arquiteturais Adotadas

### A. Substituição Canônica de Modelo na Faixa Livre
- **Gemini 3.6 Flash:** Assume o papel de raciocínio avançado, síntese e auditoria com
  cota de 1.500 RPD e 1.000.000 TPM por chave.
- **Gemini 3.5 Flash-Lite:** Atua como parser estrutural de baixa latência (<300 ms) com
  cota de até 2.000 RPD por chave.
- **Gemini 3.8 Flash:** Permanece rigorosamente isolado na faixa paga (`Faixa.API_PAGA` / Flat-Fee).

### B. Two-Phase Commit Anti-TOCTOU
O `AtomicQuotaBucket` introduz reserva antecipada atômica:
$$\text{Capacidade Disponível} \ge \text{Tokens Estimados} \implies \text{Reserva Imediata}$$
Após o retorno do SDK `google-genai`, a cota é reconciliada com os valores reais de
`usage_metadata`, devolvendo excedentes.

### C. Pipeline Tripartite PMev
- **Camada 1:** Normalização de `TournamentState`.
- **Camada 2:** Execução puramente local em Python/Rust do Malmuth-Harville, matriz pairwise
  de Bubble Factor e validação exata de 1.326 combinações de ranges (zero tokens gastos).
- **Camada 3:** Invocação do modelo de linguagem gratuita exclusivamente para avaliar
  as hipóteses conceituais de Raphael Vitoi (Monotonicidade de EV-Fold, Ganho do Espectador,
  Isometria Posicional), tratando dados numéricos como axiomas imutáveis.

## 3. Estado de Verificação

- **Testes de Concorrência:** 7/7 aprovados em `tests/test_free_router_concurrency.py`.
- **Desambiguação:** 8/8 aprovados em `tests/test_desambiguacao.py`.
- **Portão de Pré-Commit:** Todas as 5 fases do `cwv_gate.ps1` aprovadas com status [VERDE].
- **Higiene e Âncoras:** Zero erros no `record_gate.py`.
