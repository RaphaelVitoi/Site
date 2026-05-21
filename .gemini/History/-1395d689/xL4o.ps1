<#
.SYNOPSIS
    Garante a simetria absoluta do ecossistema de agentes.
.DESCRIPTION
    Aciona o @organizador para cruzar os dados de intentmap.json, 
    project-context.md, GLOBAL_INSTRUCTIONS.md e a pasta agents/,
    corrigindo eventuais omissoes documentais (ex: novos agentes).
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

Write-Host "=== INICIANDO PROTOCOLO DE AUDITORIA DE AGENTES ===" -ForegroundColor Cyan

$taskId = "AUDIT-AGENTS-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
$taskDescription = @"
DIRETRIZ PARA @organizador:
Inicie uma auditoria rigorosa de consistência de agentes em todo o nosso Córtex Documental.

FONTES PARA CRUZAMENTO DE DADOS:
1. `data/intentmap.json` (Fonte da verdade de roteamento - deve refletir a Triade + 15 Especialistas = 18 entidades).
2. `.claude/project-context.md` (Verificar a Secao 'Pipeline de Agentes').
3. `.claude/GLOBAL_INSTRUCTIONS.md` (Verificar a Secao 'Pipeline Harmonica').
4. `.claude/agents/*.md` (Arquivos fisicos de definicao de persona).

O QUE VOCE DEVE FAZER:
- Verifique se TODOS os 18 agentes estao descritos nas listas de pipeline no `project-context.md` e `GLOBAL_INSTRUCTIONS.md`. (Recentemente o @seo e @bibliotecario foram adicionados, garanta que nao foram esquecidos no meio das documentacoes).
- Se encontrar qualquer assimetria, ausencia ou redundancia, utilize o seu 'God Mode' para editar e corrigir os arquivos markdown instantaneamente.
- Ao final, ateste o conserto atualizando o log em `task_log.md` ou declarando a simetria na sua resposta final.
"@

$task = [ordered]@{ id = $taskId; description = $taskDescription; status = "pending"; timestamp = (Get-Date -Format "o"); agent = "@organizador" }
Add-AgentTask -NewTask $task

Write-Host "[OK] Tarefa de auditoria ($taskId) enfileirada com sucesso." -ForegroundColor Green
Write-Host "[ACAO] Execute 'python .\task_executor.py worker' para o @organizador iniciar a varredura." -ForegroundColor Yellow