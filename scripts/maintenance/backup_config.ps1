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
$BackupDir = Join-Path $BackupRoot (Get-Date -Format "yyyyMMdd-HHmmss")

Write-Host "=== [SKILLMASTER] INICIANDO BACKUP SOTA ===" -ForegroundColor Cyan
Write-Host "Destino: $($BackupDir)" -ForegroundColor DarkGray

try {
    New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null
}
catch {
    Write-Error "Falha critica ao criar diretorio de backup '$BackupDir': $($_.Exception.Message)"
    exit 1 # Aborta se nao conseguir criar a pasta de destino
}

foreach ($File in $SourceFiles) {
    if (Test-Path $File) {
        try {
            Copy-Item -Path $File -Destination $BackupDir -Force -ErrorAction Stop
            Write-Host "[OK] $($File | Split-Path -Leaf)" -ForegroundColor Green
        }
        catch {
            Write-Warning "[FAIL] Falha ao copiar '$($File | Split-Path -Leaf)': $($_.Exception.Message)"
        }
    }
    else {
        Write-Host "[SKIP] Arquivo nao encontrado: $($File | Split-Path -Leaf)" -ForegroundColor Yellow
    }
}

# Limpeza de Entropia (Retencao de 14 dias)
Write-Host "Limpando backups obsoletos (mais de 14 dias)..." -ForegroundColor Cyan
$CutoffDate = (Get-Date).AddDays(-14)
Get-ChildItem -Path $BackupRoot -Directory | Where-Object { $_.CreationTime -lt $CutoffDate } | Remove-Item -Recurse -Force

Write-Host "=== BACKUP CONCLUIDO COM SUCESSO ===" -ForegroundColor Green
