<#
.SYNOPSIS
    Rotina de limpeza SOTA para o @skillmaster.
.DESCRIPTION
    Expurga backups antigos (.zip) da pasta .backups, garantindo a homeostase
    do espaco em disco e prevenindo acumulo de entropia.
#>

$ProjectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$BackupRoot = Join-Path $ProjectRoot '.backups'
$RetentionDays = 7

Write-Host "=== [SKILLMASTER] INICIANDO EXPURGO DE BACKUPS OBSOLETOS (RETENCAO: $RetentionDays DIAS) ===" -ForegroundColor Cyan

if (-not (Test-Path $BackupRoot)) {
    Write-Host '[INFO] Diretorio de backups nao encontrado. Nenhuma acao necessaria.' -ForegroundColor Green
    exit 0
}

try {
    $CutoffDate = (Get-Date).AddDays(-$RetentionDays)
    $OldBackups = Get-ChildItem -Path $BackupRoot -Filter '*.zip' | Where-Object { $_.LastWriteTime -lt $CutoffDate }

    if ($OldBackups) {
        foreach ($backup in $OldBackups) {
            Write-Host "  - Expurgo: $($backup.Name) (Criado em: $($backup.LastWriteTime))" -ForegroundColor Yellow
            Remove-Item -Path $backup.FullName -Force -ErrorAction Stop
        }
        Write-Host "[OK] $($OldBackups.Count) backups obsoletos foram expurgados com sucesso." -ForegroundColor Green
    }
    else {
        Write-Host '[INFO] Nenhum backup obsoleto encontrado.' -ForegroundColor Green
    }
}
catch {
    Write-Error "[FALHA CRITICA] Erro durante o expurgo de backups: $($_.Exception.Message)"
    $ErrorTaskId = "BACKUP-CLEANUP-FAIL-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    $ErrorDesc = "DIRETRIZ DE EMERGENCIA PARA @chico:`nO Protocolo de Limpeza de Backups (invoke_backup_cleanup.ps1) falhou.`n`nERRO CAPTURADO:`n$($_.Exception.ToString())`n`nSua missao e diagnosticar a causa raiz (ex: permissoes) e limpar manualmente a pasta .backups se necessario."
    $ErrorTask = [ordered]@{ id = $ErrorTaskId; description = $ErrorDesc; status = 'pending'; timestamp = (Get-Date -Format 'o'); agent = '@chico'; metadata = @{ priority = 'critical' } }
    $ErrorTaskJson = $ErrorTask | ConvertTo-Json -Depth 10 -Compress
    $ErrorTaskB64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($ErrorTaskJson))
    $PythonCmd = if (Test-Path "$ProjectRoot\.venv\Scripts\python.exe") { "$ProjectRoot\.venv\Scripts\python.exe" } else { 'python' }
    & $PythonCmd (Join-Path $ProjectRoot 'task_executor.py') db-add $ErrorTaskB64 | Out-Null
    Write-Host "[ALERTA] Tarefa de emergencia ($ErrorTaskId) enfileirada para o @chico." -ForegroundColor Red
}