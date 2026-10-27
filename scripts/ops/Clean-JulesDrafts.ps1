<#
.SYNOPSIS
    Rotina SOTA de Higiene e Fechamento Semestral de Draft PRs do Google Jules (Bolt).
.DESCRIPTION
    Sob o Protocolo Chico SOTA v8.0 GOLD e a Secao 10 do Site/CLAUDE.md:
    1. Lista todos os Draft PRs abertos pelo Google Jules (titulo prefixado por 'Bolt:').
    2. Preserva os 2 drafts mais recentes para validacao sob demanda.
    3. Fecha os drafts obsoletos com justificativa formal rastreavel no GitHub,
       registrando que as hipoteses medidas foram assimiladas na memoria episodica
       (.claude/agent-memory/bolt/MEMORY.md) e mantendo o painel enxuto.
.PARAMETER DryRun
    Apenas lista os PRs sem fecha-los.
.PARAMETER KeepCount
    Quantidade de PRs mais recentes a preservar (padrao: 2).
#>

[CmdletBinding()]
param(
    [switch]$DryRun,
    [int]$KeepCount = 2
)

$ErrorActionPreference = 'Stop'
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "   SOTA JULES DRAFTS MAINTENANCE & HYGIENE (v8.0 GOLD)               " -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan

$prsJson = gh pr list -R RaphaelVitoi/Site --state open --limit 100 --json number,title,createdAt,isDraft,url | ConvertFrom-Json
$boltPrs = @($prsJson | Where-Object { $_.title -like "*Bolt:*" } | Sort-Object -Property number -Descending)

Write-Host "Total de PRs do Jules/Bolt abertos encontrados: $($boltPrs.Count)" -ForegroundColor Yellow

if ($boltPrs.Count -le $KeepCount) {
    Write-Host "Quantidade de drafts ($($boltPrs.Count)) ja esta dentro do teto de retencao ($KeepCount). Nenhuma acao necessaria." -ForegroundColor Green
    return
}

$prsToKeep = $boltPrs | Select-Object -First $KeepCount
$prsToClose = $boltPrs | Select-Object -Skip $KeepCount

Write-Host "`n[PRESERVADOS - $KeepCount mais recentes]:" -ForegroundColor Green
foreach ($p in $prsToKeep) {
    Write-Host "  -> PR #$($p.number): $($p.title)" -ForegroundColor White
}

Write-Host "`n[A FECHAR - $($prsToClose.Count) drafts arquivados]:" -ForegroundColor DarkYellow
foreach ($p in $prsToClose) {
    Write-Host "  -> PR #$($p.number): $($p.title)" -ForegroundColor Gray
}

if ($DryRun) {
    Write-Host "`n[DRY RUN] Nenhuma alteracao aplicada." -ForegroundColor Cyan
    return
}

Write-Host "`nIniciando fechamento dos drafts antigos..." -ForegroundColor Yellow
$motivo = "Fechado para higiene e governanca SOTA: exploracao noturna de micro-otimizacao assimilada e consolidada em .claude/agent-memory/bolt/MEMORY.md conforme Secao 10 do CLAUDE.md."

foreach ($p in $prsToClose) {
    try {
        gh pr close $p.number -R RaphaelVitoi/Site --comment $motivo
        Write-Host "  [OK] PR #$($p.number) fechado com sucesso." -ForegroundColor Green
    } catch {
        Write-Warning "Falha ao fechar PR #$($p.number): $($_.Exception.Message)"
    }
}

Write-Host "`n[SUCESSO] Painel de PRs do Jules higienizado conforme padrao ouro SOTA." -ForegroundColor Green
