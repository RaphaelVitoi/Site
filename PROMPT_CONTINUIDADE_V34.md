# PROMPT DE CONTINUIDADE - SESSÃO V34 (2026-04-14)

**Contexto Atual (Estado da Arte Consolidado):**
A infraestrutura matemática SOTA (GTO/CFR) foi consolidada no frontend (`gto-cfr/page.tsx`) e no backend (`engine/math_sota.py`). O estado da simulação é persistido via URL (LZString), e a infraestrutura está blindada por um gatekeeper de tipagem (`tsc --noEmit`). O sistema opera em estabilidade absoluta, com todos os assets estáticos mockados e livres de erros 404.

**Diretriz de Execução (Próximos Passos Imediatos):**

1. **Criação de Conteúdo SOTA (Downward Drift):** Forjar um novo artigo na biblioteca (`/biblioteca/downward-drift-sota/page.tsx`) sobre o conceito de "Downward Drift" em ICM, utilizando o `docs/epics/aula-icm-rp/archived/pesquisa.md` como base teórica. O artigo deve explicar como a pressão do ICM força a redução dos tamanhos de aposta e a contração dos ranges.

2. **Integração Visceral do Laboratório:** Incorporar o laboratório `GtoCfrContent` (de `gto-cfr/page.tsx`) diretamente no corpo do novo artigo. O componente deve ser pré-configurado com um cenário de `regrets` que ilustre claramente o conceito de Downward Drift (ex: um alto regret para apostas grandes, incentivando uma estratégia de apostas menores).

3. **Ancoragem Topológica:** Registrar a nova rota `/biblioteca/downward-drift-sota` no mapa canônico (`frontend/ROUTES.md`) para garantir a integridade da navegação e a descoberta pelo sistema.

4. **Refatoração de Performance (Opcional):** Aplicar `useMemo` nos cálculos da estratégia CFR e da fração geométrica dentro de `GtoCfrContent` para otimizar a performance de renderização, prevenindo recálculos desnecessários a cada interação do usuário.

**Comando de Ignição SOTA:**
"Inicie a sessão executando a diretriz 1 e 3. Forje a estrutura do novo artigo sobre Downward Drift e atualize o mapa de rotas."
