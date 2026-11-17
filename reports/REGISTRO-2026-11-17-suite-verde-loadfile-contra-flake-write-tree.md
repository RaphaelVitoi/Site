---
id: registro-2026-11-17-suite-verde-loadfile-contra-flake-write-tree
tipo: registro
escopo: "Site -- suite_verde passa a invocar pytest-xdist com --dist loadfile para serializar por arquivo os testes que medem o indice git real (test_hook_commit_msg), eliminando a colisao de 'git write-tree' no .git/index.lock que reprovava commits inocentes"
ecossistema: nexus-sota
autor: "Devin (SWE-2 Flash) <158243242+devin-ai-integration[bot]@users.noreply.github.com>"
criado_em: "2026-11-17T09:20:00-03:00"
atualizado_em: "2026-11-17T09:20:00-03:00"
commit: HEAD
classes:
  - interno
  - medido
  - governanca
  - registro
caminhos:
  - scripts/ops/suite_verde.py
  - reports/REGISTRO-2026-11-17-suite-verde-loadfile-contra-flake-write-tree.md
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  condutor: Devin (SWE-2 Flash)
  veiculo: devin-desktop
  tier: 1
  supervisao: assistida
  data_das_medicoes: 2026-11-17
verificado:
  - "Causa raiz medida: pytest-xdist --dist load (padrao) distribui CASOS de teste; test_hook_commit_msg chama 'git write-tree' no indice real de RAIZ e o hook .husky/commit-msg tambem; colisao no .git/index.lock devolve sha vazio -> 'Assinatura incompleta; campos ausentes: sha='"
  - "3 rodadas de suite dentro de git commit reprovaram, cada uma com exatamente 1 caso aleatorio de test_hook_commit_msg falhando; a mesma suite em isolamento (-n 1) passa 4/4"
  - "pytest tests/test_suite_verde.py -q: 25 passed apos a mudanca; ruff check/format limpos"
  - "Guarda implementada: --dist loadfile so e acrescido quando ha xdist com workers >0 e nenhum --dist explicito; '-n 0', '-p no:xdist' e '--dist' do chamador prevalecem"
nao_verificado:
  - "Suite integral sob --dist loadfile ainda nao medida isoladamente; sera exercida pelo pre-commit deste commit"
  - "Colisao residual com 'git status' de IDE externo permanece teoricamente possivel, mas sem write-tree concorrente dentro da suite a janela cai a quase zero"
revisoes_de_ancora:
  - registro: auditoria-2026-09-12-o-ci-vermelho-que-nenhum-portao-local-media
    caminhos:
      - scripts/ops/suite_verde.py
    parecer: "Revisado em 2026-11-17. suite_verde passa a emitir --dist loadfile na invocacao do pytest-xdist; logica de cache por arvore de conteudo, trava e marcadores inalterada."
  - registro: handoff-2026-09-23-ci-ram-e-rustfmt-staged
    caminhos:
      - scripts/ops/suite_verde.py
    parecer: "Revisado em 2026-11-17. Apenas o modo de distribuicao do xdist muda (load->loadfile); a suite continua medindo a mesma arvore e gravando o mesmo marcador."
  - registro: handoff-2026-09-23-nucleo-mcp-curadoria-codex
    caminhos:
      - scripts/ops/suite_verde.py
    parecer: "Revisado em 2026-11-17. Apenas o modo de distribuicao do xdist muda (load->loadfile); a suite continua medindo a mesma arvore e gravando o mesmo marcador."
  - registro: handoff-2026-10-05-fechamento-do-ciclo-medicoes-cwv-e-cacheabilidade
    caminhos:
      - scripts/ops/suite_verde.py
    parecer: "Revisado em 2026-11-17. Apenas o modo de distribuicao do xdist muda (load->loadfile); a suite continua medindo a mesma arvore e gravando o mesmo marcador."
  - registro: registro-2026-09-13-append-em-jsonl-e-suite-em-todos-os-nucleos
    caminhos:
      - scripts/ops/suite_verde.py
    parecer: "Revisado em 2026-11-17. Apenas o modo de distribuicao do xdist muda (load->loadfile); a suite continua medindo a mesma arvore e gravando o mesmo marcador."
  - registro: registro-2026-09-23-otimizacao-cache-suite-verde-e-paralelismo
    caminhos:
      - scripts/ops/suite_verde.py
    parecer: "Revisado em 2026-11-17. O paralelismo entre ARQUIVOS de teste e preservado (loadfile agrupa por arquivo, nao por caso); apenas a colisao intra-arquivo no indice git real e eliminada."
  - registro: registro-2026-09-25-fechamento-pendencia-ci-ram
    caminhos:
      - scripts/ops/suite_verde.py
    parecer: "Revisado em 2026-11-17. Apenas o modo de distribuicao do xdist muda (load->loadfile); a suite continua medindo a mesma arvore e gravando o mesmo marcador."
  - registro: registro-2026-10-04-http-metrics-correlation-e-worker-shutdown
    caminhos:
      - scripts/ops/suite_verde.py
    parecer: "Revisado em 2026-11-17. Apenas o modo de distribuicao do xdist muda (load->loadfile); a suite continua medindo a mesma arvore e gravando o mesmo marcador."
  - registro: registro-2026-10-18-resolucao-sonarqube-e-saneamento-global
    caminhos:
      - scripts/ops/suite_verde.py
    parecer: "Revisado em 2026-11-17. Apenas o modo de distribuicao do xdist muda (load->loadfile); a suite continua medindo a mesma arvore e gravando o mesmo marcador."
---

# suite_verde: --dist loadfile contra flake de git write-tree

## O achado

Três commits consecutivos reprovaram a suite com exatamente uma falha cada,
sempre em `tests/test_hook_commit_msg.py`, sempre em caso aleatório, sempre
com `Assinatura incompleta; campos ausentes: sha=`.

Mecanismo medido:

1. `pytest -n 6` usa `--dist load` (padrão do xdist): casos de teste de um
   mesmo arquivo podem cair em workers diferentes.
2. `test_hook_commit_msg.py` chama `git write-tree` no índice **real** do
   repositório para montar a assinatura, e cada caso dispara
   `.husky/commit-msg`, que também roda `git write-tree`.
3. `git write-tree` precisa de `.git/index.lock`; sob concorrência ele falha
   e o teste devolve `sha=` vazio — o hook rejeita a assinatura.

Prova de isolamento: o mesmo arquivo passa 4/4 com `-n 1`.

## A correção

`suite_verde.rodar_suite` passa a anexar `--dist loadfile` quando o xdist
está ativo com workers > 0. `loadfile` mantém o arquivo inteiro num único
worker: os `write-tree` do `test_hook_commit_msg` serializam, e o
paralelismo entre arquivos de teste é preservado.

Guardas: não se aplica com `-n 0`, `-p no:xdist`, `--dist` explícito do
chamador, ou xdist ausente.

## Verificação

`pytest tests/test_suite_verde.py` — 25 passed. `ruff check`/`format` limpos.
A suite integral sob `loadfile` é exercida pelo próprio pre-commit deste
commit.

## Risco residual declarado

`git status` de um watcher de IDE pode ainda tomar `index.lock`
transitoriamente; sem `write-tree` concorrente dentro da suite, a janela
praticamente fecha. Se recorrer, o próximo passo é retry em `_tree_sha()`.

## revisoes_de_ancora

9 registros vigentes ancoram `scripts/ops/suite_verde.py`; cada um recebeu
parecer datado na mesma entrega, conforme M.O. 13.F.
