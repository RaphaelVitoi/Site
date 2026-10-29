<#
.SYNOPSIS
    Nexus Dashboard SOTA v8.0 GOLD - Monitor de Telemetria, Modelos e Pipeline de Operacoes.
.DESCRIPTION
    Governanca: Raphael Vitoi | Avatar: Chico (Tier 1).
    Consome scripts/ops/get_dashboard_telemetry.py e desenha o painel SEM piscar:
    reposiciona o cursor e sobrescreve o quadro anterior (nada de Clear-Host por ciclo).
    A largura acompanha o terminal. Falhas de coleta sao MOSTRADAS, com o ultimo quadro
    bom mantido e marcado como defasado -- antes eram engolidas (ErrorActionPreference
    SilentlyContinue) e o painel so dizia "Verificando status dos modelos...".
    Teclas: Q / Esc encerram | R forca atualizacao.
.PARAMETER RefreshSeconds
    Intervalo entre coletas, em segundos (1-3600). Padrao 3.
.PARAMETER Once
    Renderiza um unico quadro e sai (exit 0 se houve telemetria, 1 se nao).
.PARAMETER MetricsUrl
    Mantido por compatibilidade com chamadores antigos; nao e consumido.
.EXAMPLE
    .\scripts\ops\Start-NexusDashboard.ps1 -Once
.EXAMPLE
    .\dashboard.ps1 --telemetry -RefreshSeconds 5
#>
[CmdletBinding()]
param(
    [string]$MetricsUrl = "http://127.0.0.1:17042/metrics",
    [ValidateRange(1, 3600)][int]$RefreshSeconds = 3,
    [switch]$Once
)

$ErrorActionPreference = 'Continue'
try { $Host.UI.RawUI.WindowTitle = "NEXUS DASHBOARD SOTA v8.0 GOLD - LIVE TELEMETRY & OPERATIONS" } catch { }

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = (Resolve-Path -LiteralPath (Join-Path $ScriptDir '..\..')).Path
$TelemetryScript = Join-Path $ScriptDir 'get_dashboard_telemetry.py'
$VenvPython = Join-Path $ProjectRoot '.venv\Scripts\python.exe'

$PythonExe = $null
if (Test-Path -LiteralPath $VenvPython) {
    $PythonExe = $VenvPython
} else {
    $found = Get-Command python -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($found) { $PythonExe = $found.Source }
}

# codigo de status -> rotulo, cor, descricao
$StatusMap = @{
    completa_falhou      = @('OK/AVISO', 'Yellow', 'Falha leve')
    completa_revisao     = @('OK/REV', 'Cyan', 'Requer revisao')
    failed               = @('FAILED', 'Red', 'Falha dura')
    suspensa             = @('SUSPENSA', 'Magenta', 'Pausada')
    prevista_engatilhada = @('FILA', 'DarkCyan', 'Engatilhada')
    completed            = @('OK', 'Green', 'Sucesso')
    running              = @('RUNNING', 'Yellow', 'Em execucao')
}

$script:Lines = New-Object System.Collections.Generic.List[object]
$script:PrevCount = 0

function S {
    param([string]$Text, [string]$Color = 'Gray')
    [pscustomobject]@{ T = $Text; C = $Color }
}

function Add-Line {
    param([object[]]$Seg)
    [void]$script:Lines.Add($Seg)
}

function Fit {
    param($Text, [int]$N)
    $t = "$Text" -replace '[\r\n]+', ' '
    if ($N -lt 1) { return '' }
    if ($t.Length -gt $N) { return $t.Substring(0, $N - 1) + '~' }
    return $t.PadRight($N)
}

function Get-Width {
    $w = 99
    try { $w = $Host.UI.RawUI.WindowSize.Width - 1 } catch { }
    return [Math]::Max(60, [Math]::Min($w, 130))
}

