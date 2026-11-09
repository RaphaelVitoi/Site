---
id: registro-2026-11-09-idempotencia-socket-laya-gpu-serve
tipo: registro
escopo: resolucao-winerror-10048-idempotencia-microservico-laya-gpu
autor: Raphael Vitoi / Gemini 3.8 Flash <noreply@google.com>
criado_em: '2026-11-09'
classes:
  - interno
  - medido
  - governanca
  - registro
  - laya
  - ops
verificado:
  - Inspecao do erro de colapso de socket WinError 10048 (WSAEADDRINUSE) ao executar homologar_laya_gpu.py --serve na porta 8192
  - Deteccao de que a porta 8192 ja estava ativa e respondendo com pesos carregados de mmBERT-base (322M)
  - Implementacao de pre-verificacao de socket ativo e integridade do endpoint /health antes do warmup de tensores
  - Retorno idempotente imediato (status 0) sem timeout ou crash de porta ja ocupada por instancia saudavel de Laya
nao_verificado:
  - Alteracao nos pesos ou arquitetura do modelo mmBERT-base de 322M
config_medida:
  congelada_em: '2026-11-09'
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  data_das_medicoes: '2026-11-09'
  toolchain: pytest + uv + record_gate.py + ruff + pyright
  python: 3.14.9
  so: Windows
caminhos:
  - reports/REGISTRO-2026-11-09-idempotencia-socket-laya-gpu-serve.md
  - scripts/ops/homologar_laya_gpu.py
  - task_log.md
revisoes_de_ancora:
  - registro: registro-2026-09-24-blindagem-ascii-e-harmonizacao-scripts
    caminhos:
      - scripts/ops/homologar_laya_gpu.py
    parecer: 'Reconciliacao em 2026-11-09: inclusao de verificacao de idempotencia de socket (host, port) prevenindo WinError 10048.'
  - registro: registro-2026-09-29-saneamento-lint-e-calibracao
    caminhos:
      - scripts/ops/homologar_laya_gpu.py
    parecer: 'Reconciliacao em 2026-11-09: manutencao de estrita conformidade Ruff com http.client nativo, Pyright zero-errors e tipagem pura.'
---

# REGISTRO: Idempotência de Socket e Proteção de Startup no Servidor Laya GPU

## 1. Contexto e Causa Raiz
Ao invocar `python scripts/ops/homologar_laya_gpu.py --serve --port 8192` quando o microserviço Laya S1 já se encontra ativo na porta 8192 (ex: via background task ou `Start-LayaService.ps1`), o script executava o ciclo completo de warmup dos tensores mmBERT-base 322M (~20 segundos) e, em seguida, falhava com `[Errno 10048] normalmente e permitida apenas uma utilizacao de cada endereco de soquete`.

## 2. Ação e Remediação SOTA
1. **Deteccao Previa de Socket (`verificar_porta_ativa`):** O script agora testa a disponibilidade da porta antes de carregar tensores em memoria.
2. **Validacao de Saude (`verificar_servico_laya_saudavel`):** Se a porta estiver aberta, o script sonda o endpoint `/health`. Se Laya ja estiver ativo com `weights_ready: True`, emite log informativo e encerra com exit code 0 em <1 segundo, de forma 100% idempotente.
3. **Erros Deterministicos:** Se a porta estiver ocupada por processo nao-Laya, o script falha com mensagem explicita sem desperdicio de computacao.
