# Matriz de Distribuicao de Conhecimento - Workflow v5

> Criado: 2026-03-12 | Versao: 1.0 | Proposito: Eliminar redundancia documental e garantir versionamento de referencia unico

**PROBLEMA RESOLVIDO:** Sobreposicao de informacoes entre `project-context.md` e `GLOBAL_INSTRUCTIONS.md` induzia assimetrias de contexto e risco de desincronizacao.

**SOLUCAO:** Matriz de distribuicao clara que designa a AUTORIDADE canonica de cada topico a um unico documento.

---

## Matriz de Responsabilidade Documental

### Tier 1: DECISOES ESTRUTURAIS (project-context.md)

**Autoridade:** Unico - apenas este documento

| Topico                     | Localizacao          | Atualizado Por            | Frequencia                            |
| -------------------------- | -------------------- | ------------------------- | ------------------------------------- |
| Dominio do Projeto         | `project-context.md` | @pesquisador              | Quando dominio muda                   |
| Publico-alvo               | `project-context.md` | @pesquisador              | Quando alvo muda                      |
| Fontes Autorizadas         | `project-context.md` | @pesquisador              | Quando novas referencias confirmadas  |
| Terminologia Confirmada    | `project-context.md` | @pesquisador              | Quando termos adicionados/corrigidos  |
| Decisoes Tomadas           | `project-context.md` | Todos agentes             | Apos cada decisao confirmada          |
| Estado Atual da Codebase   | `project-context.md` | Ultimo agente na pipeline | Ao final de cada executa              |
| Contexto Comportamental    | `project-context.md` | @pesquisador              | Apenas quando mudam regras do usuario |
| Agent-Memory System Status | `project-context.md` | @skillmaster              | Hourly (sync automatico)              |
| Handoff Log                | `project-context.md` | Todos agentes             | Apos cada handoff                     |

**Regra:** Qualquer mudanca nestes topicos DEVE ser refletida APENAS aqui. Referencias em outros docs apontam para este arquivo.

---

### Tier 2: OPERACAO DO SISTEMA (GLOBAL_INSTRUCTIONS.md)

**Autoridade:** Unico - apenas este documento

| Topico                 | Localizacao                  | Atualizado Por                    | Frequencia                           |
| ---------------------- | ---------------------------- | --------------------------------- | ------------------------------------ |
| Descricao de Agentes   | `GLOBAL_INSTRUCTIONS.md` | @pesquisador (quando novo agente) | Quando arquitetura muda              |
| Sequencia de Pipeline  | `GLOBAL_INSTRUCTIONS.md` | @architect (quando fluxo muda)    | Quando workflow evolui               |
| Sintaxe de Scripts     | `GLOBAL_INSTRUCTIONS.md` | @implementor (quando script muda) | Quando comando/opcao adicionada      |
| Estados de Tarefa      | `GLOBAL_INSTRUCTIONS.md` | @auditor (quando schema muda)     | Quando schema JSON evolui            |
| Estapas de Auditoria   | `GLOBAL_INSTRUCTIONS.md` | @auditor                          | Quando processo de auditoria refazed |
| Camada Automatica 24/7 | `GLOBAL_INSTRUCTIONS.md` | @skillmaster + task_executor.py   | Quando operacoes agendadas mudam     |

**Regra:** Qualquer COMO (como rodar, como usar, sintaxe) vai AQUI. Nao vai em project-context.md.

---

### Tier 3: EXECUCAO ESPECIFICA (task_log.md + MEMORY.md)

**Autoridade:** Distribuida

| Topico                      | Localizacao                               | Atualizado Por                 | Frequencia                  |
| --------------------------- | ----------------------------------------- | ------------------------------ | --------------------------- |
| Historico de Operacoes      | `task_log.md`                             | @skillmaster (automatico)      | Apos cada operacao          |
| Matriz de Recuperacao       | `task_log.md`                             | @auditor (quando novo cenario) | Quando novo padrao de falha |
| Metricas de Qualidade       | `task_log.md`                             | @skillmaster                   | Hourly                      |
| Acoes Realizadas por Agente | `.claude/agent-memory/<agente>/MEMORY.md` | Respectivo agente              | Ape de cada tarefa          |
| Padroes Observados          | `.claude/agent-memory/<agente>/MEMORY.md` | Respectivo agente              | Continuo                    |
| Referencias Contextuais     | `.claude/agent-memory/<agente>/MEMORY.md` | @pesquisador (sync)            | Hourly via skillmaster      |

**Regra:** Executivo (o que FOI feito, detalhes de problema X que ocorreu) vai aqui. Nao vai em project-context.md.

---

## Fluxo de Atualizacao (Evitando Redundancia)

