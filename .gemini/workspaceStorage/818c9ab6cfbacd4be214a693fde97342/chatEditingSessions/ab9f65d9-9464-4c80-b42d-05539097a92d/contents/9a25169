# Manual do Sistema de Agentes - Workflow Completo

> Versao: v5 | Data: 2026-03-12
> Foco: Operacao e Uso do Sistema

---

## 📖 Qual Documento Usar?

| Documento | Propósito | Público | Quando Ler |
|-----------|-----------|---------|-----------|
| **`.claude/project-context.md`** | Contexto de DECISÃO global (domínio, público-alvo, decisões tomadas, estado atual) | Agentes durante execução | Antes de tomar decisões ou criar features |
| **`MANUAL_WORKFLOW_AGENTES.md`** (este arquivo) | Manual de OPERAÇÃO e referência técnica (como usar o sistema, descrição de agentes, scripts) | Desenvolvedores e operadores | Para entender como rodar o workflow e scripts do sistema |

**Resumo:**

- projeto-context.md = "O QUÊ foi decidido e POR QUÊ"
- MANUAL = "COMO usar e operar o sistema"

---

## CHANGELOG DE AUDITORIA

**Auditado por @auditor** | **Data: 2026-03-12**

| # | Severidade | Localizacao | Problema Encontrado | Correcao Aplicada |
|---|-----------|-------------|--------------------|--------------------|
| 1 | CRITICO | `GLOBAL_INSTRUCTIONS.md`, `MANUAL_WORKFLOW_AGENTES.md` | Inconsistência na identidade do agente ("Chico" vs "GitHub Copilot") e versão do modelo | Atualizados `GLOBAL_INSTRUCTIONS.md` e `MANUAL_WORKFLOW_AGENTES.md` para "GitHub Copilot" e "Gemini 3 Pro Preview" (modelo prioritário). |

**Total: 1 problema (1 crítico, 0 altos, 0 médios, 0 baixos, 0 info)**
**Todos os problemas resolvidos.**

---

## 1. Contexto Compartilhado: project-context.md

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

## 4. Comparativo: v1 vs v2 vs v3

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

---

## 5. Troubleshooting Comum

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

## 6. Metricas de Ganho Estimadas

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

---

## 7. Diagrama de Fluxo

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

## 8. Resumo Executivo

O sistema de 10 agentes na v3 atinge um equilibrio entre rigor e fluidez:

- **Separacao de responsabilidades clara:** cada agente tem um papel unico e bem definido
- **Contexto compartilhado estruturado:** project-context.md com schema padrao elimina retrabalho
- **Validacao em camadas:** verifier (completude) -> validador (precisao factual + pedagogia)
- **Otimizacoes condicionais:** calibracao pedagogica so ativa em projetos educacionais
- **Curadoria aplicada:** propostas que gerariam mais custo que beneficio foram rejeitadas

O sistema nao e perfeito para tarefas triviais (overhead de pipeline completo), mas e excelente para projetos complexos onde erros tem custo alto - exatamente o caso de conteudo educacional especializado como a aula de ICM e Risk Premium.

---

## 9. Proposta de Workflow v5: Modelo Assíncrono com Fila de Tarefas

> Autor da proposta: @chatbot | Data: 2026-03-11

Esta seção descreve um modelo de trabalho alternativo e mais avançado, projetado para permitir que o usuário emita múltiplas instruções em sequência, sem a necessidade de aguardar a conclusão de cada uma. O sistema opera em segundo plano (background) de forma autônoma.

### 9.1 Visão Geral e Justificativa

O workflow sequencial (v4) é robusto para tarefas complexas que exigem supervisão, mas é bloqueante por natureza. Para aumentar a eficiência e a autonomia, o modelo v5 introduz um sistema de fila de tarefas (Task Queue) e um agente orquestrador que trabalha em segundo plano. Isso permite que o usuário "dispare e esqueça" as tarefas, liberando-o para outras atividades enquanto os agentes trabalham.

### 9.2 Componentes Principais

