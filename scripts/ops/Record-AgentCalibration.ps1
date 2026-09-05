<#
.SYNOPSIS
    Anexa ao ledger o registro que FECHA um ciclo de calibracao, encadeado por
    SHA-256, e com isso reinicia a contagem do portao de suficiencia.

.DESCRIPTION
    O portao (SS8.3 do CLAUDE.md) sabia abrir e nao sabia fechar. Medido em
    2026-09-05: o ledger real estava em 10 sessoes distintas com
    `calibration_planning_permitted: true` e `ultima_calibracao: null` desde a
    terceira -- porque a contagem so reinicia apos um registro
    `record_type: 'calibration'` e NENHUM script emitia esse tipo.

    Havia um segundo defeito, mais fundo, corrigido junto:
    `New-AgentCalibrationDailyEvidence.ps1` procurava o marco da ultima
    calibracao dentro de uma colecao ja filtrada por
    `record_type -eq 'feedback'`. Era conjunto vazio por construcao -- o marco
    nunca seria lido nem depois de escrito. Escritor sem leitor teria sido
    decoracao, do mesmo tipo que a SS8.3 recusa em correcao nao aplicada.

    O que este script recusa, e por que cada recusa existe:

    - PORTAO FECHADO. Sem suficiencia nao ha calibracao. A excecao prevista
      pela SS8.3 existe -- `-GateOverrideReason` --, exige motivo textual, e
      fica gravada no registro junto de `structural_gate_passed: $false`. A
      excecao nao mente sobre o portao.
    - MENOS DE DUAS CORROBORACOES, ou duas da MESMA sessao. A SS8.3 exige
      "duas confirmacoes independentes do mesmo padrao operacional", e o
      proprio `evidence_gate` declara nao medir isso: "continua sendo obrigacao
      do auditor". Independente = origem distinta; uma origem so nao e
      recorrencia. E a mesma regra que ja recusa feedback sem `session_id`.
    - CORROBORACAO QUE APONTA PARA NADA. Herdado de
      `Record-AgentCalibrationCorrection.ps1`: registro que aponta para nada
      parece revisao sem ser, e parecer revisao e pior que nao revisar.
    - HIPOTESE INCOMPLETA. A SS8.3 lista oito componentes obrigatorios. Sem
      falsificador e criterio de reversao nao ha hipotese: ha opiniao com
      formato de hipotese.

    O ledger e append-only e tamper-evident, nao fisicamente imutavel.
    PowerShell 7+ e o runtime operacional; 5.1 permanece compativel.
