# Script de Inicialização de Inovação - Maverick -> Planner
# Objetivo: Materializar o conceito da CLI Inteligente e enfileirar para planejamento técnico.

$KernelPath = Join-Path $PSScriptRoot "Agent-TaskManager.psm1"
Import-Module $KernelPath -Force

$TaskSlug = "cli-interativa"
$TaskDir = Join-Path $PSScriptRoot "docs\tasks\$TaskSlug"
$ConceptFile = Join-Path $TaskDir "CONCEPT_MAVERICK.md"

Write-Host "=== INICIANDO PROTOCOLO DE INOVAÇÃO (MAVERICK) ===" -ForegroundColor Magenta

# 1. Criar Diretório da Tarefa
if (-not (Test-Path $TaskDir)) { New-Item -ItemType Directory -Path $TaskDir -Force | Out-Null }

# 2. Maverick Elabora o Conceito (Elaboração)
$conceptContent = @"
# Conceito: A Membrana Inteligente (Smart CLI)
> Autor: @maverick | Origem: Relatório Sentinela 2026-03-12

## A Tese
Atualmente, o `do.ps1` é um canal passivo ('dumb pipe'). Ele aceita qualquer coisa e joga na fila. Isso transfere a carga cognitiva de roteamento para o sistema ou para o usuário (que precisa saber o que pedir).

Precisamos evoluir o `do.ps1` para uma **Membrana Semipermeável Inteligente**.

## A Inovação
O terminal não deve apenas receber comandos; deve **negociar** intenções.

### UX Proposta (O Dialogo)
1. **Usuário:** `.\do "quero melhorar a segurança"`
2. **Sistema (Análise de Intent):** Detecta palavras-chave de segurança.
3. **Sistema (Sugestão):** "Parece que você quer uma auditoria. Deseja acionar o @securitychief diretamente? [S/N]"
4. **Resultado:** Roteamento preciso desde a entrada, reduzindo ruído na fila.

## Isomorfismo Biológico
Assim como uma membrana celular seleciona o que entra com base em receptores, a CLI deve selecionar inputs com base em padrões conhecidos (Regex/Keywords), rejeitando entropia (inputs vazios/confusos) na porta de entrada.

## Diretrizes para o @planner
- Não use IA pesada na CLI (latência). Use heurísticas rápidas (Regex).
- Mantenha a compatibilidade com o modo não-interativo (flags `-Force`).
- O objetivo é velocidade e precisão de roteamento.
"@

[System.IO.File]::WriteAllText($ConceptFile, $conceptContent, [System.Text.Encoding]::UTF8)
Write-Host "[MAVERICK] Conceito elaborado em: $ConceptFile" -ForegroundColor Green

# 3. Enfileirar para o @planner (Execução)
$taskId = "INOVACAO-CLI-$(Get-Date -Format 'yyyyMMdd')"
$task = [ordered]@{
    id          = $taskId
    description = "Planejar e especificar a 'CLI Inteligente' (Smart do.ps1) baseada no conceito do Maverick. O objetivo é criar um roteador interativo no terminal PowerShell."
    status      = "pending"
    timestamp   = (Get-Date -Format "o")
    agent       = "@planner"
    metadata    = @{
        slug = $TaskSlug
    }
}
Add-AgentTask -NewTask $task
Write-Host "[KERNEL] Tarefa de planejamento enfileirada: $taskId" -ForegroundColor Cyan