function Get-Telemetry {
    if (-not $PythonExe) {
        return @{ Data = $null; Error = 'Python nao encontrado (.venv ausente e nenhum python no PATH).' }
    }
    if (-not (Test-Path -LiteralPath $TelemetryScript)) {
        return @{ Data = $null; Error = "Script de telemetria ausente: $TelemetryScript" }
    }
    try {
        $raw = & $PythonExe $TelemetryScript 2>&1
        $code = $LASTEXITCODE
        $text = (@($raw) | ForEach-Object { "$_" }) -join "`n"
        if ($code -ne 0) {
            $first = ($text -split "`n" | Where-Object { $_.Trim() } | Select-Object -Last 1)
            return @{ Data = $null; Error = "telemetria saiu com codigo ${code}: $first" }
        }
        return @{ Data = ($text | ConvertFrom-Json); Error = $null }
    } catch {
        return @{ Data = $null; Error = $_.Exception.Message }
    }
}

function Build-Frame {
    param($Data, [string]$ErrorText, [bool]$Stale, [int]$Width, [int]$ElapsedMs)

    $script:Lines.Clear()
    $rule = '=' * $Width
    $thin = '-' * $Width
    $now = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'

    Add-Line (S $rule 'Cyan')
    Add-Line (S '  NEXUS DASHBOARD & TASK TRACKING ENGINE - CHICO SOTA v8.0 GOLD' 'Yellow')
    Add-Line (S "  Governanca: Raphael Vitoi | Avatar: Chico | $now" 'DarkGray')
    Add-Line (S $rule 'Cyan')

    if ($ErrorText) {
        $tag = 'ERRO DE COLETA'
        if ($Stale) { $tag = 'ERRO DE COLETA (exibindo ultimo quadro valido, DEFASADO)' }
        Add-Line (S "  [!] $tag" 'Red')
        Add-Line (S ("      " + $ErrorText) 'DarkYellow')
    }
    if ($null -eq $Data) {
        Add-Line (S '' 'Gray')
        Add-Line (S '  Sem telemetria para exibir. Verifique o Python do projeto e get_dashboard_telemetry.py.' 'DarkGray')
        return
    }

    # [1] MODELOS
    Add-Line (S '' 'Gray')
    Add-Line (S '  [1] ACESSIBILIDADE DE MODELOS & MOTOR LOCAL/CLOUD' 'Yellow')
    if ($Data.models) {
        foreach ($key in 'qwen_7b', 'gemma4_4b', 'gemma4_31b_cloud', 'strata_moe_125b') {
            $m = $Data.models.$key
            if (-not $m) { continue }
            $color = 'Yellow'
            if ($m.installed) { $color = 'Cyan' }
            if ("$($m.status)" -match 'READY|ACCESSIBLE|ONLINE') { $color = 'Green' }
            Add-Line (S ('    * ' + (Fit $m.name 24)) 'White'), (S (Fit $m.tag 24) 'DarkGray'), (S "[$($m.status)]" $color)
        }
    } else {
        Add-Line (S '    * Modelos: telemetria sem dados de modelos.' 'DarkGray')
    }

    # [2] RUNNING
    Add-Line (S '' 'Gray')
    Add-Line (S '  [2] TAREFAS EM EXECUCAO (RUNNING, ETA ESTIMADA)' 'Yellow')
    if ($Data.running_now -and @($Data.running_now).Count -gt 0) {
        foreach ($r in @($Data.running_now)) {
            $descW = [Math]::Max(10, $Width - 62)
            Add-Line (S '    [RUNNING] ' 'Yellow'), (S (Fit $r.agent 12) 'Cyan'), (S ' ' 'Gray'), (S (Fit $r.description $descW) 'White'),
                (S (" {0,6}s | ETA ~{1}s ({2}%)" -f $r.elapsed_sec, $r.eta_remaining_sec, $r.progress_pct) 'Green')
        }
    } else {
        Add-Line (S '    * Nenhuma tarefa em execucao (standby, pronto para despacho).' 'DarkGray')
    }

    # [3] ULTIMAS 5
    $agW = 12
    $stW = 26
    $descCol = [Math]::Max(16, $Width - 4 - $agW - $stW - 10)
    $border = '    +-' + ('-' * $descCol) + '-+-' + ('-' * $agW) + '-+-' + ('-' * $stW) + '-+'
    Add-Line (S '' 'Gray')
    Add-Line (S '  [3] RASTREIO DAS ULTIMAS 5 TAREFAS' 'Yellow')
    Add-Line (S $border 'DarkGray')
    Add-Line (S '    | ' 'DarkGray'), (S (Fit 'ID / Descricao' $descCol) 'DarkGray'), (S ' | ' 'DarkGray'), (S (Fit 'Agente' $agW) 'DarkGray'),
        (S ' | ' 'DarkGray'), (S (Fit 'Status da Operacao' $stW) 'DarkGray'), (S ' |' 'DarkGray')
    Add-Line (S $border 'DarkGray')
    if ($Data.last_5_tasks -and @($Data.last_5_tasks).Count -gt 0) {
        foreach ($t in @($Data.last_5_tasks)) {
            $info = $StatusMap["$($t.status_code)"]
            if (-not $info) { $info = @("$($t.status_code)".ToUpper(), 'White', "$($t.status_label)") }
            Add-Line (S '    | ' 'DarkGray'), (S (Fit $t.description $descCol) 'White'), (S ' | ' 'DarkGray'), (S (Fit $t.agent $agW) 'Cyan'),
                (S ' | ' 'DarkGray'), (S (Fit ("[{0}] {1}" -f $info[0], $info[2]) $stW) $info[1]), (S ' |' 'DarkGray')
        }
    } else {
        Add-Line (S '    | ' 'DarkGray'), (S (Fit 'Sem historico registrado na base' $descCol) 'DarkGray'), (S ' | ' 'DarkGray'),
            (S (Fit '--' $agW) 'DarkGray'), (S ' | ' 'DarkGray'), (S (Fit '[NENHUM]' $stW) 'DarkGray'), (S ' |' 'DarkGray')
    }
    Add-Line (S $border 'DarkGray')

    # [4] FILA / PREVISAO
    Add-Line (S '' 'Gray')
    Add-Line (S '  [4] PREVISAO DE TASK & PIPELINE' 'Yellow')
    if ($Data.forecast_tasks -and @($Data.forecast_tasks).Count -gt 0) {
        foreach ($f in @($Data.forecast_tasks)) {
            $descW = [Math]::Max(10, $Width - 82)
            Add-Line (S '    * [PREVISTA] ' 'DarkCyan'), (S (Fit $f.agent 12) 'Cyan'), (S ' ' 'Gray'), (S (Fit $f.description $descW) 'White'),
                (S " (prio: $($f.priority) | $($f.estimated_start))" 'DarkGray')
        }
    } else {
        Add-Line (S '    * Fila vazia.' 'DarkGray')
    }

    # [5] CONTADORES + REDE
    Add-Line (S '' 'Gray')
    Add-Line (S '  [5] MALHA & SERVICOS' 'Yellow')
    $c = $Data.counts
    if ($c) {
        Add-Line (S '    Tarefas: ' 'White'), (S "total $($c.total)" 'Gray'), (S " | pendentes $($c.pending)" 'Yellow'),
            (S " | rodando $($c.running)" 'Cyan'), (S " | concluidas $($c.completed)" 'Green'), (S " | falhas $($c.failed)" 'Red')
        if ($c.PSObject.Properties.Name -contains 'db_error') {
            Add-Line (S "    [!] Erro de banco: $($c.db_error)" 'Red')
        }
    }
    $p = $Data.ports
    $backendOn = $false
    $backendPort = 17042
    if ($p) {
        if ($p.PSObject.Properties.Name -contains 'backend_17042') { $backendOn = [bool]$p.backend_17042 }
        else { $backendOn = [bool]$p.backend_8000; $backendPort = 8000 }
    }
    $svc = @(
        @('Ollama', 11434, [bool]($p -and $p.ollama_11434)),
        @('Gemma Server', 17043, [bool]($p -and $p.gemma_server_17043)),
        @('Backend', $backendPort, $backendOn),
        @('Strata', 8080, [bool]($p -and $p.vulkan_8080))
    )
    $segs = @(S '    ' 'Gray')
    foreach ($s in $svc) {
        if ($s[2]) { $segs += (S ("[ON] {0}:{1}   " -f $s[0], $s[1]) 'Green') }
        else { $segs += (S ("[--] {0}:{1}   " -f $s[0], $s[1]) 'DarkGray') }
    }
    Add-Line $segs

    Add-Line (S $thin 'DarkGray')
    Add-Line (S ("  Q/Esc sai | R atualiza | ciclo {0}s | coleta {1} ms" -f $RefreshSeconds, $ElapsedMs) 'DarkGray')
}

