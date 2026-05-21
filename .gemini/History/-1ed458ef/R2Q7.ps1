<#
.SYNOPSIS
    Garante a homeostase do `project-context.md`, o coracao documental do sistema.
.DESCRIPTION
    Este script aciona o @organizador com uma diretriz clara para auditar e sincronizar
    o `project-context.md` com a realidade atual do sistema, prevenindo a obsolescencia
    e garantindo que todos os agentes operem com a fonte da verdade mais recente.
    Deve ser executado periodicamente pelo @skillmaster ou manualmente após grandes mudanças.
#>

$ProjectRoot = Split-Path $PSScriptRoot -Parent
$EnvPath = Join-Path $ProjectRoot "_env.ps1"
if (Test-Path $EnvPath) { . $EnvPath }

$KernelPath = if ($Global:AgentPaths) { $Global:AgentPaths.Kernel } else { Join-Path $ProjectRoot "Agent-TaskManager.psm1" }

try {
    Import-Module $KernelPath -Force -DisableNameChecking -ErrorAction Stop
}
catch {
    Write-Host "[CRITICAL] Erro ao carregar o Kernel. Detalhes: $_" -ForegroundColor Red
    Write-Host "Caminho tentado: $KernelPath" -ForegroundColor DarkGray
    exit 1
}

Write-Host "=== INICIANDO PROTOCOLO DE SINCRONIA DOCUMENTAL ===" -ForegroundColor Cyan

$taskId = "MAINT-CONTEXT-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
$taskDescription = @"
DIRETRIZ PARA @organizador:
O arquivo `project-context.md` esta em risco de obsolescencia.
Sua tarefa e realizar uma auditoria completa e atualiza-lo para refletir o ESTADO DA ARTE do sistema.

CHECKLIST DE VERIFICACAO OBRIGATORIA:
1.  **Fila de Tarefas:** Confirme que a referencia e ao banco de dados `tasks.db` (SQLite) e que a mencao ao `tasks.json` foi erradicada.
2.  **Pipeline de Ingestao:** Verifique se o protocolo `do.ps1 -Ingest` esta documentado como o metodo para fechar o loop de friccao.
3.  **Contagem de Agentes:** Valide o numero total de entidades (atualmente 18: 3 lideres + 15 especialistas).
4.  **Stack Tecnologica:** Assegure que a stack (Python DAL, PS1, SQLite, Next.js 16) esta corretamente descrita.
5.  **Leis e Principios:** Garanta que o documento reflete os principios mais recentes do `MODUS_OPERANDI.md`.

Execute a reescrita do arquivo para garantir a simetria perfeita.
"@

$task = [ordered]@{
    id          = $taskId
    description = $taskDescription
    status      = "pending"
    timestamp   = (Get-Date -Format "o")
    agent       = "@organizador"
}

Add-AgentTask -NewTask $task

Write-Host "[OK] Tarefa de sincronia ($taskId) enfileirada para o @organizador." -ForegroundColor Green
Write-Host "[ACAO RECOMENDADA] Execute 'python .\task_executor.py worker' para que o @organizador cumpra a diretriz." -ForegroundColor Yellow