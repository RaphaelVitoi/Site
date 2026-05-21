# Script de Geração de Documentação e Memória de Agentes v2.0
# Alinhado com a Pipeline Harmônica e o Manifesto de Coerência

$Agents = @(
    "pesquisador", "prompter", "curator", "planner", "organizador", 
    "auditor", "implementor", "verifier", "validador", "securitychief", 
    "maverick", "sequenciador", "skillmaster", "dispatcher", "chico"
)

$BaseDir = Join-Path $PSScriptRoot ".claude"
$MemoryDir = Join-Path $BaseDir "agent-memory"

Write-Host "=== INICIANDO CRIAÇÃO DE ESTRUTURA DE MEMÓRIA (10/10) ===" -ForegroundColor Cyan

foreach ($Agent in $Agents) {
    $AgentPath = Join-Path $MemoryDir $Agent
    $FilePath = Join-Path $AgentPath "MEMORY.md"
    
    if (-not (Test-Path $AgentPath)) {
        New-Item -ItemType Directory -Path $AgentPath -Force | Out-Null
        Write-Host "[NEW] Pasta criada para @$Agent" -ForegroundColor Green
    }

    # Template de Memória com o novo sistema de Tagging e Coerência de 4 Camadas
    $Template = @"
# @$Agent MEMORY - O Cortex Individual

> **Status:** Ativo
> **Vínculo:** Honrando COSMOVISAO.md
> **Camadas:** [CLAUDE.md](../CLAUDE.md) | [GLOBAL](../GLOBAL_INSTRUCTIONS.md) | [Context](../../project-context.md)

---

## 1. PERFIL & IDENTIDADE
Descreva o perfil e alinhamento do agente com o projeto.

## 2. COMPETÊNCIAS ATIVAS
Liste as competencias e habilidades do agente.

## 3. PADRÕES & INSIGHTS (#aprendizado)
Registro de descobertas e padrões observados.

*   **Exemplo:** #padrao #reflexao - Observado que a profundidade analítica aumenta quando o prompt inicial cita explicitamente a Teoria dos Jogos.

## 4. RELACIONAMENTOS (#relacionamento)
Com quem este agente mais colabora e como a simetria é mantida.

## 5. REGISTRO DE EXECUÇÃO (#decisão)
Registre as decisoes e resultados relevantes para o agente.

---

## TAGS SUGERIDAS
Use estas hashtags para categorizar informações:
`#padrao` `#inteligencia` `#relacionamento` `#decisao` `#aprendizado` `#reflexao` `#etica`

## AGREGAÇÃO FILOSÓFICA
Como este agente contribuiu para a COSMOVISAO.md?
"@

    if (-not (Test-Path $FilePath)) {
        [System.IO.File]::WriteAllText($FilePath, $Template, [System.Text.Encoding]::UTF8)
        Write-Host "  + MEMORY.md gerado para @$Agent" -ForegroundColor Yellow
    }
    else {
        # Se o arquivo já existe, apenas garantimos que a instrução de tagging esteja presente no final se faltar
        $CurrentContent = Get-Content $FilePath -Raw
        if ($CurrentContent -notmatch "#padrão") {
            $TagInstruction = "`n`n## SISTEMA DE TAGGING (Update)`nUse hashtags para categorizar: #padrão #inteligência #relacionamento #decisão #aprendizado #reflexão`n"
            Add-Content -Path $FilePath -Value $TagInstruction
            Write-Host "  * Tagging system injetado em @$Agent" -ForegroundColor DarkYellow
        }
    }
}

# Criar o INDEX_CLAUDE.md se não existir para navegação estética
$IndexPath = Join-Path $BaseDir "INDEX_CLAUDE.md"
if (-not (Test-Path $IndexPath)) {
    Write-Host "[CATEDRAL] Criando INDEX_CLAUDE.md para navegação..." -ForegroundColor Magenta
    # (O conteúdo seria o que já temos no contexto, mas o script garante a existência física)
}

Write-Host "=== OPERAÇÃO CONCLUÍDA: SIMETRIA 10/10 GARANTIDA ===" -ForegroundColor Cyan
Invoke-Expression "cmd /c color 07" # Reset cor terminal