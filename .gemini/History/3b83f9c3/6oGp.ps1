<#
.SYNOPSIS
    Integra o Ecossistema Nexus ao terminal Windows permanentemente.
#>

Write-Host "=== ELEVANDO SISTEMA AO ESTADO DA ARTE (CLI GLOBAL) ===" -ForegroundColor Cyan

$ProfilePath = $PROFILE
$NexusDir = $PSScriptRoot

# Cria o arquivo de profile global do usuário se não existir
if (-not (Test-Path $ProfilePath)) {
    New-Item -ItemType Directory -Path (Split-Path $ProfilePath) -Force | Out-Null
    New-Item -ItemType File -Path $ProfilePath -Force | Out-Null
}

$ProfileContent = Get-Content $ProfilePath -Raw -ErrorAction SilentlyContinue

# AUTO-UPDATE: Se o bloco já existe, remove-o de forma limpa para injetar a versão atualizada
if ($ProfileContent -match "# NEXUS SYSTEM ENVIRONMENT") {
    $Pattern = "(?ms)`n# ==========================================.*?# NEXUS SYSTEM ENVIRONMENT.*?# =========================================="
    $ProfileContent = $ProfileContent -replace $Pattern, ""
    Set-Content -Path $ProfilePath -Value $ProfileContent -Encoding UTF8
}

$Injection = @"

# ==========================================
# NEXUS SYSTEM ENVIRONMENT (Auto-Generated)
# ==========================================
`$NexusDir = "$NexusDir"

# Atalhos Operacionais (Fim do uso de .\ e .ps1)
Set-Alias -Name dashboard -Value "`$NexusDir\dashboard_queue.ps1" -Scope Global -ErrorAction SilentlyContinue
Set-Alias -Name start-worker -Value "`$NexusDir\start_worker.ps1" -Scope Global -ErrorAction SilentlyContinue
Set-Alias -Name stop-worker -Value "`$NexusDir\stop_worker.ps1" -Scope Global -ErrorAction SilentlyContinue
Set-Alias -Name monitor -Value "`$NexusDir\monitor_worker.ps1" -Scope Global -ErrorAction SilentlyContinue
Set-Alias -Name ask -Value "`$NexusDir\ask.ps1" -Scope Global -ErrorAction SilentlyContinue
Set-Alias -Name nexus-status -Value "`$NexusDir\nexus_status.ps1" -Scope Global -ErrorAction SilentlyContinue
Set-Alias -Name nexus_status -Value "`$NexusDir\nexus_status.ps1" -Scope Global -ErrorAction SilentlyContinue
Set-Alias -Name nexus-read -Value "`$NexusDir\nexus_read.ps1" -Scope Global -ErrorAction SilentlyContinue
Set-Alias -Name nexus_read -Value "`$NexusDir\nexus_read.ps1" -Scope Global -ErrorAction SilentlyContinue
Set-Alias -Name nexus-backup -Value "`$NexusDir\nexus_backup.ps1" -Scope Global -ErrorAction SilentlyContinue
Set-Alias -Name nexus_backup -Value "`$NexusDir\nexus_backup.ps1" -Scope Global -ErrorAction SilentlyContinue
Set-Alias -Name autonomy-full -Value "`$NexusDir\autonomy_full.ps1" -Scope Global -ErrorAction SilentlyContinue
Set-Alias -Name autonomy-partial -Value "`$NexusDir\autonomy_partial.ps1" -Scope Global -ErrorAction SilentlyContinue
Set-Alias -Name autonomy-off -Value "`$NexusDir\autonomy_off.ps1" -Scope Global -ErrorAction SilentlyContinue
Set-Alias -Name nexus-hub -Value "`$NexusDir\nexus_hub.ps1" -Scope Global -ErrorAction SilentlyContinue
Set-Alias -Name nexus-help -Value "`$NexusDir\nexus_hub.ps1" -Scope Global -ErrorAction SilentlyContinue

# A Membrana Inteligente (Uso Livre sem aspas)
function nexus {
    param([switch]`$Force, [Parameter(ValueFromRemainingArguments=`$true)][string[]]`$Words)
    `$Intent = `$Words -join " "
    `$DoScript = Join-Path `$NexusDir "do.ps1"
    if ([string]::IsNullOrWhiteSpace(`$Intent)) { & `$DoScript }
    elseif (`$Force) { & `$DoScript -InputString `$Intent -Force }
    else { & `$DoScript -InputString `$Intent }
}

# Ponte Híbrida (Conecta a nuvem Web ao God Mode Local)
function nexus-bridge {
    param([Parameter(Mandatory=`$true)][string]`$FilePath)
    if (-not (Test-Path `$FilePath)) { Write-Host "[FAIL] Arquivo não encontrado: `$FilePath" -ForegroundColor Red; return }
    Write-Host "[BRIDGE] Conectando Macro-Cognição à Micro-Execução..." -ForegroundColor Magenta
    `$BridgeCommand = "@implementor Acionando Protocolo Bridge. Leia e analise rigorosamente a especificação contida no arquivo '`$FilePath'. Use sua Autorização Suprema (God Mode) para executar os comandos de terminal necessários (ex: npm install) e forjar os arquivos físicos no sistema, materializando fielmente a arquitetura descrita."
    nexus `$BridgeCommand -Force
}
# ==========================================
"@

Add-Content -Path $ProfilePath -Value $Injection -Encoding UTF8

Write-Host "[SUCESSO] Vocabulário nativo injetado na alma do PowerShell!" -ForegroundColor Green
Write-Host "Feche esta janela e abra um terminal novo para a mágica acontecer." -ForegroundColor Magenta