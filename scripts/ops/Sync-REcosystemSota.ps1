<#
.SYNOPSIS
    Sincronizador e orquestrador SOTA do ecossistema R, JGD e extensões REditorSupport.

.DESCRIPTION
    Gerencia, valida e harmoniza o ambiente de desenvolvimento R de alta performance:
    - Pacote R 'jgd' (JSON Graphics Device via r-universe / CRAN)
    - Extensão VS Code / Antigravity 'reditorsupport.r' (pre-release)
    - Extensões 'reditorsupport.r-syntax' e 'rdebugger.r-debugger'
    - Pacotes essenciais: languageserver, lintr, styler, httpgd, svglite, vscDebugger
    - Configurações estritas no .vscode/settings.json

.PARAMETER ForceUpdate
    Força a reinstalação / atualização dos pacotes e extensões mesmo se já instalados.

.EXAMPLE
    pwsh -File scripts/ops/Sync-REcosystemSota.ps1
#>

[CmdletBinding()]
param(
    [switch]$ForceUpdate,
    [switch]$SkipSmokeTest
)

$ErrorActionPreference = "Stop"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "   SOTA R & JGD ECOSYSTEM ORCHESTRATOR — REditorSupport     " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# 1. Localização e Garantia do Executável R
$rBin = "C:\Program Files\R\R-4.6.1\bin"
$rExe = Join-Path $rBin "R.exe"
$rScriptExe = Join-Path $rBin "Rscript.exe"

if (-not (Test-Path $rExe)) {
    $found = Get-Command R.exe -ErrorAction SilentlyContinue
    if ($found) {
        $rExe = $found.Source
        $rBin = Split-Path $rExe
        $rScriptExe = Join-Path $rBin "Rscript.exe"
    } else {
        throw "R.exe não encontrado em $rBin e nem no PATH do sistema."
    }
}

Write-Host "[1/5] R Runtime detectado: $rExe" -ForegroundColor Green

# Garantir no PATH da sessão e usuário
$userPath = [System.Environment]::GetEnvironmentVariable("Path", "User")
if ($userPath -notlike "*$rBin*") {
    [System.Environment]::SetEnvironmentVariable("Path", "$userPath;$rBin", "User")
    Write-Host "      -> Adicionado $rBin ao PATH permanente do Usuário." -ForegroundColor Gray
}
if ($env:Path -notlike "*$rBin*") {
    $env:Path = "$env:Path;$rBin"
}

# 2. Instalação e Atualização dos Pacotes R SOTA
Write-Host "[2/5] Validando pacotes R (jgd, languageserver, vscDebugger, httpgd, svglite)..." -ForegroundColor Yellow

$rBootstrapCode = @'
options(repos = c(
    reditorsupport = "https://reditorsupport.r-universe.dev",
    manuelhentschel = "https://manuelhentschel.r-universe.dev",
    cran = "https://cloud.r-project.org"
))

pkgs <- c("jgd", "languageserver", "lintr", "styler", "httpgd", "svglite", "vscDebugger", "systemfonts", "jsonlite")
installed <- rownames(installed.packages())

to_install <- if (exists("force_update") && isTRUE(force_update)) pkgs else setdiff(pkgs, installed)

if (length(to_install) > 0) {
    message("Instalando: ", paste(to_install, collapse = ", "))
    install.packages(to_install, lib = .libPaths()[1])
} else {
    message("Todos os pacotes R mandatários estão instalados.")
}

info <- sapply(pkgs, function(p) {
    if (p %in% rownames(installed.packages())) as.character(packageVersion(p)) else "NÃO INSTALADO"
})
cat("\n--- Status dos Pacotes R ---\n")
print(data.frame(Pacote = names(info), Versao = unname(info)))
'@

$forceFlag = if ($ForceUpdate) { "force_update <- TRUE`n" } else { "force_update <- FALSE`n" }
$fullRCode = $forceFlag + $rBootstrapCode

