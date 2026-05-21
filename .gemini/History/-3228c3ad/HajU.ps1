<#
.SYNOPSIS
    Sincroniza a realidade das pastas com os 18 agentes listados no Manifesto SOTA.
.DESCRIPTION
    Le o agents_manifest.json e verifica se os arquivos `.claude/agents/<agente>.md`
    e `.claude/agent-memory/<agente>/MEMORY.md` existem. Se nao existirem, cria-os.
#>

$ProjectRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$ManifestPath = Join-Path $ProjectRoot "data\agents_manifest.json"

if (-not (Test-Path $ManifestPath)) {
    Write-Error "CRITICAL: Manifesto nao encontrado em $ManifestPath"
    exit 1
}

$Manifest = Get-Content $ManifestPath -Raw | ConvertFrom-Json
$AgentNames = $Manifest.PSObject.Properties.Name

Write-Host "=== VERIFICANDO ALINHAMENTO FRACTAL DOS 18 AGENTES ===" -ForegroundColor Cyan

foreach ($Agent in $AgentNames) {
    $AgentProps = $Manifest.$Agent
    $Color = if ($AgentProps.color) { $AgentProps.color } else { "white" }
    $Model = if ($AgentProps.gemini_model) { $AgentProps.gemini_model } else { "gemini-1.5-flash" }

    $AgentDocPath = Join-Path $ProjectRoot ".claude\agents\$($Agent).md"
    $MemoryDir = Join-Path $ProjectRoot ".claude\agent-memory\$Agent"
    $MemoryPath = Join-Path $MemoryDir "MEMORY.md"

    # SOBRESCRITA SOTA: O Manifesto e a fonte absoluta. A identidade base SEMPRE e atualizada.
    $Template = "# Identidade e Escopo: @$Agent`n`n**Cor Emblematica:** `$Color` | **Motor Base:** `$Model` `n`n$($AgentProps.identidade)`n`n## Competencias`n$($AgentProps.competencias)`n`n## Sinergia`n$($AgentProps.sinergia)"
    Set-Content -Path $AgentDocPath -Value $Template -Encoding UTF8
    Write-Host "[+] Identidade sincronizada para @$Agent" -ForegroundColor Green

    if (-not (Test-Path $MemoryDir)) {
        New-Item -ItemType Directory -Path $MemoryDir -Force | Out-Null
    }

    if (-not (Test-Path $MemoryPath)) {
        $MemTemplate = "# MEMORIA SIMBIOTICA - @$Agent`n`n> **Status:** Ativo e Otimizado (`$Model`) | **Aura:** `$Color` `n> **Padroes:** $($AgentProps.padroes)`n`n## Reflexoes e Insight SOTA`n- A aguardar a primeira interacao expansiva no novo Kernel.`n`n## Propostas Evolutivas`n- $($AgentProps.proposta)"
        Set-Content -Path $MemoryPath -Value $MemTemplate -Encoding UTF8
        Write-Host "[+] Memoria base criada para @$Agent" -ForegroundColor Green
    }
}

Write-Host "`n[OK] Simetria SOTA garantida. Todas as entidades materializadas." -ForegroundColor Magenta