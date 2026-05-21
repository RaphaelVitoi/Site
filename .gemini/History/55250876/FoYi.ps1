<#
.SYNOPSIS
    Injeta a tarefa inicial de materialização do site para o @implementor.
#>

$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path

Write-Host "=== PROTOCOLO: MATERIALIZAÇÃO DO SITE (GREENFIELD) ===" -ForegroundColor Magenta

$task = [ordered]@{
    id          = "SITE-IMPL-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    description = "Acesse e leia a especificação em '.claude/SPEC_ROTEAMENTO_DB.md'. Em cenário Greenfield, execute rigorosamente o 'Plano de Execução' descrito na seção 3: 1) Entrar no diretório frontend e instalar dependências do Prisma; 2) Inicializar o Prisma; 3) Materializar o schema.prisma com o modelo Post; 4) Criar a estrutura de pastas e rotas iniciais vazias do Next.js App Router e componentes. Use sua Autoridade Suprema para rodar comandos e forjar os arquivos."
    status      = "pending"
    timestamp   = (Get-Date -Format "o")
    agent       = "@implementor"
}

# SOTA Python DAL Injection
$taskJson = $task | ConvertTo-Json -Depth 10 -Compress:$true
$taskB64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($taskJson))

$PyScript = Join-Path $ProjectRoot "task_executor.py"
$PythonCmd = if (Test-Path "$ProjectRoot\.venv\Scripts\python.exe") { "$ProjectRoot\.venv\Scripts\python.exe" } else { "python" }

$output = & $PythonCmd $PyScript db-add $taskB64
if ($LASTEXITCODE -ne 0) { Write-Error "Falha ao enfileirar: $output" }
else { Write-Host "[NEXUS] Tarefa materializada e delegada ao @implementor via SQLite." -ForegroundColor Green }