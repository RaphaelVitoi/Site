<#
.SYNOPSIS
    Funções de logging centralizadas para scripts do sistema.
.DESCRIPTION
    Este script define funções para padronizar o logging em todos os scripts do sistema,
    garantindo consistência e facilitando a depuração.
#>

$ScriptName = Split-Path $MyInvocation.MyCommand.Path -Leaf

function Log-Information {
    param (
        [string]$Message
    )
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$Timestamp] [$ScriptName] [INFO] $($Message)" -ForegroundColor Green
    Write-Host "[INFO] $($Message)" -ForegroundColor Green
    # TODO: Adicionar log em arquivo centralizado
}

function Log-Warning {
    param (
        [string]$Message
    )
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$Timestamp] [$ScriptName] [WARN] $($Message)" -ForegroundColor Yellow
    Write-Host "[WARN] $($Message)" -ForegroundColor Yellow
    # TODO: Adicionar log em arquivo centralizado
}

function Log-Error {
    param (
        [string]$Message
    )
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$Timestamp] [$ScriptName] [ERRO] $($Message)" -ForegroundColor Red
    Write-Host "[ERRO] $($Message)" -ForegroundColor Red
    # TODO: Adicionar log em arquivo centralizado
}

# Exemplo de uso:
# Log-Information "Script iniciado."
# Log-Warning "Arquivo nao encontrado."
# Log-Error "Falha ao executar comando."