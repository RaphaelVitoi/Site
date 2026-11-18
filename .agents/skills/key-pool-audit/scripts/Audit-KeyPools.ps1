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

$SystemIgnoreVars = @(
    'PSPath', 'PSParentPath', 'PSChildName', 'PSDrive', 'PSProvider',
    'Path', 'PATHEXT', 'ComSpec', 'OS', 'NUMBER_OF_PROCESSORS',
    'PROCESSOR_ARCHITECTURE', 'PROCESSOR_IDENTIFIER', 'PROCESSOR_LEVEL',
    'PROCESSOR_REVISION', 'TEMP', 'TMP', 'USERNAME', 'USERDOMAIN',
    'DriverData', 'OneDrive', 'OneDriveConsumer', 'VBOX_MSI_INSTALL_PATH',
    'windir', 'CUDA_PATH', 'CUDA_PATH_V12_8', 'NVCUDASAMPLES_ROOT',
    'NVM_HOME', 'NVM_SYMLINK', 'PNPM_HOME', 'CARGO_HOME', 'RUSTUP_HOME',
    'PYTHONIOENCODING', 'PYTHONUTF8', 'PSModulePath', 'GOPATH', 'HERMES_HOME',
    'IDENTITY_ENDPOINT', 'IMDS_ENDPOINT', 'ZES_ENABLE_SYSMAN'
)

$NonSecretExact = @(
    'GCP_PROJECT_ID', 'GCP_PROJECT_NUMBER', 'GCP_ACCOUNT_EMAIL',
    'GOOGLE_CLOUD_PROJECT', 'GOOGLE_CLOUD_PROJECT_NUMBER', 'GOOGLE_OAUTH_CLIENT_ID',
    'GITHUB_USER', 'GITHUB_PROFILE_URL', 'DOCKER_USER', 'VERCEL_USER_ID',
    'VERCEL_USERNAME', 'DEVIN_ORG_ID', 'RAGFLOW_API_BASE', 'OLLAMA_EMAIL',
    'OLLAMA_USER', 'OLLAMA_CONTEXT_LENGTH', 'OLLAMA_FLASH_ATTENTION',
    'OLLAMA_KEEP_ALIVE', 'OLLAMA_KV_CACHE_TYPE', 'OLLAMA_MAX_LOADED_MODELS',
    'OLLAMA_VULKAN', 'LLAMA_ARG_FIT', 'LLAMA_ARG_FIT_TARGET', 'SOTA_VRAM_GB',
    'SOTA_OPENAI_AUTH_HEADER', 'SOTA_OPENAI_MODEL', 'SOTA_OPENAI_URL',
    'CHICO_LAYA_PREDICT_ALLOW_CPU', 'NEO4J_AURA_DATABASE', 'NEO4J_AURA_INSTANCE_ID',
    'NEO4J_AURA_MCP_URL', 'NEO4J_AURA_PROJECT_ID', 'NEO4J_AURA_PROJECT_NAME',
    'NEO4J_AURA_QUERY_URL', 'NEO4J_AURA_URI', 'NEO4J_AURA_CLIENT_ID',
    'NEO4J_AURA_AGENT_CLIENT_ID', 'MEDIA_POOL_PROVIDER'
)

