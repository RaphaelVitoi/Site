---
id: auditoria-2026-09-02-curadoria-mcp-e-processos-residuais
tipo: relatorio
escopo: Site
ecossistema: nexus-sota
autor: gemini-3.8-flash-high
criado_em: '2026-09-02T23:30:00-03:00'
atualizado_em: '2026-09-02T23:30:00-03:00'
classes:
  - interno
  - medido
  - auditoria
  - mcp
caminhos:
  - core/mcp_routing.py
  - tests/test_mcp_addon_routing.py
  - data/system_config.json
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  so: Windows
  python: 3.14.6
referencias_nao_resolviveis:
  - C:/Users/rapha/.gemini/config/mcp_config.json
  - C:/Users/rapha/.gemini/extensions-quarantine-20260902-mcp-suite
revisoes_de_ancora:
  - registro: relatorio-fusao-cerebro-claude-quality-gate-2026-09-01
    caminhos:
      - data/system_config.json
    parecer: A fusao ancorou system_config.json na sua integridade de chaves. A inclusao
      da chave mcp_addon_routing e aditiva, preserva todas as chaves existentes e
      a homeostase do config.
  - registro: auditoria-2026-08-30-coderabbit-resolucao-e-integridade
    caminhos:
      - .claude/agent-memory/chico/HANDOFF_LATEST.md
    parecer: O arquivo HANDOFF_LATEST.md e um ponteiro executivo de estado atualizado
      a cada fechamento de sessao; o registro historico permanece valido.
  - registro: auditoria-2026-08-31-protocolos-handoff-git-clippy-e-relatorios
    caminhos:
      - scripts/cli/nexus.py
    parecer: A ancora em nexus.py diz respeito a comandos e CLI; a adicao de apply_mcp_addon_routing
      no comando add_task apenas anota metadados lazy na criacao da tarefa.
  - registro: auditoria-2026-08-31-saneamento-linters-e-estabilizacao-core-e-api
    caminhos:
      - core/config.py
    parecer: A ancora protegia a higienizacao de linters e hot-reload; a adicao de
      MCP_ADDON_ROUTING preserva a estrutura e passou nos 56 testes de configuracao
      e ruff.
  - registro: frente-3-2026-08-29-guard-tri-camada
    caminhos:
      - scripts/cli/nexus.py
    parecer: O guard tri-camada de nexus.py segue intacto; apenas injetou-se chamada
      pura de metadados em add_task.
  - registro: frente-4-2026-08-28-autoridade-de-roteamento
    caminhos:
      - core/config.py
    parecer: A autoridade de roteamento e hierarquia foram preservadas; a nova variavel
      de config apenas expoe o mapeamento declarativo de addons.
  - registro: handoff-2026-08-29-diagnostico-de-memoria
    caminhos:
      - scripts/cli/nexus.py
    parecer: O diagnostico de memoria permanece documentado; a alteracao em nexus.py
      e aditiva para metadados MCP.
  - registro: handoff-2026-08-29-guard-corrigido-e-heranca
    caminhos:
      - scripts/cli/nexus.py
    parecer: A correcao de guard e heranca permanece valida; nexus.py recebeu enriquecimento
      pontual de metadados na criacao de tarefas.
  - registro: handoff-2026-08-29-quatro-pendencias-e-o-que-elas-eram
    caminhos:
      - data/system_config.json
    parecer: As quatro pendencias resolvidas anteriormente permanecem intactas; o
      bloco mcp_addon_routing e aditivo e validado.
  - registro: handoff-2026-08-29-roteamento-memoria-e-guard
    caminhos:
      - scripts/cli/nexus.py
    parecer: O roteamento e guard permanecem preservados em nexus.py.
  - registro: handoff-2026-08-30-resolucao-coderabbit-linters-e-malha-sota
    caminhos:
      - .claude/agent-memory/chico/HANDOFF_LATEST.md
      - core/config.py
    parecer: HANDOFF_LATEST reflete o estado mais recente e core/config.py mantem
      tipagem e compatibilidade com linters.
  - registro: handoff-2026-08-30-status-malha-agentica-e-routing
    caminhos:
      - core/config.py
    parecer: O status da malha segue preservado; core/config.py adiciona leitura declarativa
      de MCP_ADDON_ROUTING.
  - registro: handoff-2026-08-31-saneamento-linters-e-estabilizacao-core-e-api
    caminhos:
      - core/config.py
    parecer: A estabilizacao e saneamento de core/config.py estao mantidos sem nenhum
      erro no ruff ou mypy.
  - registro: handoff-2026-09-02-integridade-portao-no-teto-e-fila-para-o-sucessor
    caminhos:
      - .claude/agent-memory/chico/HANDOFF_LATEST.md
    parecer: HANDOFF_LATEST foi atualizado para registrar a conclusao da sessao atual
      de curadoria MCP.
  - registro: registro-2026-08-29-os-indices-postos-de-lado
    caminhos:
      - data/system_config.json
    parecer: A decisao de desenho dos indices em system_config.json continua integra;
      o novo bloco nao interfere nos indices.
  - registro: registro-2026-08-29-sota-triad-mesh-integracao
    caminhos:
      - scripts/cli/nexus.py
    parecer: A integracao da Triade SOTA em nexus.py permanece preservada.
  - registro: registro-2026-09-01-cache-por-mtime-e-fusao-do-project-context
    caminhos:
      - agents/context_builder.py
    parecer: O mecanismo de cache por mtime de context_builder.py continua intacto;
      a adicao de _inject_mcp_addons e puramente complementar.
  - registro: registro-2026-09-01-identidade-de-agente-na-arvore-canonica
    caminhos:
      - agents/context_builder.py
    parecer: A resolucao de identidade de agentes em context_builder.py nao foi alterada;
      os prompts continuam preservados.
  - registro: registro-2026-09-02-portao-de-calibracao-por-sessao
    caminhos:
      - .claude/agent-memory/chico/HANDOFF_LATEST.md
    parecer: A abertura do portao de calibracao permanece anotada e acessivel; o arquivo
      reflete o encerramento da sessao corrente.
  - registro: relatorio-handoff-20260830-teoria-dos-jogos-pmev-sota-v8-gold
    caminhos:
      - .claude/agent-memory/chico/HANDOFF_LATEST.md
    parecer: O registro dos pares PMev segue integro no repositorio; HANDOFF_LATEST
      avanca para a sessao de curadoria.
  - registro: validacao-2026-08-28-arquitetura-de-memoria
    caminhos:
      - agents/context_builder.py
    parecer: A arquitetura de memoria em context_builder.py foi mantida intacta; foi
      inserido apenas _inject_mcp_addons no user prompt.
