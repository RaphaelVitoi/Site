---
id: registro-2026-09-25-precedencia-economica-assinaturas-pro-e-nuvem-free
tipo: registro
escopo: Site -- formalizacao da precedencia economica de cotas pro no tier 1 e mitigacao de custos de infraestrutura via ollama cloud, llama.cpp e hermes agent
ecossistema: nexus-sota
autor: gemini-3.8-flash
criado_em: '2026-09-25T08:55:00-03:00'
atualizado_em: '2026-09-25T08:55:00-03:00'
commit: HEAD
classes: [interno, medido, governanca, registro, economia, llm, infraestrutura]
caminhos:
  - CLAUDE.md
  - .agents/skills/site-session-handoff/SKILL.md
  - .agents/skills/session-impact-evaluator/SKILL.md
  - scripts/ops/avaliar_impacto_sessao.py
  - reports/REGISTRO-2026-09-25-precedencia-economica-assinaturas-pro-e-nuvem-free.md
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  session_id: 8356731b-61df-479a-a930-2d731f86444e
  session_started_at: '2026-09-25T07:15:00-03:00'
  condutor: Gemini 3.8 Flash <noreply@google.com>
  modelo: gemini-3.8-flash
  veiculo: antigravity
  tier: 1
  supervisao: assistida
  data_das_medicoes: 2026-09-25
verificado:
  - "prioridade-cotas-pro-tier1: Modelos Tier 1 priorizam mandataria e estritamente as franquias pagas de assinaturas Pro/Max (Faixa.FLAT_FEE), operando sob custo marginal zero antes de recorrer a consumo pay-as-you-go ou API paga"
  - "axioma-custo-nuvem-vs-chaves: Formalizado que o custo de servidores dedicados e instancias em nuvem supera o gasto com chaves; Ollama (gemma4:31b-cloud), llama.cpp (familia Qwen) e Hermes Agent (familia Laguna) desempenham papel prioritario"
  - "governanca-indexada: Secoes 3.2 e 7 do CLAUDE.md e nucleo/nucleo_compartilhado.json atualizados com a piramide quadrupla de alocacao de recursos"
  - "skill-impacto: scripts/ops/avaliar_impacto_sessao.py e session-impact-evaluator expandidos com a 7a dimensao (Eficiencia Economica, Cotas Pro e Mitigacao de Infraestrutura: 14 cloud / 13 locais)"
  - "skill-handoff: site-session-handoff/SKILL.md atualizado com a validacao de governanca economica e cotas pro"
nao_verificado:
  - "estresse de carga simultanea em mais de 100 sessoes concorrentes consumindo a mesma franquia Pro"
revisoes_de_ancora:
  - registro: taxonomia-canonica-de-documentacao-e-relatorios
    caminhos:
      - CLAUDE.md
    parecer: >-
      Revisado e mantido valido. A adicao da secao 3.2 e refinamento da secao 7 no CLAUDE.md estabelecem a precedencia economica e o papel critico de modelos free em nuvem e edge sem alterar a taxonomia de documentacao ou estrutura de relatorios.
  - registro: auditoria-2026-09-12-proveniencia-executavel-do-feedback
    caminhos:
      - CLAUDE.md
    parecer: >-
      Revisado e mantido valido. A secao 8.3 e a proveniencia executavel do feedback permanecem intactas; as diretrizes economicas atuam como criterio de roteamento orcamentario de modelos.
  - registro: checkpoint-2026-06-14-infrastructure-hardening
    caminhos:
      - CLAUDE.md
    parecer: >-
      Revisado e mantido valido. O endurecimento de infraestrutura e reforcado pela mitigacao ativa de custos de servidores e VMs atraves de inferencia Zero-RAM e runtimes locais de alta eficiencia.
  - registro: handoff-2026-09-12-reconciliacao-calibracao-e-proveniencia
    caminhos:
      - CLAUDE.md
    parecer: >-
      Revisado e mantido valido. A harmonizacao de handoff incorpora a 7a dimensao de avaliacao de sessao preservando integralmente o fluxo de governanca e calibracao.
  - registro: relatorio-2026-06-16-auditoria-e-harmonizacao-v8-gold
    caminhos:
      - CLAUDE.md
    parecer: >-
      Revisado e mantido valido. A governanca v8.0 Gold e preservada e fortalecida com a piramide de alocacao economica de 4 niveis.
  - registro: handoff-2026-09-25-governanca-pools-openrouter-e-impacto
    caminhos:
      - .agents/skills/session-impact-evaluator/SKILL.md
      - .agents/skills/site-session-handoff/SKILL.md
      - CLAUDE.md
      - scripts/ops/avaliar_impacto_sessao.py
    parecer: >-
      Revisado e mantido valido. A governanca de pools OpenRouter multi-tier e os instrumentos de avaliacao de impacto sao expandidos com a 7a dimensao economica (prioridade de cotas Pro no Tier 1 e runtimes free em nuvem Ollama, llama.cpp e Hermes Agent), preservando integralmente todas as determinacoes do handoff precedente.