$ExpectedAliasGroups = @(
    @('OPENROUTER_API_KEY', 'OPENROUTER_TIER4_KEY_1'),
    @('GEMINI_API_KEY', 'GEMINI_API_KEY_1', 'GEMINI_FLASH_KEY_1'),
    @('GEMINI_API_KEY_2', 'GEMINI_FLASH_KEY_2'),
    @('GEMINI_API_KEY_3', 'GEMINI_FLASH_KEY_3'),
    @('GEMINI_API_KEY_4', 'GEMINI_FLASH_KEY_4'),
    @('GEMINI_API_KEY_5', 'GEMINI_FLASH_KEY_5'),
    @('JULES_API_KEY', 'GOOGLE_JULES_API_KEY'),
    @('STITCH_API_KEY', 'GOOGLE_STITCH_API_KEY'),
    @('GITHUB_TOKEN', 'GH_TOKEN', 'GITHUB_PAT_CLASSIC', 'GITHUB_PERSONAL_ACCESS_TOKEN'),
    @('DEVIN_API_KEY', 'DEVIN_API_KEY_1', 'DEVIN_API_TOKEN_2'),
    @('DEVIN_API_TOKEN', 'DEVIN_API_TOKEN_1', 'DEVIN_API_KEY_2'),
    @('DOCKER_PAT', 'DOCKER_PAT_1'),
    @('RAGFLOW_API_KEY', 'RAGFLOW_API_KEY_1'),
    @('VERCEL_TOKEN', 'VERCEL_TOKEN_1'),
    @('NEO4J_AURA_API_KEY', 'NEO4J_AURA_API_KEY_1')
)

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
        if ($Value -match '^(sk-or-v1-|sk-|AQ\.|AIza|ghp_|github_pat_|sbp_|hf_|vcp_|rnd_|whsec_|GOCSPX-|dckr_pat_|ragflow-|cog_|api-key-)') {
            return $true
        }
    }
    if ($Name -match '(KEY|TOKEN|SECRET|PAT|PASS|PWD|CRED|DECISION_API)') { return $true }
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
    if ($Name -match '^OPENROUTER_TIER1_KEY_\d+$') { return @{ Pool = 'OpenRouter Tier 1'; Rx = '^sk-or-v1-[0-9a-fA-F]{64}$' } }
    if ($Name -match '^OPENROUTER_TIER2_KEY_\d+$') { return @{ Pool = 'OpenRouter Tier 2'; Rx = '^sk-or-v1-[0-9a-fA-F]{64}$' } }
    if ($Name -match '^OPENROUTER_TIER3_KEY_\d+$') { return @{ Pool = 'OpenRouter Tier 3'; Rx = '^sk-or-v1-[0-9a-fA-F]{64}$' } }
    if ($Name -match '^OPENROUTER_TIER4_KEY_\d+$') { return @{ Pool = 'OpenRouter Tier 4'; Rx = '^sk-or-v1-[0-9a-fA-F]{64}$' } }
    if ($Name -match '^OPENROUTER_(ANTIGRAVITY|DEVIN|HERMES|API)_KEY$') { return @{ Pool = 'OpenRouter Dedicadas'; Rx = '^sk-or-v1-[0-9a-fA-F]{64}$' } }
    if ($Name -match '^DECISION_API_\d+$') { return @{ Pool = 'Pool Decision'; Rx = '^(AQ\.|AIza)\S{20,}$' } }
    if ($Name -match '^GEMINI_(API|FLASH)_KEY(_\d+)?$') { return @{ Pool = 'Gemini Texto'; Rx = '^(AQ\.|AIza)\S{20,}$' } }
    if ($Name -match '^GEMINI_(TTS|VIDEO|IMAGE|TRANSLATE)_KEY(_\d+)?$') { return @{ Pool = 'Multimodal AI Studio'; Rx = '^(AQ\.|AIza)\S{20,}$' } }
    if ($Name -match '^OPENROUTER_GEMINI_(TTS|VIDEO|IMAGE|TRANSLATE)_KEY(_\d+)?$') { return @{ Pool = 'Multimodal OpenRouter'; Rx = '^sk-or-v1-[0-9a-fA-F]{64}$' } }
    if ($Name -match '^OLLAMA_(API|CLOUD)_KEY$') { return @{ Pool = 'Ollama Cloud'; Rx = '^[0-9a-fA-F]+\.\S+$' } }
    if ($Name -match '^(ANTHROPIC|CLAUDE|OPENAI)_') { return @{ Pool = 'Providers Pendentes/Extras'; Rx = '' } }
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
$poolOrder = @(
    'OpenRouter Tier 1', 'OpenRouter Tier 2', 'OpenRouter Tier 3', 'OpenRouter Tier 4',
    'OpenRouter Dedicadas', 'Pool Decision', 'Gemini Texto',
    'Multimodal AI Studio', 'Multimodal OpenRouter', 'Ollama Cloud', 'Providers Pendentes/Extras', 'Ecossistema/Outros'
)

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
