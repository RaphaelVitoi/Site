<#
.SYNOPSIS
    Dashboard de Health-Check e Inteligência (Agentes)
.DESCRIPTION
    Analisa a estrutura .claude/agent-memory/ e exibe a saúde, engajamento e as tags aprendidas.
#>

Write-Host "=== [SENTINELA] DASHBOARD DE SAÚDE DOS AGENTES ===" -ForegroundColor Cyan

$MemoryDir = Join-Path $PSScriptRoot ".claude\agent-memory"

if (-not (Test-Path $MemoryDir)) {
    Write-Host "[ERROR] Diretório de memória não encontrado." -ForegroundColor Red
    exit
}

Write-Host "Agente           | Insights/Tags | Status/Última Modificação" -ForegroundColor DarkGray
Write-Host "-----------------|---------------|--------------------------"

Get-ChildItem -Path $MemoryDir -Directory | ForEach-Object {
    $AgentName = $_.Name
    $MemFile = Join-Path $_.FullName "MEMORY.md"
    
    if (Test-Path $MemFile) {
        $Content = Get-Content $MemFile -Raw
        $TagCount = ([regex]::Matches($Content, "#[a-zA-Z0-9_]+")).Count
        $LastUpdate = (Get-Item $MemFile).LastWriteTime.ToString("yyyy-MM-dd HH:mm")
        
        Write-Host "$($AgentName.PadRight(16)) | $($TagCount.ToString().PadRight(13)) | $LastUpdate [OK]" -ForegroundColor Green
    }
}