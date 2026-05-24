param(
	[switch]$InstallMissing,
	[switch]$ReportOnly
)

$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$codeCmd = Join-Path $env:LOCALAPPDATA 'Programs\Microsoft VS Code\bin\code.cmd'
$extensionsConfigPath = Join-Path $projectRoot '.vscode\extensions.json'
$userDataDir = Join-Path $projectRoot '.vscode\.site-optimal-userdata'

if (!(Test-Path $codeCmd)) {
	throw "VS Code CLI nao encontrado em: $codeCmd"
}

if (!(Test-Path $extensionsConfigPath)) {
	throw "Arquivo de extensoes nao encontrado em: $extensionsConfigPath"
}

if (!(Test-Path $userDataDir)) {
	New-Item -ItemType Directory -Path $userDataDir -Force | Out-Null
}

$extensionsConfig = Get-Content $extensionsConfigPath -Raw | ConvertFrom-Json
$allowList = @($extensionsConfig.recommendations | Sort-Object -Unique)
$installedList = @(
	& $codeCmd --user-data-dir $userDataDir --list-extensions 2>$null |
	ForEach-Object {
		if ($_ -match '^([^@]+)') { $matches[1].Trim() }
	} |
	Where-Object { $_ } |
	Sort-Object -Unique
)

$missingList = @($allowList | Where-Object { $_ -notin $installedList })
$disableList = @($installedList | Where-Object { $_ -notin $allowList })

Write-Output "Workspace: $projectRoot"
Write-Output "Allowlist count: $($allowList.Count)"
Write-Output "Installed count: $($installedList.Count)"
Write-Output "Missing recommended: $($missingList.Count)"
Write-Output "Will disable in Site-Optimal profile: $($disableList.Count)"

if ($missingList.Count -gt 0) {
	Write-Output ''
	Write-Output 'Missing recommended extensions:'
	$missingList | ForEach-Object { Write-Output " - $_" }
}

if ($disableList.Count -gt 0) {
	Write-Output ''
	Write-Output 'Extensions disabled by Site-Optimal profile:'
	$disableList | ForEach-Object { Write-Output " - $_" }
}

if ($ReportOnly) {
	return
}

if ($InstallMissing -and $missingList.Count -gt 0) {
	foreach ($extensionId in $missingList) {
		Write-Output "Installing: $extensionId"
		& $codeCmd --user-data-dir $userDataDir --install-extension $extensionId --force
	}
}

$launchArgs = @(
	'--user-data-dir',
	$userDataDir,
	'--profile',
	'Site-Optimal',
	$projectRoot
)

foreach ($extensionId in $disableList) {
	$launchArgs += '--disable-extension'
	$launchArgs += $extensionId
}

Start-Process -FilePath $codeCmd -ArgumentList $launchArgs
