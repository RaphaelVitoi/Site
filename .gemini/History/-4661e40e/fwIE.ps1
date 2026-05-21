<#
.SYNOPSIS
    Varredura de Entropia (Sweep Entropy) - Limpeza da Raiz SOTA
.DESCRIPTION
    Identifica duplicatas de scripts que ficaram soltos na raiz,
    move PRDs e SPECs para a pasta correta de documentacao,
    e arquiva o lixo digital mantendo o historico (simetria e seguranca).
#>

Write-Host "=== INICIANDO VARREDURA DE ENTROPIA (CLEANUP SOTA) ===" -ForegroundColor Cyan

$Root = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$ArchiveDir = Join-Path $Root "archive\legacy_root_files"

if (-not (Test-Path $ArchiveDir)) { 
    New-Item -ItemType Directory -Path $ArchiveDir -Force | Out-Null 
}

# 1. Limpeza de Duplicatas de Scripts na Raiz
$RedundantScripts = @("create_agent_documentation.ps1", "deploy_v1.ps1", "invoke_daily_report.ps1")
foreach ($script in $RedundantScripts) {
    $targetPath = Join-Path $Root $script
    if (Test-Path $targetPath) {
        try {
            if (!(Test-Path $ArchiveDir)) { New-Item -ItemType Directory -Force -Path $ArchiveDir | Out-Null }
            Move-Item -Path $targetPath -Destination $ArchiveDir -Force -ErrorAction Stop
            Write-Host "  [MOVIDO] Script redundante arquivado: $script" -ForegroundColor DarkYellow
        }
        catch {
            Write-Warning "Falha ao mover '$script': $($_.Exception.Message)"
        }
    }
}

# 2. Relocacao de PRDs e SPECs soltos na raiz
$DocsDir = Join-Path $Root "docs\tasks\ingestion-pipeline"
if (-not (Test-Path $DocsDir)) { 
    New-Item -ItemType Directory -Path $DocsDir -Force | Out-Null 
}

$OrphanDocs = @("PRD.md", "SPEC.md")
foreach ($doc in $OrphanDocs) {
    $targetPath = Join-Path $Root $doc
    if (Test-Path $targetPath) {
        try {
            Move-Item -Path $targetPath -Destination $DocsDir -Force -ErrorAction Stop
            Write-Host "  [ORGANIZADO] Documento realocado para /docs: $doc" -ForegroundColor Green
        }
        catch {
            Write-Warning "Falha ao mover '$doc': $($_.Exception.Message)"
        }
    }
}

Write-Host "=== VARREDURA CONCLUIDA: RAIZ ESTERILIZADA ===" -ForegroundColor Magenta
Write-Host "Os arquivos obsoletos foram arquivados em: $ArchiveDir" -ForegroundColor DarkGray