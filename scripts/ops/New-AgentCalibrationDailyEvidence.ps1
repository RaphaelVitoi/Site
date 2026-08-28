<#
.SYNOPSIS
    Produces deterministic daily evidence for the scheduled calibration analysis.
    Interpretation and behavioural changes remain the responsibility of the
    scheduled review; this script does not fabricate recommendations. PowerShell
    7+ is the default runtime; 5.1 remains compatible.
#>
[CmdletBinding()]
param(
    [datetime]$Date = (Get-Date),

    [ValidateRange(1, 100)]
    [int]$MinimumFeedbackRecords = 3,

    [ValidateRange(1, 100)]
    [int]$MinimumDistinctSessions = 2
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$ledgerPath = Join-Path $repositoryRoot 'reports\agent-calibration\feedback-ledger.jsonl'
$outlierLedgerPath = Join-Path $repositoryRoot 'reports\agent-calibration\outlier-evidence-ledger.jsonl'
& (Join-Path $PSScriptRoot 'Test-AgentCalibrationLedger.ps1') -LedgerPath $ledgerPath | Out-Null
& (Join-Path $PSScriptRoot 'Test-AgentCalibrationLedger.ps1') -LedgerPath $outlierLedgerPath | Out-Null

$day = $Date.ToString('yyyy-MM-dd')
$records = @()
if (Test-Path -LiteralPath $ledgerPath) {
    $records = @(Get-Content -LiteralPath $ledgerPath -Encoding UTF8 | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | ForEach-Object { $_ | ConvertFrom-Json } | Where-Object {
        $_.record_type -eq 'feedback' -and ([DateTimeOffset]::Parse([string]$_.recorded_at).LocalDateTime.ToString('yyyy-MM-dd') -eq $day)
    })
}

$scores = @($records | ForEach-Object { [double]$_.score })
$outliers = @()
if (Test-Path -LiteralPath $outlierLedgerPath) {
    $outliers = @(Get-Content -LiteralPath $outlierLedgerPath -Encoding UTF8 | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | ForEach-Object { $_ | ConvertFrom-Json } | Where-Object {
        $_.record_type -eq 'outlier' -and ([DateTimeOffset]::Parse([string]$_.recorded_at).LocalDateTime.ToString('yyyy-MM-dd') -eq $day)
    })
}
$distinctSessionIds = @($records |
    Where-Object { -not [string]::IsNullOrWhiteSpace([string]$_.session_id) } |
    ForEach-Object { [string]$_.session_id } |
    Sort-Object -Unique)
$structuralEvidenceSufficient = ($records.Count -ge $MinimumFeedbackRecords) -and ($distinctSessionIds.Count -ge $MinimumDistinctSessions)
[pscustomobject]@{
    schema_version                 = 'agent-calibration-daily-evidence/v2'
    date                           = $day
    feedback_count                 = $records.Count
    distinct_session_count         = $distinctSessionIds.Count
    score_mean                     = if ($scores.Count -gt 0) { [Math]::Round((($scores | Measure-Object -Average).Average), 2) } else { $null }
    score_min                      = if ($scores.Count -gt 0) { ($scores | Measure-Object -Minimum).Minimum } else { $null }
    score_max                      = if ($scores.Count -gt 0) { ($scores | Measure-Object -Maximum).Maximum } else { $null }
    evidence_gate                  = [ordered]@{
        minimum_feedback_records     = $MinimumFeedbackRecords
        minimum_distinct_sessions    = $MinimumDistinctSessions
        structural_gate_passed       = $structuralEvidenceSufficient
        pattern_confirmation_required = 'At least two independently corroborating feedback records must identify the same operational pattern. The daily reviewer must cite both records or report insufficiency.'
    }
    calibration_planning_permitted = $structuralEvidenceSufficient
    records                        = $records
    outlier_evidence               = [ordered]@{
        ledger_path                = $outlierLedgerPath
        count                      = $outliers.Count
        records                    = $outliers
        disposition                = 'retained separately; excluded from pattern indexing and calibration sample until deterministic posterior review'
        automatic_pattern_indexing = $false
        low_sample_origin_rule     = 'A low-sample outlier may indicate an origin-specific pattern. Retain it and require deterministic posterior analysis; do not promote it from frequency alone.'
    }
} | ConvertTo-Json -Depth 8
