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
    [double]$TbtThreshold = 200.0,
    [double]$TtfbThreshold = 800.0,
    [double]$MaxHeapThresholdMb = 128.0,
    [int[]]$CdpPorts = @(9223, 9222),
    [string]$ReportDir = "",
    [string]$A11yReviewBaselinePath = "",
    [string]$CwvManualReviewPath = "",
    [string]$LighthouseArtifactPath = ""
)

$ErrorActionPreference = 'SilentlyContinue'
$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\\..')).Path
if ([string]::IsNullOrWhiteSpace($ReportDir)) {
    $ReportDir = Join-Path $RepoRoot 'reports\cwv'
}
if ([string]::IsNullOrWhiteSpace($A11yReviewBaselinePath)) {
    $A11yReviewBaselinePath = Join-Path $RepoRoot 'data\a11y_manual_review_baselines.json'
}
if ([string]::IsNullOrWhiteSpace($CwvManualReviewPath)) {
    $CwvManualReviewPath = Join-Path $RepoRoot 'data\cwv_manual_review_records.json'
}
if ([string]::IsNullOrWhiteSpace($LighthouseArtifactPath)) {
    $LighthouseArtifactPath = Join-Path $RepoRoot 'reports\cwv\latest_lighthouse_production.json'
}

Write-Host "`n======================================================================" -ForegroundColor Cyan
Write-Host "[SOTA QUALITY GATE] Full Performance, A11y, CVE & SRI Integrity Audit" -ForegroundColor Yellow
Write-Host "Target: $TargetUrl" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan

# 2026-08-27 (POSTULADO-001, item B): o bypass SKIP_CWV_GATE foi REMOVIDO.
#
# Ele contradizia o proprio pipeline: o wrapper que chama este script imprime
# "bypass via --no-verify ou SKIP_CWV_GATE e proibido", enquanto o script o
# implementava. Uma variavel de ambiente pulava as CINCO fases — inclusive a de
# higiene, que existe porque 651 arquivos de perfil e um modelo de 15 GB ja
# entraram no historico publicado.
#
# A governanca e explicita: "Nao contornar hook que falha. Investigar o achado
# antes de mexer na regra." Logo nao existe bypass legitimo, e manter um
# desligado por convencao era manter uma porta destrancada com um aviso colado.
#
# Se o portao falhar por causa do AMBIENTE (npm ausente, venv quebrada), a saida
# e consertar o ambiente — a falha e o achado, nao um obstaculo ao achado.
if ($env:SKIP_CWV_GATE -eq '1') {
    Write-Host "[BYPASS RECUSADO] SKIP_CWV_GATE nao e mais honrado (POSTULADO-001)." -ForegroundColor Yellow
    Write-Host "                  O portao vai executar normalmente." -ForegroundColor Yellow
}

# CDP Handshake check. O perfil administrativo canonico usa 9223; 9222 fica
# como compatibilidade para a instancia padrao legada.
$cdpActive = $false
$cdpPort = $null
foreach ($port in $CdpPorts) {
    try {
        $cdpVer = Invoke-RestMethod -Uri "http://127.0.0.1:$port/json/version" -TimeoutSec 2
        if ($cdpVer -and $cdpVer.Browser) {
            $cdpActive = $true
            $cdpPort = $port
            Write-Host "[CDP] Active runtime connection on ${port}: $($cdpVer.Browser)" -ForegroundColor Green
            break
        }
    } catch {
        continue
    }
}
if (-not $cdpActive) {
    Write-Host "[CDP] Runtime indisponivel nas portas $($CdpPorts -join ', '). CWV e A11y permanecerao NAO MEDIDOS." -ForegroundColor Yellow
}

# 1. Observações de performance e cobertura de Core Web Vitals.
#
# O probe coleta dados do navegador real, mas não sintetiza um teste de
# interação humana nem um trace laboratorial. Event Timing observado não é INP
# e a soma de long tasks do Next dev não é TBT. Ambos ficam explícitos como
# diagnósticos, sem receber selo de métrica normativa.
$perfMetrics = [ordered]@{
    "LCP_MS"                        = @{ Val = $null; Limit = $LcpThreshold;        Unit = "ms"; Category = "Performance";      Enforcement = "Fail";    Desc = "Maior pintura observada no navegador" }
    "CLS"                           = @{ Val = $null; Limit = $ClsThreshold;        Unit = "";   Category = "Performance";      Enforcement = "Fail";    Desc = "Deslocamento visual cumulativo observado" }
    "TBT_MS"                        = @{ Val = $null; Limit = $TbtThreshold;        Unit = "ms"; Category = "Performance";      Enforcement = "Fail";    Desc = "Total Blocking Time calculado pelo Lighthouse em build de producao e Chrome isolado" }
    "TTFB_MS"                       = @{ Val = $null; Limit = $TtfbThreshold;       Unit = "ms"; Category = "Performance";      Enforcement = "Fail";    Desc = "Resposta inicial observada via Navigation Timing" }
    "MAX_HEAP_MB"                   = @{ Val = $null; Limit = $MaxHeapThresholdMb; Unit = "MB"; Category = "Resource Economy"; Enforcement = "Fail";    Desc = "Heap JavaScript observado" }
    "OBSERVED_EVENT_LATENCY_MS"     = @{ Val = $null; Limit = $null;                Unit = "ms"; Category = "Diagnostic";       Enforcement = "Observe"; Desc = "Event Timing observado; não certifica INP sem interação humana" }
    "OBSERVED_LONG_TASK_BLOCKING_MS" = @{ Val = $null; Limit = $null;                Unit = "ms"; Category = "Diagnostic";       Enforcement = "Observe"; Desc = "Soma de long tasks observada; não equivale a TBT laboratorial" }
}

# 2. Accessibility & Quality Rules Matrix
$a11yRules = [ordered]@{
    "AXE_VIOLATIONS" = @{ Val = $null; Limit = 0; Unit = "violations"; Enforcement = "Fail"; Desc = "Violacoes detectadas por axe-core no DOM renderizado" }
    "AXE_INCOMPLETE" = @{ Val = $null; Limit = 0; Unit = "items"; Enforcement = "Warn"; Desc = "Regras axe que exigem revisao humana"; ManualReview = $null }
}

$failures = @()

# 2026-08-27: $warnings era LIDO nas linhas do veredito e nunca declarado nem
# populado. O estado FRAGIL (AMARELO) era, portanto, inalcancavel e o tri-state
# funcionava como bi-state. Declarado aqui para que o canal de aviso exista.
$warnings = @()

# Cada estado nao verde precisa sobreviver ate o console, JSON e Markdown com
# sua causa verificavel e uma acao proporcional. Texto generico como
# "entropia moderada" nao permite distinguir uma medicao ausente de uma
# regressao medida, nem orientar a proxima verificacao.
function Add-QualityFinding {
    param(
        [Parameter(Mandatory = $true)]
        [ValidateSet('ERROR', 'WARNING')]
        [string]$Severity,
        [Parameter(Mandatory = $true)]
        [string]$Component,
        [Parameter(Mandatory = $true)]
        [string]$Detail,
        [Parameter(Mandatory = $true)]
        [string]$Reason,
        [Parameter(Mandatory = $true)]
        [string]$Action
    )

    $finding = [pscustomobject]@{
        Severity  = $Severity
        Component = $Component
        Detail    = $Detail
        Reason    = $Reason
        Action    = $Action
    }

    if ($Severity -eq 'ERROR') {
        $script:failures += $finding
    } else {
        $script:warnings += $finding
    }
}

function New-AxeManualReviewResult {
    param(
        [bool]$Approved,
        [string]$Code,
        [string]$Message,
        [object]$Review = $null,
        [string]$ObservedHash = ""
    )

    return [pscustomobject]@{
        Approved     = $Approved
        Code         = $Code
        Message      = $Message
        ReviewId     = if ($Review -and $Review.id) { [string]$Review.id } else { $null }
        Reviewer     = if ($Review -and $Review.reviewer_authority) { [string]$Review.reviewer_authority } else { $null }
        ReviewedAt   = if ($Review -and $Review.reviewed_at) { [string]$Review.reviewed_at } else { $null }
        SourcePath   = if ($Review -and $Review.source -and $Review.source.path) { [string]$Review.source.path } else { $null }
        ExpectedHash = if ($Review -and $Review.source -and $Review.source.sha256) { [string]$Review.source.sha256 } else { $null }
        ObservedHash = $ObservedHash
    }
}

