param([Parameter()][switch]$Live = $false, [int]$RefreshSeconds = 5)
$queuePath = Join-Path $PSScriptRoot "queue\tasks.json"
function Show-Dashboard {
    if (-not (Test-Path $queuePath)) { return }
    $obj = Get-Content $queuePath -Raw | ConvertFrom-Json
    $tasks = if ($obj.tasks) { $obj.tasks } else { @() }
    if ($tasks -isnot [array]) { $tasks = @($tasks) }
    Write-Host "`n=== DASHBOARD ===" -ForegroundColor Cyan
    Write-Host "Total: $($tasks.Count)"
    Write-Host "Versao: $($obj.version)"
    Write-Host ""
}
if ($Live) { do { Clear-Host; Show-Dashboard; Start-Sleep $RefreshSeconds } while ($true) } else { Show-Dashboard }