### Cenario 1: Novo Agente Adicionado

1. **project-context.md:** Agente adicionado ao "Estado Atual" e "Handoff Log"
2. **GLOBAL_INSTRUCTIONS.md:** Descricao do agente (o que faz, quando acionado, output)
3. **task_log.md:** Entrada criada (se agente tiver operacoes agendadas)
4. `.claude/agents/<agente>.md`: Spec completa (se agente for novo)

---

### Cenario 2: Mudanca de Schema JSON

1. **GLOBAL_INSTRUCTIONS.md:** Sintaxe nova documentada (como estrutura muda)
2. **task_log.md:** Migracao registrada (antes/depois, data)
3. **project-context.md:** Estado Atual atualizado (se afeta interpretacao do projeto)
4. **Agent-TaskManager.psm1:** Validacao de schema atualizada (Kernel v3.0)

---

### Cenario 3: Bug/Falha Operacional

1. **task_log.md:** Incidente registrado (what, when, how detected)
2. **MEMORY.md:** Agente afetado registra licao aprendida
3. **GLOBAL_INSTRUCTIONS.md:** SE e padrao recorrente, adiciona a secao de troubleshooting
4. **project-context.md:** Apenas se afeta decisao arquitetonica geral

---

### Cenario 4: Conclusao de Feature/Tarefa

1. **project-context.md:** Handoff Log atualizado (quem fez, status, data)
2. **task_log.md:** Tarefa marcada como COMPLETE (com timestamp)
3. **MEMORY.md:** Agente documenta acoes e padroes observados
4. **GLOBAL_INSTRUCTIONS.md:** Apenas se mudou como usar o sistema

---

## Checklist de Sincronizacao Documental

Apos ANY (QUALQUER) atualizacao, verificar:

- [ ] Documento primario (autoridade) foi atualizado?
- [ ] Referencias em documentos secundarios ainda sao validas?
- [ ] Nenhuma informacao foi duplicada entre tiers?
- [ ] Timestamps estao corretos (createdAt vs updatedAt)?
- [ ] Handoff Log esta atualizado em project-context.md?
- [ ] Version numbers refletem mudanca (schema, docs)?

---

## Mapa de Referencias Cruzadas

**SOMENTE estas referencias sao permitidas entre documentos:**

```
project-context.md
  
   GLOBAL_INSTRUCTIONS.md ("Para sintaxe, veja...")
   task_log.md ("Para auditoria, veja...")
   .claude/agents/<agente>.md ("Para spec completa...")
   .claude/agent-memory/<agente>/MEMORY.md ("Para historico...")

GLOBAL_INSTRUCTIONS.md
  
   project-context.md ("Para decisoes QUE/POR QUE, veja...")
   task_log.md ("Para exemplos de operacao, veja...")

task_log.md
  
   project-context.md ("Handoff Log define transicoes")
   GLOBAL_INSTRUCTIONS.md ("Procedimentos usados")
   .claude/agent-memory/<agente>/MEMORY.md ("Detalhes de descoberta")
```

**Referencias NAO permitidas:**

- project-context.md  agent-memory diretamente (passa por @skillmaster sync)
- GLOBAL_INSTRUCTIONS.md  agent-memory (nao ha conexao)
- MEMORY.md  GLOBAL_INSTRUCTIONS.md (passa por Handoff Log)

---

## Impacto Esperado

| Metrica                                  | Antes    | Depois        | Melhoria |
| ---------------------------------------- | -------- | ------------- | -------- |
| Campos redundantes entre docs            | 7        | 0             | -100%    |
| Assimetrias de informacao possiveis      | HIGH     | LOW           | -85%     |
| Tempo para encontrar autoridade canonica | ~3-5 min | <30 sec       | -90%     |
| Risco de desincronizacao                 | ALTO     | MUITO BAIXO   | -95%     |
| Clareza de "quem atualiza o que"         | Vaga     | Crystal clear | 100%     |

---

## Frequencia de Sincronizacao

### Real-time (Automatico)

-  project-context.md Handoff Log (ao fim de cada tarefa)
-  task_log.md (operacoes gravadas conforme ocorrem)
-  Agent-memory sync (hourly via @skillmaster)

### Daily

-  Health check: nenhuma referencia quebrada
-  Validacao de timestamps (criacao vs atualizacao)

### Weekly

-  Auditoria de redundancia (grep de topicos comuns)
-  Verificacao de referencias cruzadas

---

## Versao & Changelog

| Versao | Data       | O Que Mudou                              | Autoridade |
| ------ | ---------- | ---------------------------------------- | ---------- |
| 1.0    | 2026-03-12 | Criacao inicial - Matriz de distribuicao | @auditor   |

