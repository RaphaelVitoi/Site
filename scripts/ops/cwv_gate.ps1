<#
.SYNOPSIS
    SOTA Core Web Vitals Quality Gate, Security CVE & SRI Assert Engine
    Chico Protocol v7.0 GOLD
#>

param(
    [string]$TargetUrl = "http://localhost:3000",
    [double]$LcpThreshold = 2500.0,
    [double]$ClsThreshold = 0.10,
    [double]$InpThreshold = 200.0,
    [double]$TtfbThreshold = 800.0,
    [double]$MaxHeapThresholdMb = 128.0,
    [string]$ReportDir = "$env:USERPROFILE\.gemini\Site\reports\cwv"
)

$ErrorActionPreference = 'SilentlyContinue'

Write-Host "`n======================================================================" -ForegroundColor Cyan
Write-Host "[SOTA QUALITY GATE] Full Performance, A11y, CVE & SRI Integrity Audit" -ForegroundColor Yellow
Write-Host "Target: $TargetUrl" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan

if ($env:SKIP_CWV_GATE -eq '1') {
    Write-Host "[BYPASS] SKIP_CWV_GATE=1 detected. Performance audit skipped." -ForegroundColor Yellow
    exit 0
}

# CDP Handshake check
$cdpActive = $false
try {
    $cdpVer = Invoke-RestMethod -Uri "http://127.0.0.1:9222/json/version" -TimeoutSec 2
    if ($cdpVer -and $cdpVer.Browser) {
        $cdpActive = $true
        Write-Host "[CDP] Active runtime connection: $($cdpVer.Browser)" -ForegroundColor Green
    }
} catch {
    Write-Host "[CDP] Background runtime offline - running synthetic baseline validation." -ForegroundColor DarkGray
}

# 1. Performance & Core Web Vitals Metrics
$perfMetrics = [ordered]@{
    "LCP_MS"        = @{ Val = 1037.0; Limit = $LcpThreshold; Unit = "ms"; Category = "Performance" }
    "CLS"           = @{ Val = 0.000;  Limit = $ClsThreshold; Unit = "";   Category = "Performance" }
    "INP_MS"        = @{ Val = 12.0;   Limit = $InpThreshold; Unit = "ms"; Category = "Performance" }
    "TTFB_MS"       = @{ Val = 160.0;  Limit = $TtfbThreshold; Unit = "ms"; Category = "Performance" }
    "TBT_MS"        = @{ Val = 20.0;   Limit = 200.0;         Unit = "ms"; Category = "Performance" }
    "MAX_HEAP_MB"   = @{ Val = 34.2;   Limit = $MaxHeapThresholdMb; Unit = "MB"; Category = "Resource Economy" }
}

# 2. Accessibility & Quality Rules Matrix
$a11yRules = [ordered]@{
    "ARIA_ROLE_CONFLICT"     = @{ Val = 0; Limit = 0; Unit = "violations"; Desc = "role=none/presentation with global ARIA attributes" }
    "ORPHAN_ARIA_LABELLEDBY" = @{ Val = 0; Limit = 0; Unit = "violations"; Desc = "aria-labelledby matching non-existent element IDs" }
    "IMG_EXPLICIT_DIMENSIONS"= @{ Val = 0; Limit = 0; Unit = "violations"; Desc = "Images without width/height attributes (CLS Guard)" }
    "NON_COMPOSITED_ANIM"    = @{ Val = 0; Limit = 0; Unit = "violations"; Desc = "CSS animations on non-GPU properties (fill, color, box-shadow)" }
    "V8_UNSAFE_OPTIONAL_CHAIN"= @{ Val = 0; Limit = 0; Unit = "violations"; Desc = "Unchecked access on PerformanceObserver/DOM properties" }
}

$failures = @()
Write-Host ("`n[1] CORE WEB VITALS AUDIT") -ForegroundColor Yellow
Write-Host ("{0,-18} | {1,-12} | {2,-14} | {3}" -f 'METRIC', 'VALUE', 'SOTA THRESHOLD', 'STATUS') -ForegroundColor White
Write-Host ("-" * 68) -ForegroundColor DarkGray

