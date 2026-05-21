<#
.SYNOPSIS
    Exibe as tarefas concluidas nos ultimos 7 dias.
#>

$CutoffDate = (Get-Date).AddDays(-7)
$ProjectRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$PyScript = Join-Path $ProjectRoot "task_executor.py"
$PythonCmd = if (Test-Path "$ProjectRoot\.venv\Scripts\python.exe") { "$ProjectRoot\.venv\Scripts\python.exe" } else { "python" }

Clear-Host
Write-Host "==========================================================================" -ForegroundColor Cyan
Write-Host " [STATUS] NEXUS :: Vitorias da Semana" -ForegroundColor Yellow
Write-Host "==========================================================================`n" -ForegroundColor Cyan

$JsonOutput = & $PythonCmd $PyScript db-get all
if ($LASTEXITCODE -ne 0 -or -not $JsonOutput) {
    Write-Host "[STATUS] Nao foi possivel acessar a fila de tarefas SOTA (SQLite)." -ForegroundColor Red
    exit
}

$tasks = $JsonOutput | ConvertFrom-Json
$tasks = if ($null -ne $tasks) { @($tasks) } else { @() }

$completedThisWeek = @()

foreach ($t in $tasks) {
    if ($t.status -eq "completed") {
        $dateStr = if ($t.completedAt) { $t.completedAt } else { $t.timestamp }
        if ($dateStr) {
            $taskDate = [datetime]$dateStr
            if ($taskDate -ge $CutoffDate) {
                $completedThisWeek += $t
            }
        }
    }
}

if ($completedThisWeek.Count -eq 0) {
    Write-Host " Nenhuma sinapse foi concluida nos ultimos 7 dias." -ForegroundColor DarkGray
}
else {
    Write-Host " [ TAREFAS CONCLUIDAS: $($completedThisWeek.Count) ]`n" -ForegroundColor White
    
    # Ordenar das mais recentes para as mais antigas
    $completedThisWeek = $completedThisWeek | Sort-Object -Property @{Expression = { if ($_.completedAt) { [datetime]$_.completedAt } else { [datetime]$_.timestamp } }; Descending = $true }
    
    foreach ($t in $completedThisWeek) {
        $dateStr = if ($t.completedAt) { $t.completedAt } else { $t.timestamp }
        $dateFormatted = ([datetime]$dateStr).ToString("dd/MM HH:mm")
        $agent = $t.agent.PadRight(15)
        $desc = if ($t.description.Length -gt 60) { $t.description.Substring(0, 57) + "..." } else { $t.description.PadRight(60) }
            
        Write-Host " [OK] [$dateFormatted] $agent | $desc" -ForegroundColor Green
    }
}

Write-Host "`n==========================================================================" -ForegroundColor Cyan
