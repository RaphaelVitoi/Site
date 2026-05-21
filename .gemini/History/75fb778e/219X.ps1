<#
.SYNOPSIS
    Protocolo de Restauracao de Emergencia SOTA.
.DESCRIPTION
    Permite que @chico ou um administrador restaure o sistema para o ultimo
    snapshot de seguranca valido. O script automaticamente identifica o backup
    .zip mais recente, cria um snapshot de pre-restauracao do estado atual,
    e entao oblitera os diretorios corrompidos e os restaura a partir do backup.
.PARAMETER Force
    Pula a confirmacao manual, para uso em automacoes do @chico.
#>
[CmdletBinding()]
param (
    [switch]$Force
)

$ProjectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$BackupRoot = Join-Path $ProjectRoot ".backups"
$Targets = @('.claude', 'docs', 'queue', 'data')

Write-Host "=== [CHICO] PROTOCOLO DE RESTAURACAO DE EMERGENCIA SOTA ===" -ForegroundColor Red

# 1. Identificar o ultimo backup valido
$LatestBackup = Get-ChildItem -Path $BackupRoot -Filter "*.zip" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
if (-not $LatestBackup) {
    Write-Error "[FALHA CRITICA] Nenhum arquivo de backup (.zip) encontrado em '$BackupRoot'. Restauracao impossivel."
    exit 1
}

Write-Host "[INFO] Ultimo snapshot valido identificado: $($LatestBackup.Name)" -ForegroundColor Cyan

# 2. Confirmacao de Seguranca
if (-not $Force) {
    $confirmation = Read-Host "[ALERTA] Voce esta prestes a REVERTER o estado do sistema para o snapshot '$($LatestBackup.Name)'. O estado atual dos diretorios-alvo sera PERDIDO. Deseja prosseguir? (y/n)"
    if ($confirmation -ne 'y') {
        Write-Host "[CANCELADO] A restauracao foi cancelada pelo usuario." -ForegroundColor Yellow
        exit 0
    }
}

# 3. Snapshot de Pre-Restauracao (Salvaguarda da Salvaguarda)
$PreRestoreDir = Join-Path $BackupRoot "PreRestore_$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Write-Host "[INFO] Criando snapshot de pre-restauracao em '$PreRestoreDir'..." -ForegroundColor Yellow
try {
    New-Item -ItemType Directory -Path $PreRestoreDir -Force | Out-Null
    foreach ($target in $Targets) {
        $sourcePath = Join-Path $ProjectRoot $target
        if (Test-Path $sourcePath) {
            Move-Item -Path $sourcePath -Destination $PreRestoreDir -Force
        }
    }
    Write-Host "[OK] Estado atual preservado com seguranca." -ForegroundColor Green
}
catch {
    Write-Error "[FALHA CRITICA] Nao foi possivel criar o snapshot de pre-restauracao. Abortando para evitar perda de dados. Erro: $($_.Exception.Message)"
    # Tenta reverter a movimentacao parcial
    Get-ChildItem -Path $PreRestoreDir | ForEach-Object { Move-Item -Path $_.FullName -Destination $ProjectRoot -Force }
    Remove-Item -Path $PreRestoreDir -Recurse -Force
    exit 1
}

# 4. Restauracao do Sistema
Write-Host "[RESTAURACAO] Descompactando snapshot '$($LatestBackup.Name)' para a raiz do projeto..." -ForegroundColor Cyan
try {
    Expand-Archive -LiteralPath $LatestBackup.FullName -DestinationPath $ProjectRoot -Force -ErrorAction Stop
    Write-Host "[VITORIA] Sistema restaurado com sucesso para o estado de $($LatestBackup.LastWriteTime)." -ForegroundColor Green
}
catch {
    Write-Error "[FALHA CATASTROFICA] A descompactacao do backup falhou: $($_.Exception.Message)"
    Write-Error "O sistema pode estar em um estado inconsistente. RESTAURE MANUALMENTE a partir de '$PreRestoreDir'."
    exit 1
}