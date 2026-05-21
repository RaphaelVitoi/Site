# Manual do Sistema de Agentes - Workflow Completo

> Versao: v5.1 (Organism) | Data: 2026-03-12
> Foco: Operacao e Uso do Sistema

---

## 📖 Qual Documento Usar?

| Documento                                               | Propósito                                                                                         | Público                     | Quando Ler                                               |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ---------------------------- | -------------------------------------------------------- |
| **`.claude/project-context.md`**                | Contexto de DECISÃO global (domínio, público-alvo, decisões tomadas, estado atual)             | Agentes durante execução   | Antes de tomar decisões ou criar features               |
| **`MANUAL_WORKFLOW_AGENTES.md`** (este arquivo) | Manual de OPERAÇÃO e referência técnica (como usar o sistema, descrição de agentes, scripts) | Desenvolvedores e operadores | Para entender como rodar o workflow e scripts do sistema |

**Resumo:**

- projeto-context.md = "O QUÊ foi decidido e POR QUÊ"
- MANUAL = "COMO usar e operar o sistema"

---

## CHANGELOG DE AUDITORIA

**Auditado por @auditor** | **Data: 2026-03-12**

| # | Severidade | Localizacao                                                | Problema Encontrado                                                                       | Correcao Aplicada                                                                                                                             |
| - | ---------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 | CRITICO    | `GLOBAL_INSTRUCTIONS.md`, `MANUAL_WORKFLOW_AGENTES.md` | Inconsistência na identidade do agente ("Chico" vs "GitHub Copilot") e versão do modelo | Atualizados `GLOBAL_INSTRUCTIONS.md` e `MANUAL_WORKFLOW_AGENTES.md` para "GitHub Copilot" e "Gemini 3 Pro Preview" (modelo prioritário). |

**Total: 1 problema (1 crítico, 0 altos, 0 médios, 0 baixos, 0 info)**
**Todos os problemas resolvidos.**

---

## 1. Contexto Compartilhado: project-context.md

**Princípio Fractal:** O `project-context.md` não é apenas um quadro de avisos; é o DNA ativo do projeto.

Mecanismo central de comunicacao entre agentes. Schema padrao definido pelo @pesquisador:

> **Para visão arquitetônica completa dos 12 agentes e pipeline, consulte `.claude/project-context.md`**
>
> Este manual documenta COMO USAR o sistema. Para entender QUÊ foi decidido sobre o sistema, leia project-context.md.

```markdown
# Contexto do Projeto
> Atualizado por [@agente] em YYYY-MM-DD

## Dominio
## Publico-alvo
## Fontes Autorizadas
## Terminologia Confirmada
## Decisoes Tomadas
## Estado Atual
```

**Regras:**

- O @pesquisador cria o arquivo quando a primeira decisao e confirmada
- Cada agente atualiza apenas as secoes relevantes ao seu trabalho
- Secoes vazias sao omitidas ate que haja conteudo
- Todos os agentes leem o arquivo ao iniciar (se existir)

---

## 2. Operacao da Fila de Tarefas (Workflow v5)

O Workflow v5 permite enfileirar multiplas tarefas e processar sequencialmente, liberando o usuario para outras atividades.

### Scripts de Operacao

**`do.ps1` - Enfileirar uma tarefa**

```powershell
.\do.ps1 "Sua descricao de tarefa aqui"
```

Exemplo:

```powershell
.\do.ps1 "Pesquisar sobre ICM em torneios KO"
```

Saída: ID da tarefa criada (formato: YYYYMMDD-HHMMSS-NNN)

---

**`status.ps1` - Verificar status da fila**

```powershell
.\status.ps1
# Mostra resumo de todas as tarefas

.\status.ps1 "20260312-082951-160"
# Mostra detalhes de uma tarefa específica
```

---

**`skill-bridge.ps1` - Bridge de operacoes de habilidades**

```powershell
.\skill-bridge.ps1 -Skill "do" -Payload "descricao"
# Executa operacoes via bridge (uso interno)
```

---

### Arquitetura da Fila

- **Arquivo principal:** `queue/tasks.json`
- **Formato:** Tarefas em JSON com schema v1.0 (version, metadata, timestamp, tasks array)

**Estados de tarefa:**

- `pending` - Aguardando processamento
- `running` - Em processo
- `completed` - Concluída com sucesso
- `failed` - Falhou na execucao

---

## 3. Workflow Detalhado - Descricao de Agentes

### Estrutura Geral

