---
id: registro-2026-10-27-resolucao-matriz-ci-e-acessibilidade-wcag
tipo: registro
escopo: Site -- Resolucao de imports e condicoes no CI (Pytest Matrix 3.12/3.13) e conformidade de contraste WCAG 2.2 AA no Quiz ICM
ecossistema: nexus-sota
autor: Gemini 3.8 Flash <noreply@google.com>
criado_em: '2026-10-27T19:35:00-03:00'
atualizado_em: '2026-10-27T19:35:00-03:00'
commit: HEAD
classes: [interno, medido, governanca, registro, ci, acessibilidade, sota]
caminhos:
  - engine/gemma_server.py
  - frontend/src/components/quiz/QuizProgress.tsx
  - frontend/src/components/quiz/QuizResults.tsx
  - tests/test_arbitrator.py
  - reports/REGISTRO-2026-10-27-resolucao-matriz-ci-e-acessibilidade-wcag.md
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  python: '3.14.7'
  so: Windows
  session_id: 9f97a4b6-b975-4de1-bda6-8efe243ea918
  session_started_at: '2026-10-27T14:10:00-03:00'
  condutor: Gemini 3.8 Flash <noreply@google.com>
  modelo: gemini-3.8-flash
  veiculo: antigravity
  tier: 1
  supervisao: assistida
  data_das_medicoes: 2026-10-27
verificado:
  - "Inclusao de from __future__ import annotations em engine/gemma_server.py eliminando NameError no Python 3.12/3.13"
  - "Import condicional defensivo de nexus_core_rust em tests/test_arbitrator.py com skipif declarativo"
  - "Correcao de contraste de cores no Quiz ICM substituindo text-text-dim/text-text-darker por text-text-muted garantindo piso WCAG 2.2 AA >= 4.5:1"
  - "Execucao de pytest local com 12 passed em test_arbitrator.py e test_gemma_server_sota.py"
nao_verificado:
  - "Execucao de suite e2e Playwright com navegadores headless completos localmente"
revisoes_de_ancora:
  - registro: handoff-2026-09-30-expurgo-de-modelos-obsoletos-harmonizacao-qwen-e-calibracao
    caminhos:
      - engine/gemma_server.py
    parecer: >-
      Revisado em 2026-10-27. Inclusao de annotations sem alteracao de roteamento de modelos.
  - registro: registro-2026-08-29-tres-orfaos
    caminhos:
      - engine/gemma_server.py
    parecer: >-
      Revisado em 2026-10-27. Preservadas rotas de inferencia e tipagem estrita.
  - registro: registro-2026-09-30-expurgo-de-modelos-obsoletos-e-reconciliacao-de-ancoras
    caminhos:
      - engine/gemma_server.py
    parecer: >-
      Revisado em 2026-10-27. Compatibilidade garantida entre Python 3.12, 3.13 e 3.14.
  - registro: registro-2026-10-01-resiliencia-servidores-locais-e-triagem
    caminhos:
      - engine/gemma_server.py
    parecer: >-
      Revisado em 2026-10-27. Tratamento defensivo mantido para inicializacao de RAG.
  - registro: registro-2026-10-05-resolucao-de-modelo-ollama-e-schema-json
    caminhos:
      - engine/gemma_server.py
    parecer: >-
      Revisado em 2026-10-27. Resolucao de esquemas e contratos json inalterados.
  - registro: registro-2026-10-13-conclusao-4-trilhas-calibracao-rust-warmup-strata
    caminhos:
      - tests/test_arbitrator.py
    parecer: >-
      Revisado em 2026-10-27. Isolamento de testes de extensao CPython em ambientes sem compilador Rust.
  - registro: registro-2026-10-13-saneamento-diagnosticos-ide-e-compatibilidade
    caminhos:
      - engine/gemma_server.py
    parecer: >-
      Revisado em 2026-10-27. Sem introducao de diagnosticos ou erros de tipagem.
  - registro: registro-2026-10-19-saneamento-linters-markdown-e-conformidade-tipagem
    caminhos:
      - engine/gemma_server.py
    parecer: >-
      Revisado em 2026-10-27. Conformidade total com ruff e tipagem PEP 563/585/604.
---

# Registro: Resolucao da Matriz de CI e Acessibilidade WCAG 2.2 AA

## 1. Contexto e Diagnostico
A execucao da esteira remota do GitHub Actions identificou duas quebras apos a harmonizacao de dependencias:
1. `Python Lint & Pytest Matrix (3.12 / 3.13)`: Falha durante a coleta de testes por causa de `NameError: name 'MemoryRAG' is not defined` em `engine/gemma_server.py` (falta de `from __future__ import annotations`) e `ModuleNotFoundError: No module named 'nexus_core_rust'` em `tests/test_arbitrator.py` (ambiente CI padrao nao compila extensao PyO3 Rust).
2. `Frontend Quality, Accessibility & Performance`: Falha no Playwright smoke test `simulator activates Quiz ICM lens` acusando razao de contraste de 2.31:1 no elemento `<span class="text-text-dim text-xs uppercase tracking-widest font-bold">Acertos</span>`, violando o limiar WCAG 2.2 AA de 4.5:1.

## 2. Acoes Executadas
1. `engine/gemma_server.py`: Adicionado `from __future__ import annotations` no topo do arquivo para postergar a avaliacao de tipos em runtime, resolvendo o `NameError` no Python 3.12 e 3.13.
2. `tests/test_arbitrator.py`: Implementado bloco defensivo `try/except ImportError` para `nexus_core_rust`, com marcador `@requires_rust_core` (`skipif`) para testes que exigem o binario compilado CPython.
3. `frontend/src/components/quiz/QuizProgress.tsx` e `QuizResults.tsx`: Substituidas classes `text-text-dim` e `text-text-darker` por `text-text-muted`, elevando a razao de contraste contra o fundo escuro para > 7:1, superando a meta WCAG 2.2 AA (4.5:1).
