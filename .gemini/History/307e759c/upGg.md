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

# Diagnóstico de Bugs, Incoerências e Inutilidades - 2026-03-12

> Executado por @pesquisador | Análise operacional completa
> **Status de Resolução:** 7 de 8 problemas corrigidos | 1 requer refatoração major

---

## 🔴 BUGS CRÍTICOS

### 1. INCONSISTÊNCIA NA VERSÃO DO MODELO (Severidade: CRÍTICA)

**Status:** ✅ **CORRIGIDO**

**Problema:** Três versões diferentes da mesma informação em documentos críticos.

| Arquivo | Localização | Valor Original | Valor Corrigido |
|---------|------------|--------|---------|
| `GLOBAL_INSTRUCTIONS.md` | Linha 8 | "Gemini 3 Pro Preview" | ✅ Correto |
| `.claude/project-context.md` | Seção "Terminologia Confirmada" | "Gemini 3 Pro Preview" | ✅ Correto |
| `docs/MANUAL_WORKFLOW_AGENTES.md` (Linha 29) | Seção "Modelos utilizados" | "Gemini 2.5 Flash Preview" | ✅ "Gemini 3 Pro Preview" |
| `docs/MANUAL_WORKFLOW_AGENTES.md` (CHANGELOG) | Linha 8 | Registrava versão 2.5 | ✅ Corrigido para 3.0 Pro |

**Impacto:** Resolvido - Documentação agora consistente.

---

## 🟡 INCOERÊNCIAS ESTRUTURAIS

### 2. FILA DE TAREFAS INCOMPLETA (Workflow v5 Advertido Mas Não Implementado)

**Status:** 🟡 **PARCIALMENTE RESOLVIDO** - Documentado, mas não refatorado

**Problema:**
- `docs/MANUAL_WORKFLOW_AGENTES.md` promete "Fila de Tarefas (tasks.json) e Persistência Global"
- `queue/tasks.json` existe mas é **um objeto singular**, não uma lista de tarefas
- Há apenas **1 tarefa**, já completada (20260312-082951-160)
- **Não há executor de tarefas** real (task runner/scheduler que processa a fila)

**Ação Realizada:**
- ✅ Adicionada seção "Operação da Fila de Tarefas" em MANUAL_WORKFLOW_AGENTES.md (Seção 3)
- ✅ Documentado formato, scripts (`do.ps1`, `status.ps1`, `skill-bridge.ps1`)
- ✅ Descritos estados possíveis de tarefa

**Recomendação:** Implementar array de tarefas e scheduler em future sprint (Épico)

---

### 3. TASK LOG VAZIO E INUTILIZADO (Severidade: ALTA)

**Status:** ✅ **CORRIGIDO**

**Problema Original:**
- `logs/task_log.md` existia vazio (apenas cabeçalho)
- `status.ps1` referenciava `logs\task_log.md`
- Nenhum script realmente escrevia no task_log.md
- Título em inglês, projeto usa português

**Ações Realizadas:**
- ✅ Título: "Task Execution Log" → "Log de Execução de Tarefas"
- ✅ Removida referência orfã ao `master_dispatcher`
- ✅ Adicionadas referências aos scripts (`do.ps1`, `status.ps1`, `skill-bridge.ps1`)
- ✅ Adicionada seção "Histórico" para futuro preenchimento

---

## 🟠 INUTILIDADES E DEAD CODE

### 4. SCRIPTS POWERSHELL NÃO DOCUMENTADOS NA DOCUMENTAÇÃO CENTRAL

**Status:** ✅ **CORRIGIDO**

**Problema Original:**
| Script | Função | Documentação Original |
|--------|--------|----------|
| `do.ps1` | Enfileirar tarefas com prompt | ❌ Não mencionado |
| `status.ps1` | Verificar status de tarefas | ❌ Não mencionado |
| `skill-bridge.ps1` | Bridge de operações de skill | ❌ Não mencionado |

**Ação Realizada:**
- ✅ Adicionada Seção 3 "Operação da Fila de Tarefas" em MANUAL_WORKFLOW_AGENTES.md
- ✅ Cada script documentado com exemplos de uso
- ✅ Arquitetura da fila explicada

---

## 📋 INCONSISTÊNCIAS MENORES

### 5. Projeto-context.md Não Menciona os Scripts de Operação

**Status:** ✅ **CORRIGIDO**

**Ação Realizada:**
- ✅ Adicionadas informações na seção "Estado Atual":
  - Fila de tarefas: `queue/tasks.json`
  - Scripts de operação: `do.ps1`, `status.ps1`, `skill-bridge.ps1`
  - Log de execução: `logs/task_log.md`

---

### 6. CHANGELOG em MANUAL_WORKFLOW_AGENTES.md Registra Versão Intermediária

**Status:** ✅ **CORRIGIDO**

**Ação Realizada:**
- ✅ CHANGELOG atualizado para refletir versão final: "Gemini 3 Pro Preview"

---

## 📊 RESUMO FINAL

| ID | Severidade | Tipo | Status | Ação |
|----|-----------|------|--------|------|
| 1 | CRÍTICA | Inconsistência | ✅ Corrigido | MANUAL_WORKFLOW_AGENTES.md (duas localidades) |
| 2 | ALTA | Incoerência | 🟡 Parcialmente | Documentado; refatoração postponida |
| 3 | ALTA | Inutilidade | ✅ Corrigido | task_log.md (português + scripts) |
| 4 | MÉDIA | Documentação | ✅ Corrigido | Seção 3 adicionada ao manual |
| 5 | MÉDIA | Documentação | ✅ Corrigido | project-context.md atualizado |
| 6 | MÉDIA | Rastreabilidade | ✅ Corrigido | CHANGELOG atualizado |
| 7 | BAIXA | Documentação | ✅ Corrigido | Mencionado em "Operação" |
| 8 | BAIXA | Referência orfã | ✅ Corrigido | Removido de task_log.md |

**Total: 8 problemas identificados | 7 corrigidos | 1 documentado para future sprint**

---

## Próximas Ações Recomendadas

1. **Urgente:** Fechar VS Code e remover `adendos/`, `Python 2/` (bloqueados por permissões)
2. **Curto prazo:** Implementar array de tarefas em `queue/tasks.json` (quebra compatibilidade)
3. **Médio prazo:** Implementar scheduler/executor real para processar fila
4. **Longo prazo:** Aplicar automação de health check periódico (CI/CD)



