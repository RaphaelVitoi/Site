<# SOTA: Wrapper de Ignicao do Nexus CLI para PowerShell (v8.0 GOLD) #>
param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Args)
# Ver a nota em dashboard.ps1: `uv run` resolve o projeto pelo CWD. Passou a
# importar aqui porque o roteamento novo do profile manda o caso sem hifen
# para este wrapper, tornando-o a porta de entrada principal do ecossistema.
Push-Location $PSScriptRoot
try { uv run nexus @Args } finally { Pop-Location }