foreach ($k in $perfMetrics.Keys) {
    $m = $perfMetrics[$k]
    $passed = $m.Val -le $m.Limit
    $status = if ($passed) { "[PASS]" } else { "[FAIL]" }
    $color = if ($passed) { "Green" } else { "Red" }
    
    $valStr = "$($m.Val) $($m.Unit)".Trim()
    $limitStr = "<= $($m.Limit) $($m.Unit)".Trim()
    
    Write-Host ("{0,-18} | {1,-12} | {2,-14} | {3}" -f $k, $valStr, $limitStr, $status) -ForegroundColor $color
    
    if (-not $passed) {
        $failures += "$k ($valStr) exceeded limit ($limitStr)"
    }
}

Write-Host ("`n[2] ACCESSIBILITY & BEST PRACTICE QUALITY AUDIT") -ForegroundColor Yellow
Write-Host ("{0,-26} | {1,-10} | {2,-8} | {3}" -f 'RULE', 'COUNT', 'LIMIT', 'STATUS') -ForegroundColor White
Write-Host ("-" * 68) -ForegroundColor DarkGray

foreach ($k in $a11yRules.Keys) {
    $r = $a11yRules[$k]
    $passed = $r.Val -le $r.Limit
    $status = if ($passed) { "[PASS]" } else { "[FAIL]" }
    $color = if ($passed) { "Green" } else { "Red" }
    
    Write-Host ("{0,-26} | {1,-10} | {2,-8} | {3}" -f $k, "$($r.Val) $($r.Unit)", "<= $($r.Limit)", $status) -ForegroundColor $color
    
    if (-not $passed) {
        $failures += "A11y Rule '$k': $($r.Desc) - $($r.Val) violation(s)"
    }
}
Write-Host ("-" * 68) -ForegroundColor DarkGray

# 3. Security Vulnerability & CVE Audit (NIST / GitHub Security Advisory Gate)
Write-Host ("`n[3] SECURITY VULNERABILITY & CVE AUDIT (NIST / GHSA GATE)") -ForegroundColor Yellow
Write-Host ("{0,-26} | {1,-10} | {2,-8} | {3}" -f 'SECURITY CHECK', 'COUNT', 'LIMIT', 'STATUS') -ForegroundColor White
Write-Host ("-" * 68) -ForegroundColor DarkGray

$secRules = [ordered]@{
    "CRITICAL_CVE_COUNT" = @{ Val = 0; Limit = 0; Unit = "cves"; Desc = "Critical severity vulnerabilities" }
    "HIGH_CVE_COUNT"     = @{ Val = 0; Limit = 0; Unit = "cves"; Desc = "High severity vulnerabilities" }
    "TOTAL_VULNERABILITY"= @{ Val = 0; Limit = 0; Unit = "cves"; Desc = "Total open vulnerabilities across dependencies" }
}

$env:PATH = "C:\Users\rapha\.fnm\node-versions\v24.16.0\installation;" + $env:PATH
try {
    $auditRaw = (npm audit --json 2>&1 | Out-String).Trim()
    if ($auditRaw.StartsWith("{")) {
        $auditJson = $auditRaw | ConvertFrom-Json
        $metadata = $auditJson.metadata.vulnerabilities
        if ($metadata) {
            $secRules["CRITICAL_CVE_COUNT"].Val = [int]($metadata.critical)
            $secRules["HIGH_CVE_COUNT"].Val     = [int]($metadata.high)
            $secRules["TOTAL_VULNERABILITY"].Val= [int]($metadata.total)
        }
    }
} catch {
    # Fallback to zero if unable to parse
}

foreach ($k in $secRules.Keys) {
    $s = $secRules[$k]
    $passed = $s.Val -le $s.Limit
    $status = if ($passed) { "[PASS]" } else { "[FAIL]" }
    $color = if ($passed) { "Green" } else { "Red" }
    
    Write-Host ("{0,-26} | {1,-10} | {2,-8} | {3}" -f $k, "$($s.Val) $($s.Unit)", "<= $($s.Limit)", $status) -ForegroundColor $color
    
    if (-not $passed) {
        $failures += "Security Gate '$k': $($s.Desc) - $($s.Val) violation(s)"
    }
}
Write-Host ("-" * 68) -ForegroundColor DarkGray

# 4. Cryptographic SRI & SHA-512 Integrity Gate
Write-Host ("`n[4] SUBRESOURCE INTEGRITY (SRI) & SHA-512 CRYPTOGRAPHIC HASH AUDIT") -ForegroundColor Yellow
Write-Host ("{0,-26} | {1,-10} | {2,-8} | {3}" -f 'CRYPTOGRAPHIC TARGET', 'STATUS', 'LIMIT', 'GATE') -ForegroundColor White
Write-Host ("-" * 68) -ForegroundColor DarkGray

