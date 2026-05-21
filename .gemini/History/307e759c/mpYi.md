# Diagnóstico de Bugs, Incoerências e Inutilidades - 2026-03-12

> Executado por @pesquisador | Análise operacional completa

---

## 🔴 BUGS CRÍTICOS

### 1. INCONSISTÊNCIA NA VERSÃO DO MODELO (Severidade: CRÍTICA)

**Problema:** Três versões diferentes da mesma informação em documentos críticos.

| Arquivo | Localização | Valor | Status |
|---------|------------|--------|--------|
| `GLOBAL_INSTRUCTIONS.md` | Linha 8 | "Gemini 3 Pro Preview" | ✅ CORRETO |
| `.claude/project-context.md` | Seção "Terminologia Confirmada" | "Gemini 3 Pro Preview" | ✅ CORRETO |
| `docs/MANUAL_WORKFLOW_AGENTES.md` | Linha 29 | "Gemini 2.5 Flash Preview" | ❌ DESATUALIZADO |
| `docs/MANUAL_WORKFLOW_AGENTES.md` | CHANGELOG linha 8 | Corrigido para "Gemini 2.5 Flash Preview" | ❌ DESATUALIZADO |

**Impacto:** O CHANGELOG registra uma correção que não é a versão final. A documentação do manual não reflete a decisão atual.

**Recomendação:** Atualizar MANUAL_WORKFLOW_AGENTES.md para "Gemini 3 Pro Preview" em AMBAS as localidades.

---

### 2. TASK LOG INUTILIZADO, MAS REFERENCIADO

**Problema:** 
- `logs/task_log.md` existe e está vazio (apenas cabeçalho)
- `status.ps1` **referencia** `logs\task_log.md` como lugar de escrita
- Nenhum script realmente escreve no task_log.md
- A fila de tarefas está em `queue/tasks.json` (estrutura singular, não lista)

**Localização:**
```powershell
# status.ps1, linha ~12
$logPath = Join-Path $PSScriptRoot "logs\task_log.md"
```

**Impacto:** Expectativa de logging que não funciona. O sistema espera uma estrutura de log que não é alimentada.

**Recomendação:** Remover referência ou implementar logging real.

---

## 🟡 INCOERÊNCIAS ESTRUTURAIS

### 3. FILA DE TAREFAS INCOMPLETA (Workflow v5 Advertido Mas Não Implementado)

**Problema:**
- `docs/MANUAL_WORKFLOW_AGENTES.md` promete "Fila de Tarefas (tasks.json) e Persistência Global"
- `queue/tasks.json` existe mas é **um objeto singular**, não uma lista de tarefas
- Há apenas **1 tarefa**, já completada (20260312-082951-160)
- **Não há executor de tarefas** (task runner/scheduler que processa a fila)

**Estrutura Atual:**
```json
{
    "id": "20260312-082951-160",
    "prompt": "analise a sua propria estrutura atual.",
    "status": "completed",
    "timestamp": "2026-03-12T08:29:51.1908654-03:00"
}
```

**Problemas:**
- Formato é um objeto único, não um array
- Sem scheduler ou executor de fila
- `@skillmaster` e `@sequenciador` não têm funções reais definidas

**Recomendação:** Definir se tasks.json deve ser array ou objeto; implementar executor ou remover promessa de "fila" no manual.

---

### 4. SCRIPTS PowerShell Não Documentados na Documentação Central

**Scripts que existem e funcionam:**

| Script | Função | Documentação |
|--------|--------|-------------|
| `do.ps1` | Enfileirar tarefas com prompt | ❌ Não mencionado em MANUAL_WORKFLOW_AGENTES.md |
| `status.ps1` | Verificar status de tarefas | ❌ Não mencionado |
| `skill-bridge.ps1` | Bridge de operações de skill | ❌ Não mencionado |

**Impacto:** Usuário leitor do MANUAL_WORKFLOW_AGENTES.md não sabe como usar a fila de tarefas.

**Recomendação:** Adicionar seção "Operação da Fila de Tarefas" no manual com exemplos de uso dos scripts.

---

## 🟠 INUTILIDADES E DEAD CODE

### 5. Task Log Vazio e Sem Propósito

**Arquivo:** `logs/task_log.md`

**Conteúdo:**
```markdown
# Task Execution Log
 
This log tracks the execution of tasks by the master_dispatcher.

---

```

**Problemas:**
- Vazio desde a criação
- Nunca é alimentado
- `status.ps1` referencia ele mas nunca escreve
- Título em inglês, projeto usa português

**Recomendação:** Remover arquivo ou implementar logging real com timestamp e resultado de execução.

---

### 6. Referência ao "master_dispatcher" em task_log.md

**Localização:** `logs/task_log.md`, linha 2

```markdown
This log tracks the execution of tasks by the master_dispatcher.
```

**Problema:** 
- `master_dispatcher.py` foi **removido** na limpeza anterior (2026-03-12)
- Referência orfã em documento

**Recomendação:** Atualizar descrição ou remover arquivo.

---

## 📋 INCONSISTÊNCIAS MENORES

### 7. Projeto-context.md Não Menciona os Scripts de Operação

**Arquivo:** `.claude/project-context.md`

**Faltam:**
- Instrução de como enfileirar tarefas (`do.ps1`)
- Status de scripts de operação (`status.ps1`)
- Referência a `skill-bridge.ps1`

**Recomendação:** Adicionar seção "Operação" ou "DevOps" ao project-context.md.

---

### 8. CHANGELOG em MANUAL_WORKFLOW_AGENTES.md Registra Versão Incorreta

**Problema:** O CHANGELOG diz que foi corrigido para versão X, mas foi depois corrigido para versão Y.

| Versão | Timestamp | Status |
|--------|-----------|--------|
| Gemini 2.5 Flash (registrado no CHANGELOG) | 2026-03-12 | Intermediária |
| Gemini 3 Pro Preview (versão final) | 2026-03-12T~12:00 | ATUAL |

**Impacto:** Rastreabilidade comprometida. Leitor pensa que a versão final é 2.5.

---

## 📊 RESUMO DE PROBLEMAS

| ID | Severidade | Tipo | Status |
|----|-----------|------|--------|
| 1 | CRÍTICA | Inconsistência | Requer correção imediata |
| 2 | ALTA | Inutilidade | Dead code/referência orfã |
| 3 | ALTA | Incoerência | Promessa vs implementação |
| 4 | MÉDIA | Documentação | Faltam instruções |
| 5 | MÉDIA | Inutilidade | Arquivo vazio |
| 6 | MÉDIA | Referência orfã | Aponta a código removido |
| 7 | BAIXA | Documentação | Falta contextualização |
| 8 | BAIXA | Rastreabilidade | CHANGELOG desatualizado |

**Total: 8 problemas (1 crítico, 3 altos, 2 médios, 2 baixos)**

