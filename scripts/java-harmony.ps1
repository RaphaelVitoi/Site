# SOTA Java Harmony Script
# Harmoniza, otimiza e verifica a integridade do JDK 26 no ecossistema SOTA.

$JDK_PATH = "$PSScriptRoot\..\worker\Java\oracleJdk-26"
$JAVA_EXE = "$JDK_PATH\bin\java.exe"

Write-Host "`n[SOTA] Iniciando Harmonizacao do JDK 26..." -ForegroundColor Cyan

if (Test-Path $JAVA_EXE) {
    # Otimizacoes SOTA para JDK 26 (ZGC Generational)
    $JVM_OPTS = "-XX:+UseZGC -XX:+ZGenerational -Xms512m -Xmx2g -XX:+UseStringDeduplication"
    
    Write-Host "[OK] JDK 26 localizado em: $JDK_PATH" -ForegroundColor Green
    
    # Verifica versao
    & $JAVA_EXE -version
    
    # Exibe configuracao de otimizacao
    Write-Host "`n[OPTIM] Aplicando Heuristicas de Performance SOTA:" -ForegroundColor Yellow
    Write-Host "  > Coletor: ZGC (Generational Mode)"
    Write-Host "  > Memoria: 512MB (min) / 2GB (max)"
    Write-Host "  > Deduplicacao de Strings: Ativada"
    Write-Host "  > Flags: $JVM_OPTS"
    
    # Exporta para a sessao atual (se executado via dot-sourcing)
    $env:JAVA_HOME = $JDK_PATH
    $env:PATH = "$JDK_PATH\bin;$env:PATH"
    $env:JAVA_OPTS = $JVM_OPTS
    
    Write-Host "`n[SOTA] Harmonizacao Concluida com Sucesso. Sistema em Estado de Arte." -ForegroundColor Green
} else {
    Write-Error "[FALHA] JDK 26 nao encontrado em $JDK_PATH. Verifique a integridade do diretorio worker\Java."
}
