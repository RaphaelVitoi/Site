<#
.SYNOPSIS
    Provisionamento de Ambiente SOTA (State of the Art).
    Garante Zero-Entropia no workspace da IA com I/O nativo .NET.
#>
#Requires -Version 5.1

function Set-AgentEnvironment {
    $vscodeDir = Join-Path $PSScriptRoot ".vscode"
    $settingsPath = Join-Path $vscodeDir "settings.json"

    if (-not (Test-Path $vscodeDir)) { New-Item -ItemType Directory -Path $vscodeDir -Force | Out-Null }

    # Topologia de Configuração Estrita (Ordem Garantida)
    $optimizedSettings = [ordered]@{
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

    foreach ($key in $optimizedSettings.Keys) { $currentSettings[$key] = $optimizedSettings[$key] }

    # Serialização determinística profunda e I/O nativo
    $jsonOutput = $currentSettings | ConvertTo-Json -Depth 10 -Compress:$false
    [System.IO.File]::WriteAllText($settingsPath, $jsonOutput, [System.Text.Encoding]::UTF8)
    
    Write-Output "[KERNEL] Ambiente unificado e selado contra entropia."
}

Set-AgentEnvironment