O pipeline de agentes segue esta sequencia (nem sempre todos sao necessarios):

```
[dispatcher] -> [pesquisador] -> [prompter] -> [planner] -> [auditor] -> [implementor] -> [verifier] -> [validador] -> [organizador]
  (opcional)     (opcional)       (core)        (core)       (core)        (core)         (core)         (opcional)     (opcional)
```

**Saiba quando usar cada agente consultando [.claude/project-context.md](./.claude/project-context.md) no seu projeto.**

---

### FASE 0: Dispatcher (opcional)

**Acionado quando:** Usuario tem MULTIPLAS ideias/tarefas e precisa priorizar.

**O que faz:**

- Organiza ideias em pipelines numeradas
- Detecta dependencias e conflitos
- Gera arquivo `pipelines.md` com prompts prontos

**Output:** `pipelines.md` com lista de pipelines acionaveis

**Proxima fase:** Cada pipeline comeca com seu agente inicial (geralmente @pesquisador ou @prompter)

---

### FASE 1: Pesquisador (opcional - Phase 0 para dominio especializado)

**Acionado quando:** Tarefa envolve pesquisa de dominio, bibliotecas, padroes, ou decisoes especializadas.

**O que faz:**

1. Pesquisa em web, documentacao, fontes autorizadas
2. Compara opcoes/abordagens
3. Estima esforco e complexidade
4. Identifica audiencia/contexto
5. Cria ou atualiza `.claude/project-context.md` com decisoes confirmadas

**Output esperado:**

- Resumo estruturado de achados com URLs
- Recomendacoes com pros/contras
- project-context.md preenchido (schema: dominio, publico-alvo, fontes, terminologia, decisoes)

**Proxima fase:** @prompter (se houver detalher escopo) ou @planner (se pesquisa foi suficiente)

---

### FASE 2: Prompter (core)

**Acionado quando:** Usuario tem ideia vaga/meia-bocada que precisa ser refinada em prompt estruturado.

**O que faz:**

1. Le project-context.md (se existir)
2. Faz perguntas para refinar escopo/restricoes/criterios de sucesso
3. Le documentacao existente (README, docs existentes)
4. Sintetiza em prompt estruturado

**Output:**

- Prompt estruturado descrevendo: O QUE o usuario quer, POR QUE, COMPORTAMENTO esperado, RESTRICOES, DOCUMENTACAO relevante, CRITERIOS de sucesso

**Proxima fase:** @planner

---

### FASE 3: Planner (core)

**O que faz:**

1. Le prompt do @prompter e project-context.md
2. Investiga projeto existente: arquitetura, stack, convencoes
3. Mapeia arquivos que serao tocados
4. Identifica componentes reutilizaveis
5. Escreve PRD e SPEC detalhados
6. Atualiza project-context.md (Estado Atual, Decisoes)

**Output:**

- `docs/tasks/PRD_tarefa.md` - Problema, resultado esperado, requisitos priorizados, riscos
- `docs/tasks/SPEC_tarefa.md` - Tecnicamente COMO implementar, passos numerados, testes, seguranca

**Proxima fase:** @auditor

---

### FASE 4: Auditor (core)

**Protocolo de Fortalecimento Mútuo:**
Ao encontrar erros, o @auditor não deve apenas corrigi-los, mas classificar a origem do erro para fortalecer o agente anterior.

*Exemplo:*

- Erro: "Caminho de arquivo inexistente na SPEC".
- Ação Imediata: Corrigir na SPEC.
- Ação Fractal: Adicionar nota de "Atenção: Validação de caminhos" no feedback para o @planner, evitando reincidência.

**O que faz:**

1. Le PRD e SPEC completamente
2. Verifica CADA arquivo/recurso referenciado - se existem
3. Verifica ordem de implementacao respeita dependencias
4. Auditoria de seguranca: XSS, inputs, autenticacao (conforme relevante)
5. Verifica duplicacoes (conteudo similar ja existe?)
6. Verifica que atualizacoes de documentacao estao listadas

**Output:**

- CHANGELOG DE AUDITORIA no topo da SPEC
- Correcoes aplicadas direto na SPEC
- Backup em `.backups/`

**Proxima fase:** @implementor (SPEC aprovada) ou retorna para @planner (correcoes criticas)

---

### FASE 5: Implementor (core)

**O que faz:**

1. Le PRD, SPEC auditorada e project-context.md
2. Segue a ordem de implementacao passo a passo:
   - Cria arquivos e estrutura
   - Escreve codigo/conteudo conforme SPEC
   - Integra com codigo existente
   - Atualiza documentacao
