<#
.SYNOPSIS
    Orquestra o protocolo de Handoff SOTA para encerrar uma sessao de trabalho.
.DESCRIPTION
    Automatiza a sintese da sessao, registro perpetuo, backup e preparacao do
    prompt de continuidade para a proxima sessao.
#>

$ProjectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$PythonCmd = if (Test-Path "$ProjectRoot\.venv\Scripts\python.exe") { "$ProjectRoot\.venv\Scripts\python.exe" } else { 'python' }
$Executor = Join-Path $ProjectRoot 'task_executor.py'

Write-Host '=== INICIANDO PROTOCOLO DE HANDOFF SOTA (PURE ASCII) ===' -ForegroundColor Magenta

# 1. Coletar dados da sessao (ultimas 8 horas)
Write-Host '[1/4] Coletando telemetria da sessao atual...' -ForegroundColor Cyan
$recentTasksJsonRaw = & $PythonCmd $Executor db-get --since 8h --json

# SOTA: Filtro cirurgico para isolar o JSON puro, ignorando eventuais logs (como o WARNING do Fallback DB)
$recentTasksJson = $recentTasksJsonRaw | Where-Object { ($_ -match '^\s*\[|^\s*\{') -and ($_ -notmatch '^\s*\[\d{2}:\d{2}:\d{2}\]') } | Select-Object -First 1
if (-not $recentTasksJson) {
    Write-Warning 'Nao foi possivel obter as tarefas recentes. A sintese pode ser incompleta.'
    $recentTasksJson = '{"error": "Failed to retrieve recent tasks"}'
}

# SOTA: Previne o limite de caracteres do Windows CLI (8KB) salvando o JSON no disco
$ContextDumpPath = Join-Path $ProjectRoot '.claude\logs\recent_tasks_dump.json'
$LogDir = Split-Path $ContextDumpPath
if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir | Out-Null }
[System.IO.File]::WriteAllText($ContextDumpPath, $recentTasksJson, [System.Text.Encoding]::UTF8)

# 2. Enfileirar tarefa de sintese para @chico (Kernel)
Write-Host '[2/4] Delegando sintese e registro para @chico (Kernel)...' -ForegroundColor Cyan
$handoffTaskId = "HANDOFF-$(Get-Date -Format 'yyyyMMdd-HHmmss-ffff')"
$handoffTaskDesc = @"
DIRETRIZ DE HANDOFF SOTA (FIM DE SESSAO):
Sua missao e criar o registro de transicao para a proxima sessao.

1.  **ANALISE DE SESSAO:** Analise o JSON de tarefas recentes salvo no arquivo abaixo para entender o que foi feito hoje.
    `Arquivo: .claude/logs/recent_tasks_dump.json`
2.  **SINTESE E APRENDIZADO:** Escreva um resumo denso e informativo em Markdown, cobrindo:
    -   Principais realizacoes e refatoracoes.
    -   Decisoes arquiteturais tomadas.
    -   Licoes aprendidas e novas invariantes (se houver).
3.  **REGISTRO PERPETUO:** Salve este relatorio no seguinte caminho, usando o God Mode:
    `Arquivo: .claude/handoffs/handoff_$(Get-Date -Format 'yyyy-MM-dd_HH-mm').md`
4.  **MEMORIA DO KERNEL:** Crie uma sintese de 3-4 linhas do handoff e use o God Mode para **adicionar (append)** ao final do arquivo de memoria do @chico:
    `Arquivo: .claude/agent-memory/chico/MEMORY.md`
    (Use logica de leitura e reescrita para garantir que esta adicionando, nao sobrescrevendo).
"@

$task = @{ id = $handoffTaskId; description = $handoffTaskDesc; status = 'pending'; timestamp = (Get-Date -Format 'o'); agent = '@chico'; metadata = @{ priority = 'high'; observers = @('@maverick') } }
$taskJson = $task | ConvertTo-Json -Depth 10 -Compress
$taskB64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($taskJson))
& $PythonCmd $Executor db-add $taskB64 | Out-Null
Write-Host "[OK] Tarefa de sintese ($handoffTaskId) enfileirada." -ForegroundColor Green

# 3. Forja do Backup TOTAL e INTEGRAL (SOTA Compression via .NET)
Write-Host '[3/4] Acionando Protocolo de Salvaguarda (Backup TOTAL SOTA)...' -ForegroundColor Cyan
$BackupDir = Join-Path $ProjectRoot '_backups\full_manual'
if (-not (Test-Path $BackupDir)) { New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null }
$BackupFile = Join-Path $BackupDir "NEXUS_SOTA_BACKUP_$(Get-Date -Format 'yyyy-MM-dd_HHmmss').zip"

Write-Host '  -> Escaneando a TOTALIDADE do ecossistema (Arquivos visiveis, invisiveis e de infraestrutura)...' -ForegroundColor DarkGray
Write-Host "  -> DESTINO ABSOLUTO: $BackupFile" -ForegroundColor Yellow

try {
    Add-Type -AssemblyName System.IO.Compression
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $ZipArchive = [System.IO.Compression.ZipFile]::Open($BackupFile, [System.IO.Compression.ZipArchiveMode]::Create)
    # Filtro cirurgico: escaneia tudo, mas exclui o proprio diretorio de backups para evitar recursao catastrofica
    $AllFiles = Get-ChildItem -Path $ProjectRoot -Recurse -Force -File | Where-Object { $_.FullName -notmatch '\\_backups\\' }

    $TotalFiles = $AllFiles.Count
    $Processed = 0
    foreach ($File in $AllFiles) {
        $RelativePath = $File.FullName.Substring($ProjectRoot.Length + 1)
        try {
            [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($ZipArchive, $File.FullName, $RelativePath, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
        }
        catch { } # Ignora arquivos alocados (Ex: WAL do SQLite ou logs abertos) para que o backup nunca falhe
        $Processed++
    }
    $ZipArchive.Dispose()

    $SizeMB = [math]::Round((Get-Item $BackupFile).Length / 1MB, 2)
    Write-Host "[OK] Backup TOTAL Materializado e Verificado! ($Processed/$TotalFiles arquivos, ${SizeMB}MB)." -ForegroundColor Green
}
catch {
    Write-Error "[FALHA CRITICA] Erro na compressao SOTA: $_"
}

# 4. Preparar prompt de continuidade
Write-Host '[4/4] Gerando prompt de continuidade e copiando para o clipboard...' -ForegroundColor Cyan
& (Join-Path $ProjectRoot 'do.ps1') -Web -Force # -Force para pular a seleção de menu

Write-Host "`n[SUCESSO] Protocolo de Handoff concluido. O prompt de continuidade esta no seu clipboard." -ForegroundColor Magenta

# 5. Disparar Feedback Visual (Toast)
try {
    [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
    [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null
    $ToastXml = @'
<toast>
    <visual>
        <binding template="ToastText02">
            <text id="1">Handoff SOTA Concluido</text>
            <text id="2">Sintese registrada e prompt copiado para o clipboard!</text>
        </binding>
    </visual>
</toast>
'@
    $Xml = [Windows.Data.Xml.Dom.XmlDocument]::new()
    $Xml.LoadXml($ToastXml)
    $Toast = [Windows.UI.Notifications.ToastNotification]::new($Xml)
    [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier('NexusHandoff').Show($Toast)
}
catch {
    Write-Host '[SISTEMA] Notificacao Toast falhou, mas o handoff operou com sucesso.' -ForegroundColor DarkGray
}
