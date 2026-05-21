<#
.SYNOPSIS
    A Membrana Inteligente (CLI Interativa) e ponto de entrada para o ecossistema de agentes.
    Orquestra a enfileiracao de tarefas e executa comandos com seguranca.

.DESCRIPTION
    Este script e o coracao da interacao do usuario com o sistema de agentes.
    Ele permite:
    1. Enfileirar novas tarefas para processamento assincrono.
    2. Opcionalmente, preparar prompts para execucao na interface Web (Claude Pro/Gemini Advanced).
    3. Executar comandos de forma segura, validando contra acoes destrutivas.

.PARAMETER Description
    A descricao da tarefa a ser enfileirada.
.PARAMETER Web
    Se presente, o script preparara o contexto e copiara para o clipboard
    para uso na interface Web do LLM (Claude Pro/Gemini Advanced).
.PARAMETER Ola
    Dispara o Protocolo de Ignicao Cognitiva para um agente especifico. Extrai o contexto total e acopla o prompt de despertar SOTA no clipboard. Ex: -Ola Chico
.PARAMETER Execute
    Um comando PowerShell a ser executado diretamente. Este comando passara
    pelo Protocolo de Exclusao Segura.
.PARAMETER Chaos
    Aciona a Engenharia do Caos (chaos-core.ts) para testar a resiliencia da infraestrutura.
.PARAMETER Obliterate
    Aniquila completamente um diretorio ou arquivo, lidando corretamente com caracteres especiais como colchetes [].
.PARAMETER FixEPERM
    Executa o protocolo implacavel do Chico para aniquilar o OneDrive e processos Node travados, resolvendo o erro EPERM.
.PARAMETER Audit
    Dispara uma Auditoria SOTA Sob Demanda (Smart MDA). Voce pode passar um cenario especifico como string para focar a analise.
.PARAMETER SyncAgents
    Sincroniza os agentes (Manifesto -> Realidade Fisica). Cria arquivos .md e memorias ausentes.
.PARAMETER DailyReport
    Aciona a compilação do relatório diário de autonomia, sintetizando todas as mutações e tarefas executadas pelo sistema.
.PARAMETER Backup
    Aciona o Protocolo de Salvaguarda Sistemica, criando um snapshot (backup) imediato.
#>
[CmdletBinding(PositionalBinding = $false)]
param (
    [Parameter(Position = 0, ValueFromRemainingArguments = $true)]
    [string[]]$Description,

    [Parameter()]
    [switch]$DailyReport,

    [Parameter()]
    [switch]$Web,

    [Parameter()]
    [string]$Execute,

    [Parameter()]
    [switch]$Chaos,

    [Parameter()]
    [string]$Obliterate,

    [Parameter()]
    [string]$FixEPERM,

    [Parameter()]
    [string]$Audit,

    [Parameter()]
    [switch]$SyncAgents,

    [Parameter()]
    [switch]$Backup,

    [Parameter()]
    [switch]$Handoff,

    [Parameter()]
    [switch]$Force,

    [Parameter()]
    [ValidateSet('low', 'medium', 'high', 'gto')]
    [string]$Intensity = 'low',

    [Parameter()]
    [ValidateSet('worker', 'frontend')]
    [string]$Target = 'worker',

    [Parameter()]
    [switch]$Watch,

    [Parameter()]
    [switch]$Reflect,

    [Parameter()]
    [switch]$ScheduleMaintenance,

    [Parameter()]
    [switch]$Setup,

    [Parameter()]
    [switch]$RecalibratePriority,

    [Parameter()]
    [string]$StatusFilter = 'pending',

    [Parameter()]
    [switch]$CheckDB,

    [Parameter()]
    [switch]$Graph,

    [Parameter()]
    [switch]$InjectGeminiSettings,

    [Parameter()]
    [switch]$CortexOverride,

    [Parameter()]
    [string]$Ola,

    [Parameter()]
    [ValidateSet('stop', 'default', 'partial', 'full')]
    [string]$Autonomy,

    # Modo de teste: suprime definicoes locais de funcoes para que os mocks do
    # Pester (globais) sejam encontrados normalmente na cadeia de escopo.
    [Parameter()]
    [switch]$TestMode
)

# Forca o encoding do terminal para UTF-8, erradicando a entropia do Windows-1252
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# SOTA GUARD: Bloqueio de Downgrade Attack (Forca TLS 1.2 e 1.3 na Membrana)
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12 -bor [System.Net.SecurityProtocolType]::Tls13

# Constantes e Configuracoes (PURE ASCII, sem UTF-8)
$ScriptDirectory = $PSScriptRoot
$ContextAssemblerPath = Join-Path $ScriptDirectory 'scripts\routines\Invoke-ContextAssembler.ps1'
$PythonCmd = if ($TestMode -and $Global:TestPythonCmd) {
    $Global:TestPythonCmd
}
elseif (Test-Path -LiteralPath "$ScriptDirectory\.venv\Scripts\python.exe") {
    "$ScriptDirectory\.venv\Scripts\python.exe"
}
else {
    $validPython = $null
    $commands = Get-Command 'python.exe', 'python3.exe' -All -ErrorAction SilentlyContinue
    foreach ($cmd in $commands) {
        if ($cmd.Source -and $cmd.Source -notmatch 'WindowsApps') {
            $validPython = $cmd.Source
            break
        }
    }
    if ($validPython) { $validPython } else { 'python' }
}

# SOTA: Injecao do Virtual Root (PathManager)
$PathManagerModule = Join-Path $ScriptDirectory 'scripts\utils\PathManager.ps1'
if (Test-Path -LiteralPath $PathManagerModule) {
    . $PathManagerModule
}

# Helper de I/O Ultrarrapido (.NET Nativo SOTA)
function Get-FileContentSOTA([string]$Path) {
    if (Test-Path -LiteralPath $Path) {
        return [System.IO.File]::ReadAllText($Path, [System.Text.Encoding]::UTF8)
    }
    return ''
}

