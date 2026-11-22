<#
.SYNOPSIS
    Auditoria read-only e mascarada de todas as keys, pools e tiers em HKCU, HKLM e Process.
.DESCRIPTION
    Inspeciona HKCU:\Environment, HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager\Environment
    e o ambiente do processo atual sem jamais exibir segredos em texto claro, gravar em disco
    ou disparar chamadas externas.
.EXAMPLE
    .\Audit-KeyPools.ps1
.EXAMPLE
    .\Audit-KeyPools.ps1 -Pool Tier1
.EXAMPLE
    .\Audit-KeyPools.ps1 -AnomaliesOnly -Json
#>
[CmdletBinding()]
param(
    [string]$Pool = '',
    [switch]$AnomaliesOnly,
    [switch]$Live,
    [switch]$Plain,
    [switch]$Json,
    [switch]$Strict
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$RegistryPath = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..\..\..\data\credential_registry.json'))
if (-not (Test-Path -LiteralPath $RegistryPath)) {
    throw "Manifesto canonico ausente: $RegistryPath"
}
$RegistrySpec = Get-Content -LiteralPath $RegistryPath -Raw -Encoding UTF8 | ConvertFrom-Json

$SystemIgnoreVars = @($RegistrySpec.system_ignore_vars | ForEach-Object { [string]$_ })
$NonSecretExact = @($RegistrySpec.non_secret_exact | ForEach-Object { [string]$_ })
$SecretValueRx = [string]$RegistrySpec.secret_value_regex
$SecretNameRx = [string]$RegistrySpec.secret_name_regex
$ExpectedAliasGroups = @($RegistrySpec.expected_alias_groups | ForEach-Object { ,@($_ | ForEach-Object { [string]$_ }) })
$PoolDefs = @($RegistrySpec.pools)

function Get-Sha8 {
    param([string]$Value)
    if ([string]::IsNullOrEmpty($Value)) { return '' }
    $sha = [Security.Cryptography.SHA256]::Create()
    try {
        $bytes = [Text.Encoding]::UTF8.GetBytes($Value)
        return ([BitConverter]::ToString($sha.ComputeHash($bytes))).Replace('-', '').ToLowerInvariant().Substring(0, 8)
    }
    finally {
        $sha.Dispose()
    }
}

function Test-IsSecretVar {
    param([string]$Name, [string]$Value)
    if ($NonSecretExact -contains $Name) { return $false }
    if (-not [string]::IsNullOrEmpty($Value)) {
        if ($Value -match $SecretValueRx) {
            return $true
        }
    }
    if ($Name -match $SecretNameRx) { return $true }
    return $false
}

function Format-MaskedValue {
    param([string]$Name, [string]$Value)
    if ($null -eq $Value) { return '<unset>' }
    if ($Value.Length -eq 0) { return '<empty>' }
    if (-not (Test-IsSecretVar -Name $Name -Value $Value)) {
        return $Value
    }
    if ($Value.Length -ge 20) {
        return "$($Value.Substring(0, 10))...$($Value.Substring($Value.Length - 4))"
    }
    return "<masked len=$($Value.Length)>"
}

function Get-PoolMeta {
    param([string]$Name)
    foreach ($p in $PoolDefs) {
        if (-not [string]::IsNullOrEmpty($p.match_regex) -and ($Name -match $p.match_regex)) {
            return @{ Pool = [string]$p.name; Rx = [string]$p.format_regex }
        }
    }
    return @{ Pool = 'Ecossistema/Outros'; Rx = '' }
}

function Test-AreExpectedAliases {
    param([string[]]$VarNames)
    foreach ($grp in $ExpectedAliasGroups) {
        $allInGrp = $true
        foreach ($v in $VarNames) {
            if ($grp -notcontains $v) { $allInGrp = $false; break }
        }
        if ($allInGrp) { return $true }
    }
    return $false
}

function Read-RegistryRawMap {
    param([Microsoft.Win32.RegistryKey]$Root, [string]$SubKey)
    $map = @{}
    $key = $Root.OpenSubKey($SubKey, $false)
    if ($null -eq $key) { return $map }
    try {
        foreach ($name in $key.GetValueNames()) {
            if ([string]::IsNullOrEmpty($name)) { continue }
            $val = $key.GetValue($name, $null, [Microsoft.Win32.RegistryValueOptions]::DoNotExpandEnvironmentNames)
            $map[$name] = if ($null -eq $val) { $null } else { [string]$val }
        }
    }
    finally {
        $key.Dispose()
    }
    return $map
}

$hkcuMap = Read-RegistryRawMap -Root ([Microsoft.Win32.Registry]::CurrentUser) -SubKey 'Environment'
$hklmMap = Read-RegistryRawMap -Root ([Microsoft.Win32.Registry]::LocalMachine) -SubKey 'SYSTEM\CurrentControlSet\Control\Session Manager\Environment'

$allNames = @($hkcuMap.Keys + $hklmMap.Keys) |
    Where-Object { $_ -notin $SystemIgnoreVars } |
    Sort-Object -Unique

$rows = New-Object System.Collections.Generic.List[object]
$anomalies = New-Object System.Collections.Generic.List[object]

foreach ($name in $allNames) {
    $meta = Get-PoolMeta -Name $name
    if ($Pool -and ($meta.Pool -notlike "*$Pool*") -and ($name -notlike "*$Pool*")) {
        continue
    }

    $uExists = $hkcuMap.ContainsKey($name)
    $mExists = $hklmMap.ContainsKey($name)
    $u = if ($uExists) { $hkcuMap[$name] } else { $null }
    $m = if ($mExists) { $hklmMap[$name] } else { $null }
    $p = [Environment]::GetEnvironmentVariable($name, 'Process')

    $isSecret = (Test-IsSecretVar -Name $name -Value $u) -or (Test-IsSecretVar -Name $name -Value $m)
    $primaryVal = if (-not [string]::IsNullOrEmpty($u)) { $u } elseif (-not [string]::IsNullOrEmpty($m)) { $m } else { '' }

    $fmtValid = $null
    if ($meta.Rx -and -not [string]::IsNullOrEmpty($primaryVal)) {
        $fmtValid = ($primaryVal -match $meta.Rx)
    }

    $isDummy = ($name -ne 'SOTA_SITE_TOKEN') -and ($primaryVal -match '(?i)(dummy|replace|sua_key|cole_sua_key|placeholder)')
    $syncState = if ($uExists -and $mExists -and ($u -eq $m)) {
        if ([string]::IsNullOrEmpty($u)) { 'BOTH_EMPTY' } else { 'SYNCED' }
    } elseif ($uExists -and -not $mExists) {
        'HKCU_ONLY'
    } elseif (-not $uExists -and $mExists) {
        'HKLM_ONLY'
    } else {
        'DIFF_VALUES'
    }

    $procState = if ($null -eq $p) {
        'UNSET'
    } elseif ($p -eq $primaryVal) {
        'MATCH'
    } else {
        'STALE_OR_DIFF'
    }

    $row = [PSCustomObject]@{
        Variable    = $name
        Pool        = $meta.Pool
        IsSecret    = $isSecret
        HKCU_Mask   = Format-MaskedValue -Name $name -Value $u
        HKCU_Len    = if ($null -eq $u) { 0 } else { $u.Length }
        HKCU_Sha8   = if ($isSecret) { Get-Sha8 -Value $u } else { '' }
        HKLM_Mask   = Format-MaskedValue -Name $name -Value $m
        HKLM_Len    = if ($null -eq $m) { 0 } else { $m.Length }
        HKLM_Sha8   = if ($isSecret) { Get-Sha8 -Value $m } else { '' }
        Sync        = $syncState
        Process     = $procState
        FormatValid = $fmtValid
        IsDummy     = $isDummy
    }
    $rows.Add($row)

    if ($syncState -eq 'DIFF_VALUES') {
        $sev = if ($isSecret) { 'FAIL' } else { 'WARN' }
        $anomalies.Add([PSCustomObject]@{ Severity = $sev; Variable = $name; Pool = $meta.Pool; Issue = 'Valor HKCU difere de HKLM' })
    } elseif ($syncState -eq 'BOTH_EMPTY' -or ($uExists -and [string]::IsNullOrEmpty($u)) -or ($mExists -and [string]::IsNullOrEmpty($m))) {
        $anomalies.Add([PSCustomObject]@{ Severity = 'WARN'; Variable = $name; Pool = $meta.Pool; Issue = 'Entrada vazia (len=0) no Registro' })
    } elseif ($syncState -in @('HKCU_ONLY', 'HKLM_ONLY') -and $isSecret) {
        $anomalies.Add([PSCustomObject]@{ Severity = 'WARN'; Variable = $name; Pool = $meta.Pool; Issue = "Espelhamento incompleto ($syncState)" })
    }
    if ($fmtValid -eq $false) {
        $anomalies.Add([PSCustomObject]@{ Severity = 'FAIL'; Variable = $name; Pool = $meta.Pool; Issue = 'Formato invalido para o pool esperado' })
    }
    if ($isDummy) {
        $anomalies.Add([PSCustomObject]@{ Severity = 'WARN'; Variable = $name; Pool = $meta.Pool; Issue = 'Valor placeholder/dummy detectado' })
    }
    if ($procState -eq 'STALE_OR_DIFF' -and $isSecret -and -not [string]::IsNullOrEmpty($primaryVal)) {
        $anomalies.Add([PSCustomObject]@{ Severity = 'INFO'; Variable = $name; Pool = $meta.Pool; Issue = 'Processo atual herda valor diferente do Registro (reinicie para atualizar)' })
    }
}

# Check intra-pool and cross-pool duplicate secret values
$secretBySha = @{}
foreach ($r in $rows) {
    if (-not $r.IsSecret) { continue }
    $sha = if ($r.HKCU_Sha8) { $r.HKCU_Sha8 } else { $r.HKLM_Sha8 }
    if ([string]::IsNullOrEmpty($sha)) { continue }
    if (-not $secretBySha.ContainsKey($sha)) {
        $secretBySha[$sha] = New-Object System.Collections.Generic.List[object]
    }
    $secretBySha[$sha].Add($r)
}

foreach ($entry in $secretBySha.GetEnumerator()) {
    $items = $entry.Value
    if ($items.Count -le 1) { continue }
    $names = @($items | ForEach-Object { $_.Variable })
    $pools = @($items | ForEach-Object { $_.Pool } | Select-Object -Unique)
    if (Test-AreExpectedAliases -VarNames $names) {
        continue
    }
    $sev = if ($pools.Count -eq 1) { 'FAIL' } else { 'WARN' }
    $anomalies.Add([PSCustomObject]@{
        Severity = $sev
        Variable = ($names -join ', ')
        Pool     = ($pools -join ' / ')
        Issue    = "Chave compartilhada/duplicada (sha8=$($entry.Key))"
    })
}

# Build pool summary
$poolOrder = @($PoolDefs | ForEach-Object { [string]$_.name })

$poolSummaries = New-Object System.Collections.Generic.List[object]
foreach ($pName in $poolOrder) {
    $pRows = @($rows | Where-Object { $_.Pool -eq $pName -and ($_.IsSecret -or $pName -ne 'Ecossistema/Outros') })
    if ($pRows.Count -eq 0) { continue }
    $synced = @($pRows | Where-Object { $_.Sync -eq 'SYNCED' }).Count
    $invalid = @($pRows | Where-Object { $_.FormatValid -eq $false }).Count
    $poolSummaries.Add([PSCustomObject]@{
        Pool         = $pName
        TotalVars    = $pRows.Count
        Synced       = $synced
        InvalidFmt   = $invalid
    })
}

$payload = [PSCustomObject]@{
    Timestamp = (Get-Date).ToString('o')
    Note      = 'Offline registry audit only (no plaintext secrets, no live HTTP probe).'
    Summary   = $poolSummaries
    Anomalies = $anomalies
    Entries   = $rows
}

$pyExe = 'C:\Users\rapha\.gemini\Site\.venv\Scripts\python.exe'
$renderer = Join-Path $PSScriptRoot 'render_key_audit.py'

if ($Json) {
    $jsonOut = [PSCustomObject]@{
        Timestamp = $payload.Timestamp
        Note      = $payload.Note
        Summary   = $payload.Summary
        Anomalies = $payload.Anomalies
        Entries   = if ($AnomaliesOnly) { @() } else { $payload.Entries }
    }
    $jsonOut | ConvertTo-Json -Depth 5
}
elseif (-not $Plain -and (Test-Path -LiteralPath $pyExe) -and (Test-Path -LiteralPath $renderer)) {
    $prevEncoding = $OutputEncoding
    $prevPyIo = $env:PYTHONIOENCODING
    try {
        $utf8NoBom = [Text.UTF8Encoding]::new($false)
        $OutputEncoding = $utf8NoBom
        [Console]::OutputEncoding = $utf8NoBom
        $env:PYTHONIOENCODING = 'utf-8'
        $pyArgs = @($renderer)
        if ($AnomaliesOnly) { $pyArgs += '--anomalies-only' }
        if ($Live) { $pyArgs += '--live' }
        $payload | ConvertTo-Json -Depth 5 -Compress | & $pyExe @pyArgs
    }
    finally {
        $OutputEncoding = $prevEncoding
        $env:PYTHONIOENCODING = $prevPyIo
    }
}
else {
    Write-Host ''
    Write-Host '=== AUDITORIA OFFLINE DE KEYS, POOLS E TIERS (HKCU / HKLM / PROCESS) ===' -ForegroundColor Cyan
    Write-Host 'Escopo: apenas existencia, formato, sha8 e sincronismo (zero texto claro; zero chamada HTTP).' -ForegroundColor DarkGray
    Write-Host ''
    Write-Host '--- RESUMO POR POOL ---' -ForegroundColor Yellow
    $poolSummaries | Format-Table -AutoSize | Out-String | Write-Host

    if (-not $AnomaliesOnly) {
        Write-Host '--- INVENTARIO MASCARADO ---' -ForegroundColor Yellow
        $rows |
            Where-Object { $_.IsSecret } |
            Sort-Object Pool, { [regex]::Replace($_.Variable, '\d+', { param($m) $m.Value.PadLeft(4, '0') }) } |
            Select-Object Pool, Variable, HKCU_Mask, HKCU_Sha8, Sync, Process, FormatValid |
            Format-Table -AutoSize | Out-String | Write-Host
    }

    Write-Host '--- ANOMALIAS E ALERTAS ---' -ForegroundColor Yellow
    if ($anomalies.Count -eq 0) {
        Write-Host 'Nenhuma anomalia detectada.' -ForegroundColor Green
    }
    else {
        $anomalies | Sort-Object Severity, Pool, Variable | Format-Table -AutoSize | Out-String | Write-Host
    }
}

$hasFail = (@($anomalies | Where-Object { $_.Severity -eq 'FAIL' }).Count -gt 0)
$hasWarn = (@($anomalies | Where-Object { $_.Severity -eq 'WARN' }).Count -gt 0)
if ($Strict -and ($hasFail -or $hasWarn)) {
    exit 1
}
exit 0
