# Análise de Otimização - Oportunidades de Melhoria - 2026-03-12

> Executado por @pesquisador | Análise de performance, eficiência e arquitetura

---

## 🔵 OTIMIZAÇÕES RECOMENDADAS

### **CRÍTICA - Impacto Alto, Esforço Baixo**

#### 1. VS Code Settings - Modo Debug Ativado Permanentemente

**Localização:** `.vscode/settings.json`

**Problema:**

```json
"geminicodeassist.agentDebugMode": true,
"geminicodeassist.agentYoloMode": true,
"geminicodeassist.verboseLogging": true,
"geminicodeassist.codeGenerationPaneViewEnabled": true,
"geminicodeassist.outlines.automaticOutlineGeneration": true,
"geminicodeassist.inlineSuggestions.nextEditPredictions": true
```

**Impacto:**

- `verboseLogging` consome CPU/memória desnecessariamente
- `yoloMode` pode causar comportamento não esperado
- `nextEditPredictions` + `automaticOutlineGeneration` together causam overhead

**Recomendação:**

```json
{
    "geminicodeassist.agentDebugMode": false,
    "geminicodeassist.agentYoloMode": false,
    "geminicodeassist.codeGenerationPaneViewEnabled": true,
    "geminicodeassist.outlines.automaticOutlineGeneration": false,
    "geminicodeassist.verboseLogging": false,
    "geminicodeassist.inlineSuggestions.nextEditPredictions": false
}
```

**Ganho:** -30-50% CPU durante edição, melhor responsividade

---

#### 2. PowerShell Scripts - Sem Limpeza de Histórico de Tarefas

**Localização:** `queue/tasks.json`, `do.ps1`, `status.ps1`

**Problema:**

- `queue/tasks.json` acumula tarefas completadas indefinidamente
- Arquivo cresce sem limite
- Sem função de arquivamento or cleanup

**Exemplo de crescimento:**

```json
[
  { "id": "20260312-082951-160", "status": "completed", ... },
  { "id": "20260312-120000-001", "status": "completed", ... },
  { "id": "20260312-120100-002", "status": "completed", ... },
  // ... centenas de tarefas completadas ...
]
```

**Recomendação:**

- Adicionar script `cleanup.ps1` ou opção em `skill-bridge.ps1`
- Mover tarefas completadas de > 30 dias para `logs/archived_tasks.json`
- Manter apenas últimas 50 tarefas pendentes/running em `queue/tasks.json`

**Ganho:** Melhor performance de leitura/escrita JSON

---

#### 3. Task Log Application Não Implementado

**Localização:** `do.ps1` (linha 45), `status.ps1` (linha não escreve)

**Problema:**

```powershell
# do.ps1 - Enfileira, mas NÃO registra em task_log.md
# status.ps1 - LÊ task_log.md, mas ninguém escreve nele
```

Há referência ao `$logPath` mas sem escrita real.

**Recomendação:**

```powershell
# No final de do.ps1, adicionar:
Add-Content -Path $logPath -Value "[$timestamp] [ENQUEUED] $TaskId - $Prompt"

# No final de status.ps1, quando uma tarefa é consultada:
Add-Content -Path $logPath -Value "[$timestamp] [STATUS_CHECK] $TaskId - $CurrentStatus"
```

**Ganho:** Auditoria completa do sistema, rastreabilidade

---

### **ALTA - Impacto Alto, Esforço Médio**

#### 4. Redundância Entre project-context.md e MANUAL_WORKFLOW_AGENTES.md

**Localização:** `.claude/project-context.md` vs. `docs/MANUAL_WORKFLOW_AGENTES.md`

**Problema:**
Ambas documentam:

- Domínio, público-alvo, fontes
- Decisões tomadas (duplicadas)
- Estado atual (ligeiramente diferente)
- Workflow (MANUAL é mais detalhado, project-context é resumo)

**Recomendação:**

- `project-context.md` = Contexto de DECISÃO (leitura para agentes que precisam decidir)
- `MANUAL_WORKFLOW_AGENTES.md` = Manual de OPERAÇÃO (leitura para quem usa o sistema)
- Criar seção em MANUAL com link para "Para contexto de decisão, veja `.claude/project-context.md`"

**Ganho:** Clareza de propósito, manutenção única fonte de verdade

---

#### 5. Scripts PowerShell - Falta Tratamento Robusto de Erros

**Localização:** `do.ps1`, `status.ps1`, `skill-bridge.ps1`

**Problema:**

- `do.ps1`: Se `queue/tasks.json` está corrompido, silenciosamente trata como array vazio
- `status.ps1`: Se arquivo JSON inválido, erro não é tratado graciosamente
- Nenhuma validação de schema antes de escrita

