<#
.SYNOPSIS
    Nexus Dashboard SOTA v8.0 GOLD - Visualizador de Telemetria, Modelos e Pipeline de Operacoes em Tempo Real.
    Governanca: Raphael Vitoi | Avatar: Chico (Tier 1).
#>

[CmdletBinding()]
param(
    [string]$MetricsUrl = "http://127.0.0.1:17042/metrics",
    [int]$RefreshSeconds = 3
)

$ErrorActionPreference = 'SilentlyContinue'
$Host.UI.RawUI.WindowTitle = "NEXUS DASHBOARD SOTA v8.0 GOLD - LIVE TELEMETRY & OPERATIONS"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Resolve-Path "$ScriptDir\..\.."
$PythonExe = "$ProjectRoot\.venv\Scripts\python.exe"
$TelemetryScript = "$ScriptDir\get_dashboard_telemetry.py"

function Format-StatusBadge {
    param([string]$StatusCode)
    switch ($StatusCode) {
        "completa_falhou"     { return "[OK/AVISO] (Falha Leve)    " }
        "completa_revisao"    { return "[OK/REV]   (Requer Revisao)" }
        "failed"              { return "[FAILED]   (Falha Dura)    " }
        "suspensa"            { return "[SUSPENSA] (Pausada)       " }
        "prevista_engatilhada"{ return "[FILA]     (Engatilhada)   " }
        "completed"           { return "[OK]       (Sucesso)       " }
        "running"             { return "[RUNNING]  (Em Execucao)   " }
        Default               { return "[$StatusCode]                  " }
    }
}

function Get-BadgeColor {
    param([string]$StatusCode)
    switch ($StatusCode) {
        "completa_falhou"     { return "Yellow" }
        "completa_revisao"    { return "Cyan" }
        "failed"              { return "Red" }
        "suspensa"            { return "Magenta" }
        "prevista_engatilhada"{ return "Blue" }
        "completed"           { return "Green" }
        "running"             { return "Yellow" }
        Default               { return "White" }
    }
}

Clear-Host

