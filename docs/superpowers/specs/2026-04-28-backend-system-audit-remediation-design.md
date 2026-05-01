# Backend System Audit Remediation Design

Date: 2026-04-28

## Goal

Auditar e corrigir integridade sistemica do backend, com foco em:

- routing e runtime contracts
- indexacao e carregamento de contexto
- bibliotecas, imports e exports
- configuracao e fontes de verdade
- organizacao modular e caminhos
- referencias e compatibilidade retroativa
- integracao backend-frontend
- funcionalidade, seguranca e excelencia operacional

## Scope

O trabalho sera executado em camadas, preservando contratos publicos sempre que possivel.

1. Fundamentos e contratos
   Mapear entrypoints reais, exports publicos, imports legados, simbolos reexportados, caminhos absolutos/relativos, arquivos gerados indevidos no workspace e referencias quebradas.

2. Configuracao e routing
   Verificar coerencia entre `data/agents_manifest.json`, `data/intentmap.json`, `data/routing_map.json`, `data/system_config.json`, `core.config`, `core.runtime`, `task_executor` e modulos de LLM/routing.

3. Backend surface e integridade
   Revisar camada HTTP, middlewares, handlers, fila, SQLite, cache, estado global, background tasks e fluxo de erro.

4. Interconexao backend-frontend
   Validar contratos reais entre frontend e backend: endpoints, origins, payloads, nomes de campos, timeouts, URLs base e eventos de observabilidade.

5. Organizacao e refinamento
   Reduzir entropia estrutural, melhorar fronteiras modulares, harmonizar imports/exports e adicionar testes para contratos criticos.

## Constraints

- Preservar comportamento funcional existente quando nao houver bug claro.
- Evitar refactor macro sem necessidade comprovada.
- Corrigir primeiro o que afeta integridade, seguranca e comunicacao entre modulos.
- Usar testes para provar regressao e validacao de contratos.
- Manter backend em ASCII.

## Implementation Strategy

### Phase 1: Structural Inventory

- identificar entrypoints reais do backend e bridges para o frontend
- localizar imports quebrados, simbolos duplicados, reexports faltantes e caminhos inconsistentes
- catalogar arquivos build/generated que estao poluindo a arvore viva

### Phase 2: Contract Hardening

- centralizar ou alinhar fontes de verdade de runtime/config
- corrigir incompatibilidades de routing, cache, modelos e referencias internas
- padronizar fronteiras entre `task_executor`, `core.runtime` e modulos especializados

### Phase 3: End-to-End Integration

- revisar consumo do frontend sobre a API local
- validar payloads e respostas
- alinhar CORS/origins/URLs base e logs/eventos

### Phase 4: Refinement

- limpar imports mortos e compatibilidade acidental
- consolidar testes de integridade sistemica
- documentar contratos que nao podem voltar a quebrar

## Testing Plan

- testes focados para contratos de backend endurecidos
- testes de routing/config para fontes de verdade
- testes de integracao leve entre frontend e backend quando possivel
- execucao final da suite inteira existente

## Risks

- acoplamento legado em `task_executor`
- referencias indiretas via hot-reload/runtime global
- artefatos de build dentro do workspace podendo confundir discovery e auditoria
- frontend consumindo contratos informais nao documentados

## Expected Outcome

Ao final, o backend deve apresentar:

- contratos internos coerentes
- routing e configuracao harmonizados
- imports/exports previsiveis
- caminhos e referencias integras
- melhor comunicacao backend-frontend
- testes cobrindo os principais pontos de regressao
