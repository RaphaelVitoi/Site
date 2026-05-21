# Script de Salvaguarda Sistemica (Snapshot de Seguranca)
# Cria backup imediato de configuracoes, memorias e documentacao critica.

[CmdletBinding()]
param (
    [string[]]$Targets = @('.claude', 'docs', 'queue', 'data')
)

$ProjectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$BackupRoot = Join-Path $ProjectRoot '.backups'
if (-not (Test-Path $BackupRoot)) { New-Item -ItemType Directory -Path $BackupRoot -Force | Out-Null }
$Timestamp = Get-Date -Format 'yyyy-MM-dd_HHmmss'
# SOTA: Staging na pasta TEMP do S.O. para blindagem absoluta contra EPERM (OneDrive Locks)
$SnapshotDir = Join-Path $env:TEMP "NexusSnapshot_$Timestamp"
$ZipPath = Join-Path $BackupRoot "Snapshot_$Timestamp.zip"

Write-Host '[SAFEGUARD] Iniciando protocolo de salvaguarda...' -ForegroundColor Cyan

try {
    if (-not (Test-Path $SnapshotDir)) { New-Item -ItemType Directory -Path $SnapshotDir -Force | Out-Null }

    # SOTA: Garantia de Integridade Atomica do SQLite (Evitando Torn Pages)
    Write-Host '[SAFEGUARD] Acionando Online Backup API do SQLite...' -ForegroundColor Yellow
    $BackupScript = Join-Path $ProjectRoot 'scripts\routines\invoke_daily_backup.ps1'
    if (Test-Path $BackupScript) {
        & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $BackupScript | Out-Null
    }

    foreach ($target in $Targets) {
        $sourcePath = Join-Path $ProjectRoot $target
        if (Test-Path $sourcePath) {
            $destPath = Join-Path $SnapshotDir $target
            Copy-Item -Path $sourcePath -Destination $destPath -Recurse -Force
            Write-Host "  + Backup de '$target' preservado." -ForegroundColor Green
        }
    }

    # SOTA: Preservacao do ChromaDB e SQLite (Memoria SOTA).
    # Expurgamos os arquivos VIVOS de banco de dados e transacao que causam lock no Zip e corrupcao de Snapshot.
    # Os backups reais do SQLite estarao preservados na pasta 'queue/backups', gerados de forma thread-safe.
    Get-ChildItem -Path $SnapshotDir -Include 'tasks.db', '*.db-wal', '*.db-shm' -Recurse -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue

    Write-Host '[SAFEGUARD] Compactando snapshot SOTA...' -ForegroundColor Yellow
    Compress-Archive -Path "$SnapshotDir\*" -DestinationPath $ZipPath -Force

    # Limpeza do diretorio temporario pos-compactacao
    Remove-Item -Path $SnapshotDir -Recurse -Force

    Write-Host "[SAFEGUARD] Estado do sistema congelado e compactado em: $ZipPath" -ForegroundColor Green
}
catch {
    Write-Error "[FALHA CRITICA] Erro durante a salvaguarda do sistema: $($_.Exception.Message)"

    $ErrorTaskId = "BACKUP-FAIL-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    $ErrorDesc = "DIRETRIZ DE EMERGENCIA PARA @chico:`nO Protocolo de Salvaguarda (safeguard_system.ps1) falhou ao tentar criar o backup do sistema.`n`nERRO CAPTURADO:`n$($_.Exception.ToString())`n`nSua missao e diagnosticar a causa raiz (ex: permissoes, arquivos travados) e aplicar a correcao via God Mode."

    $ErrorTask = [ordered]@{ id = $ErrorTaskId; description = $ErrorDesc; status = 'pending'; timestamp = (Get-Date -Format 'o'); agent = '@chico'; metadata = @{ priority = 'critical' } }

    $ErrorTaskJson = $ErrorTask | ConvertTo-Json -Depth 10 -Compress
    $ErrorTaskB64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($ErrorTaskJson))
    $PythonCmd = if (Test-Path "$ProjectRoot\.venv\Scripts\python.exe") { "$ProjectRoot\.venv\Scripts\python.exe" } else { 'python' }

    & $PythonCmd (Join-Path $ProjectRoot 'task_executor.py') db-add $ErrorTaskB64 | Out-Null

    Write-Host "[ALERTA] Tarefa de emergencia ($ErrorTaskId) enfileirada para o @chico curar o sistema." -ForegroundColor Red
}
