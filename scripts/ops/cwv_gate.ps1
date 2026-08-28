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
    [int[]]$CdpPorts = @(9223, 9222),
    [string]$ReportDir = "$env:USERPROFILE\.gemini\Site\reports\cwv"
)

$ErrorActionPreference = 'SilentlyContinue'
$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\\..')).Path

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
    Write-Host "[CDP] Background runtime offline on ports $($CdpPorts -join ', ') - running synthetic baseline validation." -ForegroundColor DarkGray
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

# 2026-08-27: $warnings era LIDO nas linhas do veredito e nunca declarado nem
# populado. O estado FRAGIL (AMARELO) era, portanto, inalcancavel e o tri-state
# funcionava como bi-state. Declarado aqui para que o canal de aviso exista.
$warnings = @()

# ============================================================================
# INSTRUMENTACAO DAS FASES 1 E 2 (POSTULADO-001, aprovado em 2026-08-27)
# ----------------------------------------------------------------------------
# As fases 1 e 2 comparam LITERAIS contra limites: $perfMetrics e $a11yRules
# nunca recebem atribuicao vinda de medicao. Elas sempre aprovavam, e o veredito
# final afirmava "SUCESSO nas 5 Fases" — mais do que fora verificado.
#
# A norma ja estava escrita neste arquivo (fase 3, 2026-08-22): "um portao que
# nao mede NAO aprova". As fases 3, 4 e 5 a cumprem; estas duas ficaram para
# tras. A correcao abaixo NAO altera limiar nem remove verificacao: ela deixa de
# afirmar aprovacao onde nao houve medicao.
#
# EFEITO SISTEMICO, deliberado: o veredito cai de VERDE para AMARELO e assim
# permanece ate que a medicao real exista. AMARELO nao bloqueia commit (exit 0),
# entao o trabalho continua enquanto a divida fica visivel em toda execucao.
# Bloquear aqui pararia o repositorio inteiro por uma divida preexistente.
$FASE1_MEDE = $false   # vira $true quando CWV for instrumentado via CDP
$FASE2_MEDE = $false   # vira $true quando a11y for extraido do DOM real

Write-Host ("`n[1] CORE WEB VITALS AUDIT") -ForegroundColor Yellow
if (-not $FASE1_MEDE) {
    Write-Host "    NAO MEDIDO - valores abaixo sao literais de referencia, nao medicao." -ForegroundColor Yellow
}
Write-Host ("{0,-18} | {1,-12} | {2,-14} | {3}" -f 'METRIC', 'VALUE', 'SOTA THRESHOLD', 'STATUS') -ForegroundColor White
Write-Host ("-" * 68) -ForegroundColor DarkGray

foreach ($k in $perfMetrics.Keys) {
    $m = $perfMetrics[$k]
    $passed = $m.Val -le $m.Limit
    # Sem medicao nao existe [PASS]: o rotulo diz o que de fato ocorreu.
    $status = if (-not $FASE1_MEDE) { "[N/MED]" } elseif ($passed) { "[PASS]" } else { "[FAIL]" }
    $color = if (-not $FASE1_MEDE) { "DarkGray" } elseif ($passed) { "Green" } else { "Red" }
    
    $valStr = "$($m.Val) $($m.Unit)".Trim()
    $limitStr = "<= $($m.Limit) $($m.Unit)".Trim()
    
    Write-Host ("{0,-18} | {1,-12} | {2,-14} | {3}" -f $k, $valStr, $limitStr, $status) -ForegroundColor $color
    
    if (-not $passed) {
        $failures += "$k ($valStr) exceeded limit ($limitStr)"
    }
}

if (-not $FASE1_MEDE) {
    $warnings += "Fase 1 (Core Web Vitals) NAO MEDIU: valores sao literais. Ver reports/POSTULADO-001-portao-cwv-fases-1-2-nao-medem.md"
}

Write-Host ("`n[2] ACCESSIBILITY & BEST PRACTICE QUALITY AUDIT") -ForegroundColor Yellow
if (-not $FASE2_MEDE) {
    Write-Host "    NAO MEDIDO - contadores abaixo sao literais de referencia, nao medicao." -ForegroundColor Yellow
}
Write-Host ("{0,-26} | {1,-10} | {2,-8} | {3}" -f 'RULE', 'COUNT', 'LIMIT', 'STATUS') -ForegroundColor White
Write-Host ("-" * 68) -ForegroundColor DarkGray

foreach ($k in $a11yRules.Keys) {
    $r = $a11yRules[$k]
    $passed = $r.Val -le $r.Limit
    $status = if (-not $FASE2_MEDE) { "[N/MED]" } elseif ($passed) { "[PASS]" } else { "[FAIL]" }
    $color = if (-not $FASE2_MEDE) { "DarkGray" } elseif ($passed) { "Green" } else { "Red" }
    
    Write-Host ("{0,-26} | {1,-10} | {2,-8} | {3}" -f $k, "$($r.Val) $($r.Unit)", "<= $($r.Limit)", $status) -ForegroundColor $color
    
    if (-not $passed) {
        $failures += "A11y Rule '$k': $($r.Desc) - $($r.Val) violation(s)"
    }
}
Write-Host ("-" * 68) -ForegroundColor DarkGray

if (-not $FASE2_MEDE) {
    $warnings += "Fase 2 (Acessibilidade) NAO MEDIU: contadores sao literais. Ver reports/POSTULADO-001-portao-cwv-fases-1-2-nao-medem.md"
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
        $failures += "Security Gate '$k': $($s.Desc) - $($s.Val) violation(s)"
    }
}

