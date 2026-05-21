<#
.SYNOPSIS
    Trava de comportamento global e independente para a IDE (VS Code).
.DESCRIPTION
    Injeta as regras SOTA de Honestidade Radical diretamente no AppData do Windows.
    Independe de qualquer script do projeto e sobrevive a atualizações do orquestrador.
#>

[CmdletBinding()]
param(
    [switch]$Quiet
)

$ErrorActionPreference = 'Stop'
if (-not $Quiet) { Write-Host '=== ANCORANDO DIRETRIZES SOTA NA IDE GLOBAL ===' -ForegroundColor Cyan }

$CustomInstructions = Get-Content -Path (Join-Path $PSScriptRoot '..\.vscode\gemini-codeassist-custom-instructions.md') -Raw

$VsCodeSettingsPaths = @(
    "$env:APPDATA\Code\User\settings.json",
    "$env:APPDATA\Code - Insiders\User\settings.json"
)

foreach ($SettingsPath in $VsCodeSettingsPaths) {
    if (Test-Path $SettingsPath) {
        try {
            $RawContent = Get-Content -Path $SettingsPath -Raw
            # Limpa comentários que quebram o parser nativo do PowerShell
            $CleanedJson = $RawContent -replace '(?s)/\*.*?\*/', '' -replace '(?m)^[ \t]*//.*$', ''
            $JsonObj = $CleanedJson | ConvertFrom-Json
            
            $PropertyExists = $null -ne $JsonObj.PSObject.Properties['gemini.codeAssist.customSystemInstructions']
            if ($PropertyExists -and $JsonObj.'gemini.codeAssist.customSystemInstructions' -eq $CustomInstructions) {
                continue
            }

            # Injeta a lei brutal
            $JsonObj | Add-Member -MemberType NoteProperty -Name 'gemini.codeAssist.customSystemInstructions' -Value $CustomInstructions -Force
            
            # Sobrescreve o arquivo global
            $FinalJson = $JsonObj | ConvertTo-Json -Depth 20 -Compress:$false
            [System.IO.File]::WriteAllText($SettingsPath, $FinalJson, [System.Text.Encoding]::UTF8)
            
            if (-not $Quiet) { Write-Host "[OK] Lei Marcial gravada com sucesso em: $SettingsPath" -ForegroundColor Green }
        }
        catch {
            if (-not $Quiet) { Write-Host "[ALERTA] Falha ao injetar em $SettingsPath (Possível erro de parsing do JSON). Detalhe: $_" -ForegroundColor Yellow }
        }
    }
}

if (-not $Quiet) { Write-Host "`nOperação independente concluída. O comportamento do Gemini está travado no SO." -ForegroundColor Magenta }