<# .SYNOPSIS Verifies the SHA-256 chain of the agent-calibration JSONL ledger. #>
[CmdletBinding()]
param(
    [string]$LedgerPath = ''
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# GUARDA DE RUNTIME (2026-09-10). ConvertTo-Json serializa diferente no Windows
# PowerShell 5.1 e no PowerShell 7, e o hash acompanha. Medido nesta data sobre o
# MESMO arquivo: pwsh 7 devolve {"status":"valid","records":22}; o 5.1 reprova com
# "Hash mismatch at line 3". A cadeia esta integra -- quem mente e o veredito.
#
# Descartada a hipotese obvia: as linhas 2 e 3 tem ZERO bytes nao-ASCII, logo nao
# e escape de acento. A causa exata da divergencia de serializacao nao foi isolada
# e fica declarada como nao medida.
#
# Recusar e melhor que reprovar: um operador que ve "Hash mismatch" conclui
# corrupcao de evidencia append-only e pode agir sobre um ledger sadio. A sinopse
# do gerador promete "5.1 remains compatible"; para ESTE validador a promessa nao
# se sustenta, e a guarda diz isso em vez de deixar o erro falar por ela.
if ($PSVersionTable.PSVersion.Major -lt 6) {
    throw ("Este validador exige PowerShell 7+ (pwsh). No Windows PowerShell 5.1 o " +
        "ConvertTo-Json produz texto diferente e a cadeia INTEGRA aparece como " +
        "'Hash mismatch'. Rode: pwsh -File scripts/ops/Test-AgentCalibrationLedger.ps1")
}

if ([string]::IsNullOrWhiteSpace($LedgerPath)) {
    $repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
    $LedgerPath = Join-Path $repositoryRoot 'reports\agent-calibration\feedback-ledger.jsonl'
}

function Get-LiteralJsonString {
    <#
      Recupera o valor de um campo string direto do TEXTO CRU da linha JSONL,
      sem passar por ConvertFrom-Json. Existe porque o PowerShell 7 converte
      string ISO 8601 em DateTime, e re-serializar o objeto convertido produz
      texto diferente do original -- o que faria um ledger integro reprovar.
    #>
    param(
        [Parameter(Mandatory)][string]$Line,
        [Parameter(Mandatory)][string]$Name
    )
    $pattern = '"' + [regex]::Escape($Name) + '"\s*:\s*"(?<valor>[^"]*)"'
    $match = [regex]::Match($Line, $pattern)
    if (-not $match.Success) { return $null }
    return $match.Groups['valor'].Value
}

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

if (-not (Test-Path -LiteralPath $LedgerPath)) {
    [pscustomobject]@{ status = 'empty'; ledger_path = $LedgerPath; records = 0 } | ConvertTo-Json -Compress
    exit 0
}

$lines = @(Get-Content -LiteralPath $LedgerPath -Encoding UTF8 | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
if ($lines.Count -eq 0) { throw 'Ledger exists but is empty.' }

$previousHash = '0' * 64
for ($index = 0; $index -lt $lines.Count; $index++) {
    try { $row = $lines[$index] | ConvertFrom-Json }
    catch { throw "Malformed JSONL record at line $($index + 1)." }
    if ([int]$row.sequence -ne $index) { throw "Unexpected sequence at line $($index + 1)." }
    if ([string]$row.previous_hash -ne $previousHash) { throw "Broken previous_hash at line $($index + 1)." }

    # PowerShell 7 converts ISO 8601 JSON strings to DateTime while 5.1 keeps
    # strings. Hashing the converted value would make a valid cross-runtime
    # ledger appear altered. Preserve the literal JSON timestamp in the
    # canonical payload; it is emitted by all writers as an ISO 8601 string.
    #
    # A protecao vale para TODO campo de data, nao so `recorded_at`. Medido em
    # 2026-09-02: o portao por sessao acrescentou `session_started_at` ao
    # escritor sem estender esta protecao, e o primeiro registro a carrega-lo
    # quebrou a cadeia. Um segundo caso especial adiaria o mesmo defeito para o
    # proximo campo de data; a generalizacao o fecha.
    $recordedAt = Get-LiteralJsonString -Line $lines[$index] -Name 'recorded_at'
    if ($null -eq $recordedAt) { throw "Missing literal recorded_at string at line $($index + 1)." }
    $payload = [ordered]@{
        schema_version = [string]$row.schema_version
        sequence       = [int]$row.sequence
        record_type    = [string]$row.record_type
        recorded_at    = $recordedAt
        previous_hash  = [string]$row.previous_hash
    }
    foreach ($property in $row.PSObject.Properties) {
        if ($property.Name -notin @('schema_version', 'sequence', 'record_type', 'recorded_at', 'previous_hash', 'record_hash')) {
            if ($property.Value -is [datetime]) {
                $literal = Get-LiteralJsonString -Line $lines[$index] -Name $property.Name
                if ($null -eq $literal) { throw "Missing literal $($property.Name) string at line $($index + 1)." }
                $payload[$property.Name] = $literal
            }
            else {
                $payload[$property.Name] = $property.Value
            }
        }
    }
    $actualHash = Get-Sha256Hex -Text ($payload | ConvertTo-Json -Compress -Depth 8)
    if ($actualHash -ne [string]$row.record_hash) { throw "Hash mismatch at line $($index + 1)." }
    $previousHash = [string]$row.record_hash
}

[pscustomobject]@{ status = 'valid'; ledger_path = $LedgerPath; records = $lines.Count; tail_hash = $previousHash } | ConvertTo-Json -Compress
