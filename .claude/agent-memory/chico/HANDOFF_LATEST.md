# HANDOFF LATEST — Curadoria MCP, Quarentena e Roteamento Lazy de Addons

**Data:** 2026-09-02 · **Protocolo:** Chico SOTA v8.0 GOLD · **Estado:** pré-commit validado
**Sessão:** gemini-flash-site-2026-09-02-mcp-curation · **Assinatura individual:** Gemini 3.8 Flash High [Tier 1]

---

## ⚠ Primeira coisa a fazer na próxima sessão

1. **Rotacionar a chave da API Figma:**
   A credencial no C:/Users/rapha/.gemini/config/mcp_config.json foi preservada para manter o fluxo de trabalho aberto, mas necessita de rotação manual no console da Figma pelo Tier 0.

2. **Manter o servidor Next.js aquecido antes de rodar cwv_gate com CDP ativo:**
   Se a porta 9222 estiver respondendo ao CDP, o probe navega até http://localhost:3000. Sem o dev server aquecido, o Chrome exibe a página nativa de erro de conexão (ERR_CONNECTION_REFUSED), gerando falsos positivos de acessibilidade (axe).

---

## O que esta sessão entregou

1. **Quarentena Reversível de Extensões Gemini:**
   - 3 extensões quarentenadas em C:/Users/rapha/.gemini/extensions-quarantine-20260902-mcp-suite (desktop-commander, gemini-supermemory, 
esearch-cli).
   - 5 diretórios órfãos (.claude, .remember, sota-chrome-cockpit, etc.) preservados.
   - Catálogo ativo reduzido de 20 para 17.

2. **Curadoria do Antigravity MCP (mcp_config.json):**
   - MCPBrowser e genkit-mcp-server desabilitados.
   - chrome-devtools-mcp teve llowUnrestrictedPaths=true removido.
   - sequential-thinking, mcp-server-neon e irebase-mcp-server mantidos ativos e integrados no sistema.

3. **Arquitetura de Roteamento Lazy e Fricção Zero:**
   - Novo módulo core/mcp_routing.py com avaliação puramente preguiçosa por intenção.
   - Configuração de regras e travas em data/system_config.json.
   - Subtasks recalculam contexto dinamicamente sem herança cega do pai.
   - Testes unitários dedicados em 	ests/test_mcp_addon_routing.py (9/9 passed).

4. **Saneamento de Processos em Background:**
   - 4 processos zumbis do desktop-commander finalizados.

5. **Portões e Verificações:**
   - Suíte geral: 807 passed, 1 skipped, zero falhas.
   - Pre-commit CWV 5 fases: Aprovado (0 erros, 1 warning no teto de 2).
