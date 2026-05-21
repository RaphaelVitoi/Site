<#
.SYNOPSIS
    NEXUS DASHBOARD: Monitoramento em Tempo Real da Fila de Tarefas
#>

$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$QueuePath = Join-Path $ProjectRoot "queue\tasks.json"
$ArchivePath = Join-Path $ProjectRoot "logs\tasks_archived.json"

while ($true) {
    try {
        [console]::Clear()
    }
    catch {
        Clear-Host
    }
    Write-Host '==========================================================================' -ForegroundColor Cyan
    Write-Host " [DASHBOARD] NEXUS :: Visao Global do Fluxo de Trabalho | $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Yellow
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

            $archivedCount = 0
            if (Test-Path $ArchivePath) {
                $archivedRaw = Get-Content $ArchivePath -Raw -Encoding UTF8
                $archivedPayload = $archivedRaw | ConvertFrom-Json
                $archivedTasks = if ($null -ne $archivedPayload.tasks) { @($archivedPayload.tasks) } else { @() }
                $archivedCount = $archivedTasks.Count
            }

            $pending = @($tasks | Where-Object { $_.status -eq 'pending' })
            $running = @($tasks | Where-Object { $_.status -eq 'running' })
            $completed = @($tasks | Where-Object { $_.status -eq 'completed' })
            $failed = @($tasks | Where-Object { $_.status -eq 'failed' })

            $totalTasks = $tasks.Count
            $limit = 500
            $utilization = [math]::Round((($totalTasks / $limit) * 100), 1)
            $capColor = if ($utilization -ge 90) { 'Red' } elseif ($utilization -ge 75) { 'Yellow' } else { 'DarkCyan' }

            Write-Host ' [ CONCENTRACAO DE ENTROPIA ]' -ForegroundColor White
            Write-Host " [CAP] Ocupacao Fila: $totalTasks / $limit ($utilization%)" -ForegroundColor $capColor
            Write-Host " [...] Pendentes : $($pending.Count)" -ForegroundColor Gray
            Write-Host " [>>>] Rodando   : $($running.Count)" -ForegroundColor Magenta
            Write-Host " [OK]  Concluidas: $($completed.Count)" -ForegroundColor Green
            Write-Host " [ERR] Falhas    : $($failed.Count)" -ForegroundColor Red
            Write-Host " [MEM] Arquivadas: $archivedCount" -ForegroundColor DarkCyan
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