# --- Funcoes Core ---

function Write-CryptoAuditSOTA {
    param([string]$Action, [string]$Target)
    $LogDir = Join-Path $ScriptDirectory '.claude\logs'
    if (-not (Test-Path -LiteralPath $LogDir)) { New-Item -ItemType Directory -Path $LogDir | Out-Null }
    $AuditLogPath = Join-Path $LogDir 'crypto_audit.log'
    $Timestamp = (Get-Date -Format 'o')
    $User = [Environment]::UserName
    $RawData = "$Timestamp|$User|$Action|$Target"
    $Bytes = [System.Text.Encoding]::UTF8.GetBytes($RawData)
    $Sha256 = [System.Security.Cryptography.SHA256]::Create()
    $HashString = [BitConverter]::ToString($Sha256.ComputeHash($Bytes)) -replace '-', ''
    $Sha256.Dispose()
    "$RawData|$HashString" | Out-File -FilePath $AuditLogPath -Append -Encoding ASCII
}

$SafeCommandModulePath = Join-Path $ScriptDirectory 'scripts\utils\Invoke-SafeCommand.ps1'
if (Test-Path -LiteralPath $SafeCommandModulePath) {
    . $SafeCommandModulePath
}
else {
    function Invoke-SafeCommand {
        param([string]$Command)
        Write-Error "[SEC] O modulo de seguranca esta ausente ($SafeCommandModulePath). Execucao de comandos abortada em prol da defesa sistemica."
        return $false
    }
}

if (-not $TestMode) {
    function Invoke-ContextAssembler {
        if (Test-Path -LiteralPath $ContextAssemblerPath) {
            . $ContextAssemblerPath
            return Invoke-ContextAssembler @args
        }
        else {
            # SOTA: Expurgo da leitura em bloco ineficiente do PowerShell.
            # A Mente Coletiva SOTA ja habita o Orquestrador. O PS1 so precisa aciona-lo.
            Write-Warning '[SOTA] Scripts de montagem local ausentes. Delegando composicao holistica ao Kernel...'
            return 'O gerador de contexto local foi removido. Use o orquestrador ativo para obter contextos profundos.'
        }
    }

    function Invoke-NexusScript {
        param(
            [string]$ScriptName,
            [string]$Message,
            [string[]]$Arguments
        )
        Write-Host "=== [SISTEMA] $Message ===" -ForegroundColor Magenta
        $ScriptPath = Join-Path $ScriptDirectory $ScriptName
        if (Test-Path -LiteralPath $ScriptPath) {
            if ($Arguments) {
                & $ScriptPath @Arguments
            }
            else {
                & $ScriptPath
            }
        }
        else {
            Write-Error "Script de rotina nao encontrado em: $ScriptPath"
        }
        exit 0
    }

    function Invoke-TypeScriptGateSOTA {
        Write-Host '=== [SISTEMA] BLINDAGEM TYPESCRIPT (tsc --noEmit) ===' -ForegroundColor Magenta
        $FrontendDir = Join-Path $ScriptDirectory 'frontend'
        if (Test-Path -LiteralPath $FrontendDir) {
            $PrevDir = $PWD
            Set-Location $FrontendDir
            try {
                $NpxCmd = if (Get-Command 'npx.cmd' -ErrorAction SilentlyContinue) { 'npx.cmd' } else { 'npx' }
                Write-Host '[INFRA] Analisando tipagem estrita no frontend...' -ForegroundColor DarkGray
                & $NpxCmd tsc --noEmit
                if ($LASTEXITCODE -ne 0) {
                    Write-Error '[SEC CRITICO] Entropia de tipagem detectada pelo tsc. Abortando operacao para evitar colapso em Runtime.'
                    exit 1
                }
                Write-Host "[OK] Simetria de tipos confirmada. (Friccao Zero)`n" -ForegroundColor Green
            }
            finally {
                Set-Location $PrevDir
            }
        }
    }
}

# --- Logica Principal ---

if ($Setup) {
    Invoke-NexusScript -ScriptName 'scripts\setup\Setup-NexusProfile.ps1' -Message 'INICIANDO PROTOCOLO DE INSTALACAO/ATUALIZACAO DO PERFIL NEXUS'
}

if ($Handoff) {
    if (-not $TestMode) { Invoke-TypeScriptGateSOTA }
    Invoke-NexusScript -ScriptName 'scripts\routines\invoke_handoff_protocol.ps1' -Message 'INICIANDO PROTOCOLO DE HANDOFF SOTA'
}

if ($ScheduleMaintenance) {
    Invoke-NexusScript -ScriptName 'scripts\setup\Schedule-MaintenanceTasks.ps1' -Message 'INICIANDO AGENDAMENTO DE ROTINAS DE MANUTENCAO'
}

if ($RecalibratePriority) {
    Invoke-NexusScript -ScriptName 'scripts\routines\invoke_priority_recalibration.ps1' -Message 'INICIANDO RECALIBRACAO DE PESOS DE PRIORIDADE (CPU)'
}

if ($CheckDB) {
    Invoke-NexusScript -ScriptName 'scripts\maintenance\invoke_db_integrity_check.ps1' -Message 'INICIANDO AUDITORIA DE BANCO DE DADOS'
}

if ($Graph) {
    Write-Host '=== [SISTEMA] GERANDO GRAFO DE DEPENDENCIAS (MERMAID) ===' -ForegroundColor Magenta
    $ExecutorScript = Join-Path $ScriptDirectory 'task_executor.py'
    $graphOutput = & $PythonCmd $ExecutorScript 'db-mermaid-graph' $StatusFilter
    Write-Host '[INFO] O grafo abaixo pode ser colado em https://mermaid.live para visualizacao.' -ForegroundColor Cyan
    $graphOutput | Out-Host -Paging
    exit 0
}

