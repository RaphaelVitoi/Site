<#
.SYNOPSIS
    Appends one user feedback event to the tamper-evident agent-calibration ledger.

.DESCRIPTION
    The ledger is JSONL with a SHA-256 hash chain. It is not physically immutable:
    a local administrator can alter disk contents. It is tamper-evident when
    verified by Test-AgentCalibrationLedger.ps1 and anchored by an authorized
    Git commit. PowerShell 7+ is the operational default; Windows PowerShell
    5.1 compatibility is retained for legacy project components.
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [ValidateRange(0, 10)]
    [decimal]$Score,

    [Parameter(Mandatory)]
    [ValidateNotNullOrEmpty()]
    [string]$Feedback,

    [string]$Scope = 'handoff',

    [string]$SessionId = '',

    # Instante de inicio da SESSAO (nao do feedback), em formato parseavel por
    # DateTimeOffset. Sessao = do inicio ao fim de um trabalho; compactacao de
    # contexto nao a reinicia. Todos os feedbacks de uma mesma sessao devem
    # declarar o MESMO valor aqui.
    [string]$SessionStartedAt = '',

    # Modelo exato que conduziu a sessao (ex.: gemini-3.8-flash, claude-opus-5, chatgpt-5.6).
    [string]$ConductorModel = '',

    # Veiculo do condutor -- a automacao ou superficie que executou o modelo.
    # Vale IGUALMENTE ao modelo, por decisao do Tier 0 em 2026-09-11. Exemplos
    # medidos nesta malha: codex, antigravity, claude-code.
    [string]$ConductorVehicle = '',

    # Regime de operacao da sessao: assistida (arbitrada pelo Tier 0) ou automatizada.
    [ValidateSet('', 'assistida', 'automatizada')]
    [string]$SupervisionMode = '',

    # Chamadas de ferramenta da sessao e quantas falharam. O par entra JUNTO ou
    # nao entra: taxa sem denominador nao e medicao -- 25% sobre 16 chamadas e
    # ruido, sobre 1092 e sinal, e foi essa confusao que travou o outlier
    # da7ef222 por nove dias. A taxa e derivada na leitura, nunca gravada.
    [ValidateRange(0, 1000000)]
    [int]$ToolCalls = -1,

    [ValidateRange(0, 1000000)]
    [int]$ToolErrors = -1,

    # COMO os dois numeros foram obtidos. Sem isto o campo mente por omissao:
    # medido em 2026-09-12, os tres veiculos NAO registram a mesma coisa em
    # disco, e um indice que os empilhasse sem rotulo compararia grandezas
    # diferentes.
    #
    #   is_error        Claude Code. Booleano por tool_result no transcript
    #                   jsonl. Exato.
    #   sentinela       Codex. O rollout jsonl nao tem campo de erro, mas a
    #                   primeira linha da saida e sentinela do proprio harness:
    #                   'Script completed' ou 'Script failed'. Medido em
    #                   2026-09-12 sobre setembro: 770 contra 26, sem terceira
    #                   forma entre as saidas concluidas. Determinista, porem
    #                   string e nao campo tipado -- muda se o harness mudar, e
    #                   por isso nao se chama exato.
    #   status_erro     Antigravity 2.0. Um SQLite por conversa em
    #                   ~/.gemini/antigravity/conversations. Na tabela `steps`,
    #                   step_type 132 e o passo acionavel e status 7 e a falha;
    #                   `error_details` so e nao-vazio nessa combinacao, 87 de 87
    #                   nos 21 bancos de setembro. Campo TIPADO, como o is_error.
    #
    #                   Cuidado medido no mesmo dia: `AppData\Roaming\Antigravity
    #                   IDE` NAO e o veiculo -- e o IDE compartilhado por todos os
    #                   modelos igualmente. Medi-lo para falar do Antigravity 2.0
    #                   levou a concluir que o veiculo nao instrumentava nada,
    #                   quando instrumenta melhor que os outros dois. Superficie
    #                   compartilhada nao identifica condutor.
    #   heuristica      Deteccao por texto sem sentinela declarada pelo harness.
    #                   Reservada; nenhum veiculo desta malha usa hoje.
    #   declarado       Veiculo sem registro proprio por chamada. O condutor
    #                   declara o que contou, e o rotulo diz que foi declarado.
    [ValidateSet('', 'is_error', 'status_erro', 'sentinela', 'heuristica', 'declarado')]
    [string]$ToolErrorMethod = '',

    [string]$LedgerPath = ''
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Get-Sha256Hex {
    param([Parameter(Mandatory)][string]$Text)
    $sha = [System.Security.Cryptography.SHA256]::Create()
    try {
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($Text)
        return -join ($sha.ComputeHash($bytes) | ForEach-Object { $_.ToString('x2') })
    }
    finally {
        $sha.Dispose()
    }
}

