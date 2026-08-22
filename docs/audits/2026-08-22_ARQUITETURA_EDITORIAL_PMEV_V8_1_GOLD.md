# Auditoria editorial e arquitetura didática PMev v8.1 GOLD

**Data:** 2026-08-22
**Escopo:** superfície pública de aulas e biblioteca em
`frontend/src/app/(public)`.
**Estado:** implementação local validada; publicação remota permanece bloqueada
exclusivamente pela conta GitHub/LFS.

## Decisão arquitetural

O produto deixou de manter duas verdades paralelas: um índice manual da
Biblioteca e um manifesto pontual de proveniência.
`frontend/src/content/editorialManifest.ts` passa a ser o catálogo canônico de
unidades estáticas, com:

- rota, título, resumo e categoria;
- tipo de conteúdo e estágio didático;
- nível de evidência, fontes, limitações e versão;
- pré-requisitos e próximos passos quando definidos.

O índice deriva desse catálogo. As rotas de `aulas` e `biblioteca` recebem um
painel responsivo comum de contexto editorial. Conteúdo dinâmico sem entrada
versionada não recebe selo: permanece `review_required` no seu painel próprio.

## Cobertura medida

| Elemento                                            |                       Resultado |
| --------------------------------------------------- | ------------------------------: |
| Unidades de Biblioteca catalogadas                  |                              26 |
| Aulas estáticas catalogadas                         |                               4 |
| Categorias públicas derivadas                       |                               5 |
| Entradas PMev declaradas como hipótese              |                              16 |
| Laboratório com mecanismo/código local identificado |                               1 |
| Itens sem selo de validação por falta de artefato   | mantidos como `review_required` |

## Correções epistemológicas materiais

1. **PMev:** apresentada como extensão em pesquisa que recupera ICM no baseline,
   não como substituição validada.
2. **BF/RP:** preservados como base conceitual, com conversões limitadas ao caso
   binário simétrico e sem teto universal.
3. **EV do fold:** a convenção incremental foi explicitada; investimento prévio
   não foi mais apresentado como EV de fold por definição.
4. **Pot odds, RIO, D6, PER e Ψ:** reclassificados como componentes, hipóteses
   ou visualizações dependentes de árvore e calibração.
5. **Números de cenário:** 78%, 45%, 30%, 6%, 40% e frequências de exemplos
   perderam status de invariantes; agora são explicitamente condicionais.
6. **Smart Sniper e motores WASM:** a linguagem mudou de “prova/superioridade
   validada” para protocolo que exige baseline, dados, seed, incerteza e
   replicação.

## O que esta entrega não afirma

- Não reescreve cada parágrafo de cada ensaio histórico.
- Não declara validação científica de PMev, Smart Sniper, Downward Drift, fator
  Ψ, RIO ou Teto de RP.
- Não converte simuladores em solvers pós-flop completos.
- Não substitui a futura ingestão do corpus teórico por uma etapa de curadoria,
  deduplicação, fonte primária e experimento reproduzível.

## Verificação desta entrega

| Gate                        | Resultado                |
| --------------------------- | ------------------------ |
| ESLint do frontend          | passou                   |
| TypeScript audit            | passou                   |
| Teste de catálogo editorial | 5/5 passou               |
| `git diff --check`          | passou                   |
| Build Next.js               | passou; 53 rotas geradas |

## Próxima unidade de maior retorno

1. Extrair cada simulador para um contrato de cenário versionado: inputs,
   ranges, payouts, código, seed, versão do motor e output esperado.
2. Conectar apenas cenários com esse contrato ao nível
   `reproducible_experiment`.
3. Ingerir o corpus PMev como fontes separadas (original, adaptação didática,
   hipótese, resultado) antes de qualquer afirmação forte no frontend.