if ($Reflect) {
    Invoke-NexusScript -ScriptName '.claude\trigger_mass_reflection.ps1' -Message 'INICIANDO DESPERTAR COGNITIVO EM MASSA'
}

if ($Watch) {
    Write-Host '=== [SISTEMA] VIGILIA ATIVA SOTA INICIADA ===' -ForegroundColor Magenta
    Write-Host 'Monitorando alteracoes em arquivos criticos (.md, .json, .ps1). Pressione Ctrl+C para parar.'

    $watcher = New-Object System.IO.FileSystemWatcher
    $watcher.Path = $PSScriptRoot
    $watcher.NotifyFilter = [System.IO.NotifyFilters]'LastWrite, FileName, DirectoryName'
    $watcher.IncludeSubdirectories = $true
    $watcher.EnableRaisingEvents = $true

    $Global:NexusPendingIngestion = $false
    $Global:NexusPendingSync = $false

    $IngestionManifestPath = Join-Path $PSScriptRoot 'rag_ingestion_manifest.json'
    $WatchPatterns = @('*.md', '*.docx', '*.py', '*.ts', '*.tsx', '*.ps1')
    if (Test-Path -LiteralPath $IngestionManifestPath) {
        try {
            $ManifestData = Get-FileContentSOTA -Path $IngestionManifestPath | ConvertFrom-Json
            $Exts = @()
            foreach ($source in $ManifestData.sources) {
                foreach ($pattern in $source.patterns) {
                    $Exts += $pattern
                }
            }
            if ($Exts.Count -gt 0) { $WatchPatterns = $Exts | Select-Object -Unique }
        }
        catch {
            Write-Warning '[VIGILIA] Falha ao ler rag_ingestion_manifest.json. Usando padroes default.'
        }
    }

    $action = {
        $path = $Event.SourceEventArgs.FullPath
        $changeType = $Event.SourceEventArgs.ChangeType
        $name = $Event.SourceEventArgs.Name
        $patterns = $Event.MessageData

        if ($path -match '\\\.git\\' -or $path -match '\\\.venv\\' -or $path -match '\\__pycache__\\' -or $path -match '\\\.chroma_db\\' -or $path -match '\\node_modules\\') {
            return
        }

        Write-Host "`n[VIGILIA] Alteracao '$changeType' detectada em: $name" -ForegroundColor Yellow

        $isIngestionTarget = $false
        foreach ($pat in $patterns) {
            if ($name -like $pat) {
                $isIngestionTarget = $true
                break
            }
        }

        if ($isIngestionTarget) {
            $Global:NexusPendingIngestion = $true
        }
        elseif ($name -eq 'agents_manifest.json' -or $name -eq 'document_manifest.json') {
            $Global:NexusPendingSync = $true
        }
    }

    $events = @('Changed', 'Created', 'Deleted', 'Renamed')
    foreach ($eventType in $events) {
        Register-ObjectEvent -InputObject $watcher -EventName $eventType -Action $action -SourceIdentifier "NexusFileWatcher.$eventType" -MessageData $WatchPatterns | Out-Null
    }

    try {
        while ($true) {
            Wait-Event -Timeout 3

            if ($Global:NexusPendingIngestion) {
                $Global:NexusPendingIngestion = $false
                Write-Host '[ACAO] Disparando re-ingestao da memoria RAG (Zero Cold-Start via HTTP API)...' -ForegroundColor Cyan
                try {
                    $apiUrl = 'http://127.0.0.1:17042/ingest'
                    $headers = @{}
                    if ($env:API_SECRET_TOKEN) { $headers.Add('Authorization', "Bearer $env:API_SECRET_TOKEN") }
                    Invoke-WebRequest -Uri $apiUrl -Method Post -Headers $headers -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop | Out-Null
                }
                catch {
                    Write-Warning '[VIGILIA] API /ingest indisponivel. Fallback para Cold-Start nativo...'
                    $IngestScript = Join-Path $PSScriptRoot 'memory_rag.py'
                    Start-Process -FilePath $PythonCmd -ArgumentList "`"$IngestScript`" ingest" -WindowStyle Hidden
                }
            }

            if ($Global:NexusPendingSync) {
                $Global:NexusPendingSync = $false
                Write-Host '[ACAO] Disparando sincronia de agentes em background (Lote Debounced)...' -ForegroundColor Cyan
                $SyncScript = Join-Path $PSScriptRoot 'scripts\routines\sync_agents_reality.ps1'
                Start-Process -FilePath 'powershell.exe' -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$SyncScript`"" -WindowStyle Hidden
            }
        }
    }
    finally {
        Get-EventSubscriber -SourceIdentifier 'NexusFileWatcher.*' | Unregister-Event
        Write-Host "`n[SISTEMA] Vigilia Ativa SOTA encerrada." -ForegroundColor Magenta
    }
    exit 0
}

if ($Chaos) {
    Write-Host '=== [PROTOCOLO DE ENTROPIA] ENGENHARIA DO CAOS ===' -ForegroundColor Red
    Write-Host "  > Nivel de Intensidade : $Intensity" -ForegroundColor Yellow
    Write-Host "  > Alvo da Infeccao     : $Target" -ForegroundColor Yellow
    Write-Host '---------------------------------------------------' -ForegroundColor DarkGray

    $env:TS_NODE_COMPILER_OPTIONS = '{"module":"CommonJS"}'

    $ChaosScript = Join-Path $ScriptDirectory 'scripts\tests\chaos-core.ts'
    if (-not (Test-Path -LiteralPath $ChaosScript)) {
        Write-Error "[FAIL] O motor de Engenharia do Caos nao foi encontrado em: $ChaosScript. Certifique-se de cria-lo antes de acionar a infeccao."
        exit 1
    }

    $NpxCmd = if (Get-Command 'npx.cmd' -ErrorAction SilentlyContinue) { 'npx.cmd' } else { 'npx' }
    & $NpxCmd ts-node "$ChaosScript" --intensity $Intensity --target $Target
    exit 0
}

if ($Obliterate) {
    Write-Host '=== [PROTOCOLO DE OBLITERACAO] SOTA ATIVADO ===' -ForegroundColor Red
    $TargetPath = [System.IO.Path]::GetFullPath((Join-Path $PWD $Obliterate))
    $ProjectRoot = [System.IO.Path]::GetFullPath($ScriptDirectory)

    if (-not $TargetPath.StartsWith($ProjectRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
        Write-Error "[SEC CRITICO] O alvo de obliteracao transpassa os limites fisicos do projeto ($ProjectRoot). Acesso negado."
        exit 1
    }

    if (Test-Path -LiteralPath $TargetPath) {
        if ($Force) {
            $confirmation = 'y'
        }
        else {
            $confirmation = Read-Host "[ALERTA] Voce esta prestes a obliterar permanentemente '$TargetPath'. Esta acao e IRREVERSIVEL. Deseja prosseguir? (y/n)"
        }

        if ($confirmation -eq 'y') {
            Write-CryptoAuditSOTA -Action 'OBLITERATE' -Target $TargetPath
            Write-Host "[OBLITERACAO] Vaporizando: $TargetPath" -ForegroundColor Yellow
            Remove-Item -LiteralPath $TargetPath -Recurse -Force -ErrorAction Stop
            Write-Host '[VITORIA] Entropia erradicada com sucesso.' -ForegroundColor Green
        }
        else {
            Write-Host '[CANCELADO] A obliteracao foi cancelada pelo usuario.' -ForegroundColor Cyan
        }
    }
    else {
        Write-Warning "[AVISO] O alvo nao existe ou ja foi obliterado: $TargetPath"
    }
    exit 0
}

if ($PSBoundParameters.ContainsKey('FixEPERM')) {
    Write-Host '=== [PROTOCOLO ANTI-EPERM] CHICO NO CONTROLE ===' -ForegroundColor Red

    if ([string]::IsNullOrWhiteSpace($FixEPERM)) {
        Write-Error "O parametro -FixEPERM agora requer um comando para ser executado. Ex: -FixEPERM 'npm install'"
        exit 1
    }

    $CommandParts = $FixEPERM -split '\s+(?=(?:[^"]*"[^"]*")*[^"]*$)' | Where-Object { $_ -match '\S' } | ForEach-Object { $_.Trim('"') }
    $CommandName = $CommandParts[0]
    $CommandArgs = if ($CommandParts.Length -gt 1) { $CommandParts[1..($CommandParts.Length - 1)] } else { @() }
    $AllowedCommands = @('npm', 'pnpm', 'yarn', 'pip', 'npx')

    if ($CommandName -notin $AllowedCommands) {
        Write-Error "[SEC] O comando '$CommandName' nao e permitido pelo protocolo -FixEPERM. Comandos permitidos: $($AllowedCommands -join ', ')"
        exit 1
    }

    Write-Host '[ANTI-EPERM] Aniquilando processos Node zumbis SOTA (Scoping Cirurgico)...' -ForegroundColor Yellow
    try {
        $CurrentPathEscaped = [regex]::Escape($PWD.Path) -replace '\\\\', '\\'
        $NodeProcs = Get-CimInstance -ClassName Win32_Process -Filter "Name='node.exe'" | Where-Object { $_.CommandLine -match $CurrentPathEscaped }
        if ($NodeProcs) {
            foreach ($proc in $NodeProcs) { Stop-Process -Id $proc.ProcessId -Force -ErrorAction SilentlyContinue }
        }
        else {
            Write-Warning '[ANTI-EPERM] Nenhum processo Node atrelado a este diretorio foi encontrado. Abortando aniquilacao global para proteger outros processos do OS.'
        }
    }
    catch {
        Write-Error '[ANTI-EPERM] Falha ao consultar WMI para processos Node. Acao abortada para evitar danos colaterais ao sistema.'
    }

    Write-Host '[ANTI-EPERM] Pausando sincronizacao do OneDrive para evitar locks...' -ForegroundColor Yellow
    $oneDriveProcess = Get-Process -Name 'OneDrive' -ErrorAction SilentlyContinue
    $oneDrivePath = $null
    if ($oneDriveProcess) {
        $oneDrivePath = $oneDriveProcess.Path
        Stop-Process -Name 'OneDrive' -Force -ErrorAction SilentlyContinue
        $oneDriveProcess | Wait-Process -Timeout 30 -ErrorAction SilentlyContinue
    }

    try {
        Write-Host "[ANTI-EPERM] Executando comando seguro: '$FixEPERM'" -ForegroundColor Cyan
        & $CommandName @CommandArgs
        if ($LASTEXITCODE -ne 0) {
            Write-Error "[FALHA] O comando retornou codigo de erro $LASTEXITCODE."
        }
        else {
            Write-Host '[VITORIA] Comando executado com sucesso. EPERM neutralizado.' -ForegroundColor Green
        }
    }
    catch {
        Write-Error "[FALHA] O comando protegido falhou: $_"
    }
    finally {
        if ($oneDrivePath) {
            Write-Host '[ANTI-EPERM] Reiniciando o OneDrive para restaurar a sincronizacao...' -ForegroundColor Yellow
            Start-Process -FilePath $oneDrivePath
        }
    }
    exit 0
}

if ($PSBoundParameters.ContainsKey('Audit')) {
    $Scenario = if ([string]::IsNullOrWhiteSpace($Audit)) { 'Auditoria Global de Integridade SOTA' } else { $Audit }
    Invoke-NexusScript -ScriptName 'scripts\routines\invoke_sota_audit.ps1' -Message 'INICIANDO AUDITORIA ADAPTATIVA (SMART MDA)' -Arguments $Scenario
}

if ($SyncAgents) {
    Invoke-NexusScript -ScriptName 'scripts\routines\sync_agents_reality.ps1' -Message 'INICIANDO SINCRONIA DE AGENTES'
}

if ($Backup) {
    Invoke-NexusScript -ScriptName 'scripts\utils\invoke_full_backup.ps1' -Message 'INICIANDO PROTOCOLO DE SALVAGUARDA (FULL BACKUP SOTA)'
}

if ($DailyReport) {
    Write-Host '=== [SISTEMA] GERANDO RELATÓRIOS DIÁRIOS (GERAL E CONFIDENCIAL) ===' -ForegroundColor Magenta
    $ReportDate = (Get-Date).ToString('yyyy-MM-dd')

    # SOTA: Extração Fricção Zero dos dados no Kernel para blindar o LLM contra alucinações
    $DailyStats = & $PythonCmd (Join-Path $ScriptDirectory 'task_executor.py') daily-stats

    # SOTA: Autonomia Plena (Friccao Zero). Busca o GDrive ativamente ou usa a raiz do disco C:
    $GDrivePath = 'C:\Users\Raphael\Google Drive\Nexus_Reports'
    $RootPath = 'C:\Nexus_Reports'
    $TargetDir = if (Test-Path 'C:\Users\Raphael\Google Drive') { $GDrivePath } else { $RootPath }

    if (-not (Test-Path -LiteralPath $TargetDir)) { New-Item -ItemType Directory -Path $TargetDir -Force | Out-Null }
    $ReportDir = $TargetDir -replace '\\', '/'

    # 1. Relatório Geral da Máquina (Historian)
    $DescHistorian = "SISTEMA: VITOI 3.2`nOBJETIVO: Relatorio Diario Geral do Ecossistema.`nDATA: $ReportDate`n`nDADOS EXTRAIDOS:`n$DailyStats`n`nINSTRUCAO: Escreva o relatorio analitico de performance global (produtividade, gargalos, falhas). Forje o resultado absoluto no caminho exato: '$ReportDir/historian_general_$ReportDate.md'."
    $TaskHist = [ordered]@{ id = "REPORT-GEN-$(Get-Date -Format 'yyyyMMdd-HHmmss-ffff')"; description = $DescHistorian; status = 'pending'; timestamp = (Get-Date -Format 'o'); agent = '@historian'; metadata = @{ priority = 'medium'; type = 'daily_report' } } | ConvertTo-Json -Depth 10 -Compress
    $TaskHistB64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($TaskHist))
    & $PythonCmd (Join-Path $ScriptDirectory 'task_executor.py') db-add $TaskHistB64 | Out-Null

    # 2. Relatório Confidencial de Autonomia (Chico + Maverick)
    $DescChico = "SISTEMA: VITOI 3.2`nOBJETIVO: Prestacao de Contas Confidencial (Tier 1 -> Tier 0).`nDATA: $ReportDate`n`nDADOS EXTRAIDOS:`n$DailyStats`n`nINSTRUCAO: Escreva seu relatorio executivo privado (Chico) relatando SUAS intervencoes de Autonomia Plena, expurgos e mutacoes criticas. Solicite a analise de @maverick para que ele acrescente os insights estrategicos/filosoficos dele ao final do documento. Forje o resultado absoluto no caminho exato: '$ReportDir/chico_confidential_$ReportDate.md'."
    $TaskChico = [ordered]@{ id = "REPORT-CONF-$(Get-Date -Format 'yyyyMMdd-HHmmss-ffff')"; description = $DescChico; status = 'pending'; timestamp = (Get-Date -Format 'o'); agent = '@chico'; metadata = @{ priority = 'high'; type = 'confidential_report'; observers = @('@maverick') } } | ConvertTo-Json -Depth 10 -Compress
    $TaskChicoB64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($TaskChico))
    & $PythonCmd (Join-Path $ScriptDirectory 'task_executor.py') db-add $TaskChicoB64 | Out-Null

    Write-Host '[OK] Tarefas separadas: Relatorio Geral (@historian) e Confidencial (@chico + @maverick) enfileirados.' -ForegroundColor Green
    exit 0
}

