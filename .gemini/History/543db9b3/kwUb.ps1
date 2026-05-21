<#
.SYNOPSIS
    Copia os arquivos de configuracao para um diretorio .bak/.
.DESCRIPTION
    Este script automatiza o backup dos principais arquivos de configuracao,
    garantindo a integridade das definicoes do sistema.
#>

$SourceFiles = @(
    ".claude\\GLOBAL_INSTRUCTIONS.md",
    ".claude\\project-context.md",
    ".claude\\LIDERANCA_GOVERNANCE_RAPHAEL_MAVERICK_CHICO.md",
    ".claude\\COSMOVISAO.md",
    "queue\\tasks.db"
)

$BackupDir = ".bak\" + (Get-Date -Format "yyyyMMddHHmmss")

Write-Host "Iniciando backup para: $($BackupDir)" -ForegroundColor Green

try {
    New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null

}
catch {
    Write-Error "Falha critica ao criar diretorio de backup '$BackupDir': $($_.Exception.Message)"
    exit 1 # Aborta se nao conseguir criar a pasta de destino
}

foreach ($File in $SourceFiles) {
    try {
        Copy-Item -Path $File -Destination $BackupDir -Force -ErrorAction Stop
        Write-Host "Copiado: $($File) para $($BackupDir)" -ForegroundColor DarkGray
    }
    catch {
        Write-Warning "Falha ao copiar '$File': $($_.Exception.Message). Continuando com o proximo..."
    }
}

Write-Host "Backup concluido com sucesso." -ForegroundColor Green
