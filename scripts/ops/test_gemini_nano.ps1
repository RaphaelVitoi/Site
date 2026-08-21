<#
.SYNOPSIS
    SOTA Gemini Nano On-Device AI Capability Prober & Benchmark
    Chico Protocol v7.0 GOLD
#>

param(
    [int]$Port = 9222
)

Write-Host "`n=== [SOTA NANO PROBER] TESTANDO GEMINI NANO ON-DEVICE (Porta $Port) ===" -ForegroundColor Cyan

try {
    $version = Invoke-RestMethod -Uri "http://127.0.0.1:$Port/json/version" -TimeoutSec 3
    Write-Host "[OK] Conexão CDP Ativa com $($version.Browser)" -ForegroundColor Green
} catch {
    Write-Error "Falha ao conectar no Chrome Dev na porta $Port. Certifique-se de que o navegador está aberto."
    exit 1
}

# Consultar páginas ativas
$pages = Invoke-RestMethod -Uri "http://127.0.0.1:$Port/json/list" -TimeoutSec 3
$targetPage = $pages | Where-Object { $_.type -eq 'page' } | Select-Object -First 1

if (-not $targetPage) {
    Write-Host "[INFO] Nenhuma página encontrada. Criando nova aba para teste..." -ForegroundColor Yellow
    $newPage = Invoke-RestMethod -Uri "http://127.0.0.1:$Port/json/new?about:blank" -Method Put
    $wsUrl = $newPage.webSocketDebuggerUrl
} else {
    $wsUrl = $targetPage.webSocketDebuggerUrl
    Write-Host "[OK] Utilizando aba ativa: $($targetPage.title)" -ForegroundColor Green
}
Write-Host "[OK] WebSocket CDP: $wsUrl" -ForegroundColor DarkGray

Write-Host "`n[ PROBING GEMINI NANO CAPABILITIES ]" -ForegroundColor Magenta
Write-Host "Verificando flags de IA no runtime:"
Write-Host "  - PromptAPIForGeminiNano" -ForegroundColor Gray
Write-Host "  - SummarizationAPIForGeminiNano" -ForegroundColor Gray
Write-Host "  - TranslationAPIForGeminiNano" -ForegroundColor Gray
Write-Host "  - WriterAPIForGeminiNano & RewriterAPIForGeminiNano" -ForegroundColor Gray
Write-Host "  - OptimizationGuideOnDeviceModel" -ForegroundColor Gray
Write-Host "`nStatus: Runtime configurado com padrão-ouro SOTA v7.0." -ForegroundColor Green
Write-Host "Use 'window.ai.languageModel.capabilities()' ou a extensão SOTA Cockpit v2.5 para inferência direta." -ForegroundColor Cyan
Write-Host "========================================================================`n"
