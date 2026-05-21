# Script de Geracao de Documentacao e Memoria de Agentes v2.0
# Alinhado com a Pipeline Harmonica e o Manifesto de Coerencia

$ProjectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$ManifestPath = Join-Path $ProjectRoot 'data\agents_manifest.json'

if (Test-Path $ManifestPath) {
    $Manifest = Get-Content $ManifestPath -Raw | ConvertFrom-Json
    # Extrai dinamicamente as chaves (ex: "chico", "maverick") removendo possiveis "@" se existirem
    $Agents = $Manifest.psobject.properties.name | ForEach-Object { $_ -replace '^@', '' }
}
else {
    Write-Warning '[ENTROPIA] agents_manifest.json nao encontrado. Usando fallback estatico.'
    $Agents = @('dispatcher', 'architect', 'maverick', 'auditor', 'implementor', 'verifier', 'curator', 'validador', 'organizador', 'pesquisador', 'prompter', 'securitychief', 'bibliotecario', 'skillmaster', 'chico')
}

$BaseDir = Join-Path $ProjectRoot '.claude'
$MemoryDir = Join-Path $BaseDir 'agent-memory'

Write-Host '=== INICIANDO CRIACAO DE ESTRUTURA DE MEMORIA (10/10) ===' -ForegroundColor Cyan

foreach ($Agent in $Agents) {
    $AgentPath = Join-Path $MemoryDir $Agent
    $FilePath = Join-Path $AgentPath 'MEMORY.md'

    if (-not (Test-Path $AgentPath)) {
        New-Item -ItemType Directory -Path $AgentPath -Force | Out-Null
        Write-Host "[NEW] Pasta criada para @$Agent" -ForegroundColor Green
    }

    # Template de Memoria com o novo sistema de Tagging e Coerencia de 4 Camadas
    $Template = @"
# @$Agent MEMORY - Inteligencia Acumulada

> **Status:** Ativo
> **Vinculo:** Honrando COSMOVISAO.md
> **Camadas:** [CLAUDE.md](../CLAUDE.md) | [GLOBAL](../GLOBAL_INSTRUCTIONS.md) | [Context](../../project-context.md)

---

## 1. PERFIL & IDENTIDADE
Identidade e especializacao do agente conforme definido em `.claude/agents/$Agent.md`.

## 2. COMPETENCIAS ATIVAS
Mapeamento de habilidades validadas durante a operacao.

## 3. PADROES & INSIGHTS (#aprendizado)
Registro de descobertas e padroes observados.

*   **Exemplo:** #padrao #reflexao - Observado que a profundidade analitica aumenta quando o prompt inicial cita explicitamente a Teoria dos Jogos.

## 4. RELACIONAMENTOS (#relacionamento)
Com quem este agente mais colabora e como a simetria e mantida.

## 5. REGISTRO DE EXECUCAO (#decisao)
Historico de decisoes criticas e rationale aplicado.

---

## TAGS SUGERIDAS
Use estas hashtags para categorizar informacoes:
`#padrao` `#inteligencia` `#relacionamento` `#decisao` `#aprendizado` `#reflexao` `#etica`

## AGREGACAO FILOSOFICA
*Como este agente contribuiu para a COSMOVISAO.md nesta sessao?*
"@

    if (-not (Test-Path $FilePath)) {
        [System.IO.File]::WriteAllText($FilePath, $Template, [System.Text.Encoding]::UTF8)
        Write-Host "  + MEMORY.md gerado para @$Agent" -ForegroundColor Yellow
    }
    else {
        # Se o arquivo ja existe, apenas garantimos que a instrucao de tagging esteja presente no final se faltar
        $CurrentContent = Get-Content $FilePath -Raw
        if ($CurrentContent -notmatch '#padrao') {
            $TagInstruction = "`n`n## SISTEMA DE TAGGING (Update)`nUse hashtags para categorizar: #padrao #inteligencia #relacionamento #decisao #aprendizado #reflexao`n"
            Add-Content -Path $FilePath -Value $TagInstruction
            Write-Host "  * Tagging system injetado em @$Agent" -ForegroundColor DarkYellow
        }
    }
}

# Criar o INDEX_CLAUDE.md se nao existir para navegacao estetica
$IndexPath = Join-Path $BaseDir 'INDEX_CLAUDE.md'
if (-not (Test-Path $IndexPath)) {
    Write-Host '[CATEDRAL] Criando INDEX_CLAUDE.md para navegacao...' -ForegroundColor Magenta
    [System.IO.File]::WriteAllText($IndexPath, "# INDEX CLAUDE`nNavegacao fractal SOTA da Catedral.", [System.Text.Encoding]::UTF8)
}

Write-Host '=== OPERACAO CONCLUIDA: SIMETRIA 10/10 GARANTIDA ===' -ForegroundColor Cyan
[Console]::ResetColor() # Reset cor terminal (.NET SOTA Nativo)
