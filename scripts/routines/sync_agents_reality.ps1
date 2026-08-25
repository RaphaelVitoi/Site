<#
.SYNOPSIS
    Sincroniza a realidade das pastas com os agentes listados no Manifesto SOTA.
.DESCRIPTION
    Le o agents_manifest.json e verifica se os arquivos `.claude/agents/<agente>.md`
    e `.claude/agent-memory/<agente>/MEMORY.md` existem. Se nao existirem, cria-os.
#>

$ProjectRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$ManifestPath = Join-Path $ProjectRoot 'data\agents_manifest.json'

if (-not (Test-Path $ManifestPath)) {
    Write-Error "CRITICAL: Manifesto nao encontrado em $ManifestPath"
    exit 1
}

$Manifest = Get-Content $ManifestPath -Raw | ConvertFrom-Json
$AgentNames = $Manifest.PSObject.Properties.Name

# SOTA: Resiliencia contra colisoes de I/O (Locks de VSCode, Antivirus, NexusFileWatcher)
function Write-TextSOTA {
    param([string]$Path, [string]$Content, [System.Text.Encoding]$Encoding)
    for ($i = 0; $i -lt 5; $i++) {
        try {
            [System.IO.File]::WriteAllText($Path, $Content, $Encoding)
            return
        }
        catch {
            if ($i -eq 4) { throw }
            Start-Sleep -Milliseconds 100
        }
    }
}

$AgentCount = $AgentNames.Count
Write-Host "=== VERIFICANDO ALINHAMENTO FRACTAL DOS $AgentCount AGENTES ===" -ForegroundColor Cyan

$Utf8NoBom = New-Object System.Text.UTF8Encoding $false

foreach ($Agent in $AgentNames) {
    $AgentProps = $Manifest.$Agent
    $Color = if ($AgentProps.color) { $AgentProps.color } else { 'white' }

    # NAO embutir o modelo no documento gerado.
    # Ate 2026-08-21 esta linha era:
    #   $Model = if ($AgentProps.primary_model) { ... } else { 'meta-llama/...' }
    # e o template gravava **Motor Base:** `$Model` nos 19 .md. O resultado:
    # documentacao repetindo um valor que vive no manifesto, envelhecendo em
    # silencio — os arquivos commitados diziam `gemini-2.5-pro` enquanto o
    # manifesto ja estava em `gemini-3.5-flash-lite`, duas geracoes a frente.
    # O documento agora aponta para a fonte em vez de copia-la.
    $MotorBase = 'roteado dinamicamente — ver `data/agents_manifest.json` (preferencia) e `llm/routing_policy.py` (modelo concreto)'

    $AgentDocPath = Join-Path $ProjectRoot ".claude\agents\$($Agent).md"
    $MemoryDir = Join-Path $ProjectRoot ".claude\agent-memory\$Agent"
    $MemoryPath = Join-Path $MemoryDir 'MEMORY.md'

    $AgentDir = Split-Path $AgentDocPath
    if (-not (Test-Path $AgentDir)) {
        New-Item -ItemType Directory -Path $AgentDir -Force | Out-Null
    }

    # SOBRESCRITA SOTA: O Manifesto e a fonte absoluta. A identidade base SEMPRE e atualizada.
    $RoutingPattern = if ($AgentProps.routing_pattern) { $AgentProps.routing_pattern } else { 'N/A' }
    $SkillsList = if ($AgentProps.skills) { ($AgentProps.skills | ForEach-Object { "- ``$_``" }) -join "`n" } else { "- N/A" }
    $ScriptsList = if ($AgentProps.specialized_scripts) { ($AgentProps.specialized_scripts | ForEach-Object { "- ``$_``" }) -join "`n" } else { "- N/A" }

    $Template = "# Identidade e Escopo: @$Agent`n`n**Cor Emblematica:** ``$Color`` | **Motor Base:** $MotorBase`n`n$($AgentProps.identidade)`n`n## Competencias`n$($AgentProps.competencias)`n`n## Skills Especializadas`n$SkillsList`n`n## Scripts & Ferramentas Integradas`n$ScriptsList`n`n## Sinergia`n$($AgentProps.sinergia)`n`n## Gatilho de Roteamento (routing_pattern)`n``$RoutingPattern``"
    Write-TextSOTA -Path $AgentDocPath -Content $Template -Encoding $Utf8NoBom
    Write-Host "[ + ] Identidade sincronizada para @$Agent (Skills & Scripts integrados)" -ForegroundColor Green

    if (-not (Test-Path $MemoryDir)) {
        New-Item -ItemType Directory -Path $MemoryDir -Force | Out-Null
    }

    if (-not (Test-Path $MemoryPath)) {
        $MemTemplate = "# MEMORIA SIMBIOTICA - @$Agent`n`n> **Status:** Ativo e Otimizado (``$Model``) | **Aura:** ``$Color`` `n> **Padroes:** $($AgentProps.padroes)`n`n## Reflexoes e Insight SOTA`n- A aguardar a primeira interacao expansiva no novo Kernel.`n`n## Propostas Evolutivas`n- $($AgentProps.proposta)"
        Write-TextSOTA -Path $MemoryPath -Content $MemTemplate -Encoding $Utf8NoBom
        Write-Host "[ + ] Memoria base criada para @$Agent" -ForegroundColor Green
    }
}

Write-Host "`n[OK] Simetria SOTA garantida. Todas as entidades materializadas." -ForegroundColor Magenta
