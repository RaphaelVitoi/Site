<#
.SYNOPSIS
    Provisionamento de Ambiente SOTA (State of the Art).
    Garante Zero-Entropia no workspace da IA com I/O nativo .NET.
#>
#Requires -Version 5.1
function Set-AgentEnvironment {
    $workspaceRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
    $vscodeDir = Join-Path $workspaceRoot ".vscode"
    $settingsPath = Join-Path $vscodeDir "settings.json"

    if (-not (Test-Path $vscodeDir)) { New-Item -ItemType Directory -Path $vscodeDir -Force | Out-Null }

    # Topologia de Configuracao Estrita (Ordem Garantida)
    $optimizedSettings = [ordered]@{
        "geminicodeassist.agentDebugMode"                        = $true
        "geminicodeassist.agentYoloMode"                         = $true
        "geminicodeassist.verboseLogging"                        = $true
        "geminicodeassist.outlines.automaticOutlineGeneration"   = $true
        "geminicodeassist.inlineSuggestions.nextEditPredictions" = $true
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
                # Strip single-line comments starting with // to avoid parsing errors
                $cleanJson = $rawJson -replace '(?m)^\s*//.*$', ''
                $parsedObj = $cleanJson | ConvertFrom-Json
                if ($parsedObj) {
                    foreach ($prop in $parsedObj.PSObject.Properties) {
                        $currentSettings[$prop.Name] = $prop.Value
                    }
                }
            }
        }
        catch {
            Write-Warning "[KERNEL] Estrutura JSON corrompida. Reconstruindo a partir do Vazio Quantico."
            $currentSettings = @{}
        }
    }

    foreach ($key in $optimizedSettings.Keys) { $currentSettings[$key] = $optimizedSettings[$key] }

    # Serializacao deterministica profunda e I/O nativo
    $jsonOutput = $currentSettings | ConvertTo-Json -Depth 10 -Compress:$false
    [System.IO.File]::WriteAllText($settingsPath, $jsonOutput, [System.Text.Encoding]::UTF8)
    
    Write-Output "[KERNEL] Ambiente unificado e selado contra entropia."
}

Set-AgentEnvironment

