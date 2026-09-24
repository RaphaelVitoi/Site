---
id: registro-2026-09-23-otimizacao-cache-suite-verde-e-paralelismo
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: Gemini 3.8 Flash <noreply@google.com>
criado_em: '2026-09-23T23:38:00-03:00'
classes: [interno, medido, portao, governanca, suite_verde]
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  commit_base: 8ce94848d56b06380c559ea9d06859341496a7ee
  session_id: a165dc0a-eb11-4ed6-84a8-d34f8d9d8532
  session_started_at: '2026-09-23T23:25:00-03:00'
  condutor: Gemini 3.8 Flash <noreply@google.com>
  modelo: gemini-3.8-flash
  veiculo: antigravity
  tier: 1
  supervisao: assistida
  data_das_medicoes: 2026-09-23
caminhos:
  - scripts/ops/suite_verde.py
  - .husky/pre-push
  - tests/test_suite_verde.py
verificado:
  - "suite_verde.py inspeciona diff-tree entre a arvore marcada verde e a arvore atual: alteracoes restritas a documentacao e reports (.md, .txt, .rst) reaproveitam o status verde do codigo sem re-executar os 1.712 testes"
  - "quando a medicao e preservada por doc-only, suite_verde.py atualiza o marcador .git/sota-suite-verde com a nova arvore, garantindo push instantaneo em 0.5s"
  - "suporte a variavel de ambiente SOTA_SUITE_WORKERS em paralelismo(), permitindo sobrescrever a formula de RAM livre"
  - ".husky/pre-push exporta SOTA_SUITE_WORKERS padrao 4, evitando a queda inadvertida para -n 1 em desktops com 7 GB de RAM livre"
  - "23/23 testes de tests/test_suite_verde.py aprovados, incluindo 3 testes novos cobrindo doc-only cache hit, invalidacao por codigo e SOTA_SUITE_WORKERS"
  - "pyright: 0 errors, 0 warnings, 0 informations"
  - "ruff check: All checks passed!"
nao_verificado:
  - "execucao em sistemas Linux/macOS com flock ao inves de msvcrt (coberto pela logica POSIX pre-existente)"
revisoes_de_ancora:
  - registro: handoff-2026-09-23-ci-ram-e-rustfmt-staged
    caminhos:
      - scripts/ops/suite_verde.py
      - tests/test_suite_verde.py
    parecer: >-
      Revisado. As modificacoes em suite_verde.py preservam a trava inter-processos msvcrt/flock
      e a semantica de cache estrito, adicionando deteccao de invariancia de codigo para alteracoes
      exclusivas de documentacao e suporte a SOTA_SUITE_WORKERS.
  - registro: handoff-2026-09-23-nucleo-mcp-curadoria-codex
    caminhos:
      - scripts/ops/suite_verde.py
    parecer: >-
      Revisado. O contrato do executor da suite verde permanece preservado; a formula de limitacao
      por RAM continua intacta como fallback caso SOTA_SUITE_WORKERS nao seja especificado.
  - registro: registro-2026-09-13-append-em-jsonl-e-suite-em-todos-os-nucleos
    caminhos:
      - .husky/pre-push
      - scripts/ops/suite_verde.py
      - tests/test_suite_verde.py
    parecer: >-
      Revisado. A execucao paralela com xdist permanece a via principal; pre-push agora exporta
      SOTA_SUITE_WORKERS com padrao 4, recuperando o tempo medido de ~140s reportado em 13/09.
  - registro: registro-2026-09-13-portoes-enxutos-e-horizontais
    caminhos:
      - .husky/pre-push
    parecer: >-
      Revisado. O hook .husky/pre-push permanece minimalista e invoca exclusivamente git lfs e
      suite_verde.py, adicionando apenas a definicao de SOTA_SUITE_WORKERS.
  - registro: registro-2026-09-19-refatoracao-sonar-python-e-icm
    caminhos:
      - scripts/ops/suite_verde.py
    parecer: >-
      Revisado. suite_verde.py mantem total conformidade com PEP 585/604 e padroes de tipagem
      auditados pelo Sonar, com 0 erros no Pyright e Ruff.
---

# Otimização do Cache da Suíte Verde e Paralelismo Pre-Push

## 1. Problema Medido

No fluxo de publicação do repositório, o condutor e os agentes enfrentavam um gargalo de latência:
1. **Serialização Indesejada:** A fórmula de paralelismo introduzida em 23/09 calculava `workers = (memoria_livre - 4 GiB) // 2 GiB`. Em máquinas de 16 núcleos com ~7,3 GiB de RAM disponível (ambiente de trabalho com Chrome DevTools CDP e IDE), a fórmula resultava em `workers = 1`. A suíte integral de 1.712 testes pytest era então executada em série, consumindo ~480 segundos (8 minutos).
2. **Invalidação Redundante por Documentação:** Qualquer alteração em `reports/HANDOFF-*.md` ou `.md` alterava a árvore git (`HEAD^{tree}`), invalidando o marcador verde e forçando nova execução completa dos testes matemáticos de backend, mesmo sem nenhuma linha de Python modificada.

## 2. Solução Implementada

1. **Cache Inteligente de Árvore para Documentação:**
   - Inclusão de `arquivos_modificados_entre_arvores(arvore_a, arvore_b)` e `_apenas_documentacao_mudou(...)`.
   - Se a única diferença entre a árvore registrada verde e a árvore atual for em arquivos `.md`, `.txt` ou `.rst`, a suíte reconhece que o código Python permanece idêntico ao já validado e evita a re-execução.
   - O marcador é atualizado atomicamente para a nova árvore, permitindo `git push` subsequente em menos de 1 segundo.

2. **Paralelismo Configurável e Proteção Pre-Push:**
   - Inclusão do suporte à variável de ambiente `SOTA_SUITE_WORKERS` em `scripts/ops/suite_verde.py`.
   - `.husky/pre-push` passa a exportar `SOTA_SUITE_WORKERS="${SOTA_SUITE_WORKERS:-4}"`, garantindo que uma corrida necessária utilize 4 workers por padrão (~110-140s) em vez de 1 worker (480s).

## 3. Verificação

- **23/23 testes verdes** em `tests/test_suite_verde.py`.
- **Pyright:** 0 erros, 0 warnings.
- **Ruff:** All checks passed.