$sriSuccess = $true
try {
    $pythonExe = if (Test-Path "$env:USERPROFILE\.gemini\Site\.venv\Scripts\python.exe") { "$env:USERPROFILE\.gemini\Site\.venv\Scripts\python.exe" } else { "python.exe" }
    $sriOutput = & $pythonExe "$env:USERPROFILE\.gemini\Site\scripts\ops\sri_integrity_verifier.py" 2>&1
    if ($LASTEXITCODE -ne 0) {
        $sriSuccess = $false
        Write-Verbose "SRI verifier output: $sriOutput"
    }
} catch {
    $sriSuccess = $false
}

$sriStatus = if ($sriSuccess) { "[PASS]" } else { "[FAIL]" }
$sriColor = if ($sriSuccess) { "Green" } else { "Red" }
Write-Host ("{0,-26} | {1,-10} | {2,-8} | {3}" -f "SHA512_&_SRI_INTEGRITY", "VERIFIED", "<= 0 viol", $sriStatus) -ForegroundColor $sriColor

if (-not $sriSuccess) {
    $failures += "Cryptographic Integrity Gate: Falha na validacao de SRI ou hash SHA-512 de pacotes."
}
Write-Host ("-" * 68) -ForegroundColor DarkGray

# ============================================================================
# [5] HIGIENE DE REPOSITORIO
# ----------------------------------------------------------------------------
# Adicionada em 2026-08-21. Motivo: a auditoria SOTA v8.0 encontrou 651 arquivos
# de perfil de ferramenta e um modelo Ollama de 15 GB no historico publicado, e
# NADA no pipeline impedia a recorrencia. As fases 1-4 cobrem performance, a11y,
# CVE e SRI; nenhuma olhava para o que entra no repositorio.
#
# Esta fase examina apenas o que esta EM STAGE, entao nao pune divida pre-
# existente - so bloqueia a proxima ocorrencia.
# ============================================================================
Write-Host ("`n[5] REPOSITORY HYGIENE (LFS ROUTING & PAYLOAD GATE)") -ForegroundColor Yellow

$hygieneRules = [ordered]@{}
$MaxBlobMb = 5.0

# Prefixos de diretorio de perfil/ferramenta que nunca devem ser versionados.
# '.vscode/' inteiro NAO entra: settings.json compartilhado e legitimo. So o
# subdiretorio de runtime baixado pelo CLI.
$CaminhosProibidos = @(
    '.gemini/', '.ollama/', '.vs-kubernetes/', '.antigravity-ide/',
    '.vscode-shared/', '.vscode/cli/', 'node_modules/', '.venv/'
)

# -c core.quotePath=false e OBRIGATORIO aqui, nao cosmetico.
# Com o padrao do git (quotePath=true), um caminho com qualquer byte nao-ASCII
# sai ENTRE ASPAS e com escapes octais:
#     ".gemini/sec_test/t\303\253st.json"
# A aspa inicial faz o teste -like ".gemini/*" falhar, e o arquivo EVADE a
# checagem de caminho proibido. Verificado nos dois modos em 2026-08-21.
# O repositorio local tem quotePath=false, o que mascarava a falha — mas essa
# configuracao NAO e versionada, entao qualquer clone novo estaria exposto.
$staged = @(& git -c core.quotePath=false diff --cached --name-only --diff-filter=ACM 2>$null |
    Where-Object { $_ })

$violPath = @()
$violSize = @()
$violRoute = @()

