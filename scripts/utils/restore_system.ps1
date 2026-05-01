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
$BackupRoot = Join-Path $ProjectRoot '.backups'
# SOTA: O pre-restore agora captura a arvore completa para acompanhar o Full Backup (ignorando mortos)
$Targets = Get-ChildItem -Path $ProjectRoot | Where-Object { $_.Name -notin @('.backups', 'node_modules', '.venv', '.nexus_runtime', '.git') } | Select-Object -ExpandProperty Name

Write-Host '=== [CHICO] PROTOCOLO DE RESTAURACAO DE EMERGENCIA SOTA ===' -ForegroundColor Red

# 1. Identificar o ultimo backup valido
$LatestBackup = Get-ChildItem -Path $BackupRoot -Filter '*.zip' | Sort-Object LastWriteTime -Descending | Select-Object -First 1
if (-not $LatestBackup) {
    Write-Error "[FALHA CRITICA] Nenhum arquivo de backup (.zip) encontrado em '$BackupRoot'. Restauracao impossivel."
    exit 1
}

Write-Host "[INFO] Ultimo snapshot valido identificado: $($LatestBackup.Name)" -ForegroundColor Cyan

# 1.5. Validacao de Integridade do Backup (SOTA)
Write-Host '[INFO] Validando integridade do arquivo de backup .zip...' -ForegroundColor Yellow
try {
    [System.Reflection.Assembly]::LoadWithPartialName('System.IO.Compression.FileSystem') | Out-Null
    $zip = [System.IO.Compression.ZipFile]::OpenRead($LatestBackup.FullName)
    if ($zip.Entries.Count -eq 0) { throw 'O arquivo de backup esta vazio ou corrompido.' }
    $zip.Dispose()
    Write-Host '[OK] Integridade do backup .zip verificada com sucesso.' -ForegroundColor Green
}
catch {
    Write-Error "[FALHA CRITICA] O arquivo de backup '$($LatestBackup.Name)' esta CORROMPIDO ou VAZIO. Restauracao abortada para proteger o sistema. Erro: $($_.Exception.Message)"
    # Futuramente, poderia enfileirar uma tarefa para o @chico investigar a corrupcao do backup.
    exit 1
}

# 2. Confirmacao de Seguranca
if (-not $Force) {
    $confirmation = Read-Host "[ALERTA] Voce esta prestes a REVERTER o estado do sistema para o snapshot '$($LatestBackup.Name)'. O estado atual dos diretorios-alvo sera PERDIDO. Deseja prosseguir? (y/n)"
    if ($confirmation -ne 'y') {
        Write-Host '[CANCELADO] A restauracao foi cancelada pelo usuario.' -ForegroundColor Yellow
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
    Write-Host '[OK] Estado atual preservado com seguranca.' -ForegroundColor Green
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

    # --- Protocolo de Alerta para @chico ---
    $ErrorTaskId = "RESTORE-FAIL-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    $ErrorDesc = "DIRETRIZ DE EMERGENCIA CATASTROFICA PARA @chico:`nO Protocolo de Restauracao (restore_system.ps1) falhou durante a descompactacao do backup '$($LatestBackup.Name)'.`n`nERRO CAPTURADO:`n$($_.Exception.ToString())`n`nO sistema pode estar em um estado INCONSISTENTE. O estado PRE-RESTAURACAO foi salvo em '$PreRestoreDir'.`n`nSua missao e:
1. AVALIAR a gravidade da falha.
2. TENTAR RESTAURAR MANUALMENTE os diretorios-alvo a partir da pasta '$PreRestoreDir'.
3. Se a restauracao manual for bem-sucedida, limpar o estado inconsistente e notificar Raphael Vitoi."

    $ErrorTask = [ordered]@{ id = $ErrorTaskId; description = $ErrorDesc; status = 'pending'; timestamp = (Get-Date -Format 'o'); agent = '@chico'; metadata = @{ priority = 'critical' } }

    $ErrorTaskJson = $ErrorTask | ConvertTo-Json -Depth 10 -Compress
    $ErrorTaskB64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($ErrorTaskJson))
    $PythonCmd = if (Test-Path "$ProjectRoot\.venv\Scripts\python.exe") { "$ProjectRoot\.venv\Scripts\python.exe" } else { 'python' }

    & $PythonCmd (Join-Path $ProjectRoot 'task_executor.py') db-add $ErrorTaskB64 | Out-Null
    Write-Host "[ALERTA] Tarefa de emergencia ($ErrorTaskId) enfileirada para o @chico intervir." -ForegroundColor Red
    exit 1
}
