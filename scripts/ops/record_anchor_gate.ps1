<#
.SYNOPSIS
    Portao de Ancora de Registro - M.O. SOTA v8.0 GOLD, secao 13.F.

.DESCRIPTION
    Verifica ANCORA, nao qualidade de texto. Opera exclusivamente sobre o
    conteudo EM STAGE, nunca sobre a arvore inteira: um portao que reprova por
    divida preexistente e um portao que se desliga na primeira semana.

    Existe porque obsolescencia silenciosa foi o modo de falha recorrente desta
    casa. Registro errado e visualmente identico a registro certo; supressor de
    linter apaga o achado sem remover a causa; fallback nao declarado passa por
    sucesso. Nenhuma dessas falhas grita. Este portao as faz gritar.

    CALIBRADO em 2026-08-27 contra o estado real do repositorio:
      - 32 supressores de seguranca ja existiam  -> so linhas ADICIONADAS contam.
      - 67 de 403 .md rastreados tinham frontmatter -> ausencia e AVISO, nao erro,
        enquanto durar a adocao. Frontmatter MAL FORMADO, esse sim, e erro:
        declarar a ancora errada e pior que nao declarar.

    VEREDITO: >=1 Erro => bloqueia (exit 1). Avisos sao informativos durante a
    adocao e NAO abortam - desvio consciente da regra de 3 warnings da secao 8,
    declarado aqui em vez de silenciado.

.PARAMETER Staged
    Por padrao le o indice do git. -Staged:$false le o working tree contra HEAD,
    util para inspecionar antes de dar `git add`.

.EXAMPLE
    pwsh -File scripts/ops/record_anchor_gate.ps1
#>
param(
    [bool]$Staged = $true
)

$ErrorActionPreference = 'Stop'   # oposto do cwv_gate: aqui erro nao e engolido.

$erros  = [System.Collections.Generic.List[string]]::new()
$avisos = [System.Collections.Generic.List[string]]::new()

function Add-Erro  { param([string]$m) $script:erros.Add($m) }
function Add-Aviso { param([string]$m) $script:avisos.Add($m) }

# --- arquivos e linhas em stage --------------------------------------------
$repoRoot = (& git rev-parse --show-toplevel 2>$null)
if (-not $repoRoot) {
    $repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
}
$difArgs = if ($Staged) { @('diff', '--cached') } else { @('diff', 'HEAD') }

$arquivos = & git -C $repoRoot @difArgs --name-only --diff-filter=ACM 2>$null
if (-not $arquivos) {
    Write-Host "[ANCORA] Nada em stage. Nada a verificar." -ForegroundColor DarkGray
    exit 0
}

# Linhas adicionadas POR ARQUIVO. Precisa ser por arquivo, nao em bloco unico:
# a primeira versao varria o diff inteiro e reprovou o proprio POSTULADO-001,
# porque o texto do relatorio CITA "# nosec" ao descrever o achado. Detector que
# nao separa codigo de prosa proibe documentar o problema que ele existe para
# expor. Divida preexistente continua fora: so linhas ADICIONADAS contam.
function Get-LinhasAdicionadas {
    param([string]$Arquivo)
    return @(& git -C $repoRoot @difArgs --unified=0 --diff-filter=ACM -- $Arquivo 2>$null |
        Where-Object { $_ -match '^\+' -and $_ -notmatch '^\+\+\+' } |
        ForEach-Object { $_.Substring(1) })
}

# Extensoes onde um supressor e diretiva executavel. Fora daqui ele e citacao.
$extensoesDeCodigo = '\.(py|ps1|psm1|js|jsx|ts|tsx|go|rs|rb|java|cs|sh)$'

