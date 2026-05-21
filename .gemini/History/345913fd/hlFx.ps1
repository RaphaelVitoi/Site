<#
.SYNOPSIS
    NEXUS DASHBOARD: Monitoramento em Tempo Real da Fila de Tarefas
#>

$QueuePath = Join-Path $PSScriptRoot "queue\tasks.json"

while ($true) {
    Clear-Host
    Write-Host '==========================================================================' -ForegroundColor Cyan
    Write-Host ' [DASHBOARD] NEXUS :: Visao Global do Fluxo de Trabalho' -ForegroundColor Yellow
    Write-Host '==========================================================================' -ForegroundColor Cyan
    Write-Host ''

    if (-not (Test-Path $QueuePath)) {
        Write-Host '[STATUS] Fila vazia ou organismo hibernando.' -ForegroundColor DarkGray
    }
    else {
        try {
            $raw = Get-Content $QueuePath -Raw -Encoding UTF8
            $payload = $raw | ConvertFrom-Json
            $tasks = if ($null -ne $payload.tasks) { @($payload.tasks) } else { @() }

            $pending = @($tasks | Where-Object { $_.status -eq 'pending' })
            $running = @($tasks | Where-Object { $_.status -eq 'running' })
            $completed = @($tasks | Where-Object { $_.status -eq 'completed' })
            $failed = @($tasks | Where-Object { $_.status -eq 'failed' })

            Write-Host ' [ CONCENTRACAO DE ENTROPIA ]' -ForegroundColor White
            Write-Host " [...] Pendentes : $($pending.Count)" -ForegroundColor Gray
            Write-Host " [>>>] Rodando   : $($running.Count)" -ForegroundColor Magenta
            Write-Host " [OK]  Concluidas: $($completed.Count)" -ForegroundColor Green
            Write-Host " [ERR] Falhas    : $($failed.Count)" -ForegroundColor Red
            Write-Host ''

            Write-Host ' [ SINAPSES ATIVAS ]' -ForegroundColor White
            $activeTasks = @($running) + @($pending) | Select-Object -First 15
            
            if ($activeTasks.Count -eq 0) {
                Write-Host ' Nenhuma tarefa na fila de execucao.' -ForegroundColor DarkGray
            }
            else {
                foreach ($t in $activeTasks) {
                    $color = if ($t.status -eq 'running') { 'Magenta' } else { 'DarkGray' }
                    $icon = if ($t.status -eq 'running') { '[>>>]' } else { '[...]' }
                    $agent = $t.agent.PadRight(15)
                    $desc = if ($t.description.Length -gt 50) { $t.description.Substring(0, 47) + '...' } else { $t.description.PadRight(50) }
                    
                    $shortId = if ($t.id.Length -gt 18) { $t.id.Substring(0, 18) } else { $t.id.PadRight(18) }
                    $lineString = ' {0} [{1}] {2} | {3}' -f $icon, $shortId, $agent, $desc
                    Write-Host $lineString -ForegroundColor $color
                }
            }
        }
        catch {
            Write-Host '[ERRO] Leitura bloqueada pelo Mutex. Tentando novamente...' -ForegroundColor DarkYellow
        }
    }

    Write-Host ''
    Write-Host 'Atualizando a cada 3 segundos... Pressione [Ctrl+C] para sair.' -ForegroundColor DarkGray
    Start-Sleep -Seconds 3
}
