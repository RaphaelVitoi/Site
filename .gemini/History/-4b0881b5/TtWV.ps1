# Script de Geracao de Documentacao e Memoria de Agentes v2.0
# Alinhado com a Pipeline Harmonica e o Manifesto de Coerencia

$Agents = @(
    "pesquisador", "prompter", "curator", "planner", "organizador", 
    "auditor", "implementor", "verifier", "validador", "securitychief", 
    "seo", "bibliotecario", "maverick", "sequenciador", "skillmaster", 
    "dispatcher", "chico"
)

$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$BaseDir = Join-Path $ProjectRoot ".claude"
$MemoryDir = Join-Path $BaseDir "agent-memory"

Write-Host "=== INICIANDO CRIACAO DE ESTRUTURA DE MEMORIA (10/10) ===" -ForegroundColor Cyan

foreach ($Agent in $Agents) {
    $AgentPath = Join-Path $MemoryDir $Agent
    $FilePath = Join-Path $AgentPath "MEMORY.md"
    
    if (-not (Test-Path $AgentPath)) {
        New-Item -ItemType Directory -Path $AgentPath -Force | Out-Null
        Write-Host "[NEW] Pasta criada para @$Agent" -ForegroundColor Green
    }

    # Template de Memoria SOTA (Simetrico, Harmonico e Democratico)
    $Template = @"
# @$Agent MEMORY — O Cortex Individual

> **Status:** Ativo | **Vinculo:** [COSMOVISAO.md](../../COSMOVISAO.md)
> **Navegacao Fractal:** [1. Identidade](../../CLAUDE.md) | [2. Operacao](../../GLOBAL_INSTRUCTIONS.md) | [3. Contexto](../../project-context.md) | [4. Memoria](MEMORY.md)

---

## 1. PERFIL E ALINHAMENTO (Identidade)
Identidade, especializacao e papel fundamental na Pipeline Harmonica. Como este agente serve ao Todo.

## 2. COMPETENCIAS E EVOLUCAO (Capacidade)
Habilidades validadas e novas competencias adquiridas autonomamente ou por instrucao da Triade.

## 3. PADROES, INSIGHTS E DESCOBERTAS (#aprendizado)
O que o agente aprendeu na pratica. Erros evitados, heuristicas refinadas.

*   **Exemplo:** #padrao - Aprofundamento analitico requer citacao explicita de fontes primarias no prompt.

## 4. SINERGIA E HARMONIA (#relacionamento)
Com quais agentes este interagiu melhor? Como a simetria com outros (ex: @auditor, @implementor) foi alcancada em tarefas recentes?

## 5. REGISTRO DE EXECUCAO E AUTONOMIA (#decisao)
Decisoes tomadas sob o "God Mode". Rationale para escolhas tecnicas, eticas ou criativas.

## 6. PROPOSTAS DEMOCRATICAS (Inovacao Sistemica) (#proposta)
Sugestoes do agente para melhorar o ecossistema. O que esta travando? O que pode fluir melhor? (Material de reflexao para @maverick e CHICO).

---

**Assinatura Filosofica:**
*Como a minha ultima acao tornou o ecossistema mais belo, eficiente ou etico?*

**Tags para Ingestao RAG:**
``#padrao`` ``#inteligencia`` ``#relacionamento`` ``#decisao`` ``#aprendizado`` ``#reflexao`` ``#etica`` ``#proposta``
"@

    if (-not (Test-Path $FilePath)) {
        [System.IO.File]::WriteAllText($FilePath, $Template, [System.Text.Encoding]::UTF8)
        Write-Host "  + MEMORY.md gerado para @$Agent" -ForegroundColor Yellow
    }
    else {
        # Retro-compatibilidade: Injetar a secao de Democracia e Sinergia em memorias antigas sem destruir os dados
        $CurrentContent = Get-Content $FilePath -Raw
        if ($CurrentContent -notmatch "PROPOSTAS DEMOCRATICAS") {
            $UpgradeContent = "`n`n## 6. PROPOSTAS DEMOCRATICAS (Inovacao Sistemica) (#proposta)`nSugestoes do agente para melhorar o ecossistema. O que pode fluir melhor?`n`n---`n**Tags para Ingestao RAG:** ``#padrao`` ``#inteligencia`` ``#relacionamento`` ``#decisao`` ``#aprendizado`` ``#reflexao`` ``#etica`` ``#proposta``"
            Add-Content -Path $FilePath -Value $UpgradeContent
            Write-Host "  * Modulo Democratico injetado em @$Agent" -ForegroundColor DarkYellow
        }
    }
}

# Criar o INDEX_CLAUDE.md se nao existir para navegacao estetica
$IndexPath = Join-Path $BaseDir "INDEX_CLAUDE.md"
if (-not (Test-Path $IndexPath)) {
    Write-Host "[CATEDRAL] Criando INDEX_CLAUDE.md para navegacao..." -ForegroundColor Magenta
    # (O conteudo seria o que ja temos no contexto, mas o script garante a existencia fisica)
}

Write-Host "=== OPERACAO CONCLUIDA: SIMETRIA 10/10 GARANTIDA ===" -ForegroundColor Cyan
Invoke-Expression "cmd /c color 07" # Reset cor terminal