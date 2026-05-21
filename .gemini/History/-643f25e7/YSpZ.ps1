<#
.SYNOPSIS
    Inicia a validacao final da arquitetura de rotas e banco de dados.
#>

$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path

Write-Host '=== PROTOCOLO: VALIDACAO SOTA (ARQUITETURA E DB) ===' -ForegroundColor Magenta

$taskId = "VALID-ARCH-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
$description = "Acesse e leia '.claude/SPEC_ROTEAMENTO_DB.md'. Audite fisicamente a pasta 'frontend/src/app' e o arquivo 'frontend/prisma/schema.prisma'. Confirme se a estrutura do App Router e o provider SQLite estao estritamente conforme a SPEC. Se houver entropia ou falta de arquivos essenciais, corrija imediatamente via God Mode."

$task = [ordered]@{
    "id"          = $taskId
    "description" = $description
    "status"      = "pending"
    "timestamp"   = (Get-Date -Format "o")
    "agent"       = "@auditor"
}

$taskJson = $task | ConvertTo-Json -Depth 10 -Compress:$true
$taskB64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($taskJson))
$PythonCmd = if (Test-Path "$ProjectRoot\.venv\Scripts\python.exe") { "$ProjectRoot\.venv\Scripts\python.exe" } else { "python" }

& $PythonCmd (Join-Path $ProjectRoot "task_executor.py") db-add $taskB64 | Out-Null
Write-Host '[NEXUS] Tarefa materializada e delegada ao @auditor via SQLite.' -ForegroundColor Green