& $rScriptExe -e $fullRCode

# 3. Validar e Sincronizar Extensões no VS Code e Antigravity IDE
Write-Host "`n[3/5] Verificando extensões IDE (reditorsupport.r, syntax, debugger)..." -ForegroundColor Yellow

$codeCmd = Get-Command code.cmd, code -ErrorAction SilentlyContinue | Select-Object -First 1
if ($codeCmd) {
    Write-Host "      -> Atualizando extensões via VS Code CLI..." -ForegroundColor Gray
    & $codeCmd.Source --install-extension REditorSupport.r --pre-release | Out-Null
    & $codeCmd.Source --install-extension RDebugger.r-debugger | Out-Null
}

$antigravityExtDir = "C:\Users\rapha\.antigravity-ide\extensions"
$vscodeExtDir = "C:\Users\rapha\.vscode\extensions"

if (Test-Path $antigravityExtDir) {
    Write-Host "      -> Sincronizando extensões no Antigravity IDE..." -ForegroundColor Gray
    # Garantir que rdebugger está replicado se necessário
    $rdbgSrc = Get-ChildItem $vscodeExtDir -Filter "rdebugger.r-debugger*" | Select-Object -First 1
    if ($rdbgSrc) {
        $destPath = Join-Path $antigravityExtDir "$($rdbgSrc.Name)-universal"
        if (-not (Test-Path $destPath)) {
            Copy-Item -Recurse -Force $rdbgSrc.FullName $destPath
            Write-Host "         Replicado $($rdbgSrc.Name) para o Antigravity IDE." -ForegroundColor Green
        }
    }
}

# 4. Validar Configuração no settings.json
Write-Host "`n[4/5] Conferindo configurações no .vscode/settings.json..." -ForegroundColor Yellow
$settingsFile = "c:\Users\rapha\.gemini\Site\.vscode\settings.json"
if (Test-Path $settingsFile) {
    $settingsText = Get-Content $settingsFile -Raw
    if ($settingsText -match '"r\.plot\.backend":\s*"jgd"') {
        Write-Host "      -> r.plot.backend = 'jgd' [OK]" -ForegroundColor Green
    } else {
        Write-Warning "      -> r.plot.backend precisa ser 'jgd' no settings.json"
    }
    if ($settingsText -match '"r\.lsp\.enabled":\s*true') {
        Write-Host "      -> r.lsp.enabled = true [OK]" -ForegroundColor Green
    }
    if ($settingsText -match '"r\.executablePath":' -and $settingsText -match '"r\.rpath\.windows":') {
        Write-Host "      -> r.executablePath e r.rpath.windows sincronizados [OK]" -ForegroundColor Green
    } else {
        Write-Warning "      -> r.executablePath e r.rpath.windows devem estar definidos e em sincronia"
    }
}

# 5. Smoke Test de Execução
if (-not $SkipSmokeTest) {
    Write-Host "`n[5/5] Executando Smoke Test SOTA no R & JGD..." -ForegroundColor Yellow
    $smokeTestCode = @'
library(jgd)
cat("[SMOKE TEST] Pacote jgd carregado com sucesso!\n")
cat("[SMOKE TEST] Versao jgd:", as.character(packageVersion("jgd")), "\n")
cat("[SMOKE TEST] LSP status:", requireNamespace("languageserver", quietly = TRUE), "\n")
cat("[SMOKE TEST] Debugger status:", requireNamespace("vscDebugger", quietly = TRUE), "\n")
cat("[SMOKE TEST] Simulação de ambiente e verificação de funções exportadas:\n")
stopifnot(exists("jgd", mode = "function"))
stopifnot(exists("jgd_frame_ext", mode = "function"))
cat("[SMOKE TEST] Todos os testes passaram sem erros. Ecossistema 100% harmonizado!\n")
'@
    & $rScriptExe -e $smokeTestCode
}

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "   ECOSSISTEMA R + JGD CONCLUÍDO COM SUCESSO               " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
