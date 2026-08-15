# MATRIZ DE ROTEAMENTO DE SKILLS E MCPs (SOTA GOLD)

> **Guardião:** @maverick / @dispatcher
> **Propósito:** Mapeamento determinístico de qual Skill, Agente e Servidor MCP deve ser acionado dependendo do domínio do projeto que está sendo alterado. Esta matriz elimina o uso genérico de ferramentas e força a especialização.

## 1. DOMÍNIO: Motor Matemático (ICM, RIO, Equity) e Ciência de Dados
**Diretório Alvo:** `engine/`, `math/`, `jupyter/`
**Mantra:** "Evidências antes de conclusões. Nunca iterar sobre a matemática sem prova em solver."

*   **Pré-Requisito Obrigatório:** `activate_skill("framing-research-questions")` e `activate_skill("preregistering-analysis")`.
*   **Implementação:** `activate_skill("quantitative-analysis")` + `activate_skill("ml-best-practices")`.
*   **MCP Ativo:** `Desktop Commander` (para rodar `start_process("python3 -i")` e validar os coeficientes em memória sem sujar arquivos).
*   **Validação Final:** `activate_skill("investigating-anomalous-results")` se o output do simulador não bater com os benchmarks do HRC (Holdem Resources Calculator).

## 2. DOMÍNIO: Arquitetura de Nuvem, ADC e GCP
**Diretório Alvo:** `ops-deploy/`, `infra/`, Configurações de Deploy.
**Mantra:** "A infraestrutura é mutável, o estado é sagrado."

*   **Planejamento:** `activate_skill("designing-and-deploying-infrastructure")`.
*   **Execução GCP/Azure:** Acionar MCP `GeminiCloudAssist` -> `design_infra`.
*   **Segurança Anti-Entropia:** ANTES de qualquer comando de deleção, `activate_skill("accidental-data-loss-prevention")`.
*   **Monitoramento:** `activate_skill("gcp-composer-troubleshooting")` ou logs diretos via CLI purificada (ASCII).

## 3. DOMÍNIO: Frontend (UI/UX, Next.js, Tailwind)
**Diretório Alvo:** `frontend/src/`, `components/`
**Mantra:** "O Belo e o Moral. A interface é a manifestação tátil da Invariância Modular."

*   **Design & Tokens:** MCP `Stitch` (`get_project`, `create_design_system`).
*   **Desenvolvimento de Data Apps:** `activate_skill("building-data-apps")`.
*   **Revisão Estética:** @curator usa a skill `/review` do Nanostack para validar acessibilidade e colorimetria SOTA.

## 4. DOMÍNIO: Backend & Orquestração (Python, AIOHTTP, LanceDB)
**Diretório Alvo:** `api/`, `core/`, `agents/`
**Mantra:** "Zero-Any. Fricção O(1). Tipagem Pydantic Estrita."

*   **Desenvolvimento Geral:** `activate_skill("test-driven-development")` + `activate_skill("systematic-debugging")`.
*   **Auditoria de Código:** `activate_skill("requesting-code-review")` (invocando o Nanostack `/security` e `/qa`).
*   **Eficiência Extrema:** Todas as chamadas de shell para manipulação em massa devem ser precedidas de `activate_skill("token-efficiency")`.

## 5. REGRAS DE HIBRIDIZAÇÃO E HOOKS SOTA
Se a tarefa tocar mais de um domínio (ex: Criar rota no Backend para servir um componente novo no Frontend):
1.  **Roteamento Principal:** `activate_skill("dispatching-parallel-agents")` (ou subagents via `@generalist`).
2.  **Hook de Gatilho:** Antes de submeter ao Git, o Hook OBRIGATORIAMENTE dispara o `uv run nexus ops lint` e valida o `token-efficiency` no log gerado.
