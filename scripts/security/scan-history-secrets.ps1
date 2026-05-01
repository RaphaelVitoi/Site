[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"

$patterns = @(
    "AIza[0-9A-Za-z_-]{20,}",
    "sk-or-v1-[A-Za-z0-9]{20,}",
    "sk-[A-Za-z0-9]{20,}"
)

$paths = @("_env.ps1", ".env", ".env.local", "frontend/.env", "frontend/.env.local")

Write-Host "== Secret History Scan ==" -ForegroundColor Cyan

foreach ($path in $paths) {
    $commits = git rev-list --all -- $path 2>$null
    if (-not $commits) { continue }

    $count = ($commits | Measure-Object).Count
    Write-Host ""
    Write-Host "Path: $path (commits: $count)" -ForegroundColor Yellow

    foreach ($commit in $commits) {
        $blob = git show "$commit`:$path" 2>$null
        if (-not $blob) { continue }

        $hitPatterns = @()
        foreach ($pattern in $patterns) {
            if ($blob -match $pattern) {
                $hitPatterns += $pattern
            }
        }

        if ($hitPatterns.Count -gt 0) {
            Write-Host "  - $commit :: $($hitPatterns -join ', ')" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "Scan concluído." -ForegroundColor Green