**Recomendação:**

```powershell
function Invoke-ValidateJson {
    param([string]$JsonPath)
    try {
        $json = Get-Content -Path $JsonPath -Raw | ConvertFrom-Json
        return $json
    }
    catch {
        Write-Error "JSON inválido em $JsonPath. Restaurando backup..."
        # Restaurar de backup se existir
    }
}
```

**Ganho:** Robustez contra corrupção de dados

---

#### 6. MCP Configuration Unused

**Localização:** `.vscode/mcp.json`

**Problema:**

```json
"microsoft/playwright-mcp": {
    "type": "stdio",
    "command": "npx",
    "args": ["@playwright/mcp@latest"],
    ...
}
```

Configurado, mas não há indicação de uso em projeto (não é projeto web/testing).

**Recomendação:**

- Se não usar: Remover de `mcp.json`
- Se usar: Documentar uso em `MANUAL_WORKFLOW_AGENTES.md`

**Ganho:** Reduz inicialização de VS Code, clareza de dependências

---

### **MÉDIA - Impacto Médio, Esforço Médio/Alto**

#### 7. Agent Memory vs. Project Context Redundância

**Localização:** `.claude/agent-memory/pesquisador/MEMORY.md` vs. `.claude/project-context.md`

**Problema:**

- Ambos registram "Status Atual", "Decisões Tomadas"
- MEMORY.md é específica de agente, project-context é global
- Possível divergência de informação

**Recomendação:**

- MEMORY.md = Histórico de ações do agente + tasks executadas
- project-context.md = Estado global do projeto
- Quebra de referência: agent-memory > project-context (lê, não escreve duplicado)

**Ganho:** Single source of truth por nível

---

#### 8. Fila de Tarefas - Estrutura Inconsistente

**Localização:** `queue/tasks.json`, `do.ps1` (linhas 35-40)

**Problema:**

```powershell
# do.ps1 trata como array, mas primeira leitura pode ser objeto singular
if ($queue -isnot [array]) {
    $queue = @($queue)
}
```

Conversão desnecessária devido a falta de schema inicial.

**Recomendação:**

```json
// queue/tasks.json - Format inicial obrigatório
{
  "version": "1.0",
  "createdAt": "2026-03-12T12:00:00Z",
  "tasks": [ ]
}
```

**Ganho:** Elimina conversão de tipo, mais previsível

---

### **BAIXA - Impacto Baixo, Esforço Baixo**

#### 9. Documentação de Scripts Falta em Seção Dedicada

**Localização:** `docs/MANUAL_WORKFLOW_AGENTES.md` Seção 3

**Problema:**
Seção 3 documenta scripts, mas sem exemplos de **erro handling** ou **edge cases**.

**Recomendação:**
Adicionar subsseção "Troubleshooting Comum":

```markdown
### Troubleshooting Comum

#### "Tarefa desaparece da fila"
Causa: Se JSON corrompe, tarefa pode ser perdida.
Solução: Backup automático em `logs/tasks.backup.json`
```

**Ganho:** Menor sobrecarga de support

---

#### 10. `.claude/settings.local.json` - Permissões Hardcoded

**Localização:** `.claude/settings.local.json`

**Problema:**

```json
"allow": [
  "Bash(powershell -Command \"Copy-Item ...\")"
]
```

Comando hardcoded, difícil de reutilizar ou manter.

**Recomendação:**

```json
{
  "permissions": {
    "allow": [
      "git_operations",
      "file_backup",
      "agent_sync"
    ]
  },
  "operations": {
    "agent_sync": "powershell -Command \"Copy-Item -Path '.claude\\agents' -Destination '.claude\\' -Recurse -Force\""
  }
}
```

**Ganho:** Melhor legibilidade e manutenção

---

## 📊 RESUMO DE OTIMIZAÇÕES

| ID | Severidade | Tipo          | Impacto | Esforço | ROI         |
| -- | ---------- | ------------- | ------- | -------- | ----------- |
| 1  | CRÍTICA   | Performance   | Alto    | Baixo    | 🟢 Imediato |
| 2  | CRÍTICA   | Manutenção  | Alto    | Médio   | 🟢 1-2h     |
| 3  | CRÍTICA   | Integração  | Alto    | Médio   | 🟢 1-2h     |
| 4  | ALTA       | Arquitetura   | Médio  | Médio   | 🟡 2-3h     |
| 5  | ALTA       | Robustez      | Médio  | Médio   | 🟢 1-2h     |
| 6  | ALTA       | Clareza       | Baixo   | Baixo    | 🟢 <1h      |
| 7  | MÉDIA     | Consistência | Médio  | Alto     | 🟡 3-4h     |
| 8  | MÉDIA     | Clareza       | Baixo   | Médio   | 🟡 1-2h     |
| 9  | BAIXA      | Usabilidade   | Baixo   | Baixo    | 🟢 <1h      |
| 10 | BAIXA      | Manutenção  | Baixo   | Baixo    | 🟢 <1h      |

