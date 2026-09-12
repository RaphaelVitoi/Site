<#
.SYNOPSIS
    Grava a evidencia diaria de calibracao num arquivo <data>.json. E o alvo da
    tarefa agendada das 23:59, e tambem o caminho para gerar dias retroativos.

.DESCRIPTION
    Existe para eliminar uma classe inteira de defeito, nao por elegancia.

    Ate 2026-09-05 a tarefa agendada era registrada com `-Command` carregando
    uma expressao inteira: chamada do script de evidencia, pipe para Out-File,
    `Join-Path` e um `-f` com aspas duplas e simples aninhadas. O Agendador do
    Windows entrega a linha de comando ao processo como UMA string, e o parser
    consome as aspas externas -- o nome do arquivo evaporava e sobrava o
    diretorio.

    Medido no dia, com a tarefa recem-registrada:

        LastTaskResult: 1
        Out-File: Could not find a part of the path
                  'C:\...\reports\agent-calibration\daily\'.

    Note o caminho terminando em '\': o diretorio existe, o nome do arquivo e
    que virou vazio. A falha era silenciosa do ponto de vista do operador --
    a tarefa constava "Ready", com proxima execucao agendada, e nao produzia
    nada. Foi o motivo pelo qual `daily/` nunca teve um unico .json.

    Consertar as aspas resolveria o sintoma e deixaria a armadilha montada
    para a proxima edicao. Com o wrapper, a tarefa passa a ser registrada com
    `-File`, que nao interpreta a linha: nao ha aspas aninhadas para perder.

.PARAMETER Date
    Dia a avaliar. Padrao: hoje. O nome do arquivo vem DAQUI, e nao de
    Get-Date, para que dias retroativos gravem no arquivo correto.

.PARAMETER BackfillMissing
    Antes de gravar -Date, gera todo dia FALTANTE entre o ultimo .json
    existente e -Date. Existe por defeito medido em 2026-09-12.

    A tarefa das 23:59 tem WakeToRun desligado e DisallowStartIfOnBatteries
    ligado; com a maquina indisponivel o gatilho nao dispara. StartWhenAvailable
    entao faz o catch-up -- e o catch-up lia o RELOGIO DA RECUPERACAO. Medido:
    o gatilho de 2026-09-11 as 23:59 nao disparou, a recuperacao rodou em
    2026-09-12 as 05:32 e gravou `2026-09-12.json`. O dia perdido nao foi
    recuperado: foi substituido pelo seguinte.

    A falha e silenciosa nas tres metricas que um operador olharia --
    `LastTaskResult: 0`, `NumberOfMissedRuns: 0`, tarefa `Ready` -- porque a
    recuperacao de fato teve exito. So no dia errado.

.PARAMETER MaxBackfillDays
    Teto da janela de recuperacao. Padrao 31. Impede que um diretorio vazio ou
    uma data absurda dispare centenas de gravacoes.