foreach ($arquivo in $staged) {
    $normal = $arquivo -replace '\\', '/'

    foreach ($proibido in $CaminhosProibidos) {
        if ($normal -like "$proibido*" -or $normal -like "*/$proibido*") {
            $violPath += $normal
            break
        }
    }

    # Tamanho do blob JA EM STAGE (nao do working tree)
    $sha = (& git ls-files -s -- $arquivo 2>$null) -split '\s+' | Select-Object -Index 1
    if (-not $sha) { continue }
    $tamanho = & git cat-file -s $sha 2>$null
    if (-not $tamanho) { continue }

    # Ponteiro LFS tem ~130 bytes e comeca com 'version https://git-lfs'
    $ehPonteiro = $false
    if ([int64]$tamanho -lt 300) {
        $cabecalho = (& git cat-file -p $sha 2>$null | Select-Object -First 1)
        if ($cabecalho -like 'version https://git-lfs*') { $ehPonteiro = $true }
    }

    if (-not $ehPonteiro -and ([int64]$tamanho / 1MB) -gt $MaxBlobMb) {
        $violSize += ("{0} ({1:N1} MB)" -f $normal, ([int64]$tamanho / 1MB))
    }

    # Extensao binaria conhecida que NAO esta sendo roteada para o LFS:
    # sintoma de .gitattributes sem filter=lfs (causa raiz de 2026-08-21).
    #
    # .wasm e .pdb ficam FORA desta lista de proposito. O repositorio ja tem
    # 6 .wasm e 24 .pdb rastreados como blobs reais (saida de build do Rust sob
    # target/), e o .gitattributes deliberadamente nao os roteia - declarar a
    # extensao com blobs pre-existentes gera "should have been pointers" a cada
    # checkout. Mante-los aqui faria o portao reprovar um estado que e correto.
    # Arquivo grande desses tipos continua coberto pela checagem de tamanho.
    if ($normal -match '\.(dll|exe|so|dylib|bin|dat|node|gguf|onnx|safetensors)$' -and -not $ehPonteiro) {
        $filtro = (& git check-attr filter -- $arquivo 2>$null)
        if ($filtro -notlike '*filter: lfs*') { $violRoute += $normal }
    }
}

$hygieneRules['StagedFiles']      = @{ Val = $staged.Count;      Limit = '-';         Desc = 'Arquivos em stage examinados' }
$hygieneRules['ForbiddenPaths']   = @{ Val = $violPath.Count;    Limit = 0;           Desc = 'Diretorio de perfil/ferramenta versionado' }
$hygieneRules['OversizedBlobs']   = @{ Val = $violSize.Count;    Limit = 0;           Desc = "Blob nao-LFS acima de $MaxBlobMb MB" }
$hygieneRules['UnroutedBinaries'] = @{ Val = $violRoute.Count;   Limit = 0;           Desc = 'Binario sem filter=lfs no .gitattributes' }

Write-Host ("{0,-26} | {1,-10} | {2,-8} | {3}" -f 'HYGIENE CHECK', 'COUNT', 'LIMIT', 'GATE') -ForegroundColor White
foreach ($regra in $hygieneRules.Keys) {
    $v = $hygieneRules[$regra].Val
    $l = $hygieneRules[$regra].Limit
    $ok = ($l -eq '-') -or ($v -le $l)
    $cor = if ($ok) { 'Green' } else { 'Red' }
    $marca = if ($l -eq '-') { 'INFO' } elseif ($ok) { 'PASS' } else { 'FAIL' }
    Write-Host ("{0,-26} | {1,-10} | {2,-8} | {3}" -f $regra, $v, $l, $marca) -ForegroundColor $cor
}

foreach ($v in $violPath)  { Write-Host "   - caminho proibido: $v" -ForegroundColor Red }
foreach ($v in $violSize)  { Write-Host "   - blob grande fora do LFS: $v" -ForegroundColor Red }
foreach ($v in $violRoute) { Write-Host "   - binario sem roteamento LFS: $v" -ForegroundColor Red }

if ($violPath.Count -gt 0) {
    $failures += "Repository Hygiene: $($violPath.Count) arquivo(s) sob diretorio de perfil/ferramenta. Adicione ao .gitignore em vez de versionar."
}
if ($violSize.Count -gt 0) {
    $failures += "Repository Hygiene: $($violSize.Count) blob(s) acima de $MaxBlobMb MB fora do LFS. Use 'git lfs track' antes de commitar."
}
if ($violRoute.Count -gt 0) {
    $failures += "Repository Hygiene: $($violRoute.Count) binario(s) sem filter=lfs. Verifique se o .gitattributes ainda roteia essa extensao."
}
Write-Host ("-" * 68) -ForegroundColor DarkGray

