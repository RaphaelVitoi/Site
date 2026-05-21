<#
.SYNOPSIS
    CORTEX PULSE: Gera o Relatorio Diário SOTA da Produtividade dos Agentes.
    Custo: Zero Tokens. Funcionalidade: Fractal, Organizada e Didática.
#>

$ProjectRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$PyScript = Join-Path $ProjectRoot "task_executor.py"
$PythonCmd = if (Test-Path "$ProjectRoot\.venv\Scripts\python.exe") { "$ProjectRoot\.venv\Scripts\python.exe" } else { "python" }

#Validate python path
if (!(Test-Path $PyScript)) { Write-Error "task_executor.py nao encontrado"; exit 1 }

# 1. Recupera as tarefas concluidas (A leitura é local, rapida e sem friccao)
#    A filtragem agora é delegada ao banco de dados para maior performance.
$JsonOutput = & $PythonCmd $PyScript db-get completed --since 24h
$Tasks = @()
if ($LASTEXITCODE -eq 0 -and $JsonOutput) {
    $Tasks = $JsonOutput | ConvertFrom-Json
}

# 2. Seletividade Inteligente: Omitir relatorios inuteis
if ($Tasks.Count -eq 0) { exit 0 }

# 3. Formata o Relatorio Fractal e Didatico em Markdown
$ReportDir = Join-Path $ProjectRoot ".claude\reports"

if (-not (Test-Path $ReportDir)) { New-Item -ItemType Directory -Path $ReportDir -Force | Out-Null }
$ReportPath = Join-Path $ReportDir "Cortex_Pulse_$(Get-Date -Format 'yyyyMMdd').md"

$Grouped = $Tasks | Group-Object agent
$Md = @()
$Md += "# [CORTEX PULSE] Relatorio Diario de Operacoes"
$Md += "> **Data:** $(Get-Date -Format 'dd/MM/yyyy') | **Tarefas Cumpridas:** $($Tasks.Count)"
$Md += "> *A evolucao do Todo comeca na execucao silenciosa da Parte.*`n"

foreach ($Group in $Grouped) {
    $Md += "## [*] $($Group.Name) ($($Group.Count) Tarefas)"
    foreach ($Task in $Group.Group) {
        $Desc = $Task.description -replace "`n", " "
        if ($Desc.Length -gt 120) { $Desc = $Desc.Substring(0, 117) + "..." }
        $Md += "- **[$($Task.id)]**: $Desc"
    }
    $Md += ""
}

$Md -join "`n" | Out-File -FilePath $ReportPath -Encoding UTF8

# 4. Dispara o Feedback Visual (Cyber-Aviso no Windows)
$ps_code = "[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null; [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom, ContentType = WindowsRuntime] | Out-Null; `$xml = New-Object Windows.Data.Xml.Dom.XmlDocument; `$xml.LoadXml(`"<toast><visual><binding template='ToastText02'><text id='1'>Cortex Pulse Gerado</text><text id='2'>$($Tasks.Count) atividades executadas pelo sistema hoje. Relatorio disponivel.</text></binding></visual></toast>`"); `$toast = [Windows.UI.Notifications.ToastNotification]::new(`$xml); [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier(`"Nexus Hub`").Show(`$toast)"
Start-Process -FilePath "powershell" -ArgumentList "-NoProfile -WindowStyle Hidden -Command `"$ps_code`""