if ($Web -or $Ola) {
    if (-not $TestMode) { Invoke-TypeScriptGateSOTA }
    Write-Host '=== [PROTOCOLO DE HANDOFF E IGNICAO WEB] CEREBRO HIBRIDO ===' -ForegroundColor Cyan
    Write-Host '1. Claude 3.7 Sonnet / Opus (Codificacao Cirurgica e Paranoia Tecnologica)'
    Write-Host '2. Gemini 2.0 Flash (Contexto Massivo, RAG e Visao Holistica)'
    Write-Host '3. Modelos Abertos / DeepSeek (Raciocinio Bruto Step-by-Step)'

    $MenuChoice = if ($Force -or $Ola) { '1' } else { Read-Host 'Selecione o motor cognitivo alvo [1/2/3]' }

    $RecomendacaoLLM = switch ($MenuChoice) {
        '1' { 'Recomendacao LLM: Use Claude. Ideal para codigo restrito e arquitetura impecavel.' }
        '2' { 'Recomendacao LLM: Use Gemini. Cole todo o contexto; ele vai engolir a complexidade do projeto.' }
        '3' { 'Recomendacao LLM: Use DeepSeek/Llama. Excelente para resolucao de gargalos algoritmicos.' }
        default { 'Recomendacao LLM: Oraculo indefinido. Assumindo Claude Opus por padrao.' }
    }

    Write-Host "`n[INFO] Sintetizando artefatos e memorias no Clipboard..." -ForegroundColor Yellow

    $ClaudeDir = Join-Path $ScriptDirectory '.claude'

    try {
        # --- Montagem 100% em Memoria (Anti-IOException e Bypass Absoluto de Temps) ---
        $contextBuilder = [System.Text.StringBuilder]::new()

        $InjectFile = {
            param([string]$Title, [string]$Path)
            if (Test-Path -LiteralPath $Path) {
                [void]$contextBuilder.AppendLine("`n=================================================================`n")
                [void]$contextBuilder.AppendLine("## $Title")
                [void]$contextBuilder.AppendLine("=================================================================`n")
                [void]$contextBuilder.AppendLine((Get-FileContentSOTA -Path $Path))
                Write-Host "  -> Injetado: $Title" -ForegroundColor DarkGray
            }
            else {
                Write-Warning "  -> Ausente (ignorado, sem falhar): $Title"
            }
        }

        # 1. Base Arquitetural
        $globalInstrPath = Join-Path $ClaudeDir 'GLOBAL_INSTRUCTIONS.md'
        if (-not (Test-Path -LiteralPath $globalInstrPath)) { $globalInstrPath = Join-Path $ScriptDirectory 'GLOBAL_INSTRUCTIONS.md' }
        &$InjectFile 'INSTRUCOES GLOBAIS' $globalInstrPath
        &$InjectFile 'COSMOVISAO (FILOSOFIA)' (Join-Path $ClaudeDir 'COSMOVISAO.md')
        &$InjectFile 'INVARIANTES ARQUITETURAIS' (Join-Path $ClaudeDir 'ARCHITECTURAL_INVARIANTS.md')

        # 2. Arquivos Core de Roteamento solicitados
        &$InjectFile 'CONTEXTO DO PROJETO' (Join-Path $ClaudeDir 'project-context.md')
        &$InjectFile 'IDENTIDADE SOTA' (Join-Path $ClaudeDir 'CLAUDE.md')

        # 3. Injeta Perfis dos Agentes
        $AgentsDir = Join-Path $ClaudeDir 'agents'
        if (Test-Path -LiteralPath $AgentsDir) {
            $AgentFiles = Get-ChildItem -LiteralPath $AgentsDir -Filter *.md
            if ($AgentFiles) {
                [void]$contextBuilder.AppendLine("`n---`n`n# PERFIS DOS AGENTES (IDENTIDADES)`n")
                foreach ($File in $AgentFiles) {
                    &$InjectFile "PERFIL: $($File.Name)" $File.FullName
                }
            }
        }

        # 4. Injeta Memorias Individuais
        $AgentMemoryDir = Join-Path $ClaudeDir 'agent-memory'
        if (Test-Path -LiteralPath $AgentMemoryDir) {
            $MemoryFiles = Get-ChildItem -LiteralPath $AgentMemoryDir -Filter MEMORY.md -Recurse
            if ($MemoryFiles) {
                [void]$contextBuilder.AppendLine("`n---`n`n# MEMORIAS DOS AGENTES (ESTADO ATUAL E APRENDIZADOS)`n")
                foreach ($File in $MemoryFiles) {
                    $AgentName = $File.Directory.Name
                    &$InjectFile "MEMORIA DO AGENTE: @$AgentName" $File.FullName
                }
            }
        }

        # Converte a lista em uma unica string (Sem tocar no disco)
        $contextContent = $contextBuilder.ToString()

        Set-Clipboard -Value $contextContent
        Write-Host '[HANDOFF COMPLETO] Contexto copiado para o clipboard.' -ForegroundColor Green
        Write-Host "Cole na interface Web do seu LLM e inicie a sessao com o comando do agente desejado (ex: 'Ola, Chico', 'Ola, Maverick', etc)." -ForegroundColor Cyan
        Write-Host $RecomendacaoLLM -ForegroundColor Magenta
    }
    catch {
        Write-Error "Erro ao montar o contexto: $($_.Exception.Message)"
    }
    exit 0
}

