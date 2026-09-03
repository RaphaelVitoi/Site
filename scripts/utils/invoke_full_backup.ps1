<#
.SYNOPSIS
    Protocolo de Salvaguarda Sistêmica (Full Backup SOTA)
.DESCRIPTION
    1. Clonagem via Robocopy (MT:16) isolando Entropia (node_modules, .venv, lancedb).
    2. Compressão assintótica via System.IO.Compression (Fricção Zero).
    3. Purga efêmera estrutural do diretório Staging.
    4. Log Fantasma e Garbage Collector (Limite de 5 Backups).
#>

# SOTA: Expurgando a dependência do Windows Explorer e I/O relativo que quebra em Background
$ScriptDir = $PSScriptRoot
$SiteDir = Split-Path -Parent (Split-Path -Parent $ScriptDir)
$BackupRoot = Join-Path (Split-Path -Parent $SiteDir) "Backups"

$LogDir = Join-Path $SiteDir ".claude\logs"
if (-not (Test-Path -LiteralPath $LogDir)) { New-Item -ItemType Directory -Path $LogDir -Force | Out-Null }
$LogFile = Join-Path $LogDir "backup_ghost.log"

if (-not (Test-Path -LiteralPath $BackupRoot)) { New-Item -ItemType Directory -Path $BackupRoot -Force | Out-Null }

$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$TempStaging = Join-Path $BackupRoot "Staging_$Timestamp"
$ZipDestination = Join-Path $BackupRoot "Site_GodMode_$Timestamp.zip"

"[$((Get-Date).ToString('yyyy-MM-dd HH:mm:ss'))] [IGNIÇÃO] Processo Fantasma Acionado. Fricção Zero." | Out-File $LogFile -Append -Encoding UTF8

try {
    # SOTA: Expurgar vetores regeneráveis/mutáveis para minimizar entropia informacional
    $ExcludeDirs = @(".git", ".venv", "node_modules", ".lancedb", ".chroma_db", "__pycache__", ".next", ".vscode")
    $ExcludeFiles = @("*.zip", "*.tmp", "*.log")

    "[$((Get-Date).ToString('yyyy-MM-dd HH:mm:ss'))] [ROBOCOPY] Clonagem Assintótica (MT:16)..." | Out-File $LogFile -Append -Encoding UTF8
    $RoboArgs = @($SiteDir, $TempStaging, "/MIR", "/MT:16", "/R:0", "/W:0", "/NFL", "/NDL", "/NJH", "/NJS", "/XD") + $ExcludeDirs + @("/XF") + $ExcludeFiles

    $null = & robocopy @RoboArgs
    if ($LASTEXITCODE -ge 16) {
        throw "Colapso fatal na clonagem Robocopy. Código crítico: $LASTEXITCODE"
    }
    elseif ($LASTEXITCODE -ge 8) {
        "[$((Get-Date).ToString('yyyy-MM-dd HH:mm:ss'))] [AVISO] Robocopy ignorou entropia bloqueada (I/O Lock). Mantendo Autopoiese e prosseguindo..." | Out-File $LogFile -Append -Encoding UTF8
    }

    # Anti-Lock SOTA: Robocopy deixa rastros de I/O por milissegundos. Aguardamos a poeira baixar.
    "[$((Get-Date).ToString('yyyy-MM-dd HH:mm:ss'))] [I/O] Aguardando liberação de handles no OS..." | Out-File $LogFile -Append -Encoding UTF8
    Start-Sleep -Seconds 3

    "[$((Get-Date).ToString('yyyy-MM-dd HH:mm:ss'))] [ZIP] Compressão Térmica via .NET Nativo..." | Out-File $LogFile -Append -Encoding UTF8
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    [System.IO.Compression.ZipFile]::CreateFromDirectory($TempStaging, $ZipDestination, [System.IO.Compression.CompressionLevel]::Optimal, $false)

    "[$((Get-Date).ToString('yyyy-MM-dd HH:mm:ss'))] [PURGA] Destruindo diretório efêmero..." | Out-File $LogFile -Append -Encoding UTF8
    Remove-Item -Recurse -Force -LiteralPath $TempStaging

    # SOTA: Garbage Collector (Retém os últimos 5 backups, obliterando a entropia)
    "[$((Get-Date).ToString('yyyy-MM-dd HH:mm:ss'))] [GARBAGE COLLECTOR] Aplicando teto de entropia (Max 5 backups)..." | Out-File $LogFile -Append -Encoding UTF8
    $OldBackups = Get-ChildItem -Path $BackupRoot -Filter "Site_GodMode_*.zip" | Sort-Object CreationTime -Descending | Select-Object -Skip 5
    if ($OldBackups) {
        foreach ($file in $OldBackups) {
            Remove-Item -Force -LiteralPath $file.FullName
            "[$((Get-Date).ToString('yyyy-MM-dd HH:mm:ss'))] -> Aniquilado: $($file.Name)" | Out-File $LogFile -Append -Encoding UTF8
        }
    }

    "[$((Get-Date).ToString('yyyy-MM-dd HH:mm:ss'))] [SUCESSO ABSOLUTO] Blindagem preservada em: $ZipDestination`n" | Out-File $LogFile -Append -Encoding UTF8
}
catch {
    "[$((Get-Date).ToString('yyyy-MM-dd HH:mm:ss'))] [ERRO CRÍTICO] $($_.Exception.Message)`n" | Out-File $LogFile -Append -Encoding UTF8
    if (Test-Path -LiteralPath $TempStaging) { Remove-Item -Recurse -Force -LiteralPath $TempStaging }
}
