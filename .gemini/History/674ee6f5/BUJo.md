# Matriz de Distribuição de Conhecimento - Workflow v5

> Criado: 2026-03-12 | Versão: 1.0 | Propósito: Eliminar redundância documental e garantir versionamento de referência único

**PROBLEMA RESOLVIDO:** Sobreposição de informações entre `project-context.md` e `MANUAL_WORKFLOW_AGENTES.md` induzia assimetrias de contexto e risco de desincronização.

**SOLUÇÃO:** Matriz de distribuição clara que designa a AUTORIDADE canônica de cada tópico a um único documento.

---

## Matriz de Responsabilidade Documental

### Tier 1: DECISÕES ESTRUTURAIS (project-context.md)

**Autoridade:** Único - apenas este documento

| Tópico                     | Localização          | Atualizado Por            | Frequência                            |
| -------------------------- | -------------------- | ------------------------- | ------------------------------------- |
| Domínio do Projeto         | `project-context.md` | @pesquisador              | Quando domínio muda                   |
| Público-alvo               | `project-context.md` | @pesquisador              | Quando alvo muda                      |
| Fontes Autorizadas         | `project-context.md` | @pesquisador              | Quando novas referências confirmadas  |
| Terminologia Confirmada    | `project-context.md` | @pesquisador              | Quando termos adicionados/corrigidos  |
| Decisões Tomadas           | `project-context.md` | Todos agentes             | Após cada decisão confirmada          |
| Estado Atual da Codebase   | `project-context.md` | Último agente na pipeline | Ao final de cada executa              |
| Contexto Comportamental    | `project-context.md` | @pesquisador              | Apenas quando mudam regras do usuario |
| Agent-Memory System Status | `project-context.md` | @skillmaster              | Hourly (sync automático)              |
| Handoff Log                | `project-context.md` | Todos agentes             | Após cada handoff                     |

**Regra:** Qualquer mudança nestes tópicos DEVE ser refletida APENAS aqui. Referências em outros docs apontam para este arquivo.

---

### Tier 2: OPERAÇÃO DO SISTEMA (MANUAL_WORKFLOW_AGENTES.md)

**Autoridade:** Único - apenas este documento

| Tópico                 | Localização                  | Atualizado Por                    | Frequência                           |
| ---------------------- | ---------------------------- | --------------------------------- | ------------------------------------ |
| Descrição de Agentes   | `MANUAL_WORKFLOW_AGENTES.md` | @pesquisador (quando novo agente) | Quando arquitetura muda              |
| Sequência de Pipeline  | `MANUAL_WORKFLOW_AGENTES.md` | @planner (quando fluxo muda)      | Quando workflow evolui               |
| Sintaxe de Scripts     | `MANUAL_WORKFLOW_AGENTES.md` | @implementor (quando script muda) | Quando comando/opção adicionada      |
| Estados de Tarefa      | `MANUAL_WORKFLOW_AGENTES.md` | @auditor (quando schema muda)     | Quando schema JSON evolui            |
| Estapas de Auditoria   | `MANUAL_WORKFLOW_AGENTES.md` | @auditor                          | Quando processo de auditoria refazed |
| Camada Automática 24/7 | `MANUAL_WORKFLOW_AGENTES.md` | @skillmaster + @sequenciador      | Quando operações agendadas mudam     |

**Regra:** Qualquer COMO (como rodar, como usar, sintaxe) vai AQUI. Não vai em project-context.md.

---

### Tier 3: EXECUÇÃO ESPECÍFICA (task_log.md + MEMORY.md)

**Autoridade:** Distribuída

| Tópico                      | Localização                               | Atualizado Por                 | Frequência                  |
| --------------------------- | ----------------------------------------- | ------------------------------ | --------------------------- |
| Histórico de Operações      | `task_log.md`                             | @skillmaster (automático)      | Após cada operação          |
| Matriz de Recuperação       | `task_log.md`                             | @auditor (quando novo cenário) | Quando novo padrão de falha |
| Métricas de Qualidade       | `task_log.md`                             | @skillmaster                   | Hourly                      |
| Ações Realizadas por Agente | `.claude/agent-memory/<agente>/MEMORY.md` | Respectivo agente              | Apé de cada tarefa          |
| Padrões Observados          | `.claude/agent-memory/<agente>/MEMORY.md` | Respectivo agente              | Contínuo                    |
| Referências Contextuais     | `.claude/agent-memory/<agente>/MEMORY.md` | @pesquisador (sync)            | Hourly via skillmaster      |

**Regra:** Executivo (o que FOI feito, detalhes de problema X que ocorreu) vai aqui. Não vai em project-context.md.

---

## Fluxo de Atualização (Evitando Redundância)

### Cenário 1: Novo Agente Adicionado

