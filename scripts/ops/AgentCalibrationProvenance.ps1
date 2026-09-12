# Shared eligibility policy; validation never fills or derives provenance fields.

# Conjunto canonico de modelos, LIDO de llm/model_registry.py -- nunca copiado.
# A SS3 do CLAUDE.md do projeto define aquele modulo como fonte unica de "qual
# modelo esta autorizado a rodar aqui", e MODELOS_RETIRADOS preserva os recusados
# COM o motivo, justamente para que registro historico nao precise de heuristica.
# Ate 2026-09-12 este arquivo decidia por expressao regular apenas: um nome com
# sintaxe valida e existencia nenhuma -- 'gpt-9.9-inexistente' -- passava e ainda
# mapeava para codex. Medido no mesmo dia: registry + retirados = 16 entradas, e
# cobrem 100% dos modelos reais do ledger; o unico fora e 'Codex GPT-6', que e o
# registro defeituoso ja corrigido por append. Custo zero em falso negativo.
$script:AgentCalibrationModelosCanonicos = $null
$script:AgentCalibrationModelosLidos = $false
function Get-AgentCalibrationModelosCanonicos {
    if ($script:AgentCalibrationModelosLidos) { return $script:AgentCalibrationModelosCanonicos }
    $script:AgentCalibrationModelosLidos = $true
    $raiz = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
    # Mesma resolucao de Python que New-AgentCalibrationDailyEvidence.ps1 ja faz.
    $venvWin = Join-Path $raiz '.venv\Scripts\python.exe'
    $venvPosix = Join-Path $raiz '.venv/bin/python'
    $py = if (Test-Path -LiteralPath $venvWin) { $venvWin }
    elseif (Test-Path -LiteralPath $venvPosix) { $venvPosix }
    else {
        $cmd = Get-Command python.exe, python3, python -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($cmd) { $cmd.Source } else { $null }
    }
    if (-not $py) { return $null }
    $code = 'import json,sys; sys.path.insert(0, sys.argv[1]); from llm.model_registry import MODEL_REGISTRY as R; ' +
    'from llm.model_registry import MODELOS_RETIRADOS as T; print(json.dumps(sorted(set(R) | set(T))))'
    try {
        $saida = & $py -c $code $raiz 2>$null
        if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($saida)) { return $null }
        $lista = $saida | ConvertFrom-Json
        if (-not $lista) { return $null }
        $script:AgentCalibrationModelosCanonicos = [System.Collections.Generic.HashSet[string]]::new(
            [string[]]$lista, [System.StringComparer]::Ordinal)
    }
    catch { return $null }
    return $script:AgentCalibrationModelosCanonicos
}

function Get-AgentCalibrationProvenance {
    param([Parameter(Mandatory)]$Record)
    $reasons = [System.Collections.Generic.List[string]]::new()
    $values = @{}
    foreach ($field in @('session_id', 'scope', 'conductor_model', 'conductor_vehicle', 'supervision_mode')) {
        $value = if ($Record.PSObject.Properties.Name -contains $field) { [string]$Record.$field } else { '' }
        $values[$field] = $value.Trim()
        if ([string]::IsNullOrWhiteSpace($value)) { $reasons.Add("missing:$field") }
    }
    # Legacy dated handoff scopes are explicit handoff declarations, not new phases.
    if ($values.scope -cnotmatch '^handoff(?:-session-\d{4}-\d{2}-\d{2})?$') {
        $reasons.Add('completed_handoff_not_declared')
    }
    # Campo em branco ja foi reportado como missing acima. Ate 2026-09-12 as
    # checagens abaixo rodavam mesmo assim, e um campo vazio saia com DOIS motivos
    # -- 'missing:supervision_mode' e 'invalid:supervision_mode' -- inflando
    # qualquer contagem agregada de motivos. Ausente e ausente; invalido e outra
    # coisa, e agora so o que existe pode ser julgado invalido.
    if ($values.session_id -and $values.session_id -match '\s') { $reasons.Add('invalid:session_id') }
    if ($values.supervision_mode -and $values.supervision_mode -cnotin @('assistida', 'automatizada')) {
        $reasons.Add('invalid:supervision_mode')
    }
    if ($values.conductor_vehicle -and $values.conductor_vehicle -cnotin @('codex', 'claude-code', 'antigravity')) {
        $reasons.Add('unknown:conductor_vehicle')
    }
    if ($values.conductor_model) {
        # Duas camadas, e elas respondem perguntas diferentes. A sintaxe diz a
        # QUAL FAMILIA o nome pertence, e dai sai o conector esperado. O conjunto
        # canonico diz se o modelo EXISTE. Sintaxe sozinha nunca provou existencia.
        $expected = switch -Regex -CaseSensitive ($values.conductor_model) {
            '^(?:gpt|chatgpt)-\d+(?:\.\d+)*(?:-[a-z0-9]+)*$' { 'codex'; break }
            # `fable` entrou em 2026-09-12: os dois retirados sao claude-fable-5 e
            # claude-fable-5-1, e sem a alternativa a camada de sintaxe recusava
            # como inexistente um modelo que o conjunto canonico reconhece. As
            # duas camadas tem de concordar sobre o que EXISTE e divergir apenas
            # sobre o que esta autorizado -- guard em tests/test_agent_calibration_provenance.py.
            '^claude-(?:opus|sonnet|haiku|fable)-\d+(?:[.-]\d+)*(?:-[a-z0-9]+)*$' { 'claude-code'; break }
            '^gemini-\d+(?:\.\d+)*-(?:flash|pro)(?:-[a-z0-9]+)*$' { 'antigravity'; break }
            default { '' }
        }
        if (-not $expected) { $reasons.Add('unknown_or_nonexact:conductor_model') }
        elseif ($values.conductor_vehicle -and $values.conductor_vehicle -cne $expected) {
            $reasons.Add('model_connector_mismatch')
        }
        # Falha FECHADA quando a fonte canonica nao pode ser lida. Aprovar por
        # indisponibilidade seria degradacao silenciosa -- o motivo abaixo torna a
        # lacuna visivel em vez de deixar o registro passar como se verificado.
        $canonicos = Get-AgentCalibrationModelosCanonicos
        if ($null -eq $canonicos) { $reasons.Add('canonical_model_source_unreachable') }
        elseif (-not $canonicos.Contains($values.conductor_model)) {
            $reasons.Add('not_in_canonical_registry:conductor_model')
        }
    }
    [pscustomobject]@{ eligible = ($reasons.Count -eq 0); reasons = @($reasons.ToArray()) }
}
