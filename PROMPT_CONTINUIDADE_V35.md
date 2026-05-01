# PROMPT DE CONTINUIDADE - SESSÃO V35 (2026-04-29)

**Contexto Atual (Estado da Arte Consolidado):**
A sessão V34 concluiu a implementação do artigo "Downward Drift SOTA" na biblioteca. O laboratório `GtoCfrContent` foi refatorado para aceitar configurações iniciais e foi integrado visceralmente ao novo artigo com um cenário de alto arrependimento para ações agressivas. O mapa de rotas (`ROUTES.md`) está sincronizado. A performance do laboratório está otimizada com `useMemo`.

**Diretriz de Execução (Próximos Passos Imediatos):**

1. **Expansão do Laboratório (Range Reading):** Iniciar a pesquisa para o próximo módulo do laboratório: "Bayesian Recursive Updating" para range reading street-by-street. O objetivo é visualizar como o range de um jogador se contrai ou expande baseado nas ações tomadas em cada street, integrando com os conceitos de ICM.

2. **Auditoria de Componentes:** Realizar uma auditoria nos componentes `SniperAdvisor` e `SniperBadge` para remover os imports não utilizados de 'React' (identificados no log do typecheck da V34) e garantir conformidade com o React 19.

3. **Validação de Conteúdo:** Revisar os outros artigos da biblioteca para garantir que todos utilizem os componentes SOTA mais recentes (como o laboratório CFR) onde for pedagogicamente relevante.

**Comando de Ignição SOTA:**
"Inicie a sessão executando a auditoria de componentes (Diretriz 2) e prepare o terreno para o módulo de Bayesian Range Reading (Diretriz 1)."