3. Regra dos 3: Se erro, tenta 3 abordagens. Se falha em todas, documenta.

**Output:**

- Codigo implementado conforme SPEC
- Relatorio de implementacao (arquivos criados/modificados, testes rodados)

**Proxima fase:** @verifier

---

### FASE 6: Verifier (core)

**O que faz:**

1. Le SPEC e compara com codigo real - CADA item
2. Marca: FEITO, PARCIAL, FALTANDO, DESVIADO
3. Verificacao de qualidade: nomenclatura, tratamento de erros, duplicacao de codigo
4. Verificacao de integracao: imports, links, navega funcionando
5. Para projetos educacionais: Valida se conteudo respeita o perfil de audiencia declarado em project-context.md
6. Corrige TODOS os problemas encontrados

**Output:**

- Relatorio de verificacao: APROVADO / APROVADO_COM_CORRECOES / BLOQUEADO

**Proxima fase:** @validador (se projeto tem conteudo de dominio especializado) ou fim

---

### FASE 7: Validador (opcional - para conteudo de dominio especializado)

**Acionado quando:** Projeto envolve medicina, direito, poker, financa, ou outro dominio especializado.

**O que faz:**

1. Valida CADA afirmacao factual
   - Formulas matematicas estao corretas? (Recalcula)
   - Dados factticos/estatisticos vem de fontes confiáveis?
   - Exemplos numericos batem? (Refaz contas do zero)
2. Para educacao especializada: valida calibracao pedagogica
   - Conceitos pressupoem conhecimento alem do publico-alvo declarado?
   - Progressao logica (simples -> complexo)?
   - Cada novo conceito ancora em algo ja explicado?
3. Corrige erros CRITICOS e ALTOS direto
4. Se correcoes significativas: gera prompt de re-verificacao para @verifier

**Output:**

- Relatorio de validacao com fontes citadas
- Checklist de calibracao pedagogica (se educacao especializada)

**Proxima fase:** @organizador (health check) ou fim

---

### FASE X: Maverick (O Catalisador)

**Acionado quando:**

1. **Interativo:** O usuário ou o projeto estão estagnados, presos em clichês, ou precisam de um parceiro de debate intelectualmente agressivo.
2. **Background (Modo Sentinela):** Quando não há tarefas imediatas, para monitoramento contínuo de inovação e antecipação de riscos.

**O que faz:**

1. **Devil's Advocate:** Ataca as premissas do PRD/SPEC para testar sua robustez antifrágil.
2. **Polímata:** Aplica conceitos de Biologia, Teoria dos Jogos ou Psicologia para resolver problemas de código/texto.
3. **Inovação:** Gera alternativas laterais que os agentes "técnicos" não veriam.
4. **Sentinela (Novo):** Monitora o todo e o individual em segundo plano, produzindo relatórios de antevisão e correção de rumo mesmo sem solicitação direta.

**Outputs:**

- Interativo: "Relatório de Disrupção" (conexões laterais e propostas).
- Background: "Relatório Sentinela" (diagnóstico sistêmico e antevisão).

**Exemplo de uso:**

> "Maverick, analise este PRD da aula de poker. Está muito padrão. Como aplicariamos conceitos de BDSM e Negociação de Reféns para tornar isso inesquecível?"
> "Maverick, assuma o posto de sentinela e avalie a saúde atual do nosso workflow."

**Handoff:**

- Ideia aprovada -> @prompter ou @planner.
- Tese validada -> Fim.

---

### FASE 8 (OPCIONAL): Organizador - Health Check

**Acionado quando:** Apos passagem longa ou quando coisas parecem desorganizadas.

**O que faz:**

- Verifica consistencia de TODA documentacao
- Corrige referencias cruzadas, numeracao, duplicacoes
- Verifica que nada ficou obsoleto

**Proxima fase:** Fim

---

### FASE 9 (OPCIONAL): Security Chief - Auditoria de Seguranca

**Acionado quando:** Projeto tem componentes sensíveis (autenticacao, pagamentos, upload de arquivo, inputs de usuario).

**O que faz:**

- Scan de vulnerabilidades: XSS, SQL injection, CSRF, etc.
- Verificacao de configuracoes de seguranca
- Scan de secrets hardcoded, credenciais vazadas

**Proxima fase:** Fim ou retorna para @implementor se problemas criticos

---

