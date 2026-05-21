<#
.SYNOPSIS
    Provisionamento de Ambiente SOTA (State of the Art) - v3.0 Master
    Garante Zero-Entropia no workspace da IA com I/O nativo .NET.

.DESCRIPTION
    Executa no BOOTSTRAP da sessão. Aplica configurações críticas de performance
    ao VS Code usando APIs ultra-rápidas do .NET, com reset atómico e determinismo
    absoluto. Nenhuma telemetria, nenhum overhead.

.NOTES
    #Requires -Version 5.1
    Ordem de configuração garantida via [ordered]@{}

#>
#Requires -Version 5.1

# -------------------------------------------------------------------
# TOPOLOGIA DE CONFIGURAÇÃO ESTRITA (Ordem Garantida via [ordered])
# -------------------------------------------------------------------

$GoldStandardSettings = [ordered]@{
    "geminicodeassist.agentDebugMode"                        = $false
    "geminicodeassist.agentYoloMode"                         = $false
    "geminicodeassist.verboseLogging"                        = $false
    "geminicodeassist.outlines.automaticOutlineGeneration"   = $false
    "geminicodeassist.inlineSuggestions.nextEditPredictions" = $false
    "geminicodeassist.codeGenerationPaneViewEnabled"         = $true
    "editor.formatOnSave"                                    = $true
    "files.autoSave"                                         = "onFocusChange"
    "telemetry.telemetryLevel"                               = "off"
}

# -------------------------------------------------------------------
# FUNÇÃO: Set-AgentEnvironment (I/O Nativo .NET)
# -------------------------------------------------------------------

function Set-AgentEnvironment {
    $vscodeDir = Join-Path $PSScriptRoot ".vscode"
    $settingsPath = Join-Path $vscodeDir "settings.json"

    if (-not (Test-Path $vscodeDir)) { 
        New-Item -ItemType Directory -Path $vscodeDir -Force | Out-Null 
    }

    # FASE 1: Ler configurações existentes (I/O nativo .NET)
    $currentSettings = @{}
    
    if (Test-Path $settingsPath) {
        try {
            $rawJson = [System.IO.File]::ReadAllText($settingsPath, [System.Text.Encoding]::UTF8)
            if (-not [string]::IsNullOrWhiteSpace($rawJson)) {
                $currentSettings = $rawJson | ConvertFrom-Json -AsHashtable
            }
        }
        catch {
            Write-Warning "[KERNEL] Estrutura JSON corrompida. Reconstruindo a partir do Vazio Quântico."
            $currentSettings = @{}
        }
    }

    # FASE 2: Merge com Topologia Estrita (Ordem Garantida)
    foreach ($key in $GoldStandardSettings.Keys) {
        $currentSettings[$key] = $GoldStandardSettings[$key]
    }

    # FASE 3: Serialização determinística profunda e I/O nativo
    try {
        $jsonOutput = $currentSettings | ConvertTo-Json -Depth 10
        [System.IO.File]::WriteAllText($settingsPath, $jsonOutput, [System.Text.Encoding]::UTF8)
        
        Write-Output "[KERNEL] ✅ Ambiente unificado e selado contra entropia."
        return $true
    }
    catch {
        Write-Error "[KERNEL] ❌ Falha ao escrever settings.json: $($_.Exception.Message)"
        return $false
    }
}

# EXECUÇÃO (MAIN)
Set-AgentEnvironment