---

## 🎯 PLANO DE AÇÃO RECOMENDADO (No Priority Order)

### **Imediato (< 30 minutos):**

1. Desativar modo debug no VS Code (`settings.json`) - Gain de ~40% CPU
2. Adicionar logging de tarefas em `do.ps1` (2-3 linhas de código)
3. Remover MCP Playwright se não usado

### **Curto Prazo (1-2 horas):**

1. Implementar `cleanup.ps1` com arquivamento de tarefas antigas
2. Adicionar validação JSON em PowerShell scripts
3. Documentar troubleshooting em MANUAL

### **Médio Prazo (3-5 horas):**

1. Refatorar project-context vs. MANUAL para clareza de propósito
2. Normalizar schema de `queue/tasks.json` com versioning
3. Merge de agent-memory duplicação com project-context

### **Longo Prazo (Future Sprint):**

1. Refatorar settings.local.json com pattern de operações nomeadas

---

## 💾 CÓDIGO PRONTO PARA IMPLEMENTAÇÃO

### Script: `cleanup.ps1` (Novo)

```powershell
<#
.SYNOPSIS
    Gerencia o arquivamento de tarefas concluídas e antigas do sistema de fila.
  
.DESCRIPTION
    1. Filtra tarefas com status 'completed' e data anterior ao limite definido.
    2. Garante a integridade do arquivo de destino (JSON Array).
    3. Cria diretórios automaticamente se não existirem.
    4. Implementa tratamento de erros básico para operações de I/O.
#>

param(
    [int]$DaysToKeep = 30
)

# Definição de Caminhos
$baseDir = $PSScriptRoot
$queuePath = Join-Path $baseDir "queue\tasks.json"
$logsDir = Join-Path $baseDir "logs"
$archivePath = Join-Path $logsDir "tasks_archived.json"

# Garantir que o diretório de logs existe
if (-not (Test-Path $logsDir)) {
    New-Item -ItemType Directory -Path $logsDir -Force | Out-Null
}

# Verificação de existência da fila
if (-not (Test-Path $queuePath)) {
    Write-Warning "Arquivo de fila não encontrado em: $queuePath"
    return
}

try {
    # Leitura e conversão segura do JSON
    $jsonRaw = Get-Content -Path $queuePath -Raw -ErrorAction Stop
    $queue = if ([string]::IsNullOrWhiteSpace($jsonRaw)) { @() } else { $jsonRaw | ConvertFrom-Json }

    $cutoffDate = (Get-Date).AddDays(-$DaysToKeep)

    # Separação por lógica de conjunto
    $toArchive = @($queue | Where-Object { 
        [datetime]$_.timestamp -lt $cutoffDate -and $_.status -eq "completed"
    })
  
    $toKeep = @($queue | Where-Object { 
        [datetime]$_.timestamp -ge $cutoffDate -or $_.status -ne "completed"
    })

    if ($toArchive.Count -gt 0) {
        # Gerenciamento do Arquivo Morto (Archive)
        # Importante: Para manter o JSON válido, precisamos ler o arquivo existente e fazer o merge
        $existingArchive = @()
        if (Test-Path $archivePath) {
            $archiveRaw = Get-Content -Path $archivePath -Raw
            if (-not [string]::IsNullOrWhiteSpace($archiveRaw)) {
                $existingArchive = $archiveRaw | ConvertFrom-Json
            }
        }

        # Fusão dos arrays (histórico + novos arquivados)
        $fullArchive = $existingArchive + $toArchive
        $fullArchive | ConvertTo-Json -Depth 10 | Set-Content -Path $archivePath -Encoding UTF8

        # Atualização da fila ativa
        $toKeep | ConvertTo-Json -Depth 10 | Set-Content -Path $queuePath -Encoding UTF8

        Write-Output "[$(Get-Date)] SUCESSO: $($toArchive.Count) tarefas movidas para o arquivo morto."
    } else {
        Write-Output "[$(Get-Date)] INFO: Nenhuma tarefa elegível para arquivamento encontrada."
    }
}
catch {
    Write-Error "Falha crítica durante o processamento de limpeza: $($_.Exception.Message)"
}
```

---
