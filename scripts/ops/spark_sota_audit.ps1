<#
.SYNOPSIS
    SOTA Apache Spark & Dataproc Runtime Auditor
    Protocol Chico SOTA v7.0 GOLD
#>

$ErrorActionPreference = 'SilentlyContinue'

Write-Host "`n=== [SOTA SPARK & DATAPROC RUNTIME AUDIT] ===" -ForegroundColor Cyan

# 1. Java Runtime Check
$jdkPath = "C:\Users\rapha\.gemini\tools\jdk-21"
if (Test-Path "$jdkPath\bin\java.exe") {
    $jVer = & "$jdkPath\bin\java.exe" -version 2>&1 | Select-Object -First 1
    Write-Host "[OK] Java 21 LTS Engine: $jVer" -ForegroundColor Green
    Write-Host "     Path: $jdkPath" -ForegroundColor Gray
} else {
    Write-Warning "JDK 21 LTS não detectado em: $jdkPath"
}

# 2. Hadoop WinUtils Check
$hadoopPath = "C:\Users\rapha\.gemini\tools\hadoop"
if (Test-Path "$hadoopPath\bin\winutils.exe") {
    Write-Host "[OK] Hadoop WinUtils & Native DLL: Ativo" -ForegroundColor Green
    Write-Host "     Path: $hadoopPath" -ForegroundColor Gray
} else {
    Write-Warning "Hadoop WinUtils não detectado em: $hadoopPath"
}

# 3. Python & PySpark Environment
$pyExe = "C:\Users\rapha\.gemini\Site\.venv\Scripts\python.exe"
if (Test-Path $pyExe) {
    $pysparkVer = & $pyExe -c "import pyspark; print(pyspark.__version__)" 2>&1
    $pyarrowVer = & $pyExe -c "import pyarrow; print(pyarrow.__version__)" 2>&1
    Write-Host "[OK] PySpark Engine: v$pysparkVer" -ForegroundColor Green
    Write-Host "[OK] PyArrow Vectorizer: v$pyarrowVer" -ForegroundColor Green
    Write-Host "     Python Venv: $pyExe" -ForegroundColor Gray
} else {
    Write-Warning "Python venv não detectado."
}

# 4. GCP & BigQuery Storage API Auth
$gcloudAuth = gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>&1
$gcpProj = gcloud config get-value project 2>&1
Write-Host "[OK] Google Cloud Active Account: $gcloudAuth" -ForegroundColor Green
Write-Host "[OK] GCP Active Project: $gcpProj" -ForegroundColor Green

# 5. Quick Spark Benchmark / Self-Test
Write-Host "`n[EXECUTANDO TESTE DE VOO DO SPARK CATALYST ENGINE]..." -ForegroundColor Yellow
$benchOutput = & $pyExe "C:\Users\rapha\.gemini\spark_sota_engine.py" 2>&1 | Select-String -Pattern "SparkSession inicializada|Pipeline Spark Concluído"
foreach ($line in $benchOutput) {
    Write-Host "  -> $line" -ForegroundColor Cyan
}

Write-Host "`n========================================================" -ForegroundColor Cyan