function Test-AxeManualReviewApproval {
    param(
        [object[]]$IncompleteDetails,
        [string]$BaselinePath,
        [string]$RepositoryRoot
    )

    if (-not (Test-Path -LiteralPath $BaselinePath -PathType Leaf)) {
        return New-AxeManualReviewResult -Approved $false -Code 'BASELINE_MISSING' -Message "baseline de revisao humana ausente: $BaselinePath"
    }

    try {
        $baseline = Get-Content -LiteralPath $BaselinePath -Raw -ErrorAction Stop | ConvertFrom-Json -ErrorAction Stop
    } catch {
        return New-AxeManualReviewResult -Approved $false -Code 'BASELINE_INVALID' -Message "baseline de revisao humana invalido: $($_.Exception.Message)"
    }

    if ($baseline.schema_version -ne '1.0') {
        return New-AxeManualReviewResult -Approved $false -Code 'SCHEMA_MISMATCH' -Message 'schema_version de baseline nao suportada; esperado 1.0'
    }

    $runtimeRules = @($IncompleteDetails)
    if ($runtimeRules.Count -ne 1) {
        return New-AxeManualReviewResult -Approved $false -Code 'RULE_MISMATCH' -Message "o baseline exige uma unica regra inconclusiva; runtime retornou $($runtimeRules.Count)"
    }

    $runtimeRule = $runtimeRules[0]
    $candidates = @($baseline.reviews | Where-Object {
        $_.status -eq 'approved' -and $_.rule_id -eq [string]$runtimeRule.id
    })
    if ($candidates.Count -ne 1) {
        return New-AxeManualReviewResult -Approved $false -Code 'REVIEW_NOT_UNIQUE' -Message "nenhuma ou mais de uma revisao aprovada corresponde a regra '$($runtimeRule.id)'"
    }

    $review = $candidates[0]
    if ([string]::IsNullOrWhiteSpace([string]$review.id) -or [string]::IsNullOrWhiteSpace([string]$review.reviewer_authority) -or [string]::IsNullOrWhiteSpace([string]$review.reviewed_at)) {
        return New-AxeManualReviewResult -Approved $false -Code 'REVIEW_METADATA_MISSING' -Message 'a revisao aprovada nao possui id, autoridade e data obrigatorios' -Review $review
    }

    $sourceRelativePath = if ($review.source -and $review.source.path) { [string]$review.source.path } else { '' }
    $expectedHash = if ($review.source -and $review.source.sha256) { [string]$review.source.sha256 } else { '' }
    if ([string]::IsNullOrWhiteSpace($sourceRelativePath) -or [string]::IsNullOrWhiteSpace($expectedHash)) {
        return New-AxeManualReviewResult -Approved $false -Code 'SOURCE_METADATA_MISSING' -Message 'a revisao aprovada nao possui caminho e SHA-256 de origem obrigatorios' -Review $review
    }
    if ([System.IO.Path]::IsPathRooted($sourceRelativePath) -or $sourceRelativePath -match '(^|[\\/])\.\.([\\/]|$)') {
        return New-AxeManualReviewResult -Approved $false -Code 'SOURCE_PATH_INVALID' -Message "caminho de origem fora do repositorio recusado: $sourceRelativePath" -Review $review
    }

    $sourceFullPath = [System.IO.Path]::GetFullPath((Join-Path $RepositoryRoot $sourceRelativePath))
    $repoFullPath = [System.IO.Path]::GetFullPath($RepositoryRoot).TrimEnd([System.IO.Path]::DirectorySeparatorChar, [System.IO.Path]::AltDirectorySeparatorChar)
    if (-not $sourceFullPath.StartsWith("$repoFullPath$([System.IO.Path]::DirectorySeparatorChar)", [System.StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path -LiteralPath $sourceFullPath -PathType Leaf)) {
        return New-AxeManualReviewResult -Approved $false -Code 'SOURCE_PATH_INVALID' -Message "origem declarada nao existe dentro do repositorio: $sourceRelativePath" -Review $review
    }

    $observedHash = (Get-FileHash -LiteralPath $sourceFullPath -Algorithm SHA256 -ErrorAction Stop).Hash.ToLowerInvariant()
    if ($observedHash -cne $expectedHash.ToLowerInvariant()) {
        return New-AxeManualReviewResult -Approved $false -Code 'HASH_MISMATCH' -Message "o hash da origem mudou; a aprovacao humana expirou para $sourceRelativePath" -Review $review -ObservedHash $observedHash
    }

    $expectedTargets = @($review.targets | ForEach-Object { [string]$_ } | Sort-Object)
    $runtimeTargets = @(
        foreach ($targetInfo in @($runtimeRule.targets)) {
            $parts = @($targetInfo.target | ForEach-Object { [string]$_ } | Where-Object { $_ })
            if ($parts.Count -gt 0) { $parts -join ' > ' }
        }
    ) | Sort-Object
    $targetDifference = @(Compare-Object -ReferenceObject $expectedTargets -DifferenceObject $runtimeTargets)
    if ($expectedTargets.Count -eq 0 -or $targetDifference.Count -gt 0) {
        return New-AxeManualReviewResult -Approved $false -Code 'TARGET_MISMATCH' -Message 'os alvos inconclusivos diferem da revisao humana aprovada; a aprovacao expirou' -Review $review -ObservedHash $observedHash
    }

    return New-AxeManualReviewResult -Approved $true -Code 'MANUAL_REVIEW_APPROVED' -Message 'revisao humana positiva corresponde exatamente a regra, aos alvos e ao hash da origem' -Review $review -ObservedHash $observedHash
}

function Read-CwvManualReviewRecord {
    param(
        [string]$RecordPath,
        [string]$ExpectedTargetUrl
    )

    if (-not (Test-Path -LiteralPath $RecordPath -PathType Leaf)) {
        return [pscustomobject]@{ Recorded = $false; Code = 'CWV_REVIEW_MISSING'; Message = "registro humano CWV ausente: $RecordPath"; Review = $null }
    }

    try {
        $record = Get-Content -LiteralPath $RecordPath -Raw -ErrorAction Stop | ConvertFrom-Json -ErrorAction Stop
    } catch {
        return [pscustomobject]@{ Recorded = $false; Code = 'CWV_REVIEW_INVALID'; Message = "registro humano CWV invalido: $($_.Exception.Message)"; Review = $null }
    }

    if ($record.schema_version -ne '1.0') {
        return [pscustomobject]@{ Recorded = $false; Code = 'CWV_REVIEW_SCHEMA_MISMATCH'; Message = 'schema_version de registro humano CWV nao suportada; esperado 1.0'; Review = $null }
    }

    $normalizedTarget = $ExpectedTargetUrl.TrimEnd('/')
    $candidates = @($record.reviews | Where-Object {
        $_.status -eq 'positive_observation' -and ([string]$_.target_url).TrimEnd('/') -eq $normalizedTarget
    })
    if ($candidates.Count -ne 1) {
        return [pscustomobject]@{ Recorded = $false; Code = 'CWV_REVIEW_NOT_UNIQUE'; Message = "nenhuma ou mais de uma observacao humana positiva corresponde a $ExpectedTargetUrl"; Review = $null }
    }

    $review = $candidates[0]
    $required = @('id', 'reviewer_authority', 'reviewed_at', 'target_url')
    $missing = @($required | Where-Object {
        $property = $review.PSObject.Properties[$_]
        $null -eq $property -or [string]::IsNullOrWhiteSpace([string]$property.Value)
    })
    if ($missing.Count -gt 0 -or @($review.observations).Count -eq 0 -or @($review.limitations).Count -eq 0) {
        return [pscustomobject]@{ Recorded = $false; Code = 'CWV_REVIEW_METADATA_MISSING'; Message = "registro humano CWV sem campos obrigatorios: $($missing -join ', ')"; Review = $review }
    }
    if ($null -eq $review.measurements -or $null -eq $review.measurements.inp -or $null -eq $review.measurements.inp.local_ms -or $null -eq $review.measurements.inp.field_p75_ms) {
        return [pscustomobject]@{ Recorded = $false; Code = 'CWV_REVIEW_MEASUREMENTS_MISSING'; Message = 'registro humano CWV sem INP local e p75 de campo obrigatorios'; Review = $review }
    }

    return [pscustomobject]@{ Recorded = $true; Code = 'CWV_HUMAN_REVIEW_RECORDED'; Message = 'observacao humana positiva e INP manualmente atestado; nao certifica TBT sem trace laboratorial proprio'; Review = $review }
}

function New-LighthouseProductionAuditResult {
    param(
        [bool]$Measured,
        [string]$Code,
        [string]$Message,
        [object]$Artifact = $null,
        [string]$ObservedFingerprint = "",
        [string]$ExpectedFingerprint = ""
    )

    return [pscustomobject]@{
        Measured            = $Measured
        Code                = $Code
        Message             = $Message
        Artifact            = $Artifact
        ObservedFingerprint = $ObservedFingerprint
        ExpectedFingerprint = $ExpectedFingerprint
    }
}

function Test-FiniteNonNegativeNumber {
    param([object]$Value)

    if ($null -eq $Value) { return $false }
    try {
        $number = [double]$Value
        return -not [double]::IsNaN($number) -and -not [double]::IsInfinity($number) -and $number -ge 0
    } catch {
        return $false
    }
}

function Resolve-NodeExecutable {
    # node.exe e Windows-only, mesmo defeito ja corrigido para python.exe na
    # fase SRI: pwsh 7+ e cross-platform, mas Get-Command node.exe nunca
    # resolve em Linux/macOS, onde o binario se chama node.
    $cmd = Get-Command node.exe, node -ErrorAction SilentlyContinue | Select-Object -First 1
    if (-not $cmd) { throw 'nenhum interpretador Node.js encontrado (node.exe/node fora do PATH)' }
    return $cmd.Source
}

function Read-LighthouseProductionAudit {
    param(
        [string]$ArtifactPath,
        [string]$RepositoryRoot
    )

    if (-not (Test-Path -LiteralPath $ArtifactPath -PathType Leaf)) {
        return New-LighthouseProductionAuditResult -Measured $false -Code 'LIGHTHOUSE_ARTIFACT_MISSING' -Message "artefato Lighthouse de producao ausente: $ArtifactPath"
    }

    try {
        $artifact = Get-Content -LiteralPath $ArtifactPath -Raw -ErrorAction Stop | ConvertFrom-Json -ErrorAction Stop
    } catch {
        return New-LighthouseProductionAuditResult -Measured $false -Code 'LIGHTHOUSE_ARTIFACT_INVALID' -Message "artefato Lighthouse invalido: $($_.Exception.Message)"
    }

    if ($artifact.schema_version -ne '1.0' -or $artifact.source -ne 'lighthouse') {
        return New-LighthouseProductionAuditResult -Measured $false -Code 'LIGHTHOUSE_SCHEMA_MISMATCH' -Message 'artefato nao declara schema 1.0 e fonte lighthouse'
    }

    $required = @('generated_at', 'target_url', 'input_fingerprint_sha256')
    $missing = @($required | Where-Object {
        $property = $artifact.PSObject.Properties[$_]
        $null -eq $property -or [string]::IsNullOrWhiteSpace([string]$property.Value)
    })
    if ($missing.Count -gt 0 -or $null -eq $artifact.metrics -or -not (Test-FiniteNonNegativeNumber -Value $artifact.metrics.tbtMs)) {
        return New-LighthouseProductionAuditResult -Measured $false -Code 'LIGHTHOUSE_METADATA_MISSING' -Message "artefato Lighthouse sem campos obrigatorios ou TBT numerico: $($missing -join ', ')" -Artifact $artifact
    }

    $rawTbt = if ($artifact.lighthouse_report -and $artifact.lighthouse_report.audits -and $artifact.lighthouse_report.audits.'total-blocking-time') { $artifact.lighthouse_report.audits.'total-blocking-time'.numericValue } else { $null }
    if (-not (Test-FiniteNonNegativeNumber -Value $rawTbt) -or [Math]::Abs(([double]$artifact.metrics.tbtMs) - ([double]$rawTbt)) -gt 0.001) {
        return New-LighthouseProductionAuditResult -Measured $false -Code 'LIGHTHOUSE_TBT_MISMATCH' -Message 'o TBT resumido diverge do audit total-blocking-time bruto do Lighthouse' -Artifact $artifact
    }

    $collector = Join-Path $PSScriptRoot 'lighthouse_cwv_audit.mjs'
    if (-not (Test-Path -LiteralPath $collector -PathType Leaf)) {
        return New-LighthouseProductionAuditResult -Measured $false -Code 'LIGHTHOUSE_COLLECTOR_MISSING' -Message "coletor Lighthouse ausente: $collector" -Artifact $artifact
    }

    try {
        $nodeExe = Resolve-NodeExecutable
        $sourceRoot = Join-Path $RepositoryRoot 'frontend'
        $currentFingerprint = (& $nodeExe $collector --fingerprint --source-root $sourceRoot 2>&1 | Out-String).Trim()
        if ($LASTEXITCODE -ne 0 -or $currentFingerprint -notmatch '^[a-f0-9]{64}$') {
            throw "coletor de fingerprint falhou: $currentFingerprint"
        }
    } catch {
        return New-LighthouseProductionAuditResult -Measured $false -Code 'LIGHTHOUSE_FINGERPRINT_UNAVAILABLE' -Message "nao foi possivel recalcular o fingerprint de producao: $($_.Exception.Message)" -Artifact $artifact
    }

    $expectedFingerprint = ([string]$artifact.input_fingerprint_sha256).ToLowerInvariant()
    if ($currentFingerprint.ToLowerInvariant() -cne $expectedFingerprint) {
        return New-LighthouseProductionAuditResult -Measured $false -Code 'LIGHTHOUSE_FINGERPRINT_MISMATCH' -Message 'o input de frontend mudou depois da auditoria Lighthouse; o resultado expirou' -Artifact $artifact -ObservedFingerprint $currentFingerprint -ExpectedFingerprint $expectedFingerprint
    }

    return New-LighthouseProductionAuditResult -Measured $true -Code 'LIGHTHOUSE_PRODUCTION_MEASURED' -Message 'TBT de producao foi calculado pelo Lighthouse em um input de frontend correspondente' -Artifact $artifact -ObservedFingerprint $currentFingerprint -ExpectedFingerprint $expectedFingerprint
}

# ============================================================================
# INSTRUMENTACAO DAS FASES 1 E 2: navegador real ou resultado NAO MEDIDO.
# Um bundle, uma resposta HTTP ou uma constante nao sao CWV/A11y medidos.
# ============================================================================
$FASE1_MEDE = $false
$FASE2_MEDE = $false
$runtimeProbe = $null
$probeErro = $null
$probeScript = Join-Path $PSScriptRoot "runtime_quality_probe.mjs"
$axeManualReview = $null
$cwvManualReview = Read-CwvManualReviewRecord -RecordPath $CwvManualReviewPath -ExpectedTargetUrl $TargetUrl
$lighthouseProductionAudit = Read-LighthouseProductionAudit -ArtifactPath $LighthouseArtifactPath -RepositoryRoot $RepoRoot
if ($lighthouseProductionAudit.Measured) {
    $perfMetrics["TBT_MS"].Val = [double]$lighthouseProductionAudit.Artifact.metrics.tbtMs
}

if ($cdpActive -and $cdpPort -and (Test-Path $probeScript)) {
    try {
        $nodeExe = Resolve-NodeExecutable
        $probeOutput = & $nodeExe $probeScript --cdp "http://127.0.0.1:${cdpPort}" --url $TargetUrl 2>&1
        if ($LASTEXITCODE -ne 0) { throw "probe runtime saiu com codigo ${LASTEXITCODE}: $probeOutput" }
        $runtimeProbe = ($probeOutput | Out-String | ConvertFrom-Json)
        $perfMetrics["LCP_MS"].Val = $runtimeProbe.runtime.lcpMs
        $perfMetrics["CLS"].Val = $runtimeProbe.runtime.cls
        $perfMetrics["TTFB_MS"].Val = $runtimeProbe.runtime.ttfbMs
        $perfMetrics["MAX_HEAP_MB"].Val = $runtimeProbe.runtime.maxHeapMb
        $perfMetrics["OBSERVED_EVENT_LATENCY_MS"].Val = $runtimeProbe.runtime.eventLatencyMs
        $perfMetrics["OBSERVED_LONG_TASK_BLOCKING_MS"].Val = $runtimeProbe.runtime.longTaskBlockingMs
        $a11yRules["AXE_VIOLATIONS"].Val = $runtimeProbe.axe.violations
        $a11yRules["AXE_INCOMPLETE"].Val = $runtimeProbe.axe.incomplete

        # A ausencia de interação humana e de trace laboratorial é declarada;
        # jamais substituída por uma estimativa ou por nomes semelhantes.
        $requiredCwv = @("LCP_MS", "CLS", "TTFB_MS", "MAX_HEAP_MB")
        $FASE1_MEDE = @($requiredCwv | Where-Object { $null -eq $perfMetrics[$_].Val }).Count -eq 0
        $FASE2_MEDE = $null -ne $a11yRules["AXE_VIOLATIONS"].Val
        if ($FASE2_MEDE -and $a11yRules["AXE_INCOMPLETE"].Val -gt 0) {
            $axeManualReview = Test-AxeManualReviewApproval -IncompleteDetails @($runtimeProbe.axe.incompleteDetails) -BaselinePath $A11yReviewBaselinePath -RepositoryRoot $RepoRoot
            $a11yRules["AXE_INCOMPLETE"].ManualReview = $axeManualReview
        }
    } catch {
        $probeErro = $_.Exception.Message
    }
} elseif ($cdpActive) {
    $probeErro = "helper runtime ausente: $probeScript"
} else {
    $probeErro = "nenhuma porta CDP canonica respondeu"
}

Write-Host ("`n[1] RUNTIME PERFORMANCE & CWV COVERAGE AUDIT") -ForegroundColor Yellow
if (-not $FASE1_MEDE) {
    Write-Host "    NAO MEDIDO INTEGRALMENTE - nenhuma ausencia foi estimada." -ForegroundColor Yellow
    if ($probeErro) { Write-Host "    motivo: $probeErro" -ForegroundColor DarkYellow }
}
Write-Host ("{0,-18} | {1,-12} | {2,-14} | {3}" -f 'METRIC', 'VALUE', 'SOTA THRESHOLD', 'STATUS') -ForegroundColor White
Write-Host ("-" * 68) -ForegroundColor DarkGray

foreach ($k in $perfMetrics.Keys) {
    $m = $perfMetrics[$k]
    $measured = $null -ne $m.Val
    $limited = $null -ne $m.Limit
    $passed = $measured -and ((-not $limited) -or $m.Val -le $m.Limit)
    $status = if (-not $measured) { "[N/MED]" } elseif (-not $limited) { "[OBSERVED]" } elseif ($passed) { "[PASS]" } else { "[FAIL]" }
    $color = if (-not $measured) { "DarkGray" } elseif (-not $limited) { "Cyan" } elseif ($passed) { "Green" } else { "Red" }

    $valStr = if ($measured) { "$($m.Val) $($m.Unit)".Trim() } else { "NAO MEDIDO" }
    $limitStr = if ($limited) { "<= $($m.Limit) $($m.Unit)".Trim() } else { "N/A (diagnostico)" }

    Write-Host ("{0,-18} | {1,-12} | {2,-14} | {3}" -f $k, $valStr, $limitStr, $status) -ForegroundColor $color

    if ($measured -and $limited -and -not $passed) {
        Add-QualityFinding -Severity 'ERROR' -Component "cwv.$k" -Detail "${k}: $valStr excede $limitStr." -Reason "$($m.Desc). O valor foi medido no navegador real e ultrapassou o limite normativo." -Action "Investigar o fluxo que produz $k, corrigir a regressao e repetir a medicao no navegador real."
    }
}

if ($FASE1_MEDE) {
    if ($cwvManualReview.Recorded -and $lighthouseProductionAudit.Measured) {
        $inp = $cwvManualReview.Review.measurements.inp
        Write-Host "    [CWV] Cobertura composta: INP humano $($inp.local_ms) ms / $($inp.field_p75_ms) ms p75; TBT Lighthouse $($perfMetrics['TBT_MS'].Val) ms." -ForegroundColor Green
    } elseif ($cwvManualReview.Recorded) {
        $inp = $cwvManualReview.Review.measurements.inp
        Add-QualityFinding -Severity 'WARNING' -Component 'cwv.cobertura' -Detail 'Cobertura CWV parcial: INP foi atestado manualmente; TBT nao foi certificado.' -Reason "O arbitro humano registrou INP local de $($inp.local_ms) ms e p75 de campo de $($inp.field_p75_ms) ms para a interacao pointer. O artefato Lighthouse nao esta valido: $($lighthouseProductionAudit.Code) — $($lighthouseProductionAudit.Message)" -Action 'Executar a auditoria Lighthouse de producao em Chrome isolado e vincular o artefato ao fingerprint atual do frontend; nao inferir TBT de estabilidade observada ou long tasks do probe.'
    } else {
        Add-QualityFinding -Severity 'WARNING' -Component 'cwv.cobertura' -Detail 'Cobertura CWV parcial: INP e TBT nao foram certificados.' -Reason 'O probe observa uma aba temporaria, mas nao executa interacao humana controlada exigida pelo INP nem coleta trace laboratorial exigido pelo TBT; Event Timing e long tasks permanecem diagnosticos.' -Action 'Executar um roteiro humano controlado para INP e uma coleta laboratorial de trace para TBT; registrar ambos sem inferi-los a partir de outras metricas.'
    }
} else {
    $fase1Motivo = if ($probeErro) { "$probeErro. Metricas ausentes permaneceram nulas, sem estimativa estatica." } else { 'O probe runtime nao retornou as metricas exigidas; valores ausentes permaneceram nulos.' }
    Add-QualityFinding -Severity 'WARNING' -Component 'cwv.cobertura' -Detail 'Fase 1 (Core Web Vitals) nao mediu integralmente.' -Reason $fase1Motivo -Action "Restabelecer o frontend em $TargetUrl e uma instancia Chrome Dev com CDP somente em loopback; executar novamente o gate antes de concluir sobre CWV."
}
if ($cwvManualReview.Recorded) {
    $inp = $cwvManualReview.Review.measurements.inp
    $tbtSummary = if ($lighthouseProductionAudit.Measured) { "TBT Lighthouse $($perfMetrics['TBT_MS'].Val) ms (producao isolada)." } else { "TBT permanece sem artefato Lighthouse valido ($($lighthouseProductionAudit.Code))." }
    Write-Host "    [CWV] Observacao humana positiva registrada: $($cwvManualReview.Review.id) ($($cwvManualReview.Review.reviewer_authority)); INP $($inp.local_ms) ms local / $($inp.field_p75_ms) ms p75; $tbtSummary" -ForegroundColor Cyan
}

Write-Host ("`n[2] ACCESSIBILITY & BEST PRACTICE QUALITY AUDIT") -ForegroundColor Yellow
if (-not $FASE2_MEDE) {
    Write-Host "    NAO MEDIDO - axe-core nao executou contra um DOM renderizado." -ForegroundColor Yellow
}
Write-Host ("{0,-26} | {1,-10} | {2,-8} | {3}" -f 'RULE', 'COUNT', 'LIMIT', 'STATUS') -ForegroundColor White
Write-Host ("-" * 68) -ForegroundColor DarkGray

foreach ($k in $a11yRules.Keys) {
    $r = $a11yRules[$k]
    $measured = $null -ne $r.Val
    $passed = $measured -and $r.Val -le $r.Limit
    $review = $measured -and -not $passed -and $r.Enforcement -eq "Warn"
    $reviewApproved = $review -and $null -ne $r.ManualReview -and $r.ManualReview.Approved
    $status = if (-not $measured) { "[N/MED]" } elseif ($passed) { "[PASS]" } elseif ($reviewApproved) { "[REVIEW APPROVED]" } elseif ($review) { "[REVIEW]" } else { "[FAIL]" }
    $color = if (-not $measured) { "DarkGray" } elseif ($passed -or $reviewApproved) { "Green" } elseif ($review) { "Yellow" } else { "Red" }

    $valStr = if ($measured) { "$($r.Val) $($r.Unit)" } else { "NAO MEDIDO" }
    Write-Host ("{0,-26} | {1,-10} | {2,-8} | {3}" -f $k, $valStr, "<= $($r.Limit)", $status) -ForegroundColor $color

    if ($measured -and -not $passed -and $r.Enforcement -eq "Fail") {
        $axeRuleIds = @($runtimeProbe.axe.violationDetails | ForEach-Object { $_.id } | Where-Object { $_ }) -join ', '
        if ([string]::IsNullOrWhiteSpace($axeRuleIds)) { $axeRuleIds = 'ids nao retornados pelo probe' }
        Add-QualityFinding -Severity 'ERROR' -Component "a11y.$k" -Detail "${k}: $($r.Val) violation(s)." -Reason "$($r.Desc). axe-core confirmou violacao(oes) no DOM renderizado; regras: $axeRuleIds." -Action 'Corrigir os elementos e seletores reportados pelo axe-core, revisar a semantica acessivel e repetir a auditoria contra o DOM renderizado.'
    } elseif ($review -and $reviewApproved) {
        Write-Host "    [A11Y] Revisao humana aprovada: $($r.ManualReview.ReviewId) ($($r.ManualReview.Reviewer))." -ForegroundColor Green
    } elseif ($review) {
        $axeRuleIds = @($runtimeProbe.axe.incompleteDetails | ForEach-Object { $_.id } | Where-Object { $_ }) -join ', '
        if ([string]::IsNullOrWhiteSpace($axeRuleIds)) { $axeRuleIds = 'ids nao retornados pelo probe' }
        $baselineDetail = if ($null -ne $r.ManualReview) { " Baseline: $($r.ManualReview.Code) -- $($r.ManualReview.Message)" } else { '' }
        Add-QualityFinding -Severity 'WARNING' -Component "a11y.$k" -Detail "${k}: $($r.Val) item(ns) inconclusivo(s)." -Reason "$($r.Desc). axe-core classificou a verificacao como inconclusiva, nao como violacao confirmada; regras: $axeRuleIds. Alvos e motivos detalhados constam na secao 2.1 do relatorio.$baselineDetail" -Action 'Inspecionar manualmente cada alvo incompleto no DOM renderizado, registrar a decisao e corrigir somente a violacao que for confirmada.'
    }
}
Write-Host ("-" * 68) -ForegroundColor DarkGray

if (-not $FASE2_MEDE) {
    $fase2Motivo = if ($probeErro) { "$probeErro. axe-core nao recebeu um DOM renderizado para avaliar." } else { 'axe-core nao recebeu um DOM renderizado para avaliar.' }
    Add-QualityFinding -Severity 'WARNING' -Component 'a11y.cobertura' -Detail 'Fase 2 (Acessibilidade) nao mediu.' -Reason $fase2Motivo -Action 'Restabelecer a sessao CDP e executar o axe-core contra uma pagina renderizada; nao substituir a auditoria por analise estatica.'
}

# 3. Security Vulnerability & CVE Audit (NIST / GitHub Security Advisory Gate)
Write-Host ("`n[3] SECURITY VULNERABILITY & CVE AUDIT (NIST / GHSA GATE)") -ForegroundColor Yellow
Write-Host ("{0,-26} | {1,-10} | {2,-8} | {3}" -f 'SECURITY CHECK', 'COUNT', 'LIMIT', 'STATUS') -ForegroundColor White
Write-Host ("-" * 68) -ForegroundColor DarkGray

$secRules = [ordered]@{
    "CRITICAL_CVE_COUNT" = @{ Val = 0; Limit = 0; Unit = "cves"; Desc = "Critical severity vulnerabilities" }
    "HIGH_CVE_COUNT"     = @{ Val = 0; Limit = 0; Unit = "cves"; Desc = "High severity vulnerabilities" }
    "TOTAL_VULNERABILITY"= @{ Val = 0; Limit = 0; Unit = "cves"; Desc = "Total open vulnerabilities across dependencies" }
}

# SEGURANCA (2026-08-22): esta fase FALHAVA ABERTA.
#
# Se o `npm audit` nao produzisse JSON — npm fora do PATH, erro de rede, texto
# de erro em vez de JSON — a excecao era engolida, os contadores ficavam no
# valor INICIAL zero, e as tres checagens reportavam [PASS]. Comprovado por
# experimento: com o npm inacessivel, o veredito da fase era APROVADA.
#
# O gatilho nao era hipotetico. A linha abaixo prependia ao PATH o caminho
# C:\Users\rapha\.fnm\node-versions\v24.16.0\installation, que NAO EXISTE neste
# ambiente. O portao so vinha medindo porque o Node chega pelo PATH de maquina
# — garantia acidental, nao estrutural.
#
# Regra que passa a valer: um portao que nao mede NAO aprova. "Zero
# vulnerabilidades" e um resultado; "nao consegui rodar" e uma falha.

# So prepende o caminho do fnm se ele existir de fato.
$fnmPath = "$env:USERPROFILE\.fnm\node-versions\v24.16.0\installation"
if (Test-Path $fnmPath) { $env:PATH = "$fnmPath;" + $env:PATH }

$cveMedido = $false
$cveErro = ''

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    $cveErro = 'npm nao foi encontrado no PATH'
} else {
    try {
        $auditRaw = (npm audit --json 2>&1 | Out-String).Trim()
        if ($auditRaw.StartsWith("{")) {
            $auditJson = $auditRaw | ConvertFrom-Json
            $metadata = $auditJson.metadata.vulnerabilities
            if ($null -ne $metadata) {
                $secRules["CRITICAL_CVE_COUNT"].Val = [int]($metadata.critical)
                $secRules["HIGH_CVE_COUNT"].Val     = [int]($metadata.high)
                $secRules["TOTAL_VULNERABILITY"].Val= [int]($metadata.total)
                $cveMedido = $true
            } else {
                $cveErro = 'JSON sem metadata.vulnerabilities'
            }
        } else {
            $trecho = $auditRaw.Substring(0, [Math]::Min(70, $auditRaw.Length))
            $cveErro = "npm audit nao devolveu JSON: $trecho"
        }
    } catch {
        $cveErro = "excecao ao rodar npm audit: $($_.Exception.Message)"
    }
}

