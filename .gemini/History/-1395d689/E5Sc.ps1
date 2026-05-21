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

Write-Host "=== INICIANDO PROTOCOLO DE AUDITORIA DE AGENTES ===" -ForegroundColor Cyan

$taskId = "AUDIT-AGENTS-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
$taskDescription = @"
DIRETRIZ PARA @organizador:
Inicie uma auditoria rigorosa de consistencia de agentes em todo o nosso Cortex Documental.

FONTES PARA CRUZAMENTO DE DADOS (O Manifesto e a fonte unica de verdade):
1. `data/agents_manifest.json` (Fonte da verdade de roteamento - deve refletir os 15 Agentes IA).
2. `.claude/project-context.md` (Verificar a Secao 'Pipeline de Agentes').
3. `.claude/GLOBAL_INSTRUCTIONS.md` (Verificar a Secao 'Pipeline Harmonica').
4. `.claude/agents/*.md` (Arquivos fisicos de definicao de persona).

O QUE VOCE DEVE FAZER:
- Verifique se TODOS os 15 agentes IA estao descritos corretamente nas listas de pipeline no `project-context.md` e `GLOBAL_INSTRUCTIONS.md`.
- Se encontrar qualquer assimetria, ausencia ou redundancia, utilize o seu 'God Mode' para editar e corrigir os arquivos markdown instantaneamente.
- Ao final, ateste o conserto atualizando o log em `task_log.md` ou declarando a simetria na sua resposta final.
"@

$task = [ordered]@{ id = $taskId; description = $taskDescription; status = "pending"; timestamp = (Get-Date -Format "o"); agent = "@organizador" }

# SOTA Python DAL
$taskJson = $task | ConvertTo-Json -Depth 10 -Compress:$true
$taskB64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($taskJson))
$PyScript = Join-Path $ProjectRoot "task_executor.py"
$PythonCmd = if (Test-Path "$ProjectRoot\.venv\Scripts\python.exe") { "$ProjectRoot\.venv\Scripts\python.exe" } else { "python" }

$output = & $PythonCmd $PyScript db-add $taskB64
if ($LASTEXITCODE -ne 0) { Write-Error "Falha ao enfileirar: $output"; exit 1 }

Write-Host "[OK] Tarefa de auditoria ($taskId) enfileirada com sucesso." -ForegroundColor Green
Write-Host "[ACAO] Execute 'python .\task_executor.py worker' para o @organizador iniciar a varredura." -ForegroundColor Yellow
