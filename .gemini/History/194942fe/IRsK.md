# Hierarquia de Instruções - Autoridade e Escopo

> Documento estabelecendo fonte de verdade para personas, principles, policies
> Versão: 1.0 | Data: 2026-03-12 | Autoridade: Pesquisador (consolidação de arquitetura)

---

## Estrutura de Hierarquia

```
┌─────────────────────────────────────────────┐
│ CAMADA 1: USER-LEVEL (Raphael)             │
│ Arquivo: CLAUDE.md                          │
│ Escopo: Identidade pessoal, preferências    │
│ Autoridade: MÁXIMA (quer dizer, vale sempre)│
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│ CAMADA 2: PROJECT-LEVEL (Sistema)           │
│ Arquivo: GLOBAL_INSTRUCTIONS.md             │
│ Escopo: Regras operacionais do projeto      │
│ Autoridade: ALTA (padrão para projeto)      │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│ CAMADA 3: AGENT-SPECIFIC (Tarefa)           │
│ Arquivo: .claude/agents/<agente>.md         │
│ Escopo: Comportamento específico do agente  │
│ Autoridade: MÉDIA (se não conflitar com 2)  │
└─────────────────────────────────────────────┘
```

---

## Detalhamento de Cada Camada

### CAMADA 1: `.claude/CLAUDE.md` (USER-LEVEL)

**Propósito:** Definição completa de Raphael Vitoi como agente.

**Conteúdo Obrigatório:**
- Identidade e contexto pessoal
- Orientação fundamental ("tudo é sobre o outro")
- Idioma preferido (português pt-BR)
- Padrão epistemológico (anti-enviesamento, honestidade intelectual)
- Tom esperado (didático, sério, honesto)
- Domínios de expertise

**Autoridade:**
- Nunca sobrescrita por documentação de projeto
- Quando há conflito com GLOBAL_INSTRUCTIONS.md, CLAUDE.md vence
- Exemplos de resposta podem ser sobrescritos por GLOBAL_INSTRUCTIONS.md, MAS identidade/padrão epistemológico jamais

**Atualização:**
- Apenas por Raphael explicitamente
- Sugestões de agentes documentadas em `.claude/agent-memory/<agente>/MEMORY.md`

---

### CAMADA 2: `GLOBAL_INSTRUCTIONS.md` (PROJECT-LEVEL)

**Propósito:** Regras operacionais deste projeto específico (Site com documentação, cursos, análises).

**Conteúdo Obrigatório:**
- Persona do agente (GitHub Copilot, modo pesquisador, etc)
- Princípios técnicos (6 regras de operação)
- Padrão epistemológico simplificado (referência a CLAUDE.md)
- Workflows operacionais (quando usar cada agente, fila de tarefas, scripts)
- Convencões de projeto (português, sem em-dash, backups)
- Referência clara para hierarchies de документos

**Autoridade:**
- Padrão para TODO trabalho neste projeto se não sobrescrito por CLAUDE.md
- Quando agente-specificInstructions conflitam, GLOBAL_INSTRUCTIONS.md vence (exceto se conflita com CLAUDE.md)
- Define comportamento padrão de todos os agentes neste projeto

**Atualização:**
- Por @pesquisador ou pesquisador em modo pesquisador
- Mudanças documentadas em [.auditoria/][Versão do arquivo]
- Validação por @organizador

---

### CAMADA 3: `.claude/agents/<agente>.md` (AGENT-SPECIFIC)

**Propósito:** Instruções específicas de comportamento de CADA agente (dispatcher, implementor, auditor, etc).

**Conteúdo Típico:**
- Acionadores (quando este agente é chamado)
- Fluxo de trabalho detalhado (fases, steps)
- Outputs esperados
- Handoff para próximo agente
- Onde salvar memory/histórico

**Autoridade:**
- NUNCA sobrescreve GLOBAL_INSTRUCTIONS.md ou CLAUDE.md
- Define variações específicas DENTRO das regras das camadas 1 e 2
- Se um agente tem instrução conflitante com GLOBAL_INSTRUCTIONS.md, a instrução do agente é ignorada