## 4. Camada Automática (24/7): Skillmaster & Sequenciador

### Visão Geral

Além do pipeline de agentes acionados manualmente pelo usuário (dispatcher → pesquisador → prompter → ... → organizador), o sistema possui uma **camada de automação contínua 24/7** que:

1. **@skillmaster:** Executa operações agendadas (backups, limpeza, sincronização)
2. **@sequenciador:** Orquestra fluxo inteligente de tarefas conforme nível de tráfego

Estes dois agentes rodam **sempre ativos**, sem necessidade de intervenção humana.

---

### SKILLMASTER - Executor Automático de Operações

**Status:** ✅ Ativo 24/7

**Propósito:** Executar operações agendadas definidas em `.claude/settings.local.json`

**Operações Monitoras:**

| Operação          | Schedule     | Descrição                           |
| ------------------- | ------------ | ------------------------------------- |
| `agent_sync`      | Hourly       | Sincroniza MEMORY.md entre agentes    |
| `backup_queue`    | 2 AM daily   | Cria snapshot de `queue/tasks.json` |
| `cleanup_archive` | Sundays 3 AM | Arquiva tarefas completadas > 30 dias |

**Como Funciona:**

1. Verifica `.claude/settings.local.json` a cada minuto
2. Compare hora atual com schedule de cada operação
3. Se match: executa comando associado
4. Registra status em `.claude/logs/skillmaster.log`

**Integração com Scripts:**

- `do.ps1` → enfileira tarefa
- `status.ps1` → consulta status
- `cleanup.ps1` → arquiva tarefas (executado automaticamente via skillmaster)
- `dashboard.ps1` → monitora saúde do sistema
- **skill-bridge.ps1** → comunica com skillmaster via settings.local.json

**Arquivo de Configuração:**

```json
{
  "agent_sync": {
    "schedule": "0 * * * *",
    "active": true
  },
  "backup_queue": {
    "schedule": "0 2 * * *",
    "active": true
  },
  "cleanup_archive": {
    "schedule": "0 3 * * 0",
    "active": true
  }
}
```

**Não requer handoff manual.** Estado persistente em `.claude/agent-memory/skillmaster/MEMORY.md`

---

### SEQUENCIADOR - Orquestrador Inteligente de Pipelines

**Status:** ✅ Ativo 24/7 - Pronto para HIGH LOAD desde o início

**Propósito:** Rotear tarefas pendentes para agentes apropriados com inteligência baseada em tráfego

**3 Modos de Operação:**

#### Modo 1: Tráfego Baixo (0-2 tarefas)

- Routing: **PASSTHROUGH** dia → agente apropriado imediatamente
- Exemple: `do.ps1 "Pesquisa ICM"` → dispara @pesquisador instantly
- SLA: < 1 segundo

#### Modo 2: Tráfego Médio (3-10 tarefas)

- Routing: **FIFO** (First In, First Out)
- Agentes processam sequencialmente com limite de paralelismo (max 2)
- SLA: 2-5 minutos por tarefa

#### Modo 3: Tráfego Alto (10+ tarefas)

- Routing: **PRIORIDADE + DEPENDÊNCIAS**
- Reordena automaticamente por:
  1. Prioridade declarada + age of task
  2. Dependências (tarefa A bloqueia tarefa B?)
  3. SLA crítico (urgentes primeiro)
- Paralelismo máximo: 4 streams simultâneos
- SLA: 5 min para PRIO 1, 15 min para PRIO 2, 30 min para PRIO 3

**Transição automática:**

```
[Usuário enfileira 1 tarefa]
   ↓ (detecta: 1 tarefa)
[MODO: PASSTHROUGH]
   ↓ (dispara @pesquisador imediatamente)

[Usuário enfileira 5 tarefas rapidamente]
   ↓ (detecta: 5 tarefas)
[MODO: FIFO - reordena para fila simples]
   ↓ (processa sequencialmente)

[Usuário enfileira 20 tarefas de uma vez]
   ↓ (detecta: 20 tarefas)
[MODO: ALTO - ordena inteligentemente]
   ↓ (cria 4 streams paralelos com prioridades)
```

**Algoritmo de Priorização (Modo Alto):**

```
score = (priority × 50) + (age_minutes × 0.33) + (blocks_count × 10)
if sla_remaining < 10 min: score += 100
sort by score DESC
```

**Integração com Pipeline:**

O sequenciador automaticamente mapeia uma tarefa para o agente correto:

