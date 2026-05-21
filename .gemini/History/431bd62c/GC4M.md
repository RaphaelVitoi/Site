# Política de Agent Memory (MEMORY.md)

> Versão: 1.0 | Data: 2026-03-12 | Autoridade: Pesquisador (consolidação)

---

## Objetivo

Evitar arquivos vazios ou low-value e garantir que agent MEMORY.md contenha histórico legítimo de AÇÕES REALIZADAS do agente.

---

## Regra Principal

**MEMORY.md é criado APENAS QUANDO:**

1. O agente foi **acionado e trabalhou em uma tarefa real** no projeto
2. O agente tem **no mínimo um histórico de ações concretas** para documentar:
   - Problemas encontrados e como foram resolvidos
   - Padrões observados (convenções do projeto, armadilhas comuns)  
   - Decisões técnicas tomadas
   - Erros cometidos antes e aprendizado

**MEMORY.md NÃO é criado:**

- Antecipadamente "para quando o agente começar a trabalhar"
- Com apenas estrutura/template vazio
- Como placeholder

---

## Estrutura de MEMORY.md (Quando Criado)

O arquivo deve conter (organizado em seções):

### Seção 1: Ações Realizadas Neste Projeto (Obrigatório)

```
## Ações Realizadas

- [Data]: [Agente] [O que fez] - [Resultado ou aprendizado]
```

Exemplos:

```
## Ações Realizadas

### 2026-03-12: Consolidação de Redundâncias
- Removeu ~600 linhas de duplicação entre MANUAL_WORKFLOW_AGENTES.md e project-context.md
- Descoberta: Documentação em 2 layers conflitava (decisões vs operação)
- Resultado: MANUAL refatorada para focar operação; decisions centralizado em project-context.md

### 2026-03-10: Auditoria de Sistema
- Identificou 4 redundâncias críticas, 5 elementos sem função
- Descoberta: task_log.md nunca foi alimentado, queue/tasks.json era source of truth real
- Resultado: Deletado task_log.md, scripts atualizados para usar v1.0 schema
```

### Seção 2: Padrões & Convenções Observados (Opcional)

```
## Padrões Observados neste Projeto

- Português obrigatório em TUDO
- Sem em-dash (--)
- Backups em `.backups/YYYY-MM-DD_<slug>/`
- Workflow: pesquisador -> prompter -> planner -> auditor -> implementor -> verifier -> validador
```

### Seção 3: Armadilhas & Erros (Opcional)

```
## Erros Comuns Encontrados

- [Descrição do erro] - Como foi resolvido? / Como evitar?
```

### Seção 4: Referências (Opcional)

```
## Referências

- [`GLOBAL_INSTRUCTIONS.md`](GLOBAL_INSTRUCTIONS.md) - Regras do projeto
- [`.claude/project-context.md`](.claude/project-context.md) - Contexto compartilhado
- [`.claude/INSTRUCTION_HIERARCHY.md`](.claude/INSTRUCTION_HIERARCHY.md) - Hierarquia de docs
```

---

## Exemplos de MEMORY.md Válidos (Status Atual)

### ✅ auditor/MEMORY.md

```
# Auditor Memory

## Erros Comuns do @planner
1. Conceitos não verificados atribuidos como "originais"
2. Dados numéricos prescritos sem verificação contra fonte
3. Placeholders em exemplos concretos
4. Listas de conceitos inconsistentes entre seções
5. Inconsistência de Identidade/Modelo do Agente
```

**Por quê é válido:** Documentação de padrões de erro ENCONTRADOS ao auditar tarefas.

### ✅ pesquisador/MEMORY.md

```
# Memoria do Pesquisador

> HIERARQUIA CLARA: Esta memoria = Historico de ACOES do agente...

## Decisoes de Infraestrutura
- Projeto utiliza Workflow v5...

## Histórico de Implementações (2026-03-12 - Fase de Otimizações)
- CRÍTICAS - Implementadas: [lista]
- ALTAS - Implementadas: [lista]
```

**Por quê é válido:** Ações concretas executadas e descobertas.

---

## Exemplos de MEMORY.md Inválidos (Não Criar)

### ❌ Arquivo vazio ou apenas estrutura

```
# Implementor Memory

## Sessions
## Findings
## Patterns
```

→ NUNCA criar assim. Só criar quando houver conteúdo real.

### ❌ Duplicação com project-context.md

```
# Prompter Memory

## Decisões Globais
- Workflow é assíncrono com fila
- Python é linguagem oficial
- Stack é ...
```

→ Isso é DECISÃO GLOBAL, não AÇÃO do agente. Pertence a project-context.md, não MEMORY.md.

### ❌ Template antecipado

```
# Validator Memory

[será preenchido quando validator trabalhar]
```

→ Nunca faça isso. Arquivo não existe se não houver conteúdo.

---

## Gestão de Arquivos Existentes

| Arquivo | Status | Ação |
|---------|--------|------|
| auditor/MEMORY.md | ✅ Válido | Manter, continuar adicionando ações |
| pesquisador/MEMORY.md | ✅ Válido | Manter, continuar adicionando ações |
| planner/MEMORY.md | ✅ Válido | Manter, continuar adicionando ações |
| implementor/MEMORY.md | ❌ Não existe | ✓ Correto (criar apenas quando trabalhar) |
| prompter/MEMORY.md | ❌ Não existe | ✓ Correto |
| dispatcher/MEMORY.md | ❌ Não existe | ✓ Correto |
| auditor/MEMORY.md | ✅ Existe e válido | ✓ Correto |
| validador/MEMORY.md | ❌ Não existe | ✓ Correto |
| verifier/MEMORY.md | ❌ Não existe | ✓ Correto |
| securitychief/MEMORY.md | ❌ Não existe | ✓ Correto |
| organizador/MEMORY.md | ❌ Não existe | ✓ Correto |

**Resultado:** Sistema está bem organizado. Os 3 MEMORY.md que existem contêm histórico real.

---

## Convalidação de Referências Cruzadas

Agentes devem sempre referenciar em MEMORY.md:

- [x] GLOBAL_INSTRUCTIONS.md existirá
- [x] .claude/project-context.md existirá (criado por pesquisador em first task)
- [x] .claude/INSTRUCTION_HIERARCHY.md existirá (criado 2026-03-12)
- [x] .claude/agents/<agente>.md existirá para cada agente

**Não devem referenciar:**

- ❌ `.claude/GLOBAL_INSTRUCTIONS.md` (não existe, duplicado em root)
- ❌ `logs/task_log.md` (não existe, deletado 2026-03-12)
- ❌ Archivos no `.backups/` como se fossem source of truth

---

## Próximas Ações (Recomendadas)

- [x] Criar INSTRUCTION_HIERARCHY.md (2026-03-12) ✅
- [ ] Adicionar referência a INSTRUCTION_HIERARCHY.md em cada agents/<agente>.md
- [ ] Rodar @organizador para validar referências cruzadas após implementação
- [ ] No próximo agente que começar, criar MEMORY.md com primeira ação

---

**Responsabilidade:**
Cada agente respeita esta política ao criar/atualizar seu MEMORY.md.
Pesquisador valida conformidade em auditorias posteriores.