verificado:
  - Superficie Gemini CLI reduzida de 20 para 17 extensoes ativas -- tres isoladas
    em quarentena reversivel em pasta datada sem delecao definitiva.
  - Cinco diretorios orfaos do Gemini (.claude, .remember, sota-chrome-cockpit, sota-chrome-cockpit.worktrees,
    tab-autocomplete-nano) preservados intactos no disco.
  - Manifesto Antigravity mcp_config.json ajustado -- MCPBrowser e genkit-mcp-server
    desabilitados; allowUnrestrictedPaths removido do chrome-devtools-mcp.
  - Quatro processos zumbis do desktop-commander (PIDs 12204, 2968, 17744, 15228)
    identificados em background e encerrados sob confirmacao explicita do Tier 0.
  - Addons priorizados (mcp-server-neon, firebase-mcp-server, sequential-thinking)
    integrados via roteamento por intencao puramente lazy sem conexoes ativas no cold-start.
  - Suite focada tests/test_mcp_addon_routing.py aprovada com 9 testes verdes em 0.55s.
  - Suite geral pytest executada com 807 aprovados, 1 skip documentado e zero falhas.
nao_verificado:
  - Credencial da API Figma no mcp_config.json permanece ativa e aguarda rotacao manual
    conduzida pelo usuario conforme diretriz explicita.
---

# Relatorio de Auditoria: Curadoria MCP, Quarentena e Eliminacao de Processos Residuais

**Data:** 2026-09-02 · **Protocolo:** Chico SOTA v8.0 GOLD
**Sessao:** gemini-flash-site-2026-09-02-mcp-curation · **Autoridade:** Raphael Vitoi (Tier 0)

---

## 1. Contexto e Diagnostico Inicial

