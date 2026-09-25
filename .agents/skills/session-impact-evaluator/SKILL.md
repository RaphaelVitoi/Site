---
name: session-impact-evaluator
description: Avaliacao objetiva, factual e agnostica de impacto de sessao entre modelos Tier 1, 2 e 3. Use compulsoriamente ao final anunciado de cada sessao para mensurar percentuais de reducao de pendencias, economia de tokens MCP (S1), latencia de ingress, integridade do ledger e taxas de resolucao de fila.
---

# SOTA Session Impact Evaluator (Agnóstico Tiers 1-2-3)

Esta skill define o protocolo padrão-ouro para **avaliação factual, quantitativa e agnóstica do impacto produzido ao longo de uma sessão de trabalho**, aplicável uniformemente a qualquer condutor agêntico dos **Tiers 1, 2 e 3** (Claude, Gemini, Codex, Laya, Gemma/Ollama), sob a égide do coletivo **CHICO** e a ausência estrita de feudos funcionais (§7 do `Site/CLAUDE.md`).

## 1. Princípio Democrático e Universalidade

Nenhum modelo ou fornecedor possui monopólio ou feudo funcional sobre a medição de integridade do ecossistema:
- **Tier 1 (Fronteira & Orquestração):** `Gemini 3.8 Flash`, `Claude Opus 5`, `ChatGPT 6 Luna/Sol/Astra`.
- **Tier 2 (Especialistas & Solvers):** `Laya Multilingual S1`, `TimesFM`, `DeepSeek/Qwen`, `Stitch`, `Jules`.
- **Tier 3 (Modelos Locais & Destilados):** `Gemma 2/4`, `Phi-4`, `Ollama`.

Todos os condutores executam a mesma ferramenta CLI determinística em Python 3.12+ isolada no `.venv`:
```powershell
.venv/Scripts/python.exe scripts/ops/avaliar_impacto_sessao.py --pendencias-inicio <N> --markdown
```

## 2. Momento de Execução: O Final Anunciado da Sessão

Esta skill deve ser disparada **compulsoriamente no encerramento anunciado de cada sessão de trabalho** — isto é, quando o Tier 0 ou o condutor declara o fechamento formal dos trabalhos e a preparação do relatório de Handoff.

> [!IMPORTANT]
> A avaliação não substitui o relatório de Handoff; ela **fornece o lastro quantitativo** mandatória que deve ser incorporado na Seção de Resultados do `reports/HANDOFF-*.md`.

## 3. Os 7 Eixos Objetivos de Medição

A ferramenta afere concretamente:

1. **Passivo de Governança & Pendências (`scripts/ops/record_gate.py`):**
   - Coleta pendências abertas no início da sessão versus encerramento.
   - Calcula a redução percentual: $\Delta\% = \frac{\text{Abertas}_{\text{inicio}} - \text{Abertas}_{\text{fim}}}{\text{Abertas}_{\text{inicio}}} \times 100\%$.
2. **Ledger de Calibração & Suficiência (§8.3 do `CLAUDE.md`):**
   - Valida integridade da cadeia SHA-256 (`Test-AgentCalibrationLedger.ps1`).
   - Verifica total de registros, tail hash e sessões acumuladas no portão diário (`daily/<data>.json`).
3. **Fila de Tarefas Assíncronas SQLite (`core/task_queue.py`):**
   - Mede tarefas `completed`, `pending`, `running` e `failed`.
   - Calcula a taxa de resolução efetiva da fila (alvo: 100%).
4. **Economia de Contexto & Tool Calling (`llm/mcp_tool_interceptor.py`):**
   - Mede a redução percentual de tokens de schemas de ferramentas podados via oráculo S1 e o overhead de latência em microssegundos ($\mu\text{s}$).
5. **Latência de Decisão & Ingress Fast-Path S1 (`core/arbitrator.py`):**
   - Mede a latência de triagem $\mathcal{O}(1)$ de tarefas unitárias sem compilação desnecessária de grafos DAG.
6. **Integridade e Saúde dos Pools de Chaves Multi-Tier (`llm/openrouter_pool.py`):**
   - Mede contagem total de chaves (16 chaves), distribuição por tier (Tier 1: 3, Tier 2: 3, Tier 3: 5, Tier 4: 5), chaves bloqueadas por rate limit (HTTP 429), revogações (HTTP 401/403), score médio de saúde e paridade de registro HKCU/HKLM.
7. **Eficiência Econômica, Cotas Pro & Mitigação de Infraestrutura (`data/ollama_models.json` & §3 do `CLAUDE.md`):**
   - Valida a primazia das cotas mensais de assinaturas Pro (`Faixa.FLAT_FEE`, custo marginal zero) para modelos Tier 1 antes de qualquer consumo de API paga.
   - Mede a disponibilidade e proporção de modelos free em nuvem Zero-RAM/VRAM (Ollama `gemma4:31b-cloud`, `kimi-k2.7-code:cloud`, etc.) e modelos locais quantizados de alta taxa tokens/watt (llama.cpp família Qwen e Hermes Agent família Laguna), atestando a mitigação ativa de custos operacionais de servidores dedicados e VMs pagas.

## 4. Como Executar e Incorporar no Handoff

### Passo 1: Executar o Avaliador
Execute no terminal da raiz do projeto:
```powershell
.venv/Scripts/python.exe scripts/ops/avaliar_impacto_sessao.py --pendencias-inicio <TOTAL_INICIAL> --markdown
```

### Passo 2: Copiar a Tabela para o Relatório de Handoff
A saída gerada segue rigorosamente o formato Markdown aprovado pelos gates:

```markdown
### Painel de Avaliacao de Impacto da Sessao (Agnostico Tier 1-2-3)

| Metrica de Impacto | Valor Medido | Status / Observacao |
| :--- | :--- | :--- |
| **Economia de Tokens MCP (S1)** | **-XX.XX%** | Poda dinamica de schemas irrelevantes (overhead: XX.X us) |
| **Ingress Fast-Path S1** | **X.XXXX ms** (XX.X us) | Triagem O(1) de tarefas sem compilar grafo |
| **Passivo de Pendencias** | **X abertas** (reducao: XX.X%) | Resolucao formal via M.O. 13.F |
| **Integridade do Ledger** | **XX registros** (tail: `XXXXXXXX`) | Portao acumulado: X sessoes |
| **Resolucao de Tarefas SQLite** | **100.0%** (X/X) | 0 pendencias residuais ou falhas |
| **Pools OpenRouter Multi-Tier** | **16 chaves** (16 ativas, score: 80.0) | T1: 3 \| T2: 3 \| T3: 5 \| T4: 5 (0 bloq / 0 rev) |
| **Eficiencia Economica & Infra** | **14 cloud / 13 locais** | Cotas Pro Tier 1 prioritarias (Faixa.FLAT_FEE); Mitigacao ativa de custos de servidores |
```

### Passo 3: Fechamento no Git
Após anexar o painel ao `reports/HANDOFF-*.md`, rodar o pre-flight `record_gate.py` e selar o commit com a assinatura canônica do modelo condutor.
