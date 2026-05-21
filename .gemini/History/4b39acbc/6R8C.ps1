<#
.SYNOPSIS
    Inicia o servidor de desenvolvimento do Next.js para visualizacao da nova arquitetura.
#>

Write-Host "=== LIGANDO MOTOR NEXT.JS (NOVO SITE) ===" -ForegroundColor Magenta
Write-Host "[NEXUS] O painel visual estara disponivel em: http://localhost:3000" -ForegroundColor Cyan

# Função para verificar e parar o servidor de desenvolvimento Next.js em uma porta específica
function Stop-NextDevServer {
    param (
        [int]$Port = 3000
    )

    Write-Host "[NEXUS] Verificando se o porto $Port esta em uso por um servidor Next.js..." -ForegroundColor DarkCyan
    # Encontra processos que estão escutando na porta especificada
    $processes = Get-NetTCPConnection -LocalPort $Port | Where-Object { $_.State -eq "Listen" } | Select-Object -ExpandProperty OwningProcess -Unique

    if ($processes.Count -gt 0) {
        Write-Host "[ALERTA] Servidor Next.js detectado no porto $Port (PID(s): $($processes -join ', '))." -ForegroundColor Yellow
        $confirm = Read-Host "Deseja encerrar este(s) processo(s) para iniciar um novo? (S/N)"

        if ($confirm -eq 'S' -or $confirm -eq 's') {
            foreach ($pid in $processes) {
                try {
                    Stop-Process -Id $pid -Force -ErrorAction Stop
                    Write-Host "[SUCESSO] Processo PID $pid encerrado." -ForegroundColor Green
                }
                catch {
                    Write-Error "Falha ao encerrar processo PID $pid: $($_.Exception.Message)"
                }
            }
            Start-Sleep -Seconds 2 # Dá um pequeno tempo para a porta ser liberada
        }
        else {
            Write-Host "[INFO] Nao encerrando o servidor existente. Tentando iniciar em outra porta..." -ForegroundColor Yellow
            # Next.js tentará automaticamente uma porta diferente, mas o usuário foi avisado.
        }
    }
    else {
        Write-Host "[NEXUS] Porto $Port livre. Prosseguindo..." -ForegroundColor DarkCyan
    }
}

$ProjectRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
Set-Location (Join-Path $ProjectRoot "frontend")

# Chama a função para verificar e parar servidores Next.js antes de iniciar um novo
Stop-NextDevServer -Port 3000

npm run dev