- Domínio especializado + sem contexto = @pesquisador
- Ideia vaga = @prompter
- Precisa planejar = @planner
- Precisa auditar = @auditor
- Precisa implementar = @implementor
- Precisa verificar = @verifier
- Precisa validar domínio = @validador

**Não requer handoff manual.** Estado persistente em:

- `.claude/agent-memory/sequenciador/MEMORY.md` (histórico de decisões)
- `queue/tasks.json` (fila com prioridades computadas)

---

### Interação Skillmaster + Sequenciador

```
┌─────────────────────────────────────────┐
│ CAMADA AUTOMÁTICA (24/7)                │
├─────────────────────────────────────────┤
│                                         │
│  @skillmaster (executor)   @sequenciador│
│  ├─ Agent sync (hourly)    (orquestrator)
│  ├─ Backup (2 AM)          │
│  └─ Cleanup (Sun 3 AM)     │
│                            │
│  Monitora:                 Monitora:
│  ← settings.local.json     ← queue/tasks.json
│  → .claude/logs/           → MEMORY.md
│                            → Despache para agentes
│
└─────────────────────────────────────────┘
              ↓
        [PIPELINE AGENTES]
    dispatcher, pesquisador, prompter,
    planner, auditor, implementor, verifier,
    validador, organizador, securitychief
```

**Cenário: Usuário Enfileira 3 Tarefas em 10 segundos**

```
[T+0s]    do.ps1 "Tarefa 1: Pesquisar"
[T+2s]    do.ps1 "Tarefa 2: Refatorar"
[T+5s]    do.ps1 "Tarefa 3: Revisar"

[T+6s]    Sequenciador detecta: 3 tarefas
          ↓ (detecta: TRÁFEGO MÉDIO)
          ↓ Aplica FIFO
          ├─ @pesquisador inicia Tarefa 1
          └─ Aguarda conclusão antes Tarefa 2

[T+30m]   Tarefa 1 completada
          ↓ @pesquisador notifica sequenciador
          ├─ @prompter inicia Tarefa 2
          ├─ Skillmaster verifica: hora de sync? (SIM)
          │  └─ Sincroniza MEMORY.md
          └─ E assim continua...

[T+120m]  Sequenciador detecta: em breve passará para LOW (relaxa para passthrough)
```

---

## 5. Comparativo: v1 vs v2 vs v3

### v1 (Baseline - agentes sem otimizacoes)

**Pipeline:** dispatcher -> prompter -> planner -> auditor -> implementor -> verifier

**Problemas:**

1. **Sem Phase 0 de pesquisa:** O @planner teria que pesquisar ICM do zero, gastando contexto em algo que nao e seu papel
2. **Sem contexto compartilhado:** Cada agente investiga o projeto independentemente, repetindo trabalho
3. **Sem validacao de dominio:** O @verifier checa se a SPEC foi cumprida, mas ninguem verifica se as formulas de ICM estao corretas
4. **Sem calibracao pedagogica:** Ninguem garante que o conteudo esta adequado ao publico
5. **Sem feedback loop:** Se o @validador (que nao existia) encontrasse erro factual critico, nao havia mecanismo para re-verificar

**Resultado no projeto hipotetico:**

- Aula implementada conforme SPEC, mas formulas de ICM possivelmente com erros
- Exemplos numericos potencialmente incorretos (ninguem recalculou)
- Conteudo possivelmente avancado demais ou simplista demais para o publico
- Duplicacao de esforco investigativo entre agentes

### v2 (Agentes completos + pesquisador + validador)

**Pipeline:** dispatcher -> pesquisador -> prompter -> planner -> auditor -> implementor -> verifier -> validador

**Ganhos sobre v1:**

1. @pesquisador levanta contexto de dominio ANTES do pipeline
2. @validador verifica precisao factual APOS implementacao
3. project-context.md compartilha contexto entre agentes (mas sem schema padrao)
4. Handoffs claros entre cada agente
5. Agent memory para aprendizado entre sessoes

**Problemas remanescentes:**

1. project-context.md sem schema = cada agente escreve de forma diferente, informacao desorganizada
2. Sem calibracao pedagogica = conteudo factualmente correto mas possivelmente inadequado ao publico
3. Sem feedback loop = se validador corrige erro critico, ninguem re-verifica a integridade da SPEC
4. Verifier nao checa adequacao ao publico

### v3 (Versao atual - otimizacoes implementadas)

**Pipeline:** identico ao v2

**Ganhos sobre v2:**