foreach ($k in $secRules.Keys) {
    $s = $secRules[$k]
    $passed = $s.Val -le $s.Limit
    $status = if ($passed) { "[PASS]" } else { "[FAIL]" }
    $color = if ($passed) { "Green" } else { "Red" }

    Write-Host ("{0,-26} | {1,-10} | {2,-8} | {3}" -f $k, "$($s.Val) $($s.Unit)", "<= $($s.Limit)", $status) -ForegroundColor $color

    if (-not $passed) {
        Add-QualityFinding -Severity 'ERROR' -Component "security.$k" -Detail "${k}: $($s.Val) violation(s)." -Reason "$($s.Desc). O npm audit mediu uma contagem acima do limite zero." -Action 'Atualizar ou substituir a dependencia vulneravel, verificar o lockfile e repetir npm audit antes do commit.'
    }
}

# A linha que impede a falha aberta: os zeros acima so valem se o audit RODOU.
$execStatus = if ($cveMedido) { "[PASS]" } else { "[FAIL]" }
$execColor  = if ($cveMedido) { "Green" } else { "Red" }
Write-Host ("{0,-26} | {1,-10} | {2,-8} | {3}" -f 'CVE_AUDIT_EXECUTADO', $(if ($cveMedido) { 'sim' } else { 'NAO' }), 'sim', $execStatus) -ForegroundColor $execColor
if (-not $cveMedido) {
    Write-Host "   motivo: $cveErro" -ForegroundColor Red
    Add-QualityFinding -Severity 'ERROR' -Component 'security.execucao' -Detail 'O audit de CVE nao executou.' -Reason "$cveErro. Zero por ausencia de medicao nao e resultado de seguranca." -Action 'Corrigir a disponibilidade do npm ou a falha de rede/JSON indicada, executar npm audit com sucesso e somente entao avaliar a contagem de CVEs.'
}
Write-Host ("-" * 68) -ForegroundColor DarkGray

