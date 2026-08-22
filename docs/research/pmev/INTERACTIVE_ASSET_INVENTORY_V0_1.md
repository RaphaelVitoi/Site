# Inventário de Ativos Interativos PMev v0.1

## Decisão de integração

Os cinco arquivos em `frontend/src/content/interativo/` são material de origem
do estudo Toy Games verificado em **Entendendo o ICM e suas Heurísticas**, mas
não são importados pela rota pública atual. A decisão é preservá-los como
acervo e fonte metodológica, sem executar cópias legadas ou criar uma segunda
fonte de verdade no bundle.

| Ativo | Estado observado | Decisão |
| --- | --- | --- |
| `toy_games_page.tsx` | componente não importado; contém narrativa e fórmulas legadas | preservar como referência, não reativar por cópia |
| `scenarios_toygame.js` | catálogo legado dos cenários verificados | preservar como origem; não consumir em runtime sem adaptador/versionamento |
| `PRD_icm_toy.md` | requisito histórico do estudo | preservar como intenção e contexto; não como especificação vigente |
| `SPEC_icm_toy.md` | especificação histórica do mecanismo | preservar como fonte e convergir progressivamente ao contrato v0.1 |
| `icm_toy_game_simulator.html` | objeto Git LFS apontado por ponteiro; conteúdo não hidratado localmente | não executar, não importar, recuperar somente quando a origem LFS estiver disponível e a revisão metodológica for concluída |

## Integrações vivas

- `/biblioteca/toy-games` é a porta didática pública e monta `PostFlopPanel` em
  modo local. Ela deve declarar que é fixture até receber um contrato do Master.
- `/simulador?scenario=icmev-puro` é a baseline rastreável hoje disponível para
  comparação navegável.
- `MasterSimulator` é o único consumidor do catálogo `SCENARIOS`; o manifest
  correspondente explicita status, fonte e limitação por cenário.

## Condição para promoção

Um ativo de origem só pode voltar ao runtime se: (1) não introduzir uma segunda
fonte de verdade; (2) declarar `scenario_id`, inputs, modelo, versão e fontes;
(3) passar invariantes de unidade e baseline; e (4) expor limites na interface.
O histórico é mantido por valor documental, não por autoridade técnica.
