---
id: registro-2026-11-17-correcao-indentless-sequence-no-portao-de-ancora
tipo: registro
escopo:
  "Site -- correcao do portao de ancora record_anchor_gate.ps1: a checagem de
  nao_verificado vazio exigia item de lista indentado e reprovava YAML valido em
  indentless sequence, formato emitido por yaml.safe_dump"
ecossistema: nexus-sota
autor:
  "Devin (SWE-2 Flash)
  <158243242+devin-ai-integration[bot]@users.noreply.github.com>"
criado_em: "2026-11-17T07:03:09-03:00"
atualizado_em: "2026-11-17T07:03:09-03:00"
commit: HEAD
classes:
  - interno
  - medido
  - governanca
  - registro
  - portao
caminhos:
  - scripts/ops/record_anchor_gate.ps1
  - reports/REGISTRO-2026-11-17-correcao-indentless-sequence-no-portao-de-ancora.md
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  condutor: Devin (SWE-2 Flash)
  veiculo: devin-desktop
  tier: 1
  supervisao: assistida
  data_das_medicoes: 2026-11-17
verificado:
  - "Regex de item de lista afrouxada para aceitar indentacao opcional; testada
    em pwsh: aceita '- item' na coluna 0 e '  - item' indentado; rejeita '---' e
    texto puro"
  - "Causa raiz medida em 2026-11-16: yaml.safe_dump emite sequencias indentless
    e o gate as lia como nao_verificado vazio"
nao_verificado:
  - "Reexecucao do portao pre-commit apos o fix depende do proximo commit que
    tocar reports/; validacao incremental coberta pelo proprio hook"
revisoes_de_ancora:
  - registro: handoff-2026-09-10-lint-lighthouse-e-aceite-cve
    caminhos:
      - scripts/ops/record_anchor_gate.ps1
    parecer:
      "Revisado em 2026-11-17. Correcao de regex no portao de ancora (indentless
      sequence YAML); sem mudanca de contrato de ancora nem de campos
      obrigatorios."
---

# Correcao do portao de ancora: indentless sequence YAML

## Contexto

Em 2026-11-16 o commit de elevacao de dependencias foi bloqueado pelo
`record_anchor_gate.ps1` com `'nao_verificado' declarado vazio` sobre um
registro cujo `nao_verificado` estava preenchido. Causa raiz: a checagem de item
de lista usava `^\s+-\s+\S`, que exige indentacao, enquanto YAML admite
_indentless sequences_ (`chave:` seguida de `- item` na coluna 0) -- formato que
`yaml.safe_dump` emite por padrao. O portao estava mais estrito que a spec YAML
que ele mesmo exige.

## Correcao

- `scripts/ops/record_anchor_gate.ps1`: regex alterada para `^\s*-\s+\S`,
  aceitando os dois estilos de sequencia. Comentario no codigo registra a
  medicao e o motivo.

## Fora de escopo

- Demais checagens do portao (campos obrigatorios, credenciais, supressores)
  inalteradas.
- Os flakes de suite sob `pytest -n 6` (sonda CDP e sentinela PS) sao divida
  separada, registrada em
  `REGISTRO-2026-11-16-elevacao-deps-anthropic-laya-accelerate-e-deps-sync.md`.