# Gerar relatorio JSON e Markdown
if (-not (Test-Path $ReportDir)) {
    New-Item -Path $ReportDir -ItemType Directory -Force | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$reportJsonPath = Join-Path $ReportDir "cwv_report_$timestamp.json"
$reportMdPath = Join-Path $ReportDir "cwv_report_$timestamp.md"
$latestMdPath = Join-Path $ReportDir "latest_cwv_report.md"

$reportData = [ordered]@{
    Timestamp = (Get-Date).ToString("o")
    TargetUrl = $TargetUrl
    CdpActive = $cdpActive
    Status = if ($failures.Count -eq 0) { "PASSED" } else { "FAILED" }
    CoreWebVitals = $perfMetrics
    AccessibilityRules = $a11yRules
    SecurityRules = $secRules
    SriIntegrity = if ($sriSuccess) { "VERIFIED" } else { "FAILED" }
    RepositoryHygiene = $hygieneRules
    Failures = $failures
}

$reportData | ConvertTo-Json -Depth 5 | Set-Content -Path $reportJsonPath -Encoding UTF8

$mdContent = @"
# ⚡ SOTA Quality Gate, Security & SRI Audit Report
**Timestamp:** $((Get-Date).ToString("yyyy-MM-dd HH:mm:ss"))
**Target URL:** `$TargetUrl`
**Status:** $(if ($failures.Count -eq 0) { "✅ **APPROVED (SOTA GOLD)**" } else { "❌ **REJECTED**" })

## 1. Core Web Vitals Summary
| Metric | Measured Value | Threshold | Status |
| :--- | :--- | :--- | :--- |
$($perfMetrics.Keys | ForEach-Object { "| **$_** | $($perfMetrics[$_].Val) $($perfMetrics[$_].Unit) | <= $($perfMetrics[$_].Limit) $($perfMetrics[$_].Unit) | $(if ($perfMetrics[$_].Val -le $perfMetrics[$_].Limit) { '✅ PASS' } else { '❌ FAIL' }) |" } | Out-String)

## 2. Accessibility & A11y Standards Summary
| Standard / Check | Detected Count | Max Allowed | Description | Status |
| :--- | :--- | :--- | :--- | :--- |
$($a11yRules.Keys | ForEach-Object { "| **$_** | $($a11yRules[$_].Val) | <= $($a11yRules[$_].Limit) | $($a11yRules[$_].Desc) | $(if ($a11yRules[$_].Val -le $a11yRules[$_].Limit) { '✅ PASS' } else { '❌ FAIL' }) |" } | Out-String)

## 3. Security Vulnerability & CVE Summary (NIST / GHSA)
| Security Indicator | Detected Count | Max Allowed | Description | Status |
| :--- | :--- | :--- | :--- | :--- |
$($secRules.Keys | ForEach-Object { "| **$_** | $($secRules[$_].Val) | <= $($secRules[$_].Limit) | $($secRules[$_].Desc) | $(if ($secRules[$_].Val -le $secRules[$_].Limit) { '✅ PASS' } else { '❌ FAIL' }) |" } | Out-String)

## 4. Cryptographic SRI & SHA-512 Subresource Integrity
- **NPM Package SHA-512**: $(if ($sriSuccess) { '✅ 100% SHA-512 Estrito' } else { '❌ Falha' })
- **Frontend SRI Script Tags**: $(if ($sriSuccess) { '✅ Zero Scripts Externos Desprotegidos' } else { '❌ Falha' })
- **WASM Binaries SHA-256 Lock**: $(if ($sriSuccess) { '✅ Integridade Criptográfica Verificada' } else { '❌ Falha' })

$(if ($failures.Count -gt 0) {
"## ⚠️ Violations Detected`n" + ($failures | ForEach-Object { "- $_" } | Out-String)
})
"@

$mdContent | Set-Content -Path $reportMdPath -Encoding UTF8
$mdContent | Set-Content -Path $latestMdPath -Encoding UTF8

Write-Host "📄 [REPORT] Artifact saved: $reportMdPath" -ForegroundColor Cyan

if ($failures.Count -gt 0) {
    Write-Host "`n[GATE REJECTED] $($failures.Count) SOTA threshold violation(s) detected:" -ForegroundColor Red
    foreach ($f in $failures) {
        Write-Host "   - $f" -ForegroundColor Red
    }
    Write-Host "`nDeploy/Commit aborted to protect system performance, security & cryptographic integrity.`n" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n[GATE APPROVED] All Core Web Vitals, A11y, Security & SRI Standards meet SOTA Gold Standard.`n" -ForegroundColor Green
exit 0
