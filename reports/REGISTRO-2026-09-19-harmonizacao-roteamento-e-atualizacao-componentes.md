---
id: registro-2026-09-19-harmonizacao-roteamento-e-atualizacao-componentes
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: antigravity@gemini-3.8-flash
criado_em: '2026-09-19T08:58:00-03:00'
atualizado_em: '2026-09-19T08:58:00-03:00'
classes: [interno, medido, frontend, governanca, qualidade]
caminhos:
  - frontend/src/app/(public)/aulas/icm-masterclass/page.tsx
  - frontend/src/app/(public)/aulas/leitura-icm/page.tsx
  - frontend/src/app/(public)/biblioteca/nos-de-calibragem/page.tsx
  - frontend/src/app/(public)/biblioteca/teoria-da-perspectiva/page.tsx
  - frontend/src/app/(user)/dashboard/page.tsx
  - frontend/src/components/analytics/TelemetryCharts.tsx
  - frontend/src/components/simulator/ReferencialAula12.tsx
  - frontend/src/components/simulator/panels/WasmTelemetryWidget.tsx
  - frontend/src/components/ui/layout/Header.tsx
  - frontend/src/constants/routes.ts
  - reports/REGISTRO-2026-09-19-harmonizacao-roteamento-e-atualizacao-componentes.md
revisoes_de_ancora:
  - registro: auditoria-2026-09-01-retrospectiva-prioridade-sessao
    caminhos:
      - frontend/src/app/(user)/dashboard/page.tsx
    parecer: >
      Adicao de atalhos de navegacao operacionais para o Explorador de Arquivos
      (/dashboard/files) e Laboratorio Quantico no painel de telemetria do operador.
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  host: Windows 11 Pro, Python 3.12+ (.venv), Node.js v22+
  data_das_medicoes: 2026-09-19
verificado:
  - registro de DASHBOARD_FILES no mestre de rotas routes.ts
  - inclusao do link Autor (quem-sou) na barra de navegacao principal do desktop em Header.tsx
  - inclusao do atalho Arquivos e Dados (dashboard/files) no submenu de Inteligencia do Header.tsx
  - integracao de cards de atalhos para Explorador de Arquivos e Laboratorio Quantico em dashboard/page.tsx
  - harmonizacao da contagem para 97 nos canonicos da Aula 1.2 em nos-de-calibragem e leitura-icm
  - sincronizacao da tabela de hipoteses em teoria-da-perspectiva com o criterio estrito de nos de aposta livre para H8
  - atualizacao de metadados e tags para SOTA v8.0 GOLD em icm-masterclass, ReferencialAula12, WasmTelemetryWidget e TelemetryCharts
  - execucao do typecheck npm run typecheck (exit 0)
  - execucao do linter npm run lint (exit 0)
  - execucao da suite de testes jest frontend (exit 0, 95 suites e 653 testes aprovados)
  - aprovacao de pre-flight record_gate.py com conciliacao de ancoras M.O. 13.F
nao_verificado:
  - nenhum item
---

# Harmonizacao de Roteamento, Integracao de Componentes e Atualizacao SOTA v8.0 GOLD

## Contexto e Escopo

Auditoria abrangente realizada nos 48 endpoints de página, rotas de API e componentes do frontend identificou oportunidades pontuais de integração e harmonização de marca:

1. **Roteamento & Acesso:**
   - A rota de visualização de acervos do operador (`/dashboard/files`) existia e possuía funcionalidade completa, porém não estava declarada em `ROUTES` nem possuía ponto de entrada direto no Header ou no Dashboard.
   - O item de menu "Autor" (`/quem-sou`) estava presente no rodapé e no drawer mobile, mas não no pill de navegação desktop do Header.
2. **Sincronização com o Repositório de Evidências:**
   - A página `nos-de-calibragem` e a lição `leitura-icm` mantinham referências residuais a "93 nós", quando a evidência canônica da Aula 1.2 consolidou 97 nós empíricos em 7 pares de textura.
   - A tabela do Ledger de 12 Hipóteses em `teoria-da-perspectiva` foi sincronizada com a refinação formal de $H_8$ restrita a nós de aposta livre ($\text{Check} \in \text{Ações}(n)$).
3. **Harmonização de Marca:**
   - Atualização das menções residuais de `v7.0 GOLD` para `v8.0 GOLD` em `icm-masterclass`, `ReferencialAula12`, `WasmTelemetryWidget` e relatórios de `TelemetryCharts`.

## Resultados das Medições

- **TypeScript:** 0 erros (`npm run typecheck` aprovado).
- **ESLint:** 0 erros e 0 avisos (`npm run lint` aprovado).
- **Jest:** 95/95 suítes aprovadas, 653/653 testes aprovados (100% verde).
- **Pre-flight de Governança:** `record_gate.py` aprovado com reconciliação formal de âncora da `auditoria-2026-09-01-retrospectiva-prioridade-sessao`.
