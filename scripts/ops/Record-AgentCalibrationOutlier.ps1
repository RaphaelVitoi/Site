<#
.SYNOPSIS
    Appends a retained outlier-evidence event to a separate hash-chained ledger.

.DESCRIPTION
    An outlier is evidence, not an error to discard and not a confirmed pattern.
    This script never writes to a pattern index. Deterministic posterior review
    is required before a source-specific pattern may be indexed elsewhere.
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [ValidateNotNullOrEmpty()]
    [string]$Observation,

    [Parameter(Mandatory)]
    [ValidateNotNullOrEmpty()]
    [string]$SourceRefsJson,

    [string]$MetricsJson = '{}',

    [string]$OriginHypothesis = '',

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
        schema_version = 'agent-calibration-outlier-ledger/v1'
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

try {
    $sourceRefs = @($SourceRefsJson | ConvertFrom-Json)
    $metrics = $MetricsJson | ConvertFrom-Json
}
catch {
    throw 'SourceRefsJson must be a JSON array and MetricsJson must be valid JSON.'
}
if ($sourceRefs.Count -eq 0 -or @($sourceRefs | Where-Object { -not [string]::IsNullOrWhiteSpace([string]$_) }).Count -ne $sourceRefs.Count) {
    throw 'SourceRefsJson must contain one or more non-empty source references.'
}
if ($null -eq $metrics -or $metrics.GetType().FullName -ne 'System.Management.Automation.PSCustomObject' -or ($metrics.PSObject.Properties | Measure-Object).Count -eq 0) {
    throw 'MetricsJson must be a JSON object.'
}

$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
if ([string]::IsNullOrWhiteSpace($LedgerPath)) {
    $LedgerPath = Join-Path $repositoryRoot 'reports\agent-calibration\outlier-evidence-ledger.jsonl'
}
$ledgerDirectory = Split-Path -Parent $LedgerPath
New-Item -ItemType Directory -Force -Path $ledgerDirectory | Out-Null
$lockPath = "$LedgerPath.lock"
$lockStream = $null
try {
    $lockStream = [System.IO.File]::Open($lockPath, [System.IO.FileMode]::OpenOrCreate, [System.IO.FileAccess]::ReadWrite, [System.IO.FileShare]::None)
    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    if (-not (Test-Path -LiteralPath $LedgerPath)) {
        $genesis = New-HashChainedRecord -Sequence 0 -RecordType 'genesis' -RecordedAt ([DateTimeOffset]::Now.ToString('o')) -PreviousHash ('0' * 64) -Fields ([ordered]@{
            policy = 'retain outliers as evidence; no automatic pattern indexing; deterministic posterior review required for promotion'
        })
        [System.IO.File]::WriteAllText($LedgerPath, (($genesis | ConvertTo-Json -Compress -Depth 8) + [Environment]::NewLine), $utf8NoBom)
    }

    & (Join-Path $PSScriptRoot 'Test-AgentCalibrationLedger.ps1') -LedgerPath $LedgerPath | Out-Null
    $rows = @(Get-Content -LiteralPath $LedgerPath -Encoding UTF8 | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | ForEach-Object { $_ | ConvertFrom-Json })
    $tail = $rows[-1]
    $record = New-HashChainedRecord -Sequence ([int]$tail.sequence + 1) -RecordType 'outlier' -RecordedAt ([DateTimeOffset]::Now.ToString('o')) -PreviousHash ([string]$tail.record_hash) -Fields ([ordered]@{
        outlier_id        = [guid]::NewGuid().ToString()
        observation       = $Observation.Trim()
        source_references = $sourceRefs
        metrics           = $metrics
        origin_hypothesis = $OriginHypothesis.Trim()
        disposition       = 'retained-pending-deterministic-review'
        pattern_indexed   = $false
    })
    [System.IO.File]::AppendAllText($LedgerPath, (($record | ConvertTo-Json -Compress -Depth 8) + [Environment]::NewLine), $utf8NoBom)
    [pscustomobject]@{
        status      = 'retained'
        outlier_id  = $record.outlier_id
        sequence    = $record.sequence
        record_hash = $record.record_hash
        ledger_path = $LedgerPath
    } | ConvertTo-Json -Compress
}
finally {
    if ($null -ne $lockStream) { $lockStream.Dispose() }
}
