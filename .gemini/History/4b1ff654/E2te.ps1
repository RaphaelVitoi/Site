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
.PARAMETER Execute
    Um comando PowerShell a ser executado diretamente. Este comando passara
    pelo Protocolo de Exclusao Segura.
.PARAMETER Chaos
    Aciona a Engenharia do Caos (chaos-core.ts) para testar a resiliencia da infraestrutura.
.PARAMETER FixEPERM
    Executa o protocolo implacável do Chico para aniquilar o OneDrive e processos Node travados, resolvendo o erro EPERM.
#>
[CmdletBinding()]
. $PSScriptRoot\scripts\utils\logging.ps1
param (
    [string]$Description,
    [switch]$Web,
    [string]$Execute,
    [switch]$Chaos,
    [string]$FixEPERM,
    [switch]$Force,
    [ValidateSet('low', 'medium', 'high', 'gto')]
    [string]$Intensity = 'low',
    [ValidateSet('worker', 'frontend')]
    [string]$Target = 'worker',
    [switch]$Setup
)

# Constantes e Configuracoes (PURE ASCII, sem UTF-8)
$ScriptDirectory = Split-Path -Parent $MyInvocation.MyCommand.Definition
$ContextAssemblerPath = Join-Path $ScriptDirectory "scripts\routines\Invoke-ContextAssembler.ps1"
$MemoryBasePath = Join-Path $ScriptDirectory ".claude\agent-memory"

# --- Funcoes Core ---

# Protocolo de Exclusao Segura (Implementado por @maverick)
function Invoke-SafeCommand {
    [CmdletBinding()]
    param (
        [Parameter(Mandatory = $true)]
        [string]$Command
    )

    # Abordagem de Allowlist: Apenas comandos explicitamente seguros sao permitidos.
    $AllowedCommands = @(
        'Get-Process',
        'Get-Service',
        'Get-ChildItem',
        'ls',
        'dir',
        'Get-Help',
        'echo',
        'Write-Host'
    )

    $CommandName = $Command.Split(' ')[0]

    if ($CommandName -in $AllowedCommands) {
        Write-Host "[INFO] Executando comando seguro (Allowlist): $Command" -ForegroundColor Cyan
        Invoke-Expression $Command
        return $true
    }
    else {
        Write-Error "Comando '$CommandName' bloqueado. Apenas comandos na lista de permissões (allowlist) podem ser executados via -Execute para garantir a seguranca do sistema."
        return $false
    }
}

