---
id: handoff-2026-09-02-curadoria-mcp-quarentena-e-roteamento-lazy
tipo: handoff
escopo: Site
ecossistema: nexus-sota
autor: gemini-3.8-flash-high
criado_em: 2026-09-02T23:30:00-03:00
atualizado_em: 2026-09-02T23:30:00-03:00
commit: pendente
classes: [interno, continuidade, medido]
caminhos:
  - core/mcp_routing.py
  - tests/test_mcp_addon_routing.py
  - data/system_config.json
  - reports/AUDITORIA-2026-09-02-curadoria-mcp-e-processos-residuais.md
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  origem: origin/master
  so: Windows
  python: '3.14.6'
  suite: 807 passed, 1 skipped, 0 failed
  portao_5_fases: FRAGIL -- 0 erros, 1 warning, teto 2
referencias_nao_resolviveis:
  - C:/Users/rapha/.gemini/config/mcp_config.json
  - C:/Users/rapha/.gemini/extensions-quarantine-20260902-mcp-suite
revisoes_de_ancora: []
verificado:
  - >-
    Base de trabalho auditada e estavel -- 807 testes aprovados, 1 skip documentado
    e zero erros em pytest.
  - >-
    Superficie Gemini CLI reduzida de 20 para 17 extensoes via quarentena reversivel
    em C:/Users/rapha/.gemini/extensions-quarantine-20260902-mcp-suite.
  - >-
    Configuracao Antigravity mcp_config.json saneada -- MCPBrowser e genkit-mcp-server
    desabilitados; flag allowUnrestrictedPaths removida de chrome-devtools-mcp.
  - >-
    Addons mcp-server-neon, firebase-mcp-server e sequential-thinking mantidos ativos
    e integrados no core atraves de avaliacao lazy e roteamento por intencao.
  - >-
    Quatro processos zumbis residuais do desktop-commander terminados sob autorizacao
    do Tier 0 -- contagem ativa no sistema zerada.
  - >-
    Portao oficial de 5 fases cwv_gate.ps1 executado com rota local aquecida -- aprovado
    com zero erros e 1 warning no teto de 2 (cobertura CWV parcial com INP humano positivo).
nao_verificado:
  - >-
    A chave da API Figma em mcp_config.json foi preservada por ordem expressa do
    usuario e necessita de rotacao manual pelo operador.
---

# HANDOFF — Curadoria MCP, Quarentena Reversível e Roteamento Lazy de Addons

**Data:** 2026-09-02 · **Protocolo:** Chico SOTA v8.0 GOLD · **Estado:** pré-commit validado  
**Sessão:** gemini-flash-site-2026-09-02-mcp-curation · **Assinatura:** Gemini 3.8 Flash High [Tier 1]

---

## 1. Primeira Coisa a Fazer na Próxima Sessão

1. **Rotacionar a chave da API Figma:**  
   A chave atual em C:/Users/rapha/.gemini/config/mcp_config.json foi preservada para manter o fluxo de trabalho aberto, mas esteve exposta. O operador deve rotacionar no painel da Figma e atualizar a variável de ambiente segura.

2. **Manter o servidor Next.js aquecido antes de rodar o portão com CDP ativo:**  
   Se o Chrome Dev (porta 9222/9223) estiver aberto, o probe cwv_gate.ps1 navegará para http://localhost:3000. O servidor deve ser iniciado previamente (
pm run dev --workspace=frontend) e aquecido para evitar falsos positivos de acessibilidade decorrentes da página de erro nativa do Chrome.

---

## 2. O que Esta Sessão Entregou

1. **Quarentena e Redução da Superfície Gemini CLI:**
   - 3 extensões isoladas em pasta datada: desktop-commander, gemini-supermemory, 
esearch-cli.
   - 5 diretórios órfãos do Gemini preservados.
   - Extensões listadas: reduzidas de 20 para 17.

2. **Curadoria do Antigravity MCP (mcp_config.json):**
   - MCPBrowser e genkit-mcp-server desabilitados.
   - chrome-devtools-mcp sem llowUnrestrictedPaths.
   - sequential-thinking, mcp-server-neon e irebase-mcp-server habilitados sob demanda.

3. **Arquitetura de Roteamento por Intenção (Lazy Addons):**
   - Implementado core/mcp_routing.py e testes 	ests/test_mcp_addon_routing.py.
   - Configuração viva em data/system_config.json.
   - Subtasks com recálculo contextual (sem herança cega do pai).
   - Prompt enxuto com injeção apenas dos addons selecionados.

4. **Saneamento de Processos em Background:**
   - 4 processos residuais do desktop-commander finalizados.

5. **Aprovação nos Portões:**
   - Testes unitários de MCP: 9/9 (100%).
   - Testes de governança: 7/7 (100%).
   - Suíte geral: 807 aprovados, 1 skip.
   - Portão de integridade 5 fases (cwv_gate.ps1): Aprovado (0 erros, 1 warning de teto 2).