# 4. Cryptographic SRI & SHA-512 Integrity Gate
Write-Host ("`n[4] SUBRESOURCE INTEGRITY (SRI) & SHA-512 CRYPTOGRAPHIC HASH AUDIT") -ForegroundColor Yellow
Write-Host ("{0,-26} | {1,-10} | {2,-8} | {3}" -f 'CRYPTOGRAPHIC TARGET', 'STATUS', 'LIMIT', 'GATE') -ForegroundColor White
Write-Host ("-" * 68) -ForegroundColor DarkGray

# SEGURANCA (2026-08-22): comeca PESSIMISTA. A versao anterior iniciava
# $sriSuccess = $true e so o derrubava se $LASTEXITCODE fosse diferente de
# zero. Duas brechas: se o interpretador nao chegasse a lancar, $LASTEXITCODE
# retinha o valor do comando ANTERIOR — se aquele tivesse dado 0, a fase
# passava sem verificar nada; e o caminho caia para "python.exe" sem conferir
# se existe. Mesma classe de falha aberta da fase 3.
$sriSuccess = $false
$sriErro = ''
# pwsh 7+ e cross-platform (SS8.2); o .venv Windows usa Scripts\python.exe,
# o POSIX usa bin/python. Resolver so o primeiro quebrava silenciosamente
# em qualquer host Linux/macOS -- inclusive CI ubuntu-latest.
$venvPyWindows = Join-Path $RepoRoot '.venv\Scripts\python.exe'
$venvPyPosix   = Join-Path $RepoRoot '.venv/bin/python'
$sriScript = Join-Path $PSScriptRoot 'sri_integrity_verifier.py'
$pythonExe = if (Test-Path $venvPyWindows) {
    $venvPyWindows
} elseif (Test-Path $venvPyPosix) {
    $venvPyPosix
} else {
    $cmd = Get-Command python.exe, python3, python -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($cmd) { $cmd.Source } else { $null }
}