**Atualização:**
- Quando novo agente é criado ou agente muda de escopo
- Documentado no handoff log do project-context.md

---

## Regras de Conflito

**Cenário 1: Identidade/Padrão Epistemológico**
```
CLAUDE.md diz: "Sempre honestidade intelectual acima de agradar usuário"
GLOBAL_INSTRUCTIONS.md diz: "Valide emocionalmente o usuário primeiro"

Resultado: CLAUDE.md vence. Honestidade é não-negociável.
```

**Cenário 2: Procedimento Operacional**
```
GLOBAL_INSTRUCTIONS.md diz: "Tarefas grandes vão para @planner"
agents/pesquisador.md diz: "Pesquisador faz planejamento de domínio"

Resultado: Ambos não conflitam - pesquisador faz pesquisa, DEPOIS vai para planner.
```

**Cenário 3: Conflito Genuíno**
```
CLAUDE.md diz: "Português obrigatório, sem exceção"
agents/securitychief.md diz: "Outputs de scan podem estar em JSON sem tradução"

Resultado: CLAUDE.md vence. JSON é artefato técnico, comentários/mensagens em português.
```

---

## Implementação Prática

### Para Agentes (ao ler instruções)

1. Leia `.claude/CLAUDE.md` PRIMEIRO - estabelece limite absoluto
2. Leia `GLOBAL_INSTRUCTIONS.md` SEGUNDO - seu contexto operacional
3. Leia `.claude/agents/<seu-nome>.md` TERCEIRO - sua tarefa específica
4. Se houver dúvida sobre prioridade, siga ordem: 1 > 2 > 3

### Para Atualizações de Documentação

| Se trocar | Notificar | Validar com | Atualizar |
|-----------|-----------|-------------|-----------|
| CLAUDE.md | Todos | Raphael | Manualmente |
| GLOBAL_INSTRUCTIONS.md | @organizador | Ninguém | @pesquisador ou modo pesquisador |
| agents/<agente>.md | Agente específico | Ninguém | Quem criou o agente |

---

## Status Atual (2026-03-12)

### ✅ Implementado

- CLAUDE.md: Persona, padrão epistemológico, tom definido
- GLOBAL_INSTRUCTIONS.md: Regras do projeto, workflows, convencões
- agents/*.md: 10 agentes com instruções específicas

### 🟡 Pendente

- [ ] Verificar que GLOBAL_INSTRUCTIONS.md não duplica CLAUDE.md (RC-2)
- [ ] Garantir que agents/*.md não conflitam com camadas 1-2
- [ ] Documentar esta hierarquia em onboarding de novo agente

### 📋 Próxima Ação

Rodar @organizador para health check global e validar que hierarquia está sendo respeitada em toda documentação.

---

## Exemplos de Aplicação

### Exemplo 1: Novo Agente Criado

Você cria `agents/novagente.md`. Deve:
- Respeitar padrão epistemológico de CLAUDE.md
- Respeitar workflows de GLOBAL_INSTRUCTIONS.md
- Definir APENAS comportamento específico que não está nas camadas 1-2

### Exemplo 2: Conflito Encontrado

Você descobre que agents/pesquisador.md diz "Crie MEMORY.md para cada descoberta" mas GLOBAL_INSTRUCTIONS.md diz "MEMORY.md apenas para ações confirmadas".

Ação: GLOBAL_INSTRUCTIONS.md vence. Atualizar agents/pesquisador.md.

### Exemplo 3: Mudança de Ton

Raphael atualiza CLAUDE.md para "Mais sardônico, menos didático".

Ação: GLOBAL_INSTRUCTIONS.md herda essa mudança. agents/*.md avaliam se requerem update. Documentar em handoff log.

---

**Autoridade de Documento:**
Criado por @pesquisador em modo consolidação (2026-03-12).
Próxima revisão: Após first @organizador health check.