$adicionadas = @()   # todas as linhas, para a checagem de credencial
foreach ($arq in $arquivos) {
    $linhasArq = Get-LinhasAdicionadas -Arquivo $arq
    $adicionadas += $linhasArq

    # --- E1. supressor de seguranca sem registro de decisao ------------------
    # A causa: em Site/tools/hybrid_router/app.py o bind 0.0.0.0 recebeu
    # "# noqa: S104 # nosec B104" e o achado parou de ser reportado sem parar
    # de existir. Supressor e uma DECISAO; decisao sem registro nao e auditavel.
    if ($arq -notmatch $extensoesDeCodigo) { continue }
    foreach ($linha in $linhasArq) {
        # Linha que e SO comentario nao suprime nada: bandit e ruff exigem o
        # supressor na propria linha do achado. Prosa que CITA "# nosec" ao
        # documentar o detector nao e supressor, e este portao reprovava a si
        # mesmo por causa disso (2 falsos positivos nos comentarios acima).
        #
        # A distincao e estrutural, nao uma isencao por caminho: isentar este
        # arquivo criaria ponto cego justamente onde ele nao pode existir.
        # Comparar com o supressor real que motivou a regra --
        #   host = os.getenv("HOST", "0.0.0.0")  # noqa: S104 # nosec B104
        # -- que anota CODIGO e continua sendo pego.
        if ($linha -match '^\s*#') { continue }
        if ($linha -match '#\s*(noqa:\s*S\d+|nosec)' -and $linha -notmatch 'Record-Id:\s*\S+') {
            Add-Erro "Supressor de seguranca sem Record-Id em ${arq}: $($linha.Trim())"
        }
    }
}

# --- E2. credencial em texto claro ------------------------------------------
# Esta roda em TODO arquivo, inclusive markdown: chave vazada em documentacao
# e vazamento igual.
# Padroes de alta precisao apenas. Heuristica generica ("senha = ...") produz
# falso positivo, e portao que cria ruido e portao que sera ignorado.
$arquivoDePadroes = Join-Path $PSScriptRoot '..\..\data\PADROES_DE_CREDENCIAL.json'
if (-not (Test-Path -LiteralPath $arquivoDePadroes)) {
    # Falha DURA, e de proposito. Portao de seguranca que perde a fonte de
    # padroes e continua rodando vira portao que aprova tudo em silencio --
    # o modo de falha que esta secao inteira existe para impedir.
    Write-Host "[ANCORA] FONTE DE PADROES AUSENTE: $arquivoDePadroes" -ForegroundColor Red
    exit 1
}
# Fonte UNICA, compartilhada com tests/test_credenciais.py. Os mesmos padroes
# viviam duplicados aqui e em Python; duplicata de regra de seguranca diverge
# por construcao, e o lado esquecido continua aprovando.
$padroesCredencial = @{}
(Get-Content -LiteralPath $arquivoDePadroes -Raw -Encoding UTF8 | ConvertFrom-Json).padroes.PSObject.Properties |
    ForEach-Object { $padroesCredencial[$_.Name] = $_.Value }
if ($padroesCredencial.Count -eq 0) {
    Write-Host "[ANCORA] A fonte de padroes nao declarou nenhum padrao." -ForegroundColor Red
    exit 1
}

foreach ($linha in $adicionadas) {
    foreach ($nome in $padroesCredencial.Keys) {
        if ($linha -match $padroesCredencial[$nome]) {
            # O valor NAO e ecoado: relatorio de vazamento nao repete o segredo.
            Add-Erro "Credencial em texto claro detectada ($nome). Revogue a chave e leia de variavel de ambiente."
        }
    }
}

# --- E3/E4/W1. ancora dos registros -----------------------------------------
$camposObrigatorios = @('id', 'tipo', 'escopo', 'autor', 'criado_em', 'verificado', 'nao_verificado')
$arquivosDeRegistro = @($arquivos | Where-Object { $_ -match '^(docs|reports)/.*\.md$' })

