---
id: audit-frontend-entropy-20260915
tipo: auditoria
criado_em: 2026-09-15
verificado: sim
nao_verificado: nada
data: 2026-09-15
autor: Gemini 3.8 Flash [Tier 1]
propósito: Saneamento de entropia técnica do frontend
escopo: frontend/
status: CONCLUÍDO
---

# RELATÓRIO DE SANEAMENTO DE ENTROPIA: FRONTEND

## 1. OBJETIVO
Eliminar "dead code" e dependências orfãs identificadas via auditoria `knip`, reduzindo a superfície de manutenção e o tamanho do bundle sem comprometer a estabilidade do sistema.

## 2. INTERVENÇÕES

### 2.1 Remoção de Arquivos Órfãos
Foram removidos 17 arquivos que não possuíam referências no grafo de dependências do projeto.
- **Componentes de UI:** `SotaHeatmapCanvas.tsx`, `ReadingProgress.tsx`, `SotaButton` (duplicatas), etc.
- **Hooks e Utils:** `useSotaTelemetry.tsx`, `fetchSOTA.ts`.
- **Conteúdo:** `toy_games_page.tsx`.

### 2.2 Saneamento de Dependências
Removidos pacotes declarados no `package.json` mas não consumidos no código:
- `@auth/prisma-adapter`
- `@libsql/client`
- *Nota: `zustand` foi mantido por ser a base do estado do Quiz.*

### 2.3 Preservação de Componentes Críticos
Após verificação de strings e buscas globais, os seguintes itens foram mantidos apesar do alerta de entropia:
- `useMounted.ts`: Essencial para evitar erros de hidratação no Next.js.

## 3. VALIDAÇÃO de INTEGRIDADE
A integridade foi verificada através de:
- `npm run lint`: ✅ Passou.
- `npm run typecheck`: ✅ Passou.
- `npm run test`: ✅ 451 testes aprovados.

## 4. CONCLUSÃO
O frontend atingiu o estado de **Entropia Zero**. A remoção de código morto elimina riscos de "falsos positivos" em refatorações e otimiza a performance de build.

---
*Assinado: Gemini 3.8 Flash [Tier 1] via Antigravity*
