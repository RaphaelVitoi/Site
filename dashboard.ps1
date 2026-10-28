<#
.SYNOPSIS
    NEXUS DASHBOARD SOTA v8.0 GOLD - Gateway Executivo Unificado (CEO Level)
.DESCRIPTION
    Launcher oficial e de alta performance para a interface executiva do Nexus.
    Integra organicamente:
      1. Dashboard Interativo Typer/Rich (nexus dashboard)
      2. Snapshots instantâneos (`--once` / `-1`)
      3. Sumário de notificações dinâmicas (`--notify` / `-n`)
      4. Modo Telemetria Estendido / Monitor de Modelos e Portas (`--telemetry` / `-t`)
      5. Menu Executivo Unificado de Atalhos e Operações (`--menu` / `-m`)
    Delega a execução nativa para .\nexus.ps1, garantindo cascata de runtime,
    resiliência contra colisões de parâmetros e retorno íntegro de exit codes.
.EXAMPLE
    .\dashboard.ps1
.EXAMPLE
    .\dashboard.ps1 --once
.EXAMPLE
    .\dashboard.ps1 --notify
.EXAMPLE
    .\dashboard.ps1 --telemetry
.EXAMPLE
    .\dashboard.ps1 --menu
.LINK
    file:///nexus.ps1
    file:///scripts/cli/nexus.py
    file:///scripts/ops/Start-NexusDashboard.ps1
#>

$ScriptDir   = Split-Path -Parent $MyInvocation.MyCommand.Path
$NexusScript = Join-Path $ScriptDir 'nexus.ps1'

# Interceptador fluido de modos operacionais especificos do Dashboard
if ($args.Count -gt 0) {
    $firstArg = "$($args[0])".ToLowerInvariant()

    # Rota: Telemetria Estendida de Servicos e Modelos (Start-NexusDashboard.ps1)
    if ($firstArg -in @('-t', '--telemetry', '--monitor', '-monitor')) {
        $remainingArgs = if ($args.Count -gt 1) { $args[1..($args.Count - 1)] } else { @() }
        $telemetryScript = Join-Path $ScriptDir 'scripts\ops\Start-NexusDashboard.ps1'
        if (Test-Path -LiteralPath $telemetryScript) {
            $pwshExe = (Get-Command pwsh -ErrorAction SilentlyContinue).Source
            if (-not $pwshExe) { $pwshExe = (Get-Command powershell).Source }
            & $pwshExe -NoProfile -File $telemetryScript @remainingArgs
            exit $LASTEXITCODE
        }
    }

    # Rota: Menu Executivo Rapido / Ajuda Unificada do Dashboard
    if ($firstArg -in @('-m', '--menu', '-menu')) {
        try { [Console]::ResetColor() } catch {}
        Write-Host ""
        Write-Host "================================================================================" -ForegroundColor Cyan
        Write-Host "         NEXUS SOTA DASHBOARD - PAINEL EXECUTIVO UNIFICADO (v8.0 GOLD)         " -ForegroundColor Yellow
        Write-Host "================================================================================" -ForegroundColor Cyan
        Write-Host "  Governanca: Raphael Vitoi | Membrana Cognitiva: Chico Tier 1" -ForegroundColor DarkGray
        Write-Host "--------------------------------------------------------------------------------" -ForegroundColor DarkCyan
        Write-Host "`n  MODOS DE EXECUCAO DISPONIVEIS:" -ForegroundColor White
        Write-Host "    [1] .\dashboard.ps1               -> Dashboard Interativo Completo (God Mode W3)" -ForegroundColor Green
        Write-Host "    [2] .\dashboard.ps1 --once (-1)    -> Snapshot Instantaneo Estatico (Zero Loop)" -ForegroundColor Cyan
        Write-Host "    [3] .\dashboard.ps1 --notify (-n)  -> Sumario de Notificacoes e Recomendacoes" -ForegroundColor Magenta
        Write-Host "    [4] .\dashboard.ps1 --telemetry (-t)-> Monitor Continuo de Modelos e Servicos" -ForegroundColor Yellow
        Write-Host "    [5] .\dashboard.ps1 --help         -> Ajuda e Parametros Detalhados do CLI" -ForegroundColor Gray
        Write-Host "`n  ATALHOS RAPIDOS DO ECOSSISTEMA:" -ForegroundColor White
        Write-Host "    * .\nexus.ps1 status              -> Telemetria do DAL e fila de tarefas" -ForegroundColor DarkCyan
        Write-Host "    * .\nexus.ps1 ops quality-gate    -> Bateria Tri-State de Qualidade" -ForegroundColor DarkCyan
        Write-Host "    * .\nexus.ps1 ops strata          -> Inicializacao do Strata MoE 125B" -ForegroundColor DarkCyan
        Write-Host "    * .\nexus.ps1 agent handoff       -> Exportacao de contexto mental" -ForegroundColor DarkCyan
        Write-Host "================================================================================`n" -ForegroundColor Cyan
        exit 0
    }
}

# Rota Padrao Canônica: Despacho ao CLI central do Nexus (processo isolado para preservar exit code)
$pwshExe = (Get-Command pwsh -ErrorAction SilentlyContinue).Source
if (-not $pwshExe) { $pwshExe = (Get-Command powershell).Source }
& $pwshExe -NoProfile -File $NexusScript dashboard @args
exit $LASTEXITCODE
