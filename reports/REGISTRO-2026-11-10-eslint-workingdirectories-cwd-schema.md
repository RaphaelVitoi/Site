---
id: registro-2026-11-10-eslint-workingdirectories-cwd-schema
tipo: registro
escopo: migracao-do-schema-eslint-workingdirectories-para-a-forma-cwd
autor: Devin (SWE-2 Flash) [Tier 2] <158243242+devin-ai-integration[bot]@users.noreply.github.com>
criado_em: '2026-11-10'
classes:
  - interno
  - governanca
  - registro
  - config-ide
verificado:
  - 'Site.code-workspace: eslint.workingDirectories migrado de {"directory":"frontend","changeProcessCWD":true} para {"directory":"frontend","!cwd":false}; semantica preservada (!cwd:true = NAO muda o cwd; ausencia/false = muda, como antes)'
  - 'Fonte: microsoft/vscode-eslint — changeProcessCWD deprecado, substituido pela propriedade "!cwd" no schema DirectoryItem'
  - 'suite_verde.py verde na arvore do commit (pytest completo, zero erros/warnings)'
  - 'cwv_gate.ps1 verde (LCP 564.6ms, TTFB 107.8ms, CLS 0.00016, zero erros/warnings)'
nao_verificado:
  - 'Comportamento do ESLint extension na proxima janela do VS Code ainda nao observado em sessao interativa'
config_medida:
  congelada_em: '2026-11-10'
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  data_das_medicoes: '2026-11-10'
  toolchain: record_gate.py + suite_verde.py + cwv_gate.ps1
  python: 3.14.9
  so: Windows
caminhos:
  - Site.code-workspace
referencias_nao_resolviveis: []
revisoes_de_ancora:
  - registro: registro-2026-09-12-saneamento-linter-e-reconciliacao-de-ancoras
    caminhos:
      - Site.code-workspace
    parecer: 'Reconciliacao em 2026-11-10: eslint.workingDirectories migrado para o schema "!cwd" da extensao ESLint; changeProcessCWD:true equivale a "!cwd":false — comportamento do linter inalterado.'
  - registro: registro-2026-09-14-auditoria-e-refinamento-settings-e-configuracoes
    caminhos:
      - Site.code-workspace
    parecer: 'Reconciliacao em 2026-11-10: eslint.workingDirectories migrado para o schema "!cwd" da extensao ESLint; changeProcessCWD:true equivale a "!cwd":false — comportamento do linter inalterado.'
  - registro: registro-2026-10-14-saneamento-tipagem-config-ide-e-dependencias
    caminhos:
      - Site.code-workspace
    parecer: 'Reconciliacao em 2026-11-10: eslint.workingDirectories migrado para o schema "!cwd" da extensao ESLint; changeProcessCWD:true equivale a "!cwd":false — comportamento do linter inalterado.'
  - registro: handoff-2026-09-23-nucleo-mcp-curadoria-codex
    caminhos:
      - Site.code-workspace
    parecer: 'Reconciliacao em 2026-11-10: eslint.workingDirectories migrado para o schema "!cwd" da extensao ESLint; changeProcessCWD:true equivale a "!cwd":false — comportamento do linter inalterado.'
  - registro: registro-2026-09-04-otimizacao-settings-seguranca-e-io
    caminhos:
      - Site.code-workspace
    parecer: 'Reconciliacao em 2026-11-10: eslint.workingDirectories migrado para o schema "!cwd" da extensao ESLint; changeProcessCWD:true equivale a "!cwd":false — comportamento do linter inalterado.'
---

# Registro — eslint.workingDirectories no schema `!cwd`

## O que mudou

`Site.code-workspace` usava a forma legada do schema `eslint.workingDirectories`
da extensao ESLint do VS Code:

```jsonc
{ "directory": "frontend", "changeProcessCWD": true }
```

A extensao ESLint (microsoft/vscode-eslint) depreciou `changeProcessCWD` e
adotou a propriedade `"!cwd"` no item `DirectoryItem`, com semantica invertida:

- `"!cwd": true` → a pasta e usada para resolver configuracao, mas o processo
  **nao** muda de cwd.
- `"!cwd": false` (ou ausente) → o processo muda de cwd para a pasta, como antes.

A migracao preserva o comportamento exato: `changeProcessCWD: true` equivale a
`"!cwd": false`. Nenhuma regra de lint, caminho ou ordem de execucao foi
alterada — apenas a chave do schema.

## Por que agora

O IDE reportou o warning "Use the new !cwd form" sobre as linhas do bloco.
Manter a chave depreciada gera ruido em toda analise de settings e depende de
uma camada de migracao que a extensao mantem apenas por compatibilidade.

## Evidencia

- Diff de uma linha em `Site.code-workspace` (chave `changeProcessCWD` → `"!cwd"`).
- `suite_verde.py`: pytest completo verde na arvore do commit.
- `cwv_gate.ps1`: 5 fases verdes, zero erros/warnings.
- `record_anchor_gate.ps1` e `record_gate.py`: aprovados com as reconciliacoes
  de ancora acima.
