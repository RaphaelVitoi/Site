<# SOTA: Wrapper de Ignicao do Nexus CLI para PowerShell #>
param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Args)
uv run nexus @Args