if (-not $pythonExe) {
    $sriErro = 'nenhum interpretador Python encontrado (venv ausente e python.exe fora do PATH)'
} elseif (-not (Test-Path $sriScript)) {
    $sriErro = "verificador ausente: $sriScript"
} else {
    $global:LASTEXITCODE = 0
    try {
        $sriOutput = & $pythonExe $sriScript 2>&1
        if ($LASTEXITCODE -eq 0) {
            $sriSuccess = $true
        } else {
            $sriErro = "verificador saiu com codigo $LASTEXITCODE"
            Write-Verbose "SRI verifier output: $sriOutput"
        }
    } catch {
        $sriErro = "excecao ao executar o verificador: $($_.Exception.Message)"
    }
}

$sriStatus = if ($sriSuccess) { "[PASS]" } else { "[FAIL]" }
$sriColor = if ($sriSuccess) { "Green" } else { "Red" }
# Antes imprimia "VERIFIED" mesmo quando reprovava — rotulo que contradizia o
# proprio veredito ao lado.
$sriLabel = if ($sriSuccess) { "VERIFIED" } else { "NAO VERIF." }
Write-Host ("{0,-26} | {1,-10} | {2,-8} | {3}" -f "SHA512_&_SRI_INTEGRITY", $sriLabel, "<= 0 viol", $sriStatus) -ForegroundColor $sriColor

if (-not $sriSuccess) {
    Write-Host "   motivo: $sriErro" -ForegroundColor Red
    Add-QualityFinding -Severity 'ERROR' -Component 'integrity.sri' -Detail 'SRI/SHA-512 nao foi verificado.' -Reason $sriErro -Action 'Restabelecer o interpretador ou verificador indicado, corrigir a integridade reportada e repetir a verificacao criptografica antes do commit.'
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
# O conteudo de uma exclusao nao entra no indice e, portanto, nao pode ser
# analisado como blob. Ainda assim ela pertence ao universo do commit: a
# metrica precisa inclui-la, enquanto as regras de payload analisam somente
# adicoes/modificacoes/renomeacoes.
$staged = @(& git -C $RepoRoot -c core.quotePath=false diff --cached --name-only --diff-filter=ACMR 2>$null |
    Where-Object { $_ })
$stagedDeleted = @(& git -C $RepoRoot -c core.quotePath=false diff --cached --name-only --diff-filter=D 2>$null |
    Where-Object { $_ })
$stagedTotal = $staged.Count + $stagedDeleted.Count

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
    $sha = (& git -C $RepoRoot ls-files -s -- $arquivo 2>$null) -split '\s+' | Select-Object -Index 1
    if (-not $sha) { continue }
    $tamanho = & git -C $RepoRoot cat-file -s $sha 2>$null
    if (-not $tamanho) { continue }

    # Ponteiro LFS tem ~130 bytes e comeca com 'version https://git-lfs'
    $ehPonteiro = $false
    if ([int64]$tamanho -lt 300) {
        $cabecalho = (& git -C $RepoRoot cat-file -p $sha 2>$null | Select-Object -First 1)
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
        $filtro = (& git -C $RepoRoot check-attr filter -- $arquivo 2>$null)
        if ($filtro -notlike '*filter: lfs*') { $violRoute += $normal }
    }
}

# ── PowerShell: parsear com o interpretador que DE FATO executa ──────────────
# O hook pre-commit e as tarefas agendadas invocam `powershell`, que no Windows
# e o 5.1. Ele le arquivo SEM BOM usando a codepage ANSI: um em-dash U+2014
# (E2 80 94 em UTF-8) vira "a€<0x94>", e 0x94 e aspa de fechamento em cp1252 —
# a string termina no meio e o erro aparece dezenas de linhas adiante.
# O PowerShell 7 le UTF-8 e nao ve nada, entao validar no 7 esconde o defeito.
# Auditoria de 2026-08-21: 270 .ps1 no ambiente, 10 ja quebrados no 5.1 e 94
# em risco. Esta fase impede que o numero volte a crescer.
$violPs = @()
$ps51Parcial = @()

# LIMITE DE AUTONOMIA (autorizado pelo vertice, 2026-09-01). O 5.1 nao tem
# build fora do Windows, entao exigi-lo travava permanentemente todo agente e
# todo runner Linux -- inclusive o CI ubuntu-latest. Mas "nao da para rodar o
# 5.1" nao e o mesmo que "nao da para verificar nada":
#
# O defeito que o comentario acima diz que "validar no 7 esconde" e o de
# ENCODING, e esse e checagem de BYTES -- vale igual em qualquer host e roda
# SEMPRE, antes de qualquer interpretador. O que realmente exige o 5.1 e
# sintaxe que so o 7 aceita, e esse conjunto e finito e detectavel pelo
# tokenizer/AST do proprio 7.
#
# Sem 5.1, roda a bateria substituta abaixo. Tudo que ela acha e BLOQUEIO; so
# o residuo vira warning declarado. Nao e "passou sem checar" -- e "checou
# pelo mais forte que existe aqui, e diz o que ficou de fora".
$ps51Interpreter = Get-Command powershell.exe -ErrorAction SilentlyContinue

