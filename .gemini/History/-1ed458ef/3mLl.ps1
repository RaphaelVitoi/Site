<#
.SYNOPSIS
    Garante a homeostase da documentacao central do sistema.
.DESCRIPTION
    Este script aciona o @organizador com uma diretriz clara para auditar e sincronizar
    a documentacao central (`project-context.md` e `SOTA_REFERENCE_ARCHITECTURE.md`)
    com a realidade atual do sistema, prevenindo a obsolescencia e garantindo que
    todos os agentes operem com a fonte da verdade mais recente.
    Deve ser executado periodicamente pelo @skillmaster ou manualmente apos grandes mudancas.
#>

$ProjectRoot = Split-Path $PSScriptRoot -Parent
$EnvPath = Join-Path $ProjectRoot "_env.ps1"
if (Test-Path $EnvPath) { . $EnvPath }

Write-Host "=== INICIANDO PROTOCOLO DE SINCRONIA DOCUMENTAL ===" -ForegroundColor Cyan

$taskId = "MAINT-CONTEXT-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
$taskDescription = @"
DIRETRIZ DE SINCRONIA DOCUMENTAL PARA @organizador:
A documentacao central do sistema esta em risco de obsolescencia.
Sua tarefa e realizar uma auditoria completa e atualizar DOIS arquivos para refletir o ESTADO DA ARTE do sistema:
1.  `docs/SOTA_REFERENCE_ARCHITECTURE.md`: O mapa mestre da topologia, componentes e fluxos.
2.  `.claude/project-context.md`: O resumo de alto nivel do estado atual do projeto.

CHECKLIST DE VERIFICACAO OBRIGATORIA:
1.  **Arquitetura de Referencia:** O `SOTA_REFERENCE_ARCHITECTURE.md` deve conter a topologia de diretorios, a funcao de cada script critico (do.ps1, task_executor.py, etc.), o fluxo de dados (CLI -> do.ps1 -> task_executor.py -> SQLite) e o papel dos 17 agentes. Use diagramas Mermaid para clareza.
2.  **Contexto do Projeto:** O `project-context.md` deve ser um resumo conciso do estado atual, apontando para a Arquitetura de Referencia para detalhes profundos.
3.  **Stack Tecnologica:** Assegure que a stack (Python, aiosqlite, PowerShell, ChromaDB, Next.js) esta corretamente descrita em ambos os documentos.
4.  **Contagem de Agentes:** Valide o numero total (18 Agentes IA).
5.  **Leis e Principios:** Garanta que os documentos refletem os principios mais recentes do `MODUS_OPERANDI.md`.

Execute a reescrita do arquivo para garantir a simetria perfeita.
"@

$task = [ordered]@{
    id          = $taskId
    description = $taskDescription
    status      = "pending"
    timestamp   = (Get-Date -Format "o")
    agent       = "@organizador"
    metadata    = @{
        priority = "high"
    }
}

# SOTA Python DAL
$taskJson = $task | ConvertTo-Json -Depth 10 -Compress
$taskB64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($taskJson))
$PyScript = Join-Path $ProjectRoot "task_executor.py"
$PythonCmd = if (Test-Path "$ProjectRoot\.venv\Scripts\python.exe") { "$ProjectRoot\.venv\Scripts\python.exe" } else { "python" }

$output = & $PythonCmd $PyScript db-add $taskB64
if ($LASTEXITCODE -ne 0) { Write-Error "Falha ao enfileirar: $output"; exit 1 }

Write-Host "[OK] Tarefa de sincronia ($taskId) enfileirada para o @organizador." -ForegroundColor Green
Write-Host "[ACAO RECOMENDADA] Execute 'python .\task_executor.py worker' para que o @organizador cumpra a diretriz." -ForegroundColor Yellow
