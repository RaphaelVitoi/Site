<#
.SYNOPSIS
    Monitora o tamanho do tasks.db e gera um alerta se exceder um limite.
.DESCRIPTION
    Este script verifica periodicamente o tamanho do arquivo tasks.db e, se exceder
    um limite predefinido, envia um alerta.
#>

[CmdletBinding()]
param (
    [Parameter(Mandatory = $false)]
    [int]$MaxSizeMB = 50,

    [Parameter(Mandatory = $false)]
    [int]$CheckIntervalSeconds = 3600
)

$ProjectRoot = Split-Path $PSScriptRoot -Parent
$DbPath = Join-Path $ProjectRoot "queue\tasks.db"

function Send-Alert {
    param (
        [string]$Message
    )

    Write-Host "ALERTA: $Message" -ForegroundColor Red
    # TODO: Implementar envio de alerta por email/Slack/outro meio.
    # Exemplo: Send-MailMessage -To "admin@example.com" -From "monitor@example.com" -Subject "Alerta tasks.db" -Body $Message -SmtpServer "smtp.example.com"
}

Write-Host "Monitorando o tamanho do tasks.db (limite: $MaxSizeMB MB)..." -ForegroundColor Green

while ($true) {
    try {
        if (Test-Path $DbPath) {
            $DbSizeMB = (Get-Item $DbPath).Length / 1MB

            if ($DbSizeMB -gt $MaxSizeMB) {
                $Message = "O tamanho do tasks.db excedeu o limite de $MaxSizeMB MB ($([math]::Round($DbSizeMB, 2)) MB)."
                Send-Alert -Message $Message
            }
            else {
                Write-Host "tasks.db: $($([math]::Round($DbSizeMB, 2)) MB" -ForegroundColor Green
            }
        }
        else {
            Send-Alert -Message "tasks.db nao encontrado!"
        }
    }
    catch {
        Write-Error "Erro ao verificar o tamanho do tasks.db: $_"
    }

    Write-Host "Proxima verificacao em $($CheckIntervalSeconds) segundos..." -ForegroundColor Gray
    Start-Sleep -Seconds $CheckIntervalSeconds
}

# Para usar:
# 1. Salve este script como monitor_db_size.ps1.
# 2. Execute: .\monitor_db_size.ps1 -MaxSizeMB 50 -CheckIntervalSeconds 3600
#
# Este script ira verificar o tamanho do tasks.db a cada hora e enviar um alerta se exceder 50MB.
# Ajuste os parametros conforme necessario.