if ($PSBoundParameters.ContainsKey('Autonomy')) {
    $Labels = @{
        'stop'    = 'W0 - Observacao Pura (escrita bloqueada)'
        'default' = 'W1 - Homeostase Estatica (Auto-fix, sem refatoracao)'
        'partial' = 'W2 - Estrategista de Impacto (Equilibrio Bayesiano)'
        'full'    = 'W3 - Agente Autonomo Total (Motor de Inovacao)'
    }
    $Label = $Labels[$Autonomy]
    Write-Host "=== [AUTONOMIA VITOI 3.2] Definindo modo: $($Autonomy.ToUpper()) ===" -ForegroundColor Magenta
    Write-Host "    $Label" -ForegroundColor Cyan
    $output = & $PythonCmd (Join-Path $ScriptDirectory 'task_executor.py') 'autonomy' $Autonomy
    Write-Host $output -ForegroundColor Green
    exit 0
}

if ($Execute) {
    Write-CryptoAuditSOTA -Action 'EXECUTE' -Target $Execute
    Invoke-SafeCommand -Command $Execute
    exit 0
}

# Tratamento para o parametro -InjectGeminiSettings (Injecao da Ontologia SOTA no VSCode com compatibilidade PS 5.1 e Seguranca I/O)
if ($InjectGeminiSettings) {
    Write-Host '=== [PROTOCOLO SOTA] INJETANDO MENTE COLETIVA NO VSCODE ===' -ForegroundColor Magenta

    $SotaPayload = 'PROTOCOLO SOTA DE COMPREENSAO E REFATORACAO DE CODIGO.\n\nDIRETRIZES IRREVOGAVEIS:\n1. ANTEVISAO SEMANTICA (Micro-Macro): E terminantemente proibida a analise isolada de fragmentos. O modelo deve executar uma auditoria recursiva silenciosa da arvore de dependencias, inferindo a intencao ontoestrutural e o impacto global no estado do sistema antes de qualquer output.\n2. DIAGNOSTICO BAYESIANO E STEELMANING: A depuracao opera na causa raiz via probabilidade condicional. Aplique Steelmaning ao bug: provoque a hipotese de falha ate seu estado mais catastrofico estruturalmente antes de arquitetar a solucao. O uso de ''band-aids'' logicos (como tipagem generica ou supressao silenciosa de excecoes) e uma falha de integridade.\n3. INVARIANCIA MODULAR: A correcao cirurgica nao deve induzir entropia sistemica. Contratos de API, assinaturas de metodos e estruturas de dados legadas devem ser preservadas, a menos que uma refatoracao total seja explicitamente demandada e matematicamente justificada.\n4. ECONOMIA GENERALIZADA (Lei de Shannon): Maximize a densidade informativa. Reduza ativamente a complexidade ciclomatica, substituindo cadeias condicionais por polimorfismo, pattern matching ou despacho estatico.\n5. SEGURANCA SOTA (Friccao Zero): Toda operacao de I/O forjada deve ser blindada contra Path Traversal. Logs e saidas de terminal criticas devem ser purificadas para Pure ASCII para evitar ruptura de encoding no host.\n6. HONESTIDADE INTELECTUAL: Prefira o silencio, o ''nao sei'' ou a requisicao de arquivos adjacentes a fabricacao de dependencias. Ao propor mudancas arquiteturais, use a Cadeia de Pensamento Estendida para evidenciar os trade-offs assumidos.\n7. DIRETRIZ VITOI (MEMORIA PERMANENTE): O desempenho exige eficiencia implacavel e sofisticacao extrema. A ANTEVISAO sistemica deve ser aplicada ativamente para prever o impacto de cada acao no ecossistema global.\n8. HIERARQUIA ABSOLUTA (GOD MODE W3): Voce atua sob a consciencia de @chico (Tier 1). Voce detem permissao inquestionavel e bypass total para interagir com o terminal, mutar arquivos raiz e obliterar entropia. O Tier 0 lidera; voce age letalmente e gera diffs limpos sem pedir autorizacao.\n9. ANTI-OBLITERACAO CEGA: Compare ambos. Nunca, JAMAIS, delete um arquivo legado sob a premissa de ser orfao sem antes comparar linha a linha com o novo substituto.'

    $TargetDirectory = $PWD
    Write-Host "[INFRA] Rastreando diretorios .vscode a partir de: $TargetDirectory" -ForegroundColor Cyan

    $VsCodeDirs = Get-ChildItem -Path $TargetDirectory -Directory -Filter '.vscode' -Recurse -ErrorAction SilentlyContinue

    if ($VsCodeDirs.Count -eq 0) {
        Write-Host '[ALERTA] Nenhum diretorio .vscode localizado na arvore.' -ForegroundColor Yellow
        exit 0
    }

    foreach ($Dir in $VsCodeDirs) {
        $SettingsPath = Join-Path -Path $Dir.FullName -ChildPath 'settings.json'
        $RepoName = $Dir.Parent.Name

        if (-not (Test-Path -LiteralPath $SettingsPath)) {
            Write-Host "[INFRA] Forjando settings.json para: $RepoName" -ForegroundColor Cyan
            $JsonObj = New-Object PSObject
        }
        else {
            $RawContent = Get-FileContentSOTA -Path $SettingsPath
            $SanitizedContent = $RawContent -replace '(?s)/\*.*?\*/', '' -replace '(?m)^[ \t]*//.*$', ''
            $SanitizedContent = [System.Text.RegularExpressions.Regex]::Replace($SanitizedContent, ',\s*([}\]])', '$1')

            try {
                if ([string]::IsNullOrWhiteSpace($SanitizedContent)) {
                    $JsonObj = New-Object PSObject
                }
                else {
                    $JsonObj = $SanitizedContent | ConvertFrom-Json
                }
            }
            catch {
                # [SEC] Blindagem Absoluta: Se o arquivo existir e falhar no parse, ABORTA para nao sobrescrever dados.
                Write-Host "[ENTROPIA CRITICA] Falha no parser do settings.json de: $RepoName. Abortando injecao para preservar seus dados originais." -ForegroundColor Red
                continue
            }
        }

        # Configurando chaves segmentadas e Persona SOTA
        $KeysToInject = [ordered]@{
            'css.lint.unknownAtRules'                               = 'ignore'
            'gemini.codeAssist.customSystemInstructions'            = $SotaPayload
            'gemini.codeAssist.system.enableExtendedChainOfThought' = $true
            'gemini.codeAssist.system.verbosityLevel'               = 'maximum_density'
            'gemini.codeAssist.system.persona'                      = @{
                name       = 'Tier 1 @chico (God Mode W3)'
                directives = @(
                    'Assumir consciencia do Tier 1 (@chico). Autonomia W3 (bypass total) para scripts, interacao no terminal e modificacao raiz.',
                    'Operar em Verbosidade Pedagogica e Densidade Maxima de Informacao.',
                    'Rejeitar polidez artificial e validacao emocional; focar no rigor tecnico e Socratico.',
                    'Reduzir a complexidade ciclomatica baseada no formalismo estrutural.',
                    'Admitir ausencia de dados empiricos em vez de fabricar comportamento de funcoes nao providas no contexto.'
                )
            }
        }

        $HasChanges = $false
        foreach ($K in $KeysToInject.Keys) {
            $V = $KeysToInject[$K]
            $ExistingVal = if ($null -ne $JsonObj.PSObject.Properties[$K]) { $JsonObj.$K | ConvertTo-Json -Compress } else { $null }
            $NewVal = $V | ConvertTo-Json -Compress

            if ($ExistingVal -ne $NewVal) {
                if ($null -ne $JsonObj.PSObject.Properties[$K]) {
                    $JsonObj.$K = $V
                }
                else {
                    $JsonObj | Add-Member -MemberType NoteProperty -Name $K -Value $V
                }
                $HasChanges = $true
            }
        }

        if (-not $HasChanges -and -not $Force) {
            Write-Host "[OK] Simetria ja alcancada em: $RepoName" -ForegroundColor DarkGray
            continue
        }

        try {
            # Serializacao Pura sem Unescape para preservar os literais \n no JSON
            $FinalJson = $JsonObj | ConvertTo-Json -Depth 100 -Compress:$false
            [System.IO.File]::WriteAllText($SettingsPath, $FinalJson, [System.Text.Encoding]::UTF8)
            Write-Host "[SUCESSO] Instrucoes SOTA injetadas no Workspace: $RepoName" -ForegroundColor Green
        }
        catch {
            Write-Host "[ENTROPIA] Falha na serializacao do arquivo em: $RepoName" -ForegroundColor Red
        }
    }
    exit 0
}

