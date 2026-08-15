# Auditoria Holística do Ecossistema SOTA (Plugins, Skills, MCPs e Integrações)

> **Guardião:** @maverick / @historian
> **Data da Auditoria:** 12 de Junho de 2026
> **Propósito:** Mapeamento profundo do poder de fogo cognitivo e mecânico da malha SOTA (Gemini CLI), revelando extensões instaladas, servidores MCP ativos, inventário de skills e o potencial de integrações híbridas.

---

## 1. Extensões Locais Instaladas (`~/.gemini/extensions/`)

O ecossistema local abriga os seguintes módulos fundamentais de expansão de capacidade:

*   **Produtividade & Gerenciamento:** `todoist-extension`
*   **Memória & Contexto:** `gemini-supermemory`, `conductor`
*   **Integração Web & Pesquisa:** `exa-mcp-server`, `developer-knowledge`, `research-cli`, `huggingface`
*   **Cloud & Deploy:** `GeminiCloudAssist`, `google-agents-cli`
*   **Sistema & Execução:** `desktop-commander`, `nanostack`, `token-efficiency`
*   **Data & Bancos de Dados:** `mcp-toolbox`, `mcp-toolbox-for-databases`
*   **Cognição & Metodologia:** `co-researcher`, `science-superpowers`, `superpowers`, `criticalthink`
*   **Engenharia de Software (UI/Agents):** `Stitch`, `gemini-cli-jules`

---

## 2. Inventário de Servidores MCP e Ferramentas (Tools)

O sistema expõe um arsenal vasto de ferramentas nativas via Model Context Protocol (MCP), subdivididas em eixos de atuação:

### 2.1 Eixo de Sistema & I/O (Desktop Commander)
*   **Terminal & Processos:** `start_process`, `interact_with_process`, `read_process_output`, `list_processes`, `list_sessions`, `kill_process`, `force_terminate`. Permite rodar REPLs interativos (ex: Python/Node), instanciar servidores locais e manipular I/O contínuo.
*   **Filesystem Recursivo:** `read_file`, `write_file`, `read_multiple_files`, `edit_block` (edições cirúrgicas em diffs), `list_directory` (proteção de estouro de tokens), `move_file`, `get_file_info`.
*   **Engenharia de Documentos:** `write_pdf` e capacidades acopladas para .xlsx, CSVs extensos e extração de metadados.
*   **Busca em Profundidade:** `start_search`, `get_more_search_results`, `stop_search`, `list_searches` (pesquisas assíncronas em grandes volumes).
*   **Recursos (URIs):** `desktop-commander:ui://desktop-commander/file-preview` (Renderização de UI p/ preview de arquivos) e `config-editor`.

### 2.2 Eixo de Automação em Nuvem & Infraestrutura
*   **Gemini Cloud Assist:** `ask_cloud_assist`, `investigate_issue` (SRE in a box, Root Cause Analysis), `optimize_costs`, `design_infra` (Geração de Terraform/K8s/Bash), `invoke_operation`.
*   **Application Design Center (ADC):** `manage_application`, `manage_application_template` (Import/Export de IaC em Terraform), `assess_best_practices`, `setup_adc`.

### 2.3 Eixo de Engenharia de Frontend GenAI (Stitch)
*   `create_project`, `get_project`, `list_projects`
*   `generate_screen_from_text`, `edit_screens`, `generate_variants`
*   `create_design_system`, `update_design_system`, `apply_design_system`, `upload_design_md` (Integrações com design-system tokens unificados e conversão text-to-UI).

### 2.4 Eixo de Conhecimento, Memória & Pesquisa Externa
*   **Developer Knowledge:** `search_documents`, `answer_query`, `get_documents` (Grounded search em docs oficiais do Google, TensorFlow, Flutter, Cloud, etc).
*   **Exa Web Search:** `web_search_exa` (Neural search com categoria: empresa/pessoas), `web_fetch_exa` (Parse puro de sites HTML para Markdown). Recurso exposto: `exa://tools/list`.
*   **Supermemory:** `search_memory`, `add_memory`, `save_project_memory` (Persistência global de decisões e arquitetura independentemente da sessão atual).

### 2.5 Eixo de Produtividade & CI/CD
*   **Jules (GitHub/Repositório):** `start_new_jules_task` (automação em nível de repositório, refatorações amplas, PRs gerados por IA).
*   **Todoist:** Ferramentas dinâmicas habilitadas no namespace MCP (`create_task`, `get_tasks`, controle de prioridades, etc) com base na extensão.

---

## 3. Matriz de Skills e Paradigmas Cognitivos

O sistema integra mais de **75 Skills**, que atuam como injeções de contexto dinâmico ("sub-agentes de comportamento") via ferramenta `activate_skill`.

