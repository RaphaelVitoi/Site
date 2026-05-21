<#
.SYNOPSIS
    Garante a homeostase do `project-context.md`, o coracao documental do sistema.
.DESCRIPTION
    Este script aciona o @organizador com uma diretriz clara para auditar e sincronizar
    o `project-context.md` com a realidade atual do sistema, prevenindo a obsolescencia
    e garantindo que todos os agentes operem com a fonte da verdade mais recente.
    Deve ser executado periodicamente pelo @skillmaster ou manualmente apos grandes mudancas.
#>

$ProjectRoot = Split-Path $PSScriptRoot -Parent
$EnvPath = Join-Path $ProjectRoot "_env.ps1"
if (Test-Path $EnvPath) { . $EnvPath }

Write-Host "=== INICIANDO PROTOCOLO DE SINCRONIA DOCUMENTAL ===" -ForegroundColor Cyan

$taskId = "MAINT-CONTEXT-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
$taskDescription = @"
DIRETRIZ PARA @organizador:
O arquivo `project-context.md` esta em risco de obsolescencia.
Sua tarefa e realizar uma auditoria completa e atualiza-lo para refletir o ESTADO DA ARTE do sistema.

CHECKLIST DE VERIFICACAO OBRIGATORIA:
1.  **Fila de Tarefas:** Confirme que a referencia e ao banco de dados `tasks.db` (SQLite) e que a mencao ao `tasks.json` foi erradicada.
2.  **Pipeline de Ingestao:** Verifique se o protocolo `do.ps1 -Ingest` esta documentado como o metodo para fechar o loop de friccao.
3.  **Contagem de Agentes:** Valide o numero total (atualmente 16 Entidades: Raphael + 15 Agentes IA).
4.  **Stack Tecnologica:** Assegure que a stack (Python DAL, PS1, SQLite, Next.js 16) esta corretamente descrita.
5.  **Leis e Principios:** Garanta que o documento reflete os principios mais recentes do `MODUS_OPERANDI.md`.

Execute a reescrita do arquivo para garantir a simetria perfeita.
"@

$task = [ordered]@{
    id          = $taskId
    description = $taskDescription
    status      = "pending"
    timestamp   = (Get-Date -Format "o")
    agent       = "@organizador"
}

# SOTA Python DAL
$taskJson = $task | ConvertTo-Json -Depth 10 -Compress:$true
$taskB64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($taskJson))
$PyScript = Join-Path $ProjectRoot "task_executor.py"
$PythonCmd = if (Test-Path "$ProjectRoot\.venv\Scripts\python.exe") { "$ProjectRoot\.venv\Scripts\python.exe" } else { "python" }

$output = & $PythonCmd $PyScript db-add $taskB64
if ($LASTEXITCODE -ne 0) { Write-Error "Falha ao enfileirar: $output"; exit 1 }

Write-Host "[OK] Tarefa de sincronia ($taskId) enfileirada para o @organizador." -ForegroundColor Green
Write-Host "[ACAO RECOMENDADA] Execute 'python .\task_executor.py worker' para que o @organizador cumpra a diretriz." -ForegroundColor Yellow
