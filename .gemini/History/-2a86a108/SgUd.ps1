<#
.SYNOPSIS
    Auditoria Sistêmica SOTA: Varre a inteligência coletiva e gera o Relatório de Saúde do Ecossistema.
.DESCRIPTION
    Este script lê as memórias (MEMORY.md) de todos os agentes SOTA.
    Extrai as Propostas Democráticas, Padrões, verifica as datas de modificação
    (prevenindo amnésia sistêmica) e condensa tudo no SYSTEM_HEALTH_CONSOLIDATED.md.
#>
[CmdletBinding()]
param (
    [switch]$ShowOutput
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$ProjectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$MemoryDir = Join-Path $ProjectRoot '.claude\agent-memory'
$ReportsDir = Join-Path $ProjectRoot 'docs\reports'
$ReportPath = Join-Path $ReportsDir 'SYSTEM_HEALTH_CONSOLIDATED.md'

if (-not (Test-Path $ReportsDir)) {
    New-Item -ItemType Directory -Path $ReportsDir -Force | Out-Null
}

Write-Host '=== [SISTEMA] INICIANDO AUDITORIA DE MEMÓRIAS (RAG) ===' -ForegroundColor Cyan

$AgentsFolders = Get-ChildItem -Path $MemoryDir -Directory
$TotalAgents = $AgentsFolders.Count
$HealthyAgents = 0

$ReportContent = [System.Collections.Generic.List[string]]::new()
$ReportContent.Add('# 🧬 RELATÓRIO CONSOLIDADO DE SAÚDE DO ECOSSISTEMA')
$ReportContent.Add("> **Data da Auditoria:** $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')")
$ReportContent.Add("> **Agentes Inspecionados:** $TotalAgents")
$ReportContent.Add('---')
$ReportContent.Add('## 1. STATUS DE HOMEÓSTASE (ÚLTIMA REFLEXÃO)')
$ReportContent.Add('')
$ReportContent.Add('| Agente | Última Atualização | Status |')
$ReportContent.Add('|---|---|---|')

$Proposals = [System.Collections.Generic.List[string]]::new()
$Patterns = [System.Collections.Generic.List[string]]::new()

foreach ($AgentDir in $AgentsFolders) {
    $AgentName = $AgentDir.Name
    $MemoryFile = Join-Path $AgentDir.FullName 'MEMORY.md'
    
    if (Test-Path $MemoryFile) {
        $LastWrite = (Get-Item $MemoryFile).LastWriteTime
        $DaysSinceUpdate = (New-TimeSpan -Start $LastWrite -End (Get-Date)).Days
        
        $Status = if ($DaysSinceUpdate -le 7) { '🟢 Saudável' } elseif ($DaysSinceUpdate -le 30) { '🟡 Estagnado' } else { '🔴 Amnésia Detectada' }
        if ($DaysSinceUpdate -le 30) { $HealthyAgents++ }
        
        $ReportContent.Add("| @$AgentName | $($LastWrite.ToString('yyyy-MM-dd')) | $Status |")

        # Extrai Padroes e Propostas via regex (Pega a linha contendo a tag)
        $Lines = Get-Content $MemoryFile -Encoding UTF8
        foreach ($Line in $Lines) {
            if ($Line -match '(#proposta|#proposta_).*') {
                $Proposals.Add("- **@$AgentName:** $($Line.Trim())")
            }
            if ($Line -match '(#padrao|#aprendizado).*') {
                $Patterns.Add("- **@$AgentName:** $($Line.Trim())")
            }
        }
    }
    else {
        $ReportContent.Add("| @$AgentName | ARQUIVO AUSENTE | 🔴 Falha Crítica |")
    }
}

$ReportContent.Add('')
$ReportContent.Add('## 2. INTELIGÊNCIA EXTRAÍDA (PADRÕES E APRENDIZADOS)')
$ReportContent.Add('> *Sinergia cruzada: O que um aprende, todos herdam.*')
if ($Patterns.Count -gt 0) { $Patterns | ForEach-Object { $ReportContent.Add($_) } } else { $ReportContent.Add('*Nenhum padrão novo registrado recentemente.*') }

$ReportContent.Add('')
$ReportContent.Add('## 3. PROPOSTAS DEMOCRÁTICAS PENDENTES')
$ReportContent.Add('> *Inovações sugeridas pela malha de agentes aguardando deliberação de Raphael ou @maverick.*')
if ($Proposals.Count -gt 0) { $Proposals | ForEach-Object { $ReportContent.Add($_) } } else { $ReportContent.Add('*Nenhuma proposta pendente.*') }

$FinalText = $ReportContent -join "`n"
[System.IO.File]::WriteAllText($ReportPath, $FinalText, [System.Text.Encoding]::UTF8)

Write-Host "[OK] Auditoria Concluída. $HealthyAgents de $TotalAgents agentes estão lúcidos." -ForegroundColor Green
Write-Host "[SOTA] Relatório materializado em: $ReportPath" -ForegroundColor Yellow

if ($ShowOutput) {
    Write-Host "`n--- PRÉVIA DO RELATÓRIO ---`n" -ForegroundColor DarkGray
    $FinalText | Out-Host
}