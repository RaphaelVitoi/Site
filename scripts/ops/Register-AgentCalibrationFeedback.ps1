<#
.SYNOPSIS
    Appends one user feedback event to the tamper-evident agent-calibration ledger.

.DESCRIPTION
    The ledger is JSONL with a SHA-256 hash chain. It is not physically immutable:
    a local administrator can alter disk contents. It is tamper-evident when
    verified by Test-AgentCalibrationLedger.ps1 and anchored by an authorized
    Git commit. PowerShell 7+ is the operational default; Windows PowerShell
    5.1 compatibility is retained for legacy project components.
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [ValidateRange(0, 10)]
    [decimal]$Score,

    [Parameter(Mandatory)]
    [ValidateNotNullOrEmpty()]
    [string]$Feedback,

    [string]$Scope = 'handoff',

    [string]$SessionId = '',

    # Instante de inicio da SESSAO (nao do feedback), em formato parseavel por
    # DateTimeOffset. Sessao = do inicio ao fim de um trabalho; compactacao de
    # contexto nao a reinicia. Todos os feedbacks de uma mesma sessao devem
    # declarar o MESMO valor aqui.
    [string]$SessionStartedAt = '',

    # Modelo exato que conduziu a sessao (ex.: gemini-3.8-flash, claude-opus-5, chatgpt-5.6).
    [string]$ConductorModel = '',

    # Regime de operacao da sessao: assistida (arbitrada pelo Tier 0) ou automatizada.
    [ValidateSet('', 'assistida', 'automatizada')]
    [string]$SupervisionMode = '',

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
    finally {
        $sha.Dispose()
    }
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
    foreach ($key in $Fields.Keys) {
        $payload[$key] = $Fields[$key]
    }
    $canonical = $payload | ConvertTo-Json -Compress -Depth 8
    $payload['record_hash'] = Get-Sha256Hex -Text $canonical
    return [pscustomobject]$payload
}

$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$ledgerDirectory = Join-Path $repositoryRoot 'reports\agent-calibration'
if ([string]::IsNullOrWhiteSpace($LedgerPath)) {
    $LedgerPath = Join-Path $ledgerDirectory 'feedback-ledger.jsonl'
}
$ledgerDirectory = Split-Path -Parent $LedgerPath
New-Item -ItemType Directory -Force -Path $ledgerDirectory | Out-Null

$lockPath = "$ledgerPath.lock"
$lockStream = $null
try {
    $lockStream = [System.IO.File]::Open($lockPath, [System.IO.FileMode]::OpenOrCreate, [System.IO.FileAccess]::ReadWrite, [System.IO.FileShare]::None)
    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)

    if (-not (Test-Path -LiteralPath $ledgerPath)) {
        $genesis = New-HashChainedRecord -Sequence 0 -RecordType 'genesis' -RecordedAt ([DateTimeOffset]::Now.ToString('o')) -PreviousHash ('0' * 64) -Fields ([ordered]@{
            policy = 'append-only hash chain; verify before use; Git anchoring requires explicit authorization'
        })
        [System.IO.File]::WriteAllText($ledgerPath, (($genesis | ConvertTo-Json -Compress -Depth 8) + [Environment]::NewLine), $utf8NoBom)
    }

    $verifyScript = Join-Path $PSScriptRoot 'Test-AgentCalibrationLedger.ps1'
    & $verifyScript -LedgerPath $ledgerPath | Out-Null

    $rows = @(Get-Content -LiteralPath $ledgerPath -Encoding UTF8 | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | ForEach-Object { $_ | ConvertFrom-Json })
    $tail = $rows[-1]
    $campos = [ordered]@{
        event_id   = [guid]::NewGuid().ToString()
        session_id = $SessionId
        score      = $Score
        feedback   = $Feedback.Trim()
        scope      = $Scope.Trim()
    }
    # Ancora temporal da sessao. Sessao vai do inicio ao fim de um trabalho e
    # compactacao de contexto NAO a encerra; sem esta marca, uma sessao partida
    # por compactacao e indistinguivel de duas sessoes legitimas. Opcional para
    # nao invalidar registros anteriores, mas quando presente o portao de
    # suficiencia usa a divergencia dela para detectar sessao partida.
    if (-not [string]::IsNullOrWhiteSpace($SessionStartedAt)) {
        $campos['session_started_at'] = ([DateTimeOffset]::Parse($SessionStartedAt)).ToString('o')
    }
    if (-not [string]::IsNullOrWhiteSpace($ConductorModel)) {
        $campos['conductor_model'] = $ConductorModel.Trim()
    }
    if (-not [string]::IsNullOrWhiteSpace($SupervisionMode)) {
        $campos['supervision_mode'] = $SupervisionMode.Trim()
    }
    $record = New-HashChainedRecord -Sequence ([int]$tail.sequence + 1) -RecordType 'feedback' -RecordedAt ([DateTimeOffset]::Now.ToString('o')) -PreviousHash ([string]$tail.record_hash) -Fields $campos
    [System.IO.File]::AppendAllText($ledgerPath, (($record | ConvertTo-Json -Compress -Depth 8) + [Environment]::NewLine), $utf8NoBom)
    [pscustomobject]@{
        status      = 'appended'
        sequence    = $record.sequence
        record_hash = $record.record_hash
        ledger_path = $ledgerPath
    } | ConvertTo-Json -Compress
}
finally {
    if ($null -ne $lockStream) { $lockStream.Dispose() }
}