function Test-Ps51CompatibilidadeSubstituta {
    param([Parameter(Mandatory = $true)][string]$Caminho)
    $motivos = @()
    $tokens = $null; $erros = $null
    $ast = [System.Management.Automation.Language.Parser]::ParseFile($Caminho, [ref]$tokens, [ref]$erros)
    if ($erros.Count) {
        return @("nao parseia nem no PowerShell 7 ($($erros.Count) erro(s), 1o na linha $($erros[0].Extent.StartLineNumber))")
    }
    $kindsSo7 = 'QuestionQuestion', 'QuestionQuestionEquals', 'QuestionDot', 'QuestionLBracket', 'AndAnd', 'OrOr'
    foreach ($tk in $tokens) {
        if ($kindsSo7 -contains $tk.Kind.ToString()) {
            $motivos += "operador $($tk.Kind) (so PS7) na linha $($tk.Extent.StartLineNumber)"
        }
    }
    foreach ($n in $ast.FindAll({ param($x) $x -is [System.Management.Automation.Language.TernaryExpressionAst] }, $true)) {
        $motivos += "operador ternario (so PS7) na linha $($n.Extent.StartLineNumber)"
    }
    foreach ($n in $ast.FindAll({ param($x) $x -is [System.Management.Automation.Language.PipelineChainAst] }, $true)) {
        $motivos += "encadeamento && / || (so PS7) na linha $($n.Extent.StartLineNumber)"
    }
    foreach ($n in $ast.FindAll({ param($x) $x -is [System.Management.Automation.Language.MemberExpressionAst] -and $x.NullConditional }, $true)) {
        $motivos += "acesso null-condicional (so PS7) na linha $($n.Extent.StartLineNumber)"
    }
    foreach ($n in $ast.FindAll({ param($x) $x -is [System.Management.Automation.Language.CommandAst] }, $true)) {
        foreach ($el in $n.CommandElements) {
            if ($el -is [System.Management.Automation.Language.CommandParameterAst] -and $el.ParameterName -eq 'Parallel') {
                $motivos += "-Parallel (so PS7) na linha $($n.Extent.StartLineNumber)"
            }
        }
    }
    return $motivos
}

# Script do processo filho, codificado uma unica vez. Le o alvo de
# $env:SOTA_PS51_ALVO — o caminho e DADO, nunca texto de comando.
$EncPs51 = [Convert]::ToBase64String([System.Text.Encoding]::Unicode.GetBytes(
    '$e = $null; ' +
    '[System.Management.Automation.Language.Parser]::ParseFile($env:SOTA_PS51_ALVO, [ref]$null, [ref]$e) | Out-Null; ' +
    'if ($e.Count) { "ERR:" + $e.Count + ":" + $e[0].Extent.StartLineNumber } else { "OK" }'
))

foreach ($arquivo in $staged) {
    if ($arquivo -notmatch '\.ps1$') { continue }
    $abs = Join-Path $RepoRoot $arquivo
    if (-not (Test-Path $abs)) { continue }

    $bytes = [System.IO.File]::ReadAllBytes($abs)
    $temBom = $bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF
    $naoAscii = @($bytes | Where-Object { $_ -gt 127 }).Count

    if ($naoAscii -gt 0 -and -not $temBom) {
        $violPs += "$arquivo (nao-ASCII sem BOM: $naoAscii bytes)"
        continue
    }

    # BOM duplicado quebra o parse nas DUAS versoes (CLAUDE.md §6.4). Bytes,
    # entao vale em qualquer host.
    if ($temBom -and $bytes.Length -ge 6 -and $bytes[3] -eq 0xEF -and $bytes[4] -eq 0xBB -and $bytes[5] -eq 0xBF) {
        $violPs += "$arquivo (BOM UTF-8 duplicado)"
        continue
    }

    if (-not $ps51Interpreter) {
        $motivosSubs = Test-Ps51CompatibilidadeSubstituta -Caminho $abs
        if ($motivosSubs.Count -gt 0) {
            $violPs += "$arquivo (incompativel com 5.1: $($motivosSubs -join '; '))"
        } else {
            $ps51Parcial += $arquivo
        }
        continue
    }

    # SEGURANCA (corrigido em 2026-08-21, achado de injecao de comando):
    # a versao anterior interpolava $abs dentro de um here-string @"..."@, que
    # EXPANDE variaveis, e o caminho ia parar dentro de aspas simples no script
    # filho: ParseFile('$abs', ...). Um arquivo em stage chamado
    #     relatorio'; <comando>; '.ps1
    # fecha a aspa e injeta comando arbitrario no powershell.exe filho. Nome
    # valido em NTFS, termina em .ps1, passa pelo filtro. O gatilho seria um
    # `git commit` comum, via hook — execucao remota de codigo na maquina do
    # desenvolvedor. Confirmado com PSParser: 'Set-Content' era tokenizado como
    # Command, nao como parte do caminho.
    #
    # Correcao: o caminho viaja por variavel de ambiente e o comando e uma
    # string de aspas SIMPLES — nada e interpolado pelo pai, e o filho le o
    # valor como dado, nunca como codigo.
    # -EncodedCommand e nao -Command: o PowerShell 5.1 remonta os argumentos ao
    # invocar executavel nativo e despedaca strings com ';' e espacos — a
    # primeira tentativa desta correcao devolveu saida vazia por isso. O base64
    # viaja como um unico token, imune a requoting.
    $env:SOTA_PS51_ALVO = $abs
    try {
        $saida = & powershell.exe -NoProfile -EncodedCommand $EncPs51
    } finally {
        Remove-Item Env:\SOTA_PS51_ALVO -ErrorAction SilentlyContinue
    }
    if ("$saida".Trim() -ne 'OK') {
        $violPs += "$arquivo (parse PS5.1 falhou: $saida)"
    }
}

$hygieneRules['StagedFiles']      = @{ Val = $stagedTotal;       Limit = '-';         Desc = 'Arquivos em stage (conteudo ou exclusao)' }
$hygieneRules['Ps51PorBateria']   = @{ Val = $ps51Parcial.Count;  Limit = '-';         Desc = 'Verificado pela bateria substituta, sem o 5.1 real (INFO)' }
$hygieneRules['PowerShell51']     = @{ Val = $violPs.Count;      Limit = 0;           Desc = 'Script .ps1 que quebra no interpretador real' }
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
foreach ($v in $violPs)    { Write-Host "   - PowerShell 5.1: $v" -ForegroundColor Red }
foreach ($v in $ps51Parcial) { Write-Host "   - PowerShell 5.1 por bateria substituta (sem 5.1 real): $v" -ForegroundColor Yellow }