#>
[CmdletBinding()]
param(
    # O padrao operacional confirmado. Nao e resumo da sessao: e a coisa que se
    # repetiu e que a calibracao pretende enderecar.
    [Parameter(Mandatory)]
    [ValidateNotNullOrEmpty()]
    [string]$Pattern,

    # event_id dos feedbacks que confirmam o padrao. Minimo dois, de sessoes
    # distintas. Aceita array ou lista separada por virgula.
    [Parameter(Mandatory)]
    [ValidateNotNullOrEmpty()]
    [string[]]$CorroboratingEventIds,

    # Camada 1 da SS8.3: leitura da serie, dos outliers e do efeito da hipotese
    # anterior.
    [Parameter(Mandatory)]
    [ValidateNotNullOrEmpty()]
    [string]$ObservacaoRecursiva,

    # Camada 2 da SS8.3: hipotese bayesiano-preditiva, em JSON, com os oito
    # componentes exigidos.
    [Parameter(Mandatory)]
    [ValidateNotNullOrEmpty()]
    [string]$HypothesisJson,

    # Excecao ao limiar. So existe por instrucao explicita do administrador, e
    # consta do relatorio -- SS8.3. Preenchido, permite registrar com o portao
    # estrutural fechado, e o motivo fica no ledger.
    [string]$GateOverrideReason = '',

    [string]$Authority = 'Tier 0 - Raphael Vitoi',

    [string]$LedgerPath = ''
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# Os oito componentes que a SS8.3 exige de uma hipotese. A ordem e a da
# governanca, e a mensagem de erro nomeia os que faltam -- dizer apenas
# "hipotese incompleta" obrigaria o operador a adivinhar qual.
$COMPONENTES_DA_HIPOTESE = @(
    'prior_operacional',
    'evidencia_a_favor',
    'evidencia_contra',
    'previsao_observavel',
    'metricas_afetadas',
    'falsificador',
    'criterio_de_reversao',
    'risco_de_degradacao'
)

function Get-Sha256Hex {
    param([Parameter(Mandatory)][string]$Text)
    $sha = [System.Security.Cryptography.SHA256]::Create()
    try {
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($Text)
        return -join ($sha.ComputeHash($bytes) | ForEach-Object { $_.ToString('x2') })
    }
    finally { $sha.Dispose() }
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
    foreach ($key in $Fields.Keys) { $payload[$key] = $Fields[$key] }
    $canonical = $payload | ConvertTo-Json -Compress -Depth 8
    $payload['record_hash'] = Get-Sha256Hex -Text $canonical
    return [pscustomobject]$payload
}

# -Pattern e -ObservacaoRecursiva chegam de linha de comando, onde uma lista
# separada por virgula e mais natural que um array. Normaliza os dois casos.
$corroboracoes = @(
    $CorroboratingEventIds |
        ForEach-Object { $_ -split ',' } |
        ForEach-Object { $_.Trim() } |
        Where-Object { -not [string]::IsNullOrWhiteSpace($_) }
)

try { $hipotese = $HypothesisJson | ConvertFrom-Json }
catch { throw 'HypothesisJson precisa ser um objeto JSON valido.' }

$faltantes = @($COMPONENTES_DA_HIPOTESE | Where-Object {
    -not ($hipotese.PSObject.Properties.Name -contains $_) -or
    [string]::IsNullOrWhiteSpace([string]$hipotese.$_)
})
if ($faltantes.Count -gt 0) {
    throw ("Hipotese incompleta. Componentes ausentes ou vazios: {0}. A SS8.3 exige os oito: {1}." -f `
        ($faltantes -join ', '), ($COMPONENTES_DA_HIPOTESE -join ', '))
}

$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
if ([string]::IsNullOrWhiteSpace($LedgerPath)) {
    $LedgerPath = Join-Path $repositoryRoot 'reports\agent-calibration\feedback-ledger.jsonl'
}
if (-not (Test-Path -LiteralPath $LedgerPath)) {
    throw "Ledger nao encontrado: $LedgerPath. Calibracao exige serie existente."
}
$LedgerPath = (Resolve-Path -LiteralPath $LedgerPath).Path

# O PORTAO E MEDIDO ANTES DO LOCK, e de proposito.
#
# `New-AgentCalibrationDailyEvidence.ps1` e a fonte unica da suficiencia --
# reimplementar a contagem aqui criaria a segunda fonte que a SS3 do
# CLAUDE.md proibe, e as duas divergiriam na primeira mudanca de regra. Ele so
# le; medir antes de segurar o lock evita que um verificador futuro que
# tambem trave o arquivo trave contra nos mesmos.
$outlierPath = Join-Path (Split-Path -Parent $LedgerPath) 'outlier-evidence-ledger.jsonl'
$evidenciaScript = Join-Path $PSScriptRoot 'New-AgentCalibrationDailyEvidence.ps1'
$evidencia = & $evidenciaScript -LedgerPath $LedgerPath -OutlierLedgerPath $outlierPath | ConvertFrom-Json
$portaoAberto = [bool]$evidencia.calibration_planning_permitted

if (-not $portaoAberto -and [string]::IsNullOrWhiteSpace($GateOverrideReason)) {
    throw ("dados insuficientes -- nenhuma calibracao planejada. {0} Use -GateOverrideReason apenas sob instrucao explicita do administrador." -f `
        $evidencia.evidence_gate.reason)
}

$lockPath = "$LedgerPath.lock"
$lockStream = $null
try {
    $lockStream = [System.IO.File]::Open($lockPath, [System.IO.FileMode]::OpenOrCreate, [System.IO.FileAccess]::ReadWrite, [System.IO.FileShare]::None)
    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)

    & (Join-Path $PSScriptRoot 'Test-AgentCalibrationLedger.ps1') -LedgerPath $LedgerPath | Out-Null
    $rows = @(Get-Content -LiteralPath $LedgerPath -Encoding UTF8 | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | ForEach-Object { $_ | ConvertFrom-Json })
    $feedbacks = @($rows | Where-Object { $_.record_type -eq 'feedback' })

    if ($corroboracoes.Count -lt 2) {
        throw ("A SS8.3 exige duas confirmacoes independentes do mesmo padrao; foram informadas {0}." -f $corroboracoes.Count)
    }

    $sessoesDeOrigem = New-Object System.Collections.Generic.List[string]
    foreach ($eventId in $corroboracoes) {
        $alvo = @($feedbacks | Where-Object { [string]$_.event_id -eq $eventId })
        if ($alvo.Count -eq 0) {
            throw "Corroboracao aponta para feedback inexistente: '$eventId'."
        }
        if ($alvo.Count -gt 1) {
            throw "event_id '$eventId' aparece $($alvo.Count) vezes; ledger ambiguo."
        }
        $sessoesDeOrigem.Add([string]$alvo[0].session_id)
    }

    # INDEPENDENCIA E ORIGEM DISTINTA, nao contagem de registros. Duas notas da
    # mesma sessao sao a mesma observacao vista duas vezes.
    $origensDistintas = @($sessoesDeOrigem | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | Sort-Object -Unique)
    if ($origensDistintas.Count -lt 2) {
        throw ("As corroboracoes precisam vir de sessoes distintas; todas vieram de: {0}. Uma origem so nao e recorrencia." -f `
            (($origensDistintas | ForEach-Object { if ($_) { $_ } else { '(sem sessao)' } }) -join ', '))
    }

    $tail = $rows[-1]
    $campos = [ordered]@{
        calibration_id           = [guid]::NewGuid().ToString()
        pattern                  = $Pattern.Trim()
        corroborating_event_ids  = $corroboracoes
        corroborating_sessions   = $origensDistintas
        observacao_recursiva     = $ObservacaoRecursiva.Trim()
        hipotese                 = $hipotese
        sessions_considered      = @($evidencia.sessoes_com_feedback)
        feedback_count_considered = [int]$evidencia.feedback_count_acumulado
        structural_gate_passed   = $portaoAberto
        authority                = $Authority.Trim()
    }
    if (-not [string]::IsNullOrWhiteSpace($GateOverrideReason)) {
        $campos['gate_override_reason'] = $GateOverrideReason.Trim()
    }

    $record = New-HashChainedRecord -Sequence ([int]$tail.sequence + 1) -RecordType 'calibration' -RecordedAt ([DateTimeOffset]::Now.ToString('o')) -PreviousHash ([string]$tail.record_hash) -Fields $campos
    [System.IO.File]::AppendAllText($LedgerPath, (($record | ConvertTo-Json -Compress -Depth 8) + [Environment]::NewLine), $utf8NoBom)

    [pscustomobject]@{
        status                  = 'calibrated'
        calibration_id          = $record.calibration_id
        pattern                 = $record.pattern
        corroborating_sessions  = $origensDistintas
        structural_gate_passed  = $portaoAberto
        gate_override_reason    = $GateOverrideReason.Trim()
        sessions_reset          = @($evidencia.sessoes_com_feedback).Count
        sequence                = $record.sequence
        record_hash             = $record.record_hash
        ledger_path             = $LedgerPath
    } | ConvertTo-Json -Compress
}
finally {
    if ($null -ne $lockStream) { $lockStream.Dispose() }
}