function Show-Frame {
    param([int]$Width)
    # Sem console real (saida redirecionada / handle invalido) nao ha cursor a reposicionar:
    # imprime o quadro em sequencia, sem tentar limpar a tela.
    try { [Console]::SetCursorPosition(0, 0) } catch {
        try { Clear-Host -ErrorAction Stop } catch { }
    }
    foreach ($line in $script:Lines) {
        $used = 0
        foreach ($seg in $line) {
            $t = [string]$seg.T
            if ($used + $t.Length -gt $Width) { $t = $t.Substring(0, [Math]::Max(0, $Width - $used)) }
            if ($t.Length -gt 0) { Write-Host $t -NoNewline -ForegroundColor $seg.C }
            $used += $t.Length
        }
        if ($used -lt $Width) { Write-Host (' ' * ($Width - $used)) -NoNewline }
        Write-Host ''
    }
    # apaga resquicios de um quadro anterior mais alto
    for ($i = $script:Lines.Count; $i -lt $script:PrevCount; $i++) { Write-Host (' ' * $Width) }
    $script:PrevCount = $script:Lines.Count
}

function Wait-OrKey {
    param([int]$Seconds)
    $deadline = (Get-Date).AddSeconds($Seconds)
    while ((Get-Date) -lt $deadline) {
        try {
            if ([Console]::KeyAvailable) {
                $k = [Console]::ReadKey($true)
                if ($k.Key -eq 'Q' -or $k.Key -eq 'Escape') { return 'quit' }
                if ($k.Key -eq 'R') { return 'refresh' }
            }
        } catch {
            # entrada redirecionada: sem teclado, so espera o ciclo
            Start-Sleep -Seconds $Seconds
            return 'tick'
        }
        Start-Sleep -Milliseconds 100
    }
    return 'tick'
}

$last = $null
$exit = 0
try {
    try { [Console]::CursorVisible = $false } catch { }
    if (-not $Once) { try { Clear-Host -ErrorAction Stop } catch { } }
    while ($true) {
        $sw = [System.Diagnostics.Stopwatch]::StartNew()
        $res = Get-Telemetry
        $sw.Stop()

        $stale = $false
        if ($res.Data) { $last = $res.Data }
        elseif ($last) { $stale = $true }

        Build-Frame -Data $last -ErrorText $res.Error -Stale $stale -Width (Get-Width) -ElapsedMs ([int]$sw.ElapsedMilliseconds)
        Show-Frame -Width (Get-Width)

        if ($Once) {
            if ($null -eq $last) { $exit = 1 }
            break
        }
        if ((Wait-OrKey -Seconds $RefreshSeconds) -eq 'quit') { break }
    }
} finally {
    try { [Console]::CursorVisible = $true } catch { }
    Write-Host ''
}
exit $exit
