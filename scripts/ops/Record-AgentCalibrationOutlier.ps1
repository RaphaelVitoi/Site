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

    # Obrigatorio, e a ausencia de default e deliberada. Ate 2026-09-12 este
    # parametro tinha default '{}' -- que a validacao abaixo SEMPRE recusava,
    # por exigir ao menos uma propriedade. A assinatura anunciava opcional e o
    # script morria com 'MetricsJson must be a JSON object' sobre um valor que
    # E um objeto JSON: a mensagem culpava a entrada de quem chamou, quando o
    # defeito era o default. Medido na revalidacao em PowerShell 5.1 real.
    # Mandatory faz a falha ocorrer na LIGACAO do parametro, onde o proprio
    # PowerShell nomeia o que falta.
    [Parameter(Mandatory)]
    [ValidateNotNullOrEmpty()]
    [string]$MetricsJson,

    [string]$OriginHypothesis = '',

    [string]$Resolves = '',

    [ValidateSet('resolved', 'discarded-with-reason')]
    [string]$Disposition = 'resolved',

    [string]$Authority = '',

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
    throw 'MetricsJson must be a JSON object with at least one measured field -- an outlier without metrics is not retained evidence.'
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
    $campos = [ordered]@{
        outlier_id        = [guid]::NewGuid().ToString()
        observation       = $Observation.Trim()
        source_references = $sourceRefs
        metrics           = $metrics
        origin_hypothesis = $OriginHypothesis.Trim()
        disposition       = 'retained-pending-deterministic-review'
        pattern_indexed   = $false
    }

    if (-not [string]::IsNullOrWhiteSpace($Resolves)) {
        if ([string]::IsNullOrWhiteSpace($Authority)) {
            throw 'Fechar um outlier e decisao, nao medicao. -Authority e obrigatorio com -Resolves.'
        }
        $anteriores = @($rows | Where-Object { $_.record_type -eq 'outlier' })
        $alvo = @($anteriores | Where-Object { [string]$_.outlier_id -eq $Resolves })
        if ($alvo.Count -eq 0) {
            throw "Fechamento aponta para outlier inexistente: '$Resolves'."
        }
        if ($alvo.Count -gt 1) {
            throw "outlier_id '$Resolves' aparece $($alvo.Count) vezes; ledger ambiguo."
        }
        $jaFechado = @($anteriores | Where-Object { $_.PSObject.Properties.Name -contains 'resolves' -and [string]$_.resolves -eq $Resolves })
        if ($jaFechado.Count -gt 0) {
            throw ("outlier '{0}' ja foi fechado pelo registro de sequencia {1}. Refechar duplicaria a resolucao." -f $Resolves, $jaFechado[0].sequence)
        }
        $campos['resolves'] = $Resolves
        $campos['resolves_sequence'] = [int]$alvo[0].sequence
        $campos['disposition'] = $Disposition
        $campos['authority'] = $Authority.Trim()
    }
    elseif (-not [string]::IsNullOrWhiteSpace($Authority)) {
        throw '-Authority so tem sentido acompanhando -Resolves: retencao e medicao, nao decisao.'
    }

    $tail = $rows[-1]
    $record = New-HashChainedRecord -Sequence ([int]$tail.sequence + 1) -RecordType 'outlier' -RecordedAt ([DateTimeOffset]::Now.ToString('o')) -PreviousHash ([string]$tail.record_hash) -Fields $campos
    [System.IO.File]::AppendAllText($LedgerPath, (($record | ConvertTo-Json -Compress -Depth 8) + [Environment]::NewLine), $utf8NoBom)
    $estado = 'retained'
    if (-not [string]::IsNullOrWhiteSpace($Resolves)) { $estado = $Disposition }
    [pscustomobject]@{
        status      = $estado
        resolves    = $Resolves
        outlier_id  = $record.outlier_id
        sequence    = $record.sequence
        record_hash = $record.record_hash
        ledger_path = $LedgerPath
    } | ConvertTo-Json -Compress
}
finally {
    if ($null -ne $lockStream) { $lockStream.Dispose() }
}
