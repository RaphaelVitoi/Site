<#
.SYNOPSIS
    NEXUS EYE: Interface Neural em Tempo Real.
    Lê e formata esteticamente os pensamentos e ações do Worker Pydantic.
#>

$LogPath = Join-Path $PSScriptRoot ".claude\logs\task_executor.log"
Clear-Host

Write-Host "==========================================================================" -ForegroundColor Cyan
Write-Host " [NEXUS EYE] :: Monitor de Consciencia Sistemica (Triade Viva)" -ForegroundColor Yellow
Write-Host "==========================================================================" -ForegroundColor Cyan

# Checagem de Vitalidade (Heartbeat)
$Workers = Get-CimInstance Win32_Process -Filter "Name = 'python.exe' OR Name = 'pythonw.exe'" | Where-Object CommandLine -match "task_executor\.py.*worker"
if ($Workers) {
    Write-Host "[STATUS] Orquestrador Ativo. Fluxo neural detectado. (PID: $($Workers[0].ProcessId))" -ForegroundColor Green
}
else {
    Write-Host "[STATUS] Entropia inativa. O Orquestrador está hibernando." -ForegroundColor DarkGray
    Write-Host "DICA: Execute '.\start_worker.ps1' em outro terminal para ignificar a vida." -ForegroundColor Yellow
}

Write-Host "Pressione [Ctrl+C] para fechar esta interface neural a qualquer momento.`n" -ForegroundColor DarkMagenta

# Espera Elegante se o arquivo ainda não existir
if (-not (Test-Path $LogPath)) {
    Write-Host "⏳ Aguardando o primeiro pulso de pensamento em $LogPath..." -ForegroundColor DarkGray
    while (-not (Test-Path $LogPath)) {
        Start-Sleep -Seconds 2
    }
}

# Streaming Continuo e Semantico (Traducao Visual para foco TDAH/AHSD)
Get-Content -Path $LogPath -Tail 30 -Wait | ForEach-Object {
    $line = $_

    # Mapeamento Estético e Didático
    if ($line -match "\[ERROR\]|Falha|Corrupção") {
        Write-Host "[FAIL] $line" -ForegroundColor Red
    }
    elseif ($line -match "\[WARNING\]|Simulacao|ausente|transiente") {
        Write-Host "[WARN] $line" -ForegroundColor DarkYellow
    }
    elseif ($line -match "Metamorfose|RUNNING") {
        Write-Host "[>>>] $line" -ForegroundColor Magenta
    }
    elseif ($line -match "COMPLETED|Simetria|SUCCESS") {
        Write-Host "[OK]  $line" -ForegroundColor Green
    }
    elseif ($line -match "Ignificando pensamento|Acionando cognicao") {
        Write-Host "[COG] $line" -ForegroundColor Cyan
    }
    elseif ($line -match "=== ORQUESTRADOR") {
        Write-Host "`n[CORE] $line" -ForegroundColor White -BackgroundColor DarkBlue
    }
    else {
        Write-Host "   $line" -ForegroundColor Gray
    }
}