function Invoke-ContextAssembler {
    # Stub para a funcao Invoke-ContextAssembler, caso o script nao seja fornecido.
    # Em um ambiente real, este modulo seria carregado dinamicamente.
    # Por simplicidade e conformidade com Cortex Shield, se o script nao existe, faremos um stub.
    
    if (Test-Path $ContextAssemblerPath) {
        . $ContextAssemblerPath
        return Invoke-ContextAssembler @args
    }
    else {
        Write-Warning "scripts/routines/Invoke-ContextAssembler.ps1 nao encontrado. Funcionalidade de montagem de contexto otimizada nao disponivel."

        # Retorna o contexto simples, sem otimizacao e tratamento de Encoding
        $GlobalInstructions = Get-Content -Path (Join-Path $ScriptDirectory "GLOBAL_INSTRUCTIONS.md") -Raw
        $ClaudeIdentity = Get-Content -Path (Join-Path $ScriptDirectory ".claude" "CLAUDE.md") -Raw
        $ProjectContext = if (Test-Path (Join-Path $ScriptDirectory ".claude" "project-context.md")) { Get-Content -Path (Join-Path $ScriptDirectory ".claude" "project-context.md") -Raw } else { "" }
        
        $DirectivesPath = Join-Path $ScriptDirectory ".claude\directives"
        $Directives = ""
        if (Test-Path $DirectivesPath) {
            $Directives = Get-ChildItem -Path $DirectivesPath -Filter "*.md" | ForEach-Object { Get-Content $_.FullName -Raw } | Out-String
        }

        return @"
=== DIRETRIZES UNIVERSAIS DE COMPORTAMENTO ===
$Directives`n
=== CONTEXTO GLOBAL ===
$GlobalInstructions`n=== IDENTIDADE DO USUARIO (Raphael Vitoi) ===
$ClaudeIdentity`n=== CONTEXTO DO PROJETO ===
$ProjectContext
"@
    }
}


# --- Logica Principal ---

# Tratamento para o parametro -Setup (Instalacao/Atualizacao do Ecossistema)
if ($Setup) {
    Write-Host "=== [SISTEMA] INICIANDO PROTOCOLO DE INSTALACAO/ATUALIZACAO DO PERFIL NEXUS ===" -ForegroundColor Magenta
    $SetupScript = Join-Path $ScriptDirectory "scripts\setup\Setup-NexusProfile.ps1"
    & $SetupScript
    Write-Host "[ALERTA] A instalacao foi concluida. Para que os comandos globais funcionem, voce DEVE fechar este terminal e abrir um novo." -ForegroundColor Yellow
    exit 0
}

# Tratamento para o parametro -Chaos (Engenharia SOTA)
if ($Chaos) {
    Write-Host "=== [PROTOCOLO DE ENTROPIA] ENGENHARIA DO CAOS ===" -ForegroundColor Red
    Write-Host "  > Nivel de Intensidade : $Intensity" -ForegroundColor Yellow
    Write-Host "  > Alvo da Infeccao     : $Target" -ForegroundColor Yellow
    Write-Host "---------------------------------------------------" -ForegroundColor DarkGray

    # Friccao de Ecossistema: Forcamos o Node a entender modulos CommonJS no Windows para o Chaos
    $env:TS_NODE_COMPILER_OPTIONS = '{"module":"CommonJS"}'
    
    # Invoca o caos on-the-fly
    $ChaosScript = Join-Path $ScriptDirectory "scripts\tests\chaos-core.ts"
    if (-not (Test-Path $ChaosScript)) {
        Write-Error "[FAIL] O motor de Engenharia do Caos nao foi encontrado em: $ChaosScript. Certifique-se de cria-lo antes de acionar a infeccao."
        exit 1
    }
    Invoke-Expression "npx ts-node `"$ChaosScript`" --intensity $Intensity --target $Target"
    exit 0
}

# Tratamento para o parametro -FixEPERM (Anti-Entropia)
if ($PSBoundParameters.ContainsKey('FixEPERM')) {
    Write-Host "=== [PROTOCOLO ANTI-EPERM] CHICO NO CONTROLE ===" -ForegroundColor Red

    if ([string]::IsNullOrWhiteSpace($FixEPERM)) {
        Write-Error "O parametro -FixEPERM agora requer um comando para ser executado. Ex: -FixEPERM 'npm install'"
        exit 1
    }

    # 1. Pausa os processos que causam lock
    Write-Host "[ANTI-EPERM] Aniquilando processos Node zumbis..." -ForegroundColor Yellow
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force

    Write-Host "[ANTI-EPERM] Pausando sincronizacao do OneDrive para evitar locks..." -ForegroundColor Yellow
    $oneDriveProcess = Get-Process -Name "OneDrive" -ErrorAction SilentlyContinue
    $oneDrivePath = $null
    if ($oneDriveProcess) {
        $oneDrivePath = $oneDriveProcess.Path
        Stop-Process -Name "OneDrive" -Force -ErrorAction SilentlyContinue
        $oneDriveProcess | Wait-Process -Timeout 30 -ErrorAction SilentlyContinue
    }

    # 2. Executa o comando protegido
    try {
        Write-Host "[ANTI-EPERM] Executando comando protegido: '$FixEPERM'" -ForegroundColor Cyan
        Invoke-Expression $FixEPERM
        Write-Host "[VITORIA] Comando executado com sucesso. EPERM neutralizado." -ForegroundColor Green
    }
    catch {
        Write-Error "[FALHA] O comando protegido falhou: $_"
    }
    finally {
        # 3. Reinicia o OneDrive
        if ($oneDrivePath) {
            Write-Host "[ANTI-EPERM] Reiniciando o OneDrive para restaurar a sincronizacao..." -ForegroundColor Yellow
            Start-Process -FilePath $oneDrivePath
        }
    }
    exit 0
}

# Tratamento para o parametro -Web (Handoff para LLM Web)
if ($Web) {
    Write-Host "=== [PROTOCOLO DE HANDOFF WEB] CEREBRO HIBRIDO ===" -ForegroundColor Cyan
    Write-Host "1. Claude 3.5 Sonnet / Opus (Codificacao Cirurgica e Paranoia Tecnologica)"
    Write-Host "2. Gemini 1.5 Pro / Advanced (Contexto Massivo, RAG e Visao Holistica)"
    Write-Host "3. Modelos Abertos / DeepSeek (Raciocinio Bruto Step-by-Step)"
    
    $MenuChoice = Read-Host "Selecione o motor cognitivo alvo [1/2/3]"
    
    $RecomendacaoLLM = switch ($MenuChoice) {
        '1' { "Recomendacao LLM: Use Claude. Ideal para codigo restrito e arquitetura impecavel." }
        '2' { "Recomendacao LLM: Use Gemini. Cole todo o contexto; ele vai engolir a complexidade do projeto." }
        '3' { "Recomendacao LLM: Use DeepSeek/Llama. Excelente para resolucao de gargalos algoritmicos." }
        default { "Recomendacao LLM: Oraculo indefinido. Assumindo Claude Opus por padrao." }
    }
    
    Write-Host "`n[INFO] Sintetizando artefatos e memorias no Clipboard..." -ForegroundColor Yellow

    # Validar os caminhos dos arquivos antes de invocar o script
    if (-not (Test-Path (Join-Path $ScriptDirectory "GLOBAL_INSTRUCTIONS.md"))) { Write-Error "Arquivo GLOBAL_INSTRUCTIONS.md nao encontrado."; exit 1 }
    if (-not (Test-Path (Join-Path $ScriptDirectory ".claude" "CLAUDE.md"))) { Write-Error "Arquivo CLAUDE.md nao encontrado."; exit 1 }
    if (-not (Test-Path (Join-Path $ScriptDirectory ".claude" "project-context.md"))) { Write-Warning "Arquivo project-context.md nao encontrado. Contexto do projeto omitido." }

    try {
        # Invoca o script para montar o contexto
        $contextContent = Invoke-ContextAssembler -GlobalInstructionsPath (Join-Path $ScriptDirectory "GLOBAL_INSTRUCTIONS.md") -ClaudeIdentityPath (Join-Path $ScriptDirectory ".claude" "CLAUDE.md") -ProjectContextPath (Join-Path $ScriptDirectory ".claude" "project-context.md") -LLMRecommendation $RecomendacaoLLM
    }
    catch {
        Write-Error "Erro ao montar o contexto: $($_.Exception.Message)"
    }

    Set-Clipboard -Value $contextContent
    Write-Host "[HANDOFF COMPLETO] Contexto copiado para o clipboard. Cole na interface Web do seu LLM e diga 'Ola, Chico'." -ForegroundColor Green
    Write-Host $RecomendacaoLLM -ForegroundColor Magenta
    exit 0
}

# Tratamento para o parametro -Execute (Execucao de comando segura)
if ($Execute) {
    Invoke-SafeCommand -Command $Execute
    exit 0
}

# Tratamento para o parametro -Description (Enfileirar tarefa)
if ($Description) {
    # Roteamento Absoluto SOTA: Detecta se o usuario forcou um agente especifico
    $TargetAgent = "@dispatcher"
    if ($Description -match '(?s)^(@[a-zA-Z0-9_-]+)\s+(.*)') {
        $TargetAgent = $Matches[1]
        $Description = $Matches[2]
    }

    $NewTask = [ordered]@{
        id          = "TASK-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
        description = $Description
        status      = "pending"
        timestamp   = (Get-Date -Format "o")
        agent       = $TargetAgent
    }
    $taskJson = $NewTask | ConvertTo-Json -Depth 10 -Compress
    try {
        $apiUrl = "http://127.0.0.1:17042/add"
        $headers = @{ "Content-Type" = "application/json" }
        Invoke-WebRequest -Uri $apiUrl -Method Post -Body $taskJson -Headers $headers -UseBasicParsing -TimeoutSec 2 | Out-Null

        Write-Host "[TAREFA ENFILEIRADA SOTA] ID: $($NewTask.id) (API Sincronizado)" -ForegroundColor Green
    }
    catch {
        Write-Host "[AVISO] API de alta velocidade offline. Acionando Fallback para insercao direta no DAL (SQLite)..." -ForegroundColor Yellow
        $taskB64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($taskJson))
        $PyScript = Join-Path $ScriptDirectory "task_executor.py"
        $PythonCmd = if (Test-Path "$ScriptDirectory\.venv\Scripts\python.exe") { "$ScriptDirectory\.venv\Scripts\python.exe" } else { "python" }
            
        $output = & $PythonCmd $PyScript db-add $taskB64
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[TAREFA ENFILEIRADA SOTA] ID: $($NewTask.id) (DAL Sincronizado)" -ForegroundColor Green
        }
        else {
            Write-Error "Falha critica ao injetar tarefa no Kernel (DAL): $output"
        }
    }
    exit 0
}

# Se nenhum parametro for fornecido, mostra a ajuda
if (-not $PSBoundParameters.ContainsKey('Description') -and `
        -not $PSBoundParameters.ContainsKey('Web') -and `
        -not $PSBoundParameters.ContainsKey('Execute') -and `
        -not $PSBoundParameters.ContainsKey('Chaos') -and `
        -not $PSBoundParameters.ContainsKey('FixEPERM')) {

    Get-Help -Full $MyInvocation.MyCommand.Name
}
