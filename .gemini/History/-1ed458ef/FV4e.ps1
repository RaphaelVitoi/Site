<#
.SYNOPSIS
    Garante a homeostase do `project-context.md`, o coração documental do sistema.
.DESCRIPTION
    Este script aciona o @organizador com uma diretriz clara para auditar e sincronizar
    o `project-context.md` com a realidade atual do sistema, prevenindo a obsolescência
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
O arquivo `project-context.md` está em risco de obsolescência.
Sua tarefa é realizar uma auditoria completa e atualizá-lo para refletir o ESTADO DA ARTE do sistema.

CHECKLIST DE VERIFICAÇÃO OBRIGATÓRIA:
1.  **Fila de Tarefas:** Confirme que a referência é ao banco de dados `tasks.db` (SQLite) e que a menção ao `tasks.json` foi erradicada.
2.  **Pipeline de Ingestão:** Verifique se o protocolo `do.ps1 -Ingest` está documentado como o método para fechar o loop de fricção.
3.  **Contagem de Agentes:** Valide o número total de entidades (atualmente 18: 3 líderes + 15 especialistas).
4.  **Stack Tecnológica:** Assegure que a stack (Python DAL, PS1, SQLite, Next.js 16) está corretamente descrita.
5.  **Leis e Princípios:** Garanta que o documento reflete os princípios mais recentes do `MODUS_OPERANDI.md`.

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
Write-Host "[AÇÃO RECOMENDADA] Execute 'python .\task_executor.py worker' para que o @organizador cumpra a diretriz." -ForegroundColor Yellow