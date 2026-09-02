<#
.SYNOPSIS
    Registers (or reports) the daily 23:59 calibration evaluation as a Windows
    Scheduled Task.

.DESCRIPTION
    Decisao do Tier 0 em 2026-09-02: a metrica do portao de suficiencia passou a
    ser o numero de SESSOES DISTINTAS com feedback, minimo tres, acumulado e sem
    prazo. O gatilho primario e o aviso proativo no instante em que o limiar e
    atingido; esta corrida diaria das 23:59 e o LASTRO de auditoria, que
    registra a evidencia do dia inclusive quando ela e insuficiente.

    A tarefa executa New-AgentCalibrationDailyEvidence.ps1 para o dia corrente e
    grava o JSON determinista em reports/agent-calibration/daily/. Ela NAO
    interpreta, NAO planeja calibracao e NAO altera comportamento: quem decide
    continua sendo a revisao, e o portao so abre quando alguma sessao do dia
    alcanca o minimo.

    Registrar exige Windows. Fora dele, -WhatIf e o unico modo util: o script
    imprime exatamente o que registraria e sai com codigo 0, em vez de fingir
    que agendou. Isso e proposital -- verificacao nao executada nao e
    verificacao aprovada (CLAUDE.md SS5).

.PARAMETER Time
    Horario local da avaliacao. Padrao 23:59, que e o horario que o
    administrador definiu.

.PARAMETER WhatIf
    Nao registra nada; descreve a tarefa. Unico modo disponivel fora do Windows.

.EXAMPLE
    pwsh -File scripts/ops/Register-AgentCalibrationDailyTask.ps1 -WhatIf

.NOTES
    Este arquivo e uma TAREFA AGENDADA. Pelo CLAUDE.md SS1.1, ele precisa de
    revalidacao em host Windows com PowerShell 5.1 real antes de release: a
    bateria substituta cobre bytes, parse no 7 e construtos exclusivos do 7,
    mas nao alcanca cmdlet ou parametro inexistente na 5.1.
#>
[CmdletBinding(SupportsShouldProcess, ConfirmImpact = 'Medium')]
param(
    [ValidatePattern('^([01]\d|2[0-3]):[0-5]\d$')]
    [string]$Time = '23:59',

    [string]$TaskName = 'NexusSOTA-AgentCalibrationDailyEvaluation'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$evidenceScript = Join-Path $repositoryRoot 'scripts\ops\New-AgentCalibrationDailyEvidence.ps1'
$outputDirectory = Join-Path $repositoryRoot 'reports\agent-calibration\daily'

if (-not (Test-Path -LiteralPath $evidenceScript)) {
    throw "script de evidencia ausente: $evidenceScript"
}

# O comando roda em pwsh 7+, runtime operacional padrao (CLAUDE.md SS8.2).
$pwshPath = (Get-Command pwsh -ErrorAction SilentlyContinue)
$interpreter = if ($pwshPath) { $pwshPath.Source } else { 'pwsh.exe' }
$argumentList = @(
    '-NoProfile'
    '-ExecutionPolicy'
    'Bypass'
    '-Command'
    ('& "{0}" | Out-File -FilePath (Join-Path "{1}" ("{2}.json" -f (Get-Date -Format ''yyyy-MM-dd''))) -Encoding utf8' -f $evidenceScript, $outputDirectory, '{0}')
) -join ' '

$plano = [ordered]@{
    task_name        = $TaskName
    time             = $Time
    interpreter      = $interpreter
    evidence_script  = $evidenceScript
    output_directory = $outputDirectory
    gate_metric      = 'distinct_sessions_with_feedback'
    minimum_distinct_sessions = 3
    role             = 'LASTRO DE AUDITORIA, nao gatilho. O gatilho primario e o aviso proativo no instante em que o limiar e atingido; esta corrida existe para gravar a evidencia do dia inclusive quando ela e insuficiente.'
    note             = 'A tarefa apenas produz evidencia determinista. Nao planeja calibracao, nao altera comportamento e nao abre portao sozinha.'
}

$isWindows51Host = $PSVersionTable.PSObject.Properties.Name -contains 'Platform' -and $PSVersionTable.Platform -eq 'Win32NT'
$temScheduledTask = $null -ne (Get-Command Register-ScheduledTask -ErrorAction SilentlyContinue)

if (-not $temScheduledTask) {
    $plano['status'] = 'NAO REGISTRADO -- Register-ScheduledTask indisponivel neste host (requer Windows). Plano descrito, nada agendado.'
    $plano['host_windows'] = $isWindows51Host
    [pscustomobject]$plano | ConvertTo-Json -Depth 6
    return
}

if ($PSCmdlet.ShouldProcess($TaskName, "registrar tarefa diaria as $Time")) {
    $action = New-ScheduledTaskAction -Execute $interpreter -Argument $argumentList -WorkingDirectory $repositoryRoot
    $trigger = New-ScheduledTaskTrigger -Daily -At $Time
    $settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -DontStopOnIdleEnd -ExecutionTimeLimit (New-TimeSpan -Minutes 15)
    Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings -Description 'Avaliacao diaria de calibracao agentica do Nexus SOTA. Portao conta por sessao; avaliacao roda as 23:59.' -Force | Out-Null
    $plano['status'] = 'REGISTRADO'
}
else {
    $plano['status'] = 'WHATIF -- nada registrado'
}

[pscustomobject]$plano | ConvertTo-Json -Depth 6
