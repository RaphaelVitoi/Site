<#
.SYNOPSIS
    Analisa os arquivos de memória dos agentes para identificar inconsistências e conflitos.
.DESCRIPTION
    Este script automatiza a análise dos arquivos MEMORY.md de cada agente para
    identificar potenciais inconsistências e conflitos em seus objetivos e
    relacionamentos declarados. Ele procura por:
    - Objetivos conflitantes entre agentes.
    - Relacionamentos não recíprocos (agente A menciona agente B, mas não o contrário).
    - Palavras-chave indicando áreas problemáticas (e.g., "conflito", "obsoleto").
#>

[CmdletBinding()]
param ()

$ProjectRoot = Split-Path $PSScriptRoot -Parent
$MemoryDir = Join-Path $ProjectRoot ".claude\agent-memory"
$ManifestPath = Join-Path $ProjectRoot "data\agents_manifest.json"

# Carrega o manifesto dos agentes
if (-not (Test-Path $ManifestPath)) {
    Write-Error "CRITICAL: O Manifesto dos Agentes (agents_manifest.json) nao foi encontrado."
    exit 1
}
$AgentManifest = Get-Content $ManifestPath -Raw | ConvertFrom-Json
$Agents = $AgentManifest.PSObject.Properties.Name

# Verifica se o diretório de memória existe
if (-not (Test-Path $MemoryDir)) {
    Write-Error "CRITICAL: O diretório de memória dos agentes não foi encontrado em '$MemoryDir'."
    exit 1
}

# Função para analisar um arquivo de memória
function Analyze-AgentMemory {
    param (
        [string]$AgentName,
        [string]$MemoryFile
    )

    Write-Host "Analisando memória do agente '$AgentName'..." -ForegroundColor Cyan

    # Le o conteudo do arquivo
    try {
        $Content = Get-Content $MemoryFile -Raw -Encoding UTF8
    }
    catch {
        Write-Error "Erro ao ler o arquivo de memória '$MemoryFile': $_"
        return
    }

    # Extrai objetivos (seção "COMPETENCIAS ATIVAS")
    $ObjetivosMatch = Select-String -InputObject $Content -Pattern "(?smi)##\s*2\.\s*COMPETENCIAS ATIVAS(.*?)##"
    if ($ObjetivosMatch) {
        $Objetivos = $ObjetivosMatch.Matches[0].Groups[1].Value.Trim()
    }
    else {
        Write-Warning "Seção 'COMPETENCIAS ATIVAS' não encontrada no arquivo '$MemoryFile'."
        $Objetivos = ""
    }

    # Encontra menções a outros agentes
    $AgentesMencionados = @()
    foreach ($Agente in $Agents) {
        if ($AgentName -eq $Agente) { continue }  # Ignora o próprio agente
        if ($Content -match "(?i)@$Agente\b") {
            $AgentesMencionados += "@$Agente"
        }
    }

    # Detecta palavras-chave de alerta
    $PalavrasAlerta = @("conflito", "obsoleto", "inconsistência", "discrepância")
    $AlertasEncontrados = @()
    foreach ($Palavra in $PalavrasAlerta) {
        if ($Content -match "(?i)\b$Palavra\b") {
            $AlertasEncontrados += $Palavra
        }
    }

    # Retorna os resultados
    return @{
        AgentName          = $AgentName
        Objetivos          = $Objetivos
        AgentesMencionados = $AgentesMencionados
        AlertasEncontrados = $AlertasEncontrados
    }
}

# Analisa cada agente
$ResultadosAnalise = @()
foreach ($Agent in $Agents) {
    $MemoryFile = Join-Path $MemoryDir $Agent "MEMORY.md"
    if (Test-Path $MemoryFile) {
        $ResultadosAnalise += Analyze-AgentMemory -AgentName $Agent -MemoryFile $MemoryFile
    }
    else {
        Write-Warning "Arquivo de memória não encontrado para o agente '$Agent' em '$MemoryFile'."
    }
}

# Relatório de inconsistências e conflitos
Write-Host "`n=== RELATÓRIO DE ANÁLISE DE MEMÓRIA DOS AGENTES ===" -ForegroundColor Magenta

# 1. Conflitos de Objetivo (Exemplo Simplificado)
# (Em uma análise mais complexa, poderíamos comparar os objetivos de cada agente
# com os dos outros para encontrar declarações contraditórias)

Write-Host "`n1. Análise de Conflitos de Objetivo (Simplificada):" -ForegroundColor Yellow
Write-Host "   (Implementar lógica de comparação de objetivos aqui)" -ForegroundColor DarkGray

# 2. Relacionamentos Não Recíprocos
Write-Host "`n2. Relacionamentos Não Recíprocos:" -ForegroundColor Yellow
foreach ($Resultado1 in $ResultadosAnalise) {
    $Agente1 = $Resultado1.AgentName
    foreach ($AgenteMencionado in $Resultado1.AgentesMencionados) {
        $Encontrado = $false
        foreach ($Resultado2 in $ResultadosAnalise) {
            if ($Resultado2.AgentName -eq $AgenteMencionado.Replace("@", "")) {
                if ($Resultado2.AgentesMencionados -contains $Agente1) {
                    $Encontrado = $true
                    break
                }
            }
        }
        if (-not $Encontrado) {
            Write-Host "  - Agente '$Agente1' menciona '$AgenteMencionado', mas não há menção recíproca." -ForegroundColor Red
        }
    }
}

# 3. Alertas
Write-Host "`n3. Alertas:" -ForegroundColor Yellow
foreach ($Resultado in $ResultadosAnalise) {
    if ($Resultado.AlertasEncontrados.Count -gt 0) {
        Write-Host "  - Agente '$($Resultado.AgentName)' contém alertas: $($Resultado.AlertasEncontrados -join ', ')" -ForegroundColor Red
    }
}

Write-Host "`n=== ANÁLISE CONCLUÍDA ===" -ForegroundColor Green

# Sugestões para aprimoramento:
# - Implementar análise de similaridade semântica para detectar conflitos de objetivo.
# - Criar um sistema de pontuação para priorizar inconsistências mais críticas.
# - Integrar com um painel de visualização para facilitar a análise dos resultados.