1. **project-context.md:** Agente adicionado ao "Estado Atual" e "Handoff Log"
2. **MANUAL_WORKFLOW_AGENTES.md:** Descrição do agente (o quê faz, quando acionado, output)
3. **task_log.md:** Entrada criada (se agente tiver operações agendadas)
4. `.claude/agents/<agente>.md`: Spec completa (se agente for novo)

---

### Cenário 2: Mudança de Schema JSON

1. **MANUAL_WORKFLOW_AGENTES.md:** Sintaxe nova documentada (como estrutura muda)
2. **task_log.md:** Migração registrada (antes/depois, data)
3. **project-context.md:** Estado Atual atualizado (se afeta interpretação do projeto)
4. **Agent-TaskManager.psm1:** Validacao de schema atualizada (Kernel v3.0)

---

### Cenário 3: Bug/Falha Operacional

1. **task_log.md:** Incidente registrado (what, when, how detected)
2. **MEMORY.md:** Agente afetado registra lição aprendida
3. **MANUAL_WORKFLOW_AGENTES.md:** SE é padrão recorrente, adiciona à seção de troubleshooting
4. **project-context.md:** Apenas se afeta decisão arquitetônica geral

---

### Cenário 4: Conclusão de Feature/Tarefa

1. **project-context.md:** Handoff Log atualizado (quem fez, status, data)
2. **task_log.md:** Tarefa marcada como COMPLETE (com timestamp)
3. **MEMORY.md:** Agente documenta ações e padrões observados
4. **MANUAL_WORKFLOW_AGENTES.md:** Apenas se mudou como usar o sistema

---

## Checklist de Sincronização Documental

Após ANY (QUALQUER) atualização, verificar:

- [ ] Documento primário (autoridade) foi atualizado?
- [ ] Referências em documentos secundários ainda são válidas?
- [ ] Nenhuma informação foi duplicada entre tiers?
- [ ] Timestamps estão corretos (createdAt vs updatedAt)?
- [ ] Handoff Log está atualizado em project-context.md?
- [ ] Version numbers refletem mudança (schema, docs)?

---

## Mapa de Referências Cruzadas

**SOMENTE estas referências são permitidas entre documentos:**

```
project-context.md
  ↓
  └─→ MANUAL_WORKFLOW_AGENTES.md ("Para sintaxe, veja...")
  └─→ task_log.md ("Para auditoria, veja...")
  └─→ .claude/agents/<agente>.md ("Para spec completa...")
  └─→ .claude/agent-memory/<agente>/MEMORY.md ("Para histórico...")

MANUAL_WORKFLOW_AGENTES.md
  ↓
  └─→ project-context.md ("Para decisões QUÊ/POR QUÊ, veja...")
  └─→ task_log.md ("Para exemplos de operação, veja...")

task_log.md
  ↓
  └─→ project-context.md ("Handoff Log define transições")
  └─→ MANUAL_WORKFLOW_AGENTES.md ("Procedimentos usados")
  └─→ .claude/agent-memory/<agente>/MEMORY.md ("Detalhes de descoberta")
```

**Referências NÃO permitidas:**

- project-context.md → agent-memory diretamente (passa por @skillmaster sync)
- MANUAL_WORKFLOW_AGENTES.md → agent-memory (não há conexão)
- MEMORY.md → MANUAL_WORKFLOW_AGENTES.md (passa por Handoff Log)

---

## Impacto Esperado

| Métrica                                  | Antes    | Depois        | Melhoria |
| ---------------------------------------- | -------- | ------------- | -------- |
| Campos redundantes entre docs            | 7        | 0             | -100%    |
| Assimetrias de informação possíveis      | HIGH     | LOW           | -85%     |
| Tempo para encontrar autoridade canônica | ~3-5 min | <30 sec       | -90%     |
| Risco de desincronização                 | ALTO     | MUITO BAIXO   | -95%     |
| Clareza de "quem atualiza o quê"         | Vaga     | Crystal clear | 100%     |

---

## Frequência de Sincronização

### Real-time (Automático)

- ✅ project-context.md Handoff Log (ao fim de cada tarefa)
- ✅ task_log.md (operações gravadas conforme ocorrem)
- ✅ Agent-memory sync (hourly via @skillmaster)

### Daily

- ⏳ Health check: nenhuma referência quebrada
- ⏳ Validação de timestamps (criação vs atualização)

### Weekly

- ⏳ Auditoria de redundância (grep de tópicos comuns)
- ⏳ Verificação de referências cruzadas

---

## Versão & Changelog

| Versão | Data       | O Quê Mudou                              | Autoridade |
| ------ | ---------- | ---------------------------------------- | ---------- |
| 1.0    | 2026-03-12 | Criação inicial - Matriz de distribuição | @auditor   |