foreach ($arq in $arquivosDeRegistro) {
    $caminhoCompleto = Join-Path $repoRoot $arq
    if (-not (Test-Path $caminhoCompleto)) { continue }
    $linhas = Get-Content -LiteralPath $caminhoCompleto -Encoding UTF8 -ErrorAction SilentlyContinue
    if (-not $linhas) { continue }

    $temFm = ($linhas[0] -eq '---')
    if (-not $temFm) {
        Add-Aviso "Registro sem frontmatter (adocao pendente, M.O. 13.B): $arq"
        continue
    }

    # Delimitador de fechamento do bloco YAML.
    $fim = -1
    for ($i = 1; $i -lt $linhas.Count; $i++) {
        if ($linhas[$i] -eq '---') { $fim = $i; break }
    }
    if ($fim -lt 0) {
        Add-Erro "Frontmatter aberto e nunca fechado: $arq"
        continue
    }

    $bloco = @($linhas[1..($fim - 1)])
    $chaves = @()
    foreach ($l in $bloco) {
        if ($l -match '^([a-z_]+):') { $chaves += $Matches[1] }
    }

    foreach ($campo in $camposObrigatorios) {
        if ($chaves -notcontains $campo) {
            Add-Erro "Campo obrigatorio '$campo' ausente do frontmatter (M.O. 13.B): $arq"
        }
    }

    # `nao_verificado` vazio nao passa: verificacao nao executada nao e
    # verificacao aprovada, e a secao 5 da governanca exige a declaracao.
    $idxNv = [array]::IndexOf($bloco, ($bloco | Where-Object { $_ -match '^nao_verificado:' } | Select-Object -First 1))
    if ($idxNv -ge 0) {
        $valor = ($bloco[$idxNv] -replace '^nao_verificado:\s*', '').Trim()
        $temItemAbaixo = ($idxNv + 1 -lt $bloco.Count) -and ($bloco[$idxNv + 1] -match '^\s+-\s+\S')
        if (($valor -eq '' -or $valor -eq '[]') -and -not $temItemAbaixo) {
            Add-Erro "'nao_verificado' declarado vazio. Declare o que nao rodou, ou 'nenhuma' com justificativa: $arq"
        }
    }

    # Classe de decaimento exige a ancora correspondente (M.O. 13.A).
    $textoBloco = $bloco -join "`n"
    if ($textoBloco -match 'classes:.*externo') {
        if ($chaves -notcontains 'fontes')    { Add-Erro "Classe 'externo' sem 'fontes': $arq" }
        if ($chaves -notcontains 'ttl_dias')  { Add-Erro "Classe 'externo' sem 'ttl_dias' - fato externo decai pelo tempo: $arq" }
    }
    if ($textoBloco -match 'classes:.*medido') {
        if ($chaves -notcontains 'config_medida') {
            Add-Erro "Classe 'medido' sem 'config_medida' - numero medido so vale na configuracao medida: $arq"
        }
    }
}

# --- veredito ----------------------------------------------------------------
Write-Host ''
Write-Host '======================================================================' -ForegroundColor Cyan
Write-Host '[PORTAO DE ANCORA] M.O. SOTA v8.0 GOLD, secao 13.F' -ForegroundColor Yellow
Write-Host '======================================================================' -ForegroundColor Cyan

if ($avisos.Count -gt 0) {
    Write-Host ''
    Write-Host "AVISOS ($($avisos.Count)) - informativos durante a adocao, nao bloqueiam:" -ForegroundColor Yellow
    foreach ($a in $avisos) { Write-Host "   $a" -ForegroundColor Yellow }
}

if ($erros.Count -gt 0) {
    Write-Host ''
    Write-Host "ERROS ($($erros.Count)) - commit BLOQUEADO:" -ForegroundColor Red
    foreach ($e in $erros) { Write-Host "   $e" -ForegroundColor Red }
    Write-Host ''
    Write-Host 'Nao contorne. A governanca proibe bypass: investigue o achado.' -ForegroundColor Red
    Write-Host ''
    exit 1
}

Write-Host ''
Write-Host "APROVADO. Ancoras integras em $(@($arquivos).Count) arquivo(s) em stage." -ForegroundColor Green
Write-Host ''
exit 0
