# Relatorio: Arquitetura de Agentes - Diagnostico e Guia de Uso Maximo

**Data:** 2026-03-21 | **Autor:** Claude Opus 4.6 (sessao P1)

---

## 1. DIAGNOSTICO HONESTO

### 1.1 O que existe

| Camada | Artefatos | Quantidade |
|--------|-----------|------------|
| Definicoes | `.claude/agents/*.md` | 15 arquivos |
| Memorias | `.claude/agent-memory/*/MEMORY.md` | 15 diretorios |
| Manifest | `data/agents_manifest.json` | 1 arquivo (152 linhas) |
| Docs governanca | `.claude/*.md` (COHERENCE, DISTRIBUTION, HRP, etc.) | 7 documentos |

### 1.2 O que funciona de verdade

| Item | Funciona? | Porque |
|------|-----------|--------|
| Invocar agente via `subagent_type` | SIM (agora) | Modelo corrigido de invalido para `sonnet` em todos os 15 |
| Agente recebe seu .md como system prompt | SIM | Mecanismo nativo do Claude Code |
| Agente le arquivos do projeto | SIM | Todos tem acesso a ferramentas Read/Grep/Glob |
| Pipeline automatica entre agentes | NAO | Nao existe mecanismo de chaining no Claude Code |
| Routing automatico via agents_manifest.json | NAO | Ninguem le esse arquivo para rotear |
| Sync horaria de memorias (@skillmaster) | NAO | Nao existe daemon/cron rodando |
| task_executor.py orquestra agentes Claude Code | NAO | Sao sistemas completamente separados |
| Agente le automaticamente sua MEMORY.md | NAO | Precisa ser instruido a fazer isso |
| Agente le automaticamente project-context.md | NAO | Precisa ser instruido a fazer isso |
| settings.local.json executa operacoes | NAO | Nenhum processo consome esse scheduling |

### 1.3 Problemas criticos corrigidos nesta sessao

- **15/15 agentes** tinham `model:` invalido (`anthropic/claude-3.5-sonnet` ou `google/gemini-flash-1.5`). Corrigido para `sonnet`.
- **2 agentes** (chico, maverick) tinham `memory: global` invalido. Corrigido para `project`.

### 1.4 Problemas estruturais (nao corrigidos, flag)

1. **agents_manifest.json** tem routing_patterns e model_preference que ninguem consome. E codigo morto.
2. **COHERENCE_MANIFEST.md** afirma garantias que nao sao verdadeiras (sync automatica, acesso automatico a 4 camadas).
3. **DISTRIBUTION_MATRIX.md** descreve frequencias de atualizacao (hourly, daily, weekly) que nenhum processo executa.
4. **HOLOGRAPHIC_ROUTING_PROTOCOL.md** referencia `Agent-Autopoiesis.psm1` que nao existe.
5. **HYBRID_BRAIN_ARCHITECTURE.md** descreve um workflow do.ps1 -> clipboard -> IDE que e manual, nao automatico.
6. **project-context.md** e referenciado em todos os docs mas so existe em `.archive/legacy_root/`.

---

## 2. COMO OS AGENTES REALMENTE FUNCIONAM

### 2.1 Mecanismo real no Claude Code

```
Usuario pede algo
    |
    v
Claude Opus (sessao principal) decide qual agente invocar
    |
    v
Agent(subagent_type="implementor", prompt="tarefa detalhada")
    |
    v
Claude Code carrega .claude/agents/implementor.md como system prompt
    |
    v
Agente executa com acesso a Read, Edit, Write, Grep, Glob, Bash
    |
    v
Resultado volta para sessao principal
```

**Implicacoes:**
- O roteador e a sessao principal (eu/CHICO), nao o task_executor.py
- O agente so sabe o que esta no seu .md + o prompt que recebeu
- O agente NAO le automaticamente MEMORY.md, project-context.md, ou GLOBAL_INSTRUCTIONS.md
- O agente pode ler qualquer arquivo, mas precisa ser instruido a fazer isso

### 2.2 O que o agente ve quando e invocado

1. Seu proprio `.claude/agents/<nome>.md` (automatico, e o system prompt)
2. O `prompt` passado pelo invocador (a tarefa)
3. CLAUDE.md do projeto (automatico, carregado pelo Claude Code)
4. **Nada mais** - a menos que ele leia arquivos por conta propria

---

## 3. GUIA DE USO MAXIMO

### 3.1 Quando usar cada agente