1. **Fila de Tarefas (`queue/tasks.json`):** Um arquivo central que armazena todas as instruções do usuário como uma lista de objetos JSON. Cada objeto representa uma tarefa com um ID único, prompt, status (`pending`, `in_progress`, `completed`, `failed`), e timestamp.
2. **Agente Despachante Mestre (`@master_dispatcher`):** Um processo de longa duração que roda em segundo plano. Sua única função é monitorar a Fila de Tarefas, pegar a próxima tarefa pendente e orquestrar sua execução.
3. **Agentes Especializados (Workers):** Os mesmos agentes do modelo v4 (`@pesquisador`, `@planner`, etc.), mas agora são invocados pelo `@master_dispatcher` conforme a necessidade de cada tarefa.
4. **Registro de Tarefas (`logs/task_log.md`):** Um arquivo de log central onde o `@master_dispatcher` registra o progresso de todas as tarefas em tempo real, fornecendo visibilidade sobre o que está acontecendo.

### 9.3 Fluxo de Trabalho Detalhado

1. **Enfileiramento:** O usuário utiliza um novo comando (ex: `do "crie a aula de poker"`) que, em vez de iniciar um agente diretamente, adiciona a instrução como uma nova tarefa com status `pending` na Fila de Tarefas. O sistema retorna imediatamente um ID para a tarefa.
2. **Despacho (Dispatching):** O `@master_dispatcher`, rodando em background, detecta a nova tarefa. Ele a marca como `in_progress` e assume sua execução.
3. **Execução do Pipeline Autônomo:** O `@master_dispatcher` analisa a tarefa. Se for complexa, ele invoca a sequência de agentes necessária (ex: `@pesquisador` -> `@prompter` -> `@planner`...), um após o outro, para aquela tarefa específica. Todo esse pipeline ocorre em segundo plano, sem qualquer intervenção do usuário.
4. **Registro de Progresso:** A cada passo significativo (ex: `@planner` concluiu a SPEC), o `@master_dispatcher` escreve uma entrada no Registro de Tarefas, associada ao ID da tarefa.

   ```markdown
   - **Task ID:** `20260311-T001`
   - **Status:** `in_progress`
   - **Log:**
       - `[10:05:01]`: Task received. Dispatching to `@pesquisador`.
       - `[10:15:23]`: `@pesquisador` completed. Dispatching to `@prompter`.
       - ...
   ```

5. **Conclusão:** Ao final de todo o pipeline, o `@master_dispatcher` marca a tarefa como `completed` (ou `failed`) na Fila de Tarefas e no log. Opcionalmente, pode enviar uma notificação ao usuário.
6. **Ciclo Contínuo:** O `@master_dispatcher` volta ao passo 2, procurando a próxima tarefa pendente na fila.

### 9.4 Novos Comandos de Interação

A interação do usuário com o sistema passaria a ser através de comandos específicos para gerenciar o fluxo assíncrono:

- `do "<prompt>"`: Adiciona uma nova tarefa à fila.
- `status <task_id>`: Exibe o log de progresso detalhado para uma tarefa específica.
- `status --all` ou `list-tasks`: Mostra um resumo do status de todas as tarefas na fila (`pending`, `in_progress`, `completed`).
- `cancel <task_id>`: Tenta cancelar uma tarefa que esteja com status `pending`.

### 9.5 Vantagens Sobre o Modelo Sequencial (v4)

- **Não-Bloqueante:** O usuário fica livre para executar outros comandos ou enfileirar mais tarefas imediatamente.
- **Autonomia:** O sistema gerencia todo o ciclo de vida da tarefa, desde o início até o fim, sem necessidade de intervenção.
- **Escalabilidade de Instruções:** O usuário pode fornecer uma rajada de instruções ("instruções excessivas, sem pausa"), que serão enfileiradas e processadas de forma ordenada.
- **Rastreabilidade:** O Registro de Tarefas fornece um histórico claro e centralizado de toda a atividade.

### 9.6 Diagrama de Fluxo (v5)

```
[Usuário] --(do "tarefa 1")--> [Fila de Tarefas (`tasks.json`)]
[Usuário] --(do "tarefa 2")--> [Fila de Tarefas (`tasks.json`)]
                                     ^
                                     | (1. Polling)
                                     |
[ @master_dispatcher (background) ] --
       |
       | (2. Pega Tarefa Pendente)
       |
       +-----> (3. Executa Pipeline para Tarefa) -----> [Agentes Especializados]
       |         (@pesquisador -> @planner -> ...)           |
       |                                                     |
       +-----> (4. Registra Progresso) -------------------> [Registro de Tarefas (`task_log.md`)]
```