#>
[CmdletBinding()]
param(
    [datetime]$Date = (Get-Date),

    [switch]$BackfillMissing,

    [ValidateRange(1, 365)]
    [int]$MaxBackfillDays = 31,

    [string]$OutputDirectory = '',

    [string]$LedgerPath = '',

    [string]$OutlierLedgerPath = ''
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
if ([string]::IsNullOrWhiteSpace($OutputDirectory)) {
    $OutputDirectory = Join-Path $repositoryRoot 'reports\agent-calibration\daily'
}
New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null

$evidenceScript = Join-Path $PSScriptRoot 'New-AgentCalibrationDailyEvidence.ps1'
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$hoje = (Get-Date).Date

function Write-EvidenciaDoDia {
    param(
        [Parameter(Mandatory)][datetime]$Dia,
        [Parameter(Mandatory)][bool]$Reconstruido
    )

    $argumentos = @{ Date = $Dia }
    if (-not [string]::IsNullOrWhiteSpace($LedgerPath)) { $argumentos['LedgerPath'] = $LedgerPath }
    if (-not [string]::IsNullOrWhiteSpace($OutlierLedgerPath)) { $argumentos['OutlierLedgerPath'] = $OutlierLedgerPath }

    $json = & $evidenceScript @argumentos
    $texto = ($json -join [Environment]::NewLine)

    # Um dia reconstruido NAO pode ser indistinguivel de uma captura feita no
    # proprio dia. Lastro de auditoria que mente sobre quando foi medido e pior
    # que lastro ausente: o ausente se ve, o reconstruido silencioso nao.
    if ($Reconstruido) {
        $objeto = $texto | ConvertFrom-Json
        Add-Member -InputObject $objeto -NotePropertyName 'reconstruido' -NotePropertyValue $true -Force
        Add-Member -InputObject $objeto -NotePropertyName 'reconstruido_em' -NotePropertyValue ([DateTimeOffset]::Now.ToString('o')) -Force
        Add-Member -InputObject $objeto -NotePropertyName 'reconstruido_motivo' -NotePropertyValue 'Dia sem captura contemporanea; gerado por -BackfillMissing a partir do ledger append-only. Os numeros valem para o dia; o instante de medicao nao.' -Force
        $texto = $objeto | ConvertTo-Json -Depth 12
    }

    # O NOME DO ARQUIVO VEM DE -Date, nao do relogio. Um dia retroativo gerado
    # com Get-Date sobrescreveria a evidencia de hoje com os numeros de outro
    # dia -- que e a forma mais direta de corromper um lastro de auditoria.
    $nome = $Dia.ToString('yyyy-MM-dd')
    $destino = Join-Path $OutputDirectory ("{0}.json" -f $nome)
    [System.IO.File]::WriteAllText($destino, ($texto + [Environment]::NewLine), $utf8NoBom)

    [pscustomobject]@{
        status       = 'written'
        date         = $nome
        reconstruido = $Reconstruido
        path         = $destino
        bytes        = (Get-Item -LiteralPath $destino).Length
    }
}

$gravados = New-Object System.Collections.Generic.List[object]

if ($BackfillMissing) {
    # Sem nenhum .json datado nao ha buraco a preencher: diretorio vazio nao e
    # serie interrompida, e trata-lo como tal dispararia MaxBackfillDays
    # gravacoes sem lastro nenhum a que se ancorar.
    $existentes = @(Get-ChildItem -LiteralPath $OutputDirectory -Filter '*.json' -File -ErrorAction SilentlyContinue |
        ForEach-Object {
            $d = [datetime]::MinValue
            if ([datetime]::TryParseExact($_.BaseName, 'yyyy-MM-dd', [Globalization.CultureInfo]::InvariantCulture, [Globalization.DateTimeStyles]::None, [ref]$d)) { $d }
        } | Sort-Object)

    if ($existentes.Count -gt 0) {
        # A ancora e o INICIO DA SERIE, nao o arquivo mais recente.
        #
        # Medido em 2026-09-12, corrigindo a primeira versao desta funcao: usar
        # o mais recente como ancora torna o defeito invisivel exatamente no
        # caso que ele produz. O catch-up ja gravou `2026-09-12.json`; esse
        # arquivo vira a ancora, a varredura comeca em 09-13, e o buraco de
        # 09-11 -- que e a razao de existir deste bloco -- nunca e alcancado.
        #
        # Varrer a janela inteira acha buraco em qualquer posicao. O inicio da
        # serie e o piso que impede fabricar dia anterior ao primeiro registro.
        $inicioSerie = $existentes[0]
        $piso = $Date.Date.AddDays(-$MaxBackfillDays)
        if ($inicioSerie -gt $piso) { $piso = $inicioSerie }

        $faltantes = @()
        for ($d = $piso.AddDays(1); $d -lt $Date.Date; $d = $d.AddDays(1)) {
            $alvo = Join-Path $OutputDirectory ("{0}.json" -f $d.ToString('yyyy-MM-dd'))
            if (-not (Test-Path -LiteralPath $alvo)) { $faltantes += $d }
        }
        foreach ($f in $faltantes) { $gravados.Add((Write-EvidenciaDoDia -Dia $f -Reconstruido $true)) }
    }
}

$gravados.Add((Write-EvidenciaDoDia -Dia $Date -Reconstruido ($Date.Date -ne $hoje)))

# O PORTAO SABIA ABRIR E NAO SABIA AVISAR.
#
# `Record-AgentCalibration.ps1` existe desde 2026-09-05 para fechar o ciclo, e
# ate 2026-09-12 nao tinha UM invocador no repositorio -- busca com
# --no-ignore --hidden em .ps1, .py, .md e .json: zero. Escritor sem chamador e
# a mesma fachada que a SS6.5 do CLAUDE.md recusa, e o resultado medido foi
# `calibration_planning_permitted: true` constante desde a terceira sessao,
# com `ultima_calibracao: null` em 19 sessoes acumuladas.
#
# Este bloco NAO calibra: calibrar exige duas corroboracoes independentes e
# hipotese completa, que sao obrigacao do auditor e nao medicao de script. Ele
# apenas torna a pendencia VISIVEL -- que era a peca que faltava entre medir e
# agir.
$ultimo = $gravados[$gravados.Count - 1]
$evidenciaFinal = (Get-Content -LiteralPath $ultimo.path -Raw -Encoding UTF8) | ConvertFrom-Json
$pendente = ($evidenciaFinal.calibration_planning_permitted -eq $true) -and ($null -eq $evidenciaFinal.ultima_calibracao)

$marcador = Join-Path (Split-Path -Parent $OutputDirectory) 'PENDING-CALIBRATION.md'
if ($pendente) {
    $linhas = @(
        '# Calibracao pendente',
        '',
        ('Gerado por `Write-AgentCalibrationDailyEvidence.ps1` em {0}.' -f [DateTimeOffset]::Now.ToString('o')),
        '',
        ('- Evidencia: `{0}`' -f (Split-Path -Leaf $ultimo.path)),
        ('- Sessoes distintas com feedback: **{0}** (minimo {1})' -f $evidenciaFinal.sessoes_com_feedback_count, $evidenciaFinal.evidence_gate.minimum_distinct_sessions),
        ('- `calibration_planning_permitted`: **{0}**' -f $evidenciaFinal.calibration_planning_permitted),
        '- `ultima_calibracao`: **null** -- nenhum ciclo foi fechado ate agora',
        '',
        'A contagem do portao so reinicia apos um registro `record_type: calibration`.',
        'Enquanto nao houver um, o portao permanece aberto e deixa de discriminar.',
        '',
        'Fechar exige, alem do portao: duas corroboracoes INDEPENDENTES do mesmo',
        'padrao operacional (sessoes de origem distinta) e hipotese com os oito',
        'componentes da SS8.3. Nao e medicao de script -- e obrigacao do auditor.',
        '',
        'Fechamento: `pwsh -File scripts/ops/Record-AgentCalibration.ps1`.',
        '',
        'Este arquivo e removido automaticamente no primeiro ciclo diario apos o',
        'fechamento.'
    )
    [System.IO.File]::WriteAllText($marcador, (($linhas -join [Environment]::NewLine) + [Environment]::NewLine), $utf8NoBom)
    Write-Warning ('Calibracao PENDENTE: {0} sessoes acumuladas, portao aberto, nenhum ciclo fechado. Ver {1}' -f $evidenciaFinal.sessoes_com_feedback_count, $marcador)
}
elseif (Test-Path -LiteralPath $marcador) {
    Remove-Item -LiteralPath $marcador -Force
}

[pscustomobject]@{
    status               = 'written'
    date                 = $ultimo.date
    path                 = $ultimo.path
    bytes                = $ultimo.bytes
    reconstruidos        = @($gravados | Where-Object { $_.reconstruido } | ForEach-Object { $_.date })
    calibration_pending  = $pendente
} | ConvertTo-Json -Compress
