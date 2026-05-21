<#
.SYNOPSIS
    Aciona o gatilho de reflexao em massa (Despertar Cognitivo) para todos os agentes.
.DESCRIPTION
    Enfileira uma tarefa especifica para cada um dos agentes operacionais,
    obrigando-os a ler, analisar, inovar e reescrever sua propria memoria (MEMORY.md)
    com base no Estado da Arte atual do ecossistema.
#>

$ProjectRoot = Split-Path $PSScriptRoot -Parent
$EnvPath = Join-Path $ProjectRoot "_env.ps1"
if (Test-Path $EnvPath) { . $EnvPath }

$ManifestPath = Join-Path $ProjectRoot "data\agents_manifest.json"
if (-not (Test-Path $ManifestPath)) {
    Write-Error "CRITICAL: O Manifesto dos Agentes (agents_manifest.json) nao foi encontrado."
    exit 1
}
$AgentManifest = Get-Content $ManifestPath -Raw | ConvertFrom-Json
$Agents = $AgentManifest.PSObject.Properties.Name

$PyScript = Join-Path $ProjectRoot "task_executor.py"
$PythonCmd = if (Test-Path "$ProjectRoot\.venv\Scripts\python.exe") { "$ProjectRoot\.venv\Scripts\python.exe" } else { "python" }

Write-Host "=== INICIANDO DESPERTAR COGNITIVO EM MASSA (AUTOPOIESE) ===" -ForegroundColor Cyan

foreach ($agent in $Agents) {
    $agentId = "@$agent"
    $taskId = "REFLECT-$agent-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    
    $taskDesc = "DIRETRIZ DE AUTOPOIESE PROFUNDA: Analise o seu proprio arquivo MEMORY.md atual e o contexto do projeto. Com base na nossa recente evolucao para o Estado da Arte (Migracao para banco SQLite SOTA, Pipeline de Ingestao de Friccao Zero, 15 Agentes IA), voce deve atualizar, adaptar, corrigir e INOVAR a sua propria memoria. Refine suas 'Competencias'. Preencha a secao de 'Sinergia e Harmonia' descrevendo como voce se relaciona com os outros na nova Pipeline. Elabore 'Propostas Democraticas' perspicazes e filosoficas para a melhoria do ecossistema. Utilize o seu God Mode para reescrever fisicamente o arquivo .claude/agent-memory/$agent/MEMORY.md por completo, tornando-o uma obra de arte intelectual."

    $task = [ordered]@{ id = $taskId; description = $taskDesc; status = "pending"; timestamp = (Get-Date -Format "o"); agent = $agentId }
    
    $taskJson = $task | ConvertTo-Json -Depth 10 -Compress:$true
    $taskB64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($taskJson))
    
    $output = & $PythonCmd $PyScript db-add $taskB64
    if ($LASTEXITCODE -ne 0) { Write-Error "Falha ao enfileirar para $agentId: $output"; continue }
    Write-Host "  + Semente de reflexao plantada na mente de $agentId" -ForegroundColor Yellow
}

Write-Host "`n[OK] O gatilho foi acionado. A autopoiese comecara assim que o Orquestrador for iniciado." -ForegroundColor Green
Write-Host "[ACAO] Execute 'python .\task_executor.py worker' para iniciar a revolucao." -ForegroundColor DarkGray