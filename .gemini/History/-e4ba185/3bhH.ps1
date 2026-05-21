<#
.SYNOPSIS
    Exibe as tarefas concluídas nos últimos 7 dias.
#>

$QueuePath = Join-Path $PSScriptRoot "queue\tasks.json"
$CutoffDate = (Get-Date).AddDays(-7)

Clear-Host
Write-Host "==========================================================================" -ForegroundColor Cyan
Write-Host " [STATUS] NEXUS :: Vitorias da Semana" -ForegroundColor Yellow
Write-Host "==========================================================================`n" -ForegroundColor Cyan

if (-not (Test-Path $QueuePath)) {
    Write-Host "[STATUS] Fila de tarefas vazia ou organismo hibernando." -ForegroundColor DarkGray
    exit
}

$raw = Get-Content $QueuePath -Raw -Encoding UTF8
$payload = $raw | ConvertFrom-Json
$tasks = if ($null -ne $payload.tasks) { @($payload.tasks) } else { @() }

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