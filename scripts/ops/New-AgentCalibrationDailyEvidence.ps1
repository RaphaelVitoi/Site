<#
.SYNOPSIS
    Produces deterministic daily evidence for the scheduled calibration analysis.
    Interpretation and behavioural changes remain the responsibility of the
    scheduled review; this script does not fabricate recommendations. PowerShell
    7+ is the default runtime; 5.1 remains compatible.
#>
[CmdletBinding()]
param(
    [datetime]$Date = (Get-Date),

    # JANELA DE CONTAGEM E MOMENTO DE AVALIACAO SAO COISAS DIFERENTES.
    #
    # Ate 2026-09-02 os dois eram o dia: o limiar exigia tres feedbacks no
    # mesmo dia, em duas ou mais sessoes distintas. Por decisao do Tier 0 nesta
    # data:
    #   - a janela de CONTAGEM passou a ser a SESSAO -- tres feedbacks na mesma
    #     sessao;
    #   - o momento da AVALIACAO continua diario, as 23:59, agendado por
    #     Register-AgentCalibrationDailyTask.ps1.
    #
    # A exigencia de duas sessoes distintas caiu porque e insatisfazivel sob
    # contagem por sessao. Nao foi afrouxamento: foi consequencia aritmetica de
    # trocar a janela, e esta declarada em vez de silenciada.
    #
    # A corrida das 23:59 avalia o dia inteiro agrupando por sessao, e o portao
    # abre quando QUALQUER sessao daquele dia alcanca o minimo. -SessionId
    # restringe a analise a uma sessao especifica.
    [string]$SessionId = '',

    # Metrica do portao: sessoes DISTINTAS com feedback, acumuladas.
    [ValidateRange(1, 100)]
    [int]$MinimumDistinctSessions = 3,

    # Densidade intra-sessao: quantos feedbacks numa mesma sessao tornam aquela
    # sessao notavel. NAO abre o portao; e dado retido para a analise.
    [ValidateRange(1, 100)]
    [int]$MinimumFeedbackRecords = 3,

    # Caminhos injetaveis para permitir guard hermetico em tmp_path. Vazio usa
    # os canonicos do repositorio.
    [string]$LedgerPath = '',

    [string]$OutlierLedgerPath = ''
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# ARMADILHA DE CULTURA -- nao remover esta indirecao.
#
# ConvertFrom-Json converte a string ISO-8601 de `recorded_at` num [DateTime].
# Ao voltar para texto, `[string]` usa a InvariantCulture e escreve MM/dd/yyyy.
# `[DateTimeOffset]::Parse` sem cultura explicita le com a CurrentCulture. Numa
# maquina pt-BR (dd/MM/yyyy) os dois discordam, e o resultado depende do dia:
#
#   dia <= 12 -> troca silenciosa. 2026-09-02 vira 2026-02-09, e o recorte
#                diario passa a contar o dia errado sem emitir erro.
#   dia >  12 -> excecao. '09/18/2026' nao e data valida em pt-BR e o script
#                inteiro morre.
#
# Em en-US os dois formatos coincidem e o defeito fica invisivel, e foi assim
# que ele sobreviveu ate 2026-09-02. Medido nesta data: 4 dos 7 guards de
# tests/test_calibracao_portao_por_sessao.py reprovavam sob pt-BR.
#
# A cultura de leitura passa a ser sempre a Invariante, que e a mesma que
# escreveu o texto. O portao nao muda; muda so a leitura da data.
function Get-InstanteDoRegistro {
    param([Parameter(Mandatory)]$Registro)
    return [DateTimeOffset]::Parse([string]$Registro.recorded_at, [cultureinfo]::InvariantCulture)
}

$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$ledgerPath = if ($LedgerPath) { $LedgerPath } else { Join-Path $repositoryRoot 'reports\agent-calibration\feedback-ledger.jsonl' }
$outlierLedgerPath = if ($OutlierLedgerPath) { $OutlierLedgerPath } else { Join-Path $repositoryRoot 'reports\agent-calibration\outlier-evidence-ledger.jsonl' }
& (Join-Path $PSScriptRoot 'Test-AgentCalibrationLedger.ps1') -LedgerPath $ledgerPath | Out-Null
& (Join-Path $PSScriptRoot 'Test-AgentCalibrationLedger.ps1') -LedgerPath $outlierLedgerPath | Out-Null

$day = $Date.ToString('yyyy-MM-dd')
$scoped = -not [string]::IsNullOrWhiteSpace($SessionId)

# O LEDGER E LIDO UMA VEZ SO, E OS RECORTES SAEM DAQUI.
#
# Ate 2026-09-05 cada tipo de registro era relido do disco com seu proprio
# filtro, e o marco da ultima calibracao (linha ~150) filtrava 'calibration'
# sobre $allFeedback -- que ja vinha filtrado por 'feedback'. Conjunto vazio
# por construcao: o marco nunca seria encontrado, nem depois de existir um
# escritor. O portao sabia abrir e nao sabia fechar, e o universo crescia para
# sempre.
$allRecords = @()
if (Test-Path -LiteralPath $ledgerPath) {
    $allRecords = @(Get-Content -LiteralPath $ledgerPath -Encoding UTF8 | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | ForEach-Object { $_ | ConvertFrom-Json })
}
$allFeedback = @($allRecords | Where-Object { $_.record_type -eq 'feedback' })

# CORRECOES SAO APLICADAS AQUI, antes de qualquer contagem.
#
# O ledger e append-only: nota gravada errada nao se reescreve, se corrige por
# registro `correction` anexado apontando o `event_id` do alvo. Se a automacao
# nao APLICASSE a correcao, ela viraria decoracao -- o valor errado seguiria
# alimentando media, densidade, outlier e hipotese, e o ledger diria uma coisa
# enquanto a evidencia dizia outra.
#
# Motivo medido, 2026-09-02: a nota da sessao
# `claude-opus5-site-2026-09-02-integridade` foi dada como 8 e gravada como 0.8.
$correcoes = @($allRecords | Where-Object { $_.record_type -eq 'correction' })
$correcoesAplicadas = 0
foreach ($correcao in $correcoes) {
    $campo = [string]$correcao.field
    $alvos = @($allFeedback | Where-Object { [string]$_.event_id -eq [string]$correcao.target_event_id })
    foreach ($alvo in $alvos) {
        $alvo | Add-Member -NotePropertyName $campo -NotePropertyValue $correcao.corrected_value -Force
        $correcoesAplicadas++
    }
}

# O dia SELECIONA quais sessoes entram na avaliacao desta noite; ele NAO e a
# janela de contagem.
#
# Sessao = do inicio ao fim de um trabalho (definicao do Tier 0, 2026-09-02).
# Compactacao de contexto NAO encerra sessao, e uma sessao pode atravessar a
# meia-noite. Contar so o recorte do dia partiria uma sessao ao meio e mediria
# errado -- entao a contagem varre o ledger INTEIRO por session_id, e o dia
# apenas decide quais sessoes tiveram atividade para serem avaliadas agora.
$recordsDoDia = @($allFeedback | Where-Object {
    (Get-InstanteDoRegistro $_).LocalDateTime.ToString('yyyy-MM-dd') -eq $day
})
# O @() externo NAO e decorativo: atribuir o resultado de um `if` desembrulha
# array vazio para $null, e sob StrictMode `.Count` em $null estoura. Foi
# exatamente assim que o caso "dia sem feedback" quebrou no guard.
$records = @(if ($scoped) {
    $recordsDoDia | Where-Object { [string]$_.session_id -eq $SessionId }
} else {
    $recordsDoDia
})

$sessoesAtivasNoDia = @($records |
    Where-Object { -not [string]::IsNullOrWhiteSpace([string]$_.session_id) } |
    ForEach-Object { [string]$_.session_id } |
    Sort-Object -Unique)

# A CONTAGEM E ACUMULATIVA E NAO EXPIRA. Dado nao morre por ausencia de sessao
# num dia: um dia sem sessao e um dia sem avaliacao, nao um dia que apaga
# evidencia. Por isso o universo abaixo e o ledger inteiro desde a ultima
# calibracao, e nao o recorte do dia.
#
# INFERENCIA MINHA, DECLARADA PARA PODER SER VETADA: contar "desde a ultima
# calibracao" nao foi pedido explicitamente. Sem isso, porem, o portao ficaria
# permanentemente aberto a partir da terceira sessao, o que contradiz a
# intencao de calibrar a cada tres. Se o vertice preferir contagem absoluta,
# basta remover o filtro por $marcoUltimaCalibracao.
#
# O CORTE E POR SEQUENCIA, NAO POR RELOGIO.
#
# "Desde a ultima calibracao" e uma pergunta sobre POSICAO NA CADEIA, e a
# cadeia ja responde: o ledger e append-only e encadeado por SHA-256, entao
# `sequence` e monotonica por construcao e nao ha como um registro anterior
# ter sequencia maior. `recorded_at` nao tem essa garantia -- depende do
# relogio da maquina que gravou, e um relogio adiantado, um fuso trocado ou um
# registro de teste com data futura fazem o feedback parecer posterior a uma
# calibracao que na verdade veio depois dele. O efeito seria silencioso e
# exatamente o pior possivel: a contagem nao zeraria, e o portao ficaria
# permanentemente aberto -- o mesmo sintoma do filtro morto que existia acima.
#
# `ultima_calibracao` continua reportando o INSTANTE, que e o que um humano le.
# Medir por sequencia e reportar em tempo nao e inconsistencia: e usar, para
# cada coisa, a fonte que a garante.
$calibracoes = @($allRecords | Where-Object { $_.record_type -eq 'calibration' })
$marcoSequencia = if ($calibracoes.Count -gt 0) {
    (@($calibracoes | ForEach-Object { [int]$_.sequence }) | Sort-Object)[-1]
} else {
    -1
}
$marcoUltimaCalibracao = if ($calibracoes.Count -gt 0) {
    Get-InstanteDoRegistro (@($calibracoes | Sort-Object { [int]$_.sequence })[-1])
} else {
    [DateTimeOffset]::MinValue
}
$universo = @($allFeedback | Where-Object { [int]$_.sequence -gt $marcoSequencia })

$todasAsSessoes = @($universo |
    Where-Object { -not [string]::IsNullOrWhiteSpace([string]$_.session_id) } |
    ForEach-Object { [string]$_.session_id } |
    Sort-Object -Unique)

# Perfil por sessao sobre o universo acumulado. Feedback sem session_id nao
# entra em nenhuma sessao: amostra sem origem identificada nao abre portao.
$porSessao = @($todasAsSessoes | ForEach-Object {
    $sid = $_
    $daSessao = @($universo | Where-Object { [string]$_.session_id -eq $sid })
    $instantes = @($daSessao | ForEach-Object { Get-InstanteDoRegistro $_ } | Sort-Object)
    $declarados = @($daSessao |
        Where-Object { $_.PSObject.Properties.Name -contains 'session_started_at' -and -not [string]::IsNullOrWhiteSpace([string]$_.session_started_at) } |
        ForEach-Object { [string]$_.session_started_at } |
        Sort-Object -Unique)
    $modelos = @($daSessao |
        Where-Object { $_.PSObject.Properties.Name -contains 'conductor_model' -and -not [string]::IsNullOrWhiteSpace([string]$_.conductor_model) } |
        ForEach-Object { [string]$_.conductor_model } |
        Sort-Object -Unique)
    $regimes = @($daSessao |
        Where-Object { $_.PSObject.Properties.Name -contains 'supervision_mode' -and -not [string]::IsNullOrWhiteSpace([string]$_.supervision_mode) } |
        ForEach-Object { [string]$_.supervision_mode } |
        Sort-Object -Unique)
    [pscustomobject]@{
        session_id            = $sid
        feedback_count        = $daSessao.Count
        # Densidade intra-sessao e DADO RETIDO, nao gatilho. Tres feedbacks na
        # mesma sessao e evidencia forte e fica registrada, mas quem autoriza a
        # avaliacao e a contagem de sessoes distintas.
        densidade_relevante   = ($daSessao.Count -ge $MinimumFeedbackRecords)
        primeiro_feedback     = if ($instantes.Count -gt 0) { $instantes[0].ToString('o') } else { $null }
        ultimo_feedback       = if ($instantes.Count -gt 0) { $instantes[-1].ToString('o') } else { $null }
        atravessa_meia_noite  = ($instantes.Count -gt 1 -and $instantes[0].LocalDateTime.ToString('yyyy-MM-dd') -ne $instantes[-1].LocalDateTime.ToString('yyyy-MM-dd'))
        session_started_at    = $declarados
        inicio_inconsistente  = ($declarados.Count -gt 1)
        conductor_models      = $modelos
        supervision_modes     = $regimes
    }
} | Sort-Object -Property feedback_count -Descending)

# Um session_id com mais de um session_started_at declarado indica sessao
# partida -- tipicamente compactacao tratada, erradamente, como reinicio.
#
# Sob contagem POR SESSAO isto deixa de ser detalhe e vira risco direto ao
# portao: uma sessao partida ao meio vira duas na contagem e pode abrir a
# calibracao com evidencia de uma so origem. Sessao inconsistente nao conta.
$sessoesInconsistentes = @($porSessao | Where-Object { $_.inicio_inconsistente } | ForEach-Object { $_.session_id })
$sessoesValidas = @($porSessao | Where-Object { -not $_.inicio_inconsistente } | ForEach-Object { $_.session_id })
$sessoesComDensidade = @($porSessao | Where-Object { $_.densidade_relevante } | ForEach-Object { $_.session_id })
$feedbackSemSessao = @($universo | Where-Object { [string]::IsNullOrWhiteSpace([string]$_.session_id) }).Count

$scores = @($universo | ForEach-Object { [double]$_.score })
$scoresDoDia = @($records | ForEach-Object { [double]$_.score })
$outliers = @()
if (Test-Path -LiteralPath $outlierLedgerPath) {
    $outliers = @(Get-Content -LiteralPath $outlierLedgerPath -Encoding UTF8 | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | ForEach-Object { $_ | ConvertFrom-Json } | Where-Object {
        $_.record_type -eq 'outlier' -and ((Get-InstanteDoRegistro $_).LocalDateTime.ToString('yyyy-MM-dd') -eq $day)
    })
}
$distinctSessionIds = @($records |
    Where-Object { -not [string]::IsNullOrWhiteSpace([string]$_.session_id) } |
    ForEach-Object { [string]$_.session_id } |
    Sort-Object -Unique)

# METRICA DO PORTAO: numero de SESSOES DISTINTAS com feedback, acumulado e sem
# prazo. Densidade intra-sessao e dado retido, nao gatilho. Falha fechado.
$structuralEvidenceSufficient = ($sessoesValidas.Count -ge $MinimumDistinctSessions)
$faltam = [Math]::Max(0, $MinimumDistinctSessions - $sessoesValidas.Count)
$gateWindowReason = if ($sessoesInconsistentes.Count -gt 0 -and -not $structuralEvidenceSufficient) {
    "Sessao(oes) com mais de um session_started_at declarado: $($sessoesInconsistentes -join ', '). Sessao partida vira duas na contagem e falsearia o portao, entao nao conta ate a origem ser reconciliada."
} elseif (-not $structuralEvidenceSufficient) {
    "$($sessoesValidas.Count) de $MinimumDistinctSessions sessoes com feedback; faltam $faltam. A contagem e acumulativa e NAO expira -- dia sem sessao e dia sem avaliacao, nao dia que apaga evidencia. Registro literal exigido enquanto isso: dados insuficientes -- nenhuma calibracao planejada."
} else {
    "$($sessoesValidas.Count) sessoes com feedback ($($sessoesValidas -join ', ')) alcancam o minimo de $MinimumDistinctSessions. A recorrencia de padrao continua sendo obrigacao do auditor, e nao e medida aqui."
}

[pscustomobject]@{
    schema_version                 = 'agent-calibration-evidence/v4'
    date                           = $day
    gate_metric                    = 'distinct_sessions_with_feedback'
    gate_definition                = 'Sessao = do inicio ao fim de um trabalho; compactacao de contexto NAO encerra sessao. A metrica que autoriza avaliacao e o numero de SESSOES DISTINTAS com feedback, acumulado desde a ultima calibracao e sem prazo de validade. Densidade intra-sessao (varios feedbacks numa mesma sessao) e dado retido, nao gatilho.'
    evaluated_at_policy            = 'Gatilho primario: aviso proativo no instante em que o limiar e atingido, se nao houver tarefa em andamento. Lastro: corrida diaria as 23:59 (Register-AgentCalibrationDailyTask.ps1), que registra a evidencia do dia inclusive quando ela e insuficiente.'
    session_filter                 = $SessionId
    ultima_calibracao              = if ($marcoUltimaCalibracao -eq [DateTimeOffset]::MinValue) { $null } else { $marcoUltimaCalibracao.ToString('o') }
    sessoes_com_feedback           = $sessoesValidas
    sessoes_com_feedback_count     = $sessoesValidas.Count
    sessoes_faltantes              = $faltam
    sessoes_com_inicio_inconsistente = $sessoesInconsistentes
    sessoes_com_densidade_relevante = $sessoesComDensidade
    sessoes_ativas_no_dia          = $sessoesAtivasNoDia
    feedback_count_acumulado       = $universo.Count
    correcoes_no_ledger            = $correcoes.Count
    correcoes_aplicadas            = $correcoesAplicadas
    feedback_count_no_dia          = $recordsDoDia.Count
    feedback_sem_sessao            = $feedbackSemSessao
    por_sessao                     = $porSessao
    score_mean                     = if ($scores.Count -gt 0) { [Math]::Round((($scores | Measure-Object -Average).Average), 2) } else { $null }
    score_min                      = if ($scores.Count -gt 0) { ($scores | Measure-Object -Minimum).Minimum } else { $null }
    score_max                      = if ($scores.Count -gt 0) { ($scores | Measure-Object -Maximum).Maximum } else { $null }
    score_mean_no_dia              = if ($scoresDoDia.Count -gt 0) { [Math]::Round((($scoresDoDia | Measure-Object -Average).Average), 2) } else { $null }
    evidence_gate                  = [ordered]@{
        metric                       = 'distinct_sessions_with_feedback'
        minimum_distinct_sessions    = $MinimumDistinctSessions
        minimum_feedback_records     = $MinimumFeedbackRecords
        structural_gate_passed       = $structuralEvidenceSufficient
        reason                       = $gateWindowReason
        intra_session_density_is_data_not_trigger = 'Tres feedbacks numa mesma sessao e evidencia forte e fica registrada, mas nao autoriza calibracao por si: a metrica e a contagem de sessoes distintas.'
        accumulation_never_expires   = 'Dia sem sessao e dia sem avaliacao, nao dia que apaga evidencia. O ledger e append-only e a contagem so reinicia apos uma calibracao registrada.'
        unsessioned_feedback_ignored = 'Feedback sem session_id nao conta para nenhuma sessao: amostra sem origem identificada nao abre portao.'
        split_session_not_counted    = 'session_id com mais de um session_started_at indica sessao partida. Sob contagem por sessao isso inflaria o portao, entao a sessao nao conta ate a origem ser reconciliada.'
        pattern_confirmation_required = 'At least two independently corroborating feedback records must identify the same operational pattern. The reviewer must cite both records or report insufficiency.'
    }
    calibration_planning_permitted = $structuralEvidenceSufficient
    records                        = $universo
    outlier_evidence               = [ordered]@{
        ledger_path                = $outlierLedgerPath
        count                      = $outliers.Count
        records                    = $outliers
        disposition                = 'retained separately; excluded from pattern indexing and calibration sample until deterministic posterior review'
        automatic_pattern_indexing = $false
        low_sample_origin_rule     = 'A low-sample outlier may indicate an origin-specific pattern. Retain it and require deterministic posterior analysis; do not promote it from frequency alone.'
    }
} | ConvertTo-Json -Depth 8
