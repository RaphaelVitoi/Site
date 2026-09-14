---
id: registro-2026-09-14-saneamento-linter-e-tipagem-tests-e-skills
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: gemini@antigravity
criado_em: '2026-09-14T10:15:00-03:00'
atualizado_em: '2026-09-14T10:15:00-03:00'
classes: [interno, medido, linters, testes, typescript, python]
session_id: 52cfd2b2-9d34-4044-ba76-7a6621dec5a1
conductor_model: gemini-3.8-flash
conductor_vehicle: antigravity-ide
supervision_mode: assistida
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  so: Windows
  python: '3.12'
  congelada_em: '2026-09-14'
caminhos:
  - .agents/skills/poker-pmev-knowledge-engine/scripts/curate_index.py
  - .agents/skills/poker-pmev-knowledge-engine/scripts/universal_reader.py
  - .vscode/settings.json
  - frontend/src/tests/simulator/engineExecutionGateway.test.ts
  - frontend/src/tests/simulator/engineParity.test.ts
  - frontend/src/tests/simulator/pluribusWasmParity.test.ts
  - tests/test_adapters_anthropic_http.py
  - tests/test_agent_calibration_provenance.py
  - tests/test_pmev_scenario.py
  - tests/test_record_gate_merge.py
  - tests/test_record_index.py
  - tests/test_skill_pmev_knowledge.py
  - tests/test_suite_verde.py
revisoes_de_ancora:
  - registro: auditoria-2026-09-12-proveniencia-executavel-do-feedback
    caminhos:
      - tests/test_agent_calibration_provenance.py
    parecer: Saneamento estrito de linter promovendo importacoes para o topo do modulo e removendo fixture tmp_path nao utilizada no teste de campo ausente.
  - registro: handoff-2026-09-12-reconciliacao-calibracao-e-proveniencia
    caminhos:
      - tests/test_agent_calibration_provenance.py
    parecer: Saneamento estrito de linter promovendo importacoes para o topo do modulo e removendo fixture tmp_path nao utilizada no teste de campo ausente.
verificado:
  - pyright em todos os arquivos alterados com zero erros e zero warnings
  - ruff check em todos os testes e scripts alterados com all checks passed
  - jest suites frontend simulator aprovadas com 11 testes verdes
  - pytest suites backend aprovadas com 102 testes verdes
  - cwv_gate pre-commit audit executado com sucesso e zero erros
nao_verificado:
  - compilacao de HrcNativeReadProbe com HRC real no filesystem nesta rodada
---

# Registro de Saneamento de Linters e Tipagem em Testes e Skills

## 1. Contexto e Motivacao

Saneamento sistematico de apontamentos de linter (Pylance/Pyright, Ruff, ESLint e TypeScript compiler) sob Target Lock em arquivos de scripts e suites de testes Python e Frontend.

## 2. Modificacoes Realizadas

1. **Skills (`universal_reader.py` e `curate_index.py`)**:
   - Ajuste de tipagem `_xlsx` com `cast(Iterable[Iterable[Any]], ...)` para eliminacao de conflito de tipo `object` incompativel com `Iterable`.
   - Prefixacao de variaveis de controle de tamanho nao consumidas com `_max_chars: int`.
   - Reorganizacao de importacoes no topo do modulo.

2. **Frontend Testes do Simulador**:
   - `pluribusWasmParity.test.ts`: Ajuste para conformidade com `exactOptionalPropertyTypes: true` utilizando tipos estritos `TablePosition` e `TableStreet`.
   - `engineParity.test.ts`: Castings pontuais de posicoes e streets carregados de JSON.
   - `engineExecutionGateway.test.ts`: Assinatura explicita de `fetchMock` e desestruturacao segura de `mock.calls[0]`.

3. **Suites de Testes Python**:
   - `test_skill_pmev_knowledge.py`: Guard de narrowing para o binario do Node.js.
   - `test_suite_verde.py`: Remocao de `import sys` nao utilizado e protecao de `ModuleSpec`.
   - `test_agent_calibration_provenance.py`: Promocao de imports para top-level e remocao de `tmp_path` desnecessario.
   - `test_record_gate_merge.py`: Atribuicao com supressao direcionada para `RAIZ` de `ModuleType`.
   - `test_adapters_anthropic_http.py`: Simplificacao de assercoes de dicionarios vazios.
   - `test_record_index.py`: Substituicao de lambda redundante por `set` e simplificacao de comparacoes de listas vazias.
   - `test_pmev_scenario.py`: Simplificacao idiomatica de listas vazias.

4. **Configuracoes IDE (`settings.json`)**:
   - Adicao de exclusoes para scripts de validacao no analisador Java e SonarLint, neutralizando falsos positivos de classpath externo.

## 3. Validacoes

- **Pyright**: 0 erros, 0 warnings.
- **Ruff**: All checks passed!
- **Jest**: 11 testes aprovados no frontend (Status: SUCESSO VERDE).
- **Pytest**: 102 testes aprovados no backend (Status: SUCESSO VERDE).