function New-HashChainedRecord {
    param(
        [Parameter(Mandatory)][int]$Sequence,
        [Parameter(Mandatory)][string]$RecordType,
        [Parameter(Mandatory)][string]$RecordedAt,
        [Parameter(Mandatory)][string]$PreviousHash,
        [Parameter(Mandatory)][System.Collections.IDictionary]$Fields
    )

    $payload = [ordered]@{
        schema_version = 'agent-calibration-ledger/v1'
        sequence       = $Sequence
        record_type    = $RecordType
        recorded_at    = $RecordedAt
        previous_hash  = $PreviousHash
    }
    foreach ($key in $Fields.Keys) {
        $payload[$key] = $Fields[$key]
    }
    $canonical = $payload | ConvertTo-Json -Compress -Depth 8
    $payload['record_hash'] = Get-Sha256Hex -Text $canonical
    return [pscustomobject]$payload
}

$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$ledgerDirectory = Join-Path $repositoryRoot 'reports\agent-calibration'
if ([string]::IsNullOrWhiteSpace($LedgerPath)) {
    $LedgerPath = Join-Path $ledgerDirectory 'feedback-ledger.jsonl'
}
$ledgerDirectory = Split-Path -Parent $LedgerPath
New-Item -ItemType Directory -Force -Path $ledgerDirectory | Out-Null

