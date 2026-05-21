<#
.SYNOPSIS
    Injeta uma tarefa de teste para o @implementor (Reescrever módulo Python do Poker).
#>

$KernelPath = Join-Path $PSScriptRoot "Agent-TaskManager.psm1"
Import-Module $KernelPath -Force

Write-Host "=== TESTE DINÂMICO: IMPLEMENTOR (PYTHON) ===" -ForegroundColor Magenta

$task = [ordered]@{
    id          = "TEST-IMPL-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    description = "Reescreva o pequeno módulo Python 'hand_evaluator.py' do projeto Poker. O módulo deve conter uma classe `HandEvaluator` com um método `evaluate(cards)` que recebe uma lista de 5 strings representando cartas (ex: ['Ah', 'Kd', 'Qc', 'Js', 'Th']) e retorna uma string com a força da mão (ex: 'Straight', 'Flush', 'High Card'). Aplique princípios de Clean Code, tipagem forte (Type Hints) e inclua docstrings elegantes."
    status      = "pending"
    timestamp   = (Get-Date -Format "o")
    agent       = "@implementor"
}

Add-AgentTask -NewTask $task

Write-Host "[NEXUS] Tarefa injetada na fila. O @implementor iniciará a codificação estruturada." -ForegroundColor Green