while ($true) {
    $now = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    
    # Coleta de dados via Telemetry Engine
    $data = $null
    if ((Test-Path $PythonExe) -and (Test-Path $TelemetryScript)) {
        try {
            $rawJson = & $PythonExe $TelemetryScript
            $data = $rawJson | ConvertFrom-Json
        } catch {}
    }

    Clear-Host
    Write-Host "================================================================================" -ForegroundColor Cyan
    Write-Host "     NEXUS DASHBOARD & TASK TRACKING ENGINE - CHICO SOTA v8.0 GOLD (2026)       " -ForegroundColor Yellow
    Write-Host "================================================================================" -ForegroundColor Cyan
    Write-Host "  Governanca: Raphael Vitoi | Avatar: Chico | Timestamp: $now" -ForegroundColor DarkGray
    Write-Host "================================================================================" -ForegroundColor Cyan

    # SECAO 1: ACESSIBILIDADE DE MODELOS (Qwen 7B, Gemma 4B, Gemma 31B Cloud)
    Write-Host "`n  [1] ACESSIBILIDADE DE MODELOS & MOTOR LOCAL/CLOUD" -ForegroundColor Yellow
    if ($data.models) {
        $qwen = $data.models.qwen_7b
        $gemma4b = $data.models.gemma4_4b
        $gemma31b = $data.models.gemma4_31b_cloud

        $qColor = "Yellow"
        if ($qwen.installed) { $qColor = "Green" }

        $g4Color = "Yellow"
        if ($gemma4b.installed) { $g4Color = "Green" }

        $g31Color = "Cyan"
        if ($gemma31b.installed) { $g31Color = "Green" }

        Write-Host "    * Qwen 2.5 7B Local : " -NoNewline -ForegroundColor White
        Write-Host "$($qwen.tag) -> [$($qwen.status)]" -ForegroundColor $qColor

        Write-Host "    * Gemma 4B Local    : " -NoNewline -ForegroundColor White
        Write-Host "$($gemma4b.tag) -> [$($gemma4b.status)]" -ForegroundColor $g4Color

        Write-Host "    * Gemma 4 31B Cloud : " -NoNewline -ForegroundColor White
        Write-Host "$($gemma31b.tag) -> [$($gemma31b.status)]" -ForegroundColor $g31Color
    } else {
        Write-Host "    * Verificando status dos modelos..." -ForegroundColor DarkGray
    }

    # SECAO 2: TAREFAS EM EXECUCAO (RUNNING & ETA)
    Write-Host "`n  [2] TAREFAS EM EXECUCAO (RUNNING & ETA)" -ForegroundColor Yellow
    if ($data.running_now -and $data.running_now.Count -gt 0) {
        foreach ($r in $data.running_now) {
            Write-Host "    [RUNNING] " -NoNewline -ForegroundColor Yellow
            Write-Host "$($r.agent) " -NoNewline -ForegroundColor Cyan
            Write-Host "| $($r.description) " -NoNewline -ForegroundColor White
            Write-Host "| Decorrido: $($r.elapsed_sec)s | ETA: ~$($r.eta_remaining_sec)s ($($r.progress_pct)%)" -ForegroundColor Green
        }
    } else {
        Write-Host "    * Nenhuma tarefa em execucao ativa no momento (Standby / Pronto para despacho)." -ForegroundColor DarkGray
    }

    # SECAO 3: STATUS DAS ULTIMAS 5 TAREFAS
    Write-Host "`n  [3] RASTREIO DAS ULTIMAS 5 TAREFAS (STATUS DA OPERACAO)" -ForegroundColor Yellow
    Write-Host "    +----------------------------------------+--------------+-------------------------------+" -ForegroundColor DarkGray
    Write-Host "    | ID / Descricao                         | Agente       | Status da Operacao            |" -ForegroundColor DarkGray
    Write-Host "    +----------------------------------------+--------------+-------------------------------+" -ForegroundColor DarkGray

    if ($data.last_5_tasks -and $data.last_5_tasks.Count -gt 0) {
        foreach ($t in $data.last_5_tasks) {
            $desc = ($t.description).PadRight(38).Substring(0, 38)
            $ag = ($t.agent).PadRight(12).Substring(0, 12)
            $badge = Format-StatusBadge $t.status_code
            $col = Get-BadgeColor $t.status_code

            Write-Host "    | $desc | $ag | " -NoNewline -ForegroundColor White
            Write-Host "$badge" -NoNewline -ForegroundColor $col
            Write-Host "|" -ForegroundColor DarkGray
        }
    } else {
        Write-Host "    | Sem historico registrado na base       | --           | [NENHUM]                      |" -ForegroundColor DarkGray
    }
    Write-Host "    +----------------------------------------+--------------+-------------------------------+" -ForegroundColor DarkGray

    # SECAO 4: PREVISAO DE TASK (FORECASTING & FILA)
    Write-Host "`n  [4] PREVISAO DE TASK & PIPELINE (TASK FORECASTING)" -ForegroundColor Yellow
    if ($data.forecast_tasks -and $data.forecast_tasks.Count -gt 0) {
        foreach ($f in $data.forecast_tasks) {
            Write-Host "    * [PREVISTA / ENGATILHADA] " -NoNewline -ForegroundColor Blue
            Write-Host "$($f.agent): " -NoNewline -ForegroundColor Cyan
            Write-Host "$($f.description) " -NoNewline -ForegroundColor White
            Write-Host "(Prioridade: $($f.priority) | Inicio: $($f.estimated_start))" -ForegroundColor DarkGray
        }
    }

    # SECAO 5: RESUMO GLOBAL
    Write-Host "`n  [5] TELEMETRIA DE REDE & PORTS" -ForegroundColor Yellow
    $p = $data.ports
    $ollamaPort = "OFFLINE (11434)"
    if ($p.ollama_11434) { $ollamaPort = "ONLINE (11434)" }

    $gemmaPort = "STANDBY (17043)"
    if ($p.gemma_server_17043) { $gemmaPort = "ONLINE (17043)" }

    $backendPort = "OFFLINE (8000)"
    if ($p.backend_8000) { $backendPort = "ONLINE (8000)" }

    Write-Host "    * Ollama: $ollamaPort  |  Gemma Server: $gemmaPort  |  Backend: $backendPort" -ForegroundColor DarkGray
    Write-Host "--------------------------------------------------------------------------------" -ForegroundColor DarkGray
    Write-Host "  Pressione Ctrl + C para encerrar o dashboard." -ForegroundColor DarkGray

    Start-Sleep -Seconds $RefreshSeconds
}