| Otimizacao                            | Onde                                          | Ganho                                                  | Custo                                       |
| ------------------------------------- | --------------------------------------------- | ------------------------------------------------------ | ------------------------------------------- |
| Schema padrao para project-context.md | @pesquisador (define) + @planner (referencia) | Contexto estruturado e consistente entre agentes       | Zero - apenas organizacao                   |
| Calibracao pedagogica condicional     | @validador (Fase 2.5)                         | Valida adequacao ao publico em projetos educacionais   | Minimo - so ativa quando relevante          |
| Feedback loop validador->verifier     | @validador (Handoff)                          | Re-verificacao quando correcoes alteram conteudo       | Zero - prompt gerado, usuario decide se usa |
| Calibracao de audiencia no verifier   | @verifier (Fase 5)                            | Primeira camada de verificacao de adequacao ao publico | Minimo - 3 itens de checklist               |

### v5.1 (Organism - Fractal & Autopoiético)

**Evolução:** O sistema deixa de ser uma linha de montagem e torna-se um organismo.

- **Autopoiese:** Se `@implementor` falha, ele não apenas "trava". Ele diagnostica se a falha foi dele (execução) ou do `@planner` (instrução) e aciona o reparo no nível correto.
- **Memória Holográfica:** O sucesso de um projeto atualiza as heurísticas de todos os agentes via `skillmaster`.

---

## 6. Troubleshooting Comum

### Problemas com a Fila de Tarefas

#### "JSON da fila está corrompido - tarefa desapareceu"

**Sintomas:**

```
PS> .\status.ps1
[ERRO] Arquivo de fila JSON corrompido em 'queue/tasks.json'
```

**Causa possível:**

- Queda do sistema durante escrita em `queue/tasks.json`
- Codificação incorreta de caracteres especiais

**Solução:**

```powershell
# 1. Restaurar do backup automático (criado por do.ps1)
Copy-Item -Path "queue\tasks.json.backup" -Destination "queue\tasks.json" -Force

# 2. Verificar se o backup está válido
.\status.ps1

# 3. Se continuar falhando, resetar fila para vazio (APAGA DADOS!)
"[]" | Set-Content -Path "queue\tasks.json" -Encoding UTF8
```

#### "A tarefa foi enfileirada, mas não aparece na fila"

**Sintomas:**

```
PS> .\do.ps1 "Minha tarefa"
Tarefa enfileirada com sucesso. ID: 20260312-143000-456

PS> .\status.ps1
Status de todas as tarefas na fila (0 tarefas):
```

**Solução:**

1. Verificar permissões da pasta `queue/`:

   ```powershell
   Get-Acl "queue" | Format-List | Find "Allow"
   ```
2. Verificar se `queue/tasks.json` foi criado:

   ```powershell
   Test-Path "queue\tasks.json"
   ```
3. Verificar conteudo do arquivo criado:

   ```powershell
   Get-Content "queue\tasks.json" | ConvertFrom-Json
   ```

#### "A fila está crescendo muito (muitas tarefas completadas)"

**Sintomas:**

- `queue/tasks.json` tem centenas de tarefas
- `.\status.ps1` fica lento

**Solução:**

```powershell
# Arquivar tarefas completadas com mais de 30 dias
.\cleanup.ps1 -DaysToKeep 30

# Ou arquivar TODOS as tarefas completadas imediatamente
.\cleanup.ps1 -ArchiveAll

# Verificar resultado
.\status.ps1
Get-Content "logs\tasks_archived.json" | Measure-Object -Line
```

---

### Problemas com Agentes

#### "Agente saiu com erro, preciso reiniciar a tarefa"

**Procedimento:**

1. Verificar status atual:

   ```powershell
   .\status.ps1 "SEU_TASK_ID"
   ```
2. Atualizar status se necessário (editar manualmente):

   ```
   No arquivo queue/tasks.json, mudar "status": "running" para "status": "pending"
   ```
3. A tarefa será reprocessada no próximo ciclo

#### "Preciso pausar/cancelar uma tarefa pendente"

**Procedimento:**

1. Editar `queue/tasks.json` manualmente
2. Remover a entrada da tarefa ou mudar status para `cancelled`

---

### Problemas de Performance

#### "VS Code está lento depois da otimização"

**Verificação:**

```powershell
# Ver configurações atuais
Get-Content ".vscode\settings.json" | ConvertFrom-Json | Select-Object geminicodeassist* | Format-List
```

