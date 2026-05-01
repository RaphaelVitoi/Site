[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"

function Get-StagedFiles {
    $files = git diff --cached --name-only --diff-filter=ACMR
    if (-not $files) { return @() }
    return $files | Where-Object { $_ -and $_.Trim().Length -gt 0 }
}

function Get-StagedContent {
    param([Parameter(Mandatory = $true)][string]$Path)
    try {
        return git show ":$Path"
    } catch {
        return ""
    }
}

$blockedFiles = @(
    "_env.ps1",
    ".env",
    ".env.local",
    ".env.production",
    ".env.development"
)

$secretPatterns = @(
    "AIza[0-9A-Za-z_-]{20,}",
    "sk-or-v1-[A-Za-z0-9]{20,}",
    "sk-[A-Za-z0-9]{20,}",
    "-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----"
)

$stagedFiles = Get-StagedFiles
if ($stagedFiles.Count -eq 0) {
    Write-Host "[pre-commit] nenhum arquivo staged para validar."
    exit 0
}

$violations = @()

foreach ($file in $stagedFiles) {
    $normalized = $file.Replace("\", "/")
    $leaf = Split-Path -Leaf $normalized

    if ($blockedFiles -contains $leaf) {
        $violations += "Arquivo sensível staged: $normalized"
        continue
    }

    if ($normalized -match "\.(png|jpg|jpeg|gif|webp|ico|pdf|zip|db|sqlite)$") {
        continue
    }

    $content = Get-StagedContent -Path $normalized
    if (-not $content) { continue }

    foreach ($pattern in $secretPatterns) {
        if ($content -match $pattern) {
            $violations += "Possível segredo em $normalized (pattern: $pattern)"
            break
        }
    }
}

if ($violations.Count -gt 0) {
    Write-Host ""
    Write-Host "[pre-commit] bloqueado por política de segredos:" -ForegroundColor Red
    $violations | ForEach-Object { Write-Host " - $_" -ForegroundColor Red }
    Write-Host ""
    Write-Host "Ação: mova segredos para cofre/variáveis de ambiente e refaça o commit." -ForegroundColor Yellow
    exit 1
}

Write-Host "[pre-commit] política de segredos: OK" -ForegroundColor Green
exit 0
