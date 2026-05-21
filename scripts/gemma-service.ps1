# SOTA Gemma Server Control
# Gerencia o ciclo de vida do motor de inferência local Gemma 4.

$GEMMA_PORT = 17043
$SERVER_SCRIPT = "$PSScriptRoot\..\engine\gemma_server.py"
$PYTHON_EXE = "$PSScriptRoot\..\.venv\Scripts\python.exe"

if (-not (Test-Path $PYTHON_EXE)) { $PYTHON_EXE = 'python' }

function Start-GemmaServer {
    Write-Host "`n[SOTA] Acordando o Oráculo de Borda (@gemma4)..." -ForegroundColor Magenta

    # Verifica se ja esta rodando
    $process = Get-NetTCPConnection -LocalPort $GEMMA_PORT -ErrorAction SilentlyContinue
    if ($process) {
        Write-Host "[OK] Motor Gemma ja esta operando na porta $GEMMA_PORT." -ForegroundColor Green
        return
    }

    # Inicia em background (Janela minimizada/oculta)
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = $PYTHON_EXE
    $psi.Arguments = $SERVER_SCRIPT
    $psi.CreateNoWindow = $true
    $psi.UseShellExecute = $false
    $psi.WindowStyle = 'Hidden'

    [System.Diagnostics.Process]::Start($psi) | Out-Null

    Write-Host '[SUCESSO] Oráculo em processo de carregamento (Background).' -ForegroundColor Green
    Write-Host "  > Endpoint: http://127.0.0.1:$GEMMA_PORT"
    Write-Host '  > Hardware: Auto-Discovery (DirectML/CUDA/CPU)'
}

function Stop-GemmaServer {
    Write-Host "`n[SOTA] Hibernando o Oráculo Gemma..." -ForegroundColor Yellow

    # Encontra o processo que escuta na porta
    $portConnections = Get-NetTCPConnection -LocalPort $GEMMA_PORT -ErrorAction SilentlyContinue
    foreach ($conn in $portConnections) {
        if ($conn.OwningProcess) {
            Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
        }
    }

    Write-Host '[OK] Motor Gemma hibernado.' -ForegroundColor Green
}

if ($args[0] -eq 'stop') {
    Stop-GemmaServer
}
else {
    Start-GemmaServer
}
