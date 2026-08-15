# ==============================================================================
# NEXUS SOTA — Gerador do Dashboard de Scripts e Comandos
# ==============================================================================

Write-Host "=== [SISTEMA] GERANDO DASHBOARD DE COMANDOS DO CEO ===" -ForegroundColor Magenta

$ProjectRoot = (Get-Item "$PSScriptRoot\..\..").FullName
$DocPath = Join-Path $ProjectRoot "docs\SCRIPTS_E_COMANDOS_DASHBOARD.md"
$DocDir = Split-Path $DocPath

# Garante que o diretório docs exista
if (-not (Test-Path -LiteralPath $DocDir)) {
    New-Item -ItemType Directory -Path $DocDir -Force | Out-Null
}

$MarkdownContent = @"
# 🛠️ Painel de Comandos e Scripts do CEO (Raphael Vitoi)
> **NEXUS SOTA GOD MODE v7.5** — Guia rápido de referência operacional e atalhos do ecossistema.

---

## 🧠 Cognição e Execução de Tarefas
*   `nexus "sua tarefa"` ou `sota "sua tarefa"`
    *   **Descrição:** Enfileira uma nova tarefa assíncrona na malha para processamento.
*   `ask "sua pergunta"`
    *   **Descrição:** Consulta a base RAG vetorial do oráculo local.
*   `nexus-list`
    *   **Descrição:** Lista as últimas tarefas cadastradas no DAL.
*   `nexus-status` ou `nexus-hub`
    *   **Descrição:** Exibe o painel rápido de status das tarefas e orçamento de cotas de APIs.

---

## 🖥️ Painel de Controle e Orquestração
*   `dashboard` ou `vitoi_dashboard`
    *   **Descrição:** Abre a **Membrana Cognitiva SOTA (God Mode Dashboard)** interativa em tela cheia com atalhos de teclado de 0 a 9.
*   `start-worker`
    *   **Descrição:** Inicializa o executor de background (`task_executor.py`) com persistência.
*   `stop-worker`
    *   **Descrição:** Paralisa o executor de background com segurança (SIGINT gracioso).
*   `nexus-watch`
    *   **Descrição:** Inicia a vigília ativa de arquivos (.md, .py, etc.) acionando re-ingestão e sincronia debounced.
*   `nexus-cli [args]`
    *   **Descrição:** Executa comandos diretos no Kernel Python.

---

## 🔒 Governança de Autonomia (God Mode)
*   `autonomy-full`
    *   **Descrição:** Ativa o nível **W3 (God Mode irrestrito)** para execução livre de comandos e alterações.
*   `autonomy-partial`
    *   **Descrição:** Ativa o nível **W2 (Estrategista de Impacto)**, bloqueando comandos mutadores/destrutivos.
*   `autonomy-default`
    *   **Descrição:** Ativa o nível **W1 (Homeostase)**, permitindo apenas escrita e modificação de arquivos.
*   `autonomy-stop`
    *   **Descrição:** Ativa o nível **W0 (Observação Pura)**, suspendendo qualquer alteração ou execução.

---

## 📊 Diagnóstico, Segurança e Redes
*   `nexus-keys`
    *   **Descrição:** Audita chaves de API e executa diagnóstico de conectividade com as APIs do Google.
*   `nexus-fallback`
    *   **Descrição:** Exibe as métricas de cooldown e fallback dos modelos.
*   `nexus-route-health`
    *   **Descrição:** Analisa a latência e o status de saúde das rotas ativas na malha.
*   `nexus-gemini-health`
    *   **Descrição:** Executa testes de estresse e validação profunda de cotas da API Gemini.
*   `nexus-diag-net`
    *   **Descrição:** Diagnóstico rápido de conectividade geral.
*   `nexus-audit`
    *   **Descrição:** Dispara uma Auditoria SOTA Adaptativa (Smart MDA).

---

## 💾 Banco de Dados e Manutenção (DAL)
*   `nexus-db [subcomando]`
    *   **Descrição:** Executa operações diretas no SQLite (ex: `vacuum`, `purge-orphans`, `clear-pending`).
*   `nexus-checkdb`
    *   **Descrição:** Audita a integridade física e lógica do banco de dados do Nexus.
*   `nexus-backup`
    *   **Descrição:** Força um backup imediato dos bancos de dados, arquivos de agentes e variáveis.
*   `nexus-schedule`
    *   **Descrição:** Registra as tarefas automáticas de manutenção no Agendador de Tarefas.

---

## 🗺️ Visualização e Autopoiese
*   `nexus-sync`
    *   **Descrição:** Sincroniza o Manifesto (Gera/atualiza arquivos físicos dos agentes).
*   `nexus-map`
    *   **Descrição:** Abre a Arquitetura de Referência do Sistema.
*   `nexus-reflect`
    *   **Descrição:** Dispara o Despertar Cognitivo e a reflexão auto-regenerativa da Mente Coletiva.
*   `nexus-scripts-refresh`
    *   **Descrição:** Atualiza e regenera este arquivo de documentação.

---
*Dashboard de Comandos atualizado com sucesso em $((Get-Date).ToString('yyyy-MM-dd HH:mm:ss'))*.
"@

Set-Content -Path $DocPath -Value $MarkdownContent -Encoding UTF8
Write-Host "[OK] Dashboard de scripts gerado em: $DocPath" -ForegroundColor Green
