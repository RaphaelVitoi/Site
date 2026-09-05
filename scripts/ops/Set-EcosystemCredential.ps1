<#
.SYNOPSIS
    Grava uma credencial do ecossistema em HKCU:\Environment sem passar por disco.

.DESCRIPTION
    A secao 3 do CLAUDE.md da raiz proibe credencial em texto claro, e a secao 6.4
    fixa onde elas moram: variavel de ambiente de USUARIO (HKCU:\Environment).
    Este script e o caminho unico para inserir ou renovar uma delas.

    O QUE ELE EVITA, E POR QUE CADA UM IMPORTA:

      - Arquivo. A chave nunca toca o disco, entao nao ha o que esquecer de
        apagar nem o que um `git add -A` possa capturar por acidente.
      - Historico do shell. Uma chave passada como ARGUMENTO fica em
        PSReadLine (ConsoleHost_history.txt) e sobrevive ao fechamento do
        terminal. Aqui ela entra por Read-Host -AsSecureString, que nao ecoa e
        nao registra.
      - Log e telemetria. O valor nunca e impresso, nem em erro. A saida confirma
        apenas o COMPRIMENTO, que basta para verificar que colou inteira.

    MOTIVO IMEDIATO (2026-09-04): tres credenciais foram encontradas em texto
    claro em arquivos versionados e ja empurrados -- uma literal em
    engine/stitch_bridge.py e duas republicadas em JULES_REPORT.md a partir do
    prompt de uma sessao do Jules. As tres exigem revogacao; este script existe
    para que a substituta nao repita o caminho.

.PARAMETER Nome
    Nome da variavel de ambiente (ex.: STITCH_API_KEY).

.PARAMETER Verificar
    Nao grava nada: apenas informa se a variavel existe e qual o comprimento.

.EXAMPLE
    .\scripts\ops\Set-EcosystemCredential.ps1 -Nome STITCH_API_KEY

.EXAMPLE
    .\scripts\ops\Set-EcosystemCredential.ps1 -Verificar

.NOTES
    Compativel com Windows PowerShell 5.1 e PowerShell 7+.
    Encoding UTF-8 com BOM, exigencia da secao 6.4 do CLAUDE.md do projeto.
#>
[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [string] $Nome,

    [switch] $Verificar
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# Credenciais que este ecossistema usa. Serve de referencia ao operador e de
# lista para o modo -Verificar; nomes fora dela continuam aceitos.
$CredenciaisConhecidas = @(
    'JULES_API_KEY',
    'STITCH_API_KEY',
    'EXA_API_KEY',
    'GITHUB_TOKEN',
    'RENDER_API_KEY',
    'GOOGLE_CLOUD_PROJECT'
)

function Show-Estado {
    param([string[]] $Nomes)

    Write-Host ''
    Write-Host 'Credencial              Escopo Usuario   Sessao atual' -ForegroundColor Cyan
    Write-Host '----------------------  ---------------  ------------' -ForegroundColor Cyan

    foreach ($n in $Nomes) {
        $persistida = [Environment]::GetEnvironmentVariable($n, 'User')
        $naSessao = [Environment]::GetEnvironmentVariable($n, 'Process')

        if ([string]::IsNullOrEmpty($persistida)) {
            $colunaPersistida = 'AUSENTE'
        }
        else {
            $colunaPersistida = "{0} chars" -f $persistida.Length
        }

        if ([string]::IsNullOrEmpty($naSessao)) {
            $colunaSessao = 'ausente'
        }
        else {
            $colunaSessao = "{0} chars" -f $naSessao.Length
        }

        Write-Host ("{0,-22}  {1,-15}  {2}" -f $n, $colunaPersistida, $colunaSessao)
    }
    Write-Host ''
}

if ($Verificar) {
    Show-Estado -Nomes $CredenciaisConhecidas
    Write-Host 'Somente comprimentos sao exibidos. O valor nunca e impresso.' -ForegroundColor DarkGray
    return
}

if ([string]::IsNullOrWhiteSpace($Nome)) {
    Write-Host 'Informe o nome da credencial. Conhecidas neste ecossistema:' -ForegroundColor Yellow
    foreach ($c in $CredenciaisConhecidas) { Write-Host "  - $c" }
    Write-Host ''
    Write-Host 'Uso: .\scripts\ops\Set-EcosystemCredential.ps1 -Nome STITCH_API_KEY' -ForegroundColor DarkGray
    Write-Host 'Ou:  .\scripts\ops\Set-EcosystemCredential.ps1 -Verificar' -ForegroundColor DarkGray
    exit 1
}

$anterior = [Environment]::GetEnvironmentVariable($Nome, 'User')
if ([string]::IsNullOrEmpty($anterior)) {
    Write-Host "$Nome ainda nao existe no escopo de usuario. Sera criada." -ForegroundColor Yellow
}
else {
    Write-Host "$Nome ja existe ($($anterior.Length) chars) e sera SUBSTITUIDA." -ForegroundColor Yellow
    Write-Host 'A credencial anterior deve ser revogada no provedor.' -ForegroundColor Yellow
}

Write-Host ''
Write-Host 'Cole o valor. Ele nao aparece na tela e nao entra no historico.' -ForegroundColor Cyan
$segura = Read-Host -Prompt "  $Nome" -AsSecureString

# Conversao em bloco protegido: o texto claro existe pelo menor tempo possivel e
# o buffer nao gerenciado e liberado mesmo se algo falhar no meio.
$ptr = [IntPtr]::Zero
try {
    $ptr = [Runtime.InteropServices.Marshal]::SecureStringToGlobalAllocUnicode($segura)
    $claro = [Runtime.InteropServices.Marshal]::PtrToStringUni($ptr)

    if ([string]::IsNullOrWhiteSpace($claro)) {
        Write-Host 'Valor vazio. Nada foi alterado.' -ForegroundColor Red
        exit 1
    }

    $claro = $claro.Trim()

    # Persistente, para toda sessao futura.
    [Environment]::SetEnvironmentVariable($Nome, $claro, 'User')
    # E na sessao corrente, para nao exigir reabrir o terminal agora.
    [Environment]::SetEnvironmentVariable($Nome, $claro, 'Process')

    $comprimento = $claro.Length
}
finally {
    if ($ptr -ne [IntPtr]::Zero) {
        [Runtime.InteropServices.Marshal]::ZeroFreeGlobalAllocUnicode($ptr)
    }
    Remove-Variable -Name claro -ErrorAction SilentlyContinue
}

$confirmacao = [Environment]::GetEnvironmentVariable($Nome, 'User')
if ($confirmacao.Length -ne $comprimento) {
    Write-Host 'Gravacao nao confere. Verifique manualmente.' -ForegroundColor Red
    exit 1
}

Write-Host ''
Write-Host "OK. $Nome gravada com $comprimento caracteres." -ForegroundColor Green
Write-Host 'Persistida em HKCU:\Environment e ativa nesta sessao.' -ForegroundColor Green
Write-Host 'Processos ja abertos (IDE, servidores) so a herdam apos reinicio.' -ForegroundColor DarkGray
Write-Host ''
Write-Host 'A credencial NAO foi escrita em arquivo nenhum, por desenho.' -ForegroundColor DarkGray
