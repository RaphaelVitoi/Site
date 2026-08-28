[CmdletBinding()]
param(
    [ValidateSet('core', 'local-ai', 'research-browser', 'security-aikido', 'performance-ci', 'media-studio')]
    [string]$Profile = 'core',
    [switch]$DryRun,
    [switch]$CheckAll
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$profilePath = Join-Path $repositoryRoot '.claude\plugin-profiles.json'
$settingsPath = Join-Path $repositoryRoot '.claude\settings.json'
$profileConfig = Get-Content -Raw -LiteralPath $profilePath | ConvertFrom-Json

function Test-Executable {
    param([Parameter(Mandatory = $true)][string]$Name)
    return $null -ne (Get-Command $Name -ErrorAction SilentlyContinue | Select-Object -First 1)
}

function Test-ProfileRequirements {
    param([Parameter(Mandatory = $true)]$ProfileDefinition)

    $failures = New-Object System.Collections.Generic.List[string]
    foreach ($command in @($ProfileDefinition.requirements.commands)) {
        if (-not (Test-Executable -Name $command)) {
            $failures.Add("comando ausente: $command")
        }
    }
    foreach ($variableName in @($ProfileDefinition.requirements.environment)) {
        if ([string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable($variableName, 'Process'))) {
            $failures.Add("variável de ambiente ausente no processo: $variableName")
        }
    }
    foreach ($check in @($ProfileDefinition.requirements.checks)) {
        switch ($check) {
            'ollama-list' {
                if (Test-Executable -Name 'ollama') {
                    & ollama list *> $null
                    if ($LASTEXITCODE -ne 0) {
                        $failures.Add('Ollama não respondeu a "ollama list"')
                    }
                }
            }
            'python-3.12' {
                if (Test-Executable -Name 'uv') {
                    & uv python find 3.12 *> $null
                    if ($LASTEXITCODE -ne 0) {
                        $failures.Add('Python 3.12 não está resolvível por uvx')
                    }
                }
            }
            'browser-use-cli' {
                if (Test-Executable -Name 'uvx') {
                    & uvx --python 3.12 --from 'browser-use[cli]==0.13.8' browser-use --help *> $null
                    if ($LASTEXITCODE -ne 0) {
                        $failures.Add('Browser Use MCP 0.13.8 não inicializou pelo uvx')
                    }
                }
            }
            'linux-host' {
                if ($env:OS -eq 'Windows_NT') {
                    $failures.Add('perfil permitido somente em CI Linux')
                }
            }
            default {
                $failures.Add("check desconhecido no perfil: $check")
            }
        }
    }
    return @($failures)
}

function Get-InstalledPluginIds {
    $claude = Get-Command 'claude' -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($null -eq $claude) {
        $fallback = 'C:\Users\rapha\.local\bin\claude.exe'
        if (Test-Path -LiteralPath $fallback) {
            $claude = Get-Item -LiteralPath $fallback
        }
    }
    if ($null -eq $claude) {
        throw 'Claude Code não foi encontrado no PATH nem no fallback local.'
    }
    $installed = @(& $claude.Source plugin list --json 2>$null | ConvertFrom-Json)
    return @($installed | ForEach-Object { $_.id })
}

function Write-ProfileCheck {
    param([Parameter(Mandatory = $true)]$ProfileDefinition)

    $failures = @(Test-ProfileRequirements -ProfileDefinition $ProfileDefinition)
    [pscustomobject]@{
        Profile = $ProfileDefinition.id
        Activation = $ProfileDefinition.activation
        Ready = ($failures.Count -eq 0)
        Failures = if ($failures.Count -eq 0) { '' } else { $failures -join '; ' }
    }
}

if ($CheckAll) {
    $profileConfig.profiles | ForEach-Object { Write-ProfileCheck -ProfileDefinition $_ } | Format-Table -Wrap -AutoSize
    exit 0
}

$selected = @($profileConfig.profiles | Where-Object { $_.id -eq $Profile }) | Select-Object -First 1
if ($null -eq $selected) {
    throw "Perfil não encontrado: $Profile"
}

$profileFailures = @(Test-ProfileRequirements -ProfileDefinition $selected)
if ($profileFailures.Count -gt 0) {
    throw "Perfil '$Profile' não foi ativado: $($profileFailures -join '; ')"
}

$enabledIds = New-Object System.Collections.Generic.List[string]
foreach ($id in @($profileConfig.corePluginIds)) {
    $enabledIds.Add($id)
}
foreach ($id in @($selected.pluginIds)) {
    $enabledIds.Add($id)
}

$additionalCount = $enabledIds.Count - @($profileConfig.corePluginIds).Count
if ($additionalCount -gt [int]$profileConfig.maximumAdditionalProfiles) {
    throw "A configuração excederia o limite de $($profileConfig.maximumAdditionalProfiles) perfil adicional."
}

$installedIds = Get-InstalledPluginIds
$missingIds = @($enabledIds | Where-Object { $_ -notin $installedIds })
if ($missingIds.Count -gt 0) {
    throw "Plugins não instalados: $($missingIds -join ', ')"
}

$result = [pscustomobject]@{
    Profile = $selected.id
    Activation = $selected.activation
    EnabledPluginCount = $enabledIds.Count
    EnabledPluginIds = $enabledIds -join ', '
    DryRun = [bool]$DryRun
}

if ($DryRun) {
    $result
    exit 0
}

$settings = Get-Content -Raw -LiteralPath $settingsPath | ConvertFrom-Json
$enabledPlugins = [ordered]@{}
foreach ($id in $enabledIds) {
    $enabledPlugins[$id] = $true
}
if ($settings.PSObject.Properties.Name -contains 'enabledPlugins') {
    $settings.enabledPlugins = $enabledPlugins
} else {
    $settings | Add-Member -NotePropertyName 'enabledPlugins' -NotePropertyValue $enabledPlugins
}

$userProfile = [Environment]::GetFolderPath('UserProfile')
$backupRoot = Join-Path $userProfile '.claude\backups\plugin-profile-switches'
New-Item -ItemType Directory -Force -Path $backupRoot | Out-Null
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backupPath = Join-Path $backupRoot ("site-settings-$stamp.json")
Copy-Item -LiteralPath $settingsPath -Destination $backupPath -Force

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$json = $settings | ConvertTo-Json -Depth 20 -Compress
[System.IO.File]::WriteAllText($settingsPath, "$json`n", $utf8NoBom)

$result | Add-Member -NotePropertyName 'BackupPath' -NotePropertyValue $backupPath
$result
