---
id: registro-2026-09-17-harmonizacao-nucleo-compartilhado-e-importacao-preguicosa
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: '2026-09-17T16:50:00-03:00'
atualizado_em: '2026-09-17T16:50:00-03:00'
classes: [interno, medido, backend, governanca]
caminhos:
  - reports/REGISTRO-2026-09-17-harmonizacao-nucleo-compartilhado-e-importacao-preguicosa.md
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  host: Windows 11 Pro 10.0.26200
  data_das_medicoes: 2026-09-17
verificado:
  - engine/__init__.py refatorado para importacao preguicosa sob PEP 562
  - tests/test_engine_importacao_preguicosa.py com 100% de aprovacao
  - reducao de commit privado de 527 MB para 16 MB em imports isolados
  - sincronizacao dos manifestos de MCP e plugins via nucleo compartilhado
  - suite verde passando com 20/20 testes aprovados
nao_verificado:
  - testes E2E do simulador com dev server Next em execucao continua
revisoes_de_ancora:
  - registro: taxonomia-canonica-de-documentacao-e-relatorios
    caminhos:
      - CLAUDE.md
    parecer: Atualizacao da secao 8 sobre aposentadoria de perfis de plugins e adocao do nucleo compartilhado.
  - registro: auditoria-2026-09-12-proveniencia-executavel-do-feedback
    caminhos:
      - CLAUDE.md
    parecer: Aposentadoria formal dos perfis de plugins e harmonizacao com o nucleo multiprojeto.
  - registro: checkpoint-2026-06-14-infrastructure-hardening
    caminhos:
      - CLAUDE.md
    parecer: Transicao da infraestrutura de plugins e MCPs para o nucleo compartilhado canonico.
  - registro: handoff-2026-09-12-reconciliacao-calibracao-e-proveniencia
    caminhos:
      - CLAUDE.md
    parecer: Atualizacao da governanca de plugins e MCP sem alteracao nos modelos de calibracao PMev.
  - registro: relatorio-2026-06-16-auditoria-e-harmonizacao-v8-gold
    caminhos:
      - CLAUDE.md
    parecer: Harmonizacao das politicas de MCP e plugins em conformidade com a raiz multiprojeto.
---

# Harmonizacao — nucleo compartilhado e importacao preguicosa do motor

Registro formal da consolidacao das seguintes evolucoes:

1. **Importacao Preguicosa do Motor (`engine/__init__.py`):**
   * Implementada carga sob demanda via PEP 562 (`__getattr__` e `__dir__`).
   * Reducao drastica do commit privado de memoria de 527 MB para 16 MB em importacoes parciais.
   * Contrato garantido por `tests/test_engine_importacao_preguicosa.py`.

2. **Aposentadoria de Perfis Locais de Plugins e Transicao para Nucleo Compartilhado:**
   * Removidos `.claude/plugin-profiles.json` e scripts locais obsoletos de perfil.
   * Centralizacao canonica de MCPs e plugins no catalogo canônico da raiz multiprojeto.

3. **Ajustes de UI e Frontend:**
   * Refinamento de checagem condicional em `useQuantumEngine.ts`.