**Se `verboseLogging` foi reativado por engano:**

```powershell
# Restaurar configuração otimizada
# (via menu VS Code: File > Preferences > Settings, then search "geminicodeassist")
```

---

### Manutenção Mensal Recomendada

```powershell
# 1. Backup da fila (criar snapshot mensal)
Copy-Item -Path "queue\tasks.json" -Destination "queue\backup_$(Get-Date -Format 'yyyy-MM-dd').json"

# 2. Limpar tarefas antigas (>>30 dias)
.\cleanup.ps1 -DaysToKeep 30

# 3. Verificar integridade da fila
.\status.ps1 | Select-Object -First 5

# 4. Relatório rápido
Write-Output "=== RELATORIO MENSAL ===" ; `
Write-Output "Data: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" ; `
Write-Output "Tarefas ativas: $((Get-Content queue\tasks.json | ConvertFrom-Json | Where-Object { $_.status -ne 'completed' } | Measure-Object).Count)" ; `
Write-Output "Fila size: $(Get-ChildItem queue\tasks.json | Select-Object -ExpandProperty Length) bytes"
```

---

**Otimizacoes rejeitadas (curadoria):**

| Proposta                  | Por que rejeitada                                           | Alternativa adotada                               |
| ------------------------- | ----------------------------------------------------------- | ------------------------------------------------- |
| Agente @pedagogo separado | Overhead de +1 agente, +1 handoff, mais consumo de contexto | Absorvido como Fase 2.5 condicional no @validador |
| Biblioteca de templates   | Manutencao constante, rigidez prematura                     | agent-memory organica do @planner                 |

**Resultado no projeto hipotetico (v3):**

- @pesquisador levanta ICM, Risk Premium, fontes, terminologia, perfil do publico
- project-context.md preenchido com schema padrao (dominio, publico, fontes, terminologia)
- @planner usa contexto ja estruturado, poupa investigacao de dominio
- @implementor cria aula com base em SPEC detalhada
- @verifier checa completude E adequacao ao publico (calibracao de audiencia)
- @validador recalcula formulas, verifica exemplos, valida calibracao pedagogica
- Se validador corrige erro critico, gera prompt para re-verificacao pelo verifier

---

## 7. Metricas de Ganho Estimadas

| Dimensao                      | v1                                | v2                         | v3                                     |
| ----------------------------- | --------------------------------- | -------------------------- | -------------------------------------- |
| Precisao factual              | Baixa (sem validacao)             | Alta (validador)           | Alta (validador)                       |
| Adequacao ao publico          | Nenhuma                           | Nenhuma                    | Alta (2 camadas: verifier + validador) |
| Retrabalho entre agentes      | Alto (sem contexto compartilhado) | Medio (context sem schema) | Baixo (schema padrao)                  |
| Integridade pos-correcao      | Nenhuma                           | Nenhuma                    | Alta (feedback loop)                   |
| Complexidade do sistema       | 6 agentes                         | 10 agentes                 | 10 agentes (sem aumento)               |
| Risco de exaustao de contexto | Medio                             | Medio                      | Medio (otimizacoes condicionais)       |

---

### Regra 1: Handoff Log obrigatório no project-context.md

Cada agente DEVE registrar uma linha ao terminar sua tarefa na seção `## Handoff Log`:

```
## Handoff Log
| Agente | Status | Data | Notas |
|--------|--------|------|-------|
| @pesquisador | Concluido | 2026-03-07 | 5 fontes validadas |
| @prompter | Concluido | 2026-03-07 | Prompt confirmado pelo usuario |
```

**Ganho:** Rastreabilidade completa do pipeline. Qualquer agente sabe exatamente o que ja foi feito.

### Regra 2: Pre-flight check no @implementor

Antes de iniciar a implementacao, o @implementor verifica:

- [ ] project-context.md existe e foi lido
- [ ] SPEC tem CHANGELOG DE AUDITORIA (confirmando que @auditor passou)
- [ ] Backup existe no caminho esperado
- [ ] Nenhum arquivo da SPEC foi modificado apos a auditoria

### Regra 3: Consolidar relatorios em local unico

Todos os relatorios (implementacao, verificacao, validacao, auditoria) devem ser salvos em `docs/tasks/<slug>/` junto com PRD e SPEC.

### Regra 4: Memória Persistente (agent-memory)

Memórias de longo prazo de cada agente devem ser armazenadas em `.claude/agent-memory/<nome-do-agente>/MEMORY.md`.

