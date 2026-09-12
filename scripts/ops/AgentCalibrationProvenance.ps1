# Shared eligibility policy; validation never fills or derives provenance fields.
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
    if ($values.session_id -match '\s') { $reasons.Add('invalid:session_id') }
    if ($values.supervision_mode -cnotin @('assistida', 'automatizada')) { $reasons.Add('invalid:supervision_mode') }
    if ($values.conductor_vehicle -cnotin @('codex', 'claude-code', 'antigravity')) { $reasons.Add('unknown:conductor_vehicle') }
    # Family/version syntax is checked, not guessed. Unknown families need explicit arbitration.
    $expected = switch -Regex -CaseSensitive ($values.conductor_model) {
        '^(?:gpt|chatgpt)-\d+(?:\.\d+)*(?:-[a-z0-9]+)*$' { 'codex'; break }
        '^claude-(?:opus|sonnet|haiku)-\d+(?:[.-]\d+)*(?:-[a-z0-9]+)*$' { 'claude-code'; break }
        '^gemini-\d+(?:\.\d+)*-(?:flash|pro)(?:-[a-z0-9]+)*$' { 'antigravity'; break }
        default { '' }
    }
    if (-not $expected) { $reasons.Add('unknown_or_nonexact:conductor_model') }
    elseif ($values.conductor_vehicle -cne $expected) { $reasons.Add('model_connector_mismatch') }
    [pscustomobject]@{ eligible = ($reasons.Count -eq 0); reasons = @($reasons.ToArray()) }
}
