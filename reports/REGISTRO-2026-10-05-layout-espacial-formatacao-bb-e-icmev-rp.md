---
id: registro-2026-10-05-layout-espacial-formatacao-bb-e-icmev-rp
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: Gemini 3.8 Flash [Tier 1]
criado_em: 2026-10-05
commit: HEAD
classes: [interno, medido, frontend, acessibilidade, simulador]
caminhos:
  - frontend/src/components/simulator/hooks/useMasterSpotLogic.ts
  - frontend/src/components/simulator/hooks/useQuantumEngine.ts
  - frontend/src/components/simulator/solver/scenarios.ts
  - frontend/src/components/simulator/ui/MasterTableVisualizer.tsx
  - frontend/src/components/simulator/ui/SpatialControls.tsx
  - frontend/src/components/ui/layout/SotaMarkdown.tsx
  - frontend/src/tests/simulator/masterTableAndSpatialControls.test.tsx
  - reports/REGISTRO-2026-10-05-layout-espacial-formatacao-bb-e-icmev-rp.md
revisoes_de_ancora:
  - registro: auditoria-2026-10-02-frontend-sota-subagents
    caminhos:
      - frontend/src/components/simulator/hooks/useMasterSpotLogic.ts
      - frontend/src/components/simulator/hooks/useQuantumEngine.ts
    parecer: >-
      Revisado em 2026-10-05. Os hooks useMasterSpotLogic e useQuantumEngine
      tiveram o predicado isBaseline corrigido para verificar exclusivamente
      o id do cenario (scenario.id === 'chipev') em vez da categoria inteira,
      preservando o Risk Premium positivo e genuino do cenario icmev-puro
      sem alterar as demais rotinas quanticas ou dependencias de hooks.
  - registro: handoff-2026-10-02-frontend-sota-harmonizacao
    caminhos:
      - frontend/src/components/simulator/hooks/useMasterSpotLogic.ts
      - frontend/src/components/simulator/hooks/useQuantumEngine.ts
    parecer: >-
      Revisado em 2026-10-05. A correcao em useMasterSpotLogic e useQuantumEngine
      restaura o calculo de Risk Premium tradicional para cenarios de categoria
      baseline que possuam estrutura de premiacao (como o ICMev puro), mantendo
      a integridade de renderizacao e contratos estabelecidos.
  - registro: 2026-09-22-auditoria-frontend-4-itens
    caminhos:
      - frontend/src/components/ui/layout/SotaMarkdown.tsx
    parecer: >-
      Revisado em 2026-10-05. O componente SotaMarkdown recebeu normalizacao
      preventiva de regex para converter tags HTML residuais (strong, b, em, i)
      em marcadores Markdown validos antes do parsing, evitando que codigo HTML
      vaze para o DOM como texto puro sem alterar os contratos de seguranca.
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  commit: HEAD
  python: 3.14.7
  node: 24.21.0
verificado:
  - "Reestruturacao dos controles espaciais em arquitetura 3+2 colunas, eliminando truncamento de texto e aperto visual"
  - "Formatacao de BBs na mesa e no pote central dispensando .0 em inteiros (formatBb) e mantendo decimais em fracoes reais"
  - "Destaque dos oponentes em cenarios com seus Risk Premiums e papeis taticos explicitos (Vice CL x CL, etc.)"
  - "Normalizacao de tags HTML em markdown em SotaMarkdown e saneamento de tags em scenarios.ts"
  - "Correcao do Risk Premium do cenario ICMev Puro para refletir o modelo tradicional de ICM (18.5% RP)"
  - "Suite de testes unitarios em masterTableAndSpatialControls.test.tsx aprovada com 100% de sucesso (9/9)"
nao_verificado:
  - "Auditoria visual em browsers legados (apenas Chromium e ambiente Jest validados)"
supersede: null
---

# Registro: Layout Espacial 3+2, Formatacao de BB sem .0, Normalizacao de Markdown e RP do ICMev

## 1. Contexto e Motivacao
Apos auditoria visual e ergonomica do simulador, foram identificados os seguintes pontos de atrito:
1. Os titulos das caixas de input em SpatialControls estavam muito proximos uns dos outros, truncados com reticencias (...) e com baixa legibilidade devido a divisao em 5 colunas estreitas.
2. A mesa falhava em destacar com clareza os oponentes da situacao (ex: Vice CL x CL no cenario Pacto, SB CL no cenario Sniper) e exibir seus Risk Premiums calculados.
3. Textos didaticos exibiam tags literais `<strong>` e `</em>` por falta de processamento de HTML em react-markdown.
4. O numero de BBs que representa cada stack na mesa e o pote central mantinha `.0` desnecessario em numeros inteiros (ex: `25.0 BB`, `90.0 BB`).
5. O cenario ICMev Tradicional (icmev-puro) estava zerando o Risk Premium como se fosse ChipEV.

## 2. Implementacoes Realizadas
- **SpatialControls.tsx**: Reorganizado o layout de grid em duas linhas (3 colunas na linha 1: Posicao, Sunk Cost, Pote Atual; 2 colunas na linha 2: Jogadores Ativos, FGS / Erosao Temporal), com badges informativos (HU/MULTIWAY, AUTO/MANUAL) e campos amplos sem truncamento.
- **MasterTableVisualizer.tsx**: Introduzida a funcao `formatBb(val)` que remove `.0` para numeros inteiros e mantem 1 casa decimal para valores fracionarios. Adicionados badges e halos de destaque para os assentos protagonistas do cenario com seus Risk Premiums.
- **SotaMarkdown.tsx**: Inserida normalizacao via regex para transformar tags `<strong>`, `<b>`, `<em>` e `<i>` em marcadores Markdown padrao (`**` e `*`).
- **scenarios.ts**: Substituidas tags HTML residuais nas descricoes teoricas dos cenarios por markdown padrao.
- **useMasterSpotLogic.ts & useQuantumEngine.ts**: Ajustada a condicao `isBaseline` para `scenario.id === 'chipev'`, garantindo que o cenario `icmev-puro` retenha seu Risk Premium genuino de 18.5%.
- **masterTableAndSpatialControls.test.tsx**: Criada suite com 9 testes automatizados validando toda a regressao e contratos.

## 3. Verificacoes e Medicoes
- `npm --workspace frontend run test -- masterTableAndSpatialControls.test.tsx`: 9 passed, 0 errors, 0 warnings.
- `npm run typecheck`: 0 erros.
- `npm run lint`: 0 erros.
- `.venv/Scripts/python.exe tests/test_classes_de_cor_nao_emitidas.py`: 2 passed, 0 erros, 0 warnings.
- `scripts/ops/record_gate.py`: Portao de ancoras reconciliado e aprovado.
