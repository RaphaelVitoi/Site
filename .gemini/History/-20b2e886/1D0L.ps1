<#
.SYNOPSIS
    O Relogio Biologico do Sistema. Executa rotinas de manutencao agendadas.
.DESCRIPTION
    Este script e a encarnacao do @skillmaster. Ele le o arquivo de configuracao
    'skillmaster_config.json', monitora as tarefas agendadas e as executa nos
    intervalos definidos, garantindo a homeostase e saude do ecossistema.
#>

$ProjectRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$ConfigPath = Join-Path $PSScriptRoot "skillmaster_config.json"
$StatePath = Join-Path $PSScriptRoot ".skillmaster_state.json" # Arquivo para guardar o estado da ultima execucao

if (-not (Test-Path $ConfigPath)) {
    Write-Error "[SKILLMASTER] CRITICAL: Arquivo de configuracao 'skillmaster_config.json' nao encontrado."
    exit 1
}

# Carrega o estado anterior ou cria um novo
$State = @{}
if (Test-Path $StatePath) {
    $State = Get-Content $StatePath | ConvertFrom-Json
}

Write-Host "=== [SKILLMASTER] RELOGIO BIOLOGICO INICIADO ===" -ForegroundColor DarkYellow
Write-Host "[SKILLMASTER] Monitorando tarefas agendadas em '$ConfigPath'..." -ForegroundColor Cyan

while ($true) {
    try {
        $Config = Get-Content $ConfigPath | ConvertFrom-Json
        $Now = Get-Date

        foreach ($job in $Config.jobs) {
            if (-not $job.active) {
                continue
            }

            $jobId = $job.id
            $lastRun = [DateTime]"1970-01-01" # Default to a long time ago
            if ($State.$jobId) {
                $lastRun = [DateTime]$State.$jobId.lastRun
            }

            $interval = New-TimeSpan -Hours $job.intervalHours
            $nextRun = $lastRun.Add($interval)

            if ($Now -ge $nextRun) {
                Write-Host "`n[SKILLMASTER] Acionando tarefa agendada: '$jobId'..." -ForegroundColor Green
                
                # Substitui a variavel de ambiente no comando e executa
                $commandToRun = $job.command.Replace('$ProjectRoot', $ProjectRoot)
                Invoke-Expression $commandToRun
                
                Write-Host "[SKILLMASTER] Tarefa '$jobId' executada com sucesso." -ForegroundColor Green

                # Atualiza o estado
                $State.$jobId = @{ lastRun = $Now.ToString("o") }
            }
        }

        # Salva o estado atual
        $State | ConvertTo-Json | Out-File $StatePath -Encoding UTF8
    }
    catch {
        Write-Error "[SKILLMASTER] Erro no ciclo principal: $_"
    }

    # Aguarda antes do proximo ciclo de verificacao
    Start-Sleep -Seconds 60 # Verifica a cada minuto
}