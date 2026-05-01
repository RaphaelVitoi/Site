<#
.SYNOPSIS
    Injeta uma tarefa de teste para o @implementor (Reescrever modulo Python do Poker).
#>

# [REMOVIDO] Agent-TaskManager.psm1 nao existe mais
# $KernelPath = Join-Path $PSScriptRoot "Agent-TaskManager.psm1"
# Import-Module $KernelPath -Force

Write-Host "=== TESTE DINAMICO: IMPLEMENTOR (PYTHON) ===" -ForegroundColor Magenta

$task = [ordered]@{
    id          = "TEST-IMPL-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    description = "Reescreva o pequeno modulo Python 'hand_evaluator.py' do projeto Poker. O modulo deve conter uma classe `HandEvaluator` com um metodo `evaluate(cards)` que recebe uma lista de 5 strings representando cartas (ex: ['Ah', 'Kd', 'Qc', 'Js', 'Th']) e retorna uma string com a forca da mao (ex: 'Straight', 'Flush', 'High Card'). Aplique principios de Clean Code, tipagem forte (Type Hints) e inclua docstrings elegantes."
    status      = "pending"
    timestamp   = (Get-Date -Format "o")
    agent       = "@implementor"
}

Add-AgentTask -NewTask $task

Write-Host "[NEXUS] Tarefa injetada na fila. O @implementor iniciara a codificacao estruturada." -ForegroundColor Green
