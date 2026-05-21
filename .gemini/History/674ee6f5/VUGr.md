# Matriz de Distribuição de Conhecimento - Workflow v5

> Criado: 2026-03-12 | Versão: 1.0 | Propósito: Eliminar redundância documental e garantir versionamento de referência único

**PROBLEMA RESOLVIDO:** Sobreposição de informações entre `project-context.md` e `GLOBAL_INSTRUCTIONS.md` induzia assimetrias de contexto e risco de desincronização.

**SOLUÇÃO:** Matriz de distribuição clara que designa a AUTORIDADE canônica de cada tópico a um único documento.

---

## Matriz de Responsabilidade Documental

### Tier 1: DECISÕES ESTRUTURAIS (project-context.md)

**Autoridade:** Exclusiva do @organizador

| Tópico                     | Localização          | Atualizado Por | Frequência                            |
| -------------------------- | -------------------- | -------------- | ------------------------------------- |
| Domínio do Projeto         | `project-context.md` | @organizador   | Quando domínio muda                   |
| Público-alvo               | `project-context.md` | @organizador   | Quando alvo muda                      |
| Fontes Autorizadas         | `project-context.md` | @organizador   | Quando novas referências confirmadas  |
| Terminologia Confirmada    | `project-context.md` | @organizador   | Quando termos adicionados/corrigidos  |
| Decisões Tomadas           | `project-context.md` | @organizador   | Através de rotinas de sincronia       |
| Estado Atual da Codebase   | `project-context.md` | @organizador   | Através de rotinas de sincronia       |
| Contexto Comportamental    | `project-context.md` | @organizador   | Apenas quando mudam regras do usuario |
| Agent-Memory System Status | `project-context.md` | @organizador   | Sync consolidado                      |
| Handoff Log                | `project-context.md` | @organizador   | Através de rotinas de sincronia       |

**Regra:** Responsabilidade DIFUSA anula responsabilidade. A edição direta do `project-context.md` é VETADA a qualquer outro agente. Se outro agente precisar atualizar o contexto, DEVE delegar a informação ao `@organizador`.

---

### Tier 2: OPERAÇÃO DO SISTEMA (GLOBAL_INSTRUCTIONS.md)

**Autoridade:** Único - apenas este documento

| Tópico                 | Localização              | Atualizado Por                    | Frequência                           |
| ---------------------- | ------------------------ | --------------------------------- | ------------------------------------ |
| Descrição de Agentes   | `GLOBAL_INSTRUCTIONS.md` | @pesquisador (quando novo agente) | Quando arquitetura muda              |
| Sequência de Pipeline  | `GLOBAL_INSTRUCTIONS.md` | @planner (quando fluxo muda)      | Quando workflow evolui               |
| Sintaxe de Scripts     | `GLOBAL_INSTRUCTIONS.md` | @implementor (quando script muda) | Quando comando/opção adicionada      |
| Estados de Tarefa      | `GLOBAL_INSTRUCTIONS.md` | @auditor (quando schema muda)     | Quando schema JSON evolui            |
| Estapas de Auditoria   | `GLOBAL_INSTRUCTIONS.md` | @auditor                          | Quando processo de auditoria refazed |
| Camada Automática 24/7 | `GLOBAL_INSTRUCTIONS.md` | @skillmaster + @sequenciador      | Quando operações agendadas mudam     |

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

1. **project-context.md:** @organizador é acionado para adicionar o agente ao "Estado Atual"
2. **GLOBAL_INSTRUCTIONS.md:** Descrição do agente (o quê faz, quando acionado, output)
3. **task_log.md:** Entrada criada (se agente tiver operações agendadas)
4. `.claude/agents/<agente>.md`: Spec completa (se agente for novo)

---

### Cenário 2: Mudança de Schema JSON

1. **GLOBAL_INSTRUCTIONS.md:** Sintaxe nova documentada (como estrutura muda)
2. **task_log.md:** Migração registrada (antes/depois, data)
3. **project-context.md:** @organizador atualiza o Estado Atual (se afeta arquitetura)
4. **Agent-TaskManager.psm1:** Validacao de schema atualizada (Kernel v3.0)

---

### Cenário 3: Bug/Falha Operacional

1. **task_log.md:** Incidente registrado (what, when, how detected)
2. **MEMORY.md:** Agente afetado registra lição aprendida
3. **GLOBAL_INSTRUCTIONS.md:** SE é padrão recorrente, adiciona à seção de troubleshooting
4. **project-context.md:** @organizador é acionado apenas se afeta decisão arquitetônica geral

---

### Cenário 4: Conclusão de Feature/Tarefa

1. **project-context.md:** Delega-se a atualização de estado ao @organizador periodicamente
2. **task_log.md:** Tarefa marcada como COMPLETE (com timestamp)
3. **MEMORY.md:** Agente documenta ações e padrões observados
4. **GLOBAL_INSTRUCTIONS.md:** Apenas se mudou como usar o sistema

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
  └─→ GLOBAL_INSTRUCTIONS.md ("Para sintaxe, veja...")
  └─→ task_log.md ("Para auditoria, veja...")
  └─→ .claude/agents/<agente>.md ("Para spec completa...")
  └─→ .claude/agent-memory/<agente>/MEMORY.md ("Para histórico...")

GLOBAL_INSTRUCTIONS.md
  ↓
  └─→ project-context.md ("Para decisões QUÊ/POR QUÊ, veja...")
  └─→ task_log.md ("Para exemplos de operação, veja...")

task_log.md
  ↓
  └─→ project-context.md ("Handoff Log define transições")
  └─→ GLOBAL_INSTRUCTIONS.md ("Procedimentos usados")
  └─→ .claude/agent-memory/<agente>/MEMORY.md ("Detalhes de descoberta")
```

**Referências NÃO permitidas:**

- project-context.md → agent-memory diretamente (passa por @skillmaster sync)
- GLOBAL_INSTRUCTIONS.md → agent-memory (não há conexão)
- MEMORY.md → GLOBAL_INSTRUCTIONS.md (passa por Handoff Log)

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
