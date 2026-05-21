# Script de Ingestao de Ideias (Interface CEO -> Sistema)
# Facilita o Step 1 do Boot Operacional: "Nova ideia/problema"

param(
    [Parameter(Mandatory = $true, Position = 0, HelpMessage = "Descreva a ideia ou problema")]
    [string]$Description,

    [Parameter(Position = 1)]
    [ValidateSet("low", "medium", "high", "critical")]
    [string]$Priority = "medium"
)

$ProjectRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$PyScript = Join-Path $ProjectRoot "task_executor.py"
$PythonCmd = if (Test-Path "$ProjectRoot\.venv\Scripts\python.exe") { "$ProjectRoot\.venv\Scripts\python.exe" } else { "python" }

$taskId = "IDEA-$(Get-Date -Format 'yyyyMMdd-HHmmss')"

$task = [ordered]@{
    id          = $taskId
    description = $Description
    status      = "pending"
    timestamp   = (Get-Date -Format "o")
    agent       = "@dispatcher"
    metadata    = @{
        priority = $Priority
        source   = "CEO-Console"
        type     = "idea"
    }
}

$taskJson = $task | ConvertTo-Json -Depth 10 -Compress
$taskB64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($taskJson))
& $PythonCmd $PyScript db-add $taskB64 | Out-Null

Write-Host " [INPUT] Ideia registrada: $taskId" -ForegroundColor Green
Write-Host "   Destino: @dispatcher ($Priority)" -ForegroundColor Gray
