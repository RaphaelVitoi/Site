<#
.SYNOPSIS
    Backup cirurgico (SOTA) dos arquivos vitais e banco de dados.
.DESCRIPTION
    Este script automatiza o backup dos principais arquivos de configuracao,
    garantindo a integridade do sistema com caminhos relativos robustos e 
    retencao anti-entropia (limpeza de backups antigos).
#>

$ProjectRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent

$SourceFiles = @(
    Join-Path $ProjectRoot ".claude\GLOBAL_INSTRUCTIONS.md",
    Join-Path $ProjectRoot ".claude\project-context.md",
    Join-Path $ProjectRoot ".claude\LIDERANCA_GOVERNANCE_RAPHAEL_MAVERICK_CHICO.md",
    Join-Path $ProjectRoot ".claude\COSMOVISAO.md",
    Join-Path $ProjectRoot "queue\tasks.db"
)

$BackupRoot = Join-Path $ProjectRoot ".claude\backups"
$TempDir = Join-Path $BackupRoot "temp_$(Get-Date -Format 'yyyyMMdd-HHmmss')"
$ArchiveName = "backup_sota_$(Get-Date -Format 'yyyyMMdd-HHmmss').zip"
$ArchivePath = Join-Path $BackupRoot $ArchiveName

Write-Host "=== [SKILLMASTER] INICIANDO BACKUP COMPACTADO SOTA ===" -ForegroundColor Cyan
Write-Host "Destino (ZIP): $($ArchivePath)" -ForegroundColor DarkGray

try {
    New-Item -ItemType Directory -Force -Path $TempDir | Out-Null
}
catch {
    Write-Error "Falha critica ao criar diretorio temporario '$TempDir': $($_.Exception.Message)"
    exit 1 # Aborta se nao conseguir criar a pasta de destino
}

foreach ($File in $SourceFiles) {
    if (Test-Path $File) {
        try {
            Copy-Item -Path $File -Destination $TempDir -Force -ErrorAction Stop
        }
        catch {
            Write-Warning "[FAIL] Falha ao copiar '$($File | Split-Path -Leaf)': $($_.Exception.Message)"
        }
    }
    else {
        Write-Host "[SKIP] Arquivo nao encontrado: $($File | Split-Path -Leaf)" -ForegroundColor Yellow
    }
}

# Otimizacao Extrema de Espaco (Zip e Exclusao da Temp)
Compress-Archive -Path "$TempDir\*" -DestinationPath $ArchivePath -Force
Remove-Item -Path $TempDir -Recurse -Force
Write-Host "[OK] Arquivos compactados com exito em reducao SOTA de armazenamento." -ForegroundColor Green

# Limpeza de Entropia (Retencao rigorosa de 7 dias - Economia Generalizada)
Write-Host "Limpando backups obsoletos (mais de 7 dias)..." -ForegroundColor Cyan
$CutoffDate = (Get-Date).AddDays(-7)
Get-ChildItem -Path $BackupRoot -Filter "*.zip" | Where-Object { $_.CreationTime -lt $CutoffDate } | Remove-Item -Force

Write-Host "=== BACKUP CONCLUIDO COM SUCESSO ===" -ForegroundColor Green