if ($violPath.Count -gt 0) {
    Add-QualityFinding -Severity 'ERROR' -Component 'repository.forbidden-paths' -Detail "$($violPath.Count) arquivo(s) sob diretorio de perfil/ferramenta: $($violPath -join '; ')." -Reason 'Estado local de ferramenta foi colocado em stage; ele nao e fonte versionavel do projeto.' -Action 'Retirar esses caminhos do stage e registrar a exclusao em .gitignore, preservando configuracoes compartilhadas fora dos diretorios de runtime.'
}
if ($violSize.Count -gt 0) {
    Add-QualityFinding -Severity 'ERROR' -Component 'repository.oversized-blobs' -Detail "$($violSize.Count) blob(s) acima de $MaxBlobMb MB fora do LFS: $($violSize -join '; ')." -Reason 'Blob grande seria gravado diretamente no historico Git, contrariando o roteamento LFS do repositorio.' -Action "Aplicar git lfs track para o tipo de artefato antes de adiciona-lo novamente; se for runtime ou cache, retira-lo do stage e ignora-lo."
}
if ($violRoute.Count -gt 0) {
    Add-QualityFinding -Severity 'ERROR' -Component 'repository.lfs-routing' -Detail "$($violRoute.Count) binario(s) sem filter=lfs: $($violRoute -join '; ')." -Reason 'A extensao binaria entrou em stage sem o atributo filter=lfs, portanto seria armazenada como blob Git comum.' -Action 'Corrigir .gitattributes com filter=lfs para a extensao ou retirar o binario do commit; depois reindexar o arquivo e rodar o gate novamente.'
}
if ($violPs.Count -gt 0) {
    Add-QualityFinding -Severity 'ERROR' -Component 'repository.powershell51' -Detail "$($violPs.Count) script(s) .ps1 falham no PowerShell 5.1: $($violPs -join '; ')." -Reason 'O hook e tarefas agendadas executam com PowerShell 5.1; arquivo sem BOM UTF-8 com caracteres nao ASCII ou sintaxe invalida falha no interpretador efetivo.' -Action 'Adicionar BOM UTF-8 unico quando houver caracteres nao ASCII ou corrigir a sintaxe indicada; validar novamente com o parser do PowerShell 5.1.'
}
# A bateria RODOU e aprovou: nada degradou, entao nao consome o teto de 2
# warnings -- que existe para cobertura PERDIDA (fases 1 e 2 sem CDP), nao para
# verificacao feita por substituto. Sem isso, toda alteracao de .ps1 por agente
# gastaria uma das duas vagas e a autonomia autorizada nao existiria na pratica.
# O residuo continua declarado: linha abaixo, linha Ps51PorBateria na tabela, e
# ambas no relatorio. Para voltar a contar como warning, troque a linha abaixo
# por um Add-QualityFinding -Severity 'WARNING'.
if ($ps51Parcial.Count -gt 0) {
    Write-Host ("   residuo: o 5.1 real ainda acusaria cmdlet/parametro inexistente nele e recurso de classe do 7. Revalidar em host Windows antes de release, ou se o arquivo for hook/tarefa agendada.") -ForegroundColor DarkYellow
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

# --- VEREDITO UNICO -----------------------------------------------------------
# Fonte de verdade unica para console, JSON, Markdown e codigo de saida.
#
# Ate 2026-08-28 havia DUAS regras. O relatorio dizia FRAGILE para qualquer
# warning; o console reprovava a partir de 3 (secao 8: teto de 2). Com 0 erros e
# 3 warnings o portao BLOQUEAVA (exit 1) enquanto o arquivo declarava "fragil" —
# a mesma discordancia que a correcao anterior tinha comecado a fechar, so que
# um degrau adiante. Duas expressoes para um veredito divergem por construcao:
# a unica correcao estavel e nao ter a segunda.
$TETO_DE_WARNINGS = 2
$triState = if ($failures.Count -gt 0 -or $warnings.Count -gt $TETO_DE_WARNINGS) {
    "FALHOU (VERMELHO)"
} elseif ($warnings.Count -gt 0) {
    "FRAGIL (AMARELO)"
} else {
    "SUCESSO (VERDE)"
}
$reportStatus = switch ($triState) {
    "SUCESSO (VERDE)" { "PASSED" }
    "FRAGIL (AMARELO)" { "FRAGILE" }
    default { "FAILED" }
}
$reportStatusMarkdown = switch ($reportStatus) {
    "PASSED" { "✅ **APPROVED (SOTA GOLD)**" }
    "FRAGILE" { "⚠️ **FRAGILE (MEASUREMENT PENDING)**" }
    default { "❌ **REJECTED**" }
}
$allFindings = @($failures) + @($warnings)
$lighthouseAuditSummary = [ordered]@{
    Measured = $lighthouseProductionAudit.Measured
    Code = $lighthouseProductionAudit.Code
    Message = $lighthouseProductionAudit.Message
    ObservedFingerprint = $lighthouseProductionAudit.ObservedFingerprint
    ExpectedFingerprint = $lighthouseProductionAudit.ExpectedFingerprint
    Artifact = if ($null -ne $lighthouseProductionAudit.Artifact) {
        [ordered]@{
            SchemaVersion = $lighthouseProductionAudit.Artifact.schema_version
            Source = $lighthouseProductionAudit.Artifact.source
            GeneratedAt = $lighthouseProductionAudit.Artifact.generated_at
            TargetUrl = $lighthouseProductionAudit.Artifact.target_url
            Metrics = $lighthouseProductionAudit.Artifact.metrics
            PerformanceScore = $lighthouseProductionAudit.Artifact.performance_score
        }
    } else {
        $null
    }
}

$reportData = [ordered]@{
    Timestamp = (Get-Date).ToString("o")
    TargetUrl = $TargetUrl
    CdpActive = $cdpActive
    CdpPort = $cdpPort
    RuntimeProbe = $runtimeProbe
    RuntimeProbeError = $probeErro
    Status = $reportStatus
    A11yReviewBaselinePath = $A11yReviewBaselinePath
    AccessibilityManualReview = $axeManualReview
    CwvManualReviewPath = $CwvManualReviewPath
    CoreWebVitalsManualReview = $cwvManualReview
    LighthouseArtifactPath = $LighthouseArtifactPath
    LighthouseProductionAudit = $lighthouseAuditSummary
    CoreWebVitals = $perfMetrics
    AccessibilityRules = $a11yRules
    SecurityRules = $secRules
    SriIntegrity = if ($sriSuccess) { "VERIFIED" } else { "FAILED" }
    RepositoryHygiene = $hygieneRules
    Failures = $failures
    Warnings = $warnings
    Findings = $allFindings
}

$reportData | ConvertTo-Json -Depth 8 | Set-Content -Path $reportJsonPath -Encoding UTF8

$axeReviewEvidenceMarkdown = ''
if ($FASE2_MEDE -and $null -ne $runtimeProbe -and $null -ne $runtimeProbe.axe -and $null -ne $runtimeProbe.axe.incompleteDetails) {
    $axeEvidenceLines = @()
    foreach ($rule in @($runtimeProbe.axe.incompleteDetails)) {
        $ruleId = if ($rule.id) { [string]$rule.id } else { 'regra sem id retornado' }
        $ruleHelp = if ($rule.help) { [string]$rule.help } else { 'sem descricao retornada pelo axe-core' }
        $ruleTargets = @($rule.targets)
        $axeEvidenceLines += "### Regra $ruleId ($($ruleTargets.Count) alvo(s))"
        $axeEvidenceLines += "- **Descricao do axe-core:** $ruleHelp"

        if ($ruleTargets.Count -eq 0) {
            $axeEvidenceLines += '- **Alvos e motivos detalhados:** nenhum seletor retornado pelo axe-core nesta execucao.'
            continue
        }

        foreach ($targetInfo in $ruleTargets) {
            $selectorParts = @()
            foreach ($selectorPart in @($targetInfo.target)) {
                if ($null -ne $selectorPart) { $selectorParts += [string]$selectorPart }
            }
            $selector = if ($selectorParts.Count -gt 0) { $selectorParts -join ' > ' } else { 'seletor nao retornado pelo axe-core' }
            $reason = ([string]$targetInfo.failureSummary -replace '\s+', ' ').Trim()
            if ([string]::IsNullOrWhiteSpace($reason)) { $reason = 'motivo nao retornado pelo axe-core' }
            $axeEvidenceLines += "- **Alvo:** $selector  `n  **Motivo:** $reason"
        }
    }

    if ($axeEvidenceLines.Count -gt 0) {
        $axeReviewEvidenceMarkdown = @"
## 2.1 Evidencia de revisao humana do axe
> **Alvos e motivos detalhados.** Esta secao preserva a evidencia que o axe-core nao consegue decidir automaticamente. Um item aqui nao e uma violacao confirmada e a regra permanece ativa.

$($axeEvidenceLines -join "`n")

"@
    }
}

$cwvManualReviewMarkdown = ''
if ($cwvManualReview.Recorded) {
    $cwvObservationLines = @($cwvManualReview.Review.observations | ForEach-Object {
        "- **$($_.dimension):** $($_.verdict) — $($_.statement)"
    })
    $cwvLimitationLines = @($cwvManualReview.Review.limitations | ForEach-Object { "- $_" })
    $manualInp = $cwvManualReview.Review.measurements.inp
    $tbtManualStatement = if ($lighthouseProductionAudit.Measured) { "**TBT certificado pelo Lighthouse: $($perfMetrics['TBT_MS'].Val) ms em producao isolada.**" } else { '**TBT permanece sem artefato Lighthouse valido.**' }
    $cwvManualReviewMarkdown = @"
## 1.1 Observacao humana de responsividade
> **POSITIVA E REGISTRADA.** Esta e uma arbitragem humana sobre a experiencia observada. O INP foi atestado manualmente; o TBT depende exclusivamente de um artefato Lighthouse de producao vinculado ao input atual.

- **Registro:** $($cwvManualReview.Review.id)
- **Autoridade:** $($cwvManualReview.Review.reviewer_authority)
- **Data declarada:** $($cwvManualReview.Review.reviewed_at)
- **Escopo:** $($cwvManualReview.Review.target_url)
- **INP atestado manualmente: $($manualInp.local_ms) ms local / $($manualInp.field_p75_ms) ms p75 de campo.**
- **Decomposicao pointer:** Input Delay $($manualInp.input_delay_ms) ms; Processing Duration $(if ($null -eq $manualInp.processing_duration_ms) { 'nao exposta numericamente na captura' } else { "$($manualInp.processing_duration_ms) ms" }); Presentation Delay $($manualInp.presentation_delay_ms) ms.
- $tbtManualStatement

### Observacoes
$($cwvObservationLines -join "`n")

### Limites declarados
$($cwvLimitationLines -join "`n")

"@
}

$lighthouseProductionMarkdown = if ($lighthouseProductionAudit.Measured) {
@"
## 1.2 Lighthouse de producao isolada
> **MEDIDO E VINCULADO AO INPUT.** O artefato abaixo veio de uma build de producao, em Chrome efemero sem extensoes; o fingerprint do `frontend/` atual corresponde exatamente ao registrado.

- **Artefato:** $LighthouseArtifactPath
- **Alvo:** $($lighthouseProductionAudit.Artifact.target_url)
- **Gerado em:** $($lighthouseProductionAudit.Artifact.generated_at)
- **TBT:** $($perfMetrics['TBT_MS'].Val) ms (limite <= $TbtThreshold ms)
- **LCP no Lighthouse:** $($lighthouseProductionAudit.Artifact.metrics.lcpMs) ms
- **CLS no Lighthouse:** $($lighthouseProductionAudit.Artifact.metrics.cls)
- **Fingerprint SHA-256:** $($lighthouseProductionAudit.ObservedFingerprint)

"@
} else {
@"
## 1.2 Lighthouse de producao isolada
> **NAO APLICAVEL NESTA EXECUCAO.** O gate nao certificou TBT.

- **Codigo:** $($lighthouseProductionAudit.Code)
- **Motivo:** $($lighthouseProductionAudit.Message)
- **Acao:** executar a auditoria de producao isolada e manter o artefato vinculado ao input atual.

"@
}

$axeManualReviewMarkdown = ''
if ($null -ne $axeManualReview) {
    if ($axeManualReview.Approved) {
        $axeManualReviewMarkdown = @"
## 2.2 Decisao humana versionada
> **APROVADA.** Esta decisao nao desliga o axe-core: ela se aplica somente a regra, aos alvos e ao hash abaixo. Qualquer divergencia expira a aprovacao e devolve o item para revisao humana.

- **Baseline:** $($axeManualReview.ReviewId)
- **Autoridade:** $($axeManualReview.Reviewer)
- **Data declarada:** $($axeManualReview.ReviewedAt)
- **Origem vinculada:** $($axeManualReview.SourcePath)
- **SHA-256 observado:** $($axeManualReview.ObservedHash)
- **Decisao:** $($axeManualReview.Message)

"@
    } else {
        $axeManualReviewMarkdown = @"
## 2.2 Baseline humano nao aplicavel
> **NAO APROVADO NESTA EXECUCAO.** O axe-core continua ativo e a revisao humana nao foi dispensada.

- **Codigo:** $($axeManualReview.Code)
- **Motivo:** $($axeManualReview.Message)

"@
    }
}

$mdContent = @"
# ⚡ SOTA Quality Gate, Security & SRI Audit Report
**Timestamp:** $((Get-Date).ToString("yyyy-MM-dd HH:mm:ss"))
**Target URL:** $TargetUrl
**Status:** $reportStatusMarkdown

## 1. Runtime Performance & CWV Coverage
$(if ($FASE1_MEDE) { "> **COBERTURA RUNTIME.** LCP, CLS, TTFB e heap foram observados no navegador real. INP vem de interacao humana controlada; TBT so e valido pelo Lighthouse de producao isolada. Event Timing e long tasks abaixo sao diagnosticos, nao substitutos.`n" } else { "> **NAO MEDIDO INTEGRALMENTE.** Ausencias de metrica permanecem nulas; nenhuma estimativa estatica e aceita como CWV.`n" })
| Metric | Observed Value | Threshold | Status | Motivo / Acao quando nao verde |
| :--- | :--- | :--- | :--- | :--- |
$($perfMetrics.Keys | ForEach-Object {
    $metric = $perfMetrics[$_]
    $measured = $null -ne $metric.Val
    $limited = $null -ne $metric.Limit
    $value = if ($measured) { "$($metric.Val) $($metric.Unit)".Trim() } else { 'NAO MEDIDO' }
    $threshold = if ($limited) { "<= $($metric.Limit) $($metric.Unit)".Trim() } else { 'N/A (diagnostico)' }
    $status = if (-not $measured) { '⚠️ NAO MEDIDO' } elseif (-not $limited) { 'ℹ️ OBSERVADO' } elseif ($metric.Val -le $metric.Limit) { '✅ PASS' } else { '❌ FAIL' }
    $explanation = if (-not $measured) { "Motivo: $probeErro. Acao: restabelecer a medicao runtime; nao estimar." } elseif (-not $limited) { "Motivo: diagnostico sem limite normativo. Acao: interpretar somente como observacao." } elseif ($metric.Val -gt $metric.Limit) { "Motivo: $($metric.Desc) excedeu o limite. Acao: corrigir e repetir a medicao." } else { '-' }
    "| **$_** | $value | $threshold | $status | $explanation |"
} | Out-String)

$cwvManualReviewMarkdown
$lighthouseProductionMarkdown

## 2. Accessibility & A11y Standards Summary
$(if ($FASE2_MEDE) { "> **MEDIDO NO DOM RENDERIZADO.** Violacoes axe confirmadas bloqueiam; itens incomplete preservam uma revisao humana explicita.`n" } else { "> **NAO MEDIDO.** axe-core nao executou contra um DOM renderizado nesta execucao.`n" })
| Standard / Check | Observed Count | Max Allowed | Description | Status | Motivo / Acao quando nao verde |
| :--- | :--- | :--- | :--- | :--- | :--- |
$($a11yRules.Keys | ForEach-Object {
    $rule = $a11yRules[$_]
    $measured = $null -ne $rule.Val
    $review = $measured -and $rule.Val -gt $rule.Limit -and $rule.Enforcement -eq 'Warn'
    $reviewApproved = $review -and $null -ne $rule.ManualReview -and $rule.ManualReview.Approved
    $status = if (-not $measured) { '⚠️ NAO MEDIDO' } elseif ($rule.Val -le $rule.Limit) { '✅ PASS' } elseif ($reviewApproved) { '✅ PASS — REVISAO HUMANA APROVADA' } elseif ($review) { '⚠️ REVISAO HUMANA' } else { '❌ FAIL' }
    $explanation = if (-not $measured) { "Motivo: $probeErro. Acao: executar axe-core no DOM renderizado via CDP." } elseif ($reviewApproved) { "Motivo: baseline $($rule.ManualReview.ReviewId) corresponde a regra, alvos e SHA-256. Acao: repetir revisao se qualquer um deles mudar." } elseif ($review) { "Motivo: axe-core marcou revisao inconclusiva, nao violacao confirmada. Baseline: $($rule.ManualReview.Code). Acao: inspecionar cada alvo manualmente." } elseif ($rule.Val -gt $rule.Limit) { 'Motivo: axe-core confirmou violacao acima do limite. Acao: corrigir os alvos e repetir a auditoria.' } else { '-' }
    "| **$_** | $(if ($measured) { $rule.Val } else { 'NAO MEDIDO' }) | <= $($rule.Limit) | $($rule.Desc) | $status | $explanation |"
} | Out-String)

$axeReviewEvidenceMarkdown
$axeManualReviewMarkdown

## 3. Security Vulnerability & CVE Summary (NIST / GHSA)
| Security Indicator | Detected Count | Max Allowed | Description | Status |
| :--- | :--- | :--- | :--- | :--- |
$($secRules.Keys | ForEach-Object { "| **$_** | $($secRules[$_].Val) | <= $($secRules[$_].Limit) | $($secRules[$_].Desc) | $(if ($secRules[$_].Val -le $secRules[$_].Limit) { '✅ PASS' } else { '❌ FAIL' }) |" } | Out-String)

## 4. Cryptographic SRI & SHA-512 Subresource Integrity
- **NPM Package SHA-512**: $(if ($sriSuccess) { '✅ 100% SHA-512 Estrito' } else { '❌ Falha' })
- **Frontend SRI Script Tags**: $(if ($sriSuccess) { '✅ Zero Scripts Externos Desprotegidos' } else { '❌ Falha' })
- **WASM Binaries SHA-256 Lock**: $(if ($sriSuccess) { '✅ Integridade Criptográfica Verificada' } else { '❌ Falha' })

## 5. Motivos e Acoes para Estados Nao Verdes
$(if ($allFindings.Count -eq 0) {
'> Nenhum estado nao verde foi registrado nesta execucao.'
} else {
($allFindings | ForEach-Object {
    "### $($_.Severity) - $($_.Component)`n- **Evidencia:** $($_.Detail)`n- **Motivo:** $($_.Reason)`n- **Acao recomendada:** $($_.Action)`n"
}) -join "`n"
})
"@

$mdContent | Set-Content -Path $reportMdPath -Encoding UTF8
$mdContent | Set-Content -Path $latestMdPath -Encoding UTF8

Write-Host "📄 [REPORT] Artifact saved: $reportMdPath" -ForegroundColor Cyan

Write-Host "`n" + ("=" * 80)
Write-Host "========= SOTA QUALITY & INTEGRITY GUARD — PROTOCOLO CHICO v8.0 GOLD (GATE) ==========" -ForegroundColor Cyan
Write-Host "• Total de Erros:    $($failures.Count) (Teto Maximo Permitido: 0 | Peso: CRITICO)"
Write-Host "• Total de Warnings: $($warnings.Count) (Teto Maximo Permitido: 2 | Tolerancia: 0 para SUCESSO)"

# $triState ja foi derivado junto com o relatorio, de uma unica expressao. Aqui
# so se IMPRIME o veredito — recalcula-lo seria reabrir a divergencia.
if ($triState -eq "SUCESSO (VERDE)") {
    # A frase so pode dizer "5 Fases" quando as 5 tiverem medido. Enquanto
    # $FASE1_MEDE/$FASE2_MEDE forem falsos, este ramo e inalcancavel (as duas
    # geram warning) — a condicao fica explicita para o dia em que medirem.
    $fasesMedidas = 3 + [int]$FASE1_MEDE + [int]$FASE2_MEDE
    Write-Host "• Status da Bateria: [$triState] Zero Erros e Zero Warnings nas $fasesMedidas Fases medidas do Quality Gate." -ForegroundColor Green
    Write-Host "• Homeostase Total:  Nenhum erro ou warning detectado nas $fasesMedidas fases medidas." -ForegroundColor Green
} elseif ($triState -eq "FRAGIL (AMARELO)") {
    Write-Host "• Status da Bateria: [$triState] 0 Erros, mas detectados $($warnings.Count) warnings no Quality Gate (teto $TETO_DE_WARNINGS)." -ForegroundColor Yellow
} else {
    Write-Host "• Status da Bateria: [$triState] Bloqueio Termodinamico! ($($failures.Count) Erros, $($warnings.Count) Warnings, teto $TETO_DE_WARNINGS)." -ForegroundColor Red
}

if ($failures.Count -gt 0 -or $warnings.Count -gt 0) {
    Write-Host ("-" * 80) -ForegroundColor Yellow
    Write-Host "MOTIVOS E ACOES PARA ESTADOS NAO VERDES ($($failures.Count + $warnings.Count) OCORRENCIAS)" -ForegroundColor Yellow
    $idx = 1
    foreach ($f in $failures) {
        Write-Host "[$idx] ERROR -> Componente: '$($f.Component)' | Verificacao: $($f.Detail)" -ForegroundColor Red
        Write-Host "    Motivo: $($f.Reason)"
        Write-Host "    Acao recomendada: $($f.Action)" -ForegroundColor Cyan
        Write-Host ""
        $idx++
    }
    foreach ($w in $warnings) {
        Write-Host "[$idx] WARNING -> Componente: '$($w.Component)' | Alerta: $($w.Detail)" -ForegroundColor Yellow
        Write-Host "    Motivo: $($w.Reason)"
        Write-Host "    Acao recomendada: $($w.Action)" -ForegroundColor Cyan
        Write-Host ""
        $idx++
    }
}

Write-Host ("=" * 80) + "`n" -ForegroundColor Cyan

if ($triState -eq "FALHOU (VERMELHO)") {
    exit 1
}
exit 0