# A linha que impede a falha aberta: os zeros acima so valem se o audit RODOU.
$execStatus = if ($cveMedido) { "[PASS]" } else { "[FAIL]" }
$execColor  = if ($cveMedido) { "Green" } else { "Red" }
Write-Host ("{0,-26} | {1,-10} | {2,-8} | {3}" -f 'CVE_AUDIT_EXECUTADO', $(if ($cveMedido) { 'sim' } else { 'NAO' }), 'sim', $execStatus) -ForegroundColor $execColor
if (-not $cveMedido) {
    Write-Host "   motivo: $cveErro" -ForegroundColor Red
    $failures += "Security Gate: o audit de CVE NAO RODOU ($cveErro). Zero medido e resultado; zero por falta de medicao e falha."
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
$venvPy    = "$env:USERPROFILE\.gemini\Site\.venv\Scripts\python.exe"
$sriScript = "$env:USERPROFILE\.gemini\Site\scripts\ops\sri_integrity_verifier.py"
$pythonExe = if (Test-Path $venvPy) { $venvPy } else { (Get-Command python.exe -ErrorAction SilentlyContinue).Source }

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
    $failures += "Cryptographic Integrity Gate: SRI/SHA-512 nao verificado ($sriErro)."
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

if ($violPath.Count -gt 0) {
    $failures += "Repository Hygiene: $($violPath.Count) arquivo(s) sob diretorio de perfil/ferramenta. Adicione ao .gitignore em vez de versionar."
}
if ($violSize.Count -gt 0) {
    $failures += "Repository Hygiene: $($violSize.Count) blob(s) acima de $MaxBlobMb MB fora do LFS. Use 'git lfs track' antes de commitar."
}
if ($violRoute.Count -gt 0) {
    $failures += "Repository Hygiene: $($violRoute.Count) binario(s) sem filter=lfs. Verifique se o .gitattributes ainda roteia essa extensao."
}
if ($violPs.Count -gt 0) {
    $failures += "Repository Hygiene: $($violPs.Count) script(s) .ps1 quebram no PowerShell 5.1, que e o interpretador do hook e das tarefas agendadas. Adicione BOM UTF-8 se o arquivo tiver caractere nao-ASCII; se o erro for de sintaxe, corrija antes de commitar."
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

$reportData = [ordered]@{
    Timestamp = (Get-Date).ToString("o")
    TargetUrl = $TargetUrl
    CdpActive = $cdpActive
    CdpPort = $cdpPort
    Status = $reportStatus
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
**Target URL:** $TargetUrl
**Status:** $reportStatusMarkdown

## 1. Core Web Vitals Summary
$(if (-not $FASE1_MEDE) { "> **NAO MEDIDO.** Os valores abaixo sao literais de referencia, nao medicao desta execucao. Ver ``reports/POSTULADO-001-portao-cwv-fases-1-2-nao-medem.md``.`n" })
| Metric | Reference Value | Threshold | Status |
| :--- | :--- | :--- | :--- |
$($perfMetrics.Keys | ForEach-Object { "| **$_** | $($perfMetrics[$_].Val) $($perfMetrics[$_].Unit) | <= $($perfMetrics[$_].Limit) $($perfMetrics[$_].Unit) | $(if (-not $FASE1_MEDE) { '⚠️ NAO MEDIDO' } elseif ($perfMetrics[$_].Val -le $perfMetrics[$_].Limit) { '✅ PASS' } else { '❌ FAIL' }) |" } | Out-String)

## 2. Accessibility & A11y Standards Summary
$(if (-not $FASE2_MEDE) { "> **NAO MEDIDO.** Os contadores abaixo sao literais de referencia, nao medicao desta execucao. Ver ``reports/POSTULADO-001-portao-cwv-fases-1-2-nao-medem.md``.`n" })
| Standard / Check | Reference Count | Max Allowed | Description | Status |
| :--- | :--- | :--- | :--- | :--- |
$($a11yRules.Keys | ForEach-Object { "| **$_** | $($a11yRules[$_].Val) | <= $($a11yRules[$_].Limit) | $($a11yRules[$_].Desc) | $(if (-not $FASE2_MEDE) { '⚠️ NAO MEDIDO' } elseif ($a11yRules[$_].Val -le $a11yRules[$_].Limit) { '✅ PASS' } else { '❌ FAIL' }) |" } | Out-String)

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
    Write-Host "SUMARIO INDIVIDUAL DE DETECCOES ($($failures.Count + $warnings.Count) OCORRENCIAS)" -ForegroundColor Yellow
    $idx = 1
    foreach ($f in $failures) {
        Write-Host "[$idx] ERROR -> Componente: 'gate.quality' | Verificacao: $f" -ForegroundColor Red
        Write-Host "    Causa/Motivo: Limite SOTA ultrapassado na fase de auditoria."
        Write-Host "    `e[36m💡 Recomendacao: [SOTA-REC] Ajustar o limite de performance/seguranca no modulo auditado.`e[0m`n"
        $idx++
    }
    foreach ($w in $warnings) {
        Write-Host "[$idx] WARNING -> Componente: 'gate.quality' | Alerta: $w" -ForegroundColor Yellow
        Write-Host "    Causa/Motivo: Alerta de entropia moderada detectado."
        Write-Host "    `e[36m💡 Recomendacao: [SOTA-REC] Sanear warning preventivamente para manter homeostase verde.`e[0m`n"
        $idx++
    }
}

Write-Host ("=" * 80) + "`n" -ForegroundColor Cyan

if ($triState -eq "FALHOU (VERMELHO)") {
    exit 1
}
exit 0