| Situacao | Agente | Por que este e nao outro |
|----------|--------|--------------------------|
| Preciso planejar uma feature complexa | `@architect` | Gera PRD/SPEC estruturado, pensa em topologia |
| Preciso quebrar um epico em tarefas | `@dispatcher` | Cria DAG com dependencias e designa agentes |
| Preciso pesquisar algo na web/mercado | `@pesquisador` | Tem mentalidade OSINT, triangula fontes |
| Preciso montar um prompt preciso | `@prompter` | Engenharia de contexto, elimina ambiguidade |
| Preciso auditar seguranca/logica de uma SPEC | `@auditor` | Bloqueador linear, corrige direto |
| Preciso implementar codigo de uma SPEC | `@implementor` | Fidelidade absoluta a SPEC, full-stack |
| Preciso verificar se codigo bate com SPEC | `@verifier` | Caca bugs silenciosos, compara plano vs real |
| Preciso validar matematica/poker/GTO | `@validador` | Refaz calculos do zero, cruza com solvers |
| Preciso revisar estetica/tom/etica | `@curator` | Voz de Raphael, alinhamento COSMOVISAO |
| Preciso auditar seguranca de codigo | `@securitychief` | Mentalidade de atacante, OWASP, CVEs |
| Preciso organizar/limpar documentacao | `@organizador` | Caca redundancia, sincroniza docs |
| Preciso de analise estrategica/filosofica | `@maverick` | Desconstrucao socratica, visao 4D |
| Preciso de orquestracao geral | `@chico` | Super-admin, arbitra conflitos |
| Preciso de contexto historico (RAG) | `@bibliotecario` | Busca vetorial, sintese de memoria |
| Preciso de manutencao/backup | `@skillmaster` | Rotinas CRON, cleanup |

### 3.2 Como invocar para maximo impacto

**Ruim (prompt vago):**
```
Agent(subagent_type="implementor", prompt="implementa o painel AI Coach")
```

**Bom (prompt com contexto):**
```
Agent(subagent_type="implementor", prompt="""
Tarefa: Integrar AICoachPanel no MasterSimulator.

Contexto:
- AICoachPanel ja existe em frontend/src/components/simulator/panels/AICoachPanel.tsx (331 linhas)
- MasterSimulator esta em frontend/src/components/simulator/MasterSimulator.tsx (302 linhas)
- MasterSimulator usa TOOL_BUTTONS para renderizar paineis via switch/case
- Paineis sao lazy-loaded com Suspense

Acao:
1. Leia MasterSimulator.tsx para entender o padrao de TOOL_BUTTONS
2. Adicione 'aicoach' ao TOOL_BUTTONS com icone e label adequados
3. Adicione lazy import do AICoachPanel
4. Adicione case 'aicoach' no switch de renderizacao
5. Passe props necessarias (scenario do useScenario hook)

Restricoes:
- NAO reescreva MasterSimulator do zero (feedback critico do usuario)
- Mantenha o padrao de lazy loading existente
- Codigo em portugues nos comentarios
""")
```

### 3.3 Combinacoes poderosas (agentes em paralelo)

**Auditoria completa de feature:**
```
Paralelo:
  @auditor -> "Audite a logica e seguranca desta SPEC"
  @securitychief -> "Audite os vetores de ataque desta implementacao"
  @validador -> "Valide a matematica dos coeficientes Nash"
  @curator -> "Valide o tom e a estetica da interface"

Depois:
  Consolide os 4 relatorios
  @implementor -> "Implemente com base na SPEC + correcoes dos auditores"
```

**Pesquisa + Planejamento:**
```
@pesquisador -> "Investigue estado da arte de X"
    |
    v (resultado)
@architect -> "Com base nesta pesquisa, desenhe a SPEC de Y"
    |
    v (SPEC)
@auditor -> "Audite esta SPEC"
```

### 3.4 O que NAO funciona (evitar)

1. **Invocar agente sem contexto suficiente** - ele vai alucinar sobre o projeto
2. **Esperar que agentes se comuniquem entre si** - a sessao principal e o router
3. **Invocar @skillmaster esperando cron automatico** - ele e util para tarefas pontuais de manutencao, nao e um daemon
4. **Invocar @bibliotecario sem ChromaDB** - o RAG depende de infra Python que pode nao estar ativa
5. **Confiar que o agente leu a MEMORY.md** - inclua "Leia sua MEMORY.md em .claude/agent-memory/<nome>/MEMORY.md primeiro" no prompt se precisar de contexto historico

---

## 4. MEMORIAS: ESTADO ATUAL E VALOR REAL

### 4.1 O que as memorias contem