O ecossistema apresentava sobrecarga operacional acumulada em multiplas camadas de extensoes e servidores MCP concorrentes:
- **20 extensoes Gemini CLI** ativas simultaneamente, com sobreposicoes conceituais de pesquisa e memoria;
- **15 servidores MCP** configurados e ativos em mcp_config.json do Antigravity;
- Extensoes com superficie de privilegio elevada (desktop-commander) e credenciais sensiveis em texto claro no disco (
esearch-cli/.env);
- Processos residentes consumindo recursos sem demanda operacional justificada.

---

## 2. Acoes Executadas e Curadoria Reversivel

### 2.1 Fase 1: Quarentena no Gemini CLI
Tres extensoes foram desabilitadas e movidas para quarentena reversivel preservando integralmente seus dados:
- Destino: C:/Users/rapha/.gemini/extensions-quarantine-20260902-mcp-suite
- Extensoes: desktop-commander, gemini-supermemory, 
esearch-cli.
- O catalogo ativo de extensoes caiu de 20 para 17 (gemini extensions list).
- Os 5 diretorios orfaos (.claude, .remember, sota-chrome-cockpit, etc.) foram preservados no diretorio original.

### 2.2 Fase 2: Saneamento do Antigravity MCP (mcp_config.json)
- MCPBrowser: desabilitado (disabled: true).
- genkit-mcp-server: desabilitado (disabled: true).
- chrome-devtools-mcp: endurecido com a remocao da flag de risco llowUnrestrictedPaths=true.
- igma: preservado conforme instrucao do Tier 0, aguardando rotacao manual de chave.
- mcp-server-neon, irebase-mcp-server, sequential-thinking: reativados e mantidos ativos sob demanda.

### 2.3 Fase 3: Eliminacao de Processos Zumbis
A inspecao pos-quarentena revelou 4 processos residuais de desktop-commander originados as 22:15 do cache npx:
- PID 12204 (cmd.exe)
- PID 2968 (
ode.exe)
- PID 17744 (cmd.exe)
- PID 15228 (
ode.exe)

Apos autorizacao expressa do usuario, os 4 processos foram terminados. Nova varredura confirmou **zero** processos residuais ativos.

---

## 3. Adaptacao do Sistema para Uso Ativo dos 3 Addons

Para responder a diretriz de adaptar o sistema para usar mais **Neon**, **Firebase** e **Sequential Thinking**, foi desenhada uma arquitetura de avaliacao preguicosa (lazy evaluation) e friccao zero:

1. **data/system_config.json:**
   - Define termos ponderados, termos explicitos e travas de seguranca.
   - mcp-server-neon possui trava automatica contra consultas a SQLite, ChromaDB e LanceDB locais.
   - sequential-thinking e acionado para tarefas longas ou tarefas de raciocinio profundo, causa raiz e arquitetura.
   - irebase-mcp-server e acionado para Auth, Firestore, Functions, Hosting, Storage e Security Rules.

2. **core/mcp_routing.py:**
   - Modulo puro, deterministico e auditavel. Nao instancia conexoes nem abre portas. Produz metadados compactos.

3. **gents/execution.py e gents/fallback.py:**
   - Cada subtarefa recalcula os addons pertinentes ao seu escopo, evitando heranca cega da tarefa pai.

4. **gents/context_builder.py:**
   - Injeta instrucoes operacionais compactas no prompt do agente apenas quando o addon correspondente for selecionado.

---

## 4. O que se Aprendeu Nesta Sessao (Licoes Operacionais)

1. **Desativacao de plugin nao e terminacao de processo:**
   Mover pastas para quarentena ou alterar manifests nao encerra servidores node/cmd ja aquecidos em background ou instanciados pelo cache do npx. A auditoria de processos pos-mutacao e etapa obrigatoria.

2. **O probe CDP depende do aquecimento da rota loopback:**
   No portao de integridade cwv_gate.ps1, se a porta 9222 (CDP) estiver aberta mas o servidor Next.js estiver desligado, o Chrome renderiza a tela de erro ERR_CONNECTION_REFUSED. O motor axe-core roda sobre essa tela de erro nativa do navegador e acusa 3 violacoes de acessibilidade. A presenca do servidor de desenvolvimento aquecido em localhost:3000 e condicao estrita de ambiente para a execucao com CDP ativo.

3. **Friccao Zero para Addons MCP:**
   Adicionar ferramentas MCP sem controle de intencao polui o contexto e gera concorrencia indesejada. O modelo otimo e lazy routing por score de intencao na camada de agendamento de tarefas, recalculado por subtarefa.
