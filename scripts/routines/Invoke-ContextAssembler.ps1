<#
.SYNOPSIS
    Compila e otimiza o contexto de multiplos arquivos para um prompt de LLM.

.DESCRIPTION
    Esta funcao e responsavel por ler conteudos de arquivos essenciais (instrucoes globais,
    identidade do usuario, contexto do projeto) e combiná-los em um unico string de prompt.
    Ela permite flexibilidade para incluir recomendacoes de LLM e otimizar o volume de
    contexto, especialmente para o protocolo de handoff web.

.PARAMETER GlobalInstructionsPath
    Caminho para o arquivo GLOBAL_INSTRUCTIONS.md.
.PARAMETER ClaudeIdentityPath
    Caminho para o arquivo CLAUDE.md (identidade de Raphael Vitoi).
.PARAMETER ProjectContextPath
    Caminho para o arquivo project-context.md.
.PARAMETER LLMRecommendation
    Uma string de recomendacao para qual LLM e mais adequado para a tarefa.
.PARAMETER MaxContextLength
    Comprimento maximo de contexto em tokens. Se o contexto exceder, sera sumarizado.
#>
[CmdletBinding()]
param (
    [Parameter(Mandatory=$true)]
    [string]$GlobalInstructionsPath,

    [Parameter(Mandatory=$true)]
    [string]$ClaudeIdentityPath,

    [Parameter(Mandatory=$true)]
    [string]$ProjectContextPath,

    [string]$LLMRecommendation = "",

    [int]$MaxContextLength = 100000 # Valor arbitrario, ajustar conforme o modelo LLM
)

function Invoke-ContextAssembler {
    [CmdletBinding()]
    param (
        [Parameter(Mandatory=$true)]
        [string]$GlobalInstructionsPath,

        [Parameter(Mandatory=$true)]
        [string]$ClaudeIdentityPath,

        [Parameter(Mandatory=$true)]
        [string]$ProjectContextPath,

        [string]$LLMRecommendation = "",

        [int]$MaxContextLength = 100000 # Valor arbitrario, ajustar conforme o modelo LLM
    )

    Write-Host "[INFO] Montando contexto para LLM..." -ForegroundColor Yellow

    # Carrega o conteudo dos arquivos
    $GlobalInstructions = Get-Content $GlobalInstructionsPath -Raw -Encoding UTF8
    $ClaudeIdentity = Get-Content $ClaudeIdentityPath -Raw -Encoding UTF8
    $ProjectContext = if (Test-Path $ProjectContextPath) {
        Get-Content $ProjectContextPath -Raw -Encoding UTF8
    } else {
        Write-Warning "Arquivo project-context.md nao encontrado em '$ProjectContextPath'. Ignorando."
        ""
    }

    # Constroi o prompt base
    $prompt = @"
CONTEXTO GLOBAL:
$GlobalInstructions

IDENTIDADE DO USUARIO (Raphael Vitoi):
$ClaudeIdentity

CONTEXTO DO PROJETO:
$ProjectContext
"@

    # Adiciona a recomendacao de LLM se fornecida
    if (-not [string]::IsNullOrWhiteSpace($LLMRecommendation)) {
        $prompt += "`n`nRECOMENDACAO LLM PARA ESTA TAREFA: $LLMRecommendation"
    }

    # Truncamento de Protecao SOTA (Cortex Shield)
    $currentLength = $prompt.Length

    if ($currentLength -gt $MaxContextLength) {
        Write-Warning "[SOTA] Contexto colossal detectado ($currentLength caracteres). Aplicando Truncamento Cirurgico para blindar o Clipboard."
        
        # Preserva a integridade de Global e Identity, sacrificando apenas o final do Project Context
        $AllowedContextLen = [Math]::Max(1000, $MaxContextLength - $GlobalInstructions.Length - $ClaudeIdentity.Length - 500)
        
        if ($ProjectContext.Length -gt $AllowedContextLen) {
            $ProjectContext = $ProjectContext.Substring(0, $AllowedContextLen) + "`n`n... [CORTADO PELO CORTEX SHIELD SOTA: Limite Atingido. Acesse RAG/Docs para o resto]."
            
            $prompt = @"
CONTEXTO GLOBAL:
$GlobalInstructions

IDENTIDADE DO USUARIO (Raphael Vitoi):
$ClaudeIdentity

CONTEXTO DO PROJETO (TRUNCADO PARA PROTECAO):
$ProjectContext
"@
            if (-not [string]::IsNullOrWhiteSpace($LLMRecommendation)) { $prompt += "`n`nRECOMENDACAO LLM PARA ESTA TAREFA: $LLMRecommendation" }
        }
    }

    return $prompt
}

# Exporta a funcao para ser usada por outros scripts, se este arquivo for pontuado.
Export-ModuleMember -Function Invoke-ContextAssembler