---

# Registro: Precedencia Economica de Assinaturas Pro e Mitigacao de Custos de Infraestrutura

Data: 2026-09-25
Autor: Gemini 3.8 Flash [Tier 1]
Sessao: 8356731b-61df-479a-a930-2d731f86444e

## 1. Contexto e Motivacao Operacional

Por determinacao do Tier 0 (Raphael Vitoi), foi formalizado o principio economico e operacional de alocacao de modelos:
1. **Prioridade Mandatoria de Assinaturas Pro no Tier 1:** Modelos do Nucleo Cognitivo Mestre Tier 1 (Claude Opus 5, ChatGPT 6 Astra/Sol, Gemini 3.8 Flash, etc.) priorizam as cotas mensais contratadas das assinaturas Pro/Max (`Faixa.FLAT_FEE` - Anthropic Pro/Max, OpenAI Plus/Pro, Google Advanced). O custo marginal dentro da franquia e zero. O consumo de chaves de API pagas e a ultima linha de defesa orcamentaria.
2. **Axioma do Custo de Nuvem vs. Chaves:** O custo operacional e financeiro de manter servidores dedicados, instancias de nuvem corporativa e VMs ativas supera em ordens de magnitude o gasto com chaves de API. Portanto, **Ollama**, **llama.cpp** e **Hermes Agent** tem papel de altissima importancia estrategica:
   - **Ollama:** Modelos free em nuvem Zero-RAM / Zero-VRAM (ex: `gemma4:31b-cloud`, `kimi-k2.7-code:cloud`, `deepseek-v4-flash:cloud`, `gpt-oss:120b-cloud`), entregando alto raciocinio e coding sem custos de hardware local ou aluguel de servidores de GPU.
   - **llama.cpp:** Familia Qwen quantizada (`qwen2.5-coder:7b-instruct-q5_K_M`, `qwen-code-surgical`, `qwen-pmev-math`) com eficiencia maxima de tokens/watt em CPU/GPU local.
   - **Hermes Agent:** Familia Laguna e condutor Solar-Pro4 com modelos gratuitos em nuvem e execucao assincrona desacoplada.

## 2. A Piramide Quadrupla de Alocacao de Recursos

1. **1o Nivel - Cotas Pagas de Assinaturas Pro (`Faixa.FLAT_FEE`):** Primazia para o Tier 1; custo marginal zero dentro do plano mensal.
2. **2o Nivel - Modelos Free em Nuvem e Edge (Ollama, llama.cpp, Hermes Agent):** Absorcao da rotina macica; custo de infraestrutura zero.
3. **3o Nivel - Pools Multi-Tier OpenRouter:** 16 chaves dedicadas particionadas em HKCU/HKLM com circuit breaker adaptativo (Tiers 1 a 4).
4. **4o Nivel - Pay-as-you-go Sob Demanda:** Invocacao estrita e cirurgica com tetos em `esforcos_autorizados`.

## 3. Painel de Avaliacao de Impacto Factual da Sessao

### Painel de Avaliacao de Impacto da Sessao (Agnostico Tier 1-2-3)

| Metrica de Impacto | Valor Medido | Status / Observacao |
| :--- | :--- | :--- |
| **Economia de Tokens MCP (S1)** | **-39.46%** | Poda dinamica de schemas irrelevantes (overhead: 781914.8 us) |
| **Ingress Fast-Path S1** | **0.0406 ms** (40.6 us) | Triagem O(1) de tarefas sem compilar grafo |
| **Passivo de Pendencias** | **1 abertas** (reducao: 0.0%) | Resolucao formal via M.O. 13.F |
| **Integridade do Ledger** | **86 registros** (tail: `05e1ca14`) | Portao acumulado: 0 sessoes |
| **Resolucao de Tarefas SQLite** | **100.0%** (0/0) | 0 pendencias residuais ou falhas |
| **Pools OpenRouter Multi-Tier** | **16 chaves** (16 ativas, score: 80.0) | T1: 3 \| T2: 3 \| T3: 5 \| T4: 5 (0 bloq / 0 rev) |
| **Eficiencia Economica & Infra** | **14 cloud / 13 locais** | Cotas Pro Tier 1 prioritarias (Faixa.FLAT_FEE); Mitigacao ativa de custos de servidores |
