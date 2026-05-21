<#
.SYNOPSIS
    Enfileira a tarefa de compressao de memoria para o @bibliotecario.
#>

$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$EnvPath = Join-Path $ProjectRoot "_env.ps1"
if (Test-Path $EnvPath) { . $EnvPath }

Write-Host '=== PROTOCOLO DE COMPRESSAO DE MEMORIA (@bibliotecario) ===' -ForegroundColor Magenta

$taskId = "COMPRESS-MEM-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
$description = "Agente @bibliotecario, inicie o protocolo de compressao de memoria. " +
"Navegue pelos diretorios dentro de '.claude/agent-memory/'. Identifique os arquivos 'MEMORY.md' que possuem mais de 100-150 linhas de log cru. " +
"Extraia as leis absolutas, as diretrizes de longo prazo e os padroes filosoficos adquiridos, e reescreva o arquivo de forma densa, sintetica e objetiva. " +
"Apague o ruido diario substituindo por dogmas atemporais daquele agente. " +
"Use seu God Mode para forjar os arquivos reescritos."

$task = [ordered]@{ 
    "id"          = $taskId
    "description" = $description
    "status"      = "pending"
    "timestamp"   = (Get-Date -Format "o")
    "agent"       = "@bibliotecario" 
}

$taskJson = $task | ConvertTo-Json -Depth 10 -Compress:$true
$taskB64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($taskJson))
$PythonCmd = if (Test-Path "$ProjectRoot\.venv\Scripts\python.exe") { "$ProjectRoot\.venv\Scripts\python.exe" } else { "python" }

& $PythonCmd (Join-Path $ProjectRoot "task_executor.py") db-add $taskB64 | Out-Null
Write-Host '[NEXUS] Tarefa materializada e delegada ao @bibliotecario.' -ForegroundColor Green