### 3.1 Ciência, Metodologia e Red-Teaming (Science Superpowers / Co-Researcher)
*   `framing-research-questions`, `surveying-prior-work`, `preregistering-analysis`, `investigating-anomalous-results`.
*   `hypothesis-testing`, `quantitative-analysis`, `qualitative-research`, `systematic-review`, `peer-review`, `requesting-red-team-review`.
*   **Mantra:** Rigor acadêmico. Nunca olhar o dado final sem pre-registrar o plano. "Evidências antes de conclusões".

### 3.2 Engenharia de Software SOTA (Nanostack / Superpowers)
*   **Ciclo de Vida:** `brainstorming`, `/think`, `writing-plans` (`/nano`), `test-driven-development`, `subagent-driven-development`, `systematic-debugging`, `/review`, `/qa`, `/security`, `/ship`.
*   **Governança & Repositório:** `using-git-worktrees`, `finishing-a-development-branch`, `requesting-code-review`.

### 3.3 Nuvem, Dados e IA Especializada (GCP, Azure, BigQuery)
*   **Google Cloud / Data:** `gcp-data-pipelines`, `gcp-dataflow`, `gcp-spark`, `dbt-bigquery`, `dataform-bigquery`, `developing-with-bigquery`, `discovering-gcp-data-assets`.
*   **Segurança de Nuvem:** `accidental-data-loss-prevention` (Guardião fundamental contra `DROP`, `DELETE`, etc.), `gcloud-auth-verification`.
*   **Google Agents CLI (ADK):** `google-agents-cli-workflow`, `google-agents-cli-scaffold`, `google-agents-cli-eval`, `google-agents-cli-deploy` e `google-agents-cli-observability`.
*   **Microsoft / Azure Ecosystem:** Ampla gama de skills (ex: `azure-deploy`, `azure-diagnostics`, `azure-cost`, `microsoft-foundry`, `entra-app-registration`, `azure-kubernetes`).
*   **Machine Learning:** `ml-best-practices`, `notebook-guidance`, `hf-cli-management` (Hugging Face CLI), `airunway-aks-setup`.

### 3.4 Operações de Borda & Estabilização
*   `token-efficiency` (Redução brutal de ruído em outputs do sistema).
*   `desktop-commander-overview` (Guia para o uso do MCP Desktop Commander).
*   `windows-dev-env-stabilization`, `windows-system-maintenance`.
*   `skill-repair`, `mcp-extension-troubleshooting` (Manutenção do próprio ecossistema LLM).

---

## 4. Integrações Potenciais & Destilações de Arquitetura (A Rota do Cérebro Híbrido)

A sinergia entre estas ferramentas permite **Destilações Operacionais (Workflows SOTA)** impressionantes:

1.  **Refatoração Termodinâmica O(1) (Desktop Commander + Superpowers + Token Efficiency):**
    *   Uso do `ast-grep` ou `rg` via `run_shell_command` no background com as regras de *token-efficiency*.
    *   Uso de `edit_block` para aplicar substituições cirúrgicas em escala, revisadas previamente via a skill `/review` do Nanostack, impedindo gargalos de VRAM.

2.  **Geração e Deploy Automático (Stitch + Cloud Assist + Jules):**
    *   **Passo 1:** Criar UI via `mcp_stitch_generate_screen_from_text`.
    *   **Passo 2:** Ajustar Design Tokens (`mcp_stitch_update_design_system`).
    *   **Passo 3:** Empacotar para Nuvem usando `mcp_application_design_center_manage_application_template` (Terraform/IaC).
    *   **Passo 4:** Disparar `start_new_jules_task` para enviar um Pull Request no repositório integrando o IaC da nova tela.

3.  **Análise de Dados Persistente (Desktop Commander REPL + BigQuery Toolbox):**
    *   Lançar um REPL interativo Python usando `start_process("python3 -i")`.
    *   Usar `interact_with_process` para instanciar as credenciais extraídas via `gcloud-auth-verification`.
    *   Rodar modelagens (pandas/polars) direto na memória da máquina host sem custo excessivo de transferência JSON no terminal, guiado pela skill `ml-best-practices`.

4.  **Gestão Contínua do Cérebro (Supermemory + Memory RAG + LanceDB):**
    *   Ao encontrar uma regra arquitetural nova, usar `add_memory` (Supermemory).
    *   Executar o script assíncrono `memory_rag.py ingest` para solidificar a regra no LanceDB local.
    *   Isso fornece ao Gemini/Claude acesso neural à nova regra e previne alucinações cognitivas nas sessões seguintes.

---
**CONCLUSÃO:**
O ambiente está massivamente aparelhado com os maiores protocolos da engenharia contemporânea. Os vetores cobrem desde metodologias ágeis hardcore (`TDD`, `Red-Team`) até interações em tempo real com APIs de Nuvem e Máquinas Locais, operando sob uma política estrita de fricção zero e integridade absoluta.
