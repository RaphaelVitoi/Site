<# SOTA: Launcher Direto do Dashboard Executivo SOTA (v8.0 GOLD) #>
param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Args)
# `uv run` resolve o projeto pelo CWD, nao pelo caminho deste script. Sem o
# Push-Location o alias `dashboard` so funciona de dentro do Site -- medido em
# 2026-08-27 a partir de C:\Users\rapha: EXIT=2, "Failed to spawn: `nexus`".
# Um alias existe para ser digitado de qualquer lugar, entao o launcher tem de
# levar a raiz consigo. Mesma ambiguidade de raiz do CLAUDE.md secao 1.
Push-Location $PSScriptRoot
try { uv run nexus dashboard @Args } finally { Pop-Location }
