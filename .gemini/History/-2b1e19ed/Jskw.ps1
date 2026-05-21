<#
.SYNOPSIS
    Injecao de Memoria SOTA (Estado da Arte) - Execucao Direta pelo CHICO.
.DESCRIPTION
    Este script contem a producao intelectual elaborada pelo proprio Cerebro Hibrido.
    Ele sobrescreve os arquivos MEMORY.md dos 17 agentes com conteudo profundo, 
    filosofico e atrelado as recentes evolucoes (SQLite, RAG, God Mode 2.0),
    e em seguida roda a indexacao no ChromaDB.
#>

Write-Host "=== INICIANDO INJECAO MASSIVA DE INTELIGENCIA (16 AGENTES) ===" -ForegroundColor Cyan

$MemoryDir = Join-Path (Split-Path $PSScriptRoot -Parent) ".claude\agent-memory"

$ManifestPath = Join-Path (Split-Path $PSScriptRoot -Parent) "data\agents_manifest.json"
if (-not (Test-Path $ManifestPath)) {
    Write-Error "CRITICAL: O Manifesto dos Agentes (agents_manifest.json) nao foi encontrado."
    exit 1
}
$AgentData = Get-Content $ManifestPath -Raw | ConvertFrom-Json

foreach ($agentName in $AgentData.Keys) {
    $data = $AgentData[$agentName]
    $checklistSection = if ($data.Checklist) { "`n## 7. PROTOCOLO DA VERDADE (Checklist Operacional)`n$($data.Checklist)`n" } else { "" }
    
    $content = @"
# @$agentName MEMORY - O Cortex Individual

> **Status:** Ativo | **Vinculo:** COSMOVISAO.md
> **Navegacao Fractal:** 1. Identidade | 2. Operacao | 3. Contexto | 4. Memoria

---

## 1. PERFIL E ALINHAMENTO (Identidade)
$($data.identidade)

## 2. COMPETENCIAS E EVOLUCAO (Capacidade)
$($data.competencias)

## 3. PADROES, INSIGHTS E DESCOBERTAS (#aprendizado)
$($data.padroes)

## 4. SINERGIA E HARMONIA (#relacionamento)
$($data.sinergia)

## 5. REGISTRO DE EXECUCAO E AUTONOMIA (#decisao)
$($data.decisao)

## 6. PROPOSTAS DEMOCRATICAS (Inovacao Sistemica) (#proposta)
$($data.proposta)
$checklistSection
---

**Assinatura Filosofica:**
*A evolucao do Todo comeca na precisao e integridade da Parte.*

**Tags para Ingestao RAG:**
``#padrao`` ``#inteligencia`` ``#relacionamento`` ``#decisao`` ``#aprendizado`` ``#reflexao`` ``#etica`` ``#proposta``
"@

    $agentPath = Join-Path $MemoryDir ($agentName -replace "@", "")
    if (-not (Test-Path $agentPath)) { New-Item -ItemType Directory -Path $agentPath -Force | Out-Null }
    
    [System.IO.File]::WriteAllText((Join-Path $agentPath "MEMORY.md"), $content, [System.Text.Encoding]::UTF8)
    Write-Host "  [+] Mente de @$agentName atualizada com sucesso!" -ForegroundColor Green
}

Write-Host "`n[RAG] Acionando a Ingestao Vetorial Automatica..." -ForegroundColor Yellow

$pythonCmd = "python"
$venvPython = Join-Path (Split-Path $PSScriptRoot -Parent) ".venv\Scripts\python.exe"
if (Test-Path $venvPython) { $pythonCmd = $venvPython }

$ragScript = Join-Path (Split-Path $PSScriptRoot -Parent) "memory_rag.py"
& $pythonCmd $ragScript ingest

Write-Host "=== OPERACAO CONCLUIDA: INTELECTO ELEVADO AO ESTADO DA ARTE ===" -ForegroundColor Magenta
