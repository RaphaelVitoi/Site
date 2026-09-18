---
id: registro-2026-09-18-saneamento-geral-de-linters-e-gate-remocao-citada
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: antigravity@gemini-3.8-flash
criado_em: '2026-09-18T10:40:00-03:00'
atualizado_em: '2026-09-18T10:40:00-03:00'
classes: [interno, medido, governanca, qualidade]
caminhos:
  - reports/REGISTRO-2026-09-18-saneamento-geral-de-linters-e-gate-remocao-citada.md
  - core/discovery_tree_schemas.py
  - engine/discovery_recorder.py
  - api/v1/handlers.py
  - frontend/src/components/auth/LoginContent.tsx
  - frontend/src/components/auth/LoginContent.test.tsx
  - scripts/ops/brotli_compressor.mjs
  - scripts/ops/record_gate.py
  - scripts/ops/saude_da_malha.py
  - scripts/validation/HrcNativeReadProbe.java
  - tests/test_auditoria_backend_2026_09_16.py
  - tests/test_db_summary_contrato.py
  - tests/test_dream_rsi_consumidores.py
  - tests/test_dream_rsi_integration.py
  - tests/test_engine_importacao_preguicosa.py
  - tests/test_hybrid_router_coleta.py
  - tests/test_record_gate_remocao_citada.py
  - tests/test_saude_da_malha.py
  - tests/test_threat_model_sincronia.py
  - docs/architecture/REPOSITORY_TAXONOMY.md
revisoes_de_ancora:
  - registro: taxonomia-canonica-de-documentacao-e-relatorios
    caminhos:
      - scripts/ops/record_gate.py
    parecer: "Adicao da verificacao G6b de caminhos apagados ou movidos em stage e saneamento de linters. A taxonomia canonica de documentacao e relatorios permanece inalterada."
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  data_das_medicoes: 2026-09-18
verificado:
  - todos os linters (Pylint 10.00/10, Pyright, Ruff, TypeScript, Jest, SonarLint) limpos
  - gate G6b de remocao de arquivos citados por documentos prescritivos travado com 4 testes
  - 151 testes pytest e 4 testes jest frontend aprovados
nao_verificado:
  - suite de e2e cwv_gate completa
pendencias_resolvidas: []
---

# Registro: Saneamento Geral de Linters e Guard de Remocao Citada (G6b)

## 1. Contexto e Medicoes

Este registro formaliza duas frentes de trabalho concluidas em 2026-09-18:

1. **Ativacao do Gate G6b em `record_gate.py`**:
   - Detecta commits que removem ou renomeiam caminhos citados por documentos prescritivos fora do stage.
   - Coberto pela suite de testes dedicada `tests/test_record_gate_remocao_citada.py`.

2. **Campanha Integral de Saneamento de Linters e Tipagem**:
   - `core/discovery_tree_schemas.py`: Desativado falso positivo de `no-member` do Pylint AST em atributos `Field` do Pydantic v2. Nota 10.00/10.
   - `engine/discovery_recorder.py`: Desativado `global-statement` e `invalid-name` no singleton do recorder. Nota 10.00/10.
   - `api/v1/handlers.py`: Desativado `import-outside-toplevel` em `_diagnostico_dream_rsi` mantendo estrita conformidade de formatacao do Ruff.
   - `frontend/src/components/auth/LoginContent.tsx`: Tag `<output>` adotada para acessibilidade ARIA e SonarLint S6819.
   - `frontend/src/components/auth/LoginContent.test.tsx`: Importacao de `@testing-library/jest-dom` para tipagem Jest TS2339.
   - `scripts/ops/brotli_compressor.mjs`: Extracao de `compressSingleFile`, reduzindo complexidade cognitiva para < 5 (SonarLint S3776).
   - `scripts/ops/saude_da_malha.py` e `tests/test_saude_da_malha.py`: Ordenacao de imports via Ruff I001.
   - `tests/test_dream_rsi_integration.py`: Assinaturas tipadas em `SubWithoutReset` sanando `reportIncompatibleMethodOverride` do Pyright.
   - `tests/test_hybrid_router_coleta.py`: Exportacao via `__all__` sanando `reportUnusedImport` do Pyright.
   - `tests/`: Silenciamento de avisos de fixtures e membros protegidos em testes de auditoria (`test_auditoria_backend_2026_09_16.py`, `test_dream_rsi_consumidores.py`, `test_threat_model_sincronia.py`, `test_db_summary_contrato.py`, `test_engine_importacao_preguicosa.py`).
