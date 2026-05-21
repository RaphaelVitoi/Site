<#
.SYNOPSIS
    Engenharia do Caos SOTA. Testa resiliencia injetando falhas controladas.
#>
param (
    [string]$Intensity = 'low',
    [string]$Target = 'worker',
    [string]$ScriptDirectory
)

Write-Host '=== [PROTOCOLO DE ENTROPIA] ENGENHARIA DO CAOS ===' -ForegroundColor Red
Write-Host "  > Nivel de Intensidade : $Intensity" -ForegroundColor Yellow
Write-Host "  > Alvo da Infeccao     : $Target" -ForegroundColor Yellow
Write-Host '---------------------------------------------------' -ForegroundColor DarkGray

$env:TS_NODE_COMPILER_OPTIONS = '{"module":"CommonJS"}'
$ChaosScript = Join-Path $ScriptDirectory 'scripts\tests\chaos-core.ts'

if (-not (Test-Path -LiteralPath $ChaosScript)) {
    Write-Error "[FAIL] O motor de Engenharia do Caos nao foi encontrado em: $ChaosScript."
    return
}

$NpxCmd = if (Get-Command 'npx.cmd' -ErrorAction SilentlyContinue) { 'npx.cmd' } else { 'npx' }
& $NpxCmd ts-node "$ChaosScript" --intensity $Intensity --target $Target