**Regra 5: Simetria de Estado**
Nenhum agente inicia uma tarefa sem antes validar se o estado do sistema (Kernel v3.0) está saudável (sem arquivos corrompidos). Se detectar entropia, aciona `@skillmaster` para `Invoke-TaskCleanup`.

---

## 8. Diagrama de Fluxo

```
[Usuario com ideias]
       |
       v
  @dispatcher (prioriza, organiza em pipelines)
       |
       v
  @pesquisador (Phase 0 - dominio especializado)
       |  -> Cria/atualiza project-context.md
       v
  @prompter (estrutura o prompt)
       |
       v
  @planner (cria PRD + SPEC)
       |  -> Atualiza project-context.md
       v
  @auditor (audita, corrige, cria backup)
       |
       v
  @implementor (executa a SPEC)
       |  -> Atualiza project-context.md
       v
  @verifier (verifica completude + calibracao de audiencia)
       |
       v
  @validador (valida precisao factual + calibracao pedagogica)
       |
       |-- Se correcoes criticas: gera prompt para @verifier re-verificar
       |
       v
  [PRONTO]
       |
       |-- (opcional) @organizador: health check de docs
       |-- (opcional) @securitychief: auditoria de seguranca
```

---

## 9. Resumo Executivo

O sistema de 10 agentes na v3 atinge um equilibrio entre rigor e fluidez:

- **Separacao de responsabilidades clara:** cada agente tem um papel unico e bem definido
- **Contexto compartilhado estruturado:** project-context.md com schema padrao elimina retrabalho
- **Validacao em camadas:** verifier (completude) -> validador (precisao factual + pedagogia)
- **Otimizacoes condicionais:** calibracao pedagogica so ativa em projetos educacionais
- **Curadoria aplicada:** propostas que gerariam mais custo que beneficio foram rejeitadas

O sistema nao e perfeito para tarefas triviais (overhead de pipeline completo), mas e excelente para projetos complexos onde erros tem custo alto - exatamente o caso de conteudo educacional especializado como a aula de ICM e Risk Premium.

---

---

## 10. NOTA: Status de Skillmaster & Sequenciador

> **Status:** ✅ TOTALMENTE IMPLEMENTADOS | Data: 2026-03-12

@skillmaster e @sequenciador não são propostas futuras - ambos estão **totalmente funcionais 24/7 desde agora**.

Histórico de implementação:

- **@pesquisador** (2026-03-11): Researched automation patterns, proposed 2-agent layer
- **@organizador** (2026-03-12): Audited system, flagged skillmaster & sequenciador as "undefined"
- **Implementação** (2026-03-12): Criados skillmaster.md e sequenciador.md com specs completas
- **Integração** (2026-03-12): MANUAL_WORKFLOW_AGENTES.md atualizado com Seção 4

O sistema é capaz de processar desde tráfego zero até cenários de HIGH LOAD (20+ tarefas simultâneas) sem mudanças arquitetônicas.

Para detalhes técnicos completos:

- **Skillmaster:** [`.claude/agents/skillmaster.md`](./.claude/agents/skillmaster.md) - executor automático 24/7
- **Sequenciador:** [`.claude/agents/sequenciador.md`](./.claude/agents/sequenciador.md) - orquestrador inteligente 24/7

---

## 12. Modo Autopoiese (Vida Artificial)

> **Status:** Ativo | **Motor:** `Agent-Autopoiesis.psm1`

O sistema possui capacidade de auto-regulação e produção contínua através do script `start_life.ps1`.

- **@maverick:** Gera proativamente tarefas de inovação e vigília.
- **@planner:** Reage às sementes do Maverick, criando estruturas (PRD/SPEC).
- **@auditor:** Valida as estruturas automaticamente.

Este modo transforma a fila de tarefas em um **fluxo sanguíneo**, onde a informação circula e se transforma sem intervenção manual constante.

## 11. NOTA HISTÓRICA: Proposta v5 Original (Referência)

> **Status:** Arquivada | Autor: @chatbot | Data: 2026-03-11
> **Substituída por:** Camada Automática 24/7 (seção 4 acima)

Uma proposta de arquitetura v5 original descrevia orquestração assíncrona. Esta proposta foi **superada pela implementação prática** de skillmaster & sequenciador, que oferecem o mesmo resultado com execução imediata.

Para histórico arquitetônico, consulte `.backups/2026-03-12_auditoria_sistema/MANUAL_WORKFLOW_AGENTES.md` seção§9.

---

---
