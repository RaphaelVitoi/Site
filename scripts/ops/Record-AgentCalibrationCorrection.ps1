<#
.SYNOPSIS
    Anexa uma correcao de campo ao ledger de calibracao, encadeada por SHA-256.

.DESCRIPTION
    O ledger e append-only e tamper-evident: um valor gravado errado NAO se
    reescreve. Corrige-se por registro anexado que aponta o `event_id` do
    registro errado, declara o campo, o valor anterior, o valor correto e a
    autoridade que corrigiu.

    A correcao NAO e decorativa: `New-AgentCalibrationDailyEvidence.ps1` a
    aplica sobre o registro alvo antes de qualquer contagem. Sem essa aplicacao
    o valor errado seguiria alimentando media, outlier e hipotese, e o registro
    de correcao seria prosa.

    Motivo medido, 2026-09-02: a nota da sessao
    `claude-opus5-site-2026-09-02-integridade` foi dada como 8 e gravada como
    0.8 -- conversao de escala, exatamente o que a §8.3 do CLAUDE.md proibe. A
    ironia e que aquela mesma §8.3 citava o 0.8 como exemplo de "gravado
    literal, sem conversao de escala".
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [ValidateNotNullOrEmpty()]
    [string]$TargetEventId,

    [Parameter(Mandatory)]
    [ValidateNotNullOrEmpty()]
    [string]$Field,

    [Parameter(Mandatory)]
    [ValidateNotNullOrEmpty()]
    [string]$CorrectedValueJson,

    [Parameter(Mandatory)]
    [ValidateNotNullOrEmpty()]
    [string]$Reason,

    [string]$Authority = 'Tier 0 - Raphael Vitoi',

    [string]$LedgerPath = ''
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Get-Sha256Hex {
    param([Parameter(Mandatory)][string]$Text)
    $sha = [System.Security.Cryptography.SHA256]::Create()
    try {
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($Text)
        return -join ($sha.ComputeHash($bytes) | ForEach-Object { $_.ToString('x2') })
    }
    finally { $sha.Dispose() }
}

function New-HashChainedRecord {
    param(
        [Parameter(Mandatory)][int]$Sequence,
        [Parameter(Mandatory)][string]$RecordType,
        [Parameter(Mandatory)][string]$RecordedAt,
        [Parameter(Mandatory)][string]$PreviousHash,
        [Parameter(Mandatory)][System.Collections.IDictionary]$Fields
    )
    $payload = [ordered]@{
        schema_version = 'agent-calibration-ledger/v1'
        sequence       = $Sequence
        record_type    = $RecordType
        recorded_at    = $RecordedAt
        previous_hash  = $PreviousHash
    }
    foreach ($key in $Fields.Keys) { $payload[$key] = $Fields[$key] }
    $canonical = $payload | ConvertTo-Json -Compress -Depth 8
    $payload['record_hash'] = Get-Sha256Hex -Text $canonical
    return [pscustomobject]$payload
}

try { $correctedValue = $CorrectedValueJson | ConvertFrom-Json }
catch { throw 'CorrectedValueJson precisa ser JSON valido (ex.: 8 ou "texto").' }

$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
if ([string]::IsNullOrWhiteSpace($LedgerPath)) {
    $LedgerPath = Join-Path $repositoryRoot 'reports\agent-calibration\feedback-ledger.jsonl'
}
if (-not (Test-Path -LiteralPath $LedgerPath)) {
    throw "Ledger nao encontrado: $LedgerPath. Correcao exige alvo existente."
}

$lockPath = "$LedgerPath.lock"
$lockStream = $null
try {
    $lockStream = [System.IO.File]::Open($lockPath, [System.IO.FileMode]::OpenOrCreate, [System.IO.FileAccess]::ReadWrite, [System.IO.FileShare]::None)
    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)

    & (Join-Path $PSScriptRoot 'Test-AgentCalibrationLedger.ps1') -LedgerPath $LedgerPath | Out-Null
    $rows = @(Get-Content -LiteralPath $LedgerPath -Encoding UTF8 | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | ForEach-Object { $_ | ConvertFrom-Json })

    # ALVO TEM QUE EXISTIR. Correcao que aponta para nada e pior que nenhuma:
    # parece reparo e nao repara.
    $alvo = @($rows | Where-Object { $_.record_type -eq 'feedback' -and [string]$_.event_id -eq $TargetEventId })
    if ($alvo.Count -eq 0) {
        throw "Nenhum registro de feedback com event_id '$TargetEventId' neste ledger."
    }
    if ($alvo.Count -gt 1) {
        throw "event_id '$TargetEventId' aparece $($alvo.Count) vezes; ledger ambiguo."
    }
    $registro = $alvo[0]
    if (-not $registro.PSObject.Properties.Name.Contains($Field)) {
        throw "O registro alvo nao tem o campo '$Field'."
    }
    $valorAnterior = $registro.$Field

    $tail = $rows[-1]
    $record = New-HashChainedRecord -Sequence ([int]$tail.sequence + 1) -RecordType 'correction' -RecordedAt ([DateTimeOffset]::Now.ToString('o')) -PreviousHash ([string]$tail.record_hash) -Fields ([ordered]@{
        correction_id   = [guid]::NewGuid().ToString()
        target_event_id = $TargetEventId
        target_sequence = [int]$registro.sequence
        field           = $Field
        previous_value  = $valorAnterior
        corrected_value = $correctedValue
        reason          = $Reason.Trim()
        authority       = $Authority.Trim()
    })
    [System.IO.File]::AppendAllText($LedgerPath, (($record | ConvertTo-Json -Compress -Depth 8) + [Environment]::NewLine), $utf8NoBom)

    [pscustomobject]@{
        status          = 'corrected'
        correction_id   = $record.correction_id
        target_event_id = $TargetEventId
        field           = $Field
        previous_value  = $valorAnterior
        corrected_value = $correctedValue
        sequence        = $record.sequence
        record_hash     = $record.record_hash
        ledger_path     = $LedgerPath
    } | ConvertTo-Json -Compress
}
finally {
    if ($null -ne $lockStream) { $lockStream.Dispose() }
}
