<#
.SYNOPSIS
    Grava a evidencia diaria de calibracao num arquivo <data>.json. E o alvo da
    tarefa agendada das 23:59, e tambem o caminho para gerar dias retroativos.

.DESCRIPTION
    Existe para eliminar uma classe inteira de defeito, nao por elegancia.

    Ate 2026-09-05 a tarefa agendada era registrada com `-Command` carregando
    uma expressao inteira: chamada do script de evidencia, pipe para Out-File,
    `Join-Path` e um `-f` com aspas duplas e simples aninhadas. O Agendador do
    Windows entrega a linha de comando ao processo como UMA string, e o parser
    consome as aspas externas -- o nome do arquivo evaporava e sobrava o
    diretorio.

    Medido no dia, com a tarefa recem-registrada:

        LastTaskResult: 1
        Out-File: Could not find a part of the path
                  'C:\...\reports\agent-calibration\daily\'.

    Note o caminho terminando em '\': o diretorio existe, o nome do arquivo e
    que virou vazio. A falha era silenciosa do ponto de vista do operador --
    a tarefa constava "Ready", com proxima execucao agendada, e nao produzia
    nada. Foi o motivo pelo qual `daily/` nunca teve um unico .json.

    Consertar as aspas resolveria o sintoma e deixaria a armadilha montada
    para a proxima edicao. Com o wrapper, a tarefa passa a ser registrada com
    `-File`, que nao interpreta a linha: nao ha aspas aninhadas para perder.

.PARAMETER Date
    Dia a avaliar. Padrao: hoje. O nome do arquivo vem DAQUI, e nao de
    Get-Date, para que dias retroativos gravem no arquivo correto.
#>
[CmdletBinding()]
param(
    [datetime]$Date = (Get-Date),

    [string]$OutputDirectory = '',

    [string]$LedgerPath = '',

    [string]$OutlierLedgerPath = ''
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
if ([string]::IsNullOrWhiteSpace($OutputDirectory)) {
    $OutputDirectory = Join-Path $repositoryRoot 'reports\agent-calibration\daily'
}
New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null

$evidenceScript = Join-Path $PSScriptRoot 'New-AgentCalibrationDailyEvidence.ps1'
$argumentos = @{ Date = $Date }
if (-not [string]::IsNullOrWhiteSpace($LedgerPath)) { $argumentos['LedgerPath'] = $LedgerPath }
if (-not [string]::IsNullOrWhiteSpace($OutlierLedgerPath)) { $argumentos['OutlierLedgerPath'] = $OutlierLedgerPath }

$json = & $evidenceScript @argumentos

# O NOME DO ARQUIVO VEM DE -Date, nao do relogio. Um dia retroativo gerado com
# Get-Date sobrescreveria a evidencia de hoje com os numeros de outro dia --
# que e a forma mais direta de corromper um lastro de auditoria.
$dia = $Date.ToString('yyyy-MM-dd')
$destino = Join-Path $OutputDirectory ("{0}.json" -f $dia)

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($destino, (($json -join [Environment]::NewLine) + [Environment]::NewLine), $utf8NoBom)

[pscustomobject]@{
    status = 'written'
    date   = $dia
    path   = $destino
    bytes  = (Get-Item -LiteralPath $destino).Length
} | ConvertTo-Json -Compress
