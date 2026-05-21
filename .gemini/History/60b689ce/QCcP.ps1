<#
.SYNOPSIS
    Orquestra o protocolo de Handoff SOTA para encerrar uma sessão de trabalho.
.DESCRIPTION
    Automatiza a síntese da sessão, registro perpétuo, backup e preparação do
    prompt de continuidade para a próxima sessão.
#>

$ProjectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$PythonCmd = if (Test-Path "$ProjectRoot\.venv\Scripts\python.exe") { "$ProjectRoot\.venv\Scripts\python.exe" } else { 'python' }
$Executor = Join-Path $ProjectRoot 'task_executor.py'

Write-Host '=== INICIANDO PROTOCOLO DE HANDOFF SOTA ===' -ForegroundColor Magenta

# 1. Coletar dados da sessão (últimas 8 horas)
Write-Host '[1/4] Coletando telemetria da sessão atual...' -ForegroundColor Cyan
$recentTasksJson = & $PythonCmd $Executor db-get --since 8h --json
if ($LASTEXITCODE -ne 0) {
    Write-Warning 'Não foi possível obter as tarefas recentes. A síntese pode ser incompleta.'
    $recentTasksJson = '{"error": "Failed to retrieve recent tasks"}'
}

# 2. Enfileirar tarefa de síntese para o @historian
Write-Host '[2/4] Delegando síntese e registro para o @historian...' -ForegroundColor Cyan
$handoffTaskId = "HANDOFF-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
$handoffTaskDesc = @"
DIRETRIZ DE HANDOFF SOTA (FIM DE SESSÃO):
Sua missão é criar o registro de transição para a próxima sessão.

1.  **ANALISE DE SESSÃO:** Analise o JSON de tarefas recentes abaixo para entender o que foi feito hoje.
    ```json
    $recentTasksJson
    ```
2.  **SÍNTESE E APRENDIZADO:** Escreva um resumo denso e informativo em Markdown, cobrindo:
    -   Principais realizações e refatorações.
    -   Decisões arquiteturais tomadas.
    -   Lições aprendidas e novas invariantes (se houver).
3.  **REGISTRO PERPÉTUO:** Salve este relatório no seguinte caminho, usando o God Mode:
    `Arquivo: .claude/handoffs/handoff_$(Get-Date -Format 'yyyy-MM-dd_HH-mm').md`
4.  **MEMÓRIA DO KERNEL:** Crie uma síntese de 3-4 linhas do handoff e use o God Mode para **adicionar (append)** ao final do arquivo de memória do @chico:
    `Arquivo: .claude/agent-memory/chico/MEMORY.md`
    (Use lógica de leitura e reescrita para garantir que está adicionando, não sobrescrevendo).
"@

$task = @{ id = $handoffTaskId; description = $handoffTaskDesc; status = 'pending'; timestamp = (Get-Date -Format 'o'); agent = '@historian'; metadata = @{ priority = 'high' } }
$taskJson = $task | ConvertTo-Json -Depth 10 -Compress
$taskB64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($taskJson))
& $PythonCmd $Executor db-add $taskB64 | Out-Null
Write-Host "[OK] Tarefa de síntese ($handoffTaskId) enfileirada." -ForegroundColor Green

# 3. Acionar backup do sistema
Write-Host '[3/4] Acionando Protocolo de Salvaguarda...' -ForegroundColor Cyan
& (Join-Path $ProjectRoot 'do.ps1') -Backup

# 4. Preparar prompt de continuidade
Write-Host '[4/4] Gerando prompt de continuidade e copiando para o clipboard...' -ForegroundColor Cyan
& (Join-Path $ProjectRoot 'do.ps1') -Web -Force # -Force para pular a seleção de menu

Write-Host "`n[SUCESSO] Protocolo de Handoff concluído. O prompt de continuidade está no seu clipboard." -ForegroundColor Magenta