$lockPath = "$ledgerPath.lock"
$lockStream = $null
try {
    $lockStream = [System.IO.File]::Open($lockPath, [System.IO.FileMode]::OpenOrCreate, [System.IO.FileAccess]::ReadWrite, [System.IO.FileShare]::None)
    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)

    if (-not (Test-Path -LiteralPath $ledgerPath)) {
        $genesis = New-HashChainedRecord -Sequence 0 -RecordType 'genesis' -RecordedAt ([DateTimeOffset]::Now.ToString('o')) -PreviousHash ('0' * 64) -Fields ([ordered]@{
            policy = 'append-only hash chain; verify before use; Git anchoring requires explicit authorization'
        })
        [System.IO.File]::WriteAllText($ledgerPath, (($genesis | ConvertTo-Json -Compress -Depth 8) + [Environment]::NewLine), $utf8NoBom)
    }

    $verifyScript = Join-Path $PSScriptRoot 'Test-AgentCalibrationLedger.ps1'
    & $verifyScript -LedgerPath $ledgerPath | Out-Null

    $rows = @(Get-Content -LiteralPath $ledgerPath -Encoding UTF8 | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | ForEach-Object { $_ | ConvertFrom-Json })
    $tail = $rows[-1]
    $campos = [ordered]@{
        event_id   = [guid]::NewGuid().ToString()
        session_id = $SessionId
        score      = $Score
        feedback   = $Feedback.Trim()
        scope      = $Scope.Trim()
    }
    # Ancora temporal da sessao. Sessao vai do inicio ao fim de um trabalho e
    # compactacao de contexto NAO a encerra; sem esta marca, uma sessao partida
    # por compactacao e indistinguivel de duas sessoes legitimas. Opcional para
    # nao invalidar registros anteriores, mas quando presente o portao de
    # suficiencia usa a divergencia dela para detectar sessao partida.
    if (-not [string]::IsNullOrWhiteSpace($SessionStartedAt)) {
        $campos['session_started_at'] = ([DateTimeOffset]::Parse($SessionStartedAt)).ToString('o')
    }
    if (-not [string]::IsNullOrWhiteSpace($ConductorModel)) {
        $campos['conductor_model'] = $ConductorModel.Trim()
    }
    # VEICULO E MODELO SAO DOIS EIXOS, E VALEM IGUALMENTE.
    #
    # Decisao do Tier 0 em 2026-09-11. Ate esta data o ledger registrava apenas o
    # modelo, e o veiculo -- a automacao ou superficie que o conduziu: codex,
    # antigravity, claude-code -- nao tinha campo. O custo apareceu na pratica: o
    # registro da sequencia 16 dizia `Codex GPT-6`, que mistura os dois num campo
    # so, e ao corrigi-lo para o identificador canonico do modelo eu DESCARTEI a
    # informacao de que a automacao era o Codex. Um campo que funde dois eixos
    # perde um deles em toda correcao.
    #
    # Paridade, nao hierarquia: nenhum dos dois e derivavel do outro. O mesmo
    # modelo roda sob veiculos diferentes, e o mesmo veiculo conduz modelos
    # diferentes -- a fronteira Terra/Astra de 2026-09-09 trocou o modelo sem
    # trocar o veiculo.
    if (-not [string]::IsNullOrWhiteSpace($ConductorVehicle)) {
        $campos['conductor_vehicle'] = $ConductorVehicle.Trim()
    }
    if (-not [string]::IsNullOrWhiteSpace($SupervisionMode)) {
        $campos['supervision_mode'] = $SupervisionMode.Trim()
    }
    # O PAR E INDIVISIVEL, E O METODO E OBRIGATORIO COM ELE.
    #
    # Existe porque o instrumento nao pode ser igualado na leitura. Medido em
    # 2026-09-12: dos tres veiculos, so o Claude Code grava um booleano de erro
    # por chamada. O Codex grava a chamada e a saida, sem marca de erro; o
    # Antigravity nao grava evento de ferramenta nenhum. Nao ha indexador capaz
    # de produzir a mesma grandeza a partir de fontes que nao a escrevem -- a
    # unica superficie onde os tres podem reportar a MESMA coisa e o handoff, e
    # e aqui que ele chega.
    #
    # Consequencia direta: o falsificador do outlier da7ef222 exige tres sessoes
    # distintas com taxa medida, e so 5 das 21 sessoes da serie eram mensuraveis
    # -- as 8 do antigravity e as 2 do codex nao deixavam rastro. Com este campo
    # o denominador passa a existir para os tres.
    $temChamadas = $ToolCalls -ge 0
    $temErros = $ToolErrors -ge 0
    if ($temChamadas -ne $temErros) {
        throw '-ToolCalls e -ToolErrors entram juntos: numerador sem denominador nao e medicao.'
    }
    if ($temChamadas) {
        if ($ToolErrors -gt $ToolCalls) {
            throw ("ToolErrors ({0}) maior que ToolCalls ({1}): impossivel." -f $ToolErrors, $ToolCalls)
        }
        if ([string]::IsNullOrWhiteSpace($ToolErrorMethod)) {
            throw 'Com -ToolCalls e -ToolErrors, -ToolErrorMethod e obrigatorio: numero sem procedencia compara grandezas diferentes.'
        }
        $campos['tool_calls'] = $ToolCalls
        $campos['tool_errors'] = $ToolErrors
        $campos['tool_error_method'] = $ToolErrorMethod
    }
    elseif (-not [string]::IsNullOrWhiteSpace($ToolErrorMethod)) {
        throw '-ToolErrorMethod so tem sentido acompanhando -ToolCalls e -ToolErrors.'
    }
    $record = New-HashChainedRecord -Sequence ([int]$tail.sequence + 1) -RecordType 'feedback' -RecordedAt ([DateTimeOffset]::Now.ToString('o')) -PreviousHash ([string]$tail.record_hash) -Fields $campos
    [System.IO.File]::AppendAllText($ledgerPath, (($record | ConvertTo-Json -Compress -Depth 8) + [Environment]::NewLine), $utf8NoBom)
    [pscustomobject]@{
        status      = 'appended'
        sequence    = $record.sequence
        record_hash = $record.record_hash
        ledger_path = $ledgerPath
    } | ConvertTo-Json -Compress
}
finally {
    if ($null -ne $lockStream) { $lockStream.Dispose() }
}
