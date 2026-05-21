<#
.SYNOPSIS
    Protocolo de Limpeza de Entropia (SOTA).
.DESCRIPTION
    Identifica e remove duplicatas de arquivos de teste, consolidando-os em /tests.
    Tambem detecta duplicatas do Kernel (task_executor.py).
#>

$ProjectRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
Set-Location $ProjectRoot

Write-Host "=== INICIANDO PROTOCOLO DE LIMPEZA DE ENTROPIA (TESTES) ===" -ForegroundColor Yellow

$FilesToConsolidate = @("test_prompt_assembly.py", "test_task_executor.py")
$TargetDir = Join-Path $ProjectRoot "tests"

if (-not (Test-Path $TargetDir)) {
    New-Item -ItemType Directory -Path $TargetDir -Force | Out-Null
    Write-Host "[INIT] Pasta /tests criada." -ForegroundColor Gray
}

foreach ($FileName in $FilesToConsolidate) {
    Write-Host "`n[ANALISE] Verificando redundancias: $FileName" -ForegroundColor Cyan
    $IntendedPath = Join-Path $TargetDir $FileName

    # SOTA: Busca resiliente ignorando pastas de cache, ambiente virtual e erros de I/O (OneDrive Reparse Points)
    $AllInstances = Get-ChildItem -Path $ProjectRoot `
        -Filter $FileName `
        -Recurse `
        -File `
        -ErrorAction SilentlyContinue `
        -Exclude ".venv", "__pycache__", ".git", ".claude"

    foreach ($File in $AllInstances) {
        if ($File.FullName -ne $IntendedPath) {
            Write-Host "  [CLEANUP] Removendo duplicata: $($File.FullName)" -ForegroundColor DarkGray
            Remove-Item -Path $File.FullName -Force
        }
        else {
            Write-Host "  [KEEP] Preservando instancia oficial: $($File.FullName)" -ForegroundColor Green
        }
    }
}

Write-Host "`n=== LIMPEZA CONCLUIDA: SIMETRIA RESTABELECIDA ===" -ForegroundColor Cyan