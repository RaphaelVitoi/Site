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
[CmdletBinding(DefaultParameterSetName = 'Calibrate')]
param(
    # O padrao operacional confirmado. Nao e resumo da sessao: e a coisa que se
    # repetiu e que a calibracao pretende enderecar.
    [Parameter(Mandatory, ParameterSetName = 'Calibrate')]
    [ValidateNotNullOrEmpty()]
    [string]$Pattern = '',

    # event_id dos feedbacks que confirmam o padrao. Minimo dois, de sessoes
    # distintas. Aceita array ou lista separada por virgula.
    [Parameter(Mandatory, ParameterSetName = 'Calibrate')]
    [ValidateNotNullOrEmpty()]
    [string[]]$CorroboratingEventIds = @(),

    # Camada 1 da SS8.3: leitura da serie, dos outliers e do efeito da hipotese
    # anterior.
    [Parameter(Mandatory, ParameterSetName = 'Calibrate')]
    [ValidateNotNullOrEmpty()]
    [string]$ObservacaoRecursiva = '',

    # Camada 2 da SS8.3: hipotese bayesiano-preditiva, em JSON, com os oito
    # componentes exigidos.
    [Parameter(Mandatory, ParameterSetName = 'Calibrate')]
    [ValidateNotNullOrEmpty()]
    [string]$HypothesisJson = '',

    # Excecao ao limiar. So existe por instrucao explicita do administrador, e
    # consta do relatorio -- SS8.3. Preenchido, permite registrar com o portao
    # estrutural fechado, e o motivo fica no ledger.
    [Parameter(ParameterSetName = 'Calibrate')]
    [string]$GateOverrideReason = '',

    # Confirmacao obrigatoria de presenca e conducao explicita do Tier 0 para
    # calibracao formal (`record_type: calibration`) ou retratacao append-only.
    [switch]$Tier0Present,

    # Auto-calibragem minima apos >= 3 sessoes distintas com feedback: grava
    # `auto_calibration` sem zerar o ciclo formal nem substituir calibracao Tier 0.
    [Parameter(ParameterSetName = 'Calibrate')]
    [switch]$AutoMinima,

    # Retratacao append-only de uma calibracao registrada sem presenca Tier 0.
    [Parameter(Mandatory, ParameterSetName = 'Retract')]
    [ValidateNotNullOrEmpty()]
    [string]$RetractCalibrationId = '',

    [Parameter(Mandatory, ParameterSetName = 'Retract')]
    [ValidateNotNullOrEmpty()]
    [string]$RetractionReason = '',

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

if ($AutoMinima -and $Tier0Present) {
    throw 'Nao combine -AutoMinima e -Tier0Present. Auto-calibragem minima nao substitui nem zera o ciclo formal presencial.'
}

$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
if ([string]::IsNullOrWhiteSpace($LedgerPath)) {
    $LedgerPath = Join-Path $repositoryRoot 'reports\agent-calibration\feedback-ledger.jsonl'
}
if (-not (Test-Path -LiteralPath $LedgerPath)) {
    throw "Ledger nao encontrado: $LedgerPath. Calibracao exige serie existente."
}
$LedgerPath = (Resolve-Path -LiteralPath $LedgerPath).Path

$lockPath = "$LedgerPath.lock"
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

if ($PSCmdlet.ParameterSetName -eq 'Retract') {
    if (-not $Tier0Present) {
        throw 'Retratacao append-only de calibracao exige presenca explicita do Tier 0 (-Tier0Present).'
    }
    if ($Authority -notmatch 'Tier\s*0') {
        throw 'Retratacao append-only de calibracao exige autoridade Tier 0.'
    }

    $alvoId = $RetractCalibrationId.Trim()
    $motivo = $RetractionReason.Trim()
    $lockStream = $null
    try {
        $lockStream = [System.IO.File]::Open($lockPath, [System.IO.FileMode]::OpenOrCreate, [System.IO.FileAccess]::ReadWrite, [System.IO.FileShare]::None)
        & (Join-Path $PSScriptRoot 'Test-AgentCalibrationLedger.ps1') -LedgerPath $LedgerPath | Out-Null
        $rows = @(Get-Content -LiteralPath $LedgerPath -Encoding UTF8 | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | ForEach-Object { $_ | ConvertFrom-Json })

        $alvos = @($rows | Where-Object { $_.record_type -eq 'calibration' -and [string]$_.calibration_id -eq $alvoId })
        if ($alvos.Count -eq 0) {
            throw "Calibracao nao encontrada para retratacao: '$alvoId'."
        }
        if ($alvos.Count -gt 1) {
            throw "calibration_id '$alvoId' aparece $($alvos.Count) vezes; ledger ambiguo."
        }
        $jaRetratada = @($rows | Where-Object { $_.record_type -eq 'calibration_retraction' -and [string]$_.retracted_calibration_id -eq $alvoId })
        if ($jaRetratada.Count -gt 0) {
            throw "Calibracao '$alvoId' ja foi retratada anteriormente (sequence $($jaRetratada[0].sequence))."
        }

        $tail = $rows[-1]
        $camposRetratacao = [ordered]@{
            retraction_id            = [guid]::NewGuid().ToString()
            retracted_calibration_id = $alvoId
            retracted_sequence       = [int]$alvos[0].sequence
            reason                   = $motivo
            tier0_presencial         = $true
            authority                = $Authority.Trim()
        }
        $record = New-HashChainedRecord -Sequence ([int]$tail.sequence + 1) -RecordType 'calibration_retraction' -RecordedAt ([DateTimeOffset]::Now.ToString('o')) -PreviousHash ([string]$tail.record_hash) -Fields $camposRetratacao
        [System.IO.File]::AppendAllText($LedgerPath, (($record | ConvertTo-Json -Compress -Depth 8) + [Environment]::NewLine), $utf8NoBom)

        [pscustomobject]@{
            status                   = 'retracted'
            retraction_id            = $record.retraction_id
            retracted_calibration_id = $record.retracted_calibration_id
            retracted_sequence       = $record.retracted_sequence
            reason                   = $record.reason
            sequence                 = $record.sequence
            record_hash              = $record.record_hash
            ledger_path              = $LedgerPath
        } | ConvertTo-Json -Compress
        return
    }
    finally {
        if ($null -ne $lockStream) { $lockStream.Dispose() }
    }
}

if (-not $AutoMinima -and -not $Tier0Present) {
    throw 'Calibracao formal (record_type: calibration) exige presenca do administrador (-Tier0Present). Sem o Tier 0 presente, use -AutoMinima (auto_calibration, sem zerar o ciclo formal).'
}
if ($Tier0Present -and ($Authority -notmatch 'Tier\s*0')) {
    throw 'Calibracao formal com -Tier0Present exige -Authority indicando Tier 0.'
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

$lockStream = $null
try {
    $lockStream = [System.IO.File]::Open($lockPath, [System.IO.FileMode]::OpenOrCreate, [System.IO.FileAccess]::ReadWrite, [System.IO.FileShare]::None)

    & (Join-Path $PSScriptRoot 'Test-AgentCalibrationLedger.ps1') -LedgerPath $LedgerPath | Out-Null
    # Refresh the effective/corrected evidence under the writer lock.
    $evidencia = & $evidenciaScript -LedgerPath $LedgerPath -OutlierLedgerPath $outlierPath | ConvertFrom-Json
    $portaoAberto = [bool]$evidencia.calibration_planning_permitted
    if (-not $portaoAberto -and [string]::IsNullOrWhiteSpace($GateOverrideReason)) {
        throw 'Portao estrutural fechado na reverificacao sob lock.'
    }
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
        $eligibleTarget = @($evidencia.eligible_feedback | Where-Object event_id -eq $eventId)
        if ($eligibleTarget.Count -ne 1) {
            throw "Corroboracao inelegivel (proveniencia, handoff, sessao ou ciclo): '$eventId'."
        }
        $sessoesDeOrigem.Add([string]$eligibleTarget[0].session_id)
    }

    # INDEPENDENCIA E ORIGEM DISTINTA, nao contagem de registros. Duas notas da
    # mesma sessao sao a mesma observacao vista duas vezes.
    $origensDistintas = @($sessoesDeOrigem | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | Sort-Object -Unique)
    if ($origensDistintas.Count -lt 2) {
        throw ("As corroboracoes precisam vir de sessoes distintas; todas vieram de: {0}. Uma origem so nao e recorrencia." -f `
            (($origensDistintas | ForEach-Object { if ($_) { $_ } else { '(sem sessao)' } }) -join ', '))
    }

    $tail = $rows[-1]
    $recordType = if ($AutoMinima) { 'auto_calibration' } else { 'calibration' }
    $calibrationLevel = if ($AutoMinima) { 'auto_minima' } else { 'tier0_presencial' }
    $authorityGravada = if ($AutoMinima -and $Authority -eq 'Tier 0 - Raphael Vitoi') {
        'Auto-calibragem minima (sem presenca Tier 0)'
    } else {
        $Authority.Trim()
    }
    $campos = [ordered]@{
        calibration_id            = [guid]::NewGuid().ToString()
        calibration_level         = $calibrationLevel
        tier0_presencial          = [bool]$Tier0Present
        pattern                   = $Pattern.Trim()
        corroborating_event_ids   = $corroboracoes
        corroborating_sessions    = $origensDistintas
        observacao_recursiva      = $ObservacaoRecursiva.Trim()
        hipotese                  = $hipotese
        sessions_considered       = @($evidencia.sessoes_com_feedback)
        feedback_count_considered = [int]$evidencia.feedback_count_acumulado
        structural_gate_passed    = $portaoAberto
        authority                 = $authorityGravada
    }
    if (-not [string]::IsNullOrWhiteSpace($GateOverrideReason)) {
        $campos['gate_override_reason'] = $GateOverrideReason.Trim()
    }

    $record = New-HashChainedRecord -Sequence ([int]$tail.sequence + 1) -RecordType $recordType -RecordedAt ([DateTimeOffset]::Now.ToString('o')) -PreviousHash ([string]$tail.record_hash) -Fields $campos
    [System.IO.File]::AppendAllText($LedgerPath, (($record | ConvertTo-Json -Compress -Depth 8) + [Environment]::NewLine), $utf8NoBom)

    [pscustomobject]@{
        status                  = if ($AutoMinima) { 'auto_calibrated' } else { 'calibrated' }
        record_type             = $recordType
        calibration_level       = $calibrationLevel
        tier0_presencial        = [bool]$Tier0Present
        cycle_reset             = (-not $AutoMinima)
        calibration_id          = $record.calibration_id
        pattern                 = $record.pattern
        corroborating_sessions  = $origensDistintas
        structural_gate_passed  = $portaoAberto
        gate_override_reason    = $GateOverrideReason.Trim()
        sessions_reset          = if ($AutoMinima) { 0 } else { @($evidencia.sessoes_com_feedback).Count }
        sequence                = $record.sequence
        record_hash             = $record.record_hash
        ledger_path             = $LedgerPath
    } | ConvertTo-Json -Compress
}
finally {
    if ($null -ne $lockStream) { $lockStream.Dispose() }
}
