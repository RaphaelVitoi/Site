<#
.SYNOPSIS
    NEXUS ORCHESTRATOR - Gateway Universal de Invocacao SOTA v8.0 GOLD
.DESCRIPTION
    Porta de entrada canônica e hiper-resiliente para o Nexus Orchestrator no PowerShell.
    Opera com resolução dinâmica em cascata de 4 camadas:
      1. uv run (Fast-Path binário zero-friction com `--no-sync` quando disponível no PATH)
      2. Ambiente virtual isolado do projeto (.venv\Scripts\python.exe)
      3. Python ativo no PATH do sistema / usuário
      4. Diagnóstico estético guiado com orientações de recuperação imediata
    Garante ancoragem atômica de diretório (Push-Location / Pop-Location), blindagem
    contra colisões de parâmetros nativos do PowerShell (-p, -e, -v, -w, etc.) e
    propagação integral de exit codes.
.EXAMPLE
    .\nexus.ps1 status
.EXAMPLE
    .\nexus.ps1 dashboard --once
.EXAMPLE
    .\nexus.ps1 ops strata -p 8080 -d
.LINK
    file:///scripts/cli/nexus.py
#>

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Push-Location $ScriptDir
$ExitCode = 1

try {
    $NexusCliPy = Join-Path $ScriptDir "scripts\cli\nexus.py"
    $VenvPython = Join-Path $ScriptDir ".venv\Scripts\python.exe"
    $UvCmd      = Get-Command uv -ErrorAction SilentlyContinue

    # Camada 1: Fast-Path com uv run (se disponivel no PATH)
    if ($UvCmd) {
        & $UvCmd.Source run --no-sync nexus @args
        if ($null -ne $LASTEXITCODE) { $ExitCode = $LASTEXITCODE }
    }
    elseif (Test-Path -LiteralPath $VenvPython) {
        & $VenvPython $NexusCliPy @args
        if ($null -ne $LASTEXITCODE) { $ExitCode = $LASTEXITCODE }
    }

    # Camada 3: Python disponivel no PATH do sistema
    elseif (($SysPython = Get-Command python, python3 -ErrorAction SilentlyContinue | Select-Object -First 1) -and (Test-Path -LiteralPath $NexusCliPy)) {
        & $SysPython.Source $NexusCliPy @args
        if ($null -ne $LASTEXITCODE) { $ExitCode = $LASTEXITCODE }
    }
    # Camada 4: Tratamento estetico de contingencia e diagnostico
    else {
        Write-Host "`n================================================================================" -ForegroundColor Red
        Write-Host "       [NEXUS ORCHESTRATOR] FALHA CRITICA DE RUNTIME (PYTHON / UV INDISPONIVEL) " -ForegroundColor Yellow
        Write-Host "================================================================================" -ForegroundColor Red
        Write-Host " [!] Nao foi possivel inicializar o interpretador Python para o Nexus CLI." -ForegroundColor White
        Write-Host "   - Script Alvo    : $NexusCliPy" -ForegroundColor DarkGray
        Write-Host "   - VirtualEnv     : $VenvPython (Status: Ausente ou Inacessivel)" -ForegroundColor DarkGray
        Write-Host "   - Utilitario uv  : Nao detectado no PATH atual" -ForegroundColor DarkGray
        Write-Host "`n [i] Recomendacoes para Restauracao do Ambiente:" -ForegroundColor Cyan
        Write-Host "   1. Execute: uv sync --frozen (ou recrie o .venv)" -ForegroundColor Gray
        Write-Host "   2. Ou adicione o Python 3.12+ ao PATH do sistema." -ForegroundColor Gray
        Write-Host "================================================================================`n" -ForegroundColor Red
        $ExitCode = 127
    }
} finally {
    Pop-Location
}

exit $ExitCode