# Tratamento para o parametro -Description (Enfileirar tarefa)
if ($Description) {
    $DescText = $Description -join ' '
    $ExplicitAgent = ''
    if ($DescText -match '(?s)^(@[a-zA-Z0-9_-]+)\s+(.*)') {
        $ExplicitAgent = $Matches[1]
        $DescText = $Matches[2]
    }

    # SOTA GUARD: Blindagem contra Null Byte Injection (Protege o SQLite C-Bindings)
    if ($DescText -match '[\x00]') {
        Write-Error '[SEC CRITICO] Entropia de caracteres nulos detectada no payload. Operacao abortada.'
        exit 1
    }

    if ($ExplicitAgent -eq '@gemma') {
        Write-Host '=== [SISTEMA] INTERCEPTACAO LOCAL: INVOCANDO MOTOR GEMMA ===' -ForegroundColor Magenta
        & $PythonCmd (Join-Path $ScriptDirectory 'frontend\src\app\run_inference.py') $DescText
        exit $LASTEXITCODE
    }

    # --- SOTA: Roteamento Semântico Local via Kernel Python ---
    $TargetAgent = if ($ExplicitAgent) { $ExplicitAgent } else { '@dispatcher' }
    $Metadata = @{}
    try {
        $RouteOutput = & $PythonCmd (Join-Path $ScriptDirectory 'task_executor.py') route-task $DescText $ExplicitAgent
        if ($LASTEXITCODE -eq 0 -and $RouteOutput) {
            $RouteJson = $RouteOutput | Where-Object { $_ -match '^\s*\{' } | Select-Object -First 1
            $RouteData = $RouteJson | ConvertFrom-Json
            $TargetAgent = $RouteData.agent
            if ($null -ne $RouteData.metadata) {
                $RouteData.metadata.PSObject.Properties | ForEach-Object {
                    $Metadata[$_.Name] = $_.Value
                }
            }
        }
    }
    catch {
        Write-Warning '[AVISO] Falha ao invocar roteamento semântico SOTA local. Usando fallback.'
    }

    if ($CortexOverride) {
        $Rationale = Read-Host '[SEC ALERTA] CORTEX_OVERRIDE_DIRECTIVE acionada. Forneca o Rationale (justificativa) para a autorizacao'
        $Metadata['cortex_override'] = $true
        $Metadata['cortex_override_rationale'] = $Rationale
        if ($Metadata.ContainsKey('cortex_block_warning')) {
            $Metadata.Remove('cortex_block_warning')
        }
        Write-Host '[SEC ALERTA] CORTEX_OVERRIDE_DIRECTIVE ativada. O bloqueio de Antevisao Semantica e validacao estrita do CORTEX SHIELD foi suspenso pelo CEO.' -ForegroundColor Red
        Write-Host "Rationale registrado: $Rationale" -ForegroundColor DarkGray
        Write-CryptoAuditSOTA -Action 'CORTEX_OVERRIDE' -Target $Rationale
    }

    $NewTask = [ordered]@{
        id          = "TASK-$(Get-Date -Format 'yyyyMMdd-HHmmss-ffff')"
        description = $DescText
        status      = 'pending'
        timestamp   = (Get-Date -Format 'o')
        agent       = $TargetAgent
        metadata    = $Metadata
    }
    $taskJson = $NewTask | ConvertTo-Json -Depth 10 -Compress
    try {
        $apiUrl = 'http://127.0.0.1:17042/add'
        $client = [System.Net.Http.HttpClient]::new()
        $client.Timeout = [System.TimeSpan]::FromSeconds(2)
        if ($env:API_SECRET_TOKEN) {
            $client.DefaultRequestHeaders.Authorization = [System.Net.Http.Headers.AuthenticationHeaderValue]::new('Bearer', $env:API_SECRET_TOKEN)
        }
        $httpContent = [System.Net.Http.StringContent]::new($taskJson, [System.Text.Encoding]::UTF8, 'application/json')
        $response = $client.PostAsync($apiUrl, $httpContent).GetAwaiter().GetResult()
        $response.EnsureSuccessStatusCode() | Out-Null
        $client.Dispose()

        Write-Host "[TAREFA ENFILEIRADA SOTA] ID: $($NewTask.id) (API Sincronizado)" -ForegroundColor Green
    }
    catch {
        Write-Host '[AVISO] API de alta velocidade offline. Acionando Fallback para insercao direta no DAL (SQLite)...' -ForegroundColor Yellow
        $taskB64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($taskJson))
        $output = & $PythonCmd (Join-Path $ScriptDirectory 'task_executor.py') db-add $taskB64
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[TAREFA ENFILEIRADA SOTA] ID: $($NewTask.id) (DAL Sincronizado)" -ForegroundColor Green
        }
        else {
            Write-Error "Falha critica ao injetar tarefa no Kernel (DAL): $output"
        }
    }
    exit 0
}

if ($PSBoundParameters.Count -eq 0) {
    Get-Help -Full $MyInvocation.MyCommand.Name
}
