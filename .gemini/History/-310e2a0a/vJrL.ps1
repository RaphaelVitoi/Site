<#
.SYNOPSIS
    Copia os arquivos de configuração para um diretório .bak/.
.DESCRIPTION
    Este script automatiza o backup dos principais arquivos de configuração,
    garantindo a integridade das definições do sistema.
#>

$SourceFiles = @(
    ".claude\\GLOBAL_INSTRUCTIONS.md",
    ".claude\\project-context.md",
    ".claude\\LIDERANCA_GOVERNANCE_RAPHAEL_MAVERICK_CHICO.md",
    ".claude\\COSMOVISAO.md",
    "queue\\tasks.json"
)

$BackupDir = ".bak\" + (Get-Date -Format "yyyyMMddHHmmss")

Write-Host "Iniciando backup para: $($BackupDir)" -ForegroundColor Green

try {
    New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null

    foreach ($File in $SourceFiles) {
        Copy-Item -Path $File -Destination $BackupDir -Force
        Write-Host "Copiado: $($File) para $($BackupDir)" -ForegroundColor DarkGray
    }

    Write-Host "Backup concluído com sucesso." -ForegroundColor Green
}
catch {
    Write-Host "Falha ao realizar backup: $($_.Exception.Message)" -ForegroundColor Red
}