A maioria das MEMORY.md segue um formato padrao com 6 secoes:
1. Perfil e Alinhamento (identidade)
2. Competencias e Evolucao
3. Padroes, Insights e Descobertas (#aprendizado)
4. Sinergia e Harmonia (#relacionamento)
5. Registro de Execucao e Autonomia (#decisao)
6. Propostas Democraticas (#proposta)

### 4.2 Valor real de cada memoria

| Agente | Memoria util? | Conteudo relevante |
|--------|--------------|-------------------|
| architect | Medio | Nota sobre absorcao do @planner |
| auditor | Medio | Tem memory.json adicional (dados estruturados) |
| bibliotecario | Baixo | Generico, sem dados de execucao real |
| chico | Alto | SESSION_ANCHOR com evolucao real, VERIFICACAO_CRUZADA |
| curator | Alto | Reflexoes sobre voz de Raphael, sales letter, God Mode |
| dispatcher | Baixo | Generico |
| implementor | Baixo | Generico |
| maverick | Alto | Gargalos identificados/resolvidos, decisoes de seguranca |
| organizador | Baixo | Generico |
| pesquisador | Baixo | Generico |
| prompter | Baixo | Generico |
| securitychief | Medio | Protocolo de exclusao segura |
| skillmaster | Baixo | Generico |
| validador | Medio | Referencia a validacao Nash |
| verifier | Baixo | Generico |

**Problema:** 9/15 memorias sao genericas (conteudo de template, sem dados de execucao real). Sao filosofia, nao inteligencia operacional.

### 4.3 Recomendacao sobre memorias

As memorias so tem valor se contem **dados de execucao real** - decisoes tomadas, bugs encontrados, padroes observados em producao. Memorias filosoficas/aspiracionais nao ajudam o agente a trabalhar melhor.

---

## 5. ARTEFATOS CORRELATOS: REAL vs ASPIRACIONAL

| Artefato | Funcao declarada | Funcao real |
|----------|-----------------|-------------|
| `agents_manifest.json` | Roteamento automatico + RAG | Dados mortos (ninguem consome) |
| `COHERENCE_MANIFEST.md` | Garantia de harmonia | Documentacao descritiva (nao executavel) |
| `DISTRIBUTION_MATRIX.md` | Matriz de autoridade documental | Bom design mas nao enforced |
| `HOLOGRAPHIC_ROUTING_PROTOCOL.md` | Self-awareness headers | Aspiracional (nenhum arquivo tem esses headers) |
| `HYBRID_BRAIN_ARCHITECTURE.md` | Workflow Claude+Gemini | Descricao do modelo mental de trabalho (util) |
| `LOAD_PREDICTION_MODEL.md` | Formula de priorizacao | Nao implementada em codigo |
| `LIDERANCA_GOVERNANCE.md` | Triade de governanca | Documentacao de papeis (util como referencia) |
| `BOOT_OPERACIONAL.md` | Cerimonia de boot | Historico (nao operacional) |
| `project-context.md` | Contexto central | So existe em .archive/ (morto) |
| `settings.local.json` | Scheduling de operacoes | Ninguem executa esse scheduling |

---

## 6. RESUMO EXECUTIVO

### O que voce tem
15 agentes bem definidos com papeis claros, invocaveis via Claude Code.

### O que nao funciona
Automacao aspiracional: pipeline automatica, sync horaria, roteamento por regex, scheduling CRON. Nada disso e real.

### O que funciona
Invocacao manual com contexto rico. Eu (sessao principal) sou o router. Agentes em paralelo para auditorias. Agentes sequenciais para pipeline de feature.

### Como extrair maximo valor
1. **Prompts ricos** - sempre inclua contexto, arquivos relevantes, restricoes
2. **Paralelize auditorias** - 4 agentes auditando ao mesmo tempo = 4x velocidade
3. **Sequencie a pipeline** - dispatcher -> architect -> auditor -> implementor -> verifier
4. **Instrua leitura de memoria** - se o agente precisa de historico, diga para ler MEMORY.md
5. **Nao confie na automacao** - o router sou eu, nao o task_executor.py

### O que pode ser deletado sem perda funcional
- `agents_manifest.json` (routing_patterns mortos)
- `settings.local.json` (scheduling que nada executa)
- `LOAD_PREDICTION_MODEL.md` (formula nao implementada)
- `BOOT_OPERACIONAL.md` (cerimonia historica)
- `HOLOGRAPHIC_ROUTING_PROTOCOL.md` (headers que ninguem usa)

### O que deve ser mantido
- Os 15 `.claude/agents/*.md` (todos funcionam agora)
- As 15 memorias (mesmo as genericas, podem ser enriquecidas com uso)
- `COHERENCE_MANIFEST.md` (bom mapa da arquitetura)
- `HYBRID_BRAIN_ARCHITECTURE.md` (explica o modelo Claude+Gemini)
- `LIDERANCA_GOVERNANCE.md` (define a triade)
- `DISTRIBUTION_MATRIX.md` (bom design de autoridade documental)

---

**Conclusao:** A arquitetura de agentes e solida no design. O gap e entre o que foi documentado como automatico e o que realmente funciona. Corrigir os modelos (feito) e aceitar o roteamento manual (realidade) ja desbloqueia 100% do valor dos agentes.
