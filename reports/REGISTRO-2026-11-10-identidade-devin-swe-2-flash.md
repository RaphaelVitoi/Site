---
id: registro-2026-11-10-identidade-devin-swe-2-flash
tipo: registro
escopo: registro-canonico-de-identidade-do-condutor-devin-no-catalogo-de-autoria
autor: Devin (SWE-2 Flash) [Tier 2] <158243242+devin-ai-integration[bot]@users.noreply.github.com>
criado_em: '2026-11-10'
classes:
  - interno
  - governanca
  - registro
  - identidade
verificado:
  - data/agent_identities.json recebeu entrada canonica "Devin (SWE-2 Flash)" (veiculo devin-desktop, modelo swe-2-flash, tier 2)
  - suite_verde.py verde na arvore 6df1faae (pytest completo, zero erros/warnings)
  - cwv_gate.ps1 verde (LCP 366.9ms, TTFB 73.5ms, CLS 0.00016)
nao_verificado:
  - 'Comportamento de outros condutores Tier 2 ainda nao catalogados individualmente (ex. variantes Devin)'
config_medida:
  congelada_em: '2026-11-10'
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  data_das_medicoes: '2026-11-10'
  toolchain: record_gate.py + suite_verde.py + cwv_gate.ps1
  python: 3.14.9
  so: Windows
caminhos:
  - data/agent_identities.json
referencias_nao_resolviveis: []
revisoes_de_ancora:
  - registro: auditoria-2026-09-22-paridade-config-identidade
    caminhos:
      - data/agent_identities.json
    parecer: 'Reconciliacao em 2026-11-10: inclusao aditiva de identidade canonica Devin (SWE-2 Flash) Tier 2; nenhuma entrada existente alterada.'
  - registro: handoff-2026-09-22-paridade-config-identidade
    caminhos:
      - data/agent_identities.json
    parecer: 'Reconciliacao em 2026-11-10: inclusao aditiva de identidade canonica Devin (SWE-2 Flash) Tier 2; nenhuma entrada existente alterada.'
  - registro: handoff-2026-09-29-contraste-acessibilidade-e-identidade-de-condutor
    caminhos:
      - data/agent_identities.json
    parecer: 'Reconciliacao em 2026-11-10: inclusao aditiva de identidade canonica Devin (SWE-2 Flash) Tier 2; nenhuma entrada existente alterada.'
  - registro: registro-2026-09-14-correcoes-pos-auditoria-handoff-tier-e-dependencias
    caminhos:
      - data/agent_identities.json
    parecer: 'Reconciliacao em 2026-11-10: inclusao aditiva de identidade canonica Devin (SWE-2 Flash) Tier 2; nenhuma entrada existente alterada.'
  - registro: registro-2026-10-05-regua-de-tier-efetivo-no-catalogo-de-identidade
    caminhos:
      - data/agent_identities.json
    parecer: 'Reconciliacao em 2026-11-10: inclusao aditiva de identidade canonica Devin (SWE-2 Flash) Tier 2; nenhuma entrada existente alterada.'
  - registro: registro-2026-10-20-harmonizacao-tier1-e-gemini-38
    caminhos:
      - data/agent_identities.json
    parecer: 'Reconciliacao em 2026-11-10: inclusao aditiva de identidade canonica Devin (SWE-2 Flash) Tier 2; nenhuma entrada existente alterada.'
---

# REGISTRO — Identidade canônica Devin (SWE-2 Flash) no catálogo de autoria

## Contexto

O commit `f8f9b9d0` (fix de ops: Laya health, dedup de backend, interpretador)
assinou como `Devin (SWE-2 Flash)` e o hook `commit-msg` emitiu aviso: autor
não consta em `data/agent_identities.json`. Este registro formaliza a inclusão
canônica — aditiva, sem alterar entradas vigentes — exigida pelo mesmo commit
que toca o catálogo.

## Decisão

- **Nome:** `Devin (SWE-2 Flash)` — par nome/modelo conforme catálogo.
- **E-mail:** `158243242+devin-ai-integration[bot]@users.noreply.github.com`
  (noreply de integração; nunca resolve para perfil humano — regra SS7).
- **Veículo:** `devin-desktop` (Devin CLI/Desktop, Cognition).
- **Tier:** `2` — Devin consta como superagente de nuvem/pesquisa no §0 do
  `Site/CLAUDE.md`; nenhuma evidência nesta sessão o promoveu a Tier 1.

## Evidência

- `git show f8f9b9d0` — commit assinado pelo par nome/e-mail acima.
- Aviso do hook reproduzido na saída do commit; resolvido por esta entrada.
