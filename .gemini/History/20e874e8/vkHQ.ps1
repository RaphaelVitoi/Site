# Script de Injeção de Missão Crítica - Autopoiese de Design
# Objetivo: Delegar a descoberta do método perfeito de transposição de UI/UX para background.

$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$KernelPath = Join-Path $ProjectRoot "Agent-TaskManager.psm1"
Import-Module $KernelPath -Force

Write-Host "=== INICIANDO PROTOCOLO DE INVESTIGAÇÃO PROFUNDA (BACKGROUND) ===" -ForegroundColor Magenta

$taskId = "RESEARCH-DESIGN-$(Get-Date -Format 'yyyyMMddHHmm')"
$taskDescription = "Missão Crítica de UI/UX: As tentativas de transpor o design legacy (HTML/CSS 'Masterpiece', Glassmorphism de 24px blur, luzes neon, física cubic-bezier) usando Tailwind puro ou Global CSS falharam em manter a simetria exata no Next.js. O usuário rejeitou os resultados. PESQUISE profundamente e descubra uma abordagem inquebrável para o Next.js (ex: CSS Modules estritos, encapsulamento de estilos, Tailwind Plugins customizados para recriar as classes exatas do legacy, etc). O resultado deve garantir fidelidade visual de 100% sem conflitos. Documente a solução descoberta passo a passo para o implementor."

$task = [ordered]@{
    id          = $taskId
    description = $taskDescription
    status      = "pending"
    timestamp   = (Get-Date -Format "o")
    agent       = "@pesquisador"
    priority    = "high"
    metadata    = @{
        origin  = "Ordem executiva do CEO via @chico"
        feature = "Masterpiece Design Transposition"
    }
}

Add-AgentTask -NewTask $task
Write-Host "[NEXUS] Missão injetada com sucesso. O @pesquisador assumirá em background." -ForegroundColor Cyan
Write-Host "Lembre-se de manter o Orquestrador rodando ('start-worker' no nexus-hub) para que o agente processe isso."